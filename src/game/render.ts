import { Engine, ING, Station } from './engine';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function render(ctx: CanvasRenderingContext2D, g: Engine) {
  const W = g.viewW, H = g.viewH;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.translate(Math.round(-g.cam.x + g.shakeX), Math.round(-g.cam.y + g.shakeY));

  if (g.scene === 'shift' || g.scene === 'gameover' || g.scene === 'summary') drawPizzaria(ctx, g);
  else drawWorld(ctx, g);

  // particles
  for (const p of g.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.4));
    ctx.fillStyle = p.color;
    if (p.shape === 'rect') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 6);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // floaters
  for (const f of g.floaters) {
    const a = Math.min(1, f.life);
    ctx.globalAlpha = a;
    ctx.font = `900 ${f.size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (g.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.6})`;
    ctx.fillRect(0, 0, W, H);
  }
  // stress vignette
  if (g.scene === 'shift' && g.shift && g.shift.stress > 50) {
    const a = ((g.shift.stress - 50) / 50) * 0.5 * (0.7 + 0.3 * Math.sin(g.time * 6));
    const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.9);
    grd.addColorStop(0, 'rgba(200,0,0,0)');
    grd.addColorStop(1, `rgba(200,0,0,${a})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- Character ---------- */
function drawTicTac(ctx: CanvasRenderingContext2D, _g: Engine, x: number, y: number, opts: { color?: string; uniform?: boolean; cap?: boolean; facing?: number; walk?: number; scale?: number; name?: string } = {}) {
  const { color = '#ffb300', uniform = false, cap = false, facing = 1, walk = 0, scale = 1 } = opts;
  const bob = Math.sin(walk) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 16 - bob, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.fillStyle = '#37474f';
  const l = Math.sin(walk) * 5;
  rr(ctx, -9, 6 + l * 0.5, 7, 12, 3); ctx.fill();
  rr(ctx, 2, 6 - l * 0.5, 7, 12, 3); ctx.fill();
  // body
  ctx.fillStyle = uniform ? '#fafafa' : color;
  rr(ctx, -14, -16, 28, 28, 12); ctx.fill();
  if (uniform) {
    ctx.fillStyle = '#e53935';
    rr(ctx, -9, -6, 18, 18, 5); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BZ', 0, 6);
  }
  // head
  ctx.fillStyle = '#ffe0b2';
  ctx.beginPath();
  ctx.arc(0, -24, 13, 0, Math.PI * 2);
  ctx.fill();
  // eyes
  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.arc(facing * 4 - 3, -26, 2.2, 0, Math.PI * 2);
  ctx.arc(facing * 4 + 4, -26, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // smile
  ctx.strokeStyle = '#263238';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(facing * 2, -21, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // hat
  if (uniform) {
    ctx.fillStyle = '#fff';
    rr(ctx, -13, -42, 26, 12, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -42, 11, Math.PI, 0); ctx.fill();
  } else if (cap) {
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath(); ctx.arc(0, -30, 12, Math.PI, 0); ctx.fill();
    rr(ctx, facing > 0 ? 0 : -18, -32, 18, 4, 2); ctx.fill();
  } else {
    ctx.fillStyle = '#5d4037';
    ctx.beginPath(); ctx.arc(0, -29, 12, Math.PI, 0); ctx.fill();
  }
  ctx.restore();
}

function drawHolding(ctx: CanvasRenderingContext2D, g: Engine) {
  const s = g.shift;
  if (!s || !s.holding) return;
  const p = g.player;
  const icon = s.holding.type === 'drink' ? '🥤' : ING[s.holding.ing!].icon;
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(icon, p.x + p.facing * 18, p.y - 2 + Math.sin(g.time * 4) * 2);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 11, color = '#fff') {
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 10;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  rr(ctx, x - w / 2, y - size, w, size + 6, 4); ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/* ---------- World ---------- */
function drawWorld(ctx: CanvasRenderingContext2D, g: Engine) {
  const { w, h } = g.worldSize;
  // grass
  ctx.fillStyle = '#7cb342';
  ctx.fillRect(-200, -200, w + 400, h + 400);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 397) % w, y = (i * 211) % h;
    ctx.beginPath(); ctx.arc(x, y, 20 + (i % 5) * 6, 0, Math.PI * 2); ctx.fill();
  }
  // roads
  ctx.fillStyle = '#546e7a';
  ctx.fillRect(0, 440, w, 150);
  ctx.fillRect(560, 0, 120, h);
  ctx.fillRect(1120, 440, 110, h - 440);
  // sidewalks
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(0, 430, w, 10); ctx.fillRect(0, 590, w, 10);
  // lane dashes
  ctx.strokeStyle = '#fff59d';
  ctx.lineWidth = 4;
  ctx.setLineDash([30, 24]);
  ctx.beginPath(); ctx.moveTo(0, 515); ctx.lineTo(w, 515); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(620, 0); ctx.lineTo(620, h); ctx.stroke();
  ctx.setLineDash([]);
  // buildings
  for (const b of g.buildings) {
    if (b.id === 'parque') {
      ctx.fillStyle = '#9ccc65';
      rr(ctx, b.x, b.y, b.w, b.h, 30); ctx.fill();
      ctx.font = '40px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🌳', b.x + 60, b.y + 70); ctx.fillText('🌳', b.x + 250, b.y + 90); ctx.fillText('🌲', b.x + 150, b.y + 170); ctx.fillText('⛲', b.x + 160, b.y + 90);
      ctx.font = '26px sans-serif'; ctx.fillText('🪑', b.x + 60, b.y + 180);
      label(ctx, b.label, b.x + b.w / 2, b.y - 8, 12);
      continue;
    }
    if (b.id === 'onibus') {
      ctx.fillStyle = '#37474f'; rr(ctx, b.x, b.y, b.w, 8, 2); ctx.fill();
      ctx.fillStyle = 'rgba(144,202,249,0.5)'; rr(ctx, b.x + 4, b.y + 8, b.w - 8, b.h - 8, 3); ctx.fill();
      ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🚏', b.x + b.w / 2, b.y + 40);
      label(ctx, b.label, b.x + b.w / 2, b.y - 8, 11);
      continue;
    }
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    rr(ctx, b.x + 8, b.y + 10, b.w, b.h, 8); ctx.fill();
    ctx.fillStyle = b.color;
    rr(ctx, b.x, b.y, b.w, b.h, 8); ctx.fill();
    // roof
    ctx.fillStyle = b.roof;
    rr(ctx, b.x - 6, b.y - 6, b.w + 12, 40, 8); ctx.fill();
    // awning stripes for pizzaria
    if (b.id === 'pizzaria') {
      for (let i = 0; i < b.w / 24; i++) {
        ctx.fillStyle = i % 2 ? '#fff' : '#c62828';
        ctx.fillRect(b.x + i * 24, b.y + b.h - 36, 24, 14);
      }
      ctx.fillStyle = '#4caf50'; ctx.fillRect(b.x, b.y + b.h - 22, b.w, 6);
      if (!g.profile.hired) {
        ctx.fillStyle = '#fff'; rr(ctx, b.x + b.w - 110, b.y + 60, 96, 40, 4); ctx.fill();
        ctx.fillStyle = '#c62828'; ctx.font = '900 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('CONTRATA-SE', b.x + b.w - 62, b.y + 78); ctx.fillText('AJUDANTE', b.x + b.w - 62, b.y + 93);
      }
    }
    if (b.id === 'aluguel' && !g.profile.ownsBusiness) {
      ctx.fillStyle = '#fff59d'; rr(ctx, b.x + 20, b.y + 60, 120, 44, 4); ctx.fill();
      ctx.fillStyle = '#5d4037'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('ALUGA-SE', b.x + 80, b.y + 80); ctx.fillText('R$ 2.000', b.x + 80, b.y + 96);
    }
    if (b.id === 'aluguel' && g.profile.ownsBusiness) {
      ctx.fillStyle = '#ffd54f'; rr(ctx, b.x + 20, b.y + 60, 180, 40, 4); ctx.fill();
      ctx.fillStyle = '#5d4037'; ctx.font = '900 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`PIZZARIA DO ${g.profile.name.toUpperCase()}`, b.x + 110, b.y + 86);
    }
    // windows
    ctx.fillStyle = 'rgba(129,212,250,0.8)';
    for (let i = 0; i < 3; i++) rr(ctx, b.x + 24 + i * ((b.w - 48) / 3), b.y + 60, 36, 36, 4), ctx.fill();
    // door
    const dy = b.door.y > b.y + b.h / 2 ? b.y + b.h - 50 : b.y;
    ctx.fillStyle = '#5d4037';
    rr(ctx, b.door.x - 20, dy, 40, 50, 4); ctx.fill();
    // icon + label
    ctx.font = '36px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(b.icon, b.x + b.w / 2, b.y + 28);
    label(ctx, b.label, b.x + b.w / 2, b.y - 14, 13);
    // door mat / glow
    const near = Math.hypot(g.player.x - b.door.x, g.player.y - b.door.y) < 60;
    ctx.fillStyle = near ? `rgba(255,235,59,${0.5 + 0.3 * Math.sin(g.time * 8)})` : 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(b.door.x, b.door.y, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
  // npcs
  for (const n of g.npcs) drawTicTac(ctx, g, n.x, n.y, { color: n.color, facing: n.tx > n.x ? 1 : -1, walk: g.time * 10, scale: 0.9 });
  // player
  drawTicTac(ctx, g, g.player.x, g.player.y, { facing: g.player.facing, walk: g.player.walk, cap: g.profile.hasCap });
}

/* ---------- Pizzaria ---------- */
function drawStation(ctx: CanvasRenderingContext2D, g: Engine, st: Station, near: boolean) {
  const s = g.shift!;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  rr(ctx, st.x + 4, st.y + 6, st.w, st.h, 6); ctx.fill();
  ctx.fillStyle = st.color;
  rr(ctx, st.x, st.y, st.w, st.h, 6); ctx.fill();
  // top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rr(ctx, st.x + 3, st.y + 3, st.w - 6, st.h * 0.35, 4); ctx.fill();
  if (near) {
    ctx.strokeStyle = `rgba(255,235,59,${0.6 + 0.4 * Math.sin(g.time * 8)})`;
    ctx.lineWidth = 3;
    rr(ctx, st.x - 3, st.y - 3, st.w + 6, st.h + 6, 8); ctx.stroke();
  }
  ctx.font = `${Math.min(28, st.h * 0.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(st.icon, st.x + st.w / 2, st.y + st.h / 2 + 9);
  if (st.dirty) {
    ctx.fillStyle = 'rgba(80,60,20,0.55)';
    rr(ctx, st.x, st.y, st.w, st.h, 6); ctx.fill();
    ctx.font = '18px sans-serif';
    ctx.fillText('🧽', st.x + st.w - 12, st.y + 16);
  }
  // ingredient stock bars
  if (st.ing) {
    const v = s.stock[st.ing];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < v ? ING[st.ing].color : 'rgba(0,0,0,0.3)';
      rr(ctx, st.x + 6 + i * ((st.w - 12) / 5), st.y + st.h + 4, (st.w - 12) / 5 - 2, 6, 2); ctx.fill();
    }
    if (v === 0) label(ctx, 'FALTA!', st.x + st.w / 2, st.y - 8, 11, '#ff5252');
  }
  // badges
  if (st.id === 'computador') {
    const n = s.orders.filter((o) => o.status === 'novo').length;
    ctx.fillStyle = n ? '#4fc3f7' : '#1a252f';
    rr(ctx, st.x + 10, st.y + 8, st.w - 20, st.h - 24, 3); ctx.fill();
    ctx.font = '22px sans-serif'; ctx.fillText('💻', st.x + st.w / 2, st.y + st.h / 2 + 8);
    if (n) badge(ctx, st.x + st.w - 4, st.y - 2, n, '#ff1744', g.time);
  }
  if (st.id === 'forno') {
    // oven glow
    const c = s.oven;
    ctx.fillStyle = `rgba(255,${120 + c * 100},0,${0.35 + c * 0.5})`;
    rr(ctx, st.x + 14, st.y + 60, st.w - 28, 40, 4); ctx.fill();
    if (c > 0) {
      ctx.fillStyle = '#263238'; rr(ctx, st.x + 10, st.y + st.h - 10, st.w - 20, 6, 3); ctx.fill();
      ctx.fillStyle = '#ffeb3b'; rr(ctx, st.x + 10, st.y + st.h - 10, (st.w - 20) * c, 6, 3); ctx.fill();
    }
    if (s.ovenFlash > 0) { ctx.fillStyle = `rgba(255,255,200,${s.ovenFlash * 0.5})`; rr(ctx, st.x, st.y, st.w, st.h, 6); ctx.fill(); }
    // pizzaiolo
    drawTicTac(ctx, g, st.x + st.w / 2, st.y - 10, { uniform: true, facing: -1, walk: c > 0 ? g.time * 14 : 0, scale: 0.95 });
    if (s.pizzaiolo) speech(ctx, st.x + st.w / 2, st.y - 62, s.pizzaiolo.text);
    const f = s.orders.filter((o) => o.status === 'fila').length;
    if (f) badge(ctx, st.x + st.w - 4, st.y - 2, f, '#ff9100', g.time);
  }
  if (st.id === 'expedicao') {
    const ready = s.orders.filter((o) => o.status === 'pronta');
    ready.slice(0, 4).forEach((o, i) => {
      ctx.font = '22px sans-serif';
      ctx.fillText('🍕', st.x + 24 + i * 30, st.y + 22 - i * 2);
      void o;
    });
    const packed = s.orders.filter((o) => o.status === 'embalada').length;
    for (let i = 0; i < Math.min(packed, 5); i++) { ctx.font = '20px sans-serif'; ctx.fillText('📦', st.x + st.w - 20 - i * 14, st.y + 44 - i * 3); }
    if (ready.length) badge(ctx, st.x + st.w - 4, st.y - 2, ready.length, '#ffd740', g.time);
  }
  if (st.id === 'balcao' && s.customer) {
    const cx = st.x + st.w / 2, cy = st.y + st.h + 30;
    drawTicTac(ctx, g, cx, cy, { color: '#ab47bc', facing: 1, walk: 0, scale: 0.9 });
    const frac = s.customer.patience / s.customer.max;
    ctx.fillStyle = '#263238'; rr(ctx, cx - 20, cy - 60, 40, 6, 3); ctx.fill();
    ctx.fillStyle = frac > 0.4 ? '#69f0ae' : '#ff5252'; rr(ctx, cx - 20, cy - 60, 40 * frac, 6, 3); ctx.fill();
    ctx.font = '16px sans-serif'; ctx.fillText('🍕❓', cx, cy - 66);
  }
  if (st.id === 'saida') {
    const away = s.courierAway > 0;
    if (!away) {
      drawTicTac(ctx, g, st.x + st.w / 2, st.y - 14, { color: '#ffa726', facing: -1, scale: 0.9 });
      ctx.font = '22px sans-serif'; ctx.fillText('🛵', st.x + st.w / 2, st.y + 40);
    } else {
      ctx.font = '22px sans-serif'; ctx.fillText('🛵💨', Math.min(s.courierX, 1100), st.y + 40);
    }
    const n = s.orders.filter((o) => o.status === 'embalada').length;
    if (n && !away) badge(ctx, st.x + st.w - 4, st.y - 2, n, '#69f0ae', g.time);
  }
}

function badge(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, color: string, t: number) {
  const r = 11 + Math.sin(t * 10) * 1.5;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(String(n), x, y + 5);
}

function speech(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const w = Math.min(230, ctx.measureText(text).width + 16);
  const bx = Math.min(x, 960 - w / 2 - 10);
  ctx.fillStyle = '#fff';
  rr(ctx, bx - w / 2, y - 18, w, 26, 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 6, y + 8); ctx.lineTo(x + 6, y + 8); ctx.lineTo(x, y + 16); ctx.fill();
  ctx.fillStyle = '#263238';
  ctx.fillText(text.length > 36 ? text.slice(0, 35) + '…' : text, bx, y);
}

function drawPizzaria(ctx: CanvasRenderingContext2D, g: Engine) {
  const s = g.shift;
  if (!s) return;
  const { w, h } = g.worldSize;
  // outer
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(-300, -300, w + 600, h + 600);
  // floor tiles
  ctx.fillStyle = '#e8d9b8';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  // zones
  const zone = (x: number, y: number, zw: number, zh: number, c: string, name: string) => {
    ctx.fillStyle = c; rr(ctx, x, y, zw, zh, 8); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.font = '800 11px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(name.toUpperCase(), x + 8, y + 14);
  };
  zone(30, 30, 240, 120, 'rgba(96,125,139,0.18)', 'Vestiário');
  zone(300, 30, 540, 130, 'rgba(192,57,43,0.12)', 'Preparação');
  zone(30, 220, 120, 340, 'rgba(33,150,243,0.12)', 'Estoque frio');
  zone(790, 200, 150, 190, 'rgba(121,85,72,0.2)', 'Cozinha');
  zone(300, 330, 450, 110, 'rgba(255,152,0,0.14)', 'Expedição / Operação');
  zone(300, 500, 240, 100, 'rgba(142,90,60,0.14)', 'Atendimento');
  zone(820, 480, 120, 120, 'rgba(96,125,139,0.18)', 'Saída');
  // walls
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(-10, -10, w + 20, 12); ctx.fillRect(-10, h - 2, w + 20, 12); ctx.fillRect(-10, -10, 12, h + 20); ctx.fillRect(w - 2, -10, 12, h + 20);
  // entrance door
  ctx.fillStyle = '#8d6e63'; rr(ctx, 40, h - 8, 70, 10, 2); ctx.fill();
  ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🚪', 75, h - 12);
  // stations
  const near = g.active ? g.active.station : g.nearestStation();
  const sorted = [...g.stations].sort((a, b) => a.y - b.y);
  for (const st of sorted) {
    if (st.y + st.h < g.player.y - 20) drawStation(ctx, g, st, st === near);
  }
  drawTicTac(ctx, g, g.player.x, g.player.y, { facing: g.player.facing, walk: g.player.walk, uniform: s.uniform, cap: g.profile.hasCap });
  drawHolding(ctx, g);
  for (const st of sorted) {
    if (st.y + st.h >= g.player.y - 20) drawStation(ctx, g, st, st === near);
  }
  // active minigame
  if (g.active) {
    const a = g.active;
    const x = g.player.x - 60, y = g.player.y - 66;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    rr(ctx, x - 6, y - 8, 132, 28, 8); ctx.fill();
    if (a.kind === 'timing') {
      ctx.fillStyle = '#37474f'; rr(ctx, x, y, 120, 12, 4); ctx.fill();
      ctx.fillStyle = '#69f0ae'; rr(ctx, x + a.zone[0] * 120, y, (a.zone[1] - a.zone[0]) * 120, 12, 3); ctx.fill();
      ctx.fillStyle = '#fff'; rr(ctx, x + a.cursor * 120 - 3, y - 4, 6, 20, 2); ctx.fill();
    } else {
      ctx.fillStyle = '#37474f'; rr(ctx, x, y, 120, 12, 4); ctx.fill();
      ctx.fillStyle = a.kind === 'mash' ? '#ff9100' : '#4fc3f7'; rr(ctx, x, y, 120 * Math.min(1, a.progress), 12, 4); ctx.fill();
    }
  }
}
