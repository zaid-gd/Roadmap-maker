/**
 * Design System Validator
 * 
 * Token usage checker that ensures consistent application of CSS custom properties
 * and design system values across the codebase.
 * 
 * Validates:
 * - Color token usage (no hardcoded hex/rgb values)
 * - Spacing scale compliance
 * - Border radius token usage
 * - Font family token usage
 */

import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  ColorViolation,
  SpacingViolation,
  RadiusViolation,
  FontViolation,
  DesignSystemReport,
  CodeLocation,
} from './types';

// ============================================================================
// Design System Tokens
// ============================================================================

const COLOR_TOKENS = [
  'var(--color-page)',
  'var(--color-surface)',
  'var(--color-surface-subtle)',
  'var(--color-surface-muted)',
  'var(--color-text)',
  'var(--color-text-muted)',
  'var(--color-text-soft)',
  'var(--color-accent)',
  'var(--color-border)',
  'var(--color-border-strong)',
];

const SPACING_SCALE = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]; // in rem

const RADIUS_TOKENS = {
  'var(--radius-sm)': 10,
  'var(--radius-md)': 16,
  'var(--radius-lg)': 24,
} as const;

const FONT_TOKENS = [
  'var(--font-sans)',
  'var(--font-mono)',
  'var(--font-display)',
];

// ============================================================================
// Regex Patterns
// ============================================================================

const HEX_COLOR_PATTERN = /#[0-9a-fA-F]{3,6}\b/g;
const RGB_COLOR_PATTERN = /rgba?\s*\([^)]+\)/g;
const ARBITRARY_SPACING_PATTERN = /\[[\d.]+(?:px|rem)\]/g;
const ARBITRARY_RADIUS_PATTERN = /rounded-\[[\d.]+(?:px|rem)\]/g;

// ============================================================================
// Design System Validator
// ============================================================================

export class DesignSystemValidator {
  private colorViolations: ColorViolation[] = [];
  private spacingViolations: SpacingViolation[] = [];
  private radiusViolations: RadiusViolation[] = [];
  private fontViolations: FontViolation[] = [];

  /**
   * Validate colors in CSS and TSX files
   */
  validateColors(filePath: string, content: string): ColorViolation[] {
    const violations: ColorViolation[] = [];
    const lines = content.split('\n');

    // Check for hardcoded hex colors
    lines.forEach((line, index) => {
      const hexMatches = line.matchAll(HEX_COLOR_PATTERN);
      for (const match of hexMatches) {
        if (match.index !== undefined) {
          violations.push({
            type: 'hardcoded-hex',
            value: match[0],
            location: {
              filePath,
              lineNumber: index + 1,
              columnNumber: match.index + 1,
              snippet: line.trim(),
            },
            suggestedToken: this.findNearestColorToken(match[0]),
          });
        }
      }

      // Check for hardcoded rgb/rgba colors
      const rgbMatches = line.matchAll(RGB_COLOR_PATTERN);
      for (const match of rgbMatches) {
        if (match.index !== undefined) {
          violations.push({
            type: 'hardcoded-rgb',
            value: match[0],
            location: {
              filePath,
              lineNumber: index + 1,
              columnNumber: match.index + 1,
              snippet: line.trim(),
            },
            suggestedToken: 'var(--color-*)',
          });
        }
      }
    });

    // Store violations in class property
    this.colorViolations.push(...violations);
    return violations;
  }

