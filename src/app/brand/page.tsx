import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Book",
  description: "NorthPeak Junk Removal brand book — logo, colour palette, typography, and voice.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/brand" },
};

const CSS = `
.bb{--bb-display:var(--font-hero-display),"Iowan Old Style","Palatino Linotype",Georgia,ui-serif,serif;
  --bb-body:var(--font-plus-jakarta),ui-sans-serif,system-ui,sans-serif;
  background:var(--paper);color:var(--navy);font-family:var(--bb-body);line-height:1.6;min-height:100vh}
.bb *{box-sizing:border-box}
.bb-wrap{max-width:62rem;margin:0 auto;padding-inline:clamp(16px,5vw,56px)}
.bb section{padding-block:clamp(40px,7vw,76px);border-top:1px solid var(--cream-deep)}
.bb h1,.bb h2,.bb h3{font-family:var(--bb-display);text-wrap:balance;margin:0;font-weight:600;letter-spacing:-.01em}
.bb p{margin:0}
.bb-eyebrow{font-size:.74rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gold-deep);margin:0 0 1rem}
.bb-cover{border-top:none;padding-top:clamp(48px,9vw,110px)}
.bb-wordmark{font-family:var(--bb-display);font-weight:900;font-size:clamp(2.9rem,12vw,6.2rem);line-height:.95;letter-spacing:-.03em;margin:0;color:var(--navy)}
.bb-wordmark .pk{color:var(--gold)}
.bb-tagline{font-family:var(--bb-display);font-weight:400;font-style:italic;font-size:clamp(1.3rem,4.5vw,2rem);color:var(--stone);margin-top:1.1rem}
.bb-lede{max-width:44ch;margin-top:1.6rem;color:var(--stone);font-size:1.05rem}
.bb-navrow{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2.2rem}
.bb-navrow a{font-size:.82rem;font-weight:600;text-decoration:none;color:var(--navy);border:1px solid var(--cream-deep);border-radius:999px;padding:.4rem .9rem;background:#fff}
.bb-navrow a:hover{border-color:var(--gold)}
.bb-h{font-size:clamp(1.6rem,4.5vw,2.3rem)}
.bb-sub{color:var(--stone);margin-top:.7rem;max-width:60ch}
.bb-principles{display:grid;gap:14px;margin-top:1.8rem}
.bb-card{background:#fff;border:1px solid var(--cream-deep);border-radius:16px;padding:1.2rem 1.25rem}
.bb-principles .bb-card{display:grid;gap:.3rem}
.bb-principles b{font-family:var(--bb-display);font-size:1.1rem;font-weight:600}
.bb-principles span{color:var(--stone);font-size:.95rem}
.bb-specimen{background:var(--cream);border:1px solid var(--cream-deep);border-radius:16px;padding:clamp(18px,4vw,32px);margin-top:1.6rem}
.bb-grouplabel{font-weight:700;font-size:.9rem;margin:1.8rem 0 .2rem;letter-spacing:.02em}
.bb-swgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:.9rem}
.bb-sw{border:1px solid var(--cream-deep);border-radius:14px;overflow:hidden;background:#fff}
.bb-sw .chip{height:92px;display:flex;align-items:flex-end;padding:.6rem .7rem;font-weight:700;font-size:.8rem}
.bb-sw .meta{padding:.6rem .7rem .75rem}
.bb-sw .nm{font-weight:600;font-size:.9rem}
.bb-sw .hex{font-variant-numeric:tabular-nums;color:var(--stone);font-size:.8rem;letter-spacing:.02em;margin-top:.15rem}
.bb-spec-label{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:baseline;color:var(--stone);font-size:.82rem;margin-bottom:1rem}
.bb-spec-label b{color:var(--navy);font-size:.95rem;font-family:var(--bb-display)}
.bb-disp{font-family:var(--bb-display)}
.bb-scale>div{border-top:1px dashed var(--cream-deep);padding:.5rem 0;display:flex;gap:1rem;align-items:baseline;flex-wrap:wrap}
.bb-scale .tag{font-size:.72rem;color:var(--stone);min-width:7rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.bb-glyphs{font-family:var(--bb-display);font-size:clamp(1.4rem,5vw,2.2rem);letter-spacing:.04em;margin-top:1rem;color:var(--stone)}
.bb-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:1.8rem}
.bb-card.do{border-top:3px solid #3f8f5b}
.bb-card.dont{border-top:3px solid #b4543f}
.bb-card h3{font-size:1.05rem;font-family:var(--bb-body);font-weight:700;margin-bottom:.6rem}
.bb-card ul{margin:0;padding-left:1.1rem;color:var(--stone);font-size:.93rem;display:grid;gap:.45rem}
.bb-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-top:1.8rem}
.bb-fact{background:#fff;border:1px solid var(--cream-deep);border-radius:14px;padding:1rem 1.1rem}
.bb-fact .k{font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-deep);font-weight:700}
.bb-fact .v{margin-top:.4rem;font-weight:600;font-size:.98rem;overflow-wrap:anywhere}
.bb-fact .v small{display:block;font-weight:400;color:var(--stone);margin-top:.2rem;font-size:.85rem}
.bb-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.9rem}
.bb-chips span{font-size:.85rem;font-weight:600;background:var(--cream);border:1px solid var(--cream-deep);border-radius:999px;padding:.35rem .85rem}
.bb-foot{padding-block:2.2rem;color:var(--stone);font-size:.82rem;border-top:1px solid var(--cream-deep)}
@media (max-width:560px){.bb-cols{grid-template-columns:1fr}}
`;

