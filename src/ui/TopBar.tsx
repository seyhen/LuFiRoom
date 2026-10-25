import { useEffect, useState, type Ref } from 'react'
import { useStore } from '../state/store'
import { useLang, useT } from '../i18n'
import { moonIcon, sunIcon } from './icons'
import { RoomPicker } from './RoomPicker'
import { InstallButton } from './InstallButton'

const now = () => new Date().toLocaleTimeString(useLang.getState().lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' })

/** Titre, phrase d'aide, heure (masquée sur mobile) et bouton jour / nuit (son infobulle dit s'il suit l'heure ou la main). */
export function TopBar({ brandRef }: { brandRef: Ref<HTMLDivElement> }) {
  const night = useStore((s) => s.night), held = useStore((s) => s.nightHold !== null)
  const lang = useLang((s) => s.lang), t = useT()
  const [time, setTime] = useState(now)
  useEffect(() => setTime(now()), [lang])
  useEffect(() => {
    const id = setInterval(() => setTime(now()), 15000)
    return () => clearInterval(id)
  }, [])
  return (
    <header className="top">
      <div className="brand" ref={brandRef}>
        <h1>LufiRoom</h1>
        <p>{t('Touche les objets pour composer ton ambiance. Glisse pour tourner la pièce.')}</p>
        <RoomPicker />
      </div>
      <div className="tools">
        <InstallButton />
        <span className="clock" aria-label={t('Heure locale')}>{time}</span>
        <button
          className="mode"
          type="button"
          aria-label={night ? t('Passer en journée') : t('Passer en nuit')}
          title={held ? (night ? t('Nuit choisie à la main, jusqu’au matin') : t('Jour choisi à la main, jusqu’au soir')) : t('Suit l’heure : nuit de 20 h à 7 h')}
          onClick={() => useStore.getState().toggleNight()}
        >
          {night ? moonIcon : sunIcon}
        </button>
        <button className="mode lang" type="button" lang={lang === 'fr' ? 'en' : 'fr'} aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'} onClick={() => useLang.getState().set(lang === 'fr' ? 'en' : 'fr')}>
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>
    </header>
  )
}
