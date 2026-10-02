import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { dropletBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Pluie, étouffée quand la fenêtre est fermée. Enregistrée, ou synthétisée : souffle rose, gouttes sur la vitre, grondement grave. */
export default function rain(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, loop, noise } = kit
  // Fenêtre ouverte (sons du dehors actifs) : l'enregistrement passe sans filtre (coupure à Nyquist), la synthèse à 7500 Hz.
  let open = ctx.sampleRate / 2
  const cutoff = () => (useStore.getState().on.outside ? open : 2300)
  // Fenêtre fermée, la pluie passe aussi 3 dB plus bas : elle reste derrière la vitre.
  const level = () => (useStore.getState().on.outside ? 1 : 0.7)
  const lp = biq('lowpass', cutoff(), 0.4), trim = gain(level())
  lp.connect(trim).connect(out)
  useStore.subscribe((s, p) => {
    if (s.on.outside === p.on.outside) return
    lp.frequency.setTargetAtTime(cutoff(), ctx.currentTime, 0.4)
    trim.gain.setTargetAtTime(level(), ctx.currentTime, 0.4)
  })
  kit.loopOr(loops.rain, lp, () => {
    open = 7500
    lp.frequency.value = cutoff()
    loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(lp)
    loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(lp)
    loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(out) // hors passe-bas
  })
}
