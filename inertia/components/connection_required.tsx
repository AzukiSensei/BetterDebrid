import { Link } from '@adonisjs/inertia/react'
import { Cable, ChevronRight } from 'lucide-react'

export function ConnectionRequired() {
  return (
    <section className="empty-panel" aria-labelledby="connection-required-title">
      <div className="empty-icon">
        <Cable aria-hidden="true" />
      </div>
      <p className="eyebrow">Première étape</p>
      <h2 id="connection-required-title">Connectez votre compte AllDebrid</h2>
      <p>
        BetterDebrid utilise le flux PIN officiel. Votre mot de passe AllDebrid ne transite jamais
        par cette application.
      </p>
      <Link href="/app/reglages" className="button button-accent">
        Configurer la connexion <ChevronRight aria-hidden="true" />
      </Link>
    </section>
  )
}
