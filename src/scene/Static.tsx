import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Group, Matrix4, Mesh, type BufferGeometry, type Material, type Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { noRay } from './parts'

/** À mettre dans le `userData` d'un objet qui bouge : `<Static>` le laisse tel quel, lui et ses enfants. */
export const LIVE = { live: true }

const skip = (o: Object3D) => o.userData.live === true || o.userData.id !== undefined

/**
 * Fusionne, une fois montés, tous les maillages immobiles de ses enfants qui partagent un matériau : un appel de dessin
 * par matériau au lieu d'un par pièce (et autant de moins pour les ombres). Les originaux restent dans la scène, cachés.
 * Ce qui bouge (un objet interactif, `userData.id`, ou marqué `LIVE`) est laissé de côté, avec ses enfants ; les instances,
 * les sprites et les géométries non indexées aussi. Le groupe peut lui-même bouger : la fusion est faite dans son repère.
 */
export function Static({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null!)
  useLayoutEffect(() => {
    const g = root.current
    g.updateWorldMatrix(true, true)
    const inv = new Matrix4().copy(g.matrixWorld).invert(), rel = new Matrix4()
    const buckets = new Map<string, { material: Material; cast: boolean; receive: boolean; parts: Mesh[] }>()
    const visit = (o: Object3D) => {
      for (const c of o.children) {
        if (skip(c) || !c.visible) continue
        const m = c as Mesh
        if (m.isMesh && !(m as { isInstancedMesh?: boolean }).isInstancedMesh && !Array.isArray(m.material) && m.geometry.index && c.children.length === 0) {
          const key = `${m.material.uuid}|${m.castShadow}|${m.receiveShadow}`
          let b = buckets.get(key)
          if (!b) buckets.set(key, (b = { material: m.material, cast: m.castShadow, receive: m.receiveShadow, parts: [] }))
          b.parts.push(m)
        } else visit(c)
      }
    }
    visit(g)
    const merged: Mesh[] = []
    for (const b of buckets.values()) {
      if (b.parts.length < 2) continue
      const geos: BufferGeometry[] = b.parts.map((m) => {
        const geo = m.geometry.clone()
        geo.applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld))
        // mêmes attributs pour tout le monde : on ne garde que position, normale, uv
        for (const name of Object.keys(geo.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') geo.deleteAttribute(name)
        return geo
      })
      const geo = geos.every((x) => x.attributes.normal && x.attributes.uv) ? mergeGeometries(geos, false) : null
      geos.forEach((x) => x.dispose())
      if (!geo) continue
      const mesh = new Mesh(geo, b.material)
      mesh.castShadow = b.cast
      mesh.receiveShadow = b.receive
      g.add(mesh)
      merged.push(mesh)
      for (const m of b.parts) {
        m.visible = false
        m.raycast = noRay
      }
    }
    return () => {
      for (const m of merged) {
        g.remove(m)
        m.geometry.dispose()
      }
    }
  }, [])
  return <group ref={root}>{children}</group>
}
