import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/components/notifications/ToastProvider'
import { projectService } from '@/services/projectService'
import { getErrorMessage } from '@/utils/errorMessage'

export function useProjectDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [credentials, setCredentials] = useState([])
  const [credMeta, setCredMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [credLoading, setCredLoading] = useState(true)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [credModal, setCredModal] = useState({ mode: null, row: null })
  const [credSubmitting, setCredSubmitting] = useState(false)
  const [deleteCred, setDeleteCred] = useState(null)
  const [deleteCredLoading, setDeleteCredLoading] = useState(false)
  const [deleteProject, setDeleteProject] = useState(false)
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState(null)
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false)

  const assignedIds = members.map((u) => u.id)

  const loadMembers = useCallback(async () => {
    const { items } = await projectService.listMembers(id, { per_page: 100 })
    setMembers(items)
  }, [id])

  const loadCredentials = useCallback(
    async (page = 1) => {
      setCredLoading(true)
      try {
        const { items, meta } = await projectService.listCredentials(id, { page })
        setCredentials(items)
        setCredMeta({
          current_page: meta.current_page,
          last_page: meta.last_page,
        })
      } catch (err) {
        setCredentials([])
        toast.error(getErrorMessage(err, 'Failed to load credentials.'))
      } finally {
        setCredLoading(false)
      }
    },
    [id, toast]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    projectService
      .get(id)
      .then((p) => {
        if (!cancelled) setProject(p)
      })
      .catch((err) => {
        if (!cancelled) {
          setProject(null)
          toast.error(getErrorMessage(err, 'Failed to load project.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    loadMembers().catch((err) => {
      toast.error(getErrorMessage(err, 'Failed to load members.'))
    })
    loadCredentials(1).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id, loadMembers, loadCredentials, toast])

  const handleAssign = async (userIds) => {
    setAssigning(true)
    try {
      await projectService.assignUsers(id, userIds)
      setAssignOpen(false)
      await loadMembers()
      const p = await projectService.get(id)
      setProject(p)
      toast.success('Members updated successfully.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to assign users.'))
    } finally {
      setAssigning(false)
    }
  }

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return
    setRemoveMemberLoading(true)
    try {
      await projectService.removeMember(id, memberToRemove.id)
      setMemberToRemove(null)
      await loadMembers()
      const p = await projectService.get(id)
      setProject(p)
      toast.success('Member removed successfully.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to remove member.'))
    } finally {
      setRemoveMemberLoading(false)
    }
  }

  const saveCredential = async (payload) => {
    setCredSubmitting(true)
    try {
      const body = payload instanceof FormData ? payload : { ...payload }
      if (!(body instanceof FormData) && !body.password) delete body.password
      if (credModal.mode === 'create') {
        await projectService.createCredential(id, body)
        toast.success('Credential added successfully.')
      } else if (credModal.row) {
        await projectService.updateCredential(credModal.row.id, body)
        toast.success('Credential updated successfully.')
      }
      setCredModal({ mode: null, row: null })
      await loadCredentials(credMeta.current_page)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save credential.'))
    } finally {
      setCredSubmitting(false)
    }
  }

  const confirmDeleteCred = async () => {
    if (!deleteCred) return
    setDeleteCredLoading(true)
    try {
      await projectService.deleteCredential(deleteCred.id)
      setDeleteCred(null)
      await loadCredentials(credMeta.current_page)
      toast.success('Credential deleted successfully.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete credential.'))
    } finally {
      setDeleteCredLoading(false)
    }
  }

  const confirmDeleteProject = async () => {
    setDeleteProjectLoading(true)
    try {
      await projectService.remove(id)
      toast.success('Project deleted successfully.')
      navigate('/projects', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete project.'))
    } finally {
      setDeleteProjectLoading(false)
      setDeleteProject(false)
    }
  }

  return {
    id,
    navigate,
    project,
    members,
    credentials,
    credMeta,
    loading,
    credLoading,
    assignOpen,
    setAssignOpen,
    assigning,
    credModal,
    setCredModal,
    credSubmitting,
    saveCredential,
    deleteCred,
    setDeleteCred,
    deleteCredLoading,
    confirmDeleteCred,
    deleteProject,
    setDeleteProject,
    deleteProjectLoading,
    confirmDeleteProject,
    memberToRemove,
    setMemberToRemove,
    removeMemberLoading,
    confirmRemoveMember,
    handleAssign,
    assignedIds,
  }
}
