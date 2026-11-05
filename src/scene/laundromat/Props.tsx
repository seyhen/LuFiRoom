import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, MeshStandardMaterial, type Group } from 'three'
import { TAU, smooth } from '../../math'
import { mood } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { LIVE } from '../Static'
import { Garment } from '../objects/Garment'
import { Rosette } from '../nature/Rosette'
import { Cat } from '../objects/Cat'
import { gummy } from '../materials'
import { Vessel } from '../igloo/Vessel'
import { L } from './materials'
import { magazineTex, sheenTex } from './textures'
import { Sleeper } from './Sleeper'
import { JUG_BLUE, JUG_PINK, Jug } from './Jug'

const IN = -3.0

/**
 * Le banc de plastique moulé sous la vitrine : trois coques jaune moutarde sur une poutre d'acier et deux pieds en T. Le client
 * assoupi sur la coque du milieu ; sur celle de gauche, une pile de magazines cornés ; à ses pieds, son grand sac de linge bleu.
 */
const MAGS = [magazineTex('#2a63b8', '#f4a6c6', 'ÉTÉ', 1), magazineTex('#3faa7a', '#f6d77a', 'JARDIN', 2), magazineTex('#e8705a', '#8cc6ee', 'CINÉ', 4)].map(
  (t) => new MeshStandardMaterial({ map: t, roughness: 0.6 }),
)
const SEATS = [-1.0, -0.38, 0.24]
export function Bench({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {/* la poutre, les deux pieds en T et leurs patins */}
      <Part geo={rbox(1.86, 0.06, 0.08, 0.025)} m={L.steelDark} p={[-0.38, 0.33, -0.05]} />
      {[-1.2, 0.44].map((x) => (
        <group key={x} position={[x, 0, -0.05]}>
          <Part geo={rbox(0.06, 0.33, 0.06, 0.02)} m={L.steelDark} p={[0, 0.165, 0]} />
          <Part geo={rbox(0.08, 0.03, 0.46, 0.012)} m={L.steelDark} p={[0, 0.015, 0]} castShadow={false} />
        </group>
      ))}
      {SEATS.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {/* la coque : l'assise, le pli arrondi, le dossier un peu renversé, ses deux pattes sur la poutre */}
          <Part geo={rbox(0.54, 0.05, 0.44, 0.024)} m={L.benchSeat} p={[0, 0.425, 0.02]} />
          <Part geo={cyl(0.045, 0.045, 0.54, 16)} m={L.benchSeat} p={[0, 0.44, -0.2]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.54, 0.4, 0.05, 0.024)} m={L.benchSeat} p={[0, 0.64, -0.24]} rotation-x={-0.18} />
          {[-0.18, 0.18].map((dx) => (
            <Part key={dx} geo={rbox(0.04, 0.07, 0.1, 0.012)} m={L.steel} p={[dx, 0.37, -0.05]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* la pile de magazines cornés sur la coque de gauche */}
      {MAGS.map((m, i) => (
        <group key={i} position={[-1.0 + i * 0.02, 0.45 + i * 0.012, 0.04 - i * 0.015]} rotation-y={(i - 1) * 0.3}>
          <Part geo={rbox(0.21, 0.01, 0.27, 0.003)} m={L.paper} castShadow={false} />
          <mesh material={m} position={[0, 0.0055, 0]} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.21, 0.27]} />
          </mesh>
        </group>
      ))}
      {/* le gobelet de café sur la coque de droite */}
      <group position={[0.36, 0.45, 0.1]}>
        <Part geo={cyl(0.04, 0.03, 0.11, 16)} m={L.paper} p={[0, 0.055, 0]} />
        <Part geo={cyl(0.042, 0.041, 0.012, 16)} m={L.frameDark} p={[0, 0.115, 0]} castShadow={false} />
        <Part geo={cyl(0.038, 0.038, 0.03, 16)} m={L.mintCloth} p={[0, 0.045, 0]} castShadow={false} />
      </group>
      {/* le grand sac de linge bleu à ses pieds : la toile souple, le linge qui dépasse, les anses jaunes rabattues */}
      <group position={[-0.95, 0, 0.42]} rotation-y={0.3}>
        <Part geo={rbox(0.5, 0.34, 0.3, 0.1)} m={L.canvas} p={[0, 0.17, 0]} />
        <Part geo={SPH} m={L.canvas} scale={[0.25, 0.06, 0.15]} p={[0, 0.33, 0]} castShadow={false} />
        <Part geo={SPH} m={L.white} scale={[0.16, 0.07, 0.1]} p={[-0.05, 0.37, 0]} castShadow={false} />
        <Part geo={SPH} m={L.coral} scale={[0.09, 0.05, 0.07]} p={[0.11, 0.38, 0.02]} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} m={L.butter} p={[0, 0.3, s * 0.152]} rotation-x={s * 0.5} castShadow={false}>
            <torusGeometry args={[0.13, 0.016, 8, 18, Math.PI]} />
          </Part>
        ))}
      </group>
      <Sleeper position={[SEATS[1], 0.45, 0.0]} />
    </group>
  )
}

