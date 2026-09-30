import type { CheckId, CheckStatus } from './model'
import type { FieldId } from './form/state'

export const DISCLAIMER =
  'Estimates only. Confirm on a certified scale and with the labels on your truck and trailer.'

export const STICKER_NOTE =
  'Specs vary by trim and options. Check the sticker on your door jamb and trailer and enter those exact numbers.'

export const ESTIMATE_NOTE =
  'Estimate. For the real number, weigh your rig on a certified scale and enter the rear axle load under “Weighed on a scale”. Check your rear axle rating (GAWR) on the door jamb sticker.'

export const CHECK_LABELS: Record<CheckId, string> = {
  payload: 'Payload',
  towRating: 'Tow rating',
  gcwr: 'GCWR',
  rearAxle: 'Rear axle',
  receiver: 'Receiver',
  tongue: 'Tongue weight',
}

/** What to enter when a check can't run yet. */
export const NEEDS_HINT: Record<CheckId, string> = {
  payload: 'Enter your payload capacity to check this.',
  towRating: 'Enter your max tow rating to check this.',
  gcwr: 'Enter GVWR, payload capacity and GCWR to check this.',
  rearAxle: 'Enter your rear GAWR, plus GVWR and payload capacity or a scale reading, to check this.',
  receiver: 'Enter your receiver max tongue weight to check this.',
  tongue: 'Enter your trailer weights to check this.',
}

export const STAMP_WORD: Record<CheckStatus, string> = {
  green: 'PASS',
  amber: 'CLOSE',
  red: 'OVER',
  'not-rated': 'NOT RATED',
}

export const VERDICT_WORD: Record<CheckStatus, string> = {
  green: 'BALANCED',
  amber: 'CHECK IT',
  red: 'OVER LIMIT',
  'not-rated': 'ENTER YOUR NUMBERS',
}

export const VERDICT_HELP: Record<CheckStatus, string> = {
  green: 'Every check you filled in is within its limit.',
  amber: 'At least one check is close to its limit. Give yourself some room.',
  red: 'At least one check is over its limit. Lighten the load or change the setup.',
  'not-rated': 'Fill in the ticket and your results print here.',
}

export interface FieldDef {
  id: FieldId
  label: string
}

export interface FieldGroup {
  title: string
  note?: string
  fields: FieldDef[]
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    title: 'Truck',
    note: STICKER_NOTE,
    fields: [
      { id: 'gvwr', label: 'GVWR' },
      { id: 'payloadCapacity', label: 'Payload capacity' },
      { id: 'maxTow', label: 'Max tow rating' },
      { id: 'gcwr', label: 'GCWR' },
      { id: 'rearGawr', label: 'Rear axle rating (GAWR)' },
      { id: 'receiverMax', label: 'Receiver max tongue weight' },
    ],
  },
  {
    title: 'Load in the truck',
    fields: [
      { id: 'passengers', label: 'Passengers' },
      { id: 'bedCargo', label: 'Bed and cargo' },
      { id: 'hitchHardware', label: 'Hitch hardware' },
    ],
  },
  {
    title: 'Trailer',
    fields: [
      { id: 'uvw', label: 'Dry weight (UVW)' },
      { id: 'cargo', label: 'Cargo' },
      { id: 'fluids', label: 'Fluids (water, propane)' },
    ],
  },
  {
    title: 'Weighed on a scale',
    note: 'Optional. If you have a real number, it replaces our estimate.',
    fields: [{ id: 'measuredRearAxle', label: 'Rear axle load (certified scale)' }],
  },
]
