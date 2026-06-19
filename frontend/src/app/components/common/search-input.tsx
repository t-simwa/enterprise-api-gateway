import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  loading?: boolean
  className?: string
}

export default function SearchInput({
  placeholder = 'Search...',
  value: externalValue,
  onChange,
  onSearch,
  loading = false,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const value = externalValue !== undefined ? externalValue : internalValue
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    if (debouncedValue && onSearch) onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value
      if (externalValue === undefined) setInternalValue(newVal)
      onChange?.(newVal)
    },
    [externalValue, onChange],
  )

  const handleClear = useCallback(() => {
    if (externalValue === undefined) setInternalValue('')
    onChange?.('')
    inputRef.current?.focus()
  }, [externalValue, onChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear()
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClear])

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {loading ? (
        <Loader2 className="absolute left-2 w-4 h-4 text-[var(--color-text-tertiary)] animate-spin" />
      ) : (
        <Search className="absolute left-2 w-4 h-4 text-[var(--color-text-tertiary)]" />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 w-[280px] focus:w-[320px] transition-all duration-200 pl-8 pr-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-opacity-30 focus:border-[var(--color-brand)]"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--color-bg-tertiary)] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
        </button>
      )}
      {!value && (
        <kbd className="absolute right-2 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded">
          Ctrl+K
        </kbd>
      )}
    </div>
  )
}

export { SearchInput }
