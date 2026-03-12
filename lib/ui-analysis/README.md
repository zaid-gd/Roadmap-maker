# UI Analysis System

Automated UI analysis and improvement system for the Next.js workspace platform.

## Overview

This system provides comprehensive UI analysis capabilities including:

- **Layout Issue Detection**: Identifies overflow, misalignment, spacing inconsistencies, and z-index conflicts
- **Responsive Validation**: Tests layout behavior across viewport breakpoints
- **Accessibility Checking**: Validates WCAG compliance and accessibility standards
- **Visual Hierarchy Optimization**: Analyzes heading structure, button hierarchy, and contrast ratios
- **Design System Enforcement**: Ensures consistent use of design tokens

## Directory Structure

```
lib/ui-analysis/
├── index.ts                      # Main entry point
├── types.ts                      # Shared TypeScript interfaces
├── config.ts                     # Configuration schema and loader
├── analyzer.ts                   # Static analyzer for layout issues
├── responsive-validator.ts       # Responsive validation with Playwright
├── accessibility-checker.ts      # Accessibility audit with axe-core
├── __tests__/                    # Test files
└── README.md                     # This file
```

## Installation

The following dependencies are required:

```bash
npm install --save-dev fast-check axe-core playwright chalk
```

## Configuration

### Default Configuration

The system comes with sensible defaults that work out of the box:

```typescript
import { DEFAULT_CONFIG } from './lib/ui-analysis';
```

### Custom Configuration

Create a configuration file in your project root:

**ui-analysis.config.json**
```json
{
  "enabled": true,
  "mode": "development",
  "rules": {
    "layout": {
      "checkOverflow": true,
      "checkAlignment": true,
      "checkSpacing": true,
      "checkZIndex": true
    },
    "responsive": {
      "minTouchTargetSize": { "width": 44, "height": 44 },
      "breakpoints": [640, 768, 1024, 1280],
      "allowHorizontalScroll": false
    },
    "accessibility": {
      "wcagLevel": "AA",
      "checkKeyboard": true,
      "checkFocus": true,
      "checkContrast": true,
      "checkReducedMotion": true
    },
    "designSystem": {
      "enforceTokens": true,
      "allowedArbitraryValues": [],
      "strictMode": false
    }
  },
  "breakpoints": [
    { "name": "mobile", "width": 375, "height": 667 },
    { "name": "tablet", "width": 768, "height": 1024 },
    { "name": "desktop", "width": 1280, "height": 800 },
    { "name": "wide", "width": 1920, "height": 1080 }
  ],
  "reporting": {
    "console": true,
    "overlay": true,
    "json": false,
    "outputPath": "./ui-analysis-report.json",
    "minSeverity": "minor"
  }
}
```

### Loading Configuration

```typescript
import { getConfig, ConfigLoader } from './lib/ui-analysis';

// Load from default locations
const config = getConfig();

// Load from specific path
const customConfig = getConfig('./custom-config.json');

// Use ConfigLoader for more control
const loader = new ConfigLoader('./my-config.json');
const config = loader.getConfig();

// Validate configuration
const validation = loader.validate();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

### Environment Variables

Override configuration via environment variables:

```bash
UI_ANALYSIS_ENABLED=true
UI_ANALYSIS_MODE=ci
UI_ANALYSIS_MIN_SEVERITY=critical
```

### Mode-Specific Configuration

Get configuration optimized for specific modes:

```typescript
import { ConfigLoader } from './lib/ui-analysis';

// Development mode: console + overlay, no JSON
const devConfig = ConfigLoader.forMode('development');

// CI mode: console + JSON, strict mode, critical issues only
const ciConfig = ConfigLoader.forMode('ci');

// Production mode: disabled
const prodConfig = ConfigLoader.forMode('production');
```

## Types

### Core Types

```typescript
import type {
  UIAnalysisConfig,
  LayoutIssue,
  AnalysisReport,
  ResponsiveReport,
  A11yReport,
  DesignSystemReport,
} from './lib/ui-analysis';
```

### Issue Types

- `overflow`: Content overflows container
- `misalignment`: Flex/grid alignment issues
- `spacing-inconsistency`: Non-standard spacing values
- `z-index-conflict`: Z-index layering problems
- `hardcoded-color`: Colors not using design tokens
- `missing-responsive`: Missing responsive breakpoint variants
- `touch-target-small`: Interactive elements too small on mobile
- `contrast-insufficient`: Color contrast below WCAG standards

### Severity Levels

- `critical`: Breaks layout, causes horizontal scroll, blocks accessibility
- `moderate`: Inconsistent spacing, missing responsive variants
- `minor`: Non-standard values that work but don't follow design system

## Usage Examples

### Basic Analysis

```typescript
import { getConfig } from './lib/ui-analysis';

