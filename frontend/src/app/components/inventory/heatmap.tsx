import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductInventory, InventoryItem } from '@/types'

interface HeatmapProps {
  data: ProductInventory[]
  onCellClick?: (productId: string, warehouseId: string) => void
}

function getColor(qty: number, reorderPoint: number): string {
  if (qty <= 0) return 'bg-red-500 hover:bg-red-600'
  if (qty < reorderPoint) return 'bg-amber-500 hover:bg-amber-600'
  if (qty < reorderPoint * 2) return 'bg-yellow-400 hover:bg-yellow-500'
  return 'bg-emerald-500 hover:bg-emerald-600'
}

export default function InventoryHeatmap({ data, onCellClick }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    product: string; warehouse: string; qty: number; reorder: number; visible: boolean
  }>({ product: '', warehouse: '', qty: 0, reorder: 0, visible: false })

  const warehouses = data.length > 0
    ? data[0].warehouses.map((w: InventoryItem) => ({ id: w.warehouse_id, name: w.warehouse_name, code: w.warehouse_code }))
    : []

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-2 py-2 sticky left-0 bg-[var(--color-surface)] z-10" style={{ minWidth: 140 }}>
              Product
            </th>
            {warehouses.map((wh) => (
              <th key={wh.id} className="text-center text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider px-1 py-2" style={{ minWidth: 60, maxWidth: 80 }}>
                <span title={wh.name}>{wh.code}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.product_id} className="border-b border-[var(--color-border)]">
              <td className="text-xs text-[var(--color-text)] px-2 py-2 sticky left-0 bg-[var(--color-surface)] truncate max-w-[140px]" title={product.name}>
                {product.name.length > 20 ? product.name.slice(0, 20) + '...' : product.name}
              </td>
              {warehouses.map((wh) => {
                const inv = product.warehouses.find((w: InventoryItem) => w.warehouse_id === wh.id)
                const qty = inv?.available_qty ?? 0
                return (
                  <td
                    key={wh.id}
                    className="px-1 py-1.5 text-center"
                  >
                    <div
                      className={cn(
                        'rounded cursor-pointer transition-all hover:scale-105 h-10 flex items-center justify-center text-xs font-mono font-bold text-white',
                        getColor(qty, 10),
                      )}
                      onClick={() => onCellClick?.(product.product_id, wh.id)}
                      onMouseEnter={() => setTooltip({
                        product: product.name, warehouse: wh.name, qty, reorder: 10, visible: true,
                      })}
                      onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                    >
                      {qty}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {tooltip.visible && (
        <div className="fixed bottom-4 right-4 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-[var(--color-text)]">{tooltip.product}</p>
          <p className="text-[var(--color-text-secondary)]">Warehouse: {tooltip.warehouse}</p>
          <p className="font-mono">Stock: {tooltip.qty} units</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">Reorder Point: {tooltip.reorder}</p>
        </div>
      )}
    </div>
  )
}
