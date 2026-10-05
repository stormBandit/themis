import { describe, expect, it } from 'vitest'
import { buildRigArt, type RigArtParams } from './stickerPickupTravel'

const green: RigArtParams = {
  squat: 0,
  angle: 0,
  truckBody: 'green',
  truckRear: 'green',
  hitch: 'green',
  trailerBody: 'green',
}

describe('buildRigArt', () => {
  it('draws each part with its status', () => {
    const art = buildRigArt({
      ...green,
      truckRear: 'red',
      trailerBody: 'amber',
      hitch: 'not-rated',
    })
    expect(art).toContain('data-part="truckBody" data-status="green"')
    expect(art).toContain('data-part="truckRear" data-status="red"')
    expect(art).toContain('data-part="hitch" data-status="not-rated"')
    expect(art).toContain('data-part="trailerBody" data-status="amber"')
  })

  it('labels every part with a status word', () => {
    const art = buildRigArt({
      ...green,
      truckBody: 'red',
      trailerBody: 'amber',
      hitch: 'not-rated',
    })
    expect(art).toContain('TRUCK OVER')
    expect(art).toContain('REAR PASS')
    expect(art).toContain('HITCH N/A')
    expect(art).toContain('TRAILER CLOSE')
  })

  it('shows the sweat drop only when the rear axle is over', () => {
    expect(buildRigArt(green)).not.toContain('class="drop')
    expect(buildRigArt({ ...green, truckRear: 'red' })).toContain('class="drop')
  })

  it('pitches the truck about the front axle in proportion to the squat', () => {
    expect(buildRigArt(green)).toContain('rotate(0 90 198)')
    const squatted = buildRigArt({ ...green, squat: 10 })
    expect(squatted).toMatch(/rotate\(3\.58 90 198\)/)
  })

  it('tilts the trailer by minus the nose angle', () => {
    expect(buildRigArt({ ...green, angle: 4 })).toContain('rotate(-4)')
    expect(buildRigArt({ ...green, angle: -4 })).toContain('rotate(4)')
  })

  it('keeps the trailer wheel on the ground line however the nose tilts', () => {
    for (const angle of [-6, 0, 6]) {
      const art = buildRigArt({ ...green, squat: 10, angle })
      expect(art).toContain('cx="492" cy="198"')
      expect(art).not.toContain('NaN')
    }
  })
})
