// RETO·LAB 入口：路由 / 场景生命周期 / 工具栏 / 键盘 / 音频
import { DEVICES } from './devices/index.js'
import { store } from './store.js'
import { audio } from './audio.js'
import { LabScene } from './scene.js'
import * as ui from './ui.js'

const $ = id => document.getElementById(id)
let scene = null
let sceneFailed = false
let currentView = null

function parseHash() {
  const h = location.hash || '#/'
  const lab = h.match(/^#\/lab\/([\w-]+)/)
  if (lab && DEVICES[lab[1]]) return { view: 'lab', id: lab[1] }
  if (h.startsWith('#/gallery')) return { view: 'gallery' }
  return { view: 'home', about: h.includes('#about') }
}

function showView(name) {
  $('view-home').hidden = name !== 'home'
  $('view-lab').hidden = name !== 'lab'
  $('view-gallery').hidden = name !== 'gallery'
  $('footer').style.display = name === 'lab' ? 'none' : ''
}

function ensureScene() {
  if (scene || sceneFailed) return scene
  try {
    scene = new LabScene($('canvasHost'), $('labels'))
    ui.bindScene(scene)
    scene.onShowcaseEvent = kind => {
      if (kind === 'progress' || kind === 'wrong') ui.renderLab(store.get())
    }
    scene.setExplode(+$('explodeSlider').value / 100)
    scene.setLight(+$('lightSlider').value / 100)
    return scene
  } catch (err) {
    console.error('WebGL 初始化失败', err)
    sceneFailed = true
    $('webglFallback').hidden = false
    $('toolbar').style.display = 'none'
    $('stageHint').style.display = 'none'
    return null
  }
}

function navigate() {
  const route = parseHash()
  if (route.view === 'lab') {
    showView('lab')
    ui.setActiveNav('home')
    const sc = ensureScene()
    if (sc) {
      $('webglFallback').hidden = true
      const s = store.get()
      const resume = s.deviceId === route.id && !s.finished && (s.stepIndex > 0 || s.wiresDone.length > 0)
      if (!resume) {
        store.startDevice(route.id)
        sc.loadDevice(DEVICES[route.id])
      }
      sc.setActive(true)
      sc.resize()
      sc.resetCamera()
      if (!store.progress().guideSeen) ui.showGuide()
    }
    ui.renderLab(store.get())
  } else {
    scene?.setActive(false)
    ui.hideComplete()
    if (route.view === 'gallery') {
      showView('gallery')
      ui.setActiveNav('gallery')
      ui.renderGallery()
      window.scrollTo(0, 0)
    } else {
      showView('home')
      ui.setActiveNav(route.about ? 'about' : 'home')
      ui.renderHome()
      if (route.about) requestAnimationFrame(() => $('about').scrollIntoView({ behavior: 'smooth' }))
      else window.scrollTo(0, 0)
    }
  }
  currentView = route.view
}

/* ---------- 工具栏 ---------- */
function initToolbar() {
  $('explodeSlider').addEventListener('input', e => scene?.setExplode(+e.target.value / 100))
  $('lightSlider').addEventListener('input', e => scene?.setLight(+e.target.value / 100))
  const toggle = (btn, fn) => btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true'
    btn.setAttribute('aria-pressed', String(on))
    btn.classList.toggle('on', on)
    fn(on); audio.click()
  })
  toggle($('rotateToggle'), on => scene?.setAutoRotate(on))
  toggle($('gridToggle'), on => scene?.setGrid(on))
  toggle($('wireToggle'), on => scene?.setWireframe(on))
  $('viewReset').addEventListener('click', () => { scene?.resetCamera(); audio.click() })
  $('shotBtn').addEventListener('click', () => { scene?.screenshot(); audio.click() })
  $('backBtn').addEventListener('click', () => { location.hash = '#/' })
  $('fallbackBack').addEventListener('click', () => { location.hash = '#/' })
}

/* ---------- 物理键盘 ---------- */
function initKeys() {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('guideOverlay').hidden) ui.hideGuide()
      else if (!$('completeModal').hidden) ui.hideComplete()
      else if (!$('confirmModal').hidden) ui.hideConfirm()
      return
    }
    if (e.target instanceof Element) {
      if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return
      if (e.target.closest('button, a, [role="button"]') && ['Enter', 'Space', 'Tab'].includes(e.code)) return
    }
    if (!$('guideOverlay').hidden || !$('completeModal').hidden || !$('confirmModal').hidden) return
    const s = store.get()
    if (currentView !== 'lab' || s.power !== 'on' || !scene) return
    const type = DEVICES[s.deviceId]?.showcase.type
    if (type === 'typetest') {
      if (e.code === 'Space' || e.code === 'Tab') e.preventDefault()
      if (!e.metaKey && !e.ctrlKey && !e.altKey) scene.pressShowcaseKey(e.code)
      return
    }
    const map = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      KeyA: 'a', KeyB: 'b', KeyX: 'x', KeyY: 'y', Enter: 'start', Space: 'a', KeyR: 'reset',
    }
    const name = map[e.code]
    if (!name) return
    e.preventDefault()
    if (type === 'lcd' && (name === 'up' || name === 'down')) scene.pressShowcase('a')
    else scene.pressShowcase(name)
  })
}

/* ---------- 启动 ---------- */
audio.setEnabled(store.progress().sound)
document.addEventListener('pointerdown', () => audio.unlock(), { once: true })
ui.initUI()
initToolbar()
initKeys()
window.addEventListener('hashchange', navigate)
navigate()