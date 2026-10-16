import { useState } from 'react'
import DesktopSidebar from './DesktopSidebar'
import DesktopNavbar from './DesktopNavbar'

export default function DesktopLayout({
  children,
  view,
  onNavigate,
  user,
  esAdmin,
  onOpenModal,
  onOpenProfile,
  onLogout,
  onToast,
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`desktop-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <DesktopSidebar
        current={view}
        onChange={onNavigate}
        user={user}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onOpenModal={onOpenModal}
        onOpenProfile={onOpenProfile}
        onToast={onToast}
      />

      <div className="desktop-main">
        <DesktopNavbar
          view={view}
          user={user}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
          onToast={onToast}
        />
        <main className="desktop-content">{children}</main>
      </div>
    </div>
  )
}