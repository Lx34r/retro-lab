// KEY84 — 致敬客制化机械键盘（原创程序化模型，60% 配列）
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { M, box, cyl, textPlane, led, shellWithHoles } from '../parts.js'
import { pcbTexture, metalTexture, keycapAtlas, atlasUV } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

const PITCH = 0.4
const ROWS = [
  [['ESC', 'Escape', 1], ['1', 'Digit1', 1], ['2', 'Digit2', 1], ['3', 'Digit3', 1], ['4', 'Digit4', 1], ['5', 'Digit5', 1], ['6', 'Digit6', 1], ['7', 'Digit7', 1], ['8', 'Digit8', 1], ['9', 'Digit9', 1], ['0', 'Digit0', 1], ['-', 'Minus', 1], ['=', 'Equal', 1], ['BK', 'Backspace', 1]],
  [['TAB', 'Tab', 1], ['Q', 'KeyQ', 1], ['W', 'KeyW', 1], ['E', 'KeyE', 1], ['R', 'KeyR', 1], ['T', 'KeyT', 1], ['Y', 'KeyY', 1], ['U', 'KeyU', 1], ['I', 'KeyI', 1], ['O', 'KeyO', 1], ['P', 'KeyP', 1], ['[', 'BracketLeft', 1], [']', 'BracketRight', 1], ['\\', 'Backslash', 1]],
  [['CAP', 'CapsLock', 1.5], ['A', 'KeyA', 1], ['S', 'KeyS', 1], ['D', 'KeyD', 1], ['F', 'KeyF', 1], ['G', 'KeyG', 1], ['H', 'KeyH', 1], ['J', 'KeyJ', 1], ['K', 'KeyK', 1], ['L', 'KeyL', 1], [';', 'Semicolon', 1], ["'", 'Quote', 1], ['ENT', 'Enter', 1.5]],
  [['SHF', 'ShiftLeft', 2], ['Z', 'KeyZ', 1], ['X', 'KeyX', 1], ['C', 'KeyC', 1], ['V', 'KeyV', 1], ['B', 'KeyB', 1], ['N', 'KeyN', 1], ['M', 'KeyM', 1], [',', 'Comma', 1], ['.', 'Period', 1], ['/', 'Slash', 1], ['SHF', 'ShiftRight', 2]],
  [['CTL', 'ControlLeft', 1.5], ['WIN', 'MetaLeft', 1], ['ALT', 'AltLeft', 1.5], ['SPACE', 'Space', 6], ['ALT', 'AltRight', 1.5], ['FN', 'Fn', 1], ['CTL', 'ControlRight', 1.5]],
]
// 展开为带坐标的键位列表
export const KEY_LAYOUT = []
ROWS.forEach((row, r) => {
  let x = -2.8
  row.forEach(([label, code, w]) => {
    KEY_LAYOUT.push({ label, code, w, x: x + w * PITCH / 2, z: -0.8 + r * PITCH, row: r })
    x += w * PITCH
  })
})

function buildCase(ctx) {
  const g = new THREE.Group()
  box(g, [6.2, 0.35, 2.4], [0, 0, 0], M.ink, 0.1)
  box(g, [5.9, 0.08, 2.1], [0, 0.18, 0], M.inkSoft, 0.04)
  //  USB 接口
  box(g, [0.3, 0.14, 0.16], [2.7, 0.05, -1.2], M.metalDark, 0.02)
  for (const [x, z] of [[-2.9, -1.0], [2.9, -1.0], [-2.9, 1.0], [2.9, 1.0]]) cyl(g, 0.06, 0.07, 0.06, [x, -0.18, z], M.rubberDark, 10)
  return g
}

function buildPcb(ctx) {
  const g = new THREE.Group()
  box(g, [5.9, 0.08, 2.1], [0, 0, 0], M.pcbDeep, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 2.1), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 1024, h: 384, seed: 12, label: 'KEY84', sub: 'RGB MATRIX REV D' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.041; g.add(top)
  ctx.leds.rgb = []
  for (const k of KEY_LAYOUT) {
    const mat = new THREE.MeshStandardMaterial({ color: '#222', emissive: '#ff00ff', emissiveIntensity: 0, roughness: 0.4 })
    const m = new THREE.Mesh(new THREE.BoxGeometry(Math.min(k.w * PITCH * 0.5, 0.2), 0.04, 0.14), mat)
    m.position.set(k.x, 0.06, k.z)
    g.add(m)
    ctx.leds.rgb.push({ mesh: m, mat, x: k.x, z: k.z })
  }
  return g
}

