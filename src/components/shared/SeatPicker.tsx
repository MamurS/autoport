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

  const seatButton = (index: number) => {
    const status = getSeatStatus(index)
    const isClickable = status === 'available' || status === 'selected'

    const styles: Record<string, string> = {
      driver: 'bg-black/30 border-white/20 text-white/60 cursor-not-allowed',
      booked: 'bg-red-500/70 border-red-400 text-white cursor-not-allowed shadow-lg shadow-red-500/20',
      available: 'bg-white/20 border-white/40 text-white hover:bg-green-400/50 hover:border-green-300 hover:shadow-lg hover:shadow-green-400/20 cursor-pointer backdrop-blur-sm',
      selected: 'bg-blue-500/80 border-blue-300 text-white cursor-pointer shadow-lg shadow-blue-500/30 ring-2 ring-blue-300/50',
    }

    const label = status === 'driver'
      ? (isUz ? 'Haydovchi' : 'Водитель')
      : status === 'booked'
        ? (isUz ? 'Band' : 'Занято')
        : status === 'selected'
          ? (isUz ? 'Tanlandi' : 'Выбрано')
          : (isUz ? "Bo'sh" : 'Свободно')

    const icon = status === 'driver' ? '🚗' : status === 'booked' ? '👤' : status === 'selected' ? '✓' : ''

    return (
      <button
        key={index}
        type="button"
        disabled={!isClickable}
        onClick={() => toggleSeat(index)}
        className={`
          w-[72px] h-[80px] sm:w-[80px] sm:h-[88px]
          rounded-xl border-2
          flex flex-col items-center justify-center gap-1
          transition-all duration-200
          ${styles[status]}
        `}
      >
        <span className="text-lg leading-none">{icon || `${index}`}</span>
        <span className="text-[9px] sm:text-[10px] font-medium leading-none opacity-90">{label}</span>
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Car interior container */}
      <div
        className="relative rounded-2xl overflow-hidden mx-auto"
        style={{
          maxWidth: '340px',
          background: `
            radial-gradient(ellipse 120% 50% at 50% 15%, #2a2a2a 0%, transparent 70%),
            radial-gradient(ellipse 100% 40% at 50% 90%, #1a1a1a 0%, transparent 60%),
            linear-gradient(180deg, #3a3a3a 0%, #2c2c2c 20%, #252525 50%, #1e1e1e 80%, #181818 100%)
          `,
        }}
      >
        {/* Top: Dashboard area */}
        <div className="relative pt-4 pb-2 px-4">
          {/* Windshield reflection */}
          <div
            className="absolute top-0 left-0 right-0 h-12"
            style={{
              background: 'linear-gradient(180deg, rgba(135,206,250,0.15) 0%, transparent 100%)',
              borderRadius: '16px 16px 0 0',
            }}
          />
          {/* Dashboard */}
          <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
            <div
              className="h-8 rounded-t-xl"
              style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
              }}
            >
              {/* Dashboard details */}
              <div className="flex items-center justify-between h-full px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
                  <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
                </div>
                {/* Rearview mirror */}
                <div className="w-8 h-3 rounded-full bg-gray-500 border border-gray-400" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }} />
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
                  <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steering wheel + front seats row */}
        <div className="relative px-4 pb-3">
          <div className="flex items-center justify-center gap-4 sm:gap-6 relative">
            {/* Steering wheel overlay on driver seat */}
            <div className="relative">
              {seatButton(0)}
              {/* Steering wheel */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(180,180,180,0.6)" strokeWidth="3" />
                  <circle cx="20" cy="20" r="5" fill="rgba(120,120,120,0.5)" />
                  <line x1="20" y1="4" x2="20" y2="12" stroke="rgba(180,180,180,0.5)" strokeWidth="2" />
                  <line x1="6" y1="26" x2="13" y2="22" stroke="rgba(180,180,180,0.5)" strokeWidth="2" />
                  <line x1="34" y1="26" x2="27" y2="22" stroke="rgba(180,180,180,0.5)" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Center console */}
            <div className="flex flex-col items-center gap-1 w-6">
              <div className="w-4 h-4 rounded-full bg-gray-600 border border-gray-500" title="Gear shift" />
              <div className="w-3 h-8 rounded-sm bg-gray-700" />
            </div>

            {/* Front passenger seat */}
            {seatButton(1)}
          </div>
        </div>

        {/* Texture divider (center console extension) */}
        <div className="flex items-center justify-center py-1">
          <div className="flex items-center gap-2">
            <div className="w-20 h-px bg-gray-600" />
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <div className="w-20 h-px bg-gray-600" />
          </div>
        </div>

        {/* Back seats row */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {backRow.map(i => seatButton(i))}
          </div>
        </div>

        {/* Floor texture */}
        <div className="h-6 relative">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
            }}
          />
          {/* Floor mats hint */}
          <div className="flex justify-center gap-16 pt-1">
            <div className="w-10 h-3 rounded-sm bg-gray-800/50" />
            <div className="w-10 h-3 rounded-sm bg-gray-800/50" />
          </div>
        </div>

        {/* Seat texture overlay (leather pattern) */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)
            `,
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded border-2 border-gray-300 bg-gray-100" />
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
