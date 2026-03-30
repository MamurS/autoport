import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { demoTransactions } from '../../lib/demoData'
import type { Profile, DepositTransaction, TransactionType } from '../../types'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { formatUZS, formatDateTime } from '../../lib/utils'

const demoDrivers: Profile[] = [
  { id: '1', role: 'driver', full_name: 'Алишер Каримов', phone: '+998901234567', avatar_url: null, car_model: 'Cobalt', car_color: 'White', license_plate: '01A123BC', seats_total: 4, deposit_balance: 500000, avg_rating: 4.5, rating_count: 12, language: 'ru', is_banned: false, created_at: '', updated_at: '' },
  { id: '2', role: 'driver', full_name: 'Бахтиёр Рахимов', phone: '+998907654321', avatar_url: null, car_model: 'Gentra', car_color: 'Grey', license_plate: '40B456DE', seats_total: 3, deposit_balance: 300000, avg_rating: 4.8, rating_count: 25, language: 'ru', is_banned: false, created_at: '', updated_at: '' },
]

export default function AdminDeposits() {
  const { t } = useTranslation()
  const [drivers] = useState(demoDrivers)
  const [transactions] = useState<DepositTransaction[]>(demoTransactions)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Profile | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustType, setAdjustType] = useState('top_up')
  const [adjustNote, setAdjustNote] = useState('')

  function openAdjustModal(driver: Profile) {
    setSelectedDriver(driver)
    setAdjustAmount('')
    setAdjustType('top_up')
    setAdjustNote('')
    setModalOpen(true)
  }

  function handleAdjust() {
    toast.success(t('toast.depositAdjusted'))
    setModalOpen(false)
  }

  const typeVariant = (type: TransactionType) => {
    switch (type) {
      case 'top_up': return 'success' as const
      case 'commission': return 'warning' as const
      case 'refund': return 'info' as const
      default: return 'default' as const
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.deposits')}</h1>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-gray-900">Driver Balances</h2></CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {drivers.map(driver => (
            <div key={driver.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{driver.full_name}</p>
                <p className="text-sm text-gray-500">Balance: {formatUZS(driver.deposit_balance)}</p>
              </div>
              <Button size="sm" onClick={() => openAdjustModal(driver)}>
                <Wallet className="h-4 w-4 mr-1" /> Adjust
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-gray-900">Transaction Log</h2></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Balance After</th>
                  <th className="pb-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(tx.created_at)}</td>
                    <td className="py-2 pr-4"><Badge variant={typeVariant(tx.type)}>{tx.type}</Badge></td>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatUZS(tx.amount)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatUZS(tx.balance_after)}</td>
                    <td className="py-2 text-gray-500">{tx.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('admin.adjustDeposit')}>
        {selectedDriver && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Adjusting deposit for <span className="font-semibold">{selectedDriver.full_name}</span> · Current: {formatUZS(selectedDriver.deposit_balance)}
            </p>
            <Input label={t('admin.amount')} type="number" min="1" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="10000" />
            <Select label="Type" options={[{ value: 'top_up', label: 'Top Up' }, { value: 'refund', label: 'Refund' }, { value: 'adjustment', label: 'Adjustment' }]} value={adjustType} onChange={e => setAdjustType(e.target.value)} />
            <Input label={t('admin.note')} value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Optional note..." />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleAdjust}>Submit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
