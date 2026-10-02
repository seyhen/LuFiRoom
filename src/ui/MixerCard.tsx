import type { CSSProperties } from 'react'
import { useStore } from '../state/store'
import type { RoomSound } from '../rooms/bedroom'
import { soundIcons } from './icons'

/** Un son : pastille, nom, sous-titre vivant (le bouton bascule) et curseur de volume. */
export function MixerCard({ sound }: { sound: RoomSound }) {
  const on = useStore((s) => s.on[sound.id])
  const vol = useStore((s) => s.vol[sound.id])
  const sub = useStore((s) => sound.sub(s))
  return (
    <div className={on ? 'card on' : 'card'}>
      <button className="tg" type="button" aria-pressed={on} onClick={() => useStore.getState().toggle(sound.id)}>
        <span className="ico" style={{ '--chip': sound.chip } as CSSProperties}>
          {soundIcons[sound.id]}
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="txt">
          <span className="nm">{sound.name}</span>
          <span className="sb">{sub}</span>
        </span>
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(vol * 100)}
        aria-label={`Volume ${sound.name}`}
        onChange={(e) => useStore.getState().setVolume(sound.id, Number(e.target.value) / 100)}
      />
    </div>
  )
}
