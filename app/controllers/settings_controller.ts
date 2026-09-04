import { findConnection } from '#services/connection_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async index({ auth, inertia }: HttpContext) {
    const connection = await findConnection(auth.user!.id)

    return inertia.render('settings', {
      connection: connection
        ? {
            username: connection.username,
            accountEmail: connection.accountEmail,
            isPremium: connection.isPremium,
            premiumUntil: connection.premiumUntil?.toISO() ?? null,
            lastSyncedAt: connection.lastSyncedAt?.toISO() ?? null,
          }
        : null,
      pinSession: null,
      pinPending: false,
      preferredPlayer: auth.user!.preferredPlayer,
    })
  }

  async updatePlayer({ auth, request, response, session }: HttpContext) {
    const preferredPlayer = String(request.input('preferredPlayer', 'browser')) as
      'browser' | 'vlc' | 'mpv'
    if (!['browser', 'vlc', 'mpv'].includes(preferredPlayer)) {
      session.flash('error', 'Le lecteur sélectionné est invalide.')
      return response.redirect().toRoute('settings')
    }

    auth.user!.preferredPlayer = preferredPlayer
    await auth.user!.save()
    session.flash('success', 'Votre lecteur préféré a été enregistré.')
    return response.redirect().toRoute('settings')
  }
}
