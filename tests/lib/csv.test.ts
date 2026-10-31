/// <reference types="vitest/globals" />
import { sanitizeCsvField, generateCsv } from '../../src/lib/csv';

describe('csv.ts — Formula injection neutralization', () => {
  it('escapes = prefix by prepending a single quote', () => {
    expect(sanitizeCsvField('=1+1')).toBe("'=1+1");
    expect(sanitizeCsvField('=cmd|')).toBe("'=cmd|");
  });

  it('escapes + prefix', () => {
    expect(sanitizeCsvField('+12345')).toBe("'+12345");
  });

  it('escapes - prefix', () => {
    expect(sanitizeCsvField('-100')).toBe("'-100");
  });

  it('escapes @ prefix', () => {
    expect(sanitizeCsvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
  });

  it('leaves standard text unchanged', () => {
    expect(sanitizeCsvField('Wedding Reception')).toBe('Wedding Reception');
    expect(sanitizeCsvField('₹150000')).toBe('₹150000');
  });

  it('quotes cells containing commas', () => {
    expect(sanitizeCsvField('Mumbai, India')).toBe('"Mumbai, India"');
  });

  it('generates well-formed CSV rows', () => {
    const rows = [
      ['Moment', 'Budget', 'Formula Test'],
      ['Ceremony', 50000, '=2+2'],
    ];
    const csv = generateCsv(rows);
    expect(csv).toContain('Moment,Budget,Formula Test');
    expect(csv).toContain("Ceremony,50000,'=2+2");
  });
});
