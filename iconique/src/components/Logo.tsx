/** Le logo texte « ICONIQUE. » — le point est un disque jaune. */
export function Logo({ className = '', dot = 'bg-jaune' }: { className?: string; dot?: string }) {
  return (
    <span className={`display inline-flex items-end leading-[0.8] ${className}`} aria-label="ICONIQUE.">
      ICONIQUE
      <span aria-hidden className={`ml-[0.04em] mb-[0.02em] inline-block size-[0.2em] rounded-full ${dot}`} />
    </span>
  )
}
