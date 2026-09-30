import { describe, expect, it } from 'vitest'
import { parseNumber } from './parse'

describe('parseNumber', () => {
  it('parses plain numbers', () => {
    expect(parseNumber('1650')).toBe(1650)
    expect(parseNumber('0')).toBe(0)
    expect(parseNumber('007')).toBe(7)
  })
  it('strips commas and spaces', () => {
    expect(parseNumber('8,500')).toBe(8500)
    expect(parseNumber(' 1 234 567 ')).toBe(1234567)
  })
  it('accepts a decimal point', () => {
    expect(parseNumber('1996.4')).toBe(1996.4)
    expect(parseNumber('.5')).toBe(0.5)
    expect(parseNumber('5.')).toBe(5)
  })
  it('gives undefined for blanks', () => {
    expect(parseNumber('')).toBeUndefined()
    expect(parseNumber('   ')).toBeUndefined()
  })
  it('rejects negatives, exponents and junk', () => {
    for (const bad of [
      '-5',
      '+5',
      '1e3',
      '1E3',
      'abc',
      '12abc',
      '.',
      '1.2.3',
      'NaN',
      'Infinity',
      '1,5,,x',
      '0x10',
    ])
      expect(parseNumber(bad)).toBeUndefined()
  })
  it('treats commas as thousands separators', () => {
    expect(parseNumber('1,20')).toBe(120)
  })
})
