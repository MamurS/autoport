import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { demoCities } from '../../lib/demoData'
import type { City } from '../../types'
import { MapPin } from 'lucide-react'

interface CityAutocompleteProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CityAutocomplete({ label, value, onChange, placeholder }: CityAutocompleteProps) {
  const { i18n } = useTranslation()
  const [query, setQuery] = useState(value)
  const [cities, setCities] = useState<City[]>([])
  const [filtered, setFiltered] = useState<City[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCities(demoCities)
  }, [])

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (!query) {
      setFiltered(cities.slice(0, 10))
      return
    }
    const q = query.toLowerCase()
    const nameField = i18n.language === 'uz' ? 'name_uz' : 'name_ru'
    setFiltered(
      cities.filter(c => c[nameField].toLowerCase().includes(q)).slice(0, 10)
    )
  }, [query, cities, i18n.language])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const nameField = i18n.language === 'uz' ? 'name_uz' : 'name_ru'
  const regionField = i18n.language === 'uz' ? 'region_uz' : 'region_ru'

  return (
    <div ref={ref} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <ul className="absolute left-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-left">
          {filtered.map(city => (
            <li
              key={city.id}
              onClick={() => {
                const name = city[nameField]
                setQuery(name)
                onChange(name)
                setIsOpen(false)
              }}
              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex items-start gap-2"
            >
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>
                <span className="text-gray-900">{city[nameField]}</span>
                {city[regionField] && (
                  <span className="text-gray-400 text-xs ml-1">({city[regionField]})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
