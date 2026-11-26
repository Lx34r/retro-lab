// MOTION·08 — 致敬 2008 年体感手柄（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles, tray, roundButton } from '../parts.js'
import { pcbTexture } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  tray(g, 1.5, 2.9, 0.39, M.white, { bottomY: -0.25, base: 0.12, thickness: 0.12 })
  box(g, [0.7, 0.14, 0.5], [0, 0.29, 0.95], M.dark, 0.03)
  for (const [x, z] of [[-0.55, -1.15], [0.55, -1.15], [-0.55, 1.15], [0.55, 1.15]]) screw(g, [x, 0.26, z], 0.04)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [1.2, 0.08, 2.55], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.55), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 256, h: 512, seed: 61, label: 'MOTION·08', sub: 'MOTION SENSOR REV A' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.041; g.add(top)
  chip(g, 0.42, 0.08, 0.38, [0, 0.05, -0.4], { label: 'MCU' })
  return g
}

function buildSensor(ctx) {
  const g = new THREE.Group()
  box(g, [0.48, 0.12, 0.42], [0, 0, 0], M.dark, 0.02)
  textPlane(g, '3AXIS', 0.34, [0, 0.065, 0], { color: '#c8cdd2', font: 'bold 24px ui-monospace, monospace' })
  for (let i = 0; i < 4; i++) box(g, [0.04, 0.03, 0.08], [-0.18 + i * 0.12, -0.01, 0.24], M.gold, 0.004)
  ctx.refs.sensor = g
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.18], ['down', 0, 0.18], ['left', -0.18, 0], ['right', 0.18, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.17, 0.15, 0.19], [dx, 0.02, -0.72 + dz], M.ink, 0.03)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.08, 0.08, 0.16, [0, 0.025, -0.72], M.ink, 14)
  const a = roundButton(g, 0.16, [0, 0, 0.05], M.blue, 0.16)
  a.children[0].userData.button = 'a'; ctx.buttons.a = a
  const home = roundButton(g, 0.12, [0, 0, 0.62], M.creamDark, 0.12)
  home.children[0].userData.button = 'home'; ctx.buttons.home = home
  const minus = box(g, [0.22, 0.1, 0.12], [-0.32, 0.02, -0.25], M.inkSoft, 0.03)
  const plus = box(g, [0.22, 0.1, 0.12], [0.32, 0.02, -0.25], M.inkSoft, 0.03)
  minus.userData.button = 'minus'; plus.userData.button = 'plus'
  ctx.buttons.minus = minus; ctx.buttons.plus = plus
  const trigger = box(g, [0.8, 0.16, 0.24], [0, 0.02, -1.25], M.inkSoft, 0.05)
  trigger.userData.button = 'b'; ctx.buttons.b = trigger
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(1.5, 2.9, 0.22, [
    { x: 0, z: -0.72, w: 0.64, d: 0.64 },
    { x: 0, z: 0.05, r: 0.19 },
    { x: 0, z: 0.62, r: 0.15 },
    { x: -0.32, z: -0.25, w: 0.26, d: 0.16 },
    { x: 0.32, z: -0.25, w: 0.26, d: 0.16 },
  ], M.white, 0.05)
  g.add(shell)
  box(g, [0.85, 0.04, 0.06], [0, 0.13, 1.05], M.blue, 0.01)
  for (let i = 0; i < 5; i++) box(g, [0.07, 0.025, 0.42], [-0.24 + i * 0.12, 0.13, 0.9], M.creamDark, 0.005)
  const sw = box(g, [0.34, 0.1, 0.16], [0, 0.14, -1.25], M.crimson, 0.03)
  sw.userData.control = 'power'; ctx.refs.powerSwitch = sw
  ctx.leds.power = led(g, 0.035, [0.42, 0.13, 0.42], '#3f9e4d')
  ctx.refs.motion = g
  return g
}

function buildStrap(ctx) {
  const g = new THREE.Group()
  box(g, [0.26, 0.1, 0.34], [0, 0, 0], M.inkSoft, 0.03)
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 24), M.creamDark)
  loop.rotation.x = Math.PI / 2; loop.position.set(0, -0.03, 0.45); loop.castShadow = true
  g.add(loop)
  return g
}

