import { useCallback, useEffect, useMemo, useState } from 'react'
import { sb } from '../lib/supabase'

const KEY = 'paraba_user'

async function registrarEvento({ user_id, accion, entidad, entidad_id, detalles }) {
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
    console.warn('No se pudo registrar auditoría:', err)
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const s = localStorage.getItem(KEY)
    if (s) {
      try {
        setUser(JSON.parse(s))
      } catch {
        /* ignore */
      }
    }
  }, [])

  const login = useCallback(async (usuario, password) => {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .or(`email.eq.${usuario},usuario.eq.${usuario}`)
      .limit(1)

    if (error || !data || data.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    if (data[0].password !== password) {
      throw new Error('Contraseña incorrecta')
    }

    const u = {
      id: data[0].id,
      nombre: data[0].nombre,
      email: data[0].email,
      usuario: data[0].usuario,
    }

    await registrarEvento({
      user_id: u.id,
      accion: 'login',
      detalles: { email: u.email },
    })

    setUser(u)
    localStorage.setItem(KEY, JSON.stringify(u))
    return u
  }, [])

  const register = useCallback(async (nombre, email, usuario, password) => {
    const { data: existe } = await sb
      .from('users')
      .select('id')
      .or(`email.eq.${email},usuario.eq.${usuario}`)
      .limit(1)

    if (existe && existe.length > 0) {
      throw new Error('El email o usuario ya existe')
    }

    const { data, error } = await sb
      .from('users')
      .insert({ nombre, email, usuario, password })
      .select()
      .single()

    if (error) throw new Error(error.message)

    await registrarEvento({
      user_id: data.id,
      accion: 'registro_usuario',
      detalles: { email: data.email, usuario: data.usuario },
    })

    return data
  }, [])

  const logout = useCallback(async () => {
    if (user) {
      await registrarEvento({
        user_id: user.id,
        accion: 'logout',
      })
    }
    setUser(null)
    localStorage.removeItem(KEY)
  }, [user])

  // 👇 Memorizar el objeto user para que no cambie de identidad en cada render
  const stableUser = useMemo(
    () =>
      user
        ? {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            usuario: user.usuario,
          }
        : null,
    [user?.id, user?.nombre, user?.email, user?.usuario]
  )

  return { user: stableUser, loading: false, login, register, logout }
}