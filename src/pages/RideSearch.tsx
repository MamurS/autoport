import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useRides } from '../hooks/useRides'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { RideCardSkeleton } from '../components/ui/Skeleton'
import { RideCard } from '../components/shared/RideCard'

export default function RideSearch() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const origin = searchParams.get('origin') || undefined
  const destination = searchParams.get('destination') || undefined
  const date = searchParams.get('date') || undefined

  const [sort, setSort] = useState<'departure_at' | 'price_per_seat' | 'created_at'>('departure_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filters = useMemo(() => ({
    origin,
    destination,
    date,
    sort,
    sortDirection,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
  }), [origin, destination, date, sort, sortDirection, priceMin, priceMax])

  const { rides, loading } = useRides(filters)

  const sortOptions = [
    { value: 'departure_at', label: t('rides.sortByTime') },
    { value: 'price_per_seat', label: t('rides.sortByPrice') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('rides.title')}</h1>
            {(origin || destination) && (
              <p className="text-sm text-gray-500">
                {origin && <span>{origin}</span>}
                {origin && destination && <span> → </span>}
                {destination && <span>{destination}</span>}
                {date && <span className="ml-2">({date})</span>}
              </p>
            )}
          </div>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            options={sortOptions}
            className="w-auto"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(f => !f)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {t('rides.filterByPrice')}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <Input
              label={`${t('rides.filterByPrice')} (${t('common.from')})`}
              type="number"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="0"
              className="w-32"
            />
            <Input
              label={`${t('rides.filterByPrice')} (${t('common.to')})`}
              type="number"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="999999"
              className="w-32"
            />
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <RideCardSkeleton key={i} />
            ))}
          </div>
        ) : rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('rides.noRidesFound')}
            description={t('rides.tryDifferent')}
            action={
              <Link to="/">
                <Button variant="secondary">{t('common.back')}</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
