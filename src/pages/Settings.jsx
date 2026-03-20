import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRUT } from '../utils/formatters'
import { Upload, X, CheckCircle, AlertCircle, Building2, User, Receipt } from 'lucide-react'

export default function Settings() {
  const { user, profile, updateProfile } = useAuth()

  const [form, setForm] = useState({
    full_name:     profile?.full_name     || '',
    company:       profile?.company       || '',
    rut_empresa:   profile?.rut_empresa   || '',
    giro:          profile?.giro          || '',
    address:       profile?.address       || '',
    phone:         profile?.phone         || '',
    contact_email: profile?.contact_email || '',
    show_iva:      profile?.show_iva ?? true,
  })

  const [logoPreview, setLogoPreview] = useState(profile?.logo_url || null)
  const [logoFile, setLogoFile]       = useState(null)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [saved, setSaved]             = useState(false)
  const fileInputRef                  = useRef(null)

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleRUT(value) {
    const clean = value.replace(/[^0-9kK]/g, '')
    setField('rut_empresa', clean.length <= 1 ? value : formatRUT(clean))
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('El logo no puede superar 2 MB.')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setError('')
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadLogo() {
    if (!logoFile) return profile?.logo_url || null

    const ext  = logoFile.name.split('.').pop().toLowerCase()
    const path = `${user.id}/logo.${ext}`

    const { error: upErr } = await supabase.storage
      .from('logos')
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type })

    if (upErr) throw new Error('Error al subir el logo: ' + upErr.message)

    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    // Forzar cache-bust para que el PDF tome la imagen nueva
    return data.publicUrl + '?t=' + Date.now()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const logo_url = await uploadLogo()
      await updateProfile({ ...form, logo_url })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const profileComplete = !!(profile?.company && profile?.rut_empresa)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-500 text-sm mt-1">
          Estos datos aparecerán en tus cotizaciones y PDFs.
        </p>
      </div>

      {/* Banner si el perfil está incompleto */}
      {!profileComplete && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Perfil incompleto.</span> Completa al menos el
            nombre del negocio y el RUT para poder generar PDFs de cotizaciones.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Sección: Responsable ── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-primary-700" />
            <h3 className="font-semibold text-gray-800">Datos personales</h3>
          </div>
          <div>
            <label className="label">Tu nombre completo</label>
            <input
              className="input-field"
              placeholder="Juan Pérez González"
              value={form.full_name}
              onChange={e => setField('full_name', e.target.value)}
            />
          </div>
        </div>

        {/* ── Sección: Empresa ── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-primary-700" />
            <h3 className="font-semibold text-gray-800">Datos del negocio</h3>
          </div>

          <div className="space-y-4">
            {/* Logo */}
            <div>
              <label className="label">Logo del negocio</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                    <Upload size={20} />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-sm"
                  >
                    {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WebP · máx. 2 MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Nombre del negocio / Razón social *</label>
                <input
                  required
                  className="input-field"
                  placeholder="Mi Empresa SpA"
                  value={form.company}
                  onChange={e => setField('company', e.target.value)}
                />
              </div>

              <div>
                <label className="label">RUT del negocio *</label>
                <input
                  required
                  className="input-field"
                  placeholder="76.543.210-1"
                  value={form.rut_empresa}
                  onChange={e => handleRUT(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Giro / Actividad</label>
                <input
                  className="input-field"
                  placeholder="Servicios de consultoría"
                  value={form.giro}
                  onChange={e => setField('giro', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Dirección</label>
                <input
                  className="input-field"
                  placeholder="Av. Providencia 1234, Santiago"
                  value={form.address}
                  onChange={e => setField('address', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Teléfono</label>
                <input
                  className="input-field"
                  placeholder="+56 2 2345 6789"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Email de contacto</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="contacto@empresa.cl"
                  value={form.contact_email}
                  onChange={e => setField('contact_email', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sección: Opciones de cotización ── */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={16} className="text-primary-700" />
            <h3 className="font-semibold text-gray-800">Opciones de cotización</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Mostrar IVA desglosado</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {form.show_iva
                  ? 'Las cotizaciones muestran Subtotal neto + IVA 19% + Total'
                  : 'Las cotizaciones muestran solo el Total (sin desglose de IVA)'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.show_iva}
              onClick={() => setField('show_iva', !form.show_iva)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                form.show_iva ? 'bg-primary-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.show_iva ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Errores y acciones */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle size={15} /> ¡Guardado correctamente!
            </span>
          )}
        </div>

      </form>
    </div>
  )
}
