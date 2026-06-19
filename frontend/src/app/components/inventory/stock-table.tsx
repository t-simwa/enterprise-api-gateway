import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/app/components/common/data-table'
import type { ProductInventory, InventoryItem } from '@/types'

interface StockTableProps {
  data: ProductInventory[]
  loading: boolean
}

export default function StockTable({ data, loading }: StockTableProps) {
  const navigate = useNavigate()
  const warehouses = data.length > 0 ? data[0].warehouses.map((w: InventoryItem) => w.warehouse_id) : []

  const columns: Column<ProductInventory>[] = [
    {
      key: 'product',
      header: 'Product',
      accessor: (row) => (
        <div>
          <span className="text-sm font-medium text-[var(--color-text)] block truncate max-w-[180px]">{row.name}</span>
          <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{row.sku}</span>
        </div>
      ),
    },
    ...warehouses.map((whId) => {
      const wh = data[0]?.warehouses.find((w: InventoryItem) => w.warehouse_id === whId)
      return {
        key: `wh_${whId}`,
        header: wh?.warehouse_code || whId.slice(0, 8),
        accessor: (row: ProductInventory) => {
          const inv = row.warehouses.find((w: InventoryItem) => w.warehouse_id === whId)
          const qty = inv?.available_qty ?? 0
          return (
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    qty <= 0 ? 'bg-red-500' : qty < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, qty * 5)}%` }}
                />
              </div>
              <span className={`font-mono tabular-nums text-xs ${
                qty <= 0 ? 'text-red-600 font-semibold' : qty < 10 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {qty}
              </span>
            </div>
          )
        },
        width: '120px',
      }
    }),
    {
      key: 'total',
      header: 'Total',
      accessor: (row) => (
        <span className="font-mono tabular-nums text-sm font-medium">{row.total_available}</span>
      ),
      sortable: true,
      align: 'right',
      width: '80px',
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      total={data.length}
      page={1}
      pageSize={data.length || 20}
      loading={loading}
      emptyMessage="No inventory data"
      emptyIcon="inventory"
      onRowClick={(row) => navigate(`/products/${row.product_id}`)}
      rowKey={(row) => row.product_id}
    />
  )
}
