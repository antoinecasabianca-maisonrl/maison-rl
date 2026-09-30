import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'outline-light' | 'light'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-noir text-creme active:bg-[#222]',
  accent: 'bg-jaune text-noir shadow-[4px_4px_0_#0a0a0a] active:shadow-[1px_1px_0_#0a0a0a] active:translate-x-[3px] active:translate-y-[3px]',
  outline: 'bg-transparent text-noir border-2 border-noir active:bg-noir active:text-creme',
  'outline-light': 'bg-transparent text-creme border-2 border-creme/80 active:bg-creme active:text-noir',
  light: 'bg-creme text-noir active:bg-creme-2',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'lg' | 'md'
}

export function Button({ variant = 'primary', size = 'lg', className = '', ...rest }: Props) {
  const sizing = size === 'lg' ? 'min-h-16 text-[26px] px-6' : 'min-h-13 text-xl px-5'
  return (
    <button
      type="button"
      className={`display w-full select-none rounded-none tracking-wide transition-[transform,box-shadow,background-color] duration-100 disabled:opacity-30 ${sizing} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}

/** Lien texte discret. */
export function TextLink({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`min-h-11 px-2 text-sm font-semibold underline decoration-1 underline-offset-4 opacity-70 active:opacity-100 ${className}`}
      {...rest}
    />
  )
}
