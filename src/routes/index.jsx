import { lazy, Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout/AuthLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import PageLoader from '@/components/common/PageLoader'

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'))
const ProjectList = lazy(() => import('@/pages/Projects/ProjectList'))
const CreateProject = lazy(() => import('@/pages/Projects/CreateProject'))
const EditProject = lazy(() => import('@/pages/Projects/EditProject'))
const ProjectDetails = lazy(() => import('@/pages/Projects/ProjectDetails'))
const UsersPage = lazy(() => import('@/pages/Users/UsersPage'))
const AssignmentsPage = lazy(() => import('@/pages/Assignments/AssignmentsPage'))
const MyProjectsPage = lazy(() => import('@/pages/MyProjects/MyProjectsPage'))
const ActivityLogsPage = lazy(() => import('@/pages/ActivityLogs/ActivityLogsPage'))
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'))

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
        handle: { title: 'Login' },
      },
    ],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage />, handle: { title: 'Dashboard' } },
      { path: 'projects/new', element: <CreateProject />, handle: { title: 'New project' } },
      { path: 'projects/:id/edit', element: <EditProject />, handle: { title: 'Edit project' } },
      { path: 'projects/:id', element: <ProjectDetails />, handle: { title: 'Project' } },
      { path: 'projects', element: <ProjectList />, handle: { title: 'Projects' } },
      { path: 'users', element: <UsersPage />, handle: { title: 'Users' } },
      { path: 'assignments', element: <AssignmentsPage />, handle: { title: 'Assignments' } },
      { path: 'my-projects', element: <MyProjectsPage />, handle: { title: 'My Projects' } },
      { path: 'activity-logs', element: <ActivityLogsPage />, handle: { title: 'Activity Logs' } },
      { path: 'settings', element: <SettingsPage />, handle: { title: 'Settings' } },
      { path: 'profile', element: <ProfilePage />, handle: { title: 'Profile' } },
    ],
  },
])

export default router
