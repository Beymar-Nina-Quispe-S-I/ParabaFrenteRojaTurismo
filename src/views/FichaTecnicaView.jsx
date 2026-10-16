import { useState } from 'react'
import { useFichas } from '../hooks/useFichas'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import FichaCard from '../components/FichaCard'
import FichaFormModal from '../components/FichaFormModal'
import { exportarTodasPDF } from '../lib/exportar'

export default function FichaTecnicaView({ onToast }) {
  const { user } = useAuth()
  const { tiene, role } = usePermissions(user)
  const puedeCrear = role?.crear_fichas ?? tiene('gestionar_fichas')
  const puedeEditar = role?.editar_fichas ?? tiene('gestionar_fichas')
  const puedeActivar = role?.activar_fichas ?? tiene('gestionar_fichas')
  const puedeEliminar = role?.eliminar_fichas ?? tiene('gestionar_fichas')
  const incluirInactivas = puedeEditar || puedeActivar || puedeEliminar
  const { fichas, loading, crear, actualizar, toggleActivo, eliminar } =
    useFichas(user, incluirInactivas)

  const [busqueda, setBusqueda] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState(null)

  const filtradas = (fichas || []).filter((a) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      a.nombre.toLowerCase().includes(q) ||
      a.nombre_cientifico.toLowerCase().includes(q) ||
      (a.familia || '').toLowerCase().includes(q)
    )
  })

  function abrirNuevo() {
    setEditando(null)
    setFormOpen(true)
  }

  function abrirEditar(ficha) {
    setEditando(ficha)
    setFormOpen(true)
  }

  async function handleSave(datos) {
    if (editando) {
      await actualizar(editando.id, datos)
      onToast('Ficha actualizada', 'success')
    } else {
      await crear(datos)
      onToast('Ficha creada', 'success')
    }
  }

  async function handleToggleActivo(ficha) {
    try {
      await toggleActivo(ficha.id, !ficha.activo)
      onToast(
        ficha.activo ? 'Ficha desactivada' : 'Ficha activada',
        'info'
      )
    } catch (e) {
      onToast(e.message, 'error')
    }
  }

  async function handleEliminar(ficha) {
    if (!confirm(`¿Borrar la ficha "${ficha.nombre}"?`)) return
    try {
      await eliminar(ficha.id)
      onToast('Ficha borrada', 'info')
    } catch (e) {
      onToast(e.message, 'error')
    }
  }

  return (
    <div className="mobile-view active">
      <header className="mobile-view-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Ficha técnica</span>
      </header>

      <div className="ficha-top-actions">
        <div className="roles-buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, especie o familia..."
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

        <div className="ficha-top-btns">
          {puedeCrear && (
            <button className="ficha-export-all" onClick={abrirNuevo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nueva ficha
            </button>
          )}

          <button
            className="ficha-export-all secondary"
            onClick={() => {
              exportarTodasPDF(filtradas)
              onToast('PDF generado', 'success')
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mobile-card">
          <div className="skeleton-item">
            <div className="skeleton w60" />
            <div className="skeleton w40" />
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="mobile-card">
          <div className="empty-state">
            <p>No hay fichas que coincidan con "{busqueda}"</p>
          </div>
        </div>
      ) : (
        <div className="ficha-grid">
          {filtradas.map((ave) => (
            <FichaCard
              key={ave.id}
              ave={ave}
              puedeEditar={puedeEditar}
              puedeActivar={puedeActivar}
              puedeEliminar={puedeEliminar}
              onEditar={() => abrirEditar(ave)}
              onToggleActivo={() => handleToggleActivo(ave)}
              onEliminar={() => handleEliminar(ave)}
            />
          ))}
        </div>
      )}

      <FichaFormModal
        open={formOpen}
        ficha={editando}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}