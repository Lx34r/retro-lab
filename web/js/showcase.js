// RETO·LAB 展示控制器：点亮后的屏幕动画与互动测试
import { audio } from './audio.js'

const GB = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']

function drawLcdBoot(ctx, w, h, t) {
  ctx.fillStyle = GB[3]; ctx.fillRect(0, 0, w, h)
  const y = Math.min(h / 2 - 8, t * 60)
  ctx.fillStyle = GB[0]
  ctx.font = "10px 'Press Start 2P', monospace"
  ctx.textAlign = 'center'
  ctx.fillText('RETO·LAB', w / 2, y)
  if (t > 1.6) {
    ctx.font = "7px 'Press Start 2P', monospace"
    ctx.fillText('PIXELBOY·89', w / 2, y + 22)
    ctx.fillStyle = GB[1]
    ctx.fillRect(w / 2 - 30, y + 32, 60, 3)
  }
}

function drawLcdGame(s, ctx, w, h, t) {
  ctx.fillStyle = GB[3]; ctx.fillRect(0, 0, w, h)
  // 云
  ctx.fillStyle = GB[2]
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 70 - s.scroll * 0.3) % (w + 40) + w + 40) % (w + 40) - 20
    ctx.fillRect(cx, 18 + i * 12, 22, 6); ctx.fillRect(cx + 5, 14 + i * 12, 12, 4)
  }
  // 地面
  ctx.fillStyle = GB[1]; ctx.fillRect(0, h - 24, w, 24)
  ctx.fillStyle = GB[0]
  for (let i = 0; i < 12; i++) {
    const gx = ((i * 20 - s.scroll) % (w + 20) + w + 20) % (w + 20) - 10
    ctx.fillRect(gx, h - 24, 10, 3)
  }
  // 障碍（仙人掌）
  for (const ob of s.obstacles) {
    const ox = ob.x - s.scroll
    if (ox > -20 && ox < w + 20) {
      ctx.fillStyle = GB[0]
      ctx.fillRect(ox, h - 38, 6, 14); ctx.fillRect(ox - 3, h - 34, 3, 6); ctx.fillRect(ox + 6, h - 36, 3, 6)
    }
  }
  // 小像素人
  const px = s.player.x, py = h - 24 - 12 - s.player.y
  ctx.fillStyle = GB[0]
  ctx.fillRect(px, py, 8, 8)          // 头身
  ctx.fillRect(px + 1, py + 8, 6, 4)  // 腿
  const leg = Math.floor(t * 8) % 2
  ctx.fillRect(px + (leg ? 0 : 4), py + 12, 3, 3)
  ctx.fillStyle = GB[3]; ctx.fillRect(px + 5, py + 2, 2, 2) // 眼
  // HUD
  ctx.fillStyle = GB[0]
  ctx.font = "7px 'Press Start 2P', monospace"
  ctx.textAlign = 'left'
  ctx.fillText('JUMP ' + String(s.jumps).padStart(3, '0'), 6, 12)
  ctx.textAlign = 'right'
  ctx.fillText('HI 999', w - 6, 12)
}

function drawTvBoot(ctx, w, h, t) {
  if (t < 0.5) {
    // 雪花
    for (let i = 0; i < 400; i++) {
      const v = Math.random() * 255 | 0
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(Math.random() * w | 0, Math.random() * h | 0, 4, 4)
    }
    return
  }
  ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#c8352b'; ctx.fillRect(0, h / 2 - 34, w, 44)
  ctx.fillStyle = '#fff'
  ctx.font = "14px 'Press Start 2P', monospace"
  ctx.textAlign = 'center'
  ctx.fillText('RETO QUEST', w / 2, h / 2 - 6)
  ctx.font = "8px 'Press Start 2P', monospace"
  ctx.fillStyle = '#9bbc0f'
  if (Math.floor(t * 2) % 2) ctx.fillText('PRESS START', w / 2, h / 2 + 40)
}

