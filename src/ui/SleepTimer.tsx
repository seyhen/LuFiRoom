import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { timerIcon } from './icons'

const CHOICES = [{ min: 15, label: '15 min' }, { min: 30, label: '30 min' }, { min: 60, label: '1 h' }, { min: 120, label: '2 h' }]

const two = (n: number) => String(n).padStart(2, '0')
/** Temps restant : 29:41, ou 1 h 05 au-delà d'une heure. */
function remaining(ms: number) {
  const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h ? `${h} h ${two(m)}` : `${two(m)}:${two(s % 60)}`
}

/** Minuteur de sommeil : au bout du temps choisi, tous les sons s'éteignent en fondu. */
export function SleepTimer() {
  const end = useStore((s) => s.sleepEnd)
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(0)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (end === null) return
    const tick = () => setLeft(Math.max(0, end - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [end])

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

  const choose = (min: number | null) => {
    useStore.getState().setSleep(min)
    setOpen(false)
  }
  return (
    <div className="sleep" ref={root}>
      <button
        className={end === null ? 'sleep-btn' : 'sleep-btn on'}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={end === null ? 'Minuteur de sommeil' : `Minuteur de sommeil, il reste ${remaining(left)}`}
        onClick={() => setOpen((o) => !o)}
      >
        {timerIcon}
        <span>{end === null ? 'Minuteur' : remaining(left)}</span>
      </button>
      {open && (
        <div className="sleep-menu" role="group" aria-label="Éteindre en fondu dans…">
          {CHOICES.map((c) => (
            <button key={c.min} type="button" onClick={() => choose(c.min)}>
              {c.label}
            </button>
          ))}
          {end !== null && (
            <button type="button" className="cancel" onClick={() => choose(null)}>
              Annuler le minuteur
            </button>
          )}
        </div>
      )}
    </div>
  )
}
