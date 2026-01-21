import { useState, useEffect, FC } from 'react'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    debounceMs?: number
}

export const SearchInput: FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className="w-[500px] px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  )
}
