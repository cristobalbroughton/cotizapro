import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FileText, ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email)
    if (error) {
      setError('No se pudo enviar el correo. Intenta nuevamente.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <MailCheck className="mx-auto text-primary-700 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Correo enviado</h2>
          <p className="text-gray-600 mb-6">
            Enviamos las instrucciones de recuperación a <strong>{email}</strong>.
            Revisa también tu carpeta de spam.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-800 rounded-xl p-3">
            <FileText className="text-white" size={32} />
          </div>
        </div>
        <h1 className="mt-4 text-center text-3xl font-bold text-gray-900">Recuperar contraseña</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu correo y te enviaremos las instrucciones
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="tu@empresa.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
