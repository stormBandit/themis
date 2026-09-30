import { STAMP_WORD } from '../copy'
import { worstStatus } from '../model'
import type { CheckStatus, RigResult } from '../model'
import { RIG_CONFIG } from './config'
import type { RigConfig } from './config'

export type PartId = 'truckBody' | 'truckRear' | 'hitch' | 'trailerBody'

export interface RigGeometry {
  /** How far the rear of the truck drops, in SVG units. */
  rearSquatPx: number
  /** Trailer nose angle in degrees. Positive is nose down, negative is nose up. */
  hitchAngleDeg: number
  /** Status of each drawn part, so the drawing never relies on colour alone. */
  parts: Record<PartId, CheckStatus>
  /** False when nothing could be rated. */
  hasData: boolean
}

/** Angle beyond which the trailer nose is described as up or down, in degrees. */
const LEVEL_DEG = 0.5
/** Squat beyond which the truck is described as squatting, in SVG units. */
const SQUAT_TEXT_PX = 0.5

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n))

/** Turns any number-like value into a safe, non-negative, finite number. */
const clean = (n: number | null | undefined): number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0

/** Works out how the rig should sit, from the model result.
 * IN: result, the calculated rig; wdh, whether a weight distribution hitch is on; cfg, the drawing scales.
 * OUT: squat in SVG units, hitch angle in degrees, a status per part, and whether there was any data.
 *      With no data it is the neutral pose: no squat, no angle, every part 'not-rated'.
 */
export function rigGeometry(
  result: RigResult,
  wdh: boolean,
  cfg: RigConfig = RIG_CONFIG,
): RigGeometry {
  const { checks } = result
  const parts: Record<PartId, CheckStatus> = {
    truckBody: worstStatus([
      checks.towRating.status,
      checks.gcwr.status,
      checks.payload.status,
    ]),
    truckRear: checks.rearAxle.status,
    hitch: checks.receiver.status,
    trailerBody: checks.tongue.status,
  }
  const hasData = Object.values(parts).some((s) => s !== 'not-rated')
  if (!hasData) {
    return {
      rearSquatPx: 0,
      hitchAngleDeg: 0,
      parts: {
        truckBody: 'not-rated',
        truckRear: 'not-rated',
        hitch: 'not-rated',
        trailerBody: 'not-rated',
      },
      hasData: false,
    }
  }

  const { squat, hitch } = cfg
  const usagePct = clean(checks.rearAxle.pct ?? checks.payload.pct)
  const squatRange = squat.maxPct - squat.startPct
  const rearSquatPx =
    squatRange > 0
      ? clamp(((usagePct - squat.startPct) / squatRange) * squat.maxPx, 0, squat.maxPx)
      : 0

  let hitchAngleDeg = 0
  if (checks.tongue.status !== 'not-rated' && hitch.spanPct > 0) {
    const raw = ((clean(checks.tongue.pct) - hitch.midPct) / hitch.spanPct) * hitch.maxDeg
    hitchAngleDeg = clamp(raw, -hitch.maxDeg, hitch.maxDeg)
    if (wdh) hitchAngleDeg *= 1 - hitch.wdhLevelling
  }

  return { rearSquatPx, hitchAngleDeg: hitchAngleDeg || 0, parts, hasData }
}

/** Describes the drawing in words, so it makes sense without seeing it.
 * IN: g, the rig geometry.
 * OUT: one plain-language text alternative. Every part gets a status word (PASS, CLOSE, OVER, NOT RATED).
 *      Squat is mentioned when visible, and the trailer nose is called up, down or level.
 */
export function describeRig(g: RigGeometry): string {
  if (!g.hasData) return 'Truck and trailer. Enter your numbers to see how the rig sits.'

  const squat = g.rearSquatPx > SQUAT_TEXT_PX ? ', squatting' : ''
  const pose =
    g.hitchAngleDeg > LEVEL_DEG
      ? 'pointing slightly down'
      : g.hitchAngleDeg < -LEVEL_DEG
        ? 'pointing slightly up'
        : 'level'

  return [
    'Truck and trailer.',
    `Rear axle: ${STAMP_WORD[g.parts.truckRear]}${squat}.`,
    `Truck: ${STAMP_WORD[g.parts.truckBody]}.`,
    `Hitch: ${STAMP_WORD[g.parts.hitch]}.`,
    `Trailer nose: ${STAMP_WORD[g.parts.trailerBody]}, ${pose}.`,
  ].join(' ')
}
