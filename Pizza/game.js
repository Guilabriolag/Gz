// ============================================================================
// UNIVERSO ZERO — ESTÚDIO DE PROFISSÕES: AJUDANTE DE PIZZARIA (JS único)
// Camada Compartilhada (Tic-Tac) + Módulo Pizzaria — Vanilla JS, 60fps Canvas
// ============================================================================
'use strict';

// ----------------------------- CONSTANTES DO MUNDO -----------------------------
const WORLD_W = 1880, WORLD_H = 1160;
const START_POS = { x: 645, y: 505 };
const FLAVORS = ['Calabresa', 'Mussarela', 'Marguerita', 'Catupiry Suprema'];
const NEIGHBORHOODS = ['Bairro Central', 'Vila Norte', 'Jardim Sul'];
const PROFILE_KEY = 'universo_zero_tictac_profile_v1';
const SCORES_KEY = 'universo_zero_pizzaria_scores_v1';

const OUTFITS = {
  casual_azul: { name: 'Casual Universo Zero', body: '#3b82f6', price: 0, desc: 'Camiseta confortável do dia a dia.' },
  jaqueta_urbana: { name: 'Jaqueta Street Coral', body: '#f97316', price: 110, desc: 'Estilo urbano vibrante.' },
  esportivo_neon: { name: 'Conjunto Esportivo Neon', body: '#10b981', price: 160, desc: 'Tecido leve e respirável.' },
  terno_executivo: { name: 'Blazer Empreendedor', body: '#6366f1', price: 260, desc: 'Traje de dono de negócio.' },
};
const SHOP_ITEMS = [
  { id: 'espresso_zero', name: 'Café Expresso Duplo', price: 15, consumable: true, desc: 'Reduz -40 Cansaço, -20 Estresse.' },
  { id: 'lanche_artesanal', name: 'Sanduíche Zero Gourmet', price: 20, consumable: true, desc: 'Reduz -55 Fome, +25 Moral.' },
  { id: 'tenis_turbo', name: 'Tênis Solado Aero', price: 140, consumable: false, desc: 'Permanente: +18% velocidade.' },
  { id: 'luva_precisao', name: 'Luvas Táteis Chef', price: 170, consumable: false, desc: 'Permanente: +35% velocidade de preparo.' },
  { id: 'mochila_termica_pro', name: 'Organizador Térmico', price: 210, consumable: false, desc: 'Permanente: +25% gorjetas.' },
];
const VACANCIES = [
  { id: 'ajudante_pizzaria', title: 'Ajudante de Pizzaria', salary: 140, hours: 'Turno Operacional (3 min)', available: true, req: 'Disposição, higiene e vontade de aprender', desc: 'Preparação de ingredientes (calabresa, mussarela, vegetais, catupiry), conferência de estoque, apoio ao pizzaiolo, recebimento de pedidos e expedição de rotas.' },
  { id: 'pizzaiolo_pleno', title: 'Pizzaiolo Artesanal', salary: 240, hours: 'Ocupada (Chef Marco)', available: false, req: 'Precisão Nv. 4 + Experiência', desc: 'Abertura de massas, montagem e controle do forno.' },
  { id: 'entregador_expresso', title: 'Entregador Motoboy', salary: 185, hours: 'Em Rota (Leo)', available: false, req: 'Agilidade Nv. 3 + CNH Zero', desc: 'Entrega rápida de rotas agrupadas.' },
  { id: 'gerente_operacional', title: 'Gerente de Turno', salary: 340, hours: 'Sem vagas', available: false, req: 'Organização Nv. 5 + Disciplina Nv. 5', desc: 'Supervisão financeira e liderança.' },
];
const RECRUITERS = [
  { id: 'invite_logistica', company: 'VelozZero Logística Urbana', role: 'Coordenador Júnior de Rotas', attr: 'organizacao', min: 2, bonus: 180, desc: 'Observamos seu domínio no agrupamento de rotas! Bolsa-prêmio liberada.' },
  { id: 'invite_tecnico', company: 'Instituto Técnico Precisão Zero', role: 'Operador Especialista de Bancada', attr: 'precisao', min: 2, bonus: 190, desc: 'Sua precisão com fatiador e processador chamou atenção!' },
  { id: 'invite_expresso', company: 'Frota Relâmpago Express', role: 'Agente de Operação Rápida', attr: 'agilidade', min: 2, bonus: 175, desc: 'Sua agilidade na cozinha bateu recordes no bairro!' },
  { id: 'invite_auditoria', company: 'Conselho Gastronômico Central', role: 'Inspetor de Qualidade & Higiene', attr: 'disciplina', min: 2, bonus: 200, desc: 'Seu rigor com uniforme e fechamento rendeu reconhecimento!' },
];
const ATTR_META = [
  { key: 'agilidade', label: 'Agilidade', desc: 'Velocidade e cumprimento de prazos.', color: '#38bdf8' },
  { key: 'precisao', label: 'Precisão', desc: 'Fatiador, ralador e processador.', color: '#fb923c' },
  { key: 'organizacao', label: 'Organização', desc: 'Estoque e agrupamento de rotas.', color: '#34d399' },
  { key: 'disciplina', label: 'Disciplina', desc: 'Ponto, uniforme, higiene e fechamento.', color: '#818cf8' },
  { key: 'atencao', label: 'Atenção', desc: 'Conferência exata de pedidos.', color: '#fbbf24' },
  { key: 'resistencia', label: 'Resistência', desc: 'Menos cansaço e estresse no turno.', color: '#fb7185' },
];

const WALLS = [
  { x: 0, y: 0, w: WORLD_W, h: 24 }, { x: 0, y: WORLD_H - 24, w: WORLD_W, h: 24 },
  { x: 0, y: 0, w: 24, h: WORLD_H }, { x: WORLD_W - 24, y: 0, w: 24, h: WORLD_H },
  { x: 725, y: 36, w: 22, h: 404, c: '#334155' }, { x: 725, y: 575, w: 22, h: 550, c: '#334155' },
  { x: 725, y: 36, w: 1120, h: 20, c: '#334155' }, { x: 725, y: 1105, w: 1120, h: 20, c: '#334155' },
  { x: 1828, y: 36, w: 22, h: 1089, c: '#334155' },
  { x: 955, y: 56, w: 14, h: 145, c: '#475569' }, { x: 1155, y: 56, w: 14, h: 145, c: '#475569' },
  { x: 1385, y: 56, w: 14, h: 145, c: '#475569' }, { x: 747, y: 840, w: 185, h: 14, c: '#475569' },
];
const STATIONS = [
  { id: 'home_bed', label: 'Casa do Tic-Tac (Descansar & Guarda-Roupa)', x: 80, y: 75, w: 210, h: 95, ix: 185, iy: 205, color: '#3b82f6', icon: '🏠' },
  { id: 'shop_counter', label: 'Loja & Café Estilo Zero', x: 415, y: 75, w: 225, h: 95, ix: 527, iy: 205, color: '#ec4899', icon: '🛍️' },
  { id: 'plaza_recruiter', label: 'Praça Zero & Recrutador Especial', x: 115, y: 470, w: 150, h: 90, ix: 190, iy: 590, color: '#8b5cf6', icon: '🌟' },
  { id: 'own_business', label: 'Espaço Comercial (Empreendedorismo)', x: 140, y: 920, w: 320, h: 110, ix: 300, iy: 885, color: '#f59e0b', icon: '🏢' },
  { id: 'time_clock', label: 'Relógio de Ponto', x: 758, y: 350, w: 66, h: 66, ix: 845, iy: 385, color: '#10b981', icon: '⏱️' },
  { id: 'npc_attendant', label: 'Atendente Bia (Balcão & Vagas)', x: 920, y: 415, w: 115, h: 85, ix: 885, iy: 460, color: '#f97316', icon: '💬' },
  { id: 'walkin_counter', label: 'Atendimento Presencial (Balcão)', x: 920, y: 545, w: 115, h: 95, ix: 885, iy: 595, color: '#eab308', icon: '🙋' },
  { id: 'locker', label: 'Armário de Uniforme', x: 785, y: 72, w: 130, h: 68, ix: 850, iy: 170, color: '#0ea5e9', icon: '👕' },
  { id: 'sink', label: 'Pia de Higienização', x: 1000, y: 72, w: 120, h: 68, ix: 1060, iy: 170, color: '#06b6d4', icon: '🧼' },
  { id: 'office_pc', label: 'Computador de Pedidos', x: 1200, y: 72, w: 145, h: 68, ix: 1272, iy: 170, color: '#6366f1', icon: '💻' },
  { id: 'dry_stock', label: 'Conferência & Estoque Seco', x: 1415, y: 72, w: 125, h: 68, ix: 1477, iy: 170, color: '#d97706', icon: '📋' },
  { id: 'fridge_calabresa', label: 'Geladeira: Calabresa & Mussarela', x: 1555, y: 72, w: 125, h: 68, ix: 1617, iy: 170, color: '#ef4444', icon: '🥩' },
  { id: 'freezer_produce', label: 'Frios: Tomate/Cebola & Catupiry', x: 1692, y: 72, w: 122, h: 68, ix: 1753, iy: 170, color: '#22c55e', icon: '🍅' },
  { id: 'slicer', label: 'Fatiador de Calabresa', x: 1230, y: 355, w: 140, h: 76, ix: 1300, iy: 460, color: '#dc2626', icon: '🔪' },
  { id: 'grater', label: 'Ralador de Mussarela', x: 1425, y: 355, w: 140, h: 76, ix: 1495, iy: 460, color: '#eab308', icon: '🧀' },
  { id: 'processor', label: 'Processador & Porcionador', x: 1620, y: 355, w: 155, h: 76, ix: 1697, iy: 460, color: '#16a34a', icon: '⚙️' },
  { id: 'kitchen_pass', label: 'Bancada do Pizzaiolo (Chef Marco)', x: 1230, y: 615, w: 230, h: 88, ix: 1345, iy: 580, color: '#ea580c', icon: '👨‍🍳' },
  { id: 'oven_pickup', label: 'Saída do Forno a Lenha', x: 1515, y: 615, w: 220, h: 88, ix: 1625, iy: 580, color: '#b91c1c', icon: '🔥' },
  { id: 'drink_fridge', label: 'Geladeira de Refrigerantes', x: 1110, y: 965, w: 135, h: 95, ix: 1177, iy: 930, color: '#0284c7', icon: '🥤' },
  { id: 'packing_table', label: 'Mesa de Conferência & Embalagem', x: 1310, y: 965, w: 215, h: 95, ix: 1417, iy: 930, color: '#d97706', icon: '📦' },
  { id: 'dispatch_desk', label: 'Expedição de Rotas (Motoboy Leo)', x: 1575, y: 965, w: 215, h: 95, ix: 1682, iy: 930, color: '#10b981', icon: '🛵' },
  { id: 'cleaning_closet', label: 'Quartinho da Faxina (Kit Limpeza)', x: 765, y: 980, w: 145, h: 85, ix: 837, iy: 945, color: '#14b8a6', icon: '🧹' },
  { id: 'staff_coffee', label: 'Água & Café da Equipe (-Cansaço)', x: 945, y: 980, w: 130, h: 85, ix: 1010, iy: 945, color: '#a855f7', icon: '☕' },
];
const stById = (id) => STATIONS.find((s) => s.id === id);

// ----------------------------- ESTADO -----------------------------
function defaultProfile() {
  return {
    name: 'Tic-Tac', money: 85, day: 1, totalScore: 0, streetOutfit: 'casual_azul',
    unlockedOutfits: ['casual_azul'], ownedItems: [],
    attributes: { agilidade: 1, precisao: 1, organizacao: 1, disciplina: 1, atencao: 1, resistencia: 1 },
    attributeXp: { agilidade: 0, precisao: 0, organizacao: 0, disciplina: 0, atencao: 0, resistencia: 0 },
    conditions: { cansaco: 8, fome: 12, estresse: 5, moral: 90, satisfacao: 100 },
    isHiredAsHelper: false, careerHistory: [],
    ownBusiness: { rented: false, name: 'Pizzaria Zero do Tic-Tac', hiredPizzaiolo: false, hiredAtendente: false, hiredAjudante: false, stockLevel: 50, dailyRevenueAccumulated: 0, totalInvested: 0, level: 1 },
    acceptedInvites: [],
  };
}
function loadProfile() { try { const r = localStorage.getItem(PROFILE_KEY); if (r) return Object.assign(defaultProfile(), JSON.parse(r)); } catch (e) {} return defaultProfile(); }
function saveProfile() { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {} }
const DEFAULT_SCORES = [
  { id: 'seed1', playerName: 'Chef Nonno (Lenda)', score: 3450, earnings: 295, ordersDelivered: 8, rating: 'S+', day: 12, date: 'Recorde Oficial' },
  { id: 'seed2', playerName: 'Bia Operacional', score: 2480, earnings: 230, ordersDelivered: 6, rating: 'S', day: 7, date: 'Bairro Central' },
  { id: 'seed3', playerName: 'Leo Express', score: 1720, earnings: 185, ordersDelivered: 4, rating: 'A', day: 4, date: 'Rota Rápida' },
];
function loadScores() { try { const r = localStorage.getItem(SCORES_KEY); if (r) { const p = JSON.parse(r); if (Array.isArray(p) && p.length) return p; } } catch (e) {} return DEFAULT_SCORES.slice(); }

let profile = loadProfile();
let scores = loadScores();
let screen = 'start'; // start | playing | paused | summary | gameover
let shiftPhase = 'off_duty';
let wearingUniform = false;
let uniform = { shirt: false, apron: false, cap: false, handsWashed: false };
let heldItem = { type: 'none', label: '', color: 'transparent' };
let orders = [];
let stock = freshStock();
let metrics = freshMetrics(1);
let nearestStation = null;
let banner = null;
let summaryData = null;
let showTablet = false, dialogType = null, dialogView = 'main', dialogVacancy = VACANCIES[0];
let soundOn = true;

const eng = {
  time: 0, px: START_POS.x, py: START_POS.y, vx: 0, vy: 0, facing: 0,
  dashT: 0, dashCd: 0, keys: new Set(), joy: { x: 0, y: 0 },
  clickTarget: null, workId: null, workDur: 0.9, workProg: 0, workCb: null,
  particles: [], floats: [], floatId: 1, nextOrderId: 1041,
  orderTimer: 4, eventTimer: 28, condTimer: 2,
  chefX: 1350, chefY: 540, chefSpeech: null, chefSpeechT: 0,
  scooter: 0, scooterGrouped: false, shake: 0,
};

function freshStock() { return { rawCalabresa: 8, rawMussarela: 8, rawVeggies: 7, rawCatupiry: 7, boxes: 10, sodas: 8, prepCalabresa: 2, prepMussarela: 2, prepVeggies: 1, prepCatupiry: 1, stockedSodas: 5, stockedBoxes: 8 }; }
function freshMetrics(n) { return { shiftNumber: n, timeRemaining: 165, stockChecked: false, ordersForwarded: 0, ordersDispatched: 0, groupedRoutes: 0, prepDone: 0, cleanings: 0, mistakes: 0, combo: 0, maxCombo: 0, shiftScore: 0, tips: 0, closingCleaned: false, activeEvent: null, activeEventT: 0, dirtySlicer: false, dirtyProcessor: false, dirtyGrater: false, dirtyCounter: false, attrGains: { agilidade: 0, precisao: 0, organizacao: 0, disciplina: 0, atencao: 0, resistencia: 0 } }; }

