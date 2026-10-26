import { useEffect, useRef } from 'react'
import { useStore } from '../state/store'
import { roomById } from '../rooms'
import { skyOf, type Sky } from '../state/weather'
import { reduceMotion } from '../motion'
import { rand } from '../math'

type Fall = Exclude<Sky, 'clear'>
interface Bit {
  kind: Fall
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
}

// Combien de gouttes ou de flocons à la fois, pour un écran de 1000 px de large (moins sur un téléphone).
const COUNT: Record<Fall, number> = { drizzle: 45, rain: 110, storm: 170, snow: 90, blizzard: 200 }

function spawn(b: Bit, kind: Fall, w: number, h: number, anywhere: boolean) {
  b.kind = kind
  const snow = kind === 'snow' || kind === 'blizzard'
  if (kind === 'blizzard') {
    b.vx = rand(-420, -260)
    b.vy = rand(70, 150)
  } else if (snow) {
    b.vx = rand(-12, 6)
    b.vy = rand(28, 55)
  } else {
    b.vy = kind === 'drizzle' ? rand(420, 560) : rand(700, 980)
    b.vx = b.vy * (kind === 'storm' ? -0.22 : -0.08)
  }
  if (anywhere) {
    b.x = rand(-0.05, 1.05) * w
    b.y = rand(0, h)
  } else if (Math.random() * (b.vy * w + Math.abs(b.vx) * h) < Math.abs(b.vx) * h) {
    // Poussé de côté : ça entre aussi par le bord d'où vient le vent (la droite), en proportion de sa vitesse. Sinon, tout
    // renaît en haut, sort par la gauche avant d'avoir descendu, et la neige reste dans le coin haut gauche.
    b.x = w + rand(10, 70)
    b.y = rand(-0.1, 1) * h
  } else {
    b.x = rand(0.02, 1.15) * w
    b.y = rand(-0.15, -0.02) * h
  }
  b.size = snow ? rand(1.1, kind === 'blizzard' ? 2.2 : 2.8) : kind === 'drizzle' ? rand(6, 10) : rand(13, 22)
  b.phase = rand(0, Math.PI * 2)
}

/**
 * La pluie et la neige, derrière la pièce : dans le ciel du fond, jamais dans le diorama (les pièces ont des murs et des toits).
 * Un canvas 2D sous la scène 3D, qui ne tourne que quand une météo tombe ; un voile gris (pluie) ou blanc (neige) couvre le ciel.
 * Rien sous la mer (`skyLife: false`). Avec `prefers-reduced-motion`, une image fixe : la pluie se voit, sans bouger.
 */
export function WeatherSky() {
  const canvas = useRef<HTMLCanvasElement>(null!)
  const sky = useStore(skyOf), night = useStore((s) => s.night), roomId = useStore((s) => s.room)
  const shown = roomById(roomId).skyLife !== false && sky !== 'clear'
  const want = useRef<Sky>(sky), dark = useRef(night)
  want.current = shown ? sky : 'clear'
  dark.current = night

  useEffect(() => {
    if (!shown) return
    const el = canvas.current, ctx = el.getContext('2d')
    if (!ctx) return
    let w = 0, h = 0, raf = 0, last = performance.now()
    const bits: Bit[] = []
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5)
      w = innerWidth
      h = innerHeight
      el.width = Math.round(w * dpr)
      el.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    addEventListener('resize', size)
    const target = () => {
      const k = want.current
      return k === 'clear' ? 0 : Math.round(COUNT[k] * Math.min(1.3, Math.max(0.45, w / 1000)))
    }
    const draw = (dt: number) => {
      const k = want.current
      // Les gouttes qui sortent renaissent dans la météo du moment : un changement se fait de lui-même, en une seconde ou deux.
      while (k !== 'clear' && bits.length < target()) {
        const b = {} as Bit
        spawn(b, k, w, h, true)
        bits.push(b)
      }
      ctx.clearRect(0, 0, w, h)
      const rainCol = dark.current ? 'rgba(176, 190, 232, 0.32)' : 'rgba(236, 242, 255, 0.42)'
      const snowCol = dark.current ? 'rgba(232, 236, 255, 0.7)' : 'rgba(255, 255, 255, 0.85)'
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i], snow = b.kind === 'snow' || b.kind === 'blizzard'
        b.phase += dt * 1.3
        b.x += (b.vx + (snow ? Math.sin(b.phase) * 14 : 0)) * dt
        b.y += b.vy * dt
        if (b.y > h + 30 || b.x < -60) {
          if (k === 'clear' || bits.length > target()) {
            bits.splice(i, 1)
            continue
          }
          spawn(b, k, w, h, false)
        }
        if (snow) {
          ctx.fillStyle = snowCol
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const n = b.size / Math.hypot(b.vx, b.vy)
          ctx.strokeStyle = rainCol
          ctx.lineWidth = b.kind === 'drizzle' ? 1 : 1.3
          ctx.beginPath()
          ctx.moveTo(b.x, b.y)
          ctx.lineTo(b.x - b.vx * n, b.y - b.vy * n)
          ctx.stroke()
        }
      }
    }
    if (reduceMotion) {
      draw(0)
      return () => removeEventListener('resize', size)
    }
    const frame = (t: number) => {
      draw(Math.min(0.05, (t - last) / 1000))
      last = t
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
      ctx.clearRect(0, 0, w, h)
    }
  }, [shown])

  const veil = !shown ? '' : sky === 'snow' || sky === 'blizzard' ? ' snowy' : ' wet'
  return (
    <>
      <div className={`sky-veil${veil}${sky === 'storm' ? ' dark' : ''}`} aria-hidden="true" />
      <canvas className={shown ? 'sky-weather on' : 'sky-weather'} ref={canvas} aria-hidden="true" />
    </>
  )
}
