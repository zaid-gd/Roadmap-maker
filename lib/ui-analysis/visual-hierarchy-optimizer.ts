/**
 * Visual Hierarchy Optimizer - Analysis tool for evaluating visual hierarchy
 * 
 * This module analyzes:
 * - Heading structure and hierarchy (h1-h6)
 * - Button visual hierarchy (primary vs secondary)
 * - Section spacing consistency
 * - Accent color usage patterns
 * - Contrast ratios for visual prominence
 */

import type {
  HeadingReport,
  HeadingNode,
  HeadingIssue,
  ButtonHierarchyReport,
  ButtonInfo,
  ButtonIssue,
  SpacingReport,
  SectionInfo,
  SpacingIssue,
  AccentUsageReport,
  CodeLocation,
} from './types';

// ============================================================================
// VisualHierarchyOptimizer Class
// ============================================================================

export class VisualHierarchyOptimizer {
  /**
   * Analyze heading structure from HTML content
   */
  analyzeHeadingStructure(html: string): HeadingReport {
    const headings = this.extractHeadings(html);
    const issues = this.validateHeadingStructure(headings);
    const structure = issues.length === 0 ? 'valid' : 'invalid';

    return {
      headings,
      issues,
      structure,
    };
  }

  /**
   * Analyze button hierarchy from page
   * Note: This requires browser context for computed styles
   */
  async analyzeButtonHierarchy(page: any): Promise<ButtonHierarchyReport> {
    // Extract button information with computed styles
    const buttons = await this.extractButtons(page);
    
    // Classify buttons by visual weight
    const primaryButtons: ButtonInfo[] = [];
    const secondaryButtons: ButtonInfo[] = [];

    for (const button of buttons) {
      if (button.visualWeight >= 70) {
        primaryButtons.push(button);
      } else {
        secondaryButtons.push(button);
      }
    }

    // Detect hierarchy issues
    const issues = this.validateButtonHierarchy(primaryButtons, secondaryButtons);

    return {
      primaryButtons,
      secondaryButtons,
      issues,
    };
  }

  /**
   * Analyze section spacing consistency
   * Note: This requires browser context for computed styles
   */
  async analyzeSectionSpacing(page: any): Promise<SpacingReport> {
    const sections = await this.extractSections(page);
    const gaps = this.calculateGaps(sections);
    const averageGap = gaps.length > 0 
      ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length 
      : 0;
    
    const inconsistencies = this.detectSpacingInconsistencies(sections, averageGap);

    return {
      sections,
      averageGap,
      inconsistencies,
    };
  }

  /**
   * Analyze accent color usage in CSS
   */
  analyzeAccentUsage(css: string): AccentUsageReport {
    const usages: AccentUsageReport['usages'] = [];
    const issues: string[] = [];

    // Search for accent color usage (#8aa2ff or var(--color-accent))
    const accentColorRegex = /#8aa2ff|var\(--color-accent\)/gi;
    const lines = css.split('\n');

    // Track current CSS rule context
    let currentRuleContext = '';
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track CSS rule context (selector)
      if (line.includes('{')) {
        braceDepth++;
        if (braceDepth === 1) {
          // This is the start of a new rule, capture the selector
          currentRuleContext = line.split('{')[0].trim();
        }
      }
      if (line.includes('}')) {
        braceDepth--;
        if (braceDepth === 0) {
          currentRuleContext = '';
        }
      }

      const matches = line.matchAll(accentColorRegex);

      for (const match of matches) {
        // Use the rule context (selector) to determine if it's interactive
        const context = this.determineColorContext(currentRuleContext || line);
        const appropriate = this.isAppropriateAccentUsage(context);

        usages.push({
          location: {
            filePath: 'styles.css', // Would be set by caller
            lineNumber: i + 1,
            columnNumber: match.index || 0,
            snippet: line.trim(),
          },
          context,
          appropriate,
        });

        if (!appropriate) {
          issues.push(
            `Line ${i + 1}: Accent color used in ${context} context - should be reserved for interactive elements`
          );
        }
      }
    }

