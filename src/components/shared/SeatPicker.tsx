import { useTranslation } from 'react-i18next'

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

  const backRow: number[] = []
  for (let i = 2; i < totalSeats + 1; i++) backRow.push(i)

  // Seat overlay positions (% based, matching the light SVG layout)
  const seatPositions: Record<number, { top: string; left: string; width: string; height: string }> = {
    0: { top: '28%', left: '13%', width: '27%', height: '17%' },   // driver
    1: { top: '28%', left: '60%', width: '27%', height: '17%' },   // front passenger
    2: { top: '69%', left: '10%', width: '24%', height: '14%' },   // back left
    3: { top: '69%', left: '38%', width: '24%', height: '14%' },   // back center
    4: { top: '69%', left: '65%', width: '24%', height: '14%' },   // back right
  }

  const seatButton = (index: number) => {
    const status = getSeatStatus(index)
    const isClickable = status === 'available' || status === 'selected'
    const pos = seatPositions[index]
    if (!pos) return null

    const overlayStyles: Record<string, string> = {
      driver: 'bg-gray-800/30 border-gray-600/40',
      booked: 'bg-red-500/40 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      available: 'bg-transparent border-2 border-dashed border-gray-500/40 hover:bg-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_0_16px_rgba(59,130,246,0.2)]',
      selected: 'bg-blue-500/40 border-blue-500/70 shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    }

    const label = status === 'driver'
      ? (isUz ? 'Haydovchi' : 'Водитель')
      : status === 'booked'
        ? (isUz ? 'Band' : 'Занято')
        : status === 'selected'
          ? '✓'
          : ''

    const sublabel = status === 'available'
      ? (isUz ? "Bo'sh" : 'Свободно')
      : status === 'selected'
        ? (isUz ? 'Tanlandi' : 'Выбрано')
        : ''

    return (
      <button
        key={index}
        type="button"
        disabled={!isClickable}
        onClick={() => toggleSeat(index)}
        className={`
          absolute rounded-xl border-2 transition-all duration-200
          flex flex-col items-center justify-center
          ${overlayStyles[status]}
          ${isClickable ? 'cursor-pointer' : 'cursor-default'}
        `}
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          height: pos.height,
        }}
      >
        {label && (
          <span className={`text-xs sm:text-sm font-bold leading-none drop-shadow ${
            status === 'selected' ? 'text-blue-800' : status === 'booked' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className={`text-[9px] sm:text-[10px] font-medium leading-none mt-0.5 ${
            status === 'selected' ? 'text-blue-700' : 'text-gray-500'
          }`}>
            {sublabel}
          </span>
        )}
      </button>
    )
  }

  const allSeats = [0, 1, ...backRow]

  return (
    <div className="space-y-3">
      {/* Car interior with overlaid seat buttons */}
      <div
        className="relative mx-auto rounded-[2rem] overflow-hidden"
        style={{ maxWidth: '320px', aspectRatio: '4 / 5' }}
      >
        {/* Car interior SVG background */}
        <img
          src="/car-interior.svg"
          alt="Car interior"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Seat overlay buttons */}
        {allSeats.map(i => seatButton(i))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border border-gray-400 bg-gray-200/50" />
          {isUz ? "Bo'sh" : 'Свободно'}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400" />
          {isUz ? 'Tanlangan' : 'Выбрано'}
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-red-400 border border-red-300" />
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
