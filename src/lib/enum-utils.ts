/** Case-insensitive match against an allowed set of literal values, with a
 * fallback rather than a thrown error — used anywhere we're coercing loose
 * external text (CSV cells, pasted autofill text) into one of our enum-ish
 * string fields. */
export function normalizeEnum<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) return fallback;
  const match = allowed.find(
    (a) => a.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? fallback;
}
