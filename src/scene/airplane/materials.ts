import { AdditiveBlending, DoubleSide, MeshBasicMaterial, PlaneGeometry, RepeatWrapping } from 'three'
import { M, gummy, skin } from '../materials'
import { blanketTex, carpetTex, cartTex, coverTex, curtainTex, doorTex, binTex, fadeTex, lavTex, mapTex, maskTex, posterTex, runnerTex, seatTex, signTex, tagTex, trayTex, wallTex, celloPlate } from './textures'

const wall = wallTex.clone()
wall.repeat.set(1 / 2.4, 1 / 4.35)
wall.offset.set(2.9 / 2.4, 0.05 / 4.35)
const carpet = carpetTex.clone()
carpet.repeat.set(6.42 / 0.6, 6.42 / 0.6)
const runner = runnerTex.clone()
runner.repeat.set(6.4 / 0.6, 1.3 / 0.6)
wall.wrapS = wall.wrapT = RepeatWrapping
const bin = binTex.clone()
bin.wrapS = bin.wrapT = RepeatWrapping

/** Un plan dont les UV suivent le monde (u en mètres sur 2,4, v de 0 à 1 sur la hauteur) : la face des coffres garde ses portes de 1,2 partout. */
export function facePlane(w: number, h: number, x0: number) {
  const g = new PlaneGeometry(w, h), uv = g.attributes.uv, p = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + p.getX(i) + w / 2) / 2.4, p.getY(i) / h + 0.5)
  return g
}

/**
 * La cabine : plastique ivoire des panneaux, bleu nuit des sièges et du soubassement, aluminium brossé, laiton doux des détails,
 * housses de coton ivoire, un polaire lilas, un masque rose, un menthe pour l'oreiller de voyage. Les lumières qui comptent le soir :
 * la lecture (ambre), les bandeaux de la cabine (indigo), les pastilles du couloir et les écriteaux.
 */
