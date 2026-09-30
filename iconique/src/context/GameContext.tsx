import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Card, GameLength, GameState, HintCount, Player, TurnRecord } from '../types'
import { getAllCards } from '../utils/cards'
import { buildDeck } from '../utils/shuffle'
import { recordResult } from '../utils/stats'
import { KEYS, load, remove, save } from '../utils/storage'

export interface LastSetup {
  names: string[]
  length: GameLength
}

interface GameContextValue {
  game: GameState | null
  lastSetup: LastSetup | null
  /** Carte en cours (null hors tour). */
  currentCard: Card | null
  giver: Player | null
  /** Joueur suivant dans le sens de rotation. */
  nextPlayer: Player | null
  lastTurn: TurnRecord | null
  cardById: (id: number) => Card | undefined
  playerById: (id: string) => Player | undefined
  startGame: (names: string[], length: GameLength, playLast?: number[]) => boolean
  showCard: () => void
  revealHint: () => void
  claim: (winnerId: string | null) => void
  finishClaim: () => void
  undoLast: () => void
  confirmPass: () => void
  endGame: () => void
  quitGame: () => void
  replay: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function isValidGame(g: unknown): g is GameState {
  if (!g || typeof g !== 'object') return false
  const s = g as GameState
  return Array.isArray(s.players) && s.players.length >= 2 && Array.isArray(s.deck) && typeof s.phase === 'string'
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGameState] = useState<GameState | null>(() => {
    const saved = load<unknown>(KEYS.game, null)
    return isValidGame(saved) ? saved : null
  })
  const [lastSetup, setLastSetup] = useState<LastSetup | null>(() => load<LastSetup | null>(KEYS.lastSetup, null))
  const [cardsVersion, setCardsVersion] = useState(0)

  // Référence synchrone : les actions lisent l'état courant sans dépendre des closures.
  const gameRef = useRef(game)
  const setGame = useCallback((next: GameState | null) => {
    gameRef.current = next
    setGameState(next)
  }, [])

  useEffect(() => {
    if (game) save(KEYS.game, game)
    else remove(KEYS.game)
  }, [game])

  const cardMap = useMemo(() => {
    void cardsVersion
    return new Map(getAllCards().map((c) => [c.id, c]))
  }, [cardsVersion])

  const cardById = useCallback((id: number) => cardMap.get(id), [cardMap])
  const playerById = useCallback((id: string) => gameRef.current?.players.find((p) => p.id === id), [])

  const startGame = useCallback(
    (names: string[], length: GameLength, playLast: number[] = []) => {
      const cards = getAllCards().filter((c) => !c.disabled)
      if (cards.length === 0) return false
      setCardsVersion((v) => v + 1)
      const players: Player[] = names.map((name, i) => ({ id: `p${i}`, name: name.trim() || `Joueur ${i + 1}` }))
      const setup = { names: players.map((p) => p.name), length }
      setLastSetup(setup)
      save(KEYS.lastSetup, setup)
      setGame({
        players,
        length,
        deck: buildDeck(
          cards.map((c) => c.id),
          playLast,
        ),
        deckIndex: 0,
        activeIndex: 0,
        phase: 'turnStart',
        hintsRevealed: 0,
        scores: Object.fromEntries(players.map((p) => [p.id, 0])),
        history: [],
        startedAt: Date.now(),
      })
      return true
    },
    [setGame],
  )

  const showCard = useCallback(() => {
    const g = gameRef.current
    if (g?.phase === 'turnStart') setGame({ ...g, phase: 'play', hintsRevealed: 0 })
  }, [setGame])

  const revealHint = useCallback(() => {
    const g = gameRef.current
    if (g?.phase === 'play' && g.hintsRevealed < 3) setGame({ ...g, hintsRevealed: (g.hintsRevealed + 1) as HintCount })
  }, [setGame])

