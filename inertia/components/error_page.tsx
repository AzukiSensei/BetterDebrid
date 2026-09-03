import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ArrowLeft, Home } from 'lucide-react'
import { BrandMark } from '~/components/brand_mark'

export function ErrorPage({
  code,
  title,
  description,
}: {
  code: string
  title: string
  description: string
}) {
  return (
    <div className="error-page-shell">
      <Head title={`${code} · ${title}`} />
      <header className="error-page-header">
        <BrandMark />
      </header>
      <main id="main-content" className="error-page" tabIndex={-1}>
        <p className="error-code" aria-hidden="true">
          {code}
        </p>
        <p className="eyebrow">Une bifurcation inattendue</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="error-page-actions">
          <Link href="/" className="button button-accent button-large">
            <Home aria-hidden="true" /> Revenir à l’accueil
          </Link>
          <button className="button button-secondary button-large" onClick={() => history.back()}>
            <ArrowLeft aria-hidden="true" /> Page précédente
          </button>
        </div>
      </main>
    </div>
  )
}