export function createDock(ctx) {
  const g = new THREE.Group()
  g.position.set(3.6, 0.25, 1.8)
  box(g, [1.8, 0.35, 1.0], [0, 0, 0], M.cream, 0.08)
  box(g, [1.3, 0.08, 0.18], [0, 0.2, -0.25], M.inkSoft, 0.03)
  box(g, [0.5, 0.12, 0.08], [0, 0.02, 0.54], M.dark, 0.01)
  ctx.leds.console = led(g, 0.035, [0.65, 0.2, 0.3], '#3f9e4d')
  textPlane(g, 'CHARGE', 0.65, [0, 0.19, 0.18], { color: '#6a6e75', font: 'bold 22px ui-monospace, monospace' })
  return g
}

export const motion08 = {
  id: 'motion08',
  name: 'MOTION·08',
  cn: '体感遥控手柄',
  category: '手柄',
  era: '2008',
  tagline: '挥一挥，客厅就是游乐场。',
  inspiration: '致敬 2000 年代的体感遥控手柄',
  difficulty: 1,
  accent: '#2b6cb0',
  camera: { position: [6.6, 7.4, 9.8], target: [0, 1.2, 0] },
  parts: [
    part('bottom', '01', '底壳', 'REMOTE CASE', '白色长条底壳，电池仓与腕带接口位于机身下部。', '体感手柄把电视遥控器的外形与游戏手柄的输入结合了起来。', [0, 0.2, 0], [-3.7, 0.2, 1.7], [0, 1.0, 0], [1.5, 0.64, 2.9], buildBottom),
    part('board', '02', '主板', 'MOTION BOARD', '主板连接按键、传感器、扬声器与无线模块。', '低功耗无线连接让玩家可以离开沙发，把动作变成输入。', [0, 0.38, 0], [3.7, 0.15, -1.7], [0, 2.1, 0], [1.2, 0.25, 2.55], buildBoard),
    part('sensor', '03', '三轴传感器', '3-AXIS SENSOR', '小型传感器测量倾斜、加速度与旋转。', '三轴传感器能判断手柄朝向，让挥动、倾斜都成为操作。', [0, 0.5, -0.4], [-3.6, 0.15, -1.9], [0, 3.2, -0.4], [0.6, 0.25, 0.55], buildSensor),
    part('buttons', '04', '按键组', 'REMOTE CONTROLS', '方向键、A 键、Home 与肩键组成主要输入。', '体感并没有完全取代按键，精细操作仍然需要实体按键。', [0, 0.58, 0], [3.6, 0.2, 1.8], [0, 4.3, 0], [1.2, 0.3, 2.4], buildButtons),
    part('top', '05', '面壳', 'TOP COVER', '白色面壳露出方向键与动作键，扬声器开孔整齐排列。', '腕带是体感手柄的重要安全配件，防止激烈动作时脱手。', [0, 0.7, 0], [0, 0.2, -3.5], [0, 5.5, 0], [1.5, 0.32, 2.9], buildTop),
    part('strap', '06', '腕带', 'WRIST STRAP', '柔性腕带固定在底壳下部，套在手腕上更安心。', '体感游戏动作幅度大，腕带能显著降低手柄滑落的风险。', [0, 0.35, 1.65], [0, 0.2, 3.4], [0, 6.4, 1.7], [0.6, 0.25, 1.0], buildStrap),
  ],
  wires: [
    { id: 'battery', name: '充电触点', color: '#2b6cb0', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.48], port: [3.6, 0.27, 2.34], route: [[0, 0.15, 2.0], [1.8, 0.1, 2.4], [3.2, 0.15, 2.3]], desc: '把充电触点接到演示充电座的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'sensor', 'buttons', 'top', 'strap', 'w:battery'],
  dressing: createDock,
  showcase: { type: 'motion', intro: '体感已连接！点击 8 个靶心，手柄会跟着你的动作轻轻摇摆。', toy: true },
}
