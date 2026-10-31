// ================================================================
// MAIN.JS — Birthday Surprise Site Orchestrator
// ================================================================
// Edit personal details in config.js
// Edit music path in config.js (CONFIG.musicPath)
// ================================================================

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from './config.js';
import { initAudio, tryPlay } from './audio.js';
import { initCounter } from './counter.js';
import { StarField } from './stars.js';
import { HeartsScene } from './hearts.js';
import { FinaleScene } from './finale.js';
import { Gallery } from './gallery.js';
import { SceneManager } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────
// OPENING SECTION
// ──────────────────────────────────────────
let openingStars = null;
let mainStarted = false;

function initOpening() {
  openingStars = new StarField('stars-canvas', { shootingStars: false });
  openingStars.start();

  // Set initial states
  gsap.set('#opening-teaser', { y: 20 });
  gsap.set('.opening__btn', { y: 20 });

  // Animate in the opening text
  const tl = gsap.timeline({ delay: 0.5 });
  tl.to('#opening-teaser', { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }, 0)
    .to('#opening-heart', { opacity: 1, duration: 1, ease: 'power2.out' }, 0.8)
    .to('.opening__btn', { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)' }, 1.4);

  document.getElementById('open-btn')?.addEventListener('click', startExperience);
  document.getElementById('section-opening')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('section-opening')) startExperience();
  });
}

async function startExperience() {
  if (mainStarted) return;
  mainStarted = true;

  // Request iOS gyroscope permission
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try { await DeviceOrientationEvent.requestPermission(); } catch(e) {}
  }

  // Transition out the opening
  gsap.to('#section-opening', {
    opacity: 0, duration: 0.8, ease: 'power2.inOut',
    onComplete: () => {
      const op = document.getElementById('section-opening');
      if (op) op.style.display = 'none';
      openingStars?.stop();
    }
  });

  // Show main experience
  const mainEl = document.getElementById('main-experience');
  mainEl.classList.remove('hidden');
  gsap.from(mainEl, { opacity: 0, duration: 0.8, ease: 'power2.out' });

  // Start audio
  initAudio();

  // Init everything
  initBirthday();
  initCounter();
  initJourney();
  initChoseSection();
  initPromise();
  initFinale();

  // Init gallery
  const gallery = new Gallery();
  await gallery.init();

  // Refresh ScrollTrigger now that content & images have rendered
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 400);

  // Scene manager for Three.js performance
  const sceneManager = new SceneManager();

  const heartsScene = new HeartsScene('hearts-canvas');
  sceneManager.register('section-birthday', heartsScene);

  const choseScene = new StarField('chose-canvas', { shootingStars: false, color: 0xff4d8d });
  sceneManager.register('section-chose', choseScene);

  const starsScene = new StarField('stars2-canvas', { shootingStars: true });
  sceneManager.register('section-promise', starsScene);

  const finaleScene = new FinaleScene('finale-canvas');
  sceneManager.register('section-finale', finaleScene);
  finaleScene._finaleRef = finaleScene;

  // Store finale for tap handler
  window._finaleScene = finaleScene;

  // Scroll to birthday section
  setTimeout(() => {
    document.getElementById('section-birthday')?.scrollIntoView({ behavior: 'smooth' });
  }, 1000);
}

// ──────────────────────────────────────────
// SECTION 1: BIRTHDAY
// ──────────────────────────────────────────
function initBirthday() {
  // Letter-by-letter for "Happy Birthday"
  const hbEl = document.getElementById('hb-happy');
  if (hbEl) {
    const text = hbEl.textContent;
    hbEl.textContent = '';
    hbEl.style.opacity = 1;

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      hbEl.appendChild(span);
      gsap.to(span, { opacity: 1, y: 0, duration: 0.4, delay: 0.6 + i * 0.06, ease: 'back.out(2)' });
      gsap.set(span, { y: 20 });
    });
  }

  gsap.to('#hb-name', { opacity: 1, y: 0, duration: 1, delay: 1.8, ease: 'power3.out' });
  gsap.set('#hb-name', { y: 30 });
  gsap.to('#hb-nick', { opacity: 1, y: 0, duration: 1, delay: 2.3, ease: 'power3.out' });
  gsap.set('#hb-nick', { y: 30 });
  gsap.to('#hb-tagline', { opacity: 1, y: 0, duration: 1, delay: 3, ease: 'power3.out' });
  gsap.set('#hb-tagline', { y: 20 });

  // Confetti burst of emoji hearts
  setTimeout(() => {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => spawnConfetti(), i * 80);
    }
  }, 2400);

  // Scroll down notification appears softly after birthday message
  const scrollHint = document.getElementById('scroll-hint');
  if (scrollHint) {
    gsap.to(scrollHint, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 3.4,
      ease: 'power2.out',
    });
    gsap.set(scrollHint, { y: 15 });

    scrollHint.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('section-counter')?.scrollIntoView({ behavior: 'smooth' });
    });

    ScrollTrigger.create({
      trigger: '#section-birthday',
      start: 'top top',
      end: 'bottom 60%',
      onLeave: () => gsap.to(scrollHint, { opacity: 0, duration: 0.3 }),
      onEnterBack: () => gsap.to(scrollHint, { opacity: 1, duration: 0.4 }),
    });
  }
}

