import type { CheckStatus } from '../lib/model'
import { STAMP_WORD, VERDICT_WORD } from '../lib/copy'

interface StampProps {
  status: CheckStatus
  /** Show the verdict wording (BALANCED) instead of the check wording (PASS). */
  verdict?: boolean
  /** Adds the small EST. mark for estimated values. */
  estimate?: boolean
}

/** Rubber-stamp mark for a status. Remounts on status change so the thump animation replays. */
export function Stamp({ status, verdict = false, estimate = false }: StampProps) {
  const word = verdict ? VERDICT_WORD[status] : STAMP_WORD[status]
  return (
    <span className="stamp-wrap">
      <span
        key={status}
        className={`stamp stamp--${status}${verdict ? ' stamp--verdict' : ''}`}
      >
        {word}
      </span>
      {estimate && <span className="est">EST.</span>}
    </span>
  )
}
