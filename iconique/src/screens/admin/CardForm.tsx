import { useState } from 'react'
import type { CardData } from '../../types'
import { formatNumber } from '../../utils/cards'

const FIELDS: { key: keyof Omit<CardData, 'id'>; label: string; multiline?: boolean }[] = [
  { key: 'ref', label: 'Ref', multiline: true },
  { key: 'indice1', label: 'Indice 1', multiline: true },
  { key: 'indice2', label: 'Indice 2', multiline: true },
  { key: 'indice3', label: 'Indice 3', multiline: true },
  { key: 'source', label: 'Source' },
  { key: 'annee', label: 'Année' },
]

interface Props {
  initial: CardData
  submitLabel: string
  onSubmit: (card: CardData) => void
  onCancel: () => void
}

export function CardForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [draft, setDraft] = useState<CardData>(initial)
  const valid = draft.ref.trim().length > 0

  return (
    <form
      className="anim-rise space-y-3 bg-creme-2/60 p-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit({ ...draft, ref: draft.ref.trim().toUpperCase() })
      }}
    >
      <p className="label">Carte Nº {formatNumber(draft.id)}</p>
      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="label mb-1 block opacity-60">{f.label}</span>
          {f.multiline ? (
            <textarea
              rows={2}
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              className={`w-full resize-y border-2 border-noir bg-creme px-3 py-2 outline-none focus:bg-white ${f.key === 'ref' ? 'display text-2xl uppercase' : 'font-medium'}`}
            />
          ) : (
            <input
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
              className="min-h-12 w-full border-2 border-noir bg-creme px-3 font-medium outline-none focus:bg-white"
            />
          )}
        </label>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={!valid} className="display min-h-12 flex-1 bg-noir text-xl text-creme disabled:opacity-30">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="display min-h-12 flex-1 border-2 border-noir text-xl">
          Annuler
        </button>
      </div>
    </form>
  )
}
