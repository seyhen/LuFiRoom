import type { ReactNode } from 'react'
import type { SoundId } from '../rooms/types'

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const soundIcons: Record<SoundId, ReactNode> = {
  radio: svg(<><rect x="3" y="8.5" width="18" height="11.5" rx="3.2" /><circle cx="8.5" cy="14.2" r="2.6" /><path d="M14.5 12.5h3.5M14.5 16h3.5M8 8.5 15.5 3.5" /></>),
  rain: svg(<><path d="M7.2 15a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.3 1.7A3.2 3.2 0 0 1 17.6 15z" /><path d="M8.5 18.2 7.6 20.4M12.5 18.2l-.9 2.2M16.5 18.2l-.9 2.2" /></>),
  fan: svg(<><circle cx="12" cy="10.5" r="7.5" /><circle cx="12" cy="10.5" r="1.4" /><path d="M12 9.1c-.4-2.4.3-4.3 1.6-4.4M13.3 11.2c2.2.9 3.4 2.4 2.9 3.6M10.7 11.2c-1.9 1.4-3.8 1.7-4.5.6M12 18v3M9 21h6" /></>),
  purr: svg(<><path d="M5 9.5 5.6 4l4.2 3h4.4l4.2-3 .6 5.5c.7 1.2 1 2.4 1 3.7 0 4-3.6 6.8-8 6.8s-8-2.8-8-6.8c0-1.3.3-2.5 1-3.7z" /><path d="M8.6 13.2c.5.4 1.1.4 1.6 0M13.8 13.2c.5.4 1.1.4 1.6 0M11.2 15.6h1.6l-.8.8z" /></>),
  outside: svg(<><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M12 3v18M4 12h16" /></>),
}

export const sunIcon = svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>)
export const moonIcon = svg(<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z" />)
