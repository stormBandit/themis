import { describe, expect, it } from 'vitest'
import { calculateRig } from '../model'
import type { CheckId, CheckStatus, RigInputs, RigResult } from '../model'
import { describeRig, rigGeometry } from './geometry'
import type { RigGeometry } from './geometry'

const FIXTURE: RigInputs = {
  truck: {
    payloadCapacity: 1650,
    maxTow: 8500,
    receiverMax: 850,
    gvwr: 7000,
    rearGawr: 4000,
    gcwr: 14000,
  },
  load: { passengers: 350, bedCargo: 150, hitchHardware: 75 },
  trailer: { uvw: 3800, cargo: 600 },
  setup: { tonguePct: 12 },
}

const build = (over: Partial<RigInputs> = {}): RigResult =>
  calculateRig({ ...FIXTURE, ...over })

/** Copy a result with some checks overridden. */
function withChecks(
  base: RigResult,
  over: Partial<Record<CheckId, Partial<RigResult['checks'][CheckId]>>>,
): RigResult {
  const checks = { ...base.checks }
  for (const id of Object.keys(over) as CheckId[]) {
    checks[id] = { ...checks[id], ...over[id] }
  }
  return { ...base, checks }
}

const rated = build()
const axlePct = (pct: number | null): RigResult =>
  withChecks(rated, { rearAxle: { pct, status: 'green' } })
const tonguePct = (pct: number): RigResult =>
  withChecks(rated, { tongue: { pct, status: 'green' } })

describe('rigGeometry', () => {
  it('gives the neutral pose with zero input', () => {
    const g = rigGeometry(
      calculateRig({ truck: {}, load: {}, trailer: {}, setup: {} }),
      false,
    )
    expect(g).toEqual({
      rearSquatPx: 0,
      hitchAngleDeg: 0,
      parts: {
        truckBody: 'not-rated',
        truckRear: 'not-rated',
        hitch: 'not-rated',
        trailerBody: 'not-rated',
      },
      hasData: false,
    })
  })

  it('has data for the fixture', () => {
    expect(rigGeometry(rated, false).hasData).toBe(true)
  })

  it('squats 0 at 50%, rises between, peaks at 120% and clamps above', () => {
    expect(rigGeometry(axlePct(50), false).rearSquatPx).toBe(0)
    expect(rigGeometry(axlePct(30), false).rearSquatPx).toBe(0)
    const samples = [60, 80, 100, 110].map(
      (p) => rigGeometry(axlePct(p), false).rearSquatPx,
    )
    expect(samples[0]).toBeGreaterThan(0)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThan(samples[i - 1] as number)
    }
    expect(rigGeometry(axlePct(85), false).rearSquatPx).toBeCloseTo(5)
    expect(rigGeometry(axlePct(120), false).rearSquatPx).toBe(10)
    expect(rigGeometry(axlePct(300), false).rearSquatPx).toBe(10)
  })

  it('falls back to the payload pct when the rear axle has no pct', () => {
    const r = withChecks(rated, { rearAxle: { pct: null }, payload: { pct: 85 } })
    expect(rigGeometry(r, false).rearSquatPx).toBeCloseTo(5)
    const none = withChecks(rated, { rearAxle: { pct: null }, payload: { pct: null } })
    expect(rigGeometry(none, false).rearSquatPx).toBe(0)
  })

  it('points the nose by tongue weight: up when light, level at 12.5%, down when heavy', () => {
    expect(rigGeometry(tonguePct(8), false).hitchAngleDeg).toBeLessThan(0)
    expect(rigGeometry(tonguePct(8), false).hitchAngleDeg).toBeCloseTo(-2.7)
    expect(rigGeometry(tonguePct(12.5), false).hitchAngleDeg).toBe(0)
    expect(rigGeometry(tonguePct(18), false).hitchAngleDeg).toBeGreaterThan(0)
    expect(rigGeometry(tonguePct(18), false).hitchAngleDeg).toBeCloseTo(3.3)
  })

  it('clamps the angle at both ends', () => {
    expect(rigGeometry(tonguePct(40), false).hitchAngleDeg).toBe(6)
    expect(rigGeometry(tonguePct(0), false).hitchAngleDeg).toBe(-6)
  })

  it('gives 0 angle when the tongue is not rated', () => {
    const r = withChecks(rated, { tongue: { pct: null, status: 'not-rated' } })
    expect(rigGeometry(r, false).hitchAngleDeg).toBe(0)
  })

  it('shrinks the angle with a WDH but leaves squat alone', () => {
    const r = withChecks(rated, {
      tongue: { pct: 18, status: 'green' },
      rearAxle: { pct: 100, status: 'green' },
    })
    const off = rigGeometry(r, false)
    const on = rigGeometry(r, true)
    expect(on.hitchAngleDeg).toBeCloseTo(off.hitchAngleDeg * 0.4)
    expect(on.rearSquatPx).toBe(off.rearSquatPx)
  })

  it('maps statuses to parts', () => {
    const r = withChecks(rated, {
      towRating: { status: 'green' },
      gcwr: { status: 'amber' },
      payload: { status: 'green' },
      rearAxle: { status: 'red' },
      receiver: { status: 'amber' },
      tongue: { status: 'green' },
    })
    expect(rigGeometry(r, false).parts).toEqual({
      truckBody: 'amber',
      truckRear: 'red',
      hitch: 'amber',
      trailerBody: 'green',
    })
  })

  it('takes the worst of tow, gcwr and payload for the truck body', () => {
    const cases: [CheckId, CheckStatus][] = [
      ['towRating', 'red'],
      ['gcwr', 'red'],
      ['payload', 'red'],
    ]
    for (const [id, status] of cases) {
      const r = withChecks(rated, {
        towRating: { status: 'green' },
        gcwr: { status: 'green' },
        payload: { status: 'green' },
        [id]: { status },
      })
      expect(rigGeometry(r, false).parts.truckBody).toBe('red')
    }
  })

  it('never produces NaN for non-finite or negative numbers', () => {
    const bad = [Number.NaN, -50, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
    for (const v of bad) {
      const r = withChecks(rated, {
        rearAxle: { pct: v },
        tongue: { pct: v },
      })
      const g = rigGeometry(r, true)
      expect(Number.isNaN(g.rearSquatPx)).toBe(false)
      expect(Number.isNaN(g.hitchAngleDeg)).toBe(false)
      expect(Number.isFinite(g.rearSquatPx)).toBe(true)
      expect(Number.isFinite(g.hitchAngleDeg)).toBe(true)
      expect(g.rearSquatPx).toBeGreaterThanOrEqual(0)
    }
    const fb = withChecks(rated, {
      rearAxle: { pct: null },
      payload: { pct: Number.NaN },
    })
    expect(rigGeometry(fb, false).rearSquatPx).toBe(0)
  })

  it('gives the same geometry for measured and estimated axle loads that match', () => {
    const estimated = build()
    const measured = build({ measured: { rearAxleLoad: estimated.rearAxleLoad ?? 0 } })
    expect(measured.rearAxleSource).toBe('measured')
    expect(rigGeometry(measured, false)).toEqual(rigGeometry(estimated, false))
  })
})

