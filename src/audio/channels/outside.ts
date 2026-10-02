import { useStore } from '../../state/store'
import { rand } from '../../math'
import { impulse } from '../buffers'
import type { Channel, Kit } from '../engine'

/** Dehors : fond d'air, et des oiseaux le jour ou des grillons la nuit, avec un peu de réverbération. */
export default function outside({ ctx, gain, biq, osc, loop, noise }: Kit, out: GainNode): Channel {
  loop(noise.pink, 3.3).connect(biq('lowpass', 650, 0.4)).connect(gain(0.16)).connect(out)
  const input = gain(1), hp = biq('highpass', 1100, 0.5), conv = ctx.createConvolver()
  conv.buffer = impulse(ctx, 2.2, 3.2)
  input.connect(hp)
  hp.connect(gain(0.75)).connect(out)
  hp.connect(conv)
  conv.connect(gain(0.4)).connect(out)

  let timer = 0, stopT = 0, nextBird = 0
  const crickets = [{ f: 4300, pan: -0.6, next: 0 }, { f: 4750, pan: 0.5, next: 0 }, { f: 5200, pan: 0.05, next: 0 }]

  function tick() {
    const now = ctx.currentTime, horizon = now + (document.hidden ? 1.6 : 0.35)
    if (useStore.getState().night) {
      for (const c of crickets) {
        if (c.next < now) c.next = now + rand(0.05, 0.4)
        while (c.next < horizon) {
          cricket(c.next, c.f * rand(0.995, 1.005), c.pan)
          c.next += rand(0.5, 0.85) * (Math.random() < 0.12 ? 2.5 : 1)
        }
      }
    } else {
      if (nextBird < now) nextBird = now + rand(0.1, 0.6)
      while (nextBird < horizon) {
        birdPhrase(nextBird)
        nextBird += rand(1.4, 4.2)
      }
    }
  }

  function tone(t: number, fa: number, fb: number, dur: number, v: number, pan: number) {
    const o = osc('sine', fa), g = gain(0.0001), p = ctx.createStereoPanner()
    o.frequency.setValueAtTime(fa, t)
    o.frequency.exponentialRampToValueAtTime(fb, t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.012, dur * 0.3))
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    p.pan.value = pan
    o.connect(g).connect(p).connect(input)
    o.start(t)
    o.stop(t + dur + 0.03)
  }

  // 3 types : montées, trille descendant, appel à deux notes.
  function birdPhrase(t: number) {
    const pan = rand(-0.7, 0.7), kind = (Math.random() * 3) | 0
    if (kind === 0) {
      const n = 3 + ((Math.random() * 4) | 0), f0 = rand(2700, 3500)
      for (let i = 0; i < n; i++) tone(t + i * 0.13, f0 * (1 + i * 0.02), f0 * 1.45 * (1 + i * 0.02), 0.075, 0.09, pan)
    } else if (kind === 1) {
      const n = 7 + ((Math.random() * 6) | 0), fs = rand(4200, 5000)
      for (let i = 0; i < n; i++) {
        const f = fs * (1 - i * 0.03)
        tone(t + i * 0.055, f, f * 0.92, 0.04, 0.06, pan)
      }
    } else {
      for (let r = 0; r < 2; r++) {
        const o = r * 0.55
        tone(t + o, 3800, 4400, 0.14, 0.08, pan)
        tone(t + o + 0.18, 3400, 2600, 0.2, 0.08, pan)
      }
    }
  }

  // Stridulation de 3 ou 4 impulsions.
  function cricket(t: number, f: number, pan: number) {
    const n = Math.random() < 0.3 ? 4 : 3
    for (let k = 0; k < n; k++) tone(t + k * 0.034, f, f * 0.985, 0.022, 0.035, pan)
  }

  return {
    start() {
      clearTimeout(stopT)
      if (timer) return
      const now = ctx.currentTime
      nextBird = now + 0.4
      crickets.forEach((c, i) => {
        c.next = now + 0.2 + i * 0.31
      })
      timer = window.setInterval(tick, 90)
    },
    stop() {
      clearTimeout(stopT)
      stopT = window.setTimeout(() => {
        clearInterval(timer)
        timer = 0
      }, 1500)
    },
  }
}
