import { DEFAULT_CONFIG, type ModelConfig } from './config'
import { statusForTongue, statusForUsage, worstStatus } from './status'
import type { Check, CheckId, RigInputs, RigResult } from './types'

/** Sanitises one numeric input.
 * IN: n, a raw value that may be missing, negative, NaN or infinite.
 * OUT: n when it is a positive finite number, otherwise 0.
 */
const clean = (n: number | undefined): number =>
  n !== undefined && Number.isFinite(n) && n > 0 ? n : 0

/** Builds one usage check: how much of a limit is used, and its status.
 * IN: id, which check this is; used, the amount in lbs (null if it can't be worked out);
 *     limit, the rating in lbs (0 or less means not rated); config, the model config;
 *     estimate, true when the figure is an estimate the UI must label.
 * OUT: a Check with pct (unrounded) and status, or status 'not-rated' when used is null or there is no limit.
 */
function usageCheck(
  id: CheckId,
  used: number | null,
  limit: number,
  config: ModelConfig,
  estimate = false,
): Check {
  if (used === null || limit <= 0) {
    return {
      id,
      used,
      limit: limit > 0 ? limit : null,
      pct: null,
      status: 'not-rated',
      estimate,
    }
  }
  const pct = (used / limit) * 100
  return {
    id,
    used,
    limit,
    pct,
    status: statusForUsage(pct, config.thresholds),
    estimate,
  }
}

/** Runs the whole towing model for one rig.
 * IN: inputs, the truck limits, truck load, trailer weights and setup (all weights in lbs);
 *     config, the thresholds and axle estimate constants (defaults to DEFAULT_CONFIG).
 * OUT: a RigResult with trailer loaded weight, tongue weight, payload used and remaining, curb weight,
 *      combined weight (for GCWR), the estimated rear axle load, each check's usage and status,
 *      and the overall verdict (the worst status of the rated checks).
 * Formulas: trailer loaded = UVW + cargo + fluids; tongue = loaded x tongue %;
 * payload used = passengers + bed + hardware + tongue; combined = curb + payload used + trailer - tongue,
 * because tongue weight is already counted in payload used.
 */
export function calculateRig(
  inputs: RigInputs,
  config: ModelConfig = DEFAULT_CONFIG,
): RigResult {
  const { truck, load, trailer, setup } = inputs

  const trailerLoaded = clean(trailer.uvw) + clean(trailer.cargo) + clean(trailer.fluids)
  const tonguePct = clean(setup.tonguePct)
  const tongueWeight = (trailerLoaded * tonguePct) / 100

  const otherPayload =
    clean(load.passengers) + clean(load.bedCargo) + clean(load.hitchHardware)
  const payloadUsed = otherPayload + tongueWeight

  const payloadCapacity = clean(truck.payloadCapacity)
  const gvwr = clean(truck.gvwr)
  const payloadRemaining = payloadCapacity > 0 ? payloadCapacity - payloadUsed : null

  const curbWeight = gvwr > 0 && payloadCapacity > 0 ? gvwr - payloadCapacity : null
  // Tongue weight is already inside payloadUsed, so take it off the trailer's share.
  const combinedWeight =
    curbWeight === null ? null : curbWeight + payloadUsed + trailerLoaded - tongueWeight

  const { curbShare, payloadShare, hitchLeverage, wdhShare } = config.rearAxle
  const tongueOnRear = tongueWeight * hitchLeverage * (setup.wdh ? 1 - wdhShare : 1)
  const rearAxleLoad =
    curbWeight === null
      ? null
      : curbWeight * curbShare + otherPayload * payloadShare + tongueOnRear

  const tongueCheck: Check =
    trailerLoaded > 0
      ? {
          id: 'tongue',
          used: tongueWeight,
          limit: null,
          pct: tonguePct,
          status: statusForTongue(tonguePct, config.thresholds),
          estimate: false,
        }
      : {
          id: 'tongue',
          used: null,
          limit: null,
          pct: null,
          status: 'not-rated',
          estimate: false,
        }

  const checks: Record<CheckId, Check> = {
    payload: usageCheck('payload', payloadUsed, payloadCapacity, config),
    towRating: usageCheck('towRating', trailerLoaded, clean(truck.maxTow), config),
    gcwr: usageCheck('gcwr', combinedWeight, clean(truck.gcwr), config),
    rearAxle: usageCheck('rearAxle', rearAxleLoad, clean(truck.rearGawr), config, true),
    receiver: usageCheck('receiver', tongueWeight, clean(truck.receiverMax), config),
    tongue: tongueCheck,
  }

  return {
    trailerLoaded,
    tongueWeight,
    payloadUsed,
    payloadRemaining,
    curbWeight,
    combinedWeight,
    rearAxleLoad,
    checks,
    verdict: worstStatus(Object.values(checks).map((c) => c.status)),
  }
}