  /**
   * Validate spacing values in TSX files
   */
  validateSpacing(filePath: string, content: string): SpacingViolation[] {
    const violations: SpacingViolation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for arbitrary Tailwind spacing values
      const matches = line.matchAll(ARBITRARY_SPACING_PATTERN);
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[0];
          const numericValue = this.extractNumericValue(value);
          
          if (numericValue !== null && !this.isInSpacingScale(numericValue)) {
            violations.push({
              type: 'arbitrary-value',
              value,
              location: {
                filePath,
                lineNumber: index + 1,
                columnNumber: match.index + 1,
                snippet: line.trim(),
              },
              suggestedValue: this.findNearestSpacingValue(numericValue),
            });
          }
        }
      }
    });

    // Store violations in class property
    this.spacingViolations.push(...violations);
    return violations;
  }

  /**
   * Validate border radius values in TSX files
   */
  validateBorderRadius(filePath: string, content: string): RadiusViolation[] {
    const violations: RadiusViolation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for arbitrary border radius values
      const matches = line.matchAll(ARBITRARY_RADIUS_PATTERN);
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[0];
          const numericValue = this.extractNumericValue(value);
          
          if (numericValue !== null) {
            violations.push({
              type: 'hardcoded-radius',
              value,
              location: {
                filePath,
                lineNumber: index + 1,
                columnNumber: match.index + 1,
                snippet: line.trim(),
              },
              suggestedToken: this.findNearestRadiusToken(numericValue),
            });
          }
        }
      }
    });

    // Store violations in class property
    this.radiusViolations.push(...violations);
    return violations;
  }

  /**
   * Validate font family declarations
   */
  validateFonts(filePath: string, content: string): FontViolation[] {
    const violations: FontViolation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for hardcoded font-family declarations
      const fontFamilyPattern = /font-family\s*:\s*['"]?([^;'"]+)['"]?/gi;
      const matches = line.matchAll(fontFamilyPattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[1].trim();
          
          // Skip if already using a CSS variable
          if (value.startsWith('var(--font-')) {
            continue;
          }
          
          violations.push({
            type: 'hardcoded-font',
            value,
            location: {
              filePath,
              lineNumber: index + 1,
              columnNumber: match.index + 1,
              snippet: line.trim(),
            },
            suggestedToken: this.findNearestFontToken(value),
          });
        }
      }
    });

    // Store violations in class property
    this.fontViolations.push(...violations);
    return violations;
  }

  /**
   * Validate a single file for all design system violations
   */
  validateFile(filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      // Run all validations
      this.colorViolations.push(...this.validateColors(filePath, content));
      this.spacingViolations.push(...this.validateSpacing(filePath, content));
      this.radiusViolations.push(...this.validateBorderRadius(filePath, content));
      this.fontViolations.push(...this.validateFonts(filePath, content));
    } catch (error) {
      console.warn(`Failed to validate file ${filePath}:`, error);
    }
  }

  /**
   * Generate comprehensive design system report
   */
  generateReport(): DesignSystemReport {
    const totalViolations =
      this.colorViolations.length +
      this.spacingViolations.length +
      this.radiusViolations.length +
      this.fontViolations.length;

    // Calculate compliance score (0-100)
    // Assuming a baseline of 100 violations = 0 score
    const complianceScore = Math.max(0, Math.min(100, 100 - totalViolations));

    return {
      totalViolations,
      colorViolations: this.colorViolations,
      spacingViolations: this.spacingViolations,
      radiusViolations: this.radiusViolations,
      fontViolations: this.fontViolations,
      complianceScore,
    };
  }

  /**
   * Reset all violations (useful for re-running validation)
   */
  reset(): void {
    this.colorViolations = [];
    this.spacingViolations = [];
    this.radiusViolations = [];
    this.fontViolations = [];
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Find the nearest color token for a given hex color
   */
  private findNearestColorToken(hexColor: string): string {
    // Map common colors to tokens
    const colorMap: Record<string, string> = {
      '#8aa2ff': 'var(--color-accent)',
      '#0b0d10': 'var(--color-page)',
      '#f3f5f7': 'var(--color-text)',
    };

    const normalized = hexColor.toLowerCase();
    return colorMap[normalized] || 'var(--color-*)';
  }

  /**
   * Extract numeric value from arbitrary Tailwind value
   */
  private extractNumericValue(value: string): number | null {
    const match = value.match(/([\d.]+)(px|rem)/);
    if (!match) return null;

    const num = parseFloat(match[1]);
    const unit = match[2];

    // Convert px to rem (assuming 16px = 1rem)
    return unit === 'px' ? num / 16 : num;
  }

  /**
   * Check if a value is in the spacing scale
   */
  private isInSpacingScale(value: number): boolean {
    return SPACING_SCALE.some(scale => Math.abs(scale - value) < 0.01);
  }

  /**
   * Find the nearest spacing value from the design scale
   */
  private findNearestSpacingValue(value: number): string {
    let nearest = SPACING_SCALE[0];
    let minDiff = Math.abs(value - nearest);

    for (const scale of SPACING_SCALE) {
      const diff = Math.abs(value - scale);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = scale;
      }
    }

    return `${nearest}rem`;
  }

  /**
   * Find the nearest radius token for a given pixel value
   */
  private findNearestRadiusToken(
    value: number
  ): 'var(--radius-sm)' | 'var(--radius-md)' | 'var(--radius-lg)' {
    // Convert rem to px if needed (assuming 16px = 1rem)
    const pxValue = value < 5 ? value * 16 : value;
    
    const radiusValues = {
      'var(--radius-sm)': 10,
      'var(--radius-md)': 16,
      'var(--radius-lg)': 24,
    } as const;

    let nearest: keyof typeof radiusValues = 'var(--radius-sm)';
    let minDiff = Math.abs(pxValue - radiusValues[nearest]);

    for (const [token, tokenValue] of Object.entries(radiusValues)) {
      const diff = Math.abs(pxValue - tokenValue);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = token as keyof typeof radiusValues;
      }
    }

    return nearest;
  }

  /**
   * Find the nearest font token based on font name
   */
  private findNearestFontToken(
    fontName: string
  ): 'var(--font-sans)' | 'var(--font-mono)' | 'var(--font-display)' {
    const lower = fontName.toLowerCase();

    if (lower.includes('mono') || lower.includes('code')) {
      return 'var(--font-mono)';
    }

    if (lower.includes('display') || lower.includes('heading')) {
      return 'var(--font-display)';
    }

    return 'var(--font-sans)';
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse TypeScript/TSX file and extract style-related information
 */
export function parseTSXFile(filePath: string): ts.SourceFile {
  const content = readFileSync(filePath, 'utf-8');
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

/**
 * Extract className attributes from JSX elements
 */
export function extractClassNames(sourceFile: ts.SourceFile): string[] {
  const classNames: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isJsxAttribute(node)) {
      const attrName = ts.isIdentifier(node.name) ? node.name.text : null;
      if (attrName === 'className' && node.initializer && ts.isStringLiteral(node.initializer)) {
        classNames.push(node.initializer.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return classNames;
}

/**
 * Extract style prop values from JSX elements
 */
export function extractStyleProps(sourceFile: ts.SourceFile): Record<string, string>[] {
  const styles: Record<string, string>[] = [];

  function visit(node: ts.Node) {
    if (ts.isJsxAttribute(node)) {
      const attrName = ts.isIdentifier(node.name) ? node.name.text : null;
      if (attrName === 'style' && node.initializer && ts.isJsxExpression(node.initializer)) {
        const expression = node.initializer.expression;
        if (expression && ts.isObjectLiteralExpression(expression)) {
          const styleObj: Record<string, string> = {};
          expression.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const key = prop.name.text;
              if (ts.isStringLiteral(prop.initializer)) {
                styleObj[key] = prop.initializer.text;
              }
            }
          });
          styles.push(styleObj);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return styles;
}
