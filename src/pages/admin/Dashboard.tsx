import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Users, Car, Wallet, Star, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { formatUZS } from '../../lib/utils'

interface Stats {
  totalUsers: number
  activeRides: number
  totalCommissions: number
  totalDepositBalance: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeRides: 0,
    totalCommissions: 0,
    totalDepositBalance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const [usersRes, ridesRes, commissionsRes, depositsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('rides').select('id', { count: 'exact', head: true }).in('status', ['active', 'full']),
        supabase
          .from('deposit_transactions')
          .select('amount')
          .eq('type', 'commission'),
        supabase.from('profiles').select('deposit_balance').gt('deposit_balance', 0),
      ])

      const totalCommissions = (commissionsRes.data || []).reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0
      )

      const totalDepositBalance = (depositsRes.data || []).reduce(
        (sum, p) => sum + p.deposit_balance,
        0
      )

      setStats({
        totalUsers: usersRes.count || 0,
        activeRides: ridesRes.count || 0,
        totalCommissions,
        totalDepositBalance,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: t('admin.totalUsers', 'Total Users'),
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: t('admin.activeRides', 'Active Rides'),
      value: stats.activeRides,
      icon: Car,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: t('admin.totalCommissions', 'Commissions Earned'),
      value: formatUZS(stats.totalCommissions),
      icon: Wallet,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: t('admin.totalDeposits', 'Total Deposit Balance'),
      value: formatUZS(stats.totalDepositBalance),
      icon: Star,
      color: 'text-amber-600 bg-amber-100',
    },
  ]

  const quickLinks = [
    { label: t('admin.manageUsers', 'Manage Users'), to: '/admin/users' },
    { label: t('admin.manageRides', 'Manage Rides'), to: '/admin/rides' },
    { label: t('admin.manageDeposits', 'Manage Deposits'), to: '/admin/deposits' },
    { label: t('admin.manageReviews', 'Manage Reviews'), to: '/admin/reviews' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('admin.dashboard', 'Admin Dashboard')}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {loading ? '...' : card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('admin.quickLinks', 'Quick Links')}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">{link.label}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
