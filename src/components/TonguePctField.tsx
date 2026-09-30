import { useEffect, useState } from 'react'
import { parseNumber } from '../lib/form/parse'
import { Field } from './Field'

interface TonguePctFieldProps {
  value: number
  onChange: (value: number) => void
}

/** Percent field that lets the user clear and retype without the value snapping back. */
export function TonguePctField({ value, onChange }: TonguePctFieldProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText((current) => (parseNumber(current) === value ? current : String(value)))
  }, [value])

  return (
    <Field
      id="tonguePct"
      label="Tongue weight (aim for 10–15%)"
      value={text}
      suffix="%"
      onChange={(next) => {
        setText(next)
        const parsed = parseNumber(next)
        onChange(parsed ?? 0)
      }}
      onBlur={() => setText(String(value))}
    />
  )
}
