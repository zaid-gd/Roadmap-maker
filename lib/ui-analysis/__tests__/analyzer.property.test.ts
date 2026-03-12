/**
 * Property-based tests for UIAnalyzer
 * Using fast-check library for property-based testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { UIAnalyzer } from '../analyzer';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('UIAnalyzer - Property-Based Tests', () => {
  let analyzer: UIAnalyzer;
  const testDir = join(__dirname, 'pbt-test-components');

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

  afterEach(() => {
    // Clean up after tests
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * Property 1: Component Scanning Completeness
   * **Validates: Requirements 1.1**
   * 
   * For any set of component files in the project, when the UI_Analyzer scans them,
   * every file should be processed and included in the analysis report.
   */
  describe('Property 1: Component Scanning Completeness', () => {
    it('should process all component files in any given set', () => {
      fc.assert(
        fc.property(
          // Generate an array of 1-10 component files
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 })
                .filter(s => /^[a-zA-Z0-9_-]+$/.test(s))
                .map(s => `${s}.tsx`),
              content: fc.oneof(
                fc.constant('export default function Component() { return <div>Test</div>; }'),
                fc.constant('export default function Component() { return <div className="p-4">Test</div>; }'),
                fc.constant('export default function Component() { return <div className="flex items-center">Test</div>; }'),
                fc.constant('export default function Component() { return <div className="overflow-hidden w-full">Test</div>; }'),
                fc.constant('export default function Component() { return <button>Click me</button>; }'),
              )
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (componentFiles) => {
            // Create unique file names by adding index prefix
            const filesToCreate = componentFiles.map((file, index) => ({
              name: `file_${index}_${file.name}`,
              content: file.content
            }));

            // Write all component files to test directory
            filesToCreate.forEach((file) => {
              const filePath = join(testDir, file.name);
              writeFileSync(filePath, file.content);
            });

            // Scan the directory
            const report = analyzer.scanDirectory(testDir);

            // Property: All files should be scanned
            // The number of files scanned should equal the number of files created
            const result = report.summary.filesScanned === filesToCreate.length;
            
            // Clean up files for next iteration
            filesToCreate.forEach((file) => {
              try {
                rmSync(join(testDir, file.name), { force: true });
              } catch (e) {
                // Ignore
              }
            });
            
            return result;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all component files regardless of subdirectory depth', () => {
      fc.assert(
        fc.property(
          // Generate component files with nested directory structures
          fc.array(
            fc.record({
              path: fc.array(
                fc.string({ minLength: 1, maxLength: 10 })
                  .filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
                { minLength: 0, maxLength: 3 }
              ).map(parts => parts.join('/')),
              name: fc.string({ minLength: 1, maxLength: 20 })
                .filter(s => /^[a-zA-Z0-9_-]+$/.test(s))
                .map(s => `${s}.tsx`),
              content: fc.constant('export default function Component() { return <div>Test</div>; }')
            }),
            { minLength: 1, maxLength: 8 }
          ),
          (componentFiles) => {
            // Create files with unique paths
            const filesToCreate = componentFiles.map((file, index) => ({
              path: file.path ? `dir_${index}_${file.path}` : `dir_${index}`,
              name: `file_${index}_${file.name}`,
              content: file.content
            }));

            // Write all component files to test directory with subdirectories
            filesToCreate.forEach((file) => {
              const dirPath = join(testDir, file.path);
              mkdirSync(dirPath, { recursive: true });
              
              const filePath = join(dirPath, file.name);
              writeFileSync(filePath, file.content);
            });

            // Scan the directory
            const report = analyzer.scanDirectory(testDir);

            // Property: All files should be scanned regardless of depth
            const result = report.summary.filesScanned === filesToCreate.length;
            
            // Clean up for next iteration
            filesToCreate.forEach((file) => {
              try {
                const dirPath = join(testDir, file.path);
                rmSync(dirPath, { recursive: true, force: true });
              } catch (e) {
                // Ignore
              }
            });
            
            return result;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should only count .tsx and .jsx files, not other file types', () => {
      fc.assert(
        fc.property(
          fc.record({
            componentFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 })
                  .filter(s => /^[a-zA-Z0-9_-]+$/.test(s))
                  .map(s => `${s}.tsx`),
                content: fc.constant('export default function Component() { return <div>Test</div>; }')
              }),
              { minLength: 1, maxLength: 5 }
            ),
            otherFiles: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 })
                  .filter(s => /^[a-zA-Z0-9_-]+$/.test(s))
                  .chain(s => fc.oneof(
                    fc.constant(`${s}.ts`),
                    fc.constant(`${s}.js`),
                    fc.constant(`${s}.json`),
                    fc.constant(`${s}.md`)
                  )),
                content: fc.constant('// Not a component')
              }),
              { minLength: 0, maxLength: 5 }
            )
          }),
          ({ componentFiles, otherFiles }) => {
            // Create unique file names with prefixes
            const componentFilesToCreate = componentFiles.map((file, index) => ({
              name: `comp_${index}_${file.name}`,
              content: file.content
            }));
            
            const otherFilesToCreate = otherFiles.map((file, index) => ({
              name: `other_${index}_${file.name}`,
              content: file.content
            }));

            // Write component files
            componentFilesToCreate.forEach((file) => {
              const filePath = join(testDir, file.name);
              writeFileSync(filePath, file.content);
            });

            // Write other files
            otherFilesToCreate.forEach((file) => {
              const filePath = join(testDir, file.name);
              writeFileSync(filePath, file.content);
            });

            // Scan the directory
            const report = analyzer.scanDirectory(testDir);

            // Property: Only component files (.tsx, .jsx) should be counted
            const result = report.summary.filesScanned === componentFilesToCreate.length;
            
            // Clean up for next iteration
            [...componentFilesToCreate, ...otherFilesToCreate].forEach((file) => {
              try {
                rmSync(join(testDir, file.name), { force: true });
              } catch (e) {
                // Ignore
              }
            });
            
            return result;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
