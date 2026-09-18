import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { haversineKm } from '../lib/geo'

export default function RutasView({ userPosition, onTrazar }) {
  const [list, setList] = useState(null)
  const [geo, setGeo] = useState(!!userPosition)

  useEffect(() => {
    setGeo(!!userPosition)
  }, [userPosition])

  useEffect(() => {
    async function cargar() {
      setList(null)
      const { data } = await sb
        .from('ubicaciones')
        .select('id,nombre,ciudad,especie,latitud,longitud,cantidad_avistada')
        .eq('activo', true)
        .limit(30)

      if (!data) {
        setList([])
        return
      }

      let arr = data.map((u) => ({
        ...u,
        distKm: userPosition
          ? haversineKm(
              userPosition.lat,
              userPosition.lng,
              u.latitud,
              u.longitud
            )
          : null,
      }))

      if (userPosition) arr = arr.sort((a, b) => a.distKm - b.distKm)

      setList(arr)
    }
    cargar()
  }, [userPosition])

  return (
    <div className="mobile-view active">
      <div className="mobile-header scrolled" style={{ position: 'fixed' }}>
        <div className="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
          </svg>
          <span>Rutas</span>
        </div>
      </div>
      <div style={{ height: 'calc(56px + var(--safe-top))' }} />

      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
          </svg>
          Puntos de avistamiento
        </h3>

        <div className="ruta-filter-note">
          {geo ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Mostrando distancias desde tu ubicación actual</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Activa tu ubicación para ver la distancia a cada punto</span>
            </>
          )}
        </div>

        <div>
          {list === null ? (
            <>
              <div className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
              <div className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            </>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <circle cx="6" cy="19" r="2.4" />
                <circle cx="18" cy="5" r="2.4" />
                <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
              </svg>
              <p>
                Aún no hay puntos con ubicación registrada. Registra un
                avistamiento con tu ubicación activada para crear el primero.
              </p>
            </div>
          ) : (
            list.map((u) => (
              <div key={u.id} className="ruta-item">
                <div className="ruta-info">
                  <div className="ruta-nombre">{u.nombre}</div>
                  <div className="ruta-meta">
                    {[u.ciudad, u.especie].filter(Boolean).join(' · ') ||
                      'Bolivia'}
                  </div>
                  {u.distKm !== null && (
                    <span className="ruta-distancia">
                      {u.distKm < 1
                        ? `${Math.round(u.distKm * 1000)} m`
                        : `${u.distKm.toFixed(1)} km`}{' '}
                      de distancia
                    </span>
                  )}
                </div>
                <button
                  className="btn-ruta-trazar"
                  onClick={() => onTrazar(u.latitud, u.longitud, u.nombre)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  Ruta
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}