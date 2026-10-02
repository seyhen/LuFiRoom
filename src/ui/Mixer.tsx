import type { Ref } from 'react'
import { useStore } from '../state/store'
import { sounds } from '../rooms/bedroom'
import { MixerCard } from './MixerCard'

/** Mixeur flottant : une carte par son, le compte des sons actifs et « Tout couper ». */
export function Mixer({ panelRef }: { panelRef: Ref<HTMLDivElement> }) {
  const n = useStore((s) => sounds.filter((x) => s.on[x.id]).length)
  return (
    <nav className="dock" aria-label="Mixeur d'ambiance">
      <div className="dock-inner" ref={panelRef}>
        <div className="dock-head">
          <span className="eyebrow">Ambiance</span>
          <span className="count">{n === 0 ? 'silence' : `${n} son${n > 1 ? 's' : ''} actif${n > 1 ? 's' : ''}`}</span>
          <button className="mute" type="button" hidden={n === 0} onClick={() => useStore.getState().muteAll()}>
            Tout couper
          </button>
        </div>
        <div className="mix">
          {sounds.map((s) => (
            <MixerCard key={s.id} sound={s} />
          ))}
        </div>
      </div>
    </nav>
  )
}