function drawTvGame(s, ctx, w, h, t) {
  ctx.fillStyle = '#5c94fc'; ctx.fillRect(0, 0, w, h)
  // 远山
  ctx.fillStyle = '#3f9e4d'
  for (let i = 0; i < 4; i++) {
    const hx = ((i * 90 - s.scroll * 0.4) % (w + 90) + w + 90) % (w + 90) - 45
    ctx.beginPath(); ctx.moveTo(hx, h - 48); ctx.lineTo(hx + 40, h - 96); ctx.lineTo(hx + 80, h - 48); ctx.fill()
  }
  // 云
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 100 - s.scroll * 0.6) % (w + 60) + w + 60) % (w + 60) - 30
    ctx.fillRect(cx, 30 + i * 18, 30, 10); ctx.fillRect(cx + 8, 24 + i * 18, 16, 8)
  }
  // 地面砖块
  ctx.fillStyle = '#c84c0c'; ctx.fillRect(0, h - 48, w, 48)
  ctx.fillStyle = '#8a2c00'
  for (let i = 0; i < 16; i++) {
    const bx = ((i * 24 - s.scroll) % (w + 24) + w + 24) % (w + 24) - 12
    ctx.fillRect(bx, h - 48, 2, 48); ctx.fillRect(bx, h - 26, 24, 2)
  }
  // 金币
  ctx.fillStyle = '#e8a020'
  for (const c of s.coins) {
    const cx = c.x - s.scroll
    if (cx > -10 && cx < w + 10 && !c.taken) ctx.fillRect(cx, h - 90 + Math.sin(t * 4 + c.x) * 3, 8, 10)
  }
  // 英雄
  const hx = 60, hy = h - 48 - 16 - s.heroY
  ctx.fillStyle = '#f26322'; ctx.fillRect(hx, hy, 12, 12)
  ctx.fillStyle = '#ffd8a8'; ctx.fillRect(hx + 2, hy + 2, 8, 6)
  ctx.fillStyle = '#23262b'; ctx.fillRect(hx + 7, hy + 4, 2, 2)
  const leg = Math.floor(t * 10) % 2
  ctx.fillStyle = '#2b6cb0'; ctx.fillRect(hx + (leg ? 0 : 6), hy + 12, 5, 5)
  // HUD
  ctx.fillStyle = '#fff'
  ctx.font = "8px 'Press Start 2P', monospace"
  ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + String(s.score).padStart(6, '0'), 10, 16)
  ctx.textAlign = 'right'
  ctx.fillText('WORLD 1-1', w - 10, 16)
}

const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' }

function drawWatchGame(s, ctx, w, h) {
  ctx.fillStyle = GB[3]; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = GB[2]
  for (let i = 0; i < 3; i++) ctx.fillRect(12 + i * 52, 18 + (i % 2) * 8, 20, 4)
  ctx.fillStyle = GB[1]; ctx.fillRect(0, h - 14, w, 14)
  for (const ob of s.objects) {
    ctx.fillStyle = GB[0]
    ctx.fillRect(ob.x - 4, ob.y, 8, 8)
    ctx.fillRect(ob.x - 2, ob.y - 3, 4, 3)
  }
  ctx.fillStyle = GB[0]
  ctx.fillRect(s.playerX - 13, h - 20, 26, 5)
  ctx.fillRect(s.playerX - 13, h - 24, 4, 8)
  ctx.fillRect(s.playerX + 9, h - 24, 4, 8)
  ctx.font = "7px 'Press Start 2P', monospace"; ctx.textAlign = 'left'
  ctx.fillText('SCORE ' + String(s.score).padStart(2, '0'), 6, 10)
  ctx.textAlign = 'right'; ctx.fillText('MISS ' + s.misses, w - 6, 10)
}

