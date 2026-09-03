import { Form, Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { ArrowDownToLine, Clock3, Gauge, LogOut, Magnet, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { BrandMark } from './brand_mark'

const items = [
  { href: '/app', label: 'Vue d’ensemble', icon: Gauge, exact: true },
  { href: '/app/debrider', label: 'Débrider', icon: ArrowDownToLine },
  { href: '/app/magnets', label: 'Magnets', icon: Magnet },
  { href: '/app/historique', label: 'Historique', icon: Clock3 },
  { href: '/app/reglages', label: 'Réglages', icon: Settings },
]

interface AppShellProps {
  children: ReactNode
  title: string
  eyebrow?: string
  action?: ReactNode
  user: { fullName?: string | null; email: string; initials: string }
}

export function AppShell({ children, title, eyebrow, action, user }: AppShellProps) {
  const { url } = usePage()

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <BrandMark />
        <nav aria-label="Navigation de l’espace" className="sidebar-nav">
          {items.map((item) => {
            const active = item.exact ? url === item.href : url.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'sidebar-link is-active' : 'sidebar-link'}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-account">
          <div className="avatar" aria-hidden="true">
            {user.initials}
          </div>
          <div className="sidebar-account-copy">
            <strong>{user.fullName || user.email.split('@')[0]}</strong>
            <span>{user.email}</span>
          </div>
          <Form route="session.destroy">
            <button type="submit" className="icon-button inverse" aria-label="Se déconnecter">
              <LogOut aria-hidden="true" />
            </button>
          </Form>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="workspace-header">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
          <div className="workspace-action">{action}</div>
        </header>
        <main id="main-content" className="workspace-main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Navigation mobile">
        {items.map((item) => {
          const active = item.exact ? url === item.href : url.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'mobile-nav-link is-active' : 'mobile-nav-link'}
              aria-current={active ? 'page' : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{item.label.replace('Vue d’ensemble', 'Accueil')}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
