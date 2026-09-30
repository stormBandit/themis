import { DEFAULT_CONFIG, type ModelConfig } from './config'
import { statusForTongue, statusForUsage, worstStatus } from './status'
import type { Check, CheckId, RigInputs, RigResult } from './types'

/** Missing, negative and non-finite entries count as zero. */
const clean = (n: number | undefined): number =>
  n !== undefined && Number.isFinite(n) && n > 0 ? n : 0

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
