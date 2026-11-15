import { useStore, type Store } from '../../state/store'
import { roomById } from '../../rooms'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { WeatherKind } from '../../state/weather'
import { dropletBuffer } from '../buffers'
import type { Channel, Kit } from '../engine'
import { thunder } from '../thunder'

// Le niveau de la voix de chaque météo (elles ne jouent jamais ensemble, sauf pendant le fondu d'une météo à l'autre).
const LEVEL: Record<WeatherKind, number> = { drizzle: 1, rain: 1.25, storm: 1.8, snow: 0.6, blizzard: 0.9 }

/**
 * La météo (la carte « Météo » du mixeur ; voir state/weather.ts) : bruine, pluie, orage, neige ou tempête de neige, entendue
 * d'où l'on est (`shelter` de la pièce) : derrière une vitre, plus claire fenêtre ouverte ; en plein air ; de loin, à travers une coque.
 * Chaque météo a sa propre voix : un enregistrement distinct (`loops.drizzle`, `rain`, `storm`, `snow`, `blizzard`), ou à défaut une
 * synthèse. Les voix sont construites à la première météo qui les demande, et se croisent en fondu (environ 1 s) quand on change.
 * L'orage ajoute le tonnerre.
 */
export default function rain(kit: Kit, out: GainNode, room: Room): Channel {
  const { loops, shelter = 'glass' } = room
  const { ctx, gain, biq, osc, loop, noise } = kit
  thunder(kit, out, (s) => s.weather === 'storm')
  // Sans enregistrement, la synthèse s'éclaircit à 7500 Hz plutôt qu'à la coupure de Nyquist (voir plus bas).
  let open = ctx.sampleRate / 2
  // Derrière une vitre, ouverte quand l'objet « window » de la pièce a son son allumé (sans fenêtre, une verrière : toujours fermée).
  const win = (s: Store) => {
    if (shelter !== 'glass') return shelter === 'open'
    const t = roomById(s.room).objects.find((o) => o.id === 'window')?.target
    return t && t !== 'night' ? s.on[t] : false
  }
  const opened = () => win(useStore.getState())
  const cutoff = () => (shelter === 'deep' ? 320 : opened() ? open : 2300)
  // Fenêtre fermée, 3 dB plus bas : la météo reste derrière la vitre. En plein air, rien ne la filtre : plus bas encore, pour qu'elle
  // ne couvre pas la pièce. Sous la mer, presque rien : la surface est loin.
  const level = () => (shelter === 'deep' ? 0.6 : shelter === 'open' ? 0.55 : opened() ? 1 : 0.7)
  const lp = biq('lowpass', cutoff(), 0.4), trim = gain(level())
  lp.connect(trim).connect(out)
  kit.watch((s, p) => {
    if (win(s) === win(p)) return
    lp.frequency.setTargetAtTime(cutoff(), ctx.currentTime, 0.4)
    trim.gain.setTargetAtTime(level(), ctx.currentTime, 0.4)
  })

  /** Les synthèses de repli, une par météo (un enregistrement qui manque ne fait pas un silence). */
  const synth = (w: WeatherKind, dest: GainNode) => {
    if (w === 'snow' || w === 'blizzard') {
      // la neige étouffe le monde : un souffle sourd ; la tempête de neige est ouverte et siffle
      const muffle = biq('lowpass', w === 'snow' ? 420 : 5200, 0.5), body = biq('bandpass', 520, 0.8), swell = gain(0.6)
      muffle.connect(gain(w === 'snow' ? 0.7 : 1)).connect(dest)
      loop(noise.pink, 1.3).connect(body).connect(swell).connect(muffle)
      loop(noise.brown, 3.1).connect(biq('lowpass', 180, 0.6)).connect(gain(0.5)).connect(muffle)
      for (const [f, depth, param] of [[0.08, 240, body.frequency], [0.21, 100, body.frequency], [0.06, 0.35, swell.gain]] as const) {
        const lfo = osc('sine', f)
        lfo.connect(gain(depth)).connect(param)
        lfo.start()
      }
      return
    }
    open = 7500
    lp.frequency.value = cutoff()
    const k = w === 'storm' ? 1.25 : w === 'drizzle' ? 0.5 : 1
    const thin = biq('highpass', w === 'drizzle' ? 750 : 30, 0.5), bed = gain(k)
    thin.connect(bed).connect(dest)
    loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(thin)
    loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(thin)
    loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(bed) // le grondement, sans la coupure de la bruine
  }

  // Une voix par météo : jouée en segments de 7 à 16 s tirés au hasard (une boucle de 30 s s'entendrait revenir), son niveau qui
  // respire (rafales, accalmies) toutes les 4 à 9 secondes (`gust`).
  interface Voice { ch: Channel; mix: GainNode; gust: GainNode; on: boolean; halt: number }
  const voices: Partial<Record<WeatherKind, Voice>> = {}
  let running = false
  const build = (w: WeatherKind): Voice => {
    const mix = gain(0), gust = gain(1)
    gust.connect(mix).connect(lp)
    const wind = w === 'snow' || w === 'blizzard'
    const ch = kit.grainsOr(loops[w], gust, { len: wind ? [8, 16] : [7, 14], fade: 3, rate: 0.03, level: wind ? 0.2 : 0.15 }, () => synth(w, gust))
    return { ch, mix, gust, on: false, halt: 0 }
  }
  /** La météo `w` devient audible, les autres s'effacent (et s'arrêtent une fois muettes). */
  const tune = (w: WeatherKind) => {
    const t = ctx.currentTime
    voices[w] ??= build(w)
    for (const [k, v] of Object.entries(voices) as [WeatherKind, Voice][]) {
      v.mix.gain.setTargetAtTime(k === w ? LEVEL[k] : 0, t, 1.2)
      clearTimeout(v.halt)
      if (k === w) {
        if (running && !v.on) { v.on = true; v.ch.start() }
      } else if (v.on) {
        v.halt = window.setTimeout(() => { v.on = false; v.ch.stop() }, 4500)
      }
    }
  }
  const now = () => useStore.getState().weather
  tune(now())
  // Changer de météo : les voix se croisent en un peu plus d'une seconde.
  kit.watch((s, p) => {
    if (s.weather !== p.weather) tune(s.weather)
  })

  let sway = 0, halt = 0
  const swell = () => {
    for (const v of Object.values(voices)) v.gust.gain.setTargetAtTime(rand(0.72, 1.28), ctx.currentTime, 2.5)
    sway = window.setTimeout(swell, rand(4000, 9000))
  }
  return {
    start() {
      clearTimeout(halt)
      running = true
      tune(now())
      clearTimeout(sway)
      swell()
    },
    stop() {
      clearTimeout(sway)
      running = false
      halt = window.setTimeout(() => {
        for (const v of Object.values(voices)) {
          clearTimeout(v.halt)
          v.on = false
          v.ch.stop()
        }
      }, 1500)
    },
  }
}
