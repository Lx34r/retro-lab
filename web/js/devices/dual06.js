// DUAL·06 — 致敬 2006 年双屏翻盖掌机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles, roundButton } from '../parts.js'
import { pcbTexture, liveScreen } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  box(g, [4.4, 0.34, 2.6], [0, 0, 0], M.ink, 0.12)
  box(g, [4.15, 0.06, 2.35], [0, 0.18, 0], M.inkSoft, 0.03)
  for (const [x, z] of [[-1.9, -1.05], [1.9, -1.05], [-1.9, 1.05], [1.9, 1.05]]) screw(g, [x, 0.18, z], 0.05)
  box(g, [0.6, 0.12, 0.18], [0, 0.03, 1.35], M.dark, 0.02)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [4.0, 0.09, 2.2], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.2), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 640, h: 352, seed: 51, label: 'DUAL·06', sub: 'DUAL SCREEN REV D' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.046; g.add(top)
  chip(g, 0.75, 0.1, 0.65, [-0.5, 0.05, -0.25], { label: 'CPU' })
  chip(g, 0.52, 0.08, 0.42, [1.15, 0.05, 0.45], { label: 'RAM' })
  box(g, [1.1, 0.1, 0.22], [0, 0.05, -0.9], M.white, 0.01)
  return g
}

function buildLowerScreen(ctx) {
  const g = new THREE.Group()
  box(g, [3.0, 0.14, 1.85], [0, 0, 0], M.metalDark, 0.04)
  const screen = liveScreen(256, 192)
  ctx.screens.dualBottom = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.72, 1.58), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.y = 0.075; g.add(glass)
  box(g, [0.7, 0.025, 0.65], [0.7, -0.03, 1.2], M.yellow, 0.005)
  return g
}

function buildControls(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.2], ['down', 0, 0.2], ['left', -0.2, 0], ['right', 0.2, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.19, 0.17, 0.21], [-1.65 + dx, 0.02, 0.25 + dz], M.ink, 0.03)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.09, 0.09, 0.18, [-1.65, 0.025, 0.25], M.ink, 16)
  const cols = [['x', 1.55, 0.0, M.blue], ['a', 1.9, 0.28, M.green], ['b', 1.55, 0.58, M.yellow], ['y', 1.2, 0.28, M.crimson]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.16, [x, 0, z], mat, 0.17)
    b.children[0].userData.button = name; ctx.buttons[name] = b
  }
  const st = box(g, [0.3, 0.09, 0.13], [-0.35, 0.02, 0.92], M.inkSoft, 0.03)
  const se = box(g, [0.3, 0.09, 0.13], [0.35, 0.02, 0.92], M.inkSoft, 0.03)
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se
  return g
}

function buildHinges(ctx) {
  const g = new THREE.Group()
  for (const x of [-1.7, 1.7]) {
    cyl(g, 0.14, 0.14, 0.7, [x, 0, 0], M.metalDark, 20, [0, 0, Math.PI / 2])
    cyl(g, 0.17, 0.17, 0.18, [x - 0.28, 0, 0], M.inkSoft, 20, [0, 0, Math.PI / 2])
    cyl(g, 0.17, 0.17, 0.18, [x + 0.28, 0, 0], M.inkSoft, 20, [0, 0, Math.PI / 2])
  }
  return g
}

