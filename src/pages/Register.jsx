import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FileText, CheckCircle } from 'lucide-react'

// ── Reglas de contraseña ──────────────────────────────────────
const RULES = [
  { key: 'length',    label: 'Mínimo 8 caracteres', test: p => p.length >= 8 },
  { key: 'upper',     label: 'Una mayúscula',        test: p => /[A-Z]/.test(p) },
  { key: 'lower',     label: 'Una minúscula',        test: p => /[a-z]/.test(p) },
  { key: 'number',    label: 'Un número',            test: p => /[0-9]/.test(p) },
]

function getStrength(password) {
  const passed = RULES.filter(r => r.test(password)).length
  if (passed <= 1) return 'weak'
  if (passed <= 3) return 'medium'
  return 'strong'
}

const STRENGTH_CONFIG = {
  weak:   { label: 'Débil',  color: 'bg-red-500',    width: 'w-1/3'  },
  medium: { label: 'Media',  color: 'bg-yellow-400', width: 'w-2/3'  },
  strong: { label: 'Fuerte', color: 'bg-green-500',  width: 'w-full' },
}

// ── Componente principal ──────────────────────────────────────
export default function Register() {
  const { signUp } = useAuth()

  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showStrength, setShowStrength] = useState(false)

  const rules       = RULES.map(r => ({ ...r, passed: r.test(form.password) }))
  const allPassed   = rules.every(r => r.passed)
  const strength    = form.password.length > 0 ? getStrength(form.password) : null
  const strengthCfg = strength ? STRENGTH_CONFIG[strength] : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!allPassed) {
      return setError('Tu contraseña debe cumplir todos los requisitos de seguridad.')
    }
    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden.')
    }

    setLoading(true)
    const { error } = await signUp({
      email:    form.email,
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

            {/* Contraseña + medidor de fortaleza */}
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onFocus={() => setShowStrength(true)}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />

              {showStrength && form.password.length > 0 && (
                <div className="mt-2 space-y-2">
                  {/* Barra de fortaleza */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strengthCfg.color} ${strengthCfg.width}`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      strength === 'weak'   ? 'text-red-500'    :
                      strength === 'medium' ? 'text-yellow-500' : 'text-green-600'
                    }`}>
                      {strengthCfg.label}
                    </span>
                  </div>

                  {/* Lista de requisitos */}
                  <ul className="space-y-1">
                    {rules.map(r => (
                      <li key={r.key} className="flex items-center gap-1.5 text-xs">
                        <span className={r.passed ? 'text-green-500' : 'text-gray-400'}>
                          {r.passed ? '✓' : '✗'}
                        </span>
                        <span className={r.passed ? 'text-green-700' : 'text-gray-400'}>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

            <button
              type="submit"
              disabled={loading || !allPassed}
              className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              🔒 Tus datos están cifrados y protegidos con estándares de la industria.
              Nunca los compartimos con terceros.
            </p>
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
