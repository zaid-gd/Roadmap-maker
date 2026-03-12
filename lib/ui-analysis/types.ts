/**
 * Shared TypeScript interfaces for UI analysis system
 */

// ============================================================================
// Issue Types
// ============================================================================

export type IssueType =
  | 'overflow'
  | 'misalignment'
  | 'spacing-inconsistency'
  | 'z-index-conflict'
  | 'hardcoded-color'
  | 'missing-responsive'
  | 'touch-target-small'
  | 'contrast-insufficient';

export type IssueSeverity = 'critical' | 'moderate' | 'minor';

export interface LayoutIssue {
  type: IssueType;
  severity: IssueSeverity;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  message: string;
  suggestion?: string;
  autoFixable: boolean;
}

// ============================================================================
// Code Location
// ============================================================================

export interface CodeLocation {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  snippet: string;
}

// ============================================================================
// Responsive Validation
// ============================================================================

export interface TouchTargetIssue {
  selector: string;
  width: number;
  height: number;
  minimumRequired: { width: number; height: number };
}

export interface LayoutShift {
  element: string;
  shift: number;
}

export interface ViewportReport {
  width: number;
  height: number;
  hasHorizontalScroll: boolean;
  touchTargetIssues: TouchTargetIssue[];
  layoutShifts: LayoutShift[];
  screenshot?: Buffer;
}

export interface ResponsiveReport {
  url: string;
  breakpoints: {
    mobile: ViewportReport;
    tablet: ViewportReport;
    desktop: ViewportReport;
    wide: ViewportReport;
  };
  issues: LayoutIssue[];
}

// ============================================================================
// Accessibility
// ============================================================================

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
}

export interface A11yPass {
  id: string;
  description: string;
}

export interface A11yIncomplete {
  id: string;
  description: string;
  nodes: ViolationNode[];
}

export interface A11yReport {
  url: string;
  violations: A11yViolation[];
  passes: A11yPass[];
  incomplete: A11yIncomplete[];
  wcagLevel: 'A' | 'AA' | 'AAA';
  score: number;
}

export interface KeyboardIssue {
  element: string;
  issue: 'not-focusable' | 'no-tab-index' | 'focus-trap';
  recommendation: string;
}

export interface FocusIssue {
  element: string;
  currentOutline: string;
  requiredOutline: string;
}

export interface ContrastIssue {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  requiredRatio: number;
  wcagLevel: 'AA' | 'AAA';
}

export interface MotionIssue {
  element: string;
  issue: string;
  recommendation: string;
}

// ============================================================================
// Visual Hierarchy
// ============================================================================

export interface HeadingNode {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
}

export interface HeadingIssue {
  type: 'skipped-level' | 'inconsistent-size' | 'multiple-h1';
  heading: HeadingNode;
  message: string;
}

export interface HeadingReport {
  headings: HeadingNode[];
  issues: HeadingIssue[];
  structure: 'valid' | 'invalid';
}

export interface ButtonInfo {
  text: string;
  className: string;
  visualWeight: number;
}

export interface ButtonIssue {
  type: 'ambiguous-hierarchy' | 'too-many-primary';
  message: string;
}

export interface ButtonHierarchyReport {
  primaryButtons: ButtonInfo[];
  secondaryButtons: ButtonInfo[];
  issues: ButtonIssue[];
}

export interface SectionInfo {
  selector: string;
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
}

export interface SpacingIssue {
  sections: [string, string];
  expectedGap: number;
  actualGap: number;
  deviation: number;
}

export interface SpacingReport {
  sections: SectionInfo[];
  averageGap: number;
  inconsistencies: SpacingIssue[];
}

export interface AccentUsageReport {
  usages: Array<{
    location: CodeLocation;
    context: 'interactive' | 'decorative';
    appropriate: boolean;
  }>;
  issues: string[];
}

// ============================================================================
// Design System Validation
// ============================================================================

export interface ColorViolation {
  type: 'hardcoded-hex' | 'hardcoded-rgb' | 'non-token-var';
  value: string;
  location: CodeLocation;
  suggestedToken: string;
}

export interface SpacingViolation {
  type: 'arbitrary-value' | 'non-scale-value';
  value: string;
  location: CodeLocation;
  suggestedValue: string;
}

export interface RadiusViolation {
  type: 'hardcoded-radius' | 'non-token-radius';
  value: string;
  location: CodeLocation;
  suggestedToken: 'var(--radius-sm)' | 'var(--radius-md)' | 'var(--radius-lg)';
}

export interface FontViolation {
  type: 'hardcoded-font' | 'non-token-font';
  value: string;
  location: CodeLocation;
  suggestedToken: 'var(--font-sans)' | 'var(--font-mono)' | 'var(--font-display)';
}

export interface DesignSystemReport {
  totalViolations: number;
  colorViolations: ColorViolation[];
  spacingViolations: SpacingViolation[];
  radiusViolations: RadiusViolation[];
  fontViolations: FontViolation[];
  complianceScore: number;
}

// ============================================================================
// Analysis Results
// ============================================================================

export interface AnalysisSummary {
  totalIssues: number;
  criticalIssues: number;
  moderateIssues: number;
  minorIssues: number;
  filesScanned: number;
  pagesAudited: number;
  complianceScore: number;
}

export interface AnalysisReport {
  timestamp: string;
  duration: number;
  summary: AnalysisSummary;
  issues: LayoutIssue[];
  responsiveReport?: ResponsiveReport;
  a11yReport?: A11yReport;
  designSystemReport?: DesignSystemReport;
}

// ============================================================================
// Configuration
// ============================================================================

export interface Breakpoint {
  name: string;
  width: number;
  height: number;
}

export interface RuleConfig {
  layout: {
    checkOverflow: boolean;
    checkAlignment: boolean;
    checkSpacing: boolean;
    checkZIndex: boolean;
  };
  responsive: {
    minTouchTargetSize: { width: number; height: number };
    breakpoints: number[];
    allowHorizontalScroll: boolean;
  };
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    checkKeyboard: boolean;
    checkFocus: boolean;
    checkContrast: boolean;
    checkReducedMotion: boolean;
  };
  designSystem: {
    enforceTokens: boolean;
    allowedArbitraryValues: string[];
    strictMode: boolean;
  };
}

export interface ReportingConfig {
  console: boolean;
  overlay: boolean;
  json: boolean;
  outputPath: string;
  minSeverity: IssueSeverity;
}

export interface UIAnalysisConfig {
  enabled: boolean;
  mode: 'development' | 'ci' | 'production';
  rules: RuleConfig;
  breakpoints: Breakpoint[];
  reporting: ReportingConfig;
}

// ============================================================================
// Analysis Error
// ============================================================================

export interface AnalysisError {
  phase: 'parsing' | 'analysis' | 'reporting';
  file: string;
  error: Error;
  recoverable: boolean;
}
