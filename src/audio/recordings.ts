import type { Channel } from './engine'

// Enregistrements servis depuis public/ : chaque son existe en Opus dans WebM (léger) et en MP3 (repli).

/** Formats à essayer, dans l'ordre. Les navigateurs qui ne lisent pas l'Opus en WebM (vieux Safari) passent au MP3. */
export const EXTS = document.createElement('audio').canPlayType('audio/webm; codecs="opus"') ? ['webm', 'mp3'] : ['mp3']

export const fileUrl = (src: string, ext: string) => `${import.meta.env.BASE_URL}${src}.${ext}`

async function get(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} : ${res.status}`)
  return res.arrayBuffer()
}

const warmed = new Set<string>()
/**
 * Garde un fichier pour le hors ligne. Le lecteur <audio> demande des morceaux (206), que le service worker ne peut pas mettre
 * en cache : on télécharge le fichier entier une fois (200), qu'il garde. Sans effet sans service worker, ou en mode économie de données.
 */
export function keepOffline(url: string) {
  const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  if (!navigator.serviceWorker?.controller || saver || warmed.has(url)) return
  warmed.add(url)
  fetch(url).catch(() => warmed.delete(url))
}

const bytes = new Map<string, Promise<ArrayBuffer>>()
const buffers = new Map<string, Promise<AudioBuffer>>()

/** Télécharge un enregistrement dans le premier format lisible. Possible dès l'ouverture, avant tout geste. */
export function prefetch(src: string) {
  let p = bytes.get(src)
  if (!p) bytes.set(src, (p = get(fileUrl(src, EXTS[0]))))
  return p
}

/** Décode un enregistrement, une seule fois. Si le premier format échoue (absent, ou indécodable), on tente le MP3. */
export function decode(ctx: BaseAudioContext, src: string) {
  let p = buffers.get(src)
  if (!p) {
    p = prefetch(src)
      .then((b) => ctx.decodeAudioData(b))
      .catch(async (e) => {
        if (EXTS[0] === 'mp3') throw e
        return ctx.decodeAudioData(await get(fileUrl(src, 'mp3')))
      })
    buffers.set(src, p)
  }
  return p
}

/** Un enregistrement n'a pas pu être chargé : on le signale, et le son se rabat sur la synthèse du prototype. */
export const missing = (what: string, e?: unknown) => console.warn(`Enregistrement indisponible (${what}), on synthétise.`, e ?? '')

// Fondu à puissance constante, étiré par setValueCurveAtTime sur la durée voulue.
const UP = Float32Array.from({ length: 64 }, (_, i) => Math.sin((i / 63) * (Math.PI / 2)))
const DOWN = UP.slice().reverse()

/**
 * Joue un enregistrement en boucle, sans fin. La fin de chaque passage se fond dans le début du suivant
 * (`fade` secondes, puissance constante) : pas de couture audible, même avec un fichier qui n'a pas été préparé
 * pour boucler, ou le silence que l'encodeur MP3 ajoute aux extrémités. Le premier passage part d'un point au hasard.
 */
export function crossLoop(ctx: BaseAudioContext, buf: AudioBuffer, dest: AudioNode, fade = 2) {
  // Tout se compte en échantillons : un départ entre deux échantillons serait interpolé, ce qui assourdit les aigus.
  const sr = ctx.sampleRate, N = buf.length, F = Math.round(Math.min(fade * sr, N / 4))
  // Programme un passage qui démarre à l'échantillon `t`, lu depuis `from`, et renvoie le départ du suivant.
  // Chaque passage, en finissant, programme celui d'après le suivant : il y en a toujours un d'avance.
  const play = (t: number, from: number, rise: number) => {
    const s = ctx.createBufferSource(), g = ctx.createGain(), end = t + N - from
    s.buffer = buf
    g.gain.setValueCurveAtTime(UP, t / sr, rise / sr)
    g.gain.setValueCurveAtTime(DOWN, (end - F) / sr, F / sr)
    s.connect(g).connect(dest)
    s.start(t / sr, from / sr)
    s.stop(end / sr)
    s.onended = () => {
      g.disconnect()
      next = play(next, 0, F)
    }
    return end - F
  }
  let next = play(Math.round(ctx.currentTime * sr), Math.floor(Math.random() * (N - 2 * F)), Math.min(Math.round(0.3 * sr), F))
  next = play(next, 0, F)
}

/**
 * Canal dont le contenu arrive plus tard (enregistrements à décoder, ou synthèse de repli) :
 * il retient s'il doit jouer et transmet l'allumage à ce qu'on lui branche.
 */
export function later() {
  let on = false, ch: Channel | void
  return {
    start() {
      on = true
      ch?.start()
    },
    stop() {
      on = false
      ch?.stop()
    },
    use(c: Channel | void) {
      ch = c
      if (on) c?.start()
    },
  }
}
