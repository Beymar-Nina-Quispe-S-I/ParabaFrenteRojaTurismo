import { useState } from 'react'
import { useRutas } from '../hooks/useRutas'
import RutaFormModal from '../components/RutaFormModal'
import { haversineKm } from '../lib/geo'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { useHidesEstado } from '../hooks/useHidesEstado'
import { HIDES_INICIALES } from '../data/hides'
import { sb } from '../lib/supabase'

export default function RutasView({ userPosition, onTrazar, onOpenModal, onToast }) {
  const { user } = useAuth()
  const { tiene } = usePermissions(user)
  const puedeAprobarRutas = tiene('aprobar_rutas')
  const puedeActivarRutas = tiene('activar_rutas')
  const { estaActivo, cambiarEstado: cambiarEstadoHide } = useHidesEstado()
  const { rutas, loading, crear, actualizar, aprobar, eliminar } = useRutas({
    incluirPendientes: puedeAprobarRutas,
    incluirInactivas: puedeActivarRutas,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState(null)

  const puedeCrear = tiene('registrar_ruta')
  const puedeEditarPropias = tiene('editar_ruta_propia')
  const puedeEliminarPropias = tiene('borrar_ruta_propia')
  const puedeEditarTodas = tiene('editar_cualquier_ruta')
  const puedeEliminarTodas = tiene('borrar_cualquier_ruta')

  function handleNuevaRuta() {
    if (!user) {
      onOpenModal && onOpenModal('login')
      return
    }
    setEditando(null)
    setFormOpen(true)
  }

  function puedeEditarRuta(ruta) {
    return puedeEditarTodas || (puedeEditarPropias && ruta.user_id === user?.id)
  }

  function puedeEliminarRuta(ruta) {
    return puedeEliminarTodas || (puedeEliminarPropias && ruta.user_id === user?.id)
  }

  async function handleEliminarRuta(ruta) {
    if (!confirm(`¿Eliminar la ruta "${ruta.nombre}"?`)) return
    try {
      await eliminar(ruta.id)
      onToast?.('Ruta eliminada', 'success')
    } catch (error) {
      onToast?.(error.message || 'No se pudo eliminar la ruta', 'error')
    }
  }

  async function handleCambiarEstadoRuta(ruta) {
    try {
      await actualizar(ruta.id, { activo: !ruta.activo })
      onToast?.(ruta.activo ? 'Ruta desactivada' : 'Ruta activada', 'success')
    } catch (error) {
      onToast?.(error.message || 'No se pudo cambiar el estado de la ruta', 'error')
    }
  }

  async function handleCambiarEstadoHide(hide) {
    const activo = !estaActivo(hide)
    try {
      await cambiarEstadoHide(hide.id, activo)
      onToast?.(activo ? 'Hide activado' : 'Hide desactivado', 'success')
    } catch (error) {
      onToast?.(error.message || 'No se pudo cambiar el estado del hide', 'error')
    }
  }

  const hides = HIDES_INICIALES
    .map((hide) => ({
      ...hide,
      activo: estaActivo(hide),
      distKm: userPosition
        ? haversineKm(userPosition.lat, userPosition.lng, hide.latitud, hide.longitud)
        : null,
    }))
    .filter((hide) => hide.activo || puedeActivarRutas)
    .sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999))

  const comunitarias = (rutas || [])
    .filter(
      (ruta) =>
        ruta.estado_revision === 'aprobada' &&
        (ruta.activo || puedeActivarRutas)
    )
    .map((r) => ({
      ...r,
      distKm: userPosition
        ? haversineKm(userPosition.lat, userPosition.lng, r.latitud, r.longitud)
        : null,
    }))
    .sort((a, b) => (a.distKm ?? 9999) - (b.distKm ?? 9999))

  const pendientes = (rutas || []).filter(
    (ruta) => ruta.estado_revision === 'pendiente'
  )

  async function handleAprobarRuta(ruta) {
    try {
      await aprobar(ruta.id)
      onToast?.(`Ruta "${ruta.nombre}" aceptada`, 'success')
    } catch (error) {
      onToast?.(error.message || 'No se pudo aceptar la ruta', 'error')
    }
  }

  async function handleSaveRuta(data) {
    const nueva = editando ? editando : await crear(data, user.id)
    if (editando) await actualizar(editando.id, data)

    // Registrar en auditoría
    try {
      await sb.from('auditoria').insert({
        user_id: user.id,
        accion: editando ? 'editar_ruta' : 'crear_ruta',
        entidad: 'ruta',
        entidad_id: nueva?.id,
        detalles: { nombre: data.nombre, ciudad: data.ciudad },
        user_agent: navigator.userAgent,
      })
    } catch (err) {
      console.warn('No se pudo registrar auditoría:', err)
    }
    onToast?.(editando ? 'Ruta actualizada' : 'Ruta enviada para revisión', 'success')
    setEditando(null)
  }

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="19" r="2.4" />
          <circle cx="18" cy="5" r="2.4" />
          <path d="M8.4 19h7.6a3.2 3.2 0 000-6.4H8a3.2 3.2 0 010-6.4h7.6" />
        </svg>
        <span>Rutas · Hides</span>
      </header>

      {/* HIDES BASE (grid 3x3) */}
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
            <div className={`ruta-community-card ${h.activo ? '' : 'ruta-inactiva'}`} key={h.id}>
              <button
                className="hide-grid-item"
                disabled={!h.activo}
                onClick={() => onTrazar(h.latitud, h.longitud, h.nombre)}
              >
                <div
                  className="hide-grid-thumb"
                  style={{ backgroundImage: `url('${h.imagen}')` }}
                >
                  <span className="hide-grid-badge">{h.nombre}</span>
                  {!h.activo && <span className="ruta-estado-badge">Inactivo</span>}
                </div>
                {h.distKm !== null && h.distKm !== undefined && (
                  <div className="hide-grid-dist">
                    {h.distKm < 1
                      ? `${Math.round(h.distKm * 1000)} m`
                      : `${h.distKm.toFixed(1)} km`}
                  </div>
                )}
              </button>
              {puedeActivarRutas && (
                <div className="ruta-card-actions">
                  <button type="button" onClick={() => handleCambiarEstadoHide(h)}>
                    {h.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* COMUNIDAD */}
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
          Rutas comunitarias
        </h3>

        {puedeCrear ? (
          <button
            className="mobile-btn mobile-btn-primary"
            style={{ marginBottom: 14 }}
            onClick={handleNuevaRuta}
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
            Registrar nueva ruta
          </button>
        ) : !user ? (
              <button
                className="mobile-btn mobile-btn-primary"
                style={{ marginBottom: 14 }}
                onClick={() => onOpenModal('login')}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  width={20}
                  height={20}
                >
                  <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Inicia sesión para registrar
              </button>
        ) : null}

        {puedeAprobarRutas && (
          <section className="rutas-pendientes">
            <header className="rutas-pendientes-header">
              <div>
                <h4>Revisión de rutas</h4>
                <p>Acepta las rutas comunitarias antes de publicarlas.</p>
              </div>
              <span>{pendientes.length}</span>
            </header>
            {pendientes.length === 0 ? (
              <p className="rutas-pendientes-vacio">No hay rutas pendientes.</p>
            ) : (
              <div className="rutas-pendientes-lista">
                {pendientes.map((ruta) => (
                  <article className="ruta-pendiente" key={ruta.id}>
                    <div className="ruta-pendiente-info">
                      <strong>{ruta.nombre}</strong>
                      <span>{ruta.ciudad || 'Bolivia'} · {ruta.especie || 'Especie no indicada'}</span>
                      {ruta.descripcion && <p>{ruta.descripcion}</p>}
                    </div>
                    <div className="ruta-pendiente-acciones">
                      <button type="button" onClick={() => handleAprobarRuta(ruta)}>
                        Aceptar
                      </button>
                      {puedeEditarRuta(ruta) && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(ruta)
                            setFormOpen(true)
                          }}
                        >
                          Editar
                        </button>
                      )}
                      {puedeEliminarRuta(ruta) && (
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleEliminarRuta(ruta)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {loading ? (
          <div className="hides-grid">
            <div className="skeleton-item">
              <div className="skeleton w60" />
              <div className="skeleton w40" />
            </div>
            <div className="skeleton-item">
              <div className="skeleton w60" />
              <div className="skeleton w40" />
            </div>
            <div className="skeleton-item">
              <div className="skeleton w60" />
              <div className="skeleton w40" />
            </div>
          </div>
        ) : comunitarias.length === 0 ? (
          <div className="empty-state">
            <p>Aún no hay rutas comunitarias. ¡Sé el primero!</p>
          </div>
        ) : (
          <div className="hides-grid">
            {comunitarias.map((r) => (
              <div key={r.id} className={`ruta-community-card ${r.activo ? '' : 'ruta-inactiva'}`}>
                <button
                  className="hide-grid-item ruta-grid-item"
                  onClick={() => onTrazar(r.latitud, r.longitud, r.nombre)}
                >
                  <div
                    className="hide-grid-thumb ruta-grid-thumb"
                    style={{
                      backgroundImage: r.imagen_url
                        ? `url('${r.imagen_url}')`
                        : undefined,
                    }}
                  >
                    <span className="hide-grid-badge">{r.nombre}</span>
                    {!r.activo && <span className="ruta-estado-badge">Inactiva</span>}
                  </div>
                  {r.distKm !== null && r.distKm !== undefined && (
                    <div className="hide-grid-dist ruta-grid-dist">
                      {r.distKm < 1
                        ? `${Math.round(r.distKm * 1000)} m`
                        : `${r.distKm.toFixed(1)} km`}
                    </div>
                  )}
                </button>
                {(puedeEditarRuta(r) || puedeEliminarRuta(r) || puedeActivarRutas) && (
                  <div className="ruta-card-actions">
                    {puedeActivarRutas && (
                      <button type="button" onClick={() => handleCambiarEstadoRuta(r)}>
                        {r.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                    {puedeEditarRuta(r) && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(r)
                          setFormOpen(true)
                        }}
                      >
                        Editar
                      </button>
                    )}
                    {puedeEliminarRuta(r) && (
                      <button type="button" className="danger" onClick={() => handleEliminarRuta(r)}>
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <RutaFormModal
        open={formOpen}
        ruta={editando}
        user={user}
        onClose={() => {
          setFormOpen(false)
          setEditando(null)
        }}
        onSave={handleSaveRuta}
      />
    </div>
  )
}