/** La poubelle à pédale entre les séchoirs et le banc : la cuve d'inox, le couvercle bombé, la pédale, le sac qui dépasse. */
export function Bin({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.15, 0.14, 0.46, 24)} m={L.steel} p={[0, 0.23, 0]} />
      <Part geo={cyl(0.15, 0.15, 0.025, 24)} m={L.rubber} p={[0, 0.012, 0]} castShadow={false} />
      <Part geo={SPH} m={L.steel} scale={[0.155, 0.04, 0.155]} p={[0, 0.47, 0]} castShadow={false} />
      <Part geo={cyl(0.158, 0.158, 0.02, 24)} m={L.white} p={[0, 0.455, 0]} castShadow={false} />
      <Part geo={rbox(0.1, 0.02, 0.06, 0.008)} m={L.steelDark} p={[0, 0.03, 0.17]} castShadow={false} />
    </group>
  )
}

/** La sansevieria du coin, dans un grand pot de céramique blanche cerclé de menthe : de hautes feuilles en épée. */
export function Plant({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Vessel p={[0, 0, 0]} rt={0.2} rb={0.15} h={0.42} m={L.pot} inner={L.potIn} rim={L.pot} t={0.015} />
      <Part geo={cyl(0.188, 0.188, 0.06, 28)} m={L.tileTrim} p={[0, 0.3, 0]} castShadow={false} />
      <Part geo={cyl(0.18, 0.18, 0.02, 24)} m={L.soil} p={[0, 0.37, 0]} castShadow={false} />
      <Part geo={cyl(0.14, 0.14, 0.06, 16)} m={L.wood} p={[0, 0.03, 0]} castShadow={false} />
      <Rosette p={[0, 0.38, 0]} size={0.95} n={11} kind="lance" rise={1.45} m={L.leaf} m2={L.leafEdge} />
    </group>
  )
}

/**
 * Le chariot à linge : un cadre de tube chromé sur quatre roulettes, un panier de toile bleue, la barre de penderie au-dessus où
 * pendent une chemise et une robe sur leurs cintres.
 */
