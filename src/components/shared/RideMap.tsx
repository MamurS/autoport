import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cityCoordinates } from '../../lib/demoData'
import { formatUZS, formatDateTime } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import type { Ride } from '../../types'

import 'leaflet/dist/leaflet.css'

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface RideMapProps {
  rides: Ride[]
}

function FitBounds({ rides }: { rides: Ride[] }) {
  const map = useMap()

  useEffect(() => {
    const points: L.LatLngExpression[] = []
    rides.forEach(ride => {
      const origin = cityCoordinates[ride.origin]
      const dest = cityCoordinates[ride.destination]
      if (origin) points.push(origin)
      if (dest) points.push(dest)
    })

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [rides, map])

  return null
}

export function RideMap({ rides }: RideMapProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // Center of Uzbekistan as default
  const defaultCenter: [number, number] = [41.3, 66.0]

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '500px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds rides={rides} />

        {rides.map(ride => {
          const originCoord = cityCoordinates[ride.origin]
          const destCoord = cityCoordinates[ride.destination]

          if (!originCoord && !destCoord) return null

          return (
            <div key={ride.id}>
              {/* Origin marker */}
              {originCoord && (
                <Marker position={originCoord} icon={greenIcon}>
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className="font-semibold">{ride.origin}</span>
                      </div>
                      <p className="text-gray-600 mb-1">→ {ride.destination}</p>
                      <p className="font-bold text-blue-600">{formatUZS(ride.price_per_seat)}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(ride.departure_at, i18n.language)}</p>
                      <p className="text-xs text-gray-500">{ride.available_seats} {t('common.seats')}</p>
                      {ride.driver && (
                        <p className="text-xs text-gray-500 mt-1">{ride.driver.full_name}</p>
                      )}
                      <button
                        onClick={() => navigate(`/rides/${ride.id}`)}
                        className="mt-2 w-full text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700"
                      >
                        {t('rides.book')}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destination marker */}
              {destCoord && (
                <Marker position={destCoord} icon={redIcon}>
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        <span className="font-semibold">{ride.destination}</span>
                      </div>
                      <p className="text-gray-600 mb-1">← {ride.origin}</p>
                      <p className="font-bold text-blue-600">{formatUZS(ride.price_per_seat)}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route line */}
              {originCoord && destCoord && (
                <Polyline
                  positions={[originCoord, destCoord]}
                  color="#2563eb"
                  weight={2}
                  opacity={0.6}
                  dashArray="8 4"
                />
              )}
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
