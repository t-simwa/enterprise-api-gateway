import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsApi } from '@/api/products'
import ProductForm, { type ProductFormValues } from '@/app/components/products/product-form'
import ImageUploadZone from '@/app/components/products/image-upload-zone'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'
import { SkeletonCard } from '@/app/components/common/loading-skeleton'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!),
    enabled: !!id,
  })

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      await productsApi.update(id!, data)
      toast.success('Product updated successfully')
    } catch {
      toast.error('Failed to update product')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <SkeletonCard />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
        <p className="text-sm text-[var(--color-text-secondary)]">Product not found</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-8">{product.name}</h1>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8">
        <ProductForm
          onSubmit={handleSubmit}
          mode="edit"
          defaultValues={{
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            unit_price: product.unit_price,
            unit_cost: product.unit_cost || undefined,
            reorder_point: product.reorder_point,
          }}
        />
        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider pb-3 mb-5">
            Images
          </h3>
          <ImageUploadZone />
        </div>
      </div>
    </div>
  )
}