// ----------------------------- ÁUDIO (Web Audio) -----------------------------
let audioCtx = null;
function ac() { if (!soundOn) return null; if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {}); return audioCtx; }
function tone(f, d, type, vol, endF) { const c = ac(); if (!c) return; const t = c.currentTime; const o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (endF) o.frequency.exponentialRampToValueAtTime(Math.max(20, endF), t + d); g.gain.setValueAtTime(vol || 0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d); }
const sfx = {
  pickup() { tone(440, 0.09, 'triangle', 0.15, 720); },
  drop() { tone(360, 0.08, 'triangle', 0.12, 220); },
  dash() { tone(220, 0.12, 'sawtooth', 0.08, 520); },
  slice() { tone(900 + Math.random() * 250, 0.055, 'sawtooth', 0.09, 320); },
  water() { const c = ac(); if (!c) return; const n = c.sampleRate * 0.22, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.45)); const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; const g = c.createGain(); g.gain.value = 0.14; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); },
  clock() { tone(587, 0.08, 'square', 0.11); setTimeout(() => tone(880, 0.18, 'triangle', 0.16), 80); },
  ping() { tone(784, 0.1, 'sine', 0.14); setTimeout(() => tone(1046, 0.18, 'sine', 0.14), 95); },
  oven() { tone(659, 0.12, 'triangle', 0.15); setTimeout(() => tone(784, 0.12, 'triangle', 0.15), 110); setTimeout(() => tone(1046, 0.25, 'triangle', 0.17), 220); },
  scooter(grouped) { tone(130, 0.28, 'sawtooth', 0.11, 290); setTimeout(() => { tone(523, 0.1, 'triangle', 0.15); if (grouped) { setTimeout(() => tone(659, 0.1, 'triangle', 0.16), 80); setTimeout(() => tone(784, 0.12, 'triangle', 0.17), 160); setTimeout(() => tone(1046, 0.26, 'triangle', 0.19), 240); } else setTimeout(() => tone(784, 0.2, 'triangle', 0.16), 90); }, 90); },
  cash() { tone(988, 0.08, 'sine', 0.15); setTimeout(() => tone(1319, 0.24, 'sine', 0.17), 75); },
  level() { [523, 659, 784, 1046].forEach((n, i) => setTimeout(() => tone(n, 0.16, 'triangle', 0.16), i * 75)); },
  error() { tone(210, 0.16, 'sawtooth', 0.14, 140); setTimeout(() => tone(165, 0.22, 'sawtooth', 0.14, 115), 120); },
};

// ----------------------------- FEEDBACK VISUAL -----------------------------
function spawnParticles(x, y, color, count, shape, speed) {
  count = count || 14; shape = shape || 'circle'; speed = speed || 120;
  for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, s = (0.35 + Math.random() * 0.85) * speed; eng.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, size: 3 + Math.random() * 4.5, color, life: 0.45 + Math.random() * 0.35, maxLife: 0.8, shape }); }
}
function floatText(x, y, text, color, sub) { eng.floats.push({ id: eng.floatId++, x, y, text, sub: sub || '', color: color || '#fde047', life: 1.35, maxLife: 1.35 }); }
function shake(v) { eng.shake = Math.max(eng.shake, v || 0.8); }
function grantXp(attr, amt) {
  metrics.attrGains[attr] += amt;
  profile.attributeXp[attr] += amt;
  while (profile.attributeXp[attr] >= 100) { profile.attributeXp[attr] -= 100; profile.attributes[attr] += 1; sfx.level(); floatText(eng.px, eng.py - 42, '⬆ ' + attr.toUpperCase() + ' NÍVEL ' + profile.attributes[attr] + '!', '#38bdf8', 'Evolução Permanente Universo Zero'); }
  saveProfile();
}

// ----------------------------- PEDIDOS -----------------------------
function spawnOrder(forceWalkIn, forceNb, isVip) {
  const id = ++eng.nextOrderId;
  const flavor = FLAVORS[Math.floor(Math.random() * FLAVORS.length)];
  const nb = forceNb || NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
  const walkIn = forceWalkIn !== undefined ? forceWalkIn : Math.random() < 0.25;
  const maxT = (isVip ? 68 : 78) + (profile.ownedItems.includes('mochila_termica_pro') ? 10 : 0);
  orders.push({ id, flavor, needsDrink: Math.random() < 0.45, neighborhood: nb, isWalkIn: walkIn, isVip: !!isVip, stage: walkIn ? 'incoming_counter' : 'incoming_digital', timer: maxT, maxTimer: maxT, bake: 0 });
  sfx.ping();
}

// ----------------------------- EXPEDIENTE -----------------------------
function hireHelper() {
  profile.isHiredAsHelper = true;
  if (!profile.careerHistory.some((c) => c.id === 'forno_zero_helper')) profile.careerHistory.push({ id: 'forno_zero_helper', employer: 'Pizzaria Forno Zero', role: 'Ajudante de Pizzaria', hiredDay: profile.day, baseSalary: 140, shiftsCompleted: 0, bestRating: 'B', active: true });
  shiftPhase = 'clock_in'; saveProfile(); sfx.cash();
  floatText(eng.px, eng.py - 35, 'CONTRATADO! Vá ao Relógio de Ponto!', '#4ade80');
}
function prepareNewShift(nearClock) {
  stock = freshStock(); orders = []; heldItem = { type: 'none', label: '', color: 'transparent' };
  wearingUniform = false; uniform = { shirt: false, apron: false, cap: false, handsWashed: false };
  metrics = freshMetrics(metrics.shiftNumber + 1);
  profile.conditions.satisfacao = 100; profile.conditions.cansaco = Math.min(35, profile.conditions.cansaco); profile.conditions.estresse = Math.min(25, profile.conditions.estresse);
  shiftPhase = 'clock_in'; summaryData = null; eng.orderTimer = 3.5; eng.eventTimer = 28; eng.workId = null; eng.workProg = 0;
  if (nearClock) { eng.px = 852; eng.py = 415; }
  saveProfile();
}
function finalizeShift(isGameOver, reason) {
  const base = 140, earnedBase = isGameOver ? Math.round(base * 0.35) : base;
  const routeBonus = metrics.groupedRoutes * 35, penalty = metrics.mistakes * 12;
  const finalPay = Math.max(25, earnedBase + metrics.tips + routeBonus - penalty);
  const score = metrics.shiftScore + (isGameOver ? 0 : 350);
  let rating = 'B';
  if (score >= 2600 && metrics.mistakes === 0) rating = 'S+'; else if (score >= 1900) rating = 'S'; else if (score >= 1200) rating = 'A'; else if (score >= 650) rating = 'B'; else rating = 'C';
  let passive = 0;
  if (profile.ownBusiness.rented && profile.ownBusiness.hiredPizzaiolo && profile.ownBusiness.stockLevel >= 15) passive = 95 + (profile.ownBusiness.hiredAtendente ? 60 : 0) + (profile.ownBusiness.hiredAjudante ? 50 : 0);
  profile.money += finalPay; profile.day += 1; profile.totalScore += score;
  profile.conditions.satisfacao = 100; profile.conditions.estresse = Math.max(10, profile.conditions.estresse - 25);
  profile.careerHistory = profile.careerHistory.map((r) => r.id === 'forno_zero_helper' ? Object.assign({}, r, { shiftsCompleted: r.shiftsCompleted + (isGameOver ? 0 : 1), bestRating: (rating === 'S+' || r.bestRating === 'S+') ? 'S+' : (rating < r.bestRating ? rating : r.bestRating) }) : r);
  if (profile.ownBusiness.rented && profile.ownBusiness.hiredPizzaiolo) profile.ownBusiness.stockLevel = Math.max(0, profile.ownBusiness.stockLevel - (profile.ownBusiness.hiredAjudante ? 12 : 20));
  profile.ownBusiness.dailyRevenueAccumulated += passive;
  let isNewHigh = false;
  if (!isGameOver) {
    const entry = { id: 'run_' + Date.now(), playerName: profile.name + ' (Dia ' + profile.day + ')', score, earnings: finalPay, ordersDelivered: metrics.ordersDispatched, rating, day: profile.day, date: 'Hoje' };
    scores = scores.concat([entry]).sort((a, b) => b.score - a.score).slice(0, 8);
    isNewHigh = scores[0] && scores[0].id === entry.id;
    try { localStorage.setItem(SCORES_KEY, JSON.stringify(scores)); } catch (e) {}
  }
  wearingUniform = false; uniform = { shirt: false, apron: false, cap: false, handsWashed: false };
  heldItem = { type: 'none', label: '', color: 'transparent' }; orders = []; shiftPhase = 'off_duty';
  metrics.shiftScore = score;
  summaryData = { isGameOver, reason, finalPay, rating, isNewHigh };
  screen = isGameOver ? 'gameover' : 'summary';
  if (isGameOver) sfx.error(); else sfx.cash();
  saveProfile(); renderSummary(); showScreen();
}

// ----------------------------- TRABALHO TEMPORIZADO -----------------------------
function startWork(id, seconds, cb) {
  const gloves = profile.ownedItems.includes('luva_precisao');
  const speedup = 1 + (profile.attributes.precisao - 1) * 0.1 + (gloves ? 0.3 : 0);
  eng.workId = id; eng.workDur = Math.max(0.32, seconds / speedup); eng.workProg = 0.02; eng.workCb = cb;
}

