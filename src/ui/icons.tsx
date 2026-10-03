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
  street: svg(<><path d="M6 20.5 9.4 3.5M18 20.5 14.6 3.5" /><path d="M12 5.5v2.2M12 11v2.2M12 16.5v2.2" /></>),
  murmur: svg(<><path d="M4.5 5.5h9a2 2 0 0 1 2 2v3.6a2 2 0 0 1-2 2H9.2L6 15.8v-2.7H4.5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z" /><path d="M18.4 9.4h1.1a2 2 0 0 1 2 2v2.6a2 2 0 0 1-2 2v2.2l-2.6-2.2h-2.7" /></>),
  espresso: svg(<><path d="M5 10.5h12v4a4.5 4.5 0 0 1-4.5 4.5h-3A4.5 4.5 0 0 1 5 14.5z" /><path d="M17 11.6h1.2a2.3 2.3 0 0 1 0 4.6H16.6" /><path d="M8.5 3.5c-.8 1 .8 1.8 0 2.9M12.5 3.5c-.8 1 .8 1.8 0 2.9" /></>),
  pages: svg(<><path d="M12 6.7C10 5.1 7 4.7 4 5.1v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5v-13c-3-.4-6 0-8 1.6z" /><path d="M12 6.7v13" /></>),
  waves: svg(<><path d="M2.5 9.5c1.6 0 2.4-1.5 4-1.5s2.4 1.5 4 1.5 2.4-1.5 4-1.5 2.4 1.5 4 1.5 2.4-1.5 3-1.5" /><path d="M2.5 14.5c1.6 0 2.4-1.5 4-1.5s2.4 1.5 4 1.5 2.4-1.5 4-1.5 2.4 1.5 4 1.5 2.4-1.5 3-1.5" /><path d="M5 19h14" /></>),
  gulls: svg(<><path d="M3 10c2.2-2.4 4.6-2.4 6.5 0 1.9-2.4 4.3-2.4 6.5 0" /><path d="M12 16c1.4-1.6 3-1.6 4.3 0 1.3-1.6 2.9-1.6 4.2 0" /></>),
  chimes: svg(<><path d="M5 4.5h14M8 4.5v8M12 4.5v11M16 4.5v6.5" /><circle cx="12" cy="19" r="1.6" /><path d="M8 12.5v1.5M16 11v1.5" /></>),
  rails: svg(<><path d="M8 3.5 5.5 20.5M16 3.5l2.5 17" /><path d="M7 7.5h10M6.5 12h11M6 16.5h12" /></>),
  tea: svg(<><path d="M7 7.5h10l-1.2 11a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8z" /><path d="M17 10h1.4a1.8 1.8 0 0 1 0 3.6h-1.7" /><path d="M13.5 3.5 11 12" /></>),
  city: svg(<><path d="M3 20.5h18" /><path d="M5 20.5V10h4v10.5M9 20.5V5.5h5v15M14 20.5V12h5v8.5" /><path d="M11 9h1M11 12h1M11 15h1" /></>),
  pigeons: svg(<><path d="M5 15.5c0-4 2.6-7.5 6.5-7.5 1.1-2.2 4-2.6 5.3-.6l2.7.4-2.2 1.6c.4 3.9-2.6 7.6-7.3 7.6H8l-2.5 2.5v-2.4" /><circle cx="15.2" cy="8.4" r=".4" /></>),
  keys: svg(<><rect x="2.5" y="7" width="19" height="11" rx="2.5" /><path d="M6 10.5h1M9.5 10.5h1M13 10.5h1M16.5 10.5h1M8 14.5h8" /></>),
  pencil: svg(<><path d="M15.5 4.5 19.5 8.5 9 19H5v-4z" /><path d="M13.5 6.5l4 4" /></>),
  kettle: svg(<><path d="M6.5 11a5.5 5.5 0 0 1 11 0v5.5a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3z" /><path d="M17.5 12.5 20.5 10M9 7.5a3 3 0 0 1 6 0" /><path d="M10 3.5v1" /></>),
  spring: svg(<><path d="M3.5 6.5h9.5l3 3" /><path d="M16 11.5c0 1.5-.8 2.2-.8 3.2" /><path d="M4 19c2 0 2.8-1.2 4.6-1.2s2.6 1.2 4.6 1.2 2.8-1.2 4.6-1.2" /></>),
  bamboo: svg(<><path d="M5 17.5 19 7.5" /><path d="M9.5 14.3 8 12.4M14.6 10.7l-1.5-1.9" /><path d="M4 20.5h16M18 19v1.5" /></>),
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
