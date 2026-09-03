import { Link } from '@adonisjs/inertia/react'
import { ArrowUpRight } from 'lucide-react'
import { BrandMark } from './brand_mark'

export function MarketingHeader({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <header className="marketing-header">
      <div className="marketing-header-inner">
        <BrandMark />
        <nav aria-label="Navigation principale" className="marketing-nav">
          <a href="/#fonctionnalites">Fonctionnalités</a>
          <a href="/#securite">Sécurité</a>
          {authenticated ? (
            <Link href="/app" className="button button-dark button-compact">
              Ouvrir l’espace <ArrowUpRight aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="nav-login">
                Se connecter
              </Link>
              <Link href="/inscription" className="button button-dark button-compact">
                Créer un compte <ArrowUpRight aria-hidden="true" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
