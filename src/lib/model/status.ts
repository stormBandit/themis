import type { ModelConfig } from './config'
import type { CheckStatus, Status } from './types'

export function statusForUsage(pct: number, t: ModelConfig['thresholds']): Status {
  if (pct > t.redAbove) return 'red'
  if (pct >= t.amberFrom) return 'amber'
  return 'green'
}

export function statusForTongue(pct: number, t: ModelConfig['thresholds']): Status {
  if (pct >= t.tongueMin && pct <= t.tongueMax) return 'green'
  const distance = pct < t.tongueMin ? t.tongueMin - pct : pct - t.tongueMax
  return distance <= t.tongueAmberBand ? 'amber' : 'red'
}

const SEVERITY: Record<CheckStatus, number> = {
  'not-rated': -1,
  green: 0,
  amber: 1,
  red: 2,
}

/** Worst status wins. `not-rated` only when nothing was rated. */
export function worstStatus(statuses: readonly CheckStatus[]): CheckStatus {
  return statuses.reduce<CheckStatus>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    'not-rated',
  )
}
