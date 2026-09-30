/** Accès localStorage tolérant aux erreurs (navigation privée, quota…). */
export const KEYS = {
  game: 'iconique:game:v1',
  lastSetup: 'iconique:lastSetup:v1',
  overrides: 'iconique:cards:v1',
  stats: 'iconique:stats:v1',
} as const

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage indisponible : le jeu continue sans persistance
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
