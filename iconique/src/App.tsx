import { useEffect, useState } from 'react'
import { useGame } from './context/GameContext'
import { AdminScreen } from './screens/admin/AdminScreen'
import { EndScreen } from './screens/EndScreen'
import { HomeScreen } from './screens/HomeScreen'
import { HowToScreen } from './screens/HowToScreen'
import { PassScreen } from './screens/PassScreen'
import { PlayScreen } from './screens/PlayScreen'
import { SetupScreen } from './screens/SetupScreen'
import { TurnStartScreen } from './screens/TurnStartScreen'
import { useWakeLock } from './utils/useWakeLock'

type Route = 'home' | 'howto' | 'setup'

/** /admin (ou #admin si l'hébergeur ne gère pas les réécritures d'URL). */
function isAdminUrl(): boolean {
  return /\/admin\/?$/.test(location.pathname) || location.hash.startsWith('#admin')
}

export default function App() {
  const { game } = useGame()
  const [route, setRoute] = useState<Route>('home')
  const [admin, setAdmin] = useState(isAdminUrl)

  useEffect(() => {
    const onChange = () => setAdmin(isAdminUrl())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  // Chaque changement d'écran repart du haut.
  const screenKey = admin ? 'admin' : game ? `${game.phase}-${game.history.length}` : route
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screenKey])

  useWakeLock(!!game && game.phase !== 'end' && !admin)

  if (admin) return <AdminScreen />

  if (game) {
    switch (game.phase) {
      case 'turnStart':
        return <TurnStartScreen />
      case 'play':
      case 'claimed':
        return <PlayScreen />
      case 'pass':
        return <PassScreen />
      case 'end':
        return <EndScreen onNewGame={() => setRoute('setup')} />
    }
  }

  if (route === 'howto') return <HowToScreen onBack={() => setRoute('home')} />
  if (route === 'setup') return <SetupScreen onBack={() => setRoute('home')} />
  return <HomeScreen onPlay={() => setRoute('setup')} onHowTo={() => setRoute('howto')} />
}