export function Cart({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <group key={`${sx}${sz}`} position={[sx * 0.24, 0, sz * 0.36]}>
          <Part geo={cyl(0.016, 0.016, 1.5, 10)} m={L.chrome} p={[0, 0.82, 0]} />
          <Part geo={cyl(0.04, 0.04, 0.03, 12)} m={L.rubber} p={[0, 0.04, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.03, 0.04, 0.05, 0.01)} m={L.chrome} p={[0, 0.075, 0]} castShadow={false} />
        </group>
      )))}
      {[-1, 1].map((sx) => (
        <Part key={sx} geo={cyl(0.016, 0.016, 0.72, 10)} m={L.chrome} p={[sx * 0.24, 1.56, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      ))}
      <Part geo={cyl(0.018, 0.018, 0.48, 10)} m={L.chrome} p={[0, 1.56, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      {/* le panier de toile : un sac ouvert pendu au cadre, du linge dedans */}
      <Part geo={rbox(0.46, 0.04, 0.7, 0.02)} m={L.chrome} p={[0, 0.66, 0]} castShadow={false} />
      <Part geo={rbox(0.44, 0.5, 0.68, 0.08)} m={L.canvas} p={[0, 0.42, 0]} />
      <Part geo={SPH} m={L.mintCloth} scale={[0.18, 0.08, 0.25]} p={[0, 0.66, 0.05]} castShadow={false} />
      <Part geo={SPH} m={L.pinkCloth} scale={[0.12, 0.06, 0.12]} p={[0.06, 0.7, -0.15]} castShadow={false} />
      <Part geo={SPH} m={L.white} scale={[0.1, 0.05, 0.11]} p={[-0.08, 0.7, 0.18]} castShadow={false} />
      {/* la chemise et la robe sur la barre de penderie (le devant vers +x) */}
      <group position={[0, 1.56, 0]} rotation-y={Math.PI / 2}>
        <Garment kind="shirt" p={[-0.12, 0, 0]} s={0.72} m={L.sky} hanger={L.wood}>
          {[0.1, 0.2, 0.3].map((y) => (
            <Part key={y} geo={SPH} m={L.white} scale={0.012} p={[0, -y, 0.06]} castShadow={false} />
          ))}
        </Garment>
        <Garment kind="dress" p={[0.16, 0, -0.02]} s={0.7} m={L.coral} hanger={L.wood} />
      </group>
    </group>
  )
}

/**
 * Le seau de ménage et sa serpillière, le panneau jaune « sol glissant » à côté, et la flaque calme, encore humide, qui brille sur le
 * carrelage : c'est tout ce qu'on voit de la pluie à l'intérieur (avec les reflets).
 */
export function WetFloor({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {/* le panneau en A : deux volets jaunes inclinés, leur pictogramme, la poignée */}
      <group position={[0.55, 0, 0.0]} rotation-y={0.7}>
        {[-1, 1].map((s) => (
          <group key={s} position={[0, 0, s * 0.11]} rotation-x={s * 0.24}>
            <Part geo={rbox(0.34, 0.56, 0.02, 0.02)} m={L.yellow} p={[0, 0.28, 0]} />
            <mesh material={L.wetSign} position={[0, 0.3, s * 0.0115]} rotation-y={s > 0 ? 0 : Math.PI} raycast={noRay}>
              <planeGeometry args={[0.28, 0.42]} />
            </mesh>
          </group>
        ))}
        <Part geo={rbox(0.14, 0.03, 0.05, 0.012)} m={L.yellow} p={[0, 0.585, 0]} castShadow={false} />
      </group>
      {/* le seau à essorer : la cuve jaune ouverte (eau grise dedans), l'essoreuse, l'anse, ses roulettes ; la serpillière dedans */}
      <group position={[-0.1, 0, 0.0]}>
        <Vessel p={[0, 0.05, 0]} rt={0.17} rb={0.14} h={0.3} m={L.yellow} inner={L.basket} t={0.012} />
        <Part geo={cyl(0.15, 0.15, 0.01, 24)} m={L.mopWater} p={[0, 0.25, 0]} castShadow={false} />
        {[0, 1, 2].map((k) => (
          <Part key={k} geo={cyl(0.025, 0.025, 0.02, 10)} m={L.rubber} p={[Math.cos((k / 3) * TAU) * 0.13, 0.025, Math.sin((k / 3) * TAU) * 0.13]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
        {/* l'essoreuse grise accrochée au bord, son levier */}
        <Part geo={rbox(0.18, 0.12, 0.1, 0.03)} m={L.plastic} p={[0.0, 0.36, -0.1]} />
        <Part geo={rbox(0.14, 0.03, 0.08, 0.012)} m={L.steelDark} p={[0.0, 0.3, -0.06]} castShadow={false} />
        <Part geo={cyl(0.014, 0.014, 0.42, 8)} m={L.steelDark} p={[0.1, 0.56, -0.12]} rotation-z={-0.25} castShadow={false} />
        <Part geo={cyl(0.024, 0.024, 0.09, 10)} m={L.rubber} p={[0.153, 0.77, -0.12]} rotation-z={-0.25} castShadow={false} />
        <Part m={L.steel} p={[0, 0.36, 0]} rotation-x={0} castShadow={false}>
          <torusGeometry args={[0.17, 0.008, 6, 20, Math.PI]} />
        </Part>
        {/* la serpillière : sa tête de franges, son manche appuyé */}
        <Part geo={SPH} m={L.mopHead} scale={[0.1, 0.06, 0.1]} p={[0.02, 0.27, 0.04]} castShadow={false} />
        <Part geo={cyl(0.018, 0.018, 1.3, 10)} m={L.wood} p={[-0.06, 0.88, 0.22]} rotation={[0.32, 0, 0.18]} />
      </group>
      {/* la flaque calme */}
      <mesh material={L.puddle} position={[0.28, 0.006, 0.42]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[0.7, 0.38]} />
      </mesh>
    </group>
  )
}

/**
 * Le panier de linge chaud tout juste sorti du séchoir, au pied de la rangée, et le chat du quartier qui s'y est roulé en boule :
 * un chat crème tigré de roux, venu se mettre au chaud par la porte. Le panier de plastique ajouré, ses anses, les serviettes.
 */
const CAT_COAT = { fur: gummy(0xead8bd, { roughness: 0.6 }), light: gummy(0xfbf4e8, { roughness: 0.6 }), dark: gummy(0xc98a58, { roughness: 0.6 }) }
export function CatBasket({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <group rotation-y={0.25}>
        {/* le panier : fond, parois hautes derrière et basses devant, anses */}
        <Part geo={rbox(0.62, 0.03, 0.46, 0.015)} m={L.basket} p={[0, 0.015, 0]} castShadow={false} />
        <Part geo={rbox(0.62, 0.26, 0.025, 0.012)} m={L.basket} p={[0, 0.13, -0.22]} />
        <Part geo={rbox(0.025, 0.26, 0.46, 0.012)} m={L.basket} p={[-0.3, 0.13, 0]} />
        <Part geo={rbox(0.62, 0.16, 0.025, 0.012)} m={L.basket} p={[0, 0.08, 0.22]} />
        <Part geo={rbox(0.025, 0.16, 0.46, 0.012)} m={L.basket} p={[0.3, 0.08, 0]} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.02, 0.04, 0.16, 0.01)} m={L.frame} p={[s * 0.31, s > 0 ? 0.13 : 0.22, 0]} castShadow={false} />
        ))}
        {/* les serviettes chaudes, en vagues */}
        <Part geo={SPH} m={L.white} scale={[0.27, 0.07, 0.19]} p={[0, 0.14, 0]} castShadow={false} />
        <Part geo={SPH} m={L.coral} scale={[0.16, 0.05, 0.12]} p={[-0.12, 0.18, -0.06]} castShadow={false} />
        <Part geo={SPH} m={L.sky} scale={[0.14, 0.045, 0.1]} p={[0.16, 0.17, 0.08]} castShadow={false} />
        {/* une serviette qui déborde sur le côté */}
        <Part geo={rbox(0.02, 0.14, 0.2, 0.01)} m={L.butter} p={[0.32, 0.12, 0.05]} rotation-z={0.15} castShadow={false} />
      </group>
      <Cat position={[0.02, 0.17, 0.0]} rotation={0.4} coat={CAT_COAT} pattern="tabby" />
    </group>
  )
}

/** L'étagère au-dessus des lave-linge : la planche, ses consoles, les bidons et la boîte de lessive en poudre qu'on y laisse. */
export function Shelf() {
  const z0 = -1.85, z1 = 1.7
  return (
    <group>
      <Part geo={rbox(0.26, 0.035, z1 - z0, 0.012)} m={L.laminate} p={[IN + 0.13, 1.62, (z0 + z1) / 2]} />
      {[z0 + 0.3, 0, z1 - 0.3].map((z) => (
        <Part key={z} geo={rbox(0.2, 0.12, 0.025, 0.01)} m={L.steel} p={[IN + 0.1, 1.55, z]} castShadow={false} />
      ))}
      {/* deux bidons, une boîte de poudre (son couvercle, sa doseuse), une pile de dosettes */}
      <Jug p={[IN + 0.13, 1.64, -1.4]} {...JUG_BLUE} h={0.22} />
      <Jug p={[IN + 0.13, 1.64, -1.15]} {...JUG_PINK} h={0.2} />
      <Jug p={[IN + 0.13, 1.64, 0.9]} {...JUG_BLUE} h={0.22} />
      <group position={[IN + 0.13, 1.64, -0.35]}>
        <Part geo={rbox(0.16, 0.2, 0.24, 0.02)} m={L.butter} p={[0, 0.1, 0]} />
        <Part geo={rbox(0.165, 0.035, 0.245, 0.012)} m={L.coral} p={[0, 0.19, 0]} castShadow={false} />
        <Part geo={cyl(0.035, 0.03, 0.05, 14)} m={L.frame} p={[0.0, 0.235, 0.05]} castShadow={false} />
      </group>
      {[0.25, 0.45].map((z, i) => (
        <Part key={z} geo={rbox(0.14, 0.1, 0.14, 0.03)} m={i ? L.mintCloth : L.lilac} p={[IN + 0.13, 1.69, z]} castShadow={false} />
      ))}
    </group>
  )
}

/**
 * Ce qui habille les murs : le tableau des tarifs, les consignes, l'horloge (elle donne l'heure de l'appareil), les petites annonces
 * à côté du distributeur, la grille de ventilation au-dessus des séchoirs et la gaine qui y monte, un extincteur.
 */
export function WallDecor() {
  const hour = useRef<Group>(null!), minute = useRef<Group>(null!)
  useFrame(() => {
    const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60
    minute.current.rotation.z = -(m / 60) * TAU
    hour.current.rotation.z = -(((d.getHours() % 12) + m / 60) / 12) * TAU
  })
  return (
    <group>
      {/* les tarifs, en émail bleu, et les consignes scotchées */}
      <mesh material={L.price} position={[IN + 0.012, 2.35, -0.55]} rotation-y={Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1.05, 0.7]} />
      </mesh>
      <Part geo={rbox(0.015, 0.74, 1.09, 0.01)} m={L.frame} p={[IN + 0.004, 2.35, -0.55]} castShadow={false} />
      <mesh material={L.rules} position={[IN + 0.012, 2.3, 0.6]} rotation={[0, Math.PI / 2, 0.04]} raycast={noRay}>
        <planeGeometry args={[0.36, 0.48]} />
      </mesh>
      {/* l'horloge murale */}
      <group position={[IN + 0.03, 2.62, 1.55]} rotation-y={Math.PI / 2}>
        <Part geo={cyl(0.27, 0.27, 0.05, 36)} m={L.frame} rotation-x={Math.PI / 2} />
        <mesh material={L.clock} position={[0, 0, 0.027]} raycast={noRay}>
          <circleGeometry args={[0.24, 36]} />
        </mesh>
        <group ref={hour} userData={LIVE} position={[0, 0, 0.035]}>
          <Part geo={rbox(0.024, 0.13, 0.01, 0.008)} m={L.hand} p={[0, 0.05, 0]} castShadow={false} />
        </group>
        <group ref={minute} userData={LIVE} position={[0, 0, 0.045]}>
          <Part geo={rbox(0.016, 0.2, 0.01, 0.006)} m={L.hand} p={[0, 0.08, 0]} castShadow={false} />
        </group>
        <Part geo={SPH} m={L.capBlue} scale={0.018} p={[0, 0, 0.05]} castShadow={false} />
      </group>
      {/* la grille de ventilation au-dessus des séchoirs et sa gaine souple qui monte */}
      <group position={[IN + 0.02, 2.6, -2.5]}>
        <Part geo={rbox(0.04, 0.34, 0.5, 0.02)} m={L.frame} />
        {[-0.1, -0.03, 0.04, 0.11].map((y) => (
          <Part key={y} geo={rbox(0.02, 0.03, 0.42, 0.01)} m={L.steelDark} p={[0.025, y, 0]} castShadow={false} />
        ))}
      </group>
      <Part geo={cyl(0.07, 0.07, 0.6, 16)} m={L.steel} p={[IN + 0.1, 2.12, -2.5]} />
      {[1.87, 1.97, 2.07, 2.17, 2.27, 2.37].map((y) => (
        <Part key={y} m={L.steel} p={[IN + 0.1, y, -2.5]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.07, 0.008, 6, 18]} />
        </Part>
      ))}
      {/* les petites annonces, punaisées au-dessus du distributeur */}
      <mesh material={L.cork} position={[2.72, 2.35, IN + 0.012]} raycast={noRay}>
        <planeGeometry args={[0.66, 0.53]} />
      </mesh>
      <Part geo={rbox(0.7, 0.57, 0.015, 0.01)} m={L.woodDark} p={[2.72, 2.35, IN + 0.004]} castShadow={false} />
      {/* l'extincteur rouge sur son crochet, au mur de gauche près des séchoirs */}
      <group position={[IN + 0.1, 0.55, -1.98]}>
        <Part geo={cyl(0.075, 0.075, 0.42, 18)} m={L.coral} p={[0, 0.21, 0]} />
        <Part geo={SPH} m={L.coral} scale={[0.075, 0.04, 0.075]} p={[0, 0.42, 0]} castShadow={false} />
        <Part geo={rbox(0.05, 0.06, 0.12, 0.012)} m={L.frameDark} p={[0, 0.47, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.3, 8)} m={L.frameDark} p={[0.05, 0.32, 0.07]} rotation-x={0.3} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Les reflets doux sur le carrelage vernis : la lueur froide de la vitrine (la rue la nuit), la tache chaude du distributeur et de
 * la lampe. Des plans additifs posés juste au-dessus du sol ; ils suivent la nuit.
 */
const sheenCool = new MeshBasicMaterial({ map: sheenTex, color: 0x9fd8ff, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })
const sheenWarm = new MeshBasicMaterial({ map: sheenTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })
export function FloorSheen() {
  useFrame(() => {
    const n = smooth(mood.night), wet = mood.rain
    sheenCool.opacity = 0.06 + n * 0.16 + wet * 0.05
    sheenWarm.opacity = 0.03 + n * 0.2
  })
  return (
    <group raycast={noRay}>
      <mesh material={sheenCool} position={[0.55, 0.007, -1.95]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[4.2, 1.4]} />
      </mesh>
      <mesh material={sheenWarm} position={[2.0, 0.007, 1.6]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1.4, 1.4]} />
      </mesh>
    </group>
  )
}
