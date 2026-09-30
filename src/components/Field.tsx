interface FieldProps {
  id: string
  label: string
  value: string
  suffix: string
  onChange: (text: string) => void
  onBlur?: () => void
  inputMode?: 'decimal' | 'numeric'
}

export function Field({
  id,
  label,
  value,
  suffix,
  onChange,
  onBlur,
  inputMode = 'decimal',
}: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <span className="field__suffix" aria-hidden="true">
          {suffix}
        </span>
      </div>
    </div>
  )
}
