import { useState } from 'react'
import { Upload, Keyboard } from 'lucide-react'
import CsvUploadZone from '@/app/components/orders/csv-upload-zone'
import BatchForm from '@/app/components/orders/batch-form'
import Breadcrumbs from '@/app/components/layout/breadcrumbs'

export default function BatchOrders() {
  const [tab, setTab] = useState<'csv' | 'manual'>('csv')

  return (
    <div className="p-8 max-w-[var(--content-max-width)] mx-auto">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-8">Batch Order Creation</h1>

      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setTab('csv')}
          className={`inline-flex items-center h-9 px-4 text-sm font-medium rounded-md transition-colors ${
            tab === 'csv'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          <Upload className="w-4 h-4 mr-1.5" /> CSV Upload
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`inline-flex items-center h-9 px-4 text-sm font-medium rounded-md transition-colors ${
            tab === 'manual'
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          <Keyboard className="w-4 h-4 mr-1.5" /> Manual Entry
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
        {tab === 'csv' ? <CsvUploadZone /> : <BatchForm />}
      </div>
    </div>
  )
}
