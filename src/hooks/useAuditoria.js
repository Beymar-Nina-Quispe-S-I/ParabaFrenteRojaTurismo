import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useAuditoria() {
  const [logs, setLogs] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(
    async (filtros = {}) => {
      setLoading(true)

      let query = sb
        .from('auditoria')
        .select(
          'id, user_id, accion, entidad, entidad_id, detalles, created_at, users:user_id(nombre, usuario)'
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (filtros.user_id) query = query.eq('user_id', filtros.user_id)
      if (filtros.accion) query = query.eq('accion', filtros.accion)

      const hace30Dias = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString()
      query = query.gte('created_at', hace30Dias)

      const { data, error } = await query
      if (error) console.error('Error cargando auditoría:', error)

      setLogs(data || [])
      setLoading(false)
      return data || []
    },
    []
  )

  const registrar = useCallback(
    async ({ user_id, accion, entidad, entidad_id, detalles }) => {
      try {
        await sb.from('auditoria').insert({
          user_id,
          accion,
          entidad: entidad || null,
          entidad_id: entidad_id || null,
          detalles: detalles || null,
          user_agent: navigator.userAgent,
        })
      } catch (err) {
        console.warn('Error registrando auditoría:', err)
      }
    },
    []
  )

  return { logs, loading, registrar, cargar }
}