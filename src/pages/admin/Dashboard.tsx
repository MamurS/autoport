import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Users, Car, Wallet, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { formatUZS } from '../../lib/utils'

export default function AdminDashboard() {
  const { t } = useTranslation()

  const stats = {
    totalUsers: 15,
    activeRides: 6,
    totalCommissions: 27000,
    totalDepositBalance: 950000,
  }

  const statCards = [
    { label: t('admin.totalUsers'), value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: t('admin.activeRides'), value: stats.activeRides, icon: Car, color: 'text-green-600 bg-green-100' },
    { label: t('admin.totalCommissions'), value: formatUZS(stats.totalCommissions), icon: Wallet, color: 'text-purple-600 bg-purple-100' },
    { label: t('admin.totalDeposits'), value: formatUZS(stats.totalDepositBalance), icon: Star, color: 'text-amber-600 bg-amber-100' },
  ]

  const quickLinks = [
    { label: t('admin.users'), to: '/admin/users' },
    { label: t('admin.rides'), to: '/admin/rides' },
    { label: t('admin.deposits'), to: '/admin/deposits' },
    { label: t('admin.reviews'), to: '/admin/reviews' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${card.color}`}><Icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {quickLinks.map(link => (
              <Link key={link.to} to={link.to} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
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
