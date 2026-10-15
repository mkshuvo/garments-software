import type { ReactNode } from 'react'
import { ApplicationShell } from '@/components/ApplicationShell'

export default function AdminLayout({ children }: { readonly children: ReactNode }) {
  return <ApplicationShell>{children}</ApplicationShell>
}
