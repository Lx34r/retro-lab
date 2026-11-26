// FAMICLONE·83 — 致敬 1983 年红白家庭主机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles } from '../parts.js'
import { pcbTexture, metalTexture, cartLabelTexture, liveScreen } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

// 电视位姿（屏幕朝向相机，左侧接口板朝向主机）
export const TV_POS = [5.1, 0.95, -1.2]
export const TV_ROT = -0.7
const tvJackWorld = (lz) => {
  const c = Math.cos(TV_ROT), s = Math.sin(TV_ROT)
  const lx = -1.25, ly = -0.35
  return [TV_POS[0] + lx * c + lz * s, TV_POS[1] + ly, TV_POS[2] - lx * s + lz * c]
}
export const TV_JACKS = { Y: tvJackWorld(0.35), W: tvJackWorld(0), R: tvJackWorld(-0.35) }

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [4.4, 0.35, 3.4], [0, 0, 0], M.maroon, 0.1)
  box(g, [4.1, 0.06, 3.1], [0, 0.18, 0], M.inkSoft, 0.04)
  for (const [x, z] of [[-1.8, -1.3], [1.8, -1.3], [-1.8, 1.3], [1.8, 1.3]])
    cyl(g, 0.07, 0.08, 0.2, [x, 0.28, z], M.gold, 12)
  // 背部 AV 接口
  const jackColors = { Y: M.yellow, W: M.white, R: M.red }
  ;[['Y', -0.5], ['W', 0], ['R', 0.5]].forEach(([k, x]) => {
    cyl(g, 0.09, 0.09, 0.12, [x, 0.05, -1.72], jackColors[k], 14, [Math.PI / 2, 0, 0])
    cyl(g, 0.045, 0.045, 0.16, [x, 0.05, -1.76], M.metalDark, 10, [Math.PI / 2, 0, 0])
  })
  for (const [x, z] of [[-2.0, -1.5], [2.0, -1.5], [-2.0, 1.5], [2.0, 1.5]]) screw(g, [x, 0.19, z])
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [4.0, 0.1, 3.0], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), new THREE.MeshStandardMaterial({ map: pcbTexture({ seed: 8, label: 'FAMICLONE·83', sub: 'CPU+PPU REV B' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.051; g.add(top)
  chip(g, 0.9, 0.1, 0.9, [-1.1, 0.05, 0.5], { label: 'CPU' })
  chip(g, 0.9, 0.1, 0.9, [1.1, 0.05, 0.5], { label: 'PPU' })
  chip(g, 0.5, 0.07, 0.4, [-1.2, 0.05, -0.7], {})
  chip(g, 0.5, 0.07, 0.4, [1.2, 0.05, -0.7], {})
  for (let i = 0; i < 4; i++) chip(g, 0.22, 0.05, 0.2, [-0.4 + i * 0.3, 0.05, 1.1], { pins: false })
  return g
}

function buildSlot(ctx) {
  const g = new THREE.Group()
  box(g, [2.6, 0.3, 0.55], [0, 0, 0], M.dark, 0.03)
  box(g, [2.4, 0.1, 0.3], [0, 0.16, 0], M.inkSoft, 0.02)
  for (let i = 0; i < 20; i++) {
    box(g, [0.05, 0.08, 0.04], [-1.14 + i * 0.12, 0.2, 0.1], M.gold, 0.004)
    box(g, [0.05, 0.08, 0.04], [-1.14 + i * 0.12, 0.2, -0.1], M.gold, 0.004)
  }
  return g
}

function buildShield(ctx) {
  const g = new THREE.Group()
  const plate = shellWithHoles(4.1, 3.1, 0.12, [{ x: 0, z: -0.3, w: 2.75, d: 0.65 }], M.metal, 0.02)
  plate.material = new THREE.MeshStandardMaterial({ map: metalTexture({ holes: true }), roughness: 0.35, metalness: 0.7 })
  g.add(plate)
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(4.4, 3.4, 0.4, [
    { x: 0, z: -0.3, w: 2.85, d: 0.75 },
    { x: 1.5, z: 1.2, r: 0.17 },
    { x: 1.95, z: 1.2, r: 0.14 },
  ], M.cream, 0.06)
  g.add(shell)
  // 绯红饰条
  box(g, [4.4, 0.07, 0.5], [0, 0.2, 0.55], M.crimson, 0.02)
  box(g, [2.9, 0.05, 0.8], [0, 0.21, -0.3], M.creamDark, 0.02)
  textPlane(g, 'FAMICLONE·83', 1.9, [-0.7, 0.245, 1.25], { color: '#7a2a22', font: "15px 'Press Start 2P', monospace" })
  textPlane(g, 'RETO·LAB', 0.9, [-1.5, 0.245, -1.3], { color: '#a8a294', font: "12px 'Press Start 2P', monospace" })
  // 电源 / 复位按钮
  const pwr = cyl(g, 0.15, 0.16, 0.16, [1.5, 0.24, 1.2], M.crimson, 18)
  pwr.userData.control = 'power'; ctx.buttons.power = pwr
  const rst = cyl(g, 0.12, 0.13, 0.14, [1.95, 0.23, 1.2], M.inkSoft, 18)
  rst.userData.button = 'reset'; ctx.buttons.reset = rst
  textPlane(g, 'POWER', 0.42, [1.5, 0.245, 0.9], { color: '#7a2a22', font: 'bold 20px ui-monospace, monospace' })
  textPlane(g, 'RESET', 0.4, [1.95, 0.245, 0.9], { color: '#7a2a22', font: 'bold 20px ui-monospace, monospace' })
  const powerLed = led(g, 0.045, [1.2, 0.245, 1.2], '#ff3b30')
  ctx.leds.power = powerLed
  return g
}

function buildCartridge(ctx) {
  const g = new THREE.Group()
  box(g, [2.4, 1.5, 0.32], [0, 0, 0], M.gray, 0.04)
  // 顶部防滑纹
  for (let i = 0; i < 6; i++) box(g, [2.2, 0.04, 0.03], [0, 0.6 - i * 0.09, 0.17], M.creamDark, 0.005)
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.0), new THREE.MeshStandardMaterial({ map: cartLabelTexture(), roughness: 0.6 }))
  label.position.set(0, -0.1, 0.165); g.add(label)
  box(g, [2.2, 0.2, 0.28], [0, -0.78, 0], M.inkSoft, 0.02)
  ctx.refs.cart = g
  return g
}

// CRT 电视（场景陈设，非零件）
export function createTV(ctx) {
  const g = new THREE.Group()
  g.position.set(...TV_POS); g.rotation.y = TV_ROT
  box(g, [2.3, 1.9, 1.7], [0, 0, 0], M.creamDark, 0.12)
  box(g, [2.0, 1.55, 0.1], [0, 0.05, 0.82], M.ink, 0.06)
  const screen = liveScreen(256, 224)
  ctx.screens.tv = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 1.3), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.position.set(0, 0.05, 0.88); g.add(glass)
  ctx.refs.tvGlass = glass
  // 旋钮与喇叭
  cyl(g, 0.09, 0.09, 0.06, [0.85, 0.55, 0.86], M.inkSoft, 14, [Math.PI / 2, 0, 0])
  cyl(g, 0.09, 0.09, 0.06, [0.85, 0.3, 0.86], M.inkSoft, 14, [Math.PI / 2, 0, 0])
  for (let i = 0; i < 5; i++) box(g, [0.3, 0.02, 0.02], [0.85, -0.3 - i * 0.08, 0.86], M.inkSoft, 0.005)
  const tvLed = led(g, 0.035, [0.85, -0.65, 0.86], '#3f9e4d')
  ctx.leds.tv = tvLed
  // 底座与天线
  box(g, [1.8, 0.18, 1.3], [0, -1.02, 0], M.inkSoft, 0.04)
  cyl(g, 0.02, 0.03, 1.0, [-0.4, 1.4, -0.3], M.metal, 8, [0, 0, 0.4])
  cyl(g, 0.02, 0.03, 1.0, [0.4, 1.4, -0.3], M.metal, 8, [0, 0, -0.4])
  // 左侧接口板
  box(g, [0.15, 0.55, 1.05], [-1.18, -0.35, 0], M.inkSoft, 0.03)
  const jackColors = { Y: M.yellow, W: M.white, R: M.red }
  ;[['Y', 0.35], ['W', 0], ['R', -0.35]].forEach(([k, lz]) => {
    cyl(g, 0.08, 0.08, 0.1, [-1.28, -0.35, lz], jackColors[k], 12, [0, 0, Math.PI / 2])
  })
  textPlane(g, 'RETO·TV', 0.8, [0, -0.72, 0.87], { color: '#8a8578', rot: [0, 0, 0], font: "12px 'Press Start 2P', monospace" })
  return g
}

