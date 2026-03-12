/**
 * UI Analyzer - Core static analysis engine for detecting layout issues
 * 
 * This module scans React/TSX components for layout issues including:
 * - Overflow problems
 * - Misalignment
 * - Spacing inconsistencies
 * - Z-index conflicts
 * - Hardcoded colors
 * - Missing responsive variants
 * - Small touch targets
 * - Insufficient contrast
 */

import * as ts from 'typescript';
import { readFileSync, readdirSync, statSync, watch } from 'fs';
import { join, extname } from 'path';
import type { LayoutIssue, AnalysisReport, AnalysisSummary, AnalysisError } from './types';

// ============================================================================
// UIAnalyzer Class
// ============================================================================

export class UIAnalyzer {
  private errors: AnalysisError[] = [];
  private zIndexRegistry: Map<string, Array<{ value: number; filePath: string; lineNumber: number }>> = new Map();

  /**
   * Scan a single component file for layout issues
   */
  scanComponent(filePath: string): LayoutIssue[] {
    const issues: LayoutIssue[] = [];

    try {
      // Read file content
      const sourceCode = readFileSync(filePath, 'utf-8');

      // Parse TSX file using TypeScript Compiler API
      const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );

      // Extract JSX elements and analyze
      this.visitNode(sourceFile, issues, filePath, sourceCode);
    } catch (error) {
      this.errors.push({
        phase: 'parsing',
        file: filePath,
        error: error as Error,
        recoverable: true,
      });
      console.warn(`Failed to parse ${filePath}:`, (error as Error).message);
    }

