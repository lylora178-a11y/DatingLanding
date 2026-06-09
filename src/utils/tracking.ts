export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export function getUtmParams(): UtmParams {
  const params = new URLSearchParams(window.location.search)
  const utm: UtmParams = {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
  for (const key of keys) {
    const value = params.get(key)
    if (value) utm[key] = value
  }
  return utm
}

export function trackEvent(event: string, data?: Record<string, string>) {
  const utm = getUtmParams()
  const payload = { event, ...utm, ...data, timestamp: new Date().toISOString() }

  // Pinterest conversion event (uncomment when tag is active)
  // if (typeof window.pintrk === 'function') {
  //   window.pintrk('track', event, data)
  // }

  if (import.meta.env.DEV) {
    console.log('[track]', payload)
  }

  try {
    const history = JSON.parse(sessionStorage.getItem('events') || '[]')
    history.push(payload)
    sessionStorage.setItem('events', JSON.stringify(history.slice(-50)))
  } catch {
    // ignore storage errors
  }
}

export function scrollToSignup() {
  document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
