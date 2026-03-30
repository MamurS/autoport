import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, MapPin, Calendar } from 'lucide-react'
import { useRides } from '../hooks/useRides'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { RideCardSkeleton } from '../components/ui/Skeleton'
import { CityAutocomplete } from '../components/shared/CityAutocomplete'
import { SearchHints } from '../components/shared/SearchHints'
import { RideCard } from '../components/shared/RideCard'

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [seats, setSeats] = useState('1')

  const { rides, loading } = useRides()
  const recentRides = rides.slice(0, 6)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (destination) params.set('destination', destination)
    if (date) params.set('date', date)
    if (seats && seats !== '1') params.set('seats', seats)
    navigate(`/rides?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {t('home.title')}
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            {t('home.subtitle')}
          </p>

          {/* Search Form */}
          <Card className="text-left">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CityAutocomplete
                    label={t('home.origin')}
                    value={origin}
                    onChange={setOrigin}
                    placeholder={t('home.originPlaceholder')}
                  />
                  <CityAutocomplete
                    label={t('home.destination')}
                    value={destination}
                    onChange={setDestination}
                    placeholder={t('home.destinationPlaceholder')}
                  />
                </div>

                {/* Search hints */}
                {(origin || destination) && (
                  <SearchHints origin={origin} destination={destination} />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('home.departureDate')}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {i18n.language === 'uz' ? "O'rinlar soni" : 'Кол-во мест'}
                    </label>
                    <div className="flex items-center gap-1">
                      {['1', '2', '3', '4'].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSeats(n)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            seats === n
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    {t('home.searchButton')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Rides */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t('home.recentRides')}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <RideCardSkeleton key={i} />
            ))}
          </div>
        ) : recentRides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('home.noRides')}
          />
        )}
      </section>
    </div>
  )
}
