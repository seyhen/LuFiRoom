import { useLayoutEffect, useRef } from 'react'
import { useStore } from './state/store'
import { Stage } from './scene/Stage'
import { TopBar } from './ui/TopBar'
import { Mixer } from './ui/Mixer'

export function App() {
  const night = useStore((s) => s.night)
  const seasoned = useStore((s) => s.taps >= 3) // les hotspots arrêtent de pulser
  const brand = useRef<HTMLDivElement>(null!), panel = useRef<HTMLDivElement>(null!), hotspots = useRef<HTMLDivElement>(null!)

  // Le mode nuit redéfinit les tokens d'interface.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('night', night)
  }, [night])

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
      <Stage hotspotLayer={hotspots} />
      <TopBar brandRef={brand} />
      <div className={seasoned ? 'hotspots seasoned' : 'hotspots'} ref={hotspots} />
      <Mixer panelRef={panel} />
    </>
  )
}
