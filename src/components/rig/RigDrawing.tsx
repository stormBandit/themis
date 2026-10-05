import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { RigResult } from '../../lib/model'
import { describeRig, rigGeometry } from '../../lib/rig/geometry'
import { buildRigArt } from './stickerPickupTravel'

interface RigDrawingProps {
  result: RigResult
  wdh: boolean
}

const EASE_MS = 200

/** Eases a number toward its target over EASE_MS, or jumps straight there under reduced motion.
 * IN: target, the value to move toward.
 * OUT: the current in-between value to draw.
 */
function useEased(target: number): number {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    const from = current.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || from === target) {
      current.current = target
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / EASE_MS, 1)
      const eased = 1 - (1 - t) ** 3
      current.current = from + (target - from) * eased
      setValue(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return value
}

/** The sticker-style rig drawing. Squat and nose angle come from the model and ease in. Failing parts
 * show their status ink, and the SVG has a text alternative built from the same statuses. */
export function RigDrawing({ result, wdh }: RigDrawingProps) {
  const titleId = useId()
  const descId = useId()
  const g = rigGeometry(result, wdh)
  const squat = useEased(g.rearSquatPx)
  const angle = useEased(g.hitchAngleDeg)
  const art = useMemo(
    () =>
      buildRigArt({
        squat,
        angle,
        truckBody: g.parts.truckBody,
        truckRear: g.parts.truckRear,
        hitch: g.parts.hitch,
        trailerBody: g.parts.trailerBody,
      }),
    [
      squat,
      angle,
      g.parts.truckBody,
      g.parts.truckRear,
      g.parts.hitch,
      g.parts.trailerBody,
    ],
  )

  return (
    <svg
      className="rig"
      viewBox="0 0 640 260"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>Your rig</title>
      <desc id={descId}>{describeRig(g)}</desc>
      <g dangerouslySetInnerHTML={{ __html: art }} />
    </svg>
  )
}
