import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cityCoordinates } from '../../lib/demoData'
import { formatUZS, formatDateTime } from '../../lib/utils'
import { StarRating } from '../ui/StarRating'
import type { Ride } from '../../types'

import 'leaflet/dist/leaflet.css'

// Custom price label marker
function createPriceIcon(price: string, carModel: string) {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: white;
        border: 2px solid #2563eb;
        border-radius: 12px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 700;
        color: #2563eb;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 1.3;
        cursor: pointer;
      ">
        <span>${price}</span>
        <span style="font-size: 10px; font-weight: 400; color: #6b7280;">${carModel}</span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #2563eb;
        margin: 0 auto;
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [50, 52],
    popupAnchor: [0, -52],
  })
}

L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface RideMapProps {
  rides: Ride[]
  originCity?: string
}

// Spread markers around city center so they don't overlap
function getSpreadPosition(
  baseCoord: [number, number],
  index: number,
  total: number
): [number, number] {
  if (total <= 1) return baseCoord
  const radius = 0.008 + (total > 4 ? 0.004 : 0)
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  return [
    baseCoord[0] + radius * Math.sin(angle),
    baseCoord[1] + radius * Math.cos(angle),
  ]
}

function FitToCity({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

export function RideMap({ rides, originCity }: RideMapProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [selectedRide, setSelectedRide] = useState<string | null>(null)

  // Determine the city to center on: the origin filter or the most common origin
  const mapCity = useMemo(() => {
    if (originCity && cityCoordinates[originCity]) return originCity
    // Find the most common origin city among rides
    const counts: Record<string, number> = {}
    rides.forEach(r => {
      counts[r.origin] = (counts[r.origin] || 0) + 1
    })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || 'Ташкент'
  }, [originCity, rides])

  const cityCenter = cityCoordinates[mapCity] || [41.2995, 69.2401]

  // Group rides by origin city matching the map city
  const cityRides = useMemo(() => {
    return rides.filter(r => {
      const coord = cityCoordinates[r.origin]
      return coord !== undefined
    })
  }, [rides])

  // Group by origin for positioning
  const ridesByOrigin = useMemo(() => {
    const groups: Record<string, Ride[]> = {}
    cityRides.forEach(r => {
      if (!groups[r.origin]) groups[r.origin] = []
      groups[r.origin].push(r)
    })
    return groups
  }, [cityRides])

  return (
    <div className="space-y-0">
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '500px' }}>
        <MapContainer
          center={cityCenter as [number, number]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToCity center={cityCenter as [number, number]} zoom={12} />

          {Object.entries(ridesByOrigin).map(([city, group]) => {
            const baseCoord = cityCoordinates[city]
            if (!baseCoord) return null

            return group.map((ride, idx) => {
              const pos = getSpreadPosition(baseCoord, idx, group.length)
              const priceStr = formatUZS(ride.price_per_seat)
              const carStr = ride.driver?.car_model || '—'

              return (
                <Marker
                  key={ride.id}
                  position={pos}
                  icon={createPriceIcon(priceStr, carStr)}
                  eventHandlers={{
                    click: () => setSelectedRide(ride.id),
                  }}
                >
                  <Popup maxWidth={280} minWidth={240}>
                    <div className="text-sm" style={{ minWidth: '220px' }}>
                      {/* Route */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <div className="w-0.5 h-4 bg-gray-300" />
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{ride.origin}</p>
                          <p className="font-semibold text-gray-900">{ride.destination}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-blue-600">{priceStr}</span>
                        <span className="text-xs text-gray-500">
                          {ride.available_seats} {t('common.seats')}
                        </span>
                      </div>

                      {/* Time */}
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDateTime(ride.departure_at, i18n.language)}
                      </p>

                      {/* Driver info */}
                      {ride.driver && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                            {ride.driver.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {ride.driver.full_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ride.driver.car_model} · {ride.driver.car_color}
                            </p>
                            {ride.driver.avg_rating > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <StarRating rating={ride.driver.avg_rating} size={10} />
                                <span className="text-xs text-gray-400">{ride.driver.avg_rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {ride.notes && (
                        <p className="text-xs text-gray-500 italic mb-2">"{ride.notes}"</p>
                      )}

                      {/* Action button */}
                      <button
                        onClick={() => navigate(`/rides/${ride.id}`)}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {t('rides.book')} →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            })
          })}
        </MapContainer>
      </div>
    </div>
  )
}
