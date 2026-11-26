// HYBRID·17 — 致敬 2017 年可拆卸握把混合掌机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, sphere, chip, textPlane, led, screw, shellWithHoles, roundButton } from '../parts.js'
import { pcbTexture, liveScreen } from '../textures.js'
import { createPC } from './key84.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [5.4, 0.34, 3.0], [0, 0, 0], M.ink, 0.14)
  box(g, [5.15, 0.06, 2.75], [0, 0.18, 0], M.inkSoft, 0.03)
  for (const [x, z] of [[-2.4, -1.25], [2.4, -1.25], [-2.4, 1.25], [2.4, 1.25]]) screw(g, [x, 0.18, z], 0.05)
  box(g, [0.42, 0.14, 0.2], [0, 0.04, 1.55], M.metalDark, 0.02)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [5.0, 0.09, 2.6], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 2.6), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 800, h: 416, seed: 81, label: 'HYBRID·17', sub: 'HYBRID CONSOLE REV A' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.046; g.add(top)
  chip(g, 0.9, 0.1, 0.78, [0, 0.05, 0], { label: 'SOC' })
  chip(g, 0.55, 0.08, 0.45, [-1.55, 0.05, 0.55], { label: 'RAM' })
  chip(g, 0.55, 0.08, 0.45, [1.55, 0.05, 0.55], {})
  return g
}

function buildScreen(ctx) {
  const g = new THREE.Group()
  box(g, [4.85, 0.14, 2.45], [0, 0, 0], M.dark, 0.05)
  const screen = liveScreen(320, 180)
  ctx.screens.hybrid = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4.55, 2.15), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.y = 0.075; g.add(glass)
  return g
}

function buildStick(parent, pos) {
  const s = new THREE.Group()
  s.position.set(...pos)
  cyl(s, 0.28, 0.32, 0.1, [0, 0.04, 0], M.dark, 22)
  cyl(s, 0.07, 0.09, 0.3, [0, 0.22, 0], M.metalDark, 14)
  const cap = sphere(s, 0.2, [0, 0.4, 0], M.inkSoft, 18); cap.scale.y = 0.55
  parent.add(s)
  return s
}

function buildLeftGrip(ctx) {
  const g = new THREE.Group()
  box(g, [1.15, 0.58, 2.85], [0, 0, 0], M.blue, 0.22)
  buildStick(g, [0, 0.3, -0.62])
  const dirs = [['left', -0.2, 0.45], ['right', 0.2, 0.45], ['up', 0, 0.25], ['down', 0, 0.65]]
  for (const [name, x, z] of dirs) {
    const k = box(g, [0.18, 0.16, 0.19], [x, 0.31, z], M.ink, 0.03)
    k.userData.button = name; ctx.buttons[name] = k
  }
  const cap = box(g, [0.28, 0.12, 0.28], [0, 0.32, 0.05], M.inkSoft, 0.04)
  cap.userData.button = 'capture'; ctx.buttons.capture = cap
  return g
}

function buildRightGrip(ctx) {
  const g = new THREE.Group()
  box(g, [1.15, 0.58, 2.85], [0, 0, 0], M.crimson, 0.22)
  buildStick(g, [0, 0.3, 0.62])
  const cols = [['a', 0, -0.62, M.green], ['b', -0.22, -0.32, M.crimson], ['x', 0.22, -0.32, M.blue], ['y', 0, -0.02, M.yellow]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.16, [x, 0.3, z], mat, 0.16)
    b.children[0].userData.button = name; ctx.buttons[name] = b
  }
  const home = roundButton(g, 0.12, [0, 0.3, 0.12], M.inkSoft, 0.12)
  home.children[0].userData.button = 'home'; ctx.buttons.home = home
  return g
}

function buildKickstand(ctx) {
  const g = new THREE.Group()
  box(g, [2.1, 0.08, 1.05], [0, 0, 0], M.metalDark, 0.04)
  box(g, [1.85, 0.04, 0.12], [0, 0.06, 0.42], M.rubberDark, 0.02)
  return g
}

