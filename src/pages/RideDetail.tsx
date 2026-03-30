import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, Users, Car, StickyNote } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRide } from '../hooks/useRides'
import { demoReviews } from '../lib/demoData'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StarRating } from '../components/ui/StarRating'
import { Skeleton } from '../components/ui/Skeleton'
import { ReviewCard } from '../components/shared/ReviewCard'
import { formatUZS, formatDateTime, formatPhone } from '../lib/utils'

const statusVariant = {
  active: 'success' as const,
  full: 'warning' as const,
  completed: 'default' as const,
  cancelled: 'danger' as const,
}

export default function RideDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const { ride, loading } = useRide(id || '')

  const [booking, setBooking] = useState(false)

  const handleBook = async () => {
    setBooking(true)
    setTimeout(() => {
      setBooking(false)
      toast.success(t('toast.bookingCreated'))
    }, 500)
  }

  const isPassenger = profile?.role === 'passenger'
  const canBook = ride?.status === 'active' && ride.available_seats > 0 && isPassenger && user?.id !== ride.driver_id

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-gray-500">{t('common.noResults')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Link to="/rides" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </Link>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant={statusVariant[ride.status]}>{t(`rides.status.${ride.status}`)}</Badge>
            <span className="text-2xl font-bold text-blue-600">
              {formatUZS(ride.price_per_seat)}
              <span className="text-sm font-normal text-gray-500 ml-1">{t('common.perSeat')}</span>
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-lg font-medium text-gray-900">{ride.origin}</span>
            </div>
            {ride.intermediate_stops?.map((stop, i) => (
              <div key={i} className="flex items-center gap-3 ml-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-500">{stop}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-lg font-medium text-gray-900">{ride.destination}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{t('rides.departure')}</p>
                <p className="font-medium">{formatDateTime(ride.departure_at, i18n.language)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{t('rides.availableSeats')}</p>
                <p className="font-medium">
                  {ride.total_seats - ride.available_seats > 0 && (
                    <span className="text-green-600">
                      {i18n.language === 'uz'
                        ? `${ride.total_seats - ride.available_seats} yo'lovchi · `
                        : `${ride.total_seats - ride.available_seats} пасс. · `
                      }
                    </span>
                  )}
                  {i18n.language === 'uz'
                    ? `${ride.available_seats} o'rin qoldi`
                    : `Осталось ${ride.available_seats} мест`
                  }
                </p>
              </div>
            </div>
          </div>

          {ride.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <StickyNote className="h-3.5 w-3.5" /> {t('rides.notes')}
              </div>
              <p className="text-sm text-gray-700">{ride.notes}</p>
            </div>
          )}

          {canBook && (
            <Button onClick={handleBook} loading={booking} size="lg" className="w-full mt-6">
              {t('rides.book')}
            </Button>
          )}
        </CardContent>
      </Card>

      {ride.driver && (
        <Card>
          <CardHeader><h3 className="text-sm font-semibold text-gray-900">{t('rides.driver')}</h3></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {ride.driver.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{ride.driver.full_name}</p>
                <p className="text-sm text-gray-500">{formatPhone(ride.driver.phone)}</p>
                {ride.driver.avg_rating > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={ride.driver.avg_rating} size={14} />
                    <span className="text-xs text-gray-500">({ride.driver.rating_count})</span>
                  </div>
                )}
              </div>
            </div>
            {(ride.driver.car_model || ride.driver.car_color || ride.driver.license_plate) && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Car className="h-4 w-4 text-gray-400" />
                <span>{[ride.driver.car_model, ride.driver.car_color, ride.driver.license_plate].filter(Boolean).join(' / ')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('profile.reviews')}</h3>
        <div className="space-y-3">
          {demoReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}
