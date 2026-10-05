import { useEffect, useMemo, useReducer, useState } from 'react'
import { DEFAULT_CONFIG, calculateRig } from '../lib/model'
import type { CheckId } from '../lib/model'
import { formatWeight, unitLabel } from '../lib/form/format'
import { displayValue, formReducer, initialState, toRigInputs } from '../lib/form/state'
import {
  CHECK_LABELS,
  DISCLAIMER,
  FIELD_GROUPS,
  NEEDS_HINT,
  VERDICT_HELP,
} from '../lib/copy'
import { Field } from './Field'
import { RigDrawing } from './rig/RigDrawing'
import { Stamp } from './Stamp'
import { TicketLine } from './TicketLine'
import { TongueWindow } from './TongueWindow'
import { TonguePctField } from './TonguePctField'
import { UnitToggle } from './UnitToggle'

const LINE_ORDER: CheckId[] = ['payload', 'towRating', 'gcwr', 'rearAxle', 'receiver']

/** Today's date as a printed-ticket string. Set after mount so server and client HTML match. */
function useTicketDate(): string {
  const [date, setDate] = useState('')
  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-CA'))
  }, [])
  return date
}

function TicketHeader({ subtitle, date }: { subtitle: string; date: string }) {
  return (
    <header className="ticket__header">
      <span className="ticket__brand">THEMIS</span>
      <span className="ticket__title">{subtitle}</span>
      <span className="ticket__meta">No. 000001 · {date || ' '}</span>
    </header>
  )
}

export default function Calculator() {
  const [state, dispatch] = useReducer(formReducer, undefined, initialState)
  const result = useMemo(() => calculateRig(toRigInputs(state)), [state])
  const date = useTicketDate()
  const { unit } = state
  const tongue = result.checks.tongue

  return (
    <div className="desk">
      <main className="layout">
        <section className="ticket ticket--input" aria-labelledby="ticket-in">
          <TicketHeader subtitle="WEIGH TICKET" date={date} />
          <div className="ticket__body">
            <div className="ticket__row">
              <h1 id="ticket-in" className="ticket__h">
                Is your rig within limits?
              </h1>
              <UnitToggle
                unit={unit}
                onChange={(u) => dispatch({ type: 'setUnit', unit: u })}
              />
            </div>

            {FIELD_GROUPS.map((group) => (
              <fieldset className="group" key={group.title}>
                <legend className="group__title">{group.title}</legend>
                {group.note && <p className="fine">{group.note}</p>}
                {group.fields.map((f) => (
                  <Field
                    key={f.id}
                    id={f.id}
                    label={f.label}
                    value={displayValue(state, f.id)}
                    suffix={unitLabel(unit)}
                    onChange={(text) => dispatch({ type: 'edit', field: f.id, text })}
                    onBlur={() => dispatch({ type: 'blur', field: f.id })}
                  />
                ))}
              </fieldset>
            ))}

            <fieldset className="group">
              <legend className="group__title">Setup</legend>
              <TonguePctField
                value={state.tonguePct}
                onChange={(value) => dispatch({ type: 'setTonguePct', value })}
              />
              <label className="check">
                <input
                  type="checkbox"
                  checked={state.wdh}
                  onChange={(e) => dispatch({ type: 'setWdh', value: e.target.checked })}
                />
                <span>Weight distribution hitch</span>
              </label>
            </fieldset>
          </div>
        </section>

        <div className="col-right">
          <section className="ticket ticket--rig" aria-label="Rig drawing">
            <TicketHeader subtitle="YOUR RIG" date={date} />
            <div className="ticket__body">
              <RigDrawing result={result} wdh={state.wdh} />
            </div>
          </section>

          <section className="ticket ticket--results" aria-labelledby="ticket-out">
            <TicketHeader subtitle="RESULTS" date={date} />
            <div className="ticket__body">
              <h2 id="ticket-out" className="ticket__h">
                Your results
              </h2>

              <dl className="summary">
                <div>
                  <dt>Trailer loaded</dt>
                  <dd>
                    {formatWeight(result.trailerLoaded, unit)} {unitLabel(unit)}
                  </dd>
                </div>
                <div>
                  <dt>Tongue weight</dt>
                  <dd>
                    {formatWeight(result.tongueWeight, unit)} {unitLabel(unit)}
                  </dd>
                </div>
                <div>
                  <dt>Payload left</dt>
                  <dd>
                    {result.payloadRemaining === null
                      ? 'n/a'
                      : `${formatWeight(result.payloadRemaining, unit)} ${unitLabel(unit)}`}
                  </dd>
                </div>
              </dl>

              <ul className="lines">
                {LINE_ORDER.map((id) => (
                  <TicketLine key={id} check={result.checks[id]} unit={unit} />
                ))}
                <li className="line">
                  <div className="line__head">
                    <span className="line__label">{CHECK_LABELS.tongue}</span>
                    <span className="line__leader" aria-hidden="true" />
                    <Stamp status={tongue.status} />
                  </div>
                  {tongue.pct !== null ? (
                    <>
                      <p className="line__figures">
                        <span className="line__used">
                          {Math.round(tongue.pct * 10) / 10}%
                        </span>
                        <span className="line__of">of trailer weight</span>
                      </p>
                      <TongueWindow
                        pct={tongue.pct}
                        status={tongue.status}
                        min={DEFAULT_CONFIG.thresholds.tongueMin}
                        max={DEFAULT_CONFIG.thresholds.tongueMax}
                      />
                    </>
                  ) : (
                    <p className="line__note">{NEEDS_HINT.tongue}</p>
                  )}
                </li>
              </ul>

              <div className="verdict" role="status" aria-live="polite">
                <Stamp status={result.verdict} verdict />
                <p className="verdict__help">{VERDICT_HELP[result.verdict]}</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="disclaimer">
        <p>{DISCLAIMER}</p>
      </footer>
    </div>
  )
}
