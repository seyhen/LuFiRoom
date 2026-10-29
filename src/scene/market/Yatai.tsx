import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TAU } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { Steam } from '../objects/Steam'
import { K } from './materials'
import { Lantern } from './Lantern'
import { Chef, Customer, LuckyCat } from './Chef'
import { Pot } from './Pot'
import { Wok } from './Wok'

/** La carriole de ramen : son centre au sol. Le comptoir est au nord (z−), les clients au sud (z+). */
export const YATAI = { x: 0.9, z: -0.75, counter: 0.99 }

/** Une grande roue de bois : jante, huit rayons, moyeu de laiton. */
function Wheel({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part m={K.woodDark}>
        <torusGeometry args={[0.3, 0.04, 10, 28]} />
      </Part>
      {Array.from({ length: 8 }, (_, i) => (
        <Part key={i} geo={rbox(0.025, 0.56, 0.025, 0.008)} m={K.wood} rotation-z={(i / 8) * Math.PI} castShadow={false} />
      ))}
      <Part geo={cyl(0.06, 0.06, 0.08, 14)} m={K.brass} rotation-x={Math.PI / 2} />
    </group>
  )
}

/**
 * Un bol de ramen prêt à manger, grand et lisible : bol blanc à liseré rouge, bouillon doré piqué de gouttes d'huile, nid de nouilles,
 * deux tranches de chashu, un œuf mollet coupé en deux (jaune orangé), un narutomaki rose, des pousses de bambou, une feuille de nori
 * dressée, des rondelles d'oignon vert, des baguettes en travers et une cuillère de porcelaine. Il fume doucement.
 */
