import { Button } from '../components/Button'
import { GameBar } from '../components/GameBar'
import { Disc, Dots, HalfCircle } from '../components/Shapes'
import { useGame } from '../context/GameContext'

/** « À TOI, ANTOINE. » — la ref reste cachée tant que le joueur n'a pas appuyé. */
export function TurnStartScreen() {
  const { giver, showCard } = useGame()
  if (!giver) return null
  return (
    <main className="screen paper-dark relative flex flex-col overflow-hidden text-creme">
      <GameBar dark />
      <HalfCircle side="top" className="top-16 right-[-15%] w-[70%] max-w-[360px] bg-jaune" />
      <Dots className="bottom-40 left-6 h-16 w-28 text-creme/40" />
      <Disc className="right-8 bottom-44 size-5 bg-jaune" />

      <div key={giver.id} className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center px-6">
        <p className="display anim-rise text-[clamp(56px,17vw,96px)] leading-[1.1]">À toi,</p>
        <p className="display anim-rise mt-2 text-[clamp(56px,17vw,96px)] break-words text-jaune" style={{ animationDelay: '60ms' }}>
          {giver.name}.
        </p>
        <p className="anim-rise mt-6 text-lg font-semibold" style={{ animationDelay: '120ms' }}>
          Personne ne regarde 👀
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-[520px] px-6 pb-8">
        <Button variant="accent" onClick={showCard} className="shadow-[4px_4px_0_#f3f0e6] active:shadow-[1px_1px_0_#f3f0e6]">
          Voir ma ref
        </Button>
      </div>
    </main>
  )
}
