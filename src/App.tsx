import { useEffect, useRef, useState } from 'react';
import { Engine } from './game/engine';
import { render } from './game/render';
import { DialogueBox, GameOverScreen, Hud, PauseScreen, StartScreen, SummaryScreen, TouchControls } from './components/Overlays';

export default function App() {
  const engineRef = useRef<Engine | null>(null);
  if (!engineRef.current) engineRef.current = new Engine();
  const g = engineRef.current;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const unsub = g.subscribe(() => setTick((t) => t + 1));
    g.start();
    const mq = window.matchMedia('(pointer: coarse)');
    setTouch(mq.matches);
    const onT = () => setTouch(true);
    window.addEventListener('touchstart', onT, { once: true, passive: true });

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    const resize = () => {
      const wrap = wrapRef.current!;
      const cw = wrap.clientWidth, ch = wrap.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const aspect = cw / ch;
      // logical viewport: keep ~600px tall landscape, ~520px wide portrait
      let vw: number, vh: number;
      if (aspect >= 1) { vh = 600; vw = Math.round(600 * aspect); } else { vw = 520; vh = Math.round(520 / aspect); }
      g.viewW = vw; g.viewH = vh;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      render(ctx, g);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      unsub();
      g.stop();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('touchstart', onT);
    };
  }, [g]);

  const inGame = g.scene === 'world' || g.scene === 'shift';
  return (
    <div ref={wrapRef} className="relative h-[100dvh] w-screen select-none overflow-hidden bg-stone-950 font-sans" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} className="block" />
      <div className="pointer-events-none absolute inset-0">
        {g.scene === 'start' && <StartScreen g={g} />}
        {inGame && <Hud g={g} />}
        {g.scene === 'shift' && g.shift?.phase === 'prep' && !g.dialogue && !g.paused && (
          <div className="pointer-events-none absolute bottom-24 left-1/2 hidden -translate-x-1/2 sm:block" />
        )}
        {inGame && touch && !g.dialogue && !g.paused && <TouchControls g={g} />}
        {g.dialogue && <DialogueBox g={g} />}
        {g.paused && inGame && <PauseScreen g={g} />}
        {g.scene === 'gameover' && <GameOverScreen g={g} />}
        {g.scene === 'summary' && <SummaryScreen g={g} />}
      </div>
    </div>
  );
}
