import type { CheckStatus } from '../../lib/model'
import type { Point, TrailerVariant } from './variants'
import { Wheel } from './Truck'

interface TrailerProps {
  variant: TrailerVariant
  /** Where the hitch ball sits after the truck has pitched. */
  ball: Point
  /** Positive lowers the trailer nose, negative raises it. */
  hitchAngleDeg: number
  status: CheckStatus
}

/** Travel trailer hinged at the hitch ball. The nose rises or drops with tongue weight. */
export function Trailer({ variant, ball, hitchAngleDeg, status }: TrailerProps) {
  return (
    <g
      className="rig-move"
      style={{
        transform: `translate(${ball.x}px, ${ball.y}px) rotate(${-hitchAngleDeg}deg)`,
        transformOrigin: '0 0',
      }}
    >
      <g className="rig-part" data-status={status}>
        <path className="rig-shape" d={variant.bodyPath} />
        <path className="rig-shape" d={variant.tonguePath} />
      </g>
      <g className="rig-part" data-status="not-rated">
        <path className="rig-shape rig-detail" d={variant.detailPath} />
        <path className="rig-shape" d={variant.jackPath} />
        <Wheel cx={variant.wheel.x} cy={variant.wheel.y} r={variant.wheel.r} />
      </g>
    </g>
  )
}
