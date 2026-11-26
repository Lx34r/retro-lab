// COLOR·93 — 致敬 1993 年彩色 LCD 掌机（原创程序化模型）
import * as THREE from 'three'
import { M, box, cyl, chip, textPlane, led, screw, shellWithHoles, tray, roundButton } from '../parts.js'
import { pcbTexture, liveScreen } from '../textures.js'

const part = (id, num, name, en, desc, fact, slot, home, exploded, size, build) =>
  ({ id, num, name, en, desc, fact, slot, home, exploded, size, build })

function buildBottom(ctx) {
  const g = new THREE.Group()
  tray(g, 5.2, 2.8, 0.42, M.ink, { bottomY: -0.2, base: 0.12, thickness: 0.12 })
  for (const [x, z] of [[-2.25, -1.15], [2.25, -1.15], [-2.25, 1.15], [2.25, 1.15]]) {
    cyl(g, 0.09, 0.1, 0.22, [x, 0.27, z], M.gold, 12)
    screw(g, [x, 0.2, z], 0.055)
  }
  box(g, [1.5, 0.12, 0.65], [0, 0.25, 1.0], M.dark, 0.03)
  return g
}

function buildBoard(ctx) {
  const g = new THREE.Group()
  box(g, [4.8, 0.09, 2.35], [0, 0, 0], M.pcb, 0.03)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.35), new THREE.MeshStandardMaterial({ map: pcbTexture({ w: 768, h: 384, seed: 31, label: 'COLOR·93', sub: 'COLOR CPU REV C' }), roughness: 0.5 }))
  top.rotation.x = -Math.PI / 2; top.position.y = 0.046; g.add(top)
  chip(g, 0.82, 0.1, 0.72, [-0.3, 0.05, -0.35], { label: 'CPU' })
  chip(g, 0.58, 0.08, 0.48, [1.25, 0.05, 0.45], { label: 'RAM' })
  chip(g, 0.4, 0.07, 0.34, [-1.6, 0.05, 0.55], {})
  box(g, [1.0, 0.1, 0.22], [0.2, 0.05, 0.95], M.white, 0.01)
  return g
}

function buildScreen(ctx) {
  const g = new THREE.Group()
  box(g, [3.25, 0.18, 2.15], [0, 0, 0], M.metalDark, 0.04)
  const screen = liveScreen(240, 160)
  ctx.screens.color = screen
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.85), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }))
  glass.rotation.x = -Math.PI / 2; glass.position.y = 0.095; g.add(glass)
  box(g, [0.65, 0.03, 0.55], [0.85, -0.04, 1.0], M.yellow, 0.005)
  return g
}

function buildPads(ctx) {
  const g = new THREE.Group()
  box(g, [0.72, 0.06, 0.72], [-1.85, 0, 0.1], M.rubber, 0.03)
  for (const [x, z] of [[1.75, -0.35], [2.2, 0.2], [1.55, 0.55]]) cyl(g, 0.18, 0.21, 0.07, [x, 0.02, z], M.rubber, 16)
  box(g, [0.32, 0.05, 0.13], [-0.2, 0, 0.9], M.rubber, 0.02)
  box(g, [0.32, 0.05, 0.13], [0.25, 0, 0.9], M.rubber, 0.02)
  return g
}

function buildControls(ctx) {
  const g = new THREE.Group()
  const dirs = [['up', 0, -0.22], ['down', 0, 0.22], ['left', -0.22, 0], ['right', 0.22, 0]]
  for (const [name, dx, dz] of dirs) {
    const k = box(g, [0.2, 0.18, 0.22], [-1.85 + dx, 0.02, 0.1 + dz], M.ink, 0.035)
    k.userData.button = name; ctx.buttons[name] = k
  }
  cyl(g, 0.1, 0.1, 0.19, [-1.85, 0.025, 0.1], M.ink, 16)
  const cols = [['a', 2.2, 0.2, M.crimson], ['b', 1.75, -0.35, M.blue], ['x', 1.55, 0.55, M.green]]
  for (const [name, x, z, mat] of cols) {
    const b = roundButton(g, 0.2, [x, 0, z], mat, 0.2)
    b.children[0].userData.button = name; ctx.buttons[name] = b
  }
  const st = box(g, [0.34, 0.1, 0.14], [-0.2, 0.02, 0.9], M.inkSoft, 0.03, [0, -0.3, 0])
  const se = box(g, [0.34, 0.1, 0.14], [0.25, 0.02, 0.9], M.inkSoft, 0.03, [0, -0.3, 0])
  st.userData.button = 'start'; se.userData.button = 'select'
  ctx.buttons.start = st; ctx.buttons.select = se; ctx.refs.powerSwitch = st
  return g
}

function buildSpeaker(ctx) {
  const g = new THREE.Group()
  box(g, [0.85, 0.12, 0.7], [0, 0, 0], M.dark, 0.04)
  for (let i = 0; i < 8; i++) cyl(g, 0.035, 0.035, 0.04, [-0.28 + (i % 4) * 0.18, 0.07, -0.16 + Math.floor(i / 4) * 0.32], M.metalDark, 8)
  return g
}

