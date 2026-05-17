'use client'
import { create } from 'zustand'
import { useEffect } from 'react'

interface ToastStore {
  message: string
  show: boolean
  showToast: (msg: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  message: '',
  show: false,
  showToast: (msg) => {
    set({ message: msg, show: true })
    setTimeout(() => set({ show: false }), 3000)
  },
}))

export function Toast() {
  const { message, show } = useToast()
  return (
    <div style={{
      position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
      background: 'var(--blue)', color: '#fff',
      padding: '14px 22px', borderRadius: 'var(--radius-sm)',
      fontSize: 14, fontWeight: 500,
      transform: show ? 'translateY(0)' : 'translateY(100px)',
      opacity: show ? 1 : 0,
      transition: 'var(--transition)',
      boxShadow: 'var(--shadow-lg)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}
