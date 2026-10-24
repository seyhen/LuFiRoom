import type { Ref } from 'react'
import { useStore } from '../state/store'
import { useLang, useT } from '../i18n'
import { roomById } from '../rooms'
import { MixerCard } from './MixerCard'
import { SleepTimer } from './SleepTimer'
import { MixesMenu } from './MixesMenu'
import { StationButton, TrackButton } from './StationButton'
import { QuickStart } from './QuickStart'
import { FocusTimer } from './FocusTimer'
import { MasterVolume } from './MasterVolume'

/** Mixeur flottant : une carte par son, le compte des sons actifs et « Tout couper ». */
export function Mixer({ panelRef }: { panelRef: Ref<HTMLDivElement> }) {
  const { id, sounds, playlist } = useStore((s) => roomById(s.room))
  const t = useT(), en = useLang((s) => s.lang) === 'en'
  const n = useStore((s) => sounds.filter((x) => s.on[x.id]).length)
  return (
    <nav className="dock" aria-label={t("Mixeur d’ambiance")}>
      <div className="dock-inner" ref={panelRef}>
        <QuickStart />
        <div className="dock-head">
          <span className="eyebrow">{t('Ambiance')}</span>
          <span className="count">{n === 0 ? t('silence') : en ? `${n} sound${n > 1 ? 's' : ''} on` : `${n} son${n > 1 ? 's' : ''} actif${n > 1 ? 's' : ''}`}</span>
          <div className="head-end">
            <MasterVolume />
            <MixesMenu />
            <FocusTimer />
            <SleepTimer />
            <button className="mute" type="button" hidden={n === 0} onClick={() => useStore.getState().muteAll()}>
              {t('Tout couper')}
            </button>
          </div>
        </div>
        <div className="mix" key={id /* chaque pièce repart de la première carte */}>
          {sounds.map((s) => (
            // Avec des pistes enregistrées, la radio les joue dans l'ordre mélangé : un bouton « morceau suivant » ; sinon, les stations.
            <MixerCard key={s.id} sound={s} extra={s.id === 'radio' ? (playlist.length ? <TrackButton noun={s.skip} /> : <StationButton noun={s.skip} />) : undefined} />
          ))}
        </div>
      </div>
    </nav>
  )
}