  const claim = useCallback(
    (winnerId: string | null) => {
      const g = gameRef.current
      if (g?.phase !== 'play') return
      const cardId = g.deck[g.deckIndex]
      const giver = g.players[g.activeIndex]
      const record: TurnRecord = { cardId, giverId: giver.id, winnerId, hintsRevealed: g.hintsRevealed }
      recordResult(cardId, winnerId !== null, g.hintsRevealed, 1)
      setGame({
        ...g,
        phase: 'claimed',
        scores: winnerId ? { ...g.scores, [winnerId]: (g.scores[winnerId] ?? 0) + 1 } : g.scores,
        history: [...g.history, record],
      })
    },
    [setGame],
  )

  /** Après l'animation d'attribution : fin de partie ou passage au joueur suivant. */
  const finishClaim = useCallback(() => {
    const g = gameRef.current
    if (g?.phase !== 'claimed') return
    const reachedLength = g.length !== null && g.history.length >= g.length
    const deckEmpty = g.deckIndex + 1 >= g.deck.length
    if (reachedLength || deckEmpty) {
      setGame({ ...g, phase: 'end' })
      return
    }
    setGame({
      ...g,
      phase: 'pass',
      deckIndex: g.deckIndex + 1,
      activeIndex: (g.activeIndex + 1) % g.players.length,
      hintsRevealed: 0,
    })
  }, [setGame])

  /** Annule la dernière attribution (erreur de doigt) et revient sur la carte. */
  const undoLast = useCallback(() => {
    const g = gameRef.current
    const last = g?.history[g.history.length - 1]
    if (!g || !last || (g.phase !== 'pass' && g.phase !== 'claimed')) return
    recordResult(last.cardId, last.winnerId !== null, last.hintsRevealed, -1)
    const giverIndex = g.players.findIndex((p) => p.id === last.giverId)
    const deckIndex = g.deck.indexOf(last.cardId)
    setGame({
      ...g,
      phase: 'play',
      activeIndex: giverIndex >= 0 ? giverIndex : g.activeIndex,
      deckIndex: deckIndex >= 0 ? deckIndex : g.deckIndex,
      hintsRevealed: last.hintsRevealed,
      scores: last.winnerId ? { ...g.scores, [last.winnerId]: Math.max(0, (g.scores[last.winnerId] ?? 0) - 1) } : g.scores,
      history: g.history.slice(0, -1),
    })
  }, [setGame])

  const confirmPass = useCallback(() => {
    const g = gameRef.current
    if (g?.phase === 'pass') setGame({ ...g, phase: 'turnStart' })
  }, [setGame])

  const endGame = useCallback(() => {
    const g = gameRef.current
    if (g && g.phase !== 'end') setGame({ ...g, phase: 'end', hintsRevealed: 0 })
  }, [setGame])

  const quitGame = useCallback(() => setGame(null), [setGame])

  const replay = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    startGame(
      g.players.map((p) => p.name),
      g.length,
      g.history.map((h) => h.cardId),
    )
  }, [startGame])

  const value = useMemo<GameContextValue>(() => {
    const inTurn = game && (game.phase === 'play' || game.phase === 'claimed')
    return {
      game,
      lastSetup,
      currentCard: inTurn ? (cardMap.get(game.deck[game.deckIndex]) ?? null) : null,
      giver: game ? game.players[game.activeIndex] : null,
      nextPlayer: game ? game.players[(game.activeIndex + 1) % game.players.length] : null,
      lastTurn: game?.history[game.history.length - 1] ?? null,
      cardById,
      playerById,
      startGame,
      showCard,
      revealHint,
      claim,
      finishClaim,
      undoLast,
      confirmPass,
      endGame,
      quitGame,
      replay,
    }
  }, [game, lastSetup, cardMap, cardById, playerById, startGame, showCard, revealHint, claim, finishClaim, undoLast, confirmPass, endGame, quitGame, replay])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame doit être utilisé dans <GameProvider>')
  return ctx
}
