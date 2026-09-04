import { readFile } from 'node:fs/promises'
import ActivityService from '#services/activity_service'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import MediaTokenService from '#services/media_token_service'
import { requireConnection } from '#services/connection_service'
import type { HttpContext } from '@adonisjs/core/http'

const MAGNET_OR_HASH = /^(magnet:\?xt=urn:btih:|[a-f\d]{40}$|[a-f\d]{64}$)/i

export default class UniversalInputController {
  private client = new AllDebridService()
  private mediaTokens = new MediaTokenService()

  async store({ auth, request, response, session, inertia }: HttpContext) {
    const torrent = request.file('torrent', { size: '10mb', extnames: ['torrent'] })
    const source = String(request.input('source', '')).trim()

    if (torrent) {
      if (!torrent.isValid || !torrent.tmpPath) {
        session.flash('error', torrent.errors[0]?.message ?? 'Le fichier torrent est invalide.')
        return response.redirect().toRoute('dashboard')
      }
      return this.uploadTorrent(
        auth.user!.id,
        torrent.clientName,
        torrent.tmpPath,
        response,
        session
      )
    }

    if (!source) {
      session.flash('error', 'Collez un lien, un magnet ou choisissez un fichier .torrent.')
      return response.redirect().toRoute('dashboard')
    }

    if (MAGNET_OR_HASH.test(source)) {
      return this.uploadMagnet(auth.user!.id, source, response, session)
    }

    try {
      const parsed = new URL(source)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol')
    } catch {
      session.flash('error', 'Utilisez une URL HTTP(S), un magnet, un hash ou un fichier .torrent.')
      return response.redirect().toRoute('dashboard')
    }

    try {
      const connection = await requireConnection(auth.user!.id)
      const result = await this.client.unlockLink(connection.getApiKey(), source)
      const media = result.link
        ? this.mediaTokens.create(auth.user!.id, result.link, result.filename)
        : null
      await ActivityService.record(
        auth.user!.id,
        'unlock',
        result.filename.slice(0, 255),
        'success'
      )
      return inertia.render('unrestrict', {
        connected: true,
        result: { ...result, mediaToken: media?.token, mediaKind: media?.kind },
        error: null,
        submittedLink: source,
      })
    } catch (error) {
      return inertia.render('unrestrict', {
        connected: true,
        result: null,
        error: this.messageFor(error),
        submittedLink: source,
      })
    }
  }

  private async uploadMagnet(
    userId: number,
    magnet: string,
    response: HttpContext['response'],
    session: HttpContext['session']
  ) {
    try {
      const connection = await requireConnection(userId)
      const [upload] = await this.client.uploadMagnets(connection.getApiKey(), [magnet])
      if (!upload?.id || upload.error) throw new Error(upload?.error?.message ?? 'Magnet refusé.')
      await ActivityService.record(userId, 'magnet', (upload.name || 'Magnet ajouté').slice(0, 255))
      session.flash('success', 'Magnet ajouté à votre file AllDebrid.')
      return response.redirect(`/app/magnets/${upload.id}`)
    } catch (error) {
      session.flash('error', this.messageFor(error))
      return response.redirect().toRoute('dashboard')
    }
  }

  private async uploadTorrent(
    userId: number,
    filename: string,
    path: string,
    response: HttpContext['response'],
    session: HttpContext['session']
  ) {
    try {
      const connection = await requireConnection(userId)
      const uploads = await this.client.uploadTorrent(
        connection.getApiKey(),
        filename,
        await readFile(path)
      )
      const upload = uploads[0]
      if (!upload?.id || upload.error) throw new Error(upload?.error?.message ?? 'Torrent refusé.')
      await ActivityService.record(userId, 'torrent', (upload.name || filename).slice(0, 255))
      session.flash('success', 'Fichier torrent ajouté à votre file AllDebrid.')
      return response.redirect(`/app/magnets/${upload.id}`)
    } catch (error) {
      session.flash('error', this.messageFor(error))
      return response.redirect().toRoute('dashboard')
    }
  }

  private messageFor(error: unknown) {
    return error instanceof AllDebridApiError || error instanceof Error
      ? error.message
      : 'AllDebrid est momentanément indisponible.'
  }
}
