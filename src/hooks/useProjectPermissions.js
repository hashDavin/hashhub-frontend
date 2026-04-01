import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

export function useProjectPermissions() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
  const isTeamMember = user?.role === ROLES.TEAM_MEMBER
  const canManageProjects = isSuperAdmin
  const canAddCredentials = isSuperAdmin || isTeamMember

  return { canManageProjects, canAddCredentials, isSuperAdmin, isTeamMember }
}
