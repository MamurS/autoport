import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyRides, createRide, updateRideStatus } from '../hooks/useRides'
import { useRideBookings, confirmBooking, rejectBooking } from '../hooks/useBookings'
import { useDeposit } from '../hooks/useDeposit'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { BookingCard } from '../components/shared/BookingCard'
import { CityAutocomplete } from '../components/shared/CityAutocomplete'
import { formatUZS, formatDateTime } from '../lib/utils'
import type { Ride } from '../types'

const statusVariant = {
  active: 'success' as const,
  full: 'warning' as const,
  completed: 'default' as const,
  cancelled: 'danger' as const,
}

function RideBookings({ rideId }: { rideId: string }) {
  const { t } = useTranslation()
  const { depositBalance } = useDeposit()
  const { bookings, loading, refetch } = useRideBookings(rideId)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleConfirm = async (bookingId: string) => {
    if (depositBalance <= 0) {
      toast.error(t('myRides.insufficientDeposit'))
      return
    }
    setActionLoading(bookingId)
    const { error } = await confirmBooking(bookingId)
    setActionLoading(null)
    if (error) {
      if (error.toLowerCase().includes('insufficient') || error.toLowerCase().includes('deposit')) {
        toast.error(t('toast.insufficientDeposit'))
      } else {
        toast.error(t('toast.error'))
      }
    } else {
      toast.success(t('toast.bookingConfirmed'))
      refetch()
    }
  }

  const handleReject = async (bookingId: string) => {
    setActionLoading(bookingId)
    const { error } = await rejectBooking(bookingId)
    setActionLoading(null)
    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(t('toast.bookingRejected'))
      refetch()
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-2">{t('common.loading')}</p>

  if (bookings.length === 0) {
    return <p className="text-sm text-gray-400 py-2">{t('myRides.noBookings')}</p>
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          actions={
            booking.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleConfirm(booking.id)}
                  loading={actionLoading === booking.id}
                >
                  {t('myRides.confirmBooking')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleReject(booking.id)}
                  loading={actionLoading === booking.id}
                >
                  {t('myRides.rejectBooking')}
                </Button>
              </>
            ) : undefined
          }
        />
      ))}
    </div>
  )
}

export default function MyRides() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const { rides, loading, refetch } = useMyRides()

  const [showCreate, setShowCreate] = useState(false)
  const [expandedRide, setExpandedRide] = useState<string | null>(null)

  // Create form state
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureAt, setDepartureAt] = useState('')
  const [pricePerSeat, setPricePerSeat] = useState('')
  const [totalSeats, setTotalSeats] = useState(profile?.seats_total?.toString() || '4')
  const [notes, setNotes] = useState('')
  const [stops, setStops] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const [statusLoading, setStatusLoading] = useState<string | null>(null)

  const resetForm = () => {
    setOrigin('')
    setDestination('')
    setDepartureAt('')
    setPricePerSeat('')
    setTotalSeats(profile?.seats_total?.toString() || '4')
    setNotes('')
    setStops([])
  }

  const handleCreate = async () => {
    if (!origin || !destination || !departureAt || !pricePerSeat) return
    setCreating(true)

    const seats = parseInt(totalSeats) || 4
    const { error } = await createRide({
      origin,
      destination,
      intermediate_stops: stops.length > 0 ? stops.filter(s => s.trim()) : undefined,
      departure_at: departureAt,
      price_per_seat: parseInt(pricePerSeat),
      total_seats: seats,
      available_seats: seats,
      notes: notes.trim() || undefined,
    })

    setCreating(false)
    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(t('toast.rideCreated'))
      resetForm()
      setShowCreate(false)
      refetch()
    }
  }

  const handleStatusChange = async (rideId: string, status: Ride['status']) => {
    setStatusLoading(rideId)
    const { error } = await updateRideStatus(rideId, status)
    setStatusLoading(null)
    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(
        status === 'completed' ? t('toast.rideCompleted') : t('toast.rideCancelled')
      )
      refetch()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{t('myRides.title')}</h1>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('myRides.create')}
          </Button>
        </div>

        {/* Create Ride Modal */}
        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title={t('myRides.createTitle')}
        >
          <div className="space-y-4">
            <CityAutocomplete
              label={t('myRides.origin')}
              value={origin}
              onChange={setOrigin}
              placeholder={t('home.originPlaceholder')}
            />
            <CityAutocomplete
              label={t('myRides.destination')}
              value={destination}
              onChange={setDestination}
              placeholder={t('home.destinationPlaceholder')}
            />

            <Input
              label={t('myRides.departureAt')}
              type="datetime-local"
              value={departureAt}
              onChange={e => setDepartureAt(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('myRides.pricePerSeat')}
                type="number"
                min="0"
                value={pricePerSeat}
                onChange={e => setPricePerSeat(e.target.value)}
              />
              <Input
                label={t('myRides.totalSeats')}
                type="number"
                min="1"
                max="8"
                value={totalSeats}
                onChange={e => setTotalSeats(e.target.value)}
              />
            </div>

            <Input
              label={t('myRides.notes')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('myRides.notesPlaceholder')}
            />

            {/* Intermediate Stops */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('myRides.intermediateStops')}
              </label>
              <div className="space-y-2">
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CityAutocomplete
                      value={stop}
                      onChange={val => {
                        const next = [...stops]
                        next[i] = val
                        setStops(next)
                      }}
                      placeholder={`${t('myRides.intermediateStops')} ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => setStops(stops.filter((_, j) => j !== i))}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStops([...stops, ''])}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('myRides.addStop')}
              </Button>
            </div>

            <Button
              onClick={handleCreate}
              loading={creating}
              className="w-full"
              size="lg"
            >
              {t('myRides.publish')}
            </Button>
          </div>
        </Modal>

        {/* Rides List */}
        {loading ? (
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        ) : rides.length === 0 ? (
          <EmptyState
            title={t('myRides.noRides')}
            action={
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t('myRides.create')}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {rides.map(ride => {
              const isExpanded = expandedRide === ride.id
              return (
                <Card key={ride.id}>
                  <CardContent className="p-4">
                    {/* Ride summary */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={statusVariant[ride.status]}>
                            {t(`rides.status.${ride.status}`)}
                          </Badge>
                          <span className="text-lg font-bold text-blue-600">
                            {formatUZS(ride.price_per_seat)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>{ride.origin} → {ride.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(ride.departure_at, i18n.language)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {ride.available_seats} / {ride.total_seats}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {ride.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStatusChange(ride.id, 'completed')}
                            loading={statusLoading === ride.id}
                          >
                            {t('myRides.completeRide')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleStatusChange(ride.id, 'cancelled')}
                            loading={statusLoading === ride.id}
                          >
                            {t('myRides.cancelRide')}
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedRide(isExpanded ? null : ride.id)}
                      >
                        {t('myRides.bookings')}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded bookings */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {t('myRides.bookings')}
                        </h4>
                        <RideBookings rideId={ride.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
