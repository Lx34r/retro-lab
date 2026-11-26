// RETO·LAB 设备注册表
import { pixelboy89 } from './pixelboy.js'
import { famiclone83 } from './famiclone.js'
import { propad90 } from './propad.js'
import { key84 } from './key84.js'
import { watch80 } from './watch80.js'
import { classic85 } from './classic85.js'
import { color93 } from './color93.js'
import { analog97 } from './analog97.js'
import { dual06 } from './dual06.js'
import { motion08 } from './motion08.js'
import { pro16 } from './pro16.js'
import { hybrid17 } from './hybrid17.js'

function defineDevice(d) {
  const partsById = Object.fromEntries(d.parts.map(p => [p.id, p]))
  const wiresById = Object.fromEntries(d.wires.map(w => [w.id, w]))
  const steps = d.stepOrder.map(s => s.startsWith('w:')
    ? { type: 'wire', id: s.slice(2) }
    : { type: 'part', id: s })
  return { ...d, partsById, wiresById, steps }
}

export const DEVICES = {
  pixelboy89: defineDevice(pixelboy89),
  famiclone83: defineDevice(famiclone83),
  propad90: defineDevice(propad90),
  key84: defineDevice(key84),
  watch80: defineDevice(watch80),
  classic85: defineDevice(classic85),
  color93: defineDevice(color93),
  analog97: defineDevice(analog97),
  dual06: defineDevice(dual06),
  motion08: defineDevice(motion08),
  pro16: defineDevice(pro16),
  hybrid17: defineDevice(hybrid17),
}
export const DEVICE_IDS = Object.keys(DEVICES)
export const DEVICE_LIST = DEVICE_IDS.map(id => DEVICES[id])