import AllDebridConnection from '#models/all_debrid_connection'
import ActivityService from '#services/activity_service'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { findConnection } from '#services/connection_service'
import { pinCheckValidator } from '#validators/all_debrid'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AllDebridConnectionsController {
  private client = new AllDebridService()

  async create({ inertia, session, response }: HttpContext) {
    try {
      const pinSession = await this.client.getPin()
      return inertia.render('settings', {
        connection: null,
        pinSession,
        pinPending: false,
      })
    } catch (error) {
      session.flash('error', this.messageFor(error))
      return response.redirect().toRoute('settings')
    }
  }

  async store({ auth, request, inertia, session, response }: HttpContext) {
    const payload = await request.validateUsing(pinCheckValidator)

    try {
      const pinStatus = await this.client.checkPin(payload.pin, payload.check)
      if (!pinStatus.activated || !pinStatus.apikey) {
        return inertia.render('settings', {
          connection: null,
          pinSession: {
            pin: payload.pin,
            check: payload.check,
            expires_in: pinStatus.expires_in,
            user_url: `https://alldebrid.com/pin/?pin=${encodeURIComponent(payload.pin)}`,
            base_url: 'https://alldebrid.com/pin/',
          },
          pinPending: true,
        })
      }

      const profile = await this.client.getUser(pinStatus.apikey)
      let connection = await findConnection(auth.user!.id)
      if (!connection) {
        connection = new AllDebridConnection()
        connection.userId = auth.user!.id
      }

      connection.setApiKey(pinStatus.apikey)
      connection.username = profile.username
      connection.accountEmail = profile.email
      connection.isPremium = profile.isPremium
      connection.premiumUntil = Number(profile.premiumUntil)
        ? DateTime.fromSeconds(Number(profile.premiumUntil))
        : null
      connection.lastSyncedAt = DateTime.now()
      await connection.save()

      await ActivityService.record(auth.user!.id, 'connection', 'Compte AllDebrid connecté')
      session.flash('success', 'Compte AllDebrid connecté en toute sécurité.')
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      session.flash('error', this.messageFor(error))
      return response.redirect().toRoute('settings')
    }
  }

  async destroy({ auth, session, response }: HttpContext) {
    const connection = await findConnection(auth.user!.id)
    if (connection) {
      await connection.delete()
      await ActivityService.record(auth.user!.id, 'connection', 'Compte AllDebrid déconnecté')
    }
    session.flash('success', 'La clé AllDebrid chiffrée a été supprimée.')
    return response.redirect().toRoute('settings')
  }

  private messageFor(error: unknown) {
    return error instanceof AllDebridApiError || error instanceof Error
      ? error.message
      : 'La connexion AllDebrid a échoué.'
  }
}
