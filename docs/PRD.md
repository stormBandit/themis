# themis: Phase 1 PRD

Status: ready for phase 1. `DESIGN.md` and `src/styles/tokens.css` are a v0.1 draft; a visual mockup may adjust values, so build the weight model first.

## Problem

People towing a trailer don't know if their setup is safe. Existing calculators are either number tables or skip key ratings (GCWR, axle limits), and almost none support metric. Reference site we are improving on: https://www.hitchandaxle.com

## Goals

1. Resume piece: clean, well-tested, well-structured code
2. Minor income later through AdSense and contextual affiliate links (not in phase 1)

## Phase 1 scope

Build these, running locally:

1. **Weight model** (pure TypeScript, fully tested)
2. **Input form and results**, mobile first, with the lbs / kg toggle and truck presets
3. **SVG rig drawing** driven by the model

Not in phase 1: URL state, scale ticket mode, sticker scan, SEO content pages, ads, affiliates, deployment.

## Weight model

Location: `src/lib/model/`. Pure functions, no UI imports.

### Inputs (all weights in lbs internally)

| Group | Field |
| --- | --- |
| Truck | GVWR, payload capacity, max tow rating, GCWR, rear GAWR, receiver max tongue weight |
| Load in truck | passengers, bed / cargo weight, hitch hardware weight |
| Trailer | dry weight (UVW), cargo, fluids |
| Setup | tongue weight %, weight distribution hitch (WDH) on / off |

### Outputs

- Trailer loaded weight = UVW + cargo + fluids
- Tongue weight = trailer loaded weight × tongue %
- Payload used = passengers + bed cargo + hitch hardware + tongue weight; payload remaining
- Usage % for: payload, tow rating, GCWR, rear GAWR, receiver
- Tongue % against the 10–15% target window
- Overall verdict (worst status of all checks)

GCWR check: combined weight = truck curb weight (GVWR − payload capacity) + payload used + trailer loaded weight − tongue weight (tongue weight is already counted in payload used). Double-check this derivation in tests.

Rear axle and WDH load shift are estimates. Propose a documented estimation approach in your plan (for example, a configurable share of tongue weight moved to the steer and trailer axles when WDH is on) and label results as estimates in the UI.

### Status thresholds (easy to change, keep in one config)

- Green: under 90% of the limit
- Amber: 90–100%
- Red: over 100%
- Tongue %: green inside 10–15%, amber within 2 points outside it, red beyond that

### Test fixture (from the Hitch & Axle example)

Payload capacity 1,650, max tow 8,500, receiver 850, passengers 350, bed 150, UVW 3,800, cargo 600, tongue 12%, hardware 75, WDH on.

Expected: trailer loaded 4,400, tongue 528, payload used 1,103 (67%), tow rating 52%, receiver 62%.

Also test: all zeros, over-limit cases, missing optional fields, and lbs → kg → lbs round trips with no drift.

## Units

- One-tap lbs / kg toggle that converts values already entered
- Store lbs internally; round only for display
- 1 lb = 0.45359237 kg. Water = 8.34 lbs per US gallon (1 kg per litre)

## Truck presets

- Seed 5–10 top-selling half-ton trucks sold in Canada from the manufacturers' own towing guides, for example Ford's 2026 F-150 guide: https://www.ford.com/content/dam/brand_ford/en_us/brand/towing/pdf/2026-Ford-F150-Towing-Guide-v4.pdf
- Store as JSON in `src/data/trucks.json`, each entry with `sourceUrl` and `sourcePage`
- The guides list max trailer weight and GCWR by engine, cab, box and axle ratio. GVWR, payload and axle ratings come from the door jamb sticker, so those stay user-entered
- Confirm the list of trucks with Dalton before seeding, and check whether the Canadian guide differs from the US one
- Picking a preset pre-fills fields; every field stays editable
- Show beside the presets: "Specs vary by trim and options. Check the sticker on your door jamb and trailer and enter those exact numbers."
- Trailers: presets by type and length only for now

## Rig drawing

- SVG truck + trailer, drawn from model outputs
- Rear squat and nose angle respond to tongue weight
- Each check colours by status
- Later phases adapt the drawing to trailer type (travel trailer, utility, boat, horse) and truck class, so keep shapes modular

## Design

Direction: scale ticket theme. Printed CAT Scale tickets and thermal receipts: off-white paper, bold stamped numbers, perforated edges, monospaced figures. Each check reads like a ticket line with a PASS / OVER stamp; the verdict is a rubber-stamp mark.

Full system in `DESIGN.md`, values in `src/styles/tokens.css` (v0.1 draft). Build only from those. A visual mockup may still adjust values.

## Done when

- [ ] `npm test` passes, including the fixture and edge cases above
- [ ] Form updates results live and works at 375 px wide
- [ ] lbs / kg toggle converts entered values without drift
- [ ] Picking a preset pre-fills fields, all fields stay editable, sticker warning shown
- [ ] Rig drawing squats and colours by status as inputs change
- [ ] Disclaimer visible: estimates only, confirm on a certified scale
- [ ] `npm run lint` and `npm run build` pass

## Roadmap after phase 1 (for context, don't build yet)

In priority order: vehicle and trailer presets, GCWR and GAWR checks, metric toggle, mobile-first PWA with sticker scan (Tesseract.js, on-device, user confirms numbers), scenario compare, "what can I add?" mode, plain-language fixes, scale ticket mode, adaptive rig drawing, fluids and gear helpers. Later: URL state for sharing, SEO pages, AdSense and affiliate links, crowdsourced trailer specs from sticker scans (Cloudflare D1), deploy to Cloudflare Workers.
