type SfxName = 'tap' | 'success' | 'perfect' | 'fail' | 'bell' | 'cash' | 'step' | 'select' | 'dispatch' | 'alarm';

let ctx: AudioContext | null = null;
let muted = false;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slide = 0) {
  const c = getCtx();
  if (!c || muted) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  const t = c.currentTime + when;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function sfx(name: SfxName) {
  switch (name) {
    case 'tap':
      tone(520 + Math.random() * 80, 0.06, 'square', 0.08);
      break;
    case 'step':
      tone(180, 0.04, 'triangle', 0.03);
      break;
    case 'select':
      tone(660, 0.07, 'square', 0.07);
      tone(880, 0.08, 'square', 0.06, 0.06);
      break;
    case 'success':
      tone(523, 0.1, 'triangle', 0.12);
      tone(659, 0.1, 'triangle', 0.12, 0.08);
      tone(784, 0.16, 'triangle', 0.12, 0.16);
      break;
    case 'perfect':
      tone(659, 0.08, 'triangle', 0.12);
      tone(784, 0.08, 'triangle', 0.12, 0.07);
      tone(988, 0.1, 'triangle', 0.12, 0.14);
      tone(1319, 0.22, 'triangle', 0.14, 0.21);
      break;
    case 'fail':
      tone(220, 0.18, 'sawtooth', 0.09, 0, -120);
      tone(160, 0.22, 'sawtooth', 0.08, 0.1, -80);
      break;
    case 'bell':
      tone(1046, 0.25, 'sine', 0.1);
      tone(1318, 0.35, 'sine', 0.08, 0.05);
      break;
    case 'cash':
      tone(1200, 0.06, 'square', 0.08);
      tone(1600, 0.06, 'square', 0.08, 0.07);
      tone(2000, 0.16, 'square', 0.08, 0.14);
      break;
    case 'dispatch':
      tone(300, 0.3, 'sawtooth', 0.08, 0, 500);
      break;
    case 'alarm':
      tone(440, 0.12, 'square', 0.07);
      tone(440, 0.12, 'square', 0.07, 0.18);
      break;
  }
}
