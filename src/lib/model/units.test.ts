import { describe, expect, it } from 'vitest'
import {
  gallonsToLbs,
  kgToLbs,
  lbsToGallons,
  lbsToKg,
  litresToLbs,
  roundForDisplay,
} from './units'

describe('units', () => {
  it('uses 1 lb = 0.45359237 kg', () => {
    expect(lbsToKg(1)).toBe(0.45359237)
    expect(kgToLbs(0.45359237)).toBe(1)
  })

  it('round-trips lbs → kg → lbs with no drift', () => {
    for (let lbs = 0; lbs <= 30000; lbs += 7) {
      expect(kgToLbs(lbsToKg(lbs))).toBeCloseTo(lbs, 9)
      expect(roundForDisplay(kgToLbs(lbsToKg(lbs)))).toBe(lbs)
    }
  })

  it('round-trips a kg entry through lbs storage and back to the same displayed kg', () => {
    for (let kg = 0; kg <= 15000; kg += 13) {
      expect(roundForDisplay(lbsToKg(kgToLbs(kg)))).toBe(kg)
    }
  })

  it('does not drift when toggling units many times', () => {
    let lbs = 4400
    for (let i = 0; i < 1000; i++) lbs = kgToLbs(lbsToKg(lbs))
    expect(lbs).toBeCloseTo(4400, 6)
  })

  it('converts water at 8.34 lbs per US gallon', () => {
    expect(gallonsToLbs(10)).toBeCloseTo(83.4, 10)
    expect(lbsToGallons(83.4)).toBeCloseTo(10, 10)
  })

  it('converts water at 1 kg per litre', () => {
    expect(litresToLbs(100)).toBeCloseTo(220.462262, 5)
  })
})
