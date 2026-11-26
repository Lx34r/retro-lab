// RETO·LAB DOM 界面：设备库 / 组装台 / 图鉴 / 浮层
import { DEVICES, DEVICE_LIST, DEVICE_IDS } from './devices/index.js'
import { store, currentStep, phaseOf, progressPct, totalSteps } from './store.js'
import { audio } from './audio.js'

const $ = id => document.getElementById(id)
let scene = null
export function bindScene(s) { scene = s }

const fmtMs = ms => {
  if (ms == null) return '—'
  const s = Math.round(ms / 1000)
  return s >= 60 ? `${Math.floor(s / 60)} 分 ${s % 60} 秒` : `${s} 秒`
}
const fmtDate = t => t ? new Date(t).toLocaleDateString('zh-CN') : '—'

/* ---------- 像素风设备缩略图（内联 SVG，无外部资产） ---------- */
const THUMBS = {
  pixelboy89: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="52" y="14" width="56" height="92" rx="6" fill="#b9b6ad"/><rect x="56" y="18" width="48" height="84" fill="#cfccc2"/>
    <rect x="62" y="24" width="36" height="30" fill="#2b2e33"/><rect x="66" y="28" width="28" height="22" fill="#9bbc0f"/>
    <rect x="70" y="32" width="8" height="6" fill="#306230"/><rect x="82" y="40" width="6" height="6" fill="#0f380f"/>
    <rect x="64" y="62" width="16" height="5" fill="#2b2e33"/><rect x="69" y="57" width="6" height="15" fill="#2b2e33"/>
    <circle cx="92" cy="66" r="5" fill="#c8352b"/><circle cx="100" cy="60" r="5" fill="#c8352b"/>
    <rect x="66" y="80" width="10" height="4" fill="#43474d"/><rect x="80" y="80" width="10" height="4" fill="#43474d"/>
    <rect x="60" y="90" width="40" height="3" fill="#8f8d86"/></svg>`,
  famiclone83: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="18" y="58" width="76" height="38" rx="4" fill="#e8e4d8"/><rect x="18" y="70" width="76" height="7" fill="#c8352b"/>
    <rect x="40" y="50" width="30" height="12" fill="#7a2a22"/><rect x="46" y="42" width="18" height="10" fill="#b9b6ad"/>
    <rect x="26" y="82" width="12" height="6" fill="#c8352b"/><rect x="42" y="82" width="8" height="6" fill="#43474d"/>
    <rect x="104" y="30" width="42" height="46" rx="4" fill="#cfc9ba"/><rect x="110" y="36" width="30" height="26" fill="#1a1c2c"/>
    <rect x="114" y="48" width="22" height="8" fill="#5c94fc"/><rect x="118" y="42" width="6" height="6" fill="#f26322"/>
    <rect x="112" y="66" width="8" height="4" fill="#43474d"/><rect x="124" y="66" width="8" height="4" fill="#43474d"/>
    <rect x="112" y="76" width="26" height="14" fill="#8f8d86"/></svg>`,
  propad90: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="24" y="44" width="112" height="40" rx="18" fill="#cfccc2"/><rect x="30" y="50" width="100" height="28" rx="12" fill="#b9b6ad"/>
    <rect x="42" y="58" width="22" height="7" fill="#2b2e33"/><rect x="50" y="50" width="7" height="22" fill="#2b2e33"/>
    <circle cx="98" cy="56" r="6" fill="#2b6cb0"/><circle cx="110" cy="62" r="6" fill="#3f9e4d"/>
    <circle cx="98" cy="70" r="6" fill="#e8a020"/><circle cx="86" cy="62" r="6" fill="#d0342c"/>
    <rect x="66" y="66" width="9" height="4" fill="#43474d"/><rect x="78" y="66" width="9" height="4" fill="#43474d"/>
    <rect x="76" y="84" width="8" height="14" fill="#3a3d42"/></svg>`,
  key84: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="16" y="42" width="128" height="46" rx="6" fill="#2b2e33"/><rect x="20" y="46" width="120" height="38" fill="#43474d"/>
    ${[0, 1, 2, 3].map(r => Array.from({ length: 12 }, (_, c) => {
      const accent = (r === 0 && c === 0) || (r === 2 && c === 11) || (r === 3 && c === 5)
      return `<rect x="${24 + c * 9.6}" y="${50 + r * 8.4}" width="8" height="7" rx="1.5" fill="${accent ? '#f26322' : '#e8e4d8'}"/>`
    }).join('')).join('')}
    <rect x="24" y="90" width="112" height="3" fill="#f26322" opacity=".55"/></svg>`,
  watch80: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="28" y="30" width="104" height="62" rx="8" fill="#e8e4d8"/><rect x="28" y="82" width="104" height="10" fill="#c8352b"/>
    <rect x="42" y="40" width="58" height="34" fill="#2b2e33"/><rect x="47" y="45" width="48" height="24" fill="#9bbc0f"/>
    <rect x="56" y="51" width="8" height="8" fill="#306230"/><rect x="76" y="58" width="6" height="6" fill="#0f380f"/>
    <circle cx="119" cy="48" r="7" fill="#c8352b"/><circle cx="128" cy="66" r="7" fill="#c8352b"/></svg>`,
  classic85: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="16" y="42" width="128" height="44" rx="6" fill="#e8e4d8"/><rect x="16" y="76" width="128" height="10" fill="#c8352b"/>
    <rect x="36" y="53" width="26" height="8" fill="#2b2e33"/><rect x="45" y="44" width="8" height="26" fill="#2b2e33"/>
    <circle cx="111" cy="53" r="7" fill="#c8352b"/><circle cx="128" cy="66" r="7" fill="#c8352b"/>
    <rect x="70" y="67" width="12" height="5" fill="#43474d"/><rect x="86" y="67" width="12" height="5" fill="#43474d"/></svg>`,
  color93: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="10" y="38" width="140" height="50" rx="12" fill="#2b2e33"/><rect x="48" y="44" width="66" height="36" fill="#5c94fc"/>
    <rect x="55" y="50" width="52" height="24" fill="#3f9e4d"/><rect x="72" y="56" width="8" height="8" fill="#f26322"/>
    <rect x="25" y="53" width="18" height="6" fill="#0f380f"/><rect x="31" y="47" width="6" height="18" fill="#0f380f"/>
    <circle cx="127" cy="52" r="6" fill="#c8352b"/><circle cx="137" cy="65" r="6" fill="#2b6cb0"/></svg>`,
  analog97: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <path d="M38 46h20l10-14h34l10 14h20v34h-24v10H62V80H38z" fill="#2b2e33"/>
    <circle cx="80" cy="58" r="9" fill="#43474d"/><rect x="75" y="48" width="10" height="16" fill="#5c6167"/>
    <rect x="46" y="50" width="16" height="5" fill="#0f380f"/><rect x="51" y="45" width="5" height="16" fill="#0f380f"/>
    <circle cx="120" cy="48" r="5" fill="#2b6cb0"/><circle cx="110" cy="60" r="5" fill="#3f9e4d"/><circle cx="126" cy="65" r="5" fill="#e8a020"/></svg>`,
  dual06: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="34" y="22" width="92" height="48" rx="6" fill="#43474d"/><rect x="45" y="30" width="70" height="30" fill="#5c94fc"/>
    <rect x="30" y="72" width="100" height="30" rx="6" fill="#2b2e33"/><rect x="51" y="77" width="58" height="20" fill="#9bbc0f"/>
    <rect x="39" y="80" width="10" height="4" fill="#f4f2ec"/><rect x="42" y="77" width="4" height="10" fill="#f4f2ec"/>
    <circle cx="117" cy="82" r="4" fill="#3f9e4d"/><circle cx="111" cy="90" r="4" fill="#c8352b"/></svg>`,
  motion08: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="62" y="16" width="36" height="84" rx="10" fill="#f4f2ec"/><rect x="70" y="26" width="20" height="7" fill="#43474d"/>
    <rect x="70" y="39" width="20" height="6" fill="#2b2e33"/><rect x="76" y="33" width="6" height="18" fill="#2b2e33"/>
    <circle cx="80" cy="66" r="7" fill="#2b6cb0"/><circle cx="80" cy="84" r="5" fill="#b9b6ad"/>
    <path d="M80 100v8c0 6-10 6-10 0" fill="none" stroke="#8a8578" stroke-width="3"/></svg>`,
  pro16: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <path d="M30 44h24l10-12h32l10 12h24v38h-28v10H58V82H30z" fill="#2b2e33"/>
    <circle cx="53" cy="61" r="8" fill="#43474d"/><circle cx="91" cy="55" r="8" fill="#43474d"/>
    <rect x="45" y="47" width="16" height="5" fill="#0f380f"/><rect x="50" y="42" width="5" height="16" fill="#0f380f"/>
    <circle cx="117" cy="48" r="5" fill="#3f9e4d"/><circle cx="127" cy="59" r="5" fill="#c8352b"/><circle cx="107" cy="59" r="5" fill="#2b6cb0"/><circle cx="117" cy="70" r="5" fill="#e8a020"/></svg>`,
  hybrid17: `<svg viewBox="0 0 160 120" shape-rendering="crispEdges" aria-hidden="true">
    <rect width="160" height="120" fill="#e7dfce"/><rect x="0" y="96" width="160" height="24" fill="#ddd4c0"/>
    <rect x="46" y="30" width="68" height="60" rx="6" fill="#2b2e33"/><rect x="52" y="36" width="56" height="46" fill="#5c94fc"/>
    <rect x="24" y="36" width="22" height="54" rx="8" fill="#2b6cb0"/><rect x="114" y="36" width="22" height="54" rx="8" fill="#c8352b"/>
    <circle cx="35" cy="50" r="6" fill="#43474d"/><circle cx="125" cy="76" r="6" fill="#43474d"/>
    <circle cx="125" cy="48" r="4" fill="#3f9e4d"/><circle cx="119" cy="58" r="4" fill="#e8a020"/></svg>`,
}

/* ---------- 设备卡片 ---------- */
function deviceCard(d, { gallery = false } = {}) {
  const rec = store.progress().devices[d.id]
  const done = !!rec
  const dots = Array.from({ length: 3 }, (_, i) => `<i class="${i < d.difficulty ? 'on' : ''}"></i>`).join('')
  const stats = gallery
    ? `<div class="gallery-stat">${done
      ? `<span>已组装 <b>${rec.count}</b> 次 · 最佳 <b>${fmtMs(rec.bestMs)}</b></span><span>最近点亮 ${fmtDate(rec.lastAt)}</span>`
      : '<span>尚未点亮 · 等你来装</span>'}</div>`
    : ''
  return `<article class="device-card ${done ? 'completed' : ''}" data-device="${d.id}" data-era="${d.era}" tabindex="0" role="button" aria-label="组装 ${d.cn}">
    <div class="device-thumb">${THUMBS[d.id]}<span class="device-era pixel">${d.era}</span><span class="device-done">已点亮 ✓</span></div>
    <div class="device-body">
      <span class="device-cat">${d.category} · ${d.inspiration}</span>
      <h3 class="device-name"><span class="pixel">${d.name}</span>${d.cn}</h3>
      <p class="device-tag">${d.tagline}</p>
      <div class="device-meta"><span class="difficulty" title="难度 ${d.difficulty}/3">${dots}</span><span>${d.parts.length} 零件 · ${d.wires.length} 接线</span></div>
      ${stats}
      <button class="device-cta" type="button">${done ? '再次组装' : '开始组装'}</button>
    </div>
  </article>`
}

let eraFilter = null
const eraGroup = era => /^198/.test(era) ? '1980s' : /^199/.test(era) ? '1990s' : /^200/.test(era) ? '2000s' : /^201/.test(era) ? '2010s' : era
export function renderHome() {
  const p = store.progress()
  const lit = DEVICE_IDS.filter(id => p.devices[id]).length
  const parts = DEVICE_LIST.reduce((n, d) => n + d.parts.length, 0)
  const wires = DEVICE_LIST.reduce((n, d) => n + d.wires.length, 0)
  $('heroStats').innerHTML = `<span><b>${DEVICE_LIST.length}</b> 台设备</span><span><b>${parts}</b> 个零件</span><span><b>${wires}</b> 组接线</span><span>已点亮 <b>${lit}/${DEVICE_LIST.length}</b></span>`
  $('deviceGrid').innerHTML = DEVICE_LIST.map(d => deviceCard(d)).join('')
  bindCards($('deviceGrid'))
  applyEraFilter()
}

function bindCards(root) {
  root.querySelectorAll('.device-card').forEach(card => {
    const go = () => { location.hash = `#/lab/${card.dataset.device}` }
    card.addEventListener('click', go)
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } })
  })
}

