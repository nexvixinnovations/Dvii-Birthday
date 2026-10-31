// ================================================================
// GALLERY — Auto-playing horizontal scrolling photo lines
// Images are auto-discovered from public/images/ via virtual:image-list
// ================================================================

import gsap from 'gsap';
import { CONFIG } from './config.js';
import { images as imageList } from 'virtual:image-list';

export class Gallery {
  constructor() {
    this.images = [];
    this.captions = CONFIG.captions;
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  async init() {
    this.images = Array.isArray(imageList) && imageList.length > 0 ? imageList : [];
    if (this.images.length === 0) {
      try {
        const res = await fetch('./images/manifest.json');
        if (res.ok) {
          this.images = await res.json();
        }
      } catch (e) {
        try {
          const res = await fetch('/images/manifest.json');
          if (res.ok) {
            this.images = await res.json();
          }
        } catch (err) {}
      }
    }
    this._renderLines();
    this._setupControls();
  }

  _renderLines() {
    const track1 = document.getElementById('marquee-track-1');
    const track2 = document.getElementById('marquee-track-2');
    if (!track1 || !track2 || this.images.length === 0) return;

    track1.innerHTML = '';
    track2.innerHTML = '';

    // Split 31 photos into two balanced lines
    const mid = Math.ceil(this.images.length / 2);
    const line1Images = this.images.slice(0, mid);
    const line2Images = this.images.slice(mid);

    // Render each line with a duplicate copy for seamless -50% loop
    this._fillTrack(track1, line1Images, 0);
    this._fillTrack(track2, line2Images, mid);
  }

  _fillTrack(trackEl, imageSubList, offsetIndex) {
    if (!trackEl || imageSubList.length === 0) return;

    // We append the list twice (A + B) so translateX(-50%) loops infinitely
    for (let loop = 0; loop < 2; loop++) {
      imageSubList.forEach((src, idx) => {
        const globalIdx = offsetIndex + idx;
        const card = document.createElement('div');
        card.className = 'gallery__card';
        card.dataset.index = globalIdx;

        const img = document.createElement('img');
        img.src = src;
        img.alt = `Memory ${globalIdx + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';

        card.appendChild(img);
        trackEl.appendChild(card);

        // Tap or click to open fullscreen
        card.addEventListener('click', () => {
          this._openFullscreen(globalIdx);
        });
      });
    }
  }

  _setupControls() {
    document.getElementById('fullscreen-close')?.addEventListener('click', () => this._closeFullscreen());

    // Close fullscreen by tapping outside image
    document.getElementById('gallery-fullscreen')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('gallery-fullscreen')) {
        this._closeFullscreen();
      }
    });

    // Touch feedback: pause while touching, resume on release
    const container = document.getElementById('gallery-container');
    if (container) {
      container.addEventListener('touchstart', () => {
        document.querySelectorAll('.marquee-track').forEach(t => t.classList.add('is-paused'));
      }, { passive: true });

      const onTouchEnd = () => {
        const overlay = document.getElementById('gallery-fullscreen');
        if (!overlay || !overlay.classList.contains('active')) {
          document.querySelectorAll('.marquee-track').forEach(t => t.classList.remove('is-paused'));
        }
      };

      container.addEventListener('touchend', onTouchEnd, { passive: true });
      container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    }
  }

  _openFullscreen(index) {
    const overlay = document.getElementById('gallery-fullscreen');
    const img = document.getElementById('fullscreen-img');
    const caption = document.getElementById('fullscreen-caption');
    if (!overlay || !img) return;

    img.src = this.images[index];
    if (caption) {
      caption.textContent = this.captions[index % this.captions.length];
    }

    // Pause scrolling while viewing
    document.querySelectorAll('.marquee-track').forEach(t => t.classList.add('is-paused'));

    overlay.classList.add('active');
    gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(img, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });

    // Spawn heart sparkle
    this._spawnHeart(img);
  }

  _closeFullscreen() {
    const overlay = document.getElementById('gallery-fullscreen');
    if (!overlay) return;

    // Resume scrolling
    document.querySelectorAll('.marquee-track').forEach(t => t.classList.remove('is-paused'));

    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.25,
      onComplete: () => overlay.classList.remove('active'),
    });
  }

  _spawnHeart(near) {
    const el = document.createElement('div');
    el.className = 'sparkle-heart';
    const rect = near.getBoundingClientRect();
    el.style.left = `${rect.left + rect.width / 2 - 10}px`;
    el.style.top = `${rect.top + rect.height / 2 - 10}px`;
    el.textContent = '💖';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}
