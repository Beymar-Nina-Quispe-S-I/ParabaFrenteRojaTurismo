import { useMemo, useState } from 'react'
import { useRoles } from '../hooks/useRoles'

const PERMISOS_POR_DEFECTO = { ver_rutas: true }

const SECCIONES_PERMISOS = [
  {
    titulo: 'Acceso a módulos',
    descripcion: 'Secciones que puede consultar el rol.',
    permisos: [
      { key: 'ver_mapa', label: 'Ver mapa' },
      { key: 'ver_avistamientos', label: 'Ver avistamientos' },
      { key: 'ver_alertas', label: 'Ver alertas' },
    ],
  },
  {
    titulo: 'Fichas técnicas de aves',
    descripcion: 'Consulta y administración de las fichas.',
    permisos: [
      { key: 'ver_ficha', label: 'Ver fichas' },
      { key: 'crear_fichas', label: 'Crear fichas' },
      { key: 'editar_fichas', label: 'Editar fichas' },
      { key: 'activar_fichas', label: 'Activar o desactivar fichas' },
      { key: 'eliminar_fichas', label: 'Eliminar fichas' },
    ],
  },
  {
    titulo: 'Avistamientos',
    descripcion: 'Acciones sobre registros de avistamientos.',
    permisos: [
      { key: 'registrar_avistamiento', label: 'Registrar avistamientos' },
      { key: 'editar_avistamiento_propio', label: 'Editar sus avistamientos' },
      { key: 'borrar_avistamiento_propio', label: 'Borrar sus avistamientos' },
    ],
  },
  {
    titulo: 'Rutas',
    descripcion: 'Consulta, creación y mantenimiento de rutas.',
    permisos: [
      { key: 'ver_rutas', label: 'Ver rutas' },
      { key: 'registrar_ruta', label: 'Crear rutas' },
      { key: 'editar_ruta_propia', label: 'Editar sus rutas' },
      { key: 'borrar_ruta_propia', label: 'Borrar sus rutas' },
      { key: 'editar_cualquier_ruta', label: 'Editar cualquier ruta' },
      { key: 'borrar_cualquier_ruta', label: 'Borrar cualquier ruta' },
      { key: 'activar_rutas', label: 'Activar o desactivar rutas y hides' },
      { key: 'aprobar_rutas', label: 'Aceptar rutas comunitarias' },
    ],
  },
  {
    titulo: 'Administración',
    descripcion: 'Gestión del panel, usuarios y roles.',
    permisos: [
      { key: 'gestionar_usuarios', label: 'Gestionar usuarios y dashboard' },
      { key: 'gestionar_roles', label: 'Gestionar roles' },
      { key: 'ver_historial_usuarios', label: 'Ver historial personal de usuarios' },
    ],
  },
]

const PERMISOS = SECCIONES_PERMISOS.flatMap((seccion) => seccion.permisos)

function PermisosPorSeccion({ valores, disabled = false, onToggle }) {
  return (
    <div className="rol-permisos">
      {SECCIONES_PERMISOS.map((seccion) => (
        <section className="rol-permisos-grupo" key={seccion.titulo}>
          <div className="rol-permisos-grupo-header">
            <h4>{seccion.titulo}</h4>
            <p>{seccion.descripcion}</p>
          </div>
          <div className="rol-permisos-grid">
            {seccion.permisos.map((permiso) => (
              <label key={permiso.key} className={disabled ? 'disabled' : ''}>
                <input
                  type="checkbox"
                  checked={Boolean(
                    valores[permiso.key] ?? PERMISOS_POR_DEFECTO[permiso.key] ?? false
                  )}
                  disabled={disabled}
                  onChange={() => onToggle(permiso.key)}
                />
                {permiso.label}
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function RolesView({ onToast }) {
  const { roles, loading, crear, actualizar, eliminar } = useRoles()
  const [editando, setEditando] = useState(null)
  const [creando, setCreando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [nuevo, setNuevo] = useState({
    nombre: '',
    descripcion: '',
    ...Object.fromEntries(PERMISOS.map((p) => [p.key, false])),
  })

  // 🔍 Filtro de roles por nombre o descripción
  const rolesFiltrados = useMemo(() => {
    if (!roles) return null
    const q = busqueda.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        (r.descripcion || '').toLowerCase().includes(q)
    )
  }, [roles, busqueda])

  function togglePermiso(rol, key) {
    const actual = rol[key] ?? PERMISOS_POR_DEFECTO[key] ?? false
    const nuevos = { ...rol, [key]: !actual }
    setEditando(nuevos)
  }

  async function guardarEdicion() {
    if (!editando) return
    try {
      const camposProtegidos = ['id', 'created_at', 'updated_at', 'roles']
      const cambios = Object.fromEntries(
        Object.entries(editando).filter(([campo]) => !camposProtegidos.includes(campo))
      )
      await actualizar(editando.id, cambios)
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Gestión de roles</span>
      </header>

      <div className="mobile-card">
        <div className="roles-view-header">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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

        {/* 🔍 Buscador */}
        <div className="roles-buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar rol por nombre o descripción..."
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
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
            <PermisosPorSeccion
              valores={nuevo}
              onToggle={(key) => setNuevo((actual) => ({ ...actual, [key]: !actual[key] }))}
            />
            <div className="rol-editor-actions">
              <button onClick={() => setCreando(false)}>Cancelar</button>
              <button className="primary" onClick={guardarNuevo}>Guardar</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        ) : rolesFiltrados && rolesFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay roles que coincidan con "{busqueda}"</p>
          </div>
        ) : (
          <div className="roles-list">
            {rolesFiltrados &&
              rolesFiltrados.map((rol) => {
                const editandoEste = editando?.id === rol.id
                const actual = editandoEste ? editando : rol
                return (
                  <div key={rol.id} className="rol-card">
                    <div className="rol-card-header">
                      <div>
                        <strong>{rol.nombre}</strong>
                        {rol.es_sistema && <span className="rol-badge">Sistema</span>}
                        <p>{rol.descripcion}</p>
                      </div>
                      <div className="rol-card-actions">
                        {!editandoEste ? (
                          <>
                            <button onClick={() => setEditando({ ...rol })}>Editar</button>
                            {!rol.es_sistema && (
                              <button className="danger" onClick={() => borrarRol(rol)}>
                                Borrar
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditando(null)}>Cancelar</button>
                            <button className="primary" onClick={guardarEdicion}>Guardar</button>
                          </>
                        )}
                      </div>
                    </div>

                    <PermisosPorSeccion
                      valores={actual}
                      disabled={!editandoEste}
                      onToggle={(key) => togglePermiso(actual, key)}
                    />
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}