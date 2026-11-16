// Ambiances et liens de partage (src/state/mixes.ts) : courbe des volumes, anciens liens, entrées abîmées.
import test from 'node:test'
import assert from 'node:assert/strict'
import { MIX_VERSION, loadLast, loadMixes, mixFromSearch, mixQuery, sliderOf, storeLast, storeMixes, MAX_SAVED } from '../src/state/mixes.ts'
import { roomById } from '../src/rooms/index.ts'

const reset = () => localStorage.clear()
const stationOf = (room) => roomById(room).stations[0]

test('sliderOf : inverse de la courbe au carré du moteur', () => {
  for (const a of [0, 0.01, 0.25, 0.49, 0.7, 1]) assert.ok(Math.abs(sliderOf(a) ** 2 - a) < 1e-12, `a=${a}`)
  assert.equal(sliderOf(0.25), 0.5)
  assert.equal(sliderOf(-1), 0)
  assert.equal(sliderOf(5), 1)
})

test('lien avec v=2 : les volumes sont des positions de curseur, lues telles quelles', () => {
  const m = mixFromSearch('?room=bedroom&mix=rain.49,fan.100&night=1&v=2')
  assert.equal(m.v, MIX_VERSION)
  assert.deepEqual(m.on, ['rain', 'fan'])
  assert.deepEqual(m.vol, { rain: 0.49, fan: 1 })
  assert.equal(m.night, true)
})

test('lien sans v : ancien lien en amplitude, converti en position de curseur (√)', () => {
  const m = mixFromSearch('?room=bedroom&mix=rain.49,fan.25')
  assert.equal(m.v, MIX_VERSION)
  assert.deepEqual(m.vol, { rain: 0.7, fan: 0.5 })
  assert.equal(m.night, false)
})

test('lien : v autre que 2 compte comme un ancien lien', () => {
  assert.deepEqual(mixFromSearch('?room=bedroom&mix=rain.25&v=1').vol, { rain: 0.5 })
})

test('lien : pièce inconnue, sans mix ou sans son connu : null', () => {
  assert.equal(mixFromSearch(''), null)
  assert.equal(mixFromSearch('?room=nulle&mix=rain.50'), null)
  assert.equal(mixFromSearch('?room=bedroom'), null)
  assert.equal(mixFromSearch('?room=bedroom&mix=fantome.50'), null)
  assert.equal(mixFromSearch('?room=bedroom&mix='), null)
})

test('lien : doublons, sons d\'une autre pièce, volumes hors bornes ou illisibles', () => {
  const m = mixFromSearch('?room=bedroom&mix=rain.999,rain.10,fire.50,fan.-5,noise.abc,purr&v=2')
  assert.deepEqual(m.on, ['rain', 'fan', 'noise', 'purr'])
  assert.equal(m.vol.rain, 1)
  assert.equal(m.vol.fan, 0)
  assert.ok(!('noise' in m.vol) && !('purr' in m.vol), 'volume illisible : pas de valeur (défaut du store)')
})

test('lien : au plus 12 sons lus', () => {
  const ids = roomById('bedroom').sounds.map((s) => s.id)
  const m = mixFromSearch(`?room=bedroom&mix=${ids.map((i) => i + '.50').join(',')}&v=2`)
  assert.ok(m.on.length <= 12)
})

test('lien : météo (ancien lien avec pluie = pluie ; valeur inconnue = pluie ; sans pluie, pas de météo)', () => {
  assert.equal(mixFromSearch('?room=bedroom&mix=rain.50&v=2').weather, 'rain')
  assert.equal(mixFromSearch('?room=bedroom&mix=rain.50&weather=snow&v=2').weather, 'snow')
  assert.equal(mixFromSearch('?room=bedroom&mix=rain.50&weather=meteorite&v=2').weather, 'rain')
  assert.equal(mixFromSearch('?room=bedroom&mix=fan.50&weather=snow&v=2').weather, undefined)
})

test('lien : station valide seulement si la pièce la propose', () => {
  const st = stationOf('bedroom')
  assert.equal(mixFromSearch(`?room=bedroom&mix=radio.50&station=${st}&v=2`).station, st)
  assert.equal(mixFromSearch('?room=bedroom&mix=radio.50&station=inconnue&v=2').station, undefined)
  const other = ['noel', 'minuit'].find((s) => !roomById('bedroom').stations.includes(s))
  assert.equal(mixFromSearch(`?room=bedroom&mix=radio.50&station=${other}&v=2`).station, undefined)
})

