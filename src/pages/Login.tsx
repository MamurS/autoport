import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Phone, ShieldCheck, UserPlus, Car } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import type { UserRole } from '../types'

type Step = 'phone' | 'otp' | 'register'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signInWithOTP, verifyOTP, user, refreshProfile } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('+998')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Registration fields
  const [role, setRole] = useState<UserRole>('passenger')
  const [fullName, setFullName] = useState('')
  const [carModel, setCarModel] = useState('')
  const [carColor, setCarColor] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [seatsTotal, setSeatsTotal] = useState('4')

  const handleSendOTP = async () => {
    if (!phone || phone.length < 9) return
    setLoading(true)
    const { error } = await signInWithOTP(phone)
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setStep('otp')
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpCode) return
    setLoading(true)
    const { error } = await verifyOTP(phone, otpCode)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    // Check if profile exists
    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    if (!userId) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (profile) {
      navigate('/')
    } else {
      setStep('register')
    }
  }

  const handleRegister = async () => {
    if (!fullName.trim()) return
    setLoading(true)

    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    if (!userId) {
      setLoading(false)
      return
    }

    const profileData: Record<string, unknown> = {
      id: userId,
      phone,
      full_name: fullName.trim(),
      role,
      deposit_balance: 0,
      avg_rating: 0,
      rating_count: 0,
      language: 'ru',
      is_banned: false,
    }

    if (role === 'driver') {
      profileData.car_model = carModel.trim() || null
      profileData.car_color = carColor.trim() || null
      profileData.license_plate = licensePlate.trim() || null
      profileData.seats_total = parseInt(seatsTotal) || 4
    }

    const { error } = await supabase.from('profiles').insert(profileData)
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      await refreshProfile()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
            {step === 'register' ? t('auth.register') : t('auth.title')}
          </h1>

          {step === 'phone' && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <Input
                label={t('auth.phone')}
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
              />
              <Button
                onClick={handleSendOTP}
                loading={loading}
                className="w-full"
                size="lg"
              >
                {t('auth.sendCode')}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">{phone}</p>
              <Input
                label={t('auth.code')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder={t('auth.codePlaceholder')}
              />
              <Button
                onClick={handleVerifyOTP}
                loading={loading}
                className="w-full"
                size="lg"
              >
                {t('auth.verify')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full"
              >
                {t('common.back')}
              </Button>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <Select
                label={t('auth.selectRole')}
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                options={[
                  { value: 'passenger', label: t('auth.passenger') },
                  { value: 'driver', label: t('auth.driver') },
                ]}
              />

              <Input
                label={t('auth.fullName')}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
              />

              {role === 'driver' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Car className="h-4 w-4" />
                    <span>{t('rides.car')}</span>
                  </div>
                  <Input
                    label={t('auth.carModel')}
                    value={carModel}
                    onChange={e => setCarModel(e.target.value)}
                    placeholder={t('auth.carModelPlaceholder')}
                  />
                  <Input
                    label={t('auth.carColor')}
                    value={carColor}
                    onChange={e => setCarColor(e.target.value)}
                    placeholder={t('auth.carColorPlaceholder')}
                  />
                  <Input
                    label={t('auth.licensePlate')}
                    value={licensePlate}
                    onChange={e => setLicensePlate(e.target.value)}
                    placeholder={t('auth.licensePlatePlaceholder')}
                  />
                  <Input
                    label={t('auth.seatsTotal')}
                    type="number"
                    min="1"
                    max="8"
                    value={seatsTotal}
                    onChange={e => setSeatsTotal(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleRegister}
                loading={loading}
                className="w-full"
                size="lg"
              >
                {t('auth.completeRegistration')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
