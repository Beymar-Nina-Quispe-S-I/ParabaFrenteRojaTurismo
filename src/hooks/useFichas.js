import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useFichas(user, esGestor = false) {
  const [fichas, setFichas] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    let query = sb.from('fichas_aves').select('*').order('nombre')

    // Solo gestores ven las inactivas
    if (!esGestor) {
      query = query.eq('activo', true)
    }

    const { data, error } = await query
    if (error) console.warn('Error cargando fichas:', error)
    setFichas(data || [])
    setLoading(false)
    return data || []
  }, [esGestor])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(
    async (ficha) => {
      const { data, error } = await sb
        .from('fichas_aves')
        .insert({
          ...ficha,
          amenazas: ficha.amenazas || [],
          curiosidades: ficha.curiosidades || [],
          activo: ficha.activo ?? true,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: user?.id,
        accion: 'crear_ficha',
        entidad: 'ficha_ave',
        entidad_id: data.id,
        detalles: { nombre: data.nombre },
        user_agent: navigator.userAgent,
      })

      await cargar()
      return data
    },
    [cargar, user]
  )

  const actualizar = useCallback(
    async (id, cambios) => {
      const camposActualizables = { ...cambios }
      delete camposActualizables.id
      delete camposActualizables.created_at
      delete camposActualizables.updated_at

      const { error } = await sb
        .from('fichas_aves')
        .update(camposActualizables)
        .eq('id', id)
      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: user?.id,
        accion: 'editar_ficha',
        entidad: 'ficha_ave',
        entidad_id: id,
        detalles: { nombre: cambios.nombre },
        user_agent: navigator.userAgent,
      })

      await cargar()
    },
    [cargar, user]
  )

  const toggleActivo = useCallback(
    async (id, activo) => {
      const { error } = await sb
        .from('fichas_aves')
        .update({ activo })
        .eq('id', id)
      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: user?.id,
        accion: activo ? 'activar_ficha' : 'desactivar_ficha',
        entidad: 'ficha_ave',
        entidad_id: id,
        user_agent: navigator.userAgent,
      })

      await cargar()
    },
    [cargar, user]
  )

  const eliminar = useCallback(
    async (id) => {
      const { error } = await sb.from('fichas_aves').delete().eq('id', id)
      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: user?.id,
        accion: 'borrar_ficha',
        entidad: 'ficha_ave',
        entidad_id: id,
        user_agent: navigator.userAgent,
      })

      await cargar()
    },
    [cargar, user]
  )

  return { fichas, loading, cargar, crear, actualizar, toggleActivo, eliminar }
}