function Bowl({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  return (
    <group position={position} rotation-y={rotation} scale={1.35}>
      <Part geo={cyl(0.15, 0.085, 0.11, 24)} m={K.bowl} p={[0, 0.055, 0]} />
      <Part geo={cyl(0.058, 0.07, 0.014, 18)} m={K.red} p={[0, 0.007, 0]} castShadow={false} />
      <Part geo={cyl(0.152, 0.152, 0.018, 24)} m={K.red} p={[0, 0.1, 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.1, 0.005, 24)} m={K.cream} p={[0, 0.05, 0]} rotation-z={0} castShadow={false} />
      <Part geo={cyl(0.134, 0.134, 0.01, 24)} m={K.broth} p={[0, 0.108, 0]} castShadow={false} />
      {/* le nid de nouilles : une masse jaune pâle et des mèches qui retombent */}
      <Part geo={SPH} m={K.noodle} scale={[0.1, 0.045, 0.095]} p={[0.0, 0.118, 0.0]} castShadow={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * TAU
        return <Part key={i} m={K.noodle} p={[Math.cos(a) * 0.05, 0.145, Math.sin(a) * 0.05]} rotation={[Math.PI / 2, 0, a]} castShadow={false}>
          <torusGeometry args={[0.03, 0.006, 5, 10, Math.PI * 1.3]} />
        </Part>
      })}
      {/* deux tranches de chashu à bord brun, posées en éventail contre le bord */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-0.075, 0.138 + (s > 0 ? 0.006 : 0), s * 0.04]} rotation={[0, s * 0.3, 0.35]}>
          <Part geo={cyl(0.05, 0.05, 0.01, 18)} m={K.pork} castShadow={false} />
          <Part geo={cyl(0.05, 0.05, 0.004, 18)} m={K.woodPale} p={[0, 0.006, 0]} castShadow={false} />
          <Part m={K.redDark} p={[0, 0.002, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.049, 0.004, 4, 18]} />
          </Part>
        </group>
      ))}
      {/* l'œuf mollet coupé en deux, jaune orangé au centre */}
      {[0, 1].map((i) => (
        <group key={i} position={[0.07, 0.14, 0.03 - i * 0.052]} rotation={[0.2, 0, -0.25]}>
          <Part geo={SPH} m={K.egg} scale={[0.036, 0.028, 0.026]} castShadow={false} />
          <Part geo={SPH} m={K.yolk} scale={[0.02, 0.016, 0.015]} p={[0, 0.014, 0]} castShadow={false} />
        </group>
      ))}
      {/* le narutomaki : un disque blanc à volute rose */}
      <group position={[0.0, 0.148, -0.085]} rotation={[0.45, 0, 0]}>
        <Part geo={cyl(0.034, 0.034, 0.008, 16)} m={K.cream} castShadow={false} />
        <Part m={K.red} p={[0, 0.005, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.02, 0.004, 4, 14]} />
        </Part>
        <Part m={K.red} p={[0, 0.005, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.01, 0.004, 4, 10]} />
        </Part>
      </group>
      {/* les pousses de bambou, la feuille de nori dressée contre le bord, l'oignon vert */}
      {[0, 1, 2].map((i) => (
        <Part key={i} geo={rbox(0.045, 0.012, 0.012, 0.004)} m={K.woodPale} p={[0.0 + i * 0.02, 0.15 + i * 0.004, 0.085 - i * 0.012]} rotation-y={0.3 + i * 0.5} castShadow={false} />
      ))}
      <Part geo={rbox(0.07, 0.1, 0.006, 0.003)} m={K.nori} p={[0.02, 0.18, 0.125]} rotation-x={-0.25} castShadow={false} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.3
        return (
          <Part key={i} m={K.scallion} p={[Math.cos(a) * (0.03 + (i % 3) * 0.02) + 0.02, 0.156, Math.sin(a) * (0.03 + (i % 3) * 0.02)]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.0085, 0.0035, 4, 8]} />
          </Part>
        )
      })}
      {[[0.06, -0.03], [-0.03, 0.06], [0.0, -0.06]].map(([x, z], i) => (
        <Part key={i} geo={cyl(0.012 + i * 0.002, 0.012 + i * 0.002, 0.003, 10)} m={K.yolk} p={[x, 0.114, z]} castShadow={false} />
      ))}
      {/* les baguettes en travers, la cuillère de porcelaine */}
      <Part geo={cyl(0.004, 0.004, 0.3, 5)} m={K.woodPale} p={[0.06, 0.168, -0.0]} rotation={[0.05, 0.4, 1.5]} castShadow={false} />
      <Part geo={cyl(0.004, 0.004, 0.3, 5)} m={K.woodPale} p={[0.075, 0.164, 0.02]} rotation={[0.05, 0.4, 1.5]} castShadow={false} />
      <Part geo={cyl(0.006, 0.006, 0.12, 6)} m={K.bowl} p={[-0.1, 0.12, 0.09]} rotation={[0.3, -0.5, 1.2]} castShadow={false} />
      <Part geo={SPH} m={K.bowl} scale={[0.035, 0.014, 0.025]} p={[-0.04, 0.115, 0.13]} castShadow={false} />
      <Steam at={[0, 0.2, 0]} every={1.5} />
    </group>
  )
}

/** Un tabouret rond, laqué rouge, sur un pied chromé à repose-pied. */
function Stool({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.19, 0.17, 0.09, 24)} m={K.vinyl} p={[0, 0.58, 0]} />
      <Part geo={cyl(0.2, 0.2, 0.02, 24)} m={K.steel} p={[0, 0.535, 0]} castShadow={false} />
      <Part geo={cyl(0.025, 0.025, 0.5, 8)} m={K.steel} p={[0, 0.27, 0]} />
      <Part m={K.steel} p={[0, 0.2, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.13, 0.012, 6, 20]} />
      </Part>
      <Part geo={cyl(0.17, 0.19, 0.03, 20)} m={K.steelDark} p={[0, 0.015, 0]} />
    </group>
  )
}

/** Le noren de l'arrière-comptoir : trois pans qui se balancent un peu au courant d'air. */
function Noren() {
  const g = useRef<Group>(null!)
  useFrame(({ clock }) => {
    g.current.rotation.x = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.025 + Math.sin(clock.elapsedTime * 2.1) * 0.01
  })
  return (
    <group ref={g} userData={LIVE} position={[0, 2.5, -0.52]}>
      <mesh material={K.noren} position={[0, -0.325, 0]} castShadow>
        <planeGeometry args={[1.5, 0.65]} />
      </mesh>
    </group>
  )
}

