import { useCallback, useEffect, useRef, useState } from 'react'

export function useBackGuard(enabled = true) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const allowExitRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    window.history.pushState({ guard: true }, '', window.location.href)

    const onPop = () => {
      if (allowExitRef.current) {
        window.history.back()
        return
      }

      window.history.pushState({ guard: true }, '', window.location.href)
      setConfirmOpen(true)
    }

    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [enabled])

  const requestCancel = useCallback(() => {
    setConfirmOpen(false)
  }, [])

  const requestConfirm = useCallback(() => {
    setConfirmOpen(false)
    allowExitRef.current = true
    window.history.back()
  }, [])

  return { confirmOpen, requestCancel, requestConfirm }
}