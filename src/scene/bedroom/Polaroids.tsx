import { B } from './materials'

/** Un fil de polaroïds au mur de gauche, sous les guirlandes lumineuses : sept photos de travers, tenues par des pinces en bois. */
export function Polaroids() {
  return (
    <mesh position={[-2.985, 2.9, 1.75]} rotation-y={Math.PI / 2} material={B.polaroids} receiveShadow>
      <planeGeometry args={[2.8, 0.7]} />
    </mesh>
  )
}
