import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  ArrowRightIcon as ArrowRight,
  LoaderCircleIcon as LoaderCircle,
  LockIcon as LockKeyhole,
  MailIcon as Mail,
  UserRoundIcon as UserRound,
} from '@animateicons/react/lucide'
import { useState } from 'react'
import { AuthShell } from '~/components/auth_shell'
import { PasswordVisibilityButton } from '~/components/password_visibility_button'
import { TurnstileWidget } from '~/components/turnstile_widget'
import type { InertiaProps } from '~/types'

export default function Signup({ turnstileSiteKey }: InertiaProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmationVisible, setConfirmationVisible] = useState(false)

  return (
    <AuthShell mode="signup">
      <Head title="Créer un compte" />
      <div className="auth-heading">
        <p className="eyebrow">Bienvenue</p>
        <h1>Créez votre espace</h1>
        <p>Quelques secondes suffisent. Vous connecterez AllDebrid à l’étape suivante.</p>
      </div>

      <Form
        route="new_account.store"
        className="stack-form auth-form"
        toolname="betterdebrid.signup_form"
        tooldescription="Prépare la création d’un compte BetterDebrid. L’utilisateur doit contrôler puis soumettre ses informations."
      >
        {({ errors, processing }) => (
          <>
            <div className="field-group">
              <label htmlFor="fullName">Nom affiché</label>
              <div className="input-with-icon">
                <UserRound aria-hidden="true" />
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  required
                  maxLength={100}
                  autoFocus
                  autoComplete="name"
                  placeholder="Votre nom"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? 'full-name-error' : undefined}
                  toolparamdescription="Nom à afficher dans l’interface BetterDebrid."
                />
              </div>
              {errors.fullName && (
                <p className="field-error" id="full-name-error">
                  {errors.fullName}
                </p>
              )}
            </div>

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
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  toolparamdescription="Adresse e-mail du nouveau compte BetterDebrid."
                />
              </div>
              {errors.email && (
                <p className="field-error" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="auth-form-columns">
              <div className="field-group">
                <label htmlFor="password">Mot de passe</label>
                <div className="input-with-icon input-with-action">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    id="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    toolparamdescription="Mot de passe du nouveau compte, 8 caractères minimum."
                  />
                  <PasswordVisibilityButton
                    controls="password"
                    visible={passwordVisible}
                    onToggle={() => setPasswordVisible((visible) => !visible)}
                  />
                </div>
                {errors.password ? (
                  <p className="field-error" id="password-error">
                    {errors.password}
                  </p>
                ) : (
                  <p className="field-hint" id="password-hint">
                    8 caractères minimum
                  </p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="passwordConfirmation">Confirmation</label>
                <div className="input-with-icon input-with-action">
                  <LockKeyhole aria-hidden="true" />
                  <input
                    type={confirmationVisible ? 'text' : 'password'}
                    name="passwordConfirmation"
                    id="passwordConfirmation"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.passwordConfirmation)}
                    aria-describedby={
                      errors.passwordConfirmation ? 'confirmation-error' : undefined
                    }
                    toolparamdescription="Répétition exacte du mot de passe."
                  />
                  <PasswordVisibilityButton
                    controls="passwordConfirmation"
                    visible={confirmationVisible}
                    onToggle={() => setConfirmationVisible((visible) => !visible)}
                  />
                </div>
                {errors.passwordConfirmation && (
                  <p className="field-error" id="confirmation-error">
                    {errors.passwordConfirmation}
                  </p>
                )}
              </div>
            </div>

            <label className="consent-field">
              <input
                type="checkbox"
                name="terms"
                required
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? 'terms-error' : undefined}
                toolparamdescription="Acceptation obligatoire de la politique de confidentialité et des conditions d’utilisation."
              />
              <span>
                J’accepte la <Link href="/confidentialite">politique de confidentialité</Link> et
                confirme utiliser le service dans le respect des droits applicables.
              </span>
            </label>
            {errors.terms && (
              <p className="field-error" id="terms-error" role="alert">
                {errors.terms}
              </p>
            )}

            {turnstileSiteKey ? (
              <TurnstileWidget siteKey={turnstileSiteKey} action="signup" />
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
              {processing ? 'Création…' : 'Créer mon espace'}
              {!processing && <ArrowRight aria-hidden="true" />}
            </button>
          </>
        )}
      </Form>
    </AuthShell>
  )
}
