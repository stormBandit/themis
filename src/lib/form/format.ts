import { kgToLbs, lbsToKg } from '../model'
import { parseNumber } from './parse'

export type Unit = 'lbs' | 'kg'

const lbsFormat = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 0,
})
const kgFormat = new Intl.NumberFormat('en-CA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

/** Formats a stored weight for display in the chosen unit.
 * IN: lbs, the stored weight in pounds (or undefined when not entered); unit, the display unit.
 * OUT: a string with en-CA thousands separators (lbs: 0 decimals, kg: up to 1 decimal),
 *      or '' when lbs is undefined. Zero gives '0'.
 */
export function formatWeight(lbs: number | undefined, unit: Unit): string {
  if (lbs === undefined || !Number.isFinite(lbs)) return ''
  return unit === 'kg' ? kgFormat.format(lbsToKg(lbs)) : lbsFormat.format(lbs)
}

/** Formats a stored weight for showing in an input box.
 * IN: lbs, the stored weight in pounds (or undefined); unit, the display unit.
 * OUT: the same string as formatWeight: '' for undefined, '0' for zero.
 */
export const toDisplayString = (lbs: number | undefined, unit: Unit): string =>
  formatWeight(lbs, unit)

/** Reads typed text in the chosen unit and returns pounds.
 * IN: text, what the person typed; unit, the unit they typed it in.
 * OUT: the weight in lbs, unrounded, or undefined when the text is empty or invalid.
 */
export function fromDisplayString(text: string, unit: Unit): number | undefined {
  const n = parseNumber(text)
  if (n === undefined) return undefined
  return unit === 'kg' ? kgToLbs(n) : n
}

export const unitLabel = (unit: Unit): 'LBS' | 'KG' => (unit === 'kg' ? 'KG' : 'LBS')
