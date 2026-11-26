// ANALOG·97 — 致敬 1997 年三握柄摇杆手柄（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, sphere, textPlane, led, screw, shellWithHoles, roundButton } from '../parts.js'
import { pcbTexture } from '../textures.js'
import { createMiniConsole } from './propad.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [4.6, 0.42, 2.6], [0, 0, 0], M.ink, 0.16)
  box(g, [4.35, 0.07, 2.35], [0, 0.22, 0], M.inkSoft, 0.04)
  for (const [x, z] of [[-1.95, -1.0], [1.95, -1.0], [-1.95, 1.0], [1.95, 1.0]]) {
    cyl(g, 0.08, 0.09, 0.22, [x, 0.28, z], M.gold, 12)
    screw(g, [x, 0.22, z], 0.05)
  }
  box(g, [0.36, 0.16, 0.24], [0, 0.06, 1.35], M.inkSoft, 0.03)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [4.2, 0.09, 2.2], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.2), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 672, h: 352, seed: 41, label: 'ANALOG·97', sub: '3D STICK REV B' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.046; g.add(top)
  box(g, [0.78, 0.12, 0.64], [0, 0.06, 0.2], M.dark, 0.03)
  for (let i = 0; i < 4; i++) box(g, [0.28, 0.08, 0.22], [-1.45 + i * 0.95, 0.05, -0.7], M.dark, 0.02)
  return g
}

function buildStick(ctx) {
  const g = new THREE.Group()
  cyl(g, 0.38, 0.42, 0.12, [0, 0.06, 0], M.dark, 24)
  cyl(g, 0.09, 0.11, 0.42, [0, 0.28, 0], M.metalDark, 16)
  const cap = sphere(g, 0.25, [0, 0.52, 0], M.inkSoft, 20)
  cap.scale.y = 0.55
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3
    cyl(g, 0.025, 0.025, 0.025, [Math.cos(a) * 0.17, 0.64, Math.sin(a) * 0.17], M.gray, 8)
  }
  ctx.refs.stick = g
  return g
}

function buildDpad(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.22], ['down', 0, 0.22], ['left', -0.22, 0], ['right', 0.22, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.21, 0.18, 0.23], [-1.45 + dx, 0.02, -0.45 + dz], M.ink, 0.035)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.1, 0.1, 0.19, [-1.45, 0.025, -0.45], M.ink, 16)
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  const cols = [['a', 1.55, 0.25, M.blue], ['b', 1.15, -0.35, M.green], ['c', 1.9, -0.35, M.yellow]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.2, [x, 0, z], mat, 0.2)
    b.children[0].userData.button = name; ctx.buttons[name] = b
  }
  const l = box(g, [0.95, 0.18, 0.28], [-1.35, 0.02, -1.05], M.inkSoft, 0.06)
  const r = box(g, [0.95, 0.18, 0.28], [1.35, 0.02, -1.05], M.inkSoft, 0.06)
  l.userData.button = 'l'; r.userData.button = 'r'; ctx.buttons.l = l; ctx.buttons.r = r
  const st = box(g, [0.36, 0.1, 0.14], [0, 0.02, 0.9], M.crimson, 0.03)
  st.userData.button = 'start'; ctx.buttons.start = st; ctx.refs.powerSwitch = st
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(4.6, 2.6, 0.28, [
    { x: 0, z: 0.2, r: 0.43 },
    { x: -1.45, z: -0.45, w: 0.86, d: 0.86 },
    { x: 1.55, z: 0.25, r: 0.23 }, { x: 1.15, z: -0.35, r: 0.23 }, { x: 1.9, z: -0.35, r: 0.23 },
    { x: 0, z: 0.9, w: 0.42, d: 0.18 },
  ], M.inkSoft, 0.05)
  g.add(shell)
  textPlane(g, 'ANALOG·97', 1.65, [0, 0.16, -0.9], { color: '#c8cdd2', font: "16px 'Press Start 2P', monospace" })
  ctx.leds.power = led(g, 0.045, [1.95, 0.16, 0.85], '#3f9e4d')
  return g
}

export const analog97 = {
  id: 'analog97',
  name: 'ANALOG·97',
  cn: '三握柄摇杆手柄',
  category: '手柄',
  era: '1997',
  tagline: '手柄开始有了第三个方向。',
  inspiration: '致敬 1990 年代的三握柄模拟手柄',
  difficulty: 2,
  accent: '#3f9e4d',
  camera: { position: [8.0, 8.2, 10.8], target: [0, 1.1, 0] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '深色底壳为中央摇杆、十字键与动作键预留位置。', '三握柄布局让玩家可以用不同手指分别控制摇杆、方向键和动作键。', [0, 0.2, 0], [-4.6, 0.2, 1.8], [0, 1.0, 0], [4.6, 0.5, 2.6], buildBottom),
    part('board', '02', '主板', 'ANALOG BOARD', '主板读取摇杆电位计与按键触点，输出连续方向信号。', '模拟摇杆输出的是电压变化，而不是简单的通断信号。', [0, 0.4, 0], [4.6, 0.15, -1.8], [0, 2.1, 0], [4.2, 0.3, 2.2], buildBoard),
    part('stick', '03', '摇杆', 'ANALOG STICK', '中央摇杆由底座、轴杆与防滑帽组成。', '摇杆帽上的凹槽能帮助手指感知中心位置，提升操控精度。', [0, 0.52, 0.2], [-4.5, 0.2, -2.0], [0, 3.2, 0.2], [1.0, 0.9, 1.0], buildStick),
    part('dpad', '04', '十字键', 'D-PAD', '左侧十字键保留数字方向输入。', '十字键适合菜单与精确移动，摇杆更适合连续转向。', [0, 0.58, 0], [4.5, 0.2, 1.9], [0, 4.2, 0], [1.0, 0.3, 1.0], buildDpad),
    part('buttons', '05', '动作键与肩键', 'A / B / C + L / R', '蓝绿黄三颗动作键与 L / R 肩键安装到位。', '肩键把操作从掌心延伸到食指，手柄输入维度再次增加。', [0, 0.64, 0], [0, 0.2, 3.6], [0, 5.2, 0], [3.8, 0.35, 1.8], buildButtons),
    part('top', '06', '面壳', 'TOP COVER', '扣上面壳，中央摇杆与三颗彩色动作键形成标志布局。', '三握柄外形像一只张开的手，也在暗示玩家尝试新的握持方式。', [0, 0.73, 0], [0, 0.2, -3.6], [0, 6.2, 0], [4.6, 0.38, 2.6], buildTop),
  ],
  wires: [
    { id: 'cable', name: '手柄线缆', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.47], port: [-4.6, 0.35, 3.5], route: [[0, 0.15, 2.1], [-1.8, 0.1, 2.9], [-3.4, 0.15, 3.3]], desc: '把手柄线缆插入演示主机的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'stick', 'dpad', 'buttons', 'top', 'w:cable'],
  dressing: createMiniConsole,
  showcase: { type: 'analog', intro: '摇杆已校准！用方向键移动迷宫中的光标，走到绿色出口。', toy: true },
}
