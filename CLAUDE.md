# themis

A free, visual towing setup checker. Users enter (or pick) their truck and trailer numbers and see whether the rig is within limits: payload, tow rating, GCWR, rear axle (GAWR), receiver rating and tongue weight. Named after Themis, the Greek goddess of balance who holds the scales.

Full spec for the current phase: `docs/PRD.md`. Read it before starting any work.

## Stack

- Astro with static output. One React island for the calculator and rig drawing
- TypeScript, strict mode. No `any`
- Vitest for unit tests
- npm, ESLint, Prettier
- Deploy target (later, not phase 1): static assets on Cloudflare Workers

## Hard rules

- No backend, no analytics, no ads, no deployment in phase 1
- The weight model lives in `src/lib/model/` as pure functions with no UI or framework imports
- All weights are stored internally in lbs. Convert only at the edges (input parsing and display)
- Anything estimated (rear axle load, WDH load shift) is labelled "estimate" in the UI
- The disclaimer is always visible: estimates only, confirm on a certified scale and with your vehicle's labels
- UI styling comes only from `DESIGN.md` and `src/styles/tokens.css`. If those files don't exist yet, do not build styled UI. Stop and ask. No default Tailwind or shadcn look, no purple gradients, no generic card grids
- Must work at 375 px wide

## Writing (all UI copy, docs and commit messages)

- Canadian spelling (colour, centre, metre, licence as a noun)
- Never use em dashes. Use commas, colons or separate sentences
- Ranges use an en dash: 10–15%
- Plain, friendly language. Say what to do, not just what's wrong

## Workflow

- Plan before coding and show the plan for approval
- Write tests with (or before) the model code
- Run `npm test`, `npm run lint` and `npm run build` before saying anything is done
- Small commits with clear messages
- If a spec detail is unclear or two rules conflict, ask. Don't guess silently
