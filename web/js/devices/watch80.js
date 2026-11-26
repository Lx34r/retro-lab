// WATCH·80 — 致敬 1980 年单屏 LCD 掌机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles, tray, roundButton } from '../parts.js'
import { pcbTexture, liveScreen } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  tray(g, 3.2, 2.1, 0.35, M.creamDark, { bottomY: -0.17, base: 0.1, thickness: 0.1 })
  for (const [x, z] of [[-1.35, -0.82], [1.35, -0.82], [-1.35, 0.82], [1.35, 0.82]]) screw(g, [x, 0.18, z], 0.045)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [2.9, 0.08, 1.8], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.8), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 512, h: 320, seed: 21, label: 'WATCH·80', sub: 'LCD GAME REV A' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.041; g.add(top)
  chip(g, 0.62, 0.08, 0.52, [-0.45, 0.04, -0.2], { label: 'CPU' })
  chip(g, 0.34, 0.06, 0.28, [0.65, 0.04, 0.35], {})
  box(g, [0.7, 0.09, 0.2], [0, 0.05, 0.62], M.white, 0.01)
  return g
}

function buildBattery(ctx) {
  const g = new THREE.Group()
  for (const x of [-0.38, 0.38]) {
    cyl(g, 0.32, 0.32, 0.1, [x, 0, 0], M.metal, 24)
    cyl(g, 0.27, 0.27, 0.105, [x, 0.01, 0], M.metalDark, 24)
    box(g, [0.16, 0.02, 0.04], [x, 0.07, 0], M.gold, 0.005)
  }
  return g
}

function buildScreen(ctx) {
  const g = new THREE.Group()
  box(g, [2.35, 0.12, 1.35], [0, 0, 0], M.metalDark, 0.03)
  const screen = liveScreen(160, 96)
  ctx.screens.lcd = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.12, 1.12), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.y = 0.065; g.add(glass)
  box(g, [0.55, 0.025, 0.65], [0.75, -0.03, 0.92], M.yellow, 0.005)
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  const a = roundButton(g, 0.24, [0.95, 0, -0.32], M.crimson, 0.2)
  const b = roundButton(g, 0.24, [1.28, 0, 0.3], M.crimson, 0.2)
  a.children[0].userData.button = 'a'; b.children[0].userData.button = 'b'
  ctx.buttons.a = a; ctx.buttons.b = b
  textPlane(g, 'A', 0.15, [0.95, 0.205, -0.32], { color: '#fff', font: 'bold 40px ui-monospace, monospace' })
  textPlane(g, 'B', 0.15, [1.28, 0.205, 0.3], { color: '#fff', font: 'bold 40px ui-monospace, monospace' })
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(3.2, 2.1, 0.24, [
    { x: 0, z: -0.25, w: 2.28, d: 1.28 },
    { x: 0.95, z: -0.32, r: 0.27 },
    { x: 1.28, z: 0.3, r: 0.27 },
  ], M.cream, 0.05)
  g.add(shell)
  box(g, [3.0, 0.05, 0.18], [0, 0.13, 0.92], M.crimson, 0.02)
  textPlane(g, 'WATCH·80', 1.2, [-0.55, 0.13, 0.72], { color: '#7a2a22', font: "14px 'Press Start 2P', monospace" })
  for (let i = 0; i < 6; i++) cyl(g, 0.035, 0.035, 0.04, [-1.1 + (i % 3) * 0.14, 0.13, 0.55 + Math.floor(i / 3) * 0.14], M.dark, 8)
  const sw = box(g, [0.34, 0.11, 0.18], [-1.25, 0.15, -0.78], M.ink, 0.03)
  sw.userData.control = 'power'; ctx.refs.powerSwitch = sw
  ctx.leds.power = led(g, 0.045, [-0.92, 0.14, -0.78], '#ff3b30')
  return g
}

export const watch80 = {
  id: 'watch80',
  name: 'WATCH·80',
  cn: '单屏液晶掌机',
  category: '掌机',
  era: '1980',
  tagline: '两个按键，也能玩一下午。',
  inspiration: '致敬 1980 年代的单屏 LCD 游戏机',
  difficulty: 1,
  accent: '#c8352b',
  camera: { position: [6.8, 7.4, 9.4], target: [0, 1.3, 0] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '米黄色单屏掌机底壳，四角螺丝与电池仓整齐排列。', '早期 LCD 游戏机用固定的液晶屏片，而不是后来流行的点阵屏。', [0, 0.2, 0], [-3.8, 0.2, 1.6], [0, 1.0, 0], [3.2, 0.52, 2.1], buildBottom),
    part('board', '02', '主板', 'GAME BOARD', '小小主板驱动屏幕、蜂鸣器与两个按键。', '单屏掌机的游戏逻辑早已固化在芯片里，插卡并不能换游戏。', [0, 0.36, 0], [3.8, 0.15, -1.5], [0, 2.0, 0], [2.9, 0.25, 1.8], buildBoard),
    part('battery', '03', '纽扣电池', 'COIN CELLS', '两颗纽扣电池为液晶屏与逻辑电路供电。', '纽扣电池结构简单，但误吞非常危险，需要远离儿童。', [-0.65, 0.42, 0.55], [-3.6, 0.15, -1.8], [-0.6, 3.0, 0.8], [1.2, 0.25, 0.8], buildBattery),
    part('screen', '04', '液晶屏', 'LCD GLASS', '固定图案液晶屏嵌入金属框，排线尾端朝向主板。', '那时的画面由预印液晶片构成，角色移动靠液晶分子偏转。', [0, 0.56, -0.25], [3.7, 0.2, 1.6], [0, 4.0, -0.3], [2.4, 0.3, 1.5], buildScreen),
    part('buttons', '05', '双按键', 'A / B BUTTONS', '两颗绯红按键负责接住落物，简单却考验节奏。', '两个按键也能诞生丰富玩法，限制有时反而激发创意。', [0, 0.62, 0.55], [0, 0.2, 3.4], [0, 5.0, 0.7], [1.2, 0.35, 1.0], buildButtons),
    part('top', '06', '面壳', 'TOP COVER', '扣上面壳，露出屏幕与两颗按键，红色饰条点亮机身。', '单屏掌机把屏幕、扬声器和控制器装进了一个巴掌大的盒子。', [0, 0.67, 0], [0, 0.2, -3.4], [0, 6.0, 0], [3.2, 0.35, 2.1], buildTop),
  ],
  wires: [
    { id: 'cell', name: '电池触点', color: '#d0342c', plugLabel: 'A', portLabel: 'A', plug: [-0.65, 0.45, 0.82], port: [0, 0.4, 0.62], route: [[-0.5, 0.3, 0.9], [-0.1, 0.28, 0.8]], desc: '把电池触点接入主板的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'battery', 'screen', 'buttons', 'w:cell', 'top'],
  showcase: { type: 'watch', intro: '液晶屏醒了！用 A / B 移动接物篮，接住 8 个落物。', toy: true },
}
