import { test } from '@japa/runner'

test.group('Health and security headers', () => {
  test('health endpoint is available without authentication', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBody({ status: 'ok', service: 'betterdebrid' })
    response.assertHeader('permissions-policy', 'tools=(self)')
    response.assertHeader('referrer-policy', 'strict-origin-when-cross-origin')
  })

  test('private workspace redirects guests to login', async ({ client }) => {
    const response = await client.get('/app').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/connexion')
  })

  test('public landing page exposes the French document shell', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertTextIncludes('<html lang="fr">')
    response.assertTextIncludes('BetterDebrid')
  })
})
