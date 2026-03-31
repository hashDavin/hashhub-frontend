import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  User,
  Users,
  UserSquare2,
} from 'lucide-react'
import { ROLES } from '@/constants/roles'

const allRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER]
const adminOnly = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

const sidebarConfig = [
  {
    title: 'Dashboard',
    items: [{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: allRoles }],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', path: '/users', icon: Users, roles: adminOnly },
      { label: 'Projects', path: '/projects', icon: FolderKanban, roles: allRoles },
      { label: 'Assignments', path: '/assignments', icon: ListChecks, roles: adminOnly },
    ],
  },
  {
    title: 'Projects',
    items: [
      { label: 'All Projects', path: '/projects', icon: FolderKanban, roles: allRoles },
      { label: 'My Projects', path: '/my-projects', icon: UserSquare2, roles: allRoles },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Activity Logs', path: '/activity-logs', icon: Activity, roles: adminOnly },
      { label: 'Settings', path: '/settings', icon: Settings, roles: adminOnly },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', path: '/profile', icon: User, roles: allRoles },
      { label: 'Logout', path: '/login', icon: LogOut, roles: allRoles },
    ],
  },
]

export default sidebarConfig
