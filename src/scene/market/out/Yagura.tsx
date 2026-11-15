import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { approach } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { reduceMotion, useSquash } from '../../anim'
import { Busker, buskerMats } from '../../objects/Busker'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'
import { LIVE, Static } from '../../Static'
import { S } from './Stalls'
import { F } from './Zakkyo'

// La yagura de la fête bon-odori, au bout de la rue : la petite tour de bois d'un quartier, ceinte de tissu rouge et blanc (kôhaku maku),
// un taiko sur son support, des lanternes accrochées sous le toit. Interactive (`yagura`) : touchée, le tambour joue au loin (le son
// `bonodori`), le tambourinaire (en happi indigo) se balance, le tambour respire et les lanternes se balancent à peine.

const MATS = buskerMats(F, { shirt: 0x27358c, pants: 0xf2e8d2, hair: 0x1c1c24 })
const DECK = 0.95
const STRIPES = [-0.68, -0.34, 0, 0.34, 0.68]

/** Un bandeau de tissu rouge et blanc autour du socle, sur la face tournée vers +z puis vers +x (les deux faces qu'on voit). */
function Curtain() {
  return (
    <>
      {STRIPES.map((o, i) => {
        const m = i % 2 ? S.cream : S.red
        return (
          <group key={o}>
            <Part geo={rbox(0.33, 0.7, 0.04, 0.012)} m={m} p={[o, 0.5, 0.865]} castShadow={false} />
            <Part geo={rbox(0.04, 0.7, 0.33, 0.012)} m={m} p={[0.865, 0.5, o]} castShadow={false} />
          </group>
        )
      })}
    </>
  )
}

