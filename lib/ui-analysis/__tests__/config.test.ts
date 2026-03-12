/**
 * Tests for configuration loader
 */

import { ConfigLoader, DEFAULT_CONFIG } from '../config';
import type { UIAnalysisConfig } from '../types';

describe('ConfigLoader', () => {
  describe('default configuration', () => {
    it('should load default configuration when no file exists', () => {
      const loader = new ConfigLoader();
      const config = loader.getConfig();

      expect(config).toBeDefined();
      expect(config.enabled).toBe(true);
      expect(config.mode).toBe('development');
    });

    it('should have valid default breakpoints', () => {
      const loader = new ConfigLoader();
      const config = loader.getConfig();

      expect(config.breakpoints).toHaveLength(4);
      expect(config.breakpoints[0].name).toBe('mobile');
      expect(config.breakpoints[0].width).toBe(375);
    });

    it('should have valid default rules', () => {
      const loader = new ConfigLoader();
      const config = loader.getConfig();

      expect(config.rules.layout.checkOverflow).toBe(true);
      expect(config.rules.responsive.minTouchTargetSize.width).toBe(44);
      expect(config.rules.accessibility.wcagLevel).toBe('AA');
      expect(config.rules.designSystem.enforceTokens).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate default configuration successfully', () => {
      const loader = new ConfigLoader();
      const validation = loader.validate();

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid mode', () => {
      const loader = new ConfigLoader();
      loader.updateConfig({ mode: 'invalid' as any });
      const validation = loader.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid WCAG level', () => {
      const loader = new ConfigLoader();
      loader.updateConfig({
        rules: {
          ...DEFAULT_CONFIG.rules,
          accessibility: {
            ...DEFAULT_CONFIG.rules.accessibility,
            wcagLevel: 'INVALID' as any,
          },
        },
      });
      const validation = loader.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('WCAG'))).toBe(true);
    });

    it('should detect invalid breakpoint dimensions', () => {
      const loader = new ConfigLoader();
      loader.updateConfig({
        breakpoints: [{ name: 'invalid', width: -100, height: 0 }],
      });
      const validation = loader.validate();

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('breakpoint'))).toBe(true);
    });
  });

  describe('mode-specific configuration', () => {
    it('should create development mode configuration', () => {
      const config = ConfigLoader.forMode('development');

      expect(config.mode).toBe('development');
      expect(config.reporting.console).toBe(true);
      expect(config.reporting.overlay).toBe(true);
      expect(config.reporting.json).toBe(false);
    });

    it('should create CI mode configuration', () => {
      const config = ConfigLoader.forMode('ci');

      expect(config.mode).toBe('ci');
      expect(config.reporting.console).toBe(true);
      expect(config.reporting.overlay).toBe(false);
      expect(config.reporting.json).toBe(true);
      expect(config.reporting.minSeverity).toBe('critical');
      expect(config.rules.designSystem.strictMode).toBe(true);
    });

    it('should create production mode configuration', () => {
      const config = ConfigLoader.forMode('production');

      expect(config.mode).toBe('production');
      expect(config.enabled).toBe(false);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration at runtime', () => {
      const loader = new ConfigLoader();
      
      loader.updateConfig({ enabled: false });
      expect(loader.getConfig().enabled).toBe(false);

      loader.updateConfig({ mode: 'ci' });
      expect(loader.getConfig().mode).toBe('ci');
    });

    it('should merge partial updates with existing config', () => {
      const loader = new ConfigLoader();
      const originalBreakpoints = loader.getConfig().breakpoints;

      loader.updateConfig({
        rules: {
          ...DEFAULT_CONFIG.rules,
          layout: {
            ...DEFAULT_CONFIG.rules.layout,
            checkOverflow: false,
          },
        },
      });

      const config = loader.getConfig();
      expect(config.rules.layout.checkOverflow).toBe(false);
      expect(config.rules.layout.checkAlignment).toBe(true); // unchanged
      expect(config.breakpoints).toEqual(originalBreakpoints); // unchanged
    });
  });
});
