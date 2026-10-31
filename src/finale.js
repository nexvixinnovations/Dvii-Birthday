// ================================================================
// FINALE — Three.js birthday fireworks + hearts explosion
// ================================================================

import * as THREE from 'three';

export class FinaleScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.active = false;
    this.raf = null;
    this.fireworks = [];
    this.particles = [];
    this._init();
  }

  _init() {
    const W = this.canvas.parentElement?.offsetWidth || window.innerWidth;
    const H = this.canvas.parentElement?.offsetHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: true });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(W, H);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    this.camera.position.z = 8;

    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    if (!this.renderer || !this.canvas?.parentElement) return;
    const W = this.canvas.parentElement.offsetWidth || window.innerWidth;
    const H = this.canvas.parentElement.offsetHeight || window.innerHeight;
    this.renderer.setSize(W, H);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
  }

  _launchFirework(x, y) {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = [0xff4d8d, 0xffd6a5, 0xff85b3, 0xffffff, 0x6d28d9, 0xffb347];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 0.15 + 0.05;
      velocities.push({ vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = new THREE.PointsMaterial({ color, size: 0.12, transparent: true, opacity: 1 });
    const fw = new THREE.Points(geo, mat);
    fw.userData = { velocities, life: 1 };
    this.scene.add(fw);
    this.fireworks.push(fw);
  }

  explode() {
    // Launch multiple fireworks
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random()) * 4 - 1;
        this._launchFirework(x, y);
      }, i * 300);
    }
    // Falling hearts
    this._fallingHearts();
  }

  _fallingHearts() {
    const emojis = ['❤️', '💖', '💗', '💕', '✨'];
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = `
          position: fixed; top: -30px; font-size: ${Math.random() * 16 + 14}px;
          left: ${Math.random() * 100}vw; z-index: 9999; pointer-events: none;
          animation: fall-heart 3s ease-in forwards;
        `;
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
      }, i * 150);
    }
  }

  start() { if (this.active) return; this.active = true; this._animate(); }
  stop() { this.active = false; if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } }

  _animate() {
    if (!this.active) return;
    this.raf = requestAnimationFrame(() => this._animate());

    for (let idx = this.fireworks.length - 1; idx >= 0; idx--) {
      const fw = this.fireworks[idx];
      const pos = fw.geometry.attributes.position.array;
      fw.userData.velocities.forEach((v, i) => {
        pos[i * 3] += v.vx;
        pos[i * 3 + 1] += v.vy;
        pos[i * 3 + 2] += 0;
        v.vy -= 0.004; // gravity
        v.life -= 0.012;
      });
      fw.userData.life -= 0.012;
      fw.material.opacity = Math.max(0, fw.userData.life);
      fw.geometry.attributes.position.needsUpdate = true;

      if (fw.userData.life <= 0) {
        this.scene.remove(fw);
        fw.geometry.dispose();
        fw.material.dispose();
        this.fireworks.splice(idx, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() { this.stop(); this.renderer?.dispose(); }
}
