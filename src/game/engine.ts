import { sfx, unlockAudio } from './audio';
import { addHighScore, AttrKey, loadProfile, Profile, resetProfile, saveProfile, ATTR_KEYS } from './storage';

/* ---------- Shared types ---------- */
export type Ingredient = 'calabresa' | 'mussarela' | 'tomate' | 'catupiry';
export const INGS: Ingredient[] = ['calabresa', 'mussarela', 'tomate', 'catupiry'];
export const ING: Record<Ingredient, { label: string; sabor: string; color: string; station: string; icon: string }> = {
  calabresa: { label: 'Calabresa', sabor: 'Calabresa', color: '#d9452b', station: 'fatiador', icon: '🍖' },
  mussarela: { label: 'Mussarela', sabor: 'Mussarela', color: '#f6e27a', station: 'ralador', icon: '🧀' },
  tomate: { label: 'Tomate & Cebola', sabor: 'Marguerita', color: '#e8553d', station: 'processador', icon: '🍅' },
  catupiry: { label: 'Catupiry', sabor: 'Frango c/ Catupiry', color: '#fff5d6', station: 'catupiry', icon: '🥣' },
};
export const BAIRROS = ['Centro', 'Norte', 'Sul', 'Leste'];

export interface Rect { x: number; y: number; w: number; h: number }
export interface Station extends Rect {
  id: string;
  label: string;
  icon: string;
  color: string;
  uses: number;
  dirty: boolean;
  ing?: Ingredient;
  solid: boolean;
}
export type OrderStatus = 'novo' | 'fila' | 'cozinha' | 'pronta' | 'embalada' | 'saiu';
export interface Order {
  id: number;
  sabor: Ingredient;
  drink: boolean;
  bairro: string;
  status: OrderStatus;
  timer: number;
  maxTimer: number;
  cook: number;
  origin: 'app' | 'balcao';
}
export interface Holding { type: 'raw' | 'drink'; ing?: Ingredient }
export interface Active {
  station: Station;
  kind: 'hold' | 'mash' | 'timing';
  label: string;
  progress: number;
  duration: number;
  target: number;
  cursor: number;
  dir: number;
  zone: [number, number];
  onDone: (quality: number) => void;
}
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; g: number; shape: 'circle' | 'rect' | 'text'; text?: string }
export interface Floater { x: number; y: number; text: string; life: number; color: string; size: number }
export interface Bubble { text: string; life: number }
export interface DialogueOption { label: string; action: () => void; disabled?: boolean }
export interface Dialogue { speaker: string; icon: string; text: string; options: DialogueOption[] }

export interface Building extends Rect { id: string; label: string; color: string; roof: string; icon: string; door: { x: number; y: number } }
export interface Npc { x: number; y: number; tx: number; ty: number; color: string; wait: number; name: string }

export interface ShiftSummary {
  day: number;
  score: number;
  entregues: number;
  processados: number;
  erros: number;
  rotas: number;
  perfeitos: number;
  salario: number;
  base: number;
  bonus: number;
  penalidade: number;
  avaliacao: string;
  attrGains: Partial<Record<AttrKey, number>>;
  isHigh: boolean;
  pendentes: number;
}

export interface ShiftState {
  phase: 'prep' | 'op' | 'closing' | 'done';
  prepStep: number; // 0 ponto,1 uniforme,2 pia,3 done
  time: number; // seconds remaining in op
  duration: number;
  elapsed: number;
  stock: Record<Ingredient, number>;
  orders: Order[];
  nextId: number;
  spawnTimer: number;
  score: number;
  combo: number;
  comboTimer: number;
  stress: number;
  entregues: number;
  processados: number;
  erros: number;
  rotas: number;
  perfeitos: number;
  holding: Holding | null;
  uniform: boolean;
  handsClean: boolean;
  customer: { patience: number; max: number } | null;
  customerTimer: number;
  courierAway: number;
  courierX: number;
  pizzaiolo: Bubble | null;
  complaintTimer: number;
  attrGains: Partial<Record<AttrKey, number>>;
  oven: number; // 0..1 cooking animation
  pendentes: number;
  ovenFlash: number;
}

export type Scene = 'start' | 'world' | 'shift' | 'summary' | 'gameover';

const WORLD_W = 1700;
const WORLD_H = 1050;
const PIZ_W = 960;
const PIZ_H = 620;

/* ---------- Pizzaria layout ---------- */
function makeStations(): Station[] {
  const s = (id: string, label: string, icon: string, color: string, x: number, y: number, w: number, h: number, ing?: Ingredient): Station => ({
    id, label, icon, color, x, y, w, h, ing, uses: 0, dirty: false, solid: true,
  });
  return [
    s('ponto', 'Relógio de Ponto', '🕒', '#6d4c41', 150, 540, 44, 40),
    s('armario', 'Armário / Uniforme', '👕', '#5d6d7e', 60, 70, 70, 48),
    s('pia', 'Pia', '🧼', '#85c1e9', 170, 70, 60, 44),
    s('geladeira', 'Geladeira de Ingredientes', '🧊', '#aed6f1', 50, 260, 70, 110),
    s('fatiador', 'Fatiador (Calabresa)', '🔪', '#b03a2e', 350, 70, 90, 56, 'calabresa'),
    s('processador', 'Processador (Tomate/Cebola)', '🌀', '#c0392b', 470, 70, 90, 56, 'tomate'),
    s('ralador', 'Ralador (Mussarela)', '🧀', '#d4ac0d', 590, 70, 90, 56, 'mussarela'),
    s('catupiry', 'Bancada Catupiry', '🥣', '#f0e6c8', 710, 70, 90, 56, 'catupiry'),
    s('forno', 'Cozinha — Pizzaiolo Beto', '🔥', '#7b4a2d', 820, 230, 110, 120),
    s('expedicao', 'Expedição', '📦', '#a04000', 560, 360, 150, 60),
    s('computador', 'Computador de Pedidos', '💻', '#2c3e50', 330, 360, 110, 60),
    s('bebidas', 'Geladeira de Bebidas', '🥤', '#5dade2', 50, 440, 70, 90),
    s('balcao', 'Balcão', '🛎️', '#8e5a3c', 330, 545, 170, 40),
    s('saida', 'Saída — Entregador', '🛵', '#616a6b', 860, 520, 60, 60),
  ];
}

