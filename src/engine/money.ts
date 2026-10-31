/**
 * money.ts — integer-paise arithmetic helpers.
 *
 * RULE: All monetary values inside KSHAN are integer paise (1 INR = 100 paise).
 * Floating-point money arithmetic is NEVER used.
 */

/** Parse a human-entered rupee string ("1,23,456.50") into integer paise. */
export function parseINR(value: string): number {
  // Strip currency symbol, whitespace and lakh/comma separators
  const cleaned = value.replace(/[₹\s,]/g, '');
  const float = parseFloat(cleaned);
  if (!isFinite(float)) throw new Error(`Cannot parse INR value: "${value}"`);
  // Round to nearest paise to absorb floating-point noise
  return Math.round(float * 100);
}

/** Format integer paise as an INR string with lakh grouping ("₹1,23,456.50"). */
export function formatINR(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error(`formatINR requires integer paise, got ${String(paise)}`);
  }
  const rupees = Math.abs(paise) / 100;
  const sign = paise < 0 ? '-' : '';

  // Indian lakh grouping: last three digits, then groups of two
  const fixed = rupees.toFixed(2);
  const dotIdx = fixed.indexOf('.');
  const whole = fixed.slice(0, dotIdx);
  const fraction = fixed.slice(dotIdx + 1);
  const formatted = formatLakh(whole);
  return `${sign}₹${formatted}.${fraction}`;
}

/** Format an integer rupee string with lakh grouping (no paise). */
function formatLakh(whole: string): string {
  if (whole.length <= 3) return whole;
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  // Groups of 2 from the right on the remaining part
  const groups: string[] = [];
  let remaining = rest;
  while (remaining.length > 2) {
    groups.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) groups.unshift(remaining);
  return `${groups.join(',')},${last3}`;
}

/** Add two paise amounts. Result is always an integer. */
export function addPaise(a: number, b: number): number {
  assertInteger(a, 'addPaise a');
  assertInteger(b, 'addPaise b');
  return a + b;
}

/** Subtract paise amounts. Result may be negative. */
export function subPaise(a: number, b: number): number {
  assertInteger(a, 'subPaise a');
  assertInteger(b, 'subPaise b');
  return a - b;
}

/**
 * Safe integer division: divide `numerator` paise by `denominator`,
 * returning the floored integer quotient.
 * Throws if denominator is zero.
 */
export function safeDivide(numerator: number, denominator: number): number {
  assertInteger(numerator, 'safeDivide numerator');
  if (denominator === 0) throw new Error('Division by zero');
  return Math.floor(numerator / denominator);
}

/** Convert rupees (may have decimal) to integer paise, rounding. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert integer paise to rupees (floating-point, for display only). */
export function paiseToRupees(paise: number): number {
  assertInteger(paise, 'paiseToRupees');
  return paise / 100;
}

function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer paise value, got ${String(value)}`);
  }
}
