import { useLayoutEffect, useRef, useState } from 'react'

/** Largeur moyenne d'un caractère Anton en capitales, en em (marge incluse). */
const CHAR_W = 0.5
const LINE_H = 1.16

/**
 * Affiche une référence en très grand, en adaptant la taille pour qu'elle
 * tienne dans la largeur (mot le plus long) et dans une hauteur cible.
 */
export function RefText({ text, maxHeight, maxSize = 132, className = '' }: { text: string; maxHeight: number; maxSize?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(340)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const longest = Math.max(...text.split(/\s+/).map((w) => w.length), 1)
  const byWord = width / (longest * CHAR_W)
  const byArea = Math.sqrt((width * maxHeight) / (text.length * CHAR_W * LINE_H))
  const size = Math.max(22, Math.min(maxSize, byWord, byArea))

  return (
    <div ref={ref} className={`w-full ${className}`}>
      <h1 className="display break-words hyphens-auto" style={{ fontSize: `${size}px`, lineHeight: LINE_H }} lang="fr">
        {text}
      </h1>
    </div>
  )
}