function buildTop(ctx) {
  const g = new THREE.Group()
  const shell = shellWithHoles(5.2, 2.8, 0.28, [
    { x: 0, z: -0.2, w: 3.35, d: 2.2 },
    { x: -1.85, z: 0.1, w: 0.85, d: 0.85 },
    { x: 2.2, z: 0.2, r: 0.23 }, { x: 1.75, z: -0.35, r: 0.23 }, { x: 1.55, z: 0.55, r: 0.23 },
    { x: -0.2, z: 0.9, w: 0.4, d: 0.18 }, { x: 0.25, z: 0.9, w: 0.4, d: 0.18 },
  ], M.inkSoft, 0.05)
  g.add(shell)
  box(g, [4.9, 0.05, 0.18], [0, 0.16, -1.22], M.blue, 0.02)
  textPlane(g, 'COLOR·93', 1.7, [-0.3, 0.16, -1.0], { color: '#c8cdd2', font: "16px 'Press Start 2P', monospace" })
  ctx.leds.power = led(g, 0.05, [-2.15, 0.16, -1.05], '#ff3b30')
  return g
}

export const color93 = {
  id: 'color93',
  name: 'COLOR·93',
  cn: '彩色液晶掌机',
  category: '掌机',
  era: '1993',
  tagline: '屏幕有了颜色，世界更近了。',
  inspiration: '致敬 1990 年代的彩色 LCD 掌机',
  difficulty: 2,
  accent: '#2b6cb0',
  camera: { position: [8.4, 8.6, 11.6], target: [0, 1.5, 0] },
  parts: [
    part('bottom', '01', '底壳', 'BOTTOM CASE', '深色横版底壳，四角定位柱与电池仓预留完成。', '彩色 LCD 的耗电量远高于单色屏，掌机开始追求更长续航。', [0, 0.2, 0], [-5.0, 0.2, 1.8], [0, 1.0, 0], [5.2, 0.62, 2.8], buildBottom),
    part('board', '02', '主板', 'COLOR MAIN BOARD', 'CPU、显存与音频芯片共同驱动彩色画面。', '彩色掌机让同一种绿色也能分出深浅，画面表现力大幅提升。', [0, 0.4, 0], [5.0, 0.15, -1.8], [0, 2.1, 0], [4.8, 0.3, 2.35], buildBoard),
    part('screen', '03', '彩色液晶屏', 'COLOR LCD', '彩色液晶屏嵌入金属框，排线尾端连接主板。', '早期的彩色掌机屏幕仍有拖影，快速移动时会留下残影。', [0, 0.58, -0.2], [5.1, 0.2, 1.8], [0, 3.2, -0.2], [3.4, 0.35, 2.3], buildScreen),
    part('pads', '04', '按键胶垫', 'RUBBER PADS', '导电胶垫覆盖方向键、动作键与功能键。', '彩色屏并没有改变按键结构，导电胶垫仍是手感核心。', [0, 0.66, 0.25], [-4.8, 0.15, -2.0], [0, 4.2, 0.25], [4.2, 0.2, 1.8], buildPads),
    part('controls', '05', '按键组', 'CONTROL SET', '十字键、三颗动作键与 Start / Select 组装完成。', '更多动作键让格斗与平台游戏的操作空间明显扩大。', [0, 0.74, 0.25], [4.9, 0.2, 2.0], [0, 5.2, 0.25], [3.6, 0.3, 1.8], buildControls),
    part('speaker', '06', '扬声器', 'SPEAKER', '小型扬声器固定在屏幕右侧，线束通往主板。', '掌机音效从单音逐渐走向多声道，扬声器布局也越来越讲究。', [1.75, 0.68, -0.75], [-4.7, 0.2, 2.1], [1.8, 6.1, -0.8], [1.0, 0.25, 0.85], buildSpeaker),
    part('top', '07', '面壳', 'TOP COVER', '最后扣上面壳，蓝色饰条与屏幕边框形成鲜明层次。', '横版机身让双手自然握住两侧，长时间游玩更舒适。', [0, 0.76, 0], [0, 0.2, -3.8], [0, 7.0, 0], [5.2, 0.38, 2.8], buildTop),
  ],
  wires: [
    { id: 'ribbon', name: '屏幕排线', color: '#e8a020', plugLabel: 'A', portLabel: 'A', plug: [0.85, 0.55, 1.2], port: [0.2, 0.45, 0.95], route: [[0.8, 0.5, 1.2], [0.45, 0.47, 1.05]], desc: '把彩色屏幕排线插入主板的 A 插座。' },
  ],
  stepOrder: ['bottom', 'board', 'screen', 'pads', 'controls', 'speaker', 'w:ribbon', 'top'],
  showcase: { type: 'color', intro: '彩色世界亮了！左右移动，按 A 跳跃，收集 5 颗宝石。', toy: true },
}
