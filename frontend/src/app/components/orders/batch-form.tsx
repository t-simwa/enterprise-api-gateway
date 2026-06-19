import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'
import { productsApi } from '@/api/products'
import { ordersApi } from '@/api/orders'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

interface ManualRow {
  id: string
  productSearch: string
  productId: string
  quantity: number
  customerName: string
}

export default function BatchForm() {
  const [rows, setRows] = useState<ManualRow[]>([
    { id: crypto.randomUUID(), productSearch: '', productId: '', quantity: 1, customerName: '' },
  ])
  const [submitting, setSubmitting] = useState(false)

  const addRow = () => {
    if (rows.length >= 50) return
    setRows([...rows, { id: crypto.randomUUID(), productSearch: '', productId: '', quantity: 1, customerName: '' }])
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) return
    setRows(rows.filter((r) => r.id !== id))
  }

  const updateRow = (id: string, field: keyof ManualRow, value: string | number) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const { data: products } = useQuery({
    queryKey: ['batch-products'],
    queryFn: () => productsApi.list({ size: 100 }),
  })

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.productId && r.quantity > 0 && r.customerName)
    if (validRows.length === 0) {
      toast.error('No valid rows to submit')
      return
    }
    setSubmitting(true)
    try {
      for (const row of validRows) {
        await ordersApi.create({
          customer_name: row.customerName,
          items: [{ product_id: row.productId, quantity: row.quantity }],
        })
      }
      toast.success(`${validRows.length} orders created`)
      setRows([{ id: crypto.randomUUID(), productSearch: '', productId: '', quantity: 1, customerName: '' }])
    } catch {
      toast.error('Failed to create orders')
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = rows.some((r) => r.productId && r.quantity > 0 && r.customerName)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase w-8"></th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Product</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase" style={{ width: 120 }}>Quantity</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Customer Name</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[var(--color-text-tertiary)] hover:text-red-500 disabled:opacity-30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.productId}
                    onChange={(e) => {
                      const p = products?.items.find((x) => x.id === e.target.value)
                      updateRow(row.id, 'productId', e.target.value)
                      updateRow(row.id, 'productSearch', p ? `${p.name} (${p.sku})` : '')
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="">Select product...</option>
                    {products?.items.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={1}
                    value={row.quantity || ''}
                    onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="h-9 font-mono"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.customerName}
                    onChange={(e) => updateRow(row.id, 'customerName', e.target.value)}
                    placeholder="Customer name"
                    className="h-9"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={addRow} disabled={rows.length >= 50}>
          <Plus className="w-4 h-4 mr-1" /> Add Row ({rows.length}/50)
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || submitting}>
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Creating...</> : `Create Orders (${rows.filter((r) => r.productId && r.quantity > 0 && r.customerName).length})`}
        </Button>
      </div>
    </div>
  )
}