// ----------------------------- INTERAÇÕES -----------------------------
function interact(st) {
  const cx = st.x + st.w / 2, cy = st.y + st.h / 2;
  if (st.id === 'home_bed') { if (shiftPhase !== 'off_duty' && shiftPhase !== 'clock_in') { floatText(cx, cy, 'Termine o expediente antes de ir dormir!', '#f87171'); sfx.error(); return; } openDialog('home'); return; }
  if (st.id === 'shop_counter') { openDialog('shop'); return; }
  if (st.id === 'own_business') { openDialog('own_business'); return; }
  if (st.id === 'plaza_recruiter') { openDialog('recruiter'); return; }
  if (st.id === 'npc_attendant') { openDialog('attendant'); return; }

  if (st.id === 'time_clock') {
    if (!profile.isHiredAsHelper) { floatText(cx, cy, 'Fale com a Atendente Bia p/ se candidatar!', '#fbbf24'); sfx.error(); return; }
    if (shiftPhase === 'off_duty' || shiftPhase === 'clock_in') {
      if (shiftPhase === 'off_duty') { stock = freshStock(); metrics = freshMetrics(metrics.shiftNumber + 1); }
      sfx.clock(); spawnParticles(cx, cy, '#34d399', 18, 'ring'); grantXp('disciplina', 20);
      shiftPhase = 'personal_prep'; floatText(cx, cy - 15, 'PONTO REGISTRADO!', '#4ade80', 'Vá ao Vestiário vestir o uniforme'); return;
    }
    if (shiftPhase === 'closing') {
      if (!metrics.closingCleaned) { floatText(cx, cy - 15, 'Higienize a bancada da Expedição antes de sair!', '#fbbf24'); sfx.error(); return; }
      sfx.clock(); grantXp('disciplina', 25); finalizeShift(false); return;
    }
    floatText(cx, cy - 15, 'Turno em andamento (' + Math.ceil(metrics.timeRemaining) + 's)', '#93c5fd'); return;
  }
  if (shiftPhase === 'off_duty' || shiftPhase === 'clock_in') {
    floatText(cx, cy - 12, profile.isHiredAsHelper ? 'Bata o ponto de entrada primeiro! ⏱️' : 'Candidate-se com a Atendente Bia primeiro!', '#fbbf24'); sfx.error(); return;
  }
  if (st.id === 'locker') {
    if (uniform.shirt && uniform.apron && uniform.cap) { floatText(cx, cy, 'Uniforme completo já vestido ✓', '#86efac'); return; }
    startWork('locker', 0.65, () => { wearingUniform = true; uniform.shirt = uniform.apron = uniform.cap = true; sfx.pickup(); spawnParticles(cx, cy, '#38bdf8', 20); grantXp('disciplina', 20); floatText(cx, cy - 18, 'Camisa + Avental + Touca ✓', '#38bdf8', 'Agora lave as mãos na Pia!'); });
    return;
  }
  if (st.id === 'sink') {
    if (!wearingUniform) { floatText(cx, cy, 'Vista o uniforme no Armário antes!', '#fbbf24'); sfx.error(); return; }
    startWork('sink', 0.65, () => { uniform.handsWashed = true; sfx.water(); spawnParticles(cx, cy, '#67e8f9', 22); grantXp('disciplina', 20); if (shiftPhase === 'personal_prep') shiftPhase = 'stock_check'; floatText(cx, cy - 18, 'Mãos Higienizadas ✓', '#67e8f9', 'Confira o Estoque Seco!'); });
    return;
  }
  if (!wearingUniform || !uniform.handsWashed) { floatText(cx, cy - 12, 'Vista o uniforme e lave as mãos antes!', '#f87171'); sfx.error(); return; }

  if (st.id === 'dry_stock') {
    if (!metrics.stockChecked) {
      startWork('dry_stock', 0.7, () => {
        metrics.stockChecked = true; metrics.shiftScore += 120;
        stock.rawCalabresa = Math.max(8, stock.rawCalabresa); stock.rawMussarela = Math.max(8, stock.rawMussarela); stock.boxes = 12;
        shiftPhase = 'operation'; sfx.cash(); spawnParticles(cx, cy, '#fbbf24', 20, 'square');
        grantXp('organizacao', 22); grantXp('atencao', 15);
        floatText(cx, cy - 18, 'ESTOQUE CONFERIDO! +120 pts', '#fde047', 'Operação Aberta!');
        spawnOrder(false, 'Bairro Central'); setTimeout(() => spawnOrder(false, 'Bairro Central'), 1400);
      });
      return;
    }
    stock.rawCalabresa = Math.min(12, stock.rawCalabresa + 4); stock.rawMussarela = Math.min(12, stock.rawMussarela + 4);
    stock.rawVeggies = Math.min(10, stock.rawVeggies + 4); stock.rawCatupiry = Math.min(10, stock.rawCatupiry + 4);
    stock.boxes = Math.min(15, stock.boxes + 5); stock.stockedSodas = Math.min(10, stock.stockedSodas + 4);
    sfx.pickup(); spawnParticles(cx, cy, '#fde68a', 14, 'square'); grantXp('organizacao', 15);
    floatText(cx, cy - 16, 'Estoque & Geladeiras Reabastecidos!', '#fde68a'); return;
  }
  if (st.id === 'fridge_calabresa') {
    const pickCal = heldItem.type === 'raw_calabresa' ? false : heldItem.type === 'raw_mussarela' ? true : stock.prepCalabresa <= stock.prepMussarela;
    if (pickCal) {
      if (stock.rawCalabresa <= 0) { floatText(cx, cy, 'Sem Calabresa! Reponha no Estoque Seco!', '#f87171'); sfx.error(); return; }
      stock.rawCalabresa--; heldItem = { type: 'raw_calabresa', label: 'Calabresa p/ Fatiar', color: '#dc2626', accent: '#fca5a5' };
      sfx.pickup(); floatText(cx, cy - 14, 'Pegou Calabresa Bruta', '#fca5a5', '[E] de novo troca p/ Mussarela');
    } else {
      if (stock.rawMussarela <= 0) { floatText(cx, cy, 'Sem Mussarela! Reponha no Estoque Seco!', '#f87171'); sfx.error(); return; }
      stock.rawMussarela--; heldItem = { type: 'raw_mussarela', label: 'Peça de Mussarela', color: '#facc15', accent: '#fef08a' };
      sfx.pickup(); floatText(cx, cy - 14, 'Pegou Mussarela em Peça', '#fef08a', '[E] de novo troca p/ Calabresa');
    }
    return;
  }
  if (st.id === 'freezer_produce') {
    const pickVeg = heldItem.type === 'raw_veggies' ? false : heldItem.type === 'raw_catupiry' ? true : stock.prepVeggies <= stock.prepCatupiry;
    if (pickVeg) {
      if (stock.rawVeggies <= 0) { floatText(cx, cy, 'Reponha no Estoque ao lado!', '#f87171'); sfx.error(); return; }
      stock.rawVeggies--; heldItem = { type: 'raw_veggies', label: 'Tomate & Cebola', color: '#22c55e', accent: '#bbf7d0' };
      sfx.pickup(); floatText(cx, cy - 14, 'Pegou Tomate & Cebola', '#86efac', '[E] de novo troca p/ Catupiry');
    } else {
      if (stock.rawCatupiry <= 0) { floatText(cx, cy, 'Reponha no Estoque ao lado!', '#f87171'); sfx.error(); return; }
      stock.rawCatupiry--; heldItem = { type: 'raw_catupiry', label: 'Bisnagas Catupiry', color: '#f8fafc', accent: '#fdba74' };
      sfx.pickup(); floatText(cx, cy - 14, 'Pegou Embalagem Catupiry', '#fed7aa', '[E] de novo troca p/ Vegetais');
    }
    return;
  }
  if (st.id === 'slicer') {
    if (metrics.dirtySlicer) { startWork('slicer', heldItem.type === 'cleaning_kit' ? 0.45 : 0.85, () => { metrics.dirtySlicer = false; metrics.cleanings++; metrics.shiftScore += 90; sfx.water(); spawnParticles(cx, cy, '#67e8f9', 18); grantXp('disciplina', 18); floatText(cx, cy - 16, 'Fatiador Higienizado! +90 pts', '#67e8f9'); }); return; }
    if (heldItem.type !== 'raw_calabresa') { floatText(cx, cy, 'Traga Calabresa da Geladeira p/ fatiar!', '#fca5a5'); sfx.error(); return; }
    startWork('slicer', 0.85, () => { sfx.slice(); setTimeout(() => sfx.slice(), 110); shake(0.55); spawnParticles(cx, cy, '#ef4444', 22, 'circle', 150); heldItem = { type: 'sliced_calabresa', label: 'Cuba: Calabresa Fatiada', color: '#b91c1c', accent: '#fde047' }; grantXp('precisao', 24); metrics.prepDone++; metrics.shiftScore += 110; if (Math.random() < 0.28) metrics.dirtySlicer = true; floatText(cx, cy - 18, 'CALABRESA FATIADA! +110 pts', '#fca5a5', '+24 XP Precisão'); });
    return;
  }
  if (st.id === 'grater') {
    if (metrics.dirtyGrater) { startWork('grater', heldItem.type === 'cleaning_kit' ? 0.45 : 0.85, () => { metrics.dirtyGrater = false; metrics.cleanings++; metrics.shiftScore += 90; sfx.water(); spawnParticles(cx, cy, '#67e8f9', 18); grantXp('disciplina', 18); floatText(cx, cy - 16, 'Ralador Limpo! +90 pts', '#67e8f9'); }); return; }
    if (heldItem.type !== 'raw_mussarela') { floatText(cx, cy, 'Traga Mussarela da Geladeira p/ ralar!', '#fef08a'); sfx.error(); return; }
    startWork('grater', 0.85, () => { sfx.slice(); shake(0.5); spawnParticles(cx, cy, '#facc15', 24, 'square', 145); heldItem = { type: 'grated_mussarela', label: 'Cuba: Mussarela Ralada', color: '#eab308', accent: '#ffffff' }; grantXp('precisao', 24); metrics.prepDone++; metrics.shiftScore += 110; if (Math.random() < 0.25) metrics.dirtyGrater = true; floatText(cx, cy - 18, 'MUSSARELA RALADA! +110 pts', '#fde047', '+24 XP Precisão'); });
    return;
  }
  if (st.id === 'processor') {
    if (metrics.dirtyProcessor) { startWork('processor', heldItem.type === 'cleaning_kit' ? 0.45 : 0.85, () => { metrics.dirtyProcessor = false; metrics.cleanings++; metrics.shiftScore += 90; sfx.water(); spawnParticles(cx, cy, '#67e8f9', 18); grantXp('disciplina', 18); floatText(cx, cy - 16, 'Processador Higienizado! +90 pts', '#67e8f9'); }); return; }
    if (heldItem.type === 'raw_veggies') { startWork('processor', 0.8, () => { sfx.slice(); shake(0.5); spawnParticles(cx, cy, '#4ade80', 22, 'circle', 145); heldItem = { type: 'chopped_veggies', label: 'Tomate & Cebola Picados', color: '#16a34a', accent: '#fca5a5' }; grantXp('precisao', 22); metrics.prepDone++; metrics.shiftScore += 115; if (Math.random() < 0.25) metrics.dirtyProcessor = true; floatText(cx, cy - 18, 'VEGETAIS PROCESSADOS! +115 pts', '#86efac'); }); return; }
    if (heldItem.type === 'raw_catupiry') { startWork('processor', 0.75, () => { sfx.pickup(); spawnParticles(cx, cy, '#fef3c7', 18, 'circle', 130); heldItem = { type: 'portioned_catupiry', label: 'Porções de Catupiry', color: '#f8fafc', accent: '#f97316' }; grantXp('organizacao', 22); metrics.prepDone++; metrics.shiftScore += 115; floatText(cx, cy - 18, 'CATUPIRY PORCIONADO! +115 pts', '#fde68a'); }); return; }
    floatText(cx, cy, 'Traga Tomate/Cebola ou Catupiry dos Frios!', '#86efac'); sfx.error(); return;
  }
  if (st.id === 'kitchen_pass') {
    const t = heldItem.type;
    if (t === 'sliced_calabresa' || t === 'grated_mussarela' || t === 'chopped_veggies' || t === 'portioned_catupiry') {
      if (t === 'sliced_calabresa') stock.prepCalabresa += 3;
      if (t === 'grated_mussarela') stock.prepMussarela += 3;
      if (t === 'chopped_veggies') stock.prepVeggies += 3;
      if (t === 'portioned_catupiry') stock.prepCatupiry += 3;
      heldItem = { type: 'none', label: '', color: 'transparent' }; sfx.cash(); spawnParticles(cx, cy, '#fb923c', 18, 'ring');
      grantXp('organizacao', 20); metrics.tips += 8; metrics.shiftScore += 95;
      eng.chefSpeech = 'Valeu, Tic-Tac! Abasteceu na hora certa! 👨‍🍳'; eng.chefSpeechT = 3.5;
      floatText(cx, cy - 18, '+3 Porções na Bancada! +R$ 8', '#fdba74'); return;
    }
    floatText(cx, cy, 'Traga ingredientes fatiados/ralados para o Chef Marco!', '#fdba74'); return;
  }
  if (st.id === 'office_pc') {
    const inc = orders.filter((o) => o.stage === 'incoming_digital');
    if (!inc.length) { floatText(cx, cy, 'Nenhum pedido pendente no App agora ✓', '#93c5fd'); return; }
    orders.forEach((o) => { if (o.stage === 'incoming_digital') o.stage = 'in_kitchen'; });
    sfx.ping(); spawnParticles(cx, cy, '#818cf8', 20, 'ring'); grantXp('atencao', 18 * inc.length); grantXp('agilidade', 14);
    metrics.ordersForwarded += inc.length; metrics.shiftScore += inc.length * 90;
    eng.chefSpeech = 'Recebi ' + inc.length + ' comanda(s)! Mãos na massa!'; eng.chefSpeechT = 3.5;
    floatText(cx, cy - 18, inc.length + ' Pedido(s) Encaminhado(s) ao Chef!', '#a5b4fc', '+' + (inc.length * 90) + ' pts'); return;
  }
  if (st.id === 'walkin_counter') {
    const w = orders.find((o) => o.stage === 'incoming_counter');
    if (!w) { floatText(cx, cy, 'Sem clientes aguardando no balcão', '#cbd5e1'); return; }
    w.stage = 'in_kitchen'; sfx.cash(); spawnParticles(cx, cy, '#fde047', 18);
    grantXp('atencao', 20); grantXp('agilidade', 18); metrics.ordersForwarded++; metrics.tips += 10; metrics.shiftScore += 130;
    floatText(cx, cy - 18, 'Pedido #' + w.id + ' Registrado! +R$ 10', '#fde047'); return;
  }
  if (st.id === 'oven_pickup') {
    if (heldItem.type !== 'none') { floatText(cx, cy, 'Libere as mãos antes de retirar a pizza quente!', '#fbbf24'); sfx.error(); return; }
    const ready = orders.find((o) => o.stage === 'ready_oven');
    if (!ready) { floatText(cx, cy, 'Aguarde o Chef Marco assar a pizza!', '#fdba74'); return; }
    orders = orders.filter((o) => o.id !== ready.id);
    heldItem = { type: 'baked_pizza', label: 'Pizza #' + ready.id + ' (' + ready.flavor + ')' + (ready.needsDrink ? ' + S/ Bebida!' : ''), color: '#f97316', accent: '#fde047', orderId: ready.id, pizzaFlavor: ready.flavor, needsDrink: ready.needsDrink, hasDrink: !ready.needsDrink, neighborhood: ready.neighborhood };
    sfx.pickup(); spawnParticles(cx, cy, '#fb923c', 16);
    floatText(cx, cy - 18, 'Retirou Pizza #' + ready.id + '!', '#fde047', ready.needsDrink ? 'Pegue Refrigerante antes de embalar!' : 'Leve p/ Mesa de Expedição!'); return;
  }
  if (st.id === 'drink_fridge') {
    if (heldItem.type === 'baked_pizza') {
      if (heldItem.hasDrink) { floatText(cx, cy, 'Este pedido já está com bebida ok ✓', '#7dd3fc'); return; }
      if (stock.stockedSodas <= 0) stock.stockedSodas = 6; else stock.stockedSodas--;
      heldItem.hasDrink = true; heldItem.label = 'Pizza #' + heldItem.orderId + ' + Bebida Gelada ✓'; heldItem.accent = '#38bdf8';
      sfx.pickup(); spawnParticles(cx, cy, '#38bdf8', 18); grantXp('atencao', 22);
      floatText(cx, cy - 18, 'Refrigerante Conferido e Adicionado! 🥤', '#7dd3fc'); return;
    }
    stock.stockedSodas = Math.min(12, stock.stockedSodas + 5); sfx.pickup(); grantXp('organizacao', 14);
    floatText(cx, cy - 14, 'Geladeira de Bebidas Abastecida!', '#7dd3fc'); return;
  }
  if (st.id === 'packing_table') {
    if (shiftPhase === 'closing' && !metrics.closingCleaned) {
      startWork('packing_table', 0.75, () => { metrics.closingCleaned = true; metrics.dirtyCounter = false; metrics.cleanings++; metrics.shiftScore += 180; sfx.water(); spawnParticles(cx, cy, '#34d399', 24, 'ring'); grantXp('disciplina', 25); grantXp('organizacao', 20); floatText(cx, cy - 18, 'FECHAMENTO CONCLUÍDO! +180 pts', '#4ade80', 'Vá ao Relógio de Ponto registrar saída!'); });
      return;
    }
    if (metrics.dirtyCounter) { startWork('packing_table', 0.6, () => { metrics.dirtyCounter = false; metrics.shiftScore += 80; sfx.water(); spawnParticles(cx, cy, '#67e8f9', 16); floatText(cx, cy - 16, 'Bancada Limpa! +80 pts', '#67e8f9'); }); return; }
    if (heldItem.type !== 'baked_pizza') { floatText(cx, cy, 'Traga uma Pizza assada do Forno para conferir e embalar!', '#fde68a'); return; }
    if (!heldItem.hasDrink) { floatText(cx, cy - 16, '⚠️ ATENÇÃO: Falta a Bebida! Pegue na Geladeira Azul!', '#f87171'); sfx.error(); return; }
    startWork('packing_table', 0.65, () => {
      const packed = { id: heldItem.orderId || 1099, flavor: heldItem.pizzaFlavor || 'Calabresa', needsDrink: false, neighborhood: heldItem.neighborhood || 'Bairro Central', isWalkIn: false, isVip: false, stage: 'packed_ready', timer: 75, maxTimer: 75, bake: 100 };
      orders.push(packed); heldItem = { type: 'none', label: '', color: 'transparent' };
      stock.boxes = Math.max(1, stock.boxes - 1); sfx.drop(); spawnParticles(cx, cy, '#fbbf24', 20, 'square');
      grantXp('atencao', 24); grantXp('organizacao', 16); metrics.shiftScore += 140;
      floatText(cx, cy - 18, 'Caixa #' + packed.id + ' Etiquetada (' + packed.neighborhood + ')!', '#fde047', 'Despache ao lado (2x mesmo bairro = ROTA AGRUPADA!)');
    });
    return;
  }
  if (st.id === 'dispatch_desk') {
    const packed = orders.filter((o) => o.stage === 'packed_ready');
    if (!packed.length) { floatText(cx, cy, 'Embale pedidos na Mesa de Conferência primeiro!', '#94a3b8'); return; }
    const byNb = {}; packed.forEach((o) => { (byNb[o.neighborhood] = byNb[o.neighborhood] || []).push(o); });
    const group = Object.values(byNb).sort((a, b) => b.length - a.length)[0];
    const grouped = group.length >= 2;
    const ids = new Set(group.map((o) => o.id));
    orders = orders.filter((o) => !ids.has(o.id));
    const bagBonus = profile.ownedItems.includes('mochila_termica_pro') ? 1.25 : 1;
    const tip = Math.round((group.length * 22 + (grouped ? 45 : 0)) * bagBonus);
    const pts = group.length * 220 + (grouped ? 380 : 0);
    sfx.scooter(grouped); shake(grouped ? 1.3 : 0.7); spawnParticles(cx, cy, grouped ? '#34d399' : '#fbbf24', grouped ? 36 : 22, 'circle', 190);
    eng.scooter = 0.01; eng.scooterGrouped = grouped;
    grantXp('agilidade', 20 * group.length);
    if (grouped) { grantXp('organizacao', 38); grantXp('atencao', 26); }
    metrics.ordersDispatched += group.length; if (grouped) metrics.groupedRoutes++;
    metrics.combo += group.length; metrics.maxCombo = Math.max(metrics.maxCombo, metrics.combo);
    metrics.tips += tip; metrics.shiftScore += pts + metrics.combo * 25;
    profile.conditions.satisfacao = Math.min(100, profile.conditions.satisfacao + (grouped ? 14 : 6));
    profile.conditions.moral = Math.min(100, profile.conditions.moral + 6);
    floatText(cx, cy - 22, grouped ? '🚀 ROTA AGRUPADA (' + group.length + 'x ' + group[0].neighborhood + ')! +R$ ' + tip : '🛵 Pedido #' + group[0].id + ' Expedido! +R$ ' + tip, grouped ? '#4ade80' : '#fde047', '+' + pts + ' pts • Motoboy Leo em Rota!');
    saveProfile(); return;
  }
  if (st.id === 'cleaning_closet') {
    if (heldItem.type === 'cleaning_kit') { heldItem = { type: 'none', label: '', color: 'transparent' }; sfx.drop(); floatText(cx, cy - 14, 'Kit de Limpeza Guardado', '#99f6e4'); }
    else { heldItem = { type: 'cleaning_kit', label: 'Kit de Higienização Rápida', color: '#14b8a6', accent: '#ffffff' }; sfx.pickup(); floatText(cx, cy - 14, 'Pegou Kit de Limpeza (2x mais rápido!)', '#5eead4'); }
    return;
  }
  if (st.id === 'staff_coffee') {
    startWork('staff_coffee', 0.55, () => {
      profile.conditions.cansaco = Math.max(0, profile.conditions.cansaco - 32);
      profile.conditions.estresse = Math.max(0, profile.conditions.estresse - 25);
      profile.conditions.moral = Math.min(100, profile.conditions.moral + 12);
      sfx.water(); spawnParticles(cx, cy, '#e9d5ff', 18); grantXp('resistencia', 22);
      floatText(cx, cy - 16, 'Pausa Hidratação! -32% Cansaço', '#d8b4fe', '+22 XP Resistência'); saveProfile();
    });
    return;
  }
}

