# Happy Birthday Koli Kunju 💖 — Surprise Website

A cinematic, animated, romantic birthday surprise website built with **Vite**, **Three.js**, and **GSAP**. Designed as a mobile-first digital love letter — every animation, word and transition is made to make her feel loved, chosen, and special.

---

## ✨ Features

- **Opening**: Dreamy starfield with a pulsing heart and a "Tap to open 💌" reveal.
- **Happy Birthday**: Three.js floating hearts + bokeh, letter-by-letter animated text, confetti burst.
- **Live Counter**: Real-time ticker showing exact days, hours, minutes and seconds together since 16 November 2025.
- **Our Journey**: Glassmorphism timeline cards that slide in with GSAP ScrollTrigger.
- **Our Memories**: Swipeable/draggable 3D photo stack with all 31 photos, fullscreen zoom and heart sparkles.
- **Why We Chose Each Other**: Cinematic poetry revealed line-by-line on scroll over a rose starfield.
- **My Promise**: Glowing gold quote under a shooting star sky (Three.js).
- **Finale**: Tap to "blow the candles" → Three.js fireworks, falling hearts, the final message.
- **Background Music**: Optional `music.mp3` with floating mute/unmute button.
- **Performance**: Three.js scenes auto-pause via IntersectionObserver when off-screen. devicePixelRatio capped at 2. 60fps target on mid-range phones.

---

## 🚀 Getting Started

### Prerequisites

[Node.js v18+](https://nodejs.org/)

### Run Locally

```bash
cd d:\Projects\Dvii
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.
To simulate mobile, open DevTools → Toggle device toolbar → select iPhone 14 Pro (390×844).

### Production Build

```bash
npm run build
npm run preview   # preview the built dist/ locally
```

---

## 🎵 Adding Background Music

1. Find a romantic instrumental MP3 (suggestions: "Perfect" piano cover, Arijit Singh instrumentals, Lo-fi love).
2. Place it at:
   ```
   d:\Projects\Dvii\audio\music.mp3
   ```
   *(Or `public/audio/music.mp3` — both work)*
3. Done. The music starts when she taps "Tap to open 💌".

---

## 💌 Personalization

All personal details are in **`src/config.js`** — edit once, updates everywhere:

```js
export const CONFIG = {
  herName: "Divyabharathi S",      // Her full name
  nickName: "Koli Kunju",          // Your nickname for her
  myName: "Swaroopan",             // Your name

  dob: new Date("2006-11-01"),          // Her date of birth
  birthdayYear: 2026,                    // Year she turns 20
  togetherSince: new Date("2025-11-16"), // Counter counts UP from this date

  musicPath: "/audio/music.mp3",   // Background music path

  captions: [ ... ],               // Photo captions (cycles through gallery)
  choseLines: [ ... ],             // Lines in the "Why We Chose Each Other" section
};
```

---

## 🖼️ Managing Photos

Photos are **automatically loaded** from `public/images/`. No hardcoding needed.

- **Add photos**: Drop `.jpg` / `.jpeg` / `.png` files into `public/images/` and rebuild.
- **Remove photos**: Delete from `public/images/`.
- **OG preview image**: The first photo is also saved as `public/og-image.jpg` for WhatsApp link previews.

---

## 🌐 Deployment

### Netlify (Recommended — fastest)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo on [app.netlify.com](https://app.netlify.com):
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Vercel

```bash
npm install -g vercel
vercel --prod
```

Or import on [vercel.com](https://vercel.com):
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

### GitHub Pages

1. Add to `vite.config.js`: `base: '/your-repo-name/'`
2. Build and push `dist/` to the `gh-pages` branch.

> [!IMPORTANT]
> If you include music, make sure `audio/music.mp3` is in the `dist/audio/` folder after build.
> The Vite plugin auto-copies it. If you add music after building, copy it manually.

---

## 📁 Project Structure

```
d:\Projects\Dvii\
├── audio/                    ← Put music.mp3 here
├── public/
│   ├── images/               ← All 31 photos (auto-loaded)
│   ├── favicon.svg           ← Heart favicon
│   └── og-image.jpg          ← WhatsApp preview image
├── src/
│   ├── config.js             ← Edit names, dates, captions here
│   ├── main.js               ← App orchestrator + GSAP ScrollTrigger
│   ├── style.css             ← All styles (palette, glassmorphism, animations)
│   ├── audio.js              ← Music player + mute button
│   ├── counter.js            ← Live relationship counter
│   ├── gallery.js            ← Swipeable photo stack + fullscreen
│   ├── hearts.js             ← Three.js floating hearts scene
│   ├── stars.js              ← Three.js starfield + shooting stars
│   ├── finale.js             ← Three.js fireworks explosion
│   └── scene.js              ← IntersectionObserver scene manager
├── index.html
├── vite.config.js
└── README.md
```

---

*Made with all my heart — for Divyabharathi, my Koli Kunju. 💖*
*— Swaroopan*
