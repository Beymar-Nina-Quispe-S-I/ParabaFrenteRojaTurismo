import { useCallback, useEffect, useState } from 'react'
import { sb } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const u = data?.session?.user
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          nombre: u.user_metadata?.nombre || u.email?.split('@')[0],
          usuario: u.user_metadata?.usuario || u.email?.split('@')[0],
        })
      }
      setLoading(false)
    })

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          nombre: u.user_metadata?.nombre || u.email?.split('@')[0],
          usuario: u.user_metadata?.usuario || u.email?.split('@')[0],
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error(error.message)
    const u = data.user
    const profile = {
      id: u.id,
      email: u.email,
      nombre: u.user_metadata?.nombre || u.email?.split('@')[0],
      usuario: u.user_metadata?.usuario || u.email?.split('@')[0],
    }
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(
    async (nombre, email, usuario, password) => {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nombre: nombre.trim(), usuario: usuario.trim() },
        },
      })
      if (error) throw new Error(error.message)
      return data.user
    },
    []
  )

  const logout = useCallback(async () => {
    await sb.auth.signOut()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}