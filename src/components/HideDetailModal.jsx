import { useEffect } from 'react'
import { ESTADOS_RUTA } from '../data/hides'

export default function HideDetailModal({
  hide,
  estadoTramo = 'ok',
  distanciaKm,
  onClose,
  onIr,
}) {
  const estado = ESTADOS_RUTA[estadoTramo] || ESTADOS_RUTA.ok

  useEffect(() => {
    if (!hide) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hide, onClose])

  if (!hide) return null

  const kmLabel =
    distanciaKm == null
      ? '—'
      : distanciaKm < 1
      ? `${Math.round(distanciaKm * 1000)} m`
      : `${distanciaKm.toFixed(1)} km`

  return (
    <div
      className="hide-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="hide-modal">
        <div
          className="hide-modal-photo"
          style={{ backgroundImage: `url('${hide.imagen}')` }}
        >
          <button
            className="hide-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className={`hide-modal-estado estado-${estadoTramo}`}>
            <span className="hide-modal-estado-dot" />
            {estado.label}
          </div>
        </div>

        <div className="hide-modal-body">
          <div className="hide-modal-header">
            <h2 className="hide-modal-title">{hide.nombre}</h2>
            <p className="hide-modal-sub">
              {hide.descripcion || hide.ciudad || 'Punto de observación'}
            </p>
          </div>

          <div className="hide-modal-stats">
            <div className="hide-modal-stat">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <div>
                <span className="hide-modal-stat-label">Distancia</span>
                <strong className="hide-modal-stat-value">{kmLabel}</strong>
              </div>
            </div>

            <div className="hide-modal-stat">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="6" cy="19" r="2.4" />
                <circle cx="18" cy="5" r="2.4" />
                <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
              </svg>
              <div>
                <span className="hide-modal-stat-label">Estado</span>
                <strong
                  className="hide-modal-stat-value"
                  style={{ color: estado.color }}
                >
                  {estado.icono} {estado.label}
                </strong>
              </div>
            </div>

            {hide.especie && (
              <div className="hide-modal-stat">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <div>
                  <span className="hide-modal-stat-label">Especie</span>
                  <strong className="hide-modal-stat-value">
                    {hide.especie}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {hide.dms && (
            <div className="hide-modal-coords">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{hide.dms}</span>
            </div>
          )}

          {/* Botón único: Recorrer */}
          <div className="hide-modal-actions">
            <button className="hide-modal-btn ir" onClick={onIr}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Recorrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}