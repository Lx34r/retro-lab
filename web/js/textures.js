// RETO·LAB 程序化 Canvas 纹理：PCB / 屏幕 / 键帽图集 / 标签 / 工作台垫
import * as THREE from 'three'

export function makeCanvas(w, h, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (draw) draw(ctx, w, h)
  return { canvas, ctx }
}

export function canvasTexture(canvas, { srgb = true, nearest = false } = {}) {
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  if (nearest) { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter }
  tex.anisotropy = 4
  return tex
}

// 伪随机（可复现）
export function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

// PCB 电路板纹理
export function pcbTexture({ w = 512, h = 512, base = '#2f7d5b', seed = 7, label = 'RETO·LAB', sub = 'REV 1.0' } = {}) {
  const { canvas } = makeCanvas(w, h, (ctx) => {
    const rand = rng(seed)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, w, h)
    // 阻焊噪点
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rand() * 0.05})`
      ctx.fillRect(rand() * w, rand() * h, 2, 2)
    }
    // 走线
    ctx.strokeStyle = 'rgba(20,60,42,.55)'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    for (let i = 0; i < 46; i++) {
      let x = rand() * w, y = rand() * h
      ctx.beginPath(); ctx.moveTo(x, y)
      const segs = 2 + Math.floor(rand() * 3)
      for (let s = 0; s < segs; s++) {
        if (rand() > 0.5) x += (rand() - 0.5) * 180
        else y += (rand() - 0.5) * 180
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    // 金色焊盘
    for (let i = 0; i < 60; i++) {
      const x = rand() * w, y = rand() * h, r = 3 + rand() * 4
      ctx.fillStyle = '#c9a24b'
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill()
      ctx.fillStyle = '#1e5c42'
      ctx.beginPath(); ctx.arc(x, y, r * 0.4, 0, 7); ctx.fill()
    }
    // 过孔
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(15,45,32,.8)'
      ctx.beginPath(); ctx.arc(rand() * w, rand() * h, 2.2, 0, 7); ctx.fill()
    }
    // 丝印
    ctx.fillStyle = 'rgba(240,245,235,.85)'
    ctx.font = `bold ${Math.round(w * 0.045)}px ui-monospace, monospace`
    ctx.fillText(label, w * 0.05, h * 0.08)
    ctx.font = `${Math.round(w * 0.032)}px ui-monospace, monospace`
    ctx.fillText(sub, w * 0.05, h * 0.13)
    ctx.strokeStyle = 'rgba(240,245,235,.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92)
    // 定位孔
    for (const [x, y] of [[w * .06, h * .94], [w * .94, h * .94], [w * .94, h * .06]]) {
      ctx.fillStyle = '#c9a24b'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill()
      ctx.fillStyle = '#12251c'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill()
    }
  })
  return canvasTexture(canvas)
}

// 金属屏蔽罩 / 定位板纹理
export function metalTexture({ w = 256, h = 256, base = '#9aa0a6', holes = false } = {}) {
  const { canvas } = makeCanvas(w, h, (ctx) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h)
    const rand = rng(11)
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rand() * 0.06})`
      ctx.fillRect(rand() * w, rand() * h, 1, 6 + rand() * 20)
    }
    if (holes) {
      ctx.fillStyle = 'rgba(40,42,46,.85)'
      for (let y = 16; y < h; y += 24) for (let x = 16 + (y % 48 ? 12 : 0); x < w; x += 24) {
        ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill()
      }
    }
  })
  return canvasTexture(canvas)
}

// 文字标签平面纹理（透明底）
export function textTexture(text, { w = 512, h = 128, color = '#3a3e44', font = null, align = 'center', sub = null } = {}) {
  const { canvas } = makeCanvas(w, h, (ctx) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = 'middle'
    ctx.font = font || `bold ${Math.round(h * 0.5)}px 'Press Start 2P', ui-monospace, monospace`
    const x = align === 'center' ? w / 2 : 8
    ctx.fillText(text, x, sub ? h * 0.36 : h / 2)
    if (sub) {
      ctx.font = `${Math.round(h * 0.22)}px ui-monospace, monospace`
      ctx.globalAlpha = 0.7
      ctx.fillText(sub, x, h * 0.74)
    }
  })
  const tex = canvasTexture(canvas)
  return tex
}

