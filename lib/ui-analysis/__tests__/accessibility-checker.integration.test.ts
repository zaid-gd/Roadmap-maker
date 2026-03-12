/**
 * Integration tests for AccessibilityChecker
 * Tests actual page auditing with axe-core
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AccessibilityChecker } from '../accessibility-checker';
import { chromium, Browser } from 'playwright';
import type { Server } from 'http';

describe('AccessibilityChecker Integration', () => {
  let checker: AccessibilityChecker;
  let browser: Browser;
  let server: Server;
  let testUrl: string;

  beforeAll(async () => {
    // Create a simple test server
    const http = await import('http');
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Test Page</title>
        </head>
        <body>
          <h1>Test Page</h1>
          <button>Click me</button>
          <img src="test.jpg" alt="Test image">
          <a href="#">Link</a>
        </body>
        </html>
      `);
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          testUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });

    checker = new AccessibilityChecker('AA');
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await checker.close();
    await browser.close();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should audit a page and return a report', async () => {
    const report = await checker.auditPage(testUrl);

    expect(report).toBeDefined();
    expect(report.url).toBe(testUrl);
    expect(report.wcagLevel).toBe('AA');
    expect(report.violations).toBeDefined();
    expect(report.passes).toBeDefined();
    expect(report.incomplete).toBeDefined();
    expect(typeof report.score).toBe('number');
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('should detect violations in the report', async () => {
    const report = await checker.auditPage(testUrl);

    expect(Array.isArray(report.violations)).toBe(true);
    expect(Array.isArray(report.passes)).toBe(true);
  });
});