// ----------------------------- GUIA / OBJETIVO -----------------------------
function guidance() {
  const F = (id) => stById(id);
  if (shiftPhase === 'off_duty') {
    if (!profile.isHiredAsHelper) { const s = F('npc_attendant'); return { x: s.ix, y: s.iy, label: 'Fale com a Atendente Bia p/ Candidatar-se' }; }
    const s = F('time_clock'); return { x: s.ix, y: s.iy, label: 'Bata o Ponto p/ Iniciar um Novo Turno (ou explore a cidade!)' };
  }
  if (shiftPhase === 'clock_in') { const s = F('time_clock'); return { x: s.ix, y: s.iy, label: '1. Registre a Entrada no Relógio de Ponto' }; }
  if (shiftPhase === 'personal_prep') {
    if (!uniform.shirt || !uniform.apron || !uniform.cap) { const s = F('locker'); return { x: s.ix, y: s.iy, label: '2. Vista Camisa, Avental e Touca no Armário' }; }
    if (!uniform.handsWashed) { const s = F('sink'); return { x: s.ix, y: s.iy, label: '3. Lave as Mãos na Pia do Lavatório' }; }
  }
  if (shiftPhase === 'stock_check') { const s = F('dry_stock'); return { x: s.ix, y: s.iy, label: '4. Confira a Lista de Ingredientes no Estoque' }; }
  if (shiftPhase === 'closing') {
    if (!metrics.closingCleaned) { const s = F('packing_table'); return { x: s.ix, y: s.iy, label: 'Fechamento: Higienize a Bancada de Expedição' }; }
    const s = F('time_clock'); return { x: s.ix, y: s.iy, label: 'Fechamento Concluído! Bata o Ponto de Saída' };
  }
  const t = heldItem.type;
  if (t === 'raw_calabresa') { const s = F('slicer'); return { x: s.ix, y: s.iy, label: 'Fatie a Calabresa no Fatiador' }; }
  if (t === 'raw_mussarela') { const s = F('grater'); return { x: s.ix, y: s.iy, label: 'Rale a Mussarela no Ralador' }; }
  if (t === 'raw_veggies' || t === 'raw_catupiry') { const s = F('processor'); return { x: s.ix, y: s.iy, label: 'Processe no Processador / Porcionador' }; }
  if (t === 'sliced_calabresa' || t === 'grated_mussarela' || t === 'chopped_veggies' || t === 'portioned_catupiry') { const s = F('kitchen_pass'); return { x: s.ix, y: s.iy, label: 'Entregue o Ingrediente na Bancada do Pizzaiolo' }; }
  if (t === 'baked_pizza') {
    if (heldItem.needsDrink && !heldItem.hasDrink) { const s = F('drink_fridge'); return { x: s.ix, y: s.iy, label: 'Pedido com Bebida! Pegue Refrigerante na Geladeira' }; }
    const s = F('packing_table'); return { x: s.ix, y: s.iy, label: 'Confira, Feche a Caixa e Etiquete na Mesa de Expedição' };
  }
  const ready = orders.find((o) => o.stage === 'ready_oven');
  if (ready) { const s = F('oven_pickup'); return { x: s.ix, y: s.iy, label: 'Retire a Pizza #' + ready.id + ' Quentinha no Forno!' }; }
  const packed = orders.filter((o) => o.stage === 'packed_ready');
  if (packed.length >= 2 || (packed.length === 1 && orders.length === 1)) { const s = F('dispatch_desk'); return { x: s.ix, y: s.iy, label: 'Despache a Rota com o Motoboy Leo!' }; }
  const walkIn = orders.find((o) => o.stage === 'incoming_counter');
  if (walkIn) { const s = F('walkin_counter'); return { x: s.ix, y: s.iy, label: 'Atenda o Cliente Presencial no Balcão!' }; }
  const dig = orders.find((o) => o.stage === 'incoming_digital');
  if (dig) { const s = F('office_pc'); return { x: s.ix, y: s.iy, label: 'Confira e Encaminhe Pedido Digital no Computador!' }; }
  if (stock.prepCalabresa <= 1 || stock.prepMussarela <= 1) { const s = F('fridge_calabresa'); return { x: s.ix, y: s.iy, label: 'Reponha Calabresa ou Mussarela na Geladeira' }; }
  if (stock.prepVeggies <= 0 || stock.prepCatupiry <= 0) { const s = F('freezer_produce'); return { x: s.ix, y: s.iy, label: 'Busque Tomate/Cebola ou Catupiry nos Frios' }; }
  if (packed.length > 0) { const s = F('dispatch_desk'); return { x: s.ix, y: s.iy, label: 'Encaminhe o Pedido Conferido ao Entregador' }; }
  return null;
}

// ----------------------------- MOVIMENTO / COLISÃO -----------------------------
function resolvePos(nx, ny) {
  const r = 16;
  let rx = Math.max(36, Math.min(WORLD_W - 36, nx)), ry = Math.max(36, Math.min(WORLD_H - 36, ny));
  const obs = WALLS.concat(STATIONS.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })));
  for (const ob of obs) {
    const cx = Math.max(ob.x, Math.min(rx, ob.x + ob.w)), cy = Math.max(ob.y, Math.min(ry, ob.y + ob.h));
    const dx = rx - cx, dy = ry - cy, d2 = dx * dx + dy * dy;
    if (d2 < r * r) { const d = Math.sqrt(d2) || 0.001, ov = r - d; rx += (dx / d) * ov; ry += (dy / d) * ov; }
  }
  return { x: rx, y: ry };
}
function nearestStationAt(px, py, maxD) {
  let best = null, bd = maxD || 108;
  for (const st of STATIONS) {
    const cx = st.x + st.w / 2, cy = st.y + st.h / 2;
    const d = Math.min(Math.hypot(px - cx, py - cy), Math.hypot(px - st.ix, py - st.iy));
    if (d < bd) { bd = d; best = st; }
  }
  return best;
}

