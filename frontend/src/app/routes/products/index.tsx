import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Download, LayoutGrid, List } from 'lucide-react'
import { productsApi } from '@/api/products'
import ProductTable from '@/app/components/products/product-table'
import ProductCard from '@/app/components/products/product-card'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'
import SearchInput from '@/app/components/common/search-input'
import { Button } from '@/app/components/ui/button'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Product } from '@/types'

export default function ProductsList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sort, setSort] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, pageSize, search, category, stockFilter, sort],
    queryFn: () => productsApi.list({ page, size: pageSize, search: search || undefined, category: category || undefined, sort: sort || undefined }),
  })

  const products = data?.items ?? []
  const total = data?.total ?? 0

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    if (!direction) setSort('')
    else setSort(`${direction === 'desc' ? '-' : ''}${key}`)
  }

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">Products</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" className="h-9 px-4 text-sm font-medium" onClick={() => navigate('/products/new')}>
            <Plus className="w-4 h-4 mr-1.5" /> New Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="w-[300px]">
          <SearchInput
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="h-9 min-w-[160px] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] px-3"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex items-center h-9 rounded-md border border-[var(--color-border)] overflow-hidden">
          {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((val) => (
            <button
              key={val}
              onClick={() => { setStockFilter(val); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                stockFilter === val
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border-x border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {val === 'all' ? 'All Stock' : val === 'in_stock' ? 'In Stock' : val === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center border border-[var(--color-border)] rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <ProductTable
          products={products}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
          onSort={handleSort}
          onEdit={(p) => navigate(`/products/${p.id}`)}
          onDelete={(p) => {
            if (confirm(`Delete product "${p.name}"?`)) {
              productsApi.delete(p.id).then(() => window.location.reload())
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-shimmer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]" style={{ height: 240 }} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full">
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-sm text-[var(--color-text-secondary)]">No products found</p>
              </div>
            </div>
          ) : (
            products.map((product: Product, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
