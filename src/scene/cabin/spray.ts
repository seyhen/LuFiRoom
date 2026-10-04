import { SphereGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

// [inclinaison, rotation autour de l'axe, longueur] : une aiguille au centre et quatre autour, en éventail.
const NEEDLES: [number, number, number][] = [[0, 0, 1], [0.46, 0, 0.82], [0.46, 1.57, 0.78], [0.46, 3.14, 0.84], [0.46, 4.71, 0.8]]

/**
 * Un rameau de sapin : cinq aiguilles épaisses aux bouts arrondis (style gummy, rien de pointu) qui partent du même point
 * le long de +x. Longueur 1, base à l'origine. À mettre à l'échelle, orienter et teinter dans un `Batch` : les guirlandes,
 * la couronne et les branches du sapin sont faites de rameaux, plus de boules.
 */
export const spray = mergeGeometries(
  NEEDLES.map(([tilt, roll, len]) => {
    const g = new SphereGeometry(1, 6, 4)
    g.scale(len / 2, 0.13, 0.13)
    g.translate(len / 2, 0, 0)
    g.rotateZ(tilt)
    g.rotateX(roll)
    return g
  }),
)!
