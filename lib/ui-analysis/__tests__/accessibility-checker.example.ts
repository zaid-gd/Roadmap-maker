/**
 * Example usage of AccessibilityChecker
 * 
 * This file demonstrates how to use the AccessibilityChecker module
 * to audit pages for WCAG compliance and accessibility issues.
 */

import { AccessibilityChecker, auditAccessibility } from '../accessibility-checker';

/**
 * Example 1: Basic page audit
 */
async function basicAudit() {
  const checker = new AccessibilityChecker('AA');
  
  try {
    const report = await checker.auditPage('http://localhost:3000');
    
    console.log('Accessibility Report:');
    console.log(`URL: ${report.url}`);
    console.log(`WCAG Level: ${report.wcagLevel}`);
    console.log(`Score: ${report.score}/100`);
    console.log(`Violations: ${report.violations.length}`);
    console.log(`Passes: ${report.passes.length}`);
    
    // Display violations
    if (report.violations.length > 0) {
      console.log('\nViolations:');
      report.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Help: ${violation.help}`);
        console.log(`  Affected nodes: ${violation.nodes.length}`);
      });
    }
  } finally {
    await checker.close();
  }
}

/**
 * Example 2: Quick audit using utility function
 */
async function quickAudit() {
  const report = await auditAccessibility('http://localhost:3000', 'AA');
  console.log(`Accessibility score: ${report.score}/100`);
}

/**
 * Example 3: Audit with custom WCAG level
 */
async function customLevelAudit() {
  const checker = new AccessibilityChecker('AAA');
  
  try {
    const report = await checker.auditPage('http://localhost:3000');
    console.log(`AAA compliance score: ${report.score}/100`);
  } finally {
    await checker.close();
  }
}

// Run examples (uncomment to execute)
// basicAudit();
// quickAudit();
// customLevelAudit();
