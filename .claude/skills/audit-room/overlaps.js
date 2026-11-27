// Détecteur de chevauchements (audit-room, étape 1.6) : colle ce fichier dans evaluate_script, pièce affichée.
// Compare la boîte de chaque composant de la pièce avec celle des autres ; rend les 25 pires paires. Un composant sans `userData.id` est
// nommé par la couleur de son premier matériau. Une liste vide sur une pièce garnie : regarde le nombre de composants (`objs.length`).
async () => {
  const { scene } = window.__lofi.three(); const V = scene.position.constructor; scene.updateMatrixWorld(true)
  // La racine : le groupe de la pièce (le plus grand groupe sous la scène). On descend dans chaque conteneur (le <Static> et ses
  // originaux cachés, un groupe mis à l'échelle, un groupe de meubles) tant qu'il est plus large que 1,6 : ce qui reste est un objet.
  // L'ancienne racine (« le groupe qui a le plus de maillages ») tombait sur un morceau de décor dans la salle de bain et l'avion et
  // rendait une liste vide sans rien dire (2026-11-27).
  const room = scene.children.filter((c) => c.isGroup).sort((a, b) => b.children.length - a.children.length)[0]
  let first = null; scene.traverse((o) => { if (!first && o.isMesh && o.geometry) first = o }); first.geometry.computeBoundingBox(); const Box = first.geometry.boundingBox.constructor, objs = []
  const boxOf = (g) => {
    const box = new Box(); let n = 0
    g.traverse((m) => { if (!m.isMesh || !m.geometry || m.isInstancedMesh) return; const mat = m.material; if (mat && !Array.isArray(mat) && (mat.blending === 2 || (mat.transparent && mat.opacity < 0.9))) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld); const s = bb.getSize(new V()); if (Math.max(s.x, s.y, s.z) > 4) return; box.union(bb); n++ })
    return n ? box : null
  }
  const walk = (node, depth) => {
    for (const g of node.children) {
      if (g.isMesh || g.isSprite || g.isLight) continue
      const box = boxOf(g); if (!box) continue
      const s = box.getSize(new V())
      if (Math.max(s.x, s.z) > 1.6 && depth < 6) { walk(g, depth + 1); continue }
      if (Math.max(s.x, s.y, s.z) > 2.5 && Math.min(s.x, s.y, s.z) < 0.15) continue // les câbles et les tuyaux croisent tout : on les ignore
      const c = box.getCenter(new V()); if (Math.abs(c.x) > 3.6 || Math.abs(c.z) > 3.6) continue // le dehors n'est pas testé ici
      let col = null; g.traverse((m) => { if (!col && m.isMesh && m.material && m.material.color) col = '#' + m.material.color.getHexString() })
      objs.push({ id: g.userData.id || col, box, parent: node })
    }
  }
  walk(room, 0)
  const out = []
  for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
    if (objs[i].parent === objs[j].parent && objs[i].id === objs[j].id) continue // les morceaux d'un même objet (les feuilles d'une grande plante)
    const a = objs[i].box, b = objs[j].box
    const o = [Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y), Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z)]
    const gap = -Math.min(...o) // < 0 : ils se chevauchent ; entre 0 et 0,06 : ils se touchent
    const floor = a.min.y < 0.3 && b.min.y < 0.3 // deux objets posés au sol ne doivent ni se toucher ni se traverser
    if ((o.every((v) => v > 0.02)) || (floor && o[1] > 0 && gap < 0.06 && gap > -0.02)) out.push({ a: objs[i].id, b: objs[j].id, chevauche: o.map((v) => +v.toFixed(2)), ca: a.getCenter(new V()).toArray().map((v) => +v.toFixed(1)), cb: b.getCenter(new V()).toArray().map((v) => +v.toFixed(1)) })
  }
  return out.sort((p, q) => q.chevauche[0] * q.chevauche[1] * q.chevauche[2] - p.chevauche[0] * p.chevauche[1] * p.chevauche[2]).slice(0, 25)
}
