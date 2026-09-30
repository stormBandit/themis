import { useId } from 'react'
import type { RigResult, CheckStatus } from '../../lib/model'
import { rigGeometry, describeRig } from '../../lib/rig/geometry'
import { STAMP_WORD } from '../../lib/copy'
import { Truck } from './Truck'
import { Trailer } from './Trailer'
import { PICKUP, TRAVEL_TRAILER } from './variants'
import type { Point } from './variants'

interface RigDrawingProps {
  result: RigResult
  wdh: boolean
}

const GROUND_Y = 220

/** Rotates a point about a pivot. Used to find where the hitch ball ends up when the truck pitches. */
function rotateAbout(p: Point, pivot: Point, deg: number): Point {
  const a = (deg * Math.PI) / 180
  const dx = p.x - pivot.x
  const dy = p.y - pivot.y
  return {
    x: pivot.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: pivot.y + dx * Math.sin(a) + dy * Math.cos(a),
  }
}

function Label({
  x,
  anchor,
  name,
  status,
}: {
  x: number
  anchor: 'start' | 'end'
  name: string
  status: CheckStatus
}) {
  return (
    <text className="rig-label" x={x} y={GROUND_Y + 28} textAnchor={anchor}>
      {name} {STAMP_WORD[status]}
    </text>
  )
}

/** Truck and trailer line art. Squat and hitch angle come from the model; failing parts are tinted. */
export function RigDrawing({ result, wdh }: RigDrawingProps) {
  const titleId = useId()
  const descId = useId()
  const g = rigGeometry(result, wdh)
  const truck = PICKUP
  const wheelbase = truck.rearWheel.x - truck.frontWheel.x
  const pitchDeg = (Math.atan2(g.rearSquatPx, wheelbase) * 180) / Math.PI
  const ball = rotateAbout(truck.hitchBall, truck.frontWheel, pitchDeg)

  return (
    <svg
      className="rig"
      viewBox="0 0 640 260"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>Your rig</title>
      <desc id={descId}>{describeRig(g)}</desc>
      <line className="rig-ground" x1="0" y1={GROUND_Y} x2="640" y2={GROUND_Y} />
      <Truck
        variant={truck}
        pitchDeg={pitchDeg}
        bodyStatus={g.parts.truckBody}
        rearStatus={g.parts.truckRear}
        hitchStatus={g.parts.hitch}
      />
      <Trailer
        variant={TRAVEL_TRAILER}
        ball={ball}
        hitchAngleDeg={g.hitchAngleDeg}
        status={g.parts.trailerBody}
      />
      <Label x={16} anchor="start" name="TRUCK" status={g.parts.truckBody} />
      <Label x={296} anchor="end" name="REAR AXLE" status={g.parts.truckRear} />
      <Label x={312} anchor="start" name="HITCH" status={g.parts.hitch} />
      <Label x={624} anchor="end" name="TRAILER" status={g.parts.trailerBody} />
    </svg>
  )
}