function drawColorGame(s, ctx, w, h, t) {
  ctx.fillStyle = '#5c94fc'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 3; i++) ctx.fillRect(18 + i * 78, 24 + (i % 2) * 12, 26, 7)
  ctx.fillStyle = '#3f9e4d'; ctx.fillRect(0, h - 34, w, 12)
  ctx.fillStyle = '#c84c0c'; ctx.fillRect(0, h - 22, w, 22)
  for (const gem of s.gems) {
    if (gem.taken) continue
    const gy = gem.y + Math.sin(t * 4 + gem.x) * 2
    ctx.fillStyle = '#e8a020'; ctx.fillRect(gem.x - 4, gy - 4, 8, 8)
    ctx.fillStyle = '#fff3b0'; ctx.fillRect(gem.x - 2, gy - 3, 3, 3)
  }
  const py = h - 22 - 14 - s.playerY
  ctx.fillStyle = '#f26322'; ctx.fillRect(s.playerX, py, 10, 10)
  ctx.fillStyle = '#ffd8a8'; ctx.fillRect(s.playerX + 2, py + 2, 6, 5)
  ctx.fillStyle = '#23262b'; ctx.fillRect(s.playerX + 6, py + 3, 2, 2)
  ctx.fillStyle = '#2b6cb0'; ctx.fillRect(s.playerX, py + 10, 4, 4); ctx.fillRect(s.playerX + 6, py + 10, 4, 4)
  ctx.fillStyle = '#fff'; ctx.font = "7px 'Press Start 2P', monospace"; ctx.textAlign = 'left'
  ctx.fillText('GEM ' + s.score + '/5', 6, 10)
}

function drawDualTop(s, ctx, w, h) {
  ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#9bbc0f'; ctx.font = "10px 'Press Start 2P', monospace"; ctx.textAlign = 'center'
  ctx.fillText('MEMORY LINK', w / 2, 28)
  ctx.fillStyle = '#f4f2ec'; ctx.font = "8px 'Press Start 2P', monospace"
  ctx.fillText('ROUND ' + (s.round + 1) + '/3', w / 2, 50)
  const cell = 42
  s.seq.forEach((dir, i) => {
    const x = w / 2 + (i - 1.5) * (cell + 8) - cell / 2
    ctx.fillStyle = i < s.seqIndex ? '#306230' : i === s.seqIndex ? '#f26322' : '#43474d'
    ctx.fillRect(x, 82, cell, cell)
    ctx.fillStyle = '#fff'; ctx.font = '22px ui-monospace, monospace'
    ctx.fillText(ARROWS[dir] || '?', x + cell / 2, 112)
  })
  ctx.fillStyle = '#8a8f96'; ctx.font = '7px ui-monospace, monospace'
  ctx.fillText('WATCH TOP · REPEAT BELOW', w / 2, h - 24)
}

function drawDualBottom(s, ctx, w, h) {
  ctx.fillStyle = '#e8e4d8'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#23262b'; ctx.font = "9px 'Press Start 2P', monospace"; ctx.textAlign = 'center'
  ctx.fillText('TOUCH INPUT', w / 2, 30)
  for (let i = 0; i < s.seq.length; i++) {
    ctx.beginPath(); ctx.arc(w / 2 + (i - 1.5) * 44, 84, 13, 0, Math.PI * 2)
    ctx.fillStyle = i < s.seqIndex ? '#3f9e4d' : '#b9b6ad'; ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '12px ui-monospace, monospace'
    ctx.fillText(String(i + 1), w / 2 + (i - 1.5) * 44, 88)
  }
  ctx.fillStyle = '#6a6e75'; ctx.font = '8px ui-monospace, monospace'
  ctx.fillText(s.done ? 'LINK COMPLETE' : 'USE THE DIRECTION BUTTONS', w / 2, h - 36)
}

