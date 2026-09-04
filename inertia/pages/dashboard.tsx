import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'
import {
  CircleCheckIcon as CheckCircle2,
  ClockIcon as Clock3,
  CloudIcon as CloudDownload,
  DashboardIcon as Gauge,
  Disc3Icon as Magnet,
  DownloadIcon as ArrowDownToLine,
  ArrowRightIcon as ArrowRight,
  HardDriveIcon as DatabaseZap,
  LinkIcon as Link2,
  LoaderCircleIcon as LoaderCircle,
  UploadIcon as FileUp,
  TriangleAlertIcon as TriangleAlert,
} from '@animateicons/react/lucide'
import { useState } from 'react'
import { AppShell } from '~/components/app_shell'
import { ConnectionRequired } from '~/components/connection_required'
import { formatBytes, formatDate, magnetProgress } from '~/utils/format'
import type { InertiaProps } from '~/types'

type MagnetData = {
  id: number
  filename: string
  size: number
  status: string
  statusCode: number
  downloaded?: number
  downloadSpeed?: number
  uploadDate: number
}

interface DashboardProps extends InertiaProps {
  connected: boolean
  profile: {
    username: string | null
    isPremium: boolean
    isTrial: boolean
    premiumUntil: number | null
    fidelityPoints: number
  } | null
  magnets: MagnetData[]
  recentLinks: Array<{ filename: string; size: number; date: number; host: string }>
  activities: Array<{
    id: number
    action: string
    status: 'success' | 'pending' | 'error'
    title: string
    createdAt: string
  }>
  apiError: string | null
}

