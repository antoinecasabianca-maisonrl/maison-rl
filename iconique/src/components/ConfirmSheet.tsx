import { Button } from './Button'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSheet({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      {message && <p className="mb-6 text-[15px] leading-relaxed font-medium">{message}</p>}
      <div className="flex flex-col gap-3">
        <Button onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </Sheet>
  )
}
