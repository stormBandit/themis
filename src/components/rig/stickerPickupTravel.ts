import type { CheckStatus } from '../../lib/model'

/**
 * Sticker-style art for a pickup towing a travel trailer. This is one "variant": later phases add
 * more files like this one (other trailer types, truck classes) with the same params and contract.
 *
 * Contract: viewBox 0 0 640 260, ground at y=220, truck faces left, front wheel centre (90,198),
 * rear wheel centre (250,198), hitch ball near (314,182). Each part is a <g class="part"
 * data-part data-status>. Only numbers and status words are interpolated, never user text.
 */

export interface RigArtParams {
  /** Rear squat in drawing units. The truck body pitches about the front axle. */
  squat: number
  /** Trailer nose angle in degrees. Positive lowers the nose, negative raises it. */
  angle: number
  truckBody: CheckStatus
  truckRear: CheckStatus
  hitch: CheckStatus
  trailerBody: CheckStatus
}

const LABEL_WORD: Record<CheckStatus, string> = {
  green: 'PASS',
  amber: 'CLOSE',
  red: 'OVER',
  'not-rated': 'N/A',
}

const WHEELBASE = 160
const TRAILER_WHEEL_X = 492
const BODY =
  'M28 184 L28 162 Q28 150 40 148 L100 140 L118 112 Q122 102 134 102 L196 102 Q208 102 210 114 L214 138 L286 138 Q296 138 298 148 L298 184 L277.7 184 A31 31 0 0 0 222.3 184 L117.7 184 A31 31 0 0 0 62.3 184 Z'

const round = (n: number): number => Math.round(n * 100) / 100

/** Draws one wheel. The silhouette version is only the sticker halo; the art version is the tyre.
 * IN: cx, cy, the wheel centre; art, true for the visible tyre and hub, false for the halo.
 * OUT: SVG markup for the wheel.
 */
function wheel(cx: number, cy: number, art: boolean): string {
  if (!art) return `<circle class="sil" cx="${cx}" cy="${cy}" r="20.5"/>`
  return `<circle class="tire o" cx="${cx}" cy="${cy}" r="20.5"/>
    <path class="gloss" style="stroke-width:3;opacity:.35" d="M${cx - 15} ${cy - 8} A17 17 0 0 1 ${cx - 7} ${cy - 15}"/>
    <circle class="metal o" style="stroke-width:3" cx="${cx}" cy="${cy}" r="10.5"/>
    <circle class="ink2 o" style="stroke-width:2.5" cx="${cx}" cy="${cy}" r="4.5"/>`
}

/** A four-point sparkle used as a "within limits" flourish.
 * IN: cx, cy, the centre; r, the radius.
 * OUT: SVG path markup in the status ink.
 */
function sparkle(cx: number, cy: number, r: number): string {
  const q = r * 0.25
  return `<path class="ink2 o" style="stroke-width:2.5" d="M${cx} ${cy - r} Q${cx + q} ${cy - q} ${cx + r} ${cy} Q${cx + q} ${cy + q} ${cx} ${cy + r} Q${cx - q} ${cy + q} ${cx - r} ${cy} Q${cx - q} ${cy - q} ${cx} ${cy - r} Z"/>`
}

/** Builds the whole rig drawing for one pose and one set of part statuses.
 * IN: p, the squat, nose angle and a status for each part.
 * OUT: SVG inner markup (put inside an <svg viewBox="0 0 640 260">). Trailer and truck wheels stay on
 *      the ground line: only the bodies pitch, and the trailer's wheel arch is cut to follow the wheel.
 */
