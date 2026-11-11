// Détecteur de faces superposées (le « ça clignote » : deux surfaces au même plan se disputent le pixel).
// À coller dans `evaluate_script` (ou `page.evaluate`) sur la page de développement, une fois la pièce affichée. Rend les cas par surface décroissante.
// La caméra ne voit que les faces +x, +y et +z : on ne compare que celles-là. Les boîtes sont alignées sur les axes du monde, donc une pièce
// inclinée (un pan de toit) donne un faux positif : regarde `A` et `B` avant de conclure. Les mailles fusionnées par <Static> sont ignorées
// (leurs originaux, cachés, sont encore dans la scène et se comparent entre eux).
() => {
  const { scene } = window.__lofi.three(); scene.updateMatrixWorld(true)
  const items = []
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || Array.isArray(o.material)) return
    const m = o.material; if (m.transparent || m.blending === 2 || m.depthWrite === false) return
    const g = o.geometry; if (!g.attributes?.position || (!g.index && g.attributes.position.count > 3000)) return
    if (!g.boundingBox) g.computeBoundingBox()
    const b = g.boundingBox.clone().applyMatrix4(o.matrixWorld)
    const s = b.getSize(b.min.clone()); if (Math.max(s.x, s.y, s.z) > 14) return // le sol, le ciel, les grands plans du dehors
    items.push({ o, b })
  })
  const AX = ['x', 'y', 'z'], T = 0.008, r2 = (x) => +x.toFixed(2), out = []
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i].b, b = items[j].b, A = items[i].o, B = items[j].o
    if (A.material === B.material && A.parent === B.parent) continue
    const ov = AX.map((k) => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]))
    for (let k = 0; k < 3; k++) {
      const n = ov[(k + 1) % 3] * ov[(k + 2) % 3]
      if (ov[(k + 1) % 3] < 0.05 || ov[(k + 2) % 3] < 0.05 || n < 0.15 || ov[k] < T) continue
      if (Math.abs(a.max[AX[k]] - b.max[AX[k]]) < T) out.push({ axe: AX[k], plan: r2(a.max[AX[k]]), surface: r2(n), A: [a.min.toArray().map(r2), a.max.toArray().map(r2)], B: [b.min.toArray().map(r2), b.max.toArray().map(r2)], couleurs: [A.material.color?.getHexString(), B.material.color?.getHexString()] })
    }
  }
  out.sort((p, q) => q.surface - p.surface)
  return { meshes: items.length, trouves: out.length, premiers: out.slice(0, 20) }
}
