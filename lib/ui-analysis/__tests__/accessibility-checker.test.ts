/**
 * Unit tests for AccessibilityChecker
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AccessibilityChecker, createAccessibilityChecker } from '../accessibility-checker';

describe('AccessibilityChecker', () => {
  let checker: AccessibilityChecker;

  beforeAll(() => {
    checker = createAccessibilityChecker('AA');
  });

  afterAll(async () => {
    await checker.close();
  });

  describe('initialization', () => {
    it('should create checker with default WCAG level', () => {
      const defaultChecker = new AccessibilityChecker();
      expect(defaultChecker).toBeDefined();
    });

    it('should create checker with specified WCAG level', () => {
      const aaaChecker = new AccessibilityChecker('AAA');
      expect(aaaChecker).toBeDefined();
    });
  });

  describe('factory functions', () => {
    it('should create checker via factory function', () => {
      const factoryChecker = createAccessibilityChecker('AA');
      expect(factoryChecker).toBeDefined();
    });
  });
});
