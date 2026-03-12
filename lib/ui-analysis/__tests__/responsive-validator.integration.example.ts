/**
 * Integration Example for ResponsiveValidator
 * 
 * This file demonstrates how to use the ResponsiveValidator in real scenarios.
 * Note: This is an example file, not an actual test that runs in CI.
 */

import { ResponsiveValidator, testResponsive, STANDARD_BREAKPOINTS } from '../responsive-validator';

/**
 * Example 1: Quick test of a single URL
 */
async function quickTest() {
  console.log('Running quick responsive test...');
  
  const report = await testResponsive('http://localhost:3000');
  
  console.log(`Tested URL: ${report.url}`);
  console.log(`Total issues found: ${report.issues.length}`);
  
  // Check mobile viewport
  if (report.breakpoints.mobile.hasHorizontalScroll) {
    console.log('⚠️  Mobile viewport has horizontal scroll');
  }
  
  // Check touch targets
  const mobileTouchIssues = report.breakpoints.mobile.touchTargetIssues;
  if (mobileTouchIssues.length > 0) {
    console.log(`⚠️  Found ${mobileTouchIssues.length} touch target issues on mobile`);
    mobileTouchIssues.forEach(issue => {
      console.log(`   - ${issue.selector}: ${issue.width}x${issue.height}px`);
    });
  }
  
  return report;
}

/**
 * Example 2: Test specific viewport with custom settings
 */
async function customViewportTest() {
  console.log('Running custom viewport test...');
  
  // Create validator with larger touch target requirement
  const validator = new ResponsiveValidator({ width: 48, height: 48 });
  
  try {
    await validator.initialize();
    
    // Test at a specific viewport size
    const report = await validator.testViewport(
      'http://localhost:3000',
      375, // iPhone SE width
      667  // iPhone SE height
    );
    
    console.log(`Viewport: ${report.width}x${report.height}`);
    console.log(`Horizontal scroll: ${report.hasHorizontalScroll ? 'Yes' : 'No'}`);
    console.log(`Touch target issues: ${report.touchTargetIssues.length}`);
    console.log(`Layout shifts: ${report.layoutShifts.length}`);
    
    return report;
  } finally {
    await validator.close();
  }
}

/**
 * Example 3: Test all breakpoints and generate detailed report
 */
async function comprehensiveTest() {
  console.log('Running comprehensive responsive test...');
  
  const validator = new ResponsiveValidator();
  
  try {
    const report = await validator.testAllBreakpoints('http://localhost:3000');
    
    // Analyze each breakpoint
    const breakpoints = ['mobile', 'tablet', 'desktop', 'wide'] as const;
    
    for (const bp of breakpoints) {
      const bpReport = report.breakpoints[bp];
      console.log(`\n${bp.toUpperCase()} (${bpReport.width}x${bpReport.height}):`);
      console.log(`  Horizontal scroll: ${bpReport.hasHorizontalScroll ? '❌' : '✅'}`);
      console.log(`  Touch target issues: ${bpReport.touchTargetIssues.length}`);
      console.log(`  Layout shifts: ${bpReport.layoutShifts.length}`);
    }
    
    // Summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total issues: ${report.issues.length}`);
    
    const criticalIssues = report.issues.filter(i => i.severity === 'critical');
    const moderateIssues = report.issues.filter(i => i.severity === 'moderate');
    
    console.log(`  Critical: ${criticalIssues.length}`);
    console.log(`  Moderate: ${moderateIssues.length}`);
    
    return report;
  } finally {
    await validator.close();
  }
}

/**
 * Example 4: Test multiple pages
 */
async function multiPageTest() {
  console.log('Running multi-page test...');
  
  const validator = new ResponsiveValidator();
  const pages = [
    'http://localhost:3000',
    'http://localhost:3000/about',
    'http://localhost:3000/contact',
  ];
  
  try {
    const results = [];
    
    for (const url of pages) {
      console.log(`\nTesting: ${url}`);
      const report = await validator.testAllBreakpoints(url);
      results.push(report);
      
      console.log(`  Issues: ${report.issues.length}`);
    }
    
    // Aggregate results
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    console.log(`\n📊 Total issues across all pages: ${totalIssues}`);
    
    return results;
  } finally {
    await validator.close();
  }
}

/**
 * Example 5: CI/CD integration
 */
async function ciTest() {
  console.log('Running CI test...');
  
  const validator = new ResponsiveValidator();
  
  try {
    const report = await validator.testAllBreakpoints('http://localhost:3000');
    
    // Check for critical issues
    const criticalIssues = report.issues.filter(i => i.severity === 'critical');
    
    if (criticalIssues.length > 0) {
      console.error(`❌ CI FAILED: Found ${criticalIssues.length} critical issues`);
      criticalIssues.forEach(issue => {
        console.error(`  - ${issue.message}`);
      });
      process.exit(1);
    }
    
    console.log('✅ CI PASSED: No critical responsive issues found');
    return report;
  } finally {
    await validator.close();
  }
}

// Export examples for documentation
export {
  quickTest,
  customViewportTest,
  comprehensiveTest,
  multiPageTest,
  ciTest,
};

// Usage instructions
if (require.main === module) {
  console.log(`
ResponsiveValidator Integration Examples
=========================================

To run these examples:

1. Start your development server:
   npm run dev

2. Run an example:
   npx tsx lib/ui-analysis/__tests__/responsive-validator.integration.example.ts

Available examples:
- quickTest()           - Quick test of a single URL
- customViewportTest()  - Test with custom settings
- comprehensiveTest()   - Test all breakpoints with detailed report
- multiPageTest()       - Test multiple pages
- ciTest()             - CI/CD integration example

Standard breakpoints:
- Mobile:  ${STANDARD_BREAKPOINTS.mobile.width}x${STANDARD_BREAKPOINTS.mobile.height}
- Tablet:  ${STANDARD_BREAKPOINTS.tablet.width}x${STANDARD_BREAKPOINTS.tablet.height}
- Desktop: ${STANDARD_BREAKPOINTS.desktop.width}x${STANDARD_BREAKPOINTS.desktop.height}
- Wide:    ${STANDARD_BREAKPOINTS.wide.width}x${STANDARD_BREAKPOINTS.wide.height}
  `);
}
