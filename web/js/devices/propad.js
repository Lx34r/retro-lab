// PROPAD·90 — 致敬 1990 年四色按键手柄（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, sphere, chip, textPlane, led, shellWithHoles, tray, roundButton } from '../parts.js'
import { pcbTexture } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  tray(g, 4.0, 2.0, 0.31, M.grayLight, { bottomY: -0.15, base: 0.1, thickness: 0.1 })
  const gl = sphere(g, 0.55, [-1.85, -0.08, 0.35], M.grayLight, 20); gl.scale.set(1, 0.6, 1.1)
  const gr = sphere(g, 0.55, [1.85, -0.08, 0.35], M.grayLight, 20); gr.scale.set(1, 0.6, 1.1)
  // 线缆出口
  box(g, [0.3, 0.16, 0.2], [0, 0.05, 1.0], M.inkSoft, 0.03)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [3.4, 0.08, 1.5], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.5), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 512, h: 256, seed: 5, label: 'PROPAD·90', sub: 'REV C' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.041; g.add(top)
  cyl(g, 0.28, 0.28, 0.06, [0, 0.06, -0.2], M.dark, 20) // 牛屎芯片
  chip(g, 0.3, 0.05, 0.24, [-1.0, 0.04, 0.3], { pins: false })
  chip(g, 0.3, 0.05, 0.24, [1.0, 0.04, 0.3], { pins: false })
  return g
}

function buildPads(ctx) {
  const g = new THREE.Group()
  box(g, [3.5, 0.05, 1.6], [0, 0, 0], M.rubber, 0.04)
  const domes = [[-1.3, 0], [1.3, -0.4], [0.95, 0], [1.65, 0], [1.3, 0.4], [-0.25, 0.45], [0.25, 0.45]]
  for (const [x, z] of domes) cyl(g, 0.13, 0.16, 0.06, [x, 0.05, z], M.rubberDark, 14)
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  // 十字键（四向独立）
  const dirs = [['up', 0, -0.21], ['down', 0, 0.21], ['left', -0.21, 0], ['right', 0.21, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.2, 0.2, 0.22], [-1.3 + dx, 0.02, dz], M.ink, 0.04)
    k.userData.button = name
    ctx.buttons[name] = k
  }
  cyl(g, 0.09, 0.09, 0.21, [-1.3, 0.02, 0], M.ink, 14)
  // 四色按键
  const cols = [['x', 1.3, -0.4, M.blue], ['y', 0.95, 0, M.green], ['a', 1.65, 0, M.red], ['b', 1.3, 0.4, M.yellow]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.19, [x, 0, z], mat, 0.22)
    b.children[0].userData.button = name
    ctx.buttons[name] = b
    textPlane(g, name.toUpperCase(), 0.15, [x, 0.225, z], { color: '#fff', font: 'bold 40px ui-monospace, monospace' })
  }
  const st = box(g, [0.32, 0.1, 0.13], [-0.25, 0.02, 0.45], M.inkSoft, 0.04, [0, -0.3, 0])
  const se = box(g, [0.32, 0.1, 0.13], [0.25, 0.02, 0.45], M.inkSoft, 0.04, [0, -0.3, 0])
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se
  return g
}

function buildShoulders(ctx) {
  const g = new THREE.Group()
  const l = box(g, [0.95, 0.16, 0.3], [-1.3, 0, 0], M.gray, 0.06)
  const r = box(g, [0.95, 0.16, 0.3], [1.3, 0, 0], M.gray, 0.06)
  l.userData.button = 'l'; r.userData.button = 'r'
  ctx.buttons.l = l; ctx.buttons.r = r
  textPlane(g, 'L', 0.2, [-1.3, 0.085, 0], { color: '#5c6167', font: 'bold 40px ui-monospace, monospace' })
  textPlane(g, 'R', 0.2, [1.3, 0.085, 0], { color: '#5c6167', font: 'bold 40px ui-monospace, monospace' })
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(4.0, 2.0, 0.28, [
    { x: -1.3, z: 0, r: 0.46 },
    { x: 1.3, z: -0.4, r: 0.22 }, { x: 0.95, z: 0, r: 0.22 },
    { x: 1.65, z: 0, r: 0.22 }, { x: 1.3, z: 0.4, r: 0.22 },
    { x: -0.25, z: 0.45, w: 0.36, d: 0.15 }, { x: 0.25, z: 0.45, w: 0.36, d: 0.15 },
  ], M.grayLight, 0.05)
  g.add(shell)
  box(g, [2.3, 0.05, 1.3], [0.85, 0.13, 0], M.inkSoft, 0.06)
  textPlane(g, 'PROPAD·90', 1.2, [-0.3, 0.15, -0.72], { color: '#5c6167', font: "13px 'Press Start 2P', monospace" })
  textPlane(g, 'RETO·LAB', 0.7, [-1.3, 0.15, 0.75], { color: '#8a8f96', font: "10px 'Press Start 2P', monospace" })
  return g
}

