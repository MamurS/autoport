import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Ban, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile, UserRole } from '../../types'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { formatPhone } from '../../lib/utils'

const initialUsers: Profile[] = [
  { id: '1', role: 'driver', full_name: 'Алишер Каримов', phone: '+998901234567', avatar_url: null, car_model: 'Chevrolet Cobalt', car_color: 'Белый', license_plate: '01A123BC', seats_total: 4, deposit_balance: 500000, avg_rating: 4.5, rating_count: 12, language: 'ru', is_banned: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: '2', role: 'driver', full_name: 'Бахтиёр Рахимов', phone: '+998907654321', avatar_url: null, car_model: 'Chevrolet Gentra', car_color: 'Серый', license_plate: '40B456DE', seats_total: 3, deposit_balance: 300000, avg_rating: 4.8, rating_count: 25, language: 'ru', is_banned: false, created_at: '2024-02-10T10:00:00Z', updated_at: '2024-02-10T10:00:00Z' },
  { id: '3', role: 'passenger', full_name: 'Нодира Ахмедова', phone: '+998901111111', avatar_url: null, car_model: null, car_color: null, license_plate: null, seats_total: null, deposit_balance: 0, avg_rating: 4.2, rating_count: 5, language: 'ru', is_banned: false, created_at: '2024-01-20T10:00:00Z', updated_at: '2024-01-20T10:00:00Z' },
  { id: '4', role: 'passenger', full_name: 'Фарход Исмаилов', phone: '+998902222222', avatar_url: null, car_model: null, car_color: null, license_plate: null, seats_total: null, deposit_balance: 0, avg_rating: 0, rating_count: 0, language: 'uz', is_banned: true, created_at: '2024-03-01T10:00:00Z', updated_at: '2024-03-01T10:00:00Z' },
  { id: '5', role: 'admin', full_name: 'Admin User', phone: '+998900000000', avatar_url: null, car_model: null, car_color: null, license_plate: null, seats_total: null, deposit_balance: 0, avg_rating: 0, rating_count: 0, language: 'ru', is_banned: false, created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T10:00:00Z' },
]

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [search, setSearch] = useState('')

  function toggleBan(user: Profile) {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u))
    toast.success(user.is_banned ? 'User unbanned' : 'User banned')
  }

  function changeRole(userId: string, newRole: UserRole) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    toast.success('Role updated')
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return u.full_name.toLowerCase().includes(q) || u.phone.includes(q)
  })

  const roleOptions = [
    { value: 'passenger', label: 'Passenger' },
    { value: 'driver', label: 'Driver' },
    { value: 'admin', label: 'Admin' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.users')}</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-3">
        {filtered.map(user => (
          <Card key={user.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{user.full_name}</span>
                  <Badge variant={user.role === 'admin' ? 'info' : user.role === 'driver' ? 'warning' : 'default'}>{user.role}</Badge>
                  {user.is_banned && <Badge variant="danger">Banned</Badge>}
                </div>
                <p className="text-sm text-gray-500">{formatPhone(user.phone)}</p>
                <p className="text-sm text-gray-500">Rating: {user.avg_rating.toFixed(1)} ({user.rating_count})</p>
              </div>
              <div className="flex items-center gap-2">
                <Select options={roleOptions} value={user.role} onChange={e => changeRole(user.id, e.target.value as UserRole)} className="w-32" />
                <Button variant={user.is_banned ? 'secondary' : 'danger'} size="sm" onClick={() => toggleBan(user)}>
                  {user.is_banned ? <><ShieldCheck className="h-4 w-4 mr-1" /> Unban</> : <><Ban className="h-4 w-4 mr-1" /> Ban</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
