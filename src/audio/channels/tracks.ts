import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { EXTS, fileUrl, keepOffline, later, missing } from '../recordings'
import type { Channel, Kit } from '../engine'
import radio, { tuneStatic } from './radio'

/** Indices 0..n-1 mélangés, sans recommencer par `last` (pas deux fois la même piste d'affilée). */
function shuffled(n: number, last: number) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (n > 1 && a[0] === last) [a[0], a[1]] = [a[1], a[0]]
  return a
}

/**
 * Radio sur les pistes enregistrées de la chambre, dans un ordre mélangé. Elles sont lues en flux par un élément <audio>
 * branché sur le graphe, sans être décodées en entier en mémoire. Si aucune ne se lit, retour à la musique générative.
 */
export default function tracks(kit: Kit, out: GainNode, { playlist }: Room): Channel {
  const el = new Audio()
  el.crossOrigin = 'anonymous' // au cas où les fichiers passeraient un jour par un autre domaine
  kit.ctx.createMediaElementSource(el).connect(out)
  const ch = later()
  let order: number[] = [], pos = -1, ext = 0, misses = 0, beat = -1, timer = 0, stopT = 0

  const track = () => playlist[order[pos]]
  // Les échecs de lecture arrivent aussi par l'évènement `error`, traité plus bas.
  const play = () => el.play().catch(() => {})
  const load = () => {
    el.src = fileUrl(track().src, EXTS[ext])
    beat = -1
    play()
  }
  const next = () => {
    if (++pos >= order.length) {
      order = shuffled(playlist.length, order[pos - 1])
      pos = 0
    }
    ext = 0
    load()
  }

  el.onended = next
  el.onplaying = () => {
    misses = 0
    const t = track()
    useStore.setState({ onAir: `${t.title} · ${t.artist}` })
    keepOffline(fileUrl(t.src, EXTS[ext]))
  }
  el.onerror = () => {
    if (++ext < EXTS.length) return load() // l'Opus ne passe pas : on retente en MP3
    missing(`${track().src}, code ${el.error?.code}`)
    if (++misses < playlist.length) return next()
    clearInterval(timer)
    timer = 0
    el.removeAttribute('src')
    ch.use(radio(kit, out))
  }

  // Publie un kick tous les deux temps, pour faire pulser la radio dans la scène.
  function tick() {
    const t = track()
    if (el.paused || !t) return
    const b = Math.floor(((el.currentTime - (t.beat ?? 0)) * t.bpm) / 120)
    if (b > beat) {
      beat = b
      useStore.setState((s) => ({ kicks: s.kicks + 1 }))
    }
  }

  ch.use({
    // Appelé pendant le geste de l'utilisateur : c'est ce qui autorise la lecture (iOS).
    start() {
      clearTimeout(stopT)
      if (timer) return // rallumée pendant le fondu : elle n'a pas cessé de jouer
      tuneStatic(kit)
      if (pos < 0) next()
      else play()
      timer = window.setInterval(tick, 50)
    },
    // On laisse le fondu du bus se faire avant de mettre en pause.
    stop() {
      clearTimeout(stopT)
      stopT = window.setTimeout(() => {
        el.pause()
        clearInterval(timer)
        timer = 0
      }, 900)
    },
  })
  return ch
}