/**
 * La carriole de ramen : un comptoir de bois clair sur un coffre à bols, deux grandes roues, un menu à la craie, deux poteaux et
 * leur poutre où pendent des lanternes rouges et le noren, un réchaud pour le wok et un autre pour la marmite, deux bols fumants,
 * des condiments, trois tabourets. Le cuisinier est parti fumer.
 */
export function Yatai() {
  const top = YATAI.counter
  return (
    <group position={[YATAI.x, 0, YATAI.z]}>
      {/* le coffre, les poteaux d'angle, les roues */}
      <Part geo={rbox(2.1, 0.7, 0.9, 0.05)} m={K.wood} p={[0, 0.6, 0]} />
      {[-1.02, 1.02].flatMap((x) => [-0.42, 0.42].map((z) => <Part key={`${x}${z}`} geo={rbox(0.1, 0.78, 0.1, 0.03)} m={K.woodDark} p={[x, 0.62, z]} />))}
      {[0.38, 0.6, 0.82].map((y) => (
        <Part key={y} geo={rbox(2.1, 0.014, 0.012, 0.004)} m={K.woodDark} p={[0, y, 0.455]} castShadow={false} />
      ))}
      <Wheel position={[-0.88, 0.3, 0.52]} />
      <Wheel position={[0.88, 0.3, 0.52]} />
      {/* le menu à la craie, cloué sur la façade, et une porte coulissante de chaque côté */}
      <Part geo={rbox(0.62, 0.45, 0.04, 0.015)} m={K.woodDark} p={[0, 0.6, 0.47]} />
      <mesh material={K.menu} position={[0, 0.6, 0.495]}>
        <planeGeometry args={[0.56, 0.4]} />
      </mesh>
      {[-0.56, 0.56].map((x) => (
        <group key={x}>
          <Part geo={rbox(0.4, 0.42, 0.025, 0.012)} m={K.woodDark} p={[x * 1.0, 0.6, 0.462]} castShadow={false} />
          <Part geo={cyl(0.012, 0.012, 0.08, 6)} m={K.brass} p={[x + (x < 0 ? 0.12 : -0.12), 0.6, 0.485]} castShadow={false} />
        </group>
      ))}
      {/* le plateau du comptoir : bois clair, rebord crème */}
      <Part geo={rbox(2.3, 0.08, 1.1, 0.03)} m={K.woodPale} p={[0, top - 0.04, 0]} />
      <Part geo={rbox(2.32, 0.03, 0.04, 0.012)} m={K.cream} p={[0, top - 0.02, 0.55]} castShadow={false} />
      {/* les poteaux arrière et la poutre */}
      {[-1.12, 1.12].map((x) => (
        <Part key={x} geo={cyl(0.04, 0.045, 1.65, 10)} m={K.woodDark} p={[x, 1.78, -0.52]} />
      ))}
      <Part geo={rbox(2.5, 0.08, 0.08, 0.03)} m={K.woodDark} p={[0, 2.55, -0.52]} />
      <Part geo={rbox(2.3, 0.05, 0.05, 0.018)} m={K.woodDark} p={[0, 1.6, -0.52]} castShadow={false} />
      <Noren />
      {/* le réchaud à droite pour la marmite, celui de gauche pour le wok : plaques d'acier, boutons */}
      <Part geo={rbox(0.62, 0.04, 0.54, 0.015)} m={K.steelDark} p={[0.5, top + 0.02, -0.12]} castShadow={false} />
      <Part geo={rbox(0.62, 0.04, 0.54, 0.015)} m={K.steelDark} p={[-0.62, top + 0.02, -0.12]} castShadow={false} />
      {[-0.7, -0.54, 0.42, 0.58].map((x) => (
        <Part key={x} geo={cyl(0.022, 0.022, 0.04, 10)} m={K.red} p={[x, top - 0.09, 0.56]} rotation-x={Math.PI / 2} castShadow={false} />
      ))}
      <Chef position={[-0.95, 0, -0.78]} />
      <LuckyCat position={[1.1, top, -0.46]} />
      {/* la pile de paniers vapeur et la pile de bols propres, derrière la planche à découper */}
      <group position={[-0.1, top, -0.3]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, i * 0.075, 0]}>
            <Part geo={cyl(0.13, 0.13, 0.065, 18)} m={K.woodPale} p={[0, 0.035, 0]} />
            <Part geo={cyl(0.133, 0.133, 0.014, 18)} m={K.wood} p={[0, 0.0, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.14, 0.12, 0.03, 18)} m={K.wood} p={[0, 0.26, 0]} castShadow={false} />
        <Part geo={SPH} m={K.woodDark} scale={0.022} p={[0, 0.29, 0]} castShadow={false} />
        <Steam at={[0, 0.34, 0]} every={1.1} />
      </group>
      <group position={[0.2, top, -0.36]}>
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={cyl(0.1, 0.055, 0.05, 18)} m={K.bowl} p={[0, 0.03 + i * 0.04, 0]} castShadow={i === 3} />
        ))}
      </group>
      <Wok position={[-0.62, top + 0.04, -0.12]} />
      <Pot position={[0.5, top + 0.04, -0.12]} />
      {/* la planche à découper : oignons verts hachés, rondelles de chashu, un grand couteau */}
      <group position={[-0.02, top, 0.22]} rotation-y={0.1}>
        <Part geo={rbox(0.5, 0.035, 0.28, 0.012)} m={K.woodPale} p={[0, 0.0175, 0]} />
        {Array.from({ length: 9 }, (_, i) => (
          <Part key={i} geo={cyl(0.012, 0.012, 0.012, 6)} m={K.scallion} p={[-0.16 + (i % 5) * 0.025, 0.041, -0.05 + Math.floor(i / 5) * 0.03]} castShadow={false} />
        ))}
        {[0, 1, 2].map((i) => (
          <Part key={i} geo={cyl(0.035, 0.035, 0.01, 12)} m={K.pork} p={[0.1 + i * 0.02, 0.04 + i * 0.01, 0.02]} castShadow={false} />
        ))}
        <Part geo={rbox(0.22, 0.01, 0.045, 0.004)} m={K.steel} p={[0.1, 0.04, -0.08]} rotation-y={0.3} castShadow={false} />
        <Part geo={rbox(0.1, 0.02, 0.025, 0.008)} m={K.woodDark} p={[0.26, 0.045, -0.12]} rotation-y={0.3} castShadow={false} />
      </group>
      {/* deux bols servis devant les tabourets */}
      <Bowl position={[-0.6, top, 0.38]} rotation={0.4} />
      <Bowl position={[0.2, top, 0.38]} rotation={2.1} />
      {/* les condiments au bout du comptoir : sauce soja, piment, vinaigre, poivre, un pot de baguettes, une boîte de mouchoirs */}
      <group position={[1.0, top, 0.36]}>
        <Part geo={cyl(0.035, 0.035, 0.14, 12)} m={K.bowl} p={[-0.1, 0.07, 0]} />
        <Part geo={cyl(0.037, 0.037, 0.04, 12)} m={K.red} p={[-0.1, 0.16, 0]} castShadow={false} />
        <Part geo={cyl(0.03, 0.03, 0.1, 12)} m={K.redDark} p={[-0.02, 0.05, 0]} castShadow={false} />
        <Part geo={cyl(0.028, 0.028, 0.03, 12)} m={K.cream} p={[-0.02, 0.115, 0]} castShadow={false} />
        <Part geo={cyl(0.035, 0.03, 0.12, 12)} m={K.glass} p={[0.07, 0.06, 0.02]} castShadow={false} />
        <Part geo={cyl(0.045, 0.04, 0.1, 14)} m={K.teal} p={[0.17, 0.05, -0.02]} />
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={cyl(0.004, 0.004, 0.2, 4)} m={K.woodPale} p={[0.17 + (i - 1.5) * 0.008, 0.16, -0.02]} rotation={[(i - 1.5) * 0.06, 0, (i - 1.5) * 0.08]} castShadow={false} />
        ))}
      </group>
      <group position={[-1.0, top, 0.3]}>
        {/* la théière de fonte : ventre rond, couvercle à bouton, bec, anse, pied */}
        <Part geo={cyl(0.05, 0.055, 0.015, 16)} m={K.iron} p={[0, 0.0075, 0]} castShadow={false} />
        <Part geo={SPH} m={K.teal} scale={[0.082, 0.065, 0.082]} p={[0, 0.07, 0]} />
        <Part geo={cyl(0.04, 0.05, 0.02, 16)} m={K.iron} p={[0, 0.13, 0]} castShadow={false} />
        <Part geo={SPH} m={K.iron} scale={[0.016, 0.014, 0.016]} p={[0, 0.15, 0]} castShadow={false} />
        <Part geo={cyl(0.009, 0.02, 0.1, 8)} m={K.teal} p={[0.1, 0.1, 0]} rotation-z={-0.9} castShadow={false} />
        <Part m={K.iron} p={[-0.08, 0.08, 0]} castShadow={false}>
          <torusGeometry args={[0.045, 0.009, 6, 14, Math.PI * 1.1]} />
        </Part>
        {[0.13, 0.21].map((x, i) => (
          <group key={x} position={[x + 0.02, 0, i * 0.06 - 0.03]}>
            <Part geo={cyl(0.05, 0.05, 0.008, 14)} m={K.bowl} p={[0, 0.004, 0]} castShadow={false} />
            <Part geo={cyl(0.03, 0.022, 0.05, 12)} m={K.bowl} p={[0, 0.033, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* la bombonne de gaz, un seau et une caisse de bouteilles, au flanc de la carriole */}
      <group position={[1.4, 0, -0.35]}>
        <Part geo={cyl(0.13, 0.13, 0.5, 18)} m={K.redDark} p={[0, 0.25, 0]} />
        <Part geo={SPH} m={K.redDark} scale={[0.13, 0.08, 0.13]} p={[0, 0.5, 0]} castShadow={false} />
        <Part geo={cyl(0.03, 0.03, 0.06, 8)} m={K.brass} p={[0, 0.6, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.9, 6)} m={K.iron} p={[-0.5, 0.55, 0]} rotation-z={Math.PI / 2 + 0.15} castShadow={false} />
      </group>
      {/* les tabourets de ceux qui mangent */}
      {[-0.6, 0.2, 1.05].map((x) => (
        <Stool key={x} position={[x, 0, 1.12]} />
      ))}
      <Customer position={[-0.6, 0, 1.12]} coat={K.yellow} hair={K.iron} hood ph={0.5} />
      <Customer position={[0.2, 0, 1.12]} coat={K.teal} hair={K.woodDark} ph={2.7} />
      {/* les lanternes d'angle, accrochées à la poutre (celle du milieu est à part : c'est la lampe) */}
      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, 2.55, -0.3]}>
          <Part geo={cyl(0.006, 0.006, 0.25, 4)} m={K.iron} p={[0, -0.13, 0]} castShadow={false} />
          <Part geo={rbox(0.03, 0.03, 0.26, 0.01)} m={K.woodDark} p={[0, 0, 0.1]} castShadow={false} />
          <Part geo={SPH} m={K.lantern} scale={[0.15, 0.18, 0.15]} p={[0, -0.36, 0]} rotation-y={x < 0 ? 0.4 : -0.4} />
          <Part geo={cyl(0.07, 0.07, 0.025, 14)} m={K.lanternCap} p={[0, -0.18, 0]} castShadow={false} />
          <Part geo={cyl(0.07, 0.07, 0.025, 14)} m={K.lanternCap} p={[0, -0.54, 0]} castShadow={false} />
        </group>
      ))}
      <Lantern position={[0.5, 2.55, -0.3]} />
    </group>
  )
}
