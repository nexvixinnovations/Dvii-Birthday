// ================================================================
// HEARTS — Three.js floating hearts + bokeh for birthday section
// ================================================================

import * as THREE from 'three';

export class HeartsScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.active = false;
    this.raf = null;
    this.particles = [];
    this.mouse = new THREE.Vector2(0, 0);
    this.tilt = new THREE.Vector2(0, 0);
    this._init();
  }

  _heartShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.3, -0.5, -0.3, -0.5, 0);
    shape.bezierCurveTo(-0.5, 0.3, 0, 0.6, 0, 1);
    shape.bezierCurveTo(0, 0.6, 0.5, 0.3, 0.5, 0);
    shape.bezierCurveTo(0.5, -0.3, 0, -0.3, 0, 0);
    return shape;
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

    this._createParticles();
    this._createBokeh();
    this._setupInteraction();

    window.addEventListener('resize', () => this._onResize());
  }

  _createParticles() {
    const count = window.innerWidth < 768 ? 60 : 120;
    const colors = [0xff4d8d, 0xff85b3, 0xffd6a5, 0xffffff];

    for (let i = 0; i < count; i++) {
      const geo = new THREE.BufferGeometry();
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 5;
      geo.setAttribute('position', new THREE.Float32BufferAttribute([x, y, z], 3));
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.PointsMaterial({
        color,
        size: Math.random() * 0.15 + 0.05,
        transparent: true,
        opacity: Math.random() * 0.6 + 0.3,
        sizeAttenuation: true,
      });
      const p = new THREE.Points(geo, mat);
      p.userData = {
        vx: (Math.random() - 0.5) * 0.005,
        vy: Math.random() * 0.004 + 0.002,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        baseX: x, baseY: y,
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  _createBokeh() {
    const count = window.innerWidth < 768 ? 15 : 25;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.05, 8, 8);
      const colors = [0xff4d8d, 0x6d28d9, 0xffd6a5, 0xff85b3];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: Math.random() * 0.15 + 0.05,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 5 - 3,
      );
      mesh.userData = { speed: Math.random() * 0.003 + 0.001, phase: Math.random() * Math.PI * 2 };
      this.scene.add(mesh);
      this.particles.push(mesh);
    }
  }

  _setupInteraction() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.mouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    window.addEventListener('deviceorientation', (e) => {
      this.tilt.x = (e.gamma || 0) / 45;
      this.tilt.y = (e.beta || 0) / 90;
    });
  }

  _onResize() {
    if (!this.renderer || !this.canvas?.parentElement) return;
    const W = this.canvas.parentElement.offsetWidth || window.innerWidth;
    const H = this.canvas.parentElement.offsetHeight || window.innerHeight;
    this.renderer.setSize(W, H);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
  }

  start() { if (this.active) return; this.active = true; this._animate(); }
  stop() { this.active = false; if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } }

  _animate() {
    if (!this.active) return;
    this.raf = requestAnimationFrame(() => this._animate());
    const t = Date.now() * 0.001;

    this.particles.forEach((p) => {
      if (p.isPoints) {
        const pos = p.geometry.attributes.position;
        let y = pos.getY(0) + p.userData.vy;
        let x = pos.getX(0) + p.userData.vx + this.mouse.x * 0.005 + this.tilt.x * 0.008;
        if (y > 8) y = -8;
        if (x > 12) x = -12;
        if (x < -12) x = 12;
        pos.setXY(0, x, y);
        pos.needsUpdate = true;
      } else {
        p.position.y += Math.sin(t * p.userData.speed * 10 + p.userData.phase) * 0.003;
        p.position.x += this.mouse.x * 0.002;
      }
    });

    this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 0.2 - this.camera.position.y) * 0.02;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() { this.stop(); this.renderer?.dispose(); }
}
