import { useStore, type Store } from '../../state/store'
import { roomById } from '../../rooms'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { WeatherKind } from '../../state/weather'
import { dropletBuffer } from '../buffers'
import type { Channel, Kit } from '../engine'
import { thunder } from '../thunder'

// Le mélange de chaque météo : niveau de la pluie et coupure de ses graves (la bruine est fine, sans le gros de l'averse),
// niveau du vent froid et son passe-bas (la neige étouffe le monde : un souffle sourd ; la tempête de neige siffle).
const MIX: Record<WeatherKind, { rain: number; thin: number; wind: number; muffle: number }> = {
  drizzle: { rain: 0.5, thin: 750, wind: 0, muffle: 800 },
  rain: { rain: 1, thin: 30, wind: 0, muffle: 800 },
  storm: { rain: 1.25, thin: 30, wind: 0.3, muffle: 1400 },
  snow: { rain: 0, thin: 30, wind: 0.7, muffle: 420 },
  blizzard: { rain: 0, thin: 30, wind: 1, muffle: 5200 },
}

/**
 * La météo (la carte « Météo » du mixeur ; voir state/weather.ts) : pluie, bruine, orage, neige ou tempête de neige, entendue
 * d'où l'on est (`shelter` de la pièce) : derrière une vitre, plus claire fenêtre ouverte ; en plein air ; de loin, à travers une coque.
 * Deux couches qui se croisent en fondu quand la météo change : la pluie (enregistrée, ou souffle rose, gouttes et grondement)
 * et un vent froid (enregistré, ou souffle balayé), chargé seulement quand une météo le demande. L'orage ajoute le tonnerre.
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

  const now = () => useStore.getState().weather
  // La pluie : jouée en segments de 7 à 14 s tirés au hasard (une boucle de 30 s s'entendrait revenir), son niveau qui respire
  // (rafales, accalmies) toutes les 4 à 9 secondes.
  const thinAt = (w: WeatherKind) => (shelter === 'deep' ? 30 : MIX[w].thin)
  const thin = biq('highpass', thinAt(now()), 0.5), rainLvl = gain(MIX[now()].rain), gust = gain(1)
  gust.connect(thin).connect(rainLvl).connect(lp)
  const rainRec = kit.grainsOr(loops.rain, gust, { len: [7, 14], fade: 3, rate: 0.03, level: 0.15 }, () => {
    open = 7500
    lp.frequency.value = cutoff()
    loop(noise.pink, 0.7).connect(biq('highpass', 450, 0.5)).connect(gain(0.5)).connect(gust)
    loop(dropletBuffer(ctx), 0).connect(biq('highpass', 900, 0.5)).connect(gain(0.55)).connect(gust)
    loop(noise.brown, 2.1).connect(biq('lowpass', 220, 0.6)).connect(gain(0.45)).connect(rainLvl) // le grondement, sans la coupure de la bruine
  })

  // Le vent froid de la neige et de la tempête de neige (et un peu sous l'orage), construit à la première météo qui le demande.
  const muffle = biq('lowpass', MIX[now()].muffle, 0.5), windLvl = gain(MIX[now()].wind)
  muffle.connect(windLvl).connect(lp)
  let windRec: Channel | null = null, running = false
  const needWind = () => {
    if (windRec || !MIX[now()].wind) return
    windRec = kit.grainsOr(loops.blizzard, muffle, { len: [8, 16], fade: 3, rate: 0.03, level: 0.2 }, () => {
      const body = biq('bandpass', 520, 0.8), swell = gain(0.6)
      loop(noise.pink, 1.3).connect(body).connect(swell).connect(muffle)
      loop(noise.brown, 3.1).connect(biq('lowpass', 180, 0.6)).connect(gain(0.5)).connect(muffle)
      for (const [f, depth, param] of [[0.08, 240, body.frequency], [0.21, 100, body.frequency], [0.06, 0.35, swell.gain]] as const) {
        const lfo = osc('sine', f)
        lfo.connect(gain(depth)).connect(param)
        lfo.start()
      }
    })
    if (running) windRec.start()
  }
  needWind()

  // Changer de météo : les couches se croisent en un peu plus d'une seconde.
  kit.watch((s, p) => {
    if (s.weather === p.weather) return
    const m = MIX[s.weather], t = ctx.currentTime
    rainLvl.gain.setTargetAtTime(m.rain, t, 1.2)
    thin.frequency.setTargetAtTime(thinAt(s.weather), t, 1.2)
    windLvl.gain.setTargetAtTime(m.wind, t, 1.2)
    muffle.frequency.setTargetAtTime(m.muffle, t, 1.2)
    needWind()
  })

  let sway = 0, halt = 0
  const swell = () => {
    gust.gain.setTargetAtTime(rand(0.72, 1.28), ctx.currentTime, 2.5)
    sway = window.setTimeout(swell, rand(4000, 9000))
  }
  return {
    start() {
      clearTimeout(halt)
      running = true
      rainRec.start()
      windRec?.start()
      clearTimeout(sway)
      swell()
    },
    stop() {
      clearTimeout(sway)
      running = false
      halt = window.setTimeout(() => {
        rainRec.stop()
        windRec?.stop()
      }, 1500)
    },
  }
}
