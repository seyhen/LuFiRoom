import { useLayoutEffect, useRef } from 'react'
import { useStore } from './state/store'
import { roomById } from './rooms'
import type { UiToken } from './rooms/types'
import { Stage } from './scene/Stage'
import { TopBar } from './ui/TopBar'
import { Mixer } from './ui/Mixer'
import { SharedMix } from './ui/SharedMix'
import { SkyLife } from './ui/SkyLife'
import { WeatherSky } from './ui/WeatherSky'
import { DUSK } from './state/daylight'

const UI_TOKENS: UiToken[] = ['accent', 'ink', 'ink-soft', 'panel', 'line', 'bg']

export function App() {
  const night = useStore((s) => s.night), dusk = useStore((s) => s.dusk)
  const room = useStore((s) => roomById(s.room))
  const leaving = useStore((s) => s.leaving !== null) // la scène s'efface : voir app.css
  const seasoned = useStore((s) => s.taps >= 3) // les hotspots arrêtent de pulser
  const brand = useRef<HTMLDivElement>(null!), panel = useRef<HTMLDivElement>(null!), hotspots = useRef<HTMLDivElement>(null!)

  // Le ciel du fond et les couleurs d'interface sont ceux de la pièce (le changement se fait pendant que la scène est effacée).
  useLayoutEffect(() => {
    const st = document.documentElement.style
    room.sky.day.forEach((c, i) => st.setProperty(`--day-${i + 1}`, c))
    room.sky.night.forEach((c, i) => st.setProperty(`--night-${i + 1}`, c))
    for (const token of UI_TOKENS) {
      const [d, n] = room.ui?.[token] ?? []
      if (d) st.setProperty(`--${token}-d`, d)
      else st.removeProperty(`--${token}-d`)
      if (n) st.setProperty(`--${token}-n`, n)
      else st.removeProperty(`--${token}-n`)
    }
  }, [room])

  // Le mode nuit redéfinit les tokens d'interface (classe `night`) et le ciel du fond (classe `night-sky`). Au crépuscule (l'horloge,
  // classe `dusk`), le ciel passe en `DUSK` secondes et l'interface change à mi-chemin, quand la pièce est à moitié dans le soir.
  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dusk', dusk)
    html.classList.toggle('night-sky', night)
    const flip = () => {
      html.classList.toggle('night', night)
      // La barre du navigateur (et celle de l'app installée) prend la couleur du fond.
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', getComputedStyle(html).getPropertyValue('--bg').trim())
    }
    if (!dusk || html.classList.contains('night') === night) return flip()
    const t = window.setTimeout(flip, (DUSK * 1000) / 2)
    return () => clearTimeout(t)
  }, [night, dusk, room])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('leaving', leaving)
  }, [leaving])

  // Mesure la place prise par le titre et le mixeur, pour cadrer la pièce entre les deux.
  useLayoutEffect(() => {
    const measure = () =>
      useStore.setState({
        insets: { top: brand.current.getBoundingClientRect().bottom + 8, bottom: innerHeight - panel.current.getBoundingClientRect().top + 8 },
      })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(brand.current)
    ro.observe(panel.current)
    addEventListener('resize', measure)
    document.fonts.ready.then(measure)
    return () => {
      ro.disconnect()
      removeEventListener('resize', measure)
    }
  }, [])

  return (
    <>
      <div className="sky sky-day" aria-hidden="true" />
      <div className="sky sky-night" aria-hidden="true" />
      <WeatherSky />
      <SkyLife />
      <Stage hotspotLayer={hotspots} />
      <TopBar brandRef={brand} />
      <div className={seasoned ? 'hotspots seasoned' : 'hotspots'} ref={hotspots} />
      <Mixer panelRef={panel} />
      <SharedMix />
    </>
  )
}
