import { useRef } from 'react'
import type { Group } from 'three'
import { reduceMotion } from '../anim'
import { Part, SPH, cyl, rbox, worldUV, type V3 } from '../parts'
import { Static } from '../Static'
import { useBeat } from '../objects/useBeat'
import { Vessel } from '../igloo/Vessel'
import { T } from './materials'

const TOP = 0.44 // le dessus de la caisse

/**
 * L'ukulélé, objet « radio » de la tente : posé sur une caisse d'expédition au pochoir « CAMP », le manche vers la gauche. Une table
 * d'harmonie de miel avec sa rosace et sa rose de palissandre, un chevalet, quatre cordes, un manche à touches de laiton et sa tête
 * à quatre mécaniques de nacre ; à côté, un médiator, un quart de café et un carnet de grilles d'accords. Sur le kick : les cordes
 * vibrent, des notes s'envolent. `position` est le pied de la caisse.
 */
export function Ukulele({ position, ry = 0 }: { position: V3; ry?: number }) {
  const strings = useRef<Group>(null!)
  const { g, notes } = useBeat([position[0], position[1] + TOP, position[2]], 0.5, (on, _t, pulse) => {
    strings.current.scale.y = on && !reduceMotion ? 1 + pulse * 1.8 : 1
  }, 0.03, { vy: 0.4, dx: -0.1 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* la caisse : planches, tasseaux d'angle, pochoir de l'expédition */}
          <Part geo={worldUV(rbox(0.98, TOP - 0.02, 0.52, 0.03), 0.9)} m={T.wood} p={[0, (TOP - 0.02) / 2, 0]} />
          {[-0.44, 0.44].map((x) => <Part key={x} geo={rbox(0.07, TOP - 0.02, 0.55, 0.015)} m={T.woodDark} p={[x, (TOP - 0.02) / 2, 0]} castShadow={false} />)}
          <Part geo={rbox(1.0, 0.03, 0.54, 0.012)} m={T.woodDark} p={[0, TOP - 0.015, 0]} castShadow={false} />
          <mesh material={T.stencil} position={[0, 0.2, 0.278]}>
            <planeGeometry args={[0.46, 0.23]} />
          </mesh>
          {/* le médiator et le quart de café, au bout de la caisse */}
          <Part geo={cyl(0.012, 0.012, 0.004, 3)} m={T.pencil} p={[0.3, TOP + 0.004, 0.18]} rotation-y={0.5} castShadow={false} />
          <Vessel p={[0.37, TOP, -0.12]} rt={0.062} rb={0.056} h={0.11} m={T.enamel} inner={T.enamelIn} rim={T.enamelBlue} />
          <Part geo={cyl(0.052, 0.052, 0.006, 20)} m={T.coffee} p={[0.37, TOP + 0.086, -0.12]} castShadow={false} />
          <Part m={T.enamel} p={[0.43, TOP + 0.06, -0.12]} castShadow={false}>
            <torusGeometry args={[0.032, 0.008, 8, 16]} />
          </Part>
          {/* le carnet de grilles d'accords, ouvert, un crayon dedans */}
          <group position={[0.28, TOP, -0.06]} rotation-y={-0.5}>
            <Part geo={rbox(0.15, 0.012, 0.2, 0.004)} m={T.leatherDark} p={[0, 0.006, 0]} castShadow={false} />
            <Part geo={rbox(0.066, 0.008, 0.18, 0.003)} m={T.paper} p={[-0.036, 0.016, 0]} castShadow={false} />
            <Part geo={rbox(0.066, 0.008, 0.18, 0.003)} m={T.paper} p={[0.036, 0.016, 0]} rotation-z={0.04} castShadow={false} />
            <Part geo={cyl(0.005, 0.005, 0.15, 6)} m={T.pencil} p={[0.02, 0.026, 0.02]} rotation={[Math.PI / 2, 0, 0.5]} castShadow={false} />
          </group>
        </Static>
        {/* l'ukulélé, couché sur la caisse (agrandi : un jouet de la pièce, pas la taille réelle) */}
        <group position={[-0.04, TOP + 0.047, 0.02]} rotation-y={0.18} scale={1.5}>
          <Static>
            {/* le corps : deux ellipses d'épicéa, un éclisse sombre, la table claire par-dessus */}
            <Part geo={cyl(1, 1, 0.06, 36)} m={T.ukeDark} scale={[0.092, 1, 0.088]} p={[0.07, 0, 0]} />
            <Part geo={cyl(1, 1, 0.06, 36)} m={T.ukeDark} scale={[0.075, 1, 0.068]} p={[-0.075, 0, 0]} />
            <Part geo={cyl(1, 1, 0.008, 36)} m={T.uke} scale={[0.088, 1, 0.084]} p={[0.07, 0.031, 0]} castShadow={false} />
            <Part geo={cyl(1, 1, 0.008, 36)} m={T.uke} scale={[0.071, 1, 0.064]} p={[-0.075, 0.031, 0]} castShadow={false} />
            <Part geo={rbox(0.1, 0.008, 0.07, 0.004)} m={T.uke} p={[-0.005, 0.031, 0]} castShadow={false} />
            {/* la rosace et la rose */}
            <Part geo={cyl(0.036, 0.036, 0.004, 24)} m={T.sole} p={[0.055, 0.037, 0]} castShadow={false} />
            <Part m={T.ukeLight} p={[0.055, 0.037, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.042, 0.005, 6, 28]} />
            </Part>
            {/* le chevalet et la sellette */}
            <Part geo={rbox(0.016, 0.01, 0.07, 0.004)} m={T.ukeDark} p={[0.127, 0.039, 0]} castShadow={false} />
            <Part geo={rbox(0.003, 0.005, 0.05, 0.002)} m={T.ukeLight} p={[0.122, 0.046, 0]} castShadow={false} />
            {/* le manche : bois clair, touche sombre, six frettes de laiton */}
            <Part geo={rbox(0.24, 0.05, 0.064, 0.008)} m={T.uke} p={[-0.2, 0.008, 0]} />
            <Part geo={rbox(0.22, 0.006, 0.058, 0.003)} m={T.fret} p={[-0.2, 0.0365, 0]} castShadow={false} />
            {[0, 1, 2, 3, 4, 5].map((i) => <Part key={i} geo={rbox(0.004, 0.003, 0.058, 0.001)} m={T.brass} p={[-0.1 - i * 0.034 + i * i * 0.0012, 0.0405, 0]} castShadow={false} />)}
            {/* la tête : sabot clair, sillet, quatre mécaniques de nacre */}
            <Part geo={rbox(0.07, 0.05, 0.07, 0.008)} m={T.ukeDark} p={[-0.352, 0.008, 0]} />
            <Part geo={rbox(0.006, 0.024, 0.058, 0.002)} m={T.ukeLight} p={[-0.318, 0.04, 0]} castShadow={false} />
            {[-0.016, 0.016].flatMap((x) => [-0.03, 0.03].map((z) => (
              <group key={`${x}${z}`}>
                <Part geo={cyl(0.003, 0.003, 0.028, 6)} m={T.steel} p={[-0.352 + x, 0.008, z * 0.8]} rotation-x={Math.PI / 2} castShadow={false} />
                <Part geo={SPH} m={T.ukeLight} scale={[0.01, 0.006, 0.014]} p={[-0.352 + x, 0.008, z * 1.2]} castShadow={false} />
              </group>
            )))}
          </Static>
          {/* les quatre cordes : du sillet au chevalet, elles vibrent sur le kick */}
          <group ref={strings} position={[0, 0.045, 0]}>
            {[-0.021, -0.007, 0.007, 0.021].map((z) => (
              <Part key={z} geo={cyl(0.0032, 0.0032, 0.44, 5)} m={T.string} p={[-0.1, 0, z]} rotation-z={Math.PI / 2} castShadow={false} />
            ))}
          </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
