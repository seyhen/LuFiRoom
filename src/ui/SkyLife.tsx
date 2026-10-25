import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { skyOf } from '../state/weather'
import { roomById } from '../rooms'
import { DUSK } from '../state/daylight'
import { reduceMotion } from '../motion'

interface Passing {
  id: number
  kind: 'star' | 'bird'
  top: number
  left: number
}

/**
 * Le ciel du fond, derrière la pièce. C'est du CSS (des opacités et des déplacements, que le compositeur anime seul) : rien dans le
 * rendu 3D, aucune écriture de style à chaque image.
 * - De loin en loin (toutes les une à deux minutes et demie), une étoile filante la nuit, un oiseau qui traverse le jour ;
 *   pas sous la pluie ni la neige, ni là où la fiche de la pièce l'écarte (`skyLife`). Rien avec `prefers-reduced-motion`, ni onglet caché.
 * - L'orage : une lueur pâle derrière la pièce à chaque éclair (pas sur l'interface, pas avec `prefers-reduced-motion`).
 * - Le crépuscule et l'aube, quand l'horloge fait passer la pièce au soir ou au matin : une lueur dorée et rose qui monte puis s'efface.
 */
export function SkyLife() {
  const night = useStore((s) => s.night), dusk = useStore((s) => s.dusk), roomId = useStore((s) => s.room)
  const [list, setList] = useState<Passing[]>([])
  const flash = useRef<HTMLDivElement>(null!), glow = useRef<HTMLDivElement>(null!)
  const room = roomById(roomId), sky = room.skyLife

  // Étoiles et oiseaux.
  useEffect(() => {
    setList([])
    if (reduceMotion || sky === false) return
    const kind: Passing['kind'] = night ? 'star' : 'bird'
    if ((kind === 'star' && sky?.star === false) || (kind === 'bird' && sky?.bird === false)) return
    let timer = 0, id = 0
    const schedule = (first: boolean) => {
      timer = window.setTimeout(() => {
        const s = useStore.getState()
        const clear = skyOf(s) === 'clear' && !(room.storm && s.on[room.storm])
        if (document.visibilityState === 'visible' && clear && !s.leaving)
          setList((l) => [...l.slice(-1), { id: ++id, kind, top: kind === 'star' ? 8 + Math.random() * 18 : 24 + Math.random() * 14, left: kind === 'star' ? 35 + Math.random() * 50 : 0 }])
        schedule(false)
      }, first ? 20_000 + Math.random() * 25_000 : 60_000 + Math.random() * 90_000)
    }
    schedule(true)
    return () => clearTimeout(timer)
  }, [night, room, sky])

  // L'éclair.
  useEffect(() => {
    if (reduceMotion) return
    return useStore.subscribe((s, p) => {
      if (s.thunders === p.thunders || !flash.current.animate) return
      flash.current.animate(
        [{ opacity: 0 }, { opacity: 0.26, offset: 0.05 }, { opacity: 0.05, offset: 0.2 }, { opacity: 0.16, offset: 0.27 }, { opacity: 0 }],
        { duration: 1400, easing: 'ease-out' },
      )
    })
  }, [])

  // Le crépuscule : une lueur qui monte jusqu'au milieu du passage, puis s'efface.
  // Elle part avec le passage lui-même (pas à un changement de pièce) et s'arrête net si l'on reprend la main.
  useEffect(() => {
    if (!dusk || roomById(useStore.getState().room).skyLife === false || !glow.current.animate) return
    const a = glow.current.animate([{ opacity: 0 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], { duration: DUSK * 1000, easing: 'ease-in-out' })
    return () => a.cancel()
  }, [night, dusk])

  return (
    <>
      <div className="sky-dusk" ref={glow} aria-hidden="true" />
      <div className="sky-life" aria-hidden="true">
        {list.map((p) => (
          <i
            key={p.id}
            className={p.kind}
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
            onAnimationEnd={() => setList((l) => l.filter((x) => x.id !== p.id))}
          />
        ))}
      </div>
      <div className="sky-flash" ref={flash} aria-hidden="true" />
    </>
  )
}
