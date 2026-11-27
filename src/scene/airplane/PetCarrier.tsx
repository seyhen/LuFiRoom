import { gummy } from '../materials'
import { Cat } from '../objects/Cat'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'

// Le sac de transport : toile bleu pétrole, panneaux de filet sombre sur les côtés, fermeture éclair, poignées de sangle ; le chaton
// roux tigré roulé en boule sur un plaid, le dessus ouvert (le rabat replié en arrière). Matières propres à l'objet.
const BAG = gummy(0x3f8a92, { roughness: 0.85, clearcoat: 0.05 })
const BAG_DARK = gummy(0x2c6168, { roughness: 0.85, clearcoat: 0.05 })
const NET = gummy(0x22323a, { roughness: 0.9, clearcoat: 0 })
const ZIP = gummy(0xdfe4ea, { roughness: 0.2, metalness: 0.6, clearcoat: 0.9 })
const FLEECE = gummy(0xf4e6d4, { roughness: 0.98, clearcoat: 0 })
const MOUSE = gummy(0xb4a4dc, { roughness: 0.9, clearcoat: 0 })
const KITTEN = {
  fur: gummy(0xe8a868, { roughness: 0.8 }),
  light: gummy(0xfdf0e0, { roughness: 0.8 }),
  dark: gummy(0xb8743e, { roughness: 0.8 }),
}

const L = 0.66, W = 0.42, H = 0.24, T = 0.03

/**
 * Le sac de transport d'un passager, posé sur le siège du couloir de la rangée 1, et le chaton qui y dort : le ronron (objet `cat`,
 * son `purr`, celui du chat de la chambre, repris à la demande du propriétaire). Le chaton est le chat partagé (`objects/Cat.tsx`,
 * il respire et ses cœurs montent quand il ronronne), à 0,55 de sa taille. Autour : les parois basses du sac (le filet côté caméra),
 * le rabat ouvert replié en arrière, deux poignées, la fermeture éclair et sa tirette, un plaid au fond, une souris de feutre dans
 * un coin. `position` : le dessous du sac (le dessus de l'assise).
 */
export function PetCarrier({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        {/* le fond et le plaid */}
        <Part geo={rbox(L, 0.04, W, 0.02)} m={BAG_DARK} p={[0, 0.02, 0]} />
        <Part geo={rbox(L - 0.1, 0.03, W - 0.1, 0.015)} m={FLEECE} p={[0, 0.055, 0]} castShadow={false} />
        {/* les parois : toile aux bouts, filet sombre sur les côtés (le côté caméra plus bas pour voir le chaton), un liseré de toile */}
        {[-1, 1].map((s) => <Part key={`e${s}`} geo={rbox(T, H, W, 0.012)} m={BAG} p={[s * (L / 2 - T / 2), H / 2, 0]} />)}
        <Part geo={rbox(L - 2 * T, H, T, 0.012)} m={NET} p={[0, H / 2, -(W / 2 - T / 2)]} />
        <Part geo={rbox(L - 2 * T, H * 0.6, T, 0.012)} m={NET} p={[0, H * 0.3, W / 2 - T / 2]} />
        <Part geo={rbox(L + 0.012, 0.035, T + 0.014, 0.012)} m={BAG} p={[0, H, -(W / 2 - T / 2)]} castShadow={false} />
        <Part geo={rbox(L + 0.012, 0.035, T + 0.014, 0.012)} m={BAG} p={[0, H * 0.6, W / 2 - T / 2]} castShadow={false} />
        {/* le rabat ouvert, replié en arrière contre le côté du fond, avec sa fermeture éclair et la tirette */}
        <group position={[0, H, -W / 2]} rotation-x={-1.15}>
          <Part geo={rbox(L - 0.02, 0.025, W * 0.9, 0.012)} m={BAG} p={[0, 0, -W * 0.45]} />
          <Part geo={rbox(L - 0.06, 0.03, 0.012, 0.004)} m={ZIP} p={[0, 0.003, -W * 0.88]} castShadow={false} />
        </group>
        <Part geo={rbox(0.03, 0.06, 0.014, 0.006)} m={ZIP} p={[L / 2 - 0.08, H * 0.6 - 0.035, W / 2 + 0.016]} castShadow={false} />
        {/* les deux poignées de sangle, en arc au-dessus des bouts */}
        {[-1, 1].map((s) => (
          <Part key={`h${s}`} m={BAG_DARK} p={[s * (L / 2 - 0.015), H + 0.01, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.1, 0.014, 6, 16, Math.PI]} />
          </Part>
        ))}
        {/* la souris de feutre lilas, dans un coin du sac, sa queue de ficelle */}
        <group position={[L / 2 - 0.1, 0.07, W / 2 - 0.11]} rotation-y={2.4}>
          <Part geo={SPH} m={MOUSE} scale={[0.06, 0.035, 0.04]} p={[0, 0.035, 0]} />
          <Part geo={SPH} m={MOUSE} scale={[0.018, 0.018, 0.012]} p={[0.03, 0.065, 0.025]} castShadow={false} />
          <Part geo={cyl(0.003, 0.003, 0.1, 4)} m={NET} p={[-0.1, 0.01, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      {/* le chaton, roulé sur le plaid */}
      <group position={[0.02, 0.07, 0.0]} scale={0.55}>
        <Cat position={[0, 0, 0]} rotation={0.2} coat={KITTEN} pattern="tabby" />
      </group>
    </group>
  )
}
