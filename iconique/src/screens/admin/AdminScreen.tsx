import { useState } from 'react'
import { Logo } from '../../components/Logo'
import { getAllCards, loadOverrides } from '../../utils/cards'
import { loadStats } from '../../utils/stats'
import { CardsView } from './CardsView'
import { PerformanceView } from './PerformanceView'

type Tab = 'cards' | 'perf'

/** Page cachée /admin : édition des cartes et performance des refs. */
export function AdminScreen() {
  const [tab, setTab] = useState<Tab>(() => (location.hash.includes('perf') ? 'perf' : 'cards'))
  const [overrides, setOverrides] = useState(loadOverrides)
  const [stats, setStats] = useState(loadStats)

  return (
    <main className="screen paper">
      <div className="mx-auto max-w-[720px] px-5 pt-6 pb-16">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <Logo className="text-4xl" />
            <p className="label mt-2">Mode test · Admin</p>
          </div>
          <a href="/" className="label min-h-11 border-2 border-noir px-3 py-3">
            ← Jeu
          </a>
        </header>

        <nav className="sticky top-0 z-10 -mx-5 mb-6 flex border-b-2 border-noir bg-creme px-5">
          {(
            [
              ['cards', 'Cartes'],
              ['perf', 'Performance des refs'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key)
                if (key === 'perf') setStats(loadStats())
              }}
              className={`display min-h-13 flex-1 text-lg ${tab === key ? 'bg-noir text-creme' : ''}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'cards' ? (
          <CardsView overrides={overrides} onChange={setOverrides} />
        ) : (
          <>
            <h1 className="display mb-5 text-5xl">Performance des refs</h1>
            <PerformanceView cards={getAllCards(overrides)} stats={stats} onReset={() => setStats(loadStats())} />
          </>
        )}
      </div>
    </main>
  )
}
