import { ShieldCheckIcon } from '@animateicons/react/lucide'
import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      'sitekey': string
      'action': string
      'theme': 'dark'
      'size': 'flexible'
      'appearance': 'always'
      'callback': (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    }
  ): string
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_ID = 'cloudflare-turnstile-script'

export function TurnstileWidget({
  siteKey,
  action,
}: {
  siteKey: string
  action: 'login' | 'signup'
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        'sitekey': siteKey,
        action,
        'theme': 'dark',
        'size': 'flexible',
        'appearance': 'always',
        'callback': (value) => {
          setToken(value)
          setStatus('ready')
        },
        'expired-callback': () => {
          setToken('')
          setStatus('loading')
        },
        'error-callback': () => {
          setToken('')
          setStatus('error')
        },
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = SCRIPT_ID
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderWidget)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [action, siteKey])

  return (
    <div className="captcha-field">
      <div className="captcha-heading">
        <ShieldCheckIcon aria-hidden="true" />
        <span>
          <strong>Protection anti-robot</strong>
          <small>Vérification Cloudflare Turnstile</small>
        </span>
      </div>
      <div ref={containerRef} className="turnstile-container" />
      <input type="hidden" name="turnstileToken" value={token} />
      <p className={`captcha-status ${status}`} aria-live="polite">
        {status === 'ready'
          ? 'Vérification réussie.'
          : status === 'error'
            ? 'La vérification a échoué. Rechargez la page pour réessayer.'
            : 'Vérification en cours…'}
      </p>
    </div>
  )
}
