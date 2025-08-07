'use client'

// import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily bypass ProtectedRoute for development
  return (
    <>
      {children}
    </>
  )
}