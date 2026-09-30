import { useState } from 'react'
import { Button, TextLink } from '../components/Button'
import { rankPlayers } from '../components/ScoreList'
import { Dots, HalfCircle } from '../components/Shapes'
import { useGame } from '../context/GameContext'
import { formatNumber } from '../utils/cards'

function winnerLine(names: string[]): string {
  if (names.length === 0) return "Personne n'est iconique."
  if (names.length === 1) return `${names[0]} est iconique.`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]} sont iconiques.`
}

export function EndScreen({ onNewGame }: { onNewGame: () => void }) {
  const { game, replay, quitGame, cardById, playerById } = useGame()
  const [showRefs, setShowRefs] = useState(false)
  if (!game) return null

  const ranked = rankPlayers(game.players, game.scores)
  const top = ranked[0]?.score ?? 0
  const winners = top > 0 ? ranked.filter((r) => r.score === top).map((r) => r.player.name) : []

  return (
    <main className="screen paper relative overflow-x-hidden">
      <HalfCircle side="bottom" className="top-[92px] -right-28 w-60 bg-jaune" />
      <Dots className="top-6 left-5 h-14 w-24 text-noir/70" />

      <div className="relative mx-auto max-w-[520px] px-6 pt-20 pb-10">
        <h1 className="display anim-rise text-[clamp(64px,20vw,112px)]">
          Fin de
          <br />
          partie.
        </h1>
        <p className="label mt-3 opacity-60">
          {game.history.length} {game.history.length > 1 ? 'refs jouées' : 'ref jouée'}
        </p>

        <ol className="mt-10 border-t-2 border-noir">
          {ranked.map((r, i) => {
            const isWinner = top > 0 && r.score === top
            return (
              <li
                key={r.player.id}
                className={`anim-rise flex items-center gap-4 border-b-2 border-noir py-4 ${isWinner ? 'bg-jaune -mx-6 px-6' : ''}`}
                style={{ animationDelay: `${80 + i * 50}ms` }}
              >
                <span className={`display w-10 text-5xl leading-none ${isWinner ? 'text-noir' : 'text-transparent [-webkit-text-stroke:1.5px_#0a0a0a]'}`}>{r.rank}</span>
                <span className="display min-w-0 flex-1 truncate text-4xl leading-none">{r.player.name}</span>
                <span className="text-right">
                  <span className="display block text-4xl leading-none">{r.score}</span>
                  <span className="label">{r.score > 1 ? 'refs' : 'ref'}</span>
                </span>
              </li>
            )
          })}
        </ol>

        <p className="display anim-pop mt-10 text-[clamp(40px,12vw,64px)] leading-[1.1]" style={{ animationDelay: `${120 + ranked.length * 50}ms` }}>
          {winnerLine(winners)}
          {winners.length > 0 && <span className="text-jaune [-webkit-text-stroke:1.5px_#0a0a0a]"> ✦</span>}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Button variant="accent" onClick={replay}>
            Rejouer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              quitGame()
              onNewGame()
            }}
          >
            Nouvelle partie
          </Button>
          {game.history.length > 0 && (
            <TextLink className="mt-2 self-center" onClick={() => setShowRefs((v) => !v)}>
              {showRefs ? 'Masquer les refs' : 'Voir les refs de la partie'}
            </TextLink>
          )}
        </div>

        {showRefs && (
          <ol className="anim-rise mt-6 border-t-2 border-noir">
            {game.history.map((h, i) => {
              const card = cardById(h.cardId)
              const winner = h.winnerId ? playerById(h.winnerId) : null
              const giver = playerById(h.giverId)
              return (
                <li key={`${h.cardId}-${i}`} className="border-b border-noir/20 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="label opacity-60">Nº {formatNumber(h.cardId)}</span>
                    <span className="label">{winner ? `${winner.name} ✦ ${h.hintsRevealed ? `indice ${h.hintsRevealed}` : 'sans indice'}` : 'Personne'}</span>
                  </div>
                  <p className="display mt-1 text-2xl">{card?.ref ?? 'Carte supprimée'}</p>
                  {giver && <p className="mt-1 text-xs font-semibold opacity-60">Fait deviner par {giver.name}</p>}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </main>
  )
}
