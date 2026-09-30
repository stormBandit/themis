import { describe, expect, it } from 'vitest'
import { calculateRig } from '../model'
import {
  displayValue,
  formReducer,
  initialState,
  toRigInputs,
  type FormAction,
  type FormState,
} from './state'

const run = (s: FormState, ...actions: FormAction[]): FormState =>
  actions.reduce(formReducer, s)

describe('formReducer', () => {
  it('starts empty in lbs at 12%', () => {
    const s = initialState()
    expect(s).toEqual({ unit: 'lbs', lbs: {}, tonguePct: 12, wdh: false, draft: null })
  })
  it('commits live on every keystroke and keeps the draft', () => {
    const s = run(initialState(), { type: 'edit', field: 'maxTow', text: '8,5' })
    expect(s.lbs.maxTow).toBe(85)
    expect(s.draft).toEqual({ field: 'maxTow', text: '8,5' })
    expect(displayValue(s, 'maxTow')).toBe('8,5')
  })
  it('shows formatted stored value after blur', () => {
    const s = run(
      initialState(),
      { type: 'edit', field: 'maxTow', text: '8500' },
      { type: 'blur', field: 'maxTow' },
    )
    expect(s.draft).toBeNull()
    expect(displayValue(s, 'maxTow')).toBe('8,500')
  })
  it('ignores blur for a different field', () => {
    const s = run(initialState(), { type: 'edit', field: 'gvwr', text: '1' })
    expect(formReducer(s, { type: 'blur', field: 'gcwr' })).toBe(s)
  })
  it('removes the field when edited to empty or invalid', () => {
    let s = run(initialState(), { type: 'edit', field: 'uvw', text: '3800' })
    expect(s.lbs.uvw).toBe(3800)
    s = run(s, { type: 'edit', field: 'uvw', text: '' })
    expect('uvw' in s.lbs).toBe(false)
    s = run(
      s,
      { type: 'edit', field: 'uvw', text: '12' },
      { type: 'edit', field: 'uvw', text: '-3' },
    )
    expect('uvw' in s.lbs).toBe(false)
  })
  it('interprets edits in the current unit', () => {
    const s = run(
      initialState(),
      { type: 'setUnit', unit: 'kg' },
      { type: 'edit', field: 'cargo', text: '1996.4' },
    )
    expect(displayValue(run(s, { type: 'blur', field: 'cargo' }), 'cargo')).toBe(
      '1,996.4',
    )
    expect(s.lbs.cargo).toBeCloseTo(1996.4 / 0.45359237, 9)
  })
  it('toggling 100 times leaves stored lbs bit-identical', () => {
    let s = run(
      initialState(),
      { type: 'setUnit', unit: 'kg' },
      { type: 'edit', field: 'cargo', text: '1996.4' },
    )
    s = run(s, { type: 'blur', field: 'cargo' })
    const before = s.lbs.cargo
    for (let i = 0; i < 100; i++) s = formReducer(s, { type: 'toggleUnit' })
    expect(Object.is(s.lbs.cargo, before)).toBe(true)
    expect(s.unit).toBe('kg')
  })
  it('toggling with an open draft keeps the value and clears the draft', () => {
    const s = run(
      initialState(),
      { type: 'edit', field: 'gvwr', text: '1,20' },
      { type: 'toggleUnit' },
    )
    expect(s.draft).toBeNull()
    expect(s.unit).toBe('kg')
    expect(s.lbs.gvwr).toBe(120)
  })
  it('clamps tongue % and ignores non-finite values', () => {
    expect(run(initialState(), { type: 'setTonguePct', value: 150 }).tonguePct).toBe(100)
    expect(run(initialState(), { type: 'setTonguePct', value: -4 }).tonguePct).toBe(0)
    expect(run(initialState(), { type: 'setTonguePct', value: NaN }).tonguePct).toBe(12)
    expect(run(initialState(), { type: 'setTonguePct', value: 10.5 }).tonguePct).toBe(
      10.5,
    )
  })
  it('sets wdh and resets', () => {
    let s = run(
      initialState(),
      { type: 'setWdh', value: true },
      { type: 'edit', field: 'gvwr', text: '5' },
    )
    expect(s.wdh).toBe(true)
    s = formReducer(s, { type: 'reset' })
    expect(s).toEqual(initialState())
  })
})

describe('toRigInputs', () => {
  it('feeds the PRD fixture through the model', () => {
    const edits: [Parameters<typeof displayValue>[1], string][] = [
      ['payloadCapacity', '1650'],
      ['maxTow', '8500'],
      ['receiverMax', '850'],
      ['passengers', '350'],
      ['bedCargo', '150'],
      ['hitchHardware', '75'],
      ['uvw', '3800'],
      ['cargo', '600'],
    ]
    let s = run(
      initialState(),
      { type: 'setTonguePct', value: 12 },
      { type: 'setWdh', value: true },
    )
    for (const [field, text] of edits) s = formReducer(s, { type: 'edit', field, text })
    const inputs = toRigInputs(s)
    expect(inputs.truck.maxTow).toBe(8500)
    expect(inputs.load.hitchHardware).toBe(75)
    expect(inputs.trailer.uvw).toBe(3800)
    expect(inputs.setup).toEqual({ tonguePct: 12, wdh: true })
    const r = calculateRig(inputs)
    expect(r.trailerLoaded).toBe(4400)
    expect(r.tongueWeight).toBe(528)
    expect(r.payloadUsed).toBe(1103)
  })
})

describe('measured rear axle field', () => {
  it('flows through to the model inputs, converting from kg', () => {
    let s = formReducer(initialState(), { type: 'setUnit', unit: 'kg' })
    s = formReducer(s, { type: 'edit', field: 'measuredRearAxle', text: '1500' })
    expect(toRigInputs(s).measured?.rearAxleLoad).toBeCloseTo(3306.93, 1)
  })
})
