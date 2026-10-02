import { purrBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Ronron du chat. */
export default function purr({ ctx, biq, loop }: Kit, out: GainNode) {
  const pk = biq('peaking', 170, 0.9)
  pk.gain.value = 5
  loop(purrBuffer(ctx), 0).connect(biq('lowpass', 650, 0.6)).connect(pk).connect(out)
}
