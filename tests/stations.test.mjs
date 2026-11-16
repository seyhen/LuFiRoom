// Aides de src/audio/stations.ts. La théorie musicale (accords, notes, rythmes) est vérifiée par scripts/check-stations.mjs.
import test from 'node:test'
import assert from 'node:assert/strict'
import { STATIONS, stationAfter, stationById, stationIds } from '../src/audio/stations.ts'
import { rooms } from '../src/rooms/index.ts'

test('stationById : repli sur la première station pour un id inconnu', () => {
  assert.equal(stationById('nope'), STATIONS[0])
  assert.equal(stationById(STATIONS[2].id), STATIONS[2])
})

test('stationAfter : tourne dans les deux sens, sur toutes ou sur la liste de la pièce', () => {
  const last = STATIONS.length - 1
  assert.equal(stationAfter(STATIONS[0].id).id, STATIONS[1].id)
  assert.equal(stationAfter(STATIONS[last].id).id, STATIONS[0].id)
  assert.equal(stationAfter(STATIONS[0].id, -1).id, STATIONS[last].id)
  const ids = [STATIONS[3].id, STATIONS[1].id, STATIONS[5].id]
  assert.equal(stationAfter(ids[0], 1, ids).id, ids[1])
  assert.equal(stationAfter(ids[2], 1, ids).id, ids[0])
  assert.equal(stationAfter(ids[0], -1, ids).id, ids[2])
  // Station d'une autre pièce : la suivante est la première, la précédente la dernière.
  const out = STATIONS.find((s) => !ids.includes(s.id)).id
  assert.equal(stationAfter(out, 1, ids).id, ids[0])
  assert.equal(stationAfter(out, -1, ids).id, ids[2])
})

test('stationIds : toutes par défaut ; les ids d\'une pièce existent tous', () => {
  assert.deepEqual(stationIds(), STATIONS.map((s) => s.id))
  assert.deepEqual(stationIds([]), STATIONS.map((s) => s.id))
  const known = new Set(STATIONS.map((s) => s.id))
  for (const r of rooms) for (const id of r.stations ?? []) assert.ok(known.has(id), `${r.id} : station ${id} inconnue`)
})
