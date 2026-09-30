import { Button } from '../components/Button'
import { GameBar } from '../components/GameBar'
import { Disc, Stripes } from '../components/Shapes'
import { useGame } from '../context/GameContext'

export function PassScreen() {
  const { giver, confirmPass, undoLast } = useGame()
  if (!giver) return null
  return (
    <main className="screen paper-yellow relative flex flex-col overflow-hidden text-noir">
      <GameBar />
      <Stripes className="top-[13%] -right-10 h-10 w-[60%] text-noir" />
      <Disc className="-right-24 bottom-[22%] size-48 bg-noir" />

      <div key={giver.id} className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6">
        <p className="label anim-rise mb-3">Tour suivant</p>
        <h1 className="display anim-rise text-[clamp(48px,14vw,84px)] leading-[1.14] break-words" style={{ animationDelay: '40ms' }}>
          Passe le téléphone à
          <span className="mt-2 block w-fit max-w-full bg-noir px-2 pt-1 text-jaune">{giver.name}.</span>
        </h1>
        <p className="anim-rise mt-6 text-lg font-semibold" style={{ animationDelay: '100ms' }}>
          Pas de triche.
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center gap-2 px-6 pb-8">
        <Button onClick={confirmPass}>Je l'ai</Button>
        <button type="button" onClick={undoLast} className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4 opacity-70">
          Oups, corriger l'attribution
        </button>
      </div>
    </main>
  )
}
