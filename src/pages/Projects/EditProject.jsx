import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/projects?edit=${id}`, { replace: true })
  }, [id, navigate])

  return null
}

export default EditProject
