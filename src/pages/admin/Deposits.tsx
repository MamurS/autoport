import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import type { Profile, DepositTransaction, TransactionType } from '../../types'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { formatUZS, formatDateTime } from '../../lib/utils'

export default function AdminDeposits() {
  const { t } = useTranslation()
  const [drivers, setDrivers] = useState<Profile[]>([])
  const [transactions, setTransactions] = useState<DepositTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Profile | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustType, setAdjustType] = useState<string>('top_up')
  const [adjustNote, setAdjustNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [driversRes, txRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('deposit_balance', { ascending: false }),
      supabase
        .from('deposit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (driversRes.error) {
      toast.error(t('admin.fetchError', 'Failed to load drivers'))
    } else {
      setDrivers(driversRes.data || [])
    }

    if (!txRes.error) {
      setTransactions(txRes.data || [])
    }
    setLoading(false)
  }

  function openAdjustModal(driver: Profile) {
    setSelectedDriver(driver)
    setAdjustAmount('')
    setAdjustType('top_up')
    setAdjustNote('')
    setModalOpen(true)
  }

  async function handleAdjust() {
    if (!selectedDriver || !adjustAmount) return

    const amount = parseFloat(adjustAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('admin.invalidAmount', 'Enter a valid positive amount'))
      return
    }

    setSubmitting(true)
    const { error } = await supabase.rpc('admin_adjust_deposit', {
      target_driver_id: selectedDriver.id,
      adjustment_amount: amount,
      adjustment_type: adjustType,
      adjustment_note: adjustNote || null,
    })

    if (error) {
      toast.error(error.message || t('admin.adjustError', 'Failed to adjust deposit'))
    } else {
      toast.success(t('admin.adjustSuccess', 'Deposit adjusted successfully'))
      setModalOpen(false)
      fetchData()
    }
    setSubmitting(false)
  }

  const typeVariant = (type: TransactionType) => {
    switch (type) {
      case 'top_up': return 'success'
      case 'commission': return 'warning'
      case 'refund': return 'info'
      case 'adjustment': return 'default'
      default: return 'default'
    }
  }

  const adjustTypeOptions = [
    { value: 'top_up', label: t('transaction.topUp', 'Top Up') },
    { value: 'refund', label: t('transaction.refund', 'Refund') },
    { value: 'adjustment', label: t('transaction.adjustment', 'Adjustment') },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {t('admin.deposits', 'Deposits')}
      </h1>

      {loading ? (
        <p className="text-gray-500 text-center py-8">{t('common.loading', 'Loading...')}</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('admin.driverBalances', 'Driver Balances')}
              </h2>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {drivers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('admin.noDrivers', 'No drivers found')}</p>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{driver.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {t('admin.balance', 'Balance')}: {formatUZS(driver.deposit_balance)}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => openAdjustModal(driver)}>
                      <Wallet className="h-4 w-4 mr-1" />
                      {t('admin.adjust', 'Adjust')}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('admin.transactionLog', 'Transaction Log')}
              </h2>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('admin.noTransactions', 'No transactions')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-2 pr-4">{t('admin.date', 'Date')}</th>
                        <th className="pb-2 pr-4">{t('admin.type', 'Type')}</th>
                        <th className="pb-2 pr-4">{t('admin.amount', 'Amount')}</th>
                        <th className="pb-2 pr-4">{t('admin.balanceAfter', 'Balance After')}</th>
                        <th className="pb-2">{t('admin.note', 'Note')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {formatDateTime(tx.created_at)}
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant={typeVariant(tx.type)}>{tx.type}</Badge>
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {formatUZS(tx.amount)}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap">
                            {formatUZS(tx.balance_after)}
                          </td>
                          <td className="py-2 text-gray-500">{tx.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('admin.adjustDeposit', 'Adjust Deposit')}
      >
        {selectedDriver && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('admin.adjustingFor', 'Adjusting deposit for')}{' '}
              <span className="font-semibold">{selectedDriver.full_name}</span>
              {' '}&middot;{' '}
              {t('admin.currentBalance', 'Current balance')}: {formatUZS(selectedDriver.deposit_balance)}
            </p>

            <Input
              label={t('admin.amount', 'Amount')}
              type="number"
              min="1"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="10000"
            />

            <Select
              label={t('admin.type', 'Type')}
              options={adjustTypeOptions}
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
            />

            <Input
              label={t('admin.note', 'Note')}
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder={t('admin.optionalNote', 'Optional note...')}
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleAdjust} loading={submitting}>
                {t('admin.submit', 'Submit')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