function drawHybridGame(s, ctx, w, h, t) {
  ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#5c94fc'
  for (let i = 0; i < 18; i++) ctx.fillRect((i * 43) % w, (i * 29) % 70, 2, 2)
  ctx.fillStyle = '#306230'; ctx.fillRect(0, h - 36, w, 14)
  ctx.fillStyle = '#0f380f'; ctx.fillRect(0, h - 22, w, 22)
  for (const foe of s.foes) {
    if (foe.dead) continue
    ctx.fillStyle = '#c8352b'; ctx.fillRect(foe.x, foe.y, 14, 12)
    ctx.fillStyle = '#f26322'; ctx.fillRect(foe.x + 3, foe.y - 4, 8, 5)
    ctx.fillStyle = '#fff'; ctx.fillRect(foe.x + 4, foe.y + 3, 2, 2); ctx.fillRect(foe.x + 9, foe.y + 3, 2, 2)
  }
  ctx.fillStyle = '#e8a020'
  for (const shot of s.shotList) ctx.fillRect(shot.x, shot.y, 7, 3)
  const py = h - 22 - 15 - s.playerY
  ctx.fillStyle = '#2b6cb0'; ctx.fillRect(s.playerX, py, 12, 12)
  ctx.fillStyle = '#f4f2ec'; ctx.fillRect(s.playerX + 3, py + 3, 6, 5)
  ctx.fillStyle = '#9bbc0f'; ctx.fillRect(s.playerX + 2, py + 12, 3, 3); ctx.fillRect(s.playerX + 7, py + 12, 3, 3)
  ctx.fillStyle = '#fff'; ctx.font = "7px 'Press Start 2P', monospace"; ctx.textAlign = 'left'
  ctx.fillText('FOES ' + s.defeated + '/6', 8, 12)
  ctx.textAlign = 'right'; ctx.fillText('SHOT ' + String(s.shots).padStart(2, '0'), w - 8, 12)
}

