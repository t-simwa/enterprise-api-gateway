import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dice1, Loader2 } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  unit_price: z.coerce.number().positive('Price must be positive'),
  unit_cost: z.coerce.number().min(0).optional(),
  reorder_point: z.coerce.number().int().min(0).default(10),
})

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>
  onSubmit: (data: ProductFormValues) => Promise<void>
  isSubmitting?: boolean
  mode: 'create' | 'edit'
}

export default function ProductForm({ defaultValues, onSubmit, isSubmitting, mode }: ProductFormProps) {
  const {
    register, handleSubmit, formState: { errors }, setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      sku: '', name: '', description: '', category: '',
      unit_price: undefined, unit_cost: undefined, reorder_point: 10,
      ...defaultValues,
    },
  })

  const generateSku = () => {
    const prefix = 'PRD'
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
    setValue('sku', `${prefix}-${rand}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-[800px] space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider pb-3 border-b border-[var(--color-border)] mb-5">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">SKU</label>
            <div className="relative">
              <Input {...register('sku')} placeholder="e.g. PRD-ABC01" className="font-mono pr-10" />
              <button type="button" onClick={generateSku} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]" title="Generate SKU">
                <Dice1 className="w-4 h-4" />
              </button>
            </div>
            {errors.sku && <p className="text-xs text-[var(--color-danger)]">{errors.sku.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Category</label>
            <select
              {...register('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Name</label>
            <Input {...register('name')} placeholder="Product name" className="text-base font-medium" />
            {errors.name && <p className="text-xs text-[var(--color-danger)]">{errors.name.message}</p>}
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-vertical"
              placeholder="Product description..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider pb-3 border-b border-[var(--color-border)] mb-5">
          Pricing & Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Unit Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">$</span>
              <Input {...register('unit_price')} type="number" step="0.01" className="pl-7 text-right font-mono tabular-nums" placeholder="0.00" />
            </div>
            {errors.unit_price && <p className="text-xs text-[var(--color-danger)]">{errors.unit_price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">
              Unit Cost <span className="text-xs text-[var(--color-text-tertiary)] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-tertiary)]">$</span>
              <Input {...register('unit_cost')} type="number" step="0.01" className="pl-7 text-right font-mono tabular-nums" placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Reorder Point</label>
            <div className="relative">
              <Input {...register('reorder_point')} type="number" className="text-right font-mono pr-12" placeholder="10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)]">units</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="h-10 px-6 text-sm font-medium">
          {isSubmitting ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
          ) : (
            mode === 'create' ? 'Create Product' : 'Save Changes'
          )}
        </Button>
        <Button type="button" variant="ghost" className="h-10 px-6" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
