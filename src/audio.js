// ================================================================
// AUDIO — Background music handler with mute/unmute
// ================================================================

import { CONFIG } from './config.js';

let audio = null;
let muted = false;
let isFading = false;

export function initAudio() {
  const muteBtn = document.getElementById('mute-btn');
  if (audio) {
    tryPlay();
    return;
  }

  audio = new Audio(CONFIG.musicPath);
  audio.loop = true;
  audio.volume = 0; // Start at 0 and fade in gently

  const startPlayback = () => {
    if (!audio) return;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          fadeInAudio(0.5, 2000);
        })
        .catch((err) => {
          console.warn('Playback deferred until next user interaction:', err);
          // Wait for first touch or tap
          const onFirstTouch = () => {
            if (audio) {
              audio.play().then(() => fadeInAudio(0.5, 1500)).catch(() => {});
            }
            window.removeEventListener('click', onFirstTouch);
            window.removeEventListener('touchstart', onFirstTouch);
          };
          window.addEventListener('click', onFirstTouch, { once: true, passive: true });
          window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
        });
    }
  };

  startPlayback();

  if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
  }
}

function fadeInAudio(targetVol, durationMs) {
  if (!audio || isFading) return;
  isFading = true;
  const stepTime = 50;
  const steps = durationMs / stepTime;
  const volStep = targetVol / steps;
  let currentVol = 0;

  const timer = setInterval(() => {
    if (!audio) {
      clearInterval(timer);
      isFading = false;
      return;
    }
    currentVol = Math.min(targetVol, currentVol + volStep);
    if (!muted) {
      audio.volume = currentVol;
    }
    if (currentVol >= targetVol) {
      clearInterval(timer);
      isFading = false;
    }
  }, stepTime);
}

function toggleMute(e) {
  if (e) e.stopPropagation();
  const muteBtn = document.getElementById('mute-btn');
  if (!audio) return;
  muted = !muted;
  audio.muted = muted;
  if (muteBtn) {
    muteBtn.textContent = muted ? '🔇' : '🔊';
  }
}

export function tryPlay() {
  if (audio && audio.paused) {
    audio.play().then(() => {
      if (audio.volume === 0) fadeInAudio(0.5, 1500);
    }).catch(() => {});
  }
}
