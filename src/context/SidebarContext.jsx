import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved !== null ? saved === 'true' : true
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed)
  }, [collapsed])

  function toggleCollapsed() { setCollapsed(v => !v) }
  function toggleMobile()    { setMobileOpen(v => !v) }
  function closeMobile()     { setMobileOpen(false) }

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, mobileOpen, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
