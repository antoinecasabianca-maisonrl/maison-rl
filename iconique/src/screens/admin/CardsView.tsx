import { useMemo, useState } from 'react'
import type { Card, CardData, CardOverrides } from '../../types'
import { formatNumber, getAllCards, nextCardId, saveOverrides, toCardData } from '../../utils/cards'
import { downloadFile } from '../../utils/download'
import { CardForm } from './CardForm'

type Filter = 'all' | 'active' | 'disabled' | 'modified'

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function CardsView({ overrides, onChange }: { overrides: CardOverrides; onChange: (o: CardOverrides) => void }) {
  const all = useMemo(() => getAllCards(overrides), [overrides])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)

  const update = (o: CardOverrides) => {
    saveOverrides(o)
    onChange(o)
  }

  const saveCard = (card: Card, data: CardData) => {
    if (card.custom) {
      update({ ...overrides, added: overrides.added.map((c) => (c.id === card.id ? data : c)) })
    } else {
      const { id, ...fields } = data
      update({ ...overrides, edits: { ...overrides.edits, [id]: fields } })
    }
    setEditing(null)
  }

  const toggle = (card: Card) => {
    const disabled = card.disabled ? overrides.disabled.filter((id) => id !== card.id) : [...overrides.disabled, card.id]
    update({ ...overrides, disabled })
  }

  const restore = (card: Card) => {
    const edits = { ...overrides.edits }
    delete edits[card.id]
    update({ ...overrides, edits })
  }

  const remove = (card: Card) => {
    if (!window.confirm(`Supprimer la carte Nº ${formatNumber(card.id)} ?`)) return
    update({ ...overrides, added: overrides.added.filter((c) => c.id !== card.id), disabled: overrides.disabled.filter((id) => id !== card.id) })
  }

  const q = normalize(query.trim())
  const visible = all.filter((c) => {
    if (filter === 'active' && c.disabled) return false
    if (filter === 'disabled' && !c.disabled) return false
    if (filter === 'modified' && !c.edited && !c.custom) return false
    if (!q) return true
    return normalize([formatNumber(c.id), c.ref, c.indice1, c.indice2, c.indice3, c.source, c.annee].join(' ')).includes(q)
  })
  const activeCount = all.filter((c) => !c.disabled).length

  const exportJson = () => {
    const data = all.map((c) => ({ ...toCardData(c), ...(c.disabled ? { disabled: true } : {}) }))
    downloadFile(`iconique-cartes-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2))
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="label">{all.length} cartes</span>
        <span className="label opacity-60">{activeCount} actives</span>
        <span className="label opacity-60">{all.length - activeCount} désactivées</span>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une ref, un indice, une source…"
        className="mb-3 min-h-13 w-full border-2 border-noir bg-creme px-4 font-semibold outline-none placeholder:text-noir/40 focus:bg-white"
      />
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {(
          [
            ['all', 'Toutes'],
            ['active', 'Actives'],
            ['disabled', 'Désactivées'],
            ['modified', 'Modifiées'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={`label min-h-10 shrink-0 border-2 border-noir px-3 ${filter === key ? 'bg-noir text-creme' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        <button type="button" onClick={() => setAdding(true)} className="display min-h-13 flex-1 bg-jaune text-xl shadow-[3px_3px_0_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          + Nouvelle carte
        </button>
        <button type="button" onClick={exportJson} className="display min-h-13 border-2 border-noir px-4 text-xl">
          Exporter
        </button>
      </div>

      {adding && (
        <div className="mb-6">
          <CardForm
            initial={{ id: nextCardId(all), ref: '', indice1: '', indice2: '', indice3: '', source: '', annee: '' }}
            submitLabel="Ajouter"
            onCancel={() => setAdding(false)}
            onSubmit={(data) => {
              update({ ...overrides, added: [...overrides.added, data] })
              setAdding(false)
            }}
          />
        </div>
      )}

      {visible.length === 0 && <p className="py-10 text-center font-semibold opacity-60">Aucune carte trouvée.</p>}

      <ol className="border-t-2 border-noir">
        {visible.map((c) => (
          <li key={c.id} className={`border-b border-noir/25 py-4 ${c.disabled ? 'opacity-45' : ''}`}>
            {editing === c.id ? (
              <CardForm initial={toCardData(c)} submitLabel="Enregistrer" onCancel={() => setEditing(null)} onSubmit={(data) => saveCard(c, data)} />
            ) : (
              <>
                <div className="mb-1 flex items-center gap-2">
                  <span className="display text-3xl leading-none">{formatNumber(c.id)}</span>
                  {c.disabled && <Badge dark>Désactivée</Badge>}
                  {c.edited && <Badge>Modifiée</Badge>}
                  {c.custom && <Badge>Ajoutée</Badge>}
                </div>
                <p className="display text-2xl">{c.ref}</p>
                <dl className="mt-2 space-y-1 text-sm">
                  {([1, 2, 3] as const).map((n) => (
                    <div key={n} className="flex gap-2">
                      <dt className="label w-16 shrink-0 pt-0.5 opacity-60">Indice {n}</dt>
                      <dd className="font-medium">{c[`indice${n}`] || '—'}</dd>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <dt className="label w-16 shrink-0 pt-0.5 opacity-60">Source</dt>
                    <dd className="font-medium">{c.source || '—'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="label w-16 shrink-0 pt-0.5 opacity-60">Année</dt>
                    <dd className="font-medium">{c.annee || '—'}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SmallButton onClick={() => setEditing(c.id)}>Modifier</SmallButton>
                  <SmallButton onClick={() => toggle(c)}>{c.disabled ? 'Activer' : 'Désactiver'}</SmallButton>
                  {c.edited && <SmallButton onClick={() => restore(c)}>Rétablir l'original</SmallButton>}
                  {c.custom && <SmallButton onClick={() => remove(c)}>Supprimer</SmallButton>}
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Badge({ children, dark = false }: { children: string; dark?: boolean }) {
  return <span className={`label px-1.5 py-0.5 text-[9px] ${dark ? 'bg-noir text-creme' : 'bg-jaune'}`}>{children}</span>
}

function SmallButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="label min-h-10 border-2 border-noir px-3 active:bg-noir active:text-creme">
      {children}
    </button>
  )
}
