import { loops } from '../../rooms/bedroom'
import { purrBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Ronron du chat, enregistré ou synthétisé. */
export default function purr(kit: Kit, out: GainNode) {
  const { ctx, biq, loop } = kit
  kit.loopOr(loops.purr, out, () => {
    const pk = biq('peaking', 170, 0.9)
    pk.gain.value = 5
    loop(purrBuffer(ctx), 0).connect(biq('lowpass', 650, 0.6)).connect(pk).connect(out)
  })
}
