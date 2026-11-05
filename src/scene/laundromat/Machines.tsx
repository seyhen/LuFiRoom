import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Shape, ShapeGeometry, type Group, type Material, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, smooth } from '../../math'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { L } from './materials'
import { blob, cone, ell } from '../blob'
import { JUG_BLUE, Jug } from './Jug'
import { dryerPanelTexes, panelTexes } from './textures'
import { MeshStandardMaterial } from 'three'

/** Les cotes d'un lave-linge : profondeur (x, la façade vers +x), largeur (z), hauteur. */
export const WASHER = { D: 0.74, W: 0.82, H: 0.86 }
const FRONT = WASHER.D / 2 + 0.02 // la face de la tôle d'inox de devant
const RIM_X = FRONT + 0.03 // le plan du hublot

const panelMats = panelTexes.map((t) => new MeshStandardMaterial({ map: t, roughness: 0.4, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.18 }))
const dryerPanelMats = dryerPanelTexes.map((t) => new MeshStandardMaterial({ map: t, roughness: 0.4, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.18 }))

/** Une pièce de linge dans un tambour : sa forme (une boule de tissu aplatie), sa couleur, son rayon dans le tambour, son décalage. */
interface Cloth {
  m: Material
  s: V3
  r: number
  off: number
}
const LOAD_WASH: Cloth[] = [
  { m: L.coral, s: [0.015, 0.07, 0.1], r: 0.12, off: 0 },
  { m: L.sky, s: [0.016, 0.08, 0.085], r: 0.14, off: 0.17 },
  { m: L.butter, s: [0.015, 0.06, 0.09], r: 0.1, off: 0.36 },
  { m: L.white, s: [0.015, 0.075, 0.075], r: 0.13, off: 0.52 },
  { m: L.lilac, s: [0.015, 0.065, 0.1], r: 0.115, off: 0.68 },
  { m: L.pinkCloth, s: [0.015, 0.055, 0.07], r: 0.08, off: 0.84 },
]
const LOAD_DRY: Cloth[] = [
  { m: L.mintCloth, s: [0.016, 0.085, 0.11], r: 0.15, off: 0 },
  { m: L.coral, s: [0.016, 0.07, 0.09], r: 0.13, off: 0.2 },
  { m: L.white, s: [0.016, 0.09, 0.1], r: 0.16, off: 0.4 },
  { m: L.butter, s: [0.016, 0.065, 0.08], r: 0.12, off: 0.58 },
  { m: L.sky, s: [0.016, 0.075, 0.095], r: 0.14, off: 0.76 },
]

/**
 * Une pièce de linge froissée, d'une seule peau : un corps, deux plis, une manche qui part de travers. Taillée dans un cube
 * de ±1 comme la sphère unité : l'échelle de chaque pièce en fait une serviette, un tee-shirt, une chaussette.
 */
const CLOTH = blob(
  [
    ell([0, 0, 0], [0.85, 0.75, 0.85]),
    ell([0.1, 0.5, 0.45], [0.6, 0.45, 0.5]),
    ell([-0.1, -0.45, -0.4], [0.6, 0.45, 0.55]),
    cone([0, -0.1, 0.45], [0.15, -0.75, 0.95], 0.32, 0.22),
  ],
  { h: 0.12, k: 0.25 },
)
CLOTH.deleteAttribute('color')

/** L'eau au fond du tambour d'un lave-linge : un segment de disque sous une corde (le niveau). */
function waterGeo(R: number, level: number) {
  const a = Math.asin(Math.max(-1, Math.min(1, level / R)))
  const s = new Shape()
  s.absarc(0, 0, R, a, Math.PI - a, true)
  s.closePath()
  return new ShapeGeometry(s, 24)
}

/**
 * Le linge derrière un hublot. Chaque pièce monte avec le tambour, puis retombe (le linge qui « culbute ») ; dans un lave-linge
 * elle retombe tôt dans l'eau, dans un sèche-linge elle monte presque en haut avant de tomber. `drive()` donne, à chaque image,
 * la vitesse du tambour (rad/s, signée) : la phase s'additionne image après image.
 */
