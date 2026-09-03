import type { HttpContext } from '@adonisjs/core/http'

export default class LegalController {
  privacy({ inertia }: HttpContext) {
    return inertia.render('legal/privacy', {})
  }

  notice({ inertia }: HttpContext) {
    return inertia.render('legal/notice', {})
  }
}
