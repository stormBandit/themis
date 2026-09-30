const PLAIN_NUMBER = /^(\d+\.?\d*|\.\d+)$/

/** Turns what a person typed into a number.
 * IN: text, raw input that may contain commas or spaces as thousands separators.
 * OUT: a non-negative finite number, or undefined when the text is empty, negative,
 *      uses an exponent, or is otherwise not a plain number with an optional decimal point.
 */
export function parseNumber(text: string): number | undefined {
  const cleaned = text.replace(/[,\s]/g, '')
  if (!PLAIN_NUMBER.test(cleaned)) return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}
