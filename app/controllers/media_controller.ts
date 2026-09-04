import MediaTokenService, { prefersNativePlayback } from '#services/media_token_service'
import MediaTranscoderService, {
  MediaTranscoderBusyError,
} from '#services/media_transcoder_service'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

export default class MediaController {
  private tokens = new MediaTokenService()
  private transcoder = new MediaTranscoderService()

  async show({ auth, request, response, inertia }: HttpContext) {
    const token = String(request.input('token', '')).slice(0, 12_000)
    const media = this.tokens.read(token, auth.user!.id)
    if (!media) return response.notFound()

    return inertia.render('media/player', {
      token,
      filename: media.filename,
      kind: media.kind,
      nativePreferred: prefersNativePlayback(media.filename, media.kind),
      preferredPlayer: auth.user!.preferredPlayer,
    })
  }

  async source({ auth, request, response }: HttpContext) {
    const token = String(request.input('token', '')).slice(0, 12_000)
    const media = this.tokens.read(token, auth.user!.id)
    if (!media) return response.notFound()
    return response.redirect(media.url)
  }

  async compatibilityStream({ auth, request, response }: HttpContext) {
    const token = String(request.input('token', '')).slice(0, 12_000)
    const media = this.tokens.read(token, auth.user!.id)
    if (!media) return response.notFound()

    try {
      const transcode = await this.transcoder.start(media, request.input('subtitles', '1') !== '0')
      response.response.once('close', transcode.stop)
      response.header('Content-Type', transcode.contentType)
      response.header('Cache-Control', 'private, no-store')
      response.header('Accept-Ranges', 'none')
      response.header('X-Content-Type-Options', 'nosniff')
      return response.stream(transcode.stream, () => ['La lecture a été interrompue.', 502])
    } catch (error) {
      if (error instanceof MediaTranscoderBusyError) {
        return response.serviceUnavailable({ error: error.message })
      }
      return response.internalServerError({
        error: 'Le mode compatibilité n’a pas pu démarrer pour ce fichier.',
      })
    }
  }

  async playlist({ auth, request, response }: HttpContext) {
    const token = String(request.input('token', '')).slice(0, 12_000)
    const media = this.tokens.read(token, auth.user!.id)
    if (!media) return response.notFound()

    const externalUrl = `${env.get('APP_URL')}/lecture-externe?token=${encodeURIComponent(token)}`
    const safeName = media.filename.replace(/[\r\n"\\/]/g, '_').slice(0, 160)
    response.header('Content-Type', 'audio/x-mpegurl; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="BetterDebrid-${safeName}.m3u"`)
    response.header('Cache-Control', 'private, no-store')
    return response.send(
      `#EXTM3U\n#EXTINF:-1,${media.filename.replace(/[\r\n]/g, ' ')}\n${externalUrl}\n`
    )
  }

  async externalSource({ request, response }: HttpContext) {
    const token = String(request.input('token', '')).slice(0, 12_000)
    const media = this.tokens.readForExternalPlayer(token)
    if (!media) return response.notFound()
    response.header('Cache-Control', 'private, no-store')
    return response.redirect(media.url)
  }
}
