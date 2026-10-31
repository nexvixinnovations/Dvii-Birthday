// ================================================================
// SCENE MANAGER — Manages intersection observers to pause/resume
// Three.js renderers when sections are off-screen (performance)
// ================================================================

export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.observer = new IntersectionObserver(
      (entries) => this._handleIntersection(entries),
      { threshold: 0.1 }
    );
  }

  register(sectionId, scene) {
    const el = document.getElementById(sectionId);
    if (!el || !scene) return;
    this.scenes.set(sectionId, { scene, el });
    this.observer.observe(el);
  }

  _handleIntersection(entries) {
    entries.forEach(entry => {
      const sectionId = entry.target.id;
      const data = this.scenes.get(sectionId);
      if (!data) return;
      if (entry.isIntersecting) {
        data.scene.start?.();
      } else {
        data.scene.stop?.();
      }
    });
  }

  disposeAll() {
    this.scenes.forEach(({ scene }) => scene.dispose?.());
    this.observer.disconnect();
  }
}
