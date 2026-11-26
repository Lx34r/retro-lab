// RETO·LAB 状态存储：组装状态机 + 本地进度持久化
import { DEVICES } from './devices/index.js'

const LS_KEY = 'retolab.v1'

export function loadProgress() {
  const fallback = () => ({ sound: true, guideSeen: false, devices: {} })
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return fallback()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback()
    const devices = {}
    if (parsed.devices && typeof parsed.devices === 'object' && !Array.isArray(parsed.devices)) {
      for (const [id, rec] of Object.entries(parsed.devices)) {
        if (!rec || typeof rec !== 'object' || Array.isArray(rec)) continue
        devices[id] = {
          count: Number.isFinite(rec.count) ? Math.max(0, rec.count) : 0,
          bestMs: Number.isFinite(rec.bestMs) ? rec.bestMs : null,
          lastAt: Number.isFinite(rec.lastAt) ? rec.lastAt : 0,
        }
      }
    }
    return { sound: parsed.sound !== false, guideSeen: parsed.guideSeen === true, devices }
  } catch (e) { /* 本地存储不可用时静默降级 */ }
  return fallback()
}
export function saveProgress(p) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)) } catch (e) { /* 忽略 */ }
}

const progress = loadProgress()

const initial = (epoch = 0) => ({
  epoch,
  deviceId: null,
  stepIndex: 0,          // 已完成步骤数
  installed: [],         // 已装零件 id
  wiresDone: [],         // 已接线路 id
  seating: null,         // 正在吸附的零件
  selected: null,        // { kind: 'part'|'plug', id }
  hint: null,            // 高亮目标 id
  auto: false,           // 一键组装进行中
  power: 'off',          // off | booting | on
  finished: false,       // 是否已收入图鉴（本次）
  mistakes: 0,
  startedAt: 0,
  finishedAt: 0,
  notice: { title: '欢迎来到组装台', detail: '从第一步开始：选择零件，放入卡槽。', kind: 'info' },
})

let state = initial()
const listeners = new Set()
const emit = (patch) => { state = { ...state, ...patch }; listeners.forEach(fn => fn(state)) }
const tell = (title, detail = '', kind = 'info') => emit({ notice: { title, detail, kind } })

export const currentStep = (s = state) => {
  const d = DEVICES[s.deviceId]
  return d ? d.steps[s.stepIndex] || null : null
}
export const phaseOf = (s = state) => {
  if (s.power !== 'off') return 'power'
  const step = currentStep(s)
  if (!step) return 'power'
  return step.type === 'wire' ? 'wire' : 'assemble'
}
export const totalSteps = (s = state) => DEVICES[s.deviceId]?.steps.length || 0
export const progressPct = (s = state) => totalSteps(s) ? Math.round(s.stepIndex / totalSteps(s) * 100) : 0

