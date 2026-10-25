import { useStore, type Store } from '../../state/store'
import { roomById } from '../../rooms'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { dropletBuffer } from '../buffers'
import type { Channel, Kit } from '../engine'
import { thunder } from '../thunder'

/** Pluie, étouffée quand la fenêtre est fermée. Enregistrée, ou synthétisée : souffle rose, gouttes sur la vitre, grondement grave. */
export default function rain(kit: Kit, out: GainNode, { loops, storm }: Room): Channel {
  const { ctx, gain, biq, loop, noise } = kit
  // L'orage (voir thunder.ts) : le tonnerre gronde dans le bus de la pluie, à son volume.
  if (storm === 'rain') thunder(kit, out)
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
  kit.watch((s, p) => {
    if (win(s) === win(p)) return
    lp.frequency.setTargetAtTime(cutoff(), ctx.currentTime, 0.4)
    trim.gain.setTargetAtTime(level(), ctx.currentTime, 0.4)
  })
  // La pluie enregistrée dure une trentaine de secondes : jouée en boucle, on l'entendrait revenir. On la joue en segments de 7 à 14 s
  // tirés au hasard, fondus sur 3 s, et son niveau respire (rafales plus fortes, accalmies) toutes les 4 à 9 secondes.
  const gust = gain(1)
  gust.connect(lp)
  let sway = 0, halt = 0
  const swell = () => {
    gust.gain.setTargetAtTime(rand(0.72, 1.28), ctx.currentTime, 2.5)
    sway = window.setTimeout(swell, rand(4000, 9000))
  }
  const rec = kit.grainsOr(loops.rain, gust, { len: [7, 14], fade: 3, rate: 0.03, level: 0.15 }, () => {
    open = 7500
    lp.frequency.value = cutoff()
    loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(lp)
    loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(lp)
    loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(out) // hors passe-bas
  })
  return {
    start() {
      clearTimeout(halt)
      rec.start()
      clearTimeout(sway)
      swell()
    },
    stop() {
      clearTimeout(sway)
      halt = window.setTimeout(() => rec.stop(), 1500)
    },
  }
}
