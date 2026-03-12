/**
 * Unit tests for UIAnalyzer
 */

import { UIAnalyzer } from '../analyzer';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('UIAnalyzer', () => {
  let analyzer: UIAnalyzer;
  const testDir = join(__dirname, 'test-components');

  beforeEach(() => {
    analyzer = new UIAnalyzer();
    
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
    
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });

  describe('scanComponent', () => {
    it('should detect overflow without constraints', () => {
      const testFile = join(testDir, 'overflow-test.tsx');
      const content = `
        export default function Component() {
          return <div className="overflow-hidden">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.type === 'overflow')).toBe(true);
    });

    it('should detect overflow-auto without max-height', () => {
      const testFile = join(testDir, 'overflow-auto-test.tsx');
      const content = `
        export default function Component() {
          return <div className="overflow-auto">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'overflow' && i.message.includes('max-height'))).toBe(true);
    });

    it('should flag overflow-x-hidden as critical', () => {
      const testFile = join(testDir, 'overflow-x-test.tsx');
      const content = `
        export default function Component() {
          return <div className="overflow-x-hidden">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'overflow' && i.severity === 'critical')).toBe(true);
    });

    it('should detect arbitrary spacing values', () => {
      const testFile = join(testDir, 'spacing-test.tsx');
      const content = `
        export default function Component() {
          return <div className="p-[13px] m-[2.5rem]">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.type === 'spacing-inconsistency')).toBe(true);
    });

    it('should detect non-standard spacing values', () => {
      const testFile = join(testDir, 'non-standard-spacing.tsx');
      const content = `
        export default function Component() {
          return <div className="p-3 m-5">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'spacing-inconsistency' && i.message.includes('Non-standard'))).toBe(true);
    });

    it('should detect z-index usage', () => {
      const testFile = join(testDir, 'zindex-test.tsx');
      const content = `
        export default function Component() {
          return <div className="z-[9999]">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'z-index-conflict')).toBe(true);
    });

    it('should detect arbitrary z-index values', () => {
      const testFile = join(testDir, 'arbitrary-zindex.tsx');
      const content = `
        export default function Component() {
          return <div className="z-[999]">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'z-index-conflict' && i.message.includes('Arbitrary'))).toBe(true);
    });

    it('should detect flex containers without alignment', () => {
      const testFile = join(testDir, 'flex-test.tsx');
      const content = `
        export default function Component() {
          return <div className="flex">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment')).toBe(true);
    });

    it('should detect grid containers without gap', () => {
      const testFile = join(testDir, 'grid-test.tsx');
      const content = `
        export default function Component() {
          return <div className="grid grid-cols-3">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment' && i.message.includes('gap'))).toBe(true);
    });

    it('should detect absolute positioning without positioning classes', () => {
      const testFile = join(testDir, 'absolute-test.tsx');
      const content = `
        export default function Component() {
          return <div className="absolute">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment' && i.message.includes('positioning'))).toBe(true);
    });

    it('should detect hardcoded colors in style attribute', () => {
      const testFile = join(testDir, 'color-test.tsx');
      const content = `
        export default function Component() {
          return <div style={{ color: '#ff0000' }}>Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'hardcoded-color')).toBe(true);
    });

    it('should not flag overflow with constraints', () => {
      const testFile = join(testDir, 'valid-overflow.tsx');
      const content = `
        export default function Component() {
          return <div className="overflow-hidden w-full h-64">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'overflow')).toBe(false);
    });

    it('should not flag flex with alignment', () => {
      const testFile = join(testDir, 'valid-flex.tsx');
      const content = `
        export default function Component() {
          return <div className="flex items-center justify-between">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment')).toBe(false);
    });

    it('should not flag grid with gap', () => {
      const testFile = join(testDir, 'valid-grid.tsx');
      const content = `
        export default function Component() {
          return <div className="grid grid-cols-3 gap-4">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment' && i.message.includes('gap'))).toBe(false);
    });

    it('should not flag absolute with positioning classes', () => {
      const testFile = join(testDir, 'valid-absolute.tsx');
      const content = `
        export default function Component() {
          return <div className="absolute top-0 left-0">Content</div>;
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.some(i => i.type === 'misalignment' && i.message.includes('positioning'))).toBe(false);
    });

    it('should handle parse errors gracefully', () => {
      const testFile = join(testDir, 'invalid.tsx');
      const content = `
        export default function Component() {
          return <div className="flex"
        }
      `;
      writeFileSync(testFile, content);

      const issues = analyzer.scanComponent(testFile);

      // Should not throw, may return empty array or issues
      expect(Array.isArray(issues)).toBe(true);
      // TypeScript compiler is lenient and may not error on incomplete JSX
      // The important thing is that it doesn't crash
    });
  });

  describe('scanDirectory', () => {
    it('should scan all component files in directory', () => {
      // Create multiple test files
      const file1 = join(testDir, 'component1.tsx');
      const file2 = join(testDir, 'component2.tsx');
      
      writeFileSync(file1, `
        export default function Component1() {
          return <div className="overflow-hidden">Content</div>;
        }
      `);
      
      writeFileSync(file2, `
        export default function Component2() {
          return <div className="p-[13px]">Content</div>;
        }
      `);

      const report = analyzer.scanDirectory(testDir);

      expect(report.summary.filesScanned).toBe(2);
      expect(report.issues.length).toBeGreaterThan(0);
      expect(report.timestamp).toBeDefined();
      expect(report.duration).toBeGreaterThan(0);
    });

    it('should detect z-index conflicts across multiple files', () => {
      const file1 = join(testDir, 'modal1.tsx');
      const file2 = join(testDir, 'modal2.tsx');
      
      writeFileSync(file1, `
        export default function Modal1() {
          return <div className="z-50">Modal 1</div>;
        }
      `);
      
      writeFileSync(file2, `
        export default function Modal2() {
          return <div className="z-50">Modal 2</div>;
        }
      `);

      const report = analyzer.scanDirectory(testDir);

      // Should detect that multiple components use z-50
      const zIndexConflicts = report.issues.filter(i => 
        i.type === 'z-index-conflict' && i.message.includes('Multiple components')
      );
      expect(zIndexConflicts.length).toBeGreaterThan(0);
    });

    it('should generate correct summary', () => {
      const testFile = join(testDir, 'test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return (
            <div>
              <div className="overflow-hidden">Issue 1</div>
              <div className="p-[13px]">Issue 2</div>
              <div className="flex">Issue 3</div>
            </div>
          );
        }
      `);

      const report = analyzer.scanDirectory(testDir);

      expect(report.summary.totalIssues).toBeGreaterThan(0);
      expect(report.summary.complianceScore).toBeLessThan(100);
      expect(report.summary.complianceScore).toBeGreaterThanOrEqual(0);
    });

    it('should skip node_modules directory', () => {
      const nodeModulesDir = join(testDir, 'node_modules');
      mkdirSync(nodeModulesDir, { recursive: true });
      
      const testFile = join(nodeModulesDir, 'test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="overflow-hidden">Content</div>;
        }
      `);

      const report = analyzer.scanDirectory(testDir);

      expect(report.summary.filesScanned).toBe(0);
    });
  });

  describe('issue structure', () => {
    it('should include all required fields in LayoutIssue', () => {
      const testFile = join(testDir, 'test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="overflow-hidden">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.length).toBeGreaterThan(0);
      
      const issue = issues[0];
      expect(issue).toHaveProperty('type');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('filePath');
      expect(issue).toHaveProperty('lineNumber');
      expect(issue).toHaveProperty('columnNumber');
      expect(issue).toHaveProperty('message');
      expect(issue).toHaveProperty('autoFixable');
    });

    it('should assign severity levels correctly', () => {
      const testFile = join(testDir, 'test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return (
            <div>
              <div className="overflow-x-hidden">Critical</div>
              <div className="overflow-hidden">Moderate</div>
              <div className="p-[13px]">Minor</div>
            </div>
          );
        }
      `);

      const issues = analyzer.scanComponent(testFile);

      const severities = issues.map(i => i.severity);
      expect(severities).toContain('critical');
      expect(severities).toContain('moderate');
      expect(severities).toContain('minor');
    });

    it('should assign critical severity to width classes without responsive variants', () => {
      const testFile = join(testDir, 'width-test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="w-64">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);

      const widthIssue = issues.find(i => i.type === 'missing-responsive' && i.message.includes('w-64'));
      expect(widthIssue?.severity).toBe('critical');
    });

    it('should assign moderate severity to text classes without responsive variants', () => {
      const testFile = join(testDir, 'text-test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="text-xl">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);

      const textIssue = issues.find(i => i.type === 'missing-responsive' && i.message.includes('text-xl'));
      expect(textIssue?.severity).toBe('moderate');
    });

    it('should provide helpful suggestions', () => {
      const testFile = join(testDir, 'suggestion-test.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="overflow-hidden">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].suggestion).toBeDefined();
      expect(issues[0].suggestion).toContain('w-*');
    });
  });

  describe('severity assignment', () => {
    it('should assign critical severity to overflow-x-hidden', () => {
      const testFile = join(testDir, 'overflow-x.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="overflow-x-hidden">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);
      const overflowIssue = issues.find(i => i.type === 'overflow' && i.message.includes('overflow-x-hidden'));
      
      expect(overflowIssue?.severity).toBe('critical');
    });

    it('should assign moderate severity to high z-index values', () => {
      const testFile = join(testDir, 'high-zindex.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="z-[10000]">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);
      const zIndexIssue = issues.find(i => i.type === 'z-index-conflict' && i.message.includes('Extremely high'));
      
      expect(zIndexIssue?.severity).toBe('moderate');
    });

    it('should assign minor severity to arbitrary spacing', () => {
      const testFile = join(testDir, 'arbitrary-spacing.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="p-[13px]">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);
      const spacingIssue = issues.find(i => i.type === 'spacing-inconsistency');
      
      expect(spacingIssue?.severity).toBe('minor');
    });

    it('should assign minor severity to flex without alignment', () => {
      const testFile = join(testDir, 'flex-no-align.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="flex">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);
      const flexIssue = issues.find(i => i.type === 'misalignment' && i.message.includes('Flex'));
      
      expect(flexIssue?.severity).toBe('minor');
    });

    it('should assign moderate severity to absolute without positioning', () => {
      const testFile = join(testDir, 'absolute-no-pos.tsx');
      writeFileSync(testFile, `
        export default function Component() {
          return <div className="absolute">Content</div>;
        }
      `);

      const issues = analyzer.scanComponent(testFile);
      const absoluteIssue = issues.find(i => i.type === 'misalignment' && i.message.includes('Absolute'));
      
      expect(absoluteIssue?.severity).toBe('moderate');
    });
  });
});