function Drum({ R, load, lift, drive, water }: { R: number; load: Cloth[]; lift: number; drive: () => number; water?: boolean }) {
  const items = useRef<(Mesh | null)[]>([]), back = useRef<Group>(null!), wat = useRef<Mesh>(null!)
  const st = useRef({ th: 0, dir: 1, slosh: 0 })
  const wgeo = useMemo(() => (water ? waterGeo(R - 0.012, -R * 0.45) : null), [R, water])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, v = drive()
    s.th += v * dt
    if (Math.abs(v) > 0.05) s.dir = Math.sign(v)
    back.current.rotation.x = s.th
    load.forEach((c, i) => {
      const m = items.current[i]
      if (!m) return
      // la phase de la pièce dans son cycle : elle monte (0 → 0,78) puis retombe vite (0,78 → 1)
      const k = (((s.th * s.dir) / TAU + c.off) % 1 + 1) % 1
      const up = k < 0.78 ? smooth(k / 0.78) : 1 - smooth((k - 0.78) / 0.22)
      const a = -Math.PI / 2 + up * lift
      m.position.set(0.014 + (i % 3) * 0.006, Math.sin(a) * c.r, -Math.cos(a) * c.r * s.dir)
      m.rotation.x = s.th * 0.6 + c.off * 7
    })
    if (wat.current) {
      s.slosh += dt * (1.6 + Math.abs(v) * 0.3)
      wat.current.rotation.x = Math.sin(s.slosh) * 0.08 * Math.min(1, Math.abs(v) / 3) + -0.12 * Math.sign(v) * Math.min(1, Math.abs(v) / 3)
    }
  })
  return (
    <group userData={LIVE}>
      <group>
        {/* le fond du tambour, percé de trous, qui tourne */}
        <group ref={back}>
          <mesh geometry={cyl(R, R, 0.004, 32)} material={water ? L.drum : L.dryerDrum} rotation-z={Math.PI / 2} raycast={noRay} />
        </group>
        {load.map((c, i) => (
          <mesh key={i} ref={(m) => (items.current[i] = m)} geometry={CLOTH} material={c.m} scale={c.s} raycast={noRay} />
        ))}
        {wgeo && (
          <mesh ref={wat} geometry={wgeo} material={L.water} position={[0.05, 0, 0]} rotation-y={Math.PI / 2} renderOrder={3} raycast={noRay} />
        )}
      </group>
    </group>
  )
}

