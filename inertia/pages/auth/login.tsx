import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { AuthShell } from '~/components/auth_shell'

export default function Login() {
  return (
    <AuthShell mode="login">
      <Head title="Connexion" />
      <div className="auth-heading">
        <p className="eyebrow">Heureux de vous revoir</p>
        <h1>Connectez-vous</h1>
        <p>Retrouvez vos magnets et vos liens dans votre espace BetterDebrid.</p>
      </div>

      <Form
        route="session.store"
        className="stack-form auth-form"
        toolname="betterdebrid.login_form"
        tooldescription="Prépare la connexion à BetterDebrid. L’utilisateur doit contrôler puis soumettre ses identifiants."
      >
        {({ errors, processing }) => (
          <>
            <div className="field-group">
              <label htmlFor="email">Adresse e-mail</label>
              <div className="input-with-icon">
                <Mail aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  maxLength={254}
                  autoFocus
                  autoComplete="username"
                  placeholder="vous@exemple.fr"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  toolparamdescription="Adresse e-mail du compte BetterDebrid."
                />
              </div>
              {errors.email && (
                <p className="field-error" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-with-icon">
                <LockKeyhole aria-hidden="true" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  maxLength={128}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  toolparamdescription="Mot de passe du compte BetterDebrid."
                />
              </div>
              {errors.password && (
                <p className="field-error" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="button button-accent button-wide button-large"
              disabled={processing}
            >
              {processing ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
              {processing ? 'Connexion…' : 'Accéder à mon espace'}
              {!processing && <ArrowRight aria-hidden="true" />}
            </button>
          </>
        )}
      </Form>
    </AuthShell>
  )
}
