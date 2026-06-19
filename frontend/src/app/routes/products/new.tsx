import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { productsApi } from '@/api/products'
import ProductForm, { type ProductFormValues } from '@/app/components/products/product-form'
import ImageUploadZone from '@/app/components/products/image-upload-zone'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'

export default function ProductNew() {
  const navigate = useNavigate()

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      const product = await productsApi.create(data)
      toast.success('Product created successfully')
      navigate(`/products/${product.id}`)
    } catch {
      toast.error('Failed to create product')
    }
  }

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-8">New Product</h1>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8">
        <ProductForm onSubmit={handleSubmit} mode="create" />
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
