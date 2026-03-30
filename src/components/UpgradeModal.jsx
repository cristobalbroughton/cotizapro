import { useState } from 'react'
import { X, Zap, CheckCircle, Info } from 'lucide-react'

const BENEFITS = [
  'Cotizaciones ilimitadas',
  'Descarga PDF profesional',
  'Logo de tu empresa en cada cotización',
  'Soporte prioritario',
  'Historial completo sin límites',
]

export default function UpgradeModal({ onClose }) {
  const [showComingSoon, setShowComingSoon] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary-800 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
            <Zap className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Límite alcanzado</h2>
          <p className="text-white/75 mt-2 text-sm">
            Has usado tus 5 cotizaciones del plan gratuito.
            <br />Pásate a Pro y crea sin límites.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <ul className="space-y-3 mb-6">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-gray-900">
              $9.990
              <span className="text-base font-normal text-gray-400">/mes</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">CLP · Cancela cuando quieras</p>
          </div>

          <button
            className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
            onClick={() => setShowComingSoon(true)}
          >
            <Zap size={16} /> Actualizar a Pro
          </button>

          {showComingSoon && (
            <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Próximamente disponible. Escríbenos a{' '}
                <a href="mailto:soporte@cotizapro.cl" className="font-semibold underline underline-offset-2">
                  soporte@cotizapro.cl
                </a>{' '}
                para activar tu plan Pro.
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Quizás después
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
