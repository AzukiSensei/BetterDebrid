import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft } from 'lucide-react'
import { MarketingHeader } from '~/components/marketing_header'
import type { InertiaProps } from '~/types'

export default function Privacy({ user }: InertiaProps) {
  return (
    <div className="marketing-page legal-page">
      <Head title="Confidentialité" />
      <MarketingHeader authenticated={Boolean(user)} />
      <main id="main-content" tabIndex={-1}>
        <article className="legal-article">
          <Link href="/" className="back-link">
            <ArrowLeft aria-hidden="true" /> Retour à l’accueil
          </Link>
          <p className="eyebrow">Dernière mise à jour · 3 septembre 2026</p>
          <h1>Politique de confidentialité</h1>
          <p className="legal-lead">
            BetterDebrid est une interface indépendante pour AllDebrid. Cette page décrit les
            données nécessaires au fonctionnement de l’instance hébergée sur better.azks.fr.
          </p>

          <section>
            <h2>Données enregistrées</h2>
            <p>
              Le service conserve l’adresse e-mail, le nom affiché et le mot de passe BetterDebrid
              sous forme hachée. Après connexion par PIN, la clé d’API AllDebrid est chiffrée en
              AES-256-GCM avant stockage dans PostgreSQL.
            </p>
            <p>
              Un journal local minimal conserve le type d’action, son état, un libellé, la date et
              quelques métadonnées techniques comme la taille ou l’hébergeur. Les mots de passe de
              liens, clés en clair et contenus téléchargés ne sont pas enregistrés.
            </p>
          </section>

          <section>
            <h2>Utilisation et transmission</h2>
            <p>
              Les données servent uniquement à authentifier l’utilisateur, appeler l’API AllDebrid
              en son nom et afficher son activité. Les liens et magnets saisis sont transmis à
              AllDebrid pour exécuter la demande. Ils sont alors soumis à la politique d’AllDebrid.
            </p>
          </section>

          <section>
            <h2>Cookies et sécurité</h2>
            <p>
              Un cookie de session HttpOnly, Secure en production et SameSite=Lax maintient la
              connexion. Un cookie XSRF protège les actions sensibles. Le service n’intègre aucun
              traceur publicitaire ni outil d’analytics tiers.
            </p>
          </section>

          <section>
            <h2>WebMCP</h2>
            <p>
              Un outil de navigation public est disponible dans les navigateurs compatibles. Les
              outils liés au compte ne sont enregistrés qu’après authentification et restent limités
              à la même origine. Les actions susceptibles de consommer un quota exigent un champ de
              confirmation explicite. Les autres navigateurs les ignorent simplement.
            </p>
          </section>

          <section>
            <h2>Contrôle de vos données</h2>
            <p>
              Vous pouvez supprimer immédiatement la clé AllDebrid chiffrée depuis les réglages.
              Pour demander l’accès ou la suppression du compte local, contactez l’administrateur de
              l’instance via le dépôt public.
            </p>
            <a
              href="https://github.com/AzukiSensei/BetterDebrid/issues"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Contacter via GitHub
            </a>
          </section>
        </article>
      </main>
    </div>
  )
}
