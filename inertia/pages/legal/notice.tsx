import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft } from 'lucide-react'
import { MarketingHeader } from '~/components/marketing_header'
import type { InertiaProps } from '~/types'

export default function Notice({ user }: InertiaProps) {
  return (
    <div className="marketing-page legal-page">
      <Head title="Mentions légales" />
      <MarketingHeader authenticated={Boolean(user)} />
      <main id="main-content" tabIndex={-1}>
        <article className="legal-article">
          <Link href="/" className="back-link">
            <ArrowLeft aria-hidden="true" /> Retour à l’accueil
          </Link>
          <p className="eyebrow">BetterDebrid</p>
          <h1>Mentions légales</h1>
          <p className="legal-lead">
            Informations relatives à l’instance BetterDebrid accessible à l’adresse better.azks.fr.
          </p>

          <section>
            <h2>Édition et contact</h2>
            <p>
              BetterDebrid est un logiciel open source exploité sur cette instance par son
              administrateur. Le contact public et le suivi technique sont assurés via le dépôt
              GitHub du projet.
            </p>
            <a
              href="https://github.com/AzukiSensei/BetterDebrid"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Dépôt public BetterDebrid
            </a>
          </section>

          <section>
            <h2>Hébergement</h2>
            <p>
              L’application est déployée sur une infrastructure administrée avec Dokploy. Les
              informations d’identification contractuelle de l’hébergeur de l’infrastructure peuvent
              être demandées à l’administrateur de l’instance.
            </p>
          </section>

          <section>
            <h2>Indépendance</h2>
            <p>
              BetterDebrid est un projet indépendant. Il n’est ni édité, ni approuvé, ni affilié à
              AllDebrid. “AllDebrid” et les marques associées restent la propriété de leurs
              titulaires respectifs.
            </p>
          </section>

          <section>
            <h2>Usage autorisé</h2>
            <p>
              L’utilisateur reste responsable des URLs, magnets et fichiers torrent qu’il soumet. Le
              service doit être utilisé uniquement pour des contenus auxquels l’utilisateur est
              autorisé à accéder, dans le respect des lois applicables et des conditions
              d’AllDebrid.
            </p>
          </section>

          <section>
            <h2>Licence</h2>
            <p>
              Le code source BetterDebrid est distribué sous licence MIT. Les services tiers et
              leurs API restent soumis à leurs propres conditions.
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
