import Activity, { type ActivityStatus } from '#models/activity'

export default class ActivityService {
  static async record(
    userId: number,
    action: string,
    title: string,
    status: ActivityStatus = 'success',
    metadata: Record<string, unknown> = {}
  ) {
    return Activity.create({ userId, action, title, status, metadata })
  }
}
