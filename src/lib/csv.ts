/**
 * csv.ts — CSV export and formula injection neutralization.
 *
 * SPEC REQUIREMENT (§7):
 * Neutralize CSV formula injection by prepending single quotes to values starting with =, +, -, @.
 */

/** Sanitize an individual field value against CSV formula injection */
export function sanitizeCsvField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);

  // If the cell begins with formula characters (=, +, -, @, or tab/CR), escape it
  const startsWithDangerousChar = /^[=+\-@\t\r]/.test(str);
  let safeStr = str;
  if (startsWithDangerousChar) {
    safeStr = `'${str}`;
  }

  // If string contains quotes, commas or newlines, quote it and escape internal quotes
  if (/[",\n\r]/.test(safeStr)) {
    return `"${safeStr.replace(/"/g, '""')}"`;
  }

  return safeStr;
}

/** Convert a 2D array of rows into a sanitized CSV string */
export function generateCsv(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows.map((row) => row.map(sanitizeCsvField).join(',')).join('\r\n');
}

/** Trigger browser download for a CSV string */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
