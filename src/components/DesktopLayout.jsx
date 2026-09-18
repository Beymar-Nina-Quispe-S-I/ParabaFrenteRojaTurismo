import { useState } from 'react'
import DesktopSidebar from './DesktopSidebar'
import DesktopNavbar from './DesktopNavbar'

export default function DesktopLayout({
  children,
  view,
  onNavigate,
  user,
  onOpenModal,
  onOpenProfile,
  onLogout,
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
      />

      <div className="desktop-main">
        <DesktopNavbar
          view={view}
          user={user}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />
        <main className="desktop-content">{children}</main>
      </div>
    </div>
  )
}