function applyEraFilter() {
  document.querySelectorAll('.era-chip').forEach(chip => {
    chip.setAttribute('aria-pressed', String(chip.dataset.era === eraFilter))
    chip.style.borderColor = chip.dataset.era === eraFilter ? 'var(--site-accent)' : ''
  })
  $('deviceGrid').querySelectorAll('.device-card').forEach(card => {
    card.style.display = !eraFilter || eraGroup(card.dataset.era) === eraFilter ? '' : 'none'
  })
}

export function renderGallery() {
  $('galleryGrid').innerHTML = DEVICE_LIST.map(d => deviceCard(d, { gallery: true })).join('')
  bindCards($('galleryGrid'))
}

/* ---------- 组装台 ---------- */
const SEQ_LABEL = { up: '↑', down: '↓', left: '←', right: '→', a: 'A', b: 'B', x: 'X', y: 'Y', start: 'START', select: 'SEL', l: 'L', r: 'R' }

export function renderLab(s) {
  if (!s.deviceId) return
  const d = DEVICES[s.deviceId]
  const step = currentStep(s)
  const phase = phaseOf(s)
  $('labDeviceName').textContent = `${d.name} · ${d.cn}`
  $('labDeviceEra').textContent = d.era

  const partsLeft = d.steps.filter(t => t.type === 'part' && !s.installed.includes(t.id)).length
  const wiresLeft = d.wires.length - s.wiresDone.length
  document.querySelectorAll('#phaseSteps li').forEach(li => {
    const ph = li.dataset.phase
    const done = ph === 'assemble' ? partsLeft === 0 : ph === 'wire' ? wiresLeft === 0 : s.finished
    li.classList.toggle('done', done)
    li.classList.toggle('active', ph === phase && !done)
  })

  $('trayCount').textContent = `${s.stepIndex}/${totalSteps(s)}`
  $('stepList').innerHTML = d.steps.map((t, i) => {
    const done = i < s.stepIndex
    const cur = i === s.stepIndex
    if (t.type === 'part') {
      const p = d.partsById[t.id]
      return `<li><button type="button" class="step-item ${done ? 'done' : ''} ${cur ? 'current' : ''}" data-kind="part" data-id="${p.id}">
        <span class="num pixel">${p.num}</span><span class="names"><b>${p.name}</b><small>${p.en}</small></span><span class="state">✓</span></button></li>`
    }
    const w = d.wiresById[t.id]
    return `<li><button type="button" class="step-item wire-item ${done ? 'done' : ''} ${cur ? 'current' : ''}" data-kind="plug" data-id="${w.id}">
      <span class="num pixel">W</span><span class="names"><b>${w.name}</b><small>${w.plugLabel} → ${w.portLabel}</small></span><span class="state">✓</span></button></li>`
  }).join('')
  $('stepList').querySelectorAll('.step-item').forEach(btn => {
    btn.addEventListener('click', () => { store.select(btn.dataset.kind, btn.dataset.id); audio.select() })
  })

  renderStepInfo(s, d, step)

  const selPart = s.selected?.kind === 'part' ? d.partsById[s.selected.id] : null
  const canPlace = !!selPart && !s.installed.includes(selPart.id) && s.power === 'off' && !s.finished && !s.seating
  $('placeBtn').disabled = !canPlace || s.auto
  $('placeBtn').textContent = selPart ? `放入 ${selPart.name}` : '放入组件'
  $('hintBtn').disabled = s.power !== 'off' || s.finished || s.auto

  const autoBtn = $('autoBtn')
  autoBtn.hidden = s.power !== 'off' || s.finished
  autoBtn.disabled = !!s.seating && !s.auto
  autoBtn.textContent = s.auto ? '停止自动组装' : '一键组装并点亮'
  autoBtn.classList.toggle('running', s.auto)

  const pct = progressPct(s)
  $('progressText').textContent = `${pct}%`
  $('progressBar').style.width = `${pct}%`

  const pb = $('powerBtn')
  pb.disabled = !!step || s.power === 'booting' || s.auto
  pb.classList.toggle('ready', !step && s.power === 'off')
  pb.classList.toggle('on', s.power === 'on')
  pb.querySelector('span').textContent = s.power === 'booting' ? '正在通电…' : s.power === 'on' ? '关闭电源' : '通电点亮'
  $('stageHint').textContent = s.auto ? '自动组装中 · 可随时停止接管'
    : s.power === 'on' || s.finished ? '拖动分解滑块查看组装层次 · 拖拽旋转 · 滚轮缩放'
    : '拖动旋转 · 滚轮缩放 · 点击零件选择'
  $('explodeSlider').setAttribute('aria-label', s.power === 'on' || s.finished ? '分解查看组装层次' : '分解程度')
}

