import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  Archive,
  ArrowDownToLine,
  Clock3,
  ExternalLink,
  History as HistoryIcon,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '~/components/app_shell'
import { ConnectionRequired } from '~/components/connection_required'
import { formatBytes, formatDate } from '~/utils/format'
import type { InertiaProps } from '~/types'

type LinkData = {
  link: string
  filename: string
  size: number
  date: number
  host: string
}

type ActivityData = {
  id: number
  action: string
  status: 'success' | 'pending' | 'error'
  title: string
  createdAt: string
}

interface HistoryProps extends InertiaProps {
  connected: boolean
  recentLinks: LinkData[]
  savedLinks: LinkData[]
  activities: ActivityData[]
  apiError: string | null
}

type HistoryView = 'recent' | 'saved' | 'local'

export default function History({
  user,
  connected,
  recentLinks,
  savedLinks,
  activities,
  apiError,
}: HistoryProps) {
  const [view, setView] = useState<HistoryView>('recent')
  const links = view === 'recent' ? recentLinks : savedLinks

  return (
    <AppShell
      user={user!}
      eyebrow="Journal"
      title="Historique"
      action={
        <Link href="/app/debrider" className="button button-dark">
          <ArrowDownToLine aria-hidden="true" /> Nouveau lien
        </Link>
      }
    >
      <Head title="Historique" />
      {!connected ? (
        <ConnectionRequired />
      ) : (
        <div className="history-stack">
          {apiError && (
            <div className="inline-alert error" role="alert">
              <TriangleAlert aria-hidden="true" />
              <div>
                <strong>Historique AllDebrid indisponible</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <div className="segmented-control" aria-label="Type d’historique">
            <button
              type="button"
              aria-pressed={view === 'recent'}
              className={view === 'recent' ? 'active' : ''}
              onClick={() => setView('recent')}
            >
              <Clock3 aria-hidden="true" /> Récents <span>{recentLinks.length}</span>
            </button>
            <button
              type="button"
              aria-pressed={view === 'saved'}
              className={view === 'saved' ? 'active' : ''}
              onClick={() => setView('saved')}
            >
              <Archive aria-hidden="true" /> Sauvegardés <span>{savedLinks.length}</span>
            </button>
            <button
              type="button"
              aria-pressed={view === 'local'}
              className={view === 'local' ? 'active' : ''}
              onClick={() => setView('local')}
            >
              <HistoryIcon aria-hidden="true" /> BetterDebrid <span>{activities.length}</span>
            </button>
          </div>

          <section className="panel history-panel" aria-live="polite">
            <div className="panel-header">
              <div>
                <p className="eyebrow">{view === 'local' ? 'Journal privé' : 'Compte AllDebrid'}</p>
                <h2>
                  {view === 'recent'
                    ? 'Liens des 3 derniers jours'
                    : view === 'saved'
                      ? 'Liens sauvegardés'
                      : 'Actions BetterDebrid'}
                </h2>
              </div>
            </div>

            {view === 'local' ? (
              activities.length ? (
                <ol className="history-list">
                  {activities.map((activity) => (
                    <li key={activity.id}>
                      <span className={`activity-marker ${activity.status}`} aria-hidden="true" />
                      <div className="history-main">
                        <strong>{activity.title}</strong>
                        <span>{activity.action.replaceAll('_', ' ')}</span>
                      </div>
                      <time dateTime={activity.createdAt}>
                        {formatDate(activity.createdAt, true)}
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyHistory local />
              )
            ) : links.length ? (
              <ol className="history-list">
                {links.map((link, index) => (
                  <li key={`${link.link}-${index}`}>
                    <span className="history-file-icon">
                      <ArrowDownToLine aria-hidden="true" />
                    </span>
                    <div className="history-main">
                      <strong>{link.filename || 'Lien sans nom'}</strong>
                      <span>
                        {link.host || 'Hébergeur inconnu'} · {formatBytes(link.size)}
                      </span>
                    </div>
                    <time dateTime={new Date(link.date * 1000).toISOString()}>
                      {formatDate(link.date, true)}
                    </time>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noreferrer"
                      className="icon-button"
                      aria-label={`Ouvrir ${link.filename || 'le lien'}`}
                    >
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyHistory />
            )}
          </section>
          {view === 'recent' && (
            <p className="history-footnote">
              L’historique récent doit être activé dans les réglages AllDebrid et conserve les liens
              pendant 3 jours.
            </p>
          )}
        </div>
      )}
    </AppShell>
  )
}

function EmptyHistory({ local = false }: { local?: boolean }) {
  return (
    <div className="panel-empty roomy">
      <Clock3 aria-hidden="true" />
      <h3>{local ? 'Aucune action enregistrée' : 'Aucun lien à afficher'}</h3>
      <p>
        {local
          ? 'Le journal se remplira au fil de vos actions.'
          : 'Les liens disponibles apparaîtront ici.'}
      </p>
    </div>
  )
}
