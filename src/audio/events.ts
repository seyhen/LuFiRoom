import type { Channel } from './engine'

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
