import { useState, useEffect } from 'react'
import { messagesService } from '../services/messagesService'

export function useUnreadCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const n = await messagesService.getUnreadCount()
        if (!cancelled) setCount(n)
      } catch {
        // silent
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return count
}
