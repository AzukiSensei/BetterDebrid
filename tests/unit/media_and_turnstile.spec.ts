import {
  detectMediaKind,
  mediaExtension,
  prefersNativePlayback,
} from '#services/media_token_service'
import TurnstileService from '#services/turnstile_service'
import { test } from '@japa/runner'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test.group('Media detection', () => {
  test('recognizes native Matroska playback before using the compatibility stream', ({
    assert,
  }) => {
    assert.equal(mediaExtension('Film.Final.MKV?token=hidden'), 'mkv')
    assert.equal(detectMediaKind('Film.Final.MKV'), 'video')
    assert.isTrue(prefersNativePlayback('Film.Final.MKV', 'video'))
    assert.equal(detectMediaKind('Concert.FLAC'), 'audio')
  })

  test('rejects non-media filenames', ({ assert }) => {
    assert.isNull(detectMediaKind('archive.zip'))
    assert.isNull(detectMediaKind('README'))
  })
})

test.group('Turnstile verification', () => {
  test('accepts a successful token only for the expected action', async ({ assert }) => {
    const fetcher = (async () =>
      jsonResponse({
        success: true,
        action: 'login',
        hostname: 'localhost',
      })) as unknown as typeof fetch
    const service = new TurnstileService(fetcher)

    assert.isTrue(await service.verify('token', '127.0.0.1', 'login'))
    assert.isFalse(await service.verify('token', '127.0.0.1', 'signup'))
  })

  test('fails closed on a network or provider error', async ({ assert }) => {
    const fetcher = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    const service = new TurnstileService(fetcher)

    assert.isFalse(await service.verify('token', '127.0.0.1', 'login'))
  })
})
