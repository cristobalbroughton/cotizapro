import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import UpgradeModal from '../components/UpgradeModal'
import { formatCLP, formatQuoteNumber, formatDate } from '../utils/formatters'
import { FilePlus, Search, Pencil, Eye, Trash2, FileText } from 'lucide-react'

const statusBadge = {
  borrador:  'badge-borrador',
  enviada:   'badge-enviada',
  aceptada:  'badge-aceptada',
  rechazada: 'badge-rechazada',
}
const statusLabel = {
  borrador: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada',
}

export default function QuoteList() {
  const { quotes, loading, deleteQuote, canCreate } = useQuotes()
  const navigate = useNavigate()

  const [search, setSearch]           = useState('')
  const [filterStatus, setFilter]     = useState('todos')
  const [deleting, setDeleting]       = useState(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const filtered = quotes.filter(q => {
    const matchSearch = !search ||
      q.client_name.toLowerCase().includes(search.toLowerCase()) ||
      String(q.quote_number).includes(search)
    const matchStatus = filterStatus === 'todos' || q.status === filterStatus
    return matchSearch && matchStatus
  })

  function handleNew() {
    if (!canCreate) {
      setShowUpgrade(true)
    } else {
      navigate('/quotes/new')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    await deleteQuote(id)
    setDeleting(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Cotizaciones</h2>
        <button onClick={handleNew} className="btn-primary flex items-center gap-2">
          <FilePlus size={16} /> Nueva cotización
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o número..."
            className="input-field pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="enviada">Enviada</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {quotes.length === 0
                ? 'Aún no tienes cotizaciones.'
                : 'No se encontraron resultados para tu búsqueda.'}
            </p>
            {quotes.length === 0 && (
              <button
                onClick={handleNew}
                className="btn-primary inline-flex items-center gap-2 mt-4"
              >
                <FilePlus size={16} /> Crear primera cotización
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(q => (
                <tr
                  key={q.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/quotes/${q.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs whitespace-nowrap">
                    {formatQuoteNumber(q.quote_number)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{q.client_name}</div>
                    {q.client_email && (
                      <div className="text-xs text-gray-400">{q.client_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(q.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                    {formatCLP(q.total)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={statusBadge[q.status]}>{statusLabel[q.status]}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <ActionBtn
                        title="Ver cotización"
                        icon={<Eye size={15} />}
                        hoverClass="hover:text-primary-700 hover:bg-primary-50"
                        onClick={() => navigate(`/quotes/${q.id}`)}
                      />
                      <ActionBtn
                        title="Editar"
                        icon={<Pencil size={15} />}
                        hoverClass="hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => navigate(`/quotes/${q.id}/edit`)}
                      />
                      <ActionBtn
                        title="Eliminar"
                        icon={<Trash2 size={15} />}
                        hoverClass="hover:text-red-600 hover:bg-red-50"
                        disabled={deleting === q.id}
                        onClick={() => handleDelete(q.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} cotización{filtered.length !== 1 ? 'es' : ''}
        {!canCreate && (
          <span className="ml-3 text-amber-600 font-medium">
            · Límite del plan gratuito alcanzado
          </span>
        )}
      </p>
    </div>
  )
}

function ActionBtn({ icon, title, hoverClass, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded text-gray-400 transition-colors disabled:opacity-40 ${hoverClass}`}
    >
      {icon}
    </button>
  )
}
