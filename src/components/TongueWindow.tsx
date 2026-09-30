import type { CheckStatus } from '../lib/model'

interface TongueWindowProps {
  pct: number
  status: CheckStatus
  min: number
  max: number
}

const SCALE_MAX = 20

/** Mono scale strip from 0 to 20% with the target window shaded and a needle at the current value. */
export function TongueWindow({ pct, status, min, max }: TongueWindowProps) {
  const at = (v: number) => `${(Math.min(Math.max(v, 0), SCALE_MAX) / SCALE_MAX) * 100}%`
  return (
    <div className="tongue-window">
      <div className="tongue-window__strip" aria-hidden="true">
        <span
          className="tongue-window__zone"
          style={{ left: at(min), width: `calc(${at(max)} - ${at(min)})` }}
        />
        <span
          className={`tongue-window__needle stamp-ink--${status}`}
          style={{ left: at(pct) }}
        />
      </div>
      <div className="tongue-window__ticks" aria-hidden="true">
        <span>0%</span>
        <span>10%</span>
        <span>15%</span>
        <span>20%</span>
      </div>
    </div>
  )
}
