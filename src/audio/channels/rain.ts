import { useStore } from '../../state/store'
import { loops } from '../../rooms/bedroom'
import { dropletBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Pluie, étouffée quand la fenêtre est fermée. Enregistrée, ou synthétisée : souffle rose, gouttes sur la vitre, grondement grave. */
export default function rain(kit: Kit, out: GainNode) {
  const { ctx, gain, biq, loop, noise } = kit
  // Fenêtre ouverte (sons du dehors actifs) : l'enregistrement passe sans filtre (coupure à Nyquist), la synthèse à 7500 Hz.
  let open = ctx.sampleRate / 2
  const cutoff = () => (useStore.getState().on.outside ? open : 2300)
  const lp = biq('lowpass', cutoff(), 0.4)
  lp.connect(out)
  useStore.subscribe((s, p) => {
    if (s.on.outside !== p.on.outside) lp.frequency.setTargetAtTime(cutoff(), ctx.currentTime, 0.4)
  })
  kit.loopOr(loops.rain, lp, () => {
    open = 7500
    lp.frequency.value = cutoff()
    loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(lp)
    loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(lp)
    loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(out) // hors passe-bas
  })
}
