import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Car, Search, Shield, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface OnboardingProps {
  onComplete: () => void
}

const slides = [
  {
    icon: Search,
    titleRu: 'Найдите поездку',
    titleUz: 'Sayohat toping',
    descRu: 'Выберите откуда и куда вы едете, укажите дату — и мы покажем все доступные поездки с ценами и водителями.',
    descUz: "Qayerdan va qayerga ketayotganingizni tanlang, sanani ko'rsating — biz barcha mavjud sayohatlarni narxlar va haydovchilar bilan ko'rsatamiz.",
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Car,
    titleRu: 'Забронируйте место',
    titleUz: "O'rin bron qiling",
    descRu: 'Нажмите "Забронировать" — водитель получит уведомление и подтвердит бронь в течение 30 минут.',
    descUz: '"Bron qilish" tugmasini bosing — haydovchi xabar oladi va 30 daqiqa ichida bronni tasdiqlaydi.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Shield,
    titleRu: 'Безопасно и удобно',
    titleUz: 'Xavfsiz va qulay',
    descRu: 'Рейтинги водителей, отзывы пассажиров, информация об автомобиле — всё для вашего спокойствия.',
    descUz: "Haydovchilar reytinglari, yo'lovchilar sharhlari, avtomobil haqida ma'lumot — hammasi sizning xotirjamligingiz uchun.",
    color: 'bg-purple-100 text-purple-600',
  },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { i18n } = useTranslation()
  const [step, setStep] = useState<'language' | 'slides'>('language')
  const [slideIndex, setSlideIndex] = useState(0)

  const isUz = i18n.language === 'uz'

  const selectLanguage = (lang: 'ru' | 'uz') => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    setStep('slides')
  }

  const nextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1)
    }
  }

  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AutoPort Taxi</h1>
          <p className="text-blue-200 mb-8">Tilni tanlang / Выберите язык</p>

          <div className="space-y-3 max-w-xs mx-auto">
            <button
              onClick={() => selectLanguage('ru')}
              className="w-full bg-white rounded-xl px-6 py-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">Русский</p>
                <p className="text-sm text-gray-500">Продолжить на русском</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => selectLanguage('uz')}
              className="w-full bg-white rounded-xl px-6 py-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">O'zbek tili</p>
                <p className="text-sm text-gray-500">O'zbek tilida davom etish</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const slide = slides[slideIndex]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onComplete}
          className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1"
        >
          {isUz ? "O'tkazib yuborish" : 'Пропустить'}
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className={`w-24 h-24 rounded-2xl ${slide.color} flex items-center justify-center mb-8`}>
          <Icon className="h-12 w-12" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {isUz ? slide.titleUz : slide.titleRu}
        </h2>
        <p className="text-gray-500 text-center max-w-sm leading-relaxed">
          {isUz ? slide.descUz : slide.descRu}
        </p>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === slideIndex ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {slideIndex > 0 && (
            <Button variant="secondary" size="lg" onClick={prevSlide} className="px-4">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Button size="lg" onClick={nextSlide} className="flex-1">
            {slideIndex === slides.length - 1
              ? (isUz ? 'Boshlash' : 'Начать')
              : (isUz ? 'Keyingi' : 'Далее')
            }
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
