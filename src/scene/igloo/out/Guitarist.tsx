import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { Busker, buskerMats } from '../../objects/Busker'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'

// Le guitariste de la banquise : un voisin en parka rouge au capuchon de fourrure, debout sur sa plaque de glace, qui joue de la guitare
// nylon pour personne, son étui ouvert à ses pieds, une lanterne de neige à côté. Interactif (`guitar`, objet `guitarist`) : touché, il
// joue et se balance doucement. Repère du joueur : pieds au sol, +z devant lui.

const FADE = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.5, ...o }), FADE)
const MATS = buskerMats(FADE, { shirt: 0xc2402e, pants: 0x2f3a4e, hair: 0x3a2a24, shoe: 0xeee4d2 })
const PARKA = f(0xc2402e, { roughness: 0.7 })
const FUR = f(0xf4efe6, { roughness: 0.95 })
const SPRUCE = f(0xd9a066, { roughness: 0.4, clearcoat: 0.6 })
const DARK = f(0x2a1c18, { roughness: 0.45, clearcoat: 0.4 })
const ROSETTE = f(0xe8d2a0, { roughness: 0.5 })
const WOOD = f(0x7a4a2c, { roughness: 0.5, clearcoat: 0.5 })
const STRAP = f(0x2f6a62, { roughness: 0.8 })
const CASE = f(0x2c2a34, { roughness: 0.6 })
const LINING = f(0xa83a4a, { roughness: 0.9 })
const STICKER = [f(0xf0c040), f(0x58b8a8), f(0xf4efe6)]
const LAMP = skyFade(far(0xfff0c8, { roughness: 0.4, emissive: 0xffb84a, emissiveIntensity: 0.9 }), FADE)

/** La guitare : deux courbes (haute et basse), la rosace, le chevalet, un long manche vers sa gauche (+x) et la sangle. Centre : sous ses mains. */
function Guitar() {
  return (
    <group position={[0.02, 0.9, 0.27]} rotation-z={0.14} scale={1.3}>
      <Part geo={SPH} m={SPRUCE} p={[-0.12, -0.02, 0]} scale={[0.17, 0.15, 0.06]} castShadow={false} />
      <Part geo={SPH} m={SPRUCE} p={[0.07, 0.02, 0]} scale={[0.125, 0.115, 0.055]} castShadow={false} />
      {/* le bord sombre du fond, un liseré de bois */}
      <Part geo={SPH} m={WOOD} p={[-0.12, -0.02, -0.02]} scale={[0.175, 0.155, 0.045]} castShadow={false} />
      <Part geo={SPH} m={WOOD} p={[0.07, 0.02, -0.02]} scale={[0.13, 0.12, 0.045]} castShadow={false} />
      {/* la rosace et la bouche, le chevalet */}
      <Part geo={SPH} m={ROSETTE} p={[-0.02, 0.01, 0.052]} scale={[0.065, 0.065, 0.014]} castShadow={false} />
      <Part geo={SPH} m={DARK} p={[-0.02, 0.01, 0.062]} scale={[0.048, 0.048, 0.01]} castShadow={false} />
      <Part geo={rbox(0.03, 0.1, 0.014, 0.006)} m={WOOD} p={[-0.2, -0.02, 0.058]} castShadow={false} />
      {/* le manche, la touche sombre, la tête et ses chevilles */}
      <Part geo={rbox(0.5, 0.05, 0.045, 0.014)} m={SPRUCE} p={[0.4, 0.05, 0]} rotation-z={0.05} castShadow={false} />
      <Part geo={rbox(0.44, 0.03, 0.016, 0.006)} m={DARK} p={[0.38, 0.052, 0.025]} rotation-z={0.05} castShadow={false} />
      <Part geo={rbox(0.11, 0.06, 0.03, 0.012)} m={DARK} p={[0.7, 0.077, 0]} rotation-z={0.05} castShadow={false} />
      {[-0.02, 0.02].map((dy) => [0.67, 0.72].map((x) => <Part key={`${x}${dy}`} geo={SPH} m={ROSETTE} p={[x, 0.077 + dy, 0.024]} scale={0.011} castShadow={false} />))}
    </group>
  )
}