// ----------------------------- RENDERIZAÇÃO CANVAS -----------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.closePath(); }
function drawNpc(x, y, color, name, hat) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 17, 15, 7, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();
  rr(-14, -14, 28, 30, 12); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -13, 11.5, 0, Math.PI * 2); ctx.fillStyle = '#fed7aa'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(-3.5, -13.5, 2, 0, Math.PI * 2); ctx.arc(3.5, -13.5, 2, 0, Math.PI * 2); ctx.fill();
  if (hat) { rr(-11, -31, 22, 14, 6); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.font = '700 10px "Plus Jakarta Sans"'; ctx.textAlign = 'center'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(name, 0, 29);
  ctx.restore();
}
function bubble(x, y, text, border) {
  ctx.save(); ctx.font = '700 11px "Plus Jakarta Sans"';
  const w = Math.max(90, ctx.measureText(text).width + 20), bx = x - w / 2, by = y - 16;
  rr(bx, by, w, 26, 8); ctx.fillStyle = 'rgba(15,23,42,.94)'; ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(text, x, by + 17); ctx.restore();
}
function stationDetail(st) {
  ctx.font = '700 11px "JetBrains Mono", monospace';
  const id = st.id;
  if (id === 'office_pc') { const n = orders.filter((o) => o.stage === 'incoming_digital').length; ctx.fillStyle = n ? '#fde047' : '#94a3b8'; ctx.fillText(n ? '🔔 ' + n + ' PEDIDO(S) APP!' : 'App Online OK', st.x + 12, st.y + 62); }
  else if (id === 'dry_stock') { ctx.fillStyle = metrics.stockChecked ? '#86efac' : '#fde047'; ctx.fillText(metrics.stockChecked ? 'Caixas:' + stock.boxes + ' | Conf. OK' : '⚠️ CONFERIR ESTOQUE', st.x + 8, st.y + 62); }
  else if (id === 'fridge_calabresa') { ctx.fillStyle = '#fecaca'; ctx.fillText('Calab:' + stock.rawCalabresa + ' Muss:' + stock.rawMussarela, st.x + 8, st.y + 62); }
  else if (id === 'freezer_produce') { ctx.fillStyle = '#bbf7d0'; ctx.fillText('Veg:' + stock.rawVeggies + ' Catup:' + stock.rawCatupiry, st.x + 8, st.y + 62); }
  else if (id === 'slicer') { ctx.fillStyle = metrics.dirtySlicer ? '#fbbf24' : '#cbd5e1'; ctx.fillText(metrics.dirtySlicer ? '🧼 LIMPAR LÂMINA!' : 'Pronto p/ Fatiar', st.x + 12, st.y + 66); }
  else if (id === 'grater') { ctx.fillStyle = metrics.dirtyGrater ? '#fbbf24' : '#cbd5e1'; ctx.fillText(metrics.dirtyGrater ? '🧼 LIMPAR RALADOR!' : 'Pronto p/ Ralar', st.x + 12, st.y + 66); }
  else if (id === 'processor') { ctx.fillStyle = metrics.dirtyProcessor ? '#fbbf24' : '#cbd5e1'; ctx.fillText(metrics.dirtyProcessor ? '🧼 HIGIENIZAR!' : 'Tomate/Cebola/Catup.', st.x + 10, st.y + 66); }
  else if (id === 'kitchen_pass') { ctx.fillStyle = '#fed7aa'; ctx.fillText('🥩' + stock.prepCalabresa + ' 🧀' + stock.prepMussarela + ' 🍅' + stock.prepVeggies + ' 🥣' + stock.prepCatupiry, st.x + 14, st.y + 74); }
  else if (id === 'oven_pickup') {
    const ready = orders.filter((o) => o.stage === 'ready_oven').length, baking = orders.find((o) => o.stage === 'in_kitchen');
    if (ready) { ctx.fillStyle = '#fde047'; ctx.fillText('🍕 ' + ready + ' PRONTA(S) P/ RETIRAR!', st.x + 12, st.y + 74); }
    else if (baking) { ctx.fillStyle = '#fdba74'; ctx.fillText('Assando #' + baking.id + ': ' + Math.floor(baking.bake) + '%', st.x + 12, st.y + 74); }
    else { ctx.fillStyle = '#94a3b8'; ctx.fillText('Forno 320°C Aquecido', st.x + 12, st.y + 74); }
  }
  else if (id === 'packing_table') { const n = orders.filter((o) => o.stage === 'packed_ready').length; ctx.fillStyle = metrics.dirtyCounter ? '#fbbf24' : '#fde68a'; ctx.fillText(metrics.dirtyCounter ? '🧼 LIMPAR BANCADA!' : 'Conferidos: ' + n + ' caixa(s)', st.x + 14, st.y + 76); }
  else if (id === 'dispatch_desk') {
    const packed = orders.filter((o) => o.stage === 'packed_ready'), counts = {};
    packed.forEach((o) => { counts[o.neighborhood] = (counts[o.neighborhood] || 0) + 1; });
    const hasGroup = Object.values(counts).some((c) => c >= 2);
    ctx.fillStyle = hasGroup ? '#4ade80' : packed.length ? '#fde047' : '#94a3b8';
    ctx.fillText(hasGroup ? '🚀 ROTA AGRUPADA PRONTA!' : packed.length ? '🛵 Despachar (' + packed.length + ')' : 'Aguardando Caixas', st.x + 12, st.y + 76);
  }
  else if (id === 'drink_fridge') { ctx.fillStyle = '#7dd3fc'; ctx.fillText('Geladas: ' + stock.stockedSodas + ' un', st.x + 12, st.y + 76); }
  else if (id === 'locker') { const done = uniform.shirt && uniform.apron && uniform.cap; ctx.fillStyle = done ? '#86efac' : '#bae6fd'; ctx.fillText(done ? 'Uniforme Completo ✓' : 'Camisa+Avental+Touca', st.x + 8, st.y + 62); }
  else if (id === 'sink') { ctx.fillStyle = uniform.handsWashed ? '#86efac' : '#cffafe'; ctx.fillText(uniform.handsWashed ? 'Mãos Limpas ✓' : 'Lavar as Mãos', st.x + 12, st.y + 62); }
}
function drawPlayer() {
  const speed = Math.hypot(eng.vx, eng.vy);
  const bob = speed > 10 ? Math.sin(eng.time * 16) * 2.5 : Math.sin(eng.time * 3) * 0.8;
  const sx = eng.dashT > 0 ? 1.18 : 1 + (speed / 300) * 0.06, sy = eng.dashT > 0 ? 0.86 : 1 - (speed / 300) * 0.04;
  const body = wearingUniform ? '#dc2626' : (OUTFITS[profile.streetOutfit] || OUTFITS.casual_azul).body;
  ctx.save(); ctx.translate(eng.px, eng.py + bob); ctx.scale(sx, sy);
  ctx.beginPath(); ctx.ellipse(0, 19 - bob, 18, 8, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();
  rr(-16, -18, 32, 34, 15); ctx.fillStyle = body; ctx.fill(); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.5; ctx.stroke();
  if (wearingUniform && uniform.apron) { rr(-12, -2, 24, 17, 6); ctx.fillStyle = '#f8fafc'; ctx.fill(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, -14, 13, 0, Math.PI * 2); ctx.fillStyle = '#fde68a'; ctx.fill(); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.2; ctx.stroke();
  const lx = Math.cos(eng.facing) * 3.2, ly = Math.sin(eng.facing) * 2.2;
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(-4.2 + lx, -15 + ly, 2.3, 0, Math.PI * 2); ctx.arc(4.2 + lx, -15 + ly, 2.3, 0, Math.PI * 2); ctx.fill();
  if (wearingUniform && uniform.cap) { rr(-13, -29, 26, 11, 6); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke(); }
  const carrying = heldItem.type !== 'none', reach = carrying ? 20 : 15, spread = carrying ? 0.48 : 0.95;
  const hx1 = Math.cos(eng.facing - spread) * reach, hy1 = Math.sin(eng.facing - spread) * reach;
  const hx2 = Math.cos(eng.facing + spread) * reach, hy2 = Math.sin(eng.facing + spread) * reach;
  ctx.fillStyle = uniform.handsWashed ? '#fef08a' : '#fcd34d'; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(hx1, hy1, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(hx2, hy2, 5.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (carrying) {
    const ix = Math.cos(eng.facing) * 24, iy = Math.sin(eng.facing) * 24 - 2;
    rr(ix - 11, iy - 10, 22, 20, 5); ctx.fillStyle = heldItem.color; ctx.fill(); ctx.strokeStyle = heldItem.accent || '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();
  if (heldItem.type !== 'none') {
    ctx.save(); ctx.font = '700 11px "Plus Jakarta Sans"'; ctx.textAlign = 'center';
    ctx.strokeStyle = '#090d16'; ctx.lineWidth = 3; ctx.strokeText(heldItem.label, eng.px, eng.py + 34);
    ctx.fillStyle = '#fef08a'; ctx.fillText(heldItem.label, eng.px, eng.py + 34); ctx.restore();
  }
}
function drawScooter(x, y, grouped, moving) {
  ctx.save(); ctx.translate(x, y);
  rr(-16, -24, 32, 52, 10); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill();
  rr(-13, -22, 26, 46, 9); ctx.fillStyle = grouped ? '#10b981' : '#f97316'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  rr(-12, 2, 24, 20, 5); ctx.fillStyle = '#dc2626'; ctx.fill(); ctx.strokeStyle = '#fde047'; ctx.stroke();
  if (moving) { ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(-22, -62); ctx.lineTo(22, -62); ctx.lineTo(8, -22); ctx.closePath(); ctx.fillStyle = 'rgba(253,224,71,.28)'; ctx.fill(); }
  ctx.restore();
}
function render(viewW, viewH) {
  ctx.save();
  const zoom = viewW < 680 ? 0.78 : viewW < 1024 ? 0.9 : 1.0;
  const ew = viewW / zoom, eh = viewH / zoom;
  let camX = eng.px - ew / 2, camY = eng.py - eh / 2;
  camX = Math.max(0, Math.min(WORLD_W - ew, camX)); camY = Math.max(0, Math.min(WORLD_H - eh, camY));
  if (ew >= WORLD_W) camX = -(ew - WORLD_W) / 2;
  if (eh >= WORLD_H) camY = -(eh - WORLD_H) / 2;
  const shX = eng.shake > 0 ? (Math.random() - 0.5) * eng.shake * 10 : 0;
  const shY = eng.shake > 0 ? (Math.random() - 0.5) * eng.shake * 10 : 0;
  ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, viewW, viewH);
  ctx.scale(zoom, zoom); ctx.translate(-camX + shX, -camY + shY);

  // Mundo aberto
  ctx.fillStyle = '#1e293b'; ctx.fillRect(24, 24, 702, WORLD_H - 48);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(545, 295, 165, WORLD_H - 319);
  ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4; ctx.setLineDash([22, 18]);
  ctx.beginPath(); ctx.moveTo(627, 315); ctx.lineTo(627, WORLD_H - 40); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#e2e8f0'; for (let i = 0; i < 6; i++) ctx.fillRect(560 + i * 24, 452, 14, 108);
  rr(45, 45, 285, 225, 14); ctx.fillStyle = '#29211c'; ctx.fill(); ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 3; ctx.stroke();
  rr(115, 178, 140, 68, 10); ctx.fillStyle = '#1d4ed8'; ctx.fill();
  ctx.fillStyle = 'rgba(191,219,254,.75)'; ctx.font = '700 13px "Plus Jakarta Sans"'; ctx.fillText('RESIDÊNCIA DO TIC-TAC', 62, 255);
  rr(375, 45, 310, 225, 14); ctx.fillStyle = '#26172c'; ctx.fill(); ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(251,207,232,.8)'; ctx.fillText('LOJA & CAFÉ ESTILO ZERO', 392, 255);
  rr(50, 325, 465, 430, 20); ctx.fillStyle = '#0f2f24'; ctx.fill(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke();
  rr(150, 445, 365, 125, 12); ctx.fillStyle = '#1e3a34'; ctx.fill();
  [{ x: 92, y: 375, r: 28 }, { x: 455, y: 375, r: 26 }, { x: 95, y: 695, r: 30 }, { x: 455, y: 695, r: 27 }].forEach((t) => {
    ctx.beginPath(); ctx.arc(t.x, t.y + 5, t.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fillStyle = '#15803d'; ctx.fill();
    ctx.beginPath(); ctx.arc(t.x - 6, t.y - 6, t.r * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill();
  });
  rr(470, 600, 62, 130, 8); ctx.fillStyle = '#1e293b'; ctx.fill(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#7dd3fc'; ctx.font = '700 11px "Plus Jakarta Sans"'; ctx.fillText('ÔNIBUS', 478, 668);
  rr(50, 800, 475, 295, 16); ctx.fillStyle = profile.ownBusiness.rented ? '#2c1810' : '#1e2430'; ctx.fill();
  ctx.strokeStyle = profile.ownBusiness.rented ? '#f59e0b' : '#64748b'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = profile.ownBusiness.rented ? '#fde68a' : '#cbd5e1'; ctx.font = '800 14px "Plus Jakarta Sans"';
  ctx.fillText(profile.ownBusiness.rented ? '🍕 ' + profile.ownBusiness.name.toUpperCase() + ' (NEGÓCIO PRÓPRIO)' : '🏢 ESPAÇO COMERCIAL DISPONÍVEL P/ ALUGAR (R$ 450)', 72, 836);
  if (profile.ownBusiness.rented) {
    if (profile.ownBusiness.hiredPizzaiolo) drawNpc(210, 1055, '#ef4444', 'Chef Próprio', true);
    if (profile.ownBusiness.hiredAtendente) drawNpc(330, 1055, '#3b82f6', 'Atendente', false);
    if (profile.ownBusiness.hiredAjudante) drawNpc(435, 1055, '#10b981', 'Ajudante', false);
  }

  // Pizzaria
  ctx.fillStyle = '#311b16'; ctx.fillRect(747, 56, 1081, 1049);
  const zones = [
    { x: 747, y: 56, w: 208, h: 210, bg: '#17253b', label: 'VESTIÁRIO' },
    { x: 969, y: 56, w: 186, h: 210, bg: '#132e38', label: 'LAVATÓRIO & PIA' },
    { x: 1169, y: 56, w: 216, h: 210, bg: '#1e1f3b', label: 'ESCRITÓRIO DIGITAL' },
    { x: 1399, y: 56, w: 429, h: 210, bg: '#2c2216', label: 'ESTOQUE, GELADEIRA & FREEZER' },
    { x: 1175, y: 310, w: 653, h: 455, bg: '#1f242d', label: 'COZINHA & ESTAÇÕES DE PREPARO', check: true },
    { x: 747, y: 854, w: 345, h: 251, bg: '#162b2c', label: 'FAXINA & COPA' },
    { x: 1092, y: 854, w: 736, h: 251, bg: '#1b2822', label: 'BEBIDAS, CONFERÊNCIA & EXPEDIÇÃO' },
  ];
  zones.forEach((z) => {
    ctx.fillStyle = z.bg; ctx.fillRect(z.x, z.y, z.w, z.h);
    if (z.check) { ctx.fillStyle = 'rgba(255,255,255,.03)'; const t = 36; for (let tx = z.x; tx < z.x + z.w; tx += t) for (let ty = z.y; ty < z.y + z.h; ty += t) if ((Math.floor(tx / t) + Math.floor(ty / t)) % 2 === 0) ctx.fillRect(tx, ty, Math.min(t, z.x + z.w - tx), Math.min(t, z.y + z.h - ty)); }
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1.5; ctx.strokeRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.font = '800 11px "Plus Jakarta Sans"'; ctx.fillText(z.label, z.x + 14, z.y + z.h - 12);
  });
  rr(752, 462, 86, 92, 10); ctx.fillStyle = '#9a3412'; ctx.fill(); ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fed7aa'; ctx.font = '800 11px "Plus Jakarta Sans"'; ctx.fillText('FORNO', 773, 503); ctx.fillText('ZERO', 778, 519);
  [{ x: 805, y: 725 }, { x: 960, y: 725 }].forEach((t) => { ctx.beginPath(); ctx.arc(t.x, t.y, 26, 0, Math.PI * 2); ctx.fillStyle = '#7c2d12'; ctx.fill(); ctx.strokeStyle = '#fdba74'; ctx.lineWidth = 2; ctx.stroke(); });
  WALLS.forEach((w) => { ctx.fillStyle = w.c || '#1e293b'; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.fillRect(w.x, w.y, w.w, 4); });
  rr(682, 392, 86, 42, 8); ctx.fillStyle = '#ea580c'; ctx.fill(); ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '800 11px "Plus Jakarta Sans"'; ctx.fillText('PIZZARIA', 696, 411); ctx.fillText('ABERTA', 701, 425);

  // Estações
  STATIONS.forEach((st) => {
    const near = nearestStation && nearestStation.id === st.id;
    const pulse = 0.5 + 0.5 * Math.sin(eng.time * 5);
    rr(st.x + 4, st.y + 7, st.w, st.h, 12); ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fill();
    if (near) { rr(st.x - 6, st.y - 6, st.w + 12, st.h + 12, 16); ctx.strokeStyle = 'rgba(251,191,36,' + (0.55 + pulse * 0.45) + ')'; ctx.lineWidth = 4; ctx.stroke(); }
    rr(st.x, st.y, st.w, st.h, 12); ctx.fillStyle = '#1e293b'; ctx.fill(); ctx.strokeStyle = near ? '#fbbf24' : st.color; ctx.lineWidth = 2.5; ctx.stroke();
    rr(st.x + 4, st.y + 4, st.w - 8, 22, 8); ctx.fillStyle = st.color; ctx.fill();
    ctx.font = '18px sans-serif'; ctx.fillText(st.icon, st.x + 10, st.y + 48);
    ctx.fillStyle = '#f8fafc'; ctx.font = '700 11px "Plus Jakarta Sans"';
    ctx.fillText(st.label.split('(')[0].trim().slice(0, 20), st.x + 36, st.y + 45);
    stationDetail(st);
  });

  // NPCs
  drawNpc(975, 455, '#f97316', 'Atendente Bia', false);
  if (!profile.isHiredAsHelper && shiftPhase === 'off_duty') bubble(975, 405, 'Vaga de Ajudante aberta! [E]', '#fbbf24');
  const walkIn = orders.find((o) => o.stage === 'incoming_counter');
  if (walkIn) { drawNpc(845, 595, '#eab308', 'Cliente Balcão', false); bubble(845, 545, 'Quero 1 ' + walkIn.flavor + '! [E]', '#fef08a'); }
  drawNpc(eng.chefX, eng.chefY, '#ef4444', 'Chef Marco', true);
  if (eng.chefSpeech) bubble(eng.chefX, eng.chefY - 52, eng.chefSpeech, '#fed7aa');
  const invite = RECRUITERS.find((i) => !profile.acceptedInvites.includes(i.id) && profile.attributes[i.attr] >= i.min);
  drawNpc(190, 442, '#8b5cf6', 'Agente Orion', false);
  if (invite) bubble(190, 392, 'Convite Especial p/ Tic-Tac! ★', '#ddd6fe');
  const motoY = 995 - eng.scooter * 560;
  if (motoY > 320) drawScooter(668, motoY, eng.scooterGrouped, eng.scooter > 0);
  drawNpc(1745, 925, '#10b981', 'Motoboy Leo', false);

  // Clique / objetivo
  if (eng.clickTarget) { const r = 12 + 4 * Math.sin(eng.time * 10); ctx.beginPath(); ctx.arc(eng.clickTarget.x, eng.clickTarget.y, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(56,189,248,.8)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  const g = screen === 'playing' ? guidance() : null;
  if (g) {
    const ring = 24 + 5 * Math.sin(eng.time * 6);
    ctx.beginPath(); ctx.arc(g.x, g.y, ring, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(250,204,21,.75)'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
    const dx = g.x - eng.px, dy = g.y - eng.py, dist = Math.hypot(dx, dy);
    if (dist > 85) {
      const a = Math.atan2(dy, dx), ax = eng.px + Math.cos(a) * 44, ay = eng.py + Math.sin(a) * 44;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-7, -7); ctx.lineTo(-4, 0); ctx.lineTo(-7, 7); ctx.closePath();
      ctx.fillStyle = '#facc15'; ctx.fill(); ctx.strokeStyle = '#713f12'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
  }

  drawPlayer();

  if (eng.workProg > 0 && eng.workProg < 1) {
    const bw = 64, bh = 10, bx = eng.px - bw / 2, by = eng.py - 48;
    rr(bx, by, bw, bh, 5); ctx.fillStyle = '#0f172a'; ctx.fill();
    rr(bx + 2, by + 2, (bw - 4) * eng.workProg, bh - 4, 4); ctx.fillStyle = '#22c55e'; ctx.fill();
  }

  eng.particles.forEach((p) => {
    ctx.save(); ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color; ctx.strokeStyle = p.color;
    if (p.shape === 'ring') { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.stroke(); }
    else if (p.shape === 'square') ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });
  eng.floats.forEach((f) => {
    const prog = 1 - f.life / f.maxLife, alpha = prog < 0.75 ? 1 : 1 - (prog - 0.75) / 0.25;
    ctx.save(); ctx.globalAlpha = Math.max(0, alpha); ctx.translate(f.x, f.y);
    ctx.font = '800 15px "Fredoka", "Plus Jakarta Sans"'; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(9,13,22,.92)'; ctx.strokeText(f.text, 0, 0);
    ctx.fillStyle = f.color; ctx.fillText(f.text, 0, 0);
    if (f.sub) { ctx.font = '700 11px "Plus Jakarta Sans"'; ctx.strokeText(f.sub, 0, 16); ctx.fillStyle = '#e2e8f0'; ctx.fillText(f.sub, 0, 16); }
    ctx.restore();
  });
  ctx.restore();
}

// ----------------------------- LOOP PRINCIPAL -----------------------------
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
  const dpr = window.devicePixelRatio || 1, rect = canvas.getBoundingClientRect();
  if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) { canvas.width = Math.floor(rect.width * dpr); canvas.height = Math.floor(rect.height * dpr); }

  if (screen === 'playing' && !showTablet && !dialogType) {
    eng.time += dt;
    if (eng.dashT > 0) eng.dashT = Math.max(0, eng.dashT - dt);
    if (eng.dashCd > 0) eng.dashCd = Math.max(0, eng.dashCd - dt);
    if (eng.shake > 0) eng.shake = Math.max(0, eng.shake - dt * 3.2);
    if (eng.scooter > 0) {
      eng.scooter += dt * 0.65;
      if (Math.random() < 0.45) eng.particles.push({ x: 668, y: 995 - eng.scooter * 560 + 25, vx: (Math.random() - 0.5) * 25, vy: 45, size: 5, color: '#cbd5e1', life: 0.35, maxLife: 0.35, shape: 'circle' });
      if (eng.scooter >= 1.15) eng.scooter = 0;
    }

    if (eng.workId && eng.workCb) {
      eng.workProg += dt / eng.workDur;
      if (eng.workProg >= 1) { const cb = eng.workCb; eng.workId = null; eng.workCb = null; eng.workProg = 0; cb(); }
    } else {
      let mx = eng.joy.x, my = eng.joy.y;
      if (eng.keys.has('KeyW') || eng.keys.has('ArrowUp')) my -= 1;
      if (eng.keys.has('KeyS') || eng.keys.has('ArrowDown')) my += 1;
      if (eng.keys.has('KeyA') || eng.keys.has('ArrowLeft')) mx -= 1;
      if (eng.keys.has('KeyD') || eng.keys.has('ArrowRight')) mx += 1;
      if (mx !== 0 || my !== 0) { eng.clickTarget = null; const l = Math.hypot(mx, my); mx /= l; my /= l; }
      else if (eng.clickTarget) {
        const dx = eng.clickTarget.x - eng.px, dy = eng.clickTarget.y - eng.py, dist = Math.hypot(dx, dy);
        if (dist < 16) { const auto = eng.clickTarget.auto; eng.clickTarget = null; if (auto) { const s = stById(auto); if (s) interact(s); } }
        else { mx = dx / dist; my = dy / dist; }
      }
      const shoes = profile.ownedItems.includes('tenis_turbo');
      const agBoost = 1 + (profile.attributes.agilidade - 1) * 0.07 + (shoes ? 0.18 : 0);
      const fatPen = profile.conditions.cansaco > 80 ? 0.82 : 1;
      const top = 255 * agBoost * fatPen * (eng.dashT > 0 ? 1.95 : 1);
      eng.vx = mx * top; eng.vy = my * top;
      if (mx !== 0 || my !== 0) eng.facing = Math.atan2(my, mx);
      const np = resolvePos(eng.px + eng.vx * dt, eng.py + eng.vy * dt);
      eng.px = np.x; eng.py = np.y;
    }
    nearestStation = nearestStationAt(eng.px, eng.py, 108);

    if (shiftPhase === 'operation') {
      if (metrics.timeRemaining - dt <= 0) { shiftPhase = 'closing'; banner = '🔔 FIM DO HORÁRIO! Higienize a Expedição e bata o ponto de saída!'; sfx.clock(); metrics.timeRemaining = 0; }
      else { metrics.timeRemaining -= dt; metrics.activeEventT = Math.max(0, metrics.activeEventT - dt); if (metrics.activeEventT <= 0) metrics.activeEvent = null; }

      eng.orderTimer -= dt;
      if (eng.orderTimer <= 0 && orders.length < 5) {
        const existNb = orders[0] ? orders[0].neighborhood : null;
        spawnOrder(undefined, existNb && Math.random() < 0.55 ? existNb : undefined, false);
        eng.orderTimer = Math.max(12, 19 - profile.day * 0.6);
      }
      eng.eventTimer -= dt;
      if (eng.eventTimer <= 0) {
        eng.eventTimer = 34;
        if (Math.random() < 0.45) {
          const nb = NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
          spawnOrder(false, nb, true); spawnOrder(false, nb, false);
          metrics.activeEvent = '🔥 PICO NO ' + nb.toUpperCase() + '! Agrupe os 2 pedidos na Expedição!'; metrics.activeEventT = 11;
        } else { metrics.dirtyCounter = true; metrics.activeEvent = '🧼 EVENTO DINÂMICO: Higienização solicitada na Mesa de Expedição!'; metrics.activeEventT = 9; }
      }
      eng.condTimer -= dt;
      if (eng.condTimer <= 0) {
        eng.condTimer = 3.5;
        const rf = Math.max(0.45, 1 - (profile.attributes.resistencia - 1) * 0.12);
        if (profile.conditions.satisfacao <= 0) finalizeShift(true, 'A satisfação operacional da pizzaria caiu a zero devido a atrasos graves.');
        else {
          profile.conditions.cansaco = Math.min(98, profile.conditions.cansaco + 1.4 * rf);
          profile.conditions.fome = Math.min(95, profile.conditions.fome + 1.0 * rf);
          profile.conditions.estresse = Math.min(95, profile.conditions.estresse + (orders.length >= 4 ? 1.8 : 0.7) * rf);
        }
      }
      if (eng.chefSpeechT > 0) { eng.chefSpeechT -= dt; if (eng.chefSpeechT <= 0) eng.chefSpeech = null; }

      const baking = orders.find((o) => o.stage === 'in_kitchen');
      if (baking) {
        const targetX = baking.bake > 45 ? 1580 : 1355;
        eng.chefX += (targetX - eng.chefX) * Math.min(1, dt * 4);
        const hasPrep = (baking.flavor === 'Calabresa' && stock.prepCalabresa > 0) || (baking.flavor === 'Mussarela' && stock.prepMussarela > 0) || (baking.flavor === 'Marguerita' && stock.prepMussarela > 0 && stock.prepVeggies > 0) || (baking.flavor === 'Catupiry Suprema' && stock.prepCatupiry > 0);
        if (!hasPrep) {
          if (!eng.chefSpeech) { eng.chefSpeech = baking.flavor === 'Calabresa' ? 'Cadê a calabresa fatiada que pedi?! 🥩' : baking.flavor === 'Catupiry Suprema' ? 'Preciso de mais porções de Catupiry! 🥣' : 'Preciso de mussarela e tomate/cebola! 🧀'; eng.chefSpeechT = 3.0; }
        } else {
          const nb = baking.bake + dt * 16.5;
          if (nb >= 100) {
            if (baking.flavor === 'Calabresa') stock.prepCalabresa = Math.max(0, stock.prepCalabresa - 1);
            if (baking.flavor === 'Mussarela' || baking.flavor === 'Marguerita') stock.prepMussarela = Math.max(0, stock.prepMussarela - 1);
            if (baking.flavor === 'Marguerita') stock.prepVeggies = Math.max(0, stock.prepVeggies - 1);
            if (baking.flavor === 'Catupiry Suprema') stock.prepCatupiry = Math.max(0, stock.prepCatupiry - 1);
            baking.stage = 'ready_oven'; baking.bake = 100; sfx.oven();
            eng.chefSpeech = baking.needsDrink ? 'Pizza #' + baking.id + ' pronta! Confere a bebida! 🥤' : 'Saindo Pizza #' + baking.id + ' quentinha no forno! 🍕';
            eng.chefSpeechT = 4.0;
          } else baking.bake = nb;
        }
      }
      const expiring = orders.filter((o) => o.timer - dt <= 0).length;
      orders.forEach((o) => { o.timer -= dt; });
      orders = orders.filter((o) => o.timer > 0);
      if (expiring > 0) {
        sfx.error(); shake(0.9); eng.chefSpeech = 'Esse pedido atrasou demais! Cuidado! ⚠️'; eng.chefSpeechT = 3.5;
        metrics.mistakes += expiring; metrics.combo = 0;
        const ns = Math.max(0, profile.conditions.satisfacao - expiring * 26);
        profile.conditions.satisfacao = ns;
        if (ns <= 0) finalizeShift(true, 'Vários clientes cancelaram pedidos por atraso na operação!');
      }
    }

    eng.particles = eng.particles.map((p) => ({ x: p.x + p.vx * dt, y: p.y + p.vy * dt, life: p.life - dt, maxLife: p.maxLife, size: p.size, color: p.color, shape: p.shape, vx: p.vx, vy: p.vy })).filter((p) => p.life > 0);
    eng.floats = eng.floats.map((f) => ({ id: f.id, x: f.x, y: f.y - 26 * dt, text: f.text, sub: f.sub, color: f.color, life: f.life - dt, maxLife: f.maxLife })).filter((f) => f.life > 0);
  }

  ctx.save(); ctx.scale(dpr, dpr); render(rect.width, rect.height); ctx.restore();
  updateHUD();
  requestAnimationFrame(frame);
}

// ----------------------------- HUD / TELAS -----------------------------
const $ = (id) => document.getElementById(id);
function fmtTime(s) { const m = Math.floor(s / 60), ss = Math.floor(s % 60); return m + ':' + String(ss).padStart(2, '0'); }
function updateHUD() {
  if (screen !== 'playing') return;
  $('hudMoney').textContent = 'R$ ' + profile.money;
  $('hudDay').textContent = 'Dia ' + profile.day;
  const fat = $('hudFatigue'); fat.textContent = Math.round(profile.conditions.cansaco) + '%'; fat.className = profile.conditions.cansaco > 75 ? 'bad' : 'ok';
  const sat = $('hudSat'); sat.textContent = Math.round(profile.conditions.satisfacao) + '%'; sat.className = profile.conditions.satisfacao < 40 ? 'bad' : 'ok';
  const g = guidance();
  $('guidanceText').textContent = g ? g.label : 'Explore o Universo Zero livremente!';
  const ev = metrics.activeEvent || banner;
  $('eventBanner').classList.toggle('hidden', !ev);
  if (ev) $('eventText').textContent = ev;
  $('shiftCard').classList.toggle('hidden', shiftPhase === 'off_duty');
  $('hudTimer').textContent = shiftPhase === 'closing' ? 'FECHAMENTO' : fmtTime(metrics.timeRemaining);
  $('hudScore').textContent = metrics.shiftScore + ' pts';
  $('hudCombo').classList.toggle('hidden', metrics.combo <= 1);
  $('hudCombo').textContent = '🔥 ' + metrics.combo + 'x';
  const panel = $('ordersPanel');
  panel.innerHTML = orders.slice(0, 4).map((o) => {
    const pct = Math.max(0, (o.timer / o.maxTimer) * 100);
    const badge = o.stage === 'incoming_digital' ? '💻 App PC' : o.stage === 'incoming_counter' ? '🙋 Balcão' : o.stage === 'in_kitchen' ? '🔥 Forno ' + Math.floor(o.bake) + '%' : o.stage === 'ready_oven' ? '🍕 Retirar!' : '📦 Na Expedição';
    const col = pct < 30 ? '#f43f5e' : pct < 60 ? '#fbbf24' : '#34d399';
    return '<div class="order-card"><div class="oc-top"><span>#' + o.id + ' ' + o.flavor + (o.needsDrink ? ' 🥤' : '') + '</span><span class="oc-badge">' + badge + '</span></div><div class="oc-mid"><span>📦 ' + o.neighborhood + '</span><span>' + Math.ceil(o.timer) + 's</span></div><div class="oc-bar"><div style="width:' + pct + '%;background:' + col + '"></div></div></div>';
  }).join('');
  const btn = $('btnInteract');
  if (nearestStation) { btn.disabled = false; btn.classList.add('ready'); btn.textContent = nearestStation.icon + ' [E] ' + nearestStation.label.split('(')[0].trim(); }
  else { btn.disabled = true; btn.classList.remove('ready'); btn.textContent = '✋ Aproxime-se p/ Interagir'; }
}
function showScreen() {
  $('startScreen').classList.toggle('hidden', screen !== 'start');
  $('pauseScreen').classList.toggle('hidden', screen !== 'paused');
  $('summary').classList.toggle('hidden', !(screen === 'summary' || screen === 'gameover'));
  $('hud').classList.toggle('hidden', screen !== 'playing');
  if (screen === 'start') renderStart();
}
function renderStart() {
  const total = Object.values(profile.attributes).reduce((a, b) => a + b, 0);
  $('pcDay').textContent = 'Dia ' + profile.day;
  $('pcMoney').textContent = 'R$ ' + profile.money;
  $('pcLevel').textContent = 'Nível Total: ' + total;
  $('pcStatus').textContent = profile.isHiredAsHelper ? 'Contratado ✓' : 'Em busca de vaga';
  $('scoresList').innerHTML = scores.map((e, i) => {
    const rc = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
    return '<div class="score-row' + (i === 0 ? ' first' : '') + '"><div class="score-left"><span class="rank ' + rc + '">#' + (i + 1) + '</span><div><div class="score-name">' + e.playerName + ' <span class="rating">Nota ' + e.rating + '</span></div><div class="score-sub">' + e.ordersDelivered + ' entregas • R$ ' + e.earnings + ' recebidos</div></div></div><div><div class="score-pts">' + e.score.toLocaleString('pt-BR') + ' pts</div><div class="score-date">' + e.date + '</div></div></div>';
  }).join('');
}
function renderSummary() {
  if (!summaryData) return;
  const d = summaryData, penalty = metrics.mistakes * 12, routeBonus = metrics.groupedRoutes * 35;
  const earnedBase = d.isGameOver ? Math.round(140 * 0.35) : 140;
  $('summaryHead').className = 'summary-head ' + (d.isGameOver ? 'bad' : 'good');
  $('summaryHead').innerHTML = '<div style="display:flex;align-items:center;gap:14px"><span style="font-size:34px">' + (d.isGameOver ? '⚠️' : '✅') + '</span><div><small>' + (d.isGameOver ? 'Expediente Interrompido' : 'Seção 18 • Avaliação e Remuneração') + '</small><h2>' + (d.isGameOver ? 'Caos Operacional na Pizzaria!' : 'Expediente Concluído com Sucesso!') + '</h2></div></div><div><small style="display:block;text-align:right">Avaliação</small><div class="big-rating' + (d.isGameOver ? ' bad' : '') + '">' + (d.isGameOver ? 'D' : d.rating) + '</div></div>';
  let html = '';
  if (d.isGameOver && d.reason) html += '<div class="notice rose"><b>Motivo:</b> ' + d.reason + ' Você ainda recebe proporcionalmente pelo que produziu ou pode reiniciar o turno imediatamente!</div>';
  if (d.isNewHigh && !d.isGameOver) html += '<div class="notice amber">🏆 <b>NOVO RECORDE NO RANKING LOCAL DO ESTÚDIO DE PROFISSÕES!</b></div>';
  html += '<div class="metric-grid">' +
    '<div class="metric"><small>Pontuação</small><b style="color:#fcd34d">' + metrics.shiftScore.toLocaleString('pt-BR') + '</b></div>' +
    '<div class="metric"><small>Pedidos Expedidos</small><b>' + metrics.ordersDispatched + '</b></div>' +
    '<div class="metric"><small>Rotas Agrupadas</small><b style="color:#34d399">' + metrics.groupedRoutes + '</b></div>' +
    '<div class="metric"><small>Combo Máximo</small><b style="color:#7dd3fc">' + metrics.maxCombo + 'x</b></div></div>';
  html += '<div class="card"><h4 style="color:#34d399;margin-bottom:8px">💵 Demonstrativo de Pagamento</h4>' +
    '<div class="pay-row"><span>Salário Combinado (' + (d.isGameOver ? 'Proporcional' : 'Integral') + ')</span><span class="mono">+ R$ ' + earnedBase + '</span></div>' +
    '<div class="pay-row"><span>Gorjetas de Pedidos & Preparações (' + metrics.prepDone + ' lotes)</span><span class="mono pos">+ R$ ' + metrics.tips + '</span></div>' +
    '<div class="pay-row"><span>Bônus de Agrupamento de Rotas (' + metrics.groupedRoutes + 'x)</span><span class="mono pos">+ R$ ' + routeBonus + '</span></div>' +
    (penalty > 0 ? '<div class="pay-row"><span class="neg">Penalidades por atrasos/falhas (' + metrics.mistakes + 'x)</span><span class="mono neg">- R$ ' + penalty + '</span></div>' : '') +
    '<div class="pay-row total"><span>Valor Total Creditado ao Tic-Tac</span><span class="mono" style="color:#34d399;font-size:20px">+ R$ ' + d.finalPay + '</span></div>' +
    '<div style="text-align:right;font-size:11px;color:#94a3b8">Novo Saldo na Carteira: <b style="color:#fff">R$ ' + profile.money + '</b></div></div>';
  html += '<div class="card"><h4 style="color:#7dd3fc;margin-bottom:8px">📈 XP de Atributos Adquirido neste Turno</h4><div class="xp-chips">' +
    Object.entries(metrics.attrGains).map(([k, v]) => '<span class="xp-chip">' + k + ': <b>+' + Math.round(v) + ' XP</b></span>').join('') + '</div></div>';
  html += '<div class="summary-actions"><button class="btn-primary" id="btnReturnWorld">🧭 Retornar ao Mundo Aberto (Continuar Vida)</button><button class="btn-secondary" id="btnNewShift">↺ Novo Turno Imediato [R]</button></div>';
  $('summaryBody').innerHTML = html;
  $('btnReturnWorld').onclick = () => { eng.px = 645; eng.py = 505; screen = 'playing'; showScreen(); };
  $('btnNewShift').onclick = () => { hireHelper(); prepareNewShift(true); screen = 'playing'; showScreen(); };
}

// ----------------------------- TIC-PAD -----------------------------
function renderTablet(tab) {
  $('tabletSub').innerHTML = profile.name + ' • Dia ' + profile.day + ' • Carteira: <b style="color:#34d399">R$ ' + profile.money + '</b>';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  let html = '';
  if (tab === 'attrs') {
    html += '<div><div class="sec-title" style="color:#fbbf24">🏅 Atributos Profissionais Permanentes (Seção 15)</div><div class="grid-2">' +
      ATTR_META.map((a) => '<div class="card"><div class="attr-row"><span>' + a.label + '</span><span class="attr-lvl">Nv. ' + profile.attributes[a.key] + '</span></div><p>' + a.desc + '</p><div class="xp-bar"><div style="width:' + Math.min(100, profile.attributeXp[a.key]) + '%;background:' + a.color + '"></div></div><div class="xp-num">XP: ' + Math.floor(profile.attributeXp[a.key]) + ' / 100</div></div>').join('') + '</div></div>';
    html += '<div><div class="sec-title" style="color:#7dd3fc">🌡️ Condições Temporárias do Personagem (Seção 16)</div><div class="cond-grid">' +
      [['Cansaço', profile.conditions.cansaco, true], ['Fome', profile.conditions.fome, true], ['Estresse', profile.conditions.estresse, true], ['Moral', profile.conditions.moral, false], ['Satisfação', profile.conditions.satisfacao, false]].map((c) => {
        const ok = c[2] ? c[1] < 60 : c[1] > 45;
        return '<div class="cond-box"><small>' + c[0] + '</small><b style="color:' + (ok ? '#34d399' : '#fb7185') + '">' + Math.round(c[1]) + '%</b></div>';
      }).join('') + '</div></div>';
  } else if (tab === 'clothes') {
    if (wearingUniform) html += '<div class="notice amber">Você está usando o <b>Uniforme Operacional da Pizzaria</b>. Ao bater o ponto de saída, o Tic-Tac retorna à roupa pessoal abaixo!</div>';
    html += '<div><div class="sec-title" style="color:#fb923c">👕 Guarda-Roupa do Tic-Tac (Sistema Compartilhado)</div><div class="grid-2">' +
      Object.entries(OUTFITS).map(([id, o]) => {
        const unlocked = profile.unlockedOutfits.includes(id), sel = profile.streetOutfit === id;
        return '<div class="card outfit-row"><div style="display:flex;gap:10px;align-items:center"><span class="swatch" style="background:' + o.body + '"></span><div><h4>' + o.name + '</h4><p>' + o.desc + '</p></div></div>' +
          (unlocked ? '<button class="' + (sel ? 'btn-orange' : 'btn-dark') + '" data-outfit="' + id + '" style="width:auto;margin:0">' + (sel ? 'Em Uso' : 'Vestir') + '</button>' : '<span class="mono" style="font-size:12px;color:#94a3b8">Loja: R$ ' + o.price + '</span>') + '</div>';
      }).join('') + '</div></div>';
    html += '<div><div class="sec-title" style="color:#34d399">🎒 Objetos e Equipamentos no Inventário</div>' +
      (profile.ownedItems.length === 0 ? '<div class="notice sky">Nenhum acessório permanente ainda. Visite a <b>Loja Estilo Zero</b> no mundo aberto para comprar Tênis Aero, Luvas Táteis e Organizador Térmico!</div>'
        : '<div class="grid-2">' + profile.ownedItems.map((iid) => { const it = SHOP_ITEMS.find((i) => i.id === iid); return it ? '<div class="card" style="border-color:rgba(16,185,129,.4)"><h4 style="color:#6ee7b7">' + it.name + '</h4><p>' + it.desc + '</p></div>' : ''; }).join('') + '</div>') + '</div>';
  } else if (tab === 'career') {
    html += '<div class="sec-title" style="color:#fbbf24">💼 Carteira e Histórico Profissional (Seção 3 & 19)</div>';
    if (!profile.careerHistory.length) html += '<div class="notice sky">O Tic-Tac ainda não assinou contrato. Converse com a <b>Atendente Bia</b> na Pizzaria Forno Zero para iniciar sua carreira!</div>';
    html += profile.careerHistory.map((r) => '<div class="card outfit-row"><div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="font-family:Fredoka">' + r.role + '</b><span style="background:rgba(16,185,129,.2);color:#6ee7b7;border-radius:99px;padding:2px 10px;font-size:10px;font-weight:800">' + (r.active ? 'VÍNCULO ATIVO' : 'CONCLUÍDO') + '</span></div><p>Empregador: <b style="color:#e2e8f0">' + r.employer + '</b> • Contratado no Dia ' + r.hiredDay + '</p></div><div style="display:flex;gap:16px;font-size:12px;text-align:right"><div><div style="color:#94a3b8">Salário Base</div><b class="mono" style="color:#34d399">R$ ' + r.baseSalary + '/turno</b></div><div><div style="color:#94a3b8">Expedientes</div><b class="mono">' + r.shiftsCompleted + ' (Melhor: ' + r.bestRating + ')</b></div></div></div>').join('');
    if (profile.ownBusiness.rented) html += '<div class="notice amber">🍕 <b>Empreendimento Próprio: ' + profile.ownBusiness.name + '</b><br>Nível: ' + profile.ownBusiness.level + ' • Estoque: ' + profile.ownBusiness.stockLevel + '% • Caixa: R$ ' + profile.ownBusiness.dailyRevenueAccumulated + '</div>';
  } else {
    html += '<div class="arch-grid"><div class="arch-box sky"><h4>Camada Compartilhada • Universo Zero</h4><ul><li>Personagem persistente Tic-Tac & Mãos Articuladas</li><li>Circulação contínua Mundo Aberto ↔ Estabelecimento</li><li>Sistema unificado de Vestimentas (Casual + Uniforme)</li><li>6 Atributos permanentes + 5 Condições temporárias</li><li>Carteira financeira, Loja, Casa e Empreendedorismo</li><li>Recrutamento especial por perfil de atributos</li></ul></div>' +
      '<div class="arch-box orange"><h4>Módulo Profissional • Ajudante de Pizzaria</h4><ul><li>Relógio de Ponto, Vestiário (Avental/Touca) e Pia</li><li>Conferência de Estoque, Fatiador, Ralador e Processador</li><li>Central Digital de Pedidos + Atendimento no Balcão</li><li>Cooperação reativa com o Pizzaiolo (Chef Marco)</li><li>Mesa de Conferência, Bebidas, Embalagem e Etiquetas</li><li>Agrupamento Inteligente de Rotas com Motoboy</li></ul></div></div>';
  }
  $('tabletBody').innerHTML = html;
  $('tabletBody').querySelectorAll('[data-outfit]').forEach((b) => { b.onclick = () => { profile.streetOutfit = b.dataset.outfit; saveProfile(); renderTablet('clothes'); }; });
}

// ----------------------------- DIÁLOGOS -----------------------------
function openDialog(type) { dialogType = type; dialogView = 'main'; $('dialog').classList.remove('hidden'); renderDialog(); }
function closeDialog() { dialogType = null; $('dialog').classList.add('hidden'); }
function renderDialog() {
  const body = $('dialogBody');
  if (dialogType === 'attendant') {
    $('dialogIcon').textContent = '🍕'; $('dialogTitle').textContent = 'Atendente Bia • Pizzaria Forno Zero';
    $('dialogSub').textContent = '“Olá, ' + profile.name + '! Bem-vindo à melhor pizzaria do Bairro Central!”';
    if (dialogView === 'main') {
      let html = '<p style="font-size:13px;color:#cbd5e1">Como deseja interagir no estabelecimento hoje? (Carteira: <b class="mono" style="color:#34d399">R$ ' + profile.money + '</b>)</p>';
      if (profile.isHiredAsHelper) html += '<button class="btn-green" id="dStartShift" style="width:100%;text-align:left">⏱️ <b>Iniciar Expediente de Ajudante Agora</b><br><small>Dirija-se ao Relógio de Ponto para bater sua entrada!</small></button>';
      html += '<div class="grid-2"><button class="card" id="dMenu" style="text-align:left;color:#fff"><h4>🍽️ 1. Cardápio, Pedidos & Promoções</h4><p>Consumir fatias artesanais e bebidas como cliente.</p></button>' +
        '<button class="card" id="dVac" style="text-align:left;color:#fff;border-color:rgba(251,191,36,.45)"><h4>💼 2. Oportunidades de Emprego</h4><p>' + (profile.isHiredAsHelper ? 'Consultar quadro dinâmico de funções da pizzaria.' : 'Há 1 vaga aberta de Ajudante de Pizzaria! Candidate-se.') + '</p></button></div>';
      body.innerHTML = html;
      const ss = $('dStartShift'); if (ss) ss.onclick = () => { closeDialog(); prepareNewShift(false); };
      $('dMenu').onclick = () => { dialogView = 'menu'; renderDialog(); };
      $('dVac').onclick = () => { dialogView = 'vacancies'; renderDialog(); };
    } else if (dialogView === 'menu') {
      body.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:Fredoka;color:#fcd34d">Cardápio & Promoções Forno Zero</h3><button class="link-btn" id="dBack">← Voltar</button></div><div class="grid-2">' +
        [{ name: 'Fatia Calabresa Artesanal', cost: 12, hunger: 40, morale: 15, desc: 'Massa crocante + brinde adesivo (-40 Fome, +15 Moral).' }, { name: 'Combo Fatia Catupiry + Zero-Cola', cost: 18, hunger: 65, morale: 25, desc: 'Promoção do dia! (-65 Fome, +25 Moral).' }].map((p, i) =>
          '<div class="card"><h4>' + p.name + '</h4><p>' + p.desc + '</p><button class="btn-orange" data-buy="' + i + '"' + (profile.money < p.cost ? ' disabled' : '') + '>Pedir Agora • R$ ' + p.cost + '</button></div>').join('') + '</div>';
      $('dBack').onclick = () => { dialogView = 'main'; renderDialog(); };
      body.querySelectorAll('[data-buy]').forEach((b) => { b.onclick = () => {
        const prods = [{ cost: 12, hunger: 40, morale: 15, name: 'Fatia Calabresa Artesanal' }, { cost: 18, hunger: 65, morale: 25, name: 'Combo Catupiry + Zero-Cola' }];
        const p = prods[+b.dataset.buy];
        profile.money -= p.cost; profile.conditions.fome = Math.max(0, profile.conditions.fome - p.hunger); profile.conditions.moral = Math.min(100, profile.conditions.moral + p.morale);
        sfx.cash(); floatText(eng.px, eng.py - 30, 'Consumiu ' + p.name + '!', '#fde047'); saveProfile(); closeDialog();
      }; });
    } else if (dialogView === 'vacancies') {
      body.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-family:Fredoka;color:#fcd34d">Quadro Dinâmico de Vagas (Seção 2.2)</h3><button class="link-btn" id="dBack">← Voltar</button></div>' +
        VACANCIES.map((v) => '<div class="card outfit-row" style="' + (v.available ? 'border-color:rgba(16,185,129,.45)' : 'opacity:.75') + '"><div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>' + v.title + '</b><span style="border-radius:99px;padding:2px 10px;font-size:10px;font-weight:800;' + (v.available ? 'background:#10b981;color:#022c22' : 'background:#1e293b;color:#94a3b8') + '">' + (v.available ? 'VAGA DISPONÍVEL' : v.hours) + '</span></div><p>Salário: <b style="color:#34d399">R$ ' + v.salary + '</b> + bônus • Req: ' + v.req + '</p></div>' +
          (v.available ? '<button class="btn-amber" data-vac="' + v.id + '" style="width:auto;margin:0">' + (profile.isHiredAsHelper ? 'Ver Contrato' : 'Candidatar-se') + '</button>' : '') + '</div>').join('');
      $('dBack').onclick = () => { dialogView = 'main'; renderDialog(); };
      body.querySelectorAll('[data-vac]').forEach((b) => { b.onclick = () => { dialogVacancy = VACANCIES.find((v) => v.id === b.dataset.vac); dialogView = 'contract'; renderDialog(); }; });
    } else if (dialogView === 'contract') {
      const v = dialogVacancy;
      body.innerHTML = '<div class="card" style="border-color:rgba(251,191,36,.35)"><div style="font-size:11px;font-weight:800;text-transform:uppercase;color:#fbbf24">Proposta Oficial de Contratação (Seção 3)</div><h3 style="font-family:Fredoka;font-size:20px;margin-top:6px">' + v.title + ' — Pizzaria Forno Zero</h3><p>' + v.desc + '</p><div class="grid-3" style="margin-top:10px"><div class="card"><small style="color:#94a3b8">Remuneração Base</small><b class="mono" style="color:#34d399;display:block">R$ ' + v.salary + ' + Gorjetas</b></div><div class="card"><small style="color:#94a3b8">Jornada</small><b style="display:block">' + v.hours + '</b></div><div class="card"><small style="color:#94a3b8">Regras</small><b style="color:#fcd34d;display:block">Ponto + Uniforme + Pia</b></div></div></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn-green" id="dAccept" style="flex:1">✅ ' + (profile.isHiredAsHelper ? 'Confirmar e Ir para o Relógio de Ponto!' : 'Aceitar Vaga e Iniciar Turno!') + '</button><button class="btn-dark" id="dRefuse">Recusar / Voltar</button></div>';
      $('dAccept').onclick = () => { hireHelper(); closeDialog(); };
      $('dRefuse').onclick = () => { dialogView = 'vacancies'; renderDialog(); };
    }
  } else if (dialogType === 'home') {
    $('dialogIcon').textContent = '🏠'; $('dialogTitle').textContent = 'Residência do Tic-Tac';
    $('dialogSub').textContent = 'Seu lar no Universo Zero: recupere energias e escolha sua roupa pessoal.';
    body.innerHTML = '<div class="card outfit-row" style="border-color:rgba(56,189,248,.35)"><div><h4>Descansar em Casa</h4><p>Recupera 100% do Cansaço e Estresse e restaura a Moral.</p></div><button class="btn-orange" id="dRest" style="width:auto;margin:0">Dormir / Descansar</button></div>' +
      '<div><div class="sec-title" style="color:#94a3b8">Trocar Roupa Pessoal</div><div class="grid-2">' +
      profile.unlockedOutfits.map((oid) => { const o = OUTFITS[oid], act = profile.streetOutfit === oid; return '<button class="card outfit-row" data-outfit="' + oid + '" style="text-align:left;color:#fff;' + (act ? 'border-color:#38bdf8' : '') + '"><span style="display:flex;gap:10px;align-items:center"><span class="swatch" style="background:' + o.body + ';height:28px;width:28px"></span><b>' + o.name + '</b></span><span style="color:#7dd3fc;font-size:11px">' + (act ? 'Vestindo ✓' : 'Usar') + '</span></button>'; }).join('') + '</div></div>';
    $('dRest').onclick = () => { profile.day += 1; profile.conditions = { cansaco: 0, fome: Math.min(25, profile.conditions.fome), estresse: 0, moral: 100, satisfacao: 100 }; sfx.level(); floatText(eng.px, eng.py - 30, 'Energias 100% Renovadas em Casa!', '#38bdf8'); saveProfile(); closeDialog(); };
    body.querySelectorAll('[data-outfit]').forEach((b) => { b.onclick = () => { profile.streetOutfit = b.dataset.outfit; saveProfile(); renderDialog(); }; });
  } else if (dialogType === 'shop') {
    $('dialogIcon').textContent = '🛍️'; $('dialogTitle').textContent = 'Loja & Café Estilo Zero';
    $('dialogSub').innerHTML = 'Saldo disponível: <b class="mono" style="color:#34d399">R$ ' + profile.money + '</b>';
    body.innerHTML = '<div><div class="sec-title" style="color:#f472b6">☕ Lanches, Café & Equipamentos Profissionais</div><div class="grid-2">' +
      SHOP_ITEMS.map((it) => { const owned = !it.consumable && profile.ownedItems.includes(it.id); return '<div class="card"><h4>' + it.name + '</h4><p>' + it.desc + '</p><button class="btn-orange" data-item="' + it.id + '"' + (owned || profile.money < it.price ? ' disabled' : '') + '>' + (owned ? 'Já Adquirido ✓' : 'Comprar • R$ ' + it.price) + '</button></div>'; }).join('') + '</div></div>' +
      '<div><div class="sec-title" style="color:#fbbf24">👕 Coleção de Roupas Universo Zero</div><div class="grid-3">' +
      Object.entries(OUTFITS).filter(([k]) => k !== 'casual_azul').map(([oid, o]) => { const un = profile.unlockedOutfits.includes(oid); return '<div class="card"><div style="display:flex;gap:8px;align-items:center"><span class="swatch" style="background:' + o.body + ';height:26px;width:26px"></span><b style="font-size:12px">' + o.name + '</b></div><button class="btn-amber" data-outfitbuy="' + oid + '"' + (un || profile.money < o.price ? ' disabled' : '') + '>' + (un ? 'No Guarda-Roupa ✓' : 'R$ ' + o.price) + '</button></div>'; }).join('') + '</div></div>';
    body.querySelectorAll('[data-item]').forEach((b) => { b.onclick = () => {
      const it = SHOP_ITEMS.find((i) => i.id === b.dataset.item); if (!it || profile.money < it.price) return;
      sfx.cash(); profile.money -= it.price;
      if (it.consumable) {
        if (it.id === 'espresso_zero') { profile.conditions.cansaco = Math.max(0, profile.conditions.cansaco - 40); profile.conditions.estresse = Math.max(0, profile.conditions.estresse - 20); }
        if (it.id === 'lanche_artesanal') profile.conditions.fome = Math.max(0, profile.conditions.fome - 55);
        profile.conditions.moral = Math.min(100, profile.conditions.moral + 22);
      } else profile.ownedItems.push(it.id);
      saveProfile(); renderDialog();
    }; });
    body.querySelectorAll('[data-outfitbuy]').forEach((b) => { b.onclick = () => {
      const oid = b.dataset.outfitbuy, o = OUTFITS[oid]; if (profile.money < o.price) return;
      sfx.cash(); profile.money -= o.price; profile.streetOutfit = oid; profile.unlockedOutfits.push(oid); saveProfile(); renderDialog();
    }; });
  } else if (dialogType === 'own_business') {
    $('dialogIcon').textContent = '🏢'; $('dialogTitle').textContent = profile.ownBusiness.rented ? profile.ownBusiness.name : 'Imóvel Comercial — Avenida Zero';
    $('dialogSub').textContent = 'Evolução Econômica & Empreendedorismo (Seção 20) • Saldo: R$ ' + profile.money;
    const b = profile.ownBusiness;
    if (!b.rented) {
      body.innerHTML = '<div class="notice amber" style="padding:20px"><h3 style="font-family:Fredoka;font-size:20px">Abra sua Própria Pizzaria no Universo Zero!</h3><p style="margin-top:8px">Use o dinheiro e a experiência adquiridos como Ajudante para alugar este ponto, contratar equipe, abastecer estoque e lucrar como empresário!</p></div>' +
        '<button class="btn-amber" id="dRent"' + (profile.money < 450 ? ' disabled' : '') + '>' + (profile.money >= 450 ? '🔑 Alugar Espaço Comercial Agora • R$ 450' : 'Economize mais R$ ' + (450 - profile.money) + ' trabalhando para alugar (Total: R$ 450)') + '</button>';
      const r = $('dRent'); if (r) r.onclick = () => { sfx.level(); profile.money -= 450; b.rented = true; b.stockLevel = 70; b.totalInvested = 450; saveProfile(); renderDialog(); };
    } else {
      const team = [b.hiredPizzaiolo, b.hiredAtendente, b.hiredAjudante].filter(Boolean).length;
      body.innerHTML = '<div class="metric-grid"><div class="metric"><small>Estoque</small><b style="color:#fcd34d">' + b.stockLevel + '%</b></div><div class="metric"><small>Equipe Ativa</small><b style="color:#7dd3fc">' + team + ' / 3</b></div><div class="metric"><small>Vendas no Caixa</small><b style="color:#34d399">R$ ' + b.dailyRevenueAccumulated + '</b></div></div>' +
        '<div class="grid-2">' +
        '<div class="card"><h4>👨‍🍳 Contratar Pizzaiolo • R$ 150</h4><p>' + (b.hiredPizzaiolo ? 'Contratado e produzindo!' : 'Essencial para assar pizzas e gerar vendas.') + '</p><button class="btn-orange" data-biz="pizzaiolo"' + (b.hiredPizzaiolo || profile.money < 150 ? ' disabled' : '') + '>Contratar</button></div>' +
        '<div class="card"><h4>💬 Contratar Atendente • R$ 110</h4><p>' + (b.hiredAtendente ? 'Contratado no balcão!' : 'Aumenta o faturamento por turno em +60%.') + '</p><button class="btn-orange" data-biz="atendente"' + (b.hiredAtendente || profile.money < 110 ? ' disabled' : '') + '>Contratar</button></div>' +
        '<div class="card"><h4>🔪 Contratar Ajudante • R$ 100</h4><p>' + (b.hiredAjudante ? 'Preparando ingredientes!' : 'Reduz consumo de estoque e acelera entregas.') + '</p><button class="btn-orange" data-biz="ajudante"' + (b.hiredAjudante || profile.money < 100 ? ' disabled' : '') + '>Contratar</button></div>' +
        '<div class="card"><h4>📦 Comprar Mercadorias (+50% Estoque) • R$ 55</h4><p>Abastece farinha, queijos e embalagens.</p><button class="btn-orange" data-biz="stock"' + (b.stockLevel >= 100 || profile.money < 55 ? ' disabled' : '') + '>Comprar</button></div></div>' +
        '<button class="btn-green" id="dCollect"' + (b.dailyRevenueAccumulated <= 0 ? ' disabled' : '') + '>💰 Recolher Lucro Líquido do Caixa (R$ ' + b.dailyRevenueAccumulated + ')</button>';
      body.querySelectorAll('[data-biz]').forEach((btn) => { btn.onclick = () => {
        const a = btn.dataset.biz; sfx.cash();
        if (a === 'pizzaiolo' && profile.money >= 150) { profile.money -= 150; b.hiredPizzaiolo = true; b.dailyRevenueAccumulated += 65; }
        if (a === 'atendente' && profile.money >= 110) { profile.money -= 110; b.hiredAtendente = true; b.level += 1; }
        if (a === 'ajudante' && profile.money >= 100) { profile.money -= 100; b.hiredAjudante = true; b.level += 1; }
        if (a === 'stock' && profile.money >= 55) { profile.money -= 55; b.stockLevel = Math.min(100, b.stockLevel + 50); }
        saveProfile(); renderDialog();
      }; });
      const c = $('dCollect'); if (c) c.onclick = () => { sfx.cash(); profile.money += b.dailyRevenueAccumulated; b.dailyRevenueAccumulated = 0; saveProfile(); renderDialog(); };
    }
  } else if (dialogType === 'recruiter') {
    $('dialogIcon').textContent = '✨'; $('dialogTitle').textContent = 'Agente Orion • Caça-Talentos Universo Zero';
    $('dialogSub').textContent = 'Oportunidades especiais desbloqueadas pelos seus atributos profissionais!';
    body.innerHTML = RECRUITERS.map((inv) => {
      const lvl = profile.attributes[inv.attr], un = lvl >= inv.min, acc = profile.acceptedInvites.includes(inv.id);
      return '<div class="card outfit-row" style="' + (acc ? 'border-color:rgba(16,185,129,.4)' : un ? 'border-color:rgba(167,139,250,.55)' : '') + '"><div><b>' + inv.company + ' — <span style="color:#c4b5fd">' + inv.role + '</span></b><p>' + inv.desc + '</p><p style="font-size:11px">Requisito: <b style="text-transform:uppercase">' + inv.attr + '</b> Nv. ' + inv.min + ' (Seu nível: ' + lvl + ')</p></div><button class="btn-orange" data-invite="' + inv.id + '"' + (!un || acc ? ' disabled' : '') + '>' + (acc ? 'Credenciado ✓' : un ? 'Aceitar Bônus +R$ ' + inv.bonus : 'Em Evolução') + '</button></div>';
    }).join('');
    body.querySelectorAll('[data-invite]').forEach((btn) => { btn.onclick = () => {
      const inv = RECRUITERS.find((i) => i.id === btn.dataset.invite); if (!inv) return;
      sfx.level(); profile.money += inv.bonus; profile.acceptedInvites.push(inv.id);
      profile.careerHistory.push({ id: inv.id, employer: 'Rede Corporativa Universo Zero', role: 'Talento Recrutado por Mérito', hiredDay: profile.day, baseSalary: inv.bonus, shiftsCompleted: 1, bestRating: 'S+', active: true });
      saveProfile(); renderDialog();
    }; });
  }
}

// ----------------------------- INPUT -----------------------------
window.addEventListener('keydown', (e) => {
  eng.keys.add(e.code);
  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (dialogType) { closeDialog(); return; }
    if (showTablet) { showTablet = false; $('tablet').classList.add('hidden'); return; }
    if (screen === 'playing') { screen = 'paused'; showScreen(); } else if (screen === 'paused') { screen = 'playing'; showScreen(); }
    return;
  }
  if (e.code === 'Tab') { e.preventDefault(); if (screen === 'playing') { showTablet = !showTablet; $('tablet').classList.toggle('hidden', !showTablet); if (showTablet) renderTablet('attrs'); } return; }
  if (e.code === 'KeyR' && (screen === 'summary' || screen === 'gameover')) { hireHelper(); prepareNewShift(true); screen = 'playing'; showScreen(); return; }
  if (screen !== 'playing' || showTablet || dialogType) return;
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && eng.dashCd <= 0) { eng.dashT = 0.18; eng.dashCd = 0.85; sfx.dash(); spawnParticles(eng.px, eng.py + 14, '#e2e8f0', 8, 'circle', 80); }
  if (e.code === 'KeyQ' && heldItem.type !== 'none' && heldItem.type !== 'baked_pizza') { heldItem = { type: 'none', label: '', color: 'transparent' }; sfx.drop(); floatText(eng.px, eng.py - 22, 'Item devolvido', '#94a3b8'); }
  if (e.code === 'KeyE' || e.code === 'Space') { e.preventDefault(); const best = nearestStationAt(eng.px, eng.py, 112); if (best) interact(best); }
});
window.addEventListener('keyup', (e) => eng.keys.delete(e.code));

canvas.addEventListener('pointerdown', (e) => {
  if (screen !== 'playing' || showTablet || dialogType) return;
  const rect = canvas.getBoundingClientRect();
  const zoom = rect.width < 680 ? 0.78 : rect.width < 1024 ? 0.9 : 1.0;
  const ew = rect.width / zoom, eh = rect.height / zoom;
  let camX = eng.px - ew / 2, camY = eng.py - eh / 2;
  camX = Math.max(0, Math.min(WORLD_W - ew, camX)); camY = Math.max(0, Math.min(WORLD_H - eh, camY));
  if (ew >= WORLD_W) camX = -(ew - WORLD_W) / 2;
  if (eh >= WORLD_H) camY = -(eh - WORLD_H) / 2;
  const wx = (e.clientX - rect.left) / zoom + camX, wy = (e.clientY - rect.top) / zoom + camY;
  const clicked = STATIONS.find((s) => wx >= s.x - 22 && wx <= s.x + s.w + 22 && wy >= s.y - 22 && wy <= s.y + s.h + 22);
  if (clicked) {
    const d = Math.hypot(eng.px - clicked.ix, eng.py - clicked.iy);
    if (d < 85) interact(clicked);
    else eng.clickTarget = { x: clicked.ix, y: clicked.iy, auto: clicked.id };
  } else eng.clickTarget = { x: wx, y: wy };
});

// Joystick touch
const joyEl = $('joystick'), knobEl = $('joyKnob');
let joyOrigin = null;
joyEl.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); const t = e.touches[0]; joyOrigin = { x: t.clientX, y: t.clientY }; }, { passive: false });
joyEl.addEventListener('touchmove', (e) => {
  e.preventDefault(); e.stopPropagation(); if (!joyOrigin) return;
  const t = e.touches[0], maxR = 42;
  let dx = t.clientX - joyOrigin.x, dy = t.clientY - joyOrigin.y;
  const d = Math.hypot(dx, dy);
  if (d > maxR) { dx = (dx / d) * maxR; dy = (dy / d) * maxR; }
  knobEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  eng.joy = { x: dx / maxR, y: dy / maxR };
}, { passive: false });
const joyEnd = () => { joyOrigin = null; eng.joy = { x: 0, y: 0 }; knobEl.style.transform = 'translate(0,0)'; };
joyEl.addEventListener('touchend', joyEnd); joyEl.addEventListener('touchcancel', joyEnd);

// ----------------------------- BOTÕES DA UI -----------------------------
$('btnOpenWorld').onclick = () => { eng.px = START_POS.x; eng.py = START_POS.y; shiftPhase = profile.isHiredAsHelper ? 'clock_in' : 'off_duty'; screen = 'playing'; showScreen(); };
$('btnQuickShift').onclick = () => { hireHelper(); prepareNewShift(true); screen = 'playing'; showScreen(); };
$('btnResetCareer').onclick = () => { profile = defaultProfile(); saveProfile(); shiftPhase = 'off_duty'; wearingUniform = false; heldItem = { type: 'none', label: '', color: 'transparent' }; eng.px = START_POS.x; eng.py = START_POS.y; renderStart(); };
$('btnPause').onclick = () => { if (screen === 'playing') { screen = 'paused'; showScreen(); } };
$('btnResume').onclick = () => { screen = 'playing'; showScreen(); };
$('btnRestartShift').onclick = () => { hireHelper(); prepareNewShift(true); screen = 'playing'; showScreen(); };
$('btnToStart').onclick = () => { screen = 'start'; showScreen(); };
$('btnSound').onclick = () => { soundOn = !soundOn; $('btnSound').textContent = soundOn ? '🔊' : '🔇'; };
$('btnTablet').onclick = () => { showTablet = true; $('tablet').classList.remove('hidden'); renderTablet('attrs'); };
$('btnDash').onclick = () => { if (eng.dashCd <= 0) { eng.dashT = 0.18; eng.dashCd = 0.85; sfx.dash(); } };
$('btnInteract').onclick = () => { if (nearestStation) interact(nearestStation); };
document.querySelectorAll('[data-close]').forEach((b) => { b.onclick = () => { if (b.dataset.close === 'tablet') { showTablet = false; $('tablet').classList.add('hidden'); } else closeDialog(); }; });
document.querySelectorAll('.tab').forEach((t) => { t.onclick = () => renderTablet(t.dataset.tab); });

// ----------------------------- INÍCIO -----------------------------
showScreen();
requestAnimationFrame(frame);
