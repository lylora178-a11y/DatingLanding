// Result-page CTA destination.
// Set VITE_CTA_URL in .env (see .env.example).
export const CTA_URL = import.meta.env.VITE_CTA_URL || 'https://www.eloriahub.com'

// 'download' = App Store / Google Play
// 'signup'  = email or web registration page
export const CTA_MODE = (import.meta.env.VITE_CTA_MODE || 'signup') as 'download' | 'signup'

export const CTA_LABEL: Record<typeof CTA_MODE, string> = {
  download: 'Download Free →',
  signup: 'Find Your Match →',
}