/** Le hublot : le cadre de plastique gris, la bague chromée, le joint de caoutchouc, le verre bombé ; la poignée et la charnière. */
function Porthole({ R, children, y, bezel = 0.06 }: { R: number; children?: ReactNode; y: number; bezel?: number }) {
  return (
    <group position={[RIM_X, y, 0]}>
      <Part geo={cyl(R + bezel, R + bezel, 0.02, 40)} m={L.plastic} p={[-0.02, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      <group position={[-0.002, 0, 0]}>{children}</group>
      <Part m={L.rubber} p={[0.0, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[R - 0.005, 0.02, 10, 40]} />
      </Part>
      <Part m={L.chrome} p={[0.008, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[R + 0.025, 0.028, 12, 44]} />
      </Part>
      <mesh geometry={SPH} material={L.porthole} scale={[0.045, R, R]} position={[0.01, 0, 0]} renderOrder={4} raycast={noRay} />
      {/* la poignée, à droite, et les deux charnières, à gauche */}
      <Part geo={rbox(0.05, 0.16, 0.04, 0.018)} m={L.chrome} p={[0.025, 0, -(R + bezel)]} castShadow={false} />
      {[-0.1, 0.1].map((dy) => (
        <Part key={dy} geo={rbox(0.03, 0.05, 0.05, 0.012)} m={L.chrome} p={[0.0, dy, R + bezel + 0.005]} castShadow={false} />
      ))}
    </group>
  )
}

/** La caisse d'une machine : l'émail blanc des flancs, la façade d'inox, la plinthe, le bandeau de commande et son bouton. */
function Cabinet({ H, panel, knobZ = -0.088 }: { H: number; panel: Material; knobZ?: number }) {
  const { D, W } = WASHER
  return (
    <>
      <Part geo={rbox(D, H, W, 0.05)} m={L.enamel} p={[0, H / 2, 0]} />
      <Part geo={rbox(0.03, H - 0.06, W - 0.05, 0.02)} m={L.steel} p={[D / 2 + 0.005, H / 2, 0]} castShadow={false} />
      <Part geo={rbox(0.02, 0.06, W - 0.1, 0.01)} m={L.rubber} p={[FRONT, 0.045, 0]} castShadow={false} />
      <mesh material={panel} position={[FRONT + 0.004, H - 0.095, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[W - 0.12, 0.13]} />
      </mesh>
      <Part geo={cyl(0.034, 0.038, 0.03, 16)} m={L.plastic} p={[FRONT + 0.018, H - 0.105, knobZ]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.012, 0.03, 0.008, 0.003)} m={L.ink} p={[FRONT + 0.036, H - 0.09, knobZ]} castShadow={false} />
    </>
  )
}

/** Le tiroir à lessive en haut à gauche, et la coulure bleue de lessive séchée sous lui (on a trop rempli). */
function SoapDrawer({ H, drip }: { H: number; drip?: boolean }) {
  return (
    <>
      <Part geo={rbox(0.03, 0.075, 0.2, 0.015)} m={L.plastic} p={[FRONT + 0.01, H - 0.215, 0.27]} castShadow={false} />
      <Part geo={rbox(0.01, 0.02, 0.09, 0.006)} m={L.rubber} p={[FRONT + 0.028, H - 0.2, 0.27]} castShadow={false} />
      {drip && <Part geo={rbox(0.006, 0.1, 0.018, 0.006)} m={L.capBlue} p={[FRONT + 0.003, H - 0.3, 0.3]} castShadow={false} />}
    </>
  )
}

const PORT_Y = 0.4

/**
 * Le lave-linge interactif (le n° 2, au milieu de la rangée) : quand son son joue, le tambour tourne, s'arrête et repart dans
 * l'autre sens au même instant qu'on l'entend (le canal avance `pulses.wash` à chaque reprise) ; le linge de couleur culbute
 * dans l'eau savonneuse, l'eau clapote, la machine tremble à peine. Sur le dessus : un bidon de lessive et deux pièces.
 */
export function WasherLive({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), shake = useRef<Group>(null!)
  const st = useRef({ seen: useStore.getState().pulses.wash ?? 0, dir: 1, run: 0, v: 0, t: 0 })
  useSquash('washer', g)
  const drive = () => st.current.v
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'washer')
    const n = store.pulses.wash ?? 0
    if (n !== s.seen) {
      s.seen = n
      s.dir = -s.dir
      s.run = RUN
    }
    s.run = Math.max(0, s.run - dt)
    const target = on && !reduceMotion && s.run > 0 ? s.dir * 4.2 : 0
    s.v = approach(s.v, target, dt * 6)
    s.t += dt
    const j = reduceMotion ? 0 : Math.min(1, Math.abs(s.v) / 4) * 0.0025
    shake.current.position.set(Math.sin(s.t * 71) * j, Math.abs(Math.sin(s.t * 53)) * j, Math.sin(s.t * 89) * j)
  })
  return (
    <group ref={g} userData={{ id: 'washer' }} position={position}>
      <group ref={shake}>
        <Static>
          <Cabinet H={WASHER.H} panel={panelMats[1]} />
          <SoapDrawer H={WASHER.H} drip />
          {/* sur le dessus : un bidon de lessive bleue, deux pièces oubliées */}
          <Jug p={[0.05, WASHER.H, 0.18]} {...JUG_BLUE} />
          {[[0.1, -0.14], [0.06, -0.2]].map(([x, z], i) => (
            <Part key={i} geo={cyl(0.024, 0.024, 0.006, 16)} m={i ? L.silver : L.gold} p={[x, WASHER.H + 0.003 + i * 0.006, z]} castShadow={false} />
          ))}
        </Static>
        <Porthole R={0.2} y={PORT_Y}>
          <Drum R={0.2} load={LOAD_WASH} lift={1.15} drive={drive} water />
        </Porthole>
      </group>
    </group>
  )
}
/** La durée d'un tour de tambour dans un sens, en secondes (channels/wash.ts la reprend). */
export const RUN = 8

/**
 * Un lave-linge du décor. `load` : du linge au fond (le cycle est fini, on n'est pas encore venu le chercher) ; `open` : porte
 * grande ouverte, une chaussette rayée qui pend du joint ; `num` : son numéro sur le bandeau.
 */
export function Washer({ position, num, load, open, children }: { position: V3; num: number; load?: boolean; open?: boolean; children?: ReactNode }) {
  const H = WASHER.H
  return (
    <group position={position}>
      <Cabinet H={H} panel={panelMats[num - 1]} />
      <SoapDrawer H={H} />
      {!open && (
        <Porthole R={0.2} y={PORT_Y}>
          <Part geo={cyl(0.2, 0.2, 0.004, 32)} m={L.drum} p={[0, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {load &&
            LOAD_WASH.slice(0, 5).map((c, i) => (
              <Part key={i} geo={CLOTH} m={c.m} scale={c.s} p={[0.014 + (i % 2) * 0.006, -0.14 + (i % 3) * 0.03, -0.12 + i * 0.06]} rotation-x={i} castShadow={false} />
            ))}
        </Porthole>
      )}
      {open && (
        <>
          {/* le tambour vide, vu par la porte ouverte : son fond, son joint ; la porte pivotée sur ses charnières */}
          <group position={[RIM_X - 0.017, PORT_Y, 0]}>
            <Part geo={cyl(0.26, 0.26, 0.02, 40)} m={L.plastic} p={[-0.003, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.2, 0.2, 0.004, 32)} m={L.drum} p={[0.016, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part m={L.rubber} p={[0.019, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.195, 0.024, 10, 40]} />
            </Part>
            {/* la chaussette rayée qui pend du joint */}
            <group position={[0.04, -0.17, -0.06]} rotation-x={0.2}>
              <Part geo={rbox(0.018, 0.14, 0.05, 0.009)} m={L.coral} p={[0, -0.06, 0]} castShadow={false} />
              <Part geo={rbox(0.019, 0.03, 0.052, 0.009)} m={L.white} p={[0, -0.03, 0]} castShadow={false} />
              <Part geo={rbox(0.019, 0.03, 0.052, 0.009)} m={L.white} p={[0, -0.09, 0]} castShadow={false} />
              <Part geo={SPH} m={L.coral} scale={[0.01, 0.028, 0.05]} p={[0.008, -0.14, 0.03]} castShadow={false} />
            </group>
          </group>
          <group position={[RIM_X + 0.01, PORT_Y, 0.26]} rotation-y={-1.25}>
            <group position={[0, 0, -0.26]}>
              <Part m={L.chrome} rotation-y={Math.PI / 2} castShadow={false}>
                <torusGeometry args={[0.225, 0.028, 12, 44]} />
              </Part>
              <mesh geometry={SPH} material={L.porthole} scale={[0.045, 0.2, 0.2]} position={[0.004, 0, 0]} renderOrder={4} raycast={noRay} />
              <Part geo={rbox(0.05, 0.16, 0.04, 0.018)} m={L.chrome} p={[0.02, 0, -0.26]} castShadow={false} />
            </group>
          </group>
        </>
      )}
      {children}
    </group>
  )
}

const DRY_H = 0.82
const DRY_R = 0.22
const DRY_Y = 0.37

/** Un sèche-linge de la colonne : sa caisse, son bandeau ; le hublot vient en enfant. */
function DryerUnit({ y, panel, children }: { y: number; panel: Material; children?: ReactNode }) {
  return (
    <group position={[0, y, 0]}>
      <Cabinet H={DRY_H} panel={panel} />
      {children}
    </group>
  )
}

/**
 * La colonne de deux sèche-linge, dans le coin du fond : le n° 5 en haut (celui qui tourne), le n° 6 en bas. Quand son son joue,
 * le tambour du haut tourne toujours dans le même sens, le linge monte presque en haut et retombe, le fond rougeoie de chaleur
 * derrière le verre. Sur le dessus : une pile de cintres et un sac de linge.
 */
export function DryerStack({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), st = useRef({ v: 0, heat: 0 })
  useSquash('dryer', g)
  const drive = () => st.current.v
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'dryer')
    s.v = approach(s.v, on && !reduceMotion ? 3.6 : 0, dt * 2.5)
    s.heat = approach(s.heat, on ? 1 : 0, dt * 0.4)
    L.dryerDrum.emissiveIntensity = s.heat * 0.55
  })
  const top = 0.06 + DRY_H * 2 + 0.06
  return (
    <group ref={g} userData={{ id: 'dryer' }} position={position}>
      <Static>
        <Part geo={rbox(WASHER.D, 0.06, WASHER.W, 0.02)} m={L.steelDark} p={[0, 0.03, 0]} />
        {/* la traverse entre les deux machines */}
        <Part geo={rbox(WASHER.D + 0.01, 0.06, WASHER.W + 0.01, 0.02)} m={L.steel} p={[0, 0.06 + DRY_H + 0.03, 0]} castShadow={false} />
        {/* sur le dessus : trois cintres de fil posés en vrac, un sac de linge en filet */}
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0.05 - i * 0.05, top + 0.012 + i * 0.012, -0.12 + i * 0.06]} rotation-y={0.3 * i - 0.2}>
            <Part m={L.chrome} rotation-x={Math.PI / 2} scale={[1, 0.5, 1]} castShadow={false}>
              <torusGeometry args={[0.16, 0.009, 6, 24, Math.PI]} />
            </Part>
            <Part geo={cyl(0.009, 0.009, 0.32, 6)} m={L.chrome} rotation-z={Math.PI / 2} p={[0, 0, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={SPH} m={L.white} scale={[0.17, 0.11, 0.15]} p={[-0.1, top + 0.1, 0.22]} />
        <Part geo={SPH} m={L.lilac} scale={[0.1, 0.06, 0.09]} p={[-0.06, top + 0.18, 0.22]} castShadow={false} />
      </Static>
      <Static>
      <DryerUnit y={0.06} panel={dryerPanelMats[1]}>
          <Porthole R={DRY_R} y={DRY_Y} bezel={0.04}>
            <Part geo={cyl(DRY_R, DRY_R, 0.004, 32)} m={L.drum} rotation-z={Math.PI / 2} castShadow={false} />
            {LOAD_DRY.slice(0, 3).map((c, i) => (
              <Part key={i} geo={CLOTH} m={c.m} scale={c.s} p={[0.014, -0.16 + i * 0.02, -0.09 + i * 0.09]} rotation-x={i * 0.7} castShadow={false} />
            ))}
          </Porthole>
      </DryerUnit>
      <DryerUnit y={0.06 + DRY_H + 0.06} panel={dryerPanelMats[0]}>
        <Porthole R={DRY_R} y={DRY_Y} bezel={0.04}>
          <Drum R={DRY_R} load={LOAD_DRY} lift={2.5} drive={drive} />
        </Porthole>
      </DryerUnit>
      </Static>
    </group>
  )
}
