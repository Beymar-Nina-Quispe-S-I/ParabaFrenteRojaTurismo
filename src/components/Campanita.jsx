import { useState } from 'react'
import { useNotificaciones } from '../hooks/useNotificaciones'
import NotificacionesModal from './NotificacionesModal'

export default function Campanita({ user }) {
  const {
    filtradas,
    filtro,
    setFiltro,
    noLeidas,
    leidas,
    total,
    loading,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificaciones(user)
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <>
      <button
        className="campanita"
        onClick={() => setOpen(true)}
        aria-label="Notificaciones"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="campanita-badge">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      <NotificacionesModal
        open={open}
        onClose={() => setOpen(false)}
        notificaciones={filtradas}
        filtro={filtro}
        setFiltro={setFiltro}
        total={total}
        noLeidas={noLeidas}
        leidas={leidas}
        loading={loading}
        onMarcarLeida={marcarLeida}
        onMarcarTodas={marcarTodasLeidas}
      />
    </>
  )
}