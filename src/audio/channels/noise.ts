import { useStore } from '../../state/store'
import { NOISE_COLORS, type NoiseColor } from '../../state/noise'
import type { Channel, Kit } from '../engine'
import { GREEN, noiseBuffers } from '../noiseGen'

// Le module de l'AudioWorklet se charge une fois par AudioContext (public/noise-worklet.js : un fichier statique, sans hachage,
// précaché par le service worker comme le reste de dist/).
const modules = new WeakMap<BaseAudioContext, Promise<void>>()
const loadModule = (ctx: AudioContext) => {
  let p = modules.get(ctx)
  if (!p) {
    if (!ctx.audioWorklet) p = Promise.reject(new Error('AudioWorklet indisponible'))
    else p = ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}noise-worklet.js`)
    modules.set(ctx, p)
  }
  return p
}

const TILT_DB = 6 // à fond, ±6 dB à chaque bout : les graves d'un côté, les aigus de l'autre
const FADE = 0.15 // s, constante de temps des fondus de couleur et de tonalité (≈ 0,5 s pour aller au bout)

/**
 * Bruit blanc, rose, brun ou vert, généré en direct par un AudioWorklet : jamais de boucle, rien à télécharger (si le worklet
 * échoue, de longs tampons de 30 s sans couture). Les couleurs sont toutes là, on les croise en fondu avec des gains ; la tonalité
 * est une paire d'étagères (graves, aigus) qui basculent en sens contraire ; un passe-haut de 25 Hz ôte le très grave inutile.
 */
export default function noise(kit: Kit, out: GainNode): Channel {
  const { ctx, gain, biq, loop, watch } = kit
  const want = (s: { noise: { color: NoiseColor } }, c: NoiseColor) => (s.noise.color === c ? 1 : 0)
  const init = useStore.getState()
  const mix = Object.fromEntries(NOISE_COLORS.map((c) => [c, gain(want(init, c))])) as Record<NoiseColor, GainNode>
  const green = biq('bandpass', GREEN.freq, GREEN.q)
  green.connect(gain(GREEN.makeup)).connect(mix.green)
  const bus = gain(1)
  for (const c of NOISE_COLORS) mix[c].connect(bus)
  const low = biq('lowshelf', 320, 0.7), high = biq('highshelf', 3200, 0.7)
  const hp1 = biq('highpass', 25, 0.7071), hp2 = biq('highpass', 25, 0.7071)
  bus.connect(low).connect(high).connect(hp1).connect(hp2).connect(out)
  low.gain.value = -TILT_DB * init.noise.tilt
  high.gain.value = TILT_DB * init.noise.tilt

  watch((s, p) => {
    if (s.noise === p.noise) return
    const now = ctx.currentTime
    for (const c of NOISE_COLORS) {
      mix[c].gain.cancelScheduledValues(now)
      mix[c].gain.setTargetAtTime(want(s, c), now, FADE)
    }
    for (const [node, db] of [[low, -TILT_DB * s.noise.tilt], [high, TILT_DB * s.noise.tilt]] as const) {
      node.gain.cancelScheduledValues(now)
      node.gain.setTargetAtTime(db, now, FADE)
    }
  })

  // La source (worklet, ou tampons en repli) n'est branchée que quand le son joue : arrêtée, elle ne coûte rien.
  let source: AudioWorkletNode | null = null, wanted = false, linked = false, timer = 0
  const link = () => {
    if (!source || linked) return
    source.connect(mix.white, 0)
    source.connect(mix.pink, 1)
    source.connect(mix.brown, 2)
    source.connect(green, 0)
    linked = true
  }
  const unlink = () => {
    if (!source || !linked) return
    source.disconnect()
    linked = false
  }
  loadModule(ctx).then(
    () => {
      source = new AudioWorkletNode(ctx, 'lufi-noise', { numberOfInputs: 0, numberOfOutputs: 3, outputChannelCount: [2, 2, 2] })
      if (wanted) link()
    },
    (e) => {
      console.warn('Bruit : AudioWorklet indisponible, tampons de 30 s.', e)
      const b = noiseBuffers(ctx)
      const white = loop(b.white, 0)
      white.connect(mix.white)
      white.connect(green)
      loop(b.pink, 0).connect(mix.pink)
      loop(b.brown, 0).connect(mix.brown)
    },
  )
  return {
    start() {
      wanted = true
      clearTimeout(timer)
      link()
    },
    stop() {
      wanted = false
      clearTimeout(timer)
      // Après le fondu du bus (voir `set` dans engine.ts), on débranche la source.
      timer = window.setTimeout(() => !wanted && unlink(), 3000)
    },
  }
}
