import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Clock, Users, Star } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { formatUZS, formatDateTime } from '../../lib/utils'
import type { Ride } from '../../types'

interface RideCardProps {
  ride: Ride
}

const statusVariant = {
  active: 'success' as const,
  full: 'warning' as const,
  completed: 'default' as const,
  cancelled: 'danger' as const,
}

export function RideCard({ ride }: RideCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <Link to={`/rides/${ride.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={statusVariant[ride.status]}>
                {t(`rides.status.${ride.status}`)}
              </Badge>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formatUZS(ride.price_per_seat)}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-900">{ride.origin}</span>
            </div>
            {ride.intermediate_stops?.map((stop, i) => (
              <div key={i} className="flex items-center gap-2 ml-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-500">{stop}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-gray-900">{ride.destination}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(ride.departure_at, i18n.language)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {ride.total_seats - ride.available_seats > 0 && (
                  <span className="text-green-600">
                    {i18n.language === 'uz'
                      ? `${ride.total_seats - ride.available_seats} yo'lovchi`
                      : `${ride.total_seats - ride.available_seats} пасс.`
                    }
                    {' · '}
                  </span>
                )}
                {i18n.language === 'uz'
                  ? `${ride.available_seats} o'rin qoldi`
                  : `${ride.available_seats} мест`
                }
              </span>
            </div>
            {ride.driver && (
              <div className="flex items-center gap-1">
                <span className="text-xs">{ride.driver.full_name}</span>
                {ride.driver.avg_rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{ride.driver.avg_rating}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
