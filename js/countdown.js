'use strict';

let countdownInterval = null;

function startCountdown(elementId, deadline) {
  clearInterval(countdownInterval);

  const el = document.getElementById(elementId);
  if (!el) return;

  const hours = el.querySelector('.hours');
  const minutes = el.querySelector('.minutes');
  const seconds = el.querySelector('.seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const remaining = Math.max(0, new Date(deadline) - Date.now());
    const s = Math.floor(remaining / 1000);
    hours.textContent = pad(Math.floor(s / 3600) % 24);
    minutes.textContent = pad(Math.floor(s / 60) % 60);
    seconds.textContent = pad(s % 60);
    if (remaining <= 0) clearInterval(countdownInterval);
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}
