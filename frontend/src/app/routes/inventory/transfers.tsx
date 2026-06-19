import TransferForm from '@/app/components/inventory/transfer-form'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'

export default function TransfersPage() {
  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-8">Stock Transfers</h1>
      <TransferForm onSuccess={() => {}} />
    </div>
  )
}