export const store = {
  get: () => state,
  progress: () => progress,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },

  startDevice(id) {
    const d = DEVICES[id]
    if (!d) return
    state = { ...initial(state.epoch + 1), deviceId: id, startedAt: Date.now() }
    state.notice = { title: d.name, detail: `第一步：${d.steps[0].type === 'part' ? d.partsById[d.steps[0].id].name : d.wiresById[d.steps[0].id].name}。点击清单或场景中的它。`, kind: 'info' }
    listeners.forEach(fn => fn(state))
  },

  select(kind, id) {
    const s = state
    if (s.power !== 'off' || s.finished || s.auto) return
    const step = currentStep(s)
    if (kind === 'part') {
      const d = DEVICES[s.deviceId]
      const part = d.partsById[id]
      if (!part) return
      if (s.installed.includes(id)) return tell(part.name, '这个零件已经安装好了。', 'info')
      emit({ selected: { kind, id }, hint: id })
      if (step?.type === 'part' && step.id === id) tell(part.name, part.desc, 'info')
      else {
        const cur = step?.type === 'part' ? d.partsById[step.id].name : '当前接线'
        tell(part.name, `${part.desc}（当前应先完成：${cur}）`, 'info')
      }
    } else {
      const d = DEVICES[s.deviceId]
      const wire = d.wiresById[id]
      if (!wire || s.wiresDone.includes(id)) return
      emit({ selected: { kind, id }, hint: id })
      tell(wire.name, `先点插头，再点同色接口 ${wire.portLabel}。`, 'info')
    }
  },

  attemptPlace(id, point = null) {
    const s = state
    if (s.power !== 'off' || s.seating || s.finished || s.auto) return false
    const d = DEVICES[s.deviceId]
    const step = currentStep(s)
    if (s.installed.includes(id)) return false
    if (point) {
      const p = d.partsById[id]
      // 拖拽平面会把零件抬高，只校验卡槽的水平范围。
      if (Math.abs(point[0] - p.slot[0]) > p.size[0] * .53 || Math.abs(point[2] - p.slot[2]) > p.size[2] * .53) {
        emit({ mistakes: s.mistakes + 1, selected: { kind: 'part', id }, hint: id })
        tell('位置不对', '把零件拖到发光卡槽内再松开。', 'error')
        return false
      }
    }
    if (step?.type !== 'part' || step.id !== id) {
      const need = step?.type === 'part' ? d.partsById[step.id].name : d.wiresById[step.id]?.name
      emit({ mistakes: s.mistakes + 1, selected: { kind: 'part', id }, hint: step?.id })
      tell('顺序不对', `这一步请先完成「${need}」。清单里高亮的就是当前零件。`, 'error')
      return false
    }
    emit({ seating: id, selected: null, hint: null })
    return true
  },

  seated(id) {
    const s = state
    if (s.seating !== id) return
    const d = DEVICES[s.deviceId]
    const installed = [...s.installed, id]
    const stepIndex = s.stepIndex + 1
    emit({ installed, seating: null, stepIndex })
    const next = currentStep()
    if (!next) tell('零件与线路全部就绪', '按下「通电点亮」，看看你的作品。', 'success')
    else if (next.type === 'wire') tell(`${d.partsById[id].name}，已就位`, `接下来接线：${d.wiresById[next.id].name}。`, 'success')
    else tell(`${d.partsById[id].name}，已就位`, `下一步：${d.partsById[next.id].name}。`, 'success')
  },

  connectWire(portId) {
    const s = state
    if (s.power !== 'off' || s.finished || s.auto) return false
    const d = DEVICES[s.deviceId]
    const step = currentStep(s)
    if (step?.type !== 'wire') return false
    const wire = d.wiresById[step.id]
    if (s.selected?.kind !== 'plug' || s.selected.id !== wire.id) {
      emit({ selected: { kind: 'plug', id: wire.id }, hint: wire.id })
      tell(wire.name, '先点选插头，再点接口。', 'info')
      return false
    }
    if (portId !== wire.portLabel) {
      emit({ mistakes: s.mistakes + 1 })
      tell('接口不匹配', `${wire.name}应该接到 ${wire.portLabel} 号接口（同色同字母）。`, 'error')
      return false
    }
    const wiresDone = [...s.wiresDone, wire.id]
    emit({ wiresDone, stepIndex: s.stepIndex + 1, selected: null, hint: null })
    const next = currentStep()
    if (!next) tell('全部接线完成', '按下「通电点亮」，看看你的作品。', 'success')
    else if (next.type === 'part') tell(`${wire.name}，连接完成`, `回到组装：${d.partsById[next.id].name}。`, 'success')
    else tell(`${wire.name}，连接完成`, `下一组：${d.wiresById[next.id].name}。`, 'success')
    return true
  },

  power() {
    const s = state
    if (s.finished || s.auto) return
    if (s.power === 'on') { emit({ power: 'off' }); tell('已关机', '可以重新通电，或继续把玩后收入图鉴。', 'info'); return }
    if (s.power === 'booting') return
    if (currentStep(s)) {
      const d = DEVICES[s.deviceId]
      const step = currentStep(s)
      const name = step.type === 'part' ? d.partsById[step.id].name : d.wiresById[step.id].name
      emit({ hint: step.id, mistakes: s.mistakes + 1 })
      tell('还差一步', `先完成「${name}」，再通电。`, 'error')
      return
    }
    emit({ power: 'booting', selected: null, hint: null })
    tell('正在通电', '指示灯 → 屏幕 → 画面，稍等片刻。', 'info')
  },

  toggleAuto() {
    const s = state
    if (s.auto) {
      emit({ auto: false, selected: null, hint: null })
      tell('已接管', '自动组装已停止，可以继续手动操作。', 'info')
      return
    }
    if (s.power !== 'off' || s.finished || s.seating) return
    if (!currentStep(s)) { store.power(); return }
    emit({ auto: true, selected: null, hint: null, notice: { title: '一键组装', detail: '正在自动选择零件、接线并通电，可随时停止接管。', kind: 'info' } })
  },

  autoAdvance() {
    const s = state
    if (!s.auto || s.power !== 'off' || s.finished || s.seating) return
    const step = currentStep(s)
    if (!step) { emit({ auto: false }); store.power(); return }
    const d = DEVICES[s.deviceId]
    if (step.type === 'part') {
      const p = d.partsById[step.id]
      if (s.selected?.kind === 'part' && s.selected.id === step.id) {
        emit({ seating: step.id, selected: null, hint: null })
      } else {
        emit({ selected: { kind: 'part', id: step.id }, hint: step.id, notice: { title: `自动组装 · ${p.name}`, detail: p.desc, kind: 'info' } })
      }
    } else {
      const w = d.wiresById[step.id]
      if (s.selected?.kind === 'plug' && s.selected.id === step.id) {
        emit({ wiresDone: [...s.wiresDone, step.id], stepIndex: s.stepIndex + 1, selected: null, hint: null, notice: { title: `${w.name} · 已连接`, detail: '自动接线完成，继续下一步。', kind: 'success' } })
      } else {
        emit({ selected: { kind: 'plug', id: step.id }, hint: step.id, notice: { title: `自动接线 · ${w.name}`, detail: w.desc, kind: 'info' } })
      }
    }
  },

  booted() {
    if (state.power !== 'booting') return
    emit({ power: 'on' })
    tell('点亮成功', DEVICES[state.deviceId].showcase.intro, 'success')
  },

  finish() {
    const s = state
    if (s.finished || s.power !== 'on') return
    const finishedAt = Date.now()
    const rec = progress.devices[s.deviceId] || { count: 0, bestMs: null, lastAt: 0 }
    const ms = finishedAt - s.startedAt
    rec.count += 1
    rec.bestMs = rec.bestMs == null ? ms : Math.min(rec.bestMs, ms)
    rec.lastAt = finishedAt
    progress.devices[s.deviceId] = rec
    saveProgress(progress)
    emit({ finished: true, finishedAt })
  },

  hint() {
    const step = currentStep()
    if (step) { emit({ hint: step.id }); tell('提示', '场景中闪烁的轮廓就是当前目标。', 'info') }
  },

  cancel() { emit({ selected: null, hint: null }) },

  setSound(b) { progress.sound = b; saveProgress(progress); emit({}) },
  markGuideSeen() { progress.guideSeen = true; saveProgress(progress) },
  clearProgress() { progress.devices = {}; saveProgress(progress); emit({}) },

  reset() {
    const id = state.deviceId
    state = { ...initial(state.epoch + 1), deviceId: id, startedAt: Date.now() }
    listeners.forEach(fn => fn(state))
  },
}