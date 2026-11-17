import { far } from '../../materials'
import { Busker, buskerMats } from '../../objects/Busker'
import { Part, SPH, cyl, type V3 } from '../../parts'
import { skyFade } from '../../outdoor'

// Le joueur de flûte du pont de corde, debout entre les deux mains courantes : un chapeau de paille, une chemise moutarde, une flûte de bambou tenue de travers
// devant la bouche. Interactif (`flute`) : touché, il joue un air lent de pâtre (le son `flute`) et se balance.
const FADE = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.6, ...o }), FADE)
const MATS = buskerMats(FADE, { shirt: 0xd9a441, pants: 0x6b5640, hair: 0x7a4a2a, shoe: 0x4a3426 })
const STRAW = f(0xe2c67c, { roughness: 0.85 })
const BAND = f(0xb4603e, { roughness: 0.7 })
const BAMBOO = f(0xc9a559, { roughness: 0.4, clearcoat: 0.5 })
const NODE = f(0x8a6a34, { roughness: 0.5 })
const HOLE = f(0x3a2a1c, { roughness: 0.8 })
const TASSEL = f(0xd8503e, { roughness: 0.8 })

const FY = 1.5, FZ = 0.26, FL = 0.8, FX = 0.03

/** La flûte traversière de bambou : tube, trois nœuds, embouchure, cinq trous, un gland au bout. */
function Flute() {
  return (
    <group position={[FX, FY, FZ]} rotation-z={Math.PI / 2 + 0.06}>
      <Part geo={cyl(0.02, 0.02, FL, 12)} m={BAMBOO} castShadow={false} />
      {[-0.28, 0.02, 0.3].map((y) => <Part key={y} geo={cyl(0.024, 0.024, 0.02, 12)} m={NODE} p={[0, y, 0]} castShadow={false} />)}
      {/* l'embouchure, côté bouche (le côté +z du tube regarde le musicien : un trou ovale posé dessus) */}
      <Part geo={SPH} m={HOLE} p={[0, 0.2, -0.016]} scale={[0.014, 0.022, 0.008]} castShadow={false} />
      {[-0.1, -0.02, 0.06, -0.2, -0.28].map((y) => <Part key={y} geo={SPH} m={HOLE} p={[0, y - 0.04, 0.018]} scale={[0.011, 0.011, 0.006]} castShadow={false} />)}
      <Part geo={cyl(0.003, 0.003, 0.14, 5)} m={TASSEL} p={[0.02, -FL / 2 - 0.05, 0]} castShadow={false} />
      <Part geo={SPH} m={TASSEL} p={[0.02, -FL / 2 - 0.13, 0]} scale={[0.02, 0.035, 0.02]} castShadow={false} />
    </group>
  )
}

/** `at` : ses pieds, sur les planches du pont. */
export function Flautist({ at, ry = Math.PI / 4, scale = 0.7 }: { at: V3; ry?: number; scale?: number }) {
  return (
    <Busker
      id="flautist"
      at={at}
      ry={ry}
      scale={scale}
      mats={MATS}
      hands={[[0.24, FY - 0.02, FZ], [-0.16, FY - 0.02, FZ]]}
      head={(
        <>
          {/* le chapeau de paille : large bord, calotte arrondie, ruban rouille */}
          <Part geo={cyl(0.32, 0.32, 0.025, 20)} m={STRAW} p={[0, 1.7, -0.01]} castShadow={false} />
          <Part geo={SPH} m={STRAW} p={[0, 1.72, -0.01]} scale={[0.225, 0.15, 0.225]} castShadow={false} />
          <Part geo={cyl(0.205, 0.215, 0.05, 20)} m={BAND} p={[0, 1.71, -0.01]} castShadow={false} />
        </>
      )}
    >
      <Flute />
    </Busker>
  )
}
