// Injects all KoyJabo keyframe animations once into the document
export function injectGlobalStyles() {
  if (document.getElementById('kj-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'kj-global-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap');

    html, body { margin: 0; padding: 0; background: #05060b; font-family: 'Inter', system-ui, sans-serif; }
    * { box-sizing: border-box; }
    #root { min-height: 100vh; }

    .kj-screen, .kj-screen * { scrollbar-width: none; }
    .kj-screen *::-webkit-scrollbar { display: none; }

    /* Clip horizontal overflow — scroller is the true scroll boundary */
    .kj-screen { overflow-x: clip; }
    .kj-screen h1, .kj-screen h2, .kj-screen p { word-break: break-word; overflow-wrap: break-word; }

    /* Prevent grid/flex children from overflowing their column allocation */
    .kj-screen [style*="display: grid"] > *,
    .kj-screen [style*="display:grid"] > * { min-width: 0; }
    .kj-screen [style*="display: flex"] > *,
    .kj-screen [style*="display:flex"] > * { min-width: 0; }

    /* Scrollable chip rows */
    .kj-chips-scroll { overflow-x: auto; scrollbar-width: none; flex-wrap: nowrap !important; }
    .kj-chips-scroll::-webkit-scrollbar { display: none; }

    @media (prefers-reduced-motion: no-preference) {
      .kj-fwd  { animation: kjIn   .26s cubic-bezier(.2,.7,.25,1) both; }
      .kj-back { animation: kjBack .26s cubic-bezier(.2,.7,.25,1) both; }
    }
    @keyframes kjIn   { from { transform: translateY(10px); } to { transform: none; } }
    @keyframes kjBack { from { transform: translateY(-8px); } to { transform: none; } }

    @keyframes kjpulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
    .kj-anim-pulse { animation: kjpulse 2.4s ease-in-out infinite; }
    .kj-anim-glow  { animation: kjpulse 2.4s ease-in-out infinite; }

    @keyframes kjShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @keyframes kjAiFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes kjAiRing  { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.9); opacity: 0; } }
    @keyframes kjAiBlink { 0%,90%,100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
    @keyframes kjAiThink { 0%,80%,100% { transform: scale(0.5); opacity: 0.35; } 40% { transform: scale(1); opacity: 1; } }
    .kj-ai-eye  { transform-box: fill-box; transform-origin: center; animation: kjAiBlink 3.4s ease-in-out infinite; }
    .kj-ai-eye2 { transform-box: fill-box; transform-origin: center; animation: kjAiBlink 3.4s ease-in-out infinite; animation-delay: .12s; }

    @keyframes kjLoadBar { 0% { transform: translateX(-120%); } 100% { transform: translateX(330%); } }
    @keyframes kjFloatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    @keyframes kjWheel { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    @keyframes kjBobY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes kjPopIn { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes kjSpark { 0%,100% { transform: scale(.6); opacity: .2; } 50% { transform: scale(1.1); opacity: 1; } }
    @keyframes kjRollIn { 0% { transform: translateX(260px); } 70% { transform: translateX(-12px); } 100% { transform: translateX(0); } }
    @keyframes kjDriveBy { 0% { transform: translateX(380px); } 100% { transform: translateX(-200px); } }
    @keyframes kjStoryIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    .kj-story-scene { animation: kjStoryIn .5s cubic-bezier(.2,.7,.25,1) both; }
    @keyframes kjMapPulse { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,.5); } 70% { box-shadow: 0 0 0 14px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }

    /* 3D vehicle animations */
    @keyframes kj-drive   { 0% { transform: translateX(-34%); } 100% { transform: translateX(134%); } }
    @keyframes kj-fly     { 0% { transform: translate(-24%, 22%) rotate(-7deg); } 50% { transform: translate(38%, 4%) rotate(-3deg); } 100% { transform: translate(132%, 22%) rotate(-7deg); } }
    @keyframes kj-train   { 0% { transform: translateX(-42%); } 100% { transform: translateX(142%); } }
    @keyframes kj-sail    { 0% { transform: translateX(-28%); } 100% { transform: translateX(128%); } }
    @keyframes kj-bob     { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(0.4deg); } }
    @keyframes kj-bob-sm  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes kj-bank    { 0%, 100% { transform: rotate(-2.5deg) translateY(0); } 50% { transform: rotate(1.5deg) translateY(-5px); } }
    @keyframes kj-rock    { 0%, 100% { transform: rotate(-1.6deg) translateY(0); } 50% { transform: rotate(1.6deg) translateY(-4px); } }
    @keyframes kj-suspend { 0%, 100% { transform: translateY(0); } 20% { transform: translateY(-1.4px); } 55% { transform: translateY(0.9px); } 80% { transform: translateY(-0.5px); } }
    @keyframes kj-spin    { from { transform: rotate(0); } to { transform: rotate(360deg); } }
    @keyframes kj-pulse   { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.08); } }
    @keyframes kj-dash    { to { stroke-dashoffset: -40; } }
    @keyframes kj-blink   { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
    @keyframes kj-smoke   { 0% { transform: translateY(0) scale(0.7); opacity: 0; } 25% { opacity: 0.55; } 100% { transform: translateY(-34px) scale(2.2); opacity: 0; } }
    @keyframes kj-streak  { 0% { transform: translateX(40%) scaleX(0.4); opacity: 0; } 30% { opacity: 0.9; } 100% { transform: translateX(-160%) scaleX(1); opacity: 0; } }
    @keyframes kj-shine   { 0% { transform: translateX(-120%) skewX(-18deg); } 60%,100% { transform: translateX(320%) skewX(-18deg); } }
    @keyframes kj-wake    { 0% { transform: scaleX(0.4); opacity: 0.7; } 100% { transform: scaleX(1.6); opacity: 0; } }
    @keyframes kj-spark   { 0%, 92%, 100% { opacity: 0; } 95% { opacity: 1; } }
    @keyframes kj-prop    { from { transform: scaleX(1); opacity: 0.5; } 50% { transform: scaleX(0.15); opacity: 0.9; } to { transform: scaleX(1); opacity: 0.5; } }
    .kj-anim-drive   { animation: kj-drive 9s linear infinite; transform-origin: center; }
    .kj-anim-fly     { animation: kj-fly 11s ease-in-out infinite; }
    .kj-anim-train   { animation: kj-train 7s linear infinite; }
    .kj-anim-sail    { animation: kj-sail 16s linear infinite; }
    .kj-anim-bob     { animation: kj-bob 2.4s ease-in-out infinite; }
    .kj-anim-bob-sm  { animation: kj-bob-sm 1.6s ease-in-out infinite; }
    .kj-anim-bank    { animation: kj-bank 4.5s ease-in-out infinite; }
    .kj-anim-rock    { animation: kj-rock 3.6s ease-in-out infinite; }
    .kj-anim-suspend { animation: kj-suspend 0.9s ease-in-out infinite; }
    .kj-anim-spin    { animation: kj-spin 0.55s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
    .kj-anim-spin-slow { animation: kj-spin 6s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }
    .kj-anim-dash    { stroke-dasharray: 12 8; animation: kj-dash 1.6s linear infinite; }
    .kj-anim-blink   { animation: kj-blink 1.3s ease-in-out infinite; }
    .kj-anim-prop    { animation: kj-prop 0.12s linear infinite; transform-origin: 50% 50%; transform-box: fill-box; }

    /* Futuristic skin */
    :root {
      --kj-neon-cyan: #00f5ff;
      --kj-neon-magenta: #ff2a6d;
      --kj-neon-violet: #a259ff;
      --kj-neon-amber: #ffb800;
    }
    .kj-future-bg {
      position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
    }
    .kj-future-bg::before {
      content: ''; position: absolute; inset: -2px;
      background-image:
        linear-gradient(rgba(0,245,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,245,255,0.08) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse at center top, #000 25%, transparent 75%);
      -webkit-mask-image: radial-gradient(ellipse at center top, #000 25%, transparent 75%);
      animation: kj-grid-shift 20s linear infinite;
    }
    .kj-future-bg::after {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(800px circle at 20% 0%, rgba(0,245,255,0.10), transparent 60%),
        radial-gradient(600px circle at 90% 30%, rgba(255,42,109,0.08), transparent 60%),
        radial-gradient(700px circle at 50% 100%, rgba(162,89,255,0.10), transparent 60%);
      animation: kj-aurora 18s ease-in-out infinite alternate;
    }
    @keyframes kj-grid-shift { from { transform: translate(0,0); } to { transform: translate(40px,40px); } }
    @keyframes kj-aurora { 0%,100% { opacity: 0.9; } 50% { opacity: 1; } }

    /* Leaflet map */
    .kj-map { background: #aadaff; }
    .kj-map .leaflet-control-attribution { font-family: 'Inter', sans-serif; font-size: 9px; }
    .kj-map .leaflet-bar { display: none; }
    .kj-stop-dot { background: #fff; border: 2px solid #e1126b; border-radius: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
    .kj-pill-marker { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; font-family: 'Inter',sans-serif; font-weight: 700; font-size: 11px; color: #fff; padding: 4px 10px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); transform: translate(-50%,-130%); }
    .kj-marker-wrap { background: transparent !important; border: 0 !important; }

    .kj-photo-del { opacity: 0; transition: opacity .15s ease; pointer-events: none; }
    .kj-photo:hover .kj-photo-del, .kj-photo:focus-within .kj-photo-del { opacity: 1; pointer-events: auto; }
    @media (hover: none) { .kj-photo-del { opacity: 1; pointer-events: auto; } }

    [style*="border-radius: 16px"], [style*="border-radius: 18px"],
    [style*="border-radius: 20px"], [style*="border-radius: 22px"],
    [style*="border-radius: 24px"] {
      backdrop-filter: blur(16px) saturate(135%);
      -webkit-backdrop-filter: blur(16px) saturate(135%);
    }

    /* kj-screen clips horizontal overflow — scroller is the true scroll boundary */
    .kj-screen { overflow-x: clip; }
    .kj-screen h1, .kj-screen h2, .kj-screen p {
      word-break: break-word;
      overflow-wrap: break-word;
    }
    /* Fix grid/flex children so right-side content never overflows or hides */
    .kj-screen [style*="display: grid"] > *,
    .kj-screen [style*="display:grid"] > * {
      min-width: 0;
    }
    /* Scrollable chip rows — hide scrollbar */
    .kj-chips-scroll { overflow-x: auto; scrollbar-width: none; flex-wrap: nowrap !important; }
    .kj-chips-scroll::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(style);
}
