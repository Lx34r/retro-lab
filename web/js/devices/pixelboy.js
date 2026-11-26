// PIXELBOY·89 — 致敬 1989 年灰砖掌机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles, dpad, roundButton, spring } from '../parts.js'
import { pcbTexture, liveScreen } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [3.0, 0.4, 4.9], [0, 0, 0], M.gray, 0.14)
  box(g, [2.72, 0.08, 4.62], [0, 0.2, 0], M.creamDark, 0.06)
  // 电池仓
  box(g, [1.75, 0.14, 0.95], [0, 0.24, 2.0], M.inkSoft, 0.04)
  spring(g, [-0.72, 0.3, 2.0], 0.06, 0.16)
  spring(g, [0.72, 0.3, 2.0], 0.06, 0.16)
  box(g, [0.1, 0.06, 0.5], [-0.82, 0.3, 2.0], M.gold, 0.01)
  box(g, [0.1, 0.06, 0.5], [0.82, 0.3, 2.0], M.gold, 0.01)
  // 定位柱
  for (const [x, z] of [[-1.15, -2.0], [1.15, -2.0], [-1.15, 0.9], [1.15, 0.9]])
    cyl(g, 0.07, 0.08, 0.22, [x, 0.32, z], M.gold, 12)
  // 扬声器孔
  for (let i = 0; i < 6; i++) cyl(g, 0.035, 0.035, 0.05, [0.95 + (i % 3) * 0.16, 0.24, 1.55 + Math.floor(i / 3) * 0.16], M.dark, 8)
  for (const [x, z] of [[-1.3, -2.25], [1.3, -2.25], [-1.3, 2.25], [1.3, 2.25]]) screw(g, [x, 0.21, z])
  return g
}

