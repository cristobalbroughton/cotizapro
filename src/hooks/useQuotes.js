import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { calcQuoteTotals } from '../utils/calculations'

const FREE_LIMIT = 5

export function useQuotes() {
  const { user, isFree } = useAuth()
  const [quotes, setQuotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchQuotes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setQuotes(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  async function createQuote(quoteData) {
    // Verificar límite plan free
    if (isFree && quotes.length >= FREE_LIMIT) {
      return { error: { message: `El plan gratuito permite máximo ${FREE_LIMIT} cotizaciones.` } }
    }

    // Obtener número correlativo
    const { data: numData, error: numError } = await supabase
      .rpc('get_next_quote_number', { p_user_id: user.id })

    if (numError) return { error: numError }

    const totals = calcQuoteTotals(quoteData.items)

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        ...quoteData,
        user_id:      user.id,
        quote_number: numData,
        ...totals,
      })
      .select()
      .single()

    if (!error) setQuotes(prev => [data, ...prev])
    return { data, error }
  }

  async function updateQuote(id, quoteData) {
    const totals = calcQuoteTotals(quoteData.items || [])

    const { data, error } = await supabase
      .from('quotes')
      .update({ ...quoteData, ...totals })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error) setQuotes(prev => prev.map(q => q.id === id ? data : q))
    return { data, error }
  }

  async function deleteQuote(id) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (!error) setQuotes(prev => prev.filter(q => q.id !== id))
    return { error }
  }

  async function updateStatus(id, status) {
    return updateQuote(id, { status })
  }

  async function getQuote(id) {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    return { data, error }
  }

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    updateStatus,
    getQuote,
    canCreate: !isFree || quotes.length < FREE_LIMIT,
    quotesCount: quotes.length,
  }
}
