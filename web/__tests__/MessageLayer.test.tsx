import { render, screen } from '@testing-library/react'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { EmptyState } from '@/components/EmptyState'
import { PageHeading } from '@/components/PageHeading'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { ErrorState } from '@/components/ErrorState'
import type { ReactNode } from 'react'

function withLocale(locale: 'en' | 'bn', children: ReactNode) {
  return render(<LocaleProvider initialLocale={locale}>{children}</LocaleProvider>)
}

describe('L17 message layer in the rendered tree', () => {
  it('shows English copy when the session locale is en', () => {
    withLocale('en', <PageHeading messageKey="dashboard.title" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard')
  })

  it('shows Bangla copy for the same key without a code change', () => {
    withLocale('bn', <PageHeading messageKey="dashboard.title" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ড্যাশবোর্ড')
  })

  it('states the empty case in the active language', () => {
    withLocale('bn', <EmptyState titleKey="common.emptyTitle" bodyKey="common.emptyBody" />)

    expect(screen.getByText('এখনো কোনো তথ্য নেই')).toBeInTheDocument()
  })

  it('renders a failure instead of a blank region', () => {
    withLocale('en', <ErrorState messageKey="errors.network" />)

    expect(screen.getByRole('alert')).toHaveTextContent('The server could not be reached.')
  })

  it('offers both scripts on the language control', () => {
    withLocale('en', <LocaleSwitcher />)

    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'বাংলা' })).toBeInTheDocument()
  })
})
