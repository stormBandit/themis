import type { Unit } from '../lib/form/format'

interface UnitToggleProps {
  unit: Unit
  onChange: (unit: Unit) => void
}

const UNITS: Unit[] = ['lbs', 'kg']

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="unit-toggle" role="radiogroup" aria-label="Weight units">
      {UNITS.map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={unit === u}
          className="unit-toggle__box"
          onClick={() => onChange(u)}
        >
          {u.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
