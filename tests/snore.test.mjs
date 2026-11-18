// Le souffle du chien endormi (src/state/snore.ts) : courbe continue, recalage sans saut.
import test from 'node:test'
import assert from 'node:assert/strict'
import { IDLE_PERIOD, INHALE, PERIOD, breath, toBreathStart } from '../src/state/snore.ts'

test('breath : 0 au début et à la fin d’un souffle, 1 au bout de l’inspiration, toujours entre 0 et 1', () => {
  assert.equal(breath(0), 0)
  assert.ok(Math.abs(breath(1)) < 1e-12)
  assert.ok(Math.abs(breath(INHALE) - 1) < 1e-12)
  for (let i = 0; i <= 400; i++) {
    const v = breath(i / 100)
    assert.ok(v >= 0 && v <= 1, `phase ${i / 100}`)
  }
})

test('breath : continue (aucun saut entre deux images à 60 i/s) et périodique', () => {
  let prev = breath(0)
  for (let i = 1; i <= 2000; i++) {
    const v = breath(i / 2000)
    assert.ok(Math.abs(v - prev) < 0.01, `saut en ${i / 2000}`)
    prev = v
  }
  assert.ok(Math.abs(breath(0.3) - breath(3.3)) < 1e-9)
  assert.ok(Math.abs(breath(-0.7) - breath(0.3)) < 1e-9)
  // l'expiration dure plus longtemps que l'inspiration
  assert.ok(INHALE < 0.5)
  assert.ok(IDLE_PERIOD > PERIOD)
})

test('toBreathStart : le plus court décalage jusqu’au début d’un souffle', () => {
  assert.ok(Math.abs(toBreathStart(2.1) + 0.1) < 1e-9)
  assert.ok(Math.abs(toBreathStart(2.9) - 0.1) < 1e-9)
  assert.equal(toBreathStart(5), 0)
  for (let i = 0; i < 100; i++) assert.ok(Math.abs(toBreathStart(i * 0.137)) <= 0.5 + 1e-9)
  // après le décalage, le flanc est au repos
  for (const p of [0.12, 3.97, 7.5]) assert.ok(breath(p + toBreathStart(p)) < 1e-9 || Math.abs(toBreathStart(p)) === 0.5)
})