const BUILDINGS: Building[] = [
  { id: 'casa', label: 'Minha Casa', color: '#f4d6a0', roof: '#c0683b', icon: '🏠', x: 160, y: 160, w: 220, h: 170, door: { x: 270, y: 350 } },
  { id: 'pizzaria', label: 'Pizzaria Bella Zero', color: '#f8efe0', roof: '#c62828', icon: '🍕', x: 680, y: 130, w: 320, h: 210, door: { x: 840, y: 360 } },
  { id: 'loja', label: 'Loja do Bairro', color: '#dcedc8', roof: '#388e3c', icon: '🛒', x: 1250, y: 160, w: 230, h: 170, door: { x: 1365, y: 350 } },
  { id: 'aluguel', label: 'Ponto Comercial — Aluga-se', color: '#e0e0e0', roof: '#78909c', icon: '🏪', x: 700, y: 700, w: 300, h: 190, door: { x: 850, y: 680 } },
  { id: 'parque', label: 'Praça Zero', color: '#a5d6a7', roof: '#66bb6a', icon: '🌳', x: 180, y: 680, w: 320, h: 220, door: { x: 340, y: 660 } },
  { id: 'onibus', label: 'Ponto de Ônibus', color: '#90a4ae', roof: '#546e7a', icon: '🚌', x: 1080, y: 400, w: 90, h: 50, door: { x: 1125, y: 470 } },
];

export class Engine {
  scene: Scene = 'start';
  paused = false;
  profile: Profile;
  dialogue: Dialogue | null = null;
  summary: ShiftSummary | null = null;
  gameOverReason = '';
  toast: { text: string; life: number } | null = null;

  input = { dx: 0, dy: 0, action: false, edge: false };
  keys = new Set<string>();
  joy = { dx: 0, dy: 0 };
  touchAction = false;

  player = { x: 1125, y: 520, facing: 1, walk: 0, fx: 0, fy: 1 };
  npcs: Npc[] = [];
  buildings = BUILDINGS;
  stations: Station[] = makeStations();
  shift: ShiftState | null = null;
  active: Active | null = null;
  prompt: { text: string; ok: boolean } | null = null;

  particles: Particle[] = [];
  floaters: Floater[] = [];
  shake = 0;
  shakeX = 0;
  shakeY = 0;
  flash = 0;
  time = 0;
  stepTimer = 0;

  viewW = 960;
  viewH = 600;
  cam = { x: 0, y: 0 };

  listeners = new Set<() => void>();
  uiTick = 0;
  private raf = 0;
  private last = 0;

  constructor() {
    this.profile = loadProfile();
    for (let i = 0; i < 5; i++) {
      this.npcs.push({ x: 400 + i * 250, y: 560, tx: 400, ty: 560, color: ['#ff8a65', '#4db6ac', '#ba68c8', '#ffd54f', '#90caf9'][i], wait: Math.random() * 2, name: 'NPC' });
    }
  }

  /* ---------- lifecycle ---------- */
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  notify() {
    this.uiTick++;
    this.listeners.forEach((f) => f());
  }