// 卡带标签（像素风封面）
export function cartLabelTexture() {
  const { canvas } = makeCanvas(256, 256, (ctx) => {
    ctx.fillStyle = '#e8e2d2'; ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#c8352b'; ctx.fillRect(0, 0, 256, 56)
    ctx.fillStyle = '#fff'
    ctx.font = "bold 18px 'Press Start 2P', monospace"
    ctx.textAlign = 'center'
    ctx.fillText('RETO QUEST', 128, 36)
    // 像素风景
    ctx.fillStyle = '#9bbc0f'; ctx.fillRect(16, 72, 224, 120)
    ctx.fillStyle = '#306230'
    for (let i = 0; i < 8; i++) ctx.fillRect(24 + i * 28, 168 - (i % 3) * 12, 16, 24 + (i % 3) * 12)
    ctx.fillStyle = '#f26322'; ctx.fillRect(112, 104, 24, 24)
    ctx.fillStyle = '#23262b'; ctx.fillRect(116, 110, 6, 6); ctx.fillRect(126, 110, 6, 6)
    ctx.fillStyle = '#fff'; ctx.fillRect(40, 84, 20, 10); ctx.fillRect(180, 92, 24, 10)
    ctx.fillStyle = '#23262b'
    ctx.font = "12px 'Press Start 2P', monospace"
    ctx.fillText('8-BIT ADVENTURE', 128, 216)
    ctx.font = '10px ui-monospace, monospace'
    ctx.fillText('RETO·LAB 1983', 128, 238)
  })
  return canvasTexture(canvas)
}

// 键帽字符图集：16 列 × 8 行
export const ATLAS_COLS = 16
export const ATLAS_ROWS = 8
export function keycapAtlas(legends) {
  const cell = 64
  const { canvas } = makeCanvas(ATLAS_COLS * cell, ATLAS_ROWS * cell, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#3a3e44'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    legends.forEach((label, i) => {
      const cx = (i % ATLAS_COLS) * cell + cell / 2
      const cy = Math.floor(i / ATLAS_COLS) * cell + cell / 2
      const isLong = label.length > 2
      ctx.font = isLong ? 'bold 13px ui-monospace, monospace' : `bold ${label.length > 1 ? 22 : 28}px ui-monospace, monospace`
      ctx.fillText(label, cx, cy + 2)
    })
  })
  return canvasTexture(canvas)
}
export function atlasUV(i) {
  const col = i % ATLAS_COLS, row = Math.floor(i / ATLAS_COLS)
  return { u0: col / ATLAS_COLS, u1: (col + 1) / ATLAS_COLS, v0: 1 - (row + 1) / ATLAS_ROWS, v1: 1 - row / ATLAS_ROWS }
}

// 工作台垫：网格 + 品牌字
export function matTexture() {
  const { canvas } = makeCanvas(1024, 768, (ctx, w, h) => {
    ctx.fillStyle = '#ddd6c4'; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(120,114,96,.28)'; ctx.lineWidth = 1
    for (let x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    ctx.strokeStyle = 'rgba(120,114,96,.5)'; ctx.lineWidth = 2
    for (let x = 0; x <= w; x += 160) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y <= h; y += 160) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    ctx.fillStyle = 'rgba(90,86,70,.75)'
    ctx.font = "22px 'Press Start 2P', monospace"
    ctx.fillText('RETO·LAB / ASSEMBLY MAT', 40, h - 40)
    ctx.font = '16px ui-monospace, monospace'
    ctx.textAlign = 'right'
    ctx.fillText('EST. 1983 — GRID 1:1', w - 40, 50)
    ctx.textAlign = 'left'
    ctx.fillText('LOW VOLTAGE · DEMO ONLY', 40, 50)
  })
  return canvasTexture(canvas)
}

// 动态屏幕（LCD / TV）：返回可逐帧绘制的画布
export function liveScreen(w, h) {
  const { canvas, ctx } = makeCanvas(w, h)
  const tex = canvasTexture(canvas, { nearest: true })
  return { canvas, ctx, tex, w, h }
}