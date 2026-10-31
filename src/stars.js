// ================================================================
// STARS — Three.js starfield with shooting stars
// Used in: Opening section and Promise section
// ================================================================

import * as THREE from 'three';

export class StarField {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.opts = {
      starCount: typeof window !== 'undefined' && window.innerWidth < 768 ? 800 : 1500,
      shootingStars: options.shootingStars ?? true,
      color: options.color ?? 0xffffff,
    };
    this.active = false;
    this.raf = null;
    this.shooters = [];
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
    this.camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    this.camera.position.z = 5;

    this._createStars();
    if (this.opts.shootingStars) this._createShootingStars();

    window.addEventListener('resize', () => this._onResize());
  }

  _createStars() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.opts.starCount * 3);
    const sizes = new Float32Array(this.opts.starCount);
    for (let i = 0; i < this.opts.starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sizes[i] = Math.random() * 2 + 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: this.opts.color,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  _createShootingStars() {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry();
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, -0.1, 0)];
      geo.setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0xffd6a5, transparent: true, opacity: 0 });
      const line = new THREE.Line(geo, mat);
      line.userData = { active: false, timer: Math.random() * 5 + 2 };
      this.scene.add(line);
      this.shooters.push(line);
    }
  }

  _onResize() {
    if (!this.renderer || !this.canvas?.parentElement) return;
    const W = this.canvas.parentElement.offsetWidth || window.innerWidth;
    const H = this.canvas.parentElement.offsetHeight || window.innerHeight;
    this.renderer.setSize(W, H);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this._animate();
  }

  stop() {
    this.active = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  }

  _animate() {
    if (!this.active) return;
    this.raf = requestAnimationFrame(() => this._animate());
    const t = Date.now() * 0.0001;
    if (this.stars) {
      this.stars.rotation.y = t * 0.1;
      this.stars.rotation.x = Math.sin(t * 0.05) * 0.05;
    }

    // Shooting stars
    this.shooters.forEach((s) => {
      s.userData.timer -= 0.016;
      if (s.userData.timer <= 0) {
        s.userData.timer = Math.random() * 8 + 4;
        s.position.set((Math.random() - 0.5) * 16, Math.random() * 4 + 2, 0);
        s.rotation.z = -Math.PI / 6;
        s.material.opacity = 1;
        s.userData.active = true;
        s.userData.life = 1;
      }
      if (s.userData.active) {
        s.position.x += 0.12;
        s.position.y -= 0.07;
        s.userData.life -= 0.025;
        s.material.opacity = Math.max(0, s.userData.life);
        if (s.userData.life <= 0) s.userData.active = false;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.renderer?.dispose();
  }
}