export const famiclone83 = {
  id: 'famiclone83',
  name: 'FAMICLONE·83',
  cn: '红白家庭主机',
  category: '主机',
  era: '1983',
  tagline: '卡带一插，客厅变成游乐场。',
  inspiration: '致敬 1983 年的红白家庭电脑',
  difficulty: 2,
  accent: '#c8352b',
  camera: { position: [9.8, 8.6, 12.8], target: [1.3, 1.2, -0.6] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '深红底壳，背部预留了黄白红三个 AV 接口。', '红白机的配色源自当时最便宜的塑料原料。', [0, 0.175, 0], [-4.6, 0.2, 1.8], [0, 1.0, 0], [4.4, 0.4, 3.4], buildBottom),
    part('board', '02', '主板', 'MAIN BOARD', 'CPU 与 PPU 两颗大芯片并排，是整台机器的心脏。', 'PPU 负责画面，它的调色板只有 52 种颜色。', [0, 0.4, 0], [-4.6, 0.15, -1.9], [0, 2.2, 0], [4.0, 0.3, 3.0], buildBoard),
    part('slot', '03', '卡带插槽', 'CARTRIDGE SLOT', '60 针卡带插槽，金手指朝上，等待卡带插入。', '插卡前吹一口气，是全世界玩家的共同仪式。', [0, 0.58, -0.3], [4.4, 0.2, 2.4], [0, 3.2, -0.3], [2.6, 0.4, 0.6], buildSlot),
    part('shield', '04', '屏蔽罩', 'RF SHIELD', '金属屏蔽罩盖住主板，只给卡带插槽留出开口。', '屏蔽罩用来减少电磁干扰，避免电视出现雪花。', [0, 0.72, 0], [4.6, 0.15, -1.8], [0, 4.1, 0], [4.1, 0.2, 3.1], buildShield),
    part('top', '05', '上壳', 'TOP COVER', '米白上壳配绯红饰条。电源与复位按钮在右前方。', '「上上下下左右左右BA」就诞生在这台机器上。', [0, 0.82, 0], [0, 0.25, -3.8], [0, 5.2, 0], [4.4, 0.5, 3.4], buildTop),
    part('cartridge', '06', '游戏卡带', 'GAME CARTRIDGE', '把《RETO QUEST》卡带插入插槽，标签朝向你。', '早期卡带容量只有几十 KB，却装得下一整个冒险。', [0, 1.68, -0.3], [4.4, 0.8, 0.6], [0, 6.3, -0.3], [2.4, 1.6, 0.4], buildCartridge),
  ],
  wires: [
    { id: 'avY', name: '视频线 · 黄', color: '#e8a020', plugLabel: 'Y', portLabel: 'Y', plug: [-0.5, 0.55, -1.85], port: TV_JACKS.Y, route: [[-0.5, 0.12, -2.6], [1.8, 0.1, -2.9], [3.2, 0.3, -2.4]], desc: '黄色视频线：主机 VIDEO → 电视 Y 接口。' },
    { id: 'avW', name: '音频线 · 白', color: '#f4f2ec', plugLabel: 'W', portLabel: 'W', plug: [0, 0.55, -1.85], port: TV_JACKS.W, route: [[0, 0.12, -2.8], [2.0, 0.1, -3.1], [3.5, 0.3, -2.6]], desc: '白色音频线：主机 AUDIO L → 电视 W 接口。' },
    { id: 'avR', name: '音频线 · 红', color: '#d0342c', plugLabel: 'R', portLabel: 'R', plug: [0.5, 0.55, -1.85], port: TV_JACKS.R, route: [[0.5, 0.12, -3.0], [2.2, 0.1, -3.3], [3.8, 0.3, -2.8]], desc: '红色音频线：主机 AUDIO R → 电视 R 接口。' },
  ],
  stepOrder: ['bottom', 'board', 'slot', 'shield', 'top', 'cartridge', 'w:avY', 'w:avW', 'w:avR'],
  dressing: createTV,
  showcase: { type: 'tv', intro: '电视亮了！卡带里的像素世界开始运行。按主机 RESET 可以重开一局。', toy: true },
}