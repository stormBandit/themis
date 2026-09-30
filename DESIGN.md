# themis design system: "Weigh Ticket"

Version 0.1, draft. A visual mockup will follow and may adjust values; `src/styles/tokens.css` is the source of truth for every value below.

## The idea

The whole UI is styled after a printed CAT Scale weigh ticket and thermal receipt paper. The user fills in a blank ticket, and the results print out as a receipt with rubber-stamped PASS / CLOSE / OVER marks. It should feel like a physical object from a truck stop, not a software dashboard.

Styled after the object, not copied from any website.

## Principles

1. **Paper, not panels.** Tickets sit on a "desk" background. Square corners, perforated edges, dashed rules. No floating cards, no glassmorphism, no gradients.
2. **Numbers are the hero.** Monospaced, tabular figures, large and bold. Labels are small and quiet.
3. **Status is stamped, never colour alone.** Every check shows a word stamp (PASS / CLOSE / OVER) as well as its colour.
4. **One ink per state.** Black ink for content, and three stamp inks for status. Nothing else competes.
5. **Plain language.** Friendly, short, Canadian spelling, no em dashes.

## Colour

Light mode is ink on thermal paper. Dark mode is a night-shift ticket: warm dark paper, light ink, brighter stamp inks.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--desk` | #DDD7CA | #121211 | Page background behind tickets |
| `--paper` | #F6F3EA | #1F1E1B | Ticket surface |
| `--paper-edge` | #E7E2D4 | #2A2925 | Perforation shadow, input fill |
| `--ink` | #1C1B19 | #ECE7DA | Primary text, line art |
| `--ink-muted` | #5E5A52 | #A8A294 | Labels, helper text, units |
| `--rule` | #B9B3A3 | #4A473F | Dashed rules, borders |
| `--stamp-pass` | #1F6B45 | #5BBF8A | PASS stamp, within limits |
| `--stamp-close` | #9A5B00 | #E2A94A | CLOSE stamp, 90–100% |
| `--stamp-over` | #B3261E | #F07167 | OVER stamp, over the limit |
| `--carbon` | #2B4C7E | #8FB0E6 | Links, focus ring, selected toggle (carbon-copy blue) |

All text pairs meet WCAG AA (4.5:1) on `--paper`.

## Type

Self-host all fonts with `@fontsource` packages (no calls to Google Fonts, so the PWA works offline).

| Role | Font | Notes |
| --- | --- | --- |
| Display | Big Shoulders Display, 800 | Uppercase. Ticket header, stamps, verdict |
| Figures and labels | IBM Plex Mono, 400 / 600 | All numbers, units, ticket lines, input values. `font-variant-numeric: tabular-nums` |
| Body | IBM Plex Sans, 400 / 500 | Helper text, disclaimer, longer copy |

Scale (px): 12, 14, 16, 20, 28, 40, 56. Body 16. Result figures 28 (mobile) / 40 (desktop). Line height 1.5 for body, 1.1 for display.

## Spacing, shape, depth

- 4 px base unit: 4, 8, 12, 16, 24, 32, 48, 64
- Radius: 0 everywhere, 2 px on inputs only
- Borders: 1 px `--rule`. Ticket line separators are 1 px dashed
- Shadow: only the ticket on the desk, `0 1px 0 rgba(0,0,0,.06), 0 10px 30px rgba(0,0,0,.08)`. Nothing else has a shadow
- Perforated edges: top and bottom of each ticket, made with a repeating radial-gradient mask (8 px holes, 16 px pitch)

## Layout

- Mobile first. Single column, 16 px side gutter, no horizontal scroll at 375 px
- From 960 px: two columns. Input ticket on the left, results receipt and rig drawing on the right (sticky)
- Max content width 1120 px
- Tap targets at least 44 px tall

## Components

**Ticket.** The main container. Header strip: `THEMIS` in display type, "WEIGH TICKET", a ticket number and today's date in mono, like a printed header. Perforated top and bottom edges.

**Field.** Looks like a blank on a paper form: label above in small mono caps (`--ink-muted`), value in mono 20 px, bottom border only, unit suffix (LBS / KG) right-aligned inside the field. Focus: 2 px `--carbon` bottom border plus a visible focus ring.

**Unit toggle.** A printed two-box selector, `[LBS] [KG]`. The selected box is filled `--ink` with `--paper` text. Converts values in place.

**Preset picker.** Year, make, model, trim as stacked selects in the same field style. The sticker warning sits directly under it as fine print with a small printed "!" mark.

**Ticket line (results).** `LABEL ......... 1,103 / 1,650 LBS  [PASS]`. Dot leaders between label and value. A thin usage bar under the line, filled in the stamp ink for its status, with a tick at 90%.

**Stamp.** Uppercase display type, 3 px border in the stamp ink, rotated −4°, slightly uneven opacity (0.92) like real ink. `mix-blend-mode: multiply` in light mode. Words: PASS, CLOSE, OVER. Estimated values also get a small "EST." mark.

**Verdict.** One large stamp at the bottom of the receipt: "BALANCED" (pass), "CHECK IT" (close), "OVER LIMIT" (over).

**Tongue weight window.** A mono scale strip from 0 to 20% with the 10–15% window shaded and a needle for the current value.

**Rig drawing.** Single-ink line art, 1.5 px strokes in `--ink`, no fills except the part that is failing (filled with that stamp ink at 20% plus the stamp ink stroke). Dashed ground line. Rear squat and hitch angle move with the model. Labels in small mono.

**Disclaimer.** Printed as the ticket footer in 12 px Plex Sans: "Estimates only. Confirm on a certified scale and with the labels on your truck and trailer."

## Motion

- Stamps "thump" in when status changes: scale 1.15 to 1, 120 ms, ease-out
- Rig drawing eases squat and angle over 200 ms
- Respect `prefers-reduced-motion`: no scale or movement, instant changes

## Don'ts

- No Tailwind or shadcn default styling, no component library look
- No purple or blue gradients, no glassmorphism, no rounded cards, no emoji
- No colour-only status
- No shadows except the ticket on the desk
- No fonts loaded from third-party servers
