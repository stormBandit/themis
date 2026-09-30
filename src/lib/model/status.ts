import type { ModelConfig } from './config'
import type { CheckStatus, Status } from './types'

/** Turns a usage percentage into a traffic-light status.
 * IN: pct, how much of a limit is used (100 = at the limit); t, the thresholds from the config.
 * OUT: 'green' below the amber line, 'amber' from the amber line up to and including 100%, 'red' above it.
 */
export function statusForUsage(pct: number, t: ModelConfig['thresholds']): Status {
  if (pct > t.redAbove) return 'red'
  if (pct >= t.amberFrom) return 'amber'
  return 'green'
}

/** Grades tongue weight against the target window (10–15% by default).
 * IN: pct, tongue weight as a % of trailer loaded weight; t, the thresholds from the config.
 * OUT: 'green' inside the window, 'amber' within the amber band outside it, 'red' beyond that.
 */
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

/** Picks the most severe status, which becomes the overall verdict.
 * IN: statuses, the status of every check.
 * OUT: 'red' beats 'amber' beats 'green'. 'not-rated' checks are ignored, and it is returned only when nothing was rated.
 */
export function worstStatus(statuses: readonly CheckStatus[]): CheckStatus {
  return statuses.reduce<CheckStatus>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    'not-rated',
  )
}