describe('describeRig', () => {
  const geo = (over: Partial<RigGeometry> = {}): RigGeometry => ({
    rearSquatPx: 0,
    hitchAngleDeg: 0,
    parts: {
      truckBody: 'green',
      truckRear: 'green',
      hitch: 'green',
      trailerBody: 'green',
    },
    hasData: true,
    ...over,
  })

  it('asks for numbers when there is no data', () => {
    expect(describeRig(geo({ hasData: false }))).toBe(
      'Truck and trailer. Enter your numbers to see how the rig sits.',
    )
  })

  it('mentions squat and uses the stamp word for a red rear axle', () => {
    const text = describeRig(
      geo({ rearSquatPx: 8, parts: { ...geo().parts, truckRear: 'red' } }),
    )
    expect(text).toContain('Rear axle: OVER, squatting.')
  })

  it('describes nose up, nose down and level', () => {
    const parts = { ...geo().parts, hitch: 'amber' as const }
    expect(describeRig(geo({ hitchAngleDeg: -3, parts }))).toBe(
      'Truck and trailer. Rear axle: PASS. Truck: PASS. Hitch: CLOSE. Trailer nose: PASS, pointing slightly up.',
    )
    expect(describeRig(geo({ hitchAngleDeg: 3 }))).toContain('pointing slightly down')
    expect(describeRig(geo({ hitchAngleDeg: 0.4 }))).toContain(
      'Trailer nose: PASS, level.',
    )
  })

  it('says NOT RATED for parts without a limit and skips squat when tiny', () => {
    const text = describeRig(
      geo({ rearSquatPx: 0.3, parts: { ...geo().parts, truckRear: 'not-rated' } }),
    )
    expect(text).toContain('Rear axle: NOT RATED.')
    expect(text).not.toContain('squatting')
  })
})
