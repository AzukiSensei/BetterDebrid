import Activity from '#models/activity'
import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { findConnection } from '#services/connection_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class HistoryController {
  private client = new AllDebridService()

  async index({ auth, inertia }: HttpContext) {
    const userId = auth.user!.id
    const connection = await findConnection(userId)
    const activities = await Activity.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
      .limit(30)

    const serializedActivities = activities.map((activity) => ({
      id: activity.id,
      action: activity.action,
      status: activity.status,
      title: activity.title,
      createdAt: activity.createdAt.toISO()!,
    }))

    if (!connection) {
      return inertia.render('history', {
        connected: false,
        recentLinks: [],
        savedLinks: [],
        activities: serializedActivities,
        apiError: null,
      })
    }

    try {
      const [recentLinks, savedLinks] = await Promise.all([
        this.client.getHistory(connection.getApiKey()),
        this.client.getSavedLinks(connection.getApiKey()),
      ])
      return inertia.render('history', {
        connected: true,
        recentLinks,
        savedLinks,
        activities: serializedActivities,
        apiError: null,
      })
    } catch (error) {
      return inertia.render('history', {
        connected: true,
        recentLinks: [],
        savedLinks: [],
        activities: serializedActivities,
        apiError:
          error instanceof AllDebridApiError || error instanceof Error
            ? error.message
            : 'Historique AllDebrid indisponible.',
      })
    }
  }
}
