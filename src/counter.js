// ================================================================
// COUNTER — Live "together since" counter, counting UP
// ================================================================

import { CONFIG } from './config.js';
import gsap from 'gsap';

let intervalId = null;
let prevValues = { days: -1, hours: -1, mins: -1, secs: -1 };

function pad(n, digits = 2) {
  return String(n).padStart(digits, '0');
}

function updateCounter() {
  const now = new Date();
  const diff = now - CONFIG.togetherSince;

  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const dEl = document.getElementById('cnt-days');
  const hEl = document.getElementById('cnt-hours');
  const mEl = document.getElementById('cnt-mins');
  const sEl = document.getElementById('cnt-secs');

  if (!dEl) return;

  if (days !== prevValues.days) { dEl.textContent = pad(days, 3); prevValues.days = days; }
  if (hours !== prevValues.hours) { hEl.textContent = pad(hours); prevValues.hours = hours; }
  if (mins !== prevValues.mins) { mEl.textContent = pad(mins); prevValues.mins = mins; }
  if (secs !== prevValues.secs) {
    // Animate seconds with a quick scale pop
    gsap.fromTo(sEl, { scale: 1.3, color: '#ff85b3' }, { scale: 1, color: '#ff4d8d', duration: 0.3, ease: 'back.out(2)' });
    sEl.textContent = pad(secs);
    prevValues.secs = secs;
  }
}

export function initCounter() {
  updateCounter();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateCounter, 1000);
}
