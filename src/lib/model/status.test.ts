import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from './config'
import { statusForTongue, statusForUsage } from './status'

const t = DEFAULT_CONFIG.thresholds

describe('statusForUsage', () => {
  it.each([
    [0, 'green'],
    [89.9, 'green'],
    [90, 'amber'],
    [100, 'amber'],
    [100.1, 'red'],
    [250, 'red'],
  ] as const)('%s%% is %s', (pct, expected) => {
    expect(statusForUsage(pct, t)).toBe(expected)
  })
})

describe('statusForTongue', () => {
  it.each([
    [10, 'green'],
    [12, 'green'],
    [15, 'green'],
    [9.9, 'amber'],
    [8, 'amber'],
    [15.1, 'amber'],
    [17, 'amber'],
    [7.9, 'red'],
    [17.1, 'red'],
    [0, 'red'],
  ] as const)('%s%% is %s', (pct, expected) => {
    expect(statusForTongue(pct, t)).toBe(expected)
  })

  it('follows a changed config', () => {
    expect(statusForTongue(20, { ...t, tongueMax: 20 })).toBe('green')
  })
})
