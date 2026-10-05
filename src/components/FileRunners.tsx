import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import logo from "@/assets/logo.png";

// Arquivos e pastas com perninhas que correm da borda até o ícone central e pulam dentro dele.
// Keyframes rd* ficam em src/index.css. Com prefers-reduced-motion, tudo fica parado.

type Runner = { folder: boolean; c: string; dark?: string; ext?: string };
type Mood = "laugh" | "angry" | "happy" | "cry" | "sad" | "surprised";

const F = (c: string, dark: string): Runner => ({ folder: true, c, dark });
const D = (ext: string, c: string): Runner => ({ folder: false, ext, c });
const TYPES: Runner[] = [
  D("PDF", "#ef4444"), F("#f29f05", "#d97706"), D("XLSX", "#16a34a"), F("#60a5fa", "#2563eb"),
  D("DOCX", "#2563eb"), F("#4ade80", "#16a34a"), D("JPG", "#f29f05"), F("#f472b6", "#db2777"),
  D("MP4", "#8b5cf6"), F("#a78bfa", "#7c3aed"), D("PPTX", "#ea580c"), F("#94a3b8", "#475569"),
];
const MOODS: Mood[] = ["laugh", "angry", "happy", "cry", "sad", "laugh", "angry", "surprised", "surprised", "happy", "cry", "angry"];
const BROWS: Partial<Record<Mood, [number, number, number]>> = { angry: [22, -22, 0], sad: [-18, 18, 0], cry: [-22, 22, 0], surprised: [-8, 8, -3] };
const INK = "#1a1a1a";
const LIMB = "#334155";
const T = 12;
const N = TYPES.length;

const scare = (ev: MouseEvent<HTMLDivElement>) =>
  ev.currentTarget.animate(
    [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-26px) scale(1.12,.92)" }, { transform: "translateY(0) scale(1)" }],
    { duration: 420, easing: "cubic-bezier(.3,1.6,.5,1)" },
  );

