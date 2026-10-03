import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { Steam } from '../objects/Steam'
import { Candle } from '../objects/Candle'
import { C } from './materials'

/** Le tapis à carreaux rouges et noirs devant le feu, la peau de mouton dessus, un pouf tricoté. */
export function Rug() {
  return (
    <>
      <mesh material={C.rug} position={[-1.0, 0.006, -0.75]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.9, 2.1]} />
      </mesh>
      <Part geo={SPH} m={C.wool} scale={[0.95, 0.04, 0.7]} p={[-1.75, 0.03, -1.45]} />
      <Part geo={cyl(0.26, 0.28, 0.3, 20)} m={C.knitMustard} p={[-0.25, 0.15, 0.05]} />
      {[0.08, 0.16, 0.24].map((y) => (
        <Part key={y} m={C.knitMustard} p={[-0.25, y, 0.05]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.275, 0.015, 6, 22]} />
        </Part>
      ))}
    </>
  )
}

/** Un plaid à carreaux jeté sur le fauteuil, un coussin tricoté. */
export function ArmchairThrow() {
  return (
    <group position={[0.1, 0, -0.95]} rotation-y={Math.PI / 4} scale={1.15}>
      <Part geo={rbox(0.6, 0.04, 0.5, 0.02)} m={C.plaid} p={[0.2, 0.64, -0.05]} rotation={[0.05, 0.3, -0.06]} />
      <Part geo={rbox(0.04, 0.4, 0.5, 0.02)} m={C.plaid} p={[0.55, 0.46, 0.0]} rotation-z={0.08} castShadow={false} />
      <Part geo={rbox(0.36, 0.32, 0.12, 0.08)} m={C.cream} p={[-0.18, 0.8, 0.22]} rotation={[0.15, 0, -0.2]} />
    </group>
  )
}

/** Sur le guéridon : deux chocolats chauds et leurs guimauves, qui fument ; une pile de livres. */
export function Cocoa() {
  const at = [1.4, 0.62, -1.75] as const
  return (
    <group position={at as unknown as [number, number, number]}>
      {[[0.16, 0.14, C.red], [0.23, -0.06, C.cream]].map(([x, z, m], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <Part geo={cyl(0.065, 0.055, 0.12, 18)} m={m as typeof C.red} p={[0, 0.06, 0]} />
          <Part geo={cyl(0.058, 0.058, 0.01, 18)} m={C.cocoa} p={[0, 0.115, 0]} castShadow={false} />
          {[[0.02, 0.01], [-0.02, -0.015], [0.0, 0.025]].map(([dx, dz], k) => (
            <Part key={k} geo={rbox(0.025, 0.02, 0.025, 0.008)} m={C.wool} p={[dx, 0.125, dz]} rotation-y={k} castShadow={false} />
          ))}
          <Part m={m as typeof C.red} p={[0.07, 0.065, 0]} castShadow={false}>
            <torusGeometry args={[0.03, 0.01, 6, 12]} />
          </Part>
          <Steam at={[0, 0.16, 0]} every={1.1 + i * 0.3} />
        </group>
      ))}
      {[[0.3, 0.05, C.green], [0.26, 0.045, C.knitBlue], [0.22, 0.04, C.cream]].map(([w, h, m], i) => (
        <Part key={i} geo={rbox(w as number, h as number, 0.2, 0.01)} m={m as typeof C.red} p={[-0.18, 0.025 + i * 0.047, 0.05]} rotation-y={i * 0.3} castShadow={false} />
      ))}
    </group>
  )
}

// La corde à linge près du feu : du mur de gauche au flanc de la cheminée.
const A = new Vector3(-2.97, 2.85, -1.0), B = new Vector3(-1.12, 2.7, -2.45)
const at = (k: number) => A.clone().lerp(B, k).add(new Vector3(0, -0.18 * Math.sin(Math.PI * k), 0))
const line = new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => at(i / 12))), 24, 0.008, 4, false)
// Ce qui sèche : [position sur la corde, matériau, forme].
const DRYING: [number, keyof typeof C, 'sock' | 'mitten'][] = [[0.18, 'red', 'sock'], [0.32, 'cream', 'sock'], [0.48, 'knitMustard', 'mitten'], [0.58, 'knitMustard', 'mitten'], [0.74, 'knitBlue', 'sock']]

