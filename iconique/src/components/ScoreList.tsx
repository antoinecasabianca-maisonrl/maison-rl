import type { Player } from '../types'

export interface Ranked {
  player: Player
  score: number
  rank: number
}

/** Classement avec ex æquo (1, 1, 3…). */
export function rankPlayers(players: Player[], scores: Record<string, number>): Ranked[] {
  const sorted = players.map((player, i) => ({ player, score: scores[player.id] ?? 0, i })).sort((a, b) => b.score - a.score || a.i - b.i)
  return sorted.map((r) => ({
    player: r.player,
    score: r.score,
    rank: sorted.findIndex((s) => s.score === r.score) + 1,
  }))
}

export function refs(n: number): string {
  return `${n} ${n > 1 ? 'refs' : 'ref'}`
}

export function ScoreList({ players, scores, highlightId }: { players: Player[]; scores: Record<string, number>; highlightId?: string | null }) {
  const ranked = rankPlayers(players, scores)
  return (
    <ol className="divide-y divide-noir/15 border-y-2 border-noir">
      {ranked.map((r) => (
        <li key={r.player.id} className="flex items-baseline gap-4 py-3">
          <span className="display w-7 text-2xl text-noir/35">{r.rank}</span>
          <span className="display flex-1 truncate text-3xl">{r.player.name}</span>
          <span key={`${r.player.id}-${r.score}`} className={`label text-sm ${highlightId === r.player.id ? 'anim-bump bg-jaune px-1.5 py-0.5' : ''}`}>
            {refs(r.score)}
          </span>
        </li>
      ))}
    </ol>
  )
}
