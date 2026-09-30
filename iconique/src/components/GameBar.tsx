import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { ConfirmSheet } from './ConfirmSheet'
import { ScoreList } from './ScoreList'
import { Sheet } from './Sheet'
import { Button } from './Button'

/** Barre discrète en haut des écrans de jeu : compteur, SCORE, menu. */
export function GameBar({ dark = false }: { dark?: boolean }) {
  const { game, endGame, quitGame } = useGame()
  const [scoreOpen, setScoreOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirm, setConfirm] = useState<null | 'quit' | 'end'>(null)
  if (!game) return null

  const played = game.history.length
  const current = Math.min(played + (game.phase === 'pass' ? 0 : 1), game.length ?? Infinity)
  const counter = game.length ? `Ref ${String(current).padStart(2, '0')} / ${game.length}` : `Ref ${String(current).padStart(2, '0')} · Mode libre`
  const tone = dark ? 'text-creme' : 'text-noir'

  return (
    <>
      <div className={`relative z-10 flex items-center justify-between gap-2 px-4 pt-2 ${tone}`}>
        <span className="label opacity-60">{counter}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setScoreOpen(true)} className={`label min-h-11 border px-3 ${dark ? 'border-creme/40' : 'border-noir/40'}`}>
            Score
          </button>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Menu" className="flex min-h-11 min-w-11 items-center justify-center gap-[3px]">
            <span className="size-[5px] rounded-full bg-current" />
            <span className="size-[5px] rounded-full bg-current" />
            <span className="size-[5px] rounded-full bg-current" />
          </button>
        </div>
      </div>

      <Sheet open={scoreOpen} onClose={() => setScoreOpen(false)} title="Score">
        <ScoreList players={game.players} scores={game.scores} />
        <p className="label mt-4 opacity-50">{played} {played > 1 ? 'refs jouées' : 'ref jouée'}</p>
      </Sheet>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Pause">
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={() => setMenuOpen(false)}>
            Reprendre
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setMenuOpen(false)
              setConfirm('end')
            }}
          >
            Terminer la partie
          </Button>
          <button
            type="button"
            className="mt-2 min-h-11 text-sm font-semibold underline underline-offset-4 opacity-70"
            onClick={() => {
              setMenuOpen(false)
              setConfirm('quit')
            }}
          >
            Quitter la partie
          </button>
        </div>
      </Sheet>

      <ConfirmSheet
        open={confirm === 'end'}
        title="Terminer ?"
        message="On arrête ici et on affiche le classement. La ref en cours ne compte pas."
        confirmLabel="Voir le classement"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          endGame()
        }}
      />
      <ConfirmSheet
        open={confirm === 'quit'}
        title="Quitter la partie ?"
        message="La partie en cours sera perdue. Les statistiques des refs déjà jouées sont conservées."
        confirmLabel="Quitter"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          quitGame()
        }}
      />
    </>
  )
}
