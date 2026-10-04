import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Cat } from '../objects/Cat'
import { T } from './materials'
import { Garment } from '../objects/Garment'
import { Leaf } from '../nature/Leaf'

/** Le tapis persan au milieu du compartiment, et sa frange. */
export function PersianRug() {
  return (
    <>
      <mesh material={T.persian} position={[0.15, 0.006, 0.25]} rotation-x={-Math.PI / 2} rotation-z={0.06} receiveShadow>
        <planeGeometry args={[2.3, 3.4]} />
      </mesh>
      {[-1, 1].map((s) =>
        Array.from({ length: 12 }, (_, i) => (
          <mesh key={`${s}${i}`} geometry={cyl(0.008, 0.008, 0.09, 4)} material={T.wool} position={[0.15 - 1.05 + i * 0.19 + s * 0.1, 0.008, 0.25 + s * 1.74]} rotation-x={Math.PI / 2} />
        )),
      )}
    </>
  )
}

// La partie d'échecs en cours : [colonne, rangée, blanc ?, grande pièce ?].
const PIECES: [number, number, boolean, boolean][] = [[1, 1, true, false], [3, 2, true, false], [4, 3, true, true], [6, 1, true, false], [0, 0, true, true], [5, 0, true, true], [2, 6, false, false], [4, 5, false, false], [5, 6, false, false], [3, 7, false, true], [7, 7, false, true], [1, 5, false, true]]

/** Le guéridon de la partie d'échecs, entre le fauteuil et le pouf : la partie en cours, un verre, des lunettes. */
export function ChessTable() {
  return (
    <group position={[1.75, 0, -0.35]} rotation-y={0.4}>
      <Part geo={cyl(0.34, 0.34, 0.04, 26)} m={T.mahogany} p={[0, 0.62, 0]} />
      <Part geo={cyl(0.345, 0.345, 0.015, 26)} m={T.brass} p={[0, 0.6, 0]} castShadow={false} />
      <Part geo={cyl(0.03, 0.05, 0.58, 10)} m={T.mahoganyDark} p={[0, 0.31, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU
        return <Part key={i} geo={rbox(0.25, 0.04, 0.05, 0.02)} m={T.mahoganyDark} p={[Math.cos(a) * 0.12, 0.03, Math.sin(a) * 0.12]} rotation-y={-a} />
      })}
      <Part geo={rbox(0.36, 0.025, 0.36, 0.01)} m={T.board} p={[0, 0.655, 0]} />
      {PIECES.map(([c, r, w, big], i) => (
        <group key={i} position={[-0.1575 + c * 0.045, 0.67, -0.1575 + r * 0.045]}>
          <Part geo={cyl(0.012, 0.016, big ? 0.05 : 0.03, 10)} m={w ? T.chessW : T.chessB} p={[0, big ? 0.025 : 0.015, 0]} castShadow={false} />
          <Part geo={SPH} m={w ? T.chessW : T.chessB} scale={big ? 0.014 : 0.011} p={[0, big ? 0.058 : 0.036, 0]} castShadow={false} />
        </group>
      ))}
      {/* le verre de cognac, les lunettes */}
      <Part geo={SPH} m={T.tea} scale={[0.035, 0.025, 0.035]} p={[0.2, 0.66, 0.16]} castShadow={false} />
      <Part geo={SPH} m={T.glass} scale={[0.045, 0.045, 0.045]} p={[0.2, 0.68, 0.16]} castShadow={false} />
      {[-1, 1].map((s) => (
        <Part key={s} m={T.gold} p={[-0.2 + s * 0.035, 0.646, 0.2]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.026, 0.005, 6, 14]} />
        </Part>
      ))}
    </group>
  )
}

