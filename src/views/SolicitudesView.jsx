import { useState } from 'react'
import { useSolicitudes } from '../hooks/useSolicitudes'
import { useAuth } from '../hooks/useAuth'

export default function SolicitudesView({ onToast }) {
  const { user } = useAuth()
  const { solicitudes, loading, aprobar, rechazar } = useSolicitudes()
  const [rechazando, setRechazando] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = (solicitudes || []).filter((s) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    const nombre = s.users?.nombre || s.users?.usuario || ''
    return (
      nombre.toLowerCase().includes(q) ||
      (s.nombre || s.especie || '').toLowerCase().includes(q) ||
      (s.lugar || s.ciudad || '').toLowerCase().includes(q)
    )
  })

  async function handleAprobar(s) {
    try {
      await aprobar(s.tipo, s.id, user.id)
      onToast('Solicitud aprobada y notificada al usuario', 'success')
    } catch (e) {
      onToast(e.message, 'error')
    }
  }

  async function handleRechazar() {
    if (!motivo.trim()) {
      onToast('Escribe un motivo', 'error')
      return
    }
    try {
      await rechazar(rechazando.tipo, rechazando.id, user.id, motivo.trim())
      onToast('Solicitud rechazada y notificada al usuario', 'info')
      setRechazando(null)
      setMotivo('')
    } catch (e) {
      onToast(e.message, 'error')
    }
  }

  const total = solicitudes?.length || 0

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Solicitudes pendientes</span>
      </header>

      <div className="mobile-card">
        <div className="solicitudes-header">
          <div className="solicitudes-header-left">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pendientes
            </h3>
            <span className="solicitudes-count">
              {total} {total === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        <div className="roles-buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por usuario, lugar o especie..."
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

        {loading ? (
          <div className="solicitudes-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M5 13l4 4L19 7" />
            </svg>
            <p>
              {busqueda
                ? `No hay solicitudes que coincidan con "${busqueda}"`
                : 'No hay solicitudes pendientes. Todo al día.'}
            </p>
          </div>
        ) : (
          <div className="solicitudes-list">
            {filtradas.map((s) => (
              <div key={`${s.tipo}-${s.id}`} className="solicitud-card">
                <div className="solicitud-head">
                  <span className={`solicitud-tipo ${s.tipo}`}>
                    {s.tipo === 'avistamiento' ? 'Avistamiento' : 'Ruta'}
                  </span>
                  <span className="solicitud-date">
                    {new Date(s.created_at).toLocaleDateString('es-BO', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="solicitud-body">
                  <h4>{s.nombre || s.especie}</h4>

                  <div className="solicitud-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>
                      {s.users?.nombre || s.users?.usuario || 'Usuario desconocido'}
                    </span>
                  </div>

                  {(s.lugar || s.ciudad) && (
                    <div className="solicitud-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{[s.lugar, s.ciudad].filter(Boolean).join(', ')}</span>
                    </div>
                  )}

                  {s.descripcion && (
                    <p className="solicitud-desc">{s.descripcion}</p>
                  )}
                </div>

                <div className="solicitud-actions">
                  <button
                    className="solicitud-btn aprobar"
                    onClick={() => handleAprobar(s)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Aprobar
                  </button>
                  <button
                    className="solicitud-btn rechazar"
                    onClick={() => setRechazando(s)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rechazando && (
        <div
          className="roles-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setRechazando(null)}
        >
          <div className="roles-modal" style={{ maxWidth: 480 }}>
            <div className="roles-modal-header">
              <h2>Rechazar {rechazando.tipo}</h2>
              <button
                className="roles-modal-close"
                onClick={() => setRechazando(null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="roles-modal-body">
              <div className="solicitud-rechazo-info">
                Se notificará a{' '}
                <strong>
                  {rechazando.users?.nombre ||
                    rechazando.users?.usuario ||
                    'el usuario'}
                </strong>{' '}
                que su {rechazando.tipo} fue rechazado.
              </div>

              <label className="field-label">Motivo del rechazo</label>
              <textarea
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Explica por qué se rechaza..."
              />

              <div className="rol-editor-actions" style={{ marginTop: 16 }}>
                <button onClick={() => setRechazando(null)}>Cancelar</button>
                <button className="primary" onClick={handleRechazar}>
                  Rechazar y notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}