import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from './config'
import { calculateRig } from './calculate'
import type { RigInputs } from './types'

/** Hitch & Axle example from the PRD. */
const fixture: RigInputs = {
  truck: { payloadCapacity: 1650, maxTow: 8500, receiverMax: 850 },
  load: { passengers: 350, bedCargo: 150, hitchHardware: 75 },
  trailer: { uvw: 3800, cargo: 600 },
  setup: { tonguePct: 12, wdh: true },
}

const withTruck = (extra: RigInputs['truck'], base = fixture): RigInputs => ({
  ...base,
  truck: { ...base.truck, ...extra },
})

describe('Hitch & Axle fixture', () => {
  const r = calculateRig(fixture)

  it('computes weights', () => {
    expect(r.trailerLoaded).toBe(4400)
    expect(r.tongueWeight).toBe(528)
    expect(r.payloadUsed).toBe(1103)
    expect(r.payloadRemaining).toBe(547)
  })

  it('computes usage percentages', () => {
    expect(Math.round(r.checks.payload.pct ?? NaN)).toBe(67)
    expect(Math.round(r.checks.towRating.pct ?? NaN)).toBe(52)
    expect(Math.round(r.checks.receiver.pct ?? NaN)).toBe(62)
  })

  it('is green overall, with unrated checks skipped', () => {
    expect(r.checks.payload.status).toBe('green')
    expect(r.checks.towRating.status).toBe('green')
    expect(r.checks.receiver.status).toBe('green')
    expect(r.checks.tongue.status).toBe('green')
    expect(r.checks.gcwr.status).toBe('not-rated')
    expect(r.checks.rearAxle.status).toBe('not-rated')
    expect(r.verdict).toBe('green')
  })
})

describe('GCWR', () => {
  // curb = 7000 - 1650 = 5350
  // combined = 5350 + 1103 + 4400 - 528 (tongue is already inside payload used) = 10325
  const r = calculateRig(withTruck({ gvwr: 7000, gcwr: 14000 }))

  it('derives curb and combined weight without double-counting tongue', () => {
    expect(r.curbWeight).toBe(5350)
    expect(r.combinedWeight).toBe(10325)
  })

  it('uses combined weight against GCWR', () => {
    expect(r.checks.gcwr.pct).toBeCloseTo((10325 / 14000) * 100, 10)
    expect(r.checks.gcwr.status).toBe('green')
  })

  it('equals curb + passengers + bed + hardware + trailer loaded', () => {
    expect(r.combinedWeight).toBe(5350 + 350 + 150 + 75 + 4400)
  })

  it('goes red when over GCWR', () => {
    expect(calculateRig(withTruck({ gvwr: 7000, gcwr: 10000 })).checks.gcwr.status).toBe(
      'red',
    )
  })

  it('is not rated without GVWR', () => {
    const noGvwr = calculateRig(withTruck({ gcwr: 14000 }))
    expect(noGvwr.curbWeight).toBeNull()
    expect(noGvwr.combinedWeight).toBeNull()
    expect(noGvwr.checks.gcwr.status).toBe('not-rated')
  })
})

describe('rear axle estimate', () => {
  const { curbShare, payloadShare, hitchLeverage, wdhShare } = DEFAULT_CONFIG.rearAxle
  const inputs = withTruck({ gvwr: 7000, rearGawr: 4000 })

  it('is labelled an estimate', () => {
    expect(calculateRig(inputs).checks.rearAxle.estimate).toBe(true)
    expect(calculateRig(inputs).checks.payload.estimate).toBe(false)
  })

  it('moves a share of tongue weight off the rear axle with WDH on', () => {
    const on = calculateRig(inputs)
    const expected =
      5350 * curbShare + 575 * payloadShare + 528 * hitchLeverage * (1 - wdhShare)
    expect(on.rearAxleLoad).toBeCloseTo(expected, 8)
    expect(on.rearAxleLoad).toBeCloseTo(3181.95, 8)
  })

  it('carries the full leveraged tongue weight with WDH off', () => {
    const off = calculateRig({ ...inputs, setup: { ...inputs.setup, wdh: false } })
    expect(off.rearAxleLoad).toBeCloseTo(3525.15, 8)
    expect(off.checks.rearAxle.pct).toBeCloseTo((3525.15 / 4000) * 100, 8)
  })

  it('WDH changes only the axle estimate', () => {
    const on = calculateRig(inputs)
    const off = calculateRig({ ...inputs, setup: { ...inputs.setup, wdh: false } })
    expect(off.tongueWeight).toBe(on.tongueWeight)
    expect(off.payloadUsed).toBe(on.payloadUsed)
    expect(off.combinedWeight).toBe(on.combinedWeight)
  })

  it('is not rated without a rear GAWR', () => {
    const r = calculateRig(withTruck({ gvwr: 7000 }))
    expect(r.rearAxleLoad).not.toBeNull()
    expect(r.checks.rearAxle.status).toBe('not-rated')
  })

  it('follows a changed config', () => {
    const r = calculateRig(inputs, {
      ...DEFAULT_CONFIG,
      rearAxle: { ...DEFAULT_CONFIG.rearAxle, wdhShare: 0 },
    })
    expect(r.rearAxleLoad).toBeCloseTo(3525.15, 8)
  })
})

