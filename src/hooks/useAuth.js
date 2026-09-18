import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

const KEY = 'paraba_user'

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

    if (error || !data || data.length === 0 || data[0].password !== password) {
      throw new Error('Usuario o contraseña incorrectos')
    }
    const u = {
      id: data[0].id,
      nombre: data[0].nombre,
      email: data[0].email,
      usuario: data[0].usuario,
    }
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
    const { error } = await sb
      .from('users')
      .insert({ nombre, email, usuario, password })
    if (error) throw new Error(error.message)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(KEY)
  }, [])

  return { user, login, register, logout }
}