export function buildRigArt(p: RigArtParams): string {
  const th = Math.atan(p.squat / WHEELBASE)
  const thDeg = (th * 180) / Math.PI
  // Hitch ball after the truck body has pitched about the front axle.
  const dx = 224
  const dy = -16
  const bx = 90 + dx * Math.cos(th) - dy * Math.sin(th)
  const by = 198 + dx * Math.sin(th) + dy * Math.cos(th)
  const ar = (p.angle * Math.PI) / 180
  // Trailer wheel centre in the trailer body's own frame, so the arch can be cut around it.
  const ox = TRAILER_WHEEL_X - bx
  const oy = 198 - by
  const wx = ox * Math.cos(ar) - oy * Math.sin(ar)
  const wy = ox * Math.sin(ar) + oy * Math.cos(ar)
  const h = Math.sqrt(Math.max(0, 900 - (wy - 8) ** 2))
  const TB = `M46 -62 Q46 -92 76 -92 L268 -92 Q292 -92 292 -68 L292 -2 Q292 8 282 8 L${round(wx + h)} 8 A30 30 0 0 0 ${round(wx - h)} 8 L56 8 Q46 8 46 -2 Z`
  const squatT = `rotate(${round(thDeg)} 90 198)`
  const trailerT = `translate(${round(bx)} ${round(by)}) rotate(${round(-p.angle)})`

  const tongue = `<path class="sil" d="M-12 -16 L14 -16 L14 4 L-12 4 Z"/><path d="M2 0 L50 -2" class="sil" style="stroke-width:20"/>`
  const silhouette = `<g transform="${squatT}"><path class="sil" d="${BODY}"/>${wheel(90, 198, false)}<path class="sil" d="M286 168 L310 168 L324 194 L290 194 Z"/></g>
    <g transform="${trailerT}"><path class="sil" d="${TB}"/>${tongue}</g>${wheel(TRAILER_WHEEL_X, 198, false)}${wheel(250, 198, false)}`

  const eye = `<circle class="white o" cx="42" cy="161" r="9"/><circle class="pupil" cx="45" cy="162" r="4.5"/><circle class="glossdot" cx="46.5" cy="160.5" r="1.5"/>`
  const truck = `<g class="part" data-part="truckBody" data-status="${p.truckBody}">
      <path class="ink2 o" d="${BODY}"/>
      <path class="gloss" d="M48 156 L88 150"/><circle class="glossdot" cx="97" cy="148.8" r="2.2"/>
      <path class="d" d="M170 140 L170 184 M214 140 L216 184 M222 150 L284 150" style="opacity:.9"/>
      <path class="glass o" style="stroke-width:3" d="M123 136 L131 116 Q134 109 142 109 L196 109 Q203 109 204 116 L207 136 Z"/>
      <path class="d" d="M170 110 L170 136"/>
      <path class="gloss" style="stroke-width:3.5" d="M136 126 L142 116 M178 126 L184 116"/>
      <path class="d" d="M176 150 L190 150" style="stroke-width:3.5"/>
      ${eye}
      <rect class="metal o" x="12" y="172" width="30" height="15" rx="7"/>
      <rect class="metal o" x="288" y="170" width="20" height="16" rx="7"/>
      ${wheel(90, 198, true)}
    </g>
    <g class="part" data-part="hitch" data-status="${p.hitch}">
      <rect class="ink2 o" x="290" y="186" width="34" height="10" rx="5"/>
      <rect class="metal o" style="stroke-width:3" x="310" y="178" width="8" height="12" rx="2"/>
      <circle class="ink2 o" cx="314" cy="182" r="7.5"/>
      <circle class="glossdot" cx="311.5" cy="179.5" r="2"/>
    </g>`

  const trailer = `<g class="part" data-part="trailerBody" data-status="${p.trailerBody}">
      <g transform="${trailerT}">
        <path d="M2 0 L50 -2" class="o" style="stroke-width:11"/><path d="M2 0 L50 -2" class="metal-line"/>
        <rect class="metal o" x="-12" y="-16" width="26" height="20" rx="7"/>
        <rect class="metal o" x="${round(wx - 26)}" y="-102" width="44" height="12" rx="6"/>
        <path class="ink2" d="${TB}"/>
        <path class="stripe" d="M44 -24 L294 -24"/>
        <path class="d" d="M222 8 L222 -54 Q222 -72 238 -72 Q254 -72 254 -54 L254 8"/>
        <circle class="glass o" style="stroke-width:3" cx="238" cy="-50" r="9"/>
        <circle class="glass o" cx="100" cy="-52" r="22"/>
        <path class="gloss" d="M88 -62 Q92 -68 99 -69"/><circle class="glossdot" cx="85" cy="-55" r="2"/>
        <circle class="glass o" style="stroke-width:3" cx="164" cy="-56" r="14"/>
        <path class="gloss" style="stroke-width:3" d="M156 -62 Q158 -66 163 -67"/>
        <path class="gloss" d="M58 -76 L58 -62" style="opacity:.7"/>
        <rect class="metal o" x="288" y="-14" width="10" height="16" rx="4"/>
        <path d="M32 6 L32 22" class="o" style="stroke-width:9"/><path d="M32 6 L32 22" class="metal-line" style="stroke-width:3"/>
        <path class="o" d="${TB}" style="fill:none"/>
      </g>
      ${wheel(TRAILER_WHEEL_X, 198, true)}
    </g>`
  const rear = `<g class="part" data-part="truckRear" data-status="${p.truckRear}">${wheel(250, 198, true)}</g>`

  let fx = ''
  if (p.truckBody === 'green') {
    fx += `<g style="--c:var(--stamp-pass)">${sparkle(150, 72, 11)}${sparkle(176, 58, 6)}</g>`
  }
  if (p.trailerBody === 'green') {
    fx += `<g style="--c:var(--stamp-pass)">${sparkle(446, 50, 10)}</g>`
  }
  if (p.truckRear === 'red') {
    fx += `<g class="strain"><path class="d" style="stroke-width:4" d="M212 188 L198 183 M210 200 L194 200 M212 212 L198 217"/></g>
      <g><path class="drop o" style="stroke-width:3" d="M176 186 C176 186 187 199 187 206 A11 11 0 0 1 165 206 C165 199 176 186 176 186 Z"/><path class="gloss" style="stroke-width:3" d="M170 207 Q170 211 173 213"/></g>`
  }

  const label = (x: number, name: string, status: CheckStatus): string =>
    `<g class="sw" data-status="${status}"><circle cx="${x + 7}" cy="241" r="6"/><text x="${x + 20}" y="247">${name} ${LABEL_WORD[status]}</text></g>`

  return `<line class="ground" x1="8" y1="220" x2="632" y2="220"/>
    <g class="shadow" transform="translate(3 4)"><g>${silhouette}</g></g>
    <g>${silhouette}</g>
    <g transform="${squatT}">${truck}</g>
    ${trailer}${rear}${fx}
    ${label(8, 'TRUCK', p.truckBody)}${label(142, 'REAR', p.truckRear)}${label(260, 'HITCH', p.hitch)}${label(398, 'TRAILER', p.trailerBody)}`
}
