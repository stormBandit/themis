import type { Check } from '../lib/model'
import type { Unit } from '../lib/form/format'
import { formatWeight, unitLabel } from '../lib/form/format'
import { CHECK_LABELS, ESTIMATE_NOTE, NEEDS_HINT } from '../lib/copy'
import { Stamp } from './Stamp'

interface TicketLineProps {
  check: Check
  unit: Unit
}

/** One result line: label, dot leader, stamp, then figures and a usage bar with a 90% tick. */
export function TicketLine({ check, unit }: TicketLineProps) {
  const rated = check.status !== 'not-rated' && check.pct !== null
  const fill = rated ? Math.min(check.pct ?? 0, 100) : 0
  return (
    <li className="line">
      <div className="line__head">
        <span className="line__label">{CHECK_LABELS[check.id]}</span>
        <span className="line__leader" aria-hidden="true" />
        <Stamp status={check.status} estimate={check.estimate && rated} />
      </div>
      {rated ? (
        <>
          <p className="line__figures">
            <span className="line__used">{formatWeight(check.used ?? 0, unit)}</span>
            <span className="line__of">
              / {formatWeight(check.limit ?? 0, unit)} {unitLabel(unit)}
            </span>
            <span className="line__pct">{Math.round(check.pct ?? 0)}%</span>
          </p>
          <div className="bar" aria-hidden="true">
            <span
              className={`bar__fill stamp-ink--${check.status}`}
              style={{ width: `${fill}%` }}
            />
            <span className="bar__tick" />
          </div>
          {check.estimate && <p className="line__note">{ESTIMATE_NOTE}</p>}
        </>
      ) : (
        <p className="line__note">{NEEDS_HINT[check.id]}</p>
      )}
    </li>
  )
}
