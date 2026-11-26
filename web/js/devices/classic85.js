// CLASSIC·85 — 致敬 1985 年经典十字键手柄（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, textPlane, led, screw, shellWithHoles, roundButton } from '../parts.js'
import { pcbTexture } from '../textures.js'
import { createMiniConsole } from './propad.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [4.2, 0.34, 1.9], [0, 0, 0], M.creamDark, 0.1)
  box(g, [3.95, 0.06, 1.65], [0, 0.18, 0], M.inkSoft, 0.03)
  box(g, [0.34, 0.16, 0.22], [0, 0.05, 1.0], M.inkSoft, 0.03)
  for (const [x, z] of [[-1.8, -0.72], [1.8, -0.72], [-1.8, 0.72], [1.8, 0.72]]) screw(g, [x, 0.18, z], 0.045)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [3.8, 0.08, 1.5], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.5), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 640, h: 256, seed: 22, label: 'CLASSIC·85', sub: 'PAD CONTROLLER REV A' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.041; g.add(top)
  box(g, [0.62, 0.1, 0.5], [0, 0.05, 0], M.dark, 0.02)
  for (let i = 0; i < 8; i++) box(g, [0.04, 0.03, 0.08], [-0.26 + i * 0.075, 0.02, 0.28], M.gold, 0.004)
  return g
}

function buildPads(ctx) {
  const g = new THREE.Group()
  box(g, [0.78, 0.05, 0.78], [-1.3, 0, 0], M.rubber, 0.04)
  for (const [x, z] of [[1.05, -0.32], [1.48, 0.28], [-0.35, 0.52], [0.35, 0.52]]) cyl(g, 0.17, 0.2, 0.06, [x, 0.02, z], M.rubber, 16)
  return g
}

function buildDpad(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.23], ['down', 0, 0.23], ['left', -0.23, 0], ['right', 0.23, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.22, 0.18, 0.24], [-1.3 + dx, 0.02, dz], M.ink, 0.035)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.1, 0.1, 0.19, [-1.3, 0.025, 0], M.ink, 16)
  return g
}

function buildButtons(ctx) {
  const g = new THREE.Group()
  const a = roundButton(g, 0.21, [1.05, 0, -0.32], M.crimson, 0.2)
  const b = roundButton(g, 0.21, [1.48, 0, 0.28], M.crimson, 0.2)
  a.children[0].userData.button = 'a'; b.children[0].userData.button = 'b'
  ctx.buttons.a = a; ctx.buttons.b = b
  const st = box(g, [0.34, 0.1, 0.14], [-0.35, 0.02, 0.52], M.inkSoft, 0.03, [0, -0.25, 0])
  const se = box(g, [0.34, 0.1, 0.14], [0.35, 0.02, 0.52], M.inkSoft, 0.03, [0, -0.25, 0])
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se; ctx.refs.powerSwitch = st
  textPlane(g, 'SELECT', 0.42, [-0.35, 0.075, 0.32], { color: '#6a6e75', font: 'bold 22px ui-monospace, monospace' })
  textPlane(g, 'START', 0.42, [0.35, 0.075, 0.32], { color: '#6a6e75', font: 'bold 22px ui-monospace, monospace' })
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(4.2, 1.9, 0.24, [
    { x: -1.3, z: 0, w: 0.86, d: 0.86 },
    { x: 1.05, z: -0.32, r: 0.24 },
    { x: 1.48, z: 0.28, r: 0.24 },
    { x: -0.35, z: 0.52, w: 0.4, d: 0.18 },
    { x: 0.35, z: 0.52, w: 0.4, d: 0.18 },
  ], M.cream, 0.05)
  g.add(shell)
  box(g, [3.9, 0.04, 0.16], [0, 0.13, -0.78], M.crimson, 0.02)
  textPlane(g, 'CLASSIC·85', 1.5, [0, 0.13, -0.48], { color: '#7a2a22', font: "15px 'Press Start 2P', monospace" })
  ctx.leds.power = led(g, 0.04, [1.75, 0.13, -0.55], '#ff3b30')
  return g
}

export const classic85 = {
  id: 'classic85',
  name: 'CLASSIC·85',
  cn: '经典十字键手柄',
  category: '手柄',
  era: '1985',
  tagline: '一块长方形，定义了游戏手感。',
  inspiration: '致敬 1980 年代的经典有线手柄',
  difficulty: 1,
  accent: '#c8352b',
  camera: { position: [7.6, 7.8, 10.4], target: [-0.6, 1.0, 0.8] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '米白长方形底壳，线缆出口位于后方。', '早期手柄没有摇杆，十字键承担了全部方向输入。', [0, 0.2, 0], [-4.4, 0.2, 1.7], [0, 1.0, 0], [4.2, 0.45, 1.9], buildBottom),
    part('board', '02', '电路板', 'CONTROL PCB', '按键触点与线缆焊点集中在小小电路板上。', '机械触点按下后导通，游戏机扫描的是通断信号。', [0, 0.36, 0], [4.4, 0.15, -1.7], [0, 2.0, 0], [3.8, 0.25, 1.5], buildBoard),
    part('pads', '03', '导电胶垫', 'RUBBER PADS', '胶垫覆盖方向键与两颗动作键，提供回弹。', '胶垫的碳粒会随时间老化，老手柄常需要更换。', [0, 0.48, 0], [-4.2, 0.15, -1.9], [0, 2.9, 0], [3.6, 0.2, 1.5], buildPads),
    part('dpad', '04', '十字键', 'D-PAD', '四向独立十字键，斜向也能准确输入。', '十字键用一个摇杆同时表达四个方向，是极具效率的发明。', [0, 0.56, 0], [4.2, 0.2, 1.8], [0, 3.8, 0], [1.0, 0.3, 1.0], buildDpad),
    part('buttons', '05', '动作键', 'A / B + START', '两颗绯红动作键与 Select / Start 就位。', 'START 与 SELECT 让游戏第一次有了明确的暂停与确认入口。', [0, 0.62, 0], [0, 0.2, 3.5], [0, 4.7, 0], [2.4, 0.3, 1.2], buildButtons),
    part('top', '06', '面壳', 'TOP COVER', '扣上面壳，只露出十字键、动作键与两颗功能键。', '极简布局让玩家不用看说明书，也能立刻理解如何操作。', [0, 0.65, 0], [0, 0.2, -3.5], [0, 5.6, 0], [4.2, 0.35, 1.9], buildTop),
  ],
  wires: [
    { id: 'cable', name: '手柄线缆', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.12], port: [-4.6, 0.35, 3.5], route: [[0, 0.15, 1.9], [-1.8, 0.1, 2.8], [-3.4, 0.15, 3.3]], desc: '把手柄线缆插入演示主机的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'pads', 'dpad', 'buttons', 'top', 'w:cable'],
  dressing: createMiniConsole,
  showcase: { type: 'padtest', intro: '手柄上线！按顺序完成 ↑ → ↓ ← A B START。', sequence: ['up', 'right', 'down', 'left', 'a', 'b', 'start'] },
}
