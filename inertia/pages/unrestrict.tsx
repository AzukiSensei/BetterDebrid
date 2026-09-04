import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  CheckIcon as Check,
  ClockIcon as Clock3,
  CopyIcon as Copy,
  DownloadIcon as ArrowDownToLine,
  ExternalLinkIcon as ExternalLink,
  HeadphonesIcon,
  KeyRoundIcon as KeyRound,
  LinkIcon as Link2,
  LoaderCircleIcon as LoaderCircle,
  TriangleAlertIcon as TriangleAlert,
  VideoIcon as Film,
  VideoIcon,
} from '@animateicons/react/lucide'
import { useState } from 'react'
import { AppShell } from '~/components/app_shell'
import { ConnectionRequired } from '~/components/connection_required'
import { formatBytes } from '~/utils/format'
import type { InertiaProps } from '~/types'

type UnlockResult = {
  link?: string
  filename: string
  filesize?: number
  host?: string
  id?: string
  delayed?: number
  timeLeft?: number
  mediaToken?: string
  mediaKind?: 'video' | 'audio'
  streams?: Array<{
    id: string
    ext?: string
    quality?: string | number
    filesize?: number
    name?: string
  }>
}

interface UnrestrictProps extends InertiaProps {
  connected: boolean
  result: UnlockResult | null
  error: string | null
  submittedLink: string | null
}

