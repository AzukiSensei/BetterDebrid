import { Link } from '@adonisjs/inertia/react'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="BetterDebrid, accueil">
      <span className="brand-symbol" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand-wordmark">
          Better<span>Debrid</span>
        </span>
      )}
    </Link>
  )
}
