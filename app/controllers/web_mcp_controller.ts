import AllDebridConnection from '#models/all_debrid_connection'
import ActivityService from '#services/activity_service'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { findConnection, requireConnection } from '#services/connection_service'
import {
  delayedLinkValidator,
  magnetIdValidator,
  magnetUploadValidator,
  pinCheckValidator,
  streamingLinkValidator,
  unlockLinkValidator,
} from '#validators/all_debrid'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class WebMcpController {
  private client = new AllDebridService()

  async status({ auth, response }: HttpContext) {
    try {
      const connection = await requireConnection(auth.user!.id)
      const [profile, magnets] = await Promise.all([
        this.client.getUser(connection.getApiKey()),
        this.client.getMagnets(connection.getApiKey()),
      ])
      return response.ok({
        connected: true,
        account: {
          username: profile.username,
          premium: profile.isPremium,
          premiumUntil: Number(profile.premiumUntil) || null,
        },
        magnets: magnets.map((magnet) => ({
          id: magnet.id,
          filename: magnet.filename,
          status: magnet.status,
          statusCode: magnet.statusCode,
          size: magnet.size,
          downloaded: magnet.downloaded ?? 0,
        })),
      })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async unlock({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(unlockLinkValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      const result = await this.client.unlockLink(
        connection.getApiKey(),
        payload.link,
        payload.password
      )
      await ActivityService.record(
        auth.user!.id,
        'webmcp_unlock',
        (result.filename || 'Lien déverrouillé via WebMCP').slice(0, 255),
        result.delayed ? 'pending' : 'success',
        { host: result.host ?? null, size: result.filesize ?? null }
      )
      return response.ok({
        filename: result.filename,
        filesize: result.filesize ?? null,
        host: result.host ?? null,
        downloadUrl: result.link ?? null,
        delayedId: result.delayed ?? null,
        streams: result.streams ?? [],
      })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async stream({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(streamingLinkValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      const result = await this.client.getStreamingLink(
        connection.getApiKey(),
        payload.id,
        payload.stream
      )
      return response.ok({
        filename: result.filename,
        filesize: result.filesize ?? null,
        downloadUrl: result.link ?? null,
        delayedId: result.delayed ?? null,
      })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async delayed({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(delayedLinkValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      return response.ok(await this.client.getDelayedLink(connection.getApiKey(), payload.id))
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async addMagnet({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(magnetUploadValidator)
    const magnets = payload.magnets
      .split(/\r?\n/)
      .map((magnet) => magnet.trim())
      .filter(Boolean)
      .slice(0, 30)

    try {
      const connection = await requireConnection(auth.user!.id)
      const uploads = await this.client.uploadMagnets(connection.getApiKey(), magnets)
      const successful = uploads.filter((upload) => upload.id && !upload.error)
      await ActivityService.record(
        auth.user!.id,
        'webmcp_magnet',
        `${successful.length} magnet(s) ajouté(s) via WebMCP`,
        successful.length ? 'success' : 'error',
        { count: successful.length }
      )
      return response.ok({
        accepted: successful.map((upload) => ({
          id: upload.id,
          name: upload.name,
          hash: upload.hash,
          ready: upload.ready,
          size: upload.size,
        })),
        rejected: uploads
          .filter((upload) => upload.error)
          .map((upload) => ({ input: upload.magnet, error: upload.error })),
      })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async files({ auth, params, response }: HttpContext) {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return response.badRequest({ error: 'Un identifiant de magnet positif est requis.' })
    }

    try {
      const connection = await requireConnection(auth.user!.id)
      const files = await this.client.getMagnetFiles(connection.getApiKey(), id)
      return response.ok({ magnetId: id, files })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async restartMagnet({ auth, request, response }: HttpContext) {
    const { id } = await request.validateUsing(magnetIdValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      await this.client.restartMagnet(connection.getApiKey(), id)
      await ActivityService.record(auth.user!.id, 'webmcp_magnet_restart', `Magnet #${id} relancé`)
      return response.ok({ restarted: true, magnetId: id })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async deleteMagnet({ auth, request, response }: HttpContext) {
    const { id } = await request.validateUsing(magnetIdValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      await this.client.deleteMagnet(connection.getApiKey(), id)
      await ActivityService.record(auth.user!.id, 'webmcp_magnet_delete', `Magnet #${id} supprimé`)
      return response.ok({ deleted: true, magnetId: id })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async startPin({ response }: HttpContext) {
    try {
      return response.ok(await this.client.getPin())
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async connectPin({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(pinCheckValidator)
    try {
      const result = await this.client.checkPin(payload.pin, payload.check)
      if (!result.activated || !result.apikey) {
        return response.ok({ connected: false, expiresIn: result.expires_in })
      }

      const profile = await this.client.getUser(result.apikey)
      let connection = await findConnection(auth.user!.id)
      if (!connection) {
        connection = new AllDebridConnection()
        connection.userId = auth.user!.id
      }
      connection.setApiKey(result.apikey)
      connection.username = profile.username
      connection.accountEmail = profile.email
      connection.isPremium = profile.isPremium
      connection.premiumUntil = Number(profile.premiumUntil)
        ? DateTime.fromSeconds(Number(profile.premiumUntil))
        : null
      connection.lastSyncedAt = DateTime.now()
      await connection.save()
      await ActivityService.record(
        auth.user!.id,
        'webmcp_connection',
        'Compte AllDebrid connecté via WebMCP'
      )
      return response.ok({
        connected: true,
        username: profile.username,
        premium: profile.isPremium,
      })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  async disconnect({ auth, response }: HttpContext) {
    try {
      const connection = await findConnection(auth.user!.id)
      if (connection) await connection.delete()
      await ActivityService.record(
        auth.user!.id,
        'webmcp_connection',
        'Compte AllDebrid déconnecté via WebMCP'
      )
      return response.ok({ disconnected: true })
    } catch (error) {
      return this.fail(response, error)
    }
  }

  private fail(response: HttpContext['response'], error: unknown) {
    const message =
      error instanceof AllDebridApiError || error instanceof Error
        ? error.message
        : 'La requête WebMCP a échoué.'
    const code = error instanceof AllDebridApiError ? error.code : 'BETTERDEBRID_ERROR'
    return response.unprocessableEntity({ error: message, code })
  }
}
