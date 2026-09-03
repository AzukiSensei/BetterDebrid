import { ErrorPage } from '~/components/error_page'

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Cette page s’est volatilisée."
      description="L’adresse n’existe plus ou n’a jamais existé. L’accueil reste le meilleur point de reprise."
    />
  )
}