function buildPlate(ctx) {
  const g = new THREE.Group()
  const plate = box(g, [5.9, 0.06, 2.1], [0, 0, 0], M.metal, 0.02)
  plate.material = new THREE.MeshStandardMaterial({ map: metalTexture({ base: '#8a9097', holes: true }), roughness: 0.35, metalness: 0.7 })
  return g
}

function buildSwitches(ctx) {
  const g = new THREE.Group()
  const n = KEY_LAYOUT.length
  const housingGeo = new RoundedBoxGeometry(0.3, 0.22, 0.3, 1, 0.03)
  const housingMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 })
  const housings = new THREE.InstancedMesh(housingGeo, housingMat, n)
  const stemGeo = new THREE.BoxGeometry(0.06, 0.1, 0.06)
  const stems = new THREE.InstancedMesh(stemGeo, new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.5 }), n)
  const dummy = new THREE.Object3D()
  const colors = ['#c8352b', '#2b6cb0', '#8a5a2b']
  KEY_LAYOUT.forEach((k, i) => {
    dummy.position.set(k.x, 0, k.z); dummy.updateMatrix()
    housings.setMatrixAt(i, dummy.matrix)
    housings.setColorAt(i, new THREE.Color(colors[i % 3]))
    dummy.position.set(k.x, 0.15, k.z); dummy.updateMatrix()
    stems.setMatrixAt(i, dummy.matrix)
  })
  housings.castShadow = true; stems.castShadow = true
  g.add(housings, stems)
  return g
}

function buildKeycaps(ctx) {
  const g = new THREE.Group()
  const legends = KEY_LAYOUT.map(k => k.label)
  const atlas = keycapAtlas(legends)
  const atlasMat = new THREE.MeshBasicMaterial({ map: atlas, transparent: true, toneMapped: false })
  const capGeos = new Map()
  ctx.keys = []
  KEY_LAYOUT.forEach((k, i) => {
    const w = k.w * PITCH - 0.05
    const kg = new THREE.Group()
    kg.position.set(k.x, 0, k.z)
    if (!capGeos.has(k.w)) capGeos.set(k.w, new RoundedBoxGeometry(w, 0.18, PITCH - 0.05, 2, 0.04))
    const capMat = new THREE.MeshStandardMaterial({ color: i % 7 === 0 ? '#f26322' : '#e8e4d8', roughness: 0.55, emissive: '#ff00ff', emissiveIntensity: 0 })
    const cap = new THREE.Mesh(capGeos.get(k.w), capMat)
    cap.position.y = 0.09
    cap.castShadow = true
    cap.userData.key = k.code
    kg.add(cap)
    // 字符
    const { u0, u1, v0, v1 } = atlasUV(i)
    const lw = Math.min(w * 0.8, 0.34), ld = 0.28
    const lg = new THREE.PlaneGeometry(lw, ld)
    const uv = lg.attributes.uv
    uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0)
    const legend = new THREE.Mesh(lg, atlasMat)
    legend.rotation.x = -Math.PI / 2
    legend.position.y = 0.182
    kg.add(legend)
    g.add(kg)
    ctx.keys.push({ group: kg, cap, capMat, code: k.code, label: k.label, x: k.x, z: k.z, baseY: 0 })
  })
  return g
}

function buildFrame(ctx) {
  const g = new THREE.Group()
  const frame = shellWithHoles(6.2, 2.4, 0.16, [{ x: 0, z: 0, w: 5.75, d: 2.15 }], M.ink, 0.03)
  g.add(frame)
  textPlane(g, 'KEY84', 0.7, [2.7, 0.085, 1.05], { color: '#8a8f96', font: "11px 'Press Start 2P', monospace" })
  return g
}

