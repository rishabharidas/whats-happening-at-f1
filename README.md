# 🏎️ WhatsHappening@F1

A high-performance Formula 1 dashboard built with **Next.js**, featuring real-time data visualization, race results, and championship standings. Designed for speed, precision, and the ultimate fan experience.

---


## ⚡ Key Features

* **Race Weekend Hub:** Dynamic ticket-style countdowns and schedules for upcoming Grand Prix sessions.
* **Interactive Podium:** Visual race results with "pop-out" driver headshots and team-colored pedestals.
* **Live Standings:** Real-time World Drivers' Championship (WDC) tracking with team-specific accent stripes.
* **Dynamic Hero:** An aggressive, F1-branded landing section that highlights current racing status.
* **Responsive UI:** Fully optimized for mobile and desktop viewing using a high-contrast dark aesthetic.


## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Fonts:** Geist Sans & Geist Mono (Optimized via `next/font`)
* **Data Source:** [OpenF1 API](https://openf1.org/)


## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


## 📊 Project Structure

/components/Results: The 3D Podium component.

/components/Standings: The WDC leaderboard with team branding.

/components/UpcomingSession: The race weekend schedule and ticket-style countdown.

/utils/api: Centralized API wrapper for the OpenF1 endpoints.


## 🏁 Credits & Data

Data Source
`This project is powered by the OpenF1 API, an incredible open-source project providing real-time and historical Formula 1 data.`


## Design Guiding Principles
Speed: Heavy use of italics and skewed elements.

Precision: Clean borders, tabular numbers for points, and high-contrast typography.

Identity: Dynamic team colors pulled directly from the API to skin the UI components.


## ⚖️ Disclaimer
This project is an unofficial fan application. It is not affiliated with, endorsed by, or connected to the Formula 1 group of companies, the FIA, or any specific F1 team. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.

Made with ❤️ for the F1 community.
