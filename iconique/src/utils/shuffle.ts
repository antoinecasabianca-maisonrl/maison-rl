/** Mélange de Fisher-Yates (renvoie une copie). */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Construit le paquet d'une partie : toutes les cartes actives, mélangées.
 * Les cartes de `playLast` (ex. celles de la partie précédente) sont placées
 * à la fin pour éviter de rejouer les mêmes refs en « Rejouer ».
 */
export function buildDeck(ids: number[], playLast: number[] = []): number[] {
  const last = new Set(playLast)
  return [...shuffle(ids.filter((id) => !last.has(id))), ...shuffle(ids.filter((id) => last.has(id)))]
}
