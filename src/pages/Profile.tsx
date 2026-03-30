import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { User, Car, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useReviews } from '../hooks/useReviews'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StarRating } from '../components/ui/StarRating'
import { EmptyState } from '../components/ui/EmptyState'
import { ReviewCard } from '../components/shared/ReviewCard'
import { formatDate, formatPhone } from '../lib/utils'

export default function Profile() {
  const { t, i18n } = useTranslation()
  const { profile, updateProfile } = useAuth()

  const { reviews, loading: reviewsLoading } = useReviews(profile?.id || '')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [carModel, setCarModel] = useState(profile?.car_model || '')
  const [carColor, setCarColor] = useState(profile?.car_color || '')
  const [licensePlate, setLicensePlate] = useState(profile?.license_plate || '')

  const handleEdit = () => {
    setFullName(profile?.full_name || '')
    setAvatarUrl(profile?.avatar_url || '')
    setCarModel(profile?.car_model || '')
    setCarColor(profile?.car_color || '')
    setLicensePlate(profile?.license_plate || '')
    setEditing(true)
  }

  const handleSave = async () => {
    if (!fullName.trim()) return
    setSaving(true)

    const updates: Record<string, unknown> = {
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim() || null,
    }

    if (profile?.role === 'driver') {
      updates.car_model = carModel.trim() || null
      updates.car_color = carColor.trim() || null
      updates.license_plate = licensePlate.trim() || null
    }

    const { error } = await updateProfile(updates as any)
    setSaving(false)

    if (error) {
      toast.error(t('toast.error'))
    } else {
      toast.success(t('toast.profileUpdated'))
      setEditing(false)
    }
  }

  if (!profile) return null

  const isDriver = profile.role === 'driver'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-900">{t('profile.title')}</h1>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-5 sm:p-6">
            {!editing ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {profile.full_name}
                    </h2>
                    <p className="text-sm text-gray-500">{formatPhone(profile.phone)}</p>
                    <Badge variant="info" className="mt-1">
                      {t(`profile.role.${profile.role}`)}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-500">{t('profile.rating')}:</span>
                  {profile.avg_rating > 0 ? (
                    <div className="flex items-center gap-2">
                      <StarRating rating={profile.avg_rating} size={16} />
                      <span className="text-sm font-medium text-gray-700">
                        {profile.avg_rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({profile.rating_count})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">--</span>
                  )}
                </div>

                {/* Car info for drivers */}
                {isDriver && (profile.car_model || profile.car_color || profile.license_plate) && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Car className="h-4 w-4" />
                      {t('rides.car')}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {profile.car_model && <p>{profile.car_model}</p>}
                      {profile.car_color && <p>{profile.car_color}</p>}
                      {profile.license_plate && (
                        <p className="font-mono">{profile.license_plate}</p>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  {t('profile.memberSince')}: {formatDate(profile.created_at, i18n.language)}
                </p>
              </>
            ) : (
              /* Edit Form */
              <div className="space-y-4">
                <Input
                  label={t('auth.fullName')}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                />

                <Input
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />

                {isDriver && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Car className="h-4 w-4" />
                      {t('rides.car')}
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
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleSave} loading={saving}>
                    {t('common.save')}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('profile.reviews')}</h3>
          {reviewsLoading ? (
            <p className="text-sm text-gray-400">{t('common.loading')}</p>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('profile.noReviews')} />
          )}
        </div>
      </div>
    </div>
  )
}