describe('fluids and optional fields', () => {
  it('adds fluids to trailer loaded weight', () => {
    const r = calculateRig({
      ...fixture,
      trailer: { uvw: 3800, cargo: 600, fluids: 200 },
    })
    expect(r.trailerLoaded).toBe(4600)
    expect(r.tongueWeight).toBeCloseTo(552, 10)
  })

  it('treats missing optional fields as zero', () => {
    const r = calculateRig({
      truck: { payloadCapacity: 1650 },
      load: {},
      trailer: { uvw: 3000 },
      setup: { tonguePct: 12 },
    })
    expect(r.trailerLoaded).toBe(3000)
    expect(r.payloadUsed).toBeCloseTo(360, 10)
    expect(r.checks.towRating.status).toBe('not-rated')
    expect(r.checks.receiver.status).toBe('not-rated')
  })

  it('treats a missing tongue % as zero (and flags it)', () => {
    const r = calculateRig({ ...fixture, setup: {} })
    expect(r.tongueWeight).toBe(0)
    expect(r.checks.tongue.status).toBe('red')
  })
})

describe('all zeros', () => {
  const r = calculateRig({ truck: {}, load: {}, trailer: {}, setup: {} })

  it('does not divide by zero or produce NaN', () => {
    expect(r.trailerLoaded).toBe(0)
    expect(r.tongueWeight).toBe(0)
    expect(r.payloadUsed).toBe(0)
    expect(r.payloadRemaining).toBeNull()
    for (const check of Object.values(r.checks)) {
      expect(Number.isNaN(check.pct ?? 0)).toBe(false)
      expect(check.status).toBe('not-rated')
    }
  })

  it('has no verdict when nothing is rated', () => {
    expect(r.verdict).toBe('not-rated')
  })

  it('treats explicit zero limits as not rated', () => {
    const zeros = calculateRig({
      ...fixture,
      truck: {
        payloadCapacity: 0,
        maxTow: 0,
        receiverMax: 0,
        gcwr: 0,
        rearGawr: 0,
        gvwr: 0,
      },
    })
    expect(zeros.checks.payload.status).toBe('not-rated')
    expect(zeros.checks.towRating.status).toBe('not-rated')
    expect(zeros.checks.receiver.status).toBe('not-rated')
  })
})

describe('over-limit cases', () => {
  it('flags payload alone', () => {
    const r = calculateRig(withTruck({ payloadCapacity: 1000 }))
    expect(r.checks.payload.status).toBe('red')
    expect(r.payloadRemaining).toBe(-103)
    expect(r.checks.towRating.status).toBe('green')
    expect(r.verdict).toBe('red')
  })

  it('flags tow rating alone', () => {
    const r = calculateRig(withTruck({ maxTow: 4000 }))
    expect(r.checks.towRating.status).toBe('red')
    expect(r.checks.payload.status).toBe('green')
    expect(r.verdict).toBe('red')
  })

  it('flags receiver alone', () => {
    const r = calculateRig(withTruck({ receiverMax: 500 }))
    expect(r.checks.receiver.status).toBe('red')
    expect(r.verdict).toBe('red')
  })

  it('flags rear axle alone', () => {
    const r = calculateRig(withTruck({ gvwr: 7000, rearGawr: 3000 }))
    expect(r.checks.rearAxle.status).toBe('red')
    expect(r.verdict).toBe('red')
  })

  it('flags tongue % alone', () => {
    const r = calculateRig({ ...fixture, setup: { tonguePct: 6, wdh: true } })
    expect(r.checks.tongue.status).toBe('red')
    expect(r.checks.payload.status).toBe('green')
    expect(r.verdict).toBe('red')
  })
})

