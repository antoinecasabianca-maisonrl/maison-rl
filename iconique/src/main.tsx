import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton/latin.css'
import '@fontsource-variable/montserrat/wght.css'
import '@fontsource-variable/montserrat/wght-italic.css'
import './index.css'
import App from './App'
import { GameProvider } from './context/GameContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
