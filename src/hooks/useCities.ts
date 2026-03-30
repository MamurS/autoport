import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { City } from '../types/index'

export function useCities() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('cities')
        .select('*')
        .order('name_ru', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCities(data as City[])
      }
      setLoading(false)
    }

    fetchCities()
  }, [])

  return { cities, loading, error }
}
