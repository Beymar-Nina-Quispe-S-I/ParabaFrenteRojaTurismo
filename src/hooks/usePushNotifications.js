import { useEffect, useState, useCallback } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingSafe } from '../lib/firebase'
import { sb } from '../lib/supabase'

export function usePushNotifications(user) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [tokenGuardado, setTokenGuardado] = useState(false)

  // Escuchar notificaciones en primer plano
  useEffect(() => {
    if (!user) return
    let unsub = null

    async function setupListener() {
      const messaging = await getMessagingSafe()
      if (!messaging) return
      unsub = onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {}
        if (Notification.permission === 'granted') {
          new Notification(title || 'Ecosvuelos', {
            body: body || '',
            icon: '/icons/icon-192x192.png',
          })
        }
      })
    }
    setupListener()

    return () => {
      if (unsub) unsub()
    }
  }, [user])

  // 🔑 Función que el USUARIO debe llamar manualmente (click en un botón)
  const activarNotificaciones = useCallback(async () => {
    if (!user) return { ok: false, error: 'Debes iniciar sesión' }

    try {
      if (!('Notification' in window)) {
        return { ok: false, error: 'Tu navegador no soporta notificaciones' }
      }

      if (Notification.permission === 'denied') {
        return {
          ok: false,
          error:
            'Bloqueaste las notificaciones. Actívalas desde el candado de la barra de direcciones.',
        }
      }

      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        return { ok: false, error: 'Permiso denegado' }
      }

      // Registrar Service Worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        await navigator.serviceWorker.ready
      }

      const messaging = await getMessagingSafe()
      if (!messaging) {
        return { ok: false, error: 'No se pudo inicializar Firebase' }
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        return { ok: false, error: 'Falta VITE_FIREBASE_VAPID_KEY' }
      }

      const token = await getToken(messaging, { vapidKey })
      if (!token) {
        return { ok: false, error: 'No se pudo obtener el token' }
      }

      await sb.from('push_subscriptions').upsert(
        { user_id: user.id, fcm_token: token },
        { onConflict: 'user_id,fcm_token' }
      )

      setTokenGuardado(true)
      return { ok: true }
    } catch (err) {
      console.error('Error activando notificaciones:', err)
      return { ok: false, error: err.message || 'Error desconocido' }
    }
  }, [user])

  return {
    permission,
    tokenGuardado,
    activarNotificaciones,
    soportado: typeof Notification !== 'undefined',
  }
}