import encryption from '@adonisjs/core/services/encryption'

export type MediaKind = 'video' | 'audio'

export type MediaTokenPayload = {
  url: string
  filename: string
  kind: MediaKind
  userId: number
}

const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'm4v',
  'webm',
  'mkv',
  'avi',
  'mov',
  'wmv',
  'flv',
  'ogv',
  'mpg',
  'mpeg',
  'm2ts',
  'ts',
  '3gp',
])
const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'm4a',
  'aac',
  'ogg',
  'oga',
  'wav',
  'flac',
  'opus',
  'wma',
  'alac',
  'aiff',
  'mka',
])
const NATIVE_VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'ogv', 'mkv'])
const NATIVE_AUDIO_EXTENSIONS = new Set([
  'mp3',
  'm4a',
  'aac',
  'ogg',
  'oga',
  'wav',
  'flac',
  'opus',
  'mka',
])

export function mediaExtension(filename: string) {
  const cleanName = filename.split(/[?#]/, 1)[0]
  return cleanName.includes('.') ? cleanName.split('.').pop()!.toLowerCase() : ''
}

export function detectMediaKind(filename: string): MediaKind | null {
  const extension = mediaExtension(filename)
  if (VIDEO_EXTENSIONS.has(extension)) return 'video'
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio'
  return null
}

export function prefersNativePlayback(filename: string, kind: MediaKind) {
  const extension = mediaExtension(filename)
  return kind === 'video'
    ? NATIVE_VIDEO_EXTENSIONS.has(extension)
    : NATIVE_AUDIO_EXTENSIONS.has(extension)
}

export default class MediaTokenService {
  create(userId: number, url: string, filename: string) {
    const kind = detectMediaKind(filename)
    if (!kind) return null

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return null
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return null

    return {
      kind,
      token: encryption.encrypt(
        { url: parsedUrl.toString(), filename: filename.slice(0, 500), kind, userId },
        { expiresIn: '2 hours', purpose: 'media-playback' }
      ),
    }
  }

  read(token: string, userId: number): MediaTokenPayload | null {
    const payload = encryption.decrypt<MediaTokenPayload>(token, 'media-playback')
    if (!payload || payload.userId !== userId) return null
    return this.validatePayload(payload)
  }

  readForExternalPlayer(token: string): MediaTokenPayload | null {
    const payload = encryption.decrypt<MediaTokenPayload>(token, 'media-playback')
    return payload ? this.validatePayload(payload) : null
  }

  private validatePayload(payload: MediaTokenPayload): MediaTokenPayload | null {
    if (!detectMediaKind(payload.filename) || detectMediaKind(payload.filename) !== payload.kind) {
      return null
    }

    try {
      const parsedUrl = new URL(payload.url)
      return ['http:', 'https:'].includes(parsedUrl.protocol) ? payload : null
    } catch {
      return null
    }
  }
}
