"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Hero promo poster.
 *
 * Slams onto the hero once on load, then keeps a continuous attention loop —
 * a breathing gold glow, a light sheen sweeping across, and a softly pulsing
 * seal. Dismissible (remembered for the session). Reduced-motion viewers get
 * the poster at rest with no slam or loop. Colours are the brand tokens inline
 * so the overlay is self-contained.
 */

const CSS = `
.hp-zone{position:absolute; z-index:20; right:clamp(16px,3vw,40px); top:50%; transform:translateY(-50%); width:clamp(212px,24vw,300px);}
.hp-ring{position:absolute; inset:0; margin:auto; width:64%; aspect-ratio:1; border-radius:50%; border:3px solid #fbb24a; opacity:0; transform:scale(.2); pointer-events:none;}
.hp-poster{position:relative; border-radius:20px; padding:22px 22px 20px; text-align:center; opacity:0; transform-origin:72% 26%;
  background:linear-gradient(170deg,#163a5e 0%,#0c1b2e 42%,#08121f 100%); border:1px solid rgba(240,178,90,.5);
  box-shadow:0 30px 70px -26px rgba(0,0,0,.75), inset 0 0 0 1px rgba(255,255,255,.05), 0 0 42px -12px rgba(240,160,51,.32);}
.hp-sheen{position:absolute; inset:0; border-radius:20px; overflow:hidden; pointer-events:none;}
.hp-sheen::before{content:""; position:absolute; top:-30%; left:-70%; width:55%; height:160%;
  background:linear-gradient(100deg, transparent, rgba(255,255,255,.22), transparent); transform:rotate(9deg);}
.hp-close{position:absolute; top:-10px; right:-10px; z-index:3; width:26px; height:26px; border-radius:999px;
  border:1px solid rgba(240,178,90,.5); background:#08121f; color:#f6f1e8; cursor:pointer; font-size:13px; line-height:1; display:grid; place-items:center;}
.hp-close:hover{border-color:#fbb24a;}
.hp-seal{position:absolute; top:-15px; left:50%; z-index:2; transform:translateX(-50%) rotate(-8deg);
  background:linear-gradient(180deg,#fbb24a,#f0a033); color:#2a1905; font-size:.6rem; font-weight:800; letter-spacing:.13em; text-transform:uppercase;
  padding:6px 13px; border-radius:999px; box-shadow:0 10px 24px -10px rgba(240,160,51,.85); white-space:nowrap;}
.hp-lead{margin:14px 0 0; color:#c6bfb2; font-size:.72rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
.hp-price{display:block; margin:2px 0 0; color:#fff; font-family:"Fraunces",Georgia,serif; font-weight:600; font-size:clamp(2.6rem,1.6rem + 3vw,3.4rem); line-height:.95; letter-spacing:-.01em; text-shadow:0 2px 46px rgba(251,178,74,.55);}
.hp-price i{font-style:normal; font-size:.4em; vertical-align:.55em; color:#fbb24a;}
.hp-save{display:inline-block; margin-top:10px; padding:5px 13px; border-radius:999px; font-size:.74rem; font-weight:800; font-family:"Plus Jakarta Sans",system-ui,sans-serif;
  background:rgba(240,178,90,.14); border:1px solid rgba(240,178,90,.45); color:#fbb24a; position:relative;}
.hp-sub{margin:11px 2px 0; color:#c6bfb2; font-size:.76rem; line-height:1.45; font-family:"Plus Jakarta Sans",system-ui,sans-serif; position:relative;}
.hp-cta{display:inline-flex; align-items:center; gap:6px; margin-top:14px; border-radius:11px; padding:10px 18px; position:relative;
  background:linear-gradient(180deg,#fbb24a,#f0a033); color:#2a1905; font-weight:800; font-size:.86rem; text-decoration:none; font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
.hp-cta:hover{filter:brightness(1.03);}
.hp-play .hp-poster{animation:hpSlam .62s cubic-bezier(.18,1.25,.4,1) .6s both, hpGlow 3s ease-in-out 1.5s infinite;}
.hp-play .hp-ring{animation:hpShock .5s ease-out .98s both;}
.hp-play .hp-sheen::before{animation:hpSheen 5s ease-in-out 2s infinite;}
.hp-play .hp-seal{animation:hpSeal 2.4s ease-in-out 1.7s infinite;}
@keyframes hpSlam{0%{opacity:0; transform:scale(2.7) rotate(-16deg); filter:blur(3px);}
  55%{opacity:1; filter:blur(0);}70%{transform:scale(.92) rotate(-6deg);}84%{transform:scale(1.05) rotate(-6deg);}100%{opacity:1; transform:scale(1) rotate(-6deg);}}
@keyframes hpGlow{0%,100%{box-shadow:0 30px 70px -26px rgba(0,0,0,.75), inset 0 0 0 1px rgba(255,255,255,.05), 0 0 40px -14px rgba(240,160,51,.3);}
  50%{box-shadow:0 34px 80px -26px rgba(0,0,0,.8), inset 0 0 0 1px rgba(255,255,255,.09), 0 0 76px -6px rgba(240,160,51,.62);}}
@keyframes hpShock{0%{opacity:.85; transform:scale(.25);}100%{opacity:0; transform:scale(2.9);}}
@keyframes hpSheen{0%{left:-70%;}16%{left:135%;}100%{left:135%;}}
@keyframes hpSeal{0%,100%{transform:translateX(-50%) rotate(-8deg) scale(1);}50%{transform:translateX(-50%) rotate(-8deg) scale(1.09);}}
@media (prefers-reduced-motion:reduce){
  .hp-poster{opacity:1; transform:rotate(-6deg);} .hp-play .hp-poster{animation:none;}
  .hp-ring,.hp-sheen{display:none;} .hp-play .hp-seal{animation:none;}
}
@media (max-width:720px){ .hp-zone{right:12px; top:auto; bottom:12px; transform:none; width:min(62vw,240px);} }
`;

export function HeroPromo() {
  const [closed, setClosed] = useState(false);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("np_promo_closed") === "1") {
        setClosed(true);
        return;
      }
    } catch {
      // sessionStorage can throw (private mode); just show the promo.
    }
    const id = window.setTimeout(() => setPlay(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  if (closed) return null;

  function dismiss() {
    setClosed(true);
    try {
      sessionStorage.setItem("np_promo_closed", "1");
    } catch {
      // ignore
    }
  }

  return (
    <div className={`hp-zone${play ? " hp-play" : ""}`}>
      <style>{CSS}</style>
      <span className="hp-ring" aria-hidden />
      <div className="hp-poster">
        <button type="button" className="hp-close" aria-label="Dismiss offer" onClick={dismiss}>
          ✕
        </button>
        <span className="hp-sheen" aria-hidden />
        <span className="hp-seal">Lowest published rate</span>
        <p className="hp-lead">Full trailer</p>
        <span className="hp-price">
          <i>$</i>449
        </span>
        <br />
        <span className="hp-save">Save up to $350</span>
        <p className="hp-sub">Most North Shore crews charge $560–800 for the same load.</p>
        <Link href="/pricing" className="hp-cta">
          See pricing →
        </Link>
      </div>
    </div>
  );
}
