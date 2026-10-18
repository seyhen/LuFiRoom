import { useEffect, useState } from 'react'
import { useStore } from '../state/store'
import { reduceMotion } from '../scene/anim'

interface Passing {
  id: number
  kind: 'star' | 'bird'
  top: number
  left: number
}

/**
 * Le ciel du fond vit un peu : de temps en temps (toutes les 40 à 90 s), une étoile filante la nuit, un oiseau qui traverse le jour.
 * C'est du CSS derrière la scène : rien dans le rendu 3D. Rien du tout avec `prefers-reduced-motion`, ni quand l'onglet est caché.
 */
export function SkyLife() {
  const night = useStore((s) => s.night)
  const [list, setList] = useState<Passing[]>([])

  useEffect(() => {
    if (reduceMotion) return
    let timer = 0, id = 0
    const schedule = (first: boolean) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          const kind = night ? 'star' : 'bird'
          setList((l) => [...l.slice(-2), { id: ++id, kind, top: 6 + Math.random() * 22, left: kind === 'star' ? 30 + Math.random() * 60 : 0 }])
        }
        schedule(false)
      }, (first ? 12_000 + Math.random() * 12_000 : 40_000 + Math.random() * 50_000))
    }
    schedule(true)
    return () => clearTimeout(timer)
  }, [night])

  return (
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
  )
}
