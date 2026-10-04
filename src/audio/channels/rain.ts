import { useStore, type Store } from '../../state/store'
import { roomById } from '../../rooms'
import type { Room } from '../../rooms/types'
import { dropletBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Pluie, étouffée quand la fenêtre est fermée. Enregistrée, ou synthétisée : souffle rose, gouttes sur la vitre, grondement grave. */
export default function rain(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, loop, noise } = kit
  // Fenêtre ouverte (sons du dehors actifs) : l'enregistrement passe sans filtre (coupure à Nyquist), la synthèse à 7500 Hz.
  let open = ctx.sampleRate / 2
  // La fenêtre de la pièce est ouverte : son objet « window » a son son allumé. Sans fenêtre (une verrière), la pluie reste étouffée.
  // Au marché de nuit, la pluie tombe en plein air, sur une bâche : jamais derrière une vitre.
  const win = (s: Store) => {
    if (s.room === 'market') return true
    const t = roomById(s.room).objects.find((o) => o.id === 'window')?.target
    return t && t !== 'night' ? s.on[t] : false
  }
  const opened = () => win(useStore.getState())
  const cutoff = () => (opened() ? open : 2300)
  // Fenêtre fermée, la pluie passe aussi 3 dB plus bas : elle reste derrière la vitre.
  const level = () => (opened() ? 1 : 0.7)
  const lp = biq('lowpass', cutoff(), 0.4), trim = gain(level())
  lp.connect(trim).connect(out)
  useStore.subscribe((s, p) => {
    if (win(s) === win(p)) return
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
