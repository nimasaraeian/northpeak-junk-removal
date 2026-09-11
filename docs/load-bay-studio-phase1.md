# Load Bay Studio — Phase 1 Design Spec

## Wireframe

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EYEBROW: Size your visit                                               │
│  H2: What best matches your project?                                    │
│  Body: Choose a project scale — we'll confirm the visit with photos.    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┬──────────────────────────────┐ │
│  │                                     │  TYPICAL PROJECT             │ │
│  │   2.5D LOAD BAY CANVAS              │  Bedroom or office refresh   │ │
│  │   (fixed 3/4 rear-left)             │                              │ │
│  │                                     │  VISIT SIZE                  │ │
│  │   [ SVG layered illustration ]      │  Medium cleanup              │ │
│  │                                     │                              │ │
│  │   ────●────────●────────●───        │  CREW                        │ │
│  │      Few      Room     Garage       │  2-person team               │ │
│  │                                     │                              │ │
│  │                                     │  [ Continue to Estimate → ]  │ │
│  │                                     │  Final range confirmed with  │ │
│  │                                     │  photos — no obligation.     │ │
│  └─────────────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile (<1024px)

```
┌──────────────────────────┐
│  Eyebrow + H2 + body     │
├──────────────────────────┤
│                          │
│   LOAD BAY CANVAS        │
│   aspect-ratio 16/10     │
│                          │
│   ──●────●────●──        │
│   Few  Room  Garage      │
├──────────────────────────┤
│  Typical project         │
│  Visit size · Crew       │
│  [ Continue → ] full w   │
└──────────────────────────┘
```

No card grid. Scale rail is embedded in the bay frame.

---

## Visual Composition

| Zone | Treatment |
|------|-----------|
| Section background | `bg-cream` — matches homepage rhythm |
| Bay viewport | `bg-navy-deep` rounded frame, inner vignette |
| Illustration | Center-weighted; truck occupies ~75% width |
| Doorway glow | Orange `#D6762B` at 15–35% opacity; pulses on tier change |
| Scale rail | Cream hairline track; orange active detent |
| Service panel | Paper card on desktop right; stacked below on mobile |
| Typography | Instrument Serif headline; Plus Jakarta UI labels |

**Camera:** Fixed 3/4 rear-left. No rotation.

**Lighting:** Key light upper-left; floor gradient darkens toward cab.

**Narrative (single screen):**

| Phase | Trigger | Visual | Copy |
|-------|---------|--------|------|
| Before | Default / idle | Full object layers, heavier shadow | "Your space today" |
| During | Tier change (500ms) | Glow pulse, objects crossfade | "Professional removal" |
| After | CTA hover/focus | Glow intensifies, shadow lifts | "Room for what's next" |

---

## SVG Layer Plan (back → front)

| Z | Layer ID | Content | Tier-dependent |
|---|----------|---------|----------------|
| 0 | `bay-ambient` | Radial vignette, studio backdrop | No |
| 1 | `bay-ground` | Ground plane + soft shadow | No |
| 2 | `bay-chassis` | Wheels, frame, mudguards | No |
| 3 | `bay-shell` | Navy body panels, roof edge | No |
| 4 | `bay-interior` | Back wall, floor, side walls (depth) | No |
| 5 | `bay-objects-few` | 2 boxes + small item | Few only |
| 6 | `bay-objects-room` | Boxes stack, chair, side table | Room only |
| 7 | `bay-objects-garage` | Full staged load | Garage only |
| 8 | `bay-brand-panel` | Cream panel, N mark, wordmark | No |
| 9 | `bay-tailgate` | Closed door frame | No |
| 10 | `bay-doorway-glow` | Orange light slit (logo metaphor) | Opacity animated |
| 11 | `bay-highlight` | Rim light, specular edges | No |

All layers live in one `viewBox="0 0 800 520"` SVG for Phase 1.
Reusable export: `BayTruckIllustration.tsx` is the brand asset source.

---

## Asset Requirements

### Phase 1 (code-built — no external images)

| Asset | Format | Size budget | Notes |
|-------|--------|-------------|-------|
| `BayTruckIllustration` | Inline SVG | ~8–15KB markup | Primary brand truck |
| Doorway glow | SVG gradient + filter | In defs | Animated via CSS/opacity |
| Logo mark on panel | SVG paths | Inline | Simplified N + light slit |

### Phase 2 (optional designer exports)

| Asset | Format | Purpose |
|-------|--------|---------|
| `load-bay-master.svg` | SVG | Design source of truth |
| `doorway-glow.riv` | Rive | Glow pulse animation |

### Retired (remove from UX path)

- `junk-00.jpg` … `junk-06.jpg` rotation frames
- `junk-fill-*.jpg` fill overlays
- `TruckVolumePad.tsx` (keep until estimate migrated)

---

## Responsive Behavior

| Breakpoint | Layout | Canvas | Rail | Panel |
|------------|--------|--------|------|-------|
| `<640px` | Stack | 100% width, min-h 240px | Full width, 48px touch targets | Below canvas |
| `640–1023px` | Stack | max-w 2xl centered | Same | Full width CTA |
| `≥1024px` | 1.35fr / 0.65fr grid | Left column | Embedded in canvas footer | Sticky service card |

**Performance:**

- No WebGL, no `<Image>` for bay
- Single client island (`LoadBayStudio`)
- `prefers-reduced-motion`: instant tier swap, no glow animation
- Preload: none required (SVG inline)

**Conversion:**

- Default tier: `room` (One Room)
- CTA href: `/estimate?load={tierId}`
- sessionStorage key: `np-load-tier` on continue

---

## Content Model (`load-tiers.ts`)

| ID | Label | Examples | Typical project | Visit size | Crew |
|----|-------|----------|-----------------|------------|------|
| `few` | Few Items | sofa, mattress, boxes | Single-item or small pickup | Light visit | 2-person |
| `room` | One Room | bedroom, office, small reno | Room refresh | Standard visit | 2-person |
| `large` | Garage / Larger | garage, storage, multi-room | Major cleanout | Full crew visit | 2–3 person |

No percentages. No cubic feet in primary UI.
