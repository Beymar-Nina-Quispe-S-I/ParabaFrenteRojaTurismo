import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { haversineKm } from '../lib/geo'
import {
  HIDES_INICIALES,
  TRAMOS_RUTA,
  ESTADOS_RUTA,
} from '../data/hides'

export default function RutasView({ userPosition, onTrazar }) {
  const [list, setList] = useState(null)
  const [geo, setGeo] = useState(!!userPosition)

  useEffect(() => {
    setGeo(!!userPosition)
  }, [userPosition])

  useEffect(() => {
    async function cargar() {
      setList(null)
      const base = HIDES_INICIALES.map((h) => ({ ...h, origen: 'hide' }))

      const { data } = await sb
        .from('ubicaciones')
        .select(
          'id,nombre,ciudad,especie,latitud,longitud,cantidad_avistada,descripcion'
        )
        .eq('activo', true)
        .limit(30)

      const extra = (data || [])
        .filter(
          (u) =>
            !HIDES_INICIALES.some(
              (h) =>
                Math.abs(h.latitud - u.latitud) < 0.00001 &&
                Math.abs(h.longitud - u.longitud) < 0.00001
            )
        )
        .map((u) => ({ ...u, origen: 'user' }))

      let arr = [...base, ...extra].map((u) => ({
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

  // Tramos resueltos con datos completos
  const tramos = TRAMOS_RUTA.map((t) => {
    const desde = HIDES_INICIALES.find((h) => h.id === t.desde)
    const hasta = HIDES_INICIALES.find((h) => h.id === t.hasta)
    return {
      ...t,
      desde,
      hasta,
      estado: ESTADOS_RUTA[t.estado] || ESTADOS_RUTA.ok,
    }
  })

  return (
    <div className="mobile-view active">
      <div className="mobile-header scrolled" style={{ position: 'fixed' }}>
        <div className="mobile-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
          </svg>
          <span>Rutas · Hides</span>
        </div>
      </div>
      <div style={{ height: 'calc(56px + var(--safe-top))' }} />

      {/* ---- RUTA PROGRESIVA ---- */}
      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Ruta progresiva entre hides
        </h3>

        <div className="tramos-list">
          {tramos.map((t, i) => (
            <div
              key={t.id}
              className={`tramo-item tramo-${t.estado === ESTADOS_RUTA.ok ? 'ok' : t.estado === ESTADOS_RUTA.barro ? 'barro' : 'bloqueado'}`}
            >
              <div className="tramo-line" />
              <div className="tramo-info">
                <div className="tramo-nombre">
                  <span className="tramo-num">{i + 1}</span>
                  {t.nombre}
                </div>
                <div className="tramo-estado">
                  <span className="tramo-dot" />
                  {t.estado.label}
                </div>
              </div>
              <button
                className="btn-ruta-trazar"
                onClick={() =>
                  onTrazar(
                    t.hasta.latitud,
                    t.hasta.longitud,
                    t.nombre
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---- PUNTOS (HIDES + extras) ---- */}
      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="19" r="2.4" />
            <circle cx="18" cy="5" r="2.4" />
            <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
          </svg>
          Todos los puntos
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

        <div className="rutas-grid">
          {list === null ? (
            <>
              <div className="skeleton-item">
                <div className="skeleton w60" />
                <div className="skeleton w40" />
              </div>
            </>
          ) : (
            list.map((u) => (
              <div key={u.id} className="ruta-item">
                <div
                  className="ruta-thumb"
                  style={{ backgroundImage: `url('${u.imagen}')` }}
                >
                  <span className="ruta-thumb-badge">
                    {u.especie || 'Paraba'}
                  </span>
                </div>

                <div className="ruta-info">
                  <div className="ruta-nombre">{u.nombre}</div>
                  <div className="ruta-meta">
                    {u.descripcion ||
                      [u.ciudad, u.especie].filter(Boolean).join(' · ')}
                  </div>
                  {u.dms && (
                    <div className="ruta-coords">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {u.dms}
                    </div>
                  )}
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