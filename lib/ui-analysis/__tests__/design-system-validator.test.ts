/**
 * Unit tests for Design System Validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DesignSystemValidator } from '../design-system-validator';

describe('DesignSystemValidator', () => {
  let validator: DesignSystemValidator;

  beforeEach(() => {
    validator = new DesignSystemValidator();
  });

  describe('validateColors', () => {
    it('should detect hardcoded hex colors', () => {
      const content = `
        const styles = {
          color: '#ff0000',
          background: '#8aa2ff'
        };
      `;
      
      const violations = validator.validateColors('test.tsx', content);
      
      expect(violations).toHaveLength(2);
      expect(violations[0].type).toBe('hardcoded-hex');
      expect(violations[0].value).toBe('#ff0000');
      expect(violations[1].value).toBe('#8aa2ff');
      expect(violations[1].suggestedToken).toBe('var(--color-accent)');
    });

    it('should detect hardcoded rgb colors', () => {
      const content = `
        const styles = {
          color: 'rgb(255, 0, 0)',
          background: 'rgba(255, 0, 0, 0.5)'
        };
      `;
      
      const violations = validator.validateColors('test.tsx', content);
      
      expect(violations).toHaveLength(2);
      expect(violations[0].type).toBe('hardcoded-rgb');
      expect(violations[1].type).toBe('hardcoded-rgb');
    });

    it('should not flag CSS custom properties', () => {
      const content = `
        const styles = {
          color: 'var(--color-text)',
          background: 'var(--color-surface)'
        };
      `;
      
      const violations = validator.validateColors('test.tsx', content);
      
      expect(violations).toHaveLength(0);
    });
  });

  describe('validateSpacing', () => {
    it('should detect arbitrary spacing values not in scale', () => {
      const content = `
        <div className="p-[13px] m-[7px]">Content</div>
      `;
      
      const violations = validator.validateSpacing('test.tsx', content);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].type).toBe('arbitrary-value');
    });

    it('should not flag spacing values in the design scale', () => {
      const content = `
        <div className="p-[1rem] m-[2rem]">Content</div>
      `;
      
      const violations = validator.validateSpacing('test.tsx', content);
      
      expect(violations).toHaveLength(0);
    });
  });

  describe('validateBorderRadius', () => {
    it('should detect arbitrary border radius values', () => {
      const content = `
        <div className="rounded-[5px]">Content</div>
      `;
      
      const violations = validator.validateBorderRadius('test.tsx', content);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe('hardcoded-radius');
      expect(violations[0].suggestedToken).toBe('var(--radius-sm)');
    });

    it('should suggest nearest radius token', () => {
      const content = `
        <div className="rounded-[15px]">Content</div>
      `;
      
      const violations = validator.validateBorderRadius('test.tsx', content);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].suggestedToken).toBe('var(--radius-md)');
    });
  });

  describe('validateFonts', () => {
    it('should detect hardcoded font families', () => {
      const content = `
        .text {
          font-family: 'Arial, sans-serif';
        }
      `;
      
      const violations = validator.validateFonts('test.css', content);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe('hardcoded-font');
    });

    it('should not flag CSS custom properties for fonts', () => {
      const content = `
        .text {
          font-family: var(--font-sans);
        }
      `;
      
      const violations = validator.validateFonts('test.css', content);
      
      expect(violations).toHaveLength(0);
    });

    it('should suggest appropriate font token based on name', () => {
      const content = `
        .code {
          font-family: 'Monaco, monospace';
        }
      `;
      
      const violations = validator.validateFonts('test.css', content);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].suggestedToken).toBe('var(--font-mono)');
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive report with all violations', () => {
      const cssContent = `
        .text {
          color: #ff0000;
          font-family: 'Arial';
        }
      `;
      
      const tsxContent = `
        <div className="p-[13px] rounded-[5px]">Content</div>
      `;
      
      validator.validateColors('test.css', cssContent);
      validator.validateSpacing('test.tsx', tsxContent);
      validator.validateBorderRadius('test.tsx', tsxContent);
      validator.validateFonts('test.css', cssContent);
      
      const report = validator.generateReport();
      
      expect(report.totalViolations).toBeGreaterThan(0);
      expect(report.colorViolations.length).toBeGreaterThan(0);
      expect(report.complianceScore).toBeLessThan(100);
    });

    it('should calculate compliance score correctly', () => {
      const report = validator.generateReport();
      
      expect(report.complianceScore).toBeGreaterThanOrEqual(0);
      expect(report.complianceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('reset', () => {
    it('should clear all violations', () => {
      const cssContent = `
        .text {
          color: #ff0000;
        }
      `;
      
      validator.validateColors('test.css', cssContent);
      expect(validator.generateReport().totalViolations).toBeGreaterThan(0);
      
      validator.reset();
      expect(validator.generateReport().totalViolations).toBe(0);
    });
  });
});
