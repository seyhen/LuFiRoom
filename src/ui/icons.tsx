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
  fire: svg(<><path d="M12 3c.6 3.2 4.7 5.1 4.7 9.6a4.7 4.7 0 0 1-9.4 0c0-2 .9-3.3 2.1-4.2.2 1.6.9 2.4 1.9 2.6C10.6 8.4 10.5 5.3 12 3z" /><path d="M12 20.3a2.1 2.1 0 0 1-2.1-2.1c0-1.1.7-1.8 2.1-3 1.4 1.2 2.1 1.9 2.1 3a2.1 2.1 0 0 1-2.1 2.1z" /></>),
  wind: svg(<><path d="M3 8.5h10.5a2.6 2.6 0 1 0-2.6-2.6" /><path d="M3 12.5h15.2a2.7 2.7 0 1 1-2.7 2.7" /><path d="M3 16.5h6.5a2.2 2.2 0 1 1-2.2 2.2" /></>),
  outside: svg(<><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M12 3v18M4 12h16" /></>),
}

/** Disque noir, étiquette au centre : le tourne-disque de la cabane. */
export const vinylIcon = svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.1" /><circle cx="12" cy="12" r=".6" /><path d="M5.6 9.2A7.2 7.2 0 0 1 9.2 5.6M18.4 14.8a7.2 7.2 0 0 1-3.6 3.6" /></>)

export const skipIcon = svg(<><path d="M6.5 5.5v13l9-6.5z" /><path d="M18.5 5.5v13" /></>)
export const mixIcon =svg(<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />)
export const shareIcon = svg(<><path d="M12 15.5v-11M8 8l4-4 4 4" /><path d="M5 12.5v5.8a1.7 1.7 0 0 0 1.7 1.7h10.6a1.7 1.7 0 0 0 1.7-1.7v-5.8" /></>)
export const saveIcon = svg(<><path d="M12 5v14M5 12h14" /></>)
export const closeIcon = svg(<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />)
export const timerIcon = svg(<><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.6 1.6M9.5 3h5" /></>)
export const installIcon = svg(<><path d="M12 3.5v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 19.5h14" /></>)
export const sunIcon = svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>)
export const moonIcon = svg(<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z" />)