// 演示主机（线缆插入目标）
export function createMiniConsole(ctx) {
  const g = new THREE.Group()
  g.position.set(-4.6, 0.3, 2.8)
  box(g, [1.7, 0.6, 1.3], [0, 0, 0], M.cream, 0.08)
  box(g, [1.7, 0.1, 0.4], [0, 0.3, -0.2], M.crimson, 0.02)
  box(g, [0.5, 0.18, 0.1], [0, 0.05, 0.66], M.inkSoft, 0.02)
  const portLed = led(g, 0.035, [0.6, 0.32, 0.4], '#3f9e4d')
  ctx.leds.console = portLed
  textPlane(g, 'RETO·DECK', 0.9, [0, 0.36, 0.2], { color: '#7a2a22', font: "11px 'Press Start 2P', monospace" })
  return g
}

export const propad90 = {
  id: 'propad90',
  name: 'PROPAD·90',
  cn: '四色手柄',
  category: '手柄',
  era: '1990',
  tagline: '四个彩键，定义了一个时代的手感。',
  inspiration: '致敬 1990 年的四色按键手柄',
  difficulty: 1,
  accent: '#2b6cb0',
  camera: { position: [7.6, 8.2, 10.6], target: [-0.6, 0.8, 0.8] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM SHELL', '浅灰底壳，两端微微鼓起贴合掌心。', '手柄的握持曲线，是人体工学最早的游戏实践。', [0, 0.15, 0], [-4.4, 0.2, -1.8], [0, 1.0, 0], [4.0, 0.46, 2.0], buildBottom),
    part('board', '02', '电路板', 'CONTROL PCB', '小巧的电路板，中央是一颗封装芯片。', '手柄芯片每秒扫描按键上百次，确保零延迟。', [0, 0.3, 0], [4.4, 0.15, -1.9], [0, 2.0, 0], [3.4, 0.2, 1.5], buildBoard),
    part('pads', '03', '导电胶垫', 'CONDUCTIVE PADS', '整片导电胶垫覆盖按键区，回弹手感的来源。', '导电胶垫的寿命，决定了老手柄还能不能战。', [0, 0.43, 0], [-4.2, 0.15, 1.9], [0, 2.9, 0], [3.5, 0.15, 1.6], buildPads),
    part('buttons', '04', '按键组', 'BUTTON SET', '十字键 + 蓝绿红黄四色键 + Start/Select。', '四色按键的布局，成为后来无数手柄的模板。', [0, 0.55, 0], [4.2, 0.2, 1.9], [0, 3.8, 0], [3.6, 0.3, 1.6], buildButtons),
    part('shoulders', '05', '肩键组', 'SHOULDER L / R', 'L / R 肩键装在顶端边缘，食指的自然落点。', '肩键的加入，让游戏操作第一次有了「层次」。', [0, 0.52, -1.0], [0, 0.2, 3.6], [0, 4.6, -1.0], [3.0, 0.2, 0.4], buildShoulders),
    part('top', '06', '面壳', 'TOP SHELL', '扣上面壳，深灰按键区与浅灰机身形成经典撞色。', '撞色设计让按键区一眼可辨，无需低头看手。', [0, 0.6, 0], [0, 0.25, -3.6], [0, 5.5, 0], [4.0, 0.4, 2.0], buildTop),
  ],
  wires: [
    { id: 'cable', name: '手柄线缆', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.1], port: [-4.6, 0.35, 3.5], route: [[0, 0.15, 2.0], [-1.6, 0.08, 3.0], [-3.3, 0.15, 3.4]], desc: '把手柄线缆插头插入演示主机的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'pads', 'buttons', 'shoulders', 'top', 'w:cable'],
  dressing: createMiniConsole,
  showcase: { type: 'padtest', intro: '按键测试：按顺序点亮 ↑ → B A START。点 3D 按键或下方按钮。', sequence: ['up', 'right', 'b', 'a', 'start'] },
}