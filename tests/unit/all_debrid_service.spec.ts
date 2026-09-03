import AllDebridService, { AllDebridApiError } from '#services/all_debrid_service'
import { test } from '@japa/runner'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test.group('AllDebrid service', () => {
  test('uses the official PIN endpoint and returns the session', async ({ assert }) => {
    const calls: string[] = []
    const fetcher = (async (input: string | URL | Request) => {
      calls.push(String(input))
      return jsonResponse({
        status: 'success',
        data: {
          pin: 'ABCD',
          check: 'check-token',
          expires_in: 600,
          user_url: 'https://alldebrid.com/pin/?pin=ABCD',
          base_url: 'https://alldebrid.com/pin/',
        },
      })
    }) as unknown as typeof fetch

    const service = new AllDebridService(fetcher)
    const pin = await service.getPin()

    assert.equal(calls[0], 'https://api.alldebrid.com/v4.1/pin/get')
    assert.equal(pin.pin, 'ABCD')
    assert.equal(pin.expires_in, 600)
  })

  test('sends API keys in the bearer header and never in the URL', async ({ assert }) => {
    let capturedUrl = ''
    let capturedAuthorization = ''
    const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(input)
      capturedAuthorization = new Headers(init?.headers).get('Authorization') ?? ''
      return jsonResponse({
        status: 'success',
        data: {
          user: {
            username: 'demo',
            email: 'demo@example.com',
            isPremium: true,
            isSubscribed: false,
            isTrial: false,
            premiumUntil: 1_800_000_000,
          },
        },
      })
    }) as unknown as typeof fetch

    const service = new AllDebridService(fetcher)
    const user = await service.getUser('top-secret')

    assert.equal(capturedUrl, 'https://api.alldebrid.com/v4/user')
    assert.notInclude(capturedUrl, 'top-secret')
    assert.equal(capturedAuthorization, 'Bearer top-secret')
    assert.isTrue(user.isPremium)
  })

  test('encodes magnet arrays using the documented fields', async ({ assert }) => {
    let body = ''
    const fetcher = (async (_input: string | URL | Request, init?: RequestInit) => {
      body = String(init?.body)
      return jsonResponse({
        status: 'success',
        data: { magnets: [{ id: 42, name: 'Ubuntu', ready: true }] },
      })
    }) as unknown as typeof fetch

    const service = new AllDebridService(fetcher)
    const result = await service.uploadMagnets('key', ['magnet:?xt=urn:btih:first', 'second'])

    const fields = new URLSearchParams(body)
    assert.deepEqual(fields.getAll('magnets[]'), ['magnet:?xt=urn:btih:first', 'second'])
    assert.equal(result[0].id, 42)
  })

  test('maps AllDebrid errors to a user-readable message', async ({ assert }) => {
    const fetcher = (async () =>
      jsonResponse({
        status: 'error',
        error: { code: 'LINK_HOST_NOT_SUPPORTED', message: 'Unsupported host' },
      })) as unknown as typeof fetch

    const service = new AllDebridService(fetcher)

    let capturedError: unknown
    try {
      await service.unlockLink('key', 'https://example.com/file')
    } catch (error) {
      capturedError = error
    }

    assert.instanceOf(capturedError, AllDebridApiError)
    assert.equal((capturedError as AllDebridApiError).code, 'LINK_HOST_NOT_SUPPORTED')
    assert.equal(
      (capturedError as AllDebridApiError).message,
      "Cet hébergeur n'est pas pris en charge."
    )
  })

  test('handles delayed link responses', async ({ assert }) => {
    const fetcher = (async () =>
      jsonResponse({
        status: 'success',
        data: { status: 2, time_left: 0, link: 'https://download.example/file' },
      })) as unknown as typeof fetch

    const service = new AllDebridService(fetcher)
    const result = await service.getDelayedLink('key', 123)

    assert.equal(result.status, 2)
    assert.equal(result.link, 'https://download.example/file')
  })
})
