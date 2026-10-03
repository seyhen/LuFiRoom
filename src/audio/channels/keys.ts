import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le clavier mécanique de l'atelier. Enregistré, ou synthétisé : quelqu'un qui écrit, par mots et par phrases, avec ses
 * hésitations. Chaque touche est un clic net et un petit « toc » ; la barre d'espace et Entrée sonnent plus grave.
 */
export default function keys(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.keys, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(3)
    bus.connect(out)
    const desk = biq('peaking', 220, 1.2)
    desk.gain.value = 4
    desk.connect(bus)
    function key(t: number, kind: 'key' | 'space' | 'enter') {
      const v = kind === 'key' ? rand(0.05, 0.08) : 0.085, pan = ctx.createStereoPanner()
      pan.pan.value = kind === 'key' ? rand(-0.35, 0.35) : 0.05
      pan.connect(desk)
      // le clic du ressort
      const s = ctx.createBufferSource(), cg = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + 0.03)
      cg.gain.setValueAtTime(0.0001, t)
      cg.gain.exponentialRampToValueAtTime(v * 0.6, t + 0.001)
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012)
      s.connect(biq('bandpass', rand(2800, 4200), 1.4)).connect(cg).connect(pan)
      // le « toc » de la touche en fin de course, puis sa remontée un peu plus tard
      for (const [dt, k] of [[0.004, 1], [rand(0.07, 0.12), 0.45]]) {
        const o = osc('triangle', kind === 'key' ? rand(240, 330) : kind === 'space' ? 150 : 185), g = gain(0.0001), at = t + dt
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(v * k, at + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, at + (kind === 'key' ? 0.03 : 0.05))
        o.connect(g).connect(pan)
        o.start(at)
        o.stop(at + 0.07)
      }
    }
    /** Une phrase : des mots de 2 à 9 lettres, à 7–11 frappes par seconde, une espace entre chaque. */
    function sentence(t: number) {
      const words = 3 + ((Math.random() * 9) | 0), speed = rand(0.09, 0.14)
      let at = t
      for (let w = 0; w < words; w++) {
        const letters = 2 + ((Math.random() * 8) | 0)
        for (let i = 0; i < letters; i++) {
          key(at, 'key')
          at += speed * rand(0.6, 1.5)
        }
        key(at, 'space')
        at += speed * rand(1, 2.2)
        if (Math.random() < 0.08) at += rand(0.4, 1.2) // il cherche le mot juste
      }
      if (Math.random() < 0.35) {
        at += rand(0.2, 0.5)
        key(at, 'enter')
      }
      return at
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.2, 0.8)
      while (next < until) {
        const end = sentence(next)
        next = end + (Math.random() < 0.2 ? rand(5, 11) : rand(0.8, 3.5))
      }
    }, 150)
  })
}
