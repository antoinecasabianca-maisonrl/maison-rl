import type { CardStats, HintCount, StatsStore } from '../types'
import { KEYS, load, save } from './storage'

export function emptyStats(): CardStats {
  return { played: 0, found: 0, foundAfter: [0, 0, 0, 0] }
}

export function loadStats(): StatsStore {
  return load<StatsStore>(KEYS.stats, {})
}

/** Enregistre (delta = 1) ou annule (delta = -1) le résultat d'un tour. */
export function recordResult(cardId: number, found: boolean, hints: HintCount, delta: 1 | -1 = 1): void {
  const all = loadStats()
  const s = all[cardId] ?? emptyStats()
  s.played = Math.max(0, s.played + delta)
  if (found) {
    s.found = Math.max(0, s.found + delta)
    s.foundAfter[hints] = Math.max(0, s.foundAfter[hints] + delta)
  }
  all[cardId] = s
  save(KEYS.stats, all)
}

export function resetStats(): void {
  save(KEYS.stats, {})
}

export function rate(s: CardStats): number | null {
  return s.played ? s.found / s.played : null
}

/** Nombre moyen d'indices révélés quand la carte est trouvée. */
export function averageHint(s: CardStats): number | null {
  if (!s.found) return null
  const sum = s.foundAfter.reduce((acc, n, i) => acc + n * i, 0)
  return sum / s.found
}
