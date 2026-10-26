import type { Channel } from './engine'
import { useStore } from '../state/store'
import type { SoundId } from '../rooms/types'

/**
 * Fait savoir à la scène qu'un geste s'entend à l'instant `t` (horloge audio) : le compteur `pulses[id]` du store avance à ce
 * moment-là, et l'objet bouge avec le son (le thermos verse, l'aiguille pique). Rien si l'onglet est caché : personne ne regarde.
 */
export function pulse(ctx: BaseAudioContext, id: SoundId, t: number) {
  window.setTimeout(() => {
    if (document.hidden) return
    useStore.setState((s) => ({ pulses: { ...s.pulses, [id]: (s.pulses[id] ?? 0) + 1 } }))
  }, Math.max(0, (t - ctx.currentTime) * 1000))
}

/**
 * Canal fait d'évènements ponctuels (une tasse qui tinte, une page qui se tourne) : toutes les `ms`, `step(until)` programme
 * ce qui tombe avant l'instant `until` (horloge audio). L'ordonnanceur s'arrête 1.5 s après l'extinction, le temps du fondu.
 */
export function scheduled(ctx: BaseAudioContext, step: (until: number) => void, ms = 100): Channel {
  let timer = 0, stopT = 0
  const run = () => step(ctx.currentTime + (document.hidden ? 1.6 : 0.35))
  return {
    start() {
      clearTimeout(stopT)
      if (timer) return
      run()
      timer = window.setInterval(run, ms)
    },
    stop() {
      clearTimeout(stopT)
      stopT = window.setTimeout(() => {
        clearInterval(timer)
        timer = 0
      }, 1500)
    },
  }
}
