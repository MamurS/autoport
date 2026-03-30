import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { DepositTransaction, TransactionType } from '../types/index'

export function useDeposit() {
  const { profile, refreshProfile } = useAuth()

  const depositBalance = profile?.deposit_balance ?? 0

  return { depositBalance, refreshDeposit: refreshProfile }
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<DepositTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('deposit_transactions')
      .select('*')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTransactions(data as DepositTransaction[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

export async function adjustDeposit(
  driverId: string,
  amount: number,
  type: TransactionType,
  note: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('admin_adjust_deposit', {
    target_driver_id: driverId,
    adjustment_amount: amount,
    adjustment_type: type,
    adjustment_note: note,
  })

  if (error) {
    return { error: error.message }
  }
  return { error: null }
}
