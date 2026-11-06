import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CanvasTexture, Color, Float32BufferAttribute, type LineSegments, type Points, type PointsMaterial } from 'three'
import { rand, smooth } from '../../../math'
import { mood, reduceMotion, useWorldPointSize } from '../../anim'
import { makeCanvas } from '../../textures'
import { SLAB, toScreen } from './layout'
import { K } from './materials'

const N_RAIN = 220, N_SNOW = 110, N_STAR = 34, TOP = 11, BOTTOM = -7

/** Un point où la pluie peut tomber : jamais au-dessus du socle (la chambre est à l'abri), ni devant la chambre vue de la caméra. */
function spot(): [number, number, number] {
  for (;;) {
    const x = rand(-15, 15), z = rand(-15, 15), y = rand(BOTTOM, TOP)
    const inRoom = Math.abs(x - SLAB.c) < SLAB.h + 0.25 && Math.abs(z - SLAB.c) < SLAB.h + 0.25 && y > -1.2
    if (inRoom) continue
    const [sx, , dz] = toScreen([x, y, z])
    if (Math.abs(sx) < 5.6 && dz > -3) continue
    if (Math.abs(sx) > 13 ) continue
    return [x, y, z]
  }
}

/** La pluie et la neige du dehors, autour du banc de nuages : des traits fins et des flocons ronds. Rien ne tombe dans la chambre. */
export function Precip() {
  const rain = useRef<LineSegments>(null!), snow = useRef<Points>(null!), snowMat = useRef<PointsMaterial>(null!)
  const d = useMemo(() => ({
    rain: Array.from({ length: N_RAIN }, () => ({ p: spot(), v: rand(7, 10) })),
    snow: Array.from({ length: N_SNOW }, () => ({ p: spot(), v: rand(0.5, 1.0), ph: rand(0, 6.3) })),
  }), [])
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(N_RAIN * 6), 3))
    return g
  }, [])
  const sgeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(N_SNOW * 3), 3))
    return g
  }, [])
  const flake = useMemo(() => {
    const [c, x] = makeCanvas(32, 32)
    const g = x.createRadialGradient(16, 16, 1, 16, 16, 15)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 32, 32)
    return new CanvasTexture(c)
  }, [])
  useWorldPointSize(snowMat, 0.16)
  const col = useMemo(() => new Color(), [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), wet = Math.max(mood.rain, mood.storm * 0.9)
    const on = wet > 0.02, sn = mood.snow > 0.02
    rain.current.visible = on
    snow.current.visible = sn
    if (on) {
      const a = geo.attributes.position as Float32BufferAttribute, len = 0.9 + mood.storm * 0.4
      d.rain.forEach((r, i) => {
        if (!reduceMotion) r.p[1] -= r.v * dt * (1 + mood.storm * 0.4)
        if (r.p[1] < BOTTOM) { r.p = spot(); r.p[1] = TOP }
        a.setXYZ(i * 2, r.p[0], r.p[1], r.p[2])
        a.setXYZ(i * 2 + 1, r.p[0] - 0.05 * len, r.p[1] + len, r.p[2] - 0.05 * len)
      })
      a.needsUpdate = true
      col.set(0xe4eaff).lerp(col.clone().set(0x9fa6d0), smooth(mood.night))
      K.rain.color.copy(col)
      K.rain.opacity = Math.min(0.8, wet * 0.7)
    }
    if (sn) {
      const a = sgeo.attributes.position as Float32BufferAttribute
      d.snow.forEach((r, i) => {
        if (!reduceMotion) { r.p[1] -= r.v * dt; r.ph += dt * 0.7 }
        if (r.p[1] < BOTTOM) { r.p = spot(); r.p[1] = TOP }
        a.setXYZ(i, r.p[0] + Math.sin(r.ph) * 0.25, r.p[1], r.p[2] + Math.cos(r.ph * 0.8) * 0.25)
      })
      a.needsUpdate = true
      snowMat.current.opacity = Math.min(0.95, mood.snow * 1.1)
    }
  })
  return (
    <>
      <lineSegments ref={rain} geometry={geo} material={K.rain} frustumCulled={false} visible={false} renderOrder={3} />
      <points ref={snow} geometry={sgeo} frustumCulled={false} visible={false} renderOrder={3}>
        <pointsMaterial ref={snowMat} map={flake} size={10} sizeAttenuation={false} transparent depthWrite={false} opacity={0} color={0xffffff} />
      </points>
      <Twinkles />
    </>
  )
}

/** La nuit, des éclats de lumière qui scintillent autour du banc de nuages. */
function Twinkles() {
  const pm = useRef<PointsMaterial>(null!), pts = useRef<Points>(null!)
  const data = useMemo(() => {
    const list = Array.from({ length: N_STAR }, () => {
      for (;;) {
        const [x, y, z] = spot()
        if (y > -2 && y < 9) return { x, y, z, ph: rand(0, 6.3), sp: rand(0.5, 1.4) }
      }
    })
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(list.flatMap((s) => [s.x, s.y, s.z]), 3))
    g.setAttribute('color', new Float32BufferAttribute(new Float32Array(list.length * 4), 4))
    return { list, g }
  }, [])
  const tex = useMemo(() => {
    const [c, x] = makeCanvas(48, 48)
    const g = x.createRadialGradient(24, 24, 0, 24, 24, 22)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,250,225,0.8)'); g.addColorStop(1, 'rgba(255,250,225,0)')
    x.fillStyle = g; x.fillRect(0, 0, 48, 48)
    x.fillStyle = 'rgba(255,252,235,0.9)'
    x.fillRect(22.5, 4, 3, 40); x.fillRect(4, 22.5, 40, 3)
    return new CanvasTexture(c)
  }, [])
  useWorldPointSize(pm, 0.3)
  useFrame((_, delta) => {
    const night = smooth(mood.night) * (1 - Math.min(1, mood.rain * 0.7 + mood.storm))
    pts.current.visible = night > 0.04
    if (!pts.current.visible) return
    const col = data.g.attributes.color
    data.list.forEach((p, i) => {
      if (!reduceMotion) p.ph += Math.min(delta, 0.05) * p.sp
      const k = (0.35 + 0.65 * Math.max(0, Math.sin(p.ph))) * night
      col.setXYZW(i, 1, 0.96, 0.82, k)
    })
    col.needsUpdate = true
  })
  return (
    <points ref={pts} geometry={data.g} frustumCulled={false} visible={false} renderOrder={2}>
      <pointsMaterial ref={pm} map={tex} vertexColors sizeAttenuation={false} transparent depthWrite={false} size={10} />
    </points>
  )
}
