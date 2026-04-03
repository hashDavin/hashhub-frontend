import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { resetGlobalLoader, startGlobalLoader, stopGlobalLoader } from '@/store/globalLoaderSlice'

/**
 * Programmatic global loader (in addition to axios auto-tracking).
 * Use runAsync() for arbitrary async work; always pairs start/stop.
 */
export function useGlobalLoader() {
  const dispatch = useDispatch()

  const show = useCallback(() => {
    dispatch(startGlobalLoader())
  }, [dispatch])

  const hide = useCallback(() => {
    dispatch(stopGlobalLoader())
  }, [dispatch])

  const reset = useCallback(() => {
    dispatch(resetGlobalLoader())
  }, [dispatch])

  const runAsync = useCallback(
    async (fn) => {
      dispatch(startGlobalLoader())
      try {
        return await fn()
      } finally {
        dispatch(stopGlobalLoader())
      }
    },
    [dispatch]
  )

  return { show, hide, reset, runAsync }
}