// 演示电脑（USB 插入目标）
export function createPC(ctx) {
  const g = new THREE.Group()
  g.position.set(4.9, 0.7, 2.5)
  box(g, [1.2, 1.4, 1.6], [0, 0, 0], M.ink, 0.06)
  box(g, [1.0, 1.2, 0.06], [0, 0, 0.81], M.inkSoft, 0.03)
  box(g, [0.5, 0.08, 0.04], [0, 0.4, 0.85], M.metalDark, 0.01)
  box(g, [0.24, 0.1, 0.05], [0, 0.0, 0.85], M.metalDark, 0.01)
  const pcLed = led(g, 0.035, [0.35, 0.55, 0.85], '#3f9e4d')
  ctx.leds.pc = pcLed
  textPlane(g, 'RETO·PC', 0.7, [0, -0.45, 0.85], { color: '#8a8f96', rot: [0, 0, 0], font: "10px 'Press Start 2P', monospace" })
  return g
}

export const key84 = {
  id: 'key84',
  name: 'KEY84',
  cn: '机械键盘',
  category: '键盘外设',
  era: '2010s',
  tagline: '每一次敲击，都有回声。',
  inspiration: '致敬客制化机械键盘浪潮',
  difficulty: 3,
  accent: '#f26322',
  camera: { position: [8.2, 8.6, 11.2], target: [0.5, 0.8, 0.5] },
  parts: [
    part('case', '01', '底壳', 'ALUMINUM CASE', '深色铝底壳，四角防滑脚垫。一切从这里开始。', '铝坨坨的重量，是客制化键盘的「安全感」。', [0, 0.175, 0], [-4.6, 0.2, 1.9], [0, 1.0, 0], [6.2, 0.4, 2.4], buildCase),
    part('pcb', '02', '电路板', 'RGB PCB', '每个键位下都有一颗 RGB 灯珠，焊在电路板上。', '全键无冲 + RGB，是现代键盘的标配。', [0, 0.42, 0], [-4.6, 0.15, -1.9], [0, 2.1, 0], [5.9, 0.2, 2.1], buildPcb),
    part('plate', '03', '定位板', 'SWITCH PLATE', '金属定位板固定轴体，决定敲击的刚性手感。', '定位板材质从钢板到碳纤维，手感各不相同。', [0, 0.52, 0], [4.6, 0.15, -1.9], [0, 3.1, 0], [5.9, 0.15, 2.1], buildPlate),
    part('switches', '04', '轴体组', 'SWITCH SET', '六十颗轴体逐一落位：红轴线性、茶轴段落、青轴清脆。', '轴体的压力克数，是键盘玩家最在意的参数。', [0, 0.64, 0], [4.6, 0.2, 1.9], [0, 4.1, 0], [5.9, 0.3, 2.1], buildSwitches),
    part('keycaps', '05', '键帽组', 'KEYCAP SET', 'PBT 键帽覆盖轴体，橙色点缀键是整套的点睛之笔。', 'PBT 键帽耐磨不打油，字符可以热升华定制。', [0, 0.86, 0], [0, 0.25, 3.7], [0, 5.2, 0], [5.9, 0.3, 2.1], buildKeycaps),
    part('frame', '06', '边框上盖', 'TOP FRAME', '最后扣上边框，露出整齐的键帽阵列。', '窄边框设计让 60% 配列几乎全是键。', [0, 0.84, 0], [0, 0.2, -3.7], [0, 6.2, 0], [6.2, 0.25, 2.4], buildFrame),
  ],
  wires: [
    { id: 'usb', name: 'USB 线缆', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [2.7, 0.5, -1.3], port: [4.9, 0.7, 3.35], route: [[3.5, 0.1, -1.9], [4.7, 0.1, 0.4], [4.9, 0.4, 2.4]], desc: '把 USB 线缆插入演示电脑的 A 端口。' },
  ],
  stepOrder: ['case', 'pcb', 'plate', 'switches', 'keycaps', 'frame', 'w:usb'],
  dressing: createPC,
  showcase: { type: 'typetest', intro: 'RGB 亮了！敲出 HELLO RETRO（物理键盘或点击键帽）。', phrase: 'HELLO RETRO' },
}