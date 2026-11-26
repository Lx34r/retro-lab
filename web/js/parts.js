// RETO·LAB 零件构建工具：共享材质 + 程序化几何
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { textTexture } from './textures.js'

const std = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05, ...opts })

// 共享材质（跨零件复用，减少状态切换）
export const M = {
  cream: std('#e8e4d8', { roughness: 0.55 }),
  creamDark: std('#cfc9ba'),
  gray: std('#b9b6ad'),
  grayLight: std('#cfccc2'),
  ink: std('#2b2e33', { roughness: 0.5 }),
  inkSoft: std('#43474d'),
  dark: std('#1c1e22', { roughness: 0.45 }),
  pcb: std('#2f7d5b', { roughness: 0.5 }),
  pcbDeep: std('#1e5c42'),
  orange: std('#f26322', { roughness: 0.45 }),
  crimson: std('#c8352b', { roughness: 0.45 }),
  maroon: std('#7a2a22'),
  blue: std('#2b6cb0', { roughness: 0.45 }),
  yellow: std('#e8a020', { roughness: 0.45 }),
  green: std('#3f9e4d', { roughness: 0.45 }),
  red: std('#d0342c', { roughness: 0.45 }),
  metal: std('#9aa0a6', { roughness: 0.35, metalness: 0.75 }),
  metalDark: std('#5c6167', { roughness: 0.4, metalness: 0.7 }),
  gold: std('#c9a24b', { roughness: 0.3, metalness: 0.8 }),
  rubber: std('#8f8d86', { roughness: 0.95 }),
  rubberDark: std('#55534d', { roughness: 0.95 }),
  white: std('#f4f2ec', { roughness: 0.5 }),
  glass: std('#1a2420', { roughness: 0.15, metalness: 0.2 }),
  lcdOff: std('#3a4a2a', { roughness: 0.3 }),
  cable: std('#3a3d42', { roughness: 0.7 }),
}

export function mesh(geo, mat, pos = [0, 0, 0], rot = null) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(...pos)
  if (rot) m.rotation.set(...rot)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function box(parent, size, pos, mat, radius = 0.04, rot = null) {
  const r = Math.min(radius, Math.min(...size) * 0.49)
  const geo = r > 0.005 ? new RoundedBoxGeometry(size[0], size[1], size[2], 2, r) : new THREE.BoxGeometry(...size)
  const m = mesh(geo, mat, pos, rot)
  parent.add(m)
  return m
}

export function cyl(parent, rTop, rBot, h, pos, mat, seg = 24, rot = null) {
  const m = mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat, pos, rot)
  parent.add(m)
  return m
}

export function sphere(parent, r, pos, mat, seg = 18) {
  const m = mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg - 4)), mat, pos)
  parent.add(m)
  return m
}

// 芯片：黑色本体 + 两侧引脚
export function chip(parent, w, h, d, pos, { pins = true, label = null } = {}) {
  const g = new THREE.Group()
  g.position.set(...pos)
  box(g, [w, h, d], [0, h / 2, 0], M.dark, 0.015)
  if (pins) {
    const n = Math.max(3, Math.floor(w / 0.12))
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * (w / n)
      box(g, [0.04, 0.03, 0.06], [x, 0.015, d / 2 + 0.03], M.metal, 0.005)
      box(g, [0.04, 0.03, 0.06], [x, 0.015, -d / 2 - 0.03], M.metal, 0.005)
    }
  }
  if (label) {
    const tex = textTexture(label, { w: 256, h: 64, color: '#c8cdd2', font: 'bold 26px ui-monospace, monospace' })
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, w * 0.8 * 0.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true }))
    p.rotation.x = -Math.PI / 2
    p.position.y = h + 0.002
    g.add(p)
  }
  parent.add(g)
  return g
}

// 文字标牌（平面，默认朝上）
export function textPlane(parent, text, width, pos, { color = '#3a3e44', rot = [-Math.PI / 2, 0, 0], sub = null, font = null } = {}) {
  const tex = textTexture(text, { color, sub, font })
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 0.25), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }))
  m.position.set(...pos)
  m.rotation.set(...rot)
  parent.add(m)
  return m
}

// LED（自发光，可后续点亮）
export function led(parent, r, pos, color = '#ff3b30') {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, emissive: color, emissiveIntensity: 0.0 })
  const m = mesh(new THREE.SphereGeometry(r, 12, 10), mat, pos)
  m.castShadow = false
  parent.add(m)
  return m
}

export function screw(parent, pos, r = 0.05) {
  const g = new THREE.Group()
  g.position.set(...pos)
  cyl(g, r, r, 0.03, [0, 0.015, 0], M.metalDark, 12)
  box(g, [r * 1.4, 0.012, r * 0.3], [0, 0.032, 0], M.dark, 0.002)
  parent.add(g)
  return g
}

// 带孔外壳：矩形板 + 圆孔/矩形孔（挤出）
export function shellWithHoles(w, d, h, holes, mat, bevel = 0.05) {
  const shape = new THREE.Shape()
  const r = Math.min(0.3, w * 0.08, d * 0.08)
  shape.moveTo(-w / 2 + r, -d / 2)
  shape.lineTo(w / 2 - r, -d / 2); shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r)
  shape.lineTo(w / 2, d / 2 - r); shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2)
  shape.lineTo(-w / 2 + r, d / 2); shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r)
  shape.lineTo(-w / 2, -d / 2 + r); shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2)
  for (const hole of holes) {
    const p = new THREE.Path()
    const hz = -hole.z // rotateX(-90°) 后 shape Y 对应世界 -Z
    if (hole.r != null) {
      p.absarc(hole.x, hz, hole.r, 0, Math.PI * 2, true)
    } else {
      const hw = hole.w / 2, hd = hole.d / 2
      p.moveTo(hole.x - hw, hz - hd)
      p.lineTo(hole.x + hw, hz - hd)
      p.lineTo(hole.x + hw, hz + hd)
      p.lineTo(hole.x - hw, hz + hd)
      p.closePath()
    }
    shape.holes.push(p)
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, bevel - h / 2, 0)
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true; m.receiveShadow = true
  return m
}

// 十字键
export function dpad(parent, pos, mat = M.ink, s = 1) {
  const g = new THREE.Group()
  g.position.set(...pos)
  box(g, [0.62 * s, 0.12, 0.22 * s], [0, 0.06, 0], mat, 0.04)
  box(g, [0.22 * s, 0.12, 0.62 * s], [0, 0.06, 0], mat, 0.04)
  cyl(g, 0.1 * s, 0.1 * s, 0.13, [0, 0.065, 0], mat, 16)
  parent.add(g)
  return g
}

// 圆形按键
export function roundButton(parent, r, pos, mat, h = 0.12) {
  const g = new THREE.Group()
  g.position.set(...pos)
  cyl(g, r, r * 1.06, h, [0, h / 2, 0], mat, 24)
  parent.add(g)
  return g
}

// 弹簧触点
export function spring(parent, pos, r = 0.06, h = 0.3) {
  const g = new THREE.Group()
  g.position.set(...pos)
  for (let i = 0; i < 4; i++) cyl(g, r, r, 0.02, [0, 0.03 + i * (h / 4), 0], M.metal, 12)
  parent.add(g)
  return g
}

// 收集组内全部材质（用于线框切换）
export function collectMaterials(root, set = new Set()) {
  root.traverse(o => {
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => set.add(m))
  })
  return set
}