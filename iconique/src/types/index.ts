/** Une carte du jeu, telle que définie dans src/data/cards.ts. */
export interface CardData {
  id: number
  ref: string
  indice1: string
  indice2: string
  indice3: string
  source: string
  annee: string
}

/** Une carte après application des modifications locales (admin). */
export interface Card extends CardData {
  disabled: boolean
  /** true si la carte a été créée depuis /admin (absente de cards.ts). */
  custom: boolean
  /** true si la carte de cards.ts a été modifiée depuis /admin. */
  edited: boolean
}

/** Modifications faites depuis /admin, stockées dans localStorage. */
export interface CardOverrides {
  edits: Record<number, Partial<CardData>>
  disabled: number[]
  added: CardData[]
}

export interface Player {
  id: string
  name: string
}

/** Nombre de refs de la partie. null = mode libre. */
export type GameLength = 10 | 20 | 30 | null

export type Phase = 'turnStart' | 'play' | 'claimed' | 'pass' | 'end'

/** Indices révélés au moment de l'attribution (0 à 3). */
export type HintCount = 0 | 1 | 2 | 3

export interface TurnRecord {
  cardId: number
  giverId: string
  /** id du joueur qui a trouvé, null si personne. */
  winnerId: string | null
  hintsRevealed: HintCount
}

export interface GameState {
  players: Player[]
  length: GameLength
  /** Ordre mélangé des ids de cartes pour cette partie. */
  deck: number[]
  /** Index dans le deck de la carte en cours. */
  deckIndex: number
  /** Index dans players du joueur qui fait deviner. */
  activeIndex: number
  phase: Phase
  hintsRevealed: HintCount
  scores: Record<string, number>
  history: TurnRecord[]
  startedAt: number
}

export interface CardStats {
  played: number
  found: number
  /** foundAfter[n] = trouvée avec n indices révélés (0 = sans indice). */
  foundAfter: [number, number, number, number]
}

export type StatsStore = Record<number, CardStats>
