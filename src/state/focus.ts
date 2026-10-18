import { create } from 'zustand'

/** Le minuteur de concentration : des séquences travail / pause (méthode Pomodoro). `end` : l'échéance de la phase, en ms. */
interface Focus {
  phase: 'idle' | 'work' | 'break'
  end: number
  work: number
  brk: number
  /** Séquences de travail terminées depuis le départ. */
  done: number
  start: (workMin: number, breakMin: number) => void
  stop: () => void
  /** Passe à la phase suivante (travail → pause → travail). */
  next: () => void
}

export const useFocus = create<Focus>((set, get) => ({
  phase: 'idle',
  end: 0,
  work: 25,
  brk: 5,
  done: 0,
  start: (work, brk) => set({ phase: 'work', work, brk, end: Date.now() + work * 60_000, done: 0 }),
  stop: () => set({ phase: 'idle', end: 0 }),
  next: () => {
    const s = get()
    if (s.phase === 'work') set({ phase: 'break', end: Date.now() + s.brk * 60_000, done: s.done + 1 })
    else if (s.phase === 'break') set({ phase: 'work', end: Date.now() + s.work * 60_000 })
  },
}))

// Pont de développement (retiré du build) : pour essayer les phases sans attendre vingt-cinq minutes.
if (import.meta.env.DEV) ((window as unknown as { __lofi?: Record<string, unknown> }).__lofi ??= {}).focus = useFocus