/** Des chaussettes de laine et des moufles qui sèchent sur une corde, près du feu. */
export function DryingLine() {
  return (
    <>
      <mesh geometry={line} material={C.logBark} raycast={noRay} />
      {DRYING.map(([k, m, kind], i) => {
        const p = at(k)
        return (
          <group key={i} position={[p.x, p.y, p.z]} rotation-y={-0.65}>
            <Part geo={rbox(0.03, 0.05, 0.015, 0.006)} m={C.beam} p={[0, -0.01, 0]} castShadow={false} />
            {kind === 'sock' ? (
              <>
                <Part geo={rbox(0.1, 0.26, 0.05, 0.04)} m={C[m] as typeof C.red} p={[0, -0.16, 0]} />
                <Part geo={rbox(0.16, 0.08, 0.05, 0.04)} m={C[m] as typeof C.red} p={[0.04, -0.29, 0]} />
                <Part geo={rbox(0.105, 0.05, 0.055, 0.02)} m={C.cream} p={[0, -0.05, 0]} castShadow={false} />
              </>
            ) : (
              <>
                <Part geo={SPH} m={C[m] as typeof C.red} scale={[0.07, 0.11, 0.035]} p={[0, -0.14, 0]} />
                <Part geo={SPH} m={C[m] as typeof C.red} scale={[0.025, 0.05, 0.025]} p={[0.06, -0.12, 0]} rotation-z={-0.5} castShadow={false} />
              </>
            )}
          </group>
        )
      })}
    </>
  )
}