    return {
      usages,
      issues,
    };
  }

  // ==========================================================================
  // Private Helper Methods - Heading Analysis
  // ==========================================================================

  /**
   * Extract heading elements from HTML
   */
  private extractHeadings(html: string): HeadingNode[] {
    const headings: HeadingNode[] = [];
    
    // Match heading tags with their content
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    const matches = html.matchAll(headingRegex);

    for (const match of matches) {
      const level = parseInt(match[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
      const text = this.stripHtmlTags(match[2]);

      // Extract inline styles if present
      const styleMatch = match[0].match(/style="([^"]*)"/);
      const styles = this.parseInlineStyles(styleMatch ? styleMatch[1] : '');

      headings.push({
        level,
        text,
        fontSize: styles.fontSize || this.getDefaultFontSize(level),
        fontWeight: styles.fontWeight || this.getDefaultFontWeight(level),
        lineHeight: styles.lineHeight || this.getDefaultLineHeight(level),
      });
    }

    return headings;
  }

  /**
   * Validate heading structure for issues
   */
  private validateHeadingStructure(headings: HeadingNode[]): HeadingIssue[] {
    const issues: HeadingIssue[] = [];

    // Check for multiple h1 elements
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count > 1) {
      const h1Headings = headings.filter(h => h.level === 1);
      for (const heading of h1Headings.slice(1)) {
        issues.push({
          type: 'multiple-h1',
          heading,
          message: 'Multiple h1 elements found - only one h1 should exist per page',
        });
      }
    }

    // Check for skipped heading levels
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];

      if (current.level > previous.level + 1) {
        issues.push({
          type: 'skipped-level',
          heading: current,
          message: `Heading level skipped: h${previous.level} followed by h${current.level}`,
        });
      }
    }

    // Check for inconsistent font sizes within same level
    const sizesByLevel = new Map<number, string[]>();
    for (const heading of headings) {
      if (!sizesByLevel.has(heading.level)) {
        sizesByLevel.set(heading.level, []);
      }
      sizesByLevel.get(heading.level)!.push(heading.fontSize);
    }

    for (const [level, sizes] of sizesByLevel.entries()) {
      const uniqueSizes = new Set(sizes);
      if (uniqueSizes.size > 1) {
        const affectedHeadings = headings.filter(h => h.level === level);
        for (const heading of affectedHeadings) {
          issues.push({
            type: 'inconsistent-size',
            heading,
            message: `Inconsistent font size for h${level} elements`,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Parse inline CSS styles
   */
  private parseInlineStyles(styleString: string): Record<string, string> {
    const styles: Record<string, string> = {};
    
    const declarations = styleString.split(';').filter(Boolean);
    for (const declaration of declarations) {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // Convert kebab-case to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    }

    return styles;
  }

  /**
   * Get default font size for heading level
   */
  private getDefaultFontSize(level: number): string {
    const sizes: Record<number, string> = {
      1: '2rem',
      2: '1.5rem',
      3: '1.25rem',
      4: '1rem',
      5: '0.875rem',
      6: '0.75rem',
    };
    return sizes[level] || '1rem';
  }

  /**
   * Get default font weight for heading level
   */
  private getDefaultFontWeight(level: number): string {
    return level <= 3 ? '700' : '600';
  }

  /**
   * Get default line height for heading level
   */
  private getDefaultLineHeight(level: number): string {
    return '1.2';
  }

  // ==========================================================================
  // Private Helper Methods - Button Analysis
  // ==========================================================================

  /**
   * Extract button information from page
   */
  private async extractButtons(page: any): Promise<ButtonInfo[]> {
    // This would be called with a Playwright page object
    // For now, return empty array as placeholder
    return page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));
      
      return buttons.map((button: Element) => {
        const styles = window.getComputedStyle(button);
        const text = button.textContent?.trim() || '';
        const className = button.className || '';

        // Calculate visual weight based on styles
        let visualWeight = 0;

        // Background color contributes to weight
        const bgColor = styles.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          visualWeight += 40;
        }

        // Border contributes to weight
        const borderWidth = parseFloat(styles.borderWidth);
        if (borderWidth > 0) {
          visualWeight += 20;
        }

        // Padding contributes to weight
        const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        if (padding > 16) {
          visualWeight += 20;
        }

        // Font weight contributes
        const fontWeight = parseInt(styles.fontWeight, 10);
        if (fontWeight >= 600) {
          visualWeight += 20;
        }

        return {
          text,
          className,
          visualWeight,
        };
      });
    });
  }

  /**
   * Validate button hierarchy
   */
  private validateButtonHierarchy(
    primaryButtons: ButtonInfo[],
    secondaryButtons: ButtonInfo[]
  ): ButtonIssue[] {
    const issues: ButtonIssue[] = [];

    // Check for too many primary buttons
    if (primaryButtons.length > 2) {
      issues.push({
        type: 'too-many-primary',
        message: `Found ${primaryButtons.length} primary buttons - consider limiting to 1-2 per section`,
      });
    }

    // Check for ambiguous hierarchy (primary and secondary too similar)
    if (primaryButtons.length > 0 && secondaryButtons.length > 0) {
      const avgPrimaryWeight = primaryButtons.reduce((sum, b) => sum + b.visualWeight, 0) / primaryButtons.length;
      const avgSecondaryWeight = secondaryButtons.reduce((sum, b) => sum + b.visualWeight, 0) / secondaryButtons.length;

      if (Math.abs(avgPrimaryWeight - avgSecondaryWeight) < 20) {
        issues.push({
          type: 'ambiguous-hierarchy',
          message: 'Primary and secondary buttons have similar visual weight - increase distinction',
        });
      }
    }

    return issues;
  }

  // ==========================================================================
  // Private Helper Methods - Spacing Analysis
  // ==========================================================================

  /**
   * Extract section information from page
   */
  private async extractSections(page: any): Promise<SectionInfo[]> {
    return page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section, [class*="section"], main > div'));
      
      return sections.map((section: Element, index: number) => {
        const styles = window.getComputedStyle(section);
        const selector = section.tagName.toLowerCase() + (section.className ? `.${section.className.split(' ')[0]}` : '') || `section-${index}`;

        return {
          selector,
          marginTop: parseFloat(styles.marginTop),
          marginBottom: parseFloat(styles.marginBottom),
          paddingTop: parseFloat(styles.paddingTop),
          paddingBottom: parseFloat(styles.paddingBottom),
        };
      });
    });
  }

  /**
   * Calculate gaps between sections
   */
  private calculateGaps(sections: SectionInfo[]): number[] {
    const gaps: number[] = [];

    for (let i = 0; i < sections.length - 1; i++) {
      const current = sections[i];
      const next = sections[i + 1];
      
      // Gap is the sum of current's bottom margin and next's top margin
      const gap = current.marginBottom + next.marginTop;
      gaps.push(gap);
    }

    return gaps;
  }

  /**
   * Detect spacing inconsistencies
   */
  private detectSpacingInconsistencies(
    sections: SectionInfo[],
    averageGap: number
  ): SpacingIssue[] {
    const inconsistencies: SpacingIssue[] = [];
    const tolerance = 8; // 0.5rem in pixels (assuming 16px base)

    for (let i = 0; i < sections.length - 1; i++) {
      const current = sections[i];
      const next = sections[i + 1];
      
      const actualGap = current.marginBottom + next.marginTop;
      const deviation = Math.abs(actualGap - averageGap);

      if (deviation > tolerance) {
        inconsistencies.push({
          sections: [current.selector, next.selector],
          expectedGap: averageGap,
          actualGap,
          deviation,
        });
      }
    }

    return inconsistencies;
  }

  // ==========================================================================
  // Private Helper Methods - Accent Color Analysis
  // ==========================================================================

  /**
   * Determine context of color usage from CSS line
   */
  private determineColorContext(cssLine: string): 'interactive' | 'decorative' {
    const line = cssLine.toLowerCase();

    // Interactive contexts (check these first)
    const interactiveKeywords = [
      'button',
      'link',
      'hover',
      'active',
      'focus',
      'input',
      'select',
      'a:',
      'a ',
      '[role="button"]',
    ];

    for (const keyword of interactiveKeywords) {
      if (line.includes(keyword)) {
        return 'interactive';
      }
    }

    // If no interactive keywords found, check for decorative contexts
    // Note: We don't check decorative keywords if interactive was found
    return 'decorative';
  }

  /**
   * Check if accent color usage is appropriate
   */
  private isAppropriateAccentUsage(context: 'interactive' | 'decorative'): boolean {
    // Accent color should only be used for interactive elements
    return context === 'interactive';
  }
}
