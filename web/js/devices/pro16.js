// PRO·16 — 致敬 2016 年现代双手柄（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, sphere, textPlane, led, screw, shellWithHoles, tray, roundButton } from '../parts.js'
import { pcbTexture } from '../textures.js'
import { createPC } from './key84.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  tray(g, 5.0, 2.6, 0.39, M.ink, { bottomY: -0.21, base: 0.12, thickness: 0.12 })
  for (const [x, z] of [[-2.15, -1.0], [2.15, -1.0], [-2.15, 1.0], [2.15, 1.0]]) {
    cyl(g, 0.08, 0.09, 0.22, [x, 0.28, z], M.gold, 12)
    screw(g, [x, 0.22, z], 0.05)
  }
  box(g, [0.4, 0.16, 0.22], [0, 0.06, 1.35], M.inkSoft, 0.03)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [4.6, 0.09, 2.2], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 736, h: 352, seed: 71, label: 'PRO·16', sub: 'WIRELESS PAD REV C' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.046; g.add(top)
  box(g, [0.82, 0.12, 0.66], [0, 0.06, 0], M.dark, 0.03)
  for (let i = 0; i < 4; i++) box(g, [0.3, 0.08, 0.24], [-1.6 + i * 1.05, 0.05, -0.72], M.dark, 0.02)
  return g
}

function buildSticks(ctx) {
  const g = new THREE.Group()
  ctx.refs.sticks = []
  for (const [x, z] of [[-1.45, 0.55], [0.55, -0.5]]) {
    const s = new THREE.Group()
    s.position.set(x, 0, z)
    cyl(s, 0.32, 0.36, 0.1, [0, 0.05, 0], M.dark, 24)
    cyl(s, 0.08, 0.1, 0.34, [0, 0.24, 0], M.metalDark, 16)
    const cap = sphere(s, 0.22, [0, 0.44, 0], M.inkSoft, 20); cap.scale.y = 0.55
    g.add(s); ctx.refs.sticks.push(s)
  }
  return g
}

function buildDpad(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.2], ['down', 0, 0.2], ['left', -0.2, 0], ['right', 0.2, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.19, 0.16, 0.21], [-1.45 + dx, 0.02, -0.55 + dz], M.ink, 0.03)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.09, 0.09, 0.17, [-1.45, 0.025, -0.55], M.ink, 16)
  return g
}

function buildFaceButtons(ctx) {
  const g = new THREE.Group()
  const cols = [['a', 1.75, 0.45, M.green], ['b', 1.35, 0.05, M.crimson], ['x', 1.15, 0.45, M.blue], ['y', 1.75, -0.05, M.yellow]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.18, [x, 0, z], mat, 0.18)
    b.children[0].userData.button = name; ctx.buttons[name] = b
  }
  const st = box(g, [0.32, 0.09, 0.13], [0.45, 0.02, 0.92], M.inkSoft, 0.03)
  const se = box(g, [0.32, 0.09, 0.13], [-0.15, 0.02, 0.92], M.inkSoft, 0.03)
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se; ctx.refs.powerSwitch = st
  return g
}

function buildTriggers(ctx) {
  const g = new THREE.Group()
  const l = box(g, [1.1, 0.2, 0.3], [-1.45, 0.02, -1.02], M.inkSoft, 0.06)
  const r = box(g, [1.1, 0.2, 0.3], [1.45, 0.02, -1.02], M.inkSoft, 0.06)
  l.userData.button = 'l'; r.userData.button = 'r'; ctx.buttons.l = l; ctx.buttons.r = r
  box(g, [1.25, 0.08, 0.68], [0, 0.04, -0.55], M.dark, 0.05)
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(5.0, 2.6, 0.26, [
    { x: -1.45, z: 0.55, r: 0.36 }, { x: 0.55, z: -0.5, r: 0.36 },
    { x: -1.45, z: -0.55, w: 0.82, d: 0.82 },
    { x: 1.75, z: 0.45, r: 0.21 }, { x: 1.35, z: 0.05, r: 0.21 }, { x: 1.15, z: 0.45, r: 0.21 }, { x: 1.75, z: -0.05, r: 0.21 },
    { x: 0.15, z: 0.92, w: 1.05, d: 0.24 },
    { x: 0, z: -0.55, w: 1.35, d: 0.78 },
  ], M.inkSoft, 0.05)
  g.add(shell)
  const barMat = new THREE.MeshStandardMaterial({ color: '#2b6cb0', emissive: '#2b6cb0', emissiveIntensity: 0, roughness: 0.3 })
  const bar = box(g, [0.65, 0.05, 0.08], [0, 0.16, -1.18], barMat, 0.02)
  ctx.leds.power = bar
  textPlane(g, 'PRO·16', 1.25, [0, 0.16, -0.98], { color: '#c8cdd2', font: "14px 'Press Start 2P', monospace" })
  return g
}

