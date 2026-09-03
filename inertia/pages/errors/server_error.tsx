import { ErrorPage } from '~/components/error_page'

export default function ServerError() {
  return (
    <ErrorPage
      code="500"
      title="Le serveur reprend son souffle."
      description="Une erreur inattendue empêche cette page de répondre. Réessayez dans un instant."
    />
  )
}
