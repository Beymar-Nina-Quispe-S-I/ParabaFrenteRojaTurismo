import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState('')
  const [kind, setKind] = useState('info')
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  const toast = useCallback((message, k = 'info') => {
    setMsg(message)
    setKind(k)
    setShow(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setShow(false), 3500)
  }, [])

  return { toast, msg, kind, show }
}