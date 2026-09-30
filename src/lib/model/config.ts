/** Everything tunable about the model lives here. */

export interface ModelConfig {
  thresholds: {
    /** Usage at or above this % is amber. */
    amberFrom: number
    /** Usage above this % is red. */
    redAbove: number
    /** Tongue weight target window, as a % of trailer loaded weight. */
    tongueMin: number
    tongueMax: number
    /** Percentage points outside the window that are still amber. */
    tongueAmberBand: number
  }
  /**
   * Rear axle estimate. These are rough placeholders, to be revisited in a later phase.
   * Users should enter the real figure from their sticker or a certified scale.
   */
  rearAxle: {
    /** Share of curb weight carried by the rear axle. */
    curbShare: number
    /** Share of passengers, bed cargo and hardware carried by the rear axle. */
    payloadShare: number
    /** The hitch sits behind the axle, so tongue weight loads it more than 1:1. */
    hitchLeverage: number
    /** Share of tongue weight a weight distribution hitch moves to the steer and trailer axles. */
    wdhShare: number
  }
}

export const DEFAULT_CONFIG: ModelConfig = {
  thresholds: {
    amberFrom: 90,
    redAbove: 100,
    tongueMin: 10,
    tongueMax: 15,
    tongueAmberBand: 2,
  },
  rearAxle: {
    curbShare: 0.45,
    payloadShare: 0.75,
    hitchLeverage: 1.3,
    wdhShare: 0.5,
  },
}
