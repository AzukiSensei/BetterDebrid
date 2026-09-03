import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityHeadersMiddleware {
  async handle({ response }: HttpContext, next: NextFn) {
    const output = await next()
    response.header('Permissions-Policy', 'tools=(self)')
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Cross-Origin-Opener-Policy', 'same-origin')
    return output
  }
}
