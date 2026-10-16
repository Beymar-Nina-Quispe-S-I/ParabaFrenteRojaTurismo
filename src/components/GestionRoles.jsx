import { useState } from 'react'
import { useRoles } from '../hooks/useRoles'

const PERMISOS = [
  { key: 'ver_mapa', label: 'Ver mapa' },
  { key: 'ver_avistamientos', label: 'Ver avistamientos' },
  { key: 'ver_alertas', label: 'Ver alertas' },
  { key: 'ver_ficha', label: 'Ver ficha técnica' },
  { key: 'gestionar_fichas', label: 'Gestionar fichas (crear, editar, activar y eliminar)' },
  { key: 'registrar_avistamiento', label: 'Registrar avistamientos' },
  { key: 'editar_avistamiento_propio', label: 'Editar sus avistamientos' },
  { key: 'borrar_avistamiento_propio', label: 'Borrar sus avistamientos' },
  { key: 'registrar_ruta', label: 'Registrar rutas' },
  { key: 'editar_ruta_propia', label: 'Editar sus rutas' },
  { key: 'borrar_ruta_propia', label: 'Borrar sus rutas' },
  { key: 'editar_cualquier_ruta', label: 'Editar cualquier ruta' },
  { key: 'borrar_cualquier_ruta', label: 'Borrar cualquier ruta' },
  { key: 'gestionar_usuarios', label: 'Gestionar usuarios' },
  { key: 'gestionar_roles', label: 'Gestionar roles' },
]

export default function GestionRoles({ onToast }) {
  const { roles, loading, crear, actualizar, eliminar } = useRoles()
  const [editando, setEditando] = useState(null)
  const [creando, setCreando] = useState(false)
  const [nuevo, setNuevo] = useState({
    nombre: '',
    descripcion: '',
    ...Object.fromEntries(PERMISOS.map((p) => [p.key, false])),
  })

  function togglePermiso(rol, key) {
    setEditando({ ...rol, [key]: !rol[key] })
  }

  async function guardarEdicion() {
    if (!editando) return
    try {
      const { id, created_at, updated_at, roles: _r, ...cambios } = editando
      await actualizar(id, cambios)
      onToast && onToast('Rol actualizado', 'success')
      setEditando(null)
    } catch (e) {
      onToast && onToast(e.message, 'error')
    }
  }

  async function guardarNuevo() {
    if (!nuevo.nombre.trim()) {
      onToast && onToast('El nombre es obligatorio', 'error')
      return
    }
    try {
      await crear(nuevo)
      onToast && onToast('Rol creado', 'success')
      setCreando(false)
      setNuevo({
        nombre: '',
        descripcion: '',
        ...Object.fromEntries(PERMISOS.map((p) => [p.key, false])),
      })
    } catch (e) {
      onToast && onToast(e.message, 'error')
    }
  }

  async function borrarRol(rol) {
    if (rol.es_sistema) {
      onToast && onToast('No se puede borrar un rol del sistema', 'error')
      return
    }
    if (!confirm(`¿Borrar el rol "${rol.nombre}"?`)) return
    try {
      await eliminar(rol.id)
      onToast && onToast('Rol borrado', 'info')
    } catch (e) {
      onToast && onToast(e.message, 'error')
    }
  }

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Gestión de roles</span>
      </header>

      <div className="mobile-card">
        <div className="roles-view-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Roles existentes
          </h3>
          <button className="roles-btn-new" onClick={() => setCreando(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Crear rol
          </button>
        </div>

        {creando && (
          <div className="rol-editor" style={{ marginTop: 14 }}>
            <input
              placeholder="Nombre del rol"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
            <input
              placeholder="Descripción"
              value={nuevo.descripcion}
              onChange={(e) =>
                setNuevo({ ...nuevo, descripcion: e.target.value })
              }
            />
            <div className="rol-permisos">
              {PERMISOS.map((p) => (
                <label key={p.key}>
                  <input
                    type="checkbox"
                    checked={nuevo[p.key]}
                    onChange={() =>
                      setNuevo({ ...nuevo, [p.key]: !nuevo[p.key] })
                    }
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <div className="rol-editor-actions">
              <button onClick={() => setCreando(false)}>Cancelar</button>
              <button className="primary" onClick={guardarNuevo}>
                Guardar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        ) : (
          <div className="roles-list">
            {roles &&
              roles.map((rol) => {
                const editandoEste = editando?.id === rol.id
                const actual = editandoEste ? editando : rol
                return (
                  <div key={rol.id} className="rol-card">
                    <div className="rol-card-header">
                      <div>
                        <strong>{rol.nombre}</strong>
                        {rol.es_sistema && (
                          <span className="rol-badge">Sistema</span>
                        )}
                        <p>{rol.descripcion}</p>
                      </div>
                      <div className="rol-card-actions">
                        {!editandoEste ? (
                          <>
                            <button onClick={() => setEditando({ ...rol })}>
                              Editar
                            </button>
                            {!rol.es_sistema && (
                              <button
                                className="danger"
                                onClick={() => borrarRol(rol)}
                              >
                                Borrar
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditando(null)}>
                              Cancelar
                            </button>
                            <button className="primary" onClick={guardarEdicion}>
                              Guardar
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="rol-permisos">
                      {PERMISOS.map((p) => (
                        <label
                          key={p.key}
                          className={editandoEste ? '' : 'disabled'}
                        >
                          <input
                            type="checkbox"
                            checked={!!actual[p.key]}
                            disabled={!editandoEste}
                            onChange={() => togglePermiso(editando, p.key)}
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}