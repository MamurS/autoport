import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { BookingTimer } from './BookingTimer'
import { formatUZS, formatDateTime } from '../../lib/utils'
import type { Booking } from '../../types'

interface BookingCardProps {
  booking: Booking
  actions?: React.ReactNode
  onTimerExpired?: () => void
}

const statusVariant = {
  pending: 'warning' as const,
  confirmed: 'success' as const,
  rejected: 'danger' as const,
  cancelled: 'default' as const,
}

export function BookingCard({ booking, actions, onTimerExpired }: BookingCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <Badge variant={statusVariant[booking.status]}>
            {t(`myBookings.status.${booking.status}`)}
          </Badge>
          {booking.ride && (
            <span className="text-sm font-bold text-blue-600">
              {formatUZS(booking.ride.price_per_seat)}
            </span>
          )}
        </div>

        {booking.ride && (
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-900">
              {booking.ride.origin} → {booking.ride.destination}
            </p>
            <p className="text-xs text-gray-500">
              {formatDateTime(booking.ride.departure_at, i18n.language)}
            </p>
          </div>
        )}

        {booking.passenger && (
          <p className="text-xs text-gray-500 mb-2">
            {booking.passenger.full_name} — {booking.passenger.phone}
          </p>
        )}

        {booking.status === 'pending' && (
          <div className="mb-2">
            <BookingTimer
              createdAt={booking.created_at}
              timeoutMinutes={30}
              onExpired={onTimerExpired}
            />
          </div>
        )}

        {booking.commission_amount != null && booking.commission_amount > 0 && (
          <p className="text-xs text-gray-400">
            {t('myRides.commission')}: {formatUZS(booking.commission_amount)}
          </p>
        )}

        {actions && <div className="mt-3 flex gap-2">{actions}</div>}
      </CardContent>
    </Card>
  )
}
