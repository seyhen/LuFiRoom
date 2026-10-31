import { M } from '../materials'
import { Part, SPH, rbox, type V3 } from '../parts'
import { C } from './materials'

// Le coffre : corps (1,4 × 0,64 × 0,72) centré en x = 1,9, z = -2,7 ; sa façade est en z = -2,34. Tout ce qui est posé sur la
// façade la dépasse de 1,5 à 2 cm (rien à fleur : ça grésillerait).
const X = 1.9, FZ = -2.34
const STRAPS = [1.47, 2.33]
const CORNERS: V3[] = [[1.3, 0.55, FZ], [2.5, 0.55, FZ], [1.3, 0.14, FZ], [2.5, 0.14, FZ]]

/**
 * Coffre en planches sous la fenêtre, cerclé de fer : deux rainures entre les planches, deux pentures de fer à rivets qui montent
 * jusque sur le couvercle, des coins de laiton, une serrure à moraillon et une poignée de corde sur le côté. La radio (le
 * tourne-disque) est posée dessus (voir CabinScene).
 */
export function Chest() {
  return (
    <>
      <Part geo={rbox(1.4, 0.64, 0.72, 0.1)} m={C.beam} p={[X, 0.32, -2.7]} />
      <Part geo={rbox(1.46, 0.1, 0.78, 0.06)} m={M.toffeeLight} p={[X, 0.66, -2.7]} />
      {/* le socle mouluré */}
      <Part geo={rbox(1.44, 0.08, 0.76, 0.03)} m={C.log} p={[X, 0.04, -2.7]} />
      {/* les joints entre les planches de la façade */}
      {[0.24, 0.42].map((y) => (
        <Part key={y} geo={rbox(1.28, 0.016, 0.02, 0.006)} m={C.log} p={[X, y, FZ + 0.003]} castShadow={false} />
      ))}
      {/* les pentures, de la base jusque sur le chant du couvercle (le dessus est pris par le tourne-disque), et leurs rivets */}
      {STRAPS.map((x) => (
        <group key={x}>
          <Part geo={rbox(0.08, 0.56, 0.025, 0.01)} m={C.iron} p={[x, 0.36, FZ + 0.006]} />
          <Part geo={rbox(0.08, 0.1, 0.025, 0.01)} m={C.iron} p={[x, 0.66, FZ + 0.035]} />
          {[0.16, 0.33, 0.5].map((y) => (
            <Part key={y} geo={SPH} m={C.brass} scale={[0.016, 0.016, 0.01]} p={[x, y, FZ + 0.02]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* coins de laiton */}
      {CORNERS.map((p, i) => (
        <Part key={i} geo={rbox(0.09, 0.09, 0.03, 0.012)} m={C.brass} p={[p[0], p[1], p[2] + 0.004]} castShadow={false} />
      ))}
      {/* la serrure : une platine, le trou de la clé, le moraillon qui descend du couvercle */}
      <Part geo={rbox(0.17, 0.16, 0.025, 0.02)} m={C.brass} p={[X, 0.47, FZ + 0.006]} />
      <Part geo={rbox(0.026, 0.05, 0.02, 0.009)} m={C.soot} p={[X, 0.45, FZ + 0.016]} castShadow={false} />
      <Part geo={SPH} m={C.soot} scale={0.018} p={[X, 0.48, FZ + 0.016]} castShadow={false} />
      <Part geo={rbox(0.07, 0.13, 0.022, 0.012)} m={C.brass} p={[X, 0.6, FZ + 0.03]} />
      {/* la poignée de corde, sur le flanc que voit la caméra */}
      <Part geo={rbox(0.025, 0.1, 0.22, 0.01)} m={C.iron} p={[2.612, 0.44, -2.7]} castShadow={false} />
      <Part m={C.cut} p={[2.64, 0.44, -2.7]} rotation={[0, Math.PI / 2, Math.PI]}>
        <torusGeometry args={[0.08, 0.017, 6, 16, Math.PI]} />
      </Part>
    </>
  )
}
