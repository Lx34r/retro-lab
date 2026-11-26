// RETO·LAB 3D 场景引擎：渲染 / 交互 / 动画 / 标签 / 视图控制
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { M, collectMaterials } from './parts.js'
import { matTexture } from './textures.js'
import { createShowcase } from './showcase.js'
import { audio } from './audio.js'
import { store, currentStep } from './store.js'

const SHARED = new Set(Object.values(M))
const BG = '#e9e4d8'

export class LabScene {
  constructor(host, labelsHost) {
    this.host = host
    this.labelsHost = labelsHost
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    this.mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches
    this.active = true
    this.disposed = false

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.5 : 1.75))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.shadowMap.autoUpdate = false
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.setClearColor(BG)
    host.prepend(this.renderer.domElement)
    const canvas = this.renderer.domElement
    canvas.setAttribute('aria-label', '可交互的三维组装工作台')
    canvas.setAttribute('role', 'img')

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BG)
    this.scene.fog = new THREE.Fog(BG, 26, 60)
    this.camera = new THREE.PerspectiveCamera(40, 1, .1, 120)

    const env = new RoomEnvironment()
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTarget = pmrem.fromScene(env, .04)
    this.scene.environment = this.envTarget.texture
    this.scene.environmentIntensity = .5
    env.dispose(); pmrem.dispose()

    this.hemi = new THREE.HemisphereLight('#fff8ec', '#9a958a', 1.5)
    this.key = new THREE.DirectionalLight('#fff3dd', 2.4)
    this.key.position.set(-4, 11, 6)
    this.key.castShadow = true
    this.key.shadow.mapSize.set(this.mobile ? 1024 : 2048, this.mobile ? 1024 : 2048)
    Object.assign(this.key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 2, far: 30 })
    this.key.shadow.normalBias = .025
    this.key.shadow.bias = -.0001
    this.fill = new THREE.DirectionalLight('#e8f0f4', 1.0)
    this.fill.position.set(6, 5, -6)
    this.rim = new THREE.DirectionalLight('#ffe9c9', .7)
    this.rim.position.set(-6, 6, -7)
    this.scene.add(this.hemi, this.key, this.fill, this.rim)

    // 桌面 + 工作垫 + 网格
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ color: '#d6d0c0', roughness: .95 }))
    desk.rotation.x = -Math.PI / 2; desk.position.y = -.03; desk.receiveShadow = true
    this.scene.add(desk)
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 10.5), new THREE.MeshStandardMaterial({ map: matTexture(), roughness: .92 }))
    mat.rotation.x = -Math.PI / 2; mat.position.y = -.01; mat.receiveShadow = true
    this.scene.add(mat)
    const gv = []
    for (let x = -6.5; x <= 6.5; x += .5) gv.push(x, .005, -5, x, .005, 5)
    for (let z = -5; z <= 5; z += .5) gv.push(-6.5, .005, z, 6.5, .005, z)
    this.gridLines = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(gv, 3)),
      new THREE.LineBasicMaterial({ color: '#a8a28e', transparent: true, opacity: .22 }))
    this.scene.add(this.gridLines)

    // 漂浮尘埃
    const dn = 130, dp = new Float32Array(dn * 3)
    for (let i = 0; i < dn; i++) { dp[i * 3] = (Math.random() - .5) * 15; dp[i * 3 + 1] = Math.random() * 7 + .3; dp[i * 3 + 2] = (Math.random() - .5) * 11 }
    this.dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dp, 3)),
      new THREE.PointsMaterial({ color: '#fff6e0', size: .055, transparent: true, opacity: .45, depthWrite: false }))
    this.scene.add(this.dust)

    this.deviceRoot = new THREE.Group()
    this.scene.add(this.deviceRoot)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = .08
    this.controls.minDistance = 5
    this.controls.maxDistance = 28
    this.controls.minPolarAngle = .18
    this.controls.maxPolarAngle = 1.38
    this.controls.enablePan = false
    this.controls.autoRotateSpeed = .9
    this.controls.touches.ONE = THREE.TOUCH.ROTATE
    this.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE
    this.controls.addEventListener('start', () => { this.cameraMoving = false })

    // 视图参数
    this.explode = .55
    this.lightLevel = 1
    this.wireframe = false

    // 运行时状态
    this.device = null
    this.ctx = null
    this.parts = {}
    this.ghosts = {}
    this.slotHits = {}
    this.wireObjs = {}
    this.labelEls = []
    this.showcase = null
    this.epoch = -1
    this.lastPower = 'off'
    this.lastWires = ''
    this.bootTimer = 0
    this.drag = null
    this.cameraTo = new THREE.Vector3()
    this.targetTo = new THREE.Vector3()
    this.cameraMoving = false
    this.ray = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.shadowDirty = true
    this.frame = 0
    this.last = 0
    this.fps = 0
    this.fpsCount = 0
    this.fpsTime = 0
    this.onShowcaseEvent = null

    canvas.addEventListener('pointerdown', this.down, true)
    window.addEventListener('pointermove', this.move)
    window.addEventListener('pointerup', this.up)
    window.addEventListener('pointercancel', this.cancelPointer)
    window.addEventListener('keydown', this.key)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()

    window.__RETO__ = { read: () => this.diagnostics(), scene: this }
    this.frame = requestAnimationFrame(this.animate)
  }

  /* ---------- 设备装载与释放 ---------- */

  loadDevice(device) {
    this.disposeDevice()
    this.device = device
    this.ctx = { screens: {}, leds: {}, buttons: {}, refs: {}, keys: [] }
    const s = store.get()
    for (const p of device.parts) {
      const g = p.build(this.ctx)
      g.userData.part = p.id
      const installed = s.installed.includes(p.id)
      g.position.set(...(installed ? p.slot : p.home))
      this.parts[p.id] = g
      this.deviceRoot.add(g)
      const ghost = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(...p.size)),
        new THREE.LineBasicMaterial({ color: '#f26322', transparent: true, opacity: .9, depthTest: false }))
      ghost.position.set(...p.slot)
      ghost.visible = false
      ghost.renderOrder = 6
      this.ghosts[p.id] = ghost
      this.deviceRoot.add(ghost)
      const hit = new THREE.Mesh(new THREE.BoxGeometry(p.size[0] * 1.06, Math.max(p.size[1], .4), p.size[2] * 1.06),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }))
      hit.position.set(...p.slot)
      hit.userData.slot = p.id
      this.slotHits[p.id] = hit
      this.deviceRoot.add(hit)
    }
    if (device.dressing) this.deviceRoot.add(device.dressing(this.ctx))
    for (const w of device.wires) {
      const plug = new THREE.Group()
      plug.position.set(...w.plug)
      const body = new THREE.Mesh(new THREE.BoxGeometry(.17, .11, .24), new THREE.MeshStandardMaterial({ color: w.color, roughness: .5 }))
      body.castShadow = true
      const tip = new THREE.Mesh(new THREE.BoxGeometry(.09, .06, .12), M.metalDark.clone())
      tip.position.z = .17
      plug.add(body, tip)
      plug.userData.plug = w.id
      const port = new THREE.Group()
      port.position.set(...w.port)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 10, 20), new THREE.MeshStandardMaterial({ color: w.color, roughness: .45 }))
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(.085, .085, .06, 16), M.dark.clone())
      hole.rotation.x = Math.PI / 2
      port.add(ring, hole)
      port.userData.port = w.portLabel
      port.userData.portWire = w.id
      this.wireObjs[w.id] = { plug, port, cable: null }
      this.deviceRoot.add(plug, port)
    }
    this.buildLabels()
    this.rebuildCables()
    this.epoch = s.epoch
    this.lastPower = s.power
    this.lastWires = s.wiresDone.join(',')
    this.bootTimer = 0
    if (s.power !== 'off') this.startShowcase()
    this.resetCamera(true)
    this.shadowDirty = true
  }

  disposeDevice() {
    if (this.showcase) { this.showcase.dispose(); this.showcase = null }
    this.deviceRoot.traverse(o => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (SHARED.has(m)) continue
          for (const k of ['map', 'emissiveMap', 'normalMap', 'roughnessMap']) if (m[k]) m[k].dispose()
          m.dispose()
        }
      }
    })
    this.deviceRoot.clear()
    this.parts = {}; this.ghosts = {}; this.slotHits = {}; this.wireObjs = {}
    this.labelsHost.innerHTML = ''
    this.labelEls = []
    this.ctx = null
    this.drag = null
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.disposeDevice()
    this.ro.disconnect()
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointerdown', this.down, true)
    window.removeEventListener('pointermove', this.move)
    window.removeEventListener('pointerup', this.up)
    window.removeEventListener('pointercancel', this.cancelPointer)
    window.removeEventListener('keydown', this.key)
    this.controls.dispose()
    this.envTarget.dispose()
    this.scene.traverse(o => { if (o.geometry) o.geometry.dispose() })
    this.renderer.dispose()
    canvas.remove()
    if (window.__RETO__) delete window.__RETO__
  }

  /* ---------- HTML 锚点标签 ---------- */

  buildLabels() {
    const d = this.device
    const add = (cls, text, anchor, onClick, data) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = `anchor-label ${cls}`
      el.textContent = text
      el.addEventListener('click', e => { e.stopPropagation(); onClick() })
      this.labelsHost.appendChild(el)
      this.labelEls.push({ el, anchor, data })
      return el
    }
    for (const p of d.parts) {
      add('part', `${p.num} ${p.name}`,
        () => this.parts[p.id].position.clone().add(new THREE.Vector3(0, p.size[1] / 2 + .4, 0)),
        () => { store.select('part', p.id); audio.select() }, { kind: 'part', id: p.id })
      add('slot', `放入 ${p.name}`,
        () => new THREE.Vector3(...p.slot).add(new THREE.Vector3(0, .55, 0)),
        () => { const sel = store.get().selected; if (sel?.kind === 'part') store.attemptPlace(sel.id) }, { kind: 'slot', id: p.id })
    }
    for (const w of d.wires) {
      add('port', `插头 ${w.plugLabel}`,
        () => new THREE.Vector3(...w.plug).add(new THREE.Vector3(0, .34, 0)),
        () => { store.select('plug', w.id); audio.select() }, { kind: 'plug', id: w.id })
      add('port', `接口 ${w.portLabel}`,
        () => new THREE.Vector3(...w.port).add(new THREE.Vector3(0, .34, 0)),
        () => store.connectWire(w.portLabel), { kind: 'port', id: w.id })
    }
    const powerAnchor = () => {
      const obj = this.ctx?.refs.powerSwitch || this.ctx?.buttons.power
      if (obj) { const v = new THREE.Vector3(); obj.getWorldPosition(v); return v.add(new THREE.Vector3(0, .45, 0)) }
      return new THREE.Vector3(...d.camera.target).add(new THREE.Vector3(0, 1.6, 0))
    }
    add('slot', '⏻ 通电点亮', powerAnchor, () => store.power(), { kind: 'power' })
  }

  updateLabels(s, step) {
    const w = this.host.clientWidth, h = this.host.clientHeight
    for (const { el, anchor, data } of this.labelEls) {
      let visible = false
      if (data.kind === 'part') visible = s.power === 'off' && !s.finished && !s.installed.includes(data.id) && s.seating !== data.id
      else if (data.kind === 'slot') visible = s.power === 'off' && !s.installed.includes(data.id) && (s.selected?.kind === 'part' && s.selected.id === data.id || s.hint === data.id)
      else if (data.kind === 'plug') visible = s.power === 'off' && step?.type === 'wire' && step.id === data.id && !s.wiresDone.includes(data.id)
      else if (data.kind === 'port') visible = s.power === 'off' && step?.type === 'wire' && step.id === data.id && !s.wiresDone.includes(data.id)
      else if (data.kind === 'power') visible = s.power === 'off' && !step && !s.finished
      if (!visible) { el.style.visibility = 'hidden'; continue }
      const p = anchor().project(this.camera)
      if (p.z > 1 || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1) { el.style.visibility = 'hidden'; continue }
      el.style.visibility = 'visible'
      el.style.transform = `translate(${(p.x + 1) * w / 2}px, ${(-p.y + 1) * h / 2}px) translate(-50%, -50%)`
    }
  }

  /* ---------- 线缆 ---------- */

  rebuildCables() {
    for (const id of Object.keys(this.wireObjs)) {
      const wo = this.wireObjs[id]
      if (wo.cable) { wo.cable.geometry.dispose(); wo.cable.material.dispose(); wo.cable.removeFromParent(); wo.cable = null }
    }
    if (!this.device) return
    for (const id of store.get().wiresDone) {
      const w = this.device.wiresById[id]
      const pts = [w.plug, ...w.route, w.port].map(p => new THREE.Vector3(...p))
      const curve = new THREE.CatmullRomCurve3(pts)
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, .042, 8, false), new THREE.MeshStandardMaterial({ color: w.color, roughness: .65 }))
      mesh.castShadow = true
      this.wireObjs[id].cable = mesh
      this.deviceRoot.add(mesh)
    }
    this.shadowDirty = true
  }

  /* ---------- 相机 ---------- */

  resetCamera(immediate = false) {
    if (!this.device) return
    const s = store.get()
    const { position, target } = this.device.camera
    const t = new THREE.Vector3(...target)
    const p = new THREE.Vector3(...position)
    if (s.power !== 'off') {
      p.sub(t).multiplyScalar(.72).add(t)
      p.y = t.y + (position[1] - target[1]) * .5
    }
    const narrow = this.host.clientWidth / this.host.clientHeight < .9
    if (narrow) p.sub(t).multiplyScalar(1.22).add(t)
    this.cameraTo.copy(p)
    this.targetTo.copy(t)
    if (immediate || this.reduced) {
      this.camera.position.copy(p)
      this.controls.target.copy(t)
      this.cameraMoving = false
    } else this.cameraMoving = true
    this.controls.update()
  }

  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight
    if (!w || !h) return
    this.mobile = w < 900
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.shadowDirty = true
  }

  /* ---------- 指针交互 ---------- */

  setRay(x, y) {
    const b = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set((x - b.left) / b.width * 2 - 1, -(y - b.top) / b.height * 2 + 1)
    this.ray.setFromCamera(this.pointer, this.camera)
  }

  down = (e) => {
    if (e.button !== 0 || !this.device || !this.active) return
    const s = store.get()
    this.setRay(e.clientX, e.clientY)
    const hits = this.ray.intersectObjects(this.deviceRoot.children, true)
    for (const hit of hits) {
      let obj = hit.object
      while (obj && obj !== this.deviceRoot) {
        const ud = obj.userData
        if (ud.control === 'power') { store.power(); e.stopImmediatePropagation(); return }
        if (ud.button && s.power === 'on' && this.showcase) { this.showcase.press(ud.button); e.stopImmediatePropagation(); return }
        if (ud.key && s.power === 'on' && this.showcase) { this.showcase.pressKey(ud.key); e.stopImmediatePropagation(); return }
        if (ud.plug && s.power === 'off') { store.select('plug', ud.plug); audio.select(); e.stopImmediatePropagation(); return }
        if (ud.port && s.power === 'off') { store.connectWire(ud.port); e.stopImmediatePropagation(); return }
        if (ud.slot && s.power === 'off' && s.selected?.kind === 'part') {
          store.attemptPlace(s.selected.id); e.stopImmediatePropagation(); return
        }
        if (ud.part && s.power === 'off' && !s.finished) {
          const id = ud.part
          store.select('part', id)
          if (!s.installed.includes(id) && !s.seating) {
            audio.select()
            if (e.pointerType !== 'touch') {
              this.drag = { id, x: e.clientX, y: e.clientY, moved: false }
              this.controls.enabled = false
              this.cameraMoving = false
            }
          }
          e.stopImmediatePropagation(); return
        }
        obj = obj.parent
      }
      if (hit.object instanceof THREE.Mesh && !hit.object.userData.slot) return
    }
  }

  move = (e) => {
    if (!this.drag) return
    this.drag.moved ||= Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y) > 6
    if (!this.drag.moved) return
    const p = this.device.partsById[this.drag.id]
    this.setRay(e.clientX, e.clientY)
    const point = this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -p.slot[1]), new THREE.Vector3())
    if (point) {
      const g = this.parts[this.drag.id]
      g.position.set(point.x, p.slot[1] + .3, point.z)
      this.shadowDirty = true
    }
    this.renderer.domElement.style.cursor = 'grabbing'
  }

  up = () => {
    if (this.drag) {
      if (this.drag.moved) {
        const g = this.parts[this.drag.id]
        store.attemptPlace(this.drag.id, g.position.toArray())
      }
      this.drag = null
      this.controls.enabled = true
      this.renderer.domElement.style.cursor = ''
    }
  }

  cancelPointer = () => {
    this.drag = null
    this.controls.enabled = true
    this.renderer.domElement.style.cursor = ''
  }

  key = (e) => {
    if (e.key === 'Escape') { this.cancelPointer(); store.cancel() }
  }

  /* ---------- 通电展示 ---------- */

  startShowcase() {
    if (this.showcase) this.showcase.dispose()
    this.bootTimer = 0
    this.showcase = createShowcase(this.device, this.ctx, {
      onComplete: () => { store.finish(); this.onShowcaseEvent?.('complete') },
      onProgress: () => this.onShowcaseEvent?.('progress'),
      onWrong: () => this.onShowcaseEvent?.('wrong'),
    })
  }

  powerOffVisuals() {
    if (!this.ctx) return
    for (const k of ['power', 'tv', 'console', 'pc']) if (this.ctx.leds[k]) this.ctx.leds[k].material.emissiveIntensity = 0
    if (this.ctx.leds.rgb) for (const l of this.ctx.leds.rgb) { l.mat.emissiveIntensity = 0 }
    for (const key of this.ctx.keys || []) {
      key.capMat.emissiveIntensity = 0
      key.group.position.y = key.baseY
    }
    for (const b of Object.values(this.ctx.buttons)) {
      const target = b.children?.[0] || b
      if (target.userData?.baseMat) { target.material = target.userData.baseMat; target.userData.flashMat = null }
      if (b.userData.baseY != null) b.position.y = b.userData.baseY
    }
    const off = (screen, color) => { if (screen) { screen.ctx.fillStyle = color; screen.ctx.fillRect(0, 0, screen.w, screen.h); screen.tex.needsUpdate = true } }
    off(this.ctx.screens.lcd, '#2a3618')
    off(this.ctx.screens.tv, '#0c0e12')
    off(this.ctx.screens.color, '#0c0e12')
    off(this.ctx.screens.dualTop, '#0c0e12')
    off(this.ctx.screens.dualBottom, '#0c0e12')
    off(this.ctx.screens.hybrid, '#0c0e12')
  }

  pressShowcase(name) { this.showcase?.press(name) }
  pressShowcaseKey(code) { this.showcase?.pressKey(code) }
  hitShowcaseTarget(index) { this.showcase?.hitTarget(index) }
  showcaseState() { return this.showcase?.state() || null }

  /* ---------- 视图控制 ---------- */

  setExplode(v) { this.explode = v; this.shadowDirty = true }
  setLight(v) {
    this.lightLevel = v
    this.key.intensity = 2.4 * v
    this.fill.intensity = 1.0 * v
    this.hemi.intensity = 1.5 * (.55 + .45 * v)
    this.renderer.toneMappingExposure = .78 + .32 * v
    this.shadowDirty = true
  }
  setAutoRotate(b) { this.controls.autoRotate = b && !this.reduced }
  setGrid(b) { this.gridLines.visible = b }
  setWireframe(b) {
    this.wireframe = b
    collectMaterials(this.deviceRoot).forEach(m => { m.wireframe = b })
  }
  screenshot() {
    this.renderer.render(this.scene, this.camera)
    this.renderer.domElement.toBlob(blob => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `RETO-LAB-${this.device?.id || 'scene'}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    }, 'image/png')
  }
  setActive(b) { this.active = b; if (b) this.shadowDirty = true }

  /* ---------- 主循环 ---------- */

  animate = (time) => {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.animate)
    if (document.hidden || !this.active) { this.last = time; return }
    const rawDelta = Math.max(0, (time - (this.last || time)) / 1000)
    const delta = Math.min(rawDelta, .05)
    this.last = time
    this.fpsCount++; this.fpsTime += delta
    if (this.fpsTime >= 1) { this.fps = Math.round(this.fpsCount / this.fpsTime); this.fpsCount = 0; this.fpsTime = 0 }

    const s = store.get()
    const step = currentStep(s)
    if (s.auto) store.autoAdvance()
    const ease = this.reduced ? 1 : 1 - Math.exp(-delta * 9)

    if (this.device && s.epoch !== this.epoch) {
      this.epoch = s.epoch
      this.cancelPointer()
      this.lastPower = 'off'
      this.bootTimer = 0
      if (this.showcase) { this.showcase.dispose(); this.showcase = null }
      this.powerOffVisuals()
      for (const p of this.device.parts) {
        const installed = s.installed.includes(p.id)
        this.parts[p.id].position.set(...(installed ? p.slot : p.home))
      }
      this.lastWires = ''
      this.rebuildCables()
      this.resetCamera(true)
    }

    if (this.device) {
      // 电源状态切换
      if (s.power !== this.lastPower) {
        if (s.power === 'booting' || s.power === 'on' && this.lastPower === 'off' || s.power === 'off' && !s.finished) {
          this.explode = 0
          const slider = document.getElementById('explodeSlider')
          if (slider) slider.value = '0'
        }
        if (s.power === 'booting') { audio.powerOn(this.device.id); this.startShowcase() }
        if (s.power === 'off') {
          if (this.showcase) { this.showcase.dispose(); this.showcase = null }
          this.powerOffVisuals()
        }
        this.lastPower = s.power
        this.resetCamera()
        this.shadowDirty = true
      }
      if (s.power === 'booting') {
        this.bootTimer += rawDelta
        if (this.bootTimer > 1.1) store.booted()
      }
      if (this.showcase && s.power !== 'off') this.showcase.update(delta)

      // 零件动画
      let moving = false
      const inspect = s.power === 'on' || s.finished
      for (const p of this.device.parts) {
        const g = this.parts[p.id]
        const installed = s.installed.includes(p.id) || s.seating === p.id
        const dest = new THREE.Vector3()
        if (installed) {
          dest.set(...p.slot)
          if (inspect) dest.lerp(new THREE.Vector3(...p.exploded), this.explode)
        } else {
          dest.set(...p.home).lerp(new THREE.Vector3(...p.exploded), this.explode)
          if (s.selected?.kind === 'part' && s.selected.id === p.id) {
            dest.y += .3
            if (!this.reduced) dest.y += Math.sin(time / 380) * .06
          }
        }
        if (this.drag?.id === p.id && this.drag.moved) { moving = true; continue }
        const k = s.seating === p.id ? (this.reduced ? 1 : 1 - Math.exp(-delta * 14)) : ease
        if (g.position.distanceTo(dest) > .004) {
          g.position.lerp(dest, k)
          moving = true
          if (s.seating === p.id && g.position.distanceTo(dest) < .02) {
            g.position.copy(dest)
            store.seated(p.id)
            audio.snap()
          }
        }
        const ghost = this.ghosts[p.id]
        const showGhost = s.power === 'off' && !s.installed.includes(p.id) && !s.finished && (s.hint === p.id || s.selected?.kind === 'part' && s.selected.id === p.id)
        ghost.visible = showGhost
        if (showGhost) ghost.material.opacity = .55 + Math.sin(time / 260) * .35
      }
      if (moving || this.drag) this.shadowDirty = true

      // 接线状态
      const wiresKey = s.wiresDone.join(',')
      if (wiresKey !== this.lastWires) {
        if (s.wiresDone.length > this.lastWires.split(',').filter(Boolean).length) audio.connect()
        this.lastWires = wiresKey
        this.rebuildCables()
      }
      for (const w of this.device.wires) {
        const wo = this.wireObjs[w.id]
        const done = s.wiresDone.includes(w.id)
        wo.plug.visible = !done
        wo.port.visible = !done
        const active = step?.type === 'wire' && step.id === w.id && s.power === 'off'
        const pulse = active ? .4 + Math.sin(time / 240) * .3 : 0
        wo.plug.children[0].material.emissive.set(w.color)
        wo.plug.children[0].material.emissiveIntensity = pulse
        wo.port.children[0].material.emissive.set(w.color)
        wo.port.children[0].material.emissiveIntensity = pulse
        const selPlug = s.selected?.kind === 'plug' && s.selected.id === w.id
        wo.plug.scale.setScalar(selPlug ? 1.35 : 1)
      }

      this.updateLabels(s, step)
    }

    // 相机过渡
    if (this.cameraMoving) {
      const k = 1 - Math.exp(-delta * 3.8)
      this.camera.position.lerp(this.cameraTo, k)
      this.controls.target.lerp(this.targetTo, k)
      if (this.camera.position.distanceTo(this.cameraTo) < .02) this.cameraMoving = false
    }

    // 尘埃
    if (!this.reduced) {
      const pos = this.dust.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * .12
        if (y > 7.4) y = .3
        pos.setY(i, y)
        pos.setX(i, pos.getX(i) + Math.sin(time / 2400 + i) * delta * .03)
      }
      pos.needsUpdate = true
    }

    this.controls.update()
    if (this.shadowDirty) { this.renderer.shadowMap.needsUpdate = true; this.shadowDirty = false }
    this.renderer.render(this.scene, this.camera)
  }

  diagnostics() {
    const s = store.get()
    const parts = {}
    for (const [id, g] of Object.entries(this.parts)) parts[id] = g.position.toArray().map(v => +v.toFixed(3))
    return {
      deviceId: this.device?.id || null,
      phase: s.power !== 'off' ? 'power' : currentStep(s)?.type || 'power',
      power: s.power, stepIndex: s.stepIndex, totalSteps: this.device?.steps.length || 0,
      installed: s.installed, wiresDone: s.wiresDone, seating: s.seating,
      selected: s.selected, auto: s.auto, finished: s.finished, mistakes: s.mistakes,
      showcase: this.showcaseState(), parts,
      camera: { position: this.camera.position.toArray().map(v => +v.toFixed(2)), target: this.controls.target.toArray().map(v => +v.toFixed(2)) },
      fps: this.fps, explode: this.explode, wireframe: this.wireframe,
      renderer: { w: this.host.clientWidth, h: this.host.clientHeight, pixelRatio: this.renderer.getPixelRatio() },
    }
  }
}