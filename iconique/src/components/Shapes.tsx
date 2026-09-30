/** Éléments graphiques de l'identité ICONIQUE : demi-cercles, trames, rayures. */

type Side = 'top' | 'bottom' | 'left' | 'right'

const ROTATE: Record<Side, string> = {
  bottom: 'rounded-t-full',
  top: 'rounded-b-full',
  left: 'rounded-r-full',
  right: 'rounded-l-full',
}

export function HalfCircle({ side = 'bottom', className = '' }: { side?: Side; className?: string }) {
  const shape = side === 'top' || side === 'bottom' ? 'aspect-[2/1]' : 'aspect-[1/2]'
  return <div aria-hidden className={`pointer-events-none absolute ${shape} ${ROTATE[side]} ${className}`} />
}

export function Dots({ className = '', large = false }: { className?: string; large?: boolean }) {
  return <div aria-hidden className={`pointer-events-none absolute ${large ? 'dots-lg' : 'dots'} ${className}`} />
}

export function Stripes({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute stripes ${className}`} />
}

export function Disc({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute rounded-full ${className}`} />
}
