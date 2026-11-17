import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { approach } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { reduceMotion } from '../../anim'
import { far } from '../../materials'
import { Busker, buskerMats } from '../../objects/Busker'
import { canvasTex } from '../../paint'
import { skyFade } from '../../outdoor'
import { LIVE, Static } from '../../Static'
import { Part, SPH, SPH_LO, cyl, orient, rbox, type V3 } from '../../parts'

// L'accordéoniste du toit voisin : un béret, une marinière, un accordéon dont le soufflet s'ouvre et se ferme. Interactif
// (`accordion`) : touché, il joue une valse (le son `accordion`), se balance et fait respirer son soufflet. Une chaise de bistrot
// et une bouteille de vin à côté de lui.

const FADE = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5, below: -4.6 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.5, ...o }), FADE)
const STRIPES = canvasTex(64, 64, (x) => {
  x.fillStyle = '#f2ece0'; x.fillRect(0, 0, 64, 64)
  x.fillStyle = '#2f4570'
  for (let y = 4; y < 64; y += 16) x.fillRect(0, y, 64, 8)
})
const MATS = buskerMats(FADE, { shirt: 0xffffff, shirtMap: STRIPES, pants: 0x2c2f3c, hair: 0x4a3a30 })
const BERET = f(0x8a2f3c, { roughness: 0.9 })
const SCARF = f(0xd8503e, { roughness: 0.8 })
const BODY = f(0x2c2830, { roughness: 0.35, clearcoat: 0.6 })
const RIDGE = f(0xc0414a, { roughness: 0.7 })
const VALLEY = f(0x6a2430, { roughness: 0.8 })
const CREAM = f(0xf0e6d0, { roughness: 0.4, clearcoat: 0.5 })
const STRAP = f(0x6a4a34, { roughness: 0.8 })
const WOOD = f(0x9a6a44, { roughness: 0.7 })
const GLASS = f(0x3e5a3a, { roughness: 0.15, clearcoat: 1 })
const WINE = f(0x4a1824, { roughness: 0.3 })
const CORK = f(0xc8a070, { roughness: 0.8 })

const SLICES = 9, PITCH = 0.036, HALF = (SLICES * PITCH) / 2, END = 0.11, OPEN = 0.22

/** L'accordéon, tenu à hauteur de poitrine : deux caisses (touches à droite, boutons à gauche) et le soufflet plissé entre elles. */
function Squeezebox() {
  const stack = useRef<Group>(null!), endL = useRef<Group>(null!), endR = useRef<Group>(null!)
  const s = useRef({ amp: 0, phase: 0 })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    S.amp = approach(S.amp, isActive(useStore.getState(), 'accordion') && !reduceMotion ? 1 : 0, dt * 1.2)
    S.phase += dt * 1.3
    const open = S.amp * (0.5 + 0.5 * Math.sin(S.phase))
    stack.current.scale.x = 1 + OPEN * open
    endL.current.position.x = HALF + 0.002 + END / 2 + HALF * OPEN * open
    endR.current.position.x = -endL.current.position.x
  })
  return (
    <group position={[0, 1.02, 0.3]}>
      {/* le soufflet : des plis rouges (hauts) séparés de creux sombres, qui s'étirent ensemble */}
      <group ref={stack} userData={LIVE}>
        <Static>
          {Array.from({ length: SLICES }, (_, i) => {
            const ridge = i % 2 === 0
            return <Part key={i} geo={rbox(PITCH * 0.98, ridge ? 0.3 : 0.26, ridge ? 0.26 : 0.22, 0.012)} m={ridge ? RIDGE : VALLEY} p={[-HALF + PITCH * (i + 0.5), 0, 0]} castShadow={false} />
          })}
        </Static>
      </group>
      {/* le côté gauche du musicien (+x) : la caisse des basses, une grille de boutons */}
      <group ref={endL} userData={LIVE}>
        <Static>
          <Part geo={rbox(END, 0.36, 0.3, 0.035)} m={BODY} castShadow={false} />
          {[0.08, 0, -0.08].flatMap((y) => [-0.025, 0.025].map((dx) => <Part key={`${y}${dx}`} geo={SPH_LO} m={CREAM} p={[dx, y, 0.157]} scale={[0.02, 0.02, 0.01]} castShadow={false} />))}
        </Static>
      </group>
      {/* la caisse des aigus (−x) : le clavier de touches blanches */}
      <group ref={endR} userData={LIVE}>
        <Static>
          <Part geo={rbox(END, 0.36, 0.3, 0.035)} m={BODY} castShadow={false} />
          <Part geo={rbox(0.09, 0.24, 0.012, 0.004)} m={CREAM} p={[0, 0, 0.156]} castShadow={false} />
          {[0.07, 0, -0.07].map((y) => <Part key={y} geo={rbox(0.05, 0.035, 0.012, 0.006)} m={BODY} p={[0.0, y, 0.164]} castShadow={false} />)}
        </Static>
      </group>
    </group>
  )
}

