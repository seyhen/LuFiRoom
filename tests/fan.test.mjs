// Le ventilateur à trois vitesses (src/state/fan.ts) : nettoyage de la vitesse, cycle de l'objet, stockage, et sa place dans les
// ambiances et les liens de partage (src/state/mixes.ts : facultative, un lien sans elle reste valide).
import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_FAN, FAN_SPEEDS, FAN_SPIN, FAN_SPIN_CALM, cleanFan, fanTap, isFanSpeed, loadFan, storeFan } from '../src/state/fan.ts'
import { loadLast, loadMixes, mixFromSearch, mixQuery, storeLast, storeMixes } from '../src/state/mixes.ts'

const reset = () => localStorage.clear()

test('cleanFan : trois vitesses valides, tout le reste est ignoré', () => {
  for (const f of FAN_SPEEDS) assert.equal(cleanFan(f), f)
  for (const bad of ['', 'LOW', 'fast', 'medium', 2, null, undefined, {}, ['low']]) assert.equal(cleanFan(bad), undefined, String(bad))
  assert.ok(isFanSpeed('mid') && !isFanSpeed('mild'))
  assert.equal(DEFAULT_FAN, 'mid')
})

test('fanTap : éteint, il s’allume à sa vitesse ; allumé, il monte d’un cran ; après « Fort » il s’éteint et repart de « Faible »', () => {
  assert.deepEqual(fanTap(false, 'high'), { on: true, speed: 'high' })
  assert.deepEqual(fanTap(true, 'low'), { on: true, speed: 'mid' })
  assert.deepEqual(fanTap(true, 'mid'), { on: true, speed: 'high' })
  assert.deepEqual(fanTap(true, 'high'), { on: false, speed: 'low' })
  // un tour complet : éteint → faible → moyen → fort → éteint
  let st = { on: false, speed: 'low' }
  const seen = []
  for (let i = 0; i < 4; i++) {
    st = fanTap(st.on, st.speed)
    seen.push(st.on ? st.speed : 'off')
  }
  assert.deepEqual(seen, ['low', 'mid', 'high', 'off'])
})

test('rotation : lente < normale < vive, et plus calme encore avec prefers-reduced-motion', () => {
  assert.ok(FAN_SPIN.low < FAN_SPIN.mid && FAN_SPIN.mid < FAN_SPIN.high)
  assert.ok(FAN_SPIN_CALM.low < FAN_SPIN_CALM.mid && FAN_SPIN_CALM.mid < FAN_SPIN_CALM.high)
  for (const f of FAN_SPEEDS) assert.ok(FAN_SPIN_CALM[f] < FAN_SPIN[f], f)
  // au plus 0,8 rad par image à 60 i/s, sinon les pales à quatre branches semblent tourner à l'envers
  assert.ok(FAN_SPIN.high / 60 < Math.PI / 4)
})

test('stockage : la vitesse se retient (chambre-lofi.fan), un stockage abîmé redonne la vitesse moyenne', () => {
  reset()
  assert.equal(loadFan(), 'mid')
  storeFan('high')
  assert.equal(localStorage.getItem('chambre-lofi.fan'), '"high"')
  assert.equal(loadFan(), 'high')
  localStorage.setItem('chambre-lofi.fan', '"turbo"')
  assert.equal(loadFan(), 'mid')
  localStorage.setItem('chambre-lofi.fan', '{pas du json')
  assert.equal(loadFan(), 'mid')
  reset()
})

const base = { v: 2, room: 'bedroom', on: ['fan', 'rain'], vol: { fan: 0.5, rain: 0.6 }, night: false }

test('lien : la vitesse voyage (&fan=low), sans elle le lien reste valide', () => {
  assert.equal(mixQuery({ ...base, fan: 'low' }).get('fan'), 'low')
  assert.equal(mixQuery(base).has('fan'), false)
  assert.equal(mixFromSearch('?room=bedroom&mix=fan.50,rain.60&v=2&fan=high').fan, 'high')
  const sans = mixFromSearch('?room=bedroom&mix=fan.50,rain.60&v=2')
  assert.deepEqual(sans.on, ['fan', 'rain'])
  assert.equal('fan' in sans, false)
})

test('lien : une vitesse inconnue est ignorée, et ne compte que si le ventilateur joue', () => {
  const bad = mixFromSearch('?room=bedroom&mix=fan.50&v=2&fan=turbo')
  assert.deepEqual(bad.on, ['fan'])
  assert.equal('fan' in bad, false)
  assert.equal('fan' in mixFromSearch('?room=bedroom&mix=rain.50&v=2&fan=low'), false)
})

test('aller-retour : la vitesse passe par le lien sans changer', () => {
  for (const fan of FAN_SPEEDS) {
    const q = mixQuery({ ...base, fan })
    assert.equal(mixFromSearch(`?${q}`).fan, fan)
  }
})

test('ambiances enregistrées : une vitesse valide est gardée, une vitesse abîmée est retirée, une ancienne ambiance reste valide', () => {
  reset()
  storeMixes([
    { id: 'a', name: 'A', mix: { ...base, fan: 'high' } },
    { id: 'b', name: 'B', mix: { ...base, fan: 'turbo' } },
    { id: 'c', name: 'C', mix: base },
  ])
  const [a, b, c] = loadMixes()
  assert.equal(a.mix.fan, 'high')
  assert.equal('fan' in b.mix, false)
  assert.equal('fan' in c.mix, false)
  storeLast({ ...base, fan: 'low' })
  assert.equal(loadLast().fan, 'low')
  storeLast({ ...base, fan: 42 })
  assert.equal('fan' in loadLast(), false)
  reset()
})
