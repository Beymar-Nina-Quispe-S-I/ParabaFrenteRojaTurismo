import { useEffect, useMemo, useState } from 'react'
import { useAuditoria } from '../hooks/useAuditoria'

const ACCIONES = [
  { key: '', label: 'Todas' },
  { key: 'login', label: 'Login' },
  { key: 'logout', label: 'Logout' },
  { key: 'crear_avistamiento', label: 'Avistamiento' },
  { key: 'crear_ruta', label: 'Ruta' },
  { key: 'aprobar', label: 'Aprobar' },
  { key: 'rechazar', label: 'Rechazar' },
]

const ICONO_POR_ACCION = {
  login: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  crear_avistamiento: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
    </svg>
  ),
  crear_ruta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="6" cy="19" r="2.4" />
      <circle cx="18" cy="5" r="2.4" />
      <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
    </svg>
  ),
  aprobar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  rechazar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  ),
}

function iconoDeAccion(accion) {
  return ICONO_POR_ACCION[accion] || ICONO_POR_ACCION.default
}

function formatFecha(iso) {
  const d = new Date(iso)
  const hoy = new Date()
  const esHoy = d.toDateString() === hoy.toDateString()
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  const esAyer = d.toDateString() === ayer.toDateString()

  if (esHoy) {
    return `Hoy · ${d.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }
  if (esAyer) {
    return `Ayer · ${d.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }
  return d.toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AuditoriaView({ presence }) {
  const { logs, loading, cargar } = useAuditoria()
  const { listaOnline, estaEnLinea, totalOnline } = presence
  const [busqueda, setBusqueda] = useState('')
  const [accion, setAccion] = useState('')

  useEffect(() => {
    cargar({ accion: accion || undefined })
  }, [cargar, accion])

  const filtrados = useMemo(() => {
    if (!logs) return []
    if (!busqueda.trim()) return logs
    const q = busqueda.toLowerCase()
    return logs.filter((l) => {
      const nombre = l.users?.nombre || l.users?.usuario || ''
      return (
        nombre.toLowerCase().includes(q) ||
        l.accion.toLowerCase().includes(q) ||
        (l.entidad || '').toLowerCase().includes(q)
      )
    })
  }, [logs, busqueda])

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Auditoría</span>
      </header>

      {/* En línea */}
      <div className="mobile-card">
        <div className="online-header">
          <h3>
            <span className="online-dot" />
            En línea ahora
          </h3>
          <span className="online-count">{totalOnline}</span>
        </div>

        {listaOnline.length === 0 ? (
          <div className="online-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M11 12h1v4h1" />
            </svg>
            <p>Nadie conectado</p>
          </div>
        ) : (
          <div className="online-list">
            {listaOnline.map((u) => (
              <div key={u.user_id} className="online-item">
                <div className="online-avatar">
                  {(u.nombre || u.usuario || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="online-info">
                  <strong>{u.nombre || u.usuario || 'Usuario'}</strong>
                  <span>@{u.usuario || 'usuario'}</span>
                </div>
                <span className="online-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="mobile-card">
        <div className="auditoria-top">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Últimos 30 días
          </h3>
        </div>

        <div className="roles-buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por usuario, acción o entidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} aria-label="Limpiar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="filtros-chips">
          {ACCIONES.map((a) => (
            <button
              key={a.key}
              className={`filtro-chip ${accion === a.key ? 'active' : ''}`}
              onClick={() => setAccion(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {logs === null || loading ? (
          <div className="auditoria-list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              {busqueda
                ? `No hay registros que coincidan con "${busqueda}"`
                : 'No hay actividad registrada en los últimos 30 días'}
            </p>
          </div>
        ) : (
          <div className="auditoria-list">
            {filtrados.map((l) => {
              const activo = estaEnLinea(l.user_id)
              return (
                <div key={l.id} className={`auditoria-item accion-${l.accion}`}>
                  <div className="auditoria-icon">
                    {iconoDeAccion(l.accion)}
                    <span
                      className={`auditoria-punto ${activo ? 'activo' : 'inactivo'}`}
                      title={activo ? 'En línea' : 'Desconectado'}
                    />
                  </div>
                  <div className="auditoria-info">
                    <strong>
                      {l.users?.nombre || l.users?.usuario || 'Usuario'}
                    </strong>
                    <span className="auditoria-accion">
                      {l.accion.replace(/_/g, ' ')}
                    </span>
                    {l.entidad && (
                      <span className="auditoria-entidad">
                        {l.entidad}
                        {l.entidad_id ? ` #${l.entidad_id}` : ''}
                      </span>
                    )}
                  </div>
                  <span className="auditoria-date">{formatFecha(l.created_at)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}