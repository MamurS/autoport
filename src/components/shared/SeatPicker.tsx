import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, X } from 'lucide-react'

interface SeatPickerProps {
  totalSeats: number
  availableSeats: number
  bookedSeats?: number[] // seat indices that are already taken (0-based)
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

  // Car layout: driver + passengers
  // Seat 0 = driver (always taken), seats 1-3 = front passenger + back row
  // For 4-seat car: [driver][front-pass] / [back-left][back-right]
  // For 3-seat car: [driver][front-pass] / [back-center]
  // For 5+ seat car: [driver][front-pass] / [back-left][back-center][back-right]

  const getSeatLabel = (index: number) => {
    if (index === 0) return isUz ? 'Haydovchi' : 'Водитель'
    return `${index}`
  }

  const getSeatStatus = (index: number): 'driver' | 'booked' | 'available' | 'selected' => {
    if (index === 0) return 'driver'
    if (bookedSeats.includes(index)) return 'booked'
    if (selectedSeats.includes(index)) return 'selected'
    return 'available'
  }

  const seatStyles = {
    driver: 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed',
    booked: 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed',
    available: 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer',
    selected: 'bg-blue-600 text-white border-blue-600 cursor-pointer ring-2 ring-blue-300',
  }

  // Build seat layout based on total seats
  // Row 1: driver + front passenger
  // Row 2: back seats
  const frontRow = [0, 1] // driver, front passenger
  const backRow: number[] = []
  for (let i = 2; i < totalSeats + 1; i++) {
    backRow.push(i)
  }

  const renderSeat = (index: number) => {
    const status = getSeatStatus(index)
    return (
      <button
        key={index}
        type="button"
        disabled={status === 'driver' || status === 'booked'}
        onClick={() => toggleSeat(index)}
        className={`
          relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2
          flex flex-col items-center justify-center gap-0.5
          transition-all duration-150
          ${seatStyles[status]}
        `}
      >
        {status === 'driver' ? (
          <>
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="3" />
                <path d="M12 14c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z" />
              </svg>
            </div>
            <span className="text-[9px] font-medium leading-none">{getSeatLabel(index)}</span>
          </>
        ) : status === 'booked' ? (
          <>
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">
              {isUz ? 'Band' : 'Занято'}
            </span>
          </>
        ) : status === 'selected' ? (
          <>
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold leading-none">
              {isUz ? 'Siz' : 'Вы'}
            </span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300" />
            <span className="text-[9px] font-medium leading-none">{index}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Car body */}
      <div className="relative bg-gray-50 rounded-2xl border border-gray-200 p-4 max-w-[220px] mx-auto">
        {/* Car top (windshield) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-200 rounded-t-lg border border-gray-300 border-b-0" />

        {/* Steering wheel indicator */}
        <div className="absolute top-5 left-6 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Front row */}
        <div className="flex justify-center gap-3 mb-3 pt-1">
          {frontRow.map(i => (i < totalSeats + 1 ? renderSeat(i) : null))}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 mb-3" />

        {/* Back row */}
        <div className="flex justify-center gap-3">
          {backRow.map(i => (i < totalSeats + 1 ? renderSeat(i) : null))}
        </div>

        {/* Car bottom (trunk) */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-200 rounded-b-lg border border-gray-300 border-t-0" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-dashed border-gray-300" />
          {isUz ? "Bo'sh" : 'Свободно'}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-600" />
          {isUz ? 'Tanlangan' : 'Выбрано'}
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          {isUz ? 'Band' : 'Занято'}
        </span>
      </div>

      {/* Selection count */}
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