describe('verdict', () => {
  it('is amber when the worst check is amber', () => {
    // payload used 1103 of 1200 = 91.9%
    const r = calculateRig(withTruck({ payloadCapacity: 1200 }))
    expect(r.checks.payload.status).toBe('amber')
    expect(r.verdict).toBe('amber')
  })

  it('ignores not-rated checks', () => {
    const r = calculateRig({ ...fixture, truck: { maxTow: 8500 } })
    expect(r.checks.payload.status).toBe('not-rated')
    expect(r.verdict).toBe('green')
  })

  it('red beats amber', () => {
    const r = calculateRig(withTruck({ payloadCapacity: 1200, maxTow: 4000 }))
    expect(r.verdict).toBe('red')
  })
})

describe('tongue %', () => {
  it('reports tongue % and its status against the 10–15% window', () => {
    const r = calculateRig({ ...fixture, setup: { tonguePct: 16, wdh: false } })
    expect(r.checks.tongue.pct).toBeCloseTo(16, 10)
    expect(r.checks.tongue.status).toBe('amber')
  })

  it('is not rated when the trailer weighs nothing', () => {
    const r = calculateRig({ ...fixture, trailer: {} })
    expect(r.checks.tongue.status).toBe('not-rated')
  })
})

describe('input hygiene', () => {
  it('does not mutate inputs', () => {
    const copy = structuredClone(fixture)
    calculateRig(fixture)
    expect(fixture).toEqual(copy)
  })

  it('treats negative and NaN inputs as zero', () => {
    const r = calculateRig({
      ...fixture,
      load: { passengers: -50, bedCargo: Number.NaN, hitchHardware: 75 },
    })
    expect(r.payloadUsed).toBe(75 + 528)
  })
})

describe('measured rear axle load', () => {
  const base = withTruck({ gvwr: 7000, rearGawr: 4000 })
  const measured = (lbs: number): RigInputs => ({
    ...base,
    measured: { rearAxleLoad: lbs },
  })

  it('replaces the estimate and is no longer labelled an estimate', () => {
    const r = calculateRig(measured(3400))
    expect(r.rearAxleLoad).toBe(3400)
    expect(r.rearAxleSource).toBe('measured')
    expect(r.checks.rearAxle.estimate).toBe(false)
    expect(r.checks.rearAxle.pct).toBeCloseTo(85, 10)
    expect(r.checks.rearAxle.status).toBe('green')
  })

  it('flags an over-limit measured load', () => {
    const r = calculateRig(measured(4200))
    expect(r.checks.rearAxle.status).toBe('red')
    expect(r.verdict).toBe('red')
  })

  it('works without GVWR and payload capacity', () => {
    const r = calculateRig({
      truck: { rearGawr: 4000 },
      load: {},
      trailer: {},
      setup: {},
      measured: { rearAxleLoad: 3900 },
    })
    expect(r.curbWeight).toBeNull()
    expect(r.checks.rearAxle.status).toBe('amber')
    expect(r.rearAxleSource).toBe('measured')
  })

  it('falls back to the estimate when the measurement is blank, zero or invalid', () => {
    for (const value of [undefined, 0, -5, Number.NaN]) {
      const r = calculateRig({ ...base, measured: { rearAxleLoad: value } })
      expect(r.rearAxleSource).toBe('estimate')
      expect(r.checks.rearAxle.estimate).toBe(true)
    }
    expect(calculateRig(base).rearAxleSource).toBe('estimate')
  })

  it('has no source when there is nothing to estimate from', () => {
    const r = calculateRig({ truck: {}, load: {}, trailer: {}, setup: {} })
    expect(r.rearAxleSource).toBeNull()
  })

  it('does not change any other result', () => {
    const a = calculateRig(base)
    const b = calculateRig(measured(3400))
    expect(b.payloadUsed).toBe(a.payloadUsed)
    expect(b.combinedWeight).toBe(a.combinedWeight)
    expect(b.checks.payload).toEqual(a.checks.payload)
  })
})
