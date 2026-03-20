import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col min-h-full">
            <div className="flex-1">
              <Outlet />
            </div>
            <AppFooter />
          </div>
        </main>
      </div>
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="mt-12 pt-4 border-t border-gray-200">
      <div className="flex items-start justify-between flex-wrap gap-4 pb-4">

        {/* Columna izquierda */}
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-gray-600">CotizaPro</p>
          <p className="text-xs text-gray-400">Hecho en Chile 🇨🇱</p>
          <p className="text-xs text-gray-400">© 2026</p>
        </div>

        {/* Columna derecha */}
        <div className="text-right space-y-1">
          <p className="text-xs text-gray-400">¿Necesitas ayuda?</p>
          <a
            href="mailto:soporte@cotizapro.cl"
            className="flex items-center justify-end gap-1.5 text-xs text-gray-500 hover:text-primary-700 transition-colors"
          >
            <Mail size={11} />
            soporte@cotizapro.cl
          </a>
          <a
            href="https://wa.me/56912345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-end gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors"
          >
            <MessageCircle size={11} />
            +56 9 1234 5678
          </a>
        </div>

      </div>
    </footer>
  )
}
