import User from '#models/user'
import TurnstileService from '#services/turnstile_service'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  private turnstile = new TurnstileService()

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { passwordConfirmation, terms, turnstileToken, ...payload } =
      await request.validateUsing(signupValidator)
    const captchaValid = await this.turnstile.verify(turnstileToken, request.ip(), 'signup')
    if (!captchaValid) {
      session.flash('error', 'La vérification anti-robot a expiré ou a échoué. Réessayez.')
      return response.redirect().back()
    }
    const user = await User.create({ ...payload })

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
