// Bruit, météo, jour / nuit (src/state/noise.ts, weather.ts, daylight.ts).
import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_NOISE, NOISE_COLORS, NOISE_NAMES, clampTilt, cleanNoise, isNoiseColor, loadNoise, storeNoise } from '../src/state/noise.ts'
import { SKY_NAMES, WEATHER_KINDS, isWeather, skyOf, snowOf, wetOf } from '../src/state/weather.ts'
import { DAY_FROM, NIGHT_FROM, clockNight, holdFor, nextTurn } from '../src/state/daylight.ts'

test('noise : clampTilt borne à [-1, 1], arrondit au centième, NaN = 0', () => {
  assert.equal(clampTilt(0.123456), 0.12)
  assert.equal(clampTilt(7), 1)
  assert.equal(clampTilt(-7), -1)
  assert.equal(clampTilt(NaN), 0)
  assert.equal(clampTilt(Infinity), 0)
})

test('noise : cleanNoise (stockage ou lien)', () => {
  assert.deepEqual(cleanNoise({ color: 'brown', tilt: 0.5 }), { color: 'brown', tilt: 0.5 })
  assert.deepEqual(cleanNoise({ color: 'white' }), { color: 'white', tilt: 0 })
  assert.deepEqual(cleanNoise({ color: 'green', tilt: 'x' }), { color: 'green', tilt: 0 })
  assert.deepEqual(cleanNoise({ color: 'pink', tilt: -42 }), { color: 'pink', tilt: -1 })
  for (const bad of [null, undefined, 0, 'pink', [], {}, { color: 'rouge' }, { color: null }, { tilt: 1 }]) assert.equal(cleanNoise(bad), undefined, JSON.stringify(bad))
})

test('noise : les quatre couleurs ont un nom, isNoiseColor refuse le reste', () => {
  for (const c of NOISE_COLORS) assert.ok(isNoiseColor(c) && NOISE_NAMES[c])
  assert.equal(isNoiseColor('rose'), false)
  assert.equal(isNoiseColor(undefined), false)
})

test('noise : loadNoise / storeNoise, défaut si abîmé', () => {
  localStorage.clear()
  assert.deepEqual(loadNoise(), DEFAULT_NOISE)
  storeNoise({ color: 'brown', tilt: -0.3 })
  assert.deepEqual(loadNoise(), { color: 'brown', tilt: -0.3 })
  localStorage.setItem('chambre-lofi.noise', '{cassé')
  assert.deepEqual(loadNoise(), DEFAULT_NOISE)
  localStorage.setItem('chambre-lofi.noise', '{"color":"nope"}')
  assert.deepEqual(loadNoise(), DEFAULT_NOISE)
})

test('météo : isWeather, « clear » n\'en est pas une ; chaque ciel a un nom', () => {
  for (const k of WEATHER_KINDS) assert.ok(isWeather(k))
  for (const bad of ['clear', 'fog', '', null, undefined, 3]) assert.equal(isWeather(bad), false)
  for (const k of [...WEATHER_KINDS, 'clear']) assert.ok(SKY_NAMES[k])
})

test('météo : skyOf suit la carte « Météo » ; wetOf et snowOf', () => {
  assert.equal(skyOf({ on: { rain: true }, weather: 'snow' }), 'snow')
  assert.equal(skyOf({ on: { rain: false }, weather: 'snow' }), 'clear')
  assert.deepEqual(['clear', 'drizzle', 'rain', 'storm', 'snow', 'blizzard'].map(wetOf), [0, 0.55, 1, 1, 0, 0])
  assert.deepEqual(['clear', 'drizzle', 'rain', 'storm', 'snow', 'blizzard'].map(snowOf), [0, 0, 0, 0, 0.7, 1])
})

const at = (h, m = 0, d = 15) => new Date(2026, 0, d, h, m, 30)

test('jour / nuit : nuit de 20 h à 7 h (heure locale)', () => {
  assert.equal(NIGHT_FROM, 20)
  assert.equal(DAY_FROM, 7)
  const r = [0, 6, 7, 12, 19, 20, 23].map((h) => clockNight(at(h)))
  assert.deepEqual(r, [true, true, false, false, false, true, true])
  assert.equal(clockNight(at(6, 59)), true)
  assert.equal(clockNight(at(19, 59)), false)
})

test('jour / nuit : nextTurn donne 7 h ou 20 h, toujours dans le futur', () => {
  assert.deepEqual(new Date(nextTurn(at(3))), new Date(2026, 0, 15, 7))
  assert.deepEqual(new Date(nextTurn(at(7))), new Date(2026, 0, 15, 20))
  assert.deepEqual(new Date(nextTurn(at(12))), new Date(2026, 0, 15, 20))
  assert.deepEqual(new Date(nextTurn(at(20))), new Date(2026, 0, 16, 7))
  assert.deepEqual(new Date(nextTurn(at(23, 59))), new Date(2026, 0, 16, 7))
  for (let h = 0; h < 24; h++) assert.ok(nextTurn(at(h)) > at(h).getTime())
})

test('jour / nuit : la main (holdFor) tient contre l\'horloge, jamais avec elle', () => {
  assert.equal(holdFor(true, at(12)), new Date(2026, 0, 15, 20).getTime())
  assert.equal(holdFor(false, at(12)), null)
  assert.equal(holdFor(false, at(23)), new Date(2026, 0, 16, 7).getTime())
  assert.equal(holdFor(true, at(23)), null)
  assert.equal(holdFor(false, at(3)), new Date(2026, 0, 15, 7).getTime())
  assert.equal(holdFor(true, at(3)), null)
})
