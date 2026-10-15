import Link from 'next/link'
import { workspaceNav } from '../navigation/WorkspaceNav'

export default function LoginPage() {
  return (
    <nav>
      {workspaceNav.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
      <Link href="/">back</Link>
    </nav>
  )
}