export const pro16 = {
  id: 'pro16',
  name: 'PRO·16',
  cn: '现代无线双手柄',
  category: '手柄',
  era: '2016',
  tagline: '双摇杆、肩键，还有一条灯带。',
  inspiration: '致敬 2010 年代的现代无线手柄',
  difficulty: 2,
  accent: '#f26322',
  camera: { position: [8.4, 8.6, 11.4], target: [0.5, 1.1, 0.5] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '深色底壳为双摇杆、触控板与肩键预留安装位。', '现代手柄强调双手对称握持，长时间游玩也不容易疲劳。', [0, 0.2, 0], [-5.0, 0.2, 1.8], [0, 1.0, 0], [5.0, 0.6, 2.6], buildBottom),
    part('board', '02', '主板', 'WIRELESS BOARD', '主板整合摇杆、按键、无线与灯带控制。', '无线手柄仍需要定期充电，低延迟连接比线缆更重要。', [0, 0.4, 0], [5.0, 0.15, -1.8], [0, 2.1, 0], [4.6, 0.3, 2.2], buildBoard),
    part('sticks', '03', '双摇杆', 'DUAL STICKS', '左右摇杆分别负责移动与视角，防滑帽可拆换。', '双摇杆让 3D 游戏可以同时控制角色移动和摄像机转向。', [0, 0.52, 0], [-4.8, 0.2, -2.0], [0, 3.2, 0], [3.6, 0.8, 1.8], buildSticks),
    part('dpad', '04', '十字键', 'D-PAD', '左侧十字键保留菜单与快捷操作。', '摇杆适合连续移动，十字键在菜单和精确选择中仍然更好用。', [0, 0.58, 0], [4.8, 0.2, 1.9], [0, 4.2, 0], [1.0, 0.3, 1.0], buildDpad),
    part('faceButtons', '05', '面键', 'FACE BUTTONS', '四颗彩色面键与 Start / Select 安装完成。', '彩色面键不仅是装饰，也让玩家在盲操作时快速区分按键。', [0, 0.64, 0], [0, 0.2, 3.6], [0, 5.2, 0], [2.4, 0.3, 1.4], buildFaceButtons),
    part('triggers', '06', '肩键与触控板', 'TRIGGERS + TOUCHPAD', 'L / R 肩键与中央触控板就位。', '触控板为滑动、缩放和多点操作提供了新的输入面。', [0, 0.68, 0], [0, 0.2, -3.6], [0, 6.2, 0], [3.8, 0.35, 1.6], buildTriggers),
    part('top', '07', '面壳', 'TOP COVER', '扣上面壳，灯条在握把之间亮起。', '灯条可以表示玩家编号、电量或游戏状态，成为新的信息通道。', [0, 0.72, 0], [0, 0.2, 3.8], [0, 7.2, 0], [5.0, 0.36, 2.6], buildTop),
  ],
  wires: [
    { id: 'usb', name: 'USB 充电线', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.47], port: [4.9, 0.7, 3.35], route: [[0, 0.15, 2.0], [2.2, 0.1, 2.4], [4.4, 0.2, 3.1]], desc: '把 USB 充电线插入演示电脑的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'sticks', 'dpad', 'faceButtons', 'triggers', 'top', 'w:usb'],
  dressing: createPC,
  showcase: { type: 'padtest', intro: '双手柄上线！依次触发 L R ↑ → A B X Y START。', sequence: ['l', 'r', 'up', 'right', 'a', 'b', 'x', 'y', 'start'] },
}
