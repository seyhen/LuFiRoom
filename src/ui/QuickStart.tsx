import { unlockAudio } from '../audio/engine'
import { roomById } from '../rooms'
import { loadLast, type Mix } from '../state/mixes'
import { useStore } from '../state/store'
import { useT } from '../i18n'

/**
 * Sur le mixeur silencieux, de quoi reprendre la dernière ambiance d'un toucher. Le bouton disparaît dès qu'un son joue.
 */
export function QuickStart() {
  const t = useT()
  const silent = useStore((s) => !roomById(s.room).sounds.some((x) => s.on[x.id]))
  const busy = useStore((s) => s.leaving !== null || s.shared !== null)
  if (!silent || busy) return null
  const last = loadLast()
  const play = (mix: Mix) => {
    unlockAudio() // dans le geste : la pièce peut changer avant que les sons ne démarrent
    useStore.getState().applyMix(mix)
  }
  return (
    <div className="quick" role="group" aria-label={t('Lancer une ambiance')}>
      {last && (
        <button type="button" className="resume" onClick={() => play(last)}>
          {t('Reprendre')} · {t(roomById(last.room).name)}
        </button>
      )}
    </div>
  )
}
