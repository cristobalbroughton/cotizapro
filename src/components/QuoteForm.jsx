import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Trash2, Save, Eye } from 'lucide-react'
import { formatCLP, formatRUT } from '../utils/formatters'
import { calcItemSubtotal, calcQuoteTotals } from '../utils/calculations'

function IvaToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
          value ? 'bg-primary-700' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-[18px]' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-600">
        {value ? 'Mostrar IVA desglosado' : 'Ocultar desglose de IVA'}
      </span>
    </div>
  )
}

const EMPTY_ITEM = { description: '', quantity: 1, unit_price: 0 }

const DEFAULT_FORM = {
  client_name:    '',
  client_rut:     '',
  client_email:   '',
  client_phone:   '',
  client_address: '',
  items:          [{ ...EMPTY_ITEM }],
  notes:          '',
  validity_days:  30,
  status:         'borrador',
}

/**
 * onSubmit(formData, mode) — mode: 'save' | 'preview'
 */
export default function QuoteForm({ initialData, onSubmit, loading, defaultShowIva = true }) {
  const navigate  = useNavigate()
  const submitMode = useRef('save')

  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(initialData || {}),
    items:    initialData?.items?.length ? initialData.items : [{ ...EMPTY_ITEM }],
    show_iva: initialData?.show_iva ?? defaultShowIva,
  }))

  const totals = calcQuoteTotals(form.items)

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  function updateItem(idx, field, value) {
    setForm(f => {
      const items = f.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
      return { ...f, items }
    })
  }

  function handleRUT(value) {
    // Permitir tipeo libre, formatear sólo si hay suficientes chars
    const clean = value.replace(/[^0-9kK]/g, '')
    if (clean.length <= 1) {
      setField('client_rut', value)
    } else {
      setField('client_rut', formatRUT(clean))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit(form, submitMode.current)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Datos del cliente ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Datos del cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="label">Nombre / Razón Social *</label>
            <input
              required
              className="input-field"
              placeholder="Empresa Ejemplo SpA"
              value={form.client_name}
              onChange={e => setField('client_name', e.target.value)}
            />
          </div>

          <div>
            <label className="label">RUT</label>
            <input
              className="input-field"
              placeholder="76.543.210-1"
              value={form.client_rut}
              onChange={e => handleRUT(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input
              className="input-field"
              placeholder="+56 9 1234 5678"
              value={form.client_phone}
              onChange={e => setField('client_phone', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="contacto@empresa.cl"
              value={form.client_email}
              onChange={e => setField('client_email', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Dirección</label>
            <input
              className="input-field"
              placeholder="Av. Providencia 1234, Santiago"
              value={form.client_address}
              onChange={e => setField('client_address', e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* ── Ítems / Servicios ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Ítems / Servicios</h3>

        {/* Header columnas */}
        <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">
          <div className="col-span-6">Descripción</div>
          <div className="col-span-2 text-center">Cant.</div>
          <div className="col-span-2 text-right">Precio Unit.</div>
          <div className="col-span-1 text-right">Subtotal</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center group">

              {/* Descripción */}
              <div className="col-span-12 sm:col-span-6">
                <input
                  required
                  className="input-field"
                  placeholder="Descripción del servicio o producto"
                  value={item.description}
                  onChange={e => updateItem(idx, 'description', e.target.value)}
                />
              </div>

              {/* Cantidad */}
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  className="input-field text-center"
                  value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)}
                />
              </div>

              {/* Precio unitario */}
              <div className="col-span-4 sm:col-span-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="input-field text-right"
                  placeholder="0"
                  value={item.unit_price}
                  onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                />
              </div>

              {/* Subtotal calculado */}
              <div className="col-span-3 sm:col-span-1 text-right text-sm font-semibold text-gray-700 tabular-nums">
                {formatCLP(calcItemSubtotal(item.quantity, item.unit_price))}
              </div>

              {/* Eliminar fila */}
              <div className="col-span-1 flex justify-center">
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar ítem"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium"
        >
          <PlusCircle size={16} /> Agregar ítem
        </button>

        {/* Totales en tiempo real */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-end gap-1.5">
            {form.show_iva && (
              <>
                <TotalRow label="Subtotal (neto)" value={totals.subtotal} />
                <TotalRow label="IVA (19%)"       value={totals.iva_amount} />
              </>
            )}
            <div className={`flex items-center gap-16 w-full justify-end ${form.show_iva ? 'pt-2 mt-1 border-t border-gray-300' : ''}`}>
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-base font-bold text-primary-800 tabular-nums w-32 text-right">
                {formatCLP(totals.total)}
              </span>
            </div>
          </div>

          {/* Toggle IVA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <IvaToggle value={form.show_iva} onChange={v => setField('show_iva', v)} />
          </div>
        </div>
      </div>

      {/* ── Condiciones y notas ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Condiciones y notas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="label">Notas / Condiciones comerciales</label>
            <textarea
              rows={4}
              className="input-field resize-y"
              placeholder="Tiempo de entrega, forma de pago, garantías, vigencia de precios…"
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Validez (días)</label>
            <input
              type="number"
              min="1"
              max="365"
              className="input-field"
              value={form.validity_days}
              onChange={e => setField('validity_days', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Estado</label>
            <select
              className="input-field"
              value={form.status}
              onChange={e => setField('status', e.target.value)}
            >
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          onClick={() => { submitMode.current = 'save' }}
          className="btn-secondary flex items-center gap-2"
        >
          <Save size={16} />
          {loading && submitMode.current === 'save' ? 'Guardando…' : 'Guardar borrador'}
        </button>

        <button
          type="submit"
          disabled={loading}
          onClick={() => { submitMode.current = 'preview' }}
          className="btn-primary flex items-center gap-2"
        >
          <Eye size={16} />
          {loading && submitMode.current === 'preview' ? 'Guardando…' : 'Guardar y previsualizar'}
        </button>
      </div>

    </form>
  )
}

function TotalRow({ label, value }) {
  return (
    <div className="flex items-center gap-16">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 tabular-nums w-32 text-right">
        {formatCLP(value)}
      </span>
    </div>
  )
}
