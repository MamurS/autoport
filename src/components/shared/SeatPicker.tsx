import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'

interface SeatPickerProps {
  totalSeats: number
  availableSeats: number
  bookedSeats?: number[]
  maxSelect?: number
  onSelect: (selectedSeats: number[]) => void
  selectedSeats?: number[]
}

export function SeatPicker({
  totalSeats,
  availableSeats,
  bookedSeats = [],
  maxSelect,
  onSelect,
  selectedSeats = [],
}: SeatPickerProps) {
  const { i18n } = useTranslation()
  const isUz = i18n.language === 'uz'

  const toggleSeat = (seatIndex: number) => {
    if (bookedSeats.includes(seatIndex)) return
    if (selectedSeats.includes(seatIndex)) {
      onSelect(selectedSeats.filter(s => s !== seatIndex))
    } else {
      if (maxSelect && selectedSeats.length >= maxSelect) return
      onSelect([...selectedSeats, seatIndex])
    }
  }

  const getSeatStatus = (index: number): 'driver' | 'booked' | 'available' | 'selected' => {
    if (index === 0) return 'driver'
    if (bookedSeats.includes(index)) return 'booked'
    if (selectedSeats.includes(index)) return 'selected'
    return 'available'
  }

  const frontRow = [0, 1]
  const backRow: number[] = []
  for (let i = 2; i < totalSeats + 1; i++) {
    backRow.push(i)
  }

  const renderSeat = (index: number, position: 'driver' | 'front' | 'back') => {
    const status = getSeatStatus(index)
    const isClickable = status === 'available' || status === 'selected'

    // Seat colors
    const seatFill = {
      driver: '#94a3b8',
      booked: '#fca5a5',
      available: '#e2e8f0',
      selected: '#3b82f6',
    }[status]

    const seatStroke = {
      driver: '#64748b',
      booked: '#ef4444',
      available: '#94a3b8',
      selected: '#1d4ed8',
    }[status]

    const textColor = status === 'selected' ? 'white' : status === 'booked' ? '#dc2626' : '#475569'

    const label = status === 'driver'
      ? (isUz ? 'H' : 'В')
      : status === 'booked'
        ? (isUz ? 'B' : 'X')
        : status === 'selected'
          ? '✓'
          : `${index}`

    const sublabel = status === 'driver'
      ? (isUz ? 'Haydovchi' : 'Водитель')
      : status === 'booked'
        ? (isUz ? 'Band' : 'Занято')
        : status === 'selected'
          ? (isUz ? 'Siz' : 'Вы')
          : (isUz ? "Bo'sh" : 'Свободно')

    return (
      <g
        key={index}
        onClick={() => isClickable && toggleSeat(index)}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        {/* Seat back (headrest) */}
        <rect
          x={0} y={0} width={56} height={12} rx={6}
          fill={seatFill} stroke={seatStroke} strokeWidth={1.5}
          opacity={0.7}
        />
        {/* Seat cushion */}
        <rect
          x={2} y={14} width={52} height={44} rx={8}
          fill={seatFill} stroke={seatStroke} strokeWidth={1.5}
        />
        {/* Armrests */}
        <rect x={-3} y={18} width={6} height={30} rx={3} fill={seatFill} opacity={0.5} />
        <rect x={53} y={18} width={6} height={30} rx={3} fill={seatFill} opacity={0.5} />
        {/* Label */}
        <text
          x={28} y={34}
          textAnchor="middle"
          fill={textColor}
          fontSize={status === 'selected' ? 18 : 16}
          fontWeight="bold"
          fontFamily="system-ui"
        >
          {label}
        </text>
        <text
          x={28} y={50}
          textAnchor="middle"
          fill={textColor}
          fontSize={8}
          fontFamily="system-ui"
          opacity={0.8}
        >
          {sublabel}
        </text>
        {/* Hover highlight for available */}
        {status === 'available' && (
          <rect
            x={2} y={14} width={52} height={44} rx={8}
            fill="transparent"
            className="hover:fill-blue-100"
            style={{ transition: 'fill 0.15s' }}
          />
        )}
      </g>
    )
  }

  // Seat positions within SVG
  const seatW = 56
  const gap = 16
  const carW = 260
  const carH = 320

  // Front row: 2 seats
  const frontX = [
    (carW / 2) - seatW - (gap / 2), // left (driver)
    (carW / 2) + (gap / 2),          // right (passenger)
  ]
  const frontY = 65

  // Back row: centered
  const backCount = backRow.length
  const totalBackW = backCount * seatW + (backCount - 1) * (gap / 2)
  const backStartX = (carW - totalBackW) / 2
  const backY = 190

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${carW} ${carH}`}
          width={carW}
          className="max-w-full"
          style={{ height: 'auto' }}
        >
          {/* Car body outline */}
          <rect
            x={10} y={8} width={carW - 20} height={carH - 16} rx={40}
            fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2}
          />

          {/* Windshield */}
          <path
            d={`M ${carW / 2 - 60} 20 Q ${carW / 2} 0 ${carW / 2 + 60} 20`}
            fill="none" stroke="#93c5fd" strokeWidth={3} strokeLinecap="round"
          />
          <rect
            x={carW / 2 - 55} y={18} width={110} height={28} rx={10}
            fill="#dbeafe" stroke="#93c5fd" strokeWidth={1.5} opacity={0.6}
          />

          {/* Rear window */}
          <rect
            x={carW / 2 - 50} y={carH - 40} width={100} height={22} rx={10}
            fill="#dbeafe" stroke="#93c5fd" strokeWidth={1.5} opacity={0.6}
          />

          {/* Side mirrors */}
          <ellipse cx={6} cy={55} rx={6} ry={10} fill="#cbd5e1" />
          <ellipse cx={carW - 6} cy={55} rx={6} ry={10} fill="#cbd5e1" />

          {/* Steering wheel (left side) */}
          <g transform={`translate(${frontX[0] + 20}, ${frontY - 16})`}>
            <circle cx={8} cy={8} r={10} fill="none" stroke="#64748b" strokeWidth={2.5} />
            <circle cx={8} cy={8} r={3} fill="#64748b" />
            <line x1={8} y1={-2} x2={8} y2={4} stroke="#64748b" strokeWidth={1.5} />
            <line x1={1} y1={13} x2={5} y2={10} stroke="#64748b" strokeWidth={1.5} />
            <line x1={15} y1={13} x2={11} y2={10} stroke="#64748b" strokeWidth={1.5} />
          </g>

          {/* Dashboard line */}
          <line
            x1={30} y1={55} x2={carW - 30} y2={55}
            stroke="#e2e8f0" strokeWidth={2} strokeDasharray="4 3"
          />
          {/* Center console between rows */}
          <rect
            x={carW / 2 - 8} y={frontY + 60} width={16} height={backY - frontY - 60}
            rx={4} fill="#e2e8f0"
          />
          {/* Gear shift */}
          <circle cx={carW / 2} cy={frontY + 75} r={5} fill="#94a3b8" />

          {/* Front row seats */}
          {frontRow.map((seatIdx, i) => (
            <g key={seatIdx} transform={`translate(${frontX[i]}, ${frontY})`}>
              {renderSeat(seatIdx, i === 0 ? 'driver' : 'front')}
            </g>
          ))}

          {/* Back row seats */}
          {backRow.map((seatIdx, i) => (
            <g key={seatIdx} transform={`translate(${backStartX + i * (seatW + gap / 2)}, ${backY})`}>
              {renderSeat(seatIdx, 'back')}
            </g>
          ))}

          {/* Wheels */}
          <rect x={2} y={80} width={10} height={35} rx={5} fill="#374151" />
          <rect x={carW - 12} y={80} width={10} height={35} rx={5} fill="#374151" />
          <rect x={2} y={220} width={10} height={35} rx={5} fill="#374151" />
          <rect x={carW - 12} y={220} width={10} height={35} rx={5} fill="#374151" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14"><rect width="14" height="14" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" /></svg>
          {isUz ? "Bo'sh" : 'Свободно'}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14"><rect width="14" height="14" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" /></svg>
          {isUz ? 'Tanlangan' : 'Выбрано'}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14"><rect width="14" height="14" rx="3" fill="#fca5a5" stroke="#ef4444" strokeWidth="1" /></svg>
          {isUz ? 'Band' : 'Занято'}
        </span>
      </div>

      {selectedSeats.length > 0 && (
        <p className="text-center text-sm font-medium text-blue-600">
          {isUz
            ? `${selectedSeats.length} o'rin tanlandi`
            : `Выбрано мест: ${selectedSeats.length}`
          }
        </p>
      )}
    </div>
  )
}
