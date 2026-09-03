import Activity from '#models/activity'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { findConnection } from '#services/connection_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class DashboardController {
  private client = new AllDebridService()

  async index({ auth, inertia }: HttpContext) {
    const userId = auth.user!.id
    const connection = await findConnection(userId)
    const activities = await Activity.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)

    if (!connection) {
      return inertia.render('dashboard', {
        connected: false,
        profile: null,
        magnets: [],
        recentLinks: [],
        activities: this.serializeActivities(activities),
        apiError: null,
      })
    }

    try {
      const apiKey = connection.getApiKey()
      const [profile, magnets, recentLinks] = await Promise.all([
        this.client.getUser(apiKey),
        this.client.getMagnets(apiKey),
        this.client.getHistory(apiKey),
      ])

      connection.username = profile.username
      connection.accountEmail = profile.email
      connection.isPremium = profile.isPremium
      connection.premiumUntil = Number(profile.premiumUntil)
        ? DateTime.fromSeconds(Number(profile.premiumUntil))
        : null
      connection.lastSyncedAt = DateTime.now()
      await connection.save()

      return inertia.render('dashboard', {
        connected: true,
        profile: {
          username: profile.username,
          isPremium: profile.isPremium,
          isTrial: profile.isTrial,
          premiumUntil: Number(profile.premiumUntil) || null,
          fidelityPoints: profile.fidelityPoints ?? 0,
        },
        magnets: magnets.slice(0, 6),
        recentLinks: recentLinks.slice(0, 4),
        activities: this.serializeActivities(activities),
        apiError: null,
      })
    } catch (error) {
      return inertia.render('dashboard', {
        connected: true,
        profile: {
          username: connection.username,
          isPremium: connection.isPremium,
          isTrial: false,
          premiumUntil: connection.premiumUntil?.toSeconds() ?? null,
          fidelityPoints: 0,
        },
        magnets: [],
        recentLinks: [],
        activities: this.serializeActivities(activities),
        apiError:
          error instanceof AllDebridApiError || error instanceof Error
            ? error.message
            : 'Synchronisation AllDebrid indisponible.',
      })
    }
  }

  private serializeActivities(activities: Activity[]) {
    return activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      status: activity.status,
      title: activity.title,
      createdAt: activity.createdAt.toISO()!,
    }))
  }
}
