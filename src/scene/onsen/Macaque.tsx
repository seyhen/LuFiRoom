import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { O } from './materials'

/**
 * Un macaque japonais qui prend son bain, de l'eau jusqu'aux épaules : une tête ronde au museau rouge dans sa fourrure claire,
 * deux oreilles roses, une serviette pliée sur le crâne, les bras posés sur le bord. `p` est le point de l'eau sous lui,
 * `s` sa taille (0,6 pour le petit). Il regarde vers la caméra (+x, +z).
 */
export function Macaque({ p, s = 1, ry = Math.PI / 4 }: { p: V3; s?: number; ry?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={s}>
      {/* les épaules et le dos, qui sortent à peine de l'eau */}
      <Part geo={SPH} m={O.fur} scale={[0.25, 0.2, 0.2]} p={[0, 0.0, -0.03]} />
      {/* la tête : fourrure brune, large collier de poils clairs aux joues */}
      <Part geo={SPH} m={O.fur} scale={[0.17, 0.155, 0.16]} p={[0, 0.25, -0.01]} />
      {[-1, 1].map((x) => (
        <Part key={x} geo={SPH} m={O.furLight} scale={[0.07, 0.08, 0.06]} p={[x * 0.115, 0.2, 0.06]} castShadow={false} />
      ))}
      {/* le visage nu, rouge : un masque aplati, des yeux rieurs, la bouche d'un trait */}
      <Part geo={SPH} m={O.face} scale={[0.088, 0.1, 0.05]} p={[0, 0.215, 0.128]} castShadow={false} />
      {/* le front de poils sombres qui retombe au-dessus des yeux */}
      <Part geo={SPH} m={O.furDark} scale={[0.125, 0.05, 0.085]} p={[0, 0.305, 0.075]} castShadow={false} />
      {[-1, 1].map((x) => (
        <group key={x}>
          <Part geo={SPH} m={O.eye} scale={[0.02, 0.012, 0.01]} p={[x * 0.04, 0.245, 0.168]} rotation-z={x * 0.25} castShadow={false} />
          <Part geo={SPH} m={O.furDark} scale={[0.03, 0.04, 0.02]} p={[x * 0.17, 0.27, -0.01]} castShadow={false} />
          {/* le bras : posé en avant, la main sur la pierre du bord */}
          <Part geo={cyl(0.04, 0.035, 0.26, 10)} m={O.fur} p={[x * 0.2, 0.0, 0.14]} rotation-x={1.35} />
          <Part geo={SPH} m={O.face} scale={[0.04, 0.025, 0.045]} p={[x * 0.2, 0.0, 0.27]} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={O.eye} scale={[0.028, 0.006, 0.008]} p={[0, 0.195, 0.172]} castShadow={false} />
      {/* la serviette pliée sur le crâne, comme on la pose pour ne pas avoir trop chaud */}
      <Part geo={rbox(0.2, 0.05, 0.15, 0.02)} m={O.towel} p={[0, 0.425, -0.02]} rotation-z={0.06} />
      <Part geo={rbox(0.2, 0.012, 0.15, 0.005)} m={O.indigo} p={[0, 0.402, -0.02]} rotation-z={0.06} castShadow={false} />
    </group>
  )
}
