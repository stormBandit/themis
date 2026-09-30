import { describe, expect, it } from 'vitest'
import { formatWeight, fromDisplayString, toDisplayString, unitLabel } from './format'

describe('format', () => {
  it('formats lbs with no decimals and separators', () => {
    expect(toDisplayString(8500, 'lbs')).toBe('8,500')
    expect(toDisplayString(1234.6, 'lbs')).toBe('1,235')
  })
  it('formats kg with at most one decimal and no trailing .0', () => {
    expect(toDisplayString(1000 / 0.45359237, 'kg')).toBe('1,000')
    expect(toDisplayString(1996.4 / 0.45359237, 'kg')).toBe('1,996.4')
  })
  it('handles undefined and zero', () => {
    expect(toDisplayString(undefined, 'lbs')).toBe('')
    expect(formatWeight(undefined, 'kg')).toBe('')
    expect(formatWeight(0, 'lbs')).toBe('0')
    expect(formatWeight(0, 'kg')).toBe('0')
  })
  it('converts kg input to unrounded lbs', () => {
    expect(fromDisplayString('1,000', 'lbs')).toBe(1000)
    expect(fromDisplayString('1', 'kg')).toBeCloseTo(2.2046226, 6)
    expect(fromDisplayString('', 'kg')).toBeUndefined()
    expect(fromDisplayString('-1', 'kg')).toBeUndefined()
  })
  it('round-trips kg entry through stored lbs', () => {
    const lbs = fromDisplayString('1996.4', 'kg')
    expect(toDisplayString(lbs, 'kg')).toBe('1,996.4')
  })
  it('labels units', () => {
    expect(unitLabel('lbs')).toBe('LBS')
    expect(unitLabel('kg')).toBe('KG')
  })
})
