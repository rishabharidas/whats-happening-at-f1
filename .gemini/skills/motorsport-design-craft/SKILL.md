---
name: motorsport-design-craft
description: >
  Premier design system, visual hierarchy, typography, data visualization, and user retention craft
  for Formula 1 and high-performance motorsport web applications. Use when designing motorsport dashboards,
  choosing typography and color systems (FIA sector purples/greens/yellows, tire compound palettes, team identities),
  structuring information for high readability, crafting daily return-hooks (Race Week indicators, title fight simulators,
  driver duels), and transforming dense telemetry into engaging, human-centric racing interfaces that real fans want to visit daily.
---

# Motorsport Design & User Experience Craft

High-performance digital design system and retention engineering for Formula 1 and motorsport applications.

## 1. Visual Hierarchy & Contrast Standards

Motorsport fans parse information at high speed. The interface must communicate like a Formula 1 pit wall timing screen:

### Color System & High Contrast
- **Base Backgrounds**: Deep Carbon Black (`#0a0a0a`), Cockpit Charcoal (`#121318`), Elevated Surface (`#181a22`). Never use washed-out grays.
- **FIA Official Sector Colors**:
  - `🟣 #C084FC / #A855F7`: **Fastest Overall (Session Best / Purple Sector)** — use for fastest lap, benchmark records, and session leaders.
  - `🟢 #22C55E / #10B981`: **Personal Best (Green Sector / In the Zone)** — use for positive deltas, personal bests, and completed checks.
  - `🟡 #EAB308 / #F59E0B`: **Warning / Caution (Yellow Flag / Sector Delta)** — use for cautions, safety cars, and time lost.
  - `🔴 #EF4444 / #DC2626`: **Critical / Racing Identity (Red Flag / F1 Red)** — use for live sessions, retirements (DNF), and primary motorsport accents.
  - `🔵 #38BDF8 / #0284C7`: **Cold / Pit Lane / Telemetry Surface** — use for pit stops, in-lap telemetry, and wet track states.

### Official Tire Compound System
Always use accurate tire compound badges:
- 🔴 **Soft**: C4/C5 compound — Red badge (`#EF4444`)
- 🟡 **Medium**: C3 compound — Yellow badge (`#FBBF24`)
- ⚪ **Hard**: C1/C2 compound — White badge (`#F4F4F5`)
- 🟢 **Intermediate**: Green badge (`#10B981`)
- 🔵 **Full Wet**: Blue badge (`#3B82F6`)

### Typography & Readability Rules
1. **Tabular Numerics**: Always use `font-mono tabular-nums` for points, lap times (`1:28.452`), intervals (`+2.418s`), and countdown timers. This completely eliminates visual jitter.
2. **Driver Identification**:
   - Primary: 3-letter driver code (e.g. `ANT`, `VER`, `NOR`) in bold monospaced italic uppercase.
   - Secondary: First name light/regular + Last name ultra-bold (`Andrea Kimi` + **ANTONELLI**).
   - Driver number (`#12`, `#1`, `#4`) placed as a subtle watermark or badge.
   - Official Team Color Pill: Provide a 4px left-border or glow badge in the constructor's official hex.

---

## 2. Retention Engineering ("Why Visit Again?")

To make a website something a real fan opens every day and bookmarks:

### A. Dynamic Race Week Status Pulse
- Always display the current **Race Context**:
  - **RACE WEEK**: Highlight the Grand Prix circuit, country flag, local track time vs. user's time zone, and a live countdown to FP1 / Quali / Race.
  - **OFF WEEK**: Show days until the next Grand Prix, recent paddock news, and title fight permutations.
  - **LIVE WEEKEND**: Glowing live radar beacon, track temp, weather radar, and instant link to the Timing Tower.

### B. Interactive Title Fight Duel (Driver Head-to-Head)
- Give users an interactive widget to compare championship rivals (e.g., Antonelli vs. Russell vs. Verstappen).
- Highlight the **Points Gap**, remaining points available in the season, and mathematical clinch scenarios.

### C. Daily Paddock Pulse ("Today in F1")
- Quick daily snippets:
  - Curated team radio quote of the day.
  - Aero/technical regulation fact or lexicon term.
  - Transfer buzz / technical upgrade reports.

### D. Pit Wall Mini HUD
- Real-time weather radar tile: Air temperature, track temperature, wind speed, rain probability, and surface status (DRY / DAMP / WET).

---

## 3. High-Impact Layout Patterns

- **Bento Grid Layout**: Place the primary championship anchor (Leader) on the dominant card, accompanied by satellite widgets (Countdown, Winner, Session Tracker, Title Duel).
- **Dual View Paradigm**:
  - **Clean Dashboard**: Streamlined overview for rapid morning check-ins (<5 seconds to parse all key facts).
  - **Full Paddock**: Deep dive into full timing sheets, 3D podiums, and constructor tables.
- **Touch-Friendly Hit Targets**: Buttons and chips have at least 44px hit targets with subtle tactile borders.

