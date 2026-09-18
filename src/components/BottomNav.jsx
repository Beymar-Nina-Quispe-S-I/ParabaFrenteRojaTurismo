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

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="mobile-bottom-nav">
      {/* Fondo pill animado que se desliza */}
      <span
        className="nav-sliding-pill"
        style={{
          transform: `translateX(calc(${items.findIndex((i) => i.id === current)} * 100%))`,
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