/** Une malle-cabine debout, grande ouverte comme une penderie : cintres et vêtements d'un côté, tiroirs de l'autre, étiquettes de voyage. */
export function SteamerTrunk() {
  return (
    <group position={[-1.2, 0, 2.55]} rotation-y={0.7}>
      {/* la moitié penderie */}
      <Part geo={rbox(0.55, 1.25, 0.5, 0.04)} m={T.leather} p={[-0.3, 0.63, 0]} />
      <Part geo={rbox(0.48, 1.15, 0.04, 0.02)} m={T.velvetDark} p={[-0.3, 0.63, 0.23]} castShadow={false} />
      <Part geo={cyl(0.01, 0.01, 0.44, 6)} m={T.brass} p={[-0.3, 1.12, 0.12]} rotation-z={Math.PI / 2} castShadow={false} />
      {/* trois vêtements sur leurs cintres, vus de profil, serrés sur la tringle */}
      {([[-0.43, T.mustard, 'shirt'], [-0.31, T.teal, 'dress'], [-0.19, T.cream, 'shirt']] as const).map(([x, m, kind], i) => (
        <Garment key={i} kind={kind} p={[x, 1.09, 0.12]} r={[0, 0.5 + i * 0.25, 0]} s={0.82} m={m} hanger={T.mahoganyDark} />
      ))}
      {/* la moitié aux tiroirs, ouverte en volet */}
      <group position={[0.02, 0, 0.25]} rotation-y={-1.1}>
        <Part geo={rbox(0.55, 1.25, 0.12, 0.04)} m={T.leather} p={[0.28, 0.63, 0]} />
        {[0.3, 0.55, 0.8, 1.05].map((y) => (
          <group key={y}>
            <Part geo={rbox(0.46, 0.2, 0.02, 0.01)} m={T.canvas} p={[0.28, y, 0.07]} castShadow={false} />
            <Part geo={SPH} m={T.brass} scale={0.015} p={[0.28, y, 0.09]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* les coins de laiton, les étiquettes */}
      {[0.06, 1.2].map((y) => (
        <Part key={y} geo={rbox(0.57, 0.04, 0.52, 0.01)} m={T.brass} p={[-0.3, y, 0]} castShadow={false} />
      ))}
      {[[-0.5, 0.95, T.stickerA], [-0.35, 0.4, T.stickerC], [-0.15, 0.75, T.stickerB]].map(([z, y, m], i) => (
        <Part key={i} geo={cyl(0.07, 0.07, 0.006, 16)} m={m as typeof T.teal} p={[-0.58, y as number, (z as number) + 0.3]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
      <Part geo={rbox(0.006, 0.12, 0.18, 0.004)} m={T.stickerD} p={[-0.58, 0.6, -0.12]} castShadow={false} />
    </group>
  )
}

/** Le chat roux du voyage, roulé en boule dans son panier d'osier sur le tapis. */
export function CatBasket() {
  return (
    <>
      <group position={[-0.45, 0, 0.2]}>
        <Part geo={cyl(0.4, 0.34, 0.2, 22)} m={T.wicker} p={[0, 0.1, 0]} />
        <Part m={T.wicker} p={[0, 0.2, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.38, 0.05, 8, 24]} />
        </Part>
        <Part geo={cyl(0.34, 0.34, 0.05, 22)} m={T.plaidLight} p={[0, 0.17, 0]} castShadow={false} />
      </group>
      <Cat position={[-0.5, 0.16, 0.16]} rotation={0.5} coat={{ fur: T.ginger, light: T.gingerLight, dark: T.gingerDark }} />
    </>
  )
}

/** Un bouquet de lilas et de marguerites dans un vase de cristal, sur la commode ; et une pile de livres au pied des couchettes. */
export function Flowers() {
  return (
    <>
      <group position={[-2.6, 0.76, 2.05]}>
        <Part geo={cyl(0.06, 0.05, 0.22, 14)} m={T.glass} p={[0, 0.11, 0]} castShadow={false} />
        {Array.from({ length: 9 }, (_, i) => {
          const a = i * 2.3, r = 0.04 + (i % 3) * 0.035
          return (
            <group key={i}>
              <Part geo={cyl(0.004, 0.004, 0.3, 4)} m={T.leaf} p={[Math.cos(a) * r * 0.5, 0.32, Math.sin(a) * r * 0.5]} rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]} castShadow={false} />
              <Part geo={SPH} m={i % 3 ? T.lilac : T.daisy} scale={[0.04, 0.06, 0.04]} p={[Math.cos(a) * r, 0.47 + (i % 2) * 0.04, Math.sin(a) * r]} castShadow={false} />
              {i % 2 === 0 && (
                <group position={[0, 0.24, 0]} rotation-y={a}>
                  <Leaf kind="lance" r={[-0.7, 0, 0]} w={0.018} l={0.13} m={T.leafV} />
                </group>
              )}
            </group>
          )
        })}
      </group>
      {[[0.3, 0.05, T.teal], [0.27, 0.045, T.velvet], [0.24, 0.05, T.cream], [0.2, 0.04, T.mustard]].map(([w, h, m], i) => (
        <Part key={i} geo={rbox(w as number, h as number, 0.2, 0.012)} m={m as typeof T.teal} p={[-1.85, 0.025 + i * 0.048, -0.15]} rotation-y={i * 0.35} />
      ))}
      <group position={[0.85, 0, 2.3]}>
        <Part geo={cyl(0.22, 0.22, 0.32, 22)} m={T.cream} p={[0, 0.16, 0]} />
        <Part geo={cyl(0.225, 0.225, 0.05, 22)} m={T.velvet} p={[0, 0.3, 0]} castShadow={false} />
        <Part geo={cyl(0.16, 0.16, 0.24, 20)} m={T.teal} p={[0.05, 0.47, 0.02]} />
        <Part geo={cyl(0.165, 0.165, 0.04, 20)} m={T.gold} p={[0.05, 0.58, 0.02]} castShadow={false} />
      </group>
    </>
  )
}
