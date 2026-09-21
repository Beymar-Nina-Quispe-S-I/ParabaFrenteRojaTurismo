import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useRutas() {
  const [rutas, setRutas] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await sb
      .from('rutas')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (!error) setRutas(data || [])
    setLoading(false)
    return data || []
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(
    async (ruta, userId) => {
      if (!userId) throw new Error('Debes iniciar sesión')

      const { data, error } = await sb
        .from('rutas')
        .insert({ ...ruta, user_id: userId })
        .select()
        .single()

      if (error) throw new Error(error.message)
      await cargar()
      return data
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

  return { rutas, loading, cargar, crear, eliminar }
}