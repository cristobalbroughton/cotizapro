import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FilePlus, FileText, Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quotes/new',  icon: FilePlus,        label: 'Nueva Cotización' },
  { to: '/quotes',      icon: FileText,        label: 'Mis Cotizaciones' },
  { to: '/settings',    icon: Settings,        label: 'Configuración' },
]

export default function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar()

  return (
    <>
      {/* Backdrop móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          bg-white border-r border-gray-200 flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          fixed top-16 bottom-0 left-0 z-50
          md:relative md:top-auto md:bottom-auto md:left-auto md:z-auto
          md:translate-x-0
          w-60
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-[60px]' : 'md:w-60'}
        `}
      >
        {/* Botón toggle — solo desktop, arriba del todo */}
        <div className={`hidden md:flex border-b border-gray-100 p-2 ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav — sin overflow-hidden para que los tooltips no se recorten */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={closeMobile}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />

              {/* Texto — overflow en el span, no en el nav */}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  collapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'
                }`}
              >
                {label}
              </span>

              {/* Tooltip derecho — solo desktop colapsado */}
              {collapsed && (
                <span className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-800 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
