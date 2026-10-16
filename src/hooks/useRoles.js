import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useRoles() {
  const [roles, setRoles] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data } = await sb
      .from('roles')
      .select('*')
      .order('id', { ascending: true })
    setRoles(data || [])
    setLoading(false)
    return data || []
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(
    async (rol) => {
      const { data, error } = await sb
        .from('roles')
        .insert(rol)
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
      const { error } = await sb.from('roles').update(cambios).eq('id', id)
      if (error) throw new Error(error.message)
      await cargar()
    },
    [cargar]
  )

  const eliminar = useCallback(
    async (id) => {
      const { error } = await sb.from('roles').delete().eq('id', id)
      if (error) throw new Error(error.message)
      await cargar()
    },
    [cargar]
  )

  return { roles, loading, cargar, crear, actualizar, eliminar }
}