const config = getConfig();

if (config.enabled) {
  // Run analysis based on configuration
  console.log('UI Analysis enabled in', config.mode, 'mode');
}
```

### Creating Default Config File

```typescript
import { createDefaultConfigFile } from './lib/ui-analysis';

// Creates ui-analysis.config.json with defaults
createDefaultConfigFile();

// Create at custom path
createDefaultConfigFile('./config/ui-analysis.json');
```

## Next Steps

This is the foundation infrastructure. The following modules are implemented or in progress:

1. ✅ **UI Analyzer** - Static analysis of React components
2. ✅ **Responsive Validator** - Runtime viewport testing
3. ✅ **Accessibility Checker** - WCAG compliance validation with axe-core
4. ⏳ **Visual Hierarchy Optimizer** - Heading and contrast analysis
5. ⏳ **Design System Validator** - Token usage enforcement
6. ⏳ **CLI Tool** - Command-line interface
7. ⏳ **Reporting System** - Console, overlay, and JSON reports

## Accessibility Checker

The `AccessibilityChecker` module provides automated WCAG compliance testing using axe-core.

### Features

- **axe-core Integration**: Comprehensive WCAG validation
- **Keyboard Navigation Testing**: Verify all interactive elements are keyboard accessible
- **Focus Indicator Validation**: Check for proper focus outlines (2px solid with 2px offset)
- **Color Contrast Checking**: Calculate contrast ratios and verify WCAG AA/AAA compliance
- **Reduced Motion Support**: Validate prefers-reduced-motion media query usage

### Basic Usage

```typescript
import { AccessibilityChecker, auditAccessibility } from './lib/ui-analysis';

// Quick audit
const report = await auditAccessibility('http://localhost:3000', 'AA');
console.log(`Accessibility score: ${report.score}/100`);

// Detailed audit
const checker = new AccessibilityChecker('AA');
try {
  const report = await checker.auditPage('http://localhost:3000');
  
  console.log(`Violations: ${report.violations.length}`);
  console.log(`Passes: ${report.passes.length}`);
  
  report.violations.forEach((violation) => {
    console.log(`${violation.id}: ${violation.description}`);
    console.log(`Impact: ${violation.impact}`);
    console.log(`Affected nodes: ${violation.nodes.length}`);
  });
} finally {
  await checker.close();
}
```

### Custom Checks

```typescript
import { chromium } from 'playwright';

const checker = new AccessibilityChecker('AA');
await checker.initialize();

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000');

// Check keyboard navigation
const keyboardIssues = await checker.checkKeyboardNav(page);

// Check focus indicators
const focusIssues = await checker.checkFocusIndicators(page);

// Check color contrast
const contrastIssues = await checker.checkColorContrast(page);

await browser.close();
await checker.close();
```

### Report Structure

```typescript
interface A11yReport {
  url: string;
  violations: A11yViolation[];      // WCAG violations found
  passes: A11yPass[];               // WCAG checks that passed
  incomplete: A11yIncomplete[];     // Checks that need manual review
  wcagLevel: 'A' | 'AA' | 'AAA';   // WCAG conformance level
  score: number;                    // 0-100 accessibility score
}
```

## Requirements Validation

This implementation satisfies:

- **Requirement 1.1**: Configuration system for enabling/disabling analysis
- **Requirement 1.2**: Structured issue reporting with file paths and severity
- **Requirement 1.5**: Severity rating system (critical, moderate, minor)

## Testing

Property-based tests will be implemented using fast-check to validate:

- **Property 1**: Component scanning completeness
- **Property 2**: Issue report structure
- **Property 3**: Severity assignment completeness

## License

Internal use only - Part of the Next.js workspace platform.
