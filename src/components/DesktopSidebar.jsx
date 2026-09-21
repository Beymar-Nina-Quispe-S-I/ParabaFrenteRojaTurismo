const items = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'mapa',
    label: 'Mapa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'avistamientos',
    label: 'Avistamientos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
      </svg>
    ),
  },
  {
    id: 'rutas',
    label: 'Rutas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="6" cy="19" r="2.4" />
        <circle cx="18" cy="5" r="2.4" />
        <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
      </svg>
    ),
  },
]

export default function DesktopSidebar({
  current,
  onChange,
  onOpenModal,
  onOpenProfile,
  user,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <aside className={`desktop-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="ds-brand">
        <div className="ds-brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        {!collapsed && (
          <div className="ds-brand-text">
            <strong>Ecos de Vuelo</strong>
            <span>Paraba Roja · Bolivia</span>
          </div>
        )}
      </div>

      <nav className="ds-nav">
        {items.map((it) => (
          <button
            key={it.id}
            className={`ds-nav-item ${current === it.id ? 'active' : ''}`}
            onClick={() => onChange(it.id)}
            title={collapsed ? it.label : undefined}
          >
            <span className="ds-nav-active-bar" />
            <span className="ds-nav-icon">{it.icon}</span>
            {!collapsed && <span className="ds-nav-label">{it.label}</span>}
          </button>
        ))}

        <div className="ds-nav-divider" />

        <button
          className="ds-nav-item"
          onClick={() => onOpenModal('registrarAvistamiento')}
          title={collapsed ? 'Registrar avistamiento' : undefined}
        >
          <span className="ds-nav-active-bar" />
          <span className="ds-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          {!collapsed && <span className="ds-nav-label">Registrar avist.</span>}
        </button>

        <button
          className="ds-nav-item"
          onClick={() => onOpenModal('favoritos')}
          title={collapsed ? 'Favoritos' : undefined}
        >
          <span className="ds-nav-active-bar" />
          <span className="ds-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </span>
          {!collapsed && <span className="ds-nav-label">Favoritos</span>}
        </button>
      </nav>

      <div className="ds-footer">
        {user ? (
          <button className="ds-user" onClick={onOpenProfile}>
            <div className="ds-user-avatar">
              {(user.nombre || user.usuario || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="ds-user-info">
                <strong>{user.nombre || user.usuario}</strong>
                <span>{user.email}</span>
              </div>
            )}
          </button>
        ) : (
          <button className="ds-user" onClick={onOpenProfile}>
            <div className="ds-user-avatar guest">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="ds-user-info">
                <strong>Invitado</strong>
                <span>Inicia sesión</span>
              </div>
            )}
          </button>
        )}

        <button
          className="ds-collapse"
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
    </aside>
  )
}