  start() {
    this.last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.time += dt;
      this.update(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }
  stop() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  onBlur = () => {
    this.keys.clear();
    if (this.scene === 'shift' && !this.paused && !this.dialogue) this.togglePause();
  };
  onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    unlockAudio();
    if (k === 'escape' || k === 'p') {
      if (this.scene === 'shift' || this.scene === 'world') {
        if (this.dialogue) this.closeDialogue();
        else this.togglePause();
      }
      return;
    }
    if (this.dialogue) {
      const n = parseInt(k);
      if (!isNaN(n) && n >= 1 && n <= this.dialogue.options.length) this.chooseOption(n - 1);
      else if (k === 'enter' || k === ' ' || k === 'e') this.chooseOption(0);
      return;
    }
    if (this.paused) {
      if (k === 'enter' || k === ' ') this.togglePause();
      return;
    }
    if (this.scene === 'start' && (k === 'enter' || k === ' ')) {
      this.beginGame();
      return;
    }
    if (this.scene === 'gameover' && (k === 'enter' || k === ' ' || k === 'r')) {
      this.restartShift();
      return;
    }
    if (this.scene === 'summary' && (k === 'enter' || k === ' ')) {
      this.leaveSummary();
      return;
    }
    if (k === 'e' || k === ' ' || k === 'enter') {
      this.pressAction();
      return;
    }
    this.keys.add(k);
  };
  onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'e' || k === ' ' || k === 'enter') this.releaseAction();
    this.keys.delete(k);
  };
  pressAction() {
    unlockAudio();
    this.input.action = true;
    this.input.edge = true;
  }
  releaseAction() {
    this.input.action = false;
  }
  setJoystick(dx: number, dy: number) {
    this.joy.dx = dx;
    this.joy.dy = dy;
  }

  togglePause() {
    if (this.scene !== 'shift' && this.scene !== 'world') return;
    this.paused = !this.paused;
    sfx('select');
    this.notify();
  }

  /* ---------- FX helpers ---------- */
  burst(x: number, y: number, color: string | string[], n = 12, speed = 160, size = 4, g = 300, shape: 'circle' | 'rect' = 'circle') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      const c = Array.isArray(color) ? color[Math.floor(Math.random() * color.length)] : color;
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - speed * 0.4, life: 0.5 + Math.random() * 0.5, max: 1, color: c, size: size * (0.6 + Math.random() * 0.8), g, shape });
    }
    if (this.particles.length > 400) this.particles.splice(0, this.particles.length - 400);
  }
  confetti(x: number, y: number) {
    this.burst(x, y, ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ffffff'], 40, 320, 5, 500, 'rect');
  }
  float(x: number, y: number, text: string, color = '#fff', size = 18) {
    this.floaters.push({ x, y, text, life: 1.2, color, size });
  }
  kick(amount: number) {
    this.shake = Math.max(this.shake, amount);
  }
  showToast(text: string, life = 2.5) {
    this.toast = { text, life };
  }

  updateFx(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.g * dt;
      p.vx *= 0.98;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life -= dt;
      f.y -= 40 * dt;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 30);
      this.shakeX = (Math.random() - 0.5) * this.shake;
      this.shakeY = (Math.random() - 0.5) * this.shake;
    } else {
      this.shakeX = this.shakeY = 0;
    }
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3);
    if (this.toast) {
      this.toast.life -= dt;
      if (this.toast.life <= 0) this.toast = null;
    }
  }

  /* ---------- Attributes ---------- */
  gain(attr: AttrKey, amount: number) {
    amount *= 0.45;
    const before = Math.floor(this.profile.attrs[attr] / 10);
    this.profile.attrs[attr] = Math.min(100, this.profile.attrs[attr] + amount);
    if (this.shift) this.shift.attrGains[attr] = (this.shift.attrGains[attr] || 0) + amount;
    const after = Math.floor(this.profile.attrs[attr] / 10);
    if (after > before) {
      this.float(this.player.x, this.player.y - 60, `⬆ ${attr.toUpperCase()} Nv ${after}`, '#ffd740', 16);
      this.confetti(this.player.x, this.player.y - 30);
      sfx('perfect');
    }
  }
  speed() {
    let s = 230 + this.profile.attrs.agilidade * 0.9;
    if (this.profile.energy < 30) s *= 0.8;
    if (this.profile.energy <= 0) s *= 0.75;
    if (this.shift && this.shift.stress > 75) s *= 0.92;
    return s;
  }

  /* ---------- Main update ---------- */
  update(dt: number) {
    this.updateFx(dt);
    if (this.paused || this.dialogue) {
      this.input.edge = false;
      return;
    }
    this.readInput();
    if (this.scene === 'world') this.updateWorld(dt);
    else if (this.scene === 'shift') this.updateShift(dt);
    this.input.edge = false;
    if (Math.floor(this.time * 15) !== Math.floor((this.time - dt) * 15)) this.notify();
  }

  readInput() {
    let dx = 0, dy = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a')) dx -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) dy -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy += 1;
    if (dx === 0 && dy === 0) { dx = this.joy.dx; dy = this.joy.dy; }
    const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; }
    this.input.dx = dx;
    this.input.dy = dy;
  }

  movePlayer(dt: number, solids: Rect[], w: number, h: number) {
    const p = this.player;
    const sp = this.speed();
    const r = 15;
    const { dx, dy } = this.input;
    if (this.active && this.active.kind !== 'hold') {
      // minigames freeze movement; hold allows cancel by moving
    }
    if (dx !== 0 || dy !== 0) {
      if (this.active) this.cancelActive();
      p.walk += dt * 10;
      p.fx = dx; p.fy = dy;
      if (dx !== 0) p.facing = Math.sign(dx);
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = 0.28;
        this.particles.push({ x: p.x - dx * 8, y: p.y + 14, vx: 0, vy: -10, life: 0.4, max: 0.4, color: 'rgba(0,0,0,0.12)', size: 5, g: 0, shape: 'circle' });
      }
      const nx = p.x + dx * sp * dt;
      if (!solids.some((s) => circleRect(nx, p.y, r, s))) p.x = nx;
      const ny = p.y + dy * sp * dt;
      if (!solids.some((s) => circleRect(p.x, ny, r, s))) p.y = ny;
      p.x = Math.max(r + 8, Math.min(w - r - 8, p.x));
      p.y = Math.max(r + 8, Math.min(h - r - 8, p.y));
    } else {
      p.walk = 0;
    }
  }

  updateCam(w: number, h: number) {
    const tx = this.player.x - this.viewW / 2;
    const ty = this.player.y - this.viewH / 2;
    this.cam.x += (tx - this.cam.x) * 0.12;
    this.cam.y += (ty - this.cam.y) * 0.12;
    this.cam.x = Math.max(0, Math.min(w - this.viewW, this.cam.x));
    this.cam.y = Math.max(0, Math.min(h - this.viewH, this.cam.y));
    if (w < this.viewW) this.cam.x = (w - this.viewW) / 2;
    if (h < this.viewH) this.cam.y = (h - this.viewH) / 2;
  }

  /* ---------- World ---------- */
  beginGame() {
    sfx('select');
    this.scene = 'world';
    this.player.x = 1125; this.player.y = 530;
    this.cam.x = this.player.x - this.viewW / 2; this.cam.y = this.player.y - this.viewH / 2;
    if (this.profile.totalShifts === 0) this.showToast('Você desceu do ônibus. A pizzaria fica logo à esquerda — fale com o atendente! 🍕', 6);
    this.notify();
  }
  worldSolids(): Rect[] {
    return this.buildings.filter((b) => b.id !== 'parque').map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
  }
  updateWorld(dt: number) {
    this.movePlayer(dt, this.worldSolids(), WORLD_W, WORLD_H);
    this.updateCam(WORLD_W, WORLD_H);
    for (const n of this.npcs) {
      const d = Math.hypot(n.tx - n.x, n.ty - n.y);
      if (d < 4) {
        n.wait -= dt;
        if (n.wait <= 0) {
          n.wait = 1 + Math.random() * 3;
          n.tx = 300 + Math.random() * 1200;
          n.ty = Math.random() < 0.5 ? 480 + Math.random() * 120 : 560 + Math.random() * 60;
        }
      } else {
        n.x += ((n.tx - n.x) / d) * 70 * dt;
        n.y += ((n.ty - n.y) / d) * 70 * dt;
      }
    }
    // prompts
    let near: Building | null = null;
    for (const b of this.buildings) {
      if (Math.hypot(b.door.x - this.player.x, b.door.y - this.player.y) < 60) near = b;
    }
    this.prompt = near ? { text: `${near.icon} ${near.label}  —  [E] Entrar`, ok: true } : null;
    if (near && this.input.edge) this.openBuilding(near);
  }

  openBuilding(b: Building) {
    sfx('select');
    const p = this.profile;
    const close = () => this.closeDialogue();
    if (b.id === 'pizzaria') this.pizzariaDialogue();
    else if (b.id === 'casa') {
      this.setDialogue('Minha Casa', '🏠', `Bem-vindo de volta, ${p.name}. Energia: ${Math.round(p.energy)}%. Dia ${p.day}.`, [
        { label: 'Dormir (recupera energia, avança o dia)', action: () => { p.energy = 100; p.day++; this.save(); this.flash = 1; sfx('success'); this.showToast(`☀️ Dia ${p.day}. Energia restaurada!`); close(); } },
        { label: 'Sair', action: close },
      ]);
    } else if (b.id === 'loja') {
      this.setDialogue('Dona Rute — Loja do Bairro', '🛒', `Olá! Você tem R$ ${p.money.toFixed(0)}. O que vai levar?`, [
        { label: 'Lanche — R$ 8 (+30 energia)', action: () => { if (p.money >= 8) { p.money -= 8; p.energy = Math.min(100, p.energy + 30); sfx('cash'); this.float(this.player.x, this.player.y - 40, '+30 ⚡', '#69f0ae'); this.save(); close(); } else this.showToast('Dinheiro insuficiente.'); }, disabled: p.money < 8 },
        { label: p.hasCap ? 'Boné já comprado ✓' : 'Boné estiloso — R$ 40 (roupa)', action: () => { if (!p.hasCap && p.money >= 40) { p.money -= 40; p.hasCap = true; sfx('cash'); this.confetti(this.player.x, this.player.y); this.save(); close(); } else this.showToast('Dinheiro insuficiente.'); }, disabled: p.hasCap || p.money < 40 },
        { label: 'Sair', action: close },
      ]);
    } else if (b.id === 'aluguel') {
      if (p.ownsBusiness) {
        this.setDialogue('Seu Ponto Comercial', '🏪', 'Aqui será a sua própria pizzaria. A gestão do negócio chega no próximo módulo do Estúdio de Profissões!', [{ label: 'Sair', action: close }]);
      } else {
        this.setDialogue('Imobiliária Zero', '🏪', `Espaço comercial disponível por R$ 2.000. Você tem R$ ${p.money.toFixed(0)}. Alugar?`, [
          { label: 'Alugar por R$ 2.000', action: () => { if (p.money >= 2000) { p.money -= 2000; p.ownsBusiness = true; this.save(); this.confetti(this.player.x, this.player.y); this.kick(14); sfx('perfect'); this.showToast('🎉 Você alugou seu próprio ponto comercial! Um empreendedor nasce no Universo Zero.', 6); close(); } else this.showToast('Continue trabalhando — falta dinheiro!'); }, disabled: p.money < 2000 },
          { label: 'Sair', action: close },
        ]);
      }
    } else if (b.id === 'parque') {
      this.setDialogue('Praça Zero', '🌳', 'Um lugar tranquilo para descansar entre um turno e outro.', [
        { label: 'Descansar no banco (+15 energia)', action: () => { p.energy = Math.min(100, p.energy + 15); this.float(this.player.x, this.player.y - 40, '+15 ⚡', '#69f0ae'); sfx('success'); this.save(); close(); } },
        { label: 'Sair', action: close },
      ]);
    } else if (b.id === 'onibus') {
      this.setDialogue('Ponto de Ônibus', '🚌', 'A linha 0 ainda não leva a outras cidades do Universo Zero. Em breve!', [{ label: 'Ok', action: close }]);
    }
  }

  pizzariaDialogue() {
    const p = this.profile;
    const close = () => this.closeDialogue();
    const main = () =>
      this.setDialogue('Léo — Atendente', '🧑‍🍳', p.hired ? `E aí, ${p.name}! Pronto para mais um turno?` : 'Bem-vindo à Pizzaria Bella Zero! Como posso ajudar?', [
        ...(p.hired ? [{ label: '▶ Iniciar turno de Ajudante', action: () => this.startShift() }] : []),
        { label: 'Ver cardápio', action: () => this.setDialogue('Léo — Atendente', '📋', 'Calabresa R$35 · Mussarela R$32 · Marguerita R$36 · Frango c/ Catupiry R$40 · Refrigerante R$8', [{ label: 'Voltar', action: main }]) },
        { label: 'Fazer um pedido — Pizza R$ 35 (+40 energia)', action: () => { if (p.money >= 35) { p.money -= 35; p.energy = Math.min(100, p.energy + 40); sfx('cash'); this.float(this.player.x, this.player.y - 40, '🍕 +40 ⚡', '#ffd740'); this.save(); close(); } else this.showToast('Dinheiro insuficiente.'); }, disabled: p.money < 35 },
        { label: 'Promoções e brindes', action: () => this.setDialogue('Léo — Atendente', '🎁', 'Hoje: na compra de 2 pizzas, refrigerante grátis. Funcionários ganham 20% de desconto!', [{ label: 'Voltar', action: main }]) },
        ...(!p.hired ? [{ label: 'Perguntar sobre oportunidades de emprego', action: vagas }] : []),
        { label: 'Sair', action: close },
      ]);
    const vagas = () =>
      this.setDialogue('Léo — Atendente', '📌', 'Vagas disponíveis hoje:\n• Ajudante de Pizzaria — ABERTA\n• Pizzaiolo — preenchida\n• Entregador — preenchida\n• Gerente — requer experiência', [
        { label: 'Candidatar-se: Ajudante de Pizzaria', action: contrato },
        { label: 'Voltar', action: main },
      ]);
    const contrato = () =>
      this.setDialogue('Seu Augusto — Responsável', '📝', 'Função: Ajudante de Pizzaria\nAtividades: preparar ingredientes, receber pedidos, apoiar o pizzaiolo, conferir e expedir entregas.\nTurno: 3 minutos (tempo de jogo)\nRemuneração: R$ 60 base + R$ 12 por pedido entregue + bônus de desempenho.\nRequisitos: nenhum. Aceita?', [
        { label: 'Aceitar a vaga', action: () => { p.hired = true; p.hiredDay = p.day; this.save(); sfx('perfect'); this.confetti(this.player.x, this.player.y); this.kick(8); this.setDialogue('Seu Augusto — Responsável', '🤝', 'Contratado! Bata o ponto, vista o uniforme, lave as mãos e mantenha o Beto abastecido. Começa agora?', [
          { label: '▶ Começar o turno agora', action: () => this.startShift() },
          { label: 'Depois', action: close },
        ]); } },
        { label: 'Recusar', action: main },
      ]);
    main();
  }

  setDialogue(speaker: string, icon: string, text: string, options: DialogueOption[]) {
    this.dialogue = { speaker, icon, text, options };
    this.input.action = false;
    this.notify();
  }
  closeDialogue() {
    this.dialogue = null;
    this.notify();
  }
  chooseOption(i: number) {
    const o = this.dialogue?.options[i];
    if (!o || o.disabled) return;
    sfx('select');
    o.action();
  }

  save() {
    saveProfile(this.profile);
    this.notify();
  }
  resetAll() {
    this.profile = resetProfile();
    this.scene = 'start';
    this.notify();
  }

  /* ---------- Shift ---------- */
  startShift() {
    this.dialogue = null;
    this.stations = makeStations();
    const diff = Math.min(6, this.profile.totalShifts);
    this.shift = {
      phase: 'prep', prepStep: 0, time: 180, duration: 180, elapsed: 0,
      stock: { calabresa: 2, mussarela: 2, tomate: 1, catupiry: 1 },
      orders: [], nextId: 1040 + this.profile.totalShifts * 20, spawnTimer: 3, score: 0, combo: 0, comboTimer: 0, stress: 0,
      entregues: 0, processados: 0, erros: 0, rotas: 0, perfeitos: 0, holding: null, uniform: false, handsClean: false,
      customer: null, customerTimer: 25 - diff, courierAway: 0, courierX: 890, pizzaiolo: { text: 'Boa! Prepara os ingredientes que hoje vai ter movimento.', life: 5 }, complaintTimer: 0,
      attrGains: {}, oven: 0, pendentes: 0, ovenFlash: 0,
    };
    this.active = null;
    this.scene = 'shift';
    this.paused = false;
    this.player.x = 80; this.player.y = 570; this.player.facing = 1;
    this.cam.x = 0; this.cam.y = 0;
    this.showToast('🕒 Bata o ponto no relógio para começar o turno!', 4);
    sfx('bell');
    this.notify();
  }
  restartShift() {
    this.startShift();
  }
  quitShift() {
    this.paused = false;
    this.scene = 'world';
    this.shift = null;
    this.active = null;
    this.player.x = 840; this.player.y = 400;
    this.showToast('Você saiu do turno sem receber. Volte quando estiver pronto.');
    this.notify();
  }

  get shiftSolids(): Rect[] {
    return this.stations.filter((s) => s.solid);
  }

  updateShift(dt: number) {
    const s = this.shift!;
    this.movePlayer(dt, this.shiftSolids, PIZ_W, PIZ_H);
    this.updateCam(PIZ_W, PIZ_H);
    s.elapsed += dt;
    this.profile.energy = Math.max(0, this.profile.energy - dt * (0.12 - this.profile.attrs.resistencia * 0.0008));
    s.stress = Math.max(0, s.stress - dt * 0.6);
    if (s.ovenFlash > 0) s.ovenFlash -= dt;
    if (s.pizzaiolo) { s.pizzaiolo.life -= dt; if (s.pizzaiolo.life <= 0) s.pizzaiolo = null; }
    if (s.comboTimer > 0) { s.comboTimer -= dt; if (s.comboTimer <= 0) s.combo = 0; }

    if (s.phase === 'op') {
      s.time -= dt;
      if (s.time <= 0) {
        s.time = 0;
        s.phase = 'closing';
        s.customer = null;
        this.showToast('🔔 Fechamento! Finalize os pedidos pendentes e bata o ponto de saída.', 5);
        sfx('bell');
      }
      s.spawnTimer -= dt;
      const activeOrders = s.orders.filter((o) => o.status !== 'saiu').length;
      const diff = Math.min(8, this.profile.totalShifts);
      const maxActive = 4 + Math.min(3, Math.floor(diff / 2));
      if (s.spawnTimer <= 0 && activeOrders < maxActive) {
        this.spawnOrder('app');
        const base = 13 - diff * 0.6 - Math.min(5, s.elapsed / 40);
        s.spawnTimer = Math.max(5.5, base) * (0.8 + Math.random() * 0.5);
      }
      // customers
      if (!s.customer) {
        s.customerTimer -= dt;
        if (s.customerTimer <= 0 && activeOrders < maxActive) {
          s.customer = { patience: 22, max: 22 };
          this.showToast('🛎️ Cliente no balcão!', 2);
          sfx('bell');
        }
      } else {
        s.customer.patience -= dt;
        if (s.customer.patience <= 0) {
          s.customer = null;
          s.customerTimer = 30;
          this.addStress(10, 'Cliente foi embora sem atendimento');
        }
      }
    }
    if (s.phase === 'op' || s.phase === 'closing') {
      // order timers
      for (let i = s.orders.length - 1; i >= 0; i--) {
        const o = s.orders[i];
        if (o.status === 'saiu') continue;
        o.timer -= dt;
        if (o.timer <= 0) {
          s.orders.splice(i, 1);
          s.erros++;
          s.combo = 0;
          this.addStress(18, `Pedido #${o.id} perdido!`);
          this.kick(10);
          sfx('fail');
        }
      }
      this.updatePizzaiolo(dt);
      // courier
      if (s.courierAway > 0) {
        s.courierAway -= dt;
        s.courierX = Math.min(1100, s.courierX + 300 * dt);
        if (s.courierAway <= 0) { s.courierX = 890; this.showToast('🛵 Entregador voltou!', 2); }
      }
    }
    if (s.stress >= 100) {
      this.gameOver('O estresse passou do limite. Seu Augusto encerrou seu turno: "Hoje não deu, Tic-Tac. Tente de novo."');
      return;
    }
    this.updateActive(dt);
    this.updatePrompt();
  }

  addStress(n: number, reason?: string) {
    const s = this.shift!;
    s.stress = Math.min(100, s.stress + n);
    if (reason) { this.showToast(`⚠️ ${reason}`, 2.5); this.float(this.player.x, this.player.y - 50, `+${n} estresse`, '#ff5252', 14); }
  }

  spawnOrder(origin: 'app' | 'balcao') {
    const s = this.shift!;
    const sabor = INGS[Math.floor(Math.random() * INGS.length)];
    const grouped = s.orders.length && Math.random() < 0.45 ? s.orders[s.orders.length - 1].bairro : BAIRROS[Math.floor(Math.random() * BAIRROS.length)];
    const diff = Math.min(8, this.profile.totalShifts);
    const max = Math.max(55, 85 - diff * 3);
    const o: Order = { id: s.nextId++, sabor, drink: Math.random() < 0.5, bairro: grouped, status: origin === 'app' ? 'novo' : 'fila', timer: max, maxTimer: max, cook: 0, origin };
    s.orders.push(o);
    if (origin === 'app') { sfx('bell'); this.showToast(`💻 Novo pedido #${o.id} no computador!`, 2); }
    this.notify();
  }

  updatePizzaiolo(dt: number) {
    const s = this.shift!;
    let cooking = s.orders.find((o) => o.status === 'cozinha');
    if (!cooking) {
      const next = s.orders.find((o) => o.status === 'fila');
      if (next) {
        if (s.stock[next.sabor] > 0) {
          s.stock[next.sabor]--;
          next.status = 'cozinha';
          next.cook = 0;
          cooking = next;
          s.complaintTimer = 0;
          const forno = this.stations.find((x) => x.id === 'forno')!;
          this.burst(forno.x + 55, forno.y + 40, ['#ff9800', '#ffeb3b'], 8, 80, 3, -50);
          this.notify();
        } else {
          s.complaintTimer -= dt;
          if (s.complaintTimer <= 0) {
            s.complaintTimer = 5;
            s.pizzaiolo = { text: `Preciso de mais ${ING[next.sabor].label}!`, life: 3 };
            this.addStress(3);
            sfx('alarm');
          }
        }
      }
    }
    if (cooking) {
      const cookTime = 7;
      cooking.cook += dt / cookTime;
      s.oven = cooking.cook;
      if (cooking.cook >= 1) {
        cooking.status = 'pronta';
        s.oven = 0;
        s.ovenFlash = 1;
        s.pizzaiolo = { text: `Pizza #${cooking.id} pronta! Confere e embala.`, life: 3 };
        const forno = this.stations.find((x) => x.id === 'forno')!;
        this.burst(forno.x + 55, forno.y + 30, ['#ffeb3b', '#ff9800', '#fff'], 14, 140, 4, 200);
        sfx('bell');
        this.notify();
      }
    } else s.oven = 0;
  }

  nearestStation(): Station | null {
    let best: Station | null = null;
    let bd = 1e9;
    for (const st of this.stations) {
      const cx = Math.max(st.x, Math.min(this.player.x, st.x + st.w));
      const cy = Math.max(st.y, Math.min(this.player.y, st.y + st.h));
      const d = Math.hypot(this.player.x - cx, this.player.y - cy);
      if (d < 44 && d < bd) { bd = d; best = st; }
    }
    return best;
  }

  updatePrompt() {
    const st = this.nearestStation();
    this.prompt = null;
    if (this.active) {
      const a = this.active;
      this.prompt = { text: a.kind === 'hold' ? `Segure [E] — ${a.label}` : a.kind === 'mash' ? `Aperte [E] rápido! — ${a.label}` : `Aperte [E] na zona verde — ${a.label}`, ok: true };
      return;
    }
    if (!st) return;
    const info = this.stationPrompt(st);
    this.prompt = info;
    if (this.input.edge && info) this.interact(st);
  }

  stationPrompt(st: Station): { text: string; ok: boolean } {
    const s = this.shift!;
    const H = (t: string, ok = true) => ({ text: t, ok });
    if (s.phase === 'prep') {
      if (st.id === 'ponto') return s.prepStep === 0 ? H('🕒 [E] Bater o ponto de entrada') : H('Ponto já registrado ✓', false);
      if (st.id === 'armario') return s.prepStep === 1 ? H('👕 [E] Vestir uniforme, avental e touca') : H(s.prepStep < 1 ? 'Bata o ponto primeiro' : 'Uniforme vestido ✓', false);
      if (st.id === 'pia') return s.prepStep === 2 ? H('🧼 [E] Lavar as mãos') : H(s.prepStep < 2 ? 'Vista o uniforme primeiro' : 'Mãos limpas ✓', false);
      return H('Complete a preparação primeiro', false);
    }
    if (st.id === 'ponto') return s.phase === 'closing' ? H('🕒 [E] Registrar saída e encerrar turno') : H('Turno em andamento — volte no fechamento', false);
    if (st.id === 'armario' || st.id === 'pia') return H('Nada a fazer aqui agora', false);
    if (st.dirty) return H(`🧽 [E] Limpar ${st.label} (sujo)`);
    if (st.id === 'geladeira') {
      if (s.holding) return s.holding.type === 'raw' ? H('[E] Devolver ingrediente') : H('Mãos ocupadas com refrigerante', false);
      const ing = this.lowestStock();
      return H(`🧊 [E] Pegar ${ING[ing].label} (estoque ${s.stock[ing]}/5)`);
    }
    if (st.id === 'bebidas') {
      if (s.holding) return s.holding.type === 'drink' ? H('[E] Devolver refrigerante') : H('Mãos ocupadas com ingrediente', false);
      return H('🥤 [E] Pegar refrigerante');
    }
    if (st.ing) {
      if (s.holding?.type === 'raw' && s.holding.ing === st.ing) return H(`${st.icon} [E] Preparar ${ING[st.ing].label}`);
      if (s.holding?.type === 'raw') return H(`Isso é ${ING[s.holding.ing!].label}. Leve para ${this.stations.find((x) => x.ing === s.holding!.ing)!.label}`, false);
      return H(`Busque ${ING[st.ing].label} na geladeira`, false);
    }
    if (st.id === 'computador') {
      const n = s.orders.filter((o) => o.status === 'novo').length;
      return n ? H(`💻 [E] Receber ${n} pedido(s) e enviar à cozinha`) : H('Nenhum pedido novo', false);
    }
    if (st.id === 'forno') {
      const c = s.orders.find((o) => o.status === 'cozinha');
      const f = s.orders.filter((o) => o.status === 'fila').length;
      return H(c ? `🔥 Beto assa #${c.id} (${Math.round(c.cook * 100)}%) · fila: ${f}` : f ? '🔥 Beto aguarda ingredientes!' : '🔥 Beto está livre', false);
    }
    if (st.id === 'expedicao') {
      const o = s.orders.find((x) => x.status === 'pronta');
      if (!o) return H('Nenhuma pizza pronta para embalar', false);
      if (o.drink && s.holding?.type !== 'drink') return H(`📦 #${o.id} precisa de refrigerante — busque na geladeira de bebidas`, false);
      if (!o.drink && s.holding) return H('Largue o que está segurando antes de embalar', false);
      return H(`📦 [E] Conferir e embalar #${o.id} (${ING[o.sabor].sabor}${o.drink ? ' + 🥤' : ''})`);
    }
    if (st.id === 'balcao') {
      if (s.customer) return H('🛎️ [E] Atender cliente no balcão');
      return H('Balcão vazio', false);
    }
    if (st.id === 'saida') {
      const n = s.orders.filter((o) => o.status === 'embalada').length;
      if (s.courierAway > 0) return H(`🛵 Entregador em rota (${Math.ceil(s.courierAway)}s)`, false);
      return n ? H(`🛵 [E] Despachar ${n} pedido(s)`) : H('Nenhum pedido embalado', false);
    }
    return H(st.label, false);
  }

  lowestStock(): Ingredient {
    const s = this.shift!;
    const need = s.orders.filter((o) => o.status === 'fila' || o.status === 'novo').map((o) => o.sabor);
    let best: Ingredient = 'calabresa';
    let bs = 1e9;
    for (const i of INGS) {
      const demand = need.filter((n) => n === i).length;
      const score = s.stock[i] - demand * 1.5;
      if (score < bs) { bs = score; best = i; }
    }
    return best;
  }

  startActive(station: Station, kind: Active['kind'], label: string, duration: number, onDone: (q: number) => void) {
    const prec = this.profile.attrs.precisao;
    const zoneW = 0.16 + prec * 0.0025;
    const zc = 0.35 + Math.random() * 0.4;
    this.active = { station, kind, label, progress: 0, duration, target: Math.max(5, Math.round(duration)), cursor: 0, dir: 1, zone: [zc - zoneW / 2, zc + zoneW / 2], onDone };
    this.notify();
  }
  cancelActive() {
    this.active = null;
  }

  updateActive(dt: number) {
    const a = this.active;
    if (!a) return;
    if (a.kind === 'hold') {
      if (this.input.action) a.progress += dt / a.duration;
      else a.progress = Math.max(0, a.progress - dt * 0.8);
      if (a.progress >= 1) { this.active = null; a.onDone(1); }
    } else if (a.kind === 'mash') {
      if (this.input.edge) {
        a.progress += 1 / a.target;
        sfx('tap');
        this.kick(2);
        this.burst(a.station.x + a.station.w / 2, a.station.y + a.station.h / 2, a.station.ing ? ING[a.station.ing].color : '#fff', 4, 120, 3, 350);
      }
      a.progress = Math.max(0, a.progress - dt * 0.12);
      if (a.progress >= 1) { this.active = null; const q = 1; a.onDone(q); }
    } else {
      const speed = 1.3 + Math.min(0.8, this.profile.totalShifts * 0.1);
      a.cursor += a.dir * speed * dt;
      if (a.cursor > 1) { a.cursor = 1; a.dir = -1; }
      if (a.cursor < 0) { a.cursor = 0; a.dir = 1; }
      if (this.input.edge) {
        const [z0, z1] = a.zone;
        const center = (z0 + z1) / 2;
        if (a.cursor >= z0 && a.cursor <= z1) {
          const q = 1 - Math.abs(a.cursor - center) / ((z1 - z0) / 2);
          this.active = null;
          a.onDone(q > 0.6 ? 1.2 : 1);
        } else {
          sfx('fail');
          this.kick(4);
          this.float(this.player.x, this.player.y - 40, 'Errou o tempo!', '#ff5252', 14);
          this.addStress(4);
          this.shift!.erros++;
          this.shift!.combo = 0;
          // keep trying
          const zoneW = a.zone[1] - a.zone[0];
          const zc = 0.3 + Math.random() * 0.4;
          a.zone = [zc - zoneW / 2, zc + zoneW / 2];
        }
      }
    }
  }

  interact(st: Station) {
    const s = this.shift!;
    const px = this.player.x, py = this.player.y - 40;
    const cx = st.x + st.w / 2, cy = st.y + st.h / 2;
    if (s.phase === 'prep') {
      if (st.id === 'ponto' && s.prepStep === 0) return this.startActive(st, 'hold', 'Registrando ponto', 0.6, () => { s.prepStep = 1; sfx('success'); this.burst(cx, cy, '#69f0ae', 10); this.float(px, py, 'Ponto registrado ✓', '#69f0ae'); this.gain('disciplina', 1.5); this.showToast('👕 Agora vá ao vestiário (canto superior esquerdo).', 3); this.notify(); });
      if (st.id === 'armario' && s.prepStep === 1) return this.startActive(st, 'hold', 'Vestindo uniforme', 0.9, () => { s.prepStep = 2; s.uniform = true; sfx('success'); this.burst(px, py, ['#fff', '#e53935'], 14); this.float(px, py, 'Uniforme + avental + touca ✓', '#fff'); this.gain('disciplina', 1); this.showToast('🧼 Lave as mãos na pia.', 3); this.notify(); });
      if (st.id === 'pia' && s.prepStep === 2) return this.startActive(st, 'hold', 'Lavando as mãos', 0.7, () => { s.prepStep = 3; s.handsClean = true; s.phase = 'op'; sfx('perfect'); this.confetti(px, py); this.kick(6); this.float(px, py, 'TURNO ABERTO!', '#ffd740', 24); this.gain('disciplina', 1.5); this.showToast('🧊 Busque ingredientes na geladeira e prepare nas estações. Fique de olho no computador! 💻', 5); this.notify(); });
      return;
    }
    if (st.id === 'ponto' && s.phase === 'closing') return this.startActive(st, 'hold', 'Registrando saída', 1.0, () => this.finishShift());
    if (st.dirty) return this.startActive(st, 'hold', 'Limpando', 1.1, () => { st.dirty = false; st.uses = 0; sfx('success'); this.burst(cx, cy, ['#81d4fa', '#fff'], 14, 120, 4); this.float(px, py, 'Limpo ✓ +Organização', '#81d4fa'); this.gain('organizacao', 2.5); this.addScore(25, cx, cy); });
    if (st.id === 'geladeira') {
      if (s.holding?.type === 'raw') { s.holding = null; sfx('tap'); return; }
      if (s.holding) return;
      const ing = this.lowestStock();
      s.holding = { type: 'raw', ing };
      sfx('select');
      this.burst(cx, cy, '#e3f2fd', 8, 90, 3, 100);
      this.float(px, py, `${ING[ing].icon} ${ING[ing].label}`, '#fff', 15);
      return;
    }
    if (st.id === 'bebidas') {
      if (s.holding?.type === 'drink') { s.holding = null; sfx('tap'); return; }
      if (s.holding) return;
      s.holding = { type: 'drink' };
      sfx('select');
      this.burst(cx, cy, '#b3e5fc', 8, 90, 3, 100);
      this.float(px, py, '🥤 Refrigerante', '#fff', 15);
      return;
    }
    if (st.ing && s.holding?.type === 'raw' && s.holding.ing === st.ing) {
      const ing = st.ing;
      const mash = st.id === 'fatiador' || st.id === 'ralador';
      const done = (q: number) => {
        s.holding = null;
        s.stock[ing] = Math.min(5, s.stock[ing] + 2);
        st.uses++;
        if (st.uses >= 3) { st.dirty = true; this.showToast(`🧽 ${st.label} precisa de limpeza!`, 2.5); }
        const perfect = q > 1;
        if (perfect) { s.perfeitos++; sfx('perfect'); this.confetti(cx, cy); this.float(px, py, 'PERFEITO! +Precisão', '#ffd740', 20); this.gain('precisao', 3); } else { sfx('success'); this.float(px, py, `+2 ${ING[ing].label}`, '#69f0ae'); }
        this.burst(cx, cy, ING[ing].color, 18, 180, 4);
        this.kick(5);
        this.gain(mash ? 'agilidade' : 'precisao', 1.5);
        this.addScore(perfect ? 60 : 40, cx, cy);
        this.notify();
      };
      if (mash) return this.startActive(st, 'mash', st.id === 'fatiador' ? 'Fatiando calabresa' : 'Ralando mussarela', 7 - Math.min(2, this.profile.attrs.agilidade / 40), done);
      return this.startActive(st, 'timing', st.id === 'processador' ? 'Processando tomate e cebola' : 'Separando catupiry', 1, done);
    }
    if (st.id === 'computador') {
      const novos = s.orders.filter((o) => o.status === 'novo');
      if (!novos.length) return;
      return this.startActive(st, 'hold', 'Conferindo pedidos', 0.5, () => {
        for (const o of novos) o.status = 'fila';
        s.processados += novos.length;
        sfx('success');
        this.burst(cx, cy, ['#4fc3f7', '#fff'], 10, 100, 3, 200);
        this.float(px, py, `${novos.length} pedido(s) → cozinha`, '#4fc3f7');
        this.gain('atencao', 1 * novos.length);
        this.addScore(15 * novos.length, cx, cy);
        this.notify();
      });
    }
    if (st.id === 'balcao' && s.customer) {
      return this.startActive(st, 'hold', 'Anotando pedido', 0.6, () => {
        s.customer = null;
        s.customerTimer = 28 + Math.random() * 15;
        this.spawnOrder('balcao');
        s.processados++;
        sfx('success');
        this.float(px, py, 'Cliente atendido! +Atenção', '#69f0ae');
        this.burst(cx, cy + 20, ['#fff', '#ffd740'], 10, 120, 3);
        this.gain('atencao', 2);
        this.addScore(30, cx, cy);
      });
    }
    if (st.id === 'expedicao') {
      const o = s.orders.find((x) => x.status === 'pronta');
      if (!o) return;
      if (o.drink && s.holding?.type !== 'drink') { sfx('fail'); return; }
      if (!o.drink && s.holding) return;
      return this.startActive(st, 'timing', `Conferindo #${o.id}`, 1, (q) => {
        o.status = 'embalada';
        if (o.drink) s.holding = null;
        const perfect = q > 1;
        if (perfect) { s.perfeitos++; sfx('perfect'); this.confetti(cx, cy); this.float(px, py, 'CONFERÊNCIA PERFEITA!', '#ffd740', 20); this.gain('atencao', 3); } else { sfx('success'); this.float(px, py, `#${o.id} embalado ✓`, '#69f0ae'); }
        this.burst(cx, cy, ['#ffcc80', '#a04000', '#fff'], 14, 150, 4);
        this.kick(5);
        this.gain('atencao', 1.5);
        this.gain('organizacao', 1);
        this.addScore(perfect ? 50 : 35, cx, cy);
        this.notify();
      });
    }
    if (st.id === 'saida') {
      const ready = s.orders.filter((o) => o.status === 'embalada');
      if (!ready.length || s.courierAway > 0) return;
      return this.startActive(st, 'hold', 'Organizando rota', 0.6, () => {
        const byBairro: Record<string, number> = {};
        let total = 0;
        for (const o of ready) {
          o.status = 'saiu';
          byBairro[o.bairro] = (byBairro[o.bairro] || 0) + 1;
          s.entregues++;
          s.combo++;
          s.comboTimer = 20;
          const bonus = Math.round((o.timer / o.maxTimer) * 100);
          total += 100 + bonus;
        }
        let routeBonus = 0;
        for (const b in byBairro) if (byBairro[b] >= 2) { routeBonus += 60 * (byBairro[b] - 1); s.rotas++; }
        const mult = 1 + Math.min(1.5, (s.combo - 1) * 0.1);
        const gained = Math.round((total + routeBonus) * mult);
        this.addScore(gained, cx, cy - 20, true);
        if (routeBonus) { this.float(px, py - 30, `ROTA AGRUPADA! +${routeBonus}`, '#40c4ff', 20); this.gain('organizacao', 2); }
        if (s.combo > 1) this.float(px, py - 60, `COMBO x${s.combo}  (${mult.toFixed(1)}x)`, '#ff9100', 18);
        s.courierAway = 9 + ready.length * 2.5;
        s.courierX = 890;
        sfx('dispatch');
        sfx('cash');
        this.confetti(cx, cy);
        this.kick(9);
        this.gain('agilidade', 1.5 * ready.length);
        this.gain('resistencia', 0.8);
        this.burst(cx, cy + 30, ['#9e9e9e', '#616161'], 14, 80, 5, -40);
        s.orders = s.orders.filter((o) => o.status !== 'saiu');
        this.notify();
      });
    }
  }

  addScore(n: number, x: number, y: number, big = false) {
    const s = this.shift!;
    s.score += n;
    this.float(x, y - 10, `+${n}`, big ? '#ffd740' : '#fff', big ? 26 : 16);
  }

  gameOver(reason: string) {
    this.gameOverReason = reason;
    this.scene = 'gameover';
    this.active = null;
    this.kick(16);
    this.flash = 1;
    sfx('fail');
    this.notify();
  }

  finishShift() {
    const s = this.shift!;
    const p = this.profile;
    s.phase = 'done';
    const pend = s.orders.filter((o) => o.status !== 'saiu').length;
    s.pendentes = pend;
    const base = 60;
    const porPedido = 12 * s.entregues;
    const rotas = 20 * s.rotas;
    const bonus = (s.erros === 0 ? 40 : s.erros <= 2 ? 15 : 0) + rotas + s.perfeitos * 3;
    const penalidade = s.erros * 6 + pend * 5;
    const salario = Math.max(20, base + porPedido + bonus - penalidade);
    const stars = s.entregues >= 12 && s.erros <= 1 ? '★★★★★' : s.entregues >= 9 ? '★★★★☆' : s.entregues >= 6 ? '★★★☆☆' : s.entregues >= 3 ? '★★☆☆☆' : '★☆☆☆☆';
    p.money += salario;
    p.totalShifts++;
    this.gain('resistencia', 4);
    this.gain('disciplina', 2);
    p.history.unshift({ day: p.day, empregador: 'Pizzaria Bella Zero', funcao: 'Ajudante de Pizzaria', salario, pedidos: s.entregues, erros: s.erros, score: s.score, avaliacao: stars });
    p.history = p.history.slice(0, 20);
    const isHigh = p.highScores.length < 8 || s.score > p.highScores[p.highScores.length - 1].score;
    addHighScore(p, { score: s.score, pedidos: s.entregues, day: p.day, date: new Date().toLocaleDateString('pt-BR') });
    p.energy = Math.max(0, p.energy - 10);
    saveProfile(p);
    this.summary = { day: p.day, score: s.score, entregues: s.entregues, processados: s.processados, erros: s.erros, rotas: s.rotas, perfeitos: s.perfeitos, salario, base, bonus, penalidade, avaliacao: stars, attrGains: s.attrGains, isHigh, pendentes: pend };
    this.scene = 'summary';
    sfx('cash');
    this.confetti(this.player.x, this.player.y);
    this.notify();
  }

  leaveSummary() {
    this.summary = null;
    this.shift = null;
    this.scene = 'world';
    this.player.x = 840; this.player.y = 400; this.player.facing = 1;
    this.cam.x = this.player.x - this.viewW / 2; this.cam.y = this.player.y - this.viewH / 2;
    this.showToast('De volta ao Universo Zero. Dinheiro, atributos e histórico salvos. 🏠', 4);
    this.notify();
  }

  get worldSize() {
    return this.scene === 'shift' ? { w: PIZ_W, h: PIZ_H } : { w: WORLD_W, h: WORLD_H };
  }
}

function circleRect(cx: number, cy: number, r: number, rc: Rect) {
  const x = Math.max(rc.x, Math.min(cx, rc.x + rc.w));
  const y = Math.max(rc.y, Math.min(cy, rc.y + rc.h));
  return (cx - x) ** 2 + (cy - y) ** 2 < r * r;
}

export { ATTR_KEYS };
