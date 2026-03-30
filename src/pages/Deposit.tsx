import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../hooks/useDeposit'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { formatUZS, formatDateTime } from '../lib/utils'
import { Wallet, Info } from 'lucide-react'

const typeVariant = {
  top_up: 'success' as const,
  commission: 'danger' as const,
  refund: 'info' as const,
  adjustment: 'warning' as const,
}

export default function Deposit() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const { transactions, loading } = useTransactions()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('deposit.title')}</h1>

      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
        <CardContent className="py-8">
          <div className="text-center text-white">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm opacity-80 mb-1">{t('deposit.balance')}</p>
            <p className="text-4xl font-bold">
              {formatUZS(profile?.deposit_balance ?? 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{t('deposit.topUpDescription')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">{t('deposit.transactions')}</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet size={48} />}
              title={t('deposit.noTransactions')}
            />
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={typeVariant[tx.type]}>
                        {t(`deposit.type.${tx.type}`)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(tx.created_at, i18n.language)}
                    </p>
                    {tx.note && (
                      <p className="text-xs text-gray-500 mt-0.5">{tx.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatUZS(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatUZS(tx.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
