import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { demoRides } from '../../lib/demoData'
import type { Ride, RideStatus } from '../../types'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { formatDateTime } from '../../lib/utils'

export default function AdminRides() {
  const { t } = useTranslation()
  const [rides, setRides] = useState<Ride[]>(demoRides)
  const [statusFilter, setStatusFilter] = useState('all')

  function cancelRide(rideId: string) {
    setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'cancelled' as RideStatus } : r))
    toast.success(t('toast.rideCancelled'))
  }

  const statusBadgeVariant = (status: RideStatus) => {
    switch (status) {
      case 'active': return 'success' as const
      case 'full': return 'warning' as const
      case 'completed': return 'info' as const
      case 'cancelled': return 'danger' as const
      default: return 'default' as const
    }
  }

  const filtered = statusFilter === 'all' ? rides : rides.filter(r => r.status === statusFilter)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.rides')}</h1>
      <Select
        options={[
          { value: 'all', label: 'All Statuses' },
          { value: 'active', label: 'Active' },
          { value: 'full', label: 'Full' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="sm:w-48"
      />
      <div className="space-y-3">
        {filtered.map(ride => (
          <Card key={ride.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{ride.origin} → {ride.destination}</span>
                  <Badge variant={statusBadgeVariant(ride.status)}>{ride.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">Driver: {ride.driver?.full_name || ride.driver_id}</p>
                <p className="text-sm text-gray-500">{formatDateTime(ride.departure_at)} · {ride.available_seats}/{ride.total_seats} seats</p>
              </div>
              {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                <Button variant="danger" size="sm" onClick={() => cancelRide(ride.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
