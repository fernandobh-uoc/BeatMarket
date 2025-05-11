export function parseFormattedCurrency(value: string): number | null {
  if (typeof value !== 'string') return null;
  const numericString = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? null : parsed;
}