/** Le taiko : fût de bois cerclé de clous, deux peaux, sur un support de bois en X. Centré sur son axe z, `y` : le centre. */
function Taiko({ y }: { y: number }) {
  return (
    <group>
      <Part geo={cyl(0.31, 0.31, 0.44, 22)} m={S.woodPale} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      {[-0.21, 0.21].map((z) => <Part key={z} geo={cyl(0.335, 0.335, 0.045, 22)} m={S.cream} p={[0, y, z * 1.04]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {[-0.245, 0.245].map((z) => <Part key={z} geo={cyl(0.345, 0.345, 0.03, 22)} m={S.wood} p={[0, y, z]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {/* le tomoe rouge au milieu de la peau de devant */}
      <Part geo={cyl(0.13, 0.13, 0.012, 14)} m={S.red} p={[0, y, 0.246]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.05, 0.05, 0.016, 10)} m={S.cream} p={[0, y, 0.249]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* le support : deux pieds en X de chaque côté, une barre */}
      {[-0.22, 0.22].map((z) => (
        <group key={z}>
          <Part geo={rbox(0.05, 0.62, 0.05, 0.015)} m={S.wood} p={[0.36, y - 0.3, z]} rotation-z={0.26} castShadow={false} />
          <Part geo={rbox(0.05, 0.62, 0.05, 0.015)} m={S.wood} p={[-0.36, y - 0.3, z]} rotation-z={-0.26} castShadow={false} />
        </group>
      ))}
      <Part geo={rbox(0.9, 0.05, 0.05, 0.015)} m={S.wood} p={[0, y - 0.5, 0.22]} castShadow={false} />
      <Part geo={rbox(0.9, 0.05, 0.05, 0.015)} m={S.wood} p={[0, y - 0.5, -0.22]} castShadow={false} />
    </group>
  )
}

/** Une lanterne de papier rouge, une bande blanche, ses capuchons noirs et sa cordelette. `y` : le haut de la cordelette. */
function Chochin({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.008, 0.008, 0.14, 5)} m={S.iron} p={[0, -0.07, 0]} castShadow={false} />
      <Part geo={SPH} m={S.lantern} p={[0, -0.28, 0]} scale={[0.1, 0.13, 0.1]} castShadow={false} />
      <Part geo={cyl(0.1, 0.1, 0.03, 12)} m={S.cream} p={[0, -0.28, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 0.05, 0.03, 10)} m={S.iron} p={[0, -0.145, 0]} castShadow={false} />
      <Part geo={cyl(0.05, 0.05, 0.03, 10)} m={S.iron} p={[0, -0.415, 0]} castShadow={false} />
    </group>
  )
}

const EAVE: V3[] = [[1.0, 0, 1.0], [0, 0, 1.03], [-1.0, 0, 1.0], [1.03, 0, 0], [1.0, 0, -1.0]]

/** `at` : le pied de la tour sur la chaussée (x, y, z). `ry` : l'orientation (le devant vers la caméra pour π/4). */
export function Yagura({ at, ry }: { at: V3; ry: number }) {
  const root = useRef<Group>(null!), lamps = useRef<Group>(null!), drum = useRef<Group>(null!)
  const s = useRef({ amp: 0, sway: 0, beat: 0 })
  useSquash('yagura', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S2 = s.current
    S2.amp = approach(S2.amp, isActive(useStore.getState(), 'yagura') && !reduceMotion ? 1 : 0, dt * 1.2)
    S2.sway += dt * 1.3
    S2.beat += dt * 5.2
    lamps.current.rotation.z = Math.sin(S2.sway) * 0.05 * S2.amp
    lamps.current.rotation.x = Math.sin(S2.sway * 0.7 + 1) * 0.04 * S2.amp
    // le tambour respire : un petit gonflement à chaque temps, qui retombe
    const pulse = Math.max(0, Math.sin(S2.beat)) ** 3
    drum.current.scale.setScalar(1 + 0.035 * pulse * S2.amp)
  })
  return (
    <group ref={root} position={at} rotation-y={ry} userData={{ id: 'yagura' }}>
      <Static>
        {/* la dalle, le socle de bois et sa ceinture de tissu rouge et blanc */}
        <Part geo={rbox(2.0, 0.1, 2.0, 0.03)} m={S.iron} p={[0, 0.05, 0]} castShadow={false} />
        <Part geo={rbox(1.7, 0.8, 1.7, 0.04)} m={S.wood} p={[0, 0.5, 0]} castShadow={false} />
        <Curtain />
        {/* le plancher du haut, les quatre poteaux, les gardes-corps (sauf devant, côté tambour) */}
        <Part geo={rbox(1.9, 0.07, 1.9, 0.03)} m={S.woodPale} p={[0, 0.915, 0]} castShadow={false} />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => <Part key={`${sx}${sz}`} geo={cyl(0.045, 0.05, 1.55, 10)} m={S.wood} p={[sx * 0.88, DECK + 0.775, sz * 0.88]} castShadow={false} />)}
        <Part geo={rbox(1.76, 0.05, 0.04, 0.015)} m={S.wood} p={[0, DECK + 0.42, -0.88]} castShadow={false} />
        <Part geo={rbox(0.04, 0.05, 1.76, 0.015)} m={S.wood} p={[-0.88, DECK + 0.42, 0]} castShadow={false} />
        <Part geo={rbox(0.04, 0.05, 1.76, 0.015)} m={S.wood} p={[0.88, DECK + 0.42, 0]} castShadow={false} />
        {/* le toit de tuiles sombres en pyramide, son poteau et la bannière rouge */}
        <Part geo={cyl(0.1, 1.48, 0.5, 4)} m={S.indigo} p={[0, DECK + 1.8, 0]} rotation-y={Math.PI / 4} castShadow={false} />
        <Part geo={cyl(0.02, 0.02, 0.75, 6)} m={S.wood} p={[0, DECK + 2.4, 0]} castShadow={false} />
        <Part geo={rbox(0.42, 0.26, 0.02, 0.01)} m={S.red} p={[0.23, DECK + 2.62, 0]} castShadow={false} />
        <Part geo={cyl(0.07, 0.07, 0.024, 12)} m={S.cream} p={[0.23, DECK + 2.62, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.9, 0.05, 0.05, 0.015)} m={S.wood} p={[0, DECK + 1.5, 0.88]} castShadow={false} />
      </Static>
      {/* les lanternes sous le toit : elles se balancent à peine quand le tambour joue */}
      <group position={[0, 0, 0]} ref={lamps} userData={LIVE}>
        {EAVE.map((p, i) => <Chochin key={i} p={[p[0], DECK + 1.52, p[2]]} />)}
      </group>
      <group ref={drum} position={[0, DECK + 0.78, 0.52]} userData={LIVE}>
        <Taiko y={0} />
      </group>
      {/* le tambourinaire debout à côté du tambour, de profil vers lui, les baguettes sur la peau */}
      <Busker
        id="yagura"
        at={[-0.58, DECK, 0.98]}
        ry={1.25}
        mats={MATS}
        scale={0.8}
        hands={[[0.12, 1.36, 0.42], [-0.08, 1.2, 0.46]]}
        head={<Part geo={rbox(0.5, 0.05, 0.1, 0.02)} m={S.cream} p={[0, 1.7, 0.06]} castShadow={false} />}
      >
        {[[0.12, 1.36, 0.42], [-0.08, 1.2, 0.46]].map(([x, y, z]) => <Part key={y} geo={rbox(0.02, 0.02, 0.26, 0.008)} m={S.woodPale} p={[x, y, z + 0.1]} castShadow={false} />)}
      </Busker>
    </group>
  )
}
