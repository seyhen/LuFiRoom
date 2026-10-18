import { useEffect, useRef, useState } from 'react'
import { chime } from '../audio/engine'
import { useFocus } from '../state/focus'
import { useLang, useT } from '../i18n'
import { focusIcon } from './icons'

const CHOICES = [
  { work: 25, brk: 5, label: '25 min · pause 5 min' },
  { work: 50, brk: 10, label: '50 min · pause 10 min' },
]

const two = (n: number) => String(n).padStart(2, '0')
const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${two(Math.floor(s / 60))}:${two(s % 60)}`
}

/**
 * Minuteur de concentration : des séquences de travail et de pause (25 / 5 ou 50 / 10), un carillon à chaque changement de phase.
 * Pendant qu'il tourne : l'écran reste allumé (Wake Lock, là où le navigateur le permet) et le temps restant passe dans le titre de l'onglet.
 */
export function FocusTimer() {
  const t = useT(), en = useLang((s) => s.lang) === 'en'
  const { phase, end, done, start, stop, next } = useFocus()
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const active = phase !== 'idle'

  // Le temps passe : à l'échéance, carillon et phase suivante. L'horloge murale (Date.now) tient quand l'onglet est ralenti.
  useEffect(() => {
    if (!active) return
    const tick = () => {
      const rest = end - Date.now()
      if (rest <= 0) {
        chime(phase === 'work')
        next()
      } else setLeft(rest)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active, end, phase, next])

  // L'écran reste allumé pendant la séance ; il faut le redemander quand l'onglet redevient visible (le navigateur le relâche).
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null, gone = false
    const ask = () =>
      navigator.wakeLock.request('screen').then(
        (l) => {
          if (gone) void l.release()
          else lock = l
        },
        () => {},
      )
    const visible = () => document.visibilityState === 'visible' && ask()
    ask()
    document.addEventListener('visibilitychange', visible)
    return () => {
      gone = true
      document.removeEventListener('visibilitychange', visible)
      lock?.release().catch(() => {})
    }
  }, [active])

  // Le titre de l'onglet porte le temps restant, pour le voir sans changer d'onglet.
  useEffect(() => {
    if (!active) return
    const base = document.title
    document.title = `${clock(left)} · ${phase === 'work' ? t('Travail') : t('Pause')} · ${base}`
    return () => {
      document.title = base
    }
  }, [active, left, phase, t])

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

  const phaseName = phase === 'work' ? t('Travail') : t('Pause')
  return (
    <div className="pop" ref={root}>
      <button
        className={active ? 'pop-btn on' : 'pop-btn'}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={active ? (en ? `Focus, ${phaseName}, ${clock(left)} left` : `Concentration, ${phaseName}, il reste ${clock(left)}`) : t('Concentration')}
        onClick={() => setOpen((o) => !o)}
      >
        {focusIcon}
        <span className={active ? undefined : 'lbl'}>{active ? clock(left) : t('Concentration')}</span>
      </button>
      {open && (
        <div className="pop-menu" role="group" aria-label={t('Travail et pauses')}>
          {CHOICES.map((c) => (
            <button
              key={c.work}
              type="button"
              onClick={() => {
                start(c.work, c.brk)
                setOpen(false)
              }}
            >
              {t(c.label)}
            </button>
          ))}
          {active && (
            <p className="pop-note">
              {phaseName} · {en ? `${done} done` : `${done} terminée${done > 1 ? 's' : ''}`}
            </p>
          )}
          {active && (
            <button
              type="button"
              className="cancel"
              onClick={() => {
                stop()
                setOpen(false)
              }}
            >
              {t('Arrêter la concentration')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
