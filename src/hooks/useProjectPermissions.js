import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

export function useProjectPermissions() {
  const { user } = useAuth()
  const canManageProjects = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN

  return { canManageProjects }
}