function buildFrame(ctx) {
  const g = new THREE.Group()
  const frame = shellWithHoles(5.4, 3.0, 0.18, [{ x: 0, z: 0, w: 4.95, d: 2.55 }], M.inkSoft, 0.03)
  g.add(frame)
  box(g, [0.16, 0.14, 2.75], [-2.62, 0.05, 0], M.metalDark, 0.03)
  box(g, [0.16, 0.14, 2.75], [2.62, 0.05, 0], M.metalDark, 0.03)
  const sw = box(g, [0.34, 0.1, 0.18], [-2.1, 0.12, -1.25], M.ink, 0.03)
  sw.userData.control = 'power'; ctx.refs.powerSwitch = sw
  ctx.leds.power = led(g, 0.04, [-1.8, 0.12, -1.25], '#ff3b30')
  textPlane(g, 'HYBRID·17', 1.3, [0, 0.12, -1.36], { color: '#c8cdd2', font: "14px 'Press Start 2P', monospace" })
  return g
}

export const hybrid17 = {
  id: 'hybrid17',
  name: 'HYBRID·17',
  cn: '可拆卸握把掌机',
  category: '掌机',
  era: '2017',
  tagline: '从掌心到电视，一台就够。',
  inspiration: '致敬 2010 年代的混合型游戏掌机',
  difficulty: 2,
  accent: '#c8352b',
  camera: { position: [9.0, 9.2, 12.4], target: [0.5, 1.5, 0.4] },
  parts: [
    part('bottom', '01', '平板底壳', 'TABLET BACK', '深色平板底壳，USB-C 接口与散热孔位于底部。', '混合掌机把主机屏幕与控制器合为一体， docking 后又能连接电视。', [0, 0.2, 0], [-5.2, 0.2, 1.8], [0, 1.0, 0], [5.4, 0.45, 3.0], buildBottom),
    part('board', '02', '主板', 'HYBRID BOARD', '主板集成处理器、内存、无线与握把通信。', '可拆卸握把通过滑轨与无线连接，既能本地游玩也能外接显示。', [0, 0.39, 0], [5.2, 0.15, -1.8], [0, 2.1, 0], [5.0, 0.3, 2.6], buildBoard),
    part('screen', '03', '触控屏', 'TOUCH DISPLAY', '大尺寸触控屏嵌入边框，支持多点触控。', '触控屏让掌机可以同时承载传统手柄玩法和触屏小游戏。', [0, 0.54, 0], [5.3, 0.2, 1.8], [0, 3.2, 0], [4.9, 0.3, 2.5], buildScreen),
    part('leftGrip', '04', '左握把', 'LEFT GRIP', '蓝色左握把包含摇杆、方向键与截图键。', '左右握把可以单独购买，玩家能按手型与游戏需求自由组合。', [-3.05, 0.68, 0], [-5.1, 0.2, -2.0], [-3.2, 4.2, 0], [1.2, 0.8, 2.9], buildLeftGrip),
    part('rightGrip', '05', '右握把', 'RIGHT GRIP', '绯红右握把包含摇杆与 ABXY 面键。', '握把内的振动马达让爆炸、碰撞与射击有了更直接的反馈。', [3.05, 0.68, 0], [5.1, 0.2, 2.0], [3.2, 5.2, 0], [1.2, 0.8, 2.9], buildRightGrip),
    part('kickstand', '06', '支架', 'KICKSTAND', '金属支架从平板背部展开，支持桌面游玩。', '支架让掌机不用额外底座，也能在桌面上享受大屏双手操作。', [0, 0.4, 1.45], [0, 0.2, 3.7], [0, 6.2, 1.5], [2.2, 0.25, 1.1], buildKickstand),
    part('frame', '07', '边框与滑轨', 'FRAME + RAILS', '最后装上边框与两侧滑轨，握把可以顺畅卡入。', '滑轨结构让握把既能牢固锁定，也能快速拆卸收纳。', [0, 0.64, 0], [0, 0.2, -3.8], [0, 7.2, 0], [5.4, 0.28, 3.0], buildFrame),
  ],
  wires: [
    { id: 'usb', name: 'USB-C 线缆', color: '#3a3d42', plugLabel: 'A', portLabel: 'A', plug: [0, 0.4, 1.65], port: [4.9, 0.7, 3.35], route: [[0, 0.15, 2.2], [2.4, 0.1, 2.6], [4.4, 0.2, 3.1]], desc: '把 USB-C 线缆接入演示电脑的 A 端口。' },
  ],
  stepOrder: ['bottom', 'board', 'screen', 'leftGrip', 'rightGrip', 'kickstand', 'frame', 'w:usb'],
  dressing: createPC,
  showcase: { type: 'hybrid', intro: '混合掌机上线！左右移动、A 跳跃、B 射击，击退 6 个敌人。', toy: true },
}
