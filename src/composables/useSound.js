const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

export function useSound() {
  function ensureCtx() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
  }

  // 马蹄声：短促的低频敲击
  function playStep() {
    ensureCtx()
    playTone(800, 0.06, 'square', 0.08)
    setTimeout(() => playTone(600, 0.05, 'square', 0.05), 30)
  }

  // 起点选择音
  function playStart() {
    ensureCtx()
    playTone(523, 0.12, 'sine', 0.15)
    setTimeout(() => playTone(659, 0.12, 'sine', 0.15), 100)
  }

  // 错误音：低沉短嗡
  function playError() {
    ensureCtx()
    playTone(200, 0.2, 'sawtooth', 0.08)
  }

  // 胜利音效：上行琶音
  function playVictory() {
    ensureCtx()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.18), i * 120)
    })
    // 最后的和弦
    setTimeout(() => {
      playTone(523, 0.5, 'triangle', 0.12)
      playTone(659, 0.5, 'triangle', 0.12)
      playTone(784, 0.5, 'triangle', 0.12)
    }, 600)
  }

  // 自动模式每一步动画音（更轻）
  function playAutoStep() {
    ensureCtx()
    playTone(1000, 0.03, 'sine', 0.04)
  }

  return { playStep, playStart, playError, playVictory, playAutoStep }
}