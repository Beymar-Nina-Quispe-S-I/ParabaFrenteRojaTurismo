import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useNotificaciones(user) {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const cargar = useCallback(async () => {
    if (!user) {
      setNotificaciones([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await sb
      .from('notificaciones')
      .select('*')
      .or(`user_id.eq.${user.id},role_id.eq.${user.role_id || 0}`)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotificaciones(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    cargar()

    if (!user) return
    const channel = sb
      .channel('notif-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones' },
        (payload) => {
          const n = payload.new
          if (
            n.user_id === user.id ||
            (n.role_id && n.role_id === user.role_id)
          ) {
            setNotificaciones((prev) => [n, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [user, cargar])

  const marcarLeida = useCallback(async (id) => {
    await sb.from('notificaciones').update({ leida: true }).eq('id', id)
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }, [])

  const marcarTodasLeidas = useCallback(async () => {
    if (!user) return
    await sb
      .from('notificaciones')
      .update({ leida: true })
      .or(`user_id.eq.${user.id},role_id.eq.${user.role_id || 0}`)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
  }, [user])

  const filtradas = notificaciones.filter((n) => {
    if (filtro === 'no-leidas') return !n.leida
    if (filtro === 'leidas') return n.leida
    return true
  })

  const noLeidas = notificaciones.filter((n) => !n.leida).length
  const leidas = notificaciones.filter((n) => n.leida).length

  return {
    notificaciones,
    filtradas,
    filtro,
    setFiltro,
    loading,
    noLeidas,
    leidas,
    total: notificaciones.length,
    marcarLeida,
    marcarTodasLeidas,
    cargar,
  }
}