import { useRef } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, lerp } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { L } from './materials'

/** Le petit bureau du gardien, à l'avant gauche : son pied au sol. */
export const LOG = { x: -0.45, z: 2.45 }
const TOP = 0.64 // dessus du plateau
const PAGE = TOP + 0.054 // dessus des pages du journal
const ROWS = 4
const LEN = 0.2 // longueur d'une ligne écrite
const X0 = 0.04 // début des lignes de la page de droite
const rowZ = (i: number) => -0.12 + i * 0.075
const INK = { x: 0.36, z: -0.12 }
const ROW_T = 5.5 // secondes par ligne
const DS = 1.15 // le bureau est un peu plus grand que nature, pour se lire depuis la pièce
// le sablier : une double ampoule de verre (un seul tracé) ; le sable dedans
const hourglass = new LatheGeometry([[0.024, 0], [0.029, 0.008], [0.03, 0.018], [0.02, 0.032], [0.008, 0.043], [0.004, 0.05], [0.008, 0.057], [0.02, 0.068], [0.029, 0.082], [0.03, 0.092], [0.024, 0.1]].map(([r, y]) => new Vector2(r, y)), 16)

/**
 * Le journal de bord : un petit bureau de chêne, le journal ouvert, l'encrier et la plume d'oie. Quand le son joue, la plume
 * quitte l'encrier et écrit : une ligne d'encre avance sur la page de droite, puis la suivante. Il est seul dans l'angle avant gauche.
 */
