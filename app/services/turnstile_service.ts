import { appUrl } from '#config/app'
import env from '#start/env'
import app from '@adonisjs/core/services/app'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const DEVELOPMENT_SECRET = '1x0000000000000000000000000000000AA'

type TurnstileResponse = {
  'success': boolean
  'hostname'?: string
  'action'?: string
  'error-codes'?: string[]
}

export default class TurnstileService {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async verify(token: string, remoteIp: string, expectedAction: 'login' | 'signup') {
    const configuredSecret = env.get('TURNSTILE_SECRET_KEY')
    if (app.inProduction && !configuredSecret) return false

    const body = new URLSearchParams({
      secret: configuredSecret?.release() ?? DEVELOPMENT_SECRET,
      response: token,
      remoteip: remoteIp,
    })

    try {
      const response = await this.fetcher(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(8_000),
      })
      if (!response.ok) return false

      const result = (await response.json()) as TurnstileResponse
      if (!result.success || result.action !== expectedAction) return false

      const expectedHostname = new URL(appUrl).hostname
      return !app.inProduction || result.hostname === expectedHostname
    } catch {
      return false
    }
  }
}
