import { useEffect, useState } from 'react'
import { GameBar } from '../components/GameBar'
import { RefText } from '../components/RefText'
import { refs } from '../components/ScoreList'
import { HalfCircle, Stripes } from '../components/Shapes'
import { useGame } from '../context/GameContext'
import type { Card, HintCount } from '../types'
import { formatNumber } from '../utils/cards'

const CLAIM_DURATION = 1500

export function PlayScreen() {
  const { game, currentCard, giver, revealHint, claim } = useGame()
  const [viewportH, setViewportH] = useState(() => window.innerHeight)

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!game || !giver || !currentCard) return null
  const others = game.players.filter((p) => p.id !== giver.id)

  return (
    <main className="screen paper relative overflow-x-hidden">
      <GameBar />
      <div className="relative mx-auto max-w-[520px] px-5 pb-10">
        {/* En-tête de carte */}
        <section className="anim-pop relative pt-4 pb-6">
          <div className="mb-4 flex items-end justify-between border-b-2 border-noir pb-2">
            <span className="label">Réf. Nº</span>
            <span className="display text-5xl leading-none">{formatNumber(currentCard.id)}</span>
          </div>
          <RefText text={currentCard.ref} maxHeight={Math.max(160, viewportH * 0.3)} />
          <p className="mt-4 text-[13px] font-semibold opacity-60">
            {currentCard.source}
            {currentCard.annee && currentCard.annee !== '—' ? ` · ${currentCard.annee}` : ''}
          </p>
        </section>

        {/* Indices progressifs */}
        <section aria-label="Indices" className="border-t-2 border-noir">
          {([1, 2, 3] as const).map((n) => (
            <Hint key={n} n={n} card={currentCard} revealed={game.hintsRevealed} onReveal={revealHint} />
          ))}
        </section>

        {/* Attribution */}
        <section className="relative mt-8 overflow-hidden bg-noir px-4 pt-5 pb-4 text-creme">
          <HalfCircle side="left" className="top-3 -right-6 h-16 bg-jaune" />
          <h2 className="display relative mb-4 text-4xl">Qui a trouvé&nbsp;?</h2>
          <div className="relative grid grid-cols-2 gap-2">
            {others.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => claim(p.id)}
                className="display min-h-16 truncate bg-creme px-3 text-2xl text-noir transition-colors duration-100 active:bg-jaune"
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => claim(null)}
              className={`display min-h-14 border-2 border-creme/50 px-3 text-xl text-creme/80 active:bg-creme active:text-noir ${others.length % 2 === 0 ? 'col-span-2' : ''}`}
            >
              Personne
            </button>
          </div>
        </section>
      </div>

      {game.phase === 'claimed' && <ClaimOverlay />}
    </main>
  )
}

function Hint({ n, card, revealed, onReveal }: { n: 1 | 2 | 3; card: Card; revealed: HintCount; onReveal: () => void }) {
  const text = card[`indice${n}`]
  const isOpen = revealed >= n
  const isNext = revealed === n - 1
  return (
    <div className={`flex gap-4 border-b border-noir/20 py-4 ${!isOpen && !isNext ? 'opacity-35' : ''}`}>
      <span className={`display w-8 shrink-0 text-5xl leading-none ${isOpen ? 'text-noir' : 'text-transparent [-webkit-text-stroke:1.5px_#0a0a0a]'}`}>{n}</span>
      <div className="min-w-0 flex-1">
        <p className="label mb-1">Indice {n}</p>
        {isOpen ? (
          <p className="anim-rise text-lg leading-snug font-semibold">{text || <em className="opacity-50">(indice vide)</em>}</p>
        ) : (
          <button
            type="button"
            disabled={!isNext}
            onClick={onReveal}
            className="display mt-1 flex min-h-12 w-full items-center justify-between bg-jaune px-4 text-xl text-noir transition-transform duration-100 active:scale-[0.98] disabled:bg-transparent disabled:outline-2 disabled:outline-dashed disabled:outline-noir/40"
          >
            <span>Révéler</span>
            <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </div>
  )
}

function ClaimOverlay() {
  const { game, lastTurn, playerById, finishClaim } = useGame()

  useEffect(() => {
    const t = window.setTimeout(finishClaim, CLAIM_DURATION)
    return () => window.clearTimeout(t)
  }, [finishClaim])

  if (!game || !lastTurn) return null
  const winner = lastTurn.winnerId ? playerById(lastTurn.winnerId) : null

  return (
    <button
      type="button"
      onClick={finishClaim}
      aria-live="assertive"
      className={`anim-fade fixed inset-0 z-40 flex flex-col items-start justify-center overflow-hidden px-6 text-left ${winner ? 'paper-yellow text-noir' : 'paper-dark text-creme'}`}
    >
      <Stripes className={`top-[12%] left-0 h-10 w-full ${winner ? 'text-noir' : 'text-creme/20'}`} />
      <div className="anim-pop relative mx-auto w-full max-w-[520px]">
        {winner ? (
          <>
            <p className="display text-[clamp(56px,17vw,104px)] break-words">{winner.name}</p>
            <p className="display text-[clamp(40px,12vw,72px)]">prend la ref&nbsp;✦</p>
            <p className="mt-8 flex items-center gap-3">
              <span className="display anim-bump inline-block bg-noir px-3 py-1 text-4xl text-jaune">+1</span>
              <span className="label text-sm">{refs(game.scores[winner.id] ?? 0)}</span>
            </p>
          </>
        ) : (
          <>
            <p className="display text-[clamp(56px,17vw,104px)]">Personne.</p>
            <p className="mt-4 text-lg font-semibold">La ref retourne dans la boîte.</p>
          </>
        )}
      </div>
    </button>
  )
}
