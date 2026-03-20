import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { useAuth } from '../hooks/useAuth'
import QuoteForm from '../components/QuoteForm'
import UpgradeModal from '../components/UpgradeModal'
import { ArrowLeft } from 'lucide-react'

export default function NewQuote() {
  const { createQuote, canCreate } = useQuotes()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Mostrar modal si llega a esta página sin poder crear
  if (!canCreate) {
    return <UpgradeModal onClose={() => navigate('/quotes')} />
  }

  async function handleSubmit(formData, mode) {
    setError('')
    setLoading(true)
    const { data, error } = await createQuote(formData)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    // 'preview' → ir a vista; 'save' → volver a la lista
    navigate(mode === 'preview' ? `/quotes/${data.id}` : '/quotes')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/quotes" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Nueva Cotización</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <QuoteForm
        onSubmit={handleSubmit}
        loading={loading}
        defaultShowIva={profile?.show_iva ?? true}
      />
    </div>
  )
}
