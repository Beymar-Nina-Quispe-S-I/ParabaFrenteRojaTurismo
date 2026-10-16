import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useHidesEstado() {
  const [estados, setEstados] = useState({})

  const cargar = useCallback(async () => {
    const { data, error } = await sb
      .from('hides_establecidos')
      .select('id, activo')

    if (!error) {
      setEstados(Object.fromEntries((data || []).map((hide) => [hide.id, hide.activo])))
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const cambiarEstado = useCallback(async (id, activo) => {
    const { error } = await sb
      .from('hides_establecidos')
      .update({ activo })
      .eq('id', id)

    if (error) throw new Error(error.message)
    setEstados((actuales) => ({ ...actuales, [id]: activo }))
  }, [])

  const estaActivo = useCallback(
    (hide) => estados[hide.id] ?? hide.activo ?? true,
    [estados]
  )

  return { estados, estaActivo, cambiarEstado, cargar }
}