/** Au mur de gauche : une paire de raquettes, des skis en bois croisés, une étagère (bocaux, bougie, livres) et ses crochets. */
export function WallGear() {
  return (
    <>
      {/* les raquettes */}
      {[-0.22, 0.22].map((dz, i) => (
        <group key={i} position={[-2.95, 2.45, 0.55 + dz]} rotation={[0, Math.PI / 2, i ? 0.15 : -0.15]}>
          <Part m={C.beamDark} castShadow={false} scale={[1, 1.6, 1]}>
            <torusGeometry args={[0.16, 0.022, 8, 24]} />
          </Part>
          {[-0.12, 0, 0.12].map((y) => (
            <Part key={y} geo={cyl(0.004, 0.004, 0.3, 4)} m={C.cream} p={[0, y * 1.6, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          ))}
          <Part geo={cyl(0.004, 0.004, 0.5, 4)} m={C.cream} castShadow={false} />
        </group>
      ))}
      {/* les skis de bois, appuyés au mur devant */}
      {[-0.08, 0.08].map((dz, i) => (
        <group key={i} position={[-2.85, 1.2, 2.55 + dz]} rotation-x={(i ? 1 : -1) * 0.08}>
          <Part geo={rbox(0.03, 2.3, 0.08, 0.015)} m={C.beam} />
          <Part geo={rbox(0.032, 0.1, 0.082, 0.015)} m={C.red} p={[0, 0.05, 0]} castShadow={false} />
          <Part m={C.beam} p={[0.06, 1.17, 0]} rotation-z={0.5} castShadow={false}>
            <torusGeometry args={[0.07, 0.015, 6, 12, Math.PI / 2]} />
          </Part>
        </group>
      ))}
      {/* l'étagère */}
      <group position={[-2.84, 2.15, -0.65]}>
        <Part geo={rbox(0.28, 0.05, 1.0, 0.02)} m={C.beamDark} />
        {[-0.38, 0.38].map((z) => (
          <Part key={z} geo={rbox(0.22, 0.14, 0.04, 0.015)} m={C.beamDark} p={[0.0, -0.1, z]} castShadow={false} />
        ))}
        {[[-0.35, C.knitMustard], [-0.2, C.red], [-0.05, C.green]].map(([z, m], i) => (
          <group key={i} position={[0, 0.03, z as number]}>
            <Part geo={cyl(0.05, 0.05, 0.14, 14)} m={M.glass} p={[0, 0.07, 0]} castShadow={false} />
            <Part geo={cyl(0.045, 0.045, 0.08, 14)} m={m as typeof C.red} p={[0, 0.04, 0]} castShadow={false} />
            <Part geo={cyl(0.052, 0.052, 0.02, 14)} m={C.cream} p={[0, 0.15, 0]} castShadow={false} />
          </group>
        ))}
        <Candle position={[0, 0.03, 0.15]} holder="jar" height={0.09} radius={0.03} />
        {[0.3, 0.36, 0.42].map((z, i) => (
          <Part key={z} geo={rbox(0.18, 0.2 + i * 0.02, 0.05, 0.01)} m={[C.knitBlue, C.red, C.cream][i]} p={[0, 0.13, z]} rotation-x={i === 2 ? 0.2 : 0} castShadow={false} />
        ))}
        {/* les crochets : un bonnet à pompon, une écharpe */}
        {[-0.3, 0.3].map((z) => (
          <Part key={z} geo={cyl(0.012, 0.012, 0.1, 6)} m={C.iron} p={[0.05, -0.35, z]} rotation-z={Math.PI / 2} castShadow={false} />
        ))}
        <group position={[0.1, -0.5, -0.3]}>
          <Part geo={SPH} m={C.red} scale={[0.1, 0.12, 0.1]} />
          <Part geo={SPH} m={C.cream} scale={0.05} p={[0, 0.12, 0]} castShadow={false} />
          <Part geo={cyl(0.1, 0.1, 0.04, 16)} m={C.cream} p={[0, -0.08, 0]} castShadow={false} />
        </group>
        <Part geo={rbox(0.04, 0.7, 0.12, 0.02)} m={C.green} p={[0.08, -0.7, 0.3]} castShadow={false} />
      </group>
    </>
  )
}

/** Devant à droite : une luge de bois et sa couverture, une paire de bottes dans leur flaque de neige fondue, un petit sapin. */
export function Sled() {
  return (
    <>
      <group position={[1.95, 0, 2.1]} rotation-y={0.5}>
        {[-0.22, 0.22].map((z) => (
          <group key={z}>
            <Part geo={rbox(1.15, 0.04, 0.05, 0.02)} m={C.iron} p={[0, 0.03, z]} />
            <Part m={C.iron} p={[0.58, 0.12, z]} castShadow={false}>
              <torusGeometry args={[0.1, 0.02, 6, 12, Math.PI]} />
            </Part>
            {[-0.35, 0, 0.35].map((x) => (
              <Part key={x} geo={rbox(0.04, 0.2, 0.04, 0.01)} m={C.beam} p={[x, 0.13, z]} castShadow={false} />
            ))}
          </group>
        ))}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((x) => (
          <Part key={x} geo={rbox(0.14, 0.03, 0.56, 0.01)} m={C.beam} p={[x, 0.24, 0]} />
        ))}
        <Part geo={rbox(0.5, 0.08, 0.5, 0.04)} m={C.plaid} p={[-0.1, 0.3, 0]} rotation-y={0.2} />
        <Part geo={cyl(0.015, 0.015, 0.6, 5)} m={C.red} p={[0.75, 0.2, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
      <Part geo={cyl(0.38, 0.38, 0.008, 22)} m={C.ice} p={[2.65, 0.006, 0.85]} scale={[1, 1, 0.8]} castShadow={false} />
      {[[2.55, 0.8, 0.2], [2.78, 0.95, -0.15]].map(([x, z, a], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={a}>
          <Part geo={rbox(0.14, 0.32, 0.14, 0.05)} m={C.logBark} p={[0, 0.2, 0]} />
          <Part geo={rbox(0.14, 0.1, 0.26, 0.05)} m={C.logBark} p={[0, 0.05, 0.06]} />
          <Part geo={cyl(0.075, 0.075, 0.06, 14)} m={C.wool} p={[0, 0.38, 0]} castShadow={false} />
        </group>
      ))}
      {/* le petit sapin en pot, ses boules rouges */}
      <group position={[2.85, 0, -1.35]}>
        <Part geo={cyl(0.22, 0.18, 0.3, 16)} m={C.beam} p={[0, 0.15, 0]} />
        {[0, 1, 2].map((i) => (
          <Part key={i} m={i % 2 ? C.pine : C.pineDark} p={[0, 0.5 + i * 0.32, 0]}>
            <coneGeometry args={[0.42 - i * 0.11, 0.55, 14]} />
          </Part>
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const a = i * 2.3, h = 0.4 + (i % 4) * 0.2, r = 0.36 - (i % 4) * 0.08
          return <Part key={i} geo={SPH} m={i % 2 ? C.berry : M.butter} scale={0.035} p={[Math.cos(a) * r, h, Math.sin(a) * r]} castShadow={false} />
        })}
        <Part geo={SPH} m={M.butter} scale={0.05} p={[0, 1.36, 0]} castShadow={false} />
      </group>
    </>
  )
}

/** Un grand panier de pommes de pin près du bois. */
export function PineconeBasket() {
  return (
    <group position={[-2.55, 0, 0.35]}>
      <Part geo={cyl(0.22, 0.18, 0.26, 16)} m={C.beam} p={[0, 0.13, 0]} />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * TAU
        return <Part key={i} geo={SPH} m={C.logBark} scale={[0.05, 0.07, 0.05]} p={[Math.cos(a) * 0.1, 0.27 + (i % 2) * 0.03, Math.sin(a) * 0.1]} castShadow={false} />
      })}
    </group>
  )
}