function buildBattery(ctx) {
  const g = new THREE.Group()
  const cells = [[-0.24, M.orange, 'RETO'], [0.24, M.ink, 'CELL']]
  for (const [z, mat, label] of cells) {
    cyl(g, 0.19, 0.19, 1.5, [0, 0, z], mat, 20, [0, 0, Math.PI / 2])
    cyl(g, 0.19, 0.19, 0.28, [0.2, 0, z], M.white, 20, [0, 0, Math.PI / 2])
    cyl(g, 0.06, 0.06, 0.06, [0.78, 0, z], M.gold, 12, [0, 0, Math.PI / 2])
    cyl(g, 0.19, 0.19, 0.03, [-0.76, 0, z], M.metalDark, 20, [0, 0, Math.PI / 2])
  }
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [2.7, 0.1, 3.9], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.9), new THREE.MeshStandardMaterial({ map: pcbTexture({ seed: 3, label: 'PIXELBOY·89', sub: 'CPU-89 REV A' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.051; top.receiveShadow = true
  g.add(top)
  chip(g, 0.72, 0.09, 0.72, [-0.5, 0.05, -0.7], { label: 'CPU' })
  chip(g, 0.55, 0.07, 0.42, [0.62, 0.05, -0.3], { label: 'RAM' })
  chip(g, 0.34, 0.06, 0.3, [0.7, 0.05, 0.6], {})
  chip(g, 0.28, 0.05, 0.24, [-0.8, 0.05, 0.7], {})
  // 卡带连接器
  box(g, [2.2, 0.18, 0.34], [0, 0.09, -1.78], M.dark, 0.02)
  for (let i = 0; i < 16; i++) box(g, [0.06, 0.05, 0.2], [-1.0 + i * 0.133, 0.2, -1.78], M.gold, 0.005)
  // 屏幕排线插座
  box(g, [0.9, 0.08, 0.24], [0.7, 0.04, 1.0], M.white, 0.01)
  // 电池引线
  cyl(g, 0.025, 0.025, 0.9, [-0.9, 0.02, 1.6], M.red, 8, [Math.PI / 2.4, 0, 0])
  cyl(g, 0.025, 0.025, 0.9, [-0.75, 0.02, 1.6], M.dark, 8, [Math.PI / 2.4, 0, 0])
  return g
}

function buildLcd(ctx) {
  const g = new THREE.Group()
  box(g, [2.4, 0.34, 2.1], [0, -0.26, 0], M.rubberDark, 0.04) // 缓冲垫
  box(g, [2.5, 0.14, 2.2], [0, 0, 0], M.metalDark, 0.03)
  const screen = liveScreen(160, 144)
  ctx.screens.lcd = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.14, 1.74), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.y = 0.075
  g.add(glass)
  ctx.refs.lcdGlass = glass
  // 排线尾
  box(g, [0.7, 0.025, 0.9], [0.7, -0.04, 1.5], M.yellow, 0.005)
  box(g, [0.7, 0.03, 0.16], [0.7, -0.04, 1.92], M.gold, 0.005)
  return g
}

function buildPads(ctx) {
  const g = new THREE.Group()
  box(g, [0.7, 0.06, 0.7], [-0.85, 0, -0.15], M.rubber, 0.03)
  cyl(g, 0.16, 0.2, 0.08, [0.75, 0.02, 0.05], M.rubber, 16)
  cyl(g, 0.16, 0.2, 0.08, [1.15, 0.02, -0.25], M.rubber, 16)
  box(g, [0.32, 0.05, 0.12], [-0.25, 0, 0.65], M.rubber, 0.03)
  box(g, [0.32, 0.05, 0.12], [0.25, 0, 0.65], M.rubber, 0.03)
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  const dp = dpad(g, [-0.85, 0, -0.15], M.ink, 1.05)
  dp.children.forEach(c => { c.userData.button = 'dpad' })
  ctx.buttons.dpad = dp
  const a = roundButton(g, 0.22, [0.75, 0, 0.05], M.crimson, 0.22)
  const b = roundButton(g, 0.22, [1.15, 0, -0.25], M.crimson, 0.22)
  a.children[0].userData.button = 'a'; b.children[0].userData.button = 'b'
  ctx.buttons.a = a; ctx.buttons.b = b
  textPlane(g, 'A', 0.16, [0.75, 0.225, 0.05], { color: '#fff', font: 'bold 40px ui-monospace, monospace' })
  textPlane(g, 'B', 0.16, [1.15, 0.225, -0.25], { color: '#fff', font: 'bold 40px ui-monospace, monospace' })
  const st = box(g, [0.32, 0.1, 0.13], [-0.25, 0.02, 0.65], M.inkSoft, 0.04, [0, -0.3, 0])
  const se = box(g, [0.32, 0.1, 0.13], [0.25, 0.02, 0.65], M.inkSoft, 0.04, [0, -0.3, 0])
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(3.0, 4.9, 0.3, [
    { x: 0, z: -0.75, w: 2.26, d: 1.86 },
    { x: -0.85, z: 1.15, r: 0.44 },
    { x: 0.75, z: 1.35, r: 0.26 },
    { x: 1.15, z: 1.05, r: 0.26 },
    { x: -0.25, z: 1.95, w: 0.36, d: 0.15 },
    { x: 0.25, z: 1.95, w: 0.36, d: 0.15 },
  ], M.grayLight, 0.05)
  g.add(shell)
  // 屏幕边框
  box(g, [2.5, 0.08, 2.12], [0, -0.12, -0.75], M.inkSoft, 0.03)
  textPlane(g, 'PIXELBOY·89', 1.5, [0, -0.075, -1.72], { color: '#c8cdd2', font: "16px 'Press Start 2P', monospace" })
  textPlane(g, 'RETO·LAB', 0.9, [0, 0.155, 2.28], { color: '#6a6e75', font: "14px 'Press Start 2P', monospace" })
  const powerLed = led(g, 0.05, [-1.08, -0.06, -1.72], '#ff3b30')
  ctx.leds.power = powerLed
  textPlane(g, 'BATTERY', 0.5, [-1.08, -0.075, -1.55], { color: '#8a8f96', font: 'bold 22px ui-monospace, monospace' })
  // 电源拨杆
  const sw = box(g, [0.3, 0.12, 0.18], [-1.2, 0.16, -2.32], M.ink, 0.03)
  sw.userData.control = 'power'
  ctx.refs.powerSwitch = sw
  box(g, [0.5, 0.06, 0.3], [-1.2, 0.14, -2.32], M.inkSoft, 0.02)
  return g
}

export const pixelboy89 = {
  id: 'pixelboy89',
  name: 'PIXELBOY·89',
  cn: '像素小子掌机',
  category: '掌机',
  era: '1989',
  tagline: '四节电池，一整个夏天。',
  inspiration: '致敬 1989 年的灰砖掌机',
  difficulty: 1,
  accent: '#9bbc0f',
  camera: { position: [8.6, 8.8, 12.2], target: [0, 1.7, 0] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM SHELL', '灰色底壳是一切的起点。电池仓、定位柱与扬声器孔都已就位。', '当年的掌机用 4 节五号电池，能连续玩上十几个小时。', [0, 0.2, 0], [-4.4, 0.25, 1.7], [0, 1.1, 0], [3.0, 0.5, 4.9], buildBottom),
    part('battery', '02', '电池组', 'BATTERY PACK', '两节电池装入底部电池仓，注意弹簧触点对齐负极。', '低电量时屏幕会变暗——老玩家都记得那种紧张感。', [0, 0.45, 2.0], [4.2, 0.25, 2.5], [0, 2.0, 2.0], [1.7, 0.4, 1.0], buildBattery),
    part('board', '03', '主板', 'MAIN BOARD', '绿色主板承载 CPU 与内存。卡带连接器朝向顶端，排线插座留在右侧。', '它的 CPU 只有约 4 MHz，却跑出了无数经典。', [0, 0.5, -0.55], [-4.4, 0.15, -1.9], [0, 2.9, -0.55], [2.7, 0.3, 3.9], buildBoard),
    part('lcd', '04', '液晶屏', 'LCD MODULE', '黄绿色液晶屏嵌入金属框架。排线尾端朝向主板插座。', '160×144 像素、四级灰度，是那个年代的「视网膜屏」。', [0, 0.88, -0.75], [4.3, 0.2, -1.7], [0, 3.8, -0.75], [2.5, 0.6, 2.6], buildLcd),
    part('pads', '05', '按键胶垫', 'RUBBER PADS', '导电胶垫铺在按键下方，每一次回弹都靠它。', '胶垫老化是老掌机按键失灵的常见原因。', [0, 0.92, 1.3], [-3.7, 0.15, 3.5], [0, 4.6, 1.3], [2.6, 0.15, 1.6], buildPads),
    part('buttons', '06', '按键组', 'BUTTON SET', '十字键、A/B 键与 Start/Select。深红圆键是它的标志。', '十字键的设计专利，影响了之后几乎所有手柄。', [0, 1.0, 1.3], [3.7, 0.2, 3.5], [0, 5.3, 1.3], [2.6, 0.3, 1.6], buildButtons),
    part('top', '07', '面壳', 'TOP SHELL', '最后扣上面壳：屏幕窗口、按键开孔与电源拨杆各就其位。', '灰砖外壳的耐用程度，堪称电子产品里的传奇。', [0, 1.1, 0], [0, 0.25, -3.9], [0, 6.4, 0], [3.0, 0.45, 4.9], buildTop),
  ],
  wires: [
    { id: 'ribbon', name: '屏幕排线', color: '#e8a020', plugLabel: 'A', portLabel: 'A', plug: [0.7, 0.85, 1.2], port: [0.7, 0.55, 1.0], route: [[0.7, 0.72, 1.15], [0.7, 0.62, 1.05]], desc: '把液晶屏的排线插进主板插座。' },
  ],
  stepOrder: ['bottom', 'battery', 'board', 'lcd', 'pads', 'buttons', 'w:ribbon', 'top'],
  showcase: { type: 'lcd', intro: '液晶屏亮了！点十字键移动小像素人，A / B 让它跳跃。', toy: true },
}