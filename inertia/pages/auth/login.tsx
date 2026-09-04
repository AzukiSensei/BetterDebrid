import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import {
  ArrowRightIcon as ArrowRight,
  LoaderCircleIcon as LoaderCircle,
  LockIcon as LockKeyhole,
  MailIcon as Mail,
} from '@animateicons/react/lucide'
import { useState } from 'react'
import { AuthShell } from '~/components/auth_shell'
import { PasswordVisibilityButton } from '~/components/password_visibility_button'
import { TurnstileWidget } from '~/components/turnstile_widget'
import type { InertiaProps } from '~/types'

export default function Login({ turnstileSiteKey }: InertiaProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)

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
              <div className="input-with-icon input-with-action">
                <LockKeyhole aria-hidden="true" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  maxLength={128}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  toolparamdescription="Mot de passe du compte BetterDebrid."
                />
                <PasswordVisibilityButton
                  controls="password"
                  visible={passwordVisible}
                  onToggle={() => setPasswordVisible((visible) => !visible)}
                />
              </div>
              {errors.password && (
                <p className="field-error" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <label className="remember-field">
              <input
                type="checkbox"
                name="remember"
                value="true"
                toolparamdescription="Conserver la connexion BetterDebrid pendant 30 jours sur cet appareil."
              />
              <span>
                <strong>Rester connecté pendant 30 jours</strong>
                Uniquement sur un appareil personnel.
              </span>
            </label>

            {turnstileSiteKey ? (
              <TurnstileWidget siteKey={turnstileSiteKey} action="login" />
            ) : (
              <p className="field-error" role="alert">
                La protection anti-robot est temporairement indisponible.
              </p>
            )}

            <button
              type="submit"
              className="button button-accent button-wide button-large"
              disabled={processing || !turnstileSiteKey}
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