export default function Dashboard({
  user,
  connected,
  profile,
  magnets,
  recentLinks,
  activities,
  apiError,
}: DashboardProps) {
  const [torrentName, setTorrentName] = useState('')
  const readyCount = magnets.filter((magnet) => magnet.statusCode === 4).length
  const activeCount = magnets.filter(
    (magnet) => magnet.statusCode >= 0 && magnet.statusCode < 4
  ).length
  const totalSize = magnets.reduce((sum, magnet) => sum + (magnet.size || 0), 0)

  return (
    <AppShell
      user={user!}
      eyebrow="Espace personnel"
      title={`Bonjour${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}`}
      action={
        <Link href="/app/debrider" className="button button-dark">
          <ArrowDownToLine aria-hidden="true" /> Débrider un lien
        </Link>
      }
    >
      <Head title="Vue d’ensemble" />
      {!connected ? (
        <ConnectionRequired />
      ) : (
        <div className="dashboard-stack">
          {apiError && (
            <div className="inline-alert error" role="alert">
              <TriangleAlert aria-hidden="true" />
              <div>
                <strong>Synchronisation partielle</strong>
                <span>{apiError}</span>
              </div>
              <Link href="/app/reglages">Vérifier</Link>
            </div>
          )}

          <section className="universal-command" aria-labelledby="universal-command-title">
            <div className="universal-command-copy">
              <span className="command-orbit" aria-hidden="true">
                <Link2 />
              </span>
              <div>
                <p className="eyebrow light">Entrée universelle</p>
                <h2 id="universal-command-title">Un lien. Un magnet. Un torrent.</h2>
                <p>
                  Collez n’importe quelle source compatible : BetterDebrid reconnaît l’action à
                  effectuer et vous emmène directement au résultat.
                </p>
              </div>
            </div>
            <Form
              route="universal_input.store"
              encType="multipart/form-data"
              className="universal-command-form"
              toolname="betterdebrid.universal_input_form"
              tooldescription="Prépare le traitement d’un lien hébergeur, d’un magnet, d’un hash ou d’un fichier torrent avec AllDebrid. La soumission reste à confirmer par l’utilisateur."
            >
              {({ processing }) => (
                <>
                  <div className="universal-input-row">
                    <div className="universal-text-input">
                      <Link2 aria-hidden="true" />
                      <label htmlFor="universal-source" className="sr-only">
                        Lien, magnet ou hash
                      </label>
                      <input
                        id="universal-source"
                        name="source"
                        type="text"
                        maxLength={12_000}
                        placeholder="Collez un lien, magnet ou hash…"
                        aria-describedby="universal-hint"
                        toolparamdescription="URL HTTP(S), URI magnet ou hash BitTorrent à traiter. Laisser vide si un fichier torrent est choisi."
                      />
                    </div>
                    <label className="universal-file-button" htmlFor="universal-torrent">
                      <FileUp aria-hidden="true" />
                      <span>{torrentName || 'Fichier .torrent'}</span>
                    </label>
                    <input
                      id="universal-torrent"
                      name="torrent"
                      type="file"
                      accept=".torrent,application/x-bittorrent"
                      className="visually-hidden-file"
                      onChange={(event) =>
                        setTorrentName(event.currentTarget.files?.[0]?.name || '')
                      }
                      toolparamdescription="Fichier BitTorrent optionnel, 10 Mo maximum."
                    />
                    <button type="submit" className="button universal-submit" disabled={processing}>
                      {processing ? (
                        <LoaderCircle className="spin" aria-hidden="true" />
                      ) : (
                        <ArrowRight aria-hidden="true" />
                      )}
                      <span>{processing ? 'Traitement…' : 'Lancer'}</span>
                    </button>
                  </div>
                  <p id="universal-hint" className="universal-hint">
                    Liens hébergeurs · HTTP(S) · magnets · hashes · fichiers torrent
                  </p>
                </>
              )}
            </Form>
          </section>

          <section className="account-banner" aria-labelledby="account-title">
            <div>
              <p className="eyebrow light">Compte AllDebrid</p>
              <h2 id="account-title">{profile?.username || 'Compte connecté'}</h2>
              <p>
                {profile?.isPremium
                  ? `Premium jusqu’au ${formatDate(profile.premiumUntil)}`
                  : profile?.isTrial
                    ? 'Période d’essai active'
                    : 'Compte gratuit'}
              </p>
            </div>
            <div className={profile?.isPremium ? 'premium-stamp active' : 'premium-stamp'}>
              <CheckCircle2 aria-hidden="true" />
              <span>{profile?.isPremium ? 'Premium actif' : 'Accès standard'}</span>
            </div>
          </section>

          <section className="metric-strip" aria-label="Résumé des magnets">
            <article>
              <span className="metric-icon">
                <Gauge aria-hidden="true" />
              </span>
              <div>
                <strong>{activeCount}</strong>
                <span>En cours</span>
              </div>
            </article>
            <article>
              <span className="metric-icon">
                <CheckCircle2 aria-hidden="true" />
              </span>
              <div>
                <strong>{readyCount}</strong>
                <span>Prêts</span>
              </div>
            </article>
            <article>
              <span className="metric-icon">
                <DatabaseZap aria-hidden="true" />
              </span>
              <div>
                <strong>{formatBytes(totalSize)}</strong>
                <span>Volume affiché</span>
              </div>
            </article>
            <article>
              <span className="metric-icon">
                <CloudDownload aria-hidden="true" />
              </span>
              <div>
                <strong>{recentLinks.length}</strong>
                <span>Liens récents</span>
              </div>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="panel" aria-labelledby="recent-magnets-title">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">File active</p>
                  <h2 id="recent-magnets-title">Magnets récents</h2>
                </div>
                <Link href="/app/magnets" className="panel-link">
                  Tout voir <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              {magnets.length ? (
                <div className="magnet-list compact-list">
                  {magnets.map((magnet) => {
                    const progress =
                      magnet.statusCode === 4 ? 100 : magnetProgress(magnet.size, magnet.downloaded)
                    return (
                      <Link
                        href={`/app/magnets/${magnet.id}`}
                        className="magnet-item"
                        key={magnet.id}
                      >
                        <span className="item-icon">
                          <Magnet aria-hidden="true" />
                        </span>
                        <span className="item-copy">
                          <strong title={magnet.filename}>{magnet.filename}</strong>
                          <span>
                            {formatBytes(magnet.size)} · {magnet.status}
                          </span>
                          <span className="progress-track" aria-label={`Progression ${progress} %`}>
                            <span style={{ width: `${progress}%` }} />
                          </span>
                        </span>
                        <span
                          className={
                            magnet.statusCode === 4 ? 'status-badge ready' : 'status-badge working'
                          }
                        >
                          {magnet.statusCode === 4 ? 'Prêt' : `${progress}%`}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="panel-empty">
                  <Magnet aria-hidden="true" />
                  <p>Aucun magnet à afficher.</p>
                  <Link href="/app/magnets">Ajouter le premier</Link>
                </div>
              )}
            </section>

            <section className="panel" aria-labelledby="activity-title">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Journal local</p>
                  <h2 id="activity-title">Activité</h2>
                </div>
                <Link href="/app/historique" className="panel-link">
                  Historique <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              {activities.length ? (
                <ol className="activity-list">
                  {activities.map((activity) => (
                    <li key={activity.id}>
                      <span className={`activity-marker ${activity.status}`} aria-hidden="true" />
                      <div>
                        <strong>{activity.title}</strong>
                        <span>{formatDate(activity.createdAt, true)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="panel-empty">
                  <Clock3 aria-hidden="true" />
                  <p>Vos prochaines actions apparaîtront ici.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </AppShell>
  )
}
