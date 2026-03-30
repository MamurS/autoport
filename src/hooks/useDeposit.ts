import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { demoTransactions } from '../lib/demoData'
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
  const [error] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setTimeout(() => {
      setTransactions(demoTransactions)
      setLoading(false)
    }, 200)
  }, [user])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

export async function adjustDeposit(
  _driverId: string,
  _amount: number,
  _type: TransactionType,
  _note: string
): Promise<{ error: string | null }> {
  return { error: null }
}
