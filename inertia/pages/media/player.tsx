import {
  ArrowLeftIcon,
  CirclePlayIcon,
  DownloadIcon,
  ExternalLinkIcon,
  InfoIcon,
} from '@animateicons/react/lucide'
import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { AppShell } from '~/components/app_shell'
import { MediaPlayer } from '~/components/media_player'
import type { InertiaProps } from '~/types'

interface PlayerProps extends InertiaProps {
  token: string
  filename: string
  kind: 'video' | 'audio'
  nativePreferred: boolean
  preferredPlayer: 'browser' | 'vlc' | 'mpv'
}

export default function Player({
  user,
  token,
  filename,
  kind,
  nativePreferred,
  preferredPlayer,
}: PlayerProps) {
  const encodedToken = encodeURIComponent(token)

  function openMpv() {
    const source = `${window.location.origin}/lecture-externe?token=${encodedToken}`
    window.location.assign(`mpv://${source}`)
  }

  return (
    <AppShell
      user={user!}
      eyebrow={kind === 'video' ? 'Lecteur vidéo' : 'Lecteur audio'}
      title={filename}
      action={
        <Link href="/app" className="button button-secondary">
          <ArrowLeftIcon aria-hidden="true" /> Retour
        </Link>
      }
    >
      <Head title={`Lecture · ${filename}`} />
      <div className="player-page-stack">
        <MediaPlayer
          token={token}
          filename={filename}
          kind={kind}
          nativePreferred={nativePreferred}
        />

        <div className="player-meta-bar">
          <div>
            <InfoIcon aria-hidden="true" />
            <span>
              <strong>Lecture privée</strong>
              Le jeton média est chiffré, lié à votre compte et expire automatiquement.
            </span>
          </div>
          <div className="player-meta-actions">
            {preferredPlayer === 'vlc' && (
              <a
                href={`/app/lecteur/playlist?token=${encodedToken}`}
                className="button button-dark"
              >
                <CirclePlayIcon aria-hidden="true" /> Ouvrir dans VLC
              </a>
            )}
            {preferredPlayer === 'mpv' && (
              <button type="button" className="button button-dark" onClick={openMpv}>
                <ExternalLinkIcon aria-hidden="true" /> Ouvrir dans MPV
              </button>
            )}
            <a
              href={`/app/lecteur/source?token=${encodedToken}`}
              className="button button-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon aria-hidden="true" /> Télécharger l’original
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
