import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FileText, CheckCircle } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden.')
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.')
    }

    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
    })

    if (error) {
      setError(translateError(error.message))
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Revisa tu correo!</h2>
          <p className="text-gray-600 mb-6">
            Enviamos un link de confirmación a <strong>{form.email}</strong>.
            Haz clic en el link para activar tu cuenta.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Ir al inicio de sesión
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
        <h1 className="mt-4 text-center text-3xl font-bold text-gray-900">CotizaPro</h1>
        <p className="mt-2 text-center text-sm text-gray-600">Crea tu cuenta gratis</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card p-8">
          {/* Plan free badge */}
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-3 text-center">
            <p className="text-sm text-primary-800 font-medium">Plan Gratuito — hasta 5 cotizaciones</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nombre completo</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Juan Pérez"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="tu@empresa.cl"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Confirmar contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-700 hover:text-primary-800 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function translateError(msg) {
  const map = {
    'User already registered': 'Ya existe una cuenta con este correo.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'El formato del correo no es válido.',
  }
  return map[msg] || 'Ocurrió un error al crear la cuenta.'
}
