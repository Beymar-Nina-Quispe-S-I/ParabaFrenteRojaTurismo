import { useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

const DEFAULT = {
  ver_mapa: true,
  ver_avistamientos: true,
  ver_alertas: true,
  ver_rutas: true,
  ver_ficha: false,
  gestionar_fichas: false,
  crear_fichas: false,
  editar_fichas: false,
  activar_fichas: false,
  eliminar_fichas: false,
  registrar_avistamiento: false,
  editar_avistamiento_propio: false,
  borrar_avistamiento_propio: false,
  registrar_ruta: false,
  editar_ruta_propia: false,
  borrar_ruta_propia: false,
  editar_cualquier_ruta: false,
  borrar_cualquier_ruta: false,
  activar_rutas: false,
  aprobar_rutas: false,
  gestionar_usuarios: false,
  gestionar_roles: false,
  ver_historial_usuarios: false,
}

export function usePermissions(user) {
  const [role, setRole] = useState(null)
  const [permisos, setPermisos] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setPermisos(DEFAULT)
      setLoading(false)
      return
    }

    let cancel = false
    async function cargar() {
      setLoading(true)
      const { data } = await sb
        .from('users')
        .select('role_id, roles(*)')
        .eq('id', user.id)
        .single()

      if (cancel) return

      const r = data?.roles || null
      setRole(r)
      setPermisos(r ? { ...DEFAULT, ...r } : DEFAULT)
      setLoading(false)
    }
    cargar()

    return () => {
      cancel = true
    }
  }, [user])

  const esAdmin = role?.nombre === 'admin'
  const tiene = (permiso) => esAdmin || permisos[permiso] === true

  return { role, permisos, loading, tiene, esAdmin }
}