function buildUpperScreen(ctx) {
  const g = new THREE.Group()
  const pivot = new THREE.Group()
  pivot.rotation.x = 0.95
  box(pivot, [4.4, 0.26, 2.6], [0, 0, -1.3], M.inkSoft, 0.08)
  box(pivot, [3.7, 0.08, 2.05], [0, 0.15, -1.3], M.dark, 0.04)
  const screen = liveScreen(256, 192)
  ctx.screens.dualTop = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.42, 1.78), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.set(0, 0.2, -1.3); pivot.add(glass)
  for (let i = 0; i < 6; i++) {
    cyl(pivot, 0.045, 0.045, 0.035, [-0.35 + (i % 3) * 0.18, 0.16, -2.35 + Math.floor(i / 3) * 0.18], M.dark, 8)
  }
  const sw = box(pivot, [0.32, 0.1, 0.18], [1.75, 0.17, -2.25], M.ink, 0.03)
  sw.userData.control = 'power'; ctx.refs.powerSwitch = sw
  ctx.leds.power = led(pivot, 0.04, [1.4, 0.17, -2.25], '#ff3b30')
  textPlane(pivot, 'DUAL·06', 1.3, [0, 0.17, -2.42], { color: '#c8cdd2', font: "14px 'Press Start 2P', monospace" })
  g.add(pivot)
  ctx.refs.upperLid = pivot
  return g
}

export const dual06 = {
  id: 'dual06',
  name: 'DUAL·06',
  cn: '双屏翻盖掌机',
  category: '掌机',
  era: '2006',
  tagline: '上下两块屏，打开新玩法。',
  inspiration: '致敬 2000 年代的双屏翻盖掌机',
  difficulty: 2,
  accent: '#2b6cb0',
  camera: { position: [9.0, 9.4, 12.2], target: [0, 1.8, -0.4] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '深色底壳承载下屏、主板与按键区。', '双屏掌机把菜单、地图与游戏画面分布到不同屏幕，拓宽了信息空间。', [0, 0.2, 0], [-4.8, 0.2, 1.8], [0, 1.0, 0], [4.4, 0.45, 2.6], buildBottom),
    part('board', '02', '主板', 'DUAL MAIN BOARD', '主板同时连接上下两块屏幕与触控输入层。', '下屏触控层让玩家可以直接点按画面，而不只依赖实体按键。', [0, 0.38, 0], [4.8, 0.15, -1.8], [0, 2.1, 0], [4.0, 0.3, 2.2], buildBoard),
    part('lowerScreen', '03', '下屏', 'TOUCH LCD', '下屏嵌入金属框，表面覆盖透明触控层。', '触控笔与下屏让文字输入、画图和菜单操作变得更直观。', [0, 0.52, 0.1], [4.9, 0.2, 1.8], [0, 3.2, 0.1], [3.1, 0.3, 1.95], buildLowerScreen),
    part('controls', '04', '按键组', 'CONTROL SET', '十字键、ABXY 与 Start / Select 位于下屏两侧。', '双屏掌机保留了传统掌机手感，同时加入触控这种新输入方式。', [0, 0.62, 0.25], [-4.7, 0.2, 2.0], [0, 4.2, 0.25], [3.6, 0.3, 1.8], buildControls),
    part('hinges', '05', '转轴', 'HINGE SET', '左右转轴连接上下机身，并容纳屏幕排线。', '翻盖结构在合上时保护屏幕，也改变了掌机的携带方式。', [0, 0.58, -1.0], [0, 0.2, 3.6], [0, 5.2, -1.0], [3.8, 0.35, 0.5], buildHinges),
    part('upperScreen', '06', '上屏与翻盖', 'UPPER LCD + LID', '上屏安装在翻盖内，打开后形成自然的观看角度。', '上下双屏可以显示不同视角，也能把操作提示与游戏世界分开。', [0, 0.72, -1.0], [0, 0.2, -3.8], [0, 6.3, -1.0], [4.4, 2.6, 2.8], buildUpperScreen),
  ],
  wires: [
    { id: 'ribbon', name: '双屏排线', color: '#e8a020', plugLabel: 'A', portLabel: 'A', plug: [0, 0.72, -0.95], port: [0, 0.43, -0.9], route: [[0, 0.6, -0.95], [0, 0.5, -0.92]], desc: '把上屏排线穿过转轴，接入主板 A 插座。' },
  ],
  stepOrder: ['bottom', 'board', 'lowerScreen', 'controls', 'hinges', 'upperScreen', 'w:ribbon'],
  showcase: { type: 'dual', intro: '双屏同步完成！看上屏给出的方向序列，再用方向键在下屏复现。', toy: true },
}