function renderStepInfo(s, d, step) {
  const box = $('stepInfo')
  if (s.power !== 'off') { renderShowcase(s, d); return }
  if (step?.type === 'part') {
    const p = d.partsById[step.id]
    box.innerHTML = `<span class="si-num pixel">STEP ${s.stepIndex + 1}/${totalSteps(s)} · 组装</span>
      <h3>${p.name}</h3><span class="si-en">${p.en}</span>
      <p class="si-desc">${p.desc}</p><div class="si-fact"><b>冷知识</b>${p.fact}</div>`
  } else if (step?.type === 'wire') {
    const w = d.wiresById[step.id]
    box.innerHTML = `<span class="si-num pixel">STEP ${s.stepIndex + 1}/${totalSteps(s)} · 接线</span>
      <h3>${w.name}</h3><span class="si-en">PLUG ${w.plugLabel} → PORT ${w.portLabel}</span>
      <p class="si-desc">${w.desc}</p>
      <div class="si-fact" style="border-left-color:${w.color}"><b>接口配对</b>先点插头 <b style="display:inline;color:${w.color}">${w.plugLabel}</b>，再点同色接口 <b style="display:inline;color:${w.color}">${w.portLabel}</b>。接错不会损坏任何东西。</div>`
  } else {
    box.innerHTML = `<span class="si-num pixel">READY · 通电</span>
      <h3>全部就绪</h3><span class="si-en">ALL SYSTEMS GO</span>
      <p class="si-desc">零件与线路都已完成。按下「通电点亮」，看看你亲手装好的设备亮起的第一束光。</p>
      <div class="si-fact"><b>提示</b>${scene?.ctx?.refs?.powerSwitch ? '也可以直接点击设备上实体的电源开关。' : '点击下方「通电点亮」即可。'}</div>`
  }
}