export default function Unrestrict({
  user,
  connected,
  result,
  error,
  submittedLink,
}: UnrestrictProps) {
  return (
    <AppShell user={user!} eyebrow="Outil" title="Débrider un lien">
      <Head title="Débrider un lien" />
      {!connected ? (
        <ConnectionRequired />
      ) : (
        <div className="tool-layout">
          <section className="tool-card" aria-labelledby="unlock-form-title">
            <div className="tool-card-heading">
              <span className="tool-number">01</span>
              <div>
                <h2 id="unlock-form-title">Collez le lien source</h2>
                <p>BetterDebrid l’envoie directement à l’API AllDebrid depuis le serveur.</p>
              </div>
            </div>

            <Form
              route="unrestrict.store"
              className="stack-form"
              toolname="betterdebrid.unlock_link_form"
              tooldescription="Prépare le formulaire de déverrouillage d’un lien AllDebrid. La soumission reste à confirmer par l’utilisateur."
            >
              {({ errors, processing }) => (
                <>
                  <div className="field-group">
                    <label htmlFor="link">Lien HTTP ou HTTPS</label>
                    <div className="input-with-icon">
                      <Link2 aria-hidden="true" />
                      <input
                        type="url"
                        id="link"
                        name="link"
                        required
                        maxLength={4096}
                        autoFocus
                        placeholder="https://hebergeur.example/fichier"
                        defaultValue={submittedLink ?? ''}
                        aria-describedby={errors.link ? 'link-error' : 'link-hint'}
                        aria-invalid={Boolean(errors.link)}
                        toolparamdescription="URL HTTP ou HTTPS à déverrouiller avec AllDebrid."
                      />
                    </div>
                    {errors.link ? (
                      <p className="field-error" id="link-error">
                        {errors.link}
                      </p>
                    ) : (
                      <p className="field-hint" id="link-hint">
                        Les liens pris en charge dépendent de votre abonnement AllDebrid.
                      </p>
                    )}
                  </div>

                  <details className="advanced-field">
                    <summary>
                      <KeyRound aria-hidden="true" /> Lien protégé par mot de passe
                    </summary>
                    <div className="field-group">
                      <label htmlFor="password">Mot de passe du lien</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        maxLength={500}
                        autoComplete="off"
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        aria-invalid={Boolean(errors.password)}
                        toolparamdescription="Mot de passe optionnel fourni par l’hébergeur."
                      />
                      {errors.password && (
                        <p className="field-error" id="password-error">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </details>

                  <button
                    type="submit"
                    className="button button-accent button-wide"
                    disabled={processing}
                  >
                    {processing ? (
                      <LoaderCircle className="spin" aria-hidden="true" />
                    ) : (
                      <ArrowDownToLine aria-hidden="true" />
                    )}
                    {processing ? 'Déverrouillage…' : 'Générer le lien sécurisé'}
                  </button>
                </>
              )}
            </Form>
          </section>

          <aside className="tool-aside">
            <div className="privacy-note">
              <KeyRound aria-hidden="true" />
              <div>
                <strong>Traitement côté serveur</strong>
                <p>Votre clé AllDebrid chiffrée ne quitte jamais le backend BetterDebrid.</p>
              </div>
            </div>
            <div className="webmcp-note">
              <span className="beta-label">WebMCP</span>
              <p>
                Cette action est aussi découvrable par les agents compatibles, avec confirmation
                explicite.
              </p>
            </div>
          </aside>

          {error && (
            <div className="inline-alert error tool-result" role="alert">
              <TriangleAlert aria-hidden="true" />
              <div>
                <strong>Déverrouillage impossible</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {result && <UnlockResultCard result={result} />}
        </div>
      )}
    </AppShell>
  )
}

function UnlockResultCard({ result }: { result: UnlockResult }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!result.link) return
    await navigator.clipboard.writeText(result.link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  if (result.streams?.length && result.id && !result.link) {
    return (
      <section className="result-card tool-result" aria-labelledby="stream-title">
        <div className="result-heading">
          <span className="result-icon">
            <Film aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">Plusieurs qualités</p>
            <h2 id="stream-title">Choisissez votre version</h2>
          </div>
        </div>
        <div className="stream-grid">
          {result.streams.map((stream, index) => (
            <Form
              route="unrestrict.stream"
              key={stream.id}
              toolname={`betterdebrid.select_stream_form_${index}`}
              tooldescription="Prépare la sélection d’une qualité vidéo AllDebrid. La soumission reste à confirmer."
            >
              {({ processing }) => (
                <>
                  <input type="hidden" name="id" value={result.id} />
                  <input type="hidden" name="stream" value={stream.id} />
                  <button type="submit" className="stream-option" disabled={processing}>
                    <span>
                      <strong>
                        {stream.quality
                          ? `${stream.quality}p`
                          : stream.ext?.toUpperCase() || 'Flux'}
                      </strong>
                      <small>{formatBytes(stream.filesize)}</small>
                    </span>
                    <ArrowDownToLine aria-hidden="true" />
                  </button>
                </>
              )}
            </Form>
          ))}
        </div>
      </section>
    )
  }

  if (result.delayed && !result.link) {
    return (
      <section className="result-card tool-result" aria-labelledby="delayed-title">
        <div className="result-heading">
          <span className="result-icon waiting">
            <Clock3 aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">Génération différée</p>
            <h2 id="delayed-title">Le lien se prépare</h2>
          </div>
        </div>
        <p className="result-description">
          AllDebrid demande encore{' '}
          {result.timeLeft ? `environ ${result.timeLeft} secondes` : 'quelques secondes'}.
        </p>
        <Form
          route="unrestrict.delayed"
          toolname="betterdebrid.check_delayed_link_form"
          tooldescription="Vérifie si un lien différé AllDebrid est prêt."
        >
          {({ processing }) => (
            <>
              <input type="hidden" name="id" value={result.delayed} />
              <button type="submit" className="button button-dark" disabled={processing}>
                {processing ? (
                  <LoaderCircle className="spin" aria-hidden="true" />
                ) : (
                  <Clock3 aria-hidden="true" />
                )}
                Vérifier maintenant
              </button>
            </>
          )}
        </Form>
      </section>
    )
  }

  return (
    <section
      className="result-card success tool-result"
      aria-labelledby="result-title"
      aria-live="polite"
    >
      <div className="result-heading">
        <span className="result-icon">
          <Check aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">Lien disponible</p>
          <h2 id="result-title">{result.filename || 'Téléchargement prêt'}</h2>
        </div>
      </div>
      <div className="result-meta">
        {result.host && (
          <span>
            Hébergeur <strong>{result.host}</strong>
          </span>
        )}
        <span>
          Taille <strong>{formatBytes(result.filesize)}</strong>
        </span>
      </div>
      {result.link ? (
        <div className="result-actions">
          {result.mediaToken && (
            <Link
              href={`/app/lecteur?token=${encodeURIComponent(result.mediaToken)}`}
              className="button button-dark"
            >
              {result.mediaKind === 'audio' ? (
                <HeadphonesIcon aria-hidden="true" />
              ) : (
                <VideoIcon aria-hidden="true" />
              )}
              Lire maintenant
            </Link>
          )}
          <a href={result.link} className="button button-accent" target="_blank" rel="noreferrer">
            Télécharger <ExternalLink aria-hidden="true" />
          </a>
          <button type="button" className="button button-secondary" onClick={copyLink}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? 'Copié' : 'Copier le lien'}
          </button>
        </div>
      ) : (
        <p className="result-description">Aucun lien direct n’a été retourné.</p>
      )}
      <Link href="/app/historique" className="subtle-link">
        Retrouver cette action dans l’historique
      </Link>
    </section>
  )
}
