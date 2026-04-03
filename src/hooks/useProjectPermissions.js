import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

export function useProjectPermissions() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
  const isUser = user?.role === ROLES.USER
  const canManageProjects = isSuperAdmin
  const canAddCredentials = isSuperAdmin || isUser

  return { canManageProjects, canAddCredentials, isSuperAdmin, isUser }
}
