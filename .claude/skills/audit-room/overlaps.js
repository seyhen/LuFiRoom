// Détecteur de chevauchements (audit-room, étape 1.6) : colle ce fichier dans evaluate_script, pièce affichée.
// Compare la boîte de chaque composant de la pièce avec celle des autres ; rend les 25 pires paires.
async () => {
  const { scene } = window.__lofi.three(); const V = scene.position.constructor; scene.updateMatrixWorld(true)
  let best = null; scene.traverse((o) => { if (o.isGroup) { const n = o.children.filter((c) => c.isMesh && c.visible).length; if (!best || n > best.n) best = { o, n } } })
  // la racine des composants : sous un <Static> unique ou un groupe mis à l'échelle (l'igloo), on descend tant qu'il n'y a qu'un groupe
  let root = best.o; for (;;) { const gs = root.children.filter((c) => !c.isMesh && !c.isSprite && !c.isLight); if (gs.length !== 1) break; root = gs[0] }
  let first = null; scene.traverse((o) => { if (!first && o.isMesh && o.geometry) first = o }); first.geometry.computeBoundingBox(); const Box = first.geometry.boundingBox.constructor, objs = []
  for (const g of root.children) {
    if (g.isMesh || g.isSprite || g.isLight) continue
    const box = new Box(); let n = 0
    g.traverse((m) => { if (!m.isMesh || !m.geometry) return; const mat = m.material; if (mat && (mat.blending === 2 || (mat.transparent && mat.opacity < 0.9))) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld); const s = bb.getSize(new V()); if (Math.max(s.x, s.y, s.z) > 4) return; box.union(bb); n++ })
    const s = box.getSize(new V()); if (!n || box.isEmpty() || (Math.max(s.x, s.y, s.z) > 2.5 && Math.min(s.x, s.y, s.z) < 0.15)) continue // les câbles et les tuyaux croisent tout : on les ignore
    objs.push({ id: g.userData.id || '#' + root.children.indexOf(g), box })
  }
  const out = []
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    const a = objs[i].box, b = objs[j].box
    const o = [Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y), Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z)]
    const gap = -Math.min(...o) // < 0 : ils se chevauchent ; entre 0 et 0,06 : ils se touchent
    const floor = a.min.y < 0.3 && b.min.y < 0.3 // deux objets posés au sol ne doivent ni se toucher ni se traverser
    if ((o.every((v) => v > 0.02)) || (floor && o[1] > 0 && gap < 0.06 && gap > -0.02)) out.push({ a: objs[i].id, b: objs[j].id, chevauche: o.map((v) => +v.toFixed(2)), ca: a.getCenter(new V()).toArray().map((v) => +v.toFixed(1)), cb: b.getCenter(new V()).toArray().map((v) => +v.toFixed(1)) })
  }
  return out.sort((p, q) => q.chevauche[0] * q.chevauche[1] * q.chevauche[2] - p.chevauche[0] * p.chevauche[1] * p.chevauche[2]).slice(0, 25)
}
