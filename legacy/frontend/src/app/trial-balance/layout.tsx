'use client'

import LayoutShell from '@/components/layout/LayoutShell'

export default function TrialBalanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LayoutShell bgColor="#0B1437">
            {children}
        </LayoutShell>
    )
}
