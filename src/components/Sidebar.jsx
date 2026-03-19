import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FilePlus, FileText, Settings } from 'lucide-react'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quotes/new',  icon: FilePlus,        label: 'Nueva Cotización' },
  { to: '/quotes',      icon: FileText,        label: 'Mis Cotizaciones' },
  { to: '/settings',    icon: Settings,        label: 'Configuración' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <nav className="flex-1 py-4 px-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
