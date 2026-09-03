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
    })
  }
}
