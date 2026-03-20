import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useQuotes } from '../hooks/useQuotes'
import { formatCLP, formatQuoteNumber, formatDate } from '../utils/formatters'
import { FilePlus, FileText, TrendingUp, Clock, Zap, BadgeCheck } from 'lucide-react'
import UpgradeModal from '../components/UpgradeModal'

const FREE_LIMIT = 5

const statusBadge = {
  borrador:  'badge-borrador',
  enviada:   'badge-enviada',
  aceptada:  'badge-aceptada',
  rechazada: 'badge-rechazada',
}
const statusLabel = {
  borrador: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada',
}

export default function Dashboard() {
  const { profile, isFree } = useAuth()
  const navigate = useNavigate()
  const { quotes, loading, error, fetchQuotes, quotesCount, quotesCreatedCount, canCreate } = useQuotes()
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Para el dashboard mostramos solo las últimas 5 del array ya cargado
  const recent = quotes.slice(0, 5)

  // parseFloat() es necesario: Supabase devuelve NUMERIC como string "14673.00"
  const totalRevenue = quotes
    .filter(q => q.status === 'aceptada')
    .reduce((s, q) => s + (parseFloat(q.total) || 0), 0)

  function handleNew() {
    if (!canCreate) setShowUpgrade(true)
    else navigate('/quotes/new')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* ── Saludo ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido, {profile?.full_name?.split(' ')[0] || 'usuario'} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-CL', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          <FilePlus size={16} />
          Nueva cotización
        </button>
      </div>

      {/* ── Indicador de plan ── */}
      {isFree
        ? <PlanUsageBar used={quotesCreatedCount} limit={FREE_LIMIT} onUpgrade={() => setShowUpgrade(true)} />
        : <ProBadge />
      }

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText size={20} className="text-primary-700" />}
          label="Cotizaciones"
          value={quotesCount}
          sub={isFree ? `Plan gratuito · máx. ${FREE_LIMIT}` : 'Plan Pro · ilimitadas'}
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-green-600" />}
          label="Ingresos aceptados"
          value={formatCLP(totalRevenue)}
          sub="Total acumulado"
        />
        <StatCard
          icon={<Clock size={20} className="text-amber-500" />}
          label="Pendientes"
          value={quotes.filter(q => q.status === 'enviada').length}
          sub="En espera de respuesta"
        />
      </div>

      {/* ── Últimas cotizaciones ── */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Últimas cotizaciones</h3>
          <Link to="/quotes" className="text-sm text-primary-700 hover:text-primary-800">
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-4 border-primary-800 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 mb-3">No se pudieron cargar las cotizaciones.</p>
            <button onClick={fetchQuotes} className="btn-secondary text-sm">
              Reintentar
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aún no tienes cotizaciones.</p>
            <button onClick={handleNew} className="btn-primary inline-flex items-center gap-2 mt-4">
              <FilePlus size={16} /> Crear primera cotización
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(q => (
              <Link
                key={q.id}
                to={`/quotes/${q.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-400">
                    {formatQuoteNumber(q.quote_number)}
                  </span>
                  <span className="font-medium text-gray-800">{q.client_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{formatDate(q.created_at)}</span>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {formatCLP(q.total)}
                  </span>
                  <span className={statusBadge[q.status]}>{statusLabel[q.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────

function PlanUsageBar({ used, limit, onUpgrade }) {
  const pct      = Math.min(100, Math.round((used / limit) * 100))
  const isFull   = used >= limit
  const isAlmost = used === limit - 1

  const barColor = isFull   ? 'bg-red-500'
                 : isAlmost ? 'bg-amber-400'
                 :             'bg-primary-700'

  const borderColor = isFull   ? 'border-red-200'
                    : isAlmost ? 'border-amber-200'
                    :             'border-gray-200'

  const bgColor = isFull   ? 'bg-red-50'
                : isAlmost ? 'bg-amber-50'
                :             'bg-white'

  return (
    <div className={`card border ${borderColor} ${bgColor} px-5 py-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Plan gratuito
          </span>
          <span className="text-sm text-gray-500">
            · {used} de {limit} cotizaciones usadas
          </span>
        </div>

        {isFull ? (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary-800 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Zap size={12} /> Upgradear a Pro
          </button>
        ) : (
          <span className="text-xs font-medium text-gray-400">{pct}%</span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Mensaje contextual */}
      {isFull && (
        <p className="text-xs text-red-600 font-medium mt-2">
          Alcanzaste el límite del plan gratuito. Upgradea para seguir creando cotizaciones.
        </p>
      )}
      {isAlmost && (
        <p className="text-xs text-amber-600 font-medium mt-2">
          Te queda 1 cotización gratis.
        </p>
      )}
    </div>
  )
}

function ProBadge() {
  return (
    <div className="card border border-green-200 bg-green-50 px-5 py-3 flex items-center gap-2">
      <BadgeCheck size={18} className="text-green-600" />
      <span className="text-sm font-semibold text-green-800">Plan Pro</span>
      <span className="text-sm text-green-700">· Cotizaciones ilimitadas activas</span>
    </div>
  )
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gray-100 rounded-lg p-2">{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
