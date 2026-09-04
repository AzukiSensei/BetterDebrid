import {
  CirclePauseIcon,
  CirclePlayIcon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  MoveDiagonal2Icon,
  Volume2Icon,
  VolumeXIcon,
} from '@animateicons/react/lucide'
import { useMemo, useRef, useState } from 'react'

interface MediaPlayerProps {
  token: string
  filename: string
  kind: 'video' | 'audio'
  nativePreferred: boolean
}

export function MediaPlayer({ token, filename, kind, nativePreferred }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [compatibility, setCompatibility] = useState(!nativePreferred)
  const [subtitles, setSubtitles] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const source = useMemo(() => {
    const encodedToken = encodeURIComponent(token)
    return compatibility
      ? `/app/lecteur/compatibilite?token=${encodedToken}&subtitles=${subtitles ? '1' : '0'}`
      : `/app/lecteur/source?token=${encodedToken}`
  }, [compatibility, subtitles, token])

  function resetPlaybackState() {
    setPlaying(false)
    setWaiting(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
  }

  function toggleCompatibility() {
    resetPlaybackState()
    setCompatibility((enabled) => !enabled)
  }

  function changeSubtitles(enabled: boolean) {
    resetPlaybackState()
    setSubtitles(enabled)
  }

  function setMedia(element: HTMLMediaElement | null) {
    mediaRef.current = element
  }

  async function togglePlayback() {
    const media = mediaRef.current
    if (!media) return
    try {
      if (media.paused) await media.play()
      else media.pause()
    } catch {
      setError('La lecture a été bloquée par le navigateur. Réessayez avec le bouton lecture.')
    }
  }

  function seek(value: number) {
    if (!mediaRef.current || !Number.isFinite(value)) return
    mediaRef.current.currentTime = value
    setCurrentTime(value)
  }

  function changeVolume(value: number) {
    if (!mediaRef.current) return
    mediaRef.current.volume = value
    mediaRef.current.muted = false
    setVolume(value)
    setMuted(false)
  }

  function toggleMute() {
    if (!mediaRef.current) return
    mediaRef.current.muted = !mediaRef.current.muted
    setMuted(mediaRef.current.muted)
  }

  async function enterFullscreen() {
    if (frameRef.current?.requestFullscreen) await frameRef.current.requestFullscreen()
  }

  function handleMediaError() {
    if (!compatibility) {
      resetPlaybackState()
      setCompatibility(true)
      setError('Format non natif détecté : passage automatique en mode compatibilité.')
      return
    }
    setError('Ce média ne peut pas être lu. Le lien a peut-être expiré ou le codec est endommagé.')
  }

  const mediaEvents = {
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onWaiting: () => setWaiting(true),
    onCanPlay: () => setWaiting(false),
    onLoadedMetadata: (event: React.SyntheticEvent<HTMLMediaElement>) => {
      const value = event.currentTarget.duration
      setDuration(Number.isFinite(value) ? value : 0)
      setWaiting(false)
    },
    onTimeUpdate: (event: React.SyntheticEvent<HTMLMediaElement>) =>
      setCurrentTime(event.currentTarget.currentTime),
    onVolumeChange: (event: React.SyntheticEvent<HTMLMediaElement>) => {
      setVolume(event.currentTarget.volume)
      setMuted(event.currentTarget.muted)
    },
    onError: handleMediaError,
  }

  return (
    <div className={`media-player ${kind}`} ref={frameRef}>
      <div className="media-viewport">
        {kind === 'video' ? (
          <video
            key={source}
            ref={setMedia}
            src={source}
            preload="metadata"
            playsInline
            aria-label={`Lecteur vidéo : ${filename}`}
            {...mediaEvents}
          />
        ) : (
          <>
            <div className="audio-art" aria-hidden="true">
              <span className={playing ? 'audio-disc playing' : 'audio-disc'}>
                <span />
              </span>
              <span className="audio-waves">
                {Array.from({ length: 28 }, (_, index) => (
                  <i key={index} />
                ))}
              </span>
            </div>
            <audio
              key={source}
              ref={setMedia}
              src={source}
              preload="metadata"
              aria-label={`Lecteur audio : ${filename}`}
              {...mediaEvents}
            />
          </>
        )}

        {waiting && (
          <div className="media-loading" role="status">
            <LoaderCircleIcon className="spin" aria-hidden="true" />
            Préparation du média…
          </div>
        )}
      </div>

      <div className="media-controls">
        <button
          type="button"
          className="media-control-button primary"
          onClick={togglePlayback}
          aria-label={playing ? 'Mettre en pause' : 'Lire'}
        >
          {playing ? <CirclePauseIcon aria-hidden="true" /> : <CirclePlayIcon aria-hidden="true" />}
        </button>

        <span className="media-time" aria-label={`${formatTime(currentTime)} écoulées`}>
          {formatTime(currentTime)}
        </span>
        <input
          className="media-seek"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          disabled={!duration}
          onChange={(event) => seek(Number(event.currentTarget.value))}
          aria-label="Position de lecture"
        />
        <span className="media-time">{formatTime(duration)}</span>

        <button
          type="button"
          className="media-control-button"
          onClick={toggleMute}
          aria-label={muted ? 'Réactiver le son' : 'Couper le son'}
        >
          {muted ? <VolumeXIcon aria-hidden="true" /> : <Volume2Icon aria-hidden="true" />}
        </button>
        <input
          className="media-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(event) => changeVolume(Number(event.currentTarget.value))}
          aria-label="Volume"
        />
        {kind === 'video' && (
          <button
            type="button"
            className="media-control-button"
            onClick={enterFullscreen}
            aria-label="Afficher en plein écran"
          >
            <MoveDiagonal2Icon aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="media-options">
        <button
          type="button"
          className={compatibility ? 'mode-pill active' : 'mode-pill'}
          onClick={toggleCompatibility}
          aria-pressed={compatibility}
        >
          Mode compatibilité
        </button>
        {kind === 'video' && compatibility && (
          <label className="subtitle-option">
            <input
              type="checkbox"
              checked={subtitles}
              onChange={(event) => changeSubtitles(event.currentTarget.checked)}
            />
            <MessageSquareTextIcon aria-hidden="true" />
            Incruster la première piste de sous-titres intégrée
          </label>
        )}
      </div>

      {error && (
        <p className="media-error" role="status">
          {error}
        </p>
      )}
    </div>
  )
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '00:00'
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = Math.floor(value % 60)
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
