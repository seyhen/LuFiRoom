import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, LineBasicMaterial, type LineSegments, type Points, type PointsMaterial } from 'three'
import { rand, smooth } from '../../math'
import { mood, reduceMotion, useWorldPointSize } from '../anim'
import { makeCanvas } from '../textures'
import { slabGap } from '../outdoor'

/** Un point est-il dans la silhouette de la pièce à l'écran, et devant elle ? (un hexagone : il passerait « dans » la pièce) */
function overRoom(x: number, y: number, z: number, h = 6.2) {
  if ((x + 0.8 * y + z) / 1.6248 <= 1) return false
  const sx = Math.abs((x - z) * 0.7071), sy = 0.8704 * y - 0.348 * (x + z)
  return Math.min(4.9 - sx, (h - 0.494 * sx - sy) / 1.115, (sy + 3.1 - 0.494 * sx) / 1.115) > -0.2
}

interface Props {
  /** Le sol où la pluie s'arrête (une hauteur, ou une fonction de x, z). */
  ground: number | ((x: number, z: number) => number)
  /** Où il pleut : x min, x max, z min, z max. */
  area?: [number, number, number, number]
  /** Combien de traits de pluie, de flocons (0 : pas de neige, la pièce a la sienne). */
  rain?: number
  snow?: number
  /**
   * Rien ne tombe sur la silhouette de la pièce, même en partie : on écarte toute colonne dont un point, de haut en bas, passe
   * devant elle. Pour une pièce dont le sol dépasse le socle carré (l'igloo : une île ronde plus large, sa pluie venait du bord de
   * l'île et rayait l'intérieur du dôme). Par défaut, seule une colonne entièrement devant la pièce est écartée.
   */
  covered?: boolean
  /** Le haut de la pièce à l'écran (une tour plus haute que les autres pièces). */
  top?: number
  /** Couleur de la pluie le jour, la nuit. */
  tint?: [number, number]
}

const TOP = 10
const TINT: [number, number] = [0xe2e8f2, 0x8f98c4]
const AREA: [number, number, number, number] = [-13, 12, -13, 12]

/**
 * La pluie et la neige du dehors, autour de la pièce : des traits fins et des flocons qui s'arrêtent au sol. Rien ne tombe dans la
 * pièce (ni au-dessus de son socle, ni devant elle vue de la caméra). Invisible par beau temps : aucun tracé.
 */
export function OutdoorPrecip({ ground, area = AREA, rain: nRain = 200, snow: nSnow = 120, top = 6.2, tint = TINT, covered = false }: Props) {
  const gy = useMemo(() => (typeof ground === 'number' ? () => ground : ground), [ground])
  const spot = useMemo(() => (fromTop: boolean): [number, number, number] => {
    for (let k = 0; k < 40; k++) {
      const x = rand(area[0], area[1]), z = rand(area[2], area[3]), g = gy(x, z), y = fromTop ? TOP : rand(g, TOP)
      if (slabGap(x, z, 0.3) < 0) continue
      if (covered) {
        let hit = false
        for (let k = 0; k <= 8 && !hit; k++) hit = overRoom(x, g + ((TOP - g) * k) / 8, z, top)
        if (hit) continue
      } else if (overRoom(x, y, z, top) && overRoom(x, g, z, top)) continue
      return [x, y, z]
    }
    return [area[0], TOP, area[2]]
  }, [area, gy, top, covered])
  const d = useMemo(() => ({
    rain: Array.from({ length: nRain }, () => ({ p: spot(false), v: rand(7, 10) })),
    snow: Array.from({ length: nSnow }, () => ({ p: spot(false), v: rand(0.5, 1.0), ph: rand(0, 6.3) })),
  }), [nRain, nSnow, spot])
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(Math.max(1, nRain) * 6), 3))
    return g
  }, [nRain])
  const sgeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(Math.max(1, nSnow) * 3), 3))
    return g
  }, [nSnow])
  const rainMat = useMemo(() => new LineBasicMaterial({ color: tint[0], transparent: true, opacity: 0, depthWrite: false }), [tint])
  const flake = useMemo(() => {
    const [c, x] = makeCanvas(32, 32)
    const g = x.createRadialGradient(16, 16, 1, 16, 16, 15)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 32, 32)
    return new CanvasTexture(c)
  }, [])
  const rain = useRef<LineSegments>(null!), snow = useRef<Points>(null!), snowMat = useRef<PointsMaterial>(null!)
  useWorldPointSize(snowMat, 0.15)
  const cols = useMemo(() => [new Color(tint[0]), new Color(tint[1])], [tint])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), wet = Math.max(mood.rain, mood.storm * 0.9) * (1 - mood.snow)
    const on = wet > 0.02 && nRain > 0, sn = mood.snow > 0.02 && nSnow > 0
    rain.current.visible = on
    snow.current.visible = sn
    if (on) {
      const a = geo.attributes.position as Float32BufferAttribute, len = 0.85 + mood.storm * 0.4, lean = 0.05 + mood.storm * 0.12
      d.rain.forEach((r, i) => {
        if (!reduceMotion) r.p[1] -= r.v * dt * (1 + mood.storm * 0.4)
        if (r.p[1] < gy(r.p[0], r.p[2])) r.p = spot(true)
        a.setXYZ(i * 2, r.p[0], r.p[1], r.p[2])
        a.setXYZ(i * 2 + 1, r.p[0] - lean * len, r.p[1] + len, r.p[2] - lean * len * 0.6)
      })
      a.needsUpdate = true
      rainMat.color.copy(cols[0]).lerp(cols[1], smooth(mood.night))
      rainMat.opacity = Math.min(0.75, wet * 0.65)
    }
    if (sn) {
      const a = sgeo.attributes.position as Float32BufferAttribute, gust = Math.max(0, mood.snow - 0.7) / 0.3
      d.snow.forEach((r, i) => {
        if (!reduceMotion) { r.p[1] -= r.v * dt * (1 + gust * 0.8); r.ph += dt * 0.7; r.p[0] -= gust * 1.6 * dt }
        if (r.p[1] < gy(r.p[0], r.p[2]) || r.p[0] < area[0]) r.p = spot(true)
        a.setXYZ(i, r.p[0] + Math.sin(r.ph) * 0.25, r.p[1], r.p[2] + Math.cos(r.ph * 0.8) * 0.25)
      })
      a.needsUpdate = true
      snowMat.current.opacity = Math.min(0.95, mood.snow * 1.1)
    }
  })
  return (
    <>
      <lineSegments ref={rain} geometry={geo} material={rainMat} frustumCulled={false} visible={false} renderOrder={3} />
      <points ref={snow} geometry={sgeo} frustumCulled={false} visible={false} renderOrder={3}>
        <pointsMaterial ref={snowMat} map={flake} size={10} sizeAttenuation={false} transparent depthWrite={false} opacity={0} color={0xffffff} />
      </points>
    </>
  )
}