export function LogDesk() {
  const g = useRef<Group>(null!), quill = useRef<Group>(null!), lines = useRef<(Group | null)[]>([])
  const st = useRef({ k: 0, row: 1, p: 1, hold: 0 })
  useSquash('quill', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'quill'), t = clock.elapsedTime
    s.k = approach(s.k, on && s.hold <= 0 ? 1 : 0, dt * 1.6)
    if (on && !reduceMotion) {
      if (s.hold > 0) s.hold -= dt
      else {
        s.p += dt / ROW_T
        if (s.p >= 1) {
          s.p = 1
          s.hold = 1.2 // la plume revient à l'encrier une seconde, puis la ligne suivante
          if (s.row >= ROWS - 1) {
            s.row = 0
            s.p = 0
          } else {
            s.row++
            s.p = 0
          }
        }
      }
    }
    lines.current.forEach((l, i) => {
      if (!l) return
      const w = i < s.row ? 1 : i === s.row ? s.p : 0
      l.scale.x = Math.max(w, 0.001)
      l.visible = w > 0.004
    })
    // la plume : de l'encrier à la pointe de la ligne en cours, avec un petit tremblé d'écriture
    const wx = X0 + s.p * LEN, wz = rowZ(s.row), bob = reduceMotion || !on ? 0 : Math.sin(t * 9) * 0.004
    const k = s.k
    const q = quill.current
    q.position.set(lerp(INK.x, wx, k), lerp(PAGE + 0.07, PAGE + 0.012 + Math.abs(bob), k), lerp(INK.z, wz, k))
    // penchée vers le haut à gauche de l'écran (vers -x, +z) : vue de profil ; penchée vers la caméra, elle se lisait en raccourci
    q.rotation.set(lerp(0.15, 0.5, k), 0, lerp(0.2, 0.5, k))
  })
  return (
    <group ref={g} userData={{ id: 'quill' }} position={[LOG.x, 0, LOG.z]} rotation-y={0.3}>
     <group scale={DS}>
      <Static>
        {/* le bureau : un plateau de chêne sur quatre pieds fuselés, un tiroir */}
        <Part geo={rbox(0.95, 0.05, 0.58, 0.02)} m={L.oakPale} p={[0, TOP - 0.025, 0]} />
        {[[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.03, 0.022, TOP - 0.05, 10)} m={L.oakDark} p={[x, (TOP - 0.05) / 2, z]} />
        ))}
        <Part geo={rbox(0.7, 0.05, 0.04, 0.015)} m={L.oakDark} p={[0, 0.3, 0.22]} castShadow={false} />
        <Part geo={rbox(0.3, 0.1, 0.03, 0.012)} m={L.oak} p={[0.12, TOP - 0.11, 0.3]} />
        <Part geo={SPH} m={L.brass} scale={0.022} p={[0.12, TOP - 0.11, 0.325]} castShadow={false} />
        {/* le journal ouvert : couverture de cuir, deux pages, les lignes déjà écrites à gauche */}
        <Part geo={rbox(0.62, 0.03, 0.4, 0.012)} m={L.leatherDark} p={[-0.03, TOP + 0.015, 0.02]} rotation-y={-0.06} />
        <group position={[-0.03, 0, 0.02]} rotation-y={-0.06}>
          {/* le signet : un ruban rouge posé sur la page, qui pend au bord du journal */}
          <Part geo={rbox(0.012, 0.003, 0.105, 0.001)} m={L.red} p={[-0.004, PAGE + 0.0025, 0.1275]} castShadow={false} />
          <Part geo={rbox(0.014, 0.027, 0.004, 0.001)} m={L.red} p={[-0.004, PAGE - 0.011, 0.182]} castShadow={false} />
          <Part geo={rbox(0.014, 0.003, 0.034, 0.001)} m={L.red} p={[-0.004, TOP + 0.0315, 0.197]} castShadow={false} />
          {/* une tache d'encre au coin de la page de droite */}
          <Part geo={SPH} m={L.navyDark} scale={[0.016, 0.0016, 0.011]} p={[0.22, PAGE + 0.0012, 0.15]} castShadow={false} />
          <Part geo={rbox(0.29, 0.022, 0.36, 0.008)} m={L.paper} p={[-0.145, PAGE - 0.011, 0]} rotation-z={0.02} castShadow={false} />
          <Part geo={rbox(0.29, 0.022, 0.36, 0.008)} m={L.paper} p={[0.145, PAGE - 0.011, 0]} rotation-z={-0.02} castShadow={false} />
          {[0.18, 0.2, 0.15, 0.2, 0.12, 0.19].map((w, i) => (
            <Part key={i} geo={rbox(w, 0.004, 0.009, 0.002)} m={L.navyDark} p={[-0.27 + w / 2 + 0.03, PAGE + 0.006, -0.12 + i * 0.05]} castShadow={false} />
          ))}
        </group>
        {/* l'encrier de verre bleu, son bouchon de liège posé à côté */}
        <Part geo={cyl(0.05, 0.055, 0.07, 18)} m={L.navy} p={[INK.x, TOP + 0.035, INK.z]} />
        <Part geo={cyl(0.026, 0.03, 0.025, 14)} m={L.navy} p={[INK.x, TOP + 0.082, INK.z]} castShadow={false} />
        <Part geo={cyl(0.03, 0.03, 0.014, 14)} m={L.navyDark} p={[INK.x, TOP + 0.0935, INK.z]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.03, 10)} m={L.rope} p={[0.36, TOP + 0.015, 0.14]} castShadow={false} />
        {/* le bâton de cire à cacheter et son cachet de laiton, entre le journal et le bord */}
        <Part geo={rbox(0.014, 0.014, 0.09, 0.005)} m={L.red} p={[0.41, TOP + 0.007, 0.06]} rotation-y={0.2} castShadow={false} />
        <Part geo={cyl(0.024, 0.024, 0.008, 16)} m={L.red} p={[0.4, TOP + 0.004, -0.03]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.004, 12)} m={L.brass} p={[0.4, TOP + 0.0095, -0.03]} castShadow={false} />
        {/* le sablier du gardien, au coin arrière gauche : deux disques de laiton, trois montants, le sable en bas */}
        <group position={[-0.415, TOP, -0.215]} scale={1.25}>
          <Part geo={cyl(0.042, 0.042, 0.012, 18)} m={L.brass} p={[0, 0.006, 0]} castShadow={false} />
          <Part geo={cyl(0.042, 0.042, 0.012, 18)} m={L.brass} p={[0, 0.114, 0]} castShadow={false} />
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5
            return <Part key={i} geo={cyl(0.0045, 0.0045, 0.1, 6)} m={L.oakDark} p={[Math.cos(a) * 0.034, 0.06, Math.sin(a) * 0.034]} castShadow={false} />
          })}
          <Part geo={SPH} m={L.rope} scale={[0.024, 0.014, 0.024]} p={[0, 0.021, 0]} castShadow={false} />
          <Part geo={cyl(0.02, 0.004, 0.022, 10)} m={L.rope} p={[0, 0.082, 0]} castShadow={false} />
        </group>
      </Static>
      <mesh geometry={hourglass} material={L.glass} position={[-0.415, TOP + 0.015, -0.215]} scale={1.25} raycast={noRay} />
      {/* les lignes qu'écrit la plume, page de droite : on les agrandit une à une */}
      <group position={[-0.03, 0, 0.02]} rotation-y={-0.06}>
        {Array.from({ length: ROWS }, (_, i) => (
          <group key={i} ref={(r) => { lines.current[i] = r }} position={[X0 + 0.02, PAGE + 0.006, rowZ(i)]}>
            <Part geo={rbox(LEN, 0.004, 0.009, 0.002)} m={L.navyDark} p={[LEN / 2, 0, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* la plume d'oie : sa pointe à l'origine du groupe, le tuyau monte, les barbes en éventail */}
      <group ref={quill} position={[INK.x, TOP + 0.14, INK.z]} scale={1.2}>
       {/* tournée sur son axe pour que les barbes fassent face à la caméra */}
       <group rotation-y={0.5}>
        {/* le bec taillé, noirci d'encre */}
        <Part geo={cyl(0.007, 0.0015, 0.04, 8)} m={L.navyDark} p={[0, 0.02, 0]} castShadow={false} />
        {/* le tuyau, puis le rachis qui court jusqu'au bout de la plume */}
        <Part geo={cyl(0.0075, 0.007, 0.12, 8)} m={L.paper} p={[0, 0.1, 0]} castShadow={false} />
        <Part geo={cyl(0.005, 0.0025, 0.3, 6)} m={L.cream} p={[0, 0.3, 0]} castShadow={false} />
        {/* les barbes : un grand côté et un petit, un peu courbés, plus épais qu'avant pour se lire de biais */}
        <Part geo={SPH} m={L.cream} scale={[0.05, 0.17, 0.012]} p={[0.034, 0.3, 0]} rotation-z={-0.1} castShadow={false} />
        <Part geo={SPH} m={L.cream} scale={[0.028, 0.14, 0.011]} p={[-0.02, 0.32, 0]} rotation-z={0.1} castShadow={false} />
        {/* le bout barré de brun, comme une plume d'oie grise */}
        {[0.36, 0.4].map((y, i) => (
          <Part key={y} geo={SPH} m={L.oakDark} scale={[0.04 - i * 0.008, 0.012, 0.014]} p={[0.03 - i * 0.004, y, 0]} rotation-z={-0.25} castShadow={false} />
        ))}
        {/* le duvet, en bas des barbes */}
        <Part geo={SPH} m={L.paper} scale={[0.03, 0.025, 0.014]} p={[0.012, 0.16, 0]} castShadow={false} />
       </group>
      </group>
     </group>
    </group>
  )
}
