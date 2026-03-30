import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) { setProfile(null); return }

      // Si el plan Pro venció, degradar a free automáticamente
      if (data?.plan === 'pro' && data?.pro_expires_at) {
        const expired = new Date(data.pro_expires_at) < new Date()
        if (expired) {
          const { data: downgraded, error: downgradeErr } = await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', userId)
            .select()
            .single()
          // Si el downgrade falla, aplicamos el cambio solo en estado local
          // para evitar loop de downgrade fallido en cada login
          setProfile(downgradeErr ? { ...data, plan: 'free' } : downgraded)
          return
        }
      }

      setProfile(data)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }

  async function updateProfile(updates) {
    if (!user) return { data: null, error: { message: 'No authenticated user' } }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error) setProfile(data)
    return { data, error }
  }

  // Incrementa el contador local sin llamar a la BD
  // (el trigger en Supabase ya lo actualizó al insertar la cotización)
  function incrementQuotesCount() {
    setProfile(prev =>
      prev ? { ...prev, quotes_created_count: (prev.quotes_created_count || 0) + 1 } : prev
    )
  }

  const proExpiresAt   = profile?.pro_expires_at ? new Date(profile.pro_expires_at) : null
  const proExpiresSoon = proExpiresAt != null && (proExpiresAt - new Date()) < 7 * 24 * 60 * 60 * 1000

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    incrementQuotesCount,
    isPro:             profile?.plan === 'pro',
    isFree:            profile?.plan === 'free' || !profile?.plan,
    quotesCreatedCount: profile?.quotes_created_count || 0,
    proExpiresAt,    // Date | null
    proExpiresSoon,  // boolean: vence en < 7 días
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
