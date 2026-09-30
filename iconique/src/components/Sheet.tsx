import { useEffect, type ReactNode } from 'react'

/** Panneau qui monte du bas de l'écran. */
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer le panneau" tabIndex={-1} className="anim-fade absolute inset-0 bg-noir/60" onClick={onClose} />
      <div className="paper anim-sheet relative max-h-[88dvh] w-full max-w-[520px] overflow-y-auto px-6 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))] text-noir">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="display pt-2 text-4xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="-mr-2 flex size-11 shrink-0 items-center justify-center text-3xl leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