/** Le capuchon : fourrure en couronne autour du visage, doublure rouge derrière, ourlet de la parka sur les hanches. */
function Hood() {
  const ring = Array.from({ length: 11 }, (_, i) => {
    const a = (-0.55 + (i / 10) * 1.1) * Math.PI * 1.0
    return [Math.sin(a) * 0.205, 1.585 + Math.cos(a) * 0.215, 0.12] as V3
  })
  return (
    <>
      <Part geo={SPH} m={PARKA} p={[0, 1.62, -0.06]} scale={[0.27, 0.27, 0.24]} castShadow={false} />
      {ring.map((p, i) => <Part key={i} geo={SPH} m={FUR} p={p} scale={0.058} castShadow={false} />)}
      <Part geo={rbox(0.5, 0.26, 0.33, 0.09)} m={PARKA} p={[0, 0.75, 0]} castShadow={false} />
      <Part geo={rbox(0.52, 0.05, 0.35, 0.02)} m={FUR} p={[0, 0.62, 0]} castShadow={false} />
    </>
  )
}

/** L'étui ouvert, posé de travers sur la glace : doublure rouge, deux autocollants, un quart de cacao dedans. `p` : le centre au sol. */
function OpenCase({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-y={0.5}>
      <Part geo={rbox(0.7, 0.1, 0.28, 0.035)} m={CASE} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={rbox(0.62, 0.02, 0.2, 0.01)} m={LINING} p={[0, 0.108, 0]} castShadow={false} />
      <group position={[0, 0.1, -0.14]} rotation-x={-1.1}>
        <Part geo={rbox(0.7, 0.26, 0.04, 0.02)} m={CASE} p={[0, 0.13, 0]} castShadow={false} />
        {[[-0.2, 0.12], [0.1, 0.17], [0.24, 0.08]].map(([x, y], i) => <Part key={i} geo={cyl(0.035, 0.035, 0.008, 10)} m={STICKER[i]} p={[x, y, 0.024]} rotation-x={Math.PI / 2} castShadow={false} />)}
      </group>
      <Part geo={cyl(0.045, 0.04, 0.07, 10)} m={STRAP} p={[0.18, 0.14, 0.02]} castShadow={false} />
    </group>
  )
}

/** Une lanterne de neige : un cône de blocs empilés, une bougie qui rougeoie dans l'arche. */
function SnowLantern({ p }: { p: V3 }) {
  return (
    <group position={p} scale={1.5}>
      <Part geo={cyl(0.12, 0.15, 0.1, 10)} m={FUR} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={cyl(0.09, 0.12, 0.1, 10)} m={FUR} p={[0, 0.15, 0]} castShadow={false} />
      <Part geo={SPH} m={LAMP} p={[0, 0.11, 0.125]} scale={[0.045, 0.055, 0.03]} castShadow={false} />
      <Part geo={SPH} m={FUR} p={[0, 0.24, 0]} scale={0.07} castShadow={false} />
    </group>
  )
}

/** Le guitariste lui-même (interactif : hors du <Static> de la plaque). `at` : les pieds sur la glace, dans le repère de la plaque ; `ry` : l'orientation. */
export function Guitarist({ at, ry, scale = 0.7 }: { at: V3; ry: number; scale?: number }) {
  return (
    <Busker id="guitarist" at={at} ry={ry} scale={scale} mats={MATS} hands={[[0.66, 1.0, 0.3], [-0.1, 0.86, 0.37]]} head={<Hood />}>
      <Guitar />
    </Busker>
  )
}

/** Ce qui ne bouge pas autour de lui (à mettre dans le <Static> de la plaque) : l'étui ouvert et la lanterne de neige, au même repère. */
export function GuitarCamp({ at, ry, scale = 0.7 }: { at: V3; ry: number; scale?: number }) {
  return (
    <group position={at} rotation-y={ry} scale={scale}>
      <OpenCase p={[-0.95, 0, 0.7]} />
      <SnowLantern p={[1.0, 0, 0.5]} />
    </group>
  )
}
