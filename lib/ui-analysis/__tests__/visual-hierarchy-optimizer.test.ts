/**
 * Unit tests for Visual Hierarchy Optimizer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VisualHierarchyOptimizer } from '../visual-hierarchy-optimizer';

describe('VisualHierarchyOptimizer', () => {
  let optimizer: VisualHierarchyOptimizer;

  beforeEach(() => {
    optimizer = new VisualHierarchyOptimizer();
  });

  describe('analyzeHeadingStructure', () => {
    it('should extract headings from HTML', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Subtitle</h2>
        <h3>Section</h3>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.headings).toHaveLength(3);
      expect(report.headings[0].level).toBe(1);
      expect(report.headings[0].text).toBe('Main Title');
      expect(report.headings[1].level).toBe(2);
      expect(report.headings[1].text).toBe('Subtitle');
      expect(report.headings[2].level).toBe(3);
      expect(report.headings[2].text).toBe('Section');
    });

    it('should detect multiple h1 elements', () => {
      const html = `
        <h1>First Title</h1>
        <h1>Second Title</h1>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.structure).toBe('invalid');
      expect(report.issues).toHaveLength(1);
      expect(report.issues[0].type).toBe('multiple-h1');
    });

    it('should detect skipped heading levels', () => {
      const html = `
        <h1>Title</h1>
        <h3>Skipped h2</h3>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.structure).toBe('invalid');
      expect(report.issues).toHaveLength(1);
      expect(report.issues[0].type).toBe('skipped-level');
      expect(report.issues[0].message).toContain('h1 followed by h3');
    });

    it('should validate proper heading hierarchy', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <h3>Subsection 1.1</h3>
        <h3>Subsection 1.2</h3>
        <h2>Section 2</h2>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.structure).toBe('valid');
      expect(report.issues).toHaveLength(0);
    });

    it('should extract inline styles from headings', () => {
      const html = `
        <h1 style="font-size: 3rem; font-weight: 800;">Styled Title</h1>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.headings[0].fontSize).toBe('3rem');
      expect(report.headings[0].fontWeight).toBe('800');
    });

    it('should use default styles when no inline styles present', () => {
      const html = `<h1>Title</h1>`;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.headings[0].fontSize).toBe('2rem');
      expect(report.headings[0].fontWeight).toBe('700');
      expect(report.headings[0].lineHeight).toBe('1.2');
    });

    it('should detect inconsistent font sizes for same heading level', () => {
      const html = `
        <h2 style="font-size: 1.5rem;">First h2</h2>
        <h2 style="font-size: 2rem;">Second h2</h2>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.structure).toBe('invalid');
      const inconsistentIssues = report.issues.filter(i => i.type === 'inconsistent-size');
      expect(inconsistentIssues.length).toBeGreaterThan(0);
    });

    it('should strip HTML tags from heading text', () => {
      const html = `
        <h1>Title with <span>nested</span> <strong>tags</strong></h1>
      `;

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.headings[0].text).toBe('Title with nested tags');
    });

    it('should handle empty HTML', () => {
      const html = '';

      const report = optimizer.analyzeHeadingStructure(html);

      expect(report.headings).toHaveLength(0);
      expect(report.structure).toBe('valid');
      expect(report.issues).toHaveLength(0);
    });
  });

  describe('analyzeAccentUsage', () => {
    it('should detect accent color in hex format', () => {
      const css = `
        .button {
          background-color: #8aa2ff;
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages).toHaveLength(1);
      expect(report.usages[0].location.lineNumber).toBe(3);
    });

    it('should detect accent color in CSS variable format', () => {
      const css = `
        .link {
          color: var(--color-accent);
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages).toHaveLength(1);
    });

    it('should identify interactive context as appropriate', () => {
      const css = `
        button:hover {
          background-color: #8aa2ff;
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages[0].context).toBe('interactive');
      expect(report.usages[0].appropriate).toBe(true);
      expect(report.issues).toHaveLength(0);
    });

    it('should identify decorative context as inappropriate', () => {
      const css = `
        .divider {
          border-color: #8aa2ff;
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages[0].context).toBe('decorative');
      expect(report.usages[0].appropriate).toBe(false);
      expect(report.issues.length).toBeGreaterThan(0);
    });

    it('should detect multiple accent color usages', () => {
      const css = `
        .button { color: #8aa2ff; }
        .link:hover { color: var(--color-accent); }
        .border { border-color: #8aa2ff; }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages).toHaveLength(3);
    });

    it('should handle CSS without accent color', () => {
      const css = `
        .text {
          color: #ffffff;
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages).toHaveLength(0);
      expect(report.issues).toHaveLength(0);
    });

    it('should be case-insensitive for color detection', () => {
      const css = `
        .button {
          background-color: #8AA2FF;
        }
      `;

      const report = optimizer.analyzeAccentUsage(css);

      expect(report.usages).toHaveLength(1);
    });
  });
});
