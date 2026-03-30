import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, TrendingUp } from 'lucide-react'
import { demoRides } from '../../lib/demoData'

interface SearchHintsProps {
  origin?: string
  destination?: string
}

export function SearchHints({ origin, destination }: SearchHintsProps) {
  const { i18n } = useTranslation()
  const isUz = i18n.language === 'uz'

  const hints = useMemo(() => {
    if (!origin && !destination) return null

    let filtered = demoRides.filter(r => r.status === 'active')
    if (origin) filtered = filtered.filter(r => r.origin.toLowerCase().includes(origin.toLowerCase()))
    if (destination) filtered = filtered.filter(r => r.destination.toLowerCase().includes(destination.toLowerCase()))

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const todayCount = filtered.filter(r => r.departure_at.startsWith(todayStr)).length
    const tomorrowCount = filtered.filter(r => r.departure_at.startsWith(tomorrowStr)).length
    const totalCount = filtered.length

    return { todayCount, tomorrowCount, totalCount }
  }, [origin, destination])

  if (!hints || (!origin && !destination)) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
      {hints.todayCount > 0 && (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
          {isUz ? 'Bugun' : 'Сегодня'}: {hints.todayCount} {isUz ? 'sayohat' : 'поездок'}
        </span>
      )}
      {hints.tomorrowCount > 0 && (
        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
          {isUz ? 'Ertaga' : 'Завтра'}: {hints.tomorrowCount} {isUz ? 'sayohat' : 'поездок'}
        </span>
      )}
      {hints.totalCount > 0 && (
        <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
          {isUz ? 'Jami' : 'Всего'}: {hints.totalCount}
        </span>
      )}
    </div>
  )
}
