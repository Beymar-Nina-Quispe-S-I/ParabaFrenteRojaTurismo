import { useState } from 'react'
import { useRutas } from '../hooks/useRutas'
import RutaFormModal from '../components/RutaFormModal'
import { haversineKm } from '../lib/geo'
import { useAuth } from '../hooks/useAuth'
import { HIDES_INICIALES } from '../data/hides'

export default function RutasView({ userPosition, onTrazar, onOpenModal }) {
  const { user } = useAuth()
  const { rutas, loading, crear } = useRutas()
  const [formOpen, setFormOpen] = useState(false)

  function handleNuevaRuta() {
    if (!user) {
      onOpenModal && onOpenModal('login')
      return
    }
    setFormOpen(true)
  }

  // Hides base con distancia
  const hides = HIDES_INICIALES.map((h) => ({
    ...h,
    distKm: userPosition
      ? haversineKm(userPosition.lat, userPosition.lng, h.latitud, h.longitud)
      : null,
  })).sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999))

  // Rutas comunitarias
  const comunitarias = (rutas || [])
    .map((r) => ({
      ...r,
      distKm: userPosition
        ? haversineKm(userPosition.lat, userPosition.lng, r.latitud, r.longitud)
        : null,
    }))
    .sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999))

  return (
    <div className="mobile-view active">
      <div className="mobile-header scrolled" style={{ position: 'fixed' }}>
        <div className="mobile-header-title">
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
          <span>Rutas · Hides</span>
        </div>
      </div>
      <div style={{ height: 'calc(56px + var(--safe-top))' }} />

      {/* ================ HIDES GRID 3x3 ================ */}
      <div className="mobile-card">
        <h3>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
          Hides de observación
        </h3>

        <div className="hides-grid">
          {hides.map((h) => (
            <button
              key={h.id}
              className="hide-grid-item"
              onClick={() => onTrazar(h.latitud, h.longitud, h.nombre)}
            >
              <div
                className="hide-grid-thumb"
                style={{ backgroundImage: `url('${h.imagen}')` }}
              >
                <span className="hide-grid-badge">{h.nombre}</span>
              </div>
              {h.distKm !== null && h.distKm !== undefined && (
                <div className="hide-grid-dist">
                  {h.distKm < 1
                    ? `${Math.round(h.distKm * 1000)} m`
                    : `${h.distKm.toFixed(1)} km`}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================ COMUNIDAD ================ */}
      <div className="mobile-card">
        <h3>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Comunidad
        </h3>

        <button
          className="mobile-btn mobile-btn-primary"
          onClick={handleNuevaRuta}
          style={{ marginBottom: 14 }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width={20}
            height={20}
          >
            <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {user ? 'Registrar nueva ruta' : 'Inicia sesión para registrar'}
        </button>

        {loading ? (
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        ) : comunitarias.length === 0 ? (
          <div className="empty-state">
            <p>Aún no hay rutas comunitarias registradas</p>
          </div>
        ) : (
          <div className="rutas-grid">
            {comunitarias.map((r) => (
              <div key={r.id} className="ruta-item">
                <div
                  className="ruta-thumb"
                  style={{
                    backgroundImage: r.imagen_url
                      ? `url('${r.imagen_url}')`
                      : undefined,
                    backgroundColor: r.imagen_url ? undefined : '#e7e5de',
                  }}
                >
                  <span className="ruta-thumb-badge">{r.especie}</span>
                </div>

                <div className="ruta-info">
                  <div className="ruta-nombre">{r.nombre}</div>
                  <div className="ruta-meta">
                    {r.descripcion || r.ciudad || 'Sin descripción'}
                  </div>
                  {r.distKm !== null && r.distKm !== undefined && (
                    <span className="ruta-distancia">
                      {r.distKm < 1
                        ? `${Math.round(r.distKm * 1000)} m`
                        : `${r.distKm.toFixed(1)} km`}{' '}
                      de distancia
                    </span>
                  )}
                </div>

                <button
                  className="btn-ruta-trazar"
                  onClick={() => onTrazar(r.latitud, r.longitud, r.nombre)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  Ruta
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <RutaFormModal
        open={formOpen}
        user={user}
        onClose={() => setFormOpen(false)}
        onSave={async (data) => {
          await crear(data, user.id)
        }}
      />
    </div>
  )
}