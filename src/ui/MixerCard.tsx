import type { CSSProperties, ReactNode } from 'react'
import { useStore } from '../state/store'
import type { RoomSound } from '../rooms/types'
import { soundIcons, vinylIcon } from './icons'

/** Un son : pastille, nom, sous-titre vivant (le bouton bascule) et curseur de volume, avec un bouton en plus si `extra`. */
export function MixerCard({ sound, extra }: { sound: RoomSound; extra?: ReactNode }) {
  const on = useStore((s) => s.on[sound.id])
  const vol = useStore((s) => s.vol[sound.id])
  const sub = useStore((s) => sound.sub(s))
  return (
    <div className={on ? 'card on' : 'card'}>
      <button className="tg" type="button" aria-pressed={on} onClick={() => useStore.getState().toggle(sound.id)}>
        <span className="ico" style={{ '--chip': sound.chip } as CSSProperties}>
          {sound.icon === 'vinyl' ? vinylIcon : soundIcons[sound.id]}
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="txt">
          <span className="nm">{sound.name}</span>
          <span className="sb" aria-live="polite">{sub}</span>
        </span>
      </button>
      <div className="vol">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(vol * 100)}
          aria-label={`Volume ${sound.name}`}
          onChange={(e) => useStore.getState().setVolume(sound.id, Number(e.target.value) / 100)}
        />
        {extra}
      </div>
    </div>
  )
}
