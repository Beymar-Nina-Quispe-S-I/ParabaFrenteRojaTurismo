import { useCallback, useState } from 'react'
import { sb } from '../lib/supabase'

export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await sb.rpc('estadisticas_dashboard')
    if (error) {
      console.error('Error cargando estadísticas:', error)
      setLoading(false)
      return null
    }
    setStats(data)
    setUltimaActualizacion(new Date())
    setLoading(false)
    return data
  }, [])

  return { stats, loading, ultimaActualizacion, cargar }
}