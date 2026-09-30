/** Every weight in this module is in pounds (lbs). Convert only at the edges. */

export type Status = 'green' | 'amber' | 'red'
/** `not-rated` means the limit wasn't entered, so the check is skipped. */
export type CheckStatus = Status | 'not-rated'

export type CheckId =
  'payload' | 'towRating' | 'gcwr' | 'rearAxle' | 'receiver' | 'tongue'

/** Limits from the truck. A missing or zero limit means "not rated". */
export interface TruckSpec {
  gvwr?: number
  payloadCapacity?: number
  maxTow?: number
  gcwr?: number
  rearGawr?: number
  /** Receiver max tongue weight. */
  receiverMax?: number
}

export interface LoadInputs {
  passengers?: number
  bedCargo?: number
  hitchHardware?: number
}

export interface TrailerInputs {
  /** Dry weight (UVW). */
  uvw?: number
  cargo?: number
  fluids?: number
}

export interface SetupInputs {
  /** Tongue weight as a percentage of trailer loaded weight, e.g. 12. */
  tonguePct?: number
  wdh?: boolean
}

/** Numbers the user weighed on a certified scale. They replace the model's estimates. */
export interface MeasuredInputs {
  /** Loaded rear axle weight, in lbs. */
  rearAxleLoad?: number
}

export interface RigInputs {
  truck: TruckSpec
  load: LoadInputs
  trailer: TrailerInputs
  setup: SetupInputs
  measured?: MeasuredInputs
}

export interface Check {
  id: CheckId
  /** Amount used, in lbs (for `tongue` this is the tongue %). */
  used: number | null
  /** The limit, in lbs (for `tongue` this is the target window's upper edge). */
  limit: number | null
  /** Usage as a percentage of the limit. Unrounded. For `tongue`, the tongue %. */
  pct: number | null
  status: CheckStatus
  /** True when the number is an estimate and must be labelled so in the UI. */
  estimate: boolean
}

export interface RigResult {
  trailerLoaded: number
  tongueWeight: number
  payloadUsed: number
  /** Null when payload capacity isn't entered. */
  payloadRemaining: number | null
  /** GVWR minus payload capacity. Null when either isn't entered. */
  curbWeight: number | null
  /** Truck + payload + trailer, without double-counting tongue weight. Null without curb weight. */
  combinedWeight: number | null
  /** Rear axle load: the measured figure if given, otherwise the estimate. Null with neither. */
  rearAxleLoad: number | null
  /** Where `rearAxleLoad` came from. */
  rearAxleSource: 'measured' | 'estimate' | null
  checks: Record<CheckId, Check>
  /** Worst status of all rated checks, or `not-rated` when nothing could be checked. */
  verdict: CheckStatus
}
