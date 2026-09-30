import { Button } from '../components/Button'
import { Dots } from '../components/Shapes'

const STEPS: [string, string][] = [
  ['Tu tiens le téléphone', 'Tu es le seul à voir la ref. Personne ne regarde.'],
  ['Tu fais deviner', 'Révèle les indices un par un et lis-les aux autres. Trois indices, pas un de plus.'],
  ['Qui a trouvé ?', 'Le premier qui donne la ref gagne la carte. Personne ? Personne ne marque.'],
  ['Tu passes', 'Le téléphone passe au joueur suivant, toujours dans le même sens.'],
  ['Qui est iconique ?', 'À la fin, celui qui a le plus de refs gagne.'],
]

export function HowToScreen({ onBack }: { onBack: () => void }) {
  return (
    <main className="screen paper relative overflow-hidden">
      <Dots className="top-6 right-5 h-20 w-20 text-jaune" large />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[520px] flex-col px-6 pt-10 pb-8">
        <p className="label mb-3">Règles</p>
        <h1 className="display mb-8 text-6xl">Comment jouer&nbsp;?</h1>
        <ol className="flex-1 space-y-6">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="anim-rise flex gap-4" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="display w-10 shrink-0 text-5xl text-jaune [-webkit-text-stroke:1.5px_#0a0a0a]">{i + 1}</span>
              <div>
                <h2 className="display text-2xl">{title}</h2>
                <p className="mt-1 text-[15px] leading-snug font-medium">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button className="mt-10" onClick={onBack}>
          Compris
        </Button>
      </div>
    </main>
  )
}
