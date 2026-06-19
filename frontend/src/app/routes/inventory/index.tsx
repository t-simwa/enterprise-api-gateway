import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight } from 'lucide-react'
import { inventoryApi } from '@/api/inventory'
import { productsApi } from '@/api/products'
import { toast } from 'sonner'
import InventoryHeatmap from '@/app/components/inventory/heatmap'
import StockTable from '@/app/components/inventory/stock-table'
import LowStockAlert from '@/app/components/inventory/low-stock-alert'
import AdjustDialog from '@/app/components/inventory/adjust-dialog'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'
import { Button } from '@/app/components/ui/button'
import type { ProductInventory } from '@/types'

export default function InventoryPage() {
  const navigate = useNavigate()
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustProduct, setAdjustProduct] = useState('')
  const [adjustWarehouse, setAdjustWarehouse] = useState('')

  const { data: inventoryData, isLoading: invLoading } = useQuery({
    queryKey: ['inventory-all'],
    queryFn: async () => {
      const products = await productsApi.list({ size: 100 })
      const inventories: ProductInventory[] = []
      for (const p of products.items) {
        try {
          const inv = await inventoryApi.getByProduct(p.id)
          inventories.push(inv)
        } catch {
          // skip
        }
      }
      return inventories
    },
  })

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => inventoryApi.lowStock(),
    refetchInterval: 30_000,
  })

  const handleAdjust = async (data: { reason: string; quantity: number; notes: string }) => {
    await inventoryApi.adjust({
      product_id: adjustProduct,
      warehouse_id: adjustWarehouse,
      change_qty: data.quantity,
      reason: data.reason,
      notes: data.notes || undefined,
    })
    toast.success('Stock adjusted successfully')
  }

  const data = inventoryData ?? []

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Inventory</h1>
        <Button variant="secondary" size="sm" className="h-9" onClick={() => navigate('/inventory/transfers')}>
          <ArrowLeftRight className="w-4 h-4 mr-1.5" /> Transfer Stock
        </Button>
      </div>

      <div className="mb-6">
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="h-9 min-w-[200px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] px-3"
        >
          <option value="">All Warehouses</option>
          {data.length > 0 && data[0].warehouses.map((w) => (
            <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <LowStockAlert items={lowStockItems ?? []} loading={lowStockLoading} />
      </div>

      <div className="mb-8">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Stock Overview</h2>
          </div>
          <div className="p-4">
            <StockTable data={data} loading={invLoading} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Warehouse Heatmap</h2>
        </div>
        <div className="p-4">
          <InventoryHeatmap
            data={data}
            onCellClick={(productId, warehouseId) => {
              setAdjustProduct(productId)
              setAdjustWarehouse(warehouseId)
              setAdjustOpen(true)
            }}
          />
        </div>
      </div>

      <AdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        productName={adjustProduct ? data.find((d) => d.product_id === adjustProduct)?.name : undefined}
        warehouseName={adjustWarehouse ? (data[0]?.warehouses.find((w) => w.warehouse_id === adjustWarehouse)?.warehouse_name) : undefined}
        currentStock={(() => {
          const inv = data.find((d) => d.product_id === adjustProduct)
          const wh = inv?.warehouses.find((w) => w.warehouse_id === adjustWarehouse)
          return wh?.available_qty
        })()}
        onConfirm={handleAdjust}
      />
    </div>
  )
}