function spawnConfetti() {
  const emojis = ['💖', '💗', '✨', '🌸', '💕'];
  const el = document.createElement('div');
  el.className = 'sparkle-heart';
  el.style.left = `${Math.random() * 100}vw`;
  el.style.top = `${Math.random() * 30 + 10}vh`;
  el.style.fontSize = `${Math.random() * 14 + 12}px`;
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ──────────────────────────────────────────
// SECTION 3: JOURNEY (scroll-triggered)
// ──────────────────────────────────────────
function initJourney() {
  const title = document.getElementById('journey-title');
  const subtitle = document.querySelector('.journey__subtitle');

  if (title) {
    gsap.fromTo(title,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#section-journey',
          start: 'top 88%',
          once: true,
        }
      }
    );
  }

  if (subtitle) {
    gsap.fromTo(subtitle,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#section-journey',
          start: 'top 88%',
          once: true,
        }
      }
    );
  }

  const cards = document.querySelectorAll('.journey__card');
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          once: true,
        }
      }
    );
  });
}

// ──────────────────────────────────────────
// SECTION 5: CHOSE EACH OTHER
// ──────────────────────────────────────────
function initChoseSection() {
  const lines = document.querySelectorAll('.chose__line');
  lines.forEach((line, i) => {
    gsap.to(line, {
      scrollTrigger: {
        trigger: '#section-chose',
        start: `top+=${i * 80} center`,
        toggleActions: 'play none none reverse',
      },
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    });
    gsap.set(line, { y: 30 });
  });
}

// ──────────────────────────────────────────
// SECTION 6: PROMISE
// ──────────────────────────────────────────
function initPromise() {
  gsap.to('#promise-quote', {
    scrollTrigger: { trigger: '#section-promise', start: 'top 70%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 1.5, ease: 'power3.out',
  });
  gsap.set('#promise-quote', { y: 40 });

  gsap.to('#promise-sub', {
    scrollTrigger: { trigger: '#section-promise', start: 'top 60%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 1.2, delay: 0.5, ease: 'power3.out',
  });
  gsap.set('#promise-sub', { y: 30 });
}

// ──────────────────────────────────────────
// SECTION 7: FINALE
// ──────────────────────────────────────────
function initFinale() {
  gsap.to('#finale-hb', {
    scrollTrigger: { trigger: '#section-finale', start: 'top 70%', toggleActions: 'play none none reverse' },
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
  });
  gsap.set('#finale-hb', { y: 30 });

  const section = document.getElementById('section-finale');
  const hint = document.getElementById('finale-tap-hint');
  let blown = false;

  section?.addEventListener('click', () => {
    if (blown) return;
    blown = true;
    if (hint) hint.style.display = 'none';

    // Fireworks
    window._finaleScene?.explode();

    // Show message
    const msg = document.getElementById('finale-message');
    const replay = document.getElementById('replay-btn');
    if (msg) {
      msg.classList.remove('hidden');
      gsap.from(msg.children, { opacity: 0, y: 30, stagger: 0.4, duration: 1, ease: 'power3.out' });
    }

    if (replay) {
      setTimeout(() => {
        replay.classList.remove('hidden');
        gsap.from(replay, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(2)' });
      }, 3000);
    }
  });

  document.getElementById('replay-btn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => location.reload(), 800);
  });
}

// ──────────────────────────────────────────
// INIT
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initOpening();
});
