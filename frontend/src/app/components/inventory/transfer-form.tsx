import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ArrowLeftRight } from 'lucide-react'
import { productsApi } from '@/api/products'
import { inventoryApi } from '@/api/inventory'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

interface TransferFormProps {
  onSuccess?: () => void
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
  const [productId, setProductId] = useState('')
  const [fromWh, setFromWh] = useState('')
  const [toWh, setToWh] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const { data: products } = useQuery({
    queryKey: ['products-transfer-search', productSearch],
    queryFn: () => productsApi.list({ search: productSearch || undefined, size: 10 }),
  })

  const { data: inventory } = useQuery({
    queryKey: ['product-inventory-transfer', productId],
    queryFn: () => inventoryApi.getByProduct(productId),
    enabled: !!productId,
  })

  const warehouses = inventory?.warehouses ?? []
  const fromWarehouse = warehouses.find((w) => w.warehouse_id === fromWh)
  const maxQty = fromWarehouse?.available_qty ?? 0
  const qtyPercent = maxQty > 0 ? Math.min(100, (quantity / maxQty) * 100) : 0

  const handleSubmit = async () => {
    if (!productId || !fromWh || !toWh || fromWh === toWh || quantity <= 0 || quantity > maxQty) return
    setSubmitting(true)
    try {
      await inventoryApi.transfer({
        product_id: productId,
        from_warehouse_id: fromWh,
        to_warehouse_id: toWh,
        quantity,
      })
      toast.success('Stock transferred successfully')
      setProductId('')
      setFromWh('')
      setToWh('')
      setQuantity(0)
      setNotes('')
      onSuccess?.()
    } catch {
      toast.error('Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = productId && fromWh && toWh && fromWh !== toWh && quantity > 0 && quantity <= maxQty

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 max-w-[600px]">
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeftRight className="w-5 h-5 text-[var(--color-brand)]" />
        <h2 className="text-lg font-semibold text-[var(--color-text)]">New Transfer</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Product</label>
          <div className="relative">
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="mb-1"
            />
            {products && products.items.length > 0 && !productId && (
              <div className="absolute z-10 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                {products.items.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-tertiary)] flex items-center justify-between"
                    onClick={() => { setProductId(p.id); setProductSearch(`${p.name} (${p.sku})`); setFromWh(''); setToWh('') }}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{p.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {productId && (
            <p className="text-xs text-[var(--color-text-tertiary)]">Selected: {productSearch}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Source Warehouse</label>
            <select
              value={fromWh}
              onChange={(e) => { setFromWh(e.target.value); if (toWh === e.target.value) setToWh('') }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select source...</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.warehouse_name} ({w.available_qty} available)
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Target Warehouse</label>
            <select
              value={toWh}
              onChange={(e) => setToWh(e.target.value)}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${
                fromWh && toWh === fromWh ? 'border-red-500' : 'border-input'
              }`}
            >
              <option value="">Select target...</option>
              {warehouses.filter((w) => w.warehouse_id !== fromWh).map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.warehouse_name} ({w.available_qty} available)
                </option>
              ))}
            </select>
            {fromWh && toWh === fromWh && (
              <p className="text-xs text-red-500">Source and target must be different</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Quantity</label>
          <Input
            type="number"
            min={0}
            max={maxQty}
            value={quantity || ''}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="font-mono"
            placeholder="0"
          />
          {quantity > 0 && maxQty > 0 && (
            <div className="mt-2">
              <div className="h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    qtyPercent > 80 ? 'bg-red-500' : qtyPercent > 50 ? 'bg-amber-500' : 'bg-[var(--color-brand)]'
                  }`}
                  style={{ width: `${qtyPercent}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {quantity} of {maxQty} available ({Math.round(qtyPercent)}%)
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Notes <span className="text-xs text-[var(--color-text-tertiary)]">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            placeholder="Transfer notes..."
          />
        </div>

        <Button onClick={handleSubmit} disabled={!isValid || submitting} className="w-full h-10">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Transferring...</> : 'Transfer Stock'}
        </Button>
      </div>
    </div>
  )
}
