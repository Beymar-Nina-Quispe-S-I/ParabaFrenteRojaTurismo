export default function NotificacionesModal({
  open,
  onClose,
  notificaciones,
  filtro,
  setFiltro,
  total,
  noLeidas,
  leidas,
  loading,
  onMarcarLeida,
  onMarcarTodas,
}) {
  if (!open) return null

  const filtros = [
    { key: 'todas', label: 'Todas', count: total },
    { key: 'no-leidas', label: 'No leídas', count: noLeidas },
    { key: 'leidas', label: 'Leídas', count: leidas },
  ]

  function truncar(texto, max = 90) {
    if (!texto) return ''
    return texto.length > max ? `${texto.slice(0, max)}…` : texto
  }

  return (
    <div
      className="notif-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="notif-modal">
        <div className="notif-header">
          <div className="notif-header-left">
            <h3>Notificaciones</h3>
            {noLeidas > 0 && (
              <span className="notif-header-badge">{noLeidas}</span>
            )}
          </div>
          <div className="notif-header-actions">
            {noLeidas > 0 && (
              <button className="notif-btn-mark" onClick={onMarcarTodas}>
                Marcar todas
              </button>
            )}
            <button
              className="notif-close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="notif-filtros">
          {filtros.map((f) => (
            <button
              key={f.key}
              className={`notif-filtro ${filtro === f.key ? 'active' : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
              <span className="notif-filtro-count">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="notif-body">
          {loading ? (
            <div className="notif-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-item" style={{ margin: 8 }}>
                  <div className="skeleton w60" />
                  <div className="skeleton w80" />
                </div>
              ))}
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="notif-empty">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>
                {filtro === 'no-leidas'
                  ? 'No tienes notificaciones sin leer'
                  : filtro === 'leidas'
                  ? 'No tienes notificaciones leídas'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            notificaciones.map((n) => (
              <div
                key={n.id}
                className={`notif-item tipo-${n.tipo} ${
                  n.leida ? 'leida' : ''
                }`}
                onClick={() => !n.leida && onMarcarLeida(n.id)}
              >
                <div className={`notif-icon tipo-${n.tipo}`}>
                  {n.tipo === 'success' && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {n.tipo === 'error' && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {n.tipo === 'warning' && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 9v2m0 4h.01M12 3l9 16H3l9-16z" />
                    </svg>
                  )}
                  {(!n.tipo || n.tipo === 'info') && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8h.01M11 12h1v4h1" />
                    </svg>
                  )}
                </div>

                <div className="notif-content">
                  <div className="notif-content-head">
                    <strong>{n.titulo}</strong>
                    {n.entidad && (
                      <span className={`notif-tag tipo-${n.tipo}`}>
                        {n.entidad}
                      </span>
                    )}
                  </div>
                  <p>{truncar(n.mensaje, 90)}</p>
                  <span className="notif-date">
                    {new Date(n.created_at).toLocaleString('es-BO', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {!n.leida && <span className="notif-unread-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}