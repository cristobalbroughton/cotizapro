import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { calcQuoteTotals } from '../utils/calculations'
import { FREE_LIMIT } from '../utils/constants'

export function useQuotes() {
  const { user, isFree, quotesCreatedCount, incrementQuotesCount } = useAuth()
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
    // Límite basado en el contador histórico, no en las que existen ahora
    if (isFree && quotesCreatedCount >= FREE_LIMIT) {
      return { error: { message: `El plan gratuito permite crear máximo ${FREE_LIMIT} cotizaciones.` } }
    }

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

    if (!error) {
      setQuotes(prev => [data, ...prev])
      // El trigger en BD ya incrementó quotes_created_count.
      // Actualizamos el estado local para que la UI sea inmediata.
      incrementQuotesCount()
    }
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

    // Solo elimina de la lista local. El contador histórico NO se toca.
    if (!error) setQuotes(prev => prev.filter(q => q.id !== id))
    return { error }
  }

  async function updateStatus(id, status) {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error) setQuotes(prev => prev.map(q => q.id === id ? data : q))
    return { data, error }
  }

  async function getQuote(id) {
    if (!user) return { data: null, error: { message: 'Not authenticated' } }
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
    // canCreate usa el historial, no el recuento actual
    canCreate:          !isFree || quotesCreatedCount < FREE_LIMIT,
    quotesCount:        quotes.length,           // cotizaciones actuales (para la lista)
    quotesCreatedCount,                          // histórico (para el límite freemium)
  }
}
