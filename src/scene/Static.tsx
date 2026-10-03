import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Group, Matrix4, Mesh, type BufferGeometry, type InstancedMesh, type Material, type Object3D } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { noRay } from './parts'

/** À mettre dans le `userData` d'un objet qui bouge : `<Static>` le laisse tel quel, lui et ses enfants. */
export const LIVE = { live: true }

const skip = (o: Object3D) => o.userData.live === true || o.userData.id !== undefined

interface Bucket {
  m: Material
  cast: boolean
  recv: boolean
  geos: BufferGeometry[]
  members: { mesh: Mesh; raycast: Mesh['raycast'] }[]
}

/**
 * Regroupe le décor immobile : tous les maillages d'un même matériau (et des mêmes ombres) deviennent un seul maillage, donc un seul
 * tracé au lieu de dizaines (et autant en moins dans le calcul des ombres). Les originaux restent dans la scène, cachés.
 * Ce qui bouge est laissé de côté avec ses enfants : un objet interactif (`userData.id`) ou ce qui est marqué `userData={LIVE}`.
 * Les maillages instanciés, transparents ou à plusieurs matériaux restent tels quels. Le décor regroupé ne capte pas les taps
 * (ni le survol) : le rayon le traverse, ce qui évite aussi de tester des dizaines de milliers de triangles à chaque mouvement.
 * Le groupe peut lui-même bouger (un objet qui rebondit) : la fusion est faite dans son repère.
 */
export function Static({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null!)
  useLayoutEffect(() => {
    const root = ref.current
    root.updateWorldMatrix(true, true)
    const inv = new Matrix4().copy(root.matrixWorld).invert()
    const buckets = new Map<string, Bucket>()
    const merged: Mesh[] = []
    const hidden: { mesh: Mesh; raycast: Mesh['raycast'] }[] = []
    const visit = (o: Object3D) => {
      for (const c of o.children) {
        if (skip(c) || !c.visible) continue
        const mesh = c as Mesh
        if (mesh.isMesh && !(mesh as unknown as InstancedMesh).isInstancedMesh && !Array.isArray(mesh.material) && !mesh.material.transparent) {
          const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()
          for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name)
          if (!g.attributes.normal || !g.attributes.uv) g.dispose()
          else {
            g.applyMatrix4(new Matrix4().multiplyMatrices(inv, mesh.matrixWorld))
            const key = `${mesh.material.uuid}|${+mesh.castShadow}|${+mesh.receiveShadow}`
            let b = buckets.get(key)
            if (!b) buckets.set(key, (b = { m: mesh.material, cast: mesh.castShadow, recv: mesh.receiveShadow, geos: [], members: [] }))
            b.geos.push(g)
            b.members.push({ mesh, raycast: mesh.raycast })
          }
        }
        visit(c)
      }
    }
    visit(root)
    for (const { m, cast, recv, geos, members } of buckets.values()) {
      if (geos.length < 2) {
        geos.forEach((g) => g.dispose())
        continue
      }
      const geo = mergeGeometries(geos, false)
      geos.forEach((g) => g.dispose())
      if (!geo) continue // fusion impossible : ces maillages restent visibles tels quels
      hidden.push(...members)
      const out = new Mesh(geo, m)
      out.castShadow = cast
      out.receiveShadow = recv
      out.raycast = noRay
      root.add(out)
      merged.push(out)
    }
    hidden.forEach((h) => {
      h.mesh.visible = false
      h.mesh.raycast = noRay // les originaux cachés ne sont plus testés non plus
    })
    return () => {
      hidden.forEach((h) => {
        h.mesh.visible = true
        h.mesh.raycast = h.raycast
      })
      merged.forEach((out) => {
        root.remove(out)
        out.geometry.dispose()
      })
    }
  }, [])
  return <group ref={ref}>{children}</group>
}
