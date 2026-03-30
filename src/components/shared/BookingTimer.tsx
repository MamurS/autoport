import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, AlertTriangle } from 'lucide-react'

interface BookingTimerProps {
  createdAt: string
  timeoutMinutes?: number
  onExpired?: () => void
  reminderMinutes?: number[] // e.g. [15, 5]
  onReminder?: (minutesLeft: number) => void
}

export function BookingTimer({
  createdAt,
  timeoutMinutes = 30,
  onExpired,
  reminderMinutes = [15, 5],
  onReminder,
}: BookingTimerProps) {
  const { i18n } = useTranslation()
  const isUz = i18n.language === 'uz'

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const created = new Date(createdAt).getTime()
    const deadline = created + timeoutMinutes * 60 * 1000
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000))
  })
  const [remindersTriggered, setRemindersTriggered] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpired?.()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1
        if (next <= 0) {
          onExpired?.()
          clearInterval(interval)
          return 0
        }

        // Check reminders
        const minutesLeft = Math.ceil(next / 60)
        for (const rm of reminderMinutes) {
          if (minutesLeft === rm && !remindersTriggered.has(rm)) {
            onReminder?.(rm)
            setRemindersTriggered(prev => new Set([...prev, rm]))
          }
        }

        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium bg-red-50 rounded-lg px-2.5 py-1.5">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>{isUz ? 'Vaqt tugadi — avtomatik rad etildi' : 'Время истекло — автоматически отклонено'}</span>
      </div>
    )
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isUrgent = minutes < 5
  const isWarning = minutes < 15

  const progressPercent = (secondsLeft / (timeoutMinutes * 60)) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${
          isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'
        }`}>
          <Clock className={`h-3.5 w-3.5 ${isUrgent ? 'animate-pulse' : ''}`} />
          <span>
            {isUz ? 'Tasdiqlash uchun qoldi' : 'Осталось для подтверждения'}:
          </span>
          <span className="font-mono font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
