import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { AppShell } from '~/components/app_shell'
import { formatDate } from '~/utils/format'
import type { InertiaProps } from '~/types'

interface SettingsProps extends InertiaProps {
  connection: {
    username: string | null
    accountEmail: string | null
    isPremium: boolean
    premiumUntil: string | null
    lastSyncedAt: string | null
  } | null
  pinSession: {
    pin: string
    check: string
    expires_in: number
    user_url: string
    base_url: string
  } | null
  pinPending: boolean
}

export default function Settings({ user, connection, pinSession, pinPending }: SettingsProps) {
  return (
    <AppShell user={user!} eyebrow="Compte" title="Réglages">
      <Head title="Réglages" />
      <div className="settings-grid">
        <section className="settings-main" aria-labelledby="alldebrid-title">
          <div className="settings-section-heading">
            <span className="settings-icon">
              <KeyRound aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">Intégration</p>
              <h2 id="alldebrid-title">Connexion AllDebrid</h2>
              <p>
                Autorisez BetterDebrid avec le flux PIN officiel, sans partager votre mot de passe.
              </p>
            </div>
          </div>

          {connection ? (
            <div className="connection-card connected">
              <div className="connection-topline">
                <span className="connection-state">
                  <CheckCircle2 aria-hidden="true" /> Compte connecté
                </span>
                <span
                  className={connection.isPremium ? 'status-badge ready' : 'status-badge working'}
                >
                  {connection.isPremium ? 'Premium' : 'Standard'}
                </span>
              </div>
              <dl className="connection-details">
                <div>
                  <dt>Compte</dt>
                  <dd>{connection.username || '—'}</dd>
                </div>
                <div>
                  <dt>E-mail AllDebrid</dt>
                  <dd>{connection.accountEmail || '—'}</dd>
                </div>
                <div>
                  <dt>Premium jusqu’au</dt>
                  <dd>{formatDate(connection.premiumUntil)}</dd>
                </div>
                <div>
                  <dt>Dernière synchro</dt>
                  <dd>{formatDate(connection.lastSyncedAt, true)}</dd>
                </div>
              </dl>
              <Form
                route="alldebrid.disconnect"
                toolname="betterdebrid.disconnect_alldebrid_form"
                tooldescription="Prépare la suppression de la clé AllDebrid chiffrée. Une confirmation utilisateur est requise."
                onSubmit={(event) => {
                  if (!window.confirm('Déconnecter AllDebrid et supprimer la clé chiffrée ?'))
                    event.preventDefault()
                }}
              >
                {({ processing }) => (
                  <button
                    type="submit"
                    className="button button-danger-ghost"
                    disabled={processing}
                  >
                    {processing ? (
                      <LoaderCircle className="spin" aria-hidden="true" />
                    ) : (
                      <Trash2 aria-hidden="true" />
                    )}
                    Déconnecter AllDebrid
                  </button>
                )}
              </Form>
            </div>
          ) : pinSession ? (
            <div className="pin-card">
              <div className="pin-instructions">
                <span className="step-chip">1</span>
                <div>
                  <strong>Validez ce code sur AllDebrid</strong>
                  <p>
                    Le code expire dans environ {Math.max(1, Math.ceil(pinSession.expires_in / 60))}{' '}
                    minute(s).
                  </p>
                </div>
              </div>
              <div
                className="pin-code"
                aria-label={`Code PIN ${pinSession.pin.split('').join(' ')}`}
              >
                {pinSession.pin}
              </div>
              <a
                href={pinSession.user_url}
                target="_blank"
                rel="noreferrer"
                className="button button-dark button-wide"
              >
                Ouvrir AllDebrid <ExternalLink aria-hidden="true" />
              </a>
              <div className="pin-instructions second">
                <span className="step-chip">2</span>
                <div>
                  <strong>Revenez puis vérifiez</strong>
                  <p>
                    {pinPending
                      ? 'Le code n’est pas encore validé.'
                      : 'Après validation, terminez la connexion ici.'}
                  </p>
                </div>
              </div>
              <Form
                route="alldebrid.connect"
                toolname="betterdebrid.check_alldebrid_pin_form"
                tooldescription="Vérifie un code PIN AllDebrid déjà validé par l’utilisateur."
              >
                {({ processing }) => (
                  <>
                    <input type="hidden" name="pin" value={pinSession.pin} />
                    <input type="hidden" name="check" value={pinSession.check} />
                    <button
                      type="submit"
                      className="button button-accent button-wide"
                      disabled={processing}
                    >
                      {processing ? (
                        <LoaderCircle className="spin" aria-hidden="true" />
                      ) : (
                        <RefreshCw aria-hidden="true" />
                      )}
                      {processing ? 'Vérification…' : 'J’ai validé, vérifier'}
                    </button>
                  </>
                )}
              </Form>
            </div>
          ) : (
            <div className="connection-card disconnected">
              <div className="disconnected-copy">
                <span className="settings-icon muted">
                  <LockKeyhole aria-hidden="true" />
                </span>
                <div>
                  <strong>Aucun compte connecté</strong>
                  <p>
                    Une clé d’application dédiée sera créée par AllDebrid puis chiffrée en base.
                  </p>
                </div>
              </div>
              <Form
                route="alldebrid.pin.create"
                toolname="betterdebrid.start_alldebrid_pin_form"
                tooldescription="Démarre le flux PIN officiel pour connecter un compte AllDebrid."
              >
                {({ processing }) => (
                  <button type="submit" className="button button-accent" disabled={processing}>
                    {processing ? (
                      <LoaderCircle className="spin" aria-hidden="true" />
                    ) : (
                      <KeyRound aria-hidden="true" />
                    )}
                    {processing ? 'Création du code…' : 'Connecter AllDebrid'}
                  </button>
                )}
              </Form>
            </div>
          )}
        </section>

        <aside className="settings-aside">
          <section className="settings-mini-card">
            <ShieldCheck aria-hidden="true" />
            <div>
              <h2>Protection des secrets</h2>
              <p>Clé API chiffrée en AES-256-GCM, cookies HttpOnly, CSRF et HTTPS en production.</p>
            </div>
          </section>
          <section className="settings-mini-card">
            <Bot aria-hidden="true" />
            <div>
              <h2>WebMCP actif</h2>
              <p>
                Les outils compatibles sont enregistrés uniquement après authentification, dans cet
                onglet et sur cette origine.
              </p>
            </div>
          </section>
        </aside>

        <section className="settings-main account-settings" aria-labelledby="local-account-title">
          <div className="settings-section-heading compact">
            <span className="settings-icon">
              <LockKeyhole aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">BetterDebrid</p>
              <h2 id="local-account-title">Compte local</h2>
            </div>
          </div>
          <dl className="connection-details inline">
            <div>
              <dt>Nom</dt>
              <dd>{user?.fullName || 'Non renseigné'}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  )
}
