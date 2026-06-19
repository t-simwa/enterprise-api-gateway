import { useState, useRef, type DragEvent } from 'react'
import { Upload, CheckCircle, XCircle, Loader2, Download } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface CsvRow {
  rowNum: number
  sku: string
  quantity: number
  customerName: string
  customerEmail: string
  valid: boolean
  error?: string
}

interface CsvUploadZoneProps {
  onParse?: (rows: CsvRow[]) => void
  onSubmit?: (rows: CsvRow[]) => Promise<{ success: number; failed: number }>
}

export default function CsvUploadZone({ onParse, onSubmit }: CsvUploadZoneProps) {
  const [rows, setRows] = useState<CsvRow[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: number; failed: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const parseCsv = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim())
    const parsed: CsvRow[] = []
    const header = lines[0].toLowerCase()
    if (!header.includes('product_sku') && !header.includes('sku')) {
      return
    }
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim())
      const sku = parts[0] || ''
      const qty = parseInt(parts[1]) || 0
      const name = parts[2] || ''
      const email = parts[3] || ''
      const errors: string[] = []
      if (!sku) errors.push('SKU is required')
      if (qty <= 0) errors.push('Quantity must be > 0')
      if (!name) errors.push('Customer name is required')

      parsed.push({
        rowNum: i,
        sku,
        quantity: qty,
        customerName: name,
        customerEmail: email,
        valid: errors.length === 0,
        error: errors.join('; '),
      })
    }
    setRows(parsed)
    setSubmitResult(null)
    onParse?.(parsed)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => parseCsv(ev.target?.result as string || '')
      reader.readAsText(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => parseCsv(ev.target?.result as string || '')
      reader.readAsText(file)
    }
  }

  const handleSubmit = async () => {
    if (rows.length === 0 || rows.some((r) => !r.valid)) return
    setSubmitting(true)
    try {
      const result = await onSubmit?.(rows) || { success: 0, failed: 0 }
      setSubmitResult(result)
    } finally {
      setSubmitting(false)
    }
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.filter((r) => !r.valid).length

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-all min-h-[300px] flex flex-col items-center justify-center gap-4 ${
          dragActive
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 scale-[1.01]'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
        }`}
      >
        <Upload className={`w-12 h-12 ${dragActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)]'}`} />
        <div>
          <p className="text-base text-[var(--color-text)]">Drop CSV file here</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            CSV with columns: product_sku, quantity, customer_name, customer_email (optional)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {rows.length > 0 && (
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)]">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Row</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">SKU</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Qty</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Customer</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row) => (
                  <tr key={row.rowNum} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-2 text-[var(--color-text-secondary)]">{row.rowNum}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2">{row.customerName}</td>
                    <td className="px-3 py-2">
                      {row.valid ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span title={row.error}><XCircle className="w-4 h-4 text-red-500" /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalidCount > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-950/10 border-t border-[var(--color-border)]">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {invalidCount} invalid {invalidCount === 1 ? 'row' : 'rows'} found
              </p>
              {rows.filter((r) => !r.valid).map((r) => (
                <p key={r.rowNum} className="text-xs text-red-500 mt-1">
                  Row {r.rowNum}: {r.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {submitResult && (
        <div className="p-3 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-between">
          <span className="text-sm text-[var(--color-text)]">
            {submitResult.success} created, {submitResult.failed} failed
          </span>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-1" /> Error Report
          </Button>
        </div>
      )}

      {rows.length > 0 && !submitResult && (
        <Button
          onClick={handleSubmit}
          disabled={submitting || validCount === 0}
          className="w-full"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Submitting...</>
          ) : (
            `Submit Batch (${validCount} orders)`
          )}
        </Button>
      )}
    </div>
  )
}
