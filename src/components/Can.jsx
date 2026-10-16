import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../hooks/useAuth'

export default function Can({ permiso, children, fallback = null }) {
  const { user } = useAuth()
  const { tiene, loading } = usePermissions(user)

  if (loading) return null
  if (!user) return fallback
  if (!tiene(permiso)) return fallback

  return children
}