import { roomById } from '../rooms'
import { unlockAudio } from '../audio/engine'
import { mixName } from '../state/mixes'
import { useStore } from '../state/store'

/** Une ambiance reçue par un lien : elle attend un geste (l'audio ne démarre pas tout seul) pour être jouée. */
export function SharedMix() {
  const shared = useStore((s) => s.shared)
  const bottom = useStore((s) => s.insets.bottom)
  if (!shared) return null
  const listen = () => {
    unlockAudio()
    const s = useStore.getState()
    s.applyMix(shared)
    s.dismissShared()
  }
  return (
    <div className="shared" role="region" aria-label="Ambiance partagée" style={{ bottom: bottom + 8 }}>
      <p>
        <strong>Une ambiance t'attend</strong>
        <span>{mixName(shared)} · {roomById(shared.room).name}{shared.night ? ', de nuit' : ''}</span>
      </p>
      <div>
        <button type="button" className="go" onClick={listen}>
          Écouter
        </button>
        <button type="button" onClick={() => useStore.getState().dismissShared()}>
          Non merci
        </button>
      </div>
    </div>
  )
}
