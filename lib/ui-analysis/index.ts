/**
 * UI Analysis System - Core Infrastructure
 * 
 * This module provides the foundation for automated UI analysis,
 * including layout issue detection, responsive validation, accessibility
 * checking, and design system enforcement.
 */

// Export all types
export * from './types';

// Export configuration utilities
export {
  ConfigLoader,
  DEFAULT_CONFIG,
  createDefaultConfigFile,
  loadConfigFromEnv,
  getConfig,
} from './config';

// Export analyzer
export { UIAnalyzer } from './analyzer';

// Export responsive validator
export {
  ResponsiveValidator,
  STANDARD_BREAKPOINTS,
  createResponsiveValidator,
  testResponsive,
} from './responsive-validator';

// Export accessibility checker
export {
  AccessibilityChecker,
  createAccessibilityChecker,
  auditAccessibility,
} from './accessibility-checker';

// Export visual hierarchy optimizer
export { VisualHierarchyOptimizer } from './visual-hierarchy-optimizer';

// Export design system validator
export {
  DesignSystemValidator,
  parseTSXFile,
  extractClassNames,
  extractStyleProps,
} from './design-system-validator';
