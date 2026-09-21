import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export default function AvistamientosView({ onOpenModal }) {
  const [list, setList] = useState(null)

  async function cargar() {
    setList(null)
    const { data } = await sb
      .from('avistamientos')
      .select(
        'id, especie, cantidad, lugar, ciudad, descripcion, fecha_avistamiento, created_at, user_id, users(nombre, usuario)'
      )
      .order('created_at', { ascending: false })
      .limit(15)
    setList(data || [])
  }

  useEffect(() => {
    cargar()
    window.__reloadAvist = cargar
    return () => {
      delete window.__reloadAvist
    }
  }, [])

  return (
    <div className="mobile-view active">
      {/* Título de vista para móvil */}
      <header className="mobile-view-title">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
        </svg>
        <span>Avistamientos</span>
      </header>

      <div className="mobile-card">
        <h3>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M9 20v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM22 8a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Comunidad
        </h3>

        <div>
          {list === null ? (
            <>
              <div className="skeleton-item">
                <div className="skeleton w40" />
                <div className="skeleton w60" />
              </div>
              <div className="skeleton-item">
                <div className="skeleton w40" />
                <div className="skeleton w60" />
              </div>
              <div className="skeleton-item">
                <div className="skeleton w40" />
                <div className="skeleton w60" />
              </div>
            </>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path d="M3 17l6-6 4 4 8-8m0 0v7m0-7h-7" />
              </svg>
              <p>Aún no hay avistamientos registrados. ¡Sé el primero!</p>
            </div>
          ) : (
            list.map((a) => {
              const nombre =
                a.users?.nombre || a.users?.usuario || 'Usuario anónimo'
              const fecha = new Date(
                a.fecha_avistamiento || a.created_at
              ).toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              return (
                <div key={a.id} className="mobile-avistamiento-item">
                  <div className="avistamiento-top">
                    <span className="avistamiento-user">{nombre}</span>
                    <span className="avistamiento-date">{fecha}</span>
                  </div>
                  <div className="avistamiento-especie">{a.especie}</div>
                  {(a.lugar || a.ciudad) && (
                    <div className="avistamiento-lugar">
                      {[a.lugar, a.ciudad].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <span className="badge-count">
                    {a.cantidad} {a.cantidad == 1 ? 'ave' : 'aves'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <button
          className="mobile-btn mobile-btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => onOpenModal('registrarAvistamiento')}
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
          Registrar avistamiento
        </button>
      </div>
    </div>
  )
}