function renderShowcase(s, d) {
  const box = $('stepInfo')
  const st = scene?.showcaseState()
  const type = d.showcase.type
  let body = ''
  if (type === 'padtest' && st) {
    const seq = st.seq.map((k, i) => `<span class="seq-key ${i < st.seqIndex ? 'hit' : ''} ${i === st.seqIndex && !st.done ? 'now' : ''}">${SEQ_LABEL[k] || k}</span>`).join('')
    const pads = Object.keys(SEQ_LABEL).map(k => `<button type="button" class="pad-btn" data-press="${k}">${SEQ_LABEL[k]}</button>`).join('')
    body = `<p>${st.done ? '测试通过！手柄已收入图鉴。' : '按顺序点亮按键（点 3D 按键或下方按钮）：'}</p>
      <div class="test-seq">${seq}</div><div class="pad-grid">${pads}</div>`
  } else if (type === 'typetest' && st) {
    const chars = [...st.phrase].map((c, i) => `<span class="${i < st.typed ? 'typed' : ''} ${i === st.typed && !st.done ? 'cur' : ''}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')
    body = `<p>${st.done ? '敲击完成！键盘已收入图鉴。' : '用物理键盘敲出这句话，或直接点击 3D 键帽：'}</p>
      <div class="type-phrase">${chars}</div>`
  } else if (type === 'lcd') {
    body = `<p>${d.showcase.intro}</p>
      <div class="pad-grid">
        <button type="button" class="pad-btn" data-press="left">←</button>
        <button type="button" class="pad-btn" data-press="a">跳 A</button>
        <button type="button" class="pad-btn" data-press="right">→</button>
        <button type="button" class="pad-btn" data-press="b">B</button>
      </div>`
  } else if (type === 'tv') {
    body = `<p>${d.showcase.intro}</p>
      <div class="pad-grid"><button type="button" class="pad-btn" data-press="reset">RESET 重开</button></div>`
  } else if (type === 'watch' && st) {
    body = `<p>${d.showcase.intro}</p>
      <div class="test-seq"><span>SCORE ${st.score}/8</span><span>MISS ${st.misses}</span></div>
      <div class="pad-grid"><button type="button" class="pad-btn" data-press="a">A ←</button><button type="button" class="pad-btn" data-press="b">→ B</button></div>`
  } else if (type === 'color' && st) {
    body = `<p>${d.showcase.intro}</p>
      <div class="test-seq"><span>GEM ${st.gems}/5</span><span>JUMP / MOVE</span></div>
      <div class="pad-grid"><button type="button" class="pad-btn" data-press="left">←</button><button type="button" class="pad-btn" data-press="right">→</button><button type="button" class="pad-btn" data-press="a">跳 A</button></div>`
  } else if (type === 'dual' && st) {
    const seq = st.seq.map((k, i) => `<span class="seq-key ${i < st.seqIndex ? 'hit' : ''} ${i === st.seqIndex && !st.done ? 'now' : ''}">${SEQ_LABEL[k] || k}</span>`).join('')
    body = `<p>${d.showcase.intro}</p>
      <div class="test-seq"><span>ROUND ${Math.min(st.round + 1, 3)}/3</span></div><div class="test-seq">${seq}</div>
      <div class="pad-grid">${['up', 'left', 'right', 'down'].map(k => `<button type="button" class="pad-btn" data-press="${k}">${SEQ_LABEL[k]}</button>`).join('')}</div>`
  } else if (type === 'analog' && st) {
    const walls = new Set(['2,1', '2,2', '2,3'])
    const cells = []
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const cls = walls.has(`${x},${y}`) ? 'wall' : x === st.x && y === st.y ? 'player' : x === 4 && y === 0 ? 'exit' : ''
      cells.push(`<span class="maze-cell ${cls}"></span>`)
    }
    body = `<p>${d.showcase.intro}</p><div class="maze-grid">${cells.join('')}</div>
      <div class="test-seq"><span>MOVES ${st.moves}</span><span>EXIT ↗</span></div>
      <div class="pad-grid">${['up', 'left', 'right', 'down'].map(k => `<button type="button" class="pad-btn" data-press="${k}">${SEQ_LABEL[k]}</button>`).join('')}<button type="button" class="pad-btn" data-press="a">重来</button></div>`
  } else if (type === 'motion' && st) {
    const targets = Array.from({ length: st.total }, (_, i) => `<button type="button" class="motion-target ${st.hit.includes(i) ? 'hit' : ''}" data-target="${i}" ${st.hit.includes(i) ? 'disabled' : ''}>${i + 1}</button>`).join('')
    body = `<p>${d.showcase.intro}</p><div class="test-seq"><span>HITS ${st.hits}/${st.total}</span></div><div class="motion-grid">${targets}</div>`
  } else if (type === 'hybrid' && st) {
    body = `<p>${d.showcase.intro}</p>
      <div class="test-seq"><span>FOES ${st.foes}/6</span><span>SHOTS ${st.shots}</span></div>
      <div class="pad-grid"><button type="button" class="pad-btn" data-press="left">←</button><button type="button" class="pad-btn" data-press="right">→</button><button type="button" class="pad-btn" data-press="a">跳 A</button><button type="button" class="pad-btn" data-press="b">射 B</button></div>`
  }
  if (['lcd', 'tv', 'watch', 'color', 'dual', 'analog', 'motion', 'hybrid'].includes(type)) {
    body += s.finished
      ? '<button type="button" class="primary-btn" disabled>已收入图鉴 ✓</button>'
      : '<button type="button" class="primary-btn" data-finish>收入图鉴 ✓</button>'
  }
  box.innerHTML = `<div class="showcase-box"><span class="si-num pixel">DEVICE ONLINE</span>
    <h3>${d.name} 运行中</h3>${body}</div>`
  box.querySelectorAll('[data-press]').forEach(btn => {
    btn.addEventListener('click', () => scene?.pressShowcase(btn.dataset.press))
  })
  box.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => scene?.hitShowcaseTarget(+btn.dataset.target))
  })
  box.querySelectorAll('[data-finish]').forEach(btn => {
    btn.addEventListener('click', () => { store.finish(); audio.click() })
  })
}

/* ---------- 提示条 ---------- */
let toastTimer = 0
let lastNotice = null
export function renderToast(s) {
  if (s.notice === lastNotice) return
  lastNotice = s.notice
  const el = $('toast')
  el.className = `toast ${s.notice.kind}`
  el.innerHTML = `<b>${s.notice.title}</b><span>${s.notice.detail}</span>`
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true }, 4200)
}

/* ---------- 浮层 ---------- */
let overlayReturnFocus = null
const focusables = root => [...root.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
function openOverlay(id) {
  const el = $(id)
  if (!el.hidden) return
  overlayReturnFocus = document.activeElement
  el.hidden = false
  requestAnimationFrame(() => focusables(el)[0]?.focus())
}
function closeOverlay(id) {
  const el = $(id)
  if (el.hidden) return
  el.hidden = true
  const target = overlayReturnFocus
  overlayReturnFocus = null
  if (target instanceof HTMLElement && target.isConnected) target.focus()
}

export function showGuide() { openOverlay('guideOverlay') }
export function hideGuide() { closeOverlay('guideOverlay'); store.markGuideSeen() }

let completeKey = ''
export function maybeComplete(s) {
  if (!s.finished) return
  const key = `${s.epoch}:${s.finishedAt}`
  if (key === completeKey) return
  completeKey = key
  const d = DEVICES[s.deviceId]
  $('completeTitle').textContent = `${d.name} 点亮成功`
  $('completeSub').textContent = `${d.cn} · ${d.tagline}`
  $('completeStats').innerHTML = `
    <div class="cs"><b>${fmtMs(s.finishedAt - s.startedAt)}</b><span>本次用时</span></div>
    <div class="cs"><b>${totalSteps(s)}</b><span>完成步骤</span></div>
    <div class="cs"><b>${s.mistakes}</b><span>小失误</span></div>`
  openOverlay('completeModal')
}
export function hideComplete() { closeOverlay('completeModal') }

let confirmCb = null
export function openConfirm(title, detail, cb) {
  $('confirmTitle').textContent = title
  $('confirmDetail').textContent = detail
  confirmCb = cb
  openOverlay('confirmModal')
}
export function hideConfirm() { closeOverlay('confirmModal'); confirmCb = null }

export function syncSound() {
  const on = store.progress().sound
  const btn = $('soundToggle')
  btn.setAttribute('aria-pressed', String(on))
  btn.setAttribute('aria-label', on ? '关闭声音' : '开启声音')
}

export function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name))
}

/* ---------- 初始化 ---------- */
export function initUI() {
  renderHome()
  renderGallery()
  syncSound()

  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return
    const overlay = ['guideOverlay', 'completeModal', 'confirmModal'].map($).find(el => !el.hidden)
    if (!overlay) return
    const items = focusables(overlay)
    if (!items.length) return
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  })

  document.querySelectorAll('.era-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      eraFilter = eraFilter === chip.dataset.era ? null : chip.dataset.era
      applyEraFilter()
      audio.click()
      $('deviceGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  })

  $('soundToggle').addEventListener('click', () => {
    const on = !store.progress().sound
    store.setSound(on)
    audio.setEnabled(on)
    if (on) audio.click()
  })
  $('guideBtn').addEventListener('click', () => { showGuide(); audio.click() })
  $('guideClose').addEventListener('click', () => { hideGuide(); audio.click() })
  $('guideOverlay').addEventListener('click', e => { if (e.target === $('guideOverlay')) hideGuide() })

  $('autoBtn').addEventListener('click', () => { store.toggleAuto(); audio.click() })
  $('placeBtn').addEventListener('click', () => {
    const sel = store.get().selected
    if (sel?.kind === 'part') store.attemptPlace(sel.id)
  })
  $('hintBtn').addEventListener('click', () => { store.hint(); audio.click() })
  $('powerBtn').addEventListener('click', () => store.power())
  $('resetBtn').addEventListener('click', () => {
    openConfirm('再装一次？', '当前设备的零件、线路与通电状态都会复原，可以重新体验组装。', () => { store.reset(); audio.click() })
  })
  $('confirmCancel').addEventListener('click', hideConfirm)
  $('confirmOk').addEventListener('click', () => { const cb = confirmCb; hideConfirm(); cb?.() })
  $('confirmModal').addEventListener('click', e => { if (e.target === $('confirmModal')) hideConfirm() })

  $('completeShowcase').addEventListener('click', () => { hideComplete(); audio.click() })
  $('completeRetry').addEventListener('click', () => { hideComplete(); store.reset() })
  $('completeHome').addEventListener('click', () => { hideComplete(); location.hash = '#/' })
  $('completeNext').addEventListener('click', () => {
    hideComplete()
    const ids = DEVICE_IDS
    const next = ids[(ids.indexOf(store.get().deviceId) + 1) % ids.length]
    location.hash = `#/lab/${next}`
  })
  $('completeModal').addEventListener('click', e => { if (e.target === $('completeModal')) hideComplete() })

  $('resetProgress').addEventListener('click', () => {
    openConfirm('清空本地进度？', '图鉴中所有设备的组装记录将被删除，且无法恢复。', () => {
      store.clearProgress(); renderHome(); renderGallery(); audio.click()
    })
  })

  store.subscribe(s => {
    renderLab(s)
    renderToast(s)
    syncSound()
    maybeComplete(s)
    if (!s.deviceId) { renderHome(); renderGallery() }
  })
}