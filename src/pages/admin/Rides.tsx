import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import type { Ride, RideStatus } from '../../types'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { formatDateTime } from '../../lib/utils'

export default function AdminRides() {
  const { t } = useTranslation()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchRides()
  }, [statusFilter, dateFrom, dateTo])

  async function fetchRides() {
    setLoading(true)
    let query = supabase
      .from('rides')
      .select('*, driver:profiles!driver_id(*)')
      .order('departure_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (dateFrom) {
      query = query.gte('departure_at', new Date(dateFrom).toISOString())
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      query = query.lte('departure_at', end.toISOString())
    }

    const { data, error } = await query
    if (error) {
      toast.error(t('admin.fetchError', 'Failed to load rides'))
    } else {
      setRides(data || [])
    }
    setLoading(false)
  }

  async function cancelRide(rideId: string) {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)

    if (error) {
      toast.error(t('admin.updateError', 'Failed to cancel ride'))
    } else {
      toast.success(t('admin.rideCancelled', 'Ride cancelled'))
      setRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, status: 'cancelled' as RideStatus } : r))
      )
    }
  }

  const statusBadgeVariant = (status: RideStatus) => {
    switch (status) {
      case 'active': return 'success'
      case 'full': return 'warning'
      case 'completed': return 'info'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const statusOptions = [
    { value: 'all', label: t('admin.allStatuses', 'All Statuses') },
    { value: 'active', label: t('status.active', 'Active') },
    { value: 'full', label: t('status.full', 'Full') },
    { value: 'completed', label: t('status.completed', 'Completed') },
    { value: 'cancelled', label: t('status.cancelled', 'Cancelled') },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('admin.rides', 'Rides')}
      </h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder={t('admin.dateFrom', 'From')}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder={t('admin.dateTo', 'To')}
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">{t('common.loading', 'Loading...')}</p>
      ) : rides.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('admin.noRides', 'No rides found')}</p>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <Card key={ride.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {ride.origin} &rarr; {ride.destination}
                    </span>
                    <Badge variant={statusBadgeVariant(ride.status)}>{ride.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('admin.driver', 'Driver')}: {ride.driver?.full_name || ride.driver_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(ride.departure_at)} &middot;{' '}
                    {ride.available_seats}/{ride.total_seats} {t('admin.seatsAvailable', 'seats available')}
                  </p>
                </div>

                {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelRide(ride.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t('admin.cancel', 'Cancel')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
