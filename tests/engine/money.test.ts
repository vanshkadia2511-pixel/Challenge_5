/// <reference types="vitest/globals" />
import { parseINR, formatINR, addPaise, subPaise, safeDivide, rupeesToPaise, paiseToRupees } from '../../src/engine/money';

describe('money.ts', () => {
  describe('parseINR', () => {
    it('parses a simple rupee string', () => {
      expect(parseINR('100')).toBe(10_000);
    });
    it('parses with paise decimal', () => {
      expect(parseINR('1.50')).toBe(150);
    });
    it('strips commas (lakh format)', () => {
      expect(parseINR('1,23,456')).toBe(12_345_600);
    });
    it('strips ₹ symbol', () => {
      expect(parseINR('₹500.00')).toBe(50_000);
    });
    it('throws on non-numeric', () => {
      expect(() => parseINR('abc')).toThrow();
    });
  });

  describe('formatINR', () => {
    it('formats zero', () => {
      expect(formatINR(0)).toBe('₹0.00');
    });
    it('formats a lakh value', () => {
      expect(formatINR(10_000_000)).toBe('₹1,00,000.00');
    });
    it('formats negative', () => {
      expect(formatINR(-10_000)).toBe('-₹100.00');
    });
    it('throws on non-integer', () => {
      expect(() => formatINR(1.5)).toThrow();
    });
    it('round-trips: parseINR(formatINR(n)) === n for integers', () => {
      const values = [0, 100, 50_000, 1_23_45_600, 99_99_99_999];
      for (const v of values) {
        expect(parseINR(formatINR(v))).toBe(v);
      }
    });
  });

  describe('addPaise', () => {
    it('adds two integers', () => {
      expect(addPaise(1000, 2000)).toBe(3000);
    });
    it('throws on float', () => {
      expect(() => addPaise(1.5, 1000)).toThrow();
    });
  });

  describe('subPaise', () => {
    it('returns negative when b > a', () => {
      expect(subPaise(1000, 2000)).toBe(-1000);
    });
  });

  describe('safeDivide', () => {
    it('floors the result', () => {
      expect(safeDivide(10, 3)).toBe(3);
    });
    it('throws on division by zero', () => {
      expect(() => safeDivide(100, 0)).toThrow('Division by zero');
    });
  });

  describe('rupeesToPaise / paiseToRupees', () => {
    it('converts 500 rupees to 50000 paise', () => {
      expect(rupeesToPaise(500)).toBe(50_000);
    });
    it('converts 50000 paise to 500 rupees', () => {
      expect(paiseToRupees(50_000)).toBe(500);
    });
  });
});
