import { unlockAudio } from '../audio/engine'
import { roomById } from '../rooms'
import type { PresetId } from '../rooms/types'
import { loadLast, type Mix } from '../state/mixes'
import { useStore } from '../state/store'
import { useT } from '../i18n'

const CHOICES: { id: PresetId; label: string }[] = [
  { id: 'work', label: 'Travailler' },
  { id: 'read', label: 'Lire' },
  { id: 'sleep', label: 'Dormir' },
]

/**
 * Sur le mixeur silencieux, de quoi lancer une ambiance d'un toucher : reprendre la dernière, ou l'une des trois toutes prêtes de la
 * pièce (travailler, lire, dormir ; « dormir » passe en nuit et lance le minuteur de sommeil). Elles disparaissent dès qu'un son joue.
 */
export function QuickStart() {
  const t = useT()
  const room = useStore((s) => roomById(s.room))
  const silent = useStore((s) => !roomById(s.room).sounds.some((x) => s.on[x.id]))
  const busy = useStore((s) => s.leaving !== null || s.shared !== null)
  if (!silent || busy) return null
  const last = loadLast()
  const play = (mix: Mix, sleepMin?: number) => {
    unlockAudio() // dans le geste : la pièce peut changer avant que les sons ne démarrent
    useStore.getState().applyMix(mix)
    if (sleepMin) useStore.getState().setSleep(sleepMin)
  }
  return (
    <div className="quick" role="group" aria-label={t('Lancer une ambiance')}>
      {last && (
        <button type="button" className="resume" onClick={() => play(last)}>
          {t('Reprendre')} · {t(roomById(last.room).name)}
        </button>
      )}
      {CHOICES.map(({ id, label }) => {
        const p = room.presets?.[id]
        if (!p) return null
        return (
          <button
            key={id}
            type="button"
            onClick={() =>
              play(
                {
                  room: room.id,
                  on: p.sounds.map(([sid]) => sid),
                  vol: Object.fromEntries(p.sounds),
                  night: p.night ?? useStore.getState().night,
                },
                id === 'sleep' ? 45 : undefined,
              )
            }
          >
            {t(label)}
          </button>
        )
      })}
    </div>
  )
}
