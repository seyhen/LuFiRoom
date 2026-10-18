import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { EXTS, fileUrl, keepOffline, missing } from '../recordings'
import type { Channel, Kit } from '../engine'
import radio from './radio'
import { shuffled } from './tracks'

/**
 * Radio sur les pistes enregistrées, sans élément <audio> : chaque morceau est décodé en mémoire (un à la fois, plus le suivant
 * qui se prépare) et joué par le graphe Web Audio, comme les autres sons. C'est la voie de Safari sur iPhone, où le curseur de
 * volume n'agit pas sur un élément <audio> branché au graphe. Coût : ~65 Mo de mémoire par morceau décodé.
 */
export default function tracksBuffered(kit: Kit, out: GainNode, { playlist }: Room): Channel {
  const { ctx } = kit
  // Les fichiers sont à -20 LUFS, comme les boucles d'ambiance : la musique doit passer au-dessus d'elles, d'où ce gain.
  const trim = kit.gain(2.2)
  trim.connect(out)
  const queue: number[] = []
  let last = -1, curIndex = -1, cur: AudioBuffer | null = null, src: AudioBufferSourceNode | null = null
  let startedAt = 0, offset = 0, playing = false, gen = 0, misses = 0, beat = -1, timer = 0, stopT = 0
  let ahead: { i: number; p: Promise<AudioBuffer> } | null = null
  let fallback: Channel | null = null
  const played: number[] = [] // les morceaux joués, pour « précédent »

  // L'index du prochain morceau : l'ordre est mélangé, sans jamais répéter le même deux fois d'affilée.
  const peek = () => {
    if (!queue.length) queue.push(...shuffled(playlist.length, last))
    return queue[0]
  }
  const take = () => {
    const i = peek()
    queue.shift()
    last = i
    return i
  }

  // Télécharge et décode un morceau, en Opus puis, si le navigateur ne le lit pas, en MP3.
  async function fetchBuf(i: number) {
    let err: unknown
    for (const ext of EXTS) {
      try {
        const res = await fetch(fileUrl(playlist[i].src, ext))
        if (!res.ok) throw new Error(`${res.url} : ${res.status}`)
        return await ctx.decodeAudioData(await res.arrayBuffer())
      } catch (e) {
        err = e
      }
    }
    throw err
  }

  function startAt() {
    const s = ctx.createBufferSource(), t = ctx.currentTime, track = playlist[curIndex]
    s.buffer = cur
    s.connect(trim)
    s.start(t, offset)
    startedAt = t - offset
    src = s
    playing = true
    beat = -1
    // Fin naturelle du morceau : le suivant. Un arrêt voulu a déjà mis `src` à null.
    s.onended = () => {
      if (src === s) {
        src = null
        void begin()
      }
    }
    useStore.setState({ onAir: `${track.title} · ${track.artist}` })
    keepOffline(fileUrl(track.src, EXTS[0]))
    played.push(curIndex)
  }

  async function begin(force?: number) {
    const my = ++gen, old = src
    src = null
    old?.stop()
    const i = force ?? take()
    try {
      const buf = await (ahead && ahead.i === i ? ahead.p : fetchBuf(i))
      if (my !== gen) return
      ahead = null
      cur = buf
      curIndex = i
      offset = 0
      misses = 0
      startAt()
      // Le suivant se prépare pendant que celui-ci joue.
      const n = peek()
      ahead = { i: n, p: fetchBuf(n) }
      ahead.p.catch(() => {})
    } catch (e) {
      if (my !== gen) return
      missing(`${playlist[i].src}`, e)
      if (++misses < playlist.length) return begin()
      // Aucun morceau ne passe : retour à la musique générative.
      clearInterval(timer)
      timer = 0
      fallback = radio(kit, out)
      fallback.start()
    }
  }

  // Publie un kick tous les deux temps, pour faire pulser la radio dans la scène.
  function tick() {
    if (!playing || curIndex < 0) return
    const t = playlist[curIndex], b = Math.floor(((ctx.currentTime - startedAt - (t.beat ?? 0)) * t.bpm) / 120)
    if (b > beat) {
      beat = b
      useStore.setState((s) => ({ kicks: s.kicks + 1 }))
    }
  }

  kit.watch((s, p) => {
    if (s.skips !== p.skips && s.on.radio && timer && playing) void begin()
    if (s.prevs !== p.prevs && s.on.radio && timer && playing) {
      // Au-delà de 5 s de lecture, on reprend le morceau au début ; sinon, le morceau d'avant.
      if (ctx.currentTime - startedAt > 5 || played.length < 2) {
        const old = src
        src = null
        old?.stop()
        offset = 0
        played.pop()
        startAt()
      } else {
        played.pop()
        const back = played.pop()!
        queue.unshift(curIndex)
        void begin(back)
      }
    }
  })

  return {
    // Appelé pendant le geste de l'utilisateur : c'est ce qui autorise la lecture (iOS).
    start() {
      clearTimeout(stopT)
      if (fallback) return fallback.start()
      if (timer) return // rallumée pendant le fondu : elle n'a pas cessé de jouer
      timer = window.setInterval(tick, 50)
      if (cur) startAt() // reprise, là où elle s'était arrêtée
      else void begin()
    },
    // On laisse le fondu du bus se faire avant d'arrêter la lecture, et on retient où l'on en était.
    stop() {
      clearTimeout(stopT)
      if (fallback) return fallback.stop()
      stopT = window.setTimeout(() => {
        if (playing) offset = ctx.currentTime - startedAt
        const s = src
        src = null
        playing = false
        s?.stop()
        clearInterval(timer)
        timer = 0
        ahead = null // le suivant (~65 Mo décodés) se repréparera à la reprise
      }, 900)
    },
  }
}
