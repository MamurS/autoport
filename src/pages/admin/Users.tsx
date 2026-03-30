import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Ban, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import type { Profile, UserRole } from '../../types'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { formatPhone } from '../../lib/utils'

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(t('admin.fetchError', 'Failed to load users'))
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  async function toggleBan(user: Profile) {
    const newBanned = !user.is_banned
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: newBanned, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      toast.error(t('admin.updateError', 'Failed to update user'))
    } else {
      toast.success(
        newBanned
          ? t('admin.userBanned', 'User banned')
          : t('admin.userUnbanned', 'User unbanned')
      )
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_banned: newBanned } : u))
      )
    }
  }

  async function changeRole(userId: string, newRole: UserRole) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      toast.error(t('admin.updateError', 'Failed to update user'))
    } else {
      toast.success(t('admin.roleUpdated', 'Role updated'))
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q)
    )
  })

  const roleOptions = [
    { value: 'passenger', label: t('roles.passenger', 'Passenger') },
    { value: 'driver', label: t('roles.driver', 'Driver') },
    { value: 'admin', label: t('roles.admin', 'Admin') },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('admin.users', 'Users')}
      </h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t('admin.searchUsers', 'Search by name or phone...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">{t('common.loading', 'Loading...')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('admin.noUsers', 'No users found')}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{user.full_name}</span>
                    <Badge variant={user.role === 'admin' ? 'info' : user.role === 'driver' ? 'warning' : 'default'}>
                      {user.role}
                    </Badge>
                    {user.is_banned && <Badge variant="danger">{t('admin.banned', 'Banned')}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{formatPhone(user.phone)}</p>
                  <p className="text-sm text-gray-500">
                    {t('admin.rating', 'Rating')}: {user.avg_rating.toFixed(1)} ({user.rating_count})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    options={roleOptions}
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                    className="w-32"
                  />
                  <Button
                    variant={user.is_banned ? 'secondary' : 'danger'}
                    size="sm"
                    onClick={() => toggleBan(user)}
                  >
                    {user.is_banned ? (
                      <><ShieldCheck className="h-4 w-4 mr-1" /> {t('admin.unban', 'Unban')}</>
                    ) : (
                      <><Ban className="h-4 w-4 mr-1" /> {t('admin.ban', 'Ban')}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
