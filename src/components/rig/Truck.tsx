import type { CheckStatus } from '../../lib/model'
import type { TruckVariant } from './variants'

interface TruckProps {
  variant: TruckVariant
  /** Rotation in degrees about the front axle. Positive drops the rear. */
  pitchDeg: number
  bodyStatus: CheckStatus
  rearStatus: CheckStatus
  hitchStatus: CheckStatus
}

/** Pickup drawn from its variant. The body pitches about the front axle so the rear squats. */
export function Truck({
  variant,
  pitchDeg,
  bodyStatus,
  rearStatus,
  hitchStatus,
}: TruckProps) {
  const { frontWheel, rearWheel, hitchBall } = variant
  return (
    <g>
      <g
        className="rig-move"
        style={{
          transform: `rotate(${pitchDeg}deg)`,
          transformOrigin: `${frontWheel.x}px ${frontWheel.y}px`,
        }}
      >
        <g className="rig-part" data-status={bodyStatus}>
          <path className="rig-shape" d={variant.bodyPath} />
          <path className="rig-shape" d={variant.windowPath} />
        </g>
        <g className="rig-part" data-status={hitchStatus}>
          <path className="rig-shape" d={variant.receiverPath} />
          <circle className="rig-shape" cx={hitchBall.x} cy={hitchBall.y} r={6} />
        </g>
      </g>
      <g className="rig-part" data-status="not-rated">
        <Wheel cx={frontWheel.x} cy={frontWheel.y} r={frontWheel.r} />
      </g>
      <g className="rig-part" data-status={rearStatus}>
        <Wheel cx={rearWheel.x} cy={rearWheel.y} r={rearWheel.r} />
      </g>
    </g>
  )
}

export function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle className="rig-shape" cx={cx} cy={cy} r={r} />
      <circle className="rig-shape" cx={cx} cy={cy} r={r * 0.3} />
    </>
  )
}
