import { useRef, useState, type ReactNode } from 'react'
import { Button, TextLink } from '../components/Button'
import { Dots, HalfCircle } from '../components/Shapes'
import { useGame } from '../context/GameContext'
import type { GameLength } from '../types'

const MIN = 2
const MAX = 12

const LENGTHS: { value: GameLength; title: string; detail: string }[] = [
  { value: 10, title: 'Partie rapide', detail: '10 refs' },
  { value: 20, title: 'Partie classique', detail: '20 refs' },
  { value: 30, title: 'Partie longue', detail: '30 refs' },
  { value: null, title: 'Mode libre', detail: 'On arrête quand on veut' },
]

type Step = 'count' | 'names' | 'length'
const STEP_NUMBER: Record<Step, number> = { count: 1, names: 2, length: 3 }

/** Rend les prénoms uniques (« Paul », « Paul 2 »…) et remplit les vides. */
function finalNames(names: string[]): string[] {
  const seen = new Map<string, number>()
  return names.map((raw, i) => {
    const name = raw.trim() || `Joueur ${i + 1}`
    const key = name.toLowerCase()
    const n = (seen.get(key) ?? 0) + 1
    seen.set(key, n)
    return n > 1 ? `${name} ${n}` : name
  })
}

export function SetupScreen({ onBack }: { onBack: () => void }) {
  const { lastSetup, startGame } = useGame()
  const [step, setStep] = useState<Step>('count')
  const [count, setCount] = useState(lastSetup?.names.length ?? 4)
  const [names, setNames] = useState<string[]>(() => lastSetup?.names.filter((n) => !/^Joueur \d+$/.test(n)) ?? [])
  const [length, setLength] = useState<GameLength>(lastSetup ? lastSetup.length : 20)
  const [noNames, setNoNames] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const back = () => {
    if (step === 'count') onBack()
    else if (step === 'names') setStep('count')
    else setStep(noNames ? 'count' : 'names')
  }

  const launch = () => {
    const list = noNames ? Array.from({ length: count }, (_, i) => `Joueur ${i + 1}`) : finalNames(Array.from({ length: count }, (_, i) => names[i] ?? ''))
    if (!startGame(list, length)) setError('Aucune carte active. Réactivez des cartes dans /admin.')
  }

  return (
    <main className="screen paper relative overflow-hidden">
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[520px] flex-col px-6 pt-4 pb-8">
        <header className="mb-8 flex items-center justify-between">
          <button type="button" onClick={back} className="label -ml-2 min-h-11 px-2" aria-label="Retour">
            ← Retour
          </button>
          <span className="label opacity-60">{String(STEP_NUMBER[step]).padStart(2, '0')} / 03</span>
        </header>

        {step === 'count' && (
          <Step key="count" title="Vous êtes combien ?">
            <Dots className="-right-10 bottom-40 h-32 w-32 text-jaune" large />
            <div className="relative flex flex-1 items-center justify-between gap-2 py-6">
              <StepperButton label="Moins" disabled={count <= MIN} onClick={() => setCount((c) => Math.max(MIN, c - 1))}>
                −
              </StepperButton>
              <div className="flex flex-col items-center">
                <span key={count} className="display anim-pop text-[clamp(120px,44vw,200px)] leading-none" aria-live="polite">
                  {count}
                </span>
                <span className="label -mt-1">joueurs</span>
              </div>
              <StepperButton label="Plus" disabled={count >= MAX} onClick={() => setCount((c) => Math.min(MAX, c + 1))}>
                +
              </StepperButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={() => {
                  setNoNames(false)
                  setStep('names')
                }}
              >
                Suivant
              </Button>
              <TextLink
                onClick={() => {
                  setNoNames(true)
                  setStep('length')
                }}
              >
                Jouer sans prénoms
              </TextLink>
            </div>
          </Step>
        )}

        {step === 'names' && (
          <Step key="names" title="Vos prénoms">
            <p className="mb-5 -mt-3 text-[15px] font-medium">Dans l'ordre où le téléphone va tourner.</p>
            <form
              className="flex flex-1 flex-col"
              onSubmit={(e) => {
                e.preventDefault()
                setStep('length')
              }}
            >
              <ol className="mb-6 flex-1 space-y-2">
                {Array.from({ length: count }, (_, i) => (
                  <li key={i} className="anim-rise flex items-center gap-3 border-b-2 border-noir" style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}>
                    <span className="display w-7 text-2xl text-noir/35">{i + 1}</span>
                    <input
                      ref={(el) => {
                        inputs.current[i] = el
                      }}
                      value={names[i] ?? ''}
                      onChange={(e) => {
                        const next = [...names]
                        next[i] = e.target.value
                        setNames(next)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && i < count - 1) {
                          e.preventDefault()
                          inputs.current[i + 1]?.focus()
                        }
                      }}
                      placeholder={`Joueur ${i + 1}`}
                      maxLength={16}
                      autoCapitalize="words"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint={i < count - 1 ? 'next' : 'done'}
                      className="display min-h-14 w-full bg-transparent text-3xl outline-none placeholder:text-noir/20"
                    />
                  </li>
                ))}
              </ol>
              <div className="flex flex-col items-center gap-2">
                <Button type="submit">Suivant</Button>
                <TextLink
                  onClick={() => {
                    setNoNames(true)
                    setStep('length')
                  }}
                >
                  Jouer sans prénoms
                </TextLink>
              </div>
            </form>
          </Step>
        )}

        {step === 'length' && (
          <Step key="length" title="Combien de refs ?">
            <HalfCircle side="left" className="-top-4 -right-6 h-28 bg-jaune" />
            <div className="relative mb-6 flex-1 space-y-2" role="radiogroup">
              {LENGTHS.map((l, i) => {
                const active = l.value === length
                return (
                  <button
                    key={l.title}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLength(l.value)}
                    className={`anim-rise flex min-h-[72px] w-full items-center justify-between border-2 border-noir px-5 py-2 text-left transition-colors duration-150 ${active ? 'bg-noir text-creme' : 'bg-creme/70'}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span>
                      <span className="display block text-[28px] leading-tight">{l.title}</span>
                      <span className="label opacity-70">{l.detail}</span>
                    </span>
                    <span className={`display text-5xl ${active ? 'text-jaune' : 'text-noir/20'}`}>{l.value ?? '∞'}</span>
                  </button>
                )
              })}
            </div>
            {error && <p className="mb-3 text-sm font-semibold">{error}</p>}
            <Button variant="accent" onClick={launch}>
              Lancer la partie
            </Button>
          </Step>
        )}
      </div>
    </main>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="anim-slide relative flex flex-1 flex-col">
      <h1 className="display relative mb-6 text-[clamp(48px,14vw,72px)] leading-[1.02]">{title}</h1>
      {children}
    </section>
  )
}

function StepperButton({ children, label, disabled, onClick }: { children: ReactNode; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="display flex size-18 shrink-0 items-center justify-center rounded-full border-2 border-noir text-5xl transition-colors duration-100 active:bg-noir active:text-creme disabled:opacity-20"
    >
      {children}
    </button>
  )
}
