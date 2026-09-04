import ActivityService from '#services/activity_service'
import AllDebridService, {
  AllDebridApiError,
  type AllDebridUnlockedLink,
} from '#services/all_debrid_service'
import { findConnection, requireConnection } from '#services/connection_service'
import MediaTokenService from '#services/media_token_service'
import {
  delayedLinkValidator,
  streamingLinkValidator,
  unlockLinkValidator,
} from '#validators/all_debrid'
import type { HttpContext } from '@adonisjs/core/http'

export default class UnrestrictController {
  private client = new AllDebridService()
  private mediaTokens = new MediaTokenService()

  async index({ auth, inertia }: HttpContext) {
    return inertia.render('unrestrict', {
      connected: Boolean(await findConnection(auth.user!.id)),
      result: null,
      error: null,
      submittedLink: null,
    })
  }

  async store({ auth, request, inertia }: HttpContext) {
    const payload = await request.validateUsing(unlockLinkValidator)
    return this.run(auth.user!.id, inertia, payload.link, async (apiKey) => {
      return this.client.unlockLink(apiKey, payload.link, payload.password)
    })
  }

  async stream({ auth, request, inertia }: HttpContext) {
    const payload = await request.validateUsing(streamingLinkValidator)
    return this.run(auth.user!.id, inertia, null, async (apiKey) => {
      return this.client.getStreamingLink(apiKey, payload.id, payload.stream)
    })
  }

  async delayed({ auth, request, inertia }: HttpContext) {
    const payload = await request.validateUsing(delayedLinkValidator)
    try {
      const connection = await requireConnection(auth.user!.id)
      const result = await this.client.getDelayedLink(connection.getApiKey(), payload.id)
      return inertia.render('unrestrict', {
        connected: true,
        result: {
          filename: 'Lien en préparation',
          delayed: result.status === 1 ? payload.id : undefined,
          link: result.link,
          timeLeft: result.time_left,
          ...this.mediaFor(auth.user!.id, result.link, 'Lien en préparation'),
        },
        error: result.status === 3 ? 'AllDebrid n’a pas pu générer ce lien.' : null,
        submittedLink: null,
      })
    } catch (error) {
      return this.errorPage(inertia, error, null)
    }
  }

  private async run(
    userId: number,
    inertia: HttpContext['inertia'],
    submittedLink: string | null,
    operation: (apiKey: string) => Promise<AllDebridUnlockedLink>
  ) {
    try {
      const connection = await requireConnection(userId)
      const result = await operation(connection.getApiKey())
      const title = (result.filename || 'Lien déverrouillé').slice(0, 255)
      await ActivityService.record(
        userId,
        'unlock',
        title,
        result.delayed ? 'pending' : 'success',
        {
          host: result.host ?? null,
          size: result.filesize ?? null,
        }
      )
      return inertia.render('unrestrict', {
        connected: true,
        result: {
          ...result,
          ...this.mediaFor(userId, result.link, result.filename),
        },
        error: null,
        submittedLink,
      })
    } catch (error) {
      await ActivityService.record(userId, 'unlock', 'Échec du déverrouillage', 'error').catch(
        () => undefined
      )
      return this.errorPage(inertia, error, submittedLink)
    }
  }

  private errorPage(inertia: HttpContext['inertia'], error: unknown, submittedLink: string | null) {
    return inertia.render('unrestrict', {
      connected: true,
      result: null,
      error:
        error instanceof AllDebridApiError || error instanceof Error
          ? error.message
          : 'Impossible de déverrouiller ce lien.',
      submittedLink,
    })
  }

  private mediaFor(userId: number, link: string | undefined, filename: string) {
    if (!link) return {}
    const media = this.mediaTokens.create(userId, link, filename)
    return media ? { mediaToken: media.token, mediaKind: media.kind } : {}
  }
}