function RunnerView({ t, i, on, looking }: { t: Runner; i: number; on: boolean; looking: boolean }) {
  const ang = ((i * 5) % N) * (360 / N) + 15;
  const d = `${(-i * T / N).toFixed(2)}s`;
  const sx = Math.cos((ang * Math.PI) / 180) >= 0 ? 1 : -1;
  const kind = i === 3 ? "Trip" : i === 8 ? "Hes" : "";
  const mood = MOODS[i % 12];
  const anim = (nm: string, dur: number, ease: string, delay = d): CSSProperties =>
    on ? { animation: `${nm} ${dur}s ${ease} ${delay} infinite` } : {};

  const leg = (x: number, s: "A" | "B") => (
    <span style={{ position: "absolute", left: x, top: 51, width: 3.5, height: 8, borderRadius: 2, background: LIMB, transformOrigin: "50% 1px", transform: `rotate(${s === "A" ? 25 : -25}deg)`, ...anim(`rdThigh${s}`, 0.4, "ease-in-out", "0s") }}>
      <span style={{ position: "absolute", left: 0, top: 6.5, width: 3.5, height: 8, borderRadius: 2, background: LIMB, transformOrigin: "50% 1.5px", ...anim(`rdShin${s}`, 0.4, "ease-in-out", "0s") }}>
        <span style={{ position: "absolute", left: -0.5, bottom: -1, width: 6, height: 3, borderRadius: 2, background: LIMB }} />
      </span>
    </span>
  );

  const pupil: CSSProperties = looking
    ? { transform: "translate(var(--ex,0px),var(--ey,0px))", transition: "transform .15s ease-out" }
    : anim("rdLook", 2.2 + (i % 3) * 0.5, "ease-in-out", `${i * 0.3}s`);
  const eye = (
    <span style={{ position: "relative", width: 10, height: 11, borderRadius: "50%", background: "#fff", border: `1.5px solid ${INK}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: INK, ...pupil }} />
    </span>
  );

  const face = (l: number, tp: number) => {
    const brow = BROWS[mood];
    const cx = l + 11.5, mt = tp + 14;
    const base: CSSProperties = { position: "absolute", boxSizing: "border-box" };
    let mouth;
    if (mood === "happy") mouth = <span style={{ ...base, left: cx - 5, top: mt, width: 10, height: 5, border: `2px solid ${INK}`, borderTop: "none", borderRadius: "0 0 10px 10px" }} />;
    else if (mood === "laugh") mouth = (
      <span style={{ ...base, left: cx - 6.5, top: mt - 1, width: 13, height: 8, background: "#7f1d1d", border: `1.5px solid ${INK}`, borderRadius: "2px 2px 8px 8px", overflow: "hidden", transformOrigin: "50% 0", ...anim("rdLaugh", 0.22, "ease-in-out", "0s") }}>
        <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2.5, background: "#fff" }} />
        <span style={{ position: "absolute", left: 2, right: 2, bottom: -2, height: 4, borderRadius: "50%", background: "#f87171" }} />
      </span>
    );
    else if (mood === "angry") mouth = <span style={{ ...base, left: cx - 6, top: mt + 1, width: 12, height: 5, background: "#fff", border: `1.5px solid ${INK}`, borderRadius: 2, backgroundImage: `linear-gradient(90deg,transparent 3.5px,${INK} 3.5px 4.5px,transparent 4.5px 7px,${INK} 7px 8px,transparent 8px)` }} />;
    else if (mood === "surprised") mouth = <span style={{ ...base, left: cx - 3.5, top: mt, width: 7, height: 8, borderRadius: "50%", background: "#7f1d1d", border: `1.5px solid ${INK}` }} />;
    else mouth = <span style={{ ...base, left: cx - 5, top: mt + 2, width: 10, height: 5, border: `2px solid ${INK}`, borderBottom: "none", borderRadius: "10px 10px 0 0", ...(mood === "cry" ? anim("rdWobble", 0.3, "ease-in-out", "0s") : {}) }} />;

    return (
      <>
        {brow && [0, 1].map((k) => (
          <span key={`b${k}`} style={{ position: "absolute", left: l + (k ? 13 : 0), top: tp - 5 + brow[2], width: 10, height: 2.5, borderRadius: 2, background: INK, transform: `rotate(${brow[k]}deg)` }} />
        ))}
        {mood === "laugh" ? (
          <div style={{ position: "absolute", left: l, top: tp + 3, display: "flex", gap: 4 }}>
            {[0, 1].map((k) => <span key={k} style={{ width: 9, height: 5, border: `2px solid ${INK}`, borderBottom: "none", borderRadius: "10px 10px 0 0", boxSizing: "border-box" }} />)}
          </div>
        ) : (
          <div style={{ position: "absolute", left: l, top: tp, display: "flex", gap: 3, transformOrigin: "50% 50%", ...anim("rdBlink", 2.4 + (i % 3) * 0.7, "linear", `${i * 0.45}s`) }}>
            {eye}{eye}
          </div>
        )}
        {mouth}
        {(mood === "happy" || mood === "laugh") && [0, 1].map((k) => (
          <span key={`bl${k}`} style={{ position: "absolute", left: l + (k ? 21 : -4), top: tp + 11, width: 6, height: 4, borderRadius: "50%", background: "#fb7185", opacity: 0.55 }} />
        ))}
        {mood === "cry" && on && [0, 1].flatMap((k) => [0, 1].map((j) => (
          <span key={`t${k}${j}`} style={{ position: "absolute", left: l + (k ? 17 : 3), top: tp + 9, width: 4, height: 6, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#38bdf8", opacity: 0, ...anim("rdTear", 0.7, "ease-in", `${j * 0.35 + k * 0.17}s`) }} />
        )))}
        {mood === "angry" && <span style={{ position: "absolute", left: l + 24, top: tp - 10, fontSize: 10, fontWeight: 800, lineHeight: 1, color: "#ef4444" }}>#</span>}
      </>
    );
  };

  const body = t.folder ? (
    <>
      <div style={{ position: "absolute", left: 2, top: 10, width: 20, height: 10, borderRadius: "5px 5px 0 0", background: t.dark }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 15, bottom: 3, borderRadius: 6, background: t.dark }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 21, bottom: 3, borderRadius: 6, background: t.c, boxShadow: "0 4px 8px -2px rgba(0,0,0,.15)" }} />
      {face(13, 26)}
    </>
  ) : (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, boxShadow: "0 4px 8px -2px rgba(0,0,0,.12)", clipPath: "polygon(0 0,70% 0,100% 22%,100% 100%,0 100%)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "22%", background: "#e2e8f0", borderBottomLeftRadius: 4 }} />
      {face(8, 13)}
      <span style={{ position: "absolute", left: 6, bottom: 6, fontSize: 9, fontWeight: 700, lineHeight: 1, color: "#fff", background: t.c, borderRadius: 3, padding: "2px 4px", letterSpacing: ".02em" }}>{t.ext}</span>
    </>
  );

  const lx = t.folder ? [14, 29] : [13, 26];
  const puff = (k: number) => (
    <span key={`pf${k}`} style={{ position: "absolute", left: sx > 0 ? -2 : 34, top: 58, width: 9, height: 9, borderRadius: "50%", background: "#e2e8f0", opacity: 0, ...anim("rdDust", 0.5, "ease-out", `${k * 0.25}s`) }} />
  );

  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${ang}deg)` }}>
      <div style={{ position: "absolute", left: 0, top: "50%", width: "50%", height: 0 }}>
        <div style={{ position: "absolute", left: on ? "4%" : "30%", top: 0, ...anim(`rdRun${kind}`, T, "linear") }}>
          <div style={{ transform: `translate(-50%,-50%) rotate(${-ang}deg)`, "--fall": `${sx * 80}deg`, "--lean": `${-sx * 10}deg`, "--dx": `${-sx * 12}px` } as CSSProperties}>
            {on && [puff(0), puff(1)]}
            <div style={{ transformOrigin: "50% 100%", ...anim(`rdJump${kind}`, T, "ease-in-out") }}>
              <div onMouseEnter={scare} style={{ pointerEvents: "auto", cursor: "pointer" }}>
                <div style={{ position: "relative", width: t.folder ? 48 : 44, height: 54, ...anim("rdBob", 0.4, "ease-in-out", "0s") }}>
                  {body}
                  {kind === "Hes" && on && (
                    <span style={{ position: "absolute", right: -4, top: 4, width: 5, height: 7, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#7dd3fc", opacity: 0, ...anim("rdSweat", 0.9, "ease-in", "0s") }} />
                  )}
                  {leg(lx[0], "A")}
                  {leg(lx[1], "B")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileRunners() {
  const [on] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [looking, setLooking] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  // Pupilas seguem o cursor enquanto o mouse se move; voltam a "olhar em volta" após 1,8s parado.
  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    const onMove = (ev: globalThis.MouseEvent) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2), m = Math.hypot(dx, dy) || 1;
      el.style.setProperty("--ex", `${((dx / m) * 2.5).toFixed(2)}px`);
      el.style.setProperty("--ey", `${((dy / m) * 2.5).toFixed(2)}px`);
      setLooking(true);
      clearTimeout(idle);
      idle = setTimeout(() => setLooking(false), 1800);
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(idle); };
  }, []);

  return (
    <div className="relative w-full max-w-[560px] aspect-square">
      <svg viewBox="0 0 560 560" className="absolute inset-0 w-full h-full overflow-visible">
        <circle cx="280" cy="280" r="130" fill="#f29f05" fillOpacity=".06" />
        <circle cx="280" cy="280" r="210" fill="none" stroke="#f1f5f9" strokeWidth="1" />
        {on && [0, 1.5].map((bg) => (
          <circle key={bg} cx="280" cy="280" r="80" fill="none" stroke="#f29f05" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="76;150" dur="3s" begin={`${bg}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values=".35;0" dur="3s" begin={`${bg}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
      <div ref={stage} className="absolute inset-0 pointer-events-none">
        {TYPES.map((t, i) => <RunnerView key={i} t={t} i={i} on={on} looking={looking} />)}
      </div>
      <div className="absolute left-1/2 top-1/2 w-[26%] aspect-square -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-105">
        <img
          src={logo}
          alt="Rottas Drive"
          className="w-full h-full object-contain block"
          style={{ filter: "drop-shadow(0 10px 18px rgba(242,159,5,.3))", ...(on ? { animation: "rdGulp 1s ease-out infinite" } : {}) }}
        />
      </div>
    </div>
  );
}
