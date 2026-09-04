import User from '#models/user'
import TurnstileService from '#services/turnstile_service'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  private turnstile = new TurnstileService()

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password, remember, turnstileToken } =
      await request.validateUsing(loginValidator)
    const captchaValid = await this.turnstile.verify(turnstileToken, request.ip(), 'login')
    if (!captchaValid) {
      session.flash('error', 'La vérification anti-robot a expiré ou a échoué. Réessayez.')
      return response.redirect().back()
    }
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user, remember === true)
    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('home')
  }
}
