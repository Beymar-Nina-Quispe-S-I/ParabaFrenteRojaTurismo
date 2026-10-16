import { useEffect, useMemo, useState } from 'react'
import { sb } from '../lib/supabase'
import { useRoles } from '../hooks/useRoles'

export default function UsuariosView({ onToast }) {
  const { roles } = useRoles()
  const [usuarios, setUsuarios] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  async function cargar() {
    setUsuarios(null)
    const { data } = await sb
      .from('users')
      .select('id, nombre, email, usuario, role_id, roles(nombre)')
      .order('id', { ascending: true })
    setUsuarios(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  // 🔍 Filtro de usuarios por nombre, email o usuario
  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return null
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter(
      (u) =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.usuario || '').toLowerCase().includes(q)
    )
  }, [usuarios, busqueda])

  async function cambiarRol(userId, roleId) {
    const { error } = await sb
      .from('users')
      .update({ role_id: roleId || null })
      .eq('id', userId)
    if (error) {
      onToast && onToast(error.message, 'error')
      return
    }
    onToast && onToast('Rol actualizado', 'success')
    cargar()
  }

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Gestión de usuarios</span>
      </header>

      <div className="mobile-card">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Usuarios registrados
        </h3>

        {/* 🔍 Buscador */}
        <div className="roles-buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o usuario..."
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

        {usuarios === null ? (
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay usuarios que coincidan con "{busqueda}"</p>
          </div>
        ) : (
          <div className="usuarios-list">
            {usuariosFiltrados.map((u) => (
              <div key={u.id} className="usuario-card">
                <div className="usuario-info">
                  <strong>{u.nombre}</strong>
                  <span>{u.email}</span>
                  <span className="usuario-usuario">@{u.usuario}</span>
                </div>
                <select
                  value={u.role_id || ''}
                  onChange={(e) => cambiarRol(u.id, e.target.value)}
                >
                  <option value="">Sin rol</option>
                  {(roles || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}