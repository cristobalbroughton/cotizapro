import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import QuoteForm from '../components/QuoteForm'
import { ArrowLeft } from 'lucide-react'

export default function EditQuote() {
  const { id } = useParams()
  const { getQuote, updateQuote } = useQuotes()
  const navigate = useNavigate()

  const [quote, setQuote]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    getQuote(id).then(({ data, error }) => {
      if (error || !data) setError('No se encontró la cotización.')
      else setQuote(data)
      setFetching(false)
    })
  }, [id])

  async function handleSubmit(formData, mode) {
    setError('')
    setLoading(true)
    const { error } = await updateQuote(id, formData)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    navigate(mode === 'preview' ? `/quotes/${id}` : '/quotes')
  }

  if (fetching) {
    return <div className="text-center py-20 text-gray-400">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/quotes/${id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Editar Cotización</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {quote && (
        <QuoteForm
          initialData={quote}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  )
}
