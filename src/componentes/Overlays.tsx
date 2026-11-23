import { useEffect, useRef, useState } from 'react';
import { Engine, ING, INGS } from '../game/engine';
import { ATTR_KEYS, ATTR_LABEL, attrLevel } from '../game/storage';
import { isMuted, setMuted } from '../game/audio';

const Btn = ({ children, onClick, primary, disabled, small }: { children: React.ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; small?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`pointer-events-auto rounded-xl font-extrabold tracking-wide transition active:scale-95 disabled:opacity-40 ${small ? 'px-3 py-1.5 text-xs' : 'px-5 py-3 text-base'} ${primary ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-stone-900 shadow-[0_6px_0_#9a3412] hover:brightness-110 active:translate-y-1 active:shadow-none' : 'bg-stone-800/90 text-amber-50 ring-1 ring-white/15 hover:bg-stone-700'}`}
  >
    {children}
  </button>
);

const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`pointer-events-auto rounded-2xl border border-amber-200/20 bg-stone-900/95 p-5 text-amber-50 shadow-2xl backdrop-blur ${className}`}>{children}</div>
);

export function StartScreen({ g }: { g: Engine }) {
  const p = g.profile;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-auto bg-[radial-gradient(ellipse_at_top,#7a1f1a,#1a0a08_70%)] p-4">
      <div className="pointer-events-auto w-full max-w-3xl">
        <div className="text-center">
          <div className="text-xs font-black uppercase tracking-[0.4em] text-amber-300/80">Universo Zero · Estúdio de Profissões</div>
          <h1 className="mt-2 text-5xl font-black text-amber-50 drop-shadow-[0_4px_0_#7c2d12] sm:text-7xl">
            AJUDANTE <span className="text-amber-400">DE PIZZARIA</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-amber-100/80">
            Você é o Tic-Tac. Circule pela cidade, candidate-se à vaga na Pizzaria Bella Zero, prepare ingredientes, receba pedidos, apoie o pizzaiolo, confira e despache entregas. Ganhe dinheiro, evolua atributos e, quem sabe, abra seu próprio negócio.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Panel>
            <div className="text-xs font-black uppercase tracking-widest text-amber-300">Seu Tic-Tac</div>
            <div className="mt-2 flex items-baseline justify-between"><span>Carteira</span><span className="text-2xl font-black text-emerald-300">R$ {p.money.toFixed(0)}</span></div>
            <div className="flex items-baseline justify-between text-sm text-amber-100/70"><span>Dia {p.day} · {p.totalShifts} turno(s)</span><span>{p.hired ? 'Empregado ✓' : 'Desempregado'}</span></div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {ATTR_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-20 text-amber-100/70">{ATTR_LABEL[k]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-stone-700"><div className="h-full bg-amber-400" style={{ width: `${p.attrs[k]}%` }} /></div>
                  <span className="w-6 text-right font-bold">{attrLevel(p.attrs[k])}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="text-xs font-black uppercase tracking-widest text-amber-300">🏆 Melhores turnos</div>
            {p.highScores.length === 0 ? (
              <p className="mt-3 text-sm text-amber-100/60">Nenhum turno registrado. Seja o primeiro!</p>
            ) : (
              <ol className="mt-2 space-y-1 text-sm">
                {p.highScores.map((h, i) => (
                  <li key={i} className="flex justify-between rounded px-2 py-0.5 odd:bg-white/5">
                    <span><span className="mr-2 font-black text-amber-400">{i + 1}.</span>{h.pedidos} pedidos · Dia {h.day}</span>
                    <span className="font-black">{h.score.toLocaleString('pt-BR')}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Btn primary onClick={() => g.beginGame()}>▶ {p.totalShifts ? 'CONTINUAR' : 'COMEÇAR'}</Btn>
          <Btn onClick={() => { if (confirm('Apagar todo o progresso?')) g.resetAll(); }}>Novo personagem</Btn>
        </div>
        <p className="mt-4 text-center text-xs text-amber-100/50">WASD / setas para mover · E ou Espaço para interagir · P ou Esc pausa · No celular: joystick + botão</p>
      </div>
    </div>
  );
}

function Bar({ v, color, label }: { v: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold">
      <span className="w-14 opacity-80">{label}</span>
      <div className="h-2.5 w-20 overflow-hidden rounded-full bg-black/50 sm:w-28"><div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(0, Math.min(100, v))}%` }} /></div>
    </div>
  );
}

export function Hud({ g }: { g: Engine }) {
  const s = g.shift;
  const p = g.profile;
  const [m, setM] = useState(isMuted());
  return (
    <>
      <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1 rounded-xl bg-stone-900/80 px-3 py-2 text-amber-50 backdrop-blur">
        {s && (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black tabular-nums text-amber-300">{s.score.toLocaleString('pt-BR')}</span>
            {s.combo > 1 && <span className="animate-pulse text-sm font-black text-orange-400">COMBO x{s.combo}</span>}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-emerald-300">R$ {p.money.toFixed(0)}</span>
          <span className="opacity-70">Dia {p.day}</span>
          {s && <span className={`tabular-nums ${s.time < 20 && s.phase === 'op' ? 'animate-pulse text-red-400' : ''}`}>⏱ {s.phase === 'prep' ? 'Preparação' : s.phase === 'closing' ? 'FECHAMENTO' : `${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, '0')}`}</span>}
        </div>
        <Bar v={p.energy} color="bg-emerald-400" label="⚡ Energia" />
        {s && <Bar v={s.stress} color={s.stress > 70 ? 'bg-red-500' : 'bg-yellow-400'} label="😰 Estresse" />}
      </div>
      <div className="pointer-events-auto absolute right-2 top-2 flex gap-1">
        <button onClick={() => { setMuted(!m); setM(!m); }} className="rounded-lg bg-stone-900/80 px-2 py-1 text-sm text-amber-50">{m ? '🔇' : '🔊'}</button>
        <button onClick={() => g.togglePause()} className="rounded-lg bg-stone-900/80 px-2 py-1 text-sm font-black text-amber-50">II</button>
      </div>
      {s && s.phase === 'prep' && (
        <div className="pointer-events-none absolute right-2 top-12 rounded-xl bg-stone-900/85 px-3 py-2 text-xs text-amber-50 backdrop-blur">
          <div className="mb-1 font-black uppercase tracking-wider text-amber-300">Checklist de entrada</div>
          {['🕒 Bater o ponto', '👕 Vestir uniforme', '🧼 Lavar as mãos'].map((t, i) => (
            <div key={t} className={`${s.prepStep > i ? 'line-through opacity-50' : s.prepStep === i ? 'font-bold text-amber-200' : 'opacity-60'}`}>{s.prepStep > i ? '✓ ' : '○ '}{t}</div>
          ))}
        </div>
      )}
      {s && s.phase !== 'prep' && (
        <div className="pointer-events-none absolute right-2 top-12 w-44 space-y-1 text-amber-50 sm:w-56">
          <div className="rounded-xl bg-stone-900/85 px-2 py-1.5 backdrop-blur">
            <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-amber-300">Estoque</div>
            <div className="grid grid-cols-4 gap-1">
              {INGS.map((i) => (
                <div key={i} className={`flex flex-col items-center rounded px-1 py-0.5 text-[10px] font-bold ${s.stock[i] === 0 ? 'animate-pulse bg-red-600/60' : 'bg-white/5'}`}>
                  <span>{ING[i].icon}</span>
                  <span>{s.stock[i]}/5</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-stone-900/85 px-2 py-1.5 backdrop-blur">
            <div className="mb-1 flex justify-between text-[10px] font-black uppercase tracking-wider text-amber-300"><span>Pedidos</span><span>{s.entregues} entregues</span></div>
            {s.orders.length === 0 && <div className="text-[11px] opacity-50">Sem pedidos ativos</div>}
            <div className="space-y-1">
              {s.orders.slice(0, 6).map((o) => {
                const frac = o.timer / o.maxTimer;
                const st = { novo: '💻 novo', fila: '⏳ fila', cozinha: '🔥 forno', pronta: '📦 embalar', embalada: '🛵 despachar', saiu: '✓' }[o.status];
                return (
                  <div key={o.id} className={`rounded-md px-1.5 py-1 text-[10px] ${o.status === 'novo' ? 'bg-sky-500/25' : o.status === 'pronta' ? 'bg-amber-500/25' : o.status === 'embalada' ? 'bg-emerald-500/25' : 'bg-white/5'}`}>
                    <div className="flex justify-between font-bold"><span>#{o.id} {ING[o.sabor].icon} {ING[o.sabor].sabor}{o.drink ? ' +🥤' : ''}</span></div>
                    <div className="flex justify-between opacity-80"><span>{o.bairro}</span><span>{st}</span></div>
                    <div className="mt-0.5 h-1 overflow-hidden rounded bg-black/50"><div className={`h-full ${frac > 0.4 ? 'bg-emerald-400' : frac > 0.2 ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} style={{ width: `${frac * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {g.toast && (
        <div className="pointer-events-none absolute left-1/2 top-16 max-w-[90%] -translate-x-1/2 rounded-xl bg-amber-400 px-4 py-2 text-center text-sm font-bold text-stone-900 shadow-lg sm:top-4 sm:max-w-md">{g.toast.text}</div>
      )}
      {g.prompt && (
        <div className={`pointer-events-none absolute bottom-24 left-1/2 max-w-[80%] -translate-x-1/2 rounded-xl px-4 py-2 text-center text-sm font-bold shadow-lg sm:bottom-6 ${g.prompt.ok ? 'bg-stone-900/90 text-amber-50 ring-2 ring-amber-400' : 'bg-stone-900/70 text-amber-100/70'}`}>{g.prompt.text}</div>
      )}
    </>
  );
}

export function DialogueBox({ g }: { g: Engine }) {
  const d = g.dialogue!;
  return (
    <div className="absolute inset-0 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <Panel className="w-full max-w-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-2xl">{d.icon}</div>
          <div className="font-black text-amber-300">{d.speaker}</div>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{d.text}</p>
        <div className="mt-4 flex flex-col gap-2">
          {d.options.map((o, i) => (
            <button key={i} disabled={o.disabled} onClick={() => g.chooseOption(i)} className="rounded-lg bg-stone-800 px-3 py-2 text-left text-sm font-bold ring-1 ring-white/10 transition hover:bg-amber-500 hover:text-stone-900 active:scale-[0.98] disabled:opacity-40">
              <span className="mr-2 text-amber-400">{i + 1}.</span>{o.label}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function PauseScreen({ g }: { g: Engine }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
      <Panel className="w-full max-w-sm text-center">
        <h2 className="text-3xl font-black text-amber-300">PAUSADO</h2>
        <p className="mt-1 text-sm opacity-70">{g.scene === 'shift' ? 'O turno está congelado.' : 'Universo Zero em pausa.'}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Btn primary onClick={() => g.togglePause()}>Continuar</Btn>
          {g.scene === 'shift' && <Btn onClick={() => g.restartShift()}>Reiniciar turno</Btn>}
          {g.scene === 'shift' && <Btn onClick={() => g.quitShift()}>Abandonar turno (sem pagamento)</Btn>}
          <Btn onClick={() => { g.paused = false; g.shift = null; g.scene = 'start'; g.notify(); }}>Menu inicial</Btn>
        </div>
      </Panel>
    </div>
  );
}

export function GameOverScreen({ g }: { g: Engine }) {
  const s = g.shift!;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 p-4">
      <Panel className="w-full max-w-md text-center">
        <div className="text-6xl">😵</div>
        <h2 className="mt-2 text-3xl font-black text-red-400">TURNO ENCERRADO</h2>
        <p className="mt-2 text-sm opacity-80">{g.gameOverReason}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-white/5 p-2"><div className="text-lg font-black">{s.score}</div>pontos</div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-lg font-black">{s.entregues}</div>entregues</div>
          <div className="rounded-lg bg-white/5 p-2"><div className="text-lg font-black">{s.erros}</div>erros</div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Btn primary onClick={() => g.restartShift()}>↻ Tentar de novo (Enter)</Btn>
          <Btn onClick={() => g.quitShift()}>Voltar para a cidade</Btn>
        </div>
      </Panel>
    </div>
  );
}

export function SummaryScreen({ g }: { g: Engine }) {
  const r = g.summary!;
  const gains = Object.entries(r.attrGains).filter(([, v]) => (v || 0) > 0);
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-auto bg-black/70 p-3">
      <Panel className="w-full max-w-lg">
        <div className="text-center">
          <div className="text-xs font-black uppercase tracking-widest text-amber-300">Resumo do turno · Dia {r.day}</div>
          <div className="mt-1 text-3xl font-black text-amber-400">{r.avaliacao}</div>
          {r.isHigh && <div className="mt-1 animate-bounce text-sm font-black text-emerald-300">🏆 Novo recorde na tabela!</div>}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          {[['Pontuação', r.score], ['Entregues', r.entregues], ['Processados', r.processados], ['Erros', r.erros], ['Rotas agrupadas', r.rotas], ['Perfeitos', r.perfeitos]].map(([l, v]) => (
            <div key={String(l)} className="rounded-lg bg-white/5 p-2"><div className="text-xl font-black">{v}</div><div className="opacity-70">{l}</div></div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-emerald-900/40 p-3 text-sm ring-1 ring-emerald-400/30">
          <div className="flex justify-between"><span>Salário base</span><span>R$ {r.base}</span></div>
          <div className="flex justify-between"><span>R$ 12 × {r.entregues} pedidos</span><span>R$ {12 * r.entregues}</span></div>
          <div className="flex justify-between"><span>Bônus de desempenho</span><span>+ R$ {r.bonus}</span></div>
          <div className="flex justify-between text-red-300"><span>Penalidades ({r.erros} erros, {r.pendentes} pendentes)</span><span>− R$ {r.penalidade}</span></div>
          <div className="mt-1 flex justify-between border-t border-white/10 pt-1 text-lg font-black text-emerald-300"><span>Recebido</span><span>R$ {r.salario}</span></div>
          <div className="text-right text-xs opacity-70">Carteira: R$ {g.profile.money.toFixed(0)}</div>
        </div>
        {gains.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {gains.map(([k, v]) => <span key={k} className="rounded-full bg-amber-500/20 px-2 py-0.5 font-bold text-amber-200">⬆ {ATTR_LABEL[k as keyof typeof ATTR_LABEL]} +{(v || 0).toFixed(1)}</span>)}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Btn primary onClick={() => g.leaveSummary()}>Voltar ao mundo aberto</Btn>
          <Btn onClick={() => g.restartShift()}>Novo turno</Btn>
        </div>
      </Panel>
    </div>
  );
}

/* ---------- Touch controls ---------- */
export function TouchControls({ g }: { g: Engine }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const idRef = useRef<number | null>(null);
  useEffect(() => {
    const el = base.current!;
    const R = 50;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== idRef.current) return;
      const rect = el.getBoundingClientRect();
      let dx = e.clientX - (rect.left + rect.width / 2);
      let dy = e.clientY - (rect.top + rect.height / 2);
      const l = Math.hypot(dx, dy);
      if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
      setKnob({ x: dx, y: dy, active: true });
      const dead = 0.15;
      const nx = dx / R, ny = dy / R;
      const m = Math.hypot(nx, ny);
      g.setJoystick(m < dead ? 0 : nx, m < dead ? 0 : ny);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== idRef.current) return;
      idRef.current = null;
      setKnob({ x: 0, y: 0, active: false });
      g.setJoystick(0, 0);
    };
    const down = (e: PointerEvent) => {
      if (idRef.current !== null) return;
      idRef.current = e.pointerId;
      el.setPointerCapture(e.pointerId);
      move(e);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [g]);
  return (
    <>
      <div ref={base} className="pointer-events-auto absolute bottom-5 left-5 h-32 w-32 touch-none select-none rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm" style={{ WebkitUserSelect: 'none' }}>
        <div className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full ${knob.active ? 'bg-amber-400' : 'bg-white/60'}`} style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
      </div>
      <button
        className="pointer-events-auto absolute bottom-6 right-6 flex h-24 w-24 touch-none select-none items-center justify-center rounded-full border-4 border-amber-200 bg-gradient-to-b from-amber-300 to-orange-500 text-2xl font-black text-stone-900 shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-none"
        onPointerDown={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); g.pressAction(); }}
        onPointerUp={() => g.releaseAction()}
        onPointerCancel={() => g.releaseAction()}
        onContextMenu={(e) => e.preventDefault()}
      >
        E
      </button>
    </>
  );
}
