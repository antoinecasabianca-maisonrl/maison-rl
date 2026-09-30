import { Button, TextLink } from '../components/Button'
import { Logo } from '../components/Logo'
import { Dots, HalfCircle, Stripes } from '../components/Shapes'

export function HomeScreen({ onPlay, onHowTo }: { onPlay: () => void; onHowTo: () => void }) {
  return (
    <main className="screen paper relative flex flex-col overflow-hidden">
      <Dots className="top-10 right-5 h-28 w-28 text-noir/80" />
      <HalfCircle side="bottom" className="-bottom-1 left-1/2 w-[130%] max-w-[640px] -translate-x-1/2 bg-jaune" />
      <Stripes className="bottom-[24%] -left-8 h-6 w-40 -rotate-12 text-noir" />

      <div className="relative flex flex-1 flex-col px-6 pt-[14dvh]">
        <p className="label anim-rise mb-4">Jeu de 100 références</p>
        <h1 className="anim-rise text-[clamp(64px,22vw,128px)]" style={{ animationDelay: '60ms' }}>
          <Logo />
        </h1>
        <p className="anim-rise mt-5 text-2xl font-semibold italic" style={{ animationDelay: '120ms' }}>
          T'as la ref&nbsp;?
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center gap-3 px-6 pb-8">
        <Button variant="primary" onClick={onPlay} className="anim-rise text-[32px]" style={{ animationDelay: '180ms' }}>
          Jouer
        </Button>
        <TextLink onClick={onHowTo}>Comment jouer ?</TextLink>
      </div>
    </main>
  )
}
