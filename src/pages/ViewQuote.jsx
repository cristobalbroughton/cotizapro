import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useQuotes } from '../hooks/useQuotes'
import { useAuth } from '../hooks/useAuth'
import { formatCLP, formatQuoteNumber, formatDate } from '../utils/formatters'
import { calcQuoteTotals, calcExpiryDate as getExpiry } from '../utils/calculations'
import QuotePDF from '../components/QuotePDF'
import {
  ArrowLeft, Pencil, Trash2, CheckCircle,
  XCircle, Send, Download, AlertCircle, Settings, FileText,
} from 'lucide-react'

const statusBadge = {
  borrador:  'badge-borrador',
  enviada:   'badge-enviada',
  aceptada:  'badge-aceptada',
  rechazada: 'badge-rechazada',
}
const statusLabel = {
  borrador: 'Borrador', enviada: 'Enviada', aceptada: 'Aceptada', rechazada: 'Rechazada',
}

function sanitizeName(str) {
  return (str || '')
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30)
}

export default function ViewQuote() {
  const { id } = useParams()
  const { getQuote, deleteQuote, updateStatus } = useQuotes()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [quote, setQuote]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [fetchError, setFetchError] = useState(false)

  async function loadQuote() {
    setLoading(true)
    setNotFound(false)
    setFetchError(false)
    const { data, error } = await getQuote(id)
    if (data) {
      setQuote(data)
    } else if (error?.code === 'PGRST116' || !data) {
      // PGRST116 = 0 rows → no existe o RLS bloqueó el acceso
      setNotFound(true)
    } else {
      // Error de red u otro error de servidor
      setFetchError(true)
    }
    setLoading(false)
  }

  useEffect(() => { loadQuote() }, [id])

  async function handleDelete() {
    if (!window.confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return
    await deleteQuote(id)
    navigate('/quotes')
  }

  async function handleStatus(status) {
    const { data } = await updateStatus(id, status)
    if (data) setQuote(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-5">
          <FileText size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Cotización no encontrada
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Este documento no existe o no tienes acceso a él.
        </p>
        <Link to="/quotes" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver a mis cotizaciones
        </Link>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-5">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Error al cargar la cotización
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          No se pudo conectar con el servidor. Revisa tu conexión a internet.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={loadQuote} className="btn-primary">
            Reintentar
          </button>
          <Link to="/quotes" className="btn-secondary">
            Volver
          </Link>
        </div>
      </div>
    )
  }

  const totals = calcQuoteTotals(quote.items || [])
  const expiry = getExpiry(quote.validity_days)

  const profileComplete = !!(profile?.company && profile?.rut_empresa)
  const pdfFileName = `Cotizacion_${formatQuoteNumber(quote.quote_number)}_${sanitizeName(quote.client_name)}.pdf`

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/quotes" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {formatQuoteNumber(quote.quote_number)}
            </h2>
            <p className="text-sm text-gray-500">Creada el {formatDate(quote.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={statusBadge[quote.status]}>{statusLabel[quote.status]}</span>

          {/* ── Botón Descargar PDF ── */}
          {profileComplete ? (
            <PDFDownloadLink
              document={<QuotePDF quote={quote} profile={profile} />}
              fileName={pdfFileName}
            >
              {({ loading: pdfLoading }) => (
                <button
                  className="btn-primary flex items-center gap-1.5 text-sm"
                  disabled={pdfLoading}
                  title="Descargar PDF"
                >
                  <Download size={14} />
                  {pdfLoading ? 'Generando...' : 'Descargar PDF'}
                </button>
              )}
            </PDFDownloadLink>
          ) : (
            <Link
              to="/settings"
              className="btn-primary flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-600 border-amber-500"
              title="Completa tu perfil para descargar PDF"
            >
              <Settings size={14} />
              Completar perfil
            </Link>
          )}

          <Link
            to={`/quotes/${id}/edit`}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <Pencil size={14} /> Editar
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center gap-1.5 text-sm"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      {/* ── Aviso si falta perfil ── */}
      {!profileComplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={17} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Para descargar el PDF necesitas completar el{' '}
            <Link to="/settings" className="font-semibold underline underline-offset-2">
              nombre del negocio y RUT
            </Link>{' '}
            en Configuración.
          </p>
        </div>
      )}

      {/* ── Cambio de estado rápido ── */}
      <div className="card px-5 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Cambiar estado:</span>

        {quote.status !== 'enviada' && (
          <StatusBtn
            onClick={() => handleStatus('enviada')}
            icon={<Send size={13} />}
            label="Marcar enviada"
            colors="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          />
        )}
        {quote.status !== 'aceptada' && (
          <StatusBtn
            onClick={() => handleStatus('aceptada')}
            icon={<CheckCircle size={13} />}
            label="Marcar aceptada"
            colors="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          />
        )}
        {quote.status !== 'rechazada' && (
          <StatusBtn
            onClick={() => handleStatus('rechazada')}
            icon={<XCircle size={13} />}
            label="Marcar rechazada"
            colors="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          />
        )}
        {quote.status !== 'borrador' && (
          <StatusBtn
            onClick={() => handleStatus('borrador')}
            icon={<Pencil size={13} />}
            label="Volver a borrador"
            colors="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          />
        )}
      </div>

      {/* ── VISTA PREVIA DEL DOCUMENTO ── */}
      <div className="card p-8" id="quote-preview">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">COTIZACIÓN</h1>
            <p className="text-gray-400 text-sm mt-1 font-mono">
              {formatQuoteNumber(quote.quote_number)}
            </p>
          </div>

          <div className="flex items-start gap-5">
            <div className="text-right">
              {profile?.company && (
                <p className="font-bold text-gray-800">{profile.company}</p>
              )}
              {profile?.rut_empresa && (
                <p className="text-sm text-gray-500">RUT: {profile.rut_empresa}</p>
              )}
              {profile?.giro && (
                <p className="text-sm text-gray-500">{profile.giro}</p>
              )}
              {profile?.address && (
                <p className="text-sm text-gray-500">{profile.address}</p>
              )}
              {profile?.phone && (
                <p className="text-sm text-gray-500">{profile.phone}</p>
              )}
              {profile?.contact_email && (
                <p className="text-sm text-gray-500">{profile.contact_email}</p>
              )}
            </div>
            {profile?.logo_url && (
              <img
                src={profile.logo_url}
                alt="Logo"
                className="w-16 h-16 object-contain border border-gray-100 rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t-2 border-primary-800 mb-8" />

        {/* Info cliente y fechas */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Cliente
            </p>
            <p className="font-semibold text-gray-800 text-base">{quote.client_name}</p>
            {quote.client_rut     && <p className="text-sm text-gray-500 mt-1">RUT: {quote.client_rut}</p>}
            {quote.client_email   && <p className="text-sm text-gray-500">{quote.client_email}</p>}
            {quote.client_phone   && <p className="text-sm text-gray-500">{quote.client_phone}</p>}
            {quote.client_address && <p className="text-sm text-gray-500">{quote.client_address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Fechas
            </p>
            <DateRow label="Emisión" value={formatDate(quote.created_at)} />
            <DateRow label="Validez" value={`${quote.validity_days} días`} />
            <DateRow label="Vence" value={formatDate(expiry)} />
          </div>
        </div>

        {/* Tabla de ítems */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-primary-800 text-white">
              <th className="text-left px-3 py-2.5 rounded-tl font-medium">Descripción</th>
              <th className="text-center px-3 py-2.5 font-medium w-20">Cant.</th>
              <th className="text-right px-3 py-2.5 font-medium w-32">Precio Unit.</th>
              <th className="text-right px-3 py-2.5 rounded-tr font-medium w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(quote.items || []).map((item, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2.5 text-gray-800 border-b border-gray-100">
                  {item.description}
                </td>
                <td className="px-3 py-2.5 text-center text-gray-600 border-b border-gray-100">
                  {item.quantity}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-600 border-b border-gray-100 tabular-nums">
                  {formatCLP(item.unit_price)}
                </td>
                <td className="px-3 py-2.5 text-right font-medium border-b border-gray-100 tabular-nums">
                  {formatCLP(item.quantity * item.unit_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Subtotal neto</span>
              <span className="tabular-nums">{formatCLP(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">IVA (19%)</span>
              <span className="tabular-nums">{formatCLP(totals.iva_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base bg-primary-800 text-white px-3 py-2.5 mt-2 rounded">
              <span>TOTAL</span>
              <span className="tabular-nums">{formatCLP(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {quote.notes && (
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Notas y condiciones
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {quote.notes}
            </p>
          </div>
        )}

        {/* Footer del documento */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            Cotización válida por {quote.validity_days} días desde la fecha de emisión.
          </p>
          <p className="text-xs text-gray-400">Generado con CotizaPro</p>
        </div>
      </div>
    </div>
  )
}

function StatusBtn({ icon, label, colors, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-sm border rounded-lg px-3 py-1.5 transition-colors ${colors}`}
    >
      {icon} {label}
    </button>
  )
}

function DateRow({ label, value }) {
  return (
    <div className="flex justify-end gap-4 text-sm mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700 w-24 text-right">{value}</span>
    </div>
  )
}
