import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { messagesService } from '../services/messagesService'
import { useAuthStore } from '../store/authStore'
import { Message } from '../types'

export function useMessages(bookingId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const optimisticIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const data = await messagesService.getBookingMessages(bookingId)
        if (!cancelled) setMessages(data)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => {
            if (optimisticIds.current.has(msg.id)) return prev
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setMessages((prev) => prev.filter((m) => m.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      if (!bookingId) return
      const tempId = `optimistic_${Date.now()}`
      const optimistic: Message = {
        id: tempId,
        booking_id: bookingId,
        sender_id: user?.id ?? '',
        receiver_id: receiverId,
        content,
        is_read: false,
        sent_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      try {
        const sent = await messagesService.sendMessage(bookingId, receiverId, content)
        optimisticIds.current.add(sent.id)
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)))
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
      }
    },
    [bookingId, user?.id]
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      try {
        await messagesService.deleteMessage(messageId)
      } catch {
        const data = await messagesService.getBookingMessages(bookingId!)
        setMessages(data)
      }
    },
    [bookingId]
  )

  return { messages, isLoading, sendMessage, deleteMessage }
}
