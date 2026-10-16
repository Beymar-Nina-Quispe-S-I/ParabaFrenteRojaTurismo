import { useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useAuth } from '../hooks/useAuth'

export default function BotonNotificaciones({ onToast }) {
  const { user } = useAuth()
  const { permission, tokenGuardado, activarNotificaciones, soportado } =
    usePushNotifications(user)
  const [cargando, setCargando] = useState(false)

  if (!user || !soportado) return null

  const yaActivas = permission === 'granted' && tokenGuardado

  async function handleClick() {
    setCargando(true)
    const res = await activarNotificaciones()
    setCargando(false)

    if (res.ok) {
      onToast && onToast('Notificaciones activadas', 'success')
    } else {
      onToast && onToast(res.error || 'No se pudieron activar', 'error')
    }
  }

  return (
    <button
      className={`boton-notif ${yaActivas ? 'activas' : ''}`}
      onClick={yaActivas ? undefined : handleClick}
      disabled={cargando || yaActivas}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span>
        {yaActivas
          ? 'Notificaciones activas'
          : cargando
          ? 'Activando...'
          : 'Activar notificaciones'}
      </span>
    </button>
  )
}