/** La sangle d'épaule : de la caisse à l'épaule, un ruban. */
function Strap({ side }: { side: 1 | -1 }) {
  const a: V3 = [side * 0.26, 1.2, 0.3], b: V3 = [side * 0.26, 1.34, 0.0], d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  return <Part geo={rbox(0.05, Math.hypot(...d), 0.012, 0.004)} m={STRAP} p={[a[0], (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
}

/** La chaise de bistrot : assise, quatre pieds, dossier à deux barres ; une bouteille de vin sur l'assise. `p` : le sol. */
function BistroChair({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(0.38, 0.045, 0.36, 0.02)} m={WOOD} p={[0, 0.44, 0]} castShadow={false} />
      {[-0.15, 0.15].flatMap((x) => [-0.14, 0.14].map((z) => <Part key={`${x}${z}`} geo={cyl(0.017, 0.013, 0.42, 6)} m={WOOD} p={[x, 0.21, z]} castShadow={false} />))}
      {[-0.15, 0.15].map((x) => <Part key={x} geo={cyl(0.015, 0.015, 0.46, 6)} m={WOOD} p={[x, 0.68, -0.16]} castShadow={false} />)}
      {[0.6, 0.78].map((y) => <Part key={y} geo={rbox(0.36, 0.05, 0.025, 0.012)} m={WOOD} p={[0, y, -0.16]} castShadow={false} />)}
      <Part geo={cyl(0.05, 0.05, 0.19, 10)} m={GLASS} p={[0.08, 0.5575, 0.02]} castShadow={false} />
      <Part geo={cyl(0.019, 0.026, 0.12, 8)} m={GLASS} p={[0.08, 0.7125, 0.02]} castShadow={false} />
      <Part geo={cyl(0.02, 0.02, 0.025, 8)} m={CORK} p={[0.08, 0.785, 0.02]} castShadow={false} />
      <Part geo={cyl(0.052, 0.052, 0.06, 10)} m={WINE} p={[0.08, 0.5575, 0.02]} castShadow={false} />
    </group>
  )
}

/** `at` : les pieds sur le toit (x, y, z). */
export function Accordionist({ at, ry }: { at: V3; ry: number }) {
  return (
    <>
      <Busker
        id="accordion"
        at={at}
        ry={ry}
        mats={MATS}
        hands={[[0.37, 1.0, 0.3], [-0.37, 1.0, 0.3]]}
        head={(
          <>
            <Part geo={SPH} m={BERET} p={[0.03, 1.77, -0.01]} scale={[0.27, 0.07, 0.265]} rotation={[0, 0, 0.14]} castShadow={false} />
            <Part geo={SPH_LO} m={BERET} p={[0.03, 1.84, -0.01]} scale={[0.025, 0.025, 0.025]} castShadow={false} />
            <Part geo={SPH} m={SCARF} p={[0, 1.31, 0.02]} scale={[0.14, 0.05, 0.14]} castShadow={false} />
          </>
        )}
      >
        <Squeezebox />
        <Strap side={1} />
        <Strap side={-1} />
      </Busker>
      <BistroChair p={[at[0] + Math.cos(ry) * 1.0 + Math.sin(ry) * 0.25, at[1], at[2] - Math.sin(ry) * 1.0 + Math.cos(ry) * 0.25]} ry={ry + 0.5} />
    </>
  )
}
