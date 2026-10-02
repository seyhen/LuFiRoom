import { useStore } from '../../state/store'
import { dropletBuffer } from '../buffers'
import type { Kit } from '../engine'

// Fenêtre ouverte (sons du dehors actifs) : la pluie s'entend plus nette.
const cutoff = (open: boolean) => (open ? 7500 : 2300)

/** Pluie : souffle rose, gouttes sur la vitre, grondement grave. Étouffée quand la fenêtre est fermée. */
export default function rain({ ctx, gain, biq, loop, noise }: Kit, out: GainNode) {
  const lp = biq('lowpass', cutoff(useStore.getState().on.outside), 0.4)
  loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(lp)
  loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(lp)
  loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(out) // hors passe-bas
  lp.connect(out)
  useStore.subscribe((s, p) => {
    if (s.on.outside !== p.on.outside) lp.frequency.setTargetAtTime(cutoff(s.on.outside), ctx.currentTime, 0.4)
  })
}
