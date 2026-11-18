// La courbe de la toile de la tente (src/scene/tent/profile.ts) : le mur droit, le toit qui se resserre sans trou, les points posés sur la toile.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { APEX, CENTER, HALF_ARC, LEN, LENGTHS, PROFILE, R0, V_WALL, WALL, onCanvas, radiusAt, tiltAt } from '../src/scene/tent/profile.ts'

test('le mur est droit puis le toit se resserre jusqu\'au sommet, sans trou', () => {
  assert.equal(radiusAt(0), R0)
  assert.equal(radiusAt(WALL), R0)
  assert.ok(radiusAt(APEX) < 0.1, 'le sommet est presque un point')
  let prev = R0
  for (let y = WALL; y <= APEX; y += 0.05) {
    const r = radiusAt(y)
    assert.ok(r <= prev + 1e-9, `le rayon ne grossit jamais (y = ${y.toFixed(2)})`)
    assert.ok(prev - r < 0.2, `pas de marche brusque (y = ${y.toFixed(2)})`)
    prev = r
  }
})

test('le profil suit radiusAt et sa longueur donne des V croissants de 0 à 1', () => {
  for (const [r, y] of PROFILE) assert.ok(Math.abs(r - radiusAt(y)) < 1e-9)
  assert.equal(LENGTHS[0], 0)
  for (let i = 1; i < LENGTHS.length; i++) assert.ok(LENGTHS[i] > LENGTHS[i - 1])
  assert.ok(Math.abs(LENGTHS[LENGTHS.length - 1] / LEN - 1) < 1e-12)
  assert.ok(V_WALL > 0 && V_WALL < 0.5)
})

test('un point posé sur la toile est à la bonne distance du mât, et rentré d\'autant qu\'on le demande', () => {
  for (const phi of [CENTER - 0.6, CENTER, CENTER + 1.2]) {
    for (const y of [0.4, 0.9, 1.6, 3.0]) {
      const [x, yy, z] = onCanvas(phi, y)
      assert.equal(yy, y)
      assert.ok(Math.abs(Math.hypot(x, z) - radiusAt(y)) < 1e-9)
      assert.ok(Math.abs(Math.hypot(...onCanvas(phi, y, 0.05).filter((_, i) => i !== 1)) - (radiusAt(y) - 0.05)) < 1e-9)
    }
  }
})

test('la toile couvre le fond (directions -x et -z), pas le devant', () => {
  const faces = (phi) => [Math.sin(phi), Math.cos(phi)]
  const [cx, cz] = faces(CENTER)
  assert.ok(cx < 0 && cz < 0, 'le centre de l\'arc regarde vers le fond')
  // les deux bords coupés sont de part et d'autre du plan qui passe par le mât, à peine devant lui
  for (const phi of [CENTER - HALF_ARC, CENTER + HALF_ARC]) {
    const [x, z] = faces(phi)
    assert.ok(x + z > -0.2 && x + z < 0.5, 'chaque bord est près du plan de coupe')
  }
})

test('l\'inclinaison est nulle sur le mur et croît vers le sommet', () => {
  assert.ok(Math.abs(tiltAt(0.6)) < 1e-9)
  assert.ok(tiltAt(2.0) > 0.3)
  assert.ok(tiltAt(4.0) > tiltAt(2.0) - 0.2)
})
