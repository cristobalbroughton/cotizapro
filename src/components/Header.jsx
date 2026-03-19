import { useAuth } from '../hooks/useAuth'
import { FileText, LogOut, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="bg-primary-800 text-white h-16 flex items-center px-6 justify-between shadow-md flex-shrink-0">
      <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
        <FileText size={22} />
        <span>CotizaPro</span>
      </Link>

      <div className="flex items-center gap-4">
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
