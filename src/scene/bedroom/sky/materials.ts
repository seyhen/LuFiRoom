import { Color, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { far, skin } from '../../materials'
import { farFoliage } from '../../nature/materials'

/** Les matériaux du décor du dehors (nuages, arc-en-ciel, jouets de ciel, îlot du village). Les couleurs qui suivent le jour sont réglées dans Surroundings.tsx. */
export const K = {
  /** Nuage : blanc rosé, la teinte du jour, de la nuit et de la pluie se règle à l'image. */
  cloud: far(0xffffff, { roughness: 0.72, clearcoat: 0.12, emissive: 0xfff3fb, emissiveIntensity: 0.22 }),
  rainbow: skin({ roughness: 0.6, clearcoat: 0.3, transparent: true, opacity: 0.9, emissive: 0xffffff, emissiveIntensity: 0.1 }),
  /** Peluches de ciel : un matériau par couleur de peluche (la couleur de la lune vient de ses sommets). */
  moon: skin({ roughness: 0.82, clearcoat: 0.08, emissive: 0xffffff, emissiveIntensity: 0.14 }),
  starButter: far(0xf6d071, { roughness: 0.82, clearcoat: 0.08, emissive: 0xf6d071, emissiveIntensity: 0.12 }),
  starPink: far(0xf6aec6, { roughness: 0.82, clearcoat: 0.08, emissive: 0xf6aec6, emissiveIntensity: 0.12 }),
  starMint: far(0x93dcc8, { roughness: 0.82, clearcoat: 0.08, emissive: 0x93dcc8, emissiveIntensity: 0.12 }),
  starLilac: far(0xc3b1ee, { roughness: 0.82, clearcoat: 0.08, emissive: 0xc3b1ee, emissiveIntensity: 0.12 }),
  balloonPink: far(0xf6aec6, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
  balloonMint: far(0x93dcc8, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
  balloonButter: far(0xf6d071, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
  thread: far(0xfff3e6, { roughness: 0.7, clearcoat: 0.1 }),
  // l'îlot du village : colline lilas, dessous crème, murs, toits ronds rose et menthe, fenêtres qui s'allument la nuit
  hill: far(0xcdb9ec, { roughness: 0.7, clearcoat: 0.25 }),
  under: far(0xe6dcf2, { roughness: 0.75, clearcoat: 0.15 }),
  wall: far(0xf6eaf1, { roughness: 0.6 }),
  roofRose: far(0xe59bb3),
  roofMint: far(0x8fc9c0),
  door: far(0xd48aa2),
  win: new MeshStandardMaterial({ color: 0xd8cfe8, emissive: 0xffd596, emissiveIntensity: 0, roughness: 0.5 }),
  leaf: farFoliage(0xa6d8b5),
  trunk: far(0xb38c8c),
  rain: new MeshBasicMaterial({ color: 0xdfe6ff, transparent: true, opacity: 0, depthWrite: false }),
}

export const CLOUD = {
  day: new Color(0xf0eaf6), night: new Color(0xaaa4e0), rain: new Color(0xc9c3de), storm: new Color(0x8d89a8),
  emDay: new Color(0xe6daf1), emNight: new Color(0x7a74c4),
}
