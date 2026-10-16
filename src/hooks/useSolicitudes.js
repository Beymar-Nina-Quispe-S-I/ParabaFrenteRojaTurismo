import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState(null)
  const [loading, setLoading] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)

    const { data: avist, error: errA } = await sb
      .from('avistamientos')
      .select(
        'id, especie, cantidad, lugar, ciudad, descripcion, fecha_avistamiento, created_at, user_id, estado, users:user_id(nombre, usuario)'
      )
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    const { data: rutas, error: errR } = await sb
      .from('rutas')
      .select(
        'id, nombre, descripcion, especie, ciudad, latitud, longitud, imagen_url, created_at, user_id, estado, users:user_id(nombre, usuario)'
      )
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    if (errA) console.warn('Error cargando avistamientos pendientes:', errA)
    if (errR) console.warn('Error cargando rutas pendientes:', errR)

    const list = [
      ...(avist || []).map((a) => ({ ...a, tipo: 'avistamiento' })),
      ...(rutas || []).map((r) => ({ ...r, tipo: 'ruta' })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setSolicitudes(list)
    setLoading(false)
    return list
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const aprobar = useCallback(
    async (tipo, id, adminId) => {
      const tabla = tipo === 'avistamiento' ? 'avistamientos' : 'rutas'

      const { data: registro } = await sb
        .from(tabla)
        .select('user_id, nombre, especie, lugar, ciudad, descripcion')
        .eq('id', id)
        .single()

      const { error } = await sb
        .from(tabla)
        .update({
          estado: 'aprobado',
          ...(tipo === 'ruta' ? { estado_revision: 'aprobada', activo: true } : {}),
          aprobado_por: adminId,
          aprobado_en: new Date().toISOString(),
          motivo_rechazo: null,
        })
        .eq('id', id)

      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: adminId,
        accion: 'aprobar',
        entidad: tipo,
        entidad_id: id,
        user_agent: navigator.userAgent,
      })

      if (registro?.user_id) {
        const tituloRegistro = registro.nombre || registro.especie || tipo
        const lugar = [registro.lugar, registro.ciudad]
          .filter(Boolean)
          .join(', ')

        const mensaje = lugar
          ? `Tu ${tipo} "${tituloRegistro}" en ${lugar} fue aprobado y ya es visible para todos.`
          : `Tu ${tipo} "${tituloRegistro}" fue aprobado y ya es visible para todos.`

        await sb.from('notificaciones').insert({
          user_id: registro.user_id,
          titulo: `Aprobado: ${tituloRegistro}`,
          mensaje,
          tipo: 'success',
          entidad: tipo,
          entidad_id: id,
        })
      }

      await cargar()
    },
    [cargar]
  )

  const rechazar = useCallback(
    async (tipo, id, adminId, motivo) => {
      const tabla = tipo === 'avistamiento' ? 'avistamientos' : 'rutas'

      const { data: registro } = await sb
        .from(tabla)
        .select('user_id, nombre, especie, lugar, ciudad, descripcion')
        .eq('id', id)
        .single()

      if (!registro?.user_id) {
        throw new Error('No se encontró el dueño del registro')
      }

      const { error } = await sb
        .from(tabla)
        .update({
          estado: 'rechazado',
          ...(tipo === 'ruta' ? { estado_revision: 'rechazada', activo: false } : {}),
          aprobado_por: adminId,
          aprobado_en: new Date().toISOString(),
          motivo_rechazo: motivo,
        })
        .eq('id', id)

      if (error) throw new Error(error.message)

      await sb.from('auditoria').insert({
        user_id: adminId,
        accion: 'rechazar',
        entidad: tipo,
        entidad_id: id,
        detalles: { motivo, notificado_a: registro.user_id },
        user_agent: navigator.userAgent,
      })

      const tituloRegistro = registro.nombre || registro.especie || tipo
      const lugar = [registro.lugar, registro.ciudad].filter(Boolean).join(', ')

      const mensaje = `Tu ${tipo} "${tituloRegistro}"${
        lugar ? ` en ${lugar}` : ''
      } fue rechazado. Motivo: ${motivo}`

      await sb.from('notificaciones').insert({
        user_id: registro.user_id,
        titulo: `Rechazado: ${tituloRegistro}`,
        mensaje,
        tipo: 'error',
        entidad: tipo,
        entidad_id: id,
      })

      await cargar()
    },
    [cargar]
  )

  return { solicitudes, loading, cargar, aprobar, rechazar }
}