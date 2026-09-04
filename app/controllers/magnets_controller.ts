import { readFile } from 'node:fs/promises'
import ActivityService from '#services/activity_service'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { findConnection, requireConnection } from '#services/connection_service'
import { magnetIdValidator, magnetUploadValidator } from '#validators/all_debrid'
import type { HttpContext } from '@adonisjs/core/http'
import MediaTokenService from '#services/media_token_service'
import type { AllDebridFileNode } from '#services/all_debrid_service'

export default class MagnetsController {
  private client = new AllDebridService()
  private mediaTokens = new MediaTokenService()

  async index({ auth, inertia }: HttpContext) {
    const connection = await findConnection(auth.user!.id)
    if (!connection) {
      return inertia.render('magnets/index', {
        connected: false,
        magnets: [],
        apiError: null,
      })
    }

    try {
      const magnets = await this.client.getMagnets(connection.getApiKey())
      return inertia.render('magnets/index', { connected: true, magnets, apiError: null })
    } catch (error) {
      return inertia.render('magnets/index', {
        connected: true,
        magnets: [],
        apiError: this.messageFor(error),
      })
    }
  }

  async show({ auth, params, inertia, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return response.notFound()
    }

    try {
      const connection = await requireConnection(auth.user!.id)
      const [magnet, files] = await Promise.all([
        this.client.getMagnet(connection.getApiKey(), id),
        this.client.getMagnetFiles(connection.getApiKey(), id),
      ])
      if (!magnet) return response.notFound()
      return inertia.render('magnets/show', {
        magnet,
        files: this.withMediaTokens(files, auth.user!.id),
        apiError: null,
      })
    } catch (error) {
      return inertia.render('magnets/show', {
        magnet: null,
        files: [],
        apiError: this.messageFor(error),
      })
    }
  }

  async store({ auth, request, session, response }: HttpContext) {
    const payload = await request.validateUsing(magnetUploadValidator)
    const magnets = payload.magnets
      .split(/\r?\n/)
      .map((magnet) => magnet.trim())
      .filter(Boolean)
      .slice(0, 30)

    try {
      const connection = await requireConnection(auth.user!.id)
      const uploads = await this.client.uploadMagnets(connection.getApiKey(), magnets)
      const successCount = uploads.filter((upload) => upload.id && !upload.error).length
      const firstError = uploads.find((upload) => upload.error)?.error?.message

      await ActivityService.record(
        auth.user!.id,
        'magnet',
        `${successCount} magnet${successCount > 1 ? 's' : ''} ajouté${successCount > 1 ? 's' : ''}`,
        firstError && !successCount ? 'error' : 'success',
        { count: successCount }
      )

      if (firstError && !successCount) session.flash('error', firstError)
      else if (firstError)
        session.flash('success', `${successCount} ajout(s). Un élément a été ignoré.`)
      else
        session.flash(
          'success',
          `${successCount} magnet${successCount > 1 ? 's' : ''} ajouté${successCount > 1 ? 's' : ''}.`
        )
    } catch (error) {
      session.flash('error', this.messageFor(error))
    }

    return response.redirect().toRoute('magnets.index')
  }

  async uploadFile({ auth, request, session, response }: HttpContext) {
    const torrent = request.file('torrent', {
      size: '10mb',
      extnames: ['torrent'],
    })

    if (!torrent || !torrent.isValid || !torrent.tmpPath) {
      session.flash(
        'error',
        torrent?.errors[0]?.message ?? 'Sélectionnez un fichier .torrent valide.'
      )
      return response.redirect().toRoute('magnets.index')
    }

    try {
      const connection = await requireConnection(auth.user!.id)
      const content = await readFile(torrent.tmpPath)
      const uploads = await this.client.uploadTorrent(
        connection.getApiKey(),
        torrent.clientName,
        content
      )
      const upload = uploads[0]
      if (upload?.error) throw new Error(upload.error.message)

      await ActivityService.record(
        auth.user!.id,
        'torrent',
        (upload?.name || torrent.clientName).slice(0, 255)
      )
      session.flash('success', 'Fichier torrent envoyé à AllDebrid.')
    } catch (error) {
      session.flash('error', this.messageFor(error))
    }

    return response.redirect().toRoute('magnets.index')
  }

  async destroy({ auth, request, session, response }: HttpContext) {
    const { id } = await request.validateUsing(magnetIdValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      await this.client.deleteMagnet(connection.getApiKey(), id)
      await ActivityService.record(auth.user!.id, 'magnet_delete', `Magnet #${id} supprimé`)
      session.flash('success', 'Magnet supprimé de votre espace AllDebrid.')
    } catch (error) {
      session.flash('error', this.messageFor(error))
    }
    return response.redirect().toRoute('magnets.index')
  }

  async restart({ auth, request, session, response }: HttpContext) {
    const { id } = await request.validateUsing(magnetIdValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      await this.client.restartMagnet(connection.getApiKey(), id)
      await ActivityService.record(auth.user!.id, 'magnet_restart', `Magnet #${id} relancé`)
      session.flash('success', 'Magnet relancé.')
    } catch (error) {
      session.flash('error', this.messageFor(error))
    }
    return response.redirect().toRoute('magnets.index')
  }

  private messageFor(error: unknown) {
    return error instanceof AllDebridApiError || error instanceof Error
      ? error.message
      : 'AllDebrid est momentanément indisponible.'
  }

  private withMediaTokens(nodes: AllDebridFileNode[], userId: number): AllDebridFileNode[] {
    return nodes.map((node) => {
      if (node.e) return { ...node, e: this.withMediaTokens(node.e, userId) }
      if (!node.l) return node
      const media = this.mediaTokens.create(userId, node.l, node.n)
      return media ? { ...node, mediaToken: media.token, mediaKind: media.kind } : node
    })
  }
}
