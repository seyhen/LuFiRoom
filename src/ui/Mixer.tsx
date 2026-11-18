import { useCallback, useEffect, useRef, useState, type Ref } from 'react'
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
import { chevronIcon } from './icons'

const DOCK_KEY = 'chambre-lofi.dock'
// Le mixeur réduit ne montre plus que son en-tête : la pièce prend l'écran. Le choix est retenu d'une visite à l'autre.
const savedShut = () => {
  try {
    return localStorage.getItem(DOCK_KEY) === 'shut'
  } catch {
    return false
  }
}

/** Mixeur flottant : une carte par son, le compte des sons actifs et « Tout couper ». */
export function Mixer({ panelRef }: { panelRef: Ref<HTMLDivElement> }) {
  const { id, sounds, playlist } = useStore((s) => roomById(s.room))
  const t = useT(), en = useLang((s) => s.lang) === 'en'
  const n = useStore((s) => sounds.filter((x) => s.on[x.id]).length)
  // Indice de défilement : un fondu à droite tant qu'il reste des cartes, à gauche une fois la ligne défilée.
  const row = useRef<HTMLDivElement>(null)
  const [shut, setShut] = useState(savedShut)
  const toggle = () =>
    setShut((v) => {
      try {
        localStorage.setItem(DOCK_KEY, v ? 'open' : 'shut')
      } catch {
        // stockage indisponible : le choix vaut pour cette visite seulement
      }
      return !v
    })
  const fades = useCallback(() => {
    const el = row.current
    if (!el) return
    el.classList.toggle('more-r', el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    el.classList.toggle('more-l', el.scrollLeft > 4)
  }, [])
  useEffect(() => {
    fades()
    addEventListener('resize', fades)
    return () => removeEventListener('resize', fades)
  }, [fades, id, sounds.length, shut])
  return (
    <nav className="dock" aria-label={t("Mixeur d’ambiance")}>
      <div className={shut ? 'dock-inner shut' : 'dock-inner'} ref={panelRef}>
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
            <button
              className="fold"
              type="button"
              aria-expanded={!shut}
              aria-controls="mix-row"
              aria-label={shut ? t('Déployer le mixeur') : t('Réduire le mixeur')}
              title={shut ? t('Déployer le mixeur') : t('Réduire le mixeur')}
              onClick={toggle}
            >
              {chevronIcon}
            </button>
          </div>
        </div>
        <div className="mix" id="mix-row" hidden={shut} ref={row} onScroll={fades} key={id /* chaque pièce repart de la première carte */}>
          {sounds.map((s) => (
            // Avec des pistes enregistrées, la radio les joue dans l'ordre mélangé : un bouton « morceau suivant » ; sinon, les stations.
            <MixerCard key={s.id} sound={s} extra={s.id === 'radio' ? (playlist.length ? <TrackButton noun={s.skip} /> : <StationButton noun={s.skip} />) : undefined} />
          ))}
        </div>
      </div>
    </nav>
  )
}
