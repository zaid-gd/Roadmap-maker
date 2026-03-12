/**
 * Responsive Validator - Runtime testing framework for cross-viewport validation
 * 
 * This module uses Playwright to test layout behavior across different viewport sizes,
 * validating touch targets, horizontal scroll, and responsive breakpoints.
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import type {
  ViewportReport,
  ResponsiveReport,
  TouchTargetIssue,
  LayoutShift,
  LayoutIssue,
} from './types';

// ============================================================================
// Standard Breakpoints
// ============================================================================

export const STANDARD_BREAKPOINTS = {
  mobile: { width: 640, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 800 },
  wide: { width: 1280, height: 1080 },
} as const;

// ============================================================================
// Responsive Validator Class
// ============================================================================

export class ResponsiveValidator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private minTouchTargetSize: { width: number; height: number };

  constructor(minTouchTargetSize = { width: 44, height: 44 }) {
    this.minTouchTargetSize = minTouchTargetSize;
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
   * Test a specific viewport size
   */
  async testViewport(
    url: string,
    width: number,
    height: number
  ): Promise<ViewportReport> {
    await this.initialize();

    if (!this.context) {
      throw new Error('Browser context not initialized');
    }

    const page = await this.context.newPage();

    try {
      // Set viewport size
      await page.setViewportSize({ width, height });

      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for layout stabilization
      await page.waitForTimeout(500);

      // Check for horizontal scroll
      const hasHorizontalScroll = await this.checkHorizontalScroll(page);

      // Check touch targets
      const touchTargetIssues = await this.checkTouchTargets(page);

      // Measure layout shifts
      const layoutShifts = await this.measureLayoutShifts(page);

      // Capture screenshot
      const screenshot = await page.screenshot({ fullPage: false });

      return {
        width,
        height,
        hasHorizontalScroll,
        touchTargetIssues,
        layoutShifts,
        screenshot,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Test all standard breakpoints
   */
  async testAllBreakpoints(url: string): Promise<ResponsiveReport> {
    const issues: LayoutIssue[] = [];

    // Test mobile breakpoint
    const mobileReport = await this.testViewport(
      url,
      STANDARD_BREAKPOINTS.mobile.width,
      STANDARD_BREAKPOINTS.mobile.height
    );

    // Test tablet breakpoint
    const tabletReport = await this.testViewport(
      url,
      STANDARD_BREAKPOINTS.tablet.width,
      STANDARD_BREAKPOINTS.tablet.height
    );

    // Test desktop breakpoint
    const desktopReport = await this.testViewport(
      url,
      STANDARD_BREAKPOINTS.desktop.width,
      STANDARD_BREAKPOINTS.desktop.height
    );

    // Test wide breakpoint
    const wideReport = await this.testViewport(
      url,
      STANDARD_BREAKPOINTS.wide.width,
      STANDARD_BREAKPOINTS.wide.height
    );

    // Convert viewport issues to layout issues
    this.convertToLayoutIssues(mobileReport, 'mobile', issues);
    this.convertToLayoutIssues(tabletReport, 'tablet', issues);
    this.convertToLayoutIssues(desktopReport, 'desktop', issues);
    this.convertToLayoutIssues(wideReport, 'wide', issues);

    return {
      url,
      breakpoints: {
        mobile: mobileReport,
        tablet: tabletReport,
        desktop: desktopReport,
        wide: wideReport,
      },
      issues,
    };
  }

  /**
   * Check for horizontal scroll
   */
  async checkHorizontalScroll(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = window.innerWidth;
      return scrollWidth > clientWidth;
    });
  }

  /**
   * Check touch target sizes
   */
  async checkTouchTargets(page: Page): Promise<TouchTargetIssue[]> {
    const issues: TouchTargetIssue[] = [];

    // Query all interactive elements
    const interactiveSelectors = [
      'button',
      'a',
      'input',
      '[role="button"]',
      '[onclick]',
      'select',
      'textarea',
    ];

    for (const selector of interactiveSelectors) {
      const elements = await page.$$(selector);

      for (const element of elements) {
        const box = await element.boundingBox();

        if (box) {
          // Check if element meets minimum size requirements
          if (
            box.width < this.minTouchTargetSize.width ||
            box.height < this.minTouchTargetSize.height
          ) {
            // Get element selector for reporting
            const elementSelector = await element.evaluate((el) => {
              const id = el.id ? `#${el.id}` : '';
              const classes = el.className
                ? `.${el.className.split(' ').join('.')}`
                : '';
              return `${el.tagName.toLowerCase()}${id}${classes}`;
            });

            issues.push({
              selector: elementSelector,
              width: box.width,
              height: box.height,
              minimumRequired: this.minTouchTargetSize,
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Measure layout shifts
   */
  private async measureLayoutShifts(page: Page): Promise<LayoutShift[]> {
    // This is a simplified implementation
    // In a real scenario, you'd use Performance Observer API
    return await page.evaluate(() => {
      const shifts: LayoutShift[] = [];
      
      // Check for elements without explicit dimensions
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.width || !img.height) {
          shifts.push({
            element: img.tagName.toLowerCase(),
            shift: 0, // Would be calculated from actual measurements
          });
        }
      });

      return shifts;
    });
  }

  /**
   * Convert viewport issues to layout issues
   */
  private convertToLayoutIssues(
    report: ViewportReport,
    breakpoint: string,
    issues: LayoutIssue[]
  ): void {
    // Add horizontal scroll issues
    if (report.hasHorizontalScroll) {
      issues.push({
        type: 'overflow',
        severity: 'critical',
        filePath: 'runtime',
        lineNumber: 0,
        columnNumber: 0,
        message: `Horizontal scroll detected at ${breakpoint} breakpoint (${report.width}px)`,
        suggestion: 'Check for elements with fixed widths or overflow issues',
        autoFixable: false,
      });
    }

    // Add touch target issues
    for (const touchIssue of report.touchTargetIssues) {
      issues.push({
        type: 'touch-target-small',
        severity: 'moderate',
        filePath: 'runtime',
        lineNumber: 0,
        columnNumber: 0,
        message: `Touch target too small at ${breakpoint}: ${touchIssue.selector} (${touchIssue.width}x${touchIssue.height}px, minimum ${touchIssue.minimumRequired.width}x${touchIssue.minimumRequired.height}px)`,
        suggestion: `Increase size to at least ${touchIssue.minimumRequired.width}x${touchIssue.minimumRequired.height}px`,
        autoFixable: false,
      });
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a responsive validator with default settings
 */
export function createResponsiveValidator(
  minTouchTargetSize?: { width: number; height: number }
): ResponsiveValidator {
  return new ResponsiveValidator(minTouchTargetSize);
}

/**
 * Quick test for a single URL at all breakpoints
 */
export async function testResponsive(url: string): Promise<ResponsiveReport> {
  const validator = createResponsiveValidator();
  try {
    const report = await validator.testAllBreakpoints(url);
    return report;
  } finally {
    await validator.close();
  }
}
