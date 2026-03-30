import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { SidebarProvider } from '../context/SidebarContext'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col min-h-full">
              <div className="flex-1">
                <Outlet />
              </div>
              <AppFooter />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function AppFooter() {
  return (
    <footer className="mt-12 pt-4 border-t border-gray-200">
      <div className="flex items-start justify-between flex-wrap gap-4 pb-4">

        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-gray-600">CotizaPro</p>
          <p className="text-xs text-gray-400">Hecho en Chile 🇨🇱</p>
          <p className="text-xs text-gray-400">© 2026</p>
          <Link to="/privacidad" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Política de privacidad
          </Link>
        </div>

        <div className="text-right space-y-1">
          <p className="text-xs text-gray-400">¿Necesitas ayuda?</p>
          <a
            href="mailto:soporte@cotizapro.cl"
            className="flex items-center justify-end gap-1.5 text-xs text-gray-500 hover:text-primary-700 transition-colors"
          >
            <Mail size={11} />
            soporte@cotizapro.cl
          </a>

        </div>

      </div>
    </footer>
  )
}
