---
name: sports-motion-engine
description: >
  Animation, micro-interactions, and motion choreography for high-performance sports and telemetry web applications.
  Specializes in smooth physics springs, countdown timers, live pulse indicators, rev-meter gauges, sector delta transitions,
  interactive card hover states, and GSAP/Motion micro-interactions. Use when adding motorsport-inspired animations,
  live telemetry tickers, smooth number counters, lights-out start sequences, track map sweeps, and responsive transitions
  that feel snappy (150-300ms) without causing layout thrash.
---

# Sports Motion & Animation Engine

Choreography and physics-based motion for high-performance motorsport interfaces.

## 1. Core Motion Principles

In motorsport, motion must reflect precision engineering, high velocity, and instant reaction time:

### Snappy Timing & Physics Springs
- **Duration**: Interactions should be crisp (180ms – 320ms). Never use sluggish, floaty 600ms+ animations for UI controls.
- **CSS Spring Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.25, 1, 0.5, 1)` (out-quart / out-expo).
- **Physics Springs (Framer Motion / Motion)**:
  - Snappy button / card hover: `{ type: "spring", stiffness: 350, damping: 25 }`
  - Modal / Sheet entrance: `{ type: "spring", stiffness: 300, damping: 30 }`
  - Subtle micro-lift: `{ type: "spring", stiffness: 400, damping: 28 }`

### Compositor-Only Guardrails (Zero Jank)
- Only animate `transform` (`translate3d`, `scale`) and `opacity`.
- Never animate `height`, `width`, `margin`, or `padding` directly—use CSS scale transforms or FLIP techniques.
- Respect `prefers-reduced-motion: reduce`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 2. Signature Motorsport Micro-Interactions

### A. Live Telemetry Pulse & Radar Beacon
- Active track session indicator:
  - Core dot: Solid red or green
  - Outer ring: Expanding radar wave using `scale` and fading `opacity`:
  ```css
  @keyframes radar-ping {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  ```

### B. Dynamic Countdown Flipper / Ticker Cards
- Segmented time blocks (Days, Hours, Mins, Secs) with subtle glass highlights and illuminated LED-style numerals.
- On tick, numbers smoothly slide or flash with high-precision tabular alignment.

### C. Team-Colored Hover Glow & Magnetic Lift
- On card hover, elevate `translateY(-3px)` and activate a dynamic drop shadow matching the driver or team's official hex color:
  ```css
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-3px) scale(1.008);
    box-shadow: 0 16px 32px -8px rgba(var(--team-rgb), 0.35);
  }
  ```

### D. Rolling Number / Odometer Effects
- Use smooth number roll-overs when points or positions change so the interface feels living and connected to live telemetry feeds.

### E. F1 Lights Out Sequence
- 5 red lights counting up one by one at 1.0s intervals, followed by an unpredictable 0.2s–3.0s pause, and simultaneous blackout ("It's lights out and away we go!").

