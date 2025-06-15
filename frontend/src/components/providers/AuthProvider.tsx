'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    // Check authentication status on mount
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}
