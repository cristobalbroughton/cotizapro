import { Link, useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      {/* Número 404 grande */}
      <div className="relative mb-6 select-none">
        <span className="text-[120px] font-black text-gray-100 leading-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary-800 rounded-2xl p-4">
            <FileQuestion className="text-white" size={36} />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Página no encontrada
      </h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        La dirección que buscas no existe o fue movida.
        Revisa el link o vuelve al inicio.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={15} />
          Volver atrás
        </button>
        <Link to="/dashboard" className="btn-primary flex items-center gap-2">
          <Home size={15} />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
