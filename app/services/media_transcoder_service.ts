import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import type { MediaTokenPayload } from '#services/media_token_service'

const execFileAsync = promisify(execFile)
const MAX_CONCURRENT_TRANSCODES = 2

export class MediaTranscoderBusyError extends Error {}

export default class MediaTranscoderService {
  private static activeTranscodes = 0

  async start(payload: MediaTokenPayload, includeEmbeddedSubtitles: boolean) {
    if (MediaTranscoderService.activeTranscodes >= MAX_CONCURRENT_TRANSCODES) {
      throw new MediaTranscoderBusyError(
        'Deux conversions sont déjà actives. Réessayez dans quelques instants.'
      )
    }

    const hasSubtitle =
      payload.kind === 'video' && includeEmbeddedSubtitles
        ? await this.hasEmbeddedSubtitle(payload.url)
        : false
    const args = this.buildArguments(payload, hasSubtitle)
    const process = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    process.stderr.resume()
    MediaTranscoderService.activeTranscodes += 1

    let released = false
    const release = () => {
      if (released) return
      released = true
      MediaTranscoderService.activeTranscodes = Math.max(
        0,
        MediaTranscoderService.activeTranscodes - 1
      )
    }

    process.once('close', release)
    process.once('error', release)

    return {
      process,
      stream: process.stdout,
      contentType: payload.kind === 'video' ? 'video/mp4' : 'audio/mpeg',
      subtitlesBurnedIn: hasSubtitle,
      stop: () => this.stopProcess(process),
    }
  }

  private buildArguments(payload: MediaTokenPayload, hasSubtitle: boolean) {
    const common = ['-hide_banner', '-loglevel', 'error', '-i', payload.url]
    if (payload.kind === 'audio') {
      return [...common, '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', '-f', 'mp3', 'pipe:1']
    }

    const videoFilters = hasSubtitle
      ? ['-vf', `subtitles='${this.escapeFilterValue(payload.url)}':si=0`]
      : []
    return [
      ...common,
      ...videoFilters,
      '-map',
      '0:v:0?',
      '-map',
      '0:a:0?',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      'frag_keyframe+empty_moov+default_base_moof',
      '-f',
      'mp4',
      'pipe:1',
    ]
  }

  private async hasEmbeddedSubtitle(url: string) {
    try {
      const { stdout } = await execFileAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-select_streams',
          's:0',
          '-show_entries',
          'stream=index',
          '-of',
          'csv=p=0',
          url,
        ],
        { timeout: 15_000, maxBuffer: 16_384 }
      )
      return stdout.trim().length > 0
    } catch {
      return false
    }
  }

  private escapeFilterValue(value: string) {
    return value
      .replaceAll('\\', '\\\\')
      .replaceAll(':', '\\:')
      .replaceAll("'", "\\'")
      .replaceAll(',', '\\,')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll(';', '\\;')
  }

  private stopProcess(process: ChildProcess) {
    if (!process.killed) process.kill('SIGTERM')
  }
}
