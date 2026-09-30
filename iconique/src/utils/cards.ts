import { cards as baseCards } from '../data/cards'
import type { Card, CardData, CardOverrides } from '../types'
import { KEYS, load, save } from './storage'

const EMPTY: CardOverrides = { edits: {}, disabled: [], added: [] }

export function loadOverrides(): CardOverrides {
  const o = load<Partial<CardOverrides>>(KEYS.overrides, EMPTY)
  return { edits: o.edits ?? {}, disabled: o.disabled ?? [], added: o.added ?? [] }
}

export function saveOverrides(o: CardOverrides): void {
  save(KEYS.overrides, o)
}

/** Fusionne src/data/cards.ts avec les modifications faites dans /admin. */
export function getAllCards(o: CardOverrides = loadOverrides()): Card[] {
  const disabled = new Set(o.disabled)
  const base = baseCards.map<Card>((c) => {
    const edit = o.edits[c.id]
    return { ...c, ...edit, id: c.id, disabled: disabled.has(c.id), custom: false, edited: !!edit }
  })
  const added = o.added.map<Card>((c) => ({ ...c, disabled: disabled.has(c.id), custom: true, edited: false }))
  return [...base, ...added].sort((a, b) => a.id - b.id)
}

export function getCardMap(): Map<number, Card> {
  return new Map(getAllCards().map((c) => [c.id, c]))
}

export function nextCardId(all: Card[]): number {
  return all.reduce((max, c) => Math.max(max, c.id), 0) + 1
}

export function toCardData(c: Card): CardData {
  const { id, ref, indice1, indice2, indice3, source, annee } = c
  return { id, ref, indice1, indice2, indice3, source, annee }
}

export function formatNumber(id: number): string {
  return String(id).padStart(3, '0')
}