export function createShowcase(device, ctx, hooks = {}) {
  const type = device.showcase.type
  let t = 0
  let done = false
  const ledsOn = []
  for (const key of ['power', 'tv', 'console', 'pc']) if (ctx.leds[key]) ledsOn.push(ctx.leds[key])

  // LCD 玩具状态
  const lcd = { scroll: 0, jumps: 0, player: { x: 40, y: 0, vy: 0 }, obstacles: [{ x: 120 }, { x: 220 }, { x: 330 }] }
  // TV 演示状态
  const tv = { scroll: 0, score: 0, heroY: 0, coins: Array.from({ length: 8 }, (_, i) => ({ x: 80 + i * 60, taken: false })) }
  // 按键测试
  const seq = device.showcase.sequence || []
  let seqIndex = 0
  // 打字测试
  const phrase = device.showcase.phrase || ''
  let typed = 0
  const keyFlash = new Map()
  const releaseTimers = new Set()
  const releaseLater = (fn, ms) => {
    const id = setTimeout(() => { releaseTimers.delete(id); fn() }, ms)
    releaseTimers.add(id)
  }
  const watch = { playerX: 80, score: 0, misses: 0, objects: [{ x: 34, y: 12 }, { x: 82, y: 42 }, { x: 132, y: 70 }] }
  const color = { playerX: 40, playerY: 0, vy: 0, score: 0, gems: [70, 110, 150, 190, 220].map((x, i) => ({ x, y: 112 - (i % 3) * 14, taken: false })) }
  const dual = { seq: ['up', 'right', 'down', 'left'], seqIndex: 0, round: 0 }
  const analog = { x: 0, y: 4, moves: 0, tiltX: 0, tiltZ: 0 }
  const motion = { hits: 0, total: 8, hit: new Set() }
  const hybrid = { playerX: 150, playerY: 0, vy: 0, shots: 0, shotList: [], defeated: 0, foes: [220, 265, 310, 355, 400, 445].map((x, i) => ({ x, y: 118 - (i % 2) * 6, dead: false })) }

  const finish = () => {
    if (done) return
    done = true
    audio.fanfare()
    hooks.onComplete?.()
  }

  function moveAnalog(dx, dy) {
    const nx = analog.x + dx, ny = analog.y + dy
    const wall = nx === 2 && ny >= 1 && ny <= 3
    if (nx < 0 || nx > 4 || ny < 0 || ny > 4 || wall) {
      audio.error(); hooks.onWrong?.(); return
    }
    analog.x = nx; analog.y = ny; analog.moves++
    analog.tiltX = dy * 0.22; analog.tiltZ = -dx * 0.22
    audio.click(); hooks.onProgress?.()
    if (analog.x === 4 && analog.y === 0) finish()
  }

  function hitTarget(index) {
    if (type !== 'motion' || done || index < 0 || index >= motion.total || motion.hit.has(index)) return false
    motion.hit.add(index); motion.hits++
    audio.button(); flashButton('a', '#2b6cb0'); hooks.onProgress?.()
    if (motion.hits >= motion.total) finish()
    return true
  }

  function pressButton(name) {
    if (type === 'padtest') {
      const want = seq[seqIndex]
      const mesh = ctx.buttons[name]
      if (name === want) {
        seqIndex++
        audio.button()
        flashButton(name, '#3f9e4d')
        hooks.onProgress?.()
        if (seqIndex >= seq.length) finish()
      } else {
        audio.error()
        flashButton(name, '#c8352b')
        hooks.onWrong?.()
      }
      return
    }
    if (type === 'lcd') {
      if (name === 'a' || name === 'b') {
        if (lcd.player.y <= 0.01) { lcd.player.vy = 5.2; lcd.jumps++; audio.jump() }
      } else if (name === 'left') { lcd.player.x = Math.max(8, lcd.player.x - 8); audio.click() }
      else if (name === 'right') { lcd.player.x = Math.min(140, lcd.player.x + 8); audio.click() }
      else if (name === 'dpad') { lcd.player.x = Math.min(140, lcd.player.x + 6); audio.click() }
      flashButton(name, '#9bbc0f')
      return
    }
    if (type === 'tv') {
      if (name === 'reset') { tv.scroll = 0; tv.score = 0; tv.coins.forEach(c => c.taken = false); audio.bootHum() }
      flashButton(name, '#c8352b')
    }
    if (type === 'watch') {
      if (name === 'a') watch.playerX = Math.max(16, watch.playerX - 12)
      else if (name === 'b') watch.playerX = Math.min(144, watch.playerX + 12)
      flashButton(name, '#9bbc0f'); audio.click()
      return
    }
    if (type === 'color') {
      if (name === 'left') color.playerX = Math.max(12, color.playerX - 12)
      else if (name === 'right') color.playerX = Math.min(220, color.playerX + 12)
      else if ((name === 'a' || name === 'b') && color.playerY <= 0.01) { color.vy = 5.2; audio.jump() }
      flashButton(name, '#5c94fc')
      return
    }
    if (type === 'dual') {
      if (name === dual.seq[dual.seqIndex]) {
        dual.seqIndex++; audio.button(); flashButton(name, '#3f9e4d'); hooks.onProgress?.()
        if (dual.seqIndex >= dual.seq.length) {
          dual.round++
          if (dual.round >= 3) finish()
          else dual.seqIndex = 0
        }
      } else { audio.error(); flashButton(name, '#c8352b'); hooks.onWrong?.() }
      return
    }
    if (type === 'analog') {
      const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
      if (name === 'a') { analog.x = 0; analog.y = 4; analog.moves = 0; audio.bootHum() }
      else if (dirs[name]) moveAnalog(dirs[name][0], dirs[name][1])
      flashButton(name, '#3f9e4d')
      return
    }
    if (type === 'motion') { flashButton(name, '#2b6cb0'); return }
    if (type === 'hybrid') {
      if (name === 'left') hybrid.playerX = Math.max(12, hybrid.playerX - 14)
      else if (name === 'right') hybrid.playerX = Math.min(292, hybrid.playerX + 14)
      else if (name === 'a' && hybrid.playerY <= 0.01) { hybrid.vy = 8.2; audio.jump() }
      else if (name === 'b') {
        hybrid.shots++
        hybrid.shotList.push({ x: hybrid.playerX + 14, y: 143 - hybrid.playerY })
        audio.button()
      }
      flashButton(name, '#f26322')
    }
  }

  function flashButton(name, color) {
    const obj = ctx.buttons[name]
    if (!obj) return
    const target = obj.children?.[0] || obj
    if (target.material && 'emissive' in target.material) {
      if (!target.userData.flashMat) {
        target.userData.flashMat = target.material.clone()
        target.userData.baseMat = target.material
      }
      target.material = target.userData.flashMat
      target.material.emissive.set(color)
      target.material.emissiveIntensity = 0.8
      keyFlash.set(target, { until: t + 0.25 })
    }
    // 按压位移
    const g = obj
    const baseY = g.userData.baseY ?? (g.userData.baseY = g.position.y)
    g.position.y = baseY - 0.05
    releaseLater(() => { g.position.y = baseY }, 120)
  }

  function pressKey(code) {
    if (type !== 'typetest') return
    const key = ctx.keys.find(k => k.code === code)
    if (!key) return
    // 按压动画
    key.group.position.y = key.baseY - 0.07
    releaseLater(() => { key.group.position.y = key.baseY }, 110)
    key.capMat.emissiveIntensity = 0.7
    keyFlash.set(key, { until: t + 0.3 })
    const want = phrase[typed]
    const wantCode = want === ' ' ? 'Space' : 'Key' + want
    if (code === wantCode) {
      typed++
      audio.key()
      hooks.onProgress?.()
      if (typed >= phrase.length) finish()
    } else {
      audio.key()
    }
  }

  function update(dt) {
    t += dt
    // LED 渐亮
    for (const l of ledsOn) l.material.emissiveIntensity = Math.min(1.6, t * 2)
    // 闪烁衰减
    for (const [obj, f] of keyFlash) {
      if (t > f.until) {
        if (obj.material) obj.material.emissiveIntensity = 0
        if (obj.capMat) obj.capMat.emissiveIntensity = 0
        keyFlash.delete(obj)
      }
    }

    if (type === 'lcd' && ctx.screens.lcd) {
      const s = ctx.screens.lcd
      if (t < 2.4) drawLcdBoot(s.ctx, s.w, s.h, t)
      else {
        lcd.scroll += dt * 40
        lcd.player.vy -= dt * 18
        lcd.player.y = Math.max(0, lcd.player.y + lcd.player.vy * dt * 10)
        if (lcd.player.y === 0) lcd.player.vy = 0
        drawLcdGame(lcd, s.ctx, s.w, s.h, t)
      }
      s.tex.needsUpdate = true
    }

    if (type === 'tv' && ctx.screens.tv) {
      const s = ctx.screens.tv
      if (t < 2.2) drawTvBoot(s.ctx, s.w, s.h, t)
      else {
        tv.scroll += dt * 60
        tv.score += Math.floor(dt * 10)
        tv.heroY = Math.abs(Math.sin(t * 3)) * 10
        for (const c of tv.coins) if (!c.taken && Math.abs(c.x - tv.scroll - 60) < 10) { c.taken = true; tv.score += 100 }
        drawTvGame(tv, s.ctx, s.w, s.h, t)
      }
      s.tex.needsUpdate = true
    }

    if (type === 'typetest' && ctx.leds.rgb) {
      // RGB 波浪
      for (let i = 0; i < ctx.leds.rgb.length; i++) {
        const l = ctx.leds.rgb[i]
        const hue = (t * 0.15 + l.x * 0.06 + l.z * 0.1) % 1
        l.mat.emissive.setHSL(hue, 0.9, 0.5)
        l.mat.emissiveIntensity = 0.9 + Math.sin(t * 2 + i * 0.3) * 0.3
        const key = ctx.keys[i]
        if (key && !keyFlash.has(key)) {
          key.capMat.emissive.setHSL(hue, 0.7, 0.5)
          key.capMat.emissiveIntensity = 0.12
        }
      }
    }

    if (type === 'watch' && ctx.screens.lcd) {
      const s = ctx.screens.lcd
      for (const ob of watch.objects) {
        ob.y += dt * 30
        if (ob.y > s.h - 24) {
          if (Math.abs(ob.x - watch.playerX) < 20) {
            watch.score++; audio.button(); hooks.onProgress?.()
            if (watch.score >= 8) finish()
          } else watch.misses++
          ob.y = -10; ob.x = 18 + Math.random() * 124
        }
      }
      drawWatchGame(watch, s.ctx, s.w, s.h)
      s.tex.needsUpdate = true
    }

    if (type === 'color' && ctx.screens.color) {
      const s = ctx.screens.color
      color.vy -= dt * 18
      color.playerY = Math.max(0, color.playerY + color.vy * dt * 10)
      if (color.playerY === 0) color.vy = 0
      for (const gem of color.gems) {
        if (!gem.taken && Math.abs(gem.x - color.playerX) < 13 && color.playerY > 6) {
          gem.taken = true; color.score++; audio.button(); hooks.onProgress?.()
          if (color.score >= color.gems.length) finish()
        }
      }
      drawColorGame(color, s.ctx, s.w, s.h, t)
      s.tex.needsUpdate = true
    }

    if (type === 'dual') {
      if (ctx.screens.dualTop) {
        const s = ctx.screens.dualTop
        drawDualTop(dual, s.ctx, s.w, s.h); s.tex.needsUpdate = true
      }
      if (ctx.screens.dualBottom) {
        const s = ctx.screens.dualBottom
        drawDualBottom(dual, s.ctx, s.w, s.h); s.tex.needsUpdate = true
      }
    }

    if (type === 'hybrid' && ctx.screens.hybrid) {
      const s = ctx.screens.hybrid
      hybrid.vy -= dt * 18
      hybrid.playerY = Math.max(0, hybrid.playerY + hybrid.vy * dt * 10)
      if (hybrid.playerY === 0) hybrid.vy = 0
      for (const foe of hybrid.foes) {
        if (foe.dead) continue
        foe.x -= dt * 18
        if (foe.x < -20) foe.x = 350 + Math.random() * 80
      }
      for (const shot of hybrid.shotList) {
        shot.x += dt * 190
        for (const foe of hybrid.foes) {
          if (!foe.dead && Math.abs(shot.x - (foe.x + 7)) < 12 && Math.abs(shot.y - (foe.y + 6)) < 22) {
            foe.dead = true; hybrid.defeated++; audio.button(); hooks.onProgress?.()
            if (hybrid.defeated >= hybrid.foes.length) finish()
          }
        }
      }
      hybrid.shotList = hybrid.shotList.filter(shot => shot.x < s.w + 10)
      drawHybridGame(hybrid, s.ctx, s.w, s.h, t)
      s.tex.needsUpdate = true
    }

    if (type === 'analog' && ctx.refs.stick) {
      ctx.refs.stick.rotation.x += (analog.tiltX - ctx.refs.stick.rotation.x) * Math.min(1, dt * 10)
      ctx.refs.stick.rotation.z += (analog.tiltZ - ctx.refs.stick.rotation.z) * Math.min(1, dt * 10)
    }
    if (type === 'motion' && ctx.refs.motion) {
      ctx.refs.motion.rotation.z = Math.sin(t * 3) * 0.045
      ctx.refs.motion.rotation.x = Math.cos(t * 2.2) * 0.03
    }
  }

  return {
    update,
    press: pressButton,
    pressKey,
    hitTarget,
    get done() { return done },
    state() {
      if (type === 'padtest') return { type, seq, seqIndex, done }
      if (type === 'typetest') return { type, phrase, typed, done }
      if (type === 'watch') return { type, playerX: watch.playerX, score: watch.score, misses: watch.misses, done }
      if (type === 'color') return { type, playerX: color.playerX, playerY: color.playerY, gems: color.score, done }
      if (type === 'dual') return { type, seq: [...dual.seq], seqIndex: dual.seqIndex, round: dual.round, done }
      if (type === 'analog') return { type, x: analog.x, y: analog.y, moves: analog.moves, done }
      if (type === 'motion') return { type, hits: motion.hits, total: motion.total, hit: [...motion.hit], done }
      if (type === 'hybrid') return { type, playerX: hybrid.playerX, playerY: hybrid.playerY, shots: hybrid.shots, foes: hybrid.defeated, done }
      return { type, done, toy: true }
    },
    dispose() { for (const id of releaseTimers) clearTimeout(id); releaseTimers.clear(); keyFlash.clear() },
  }
}