import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../hooks/useAuth'

const ALL_ITEMS = [
  {
    id: 'inicio',
    label: 'Inicio',
    permiso: 'ver_mapa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'mapa',
    label: 'Mapa',
    permiso: 'ver_mapa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'avistamientos',
    label: 'Avistamientos',
    permiso: 'ver_avistamientos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
      </svg>
    ),
  },
  {
    id: 'rutas',
    label: 'Rutas',
    permiso: 'ver_rutas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="6" cy="19" r="2.4" />
        <circle cx="18" cy="5" r="2.4" />
        <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
      </svg>
    ),
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    permiso: 'gestionar_usuarios',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'roles',
    label: 'Roles',
    permiso: 'gestionar_roles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'historial',
    label: 'Historial',
    permiso: 'ver_historial_usuarios',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </svg>
    ),
  },
]

export default function BottomNav({ current, onChange }) {
  const { user } = useAuth()
  const { tiene, loading } = usePermissions(user)

  if (loading) {
    return (
      <nav className="mobile-bottom-nav" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <span className="nav-sliding-pill" />
      </nav>
    )
  }

  // Si no hay usuario, mostrar solo inicio/mapa/rutas (turista)
  const items = ALL_ITEMS.filter((it) => {
    if (!user) {
      return it.id === 'inicio' || it.id === 'mapa'
    }
    return tiene(it.permiso)
  })

  const activeIndex = items.findIndex((i) => i.id === current)
  const total = items.length || 1

  return (
    <nav
      className="mobile-bottom-nav"
      style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
    >
      <span
        className="nav-sliding-pill"
        style={{
          width: `calc((100% - 8px) / ${total})`,
          transform: `translateX(calc(${Math.max(activeIndex, 0)} * 100%))`,
        }}
      />

      {items.map((it) => (
        <button
          key={it.id}
          className={`mobile-nav-item ${current === it.id ? 'active' : ''}`}
          onClick={() => onChange(it.id)}
          aria-label={it.label}
        >
          <span className="nav-icon-wrap">{it.icon}</span>
          <span className="nav-label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}