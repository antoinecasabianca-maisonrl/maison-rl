import { useMemo, useState } from 'react'
import type { Card, CardStats, StatsStore } from '../../types'
import { formatNumber } from '../../utils/cards'
import { downloadFile } from '../../utils/download'
import { averageHint, emptyStats, rate, resetStats } from '../../utils/stats'

type Sort = 'rate' | 'played' | 'hint' | 'number'

const SORTS: [Sort, string][] = [
  ['rate', 'Taux ↑'],
  ['played', 'Jouées'],
  ['hint', 'Indice moyen'],
  ['number', 'Numéro'],
]

const pct = (n: number | null) => (n === null ? '—' : `${Math.round(n * 100)} %`)
const dec = (n: number | null) => (n === null ? '—' : n.toFixed(1).replace('.', ','))

interface Row {
  card: Card
  s: CardStats
  rate: number | null
  hint: number | null
}

export function PerformanceView({ cards, stats, onReset }: { cards: Card[]; stats: StatsStore; onReset: () => void }) {
  const [sort, setSort] = useState<Sort>('rate')
  const [showUnplayed, setShowUnplayed] = useState(false)

  const rows = useMemo<Row[]>(
    () =>
      cards.map((card) => {
        const s = stats[card.id] ?? emptyStats()
        return { card, s, rate: rate(s), hint: averageHint(s) }
      }),
    [cards, stats],
  )

  const played = rows.filter((r) => r.s.played > 0)
  const totalPlays = played.reduce((a, r) => a + r.s.played, 0)
  const totalFound = played.reduce((a, r) => a + r.s.found, 0)
  const neverFound = played.filter((r) => r.s.found === 0).length
  const hintSum = played.reduce((a, r) => a + r.s.foundAfter.reduce((x, n, i) => x + n * i, 0), 0)

  const sorted = (showUnplayed ? rows : played).slice().sort((a, b) => {
    switch (sort) {
      case 'rate':
        return (a.rate ?? 2) - (b.rate ?? 2) || b.s.played - a.s.played
      case 'played':
        return b.s.played - a.s.played || a.card.id - b.card.id
      case 'hint':
        return (b.hint ?? -1) - (a.hint ?? -1)
      default:
        return a.card.id - b.card.id
    }
  })

  const exportCsv = () => {
    const head = ['numero', 'ref', 'jouee', 'trouvee', 'taux', 'sans_indice', 'apres_indice_1', 'apres_indice_2', 'apres_indice_3', 'jamais_trouvee', 'indice_moyen', 'active']
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const lines = rows.map((r) =>
      [
        r.card.id,
        r.card.ref,
        r.s.played,
        r.s.found,
        r.rate === null ? '' : Math.round(r.rate * 100),
        ...r.s.foundAfter,
        r.s.played - r.s.found,
        r.hint === null ? '' : r.hint.toFixed(2),
        r.card.disabled ? 'non' : 'oui',
      ]
        .map(esc)
        .join(';'),
    )
    downloadFile(`iconique-performance-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + [head.join(';'), ...lines].join('\n'), 'text/csv')
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-px border-2 border-noir bg-noir">
        <Kpi label="Refs jouées" value={String(totalPlays)} />
        <Kpi label="Cartes testées" value={`${played.length}/${cards.length}`} />
        <Kpi label="Taux moyen" value={pct(totalPlays ? totalFound / totalPlays : null)} accent />
        <Kpi label="Indice moyen" value={dec(totalFound ? hintSum / totalFound : null)} />
        <Kpi label="Jamais trouvées" value={String(neverFound)} wide />
      </div>

      <div className="mb-3 flex gap-1 overflow-x-auto">
        {SORTS.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setSort(key)} className={`label min-h-10 shrink-0 border-2 border-noir px-3 ${sort === key ? 'bg-noir text-creme' : ''}`}>
            {label}
          </button>
        ))}
      </div>
      <label className="mb-5 flex min-h-10 items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={showUnplayed} onChange={(e) => setShowUnplayed(e.target.checked)} className="size-5 accent-noir" />
        Afficher les cartes jamais jouées
      </label>

      {sorted.length === 0 && <p className="py-10 text-center font-semibold opacity-60">Aucune donnée pour l'instant. Lancez une partie !</p>}

      <ol className="border-t-2 border-noir">
        {sorted.map((r) => (
          <PerfRow key={r.card.id} row={r} />
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-2">
        <button type="button" onClick={exportCsv} className="display min-h-13 border-2 border-noir text-xl">
          Exporter en CSV
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Effacer toutes les statistiques ? Cette action est définitive.')) {
              resetStats()
              onReset()
            }
          }}
          className="min-h-11 text-sm font-semibold underline underline-offset-4 opacity-60"
        >
          Réinitialiser les statistiques
        </button>
      </div>
    </div>
  )
}

function Kpi({ label, value, accent = false, wide = false }: { label: string; value: string; accent?: boolean; wide?: boolean }) {
  return (
    <div className={`px-4 py-3 ${accent ? 'bg-jaune' : 'bg-creme'} ${wide ? 'col-span-2' : ''}`}>
      <p className="label opacity-60">{label}</p>
      <p className="display mt-1 text-4xl leading-none">{value}</p>
    </div>
  )
}

const BUCKETS = ['Sans indice', 'Indice 1', 'Indice 2', 'Indice 3'] as const

function PerfRow({ row }: { row: Row }) {
  const { card, s } = row
  const never = s.played - s.found
  const flag = s.played > 0 && s.found === 0
  return (
    <li className={`border-b border-noir/25 py-4 ${card.disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="display w-12 shrink-0 text-2xl leading-none opacity-40">{formatNumber(card.id)}</span>
        <div className="min-w-0 flex-1">
          <p className="display text-xl leading-tight">{card.ref}</p>
          {flag && <span className="label mt-1 inline-block bg-noir px-1.5 py-0.5 text-[9px] text-creme">Jamais trouvée</span>}
        </div>
        <span className={`display shrink-0 text-3xl leading-none ${row.rate !== null && row.rate < 0.5 ? 'bg-noir px-1 text-jaune' : ''}`}>{pct(row.rate)}</span>
      </div>
      <div className="mt-2 ml-15 grid grid-cols-3 gap-x-3 text-[13px] font-semibold">
        <span>Jouée : {s.played}</span>
        <span>Trouvée : {s.found}</span>
        <span>Ind. moy. : {dec(row.hint)}</span>
      </div>
      {s.played > 0 && (
        <div className="mt-2 ml-15">
          <div className="flex h-3 w-full overflow-hidden border border-noir">
            {s.foundAfter.map((n, i) => (n > 0 ? <span key={i} className={['bg-noir', 'bg-noir/75', 'bg-noir/50', 'bg-noir/25'][i]} style={{ flexGrow: n }} /> : null))}
            {never > 0 && <span className="stripes text-noir/30" style={{ flexGrow: never }} />}
          </div>
          <p className="mt-1 text-[11px] font-medium opacity-70">
            {s.foundAfter.map((n, i) => `${BUCKETS[i]} : ${n}`).join(' · ')} · Jamais : {never}
          </p>
        </div>
      )}
    </li>
  )
}