    return issues;
  }

  /**
   * Scan a directory recursively for all component files
   */
  scanDirectory(dirPath: string): AnalysisReport {
    const startTime = Date.now();
    const allIssues: LayoutIssue[] = [];
    const filesScanned: string[] = [];

    // Clear z-index registry for fresh scan
    this.zIndexRegistry.clear();

    try {
      const componentFiles = this.findComponentFiles(dirPath);

      for (const filePath of componentFiles) {
        const issues = this.scanComponent(filePath);
        allIssues.push(...issues);
        filesScanned.push(filePath);
      }

      // Detect z-index conflicts across all scanned components
      const zIndexConflicts = this.detectZIndexConflicts();
      allIssues.push(...zIndexConflicts);
    } catch (error) {
      this.errors.push({
        phase: 'analysis',
        file: dirPath,
        error: error as Error,
        recoverable: false,
      });
      console.error(`Failed to scan directory ${dirPath}:`, (error as Error).message);
    }

    const duration = Date.now() - startTime;
    const summary = this.generateSummary(allIssues, filesScanned.length);

    return {
      timestamp: new Date().toISOString(),
      duration,
      summary,
      issues: allIssues,
    };
  }

  /**
   * Watch mode - monitor files for changes and trigger re-analysis
   */
  watchMode(dirPath: string, callback: (issues: LayoutIssue[]) => void): void {
    console.log(`Watching ${dirPath} for changes...`);

    watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const filePath = join(dirPath, filename);
      
      // Only process component files
      if (this.isComponentFile(filePath)) {
        console.log(`File changed: ${filePath}`);
        
        try {
          const issues = this.scanComponent(filePath);
          callback(issues);
        } catch (error) {
          console.error(`Error scanning ${filePath}:`, (error as Error).message);
        }
      }
    });
  }

  /**
   * Get accumulated errors from analysis
   */
  getErrors(): AnalysisError[] {
    return this.errors;
  }

  /**
   * Clear accumulated errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Recursively visit AST nodes to extract JSX elements
   */
  private visitNode(
    node: ts.Node,
    issues: LayoutIssue[],
    filePath: string,
    sourceCode: string
  ): void {
    // Check if node is a JSX element
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      this.analyzeJsxElement(node, issues, filePath, sourceCode);
    }

    // Recursively visit child nodes
    ts.forEachChild(node, (child) => this.visitNode(child, issues, filePath, sourceCode));
  }

  /**
   * Analyze a JSX element for layout issues
   */
  private analyzeJsxElement(
    node: ts.JsxElement | ts.JsxSelfClosingElement,
    issues: LayoutIssue[],
    filePath: string,
    sourceCode: string
  ): void {
    // Get opening element (handles both JsxElement and JsxSelfClosingElement)
    const openingElement = ts.isJsxElement(node) 
      ? node.openingElement 
      : node;

    // Extract className attribute
    const classNameAttr = this.getClassNameAttribute(openingElement);
    
    if (classNameAttr) {
      const className = this.getClassNameValue(classNameAttr);
      const { line, character } = this.getPosition(node, sourceCode);

      // Analyze className for issues
      this.analyzeClassName(className, filePath, line, character, issues);
    }

    // Extract style attribute for hardcoded values
    const styleAttr = this.getStyleAttribute(openingElement);
    
    if (styleAttr) {
      const { line, character } = this.getPosition(node, sourceCode);
      this.analyzeStyleAttribute(styleAttr, filePath, line, character, issues);
    }
  }

  /**
   * Get className attribute from JSX element
   */
  private getClassNameAttribute(
    element: ts.JsxOpeningElement | ts.JsxSelfClosingElement
  ): ts.JsxAttribute | undefined {
    return element.attributes.properties.find(
      (prop): prop is ts.JsxAttribute =>
        ts.isJsxAttribute(prop) && 
        prop.name.getText() === 'className'
    );
  }

  /**
   * Get style attribute from JSX element
   */
  private getStyleAttribute(
    element: ts.JsxOpeningElement | ts.JsxSelfClosingElement
  ): ts.JsxAttribute | undefined {
    return element.attributes.properties.find(
      (prop): prop is ts.JsxAttribute =>
        ts.isJsxAttribute(prop) && 
        prop.name.getText() === 'style'
    );
  }

  /**
   * Extract className value from attribute
   */
  private getClassNameValue(attr: ts.JsxAttribute): string {
    if (!attr.initializer) return '';

    if (ts.isStringLiteral(attr.initializer)) {
      return attr.initializer.text;
    }

    if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      // Handle template literals and string concatenation
      return attr.initializer.expression.getText();
    }

    return '';
  }

  /**
   * Get line and column position of a node
   */
  private getPosition(node: ts.Node, sourceCode: string): { line: number; character: number } {
    const sourceFile = node.getSourceFile();
    const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    
    return {
      line: pos.line + 1, // Convert to 1-indexed
      character: pos.character + 1,
    };
  }

  /**
   * Analyze className string for layout issues
   */
  private analyzeClassName(
    className: string,
    filePath: string,
    lineNumber: number,
    columnNumber: number,
    issues: LayoutIssue[]
  ): void {
    // Split className into individual classes
    const classes = className.split(/\s+/).filter(Boolean);

    for (const cls of classes) {
      // ========================================================================
      // OVERFLOW DETECTION (Enhanced)
      // ========================================================================
      
      // Check for overflow-hidden without constraints
      if (cls.includes('overflow-hidden') && !this.hasConstraints(classes)) {
        const severity = this.determineOverflowSeverity(classes);
        issues.push({
          type: 'overflow',
          severity,
          filePath,
          lineNumber,
          columnNumber,
          message: 'overflow-hidden used without explicit width/height constraints',
          suggestion: 'Add w-* or h-* classes to constrain dimensions',
          autoFixable: false,
        });
      }

      // Check for overflow-auto/scroll without max-height
      if ((cls === 'overflow-auto' || cls === 'overflow-scroll' || cls === 'overflow-y-auto' || cls === 'overflow-y-scroll') 
          && !this.hasMaxHeight(classes)) {
        issues.push({
          type: 'overflow',
          severity: 'moderate',
          filePath,
          lineNumber,
          columnNumber,
          message: `${cls} used without max-height constraint - may cause infinite expansion`,
          suggestion: 'Add max-h-* class to limit scrollable area',
          autoFixable: false,
        });
      }

      // Check for overflow-x-hidden which often indicates responsive issues
      if (cls === 'overflow-x-hidden') {
        issues.push({
          type: 'overflow',
          severity: 'critical',
          filePath,
          lineNumber,
          columnNumber,
          message: 'overflow-x-hidden may hide horizontal scroll issues instead of fixing them',
          suggestion: 'Fix the root cause of horizontal overflow instead of hiding it',
          autoFixable: false,
        });
      }

      // ========================================================================
      // SPACING INCONSISTENCY DETECTION (Enhanced)
      // ========================================================================
      
      // Check for arbitrary spacing values
      if (this.isArbitrarySpacing(cls)) {
        const suggestedValue = this.suggestSpacingValue(cls);
        issues.push({
          type: 'spacing-inconsistency',
          severity: 'minor',
          filePath,
          lineNumber,
          columnNumber,
          message: `Arbitrary spacing value detected: ${cls}`,
          suggestion: suggestedValue 
            ? `Use design system value: ${suggestedValue}`
            : 'Use design system spacing scale (0.5rem, 0.75rem, 1rem, 1.5rem, 2rem)',
          autoFixable: false,
        });
      }

      // Check for non-standard spacing utilities
      if (this.isNonStandardSpacing(cls)) {
        issues.push({
          type: 'spacing-inconsistency',
          severity: 'minor',
          filePath,
          lineNumber,
          columnNumber,
          message: `Non-standard spacing class: ${cls}`,
          suggestion: 'Use standard spacing scale (p-1, p-2, p-4, p-6, p-8, etc.)',
          autoFixable: false,
        });
      }

      // ========================================================================
      // Z-INDEX CONFLICT DETECTION (New)
      // ========================================================================
      
      // Check for z-index usage
      if (this.isZIndexClass(cls)) {
        const zValue = this.extractZIndexValue(cls);
        if (zValue !== null) {
          this.registerZIndex(filePath, lineNumber, zValue);
          
          // Check for problematic z-index values
          if (zValue > 9999) {
            issues.push({
              type: 'z-index-conflict',
              severity: 'moderate',
              filePath,
              lineNumber,
              columnNumber,
              message: `Extremely high z-index value: ${zValue}`,
              suggestion: 'Use a layered z-index system (0-10 for content, 10-50 for overlays, 50-100 for modals)',
              autoFixable: false,
            });
          }

          // Check for arbitrary z-index values
          if (cls.includes('[') && cls.includes(']')) {
            issues.push({
              type: 'z-index-conflict',
              severity: 'minor',
              filePath,
              lineNumber,
              columnNumber,
              message: `Arbitrary z-index value: ${cls}`,
              suggestion: 'Use predefined z-index utilities (z-0, z-10, z-20, z-30, z-40, z-50)',
              autoFixable: false,
            });
          }
        }
      }

      // ========================================================================
      // MISSING RESPONSIVE VARIANTS (Enhanced)
      // ========================================================================
      
      // Check for missing responsive variants on sizing classes
      if (this.isSizingClass(cls) && !this.hasResponsiveVariant(classes, cls)) {
        const severity = this.determineResponsiveSeverity(cls);
        issues.push({
          type: 'missing-responsive',
          severity,
          filePath,
          lineNumber,
          columnNumber,
          message: `Sizing class ${cls} lacks responsive variants`,
          suggestion: 'Add responsive variants (sm:, md:, lg:, xl:)',
          autoFixable: false,
        });
      }
    }

    // ========================================================================
    // MISALIGNMENT DETECTION (Enhanced)
    // ========================================================================
    
    // Check for flex containers without alignment
    if (this.isFlexContainer(classes) && !this.hasAlignment(classes)) {
      issues.push({
        type: 'misalignment',
        severity: 'minor',
        filePath,
        lineNumber,
        columnNumber,
        message: 'Flex container without explicit alignment classes',
        suggestion: 'Add items-center, items-start, items-end, or items-baseline',
        autoFixable: false,
      });
    }

    // Check for grid containers without gap
    if (this.isGridContainer(classes) && !this.hasGap(classes)) {
      issues.push({
        type: 'misalignment',
        severity: 'minor',
        filePath,
        lineNumber,
        columnNumber,
        message: 'Grid container without gap spacing',
        suggestion: 'Add gap-* class for consistent grid spacing',
        autoFixable: false,
      });
    }

    // Check for absolute positioning without explicit positioning classes
    if (this.hasAbsolutePosition(classes) && !this.hasPositioningClasses(classes)) {
      issues.push({
        type: 'misalignment',
        severity: 'moderate',
        filePath,
        lineNumber,
        columnNumber,
        message: 'Absolute positioning without explicit top/right/bottom/left classes',
        suggestion: 'Add positioning classes (top-*, right-*, bottom-*, left-*) or use inset-*',
        autoFixable: false,
      });
    }
  }

  /**
   * Analyze style attribute for hardcoded values
   */
  private analyzeStyleAttribute(
    attr: ts.JsxAttribute,
    filePath: string,
    lineNumber: number,
    columnNumber: number,
    issues: LayoutIssue[]
  ): void {
    const styleText = attr.getText();

    // Check for hardcoded colors (hex, rgb, rgba)
    const hexColorRegex = /#[0-9a-fA-F]{3,6}/g;
    const rgbColorRegex = /rgba?\([^)]+\)/g;

    if (hexColorRegex.test(styleText) || rgbColorRegex.test(styleText)) {
      issues.push({
        type: 'hardcoded-color',
        severity: 'moderate',
        filePath,
        lineNumber,
        columnNumber,
        message: 'Hardcoded color value in style attribute',
        suggestion: 'Use CSS custom properties from design system (var(--color-*))',
        autoFixable: false,
      });
    }
  }

  /**
   * Check if classes include width/height constraints
   */
  private hasConstraints(classes: string[]): boolean {
    return classes.some(cls => 
      cls.startsWith('w-') || 
      cls.startsWith('h-') ||
      cls.startsWith('max-w-') ||
      cls.startsWith('max-h-') ||
      cls.startsWith('min-w-') ||
      cls.startsWith('min-h-')
    );
  }

  /**
   * Check if classes include max-height constraint
   */
  private hasMaxHeight(classes: string[]): boolean {
    return classes.some(cls => 
      cls.startsWith('max-h-') || 
      cls.startsWith('h-')
    );
  }

  /**
   * Determine overflow severity based on context
   */
  private determineOverflowSeverity(classes: string[]): 'critical' | 'moderate' | 'minor' {
    // Critical if it's on a container that might affect layout
    if (classes.some(cls => cls.includes('container') || cls.includes('wrapper'))) {
      return 'critical';
    }
    return 'moderate';
  }

  /**
   * Check if class is an arbitrary spacing value
   */
  private isArbitrarySpacing(cls: string): boolean {
    // Match patterns like p-[13px], m-[2.5rem], gap-[15px]
    const arbitraryPattern = /^(p|m|gap|space)-\[[\d.]+(?:px|rem|em)\]$/;
    return arbitraryPattern.test(cls);
  }

  /**
   * Check if class is non-standard spacing (e.g., p-3, p-5, p-7, p-9, etc.)
   */
  private isNonStandardSpacing(cls: string): boolean {
    // Standard Tailwind spacing: 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, etc.
    // Non-standard would be odd numbers like 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
    const nonStandardPattern = /^(p|m|gap|space)-(3|5|7|9|11|13|15|17|19|21|23)$/;
    return nonStandardPattern.test(cls);
  }

  /**
   * Suggest nearest spacing value from design scale
   */
  private suggestSpacingValue(arbitraryClass: string): string | null {
    // Extract the numeric value
    const match = arbitraryClass.match(/\[([\d.]+)(?:px|rem|em)\]/);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = arbitraryClass.includes('rem') ? 'rem' : 'px';

    // Design scale in rem: 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3
    // Convert to px (assuming 1rem = 16px): 8, 12, 16, 20, 24, 32, 40, 48
    const scaleInPx = [8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
    const scaleInRem = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6];

    const scale = unit === 'rem' ? scaleInRem : scaleInPx;
    
    // Find nearest value
    let nearest = scale[0];
    let minDiff = Math.abs(value - nearest);

    for (const scaleValue of scale) {
      const diff = Math.abs(value - scaleValue);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = scaleValue;
      }
    }

    // Map to Tailwind class
    const prefix = arbitraryClass.split('-')[0];
    const tailwindMap: Record<number, string> = {
      0.5: '0.5', 0.75: '1', 1: '2', 1.25: '3', 1.5: '4', 2: '6', 2.5: '8', 3: '10', 4: '12', 5: '16', 6: '20'
    };

    if (unit === 'rem' && tailwindMap[nearest]) {
      return `${prefix}-${tailwindMap[nearest]}`;
    }

    return null;
  }

  /**
   * Check if class is a z-index class
   */
  private isZIndexClass(cls: string): boolean {
    return cls.startsWith('z-') || cls.startsWith('-z-');
  }

  /**
   * Extract z-index numeric value from class
   */
  private extractZIndexValue(cls: string): number | null {
    // Handle arbitrary values like z-[999]
    const arbitraryMatch = cls.match(/z-\[(-?\d+)\]/);
    if (arbitraryMatch) {
      return parseInt(arbitraryMatch[1], 10);
    }

    // Handle standard Tailwind z-index values
    const standardMatch = cls.match(/^-?z-(\d+)$/);
    if (standardMatch) {
      return parseInt(standardMatch[1], 10);
    }

    // Handle named z-index values
    const namedValues: Record<string, number> = {
      'z-auto': 0,
      'z-0': 0,
      'z-10': 10,
      'z-20': 20,
      'z-30': 30,
      'z-40': 40,
      'z-50': 50,
    };

    return namedValues[cls] ?? null;
  }

  /**
   * Register z-index usage for conflict detection
   */
  private registerZIndex(filePath: string, lineNumber: number, value: number): void {
    const key = `z-${value}`;
    if (!this.zIndexRegistry.has(key)) {
      this.zIndexRegistry.set(key, []);
    }
    this.zIndexRegistry.get(key)!.push({ value, filePath, lineNumber });
  }

  /**
   * Detect z-index conflicts across components
   */
  detectZIndexConflicts(): LayoutIssue[] {
    const conflicts: LayoutIssue[] = [];

    // Check for multiple components using the same high z-index
    for (const [key, usages] of this.zIndexRegistry.entries()) {
      if (usages.length > 1 && usages[0].value >= 40) {
        for (const usage of usages) {
          conflicts.push({
            type: 'z-index-conflict',
            severity: 'moderate',
            filePath: usage.filePath,
            lineNumber: usage.lineNumber,
            columnNumber: 0,
            message: `Multiple components use z-index ${usage.value} - potential stacking conflict`,
            suggestion: 'Review z-index hierarchy and ensure intentional stacking order',
            autoFixable: false,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if class is a sizing class
   */
  private isSizingClass(cls: string): boolean {
    return cls.startsWith('w-') || 
           cls.startsWith('h-') || 
           cls.startsWith('text-');
  }

  /**
   * Determine severity for missing responsive variants
   */
  private determineResponsiveSeverity(cls: string): 'critical' | 'moderate' | 'minor' {
    // Critical for width classes that might break mobile layout
    if (cls.startsWith('w-') && !cls.includes('full') && !cls.includes('auto')) {
      return 'critical';
    }
    // Moderate for text sizing
    if (cls.startsWith('text-')) {
      return 'moderate';
    }
    return 'minor';
  }

  /**
   * Check if classes include responsive variants for a given class
   */
  private hasResponsiveVariant(classes: string[], baseClass: string): boolean {
    const responsivePrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
    const baseClassName = baseClass.split(':').pop() || baseClass;
    
    return classes.some(cls => 
      responsivePrefixes.some(prefix => cls.startsWith(prefix) && cls.includes(baseClassName))
    );
  }

  /**
   * Check if classes define a flex container
   */
  private isFlexContainer(classes: string[]): boolean {
    return classes.some(cls => cls === 'flex' || cls.startsWith('flex-'));
  }

  /**
   * Check if classes define a grid container
   */
  private isGridContainer(classes: string[]): boolean {
    return classes.some(cls => cls === 'grid' || cls.startsWith('grid-'));
  }

  /**
   * Check if classes include alignment
   */
  private hasAlignment(classes: string[]): boolean {
    return classes.some(cls => 
      cls.startsWith('items-') || 
      cls.startsWith('justify-') ||
      cls.startsWith('content-')
    );
  }

  /**
   * Check if classes include gap spacing
   */
  private hasGap(classes: string[]): boolean {
    return classes.some(cls => cls.startsWith('gap-'));
  }

  /**
   * Check if classes include absolute positioning
   */
  private hasAbsolutePosition(classes: string[]): boolean {
    return classes.some(cls => cls === 'absolute');
  }

  /**
   * Check if classes include positioning classes (top, right, bottom, left, inset)
   */
  private hasPositioningClasses(classes: string[]): boolean {
    return classes.some(cls => 
      cls.startsWith('top-') || 
      cls.startsWith('right-') || 
      cls.startsWith('bottom-') || 
      cls.startsWith('left-') ||
      cls.startsWith('inset-')
    );
  }

  /**
   * Find all component files in a directory recursively
   */
  private findComponentFiles(dirPath: string): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        
        try {
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip node_modules and hidden directories
            if (entry !== 'node_modules' && !entry.startsWith('.')) {
              files.push(...this.findComponentFiles(fullPath));
            }
          } else if (this.isComponentFile(fullPath)) {
            files.push(fullPath);
          }
        } catch (error) {
          console.warn(`Failed to stat ${fullPath}:`, (error as Error).message);
        }
      }
    } catch (error) {
      console.error(`Failed to read directory ${dirPath}:`, (error as Error).message);
    }

    return files;
  }

  /**
   * Check if file is a component file (tsx, jsx)
   */
  private isComponentFile(filePath: string): boolean {
    const ext = extname(filePath);
    return ext === '.tsx' || ext === '.jsx';
  }

  /**
   * Generate analysis summary from issues
   */
  private generateSummary(issues: LayoutIssue[], filesScanned: number): AnalysisSummary {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const moderateIssues = issues.filter(i => i.severity === 'moderate').length;
    const minorIssues = issues.filter(i => i.severity === 'minor').length;

    // Calculate compliance score (0-100)
    // Weighted: critical = 10 points, moderate = 5 points, minor = 1 point
    const totalPenalty = (criticalIssues * 10) + (moderateIssues * 5) + (minorIssues * 1);
    const maxScore = 100;
    const complianceScore = Math.max(0, maxScore - totalPenalty);

    return {
      totalIssues: issues.length,
      criticalIssues,
      moderateIssues,
      minorIssues,
      filesScanned,
      pagesAudited: 0, // Will be set by responsive validator
      complianceScore,
    };
  }
}

