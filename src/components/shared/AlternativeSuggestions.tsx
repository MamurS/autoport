import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Lightbulb } from 'lucide-react'
import { demoRides } from '../../lib/demoData'
import { Button } from '../ui/Button'

interface AlternativeSuggestionsProps {
  origin?: string
  destination?: string
  date?: string
  currentResultsCount: number
}

// Nearby cities mapping
const nearbyCities: Record<string, string[]> = {
  'Ташкент': ['Чирчик', 'Нурафшон', 'Ангрен'],
  'Самарканд': ['Джизак', 'Каттакурган', 'Навои'],
  'Бухара': ['Навои', 'Каган', 'Гиждуван'],
  'Фергана': ['Коканд', 'Маргилан', 'Андижан'],
  'Наманган': ['Андижан', 'Коканд', 'Чуст'],
  'Андижан': ['Наманган', 'Фергана', 'Асака'],
}

export function AlternativeSuggestions({ origin, destination, date, currentResultsCount }: AlternativeSuggestionsProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isUz = i18n.language === 'uz'

  const suggestions = useMemo(() => {
    const result: { type: 'date' | 'nearby'; label: string; count: number; params: Record<string, string> }[] = []

    if (!origin && !destination) return result

    const allActive = demoRides.filter(r => r.status === 'active')

    // Alternative dates: ±1-2 days
    if (date) {
      const baseDate = new Date(date)
      for (const offset of [-2, -1, 1, 2]) {
        const altDate = new Date(baseDate)
        altDate.setDate(altDate.getDate() + offset)
        const altDateStr = altDate.toISOString().split('T')[0]

        let matching = allActive.filter(r => r.departure_at.startsWith(altDateStr))
        if (origin) matching = matching.filter(r => r.origin.toLowerCase().includes(origin.toLowerCase()))
        if (destination) matching = matching.filter(r => r.destination.toLowerCase().includes(destination.toLowerCase()))

        if (matching.length > 0) {
          const dayLabel = altDate.toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' })
          result.push({
            type: 'date',
            label: dayLabel,
            count: matching.length,
            params: { ...(origin && { origin }), ...(destination && { destination }), date: altDateStr },
          })
        }
      }
    }

    // Nearby cities
    if (origin) {
      const nearby = nearbyCities[origin] || []
      for (const city of nearby) {
        let matching = allActive.filter(r => r.origin === city)
        if (destination) matching = matching.filter(r => r.destination.toLowerCase().includes(destination.toLowerCase()))
        if (date) matching = matching.filter(r => r.departure_at.startsWith(date))

        if (matching.length > 0) {
          result.push({
            type: 'nearby',
            label: city,
            count: matching.length,
            params: { origin: city, ...(destination && { destination }), ...(date && { date }) },
          })
        }
      }
    }

    return result.slice(0, 6)
  }, [origin, destination, date, isUz])

  if (suggestions.length === 0) return null

  const searchWithParams = (params: Record<string, string>) => {
    const sp = new URLSearchParams(params)
    navigate(`/rides?${sp.toString()}`)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          {currentResultsCount === 0
            ? (isUz ? 'Aniq sayohatlar topilmadi, lekin boshqa variantlar bor' : 'Точных поездок нет, но есть другие варианты')
            : (isUz ? 'Yana boshqa variantlar' : 'Ещё варианты')
          }
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => searchWithParams(s.params)}
            className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-sm hover:bg-amber-100 transition-colors"
          >
            {s.type === 'date' ? (
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span className="text-gray-700">{s.label}</span>
            <span className="text-amber-600 font-medium">({s.count})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