export const A = {
  // la coque
  slab: gummy(0x39435f, { roughness: 0.7, clearcoat: 0.08 }),
  slabTrim: gummy(0xcfd5e2, { roughness: 0.45, clearcoat: 0.3 }),
  wall: gummy(0xffffff, { map: wall, roughness: 0.82, clearcoat: 0.08 }),
  reveal: gummy(0xe9e4d8, { roughness: 0.5, clearcoat: 0.35 }),
  carpet: gummy(0xffffff, { map: carpet, roughness: 0.95, clearcoat: 0 }),
  runner: gummy(0xffffff, { map: runner, roughness: 0.95, clearcoat: 0 }),
  aluminium: gummy(0xcbd1da, { roughness: 0.3, metalness: 0.55, clearcoat: 0.6 }),
  steel: gummy(0xdde2e8, { roughness: 0.22, metalness: 0.6, clearcoat: 0.8 }),
  brass: M.brass,
  // les coffres, les panneaux de service
  bin: gummy(0xffffff, { map: bin, roughness: 0.55, clearcoat: 0.35 }),
  binPlain: gummy(0xe6e1d6, { roughness: 0.55, clearcoat: 0.35 }),
  binDark: gummy(0xa9a395, { roughness: 0.6, clearcoat: 0.2 }),
  psu: gummy(0xdedad0, { roughness: 0.5, clearcoat: 0.45 }),
  lens: gummy(0xfff4dc, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc878, emissiveIntensity: 0.08 }),
  nozzle: gummy(0x8f8a7c, { roughness: 0.35, clearcoat: 0.6 }),
  button: gummy(0x4d6ad0, { roughness: 0.35, clearcoat: 0.7, emissive: 0x4d6ad0, emissiveIntensity: 0.15 }),
  // le bandeau de lumière indirecte et ses halos (la couleur et l'intensité suivent le jour et la nuit : Cove.tsx)
  led: new MeshBasicMaterial({ color: 0xfff0d8 }),
  ledGlow: new MeshBasicMaterial({ map: fadeTex(), color: 0xfff0d8, transparent: true, opacity: 0.2, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
  // les sièges
  seat: gummy(0xffffff, { map: seatTex, roughness: 0.82, clearcoat: 0.06 }),
  seatLeather: gummy(0x3a4570, { roughness: 0.55, clearcoat: 0.4 }),
  seatDark: gummy(0x2a3354, { roughness: 0.6, clearcoat: 0.3 }),
  cover: gummy(0xffffff, { map: coverTex, roughness: 0.9, clearcoat: 0 }),
  coverPlain: gummy(0xf0ecdf, { roughness: 0.9, clearcoat: 0 }),
  belt: gummy(0x9aa3b4, { roughness: 0.85, clearcoat: 0 }),
  buckle: gummy(0xdfe4ea, { roughness: 0.2, metalness: 0.6, clearcoat: 0.9 }),
  // les écriteaux
  exit: new MeshBasicMaterial({ map: signTex(0) }),
  beltSign: new MeshBasicMaterial({ map: signTex(1) }),
  vacant: new MeshBasicMaterial({ map: signTex(2) }),
  noSmoke: new MeshBasicMaterial({ map: signTex(3) }),
  // la cloison arrière, le chariot, les portes
  curtain: gummy(0xffffff, { map: curtainTex, roughness: 0.92, clearcoat: 0, side: DoubleSide }),
  lavDoor: gummy(0xffffff, { map: lavTex, roughness: 0.5, clearcoat: 0.4 }),
  door: gummy(0xffffff, { map: doorTex, roughness: 0.5, clearcoat: 0.4 }),
  cartFace: gummy(0xffffff, { map: cartTex, roughness: 0.35, metalness: 0.2, clearcoat: 0.5 }),
  cartTop: gummy(0xb9bfc9, { roughness: 0.3, metalness: 0.5, clearcoat: 0.6 }),
  rubber: gummy(0x2b2d36, { roughness: 0.8, clearcoat: 0.05 }),
  poster: gummy(0xffffff, { map: posterTex, roughness: 0.6, clearcoat: 0.3 }),
  frame: gummy(0x31407c, { roughness: 0.45, clearcoat: 0.5 }),
  // le hublot
  glass: gummy(0xcfe4ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.14, depthWrite: false, side: DoubleSide }),
  shade: gummy(0xf0ecdf, { roughness: 0.5, clearcoat: 0.4 }),
  // la table, le plateau, la tablette
  table: gummy(0xdad6cc, { roughness: 0.45, clearcoat: 0.5 }),
  tableEdge: gummy(0x8f98ad, { roughness: 0.4, clearcoat: 0.5 }),
  tray: gummy(0xffffff, { map: trayTex, roughness: 0.5, clearcoat: 0.5 }),
  foil: gummy(0xdde1e6, { roughness: 0.28, metalness: 0.5, clearcoat: 0.7 }),
  foilDark: gummy(0xb7bcc4, { roughness: 0.4, metalness: 0.4, clearcoat: 0.5 }),
  bread: gummy(0xd7a15a, { roughness: 0.75, clearcoat: 0.15 }),
  butter: gummy(0xf7e49a, { roughness: 0.4, clearcoat: 0.5 }),
  salad: gummy(0x8fcf8a, { roughness: 0.55, clearcoat: 0.3 }),
  tomato: gummy(0xe8604a, { roughness: 0.35, clearcoat: 0.6 }),
  pudding: gummy(0xf3d9a8, { roughness: 0.5, clearcoat: 0.4 }),
  cream: gummy(0xfff6ec, { roughness: 0.5, clearcoat: 0.3 }),
  plastic: gummy(0xe8f0f6, { roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.4, depthWrite: false }),
  ceramic: gummy(0xfdf8f2, { roughness: 0.2, clearcoat: 0.9 }),
  tea: gummy(0xb86a2c, { roughness: 0.15, clearcoat: 1 }),
  napkin: gummy(0xf6f2e6, { roughness: 0.92, clearcoat: 0 }),
  bottle: gummy(0xbfe0f4, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
  tablet: gummy(0x20243a, { roughness: 0.3, clearcoat: 0.8 }),
  folio: gummy(0x7a63c0, { roughness: 0.6, clearcoat: 0.3 }),
  screen: new MeshBasicMaterial({ map: mapTex }),
  planeIcon: new MeshBasicMaterial({ color: 0xfff4d8 }),
  // la musique : un casque lilas et crème
  cup: gummy(0xb8a4e6, { roughness: 0.35, clearcoat: 0.7, emissive: 0xb8a4e6, emissiveIntensity: 0.05 }),
  cushion: gummy(0xf0e6d8, { roughness: 0.8, clearcoat: 0.1 }),
  band: gummy(0x8f7ad2, { roughness: 0.4, clearcoat: 0.6 }),
  cord: gummy(0xeae4f4, { roughness: 0.8, clearcoat: 0.1 }),
  // le couchage
  blanket: gummy(0xffffff, { map: blanketTex, roughness: 0.96, clearcoat: 0, side: DoubleSide }),
  blanketPlain: gummy(0xb4a4dc, { roughness: 0.96, clearcoat: 0 }),
  pillow: gummy(0x9fdcc6, { roughness: 0.92, clearcoat: 0 }),
  pillowBag: gummy(0xf4f8fb, { roughness: 0.2, clearcoat: 0.9, transparent: true, opacity: 0.72, depthWrite: false }),
  mask: gummy(0xffffff, { map: maskTex, roughness: 0.5, clearcoat: 0.3 }),
  maskBand: gummy(0xe9a5bd, { roughness: 0.85, clearcoat: 0 }),
  person: skin({ roughness: 0.62, clearcoat: 0.18 }),
  hoodie: gummy(0xe6996a, { roughness: 0.92, clearcoat: 0 }),
  hair: gummy(0x3a2a2c, { roughness: 0.7, clearcoat: 0.3 }),
  sock: gummy(0xf08a78, { roughness: 0.95, clearcoat: 0 }),
  slipper: gummy(0xf3ecde, { roughness: 0.95, clearcoat: 0 }),
  // les bagages et le livre
  suitcase: gummy(0xf09a86, { roughness: 0.3, clearcoat: 0.8 }),
  suitcaseRib: gummy(0xe0826e, { roughness: 0.3, clearcoat: 0.6 }),
  duffel: gummy(0x6f8fd0, { roughness: 0.85, clearcoat: 0.05 }),
  pouch: gummy(0xf4d27c, { roughness: 0.8, clearcoat: 0.1 }),
  book: gummy(0x4a8f86, { roughness: 0.7, clearcoat: 0.3 }),
  pages: gummy(0xf4ecdc, { roughness: 0.9, clearcoat: 0 }),
  tag: new MeshBasicMaterial({ map: tagTex }),
  // le violoncelle
  varnish: gummy(0xa4501e, { roughness: 0.28, clearcoat: 0.95, emissive: 0x6a2a0c, emissiveIntensity: 0.1 }),
  plate: gummy(0xffffff, { map: celloPlate, roughness: 0.28, clearcoat: 0.95, emissive: 0x6a2a0c, emissiveIntensity: 0.1 }),
  ebony: gummy(0x211a1c, { roughness: 0.35, clearcoat: 0.8 }),
  string: gummy(0xe6dcc0, { roughness: 0.3, metalness: 0.6, clearcoat: 0.5, emissive: 0xffe2a0, emissiveIntensity: 0 }),
  maple: gummy(0xe0b074, { roughness: 0.4, clearcoat: 0.7 }),
  strap: gummy(0x6a74a0, { roughness: 0.85, clearcoat: 0 }),
  // les lumières et les halos
  beam: new MeshBasicMaterial({ map: fadeTex(), color: 0xffd9a0, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
  floorLight: new MeshBasicMaterial({ color: 0xcfe0ff }),
  plainWhite: gummy(0xf4f1ea, { roughness: 0.5, clearcoat: 0.4 }),
}
