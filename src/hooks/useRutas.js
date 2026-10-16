import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useRutas({ incluirPendientes = false, incluirInactivas = false } = {}) {
  const [rutas, setRutas] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    let query = sb.from('rutas').select('*').order('created_at', { ascending: false })
    if (!incluirPendientes) query = query.eq('estado_revision', 'aprobada')
    if (!incluirInactivas) query = query.eq('activo', true)
    const { data, error } = await query

    if (!error) setRutas(data || [])
    setLoading(false)
    return data || []
  }, [incluirInactivas, incluirPendientes])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(
    async (ruta, userId) => {
      if (!userId) throw new Error('Debes iniciar sesión')

      const { data, error } = await sb
        .from('rutas')
        .insert({
          ...ruta,
          user_id: userId,
          activo: false,
          estado_revision: 'pendiente',
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      await cargar()
      return data
    },
    [cargar]
  )

  const actualizar = useCallback(
    async (id, cambios) => {
      const { error } = await sb.from('rutas').update(cambios).eq('id', id)
      if (error) throw new Error(error.message)
      await cargar()
    },
    [cargar]
  )

  const aprobar = useCallback(
    async (id) => {
      const { error } = await sb
        .from('rutas')
        .update({
          estado: 'aprobado',
          estado_revision: 'aprobada',
          aprobado_en: new Date().toISOString(),
          motivo_rechazo: null,
          activo: true,
        })
        .eq('id', id)
      if (error) throw new Error(error.message)
      await cargar()
    },
    [cargar]
  )

  const eliminar = useCallback(
    async (id) => {
      const { error } = await sb.from('rutas').delete().eq('id', id)
      if (error) throw new Error(error.message)
      await cargar()
    },
    [cargar]
  )

  return { rutas, loading, cargar, crear, actualizar, aprobar, eliminar }
}