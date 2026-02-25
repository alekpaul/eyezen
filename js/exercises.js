const exercises = [
  { title: 'Relax', time: 20, hint: 'Close your eyes until you hear a signal', anim: 'pulse' },
  { title: 'Up \u2014 Down', time: 20, hint: 'Hold your gaze at the top and bottom for a second', anim: 'updown' },
  { title: 'Blink', time: 10, hint: 'Blink your eyes or cover them with your palms', anim: null },
  { title: 'Left \u2014 Right', time: 20, hint: 'Move eyes as far as comfortable, no strain', anim: 'leftright' },
  { title: 'Diagonal', time: 20, hint: 'Look at the corners, follow the dot', anim: 'diagonal' },
  { title: 'Blink', time: 10, hint: 'Blink your eyes or cover them with your palms', anim: null },
  { title: 'Clockwise', time: 20, hint: 'Don\'t rush, do it smoothly', anim: 'clockwise' },
  { title: 'Spiral', time: 20, hint: 'Try to do at least 4 turns', anim: 'spiral' },
  { title: 'Blink', time: 10, hint: 'Blink your eyes or cover them with your palms', anim: null },
  { title: 'Near \u2014 Far', time: 20, hint: 'Focus far when the dot grows, focus near when it shrinks', anim: 'nearfar' },
  { title: 'Relax', time: 15, hint: 'Close your eyes, you\'re almost done', anim: null },
];

const totalTime = exercises.reduce((s, e) => s + e.time, 0);
let currentExercise = 0;
let timeLeft = 0;
let timerInterval = null;
let elapsedTotal = 0;

const startScreen = document.getElementById('start-screen');
const exerciseScreen = document.getElementById('exercise-screen');
const doneScreen = document.getElementById('done-screen');
const exTitle = document.getElementById('ex-title');
const exTimer = document.getElementById('ex-timer');
const exHint = document.getElementById('ex-hint');
const progressBar = document.getElementById('progress-bar');
const dotArena = document.getElementById('dot-arena');

// Shared AudioContext for all sounds
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Play a tone with gentle envelope
function playTone(freq, start, duration, vol, type) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

// Sound preferences — synced with popup via chrome.storage.local
let soundPrefs = { ambientVolume: 0.08, gongVolume: 0.5, muted: false };

function loadSoundPrefs() {
  return new Promise(resolve => {
    chrome.storage.local.get('soundPrefs', data => {
      if (data.soundPrefs) Object.assign(soundPrefs, data.soundPrefs);
      resolve();
    });
  });
}

// Sync when popup changes settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.soundPrefs) {
    Object.assign(soundPrefs, changes.soundPrefs.newValue);
    ambientAudio.volume = soundPrefs.ambientVolume;
    if (soundPrefs.muted) ambientAudio.pause();
  }
});

// Gong pool — 7 individual bell hits
const gongFiles = Array.from({length: 7}, (_, i) => `audio/gong-${i + 1}.ogg`);
const gongPool = gongFiles.map(src => {
  const a = new Audio(src);
  a.preload = 'auto';
  return a;
});
let lastGongIndex = -1;

function playRandomGong() {
  if (soundPrefs.muted) return;
  try {
    let idx;
    do { idx = Math.floor(Math.random() * gongPool.length); } while (idx === lastGongIndex && gongPool.length > 1);
    lastGongIndex = idx;
    const g = gongPool[idx];
    g.volume = soundPrefs.gongVolume;
    g.currentTime = 0;
    g.play();
  } catch(e) {}
}

// Ambient audio — wind chimes loop
const ambientAudio = new Audio('audio/alex_jauk-beautiful-wind-chimes-amp-bells-ambience-2-434528.mp3');
ambientAudio.loop = true;
ambientAudio.preload = 'auto';

function startAmbient() {
  if (soundPrefs.muted) return;
  ambientAudio.volume = soundPrefs.ambientVolume;
  ambientAudio.currentTime = 0;
  ambientAudio.play().catch(() => {});
}

function stopAmbient() {
  ambientAudio.pause();
  ambientAudio.currentTime = 0;
}

function showScreen(screen) {
  [startScreen, exerciseScreen, doneScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function setAnimation(anim) {
  document.body.className = '';
  dotArena.style.transform = '';
  dotArena.style.animation = '';
  if (anim) {
    document.body.classList.add('anim-' + anim);
  }
}

function updateProgress() {
  const pct = (elapsedTotal / totalTime) * 100;
  progressBar.style.width = pct + '%';
}

function startExercise(index) {
  if (index >= exercises.length) {
    playRandomGong();
    setAnimation(null);
    showScreen(doneScreen);
    stopAmbient();
    progressBar.style.width = '100%';
    return;
  }

  currentExercise = index;
  const ex = exercises[index];
  timeLeft = ex.time;

  exTitle.textContent = ex.title;
  exTimer.textContent = timeLeft < 10 ? '0' + timeLeft : timeLeft;
  exHint.textContent = ex.hint;
  setAnimation(ex.anim);

  if (index > 0) playRandomGong();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    elapsedTotal++;
    updateProgress();
    exTimer.textContent = timeLeft < 10 ? '0' + timeLeft : timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      startExercise(index + 1);
    }
  }, 1000);
}

document.getElementById('start-btn').addEventListener('click', () => {
  elapsedTotal = 0;
  showScreen(exerciseScreen);
  startAmbient();
  startExercise(0);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  elapsedTotal = 0;
  progressBar.style.width = '0%';
  showScreen(exerciseScreen);
  startAmbient();
  startExercise(0);
});

loadSoundPrefs();
