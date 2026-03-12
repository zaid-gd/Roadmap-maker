/**
 * Configuration schema and loader for UI analysis system
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { UIAnalysisConfig, Breakpoint, RuleConfig, ReportingConfig } from './types';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1920, height: 1080 },
];

const DEFAULT_RULES: RuleConfig = {
  layout: {
    checkOverflow: true,
    checkAlignment: true,
    checkSpacing: true,
    checkZIndex: true,
  },
  responsive: {
    minTouchTargetSize: { width: 44, height: 44 },
    breakpoints: [640, 768, 1024, 1280],
    allowHorizontalScroll: false,
  },
  accessibility: {
    wcagLevel: 'AA',
    checkKeyboard: true,
    checkFocus: true,
    checkContrast: true,
    checkReducedMotion: true,
  },
  designSystem: {
    enforceTokens: true,
    allowedArbitraryValues: [],
    strictMode: false,
  },
};

const DEFAULT_REPORTING: ReportingConfig = {
  console: true,
  overlay: true,
  json: false,
  outputPath: './ui-analysis-report.json',
  minSeverity: 'minor',
};

export const DEFAULT_CONFIG: UIAnalysisConfig = {
  enabled: true,
  mode: 'development',
  rules: DEFAULT_RULES,
  breakpoints: DEFAULT_BREAKPOINTS,
  reporting: DEFAULT_REPORTING,
};

// ============================================================================
// Configuration Loader
// ============================================================================

export class ConfigLoader {
  private config: UIAnalysisConfig;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  /**
   * Load configuration from file or use defaults
   */
  private loadConfig(configPath?: string): UIAnalysisConfig {
    const paths = configPath
      ? [configPath]
      : [
          join(process.cwd(), 'ui-analysis.config.json'),
          join(process.cwd(), '.ui-analysis.json'),
          join(process.cwd(), 'ui-analysis.config.js'),
        ];

    for (const path of paths) {
      if (existsSync(path)) {
        try {
          const fileContent = readFileSync(path, 'utf-8');
          const userConfig = path.endsWith('.js')
            ? require(path)
            : JSON.parse(fileContent);

          return this.mergeConfig(DEFAULT_CONFIG, userConfig);
        } catch (error) {
          console.warn(`Failed to load config from ${path}:`, error);
          console.warn('Using default configuration');
        }
      }
    }

    return DEFAULT_CONFIG;
  }

  /**
   * Deep merge user config with defaults
   */
  private mergeConfig(
    defaults: UIAnalysisConfig,
    userConfig: Partial<UIAnalysisConfig>
  ): UIAnalysisConfig {
    return {
      enabled: userConfig.enabled ?? defaults.enabled,
      mode: userConfig.mode ?? defaults.mode,
      rules: {
        layout: {
          ...defaults.rules.layout,
          ...userConfig.rules?.layout,
        },
        responsive: {
          ...defaults.rules.responsive,
          ...userConfig.rules?.responsive,
        },
        accessibility: {
          ...defaults.rules.accessibility,
          ...userConfig.rules?.accessibility,
        },
        designSystem: {
          ...defaults.rules.designSystem,
          ...userConfig.rules?.designSystem,
        },
      },
      breakpoints: userConfig.breakpoints ?? defaults.breakpoints,
      reporting: {
        ...defaults.reporting,
        ...userConfig.reporting,
      },
    };
  }

  /**
   * Get the loaded configuration
   */
  getConfig(): UIAnalysisConfig {
    return this.config;
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<UIAnalysisConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  /**
   * Validate configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate mode
    if (!['development', 'ci', 'production'].includes(this.config.mode)) {
      errors.push(`Invalid mode: ${this.config.mode}`);
    }

    // Validate WCAG level
    if (!['A', 'AA', 'AAA'].includes(this.config.rules.accessibility.wcagLevel)) {
      errors.push(`Invalid WCAG level: ${this.config.rules.accessibility.wcagLevel}`);
    }

    // Validate breakpoints
    if (this.config.breakpoints.length === 0) {
      errors.push('At least one breakpoint must be defined');
    }

    for (const bp of this.config.breakpoints) {
      if (bp.width <= 0 || bp.height <= 0) {
        errors.push(`Invalid breakpoint dimensions: ${bp.name}`);
      }
    }

    // Validate touch target size
    const { minTouchTargetSize } = this.config.rules.responsive;
    if (minTouchTargetSize.width < 0 || minTouchTargetSize.height < 0) {
      errors.push('Touch target size must be positive');
    }

    // Validate reporting config
    if (this.config.reporting.json && !this.config.reporting.outputPath) {
      errors.push('Output path required when JSON reporting is enabled');
    }

    // Validate severity
    if (!['critical', 'moderate', 'minor'].includes(this.config.reporting.minSeverity)) {
      errors.push(`Invalid severity level: ${this.config.reporting.minSeverity}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get configuration for specific mode
   */
  static forMode(mode: 'development' | 'ci' | 'production'): UIAnalysisConfig {
    const config = { ...DEFAULT_CONFIG };
    config.mode = mode;

    // Adjust settings based on mode
    switch (mode) {
      case 'development':
        config.reporting.console = true;
        config.reporting.overlay = true;
        config.reporting.json = false;
        break;

      case 'ci':
        config.reporting.console = true;
        config.reporting.overlay = false;
        config.reporting.json = true;
        config.reporting.minSeverity = 'critical';
        config.rules.designSystem.strictMode = true;
        break;

      case 'production':
        config.enabled = false;
        break;
    }

    return config;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a default configuration file
 */
export function createDefaultConfigFile(path: string = 'ui-analysis.config.json'): void {
  const fs = require('fs');
  const configJson = JSON.stringify(DEFAULT_CONFIG, null, 2);
  fs.writeFileSync(path, configJson, 'utf-8');
  console.log(`Created default configuration file at ${path}`);
}

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<UIAnalysisConfig> {
  const config: Partial<UIAnalysisConfig> = {};

  if (process.env.UI_ANALYSIS_ENABLED !== undefined) {
    config.enabled = process.env.UI_ANALYSIS_ENABLED === 'true';
  }

  if (process.env.UI_ANALYSIS_MODE) {
    config.mode = process.env.UI_ANALYSIS_MODE as 'development' | 'ci' | 'production';
  }

  if (process.env.UI_ANALYSIS_MIN_SEVERITY) {
    config.reporting = {
      ...DEFAULT_REPORTING,
      minSeverity: process.env.UI_ANALYSIS_MIN_SEVERITY as 'critical' | 'moderate' | 'minor',
    };
  }

  return config;
}

/**
 * Get configuration with environment overrides
 */
export function getConfig(configPath?: string): UIAnalysisConfig {
  const loader = new ConfigLoader(configPath);
  const envConfig = loadConfigFromEnv();
  
  if (Object.keys(envConfig).length > 0) {
    loader.updateConfig(envConfig);
  }

  const validation = loader.validate();
  if (!validation.valid) {
    console.error('Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid configuration');
  }

  return loader.getConfig();
}
