// RETO·LAB 音频：全部由 WebAudio 实时合成，无外部音频资产
let ctx = null
let master = null
let enabled = true
let noiseBuf = null
const active = new Set()

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = enabled ? 0.5 : 0
    master.connect(ctx.destination)
    const len = ctx.sampleRate * 0.4
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return true
}

function env(gainNode, t0, peak, decay, attack = 0.004) {
  const g = gainNode.gain
  g.setValueAtTime(0.0001, t0)
  g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack)
  g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
}

function tone({ freq = 440, freqEnd = null, type = 'square', peak = 0.12, decay = 0.12, attack = 0.004, delay = 0 }) {
  if (!enabled || !ensure()) return
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + attack + decay)
  env(g, t0, peak, decay, attack)
  osc.connect(g); g.connect(master)
  active.add(osc); osc.onended = () => active.delete(osc)
  osc.start(t0); osc.stop(t0 + attack + decay + 0.05)
}

function noise({ peak = 0.1, decay = 0.08, delay = 0, filterFreq = 2400, q = 1 }) {
  if (!enabled || !ensure()) return
  const t0 = ctx.currentTime + delay
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'; f.frequency.value = filterFreq; f.Q.value = q
  const g = ctx.createGain()
  env(g, t0, peak, decay, 0.002)
  src.connect(f); f.connect(g); g.connect(master)
  active.add(src); src.onended = () => active.delete(src)
  src.start(t0); src.stop(t0 + decay + 0.05)
}

const NOTE = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 }

export const audio = {
  get enabled() { return enabled },
  setEnabled(b) {
    enabled = b
    if (b) {
      ensure()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.02)
    } else {
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
      }
      for (const node of active) { try { node.stop() } catch {} }
      active.clear()
    }
  },
  unlock() { if (enabled) ensure() },

  click() { tone({ freq: 1900, freqEnd: 1200, type: 'triangle', peak: 0.05, decay: 0.04 }) },
  select() { tone({ freq: 660, freqEnd: 990, type: 'triangle', peak: 0.08, decay: 0.09 }) },
  snap() {
    noise({ peak: 0.16, decay: 0.06, filterFreq: 1800 })
    tone({ freq: 220, freqEnd: 110, type: 'sine', peak: 0.18, decay: 0.1 })
    tone({ freq: 1320, type: 'triangle', peak: 0.05, decay: 0.05, delay: 0.03 })
  },
  error() { tone({ freq: 180, freqEnd: 120, type: 'sawtooth', peak: 0.09, decay: 0.16 }); tone({ freq: 140, type: 'square', peak: 0.05, decay: 0.12, delay: 0.05 }) },
  connect() {
    noise({ peak: 0.1, decay: 0.04, filterFreq: 3200 })
    tone({ freq: 880, type: 'triangle', peak: 0.08, decay: 0.06, delay: 0.02 })
    tone({ freq: 1320, type: 'triangle', peak: 0.08, decay: 0.09, delay: 0.08 })
  },
  key() { noise({ peak: 0.12, decay: 0.035, filterFreq: 2600, q: 2 }); tone({ freq: 400 + Math.random() * 300, freqEnd: 200, type: 'sine', peak: 0.06, decay: 0.05 }) },
  button() { tone({ freq: 520 + Math.random() * 120, freqEnd: 320, type: 'triangle', peak: 0.1, decay: 0.07 }); noise({ peak: 0.05, decay: 0.03, filterFreq: 1500 }) },
  jump() { tone({ freq: 330, freqEnd: 660, type: 'square', peak: 0.06, decay: 0.12 }) },

  powerOn(deviceId) {
    const seqs = {
      pixelboy89: [[NOTE.E5, 0], [NOTE.G5, 0.09], [NOTE.C6, 0.18], [NOTE.E6, 0.3]],
      famiclone83: [[NOTE.C5, 0], [NOTE.E5, 0.08], [NOTE.G5, 0.16], [NOTE.C6, 0.24], [NOTE.E6, 0.36]],
      propad90: [[NOTE.A4, 0], [NOTE.C5, 0.07], [NOTE.E5, 0.14], [NOTE.A5, 0.21]],
      key84: [[NOTE.C4, 0], [NOTE.G4, 0.06], [NOTE.C5, 0.12], [NOTE.E5, 0.18], [NOTE.G5, 0.24], [NOTE.C6, 0.3]],
      watch80: [[NOTE.C5, 0], [NOTE.E5, 0.08], [NOTE.G5, 0.16], [NOTE.C6, 0.26]],
      classic85: [[NOTE.G4, 0], [NOTE.C5, 0.07], [NOTE.E5, 0.14], [NOTE.G5, 0.22]],
      color93: [[NOTE.C4, 0], [NOTE.E4, 0.06], [NOTE.G4, 0.12], [NOTE.C5, 0.18], [NOTE.E5, 0.25], [NOTE.G5, 0.32]],
      analog97: [[NOTE.A4, 0], [NOTE.C5, 0.07], [NOTE.E5, 0.14], [NOTE.A5, 0.22], [NOTE.C6, 0.3]],
      dual06: [[NOTE.E5, 0], [NOTE.B4, 0.07], [NOTE.C5, 0.14], [NOTE.G5, 0.22], [NOTE.E6, 0.3]],
      motion08: [[NOTE.G5, 0], [NOTE.E5, 0.06], [NOTE.C5, 0.12], [NOTE.G4, 0.2], [NOTE.C5, 0.28]],
      pro16: [[NOTE.C4, 0], [NOTE.G4, 0.06], [NOTE.D5, 0.12], [NOTE.G5, 0.2], [NOTE.B4, 0.28], [NOTE.D6, 0.36]],
      hybrid17: [[NOTE.C5, 0], [NOTE.G5, 0.06], [NOTE.C6, 0.14], [NOTE.E6, 0.22], [NOTE.G6, 0.3]],
    }
    const seq = seqs[deviceId] || seqs.pixelboy89
    tone({ freq: 90, freqEnd: 240, type: 'sine', peak: 0.1, decay: 0.3 })
    seq.forEach(([f, d]) => tone({ freq: f, type: 'square', peak: 0.07, decay: 0.16, delay: d }))
  },
  fanfare() {
    const seq = [[NOTE.C5, 0], [NOTE.E5, 0.1], [NOTE.G5, 0.2], [NOTE.C6, 0.3], [NOTE.G5, 0.42], [NOTE.C6, 0.52], [NOTE.E6, 0.66]]
    seq.forEach(([f, d]) => { tone({ freq: f, type: 'square', peak: 0.07, decay: 0.2, delay: d }); tone({ freq: f / 2, type: 'triangle', peak: 0.06, decay: 0.22, delay: d }) })
  },
  bootHum() { tone({ freq: 60, freqEnd: 120, type: 'sawtooth', peak: 0.03, decay: 0.5 }) },
}