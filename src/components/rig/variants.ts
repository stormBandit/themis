/** Shape data for each truck and trailer variant. Later phases add variants here. */

export interface Point {
  x: number
  y: number
}

export interface Wheel extends Point {
  r: number
}

export interface TruckVariant {
  id: 'pickup'
  bodyPath: string
  windowPath: string
  frontWheel: Wheel
  rearWheel: Wheel
  /** Centre of the hitch ball, in the truck's unrotated frame. */
  hitchBall: Point
  receiverPath: string
}

export interface TrailerVariant {
  id: 'travel'
  /** Everything is relative to the hitch ball at 0,0. */
  tonguePath: string
  bodyPath: string
  detailPath: string
  wheel: Wheel
  jackPath: string
}

export const PICKUP: TruckVariant = {
  id: 'pickup',
  bodyPath:
    'M16 198 V170 L74 160 L112 122 H176 L186 160 H296 V198 H272 A22 22 0 0 0 228 198 H112 A22 22 0 0 0 68 198 Z',
  windowPath: 'M120 130 H170 L176 154 H104 Z',
  frontWheel: { x: 90, y: 198, r: 22 },
  rearWheel: { x: 250, y: 198, r: 22 },
  hitchBall: { x: 314, y: 182 },
  receiverPath: 'M284 188 H316 V196 H284 Z M314 188 V182',
}

export const TRAVEL_TRAILER: TrailerVariant = {
  id: 'travel',
  tonguePath: 'M0 0 L44 -10',
  bodyPath: 'M44 -104 H296 V-4 H44 Z',
  detailPath: 'M70 -84 H130 V-50 H70 Z M240 -104 V-4 M60 -104 Q170 -116 280 -104',
  wheel: { x: 190, y: 14, r: 22 },
  jackPath: 'M52 -4 V30 M44 30 H60',
}
