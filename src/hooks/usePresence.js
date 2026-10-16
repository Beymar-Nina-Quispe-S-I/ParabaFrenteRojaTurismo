import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function usePresence(user) {
  const [onlineUsers, setOnlineUsers] = useState({})
  const userId = user?.id

  useEffect(() => {
    if (!userId) {
      setOnlineUsers({})
      return
    }

    let cancelado = false

    async function enviarHeartbeat() {
      if (cancelado) return
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return
      try {
        const { error } = await sb.from('auditoria').insert({
          user_id: userId,
          accion: 'heartbeat',
          user_agent: navigator.userAgent,
        })
        if (error) console.warn('Heartbeat error:', error)
      } catch (err) {
        console.warn('Heartbeat falló:', err)
      }
    }

    async function cargarActivos() {
      if (cancelado) return
      try {
        const desde = new Date(Date.now() - 20000).toISOString()
        const { data, error } = await sb
          .from('auditoria')
          .select('user_id, created_at, users:user_id(nombre, usuario)')
          .eq('accion', 'heartbeat')
          .gte('created_at', desde)
          .order('created_at', { ascending: false })
          .limit(500)
        if (error) {
          console.warn('Error activos:', error)
          return
        }
        const map = {}
        ;(data || []).forEach((u) => {
          const id = String(u.user_id)
          if (map[id]) return
          map[id] = {
            user_id: u.user_id,
            nombre: u.users?.nombre,
            usuario: u.users?.usuario,
            online_at: u.created_at,
          }
        })
        setOnlineUsers(map)
      } catch (err) {
        console.warn('Error:', err)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        enviarHeartbeat()
        cargarActivos()
      }
    }

    enviarHeartbeat()
    cargarActivos()

    const heartbeatInterval = setInterval(enviarHeartbeat, 8000)
    const activosInterval = setInterval(cargarActivos, 8000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', enviarHeartbeat)

    return () => {
      cancelado = true
      clearInterval(heartbeatInterval)
      clearInterval(activosInterval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', enviarHeartbeat)
    }
  }, [userId])

  const estaEnLinea = (uid) => !!onlineUsers[String(uid)]
  const totalOnline = Object.keys(onlineUsers).length
  const listaOnline = Object.values(onlineUsers)

  return { onlineUsers, listaOnline, estaEnLinea, totalOnline }
}