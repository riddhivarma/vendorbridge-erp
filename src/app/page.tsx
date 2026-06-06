'use client'

import { useAppStore } from '@/lib/store'
import LoginView from '@/components/views/LoginView'
import AppShell from '@/components/AppShell'
import { useEffect } from 'react'

export default function Home() {
  const { currentUser } = useAppStore()

  // Persist user session in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vendorbridge_user')
    if (stored && !currentUser) {
      try {
        const user = JSON.parse(stored)
        useAppStore.getState().setUser(user)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vendorbridge_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('vendorbridge_user')
    }
  }, [currentUser])

  if (!currentUser) {
    return <LoginView />
  }

  return <AppShell />
}
