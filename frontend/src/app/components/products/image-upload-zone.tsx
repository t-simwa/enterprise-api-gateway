import { useState, useRef, type DragEvent } from 'react'
import { Upload, X, Star } from 'lucide-react'

interface ImageFile {
  id: string
  file: File
  preview: string
  isPrimary: boolean
  progress: number
}

interface ImageUploadZoneProps {
  onUpload?: (file: File) => Promise<string>
}

export default function ImageUploadZone({ onUpload }: ImageUploadZoneProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/png', 'image/jpeg', 'image/webp'].includes(f.type),
    )
    files.forEach((file) => addImage(file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => addImage(file))
  }

  const addImage = (file: File) => {
    const id = Math.random().toString(36).substring(2)
    const preview = URL.createObjectURL(file)
    const img: ImageFile = { id, file, preview, isPrimary: images.length === 0, progress: 0 }
    setImages((prev) => [...prev, img])
    if (onUpload) {
      onUpload(file).then(() => {
        setImages((prev) => prev.map((i) => i.id === id ? { ...i, progress: 100 } : i))
      }).catch(() => {
        setImages((prev) => prev.filter((i) => i.id !== id))
      })
    } else {
      setImages((prev) => prev.map((i) => i.id === id ? { ...i, progress: 100 } : i))
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id)
      if (prev.find((i) => i.id === id)?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true
      }
      return filtered
    })
  }

  const setPrimary = (id: string) => {
    setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.id === id })))
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center gap-3 ${
          dragActive
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 scale-[1.01]'
            : 'border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]'
        }`}
      >
        <Upload className={`w-12 h-12 ${dragActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-tertiary)]'}`} />
        <div>
          <p className="text-base text-[var(--color-text)]">Drop images here or click to browse</p>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">PNG, JPG, WebP up to 10MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img) => (
            <div key={img.id} className="relative flex-shrink-0 group">
              <div
                className={`w-20 h-20 rounded-md border-2 overflow-hidden ${
                  img.isPrimary ? 'border-[var(--color-brand)]' : 'border-[var(--color-border)]'
                }`}
                onClick={() => setPrimary(img.id)}
              >
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
              {img.isPrimary && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center">
                  <Star className="w-3 h-3" />
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {img.progress > 0 && img.progress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-bg-secondary)]">
                  <div className="h-full bg-[var(--color-brand)] transition-all" style={{ width: `${img.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
