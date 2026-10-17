import type { CSSProperties, MutableRefObject } from 'react'
import { Html } from '@react-three/drei'
import { isActive, useStore } from '../state/store'
import { useT } from '../i18n'
import type { Room, RoomObject } from '../rooms/types'

type Layer = MutableRefObject<HTMLDivElement>

/** Un vrai bouton par objet interactif, recalé chaque frame sur l'ancre 3D projetée. */
export function Hotspots({ room, layer }: { room: Room; layer: Layer }) {
  return (
    <>
      {room.objects.map((o, i) => (
        <Hotspot key={o.id} obj={o} delay={i * 0.37} layer={layer} />
      ))}
    </>
  )
}

function Hotspot({ obj, delay, layer }: { obj: RoomObject; delay: number; layer: Layer }) {
  const on = useStore((s) => isActive(s, obj.id))
  const t = useT()
  return (
    <Html position={obj.anchor} portal={layer}>
      <button
        type="button"
        className={on ? 'hs on' : 'hs'}
        aria-label={t(obj.label)}
        aria-pressed={on}
        style={{ '--d': `${delay.toFixed(2)}s` } as CSSProperties}
        onClick={() => useStore.getState().toggle(obj.target)}
      >
        <span className="lbl">{t(obj.label)}</span>
      </button>
    </Html>
  )
}
