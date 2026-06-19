import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Minus, Plus, Loader2 } from 'lucide-react'

const ADJUST_REASONS = [
  'Received', 'Damage', 'Correction', 'Return', 'Theft', 'Manual Count',
]

interface AdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName?: string
  warehouseName?: string
  currentStock?: number
  onConfirm: (data: { reason: string; quantity: number; notes: string }) => Promise<void>
}

export default function AdjustDialog({
  open, onOpenChange, productName, warehouseName, currentStock, onConfirm,
}: AdjustDialogProps) {
  const [reason, setReason] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [isPositive, setIsPositive] = useState(true)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const initialFocus = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setReason('')
      setQuantity(0)
      setIsPositive(true)
      setNotes('')
      setSubmitting(false)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!reason || quantity <= 0) return
    setSubmitting(true)
    try {
      await onConfirm({ reason, quantity: isPositive ? quantity : -quantity, notes })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = reason && quantity > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {productName && <span className="font-medium text-[var(--color-text)]">{productName}</span>}
            {warehouseName && <span className="text-[var(--color-text-secondary)]"> &middot; {warehouseName}</span>}
            {currentStock !== undefined && (
              <span className="text-[var(--color-text-tertiary)]"> &middot; Current: {currentStock}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select reason...</option>
              {ADJUST_REASONS.map((r) => (
                <option key={r} value={r.toLowerCase()}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Quantity</label>
            <div className="flex items-center gap-2">
              <button
                ref={initialFocus}
                type="button"
                onClick={() => setIsPositive(!isPositive)}
                className={`w-10 h-10 rounded-md border text-sm font-medium transition-colors ${
                  isPositive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-600 dark:bg-red-950/20 dark:border-red-900'
                }`}
              >
                {isPositive ? <Plus className="w-4 h-4 mx-auto" /> : <Minus className="w-4 h-4 mx-auto" />}
              </button>
              <Input
                type="number"
                min={0}
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="font-mono text-center"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Notes <span className="text-xs text-[var(--color-text-tertiary)]">(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Add notes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!isValid || submitting}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Adjusting...</> : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
