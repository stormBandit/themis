/** Tuning for the rig drawing. All of these scales are placeholders to revisit once the drawing is on screen. */
export interface RigConfig {
  /** Rear squat, in SVG units. Deliberately exaggerated, because real squat is only 1 to 2 inches. */
  squat: {
    /** Rear axle usage (%) at or below which there is no squat. */
    startPct: number
    /** Rear axle usage (%) at which squat reaches `maxPx`. Squat is clamped above this. */
    maxPct: number
    /** Largest squat, in SVG units. */
    maxPx: number
  }
  /** Trailer nose angle, driven by tongue weight. Positive is nose down, negative is nose up. */
  hitch: {
    /** Tongue weight (%) that sits level, with no angle. */
    midPct: number
    /** Change in tongue weight (%) that moves the angle by `maxDeg`. */
    spanPct: number
    /** Largest angle in either direction, in degrees. */
    maxDeg: number
    /** Share of the angle removed when a weight distribution hitch is on (0.6 means 60% levelled). */
    wdhLevelling: number
  }
}

export const RIG_CONFIG: RigConfig = {
  squat: { startPct: 50, maxPct: 120, maxPx: 10 },
  hitch: { midPct: 12.5, spanPct: 10, maxDeg: 6, wdhLevelling: 0.6 },
}
