import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { SKY_NAMES, WEATHER_KINDS, skyOf, type Sky } from '../state/weather'
import { useT } from '../i18n'
import { skyIcons } from './icons'

const CHOICES: Sky[] = ['clear', ...WEATHER_KINDS]

/** Le sélecteur de météo, dans la barre du haut : son icône dit le temps qu'il fait ; il ouvre la liste, un toucher l'applique. */
export function WeatherPicker() {
  const sky = useStore(skyOf)
  const t = useT()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Le menu se ferme quand on touche ailleurs ou sur Échap.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', away)
    addEventListener('keydown', esc)
    return () => {
      removeEventListener('pointerdown', away)
      removeEventListener('keydown', esc)
    }
  }, [open])

  const choose = (w: Sky) => {
    useStore.getState().setWeather(w) // dans le geste : l'audio peut démarrer
    setOpen(false)
  }
  return (
    <div className="sky-pick" ref={root}>
      <button
        className={sky === 'clear' ? 'mode' : 'mode on'}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t('Météo')} : ${t(SKY_NAMES[sky])}`}
        title={t('Choisir la météo')}
        onClick={() => setOpen((o) => !o)}
      >
        {skyIcons[sky]}
      </button>
      {open && (
        <div className="sky-menu" role="group" aria-label={t('Choisir la météo')}>
          {CHOICES.map((w) => (
            <button key={w} type="button" aria-pressed={sky === w} onClick={() => choose(w)}>
              {skyIcons[w]}
              <span>{t(SKY_NAMES[w])}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
