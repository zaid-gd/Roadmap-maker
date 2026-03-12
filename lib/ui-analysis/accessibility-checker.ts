/**
 * Accessibility Checker - Automated accessibility audit system using axe-core
 * 
 * This module integrates axe-core for WCAG validation and provides custom
 * accessibility checks for keyboard navigation, focus indicators, and more.
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import type {
  A11yReport,
  A11yViolation,
  A11yPass,
  A11yIncomplete,
  ViolationNode,
  KeyboardIssue,
  FocusIssue,
  ContrastIssue,
  MotionIssue,
} from './types';

// ============================================================================
// Accessibility Checker Class
// ============================================================================

export class AccessibilityChecker {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private wcagLevel: 'A' | 'AA' | 'AAA';

  constructor(wcagLevel: 'A' | 'AA' | 'AAA' = 'AA') {
    this.wcagLevel = wcagLevel;
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
      this.context = await this.browser.newContext();
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Run comprehensive accessibility audit on a page
   */
  async auditPage(url: string): Promise<A11yReport> {
    await this.initialize();

    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const page = await this.context.newPage();

    try {
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for page to stabilize
      await page.waitForTimeout(500);

      // Inject axe-core library
      await this.injectAxeCore(page);

      // Run axe-core audit
      const axeResults = await this.runAxeCore(page);

      // Calculate accessibility score
      const score = this.calculateScore(axeResults.violations, axeResults.passes);

      return {
        url,
        violations: axeResults.violations,
        passes: axeResults.passes,
        incomplete: axeResults.incomplete,
        wcagLevel: this.wcagLevel,
        score,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Check keyboard navigation accessibility
   */
  async checkKeyboardNav(page: Page): Promise<KeyboardIssue[]> {
    const issues: KeyboardIssue[] = [];

    // Get all interactive elements
    const interactiveElements = await page.$$('button, a, input, select, textarea, [role="button"], [tabindex]');

    for (const element of interactiveElements) {
      // Check if element is focusable
      const isFocusable = await element.evaluate((el) => {
        const tabIndex = el.getAttribute('tabindex');
        if (tabIndex === '-1') return false;
        
        // Check if element is naturally focusable or has tabindex >= 0
        const focusableElements = ['button', 'a', 'input', 'select', 'textarea'];
        return focusableElements.includes(el.tagName.toLowerCase()) || (tabIndex !== null && parseInt(tabIndex) >= 0);
      });

      if (!isFocusable) {
        const selector = await element.evaluate((el) => {
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
          return `${el.tagName.toLowerCase()}${id}${classes}`;
        });

        issues.push({
          element: selector,
          issue: 'not-focusable',
          recommendation: 'Add tabindex="0" or use a naturally focusable element',
        });
      }
    }

    return issues;
  }

  /**
   * Check focus indicators
   */
  async checkFocusIndicators(page: Page): Promise<FocusIssue[]> {
    const issues: FocusIssue[] = [];

    // Get all focusable elements
    const focusableElements = await page.$$('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');

    for (const element of focusableElements) {
      // Focus the element
      await element.focus();

      // Get computed outline style
      const outlineInfo = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          outlineOffset: styles.outlineOffset,
        };
      });

      // Check if outline meets requirements (2px solid with 2px offset)
      const hasValidOutline = this.validateFocusOutline(outlineInfo);

      if (!hasValidOutline) {
        const selector = await element.evaluate((el) => {
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
          return `${el.tagName.toLowerCase()}${id}${classes}`;
        });

        issues.push({
          element: selector,
          currentOutline: outlineInfo.outline,
          requiredOutline: '2px solid with 2px offset',
        });
      }
    }

    return issues;
  }

  /**
   * Check color contrast ratios
   */
  async checkColorContrast(page: Page): Promise<ContrastIssue[]> {
    const issues: ContrastIssue[] = [];

    // Get all text elements
    const textElements = await page.$$('p, h1, h2, h3, h4, h5, h6, span, a, button, label, li');

    for (const element of textElements) {
      const contrastInfo = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const foreground = styles.color;
        const background = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;

        return {
          foreground,
          background,
          fontSize,
          fontWeight,
        };
      });

      // Calculate contrast ratio
      const ratio = this.calculateContrastRatio(contrastInfo.foreground, contrastInfo.background);

      // Determine required ratio based on text size
      const isLargeText = contrastInfo.fontSize >= 18 || (contrastInfo.fontSize >= 14 && parseInt(contrastInfo.fontWeight) >= 700);
      const requiredRatio = isLargeText ? 3.0 : 4.5;

      if (ratio < requiredRatio) {
        const selector = await element.evaluate((el) => {
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
          return `${el.tagName.toLowerCase()}${id}${classes}`;
        });

        issues.push({
          element: selector,
          foreground: contrastInfo.foreground,
          background: contrastInfo.background,
          ratio,
          requiredRatio,
          wcagLevel: 'AA',
        });
      }
    }

    return issues;
  }

  /**
   * Check reduced motion support
   */
  async checkReducedMotion(): Promise<MotionIssue[]> {
    // This would require analyzing CSS files for @media (prefers-reduced-motion)
    // For now, return empty array as placeholder
    // Full implementation would parse CSS and check for proper media query usage
    return [];
  }

  /**
   * Inject axe-core library into page
   */
  private async injectAxeCore(page: Page): Promise<void> {
    // Inject axe-core from node_modules
    const axeCorePath = require.resolve('axe-core');
    const axeSource = require('fs').readFileSync(axeCorePath, 'utf8');
    await page.evaluate(axeSource);
  }

  /**
   * Run axe-core audit
   */
  private async runAxeCore(page: Page): Promise<{
    violations: A11yViolation[];
    passes: A11yPass[];
    incomplete: A11yIncomplete[];
  }> {
    const results = await page.evaluate((wcagLevel) => {
      // @ts-ignore - axe is injected globally
      return window.axe.run({
        runOnly: {
          type: 'tag',
          values: [`wcag2${wcagLevel.toLowerCase()}`, 'best-practice'],
        },
      });
    }, this.wcagLevel);

    return {
      violations: results.violations.map(this.mapAxeViolation),
      passes: results.passes.map(this.mapAxePass),
      incomplete: results.incomplete.map(this.mapAxeIncomplete),
    };
  }

  /**
   * Map axe-core violation to our format
   */
  private mapAxeViolation(violation: any): A11yViolation {
    return {
      id: violation.id,
      impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
      })),
    };
  }

  /**
   * Map axe-core pass to our format
   */
  private mapAxePass(pass: any): A11yPass {
    return {
      id: pass.id,
      description: pass.description,
    };
  }

  /**
   * Map axe-core incomplete to our format
   */
  private mapAxeIncomplete(incomplete: any): A11yIncomplete {
    return {
      id: incomplete.id,
      description: incomplete.description,
      nodes: incomplete.nodes.map((node: any) => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary || '',
      })),
    };
  }

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateScore(violations: A11yViolation[], passes: A11yPass[]): number {
    // Weight violations by impact
    const impactWeights = {
      critical: 10,
      serious: 7,
      moderate: 4,
      minor: 1,
    };

    const totalViolationWeight = violations.reduce((sum, v) => {
      return sum + (impactWeights[v.impact] * v.nodes.length);
    }, 0);

    const totalPasses = passes.length;

    // Calculate score: more passes and fewer violations = higher score
    if (totalPasses === 0 && totalViolationWeight === 0) return 100;
    if (totalPasses === 0) return 0;

    const score = Math.max(0, 100 - (totalViolationWeight / totalPasses) * 100);
    return Math.round(score);
  }

  /**
   * Validate focus outline meets requirements
   */
  private validateFocusOutline(outlineInfo: {
    outline: string;
    outlineWidth: string;
    outlineStyle: string;
    outlineOffset: string;
  }): boolean {
    // Check for 2px width
    const widthMatch = outlineInfo.outlineWidth.includes('2px');
    
    // Check for solid style
    const styleMatch = outlineInfo.outlineStyle === 'solid' || outlineInfo.outline.includes('solid');
    
    // Check for 2px offset
    const offsetMatch = outlineInfo.outlineOffset.includes('2px');

    // Check if outline is not 'none'
    const notNone = outlineInfo.outline !== 'none' && outlineInfo.outlineStyle !== 'none';

    return widthMatch && styleMatch && offsetMatch && notNone;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(foreground: string, background: string): number {
    const fgLuminance = this.getRelativeLuminance(foreground);
    const bgLuminance = this.getRelativeLuminance(background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  private getRelativeLuminance(color: string): number {
    // Parse RGB values from color string
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    // Convert to relative luminance
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): [number, number, number] | null {
    // Handle rgb/rgba format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Handle hex format
    const hexMatch = color.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16),
      ];
    }

    return null;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an accessibility checker with default settings
 */
export function createAccessibilityChecker(
  wcagLevel?: 'A' | 'AA' | 'AAA'
): AccessibilityChecker {
  return new AccessibilityChecker(wcagLevel);
}

/**
 * Quick audit for a single URL
 */
export async function auditAccessibility(
  url: string,
  wcagLevel?: 'A' | 'AA' | 'AAA'
): Promise<A11yReport> {
  const checker = createAccessibilityChecker(wcagLevel);
  try {
    const report = await checker.auditPage(url);
    return report;
  } finally {
    await checker.close();
  }
}
