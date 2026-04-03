import {
  Activity,
  BriefcaseBusiness,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  UserSquare2,
} from 'lucide-react'
import { ROLES } from '@/constants/roles'

const allRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER]
const adminOnly = [ROLES.SUPER_ADMIN, ROLES.ADMIN]
const superAdminOnly = [ROLES.SUPER_ADMIN]

const sidebarConfig = [
  {
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: allRoles }],
  },
  {
    items: [   { label: 'Team Management', path: '/employees', icon: Users, roles: adminOnly },],
  },
  {
    items: [ { label: 'Project Management', path: '/projects', icon: FolderKanban, roles: allRoles },],
  },

  {
    items: [
      { label: 'Settings', path: '/settings', icon: Settings, roles: superAdminOnly },
    ],
  },
]

export default sidebarConfig