function Swatch({ bg, fg, name, hex }: { bg: string; fg: string; name: string; hex: string }) {
  return (
    <div className="bb-sw">
      <div className="chip" style={{ background: bg, color: fg }}>
        Aa
      </div>
      <div className="meta">
        <div className="nm">{name}</div>
        <div className="hex">{hex}</div>
      </div>
    </div>
  );
}

export default function BrandBookPage() {
  return (
    <div className="bb">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bb-wrap">
        <section className="bb-cover">
          <p className="bb-eyebrow">Brand Book</p>
          <h1 className="bb-wordmark">
            North<span className="pk">Peak</span>
          </h1>
          <p className="bb-tagline">More Space. A Better Tomorrow.</p>
          <p className="bb-lede">
            The visual and verbal identity for NorthPeak Junk Removal — a local crew recovering
            space across North Vancouver and the North Shore. Everything a designer or an agent
            needs to keep the brand consistent.
          </p>
          <nav className="bb-navrow">
            <a href="#brand">Brand</a>
            <a href="#logo">Logo</a>
            <a href="#color">Colour</a>
            <a href="#type">Type</a>
            <a href="#voice">Voice</a>
            <a href="#facts">Facts</a>
          </nav>
        </section>

        <section id="brand">
          <p className="bb-eyebrow">01 — The brand</p>
          <h2 className="bb-h">Honest, local, and upfront.</h2>
          <p className="bb-sub">
            NorthPeak is the North Shore crew that quotes the real number before the truck rolls
            and sorts the load donation-first. Premium work, plainly spoken — no franchise
            call-centre, no driveway re-quote.
          </p>
          <div className="bb-principles">
            <div className="bb-card">
              <b>Promise</b>
              <span>
                “The range you approve is the range you pay.” Free photo estimates, confirmed on
                arrival before anyone lifts anything.
              </span>
            </div>
            <div className="bb-card">
              <b>Character</b>
              <span>
                Calm, competent, kind. We name real neighbourhoods and real trade-offs instead of
                selling.
              </span>
            </div>
            <div className="bb-card">
              <b>Ethic</b>
              <span>
                Reuse and recycle first, landfill last — usable goods go to North Shore charities
                and thrift partners.
              </span>
            </div>
          </div>
        </section>

        <section id="logo">
          <p className="bb-eyebrow">02 — Logo &amp; wordmark</p>
          <h2 className="bb-h">The wordmark</h2>
          <p className="bb-sub">
            Set in Fraunces, heavy weight. “North” in the brand navy, “Peak” in brand gold. Keep
            clear space around it equal to the height of the “N”, and never stretch, recolour
            outside the palette, or add effects.
          </p>
          <div className="bb-specimen" style={{ textAlign: "center" }}>
            <div className="bb-wordmark" style={{ fontSize: "clamp(2.4rem,11vw,5rem)" }}>
              North<span className="pk">Peak</span>
            </div>
            <p style={{ color: "var(--stone)", marginTop: ".6rem", fontSize: ".85rem" }}>
              Primary wordmark · navy + gold
            </p>
          </div>
        </section>

        <section id="color">
          <p className="bb-eyebrow">03 — Colour</p>
          <h2 className="bb-h">Palette</h2>
          <p className="bb-sub">
            Navy carries the brand; cream is the ground; gold is the single accent — used once per
            idea, never as a wash. Stone is for muted text. Hex values are exact.
          </p>

          <div className="bb-grouplabel">Navy — primary</div>
          <div className="bb-swgrid">
            <Swatch bg="#0c1b2e" fg="#f6f1e8" name="Navy" hex="#0C1B2E" />
            <Swatch bg="#08121f" fg="#f6f1e8" name="Navy Deep" hex="#08121F" />
            <Swatch bg="#16324f" fg="#f6f1e8" name="Navy Soft" hex="#16324F" />
          </div>

          <div className="bb-grouplabel">Gold — accent</div>
          <div className="bb-swgrid">
            <Swatch bg="#f0a033" fg="#0c1b2e" name="Gold" hex="#F0A033" />
            <Swatch bg="#96631f" fg="#f6f1e8" name="Gold Deep" hex="#96631F" />
            <Swatch bg="#fbb24a" fg="#0c1b2e" name="Gold Glow" hex="#FBB24A" />
          </div>

          <div className="bb-grouplabel">Cream &amp; neutrals</div>
          <div className="bb-swgrid">
            <Swatch bg="#f6f1e8" fg="#0c1b2e" name="Cream" hex="#F6F1E8" />
            <Swatch bg="#ece4d6" fg="#0c1b2e" name="Cream Deep" hex="#ECE4D6" />
            <Swatch bg="#fbf8f2" fg="#0c1b2e" name="Paper" hex="#FBF8F2" />
            <Swatch bg="#6d675f" fg="#f6f1e8" name="Stone" hex="#6D675F" />
            <Swatch bg="#c8c0b3" fg="#0c1b2e" name="Stone Soft" hex="#C8C0B3" />
          </div>
        </section>

        <section id="type">
          <p className="bb-eyebrow">04 — Typography</p>
          <h2 className="bb-h">Two faces</h2>
          <p className="bb-sub">
            Fraunces (serif) for display and headlines — warm and premium. Plus Jakarta Sans for
            everything you read and operate. The admin panel adds Inter and Vazirmatn for the
            Persian cockpit.
          </p>

          <div className="bb-specimen">
            <div className="bb-spec-label">
              <b>Fraunces</b>
              <span>Display / headlines · 400–900</span>
            </div>
            <div
              className="bb-disp"
              style={{
                fontSize: "clamp(2rem,8vw,3.4rem)",
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: "-.02em",
              }}
            >
              More Space.
              <br />A Better Tomorrow.
            </div>
            <div className="bb-glyphs">AaBbCc 0123 &amp; ?!</div>
          </div>

          <div className="bb-specimen">
            <div className="bb-spec-label">
              <b>Plus Jakarta Sans</b>
              <span>Body / UI · 400–700</span>
            </div>
            <p style={{ fontSize: "1.05rem", maxWidth: "60ch" }}>
              Send a few photos of the pile and get a clear price range back, usually within hours.
              We confirm it on arrival before anyone lifts anything — the figure you approve is the
              figure you pay.
            </p>
            <div className="bb-scale" style={{ marginTop: "1.2rem" }}>
              <div>
                <span className="tag">Display</span>
                <span className="bb-disp" style={{ fontSize: "2rem", fontWeight: 600 }}>
                  Junk removal, done right
                </span>
              </div>
              <div>
                <span className="tag">Heading</span>
                <span className="bb-disp" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                  North Shore service
                </span>
              </div>
              <div>
                <span className="tag">Body</span>
                <span style={{ fontSize: "1rem" }}>Same-week pickup across the North Shore.</span>
              </div>
              <div>
                <span className="tag">Label / caps</span>
                <span
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 700,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                  }}
                >
                  Free estimate
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="voice">
          <p className="bb-eyebrow">05 — Voice &amp; tone</p>
          <h2 className="bb-h">How NorthPeak sounds</h2>
          <p className="bb-sub">
            Canadian English (neighbourhood, labour, cheque). Honest, specific, and calm. Name real
            places and real trade-offs; never hype.
          </p>
          <div className="bb-cols">
            <div className="bb-card do">
              <h3>Do</h3>
              <ul>
                <li>Give real ranges: “a full truck is roughly $649–799.”</li>
                <li>Name neighbourhoods and access quirks (Lonsdale elevators, Deep Cove lanes).</li>
                <li>Say when DIY is cheaper, or when a load can’t be diverted from landfill.</li>
                <li>Short, direct sentences. Active voice.</li>
              </ul>
            </div>
            <div className="bb-card dont">
              <h3>Don’t</h3>
              <ul>
                <li>No “we’re the best!” claims or invented statistics.</li>
                <li>No fake urgency or exclamation-heavy hype.</li>
                <li>No call-centre vagueness or driveway re-quotes.</li>
                <li>No American spelling in customer copy.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="facts">
          <p className="bb-eyebrow">06 — Brand facts</p>
          <h2 className="bb-h">The essentials</h2>
          <p className="bb-sub">
            Use this name, city, and phone byte-for-byte everywhere — the exact match is what local
            search rewards. The exact street address is kept private (service-area business) and
            lives only on the verified Google Business Profile.
          </p>
          <div className="bb-facts">
            <div className="bb-fact">
              <div className="k">Business</div>
              <div className="v">
                NorthPeak Junk Removal
                <small>Service-area business · North Shore based</small>
              </div>
            </div>
            <div className="bb-fact">
              <div className="k">Location</div>
              <div className="v">
                North Vancouver, BC
                <small>Service-area business · exact address kept private</small>
              </div>
            </div>
            <div className="bb-fact">
              <div className="k">Phone</div>
              <div className="v">+1 (778) 900-5060</div>
            </div>
            <div className="bb-fact">
              <div className="k">Email</div>
              <div className="v">info@northpeakjunk.com</div>
            </div>
            <div className="bb-fact">
              <div className="k">Website</div>
              <div className="v">northpeakjunk.com</div>
            </div>
            <div className="bb-fact">
              <div className="k">Hours</div>
              <div className="v">
                8:00 AM – 6:00 PM
                <small>Seven days a week</small>
              </div>
            </div>
            <div className="bb-fact">
              <div className="k">Area served</div>
              <div className="v">
                North &amp; West Vancouver
                <small>+ Greater Vancouver, BC</small>
              </div>
            </div>
            <div className="bb-fact">
              <div className="k">Social</div>
              <div className="v">
                @northpeakjunk
                <small>Instagram · X</small>
              </div>
            </div>
          </div>
          <div className="bb-grouplabel">Services</div>
          <div className="bb-chips">
            <span>Junk Removal</span>
            <span>Furniture Removal</span>
            <span>Garage Cleanout</span>
            <span>Estate Cleanout</span>
            <span>Construction Cleanup</span>
            <span>Commercial Cleanout</span>
            <span>Mattress &amp; Appliance</span>
          </div>
        </section>

        <div className="bb-foot">NorthPeak Junk Removal — Brand Book · More Space. A Better Tomorrow.</div>
      </div>
    </div>
  );
}
