import { useAuth } from '../hooks/useAuth'
import { FileText, LogOut, User, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { toggleMobile } = useSidebar()

  return (
    <header className="bg-primary-800 text-white h-16 flex items-center px-4 md:px-6 justify-between shadow-md flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburguesa — solo móvil */}
        <button
          onClick={toggleMobile}
          className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
          <FileText size={22} />
          <span>CotizaPro</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {profile?.plan === 'free' && (
          <span className="hidden sm:inline-block text-xs bg-white/20 rounded-full px-3 py-1">
            Plan Gratis
          </span>
        )}

        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-white/70" />
          <span className="text-white/90 hidden sm:inline">
            {profile?.full_name || user?.email}
          </span>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
