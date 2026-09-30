import type { RigInputs } from '../model'
import { fromDisplayString, toDisplayString, type Unit } from './format'

export const FIELD_IDS = [
  'gvwr',
  'payloadCapacity',
  'maxTow',
  'gcwr',
  'rearGawr',
  'receiverMax',
  'passengers',
  'bedCargo',
  'hitchHardware',
  'uvw',
  'cargo',
  'fluids',
] as const

export type FieldId = (typeof FIELD_IDS)[number]

export interface FormState {
  unit: Unit
  /** Committed weights, always in lbs. */
  lbs: Partial<Record<FieldId, number>>
  tonguePct: number
  wdh: boolean
  /** Raw text of the field being edited, so typing isn't reformatted under the cursor. */
  draft: { field: FieldId; text: string } | null
}

export type FormAction =
  | { type: 'edit'; field: FieldId; text: string }
  | { type: 'blur'; field: FieldId }
  | { type: 'toggleUnit' }
  | { type: 'setUnit'; unit: Unit }
  | { type: 'setTonguePct'; value: number }
  | { type: 'setWdh'; value: boolean }
  | { type: 'reset' }

/** Builds the starting form state.
 * IN: nothing.
 * OUT: a FormState in lbs with no weights entered, tongue 12%, no WDH, no draft.
 */
export const initialState = (): FormState => ({
  unit: 'lbs',
  lbs: {},
  tonguePct: 12,
  wdh: false,
  draft: null,
})

/** Applies one action to the form state.
 * IN: state, the current FormState; action, what happened.
 * OUT: the next FormState. Edits commit to stored lbs on every keystroke (removing the
 *      field when the text is empty or invalid). Changing unit never alters stored lbs.
 */
export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'edit': {
      const value = fromDisplayString(action.text, state.unit)
      const lbs: FormState['lbs'] = {}
      for (const id of FIELD_IDS) {
        const v = id === action.field ? value : state.lbs[id]
        if (v !== undefined) lbs[id] = v
      }
      return {
        ...state,
        lbs,
        draft: { field: action.field, text: action.text },
      }
    }
    case 'blur':
      return state.draft?.field === action.field ? { ...state, draft: null } : state
    case 'toggleUnit':
      return {
        ...state,
        unit: state.unit === 'lbs' ? 'kg' : 'lbs',
        draft: null,
      }
    case 'setUnit':
      return { ...state, unit: action.unit, draft: null }
    case 'setTonguePct':
      return Number.isFinite(action.value)
        ? { ...state, tonguePct: Math.min(100, Math.max(0, action.value)) }
        : state
    case 'setWdh':
      return { ...state, wdh: action.value }
    case 'reset':
      return initialState()
  }
}

/** Gets the text a field's input should show.
 * IN: state, the FormState; field, which input.
 * OUT: the raw draft text if that field is being edited, otherwise the stored lbs
 *      formatted in the current unit ('' when not entered).
 */
export function displayValue(state: FormState, field: FieldId): string {
  if (state.draft?.field === field) return state.draft.text
  return toDisplayString(state.lbs[field], state.unit)
}

/** Maps form state onto the weight model's inputs.
 * IN: state, the FormState (weights already in lbs).
 * OUT: RigInputs with truck, load, trailer and setup groups filled from the fields.
 */
export function toRigInputs(state: FormState): RigInputs {
  const w = state.lbs
  return {
    truck: {
      gvwr: w.gvwr,
      payloadCapacity: w.payloadCapacity,
      maxTow: w.maxTow,
      gcwr: w.gcwr,
      rearGawr: w.rearGawr,
      receiverMax: w.receiverMax,
    },
    load: {
      passengers: w.passengers,
      bedCargo: w.bedCargo,
      hitchHardware: w.hitchHardware,
    },
    trailer: { uvw: w.uvw, cargo: w.cargo, fluids: w.fluids },
    setup: { tonguePct: state.tonguePct, wdh: state.wdh },
  }
}