test('lien : noise et tilt (en %, borné, illisible = 0, ignoré si la carte est éteinte)', () => {
  const get = (q) => mixFromSearch(`?room=bedroom&v=2&${q}`)?.noise
  assert.deepEqual(get('mix=noise.50&noise=brown&tilt=-40'), { color: 'brown', tilt: -0.4 })
  assert.deepEqual(get('mix=noise.50&noise=green'), { color: 'green', tilt: 0 })
  assert.deepEqual(get('mix=noise.50&noise=white&tilt=500'), { color: 'white', tilt: 1 })
  assert.deepEqual(get('mix=noise.50&noise=white&tilt=-500'), { color: 'white', tilt: -1 })
  assert.deepEqual(get('mix=noise.50&noise=pink&tilt=abc'), { color: 'pink', tilt: 0 })
  assert.equal(get('mix=noise.50&noise=violet&tilt=10'), undefined)
  assert.equal(get('mix=noise.50'), undefined)
  assert.equal(get('mix=fan.50&noise=brown&tilt=10'), undefined)
})

test('aller-retour : mixQuery puis mixFromSearch redonne l\'ambiance', () => {
  const st = stationOf('bedroom')
  const mix = { v: MIX_VERSION, room: 'bedroom', on: ['radio', 'rain', 'noise'], vol: { radio: 0.35, rain: 0.8, noise: 0.5 }, night: true, station: st, weather: 'storm', noise: { color: 'brown', tilt: -0.25 } }
  const q = mixQuery(mix)
  assert.equal(q.get('v'), '2')
  assert.equal(q.get('night'), '1')
  assert.equal(q.get('tilt'), '-25')
  assert.deepEqual(mixFromSearch('?' + q), mix)
})

test('mixQuery : volume absent = 0,7 ; sans noise ni station, pas de paramètre en trop', () => {
  const q = mixQuery({ room: 'bedroom', on: ['fan'], vol: {}, night: false })
  assert.equal(q.get('mix'), 'fan.70')
  assert.equal(q.get('night'), '0')
  for (const k of ['noise', 'tilt', 'station', 'weather']) assert.equal(q.has(k), false, k)
})

test('loadMixes : stockage vide, JSON cassé, pas une liste : []', () => {
  reset()
  assert.deepEqual(loadMixes(), [])
  localStorage.setItem('chambre-lofi.mixes', '{pas du json')
  assert.deepEqual(loadMixes(), [])
  localStorage.setItem('chambre-lofi.mixes', '{"a":1}')
  assert.deepEqual(loadMixes(), [])
})

test('loadMixes : ignore les entrées abîmées, convertit les anciennes, nettoie le bruit', () => {
  reset()
  localStorage.setItem('chambre-lofi.mixes', JSON.stringify([
    null,
    { id: 'a', name: 'x' },
    { id: 'b', name: 'x', mix: { room: 'nulle', on: ['rain'], vol: {}, night: false } },
    { id: 'c', name: 'x', mix: { room: 'bedroom', on: 'rain', vol: {}, night: false } },
    { id: 'd', name: 'ancienne', mix: { room: 'bedroom', on: ['rain', 'fan'], vol: { rain: 0.49, fan: 'beaucoup', purr: null }, night: false, noise: { color: 'rouge', tilt: 3 } } },
    { id: 'e', name: 'récente', mix: { v: 2, room: 'bedroom', on: ['noise'], vol: { noise: 0.49 }, night: true, noise: { color: 'green', tilt: 9 } } },
  ]))
  const list = loadMixes()
  assert.deepEqual(list.map((x) => x.id), ['d', 'e'])
  assert.equal(list[0].mix.v, 2)
  assert.deepEqual(list[0].mix.vol, { rain: 0.7 })
  assert.equal('noise' in list[0].mix, false)
  assert.deepEqual(list[1].mix.vol, { noise: 0.49 })
  assert.deepEqual(list[1].mix.noise, { color: 'green', tilt: 1 })
})

test('storeMixes / loadMixes : garde au plus MAX_SAVED ambiances', () => {
  reset()
  const mk = (i) => ({ id: 'm' + i, name: 'n', mix: { v: 2, room: 'bedroom', on: ['rain'], vol: { rain: 0.5 }, night: false } })
  storeMixes(Array.from({ length: MAX_SAVED + 5 }, (_, i) => mk(i)))
  assert.equal(loadMixes().length, MAX_SAVED)
})

test('loadLast : retire les sons inconnus, null si plus rien ou pièce inconnue ou JSON cassé', () => {
  reset()
  assert.equal(loadLast(), null)
  storeLast({ v: 2, room: 'bedroom', on: ['rain', 'fire'], vol: { rain: 0.4 }, night: false })
  assert.deepEqual(loadLast().on, ['rain'])
  storeLast({ v: 2, room: 'bedroom', on: ['fire'], vol: {}, night: false })
  assert.equal(loadLast(), null)
  storeLast({ v: 2, room: 'nulle', on: ['rain'], vol: {}, night: false })
  assert.equal(loadLast(), null)
  localStorage.setItem('chambre-lofi.last', 'zzz')
  assert.equal(loadLast(), null)
})
