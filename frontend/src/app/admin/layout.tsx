'use client'

// import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LayoutShell from '@/components/layout/LayoutShell'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  )
}
