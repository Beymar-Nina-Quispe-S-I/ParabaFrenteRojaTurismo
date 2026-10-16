import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'
import { useRoles } from '../hooks/useRoles'

export default function GestionUsuarios({ onClose, onToast }) {
  const { roles } = useRoles()
  const [usuarios, setUsuarios] = useState(null)

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
    <div
      className="roles-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="roles-modal">
        <div className="roles-modal-header">
          <h2>Gestión de usuarios</h2>
          <button className="roles-modal-close" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="roles-modal-body">
          {usuarios === null ? (
            <div className="skeleton-item">
              <div className="skeleton w60" />
              <div className="skeleton w40" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            usuarios.map((u) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}