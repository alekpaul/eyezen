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

// Transition chime — two-note rising interval, like Apple's mindfulness bell
function chimeTransition() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    // C6 + E6 (major third) with soft harmonics
    playTone(1047, t, 0.8, 0.12, 'sine');        // C6
    playTone(2094, t, 0.6, 0.04, 'sine');         // C7 harmonic
    playTone(1319, t + 0.15, 0.7, 0.10, 'sine');  // E6
    playTone(2638, t + 0.15, 0.5, 0.03, 'sine');  // E7 harmonic
  } catch(e) {}
}

// Completion sound — zen gong
const gongAudio = new Audio('audio/gong.ogg');
gongAudio.volume = 0.5;

function chimeDone() {
  try {
    gongAudio.currentTime = 0;
    gongAudio.play();
  } catch(e) {}
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
    chimeDone();
    setAnimation(null);
    showScreen(doneScreen);
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

  if (index > 0) chimeDone();

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
  startExercise(0);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  elapsedTotal = 0;
  progressBar.style.width = '0%';
  showScreen(exerciseScreen);
  startExercise(0);
});

// Gradient background animation
(function() {
  const el = document.getElementById('gradient');
  const gradients = [
    { start: [69,126,128], stop: [145,203,205] },
    { start: [53,76,116], stop: [82,123,156] },
    { start: [201,91,119], stop: [137,93,160] },
    { start: [138,219,176], stop: [157,197,120] },
    { start: [233,126,130], stop: [242,166,109] },
    { start: [146,122,155], stop: [193,96,161] },
    { start: [172,26,1], stop: [152,93,131] }
  ];
  const fps = 60;
  const transTime = 20;
  const stepsTotal = transTime * fps;
  let ci = 0, ni = 1, steps = 0;
  let vals = { start: [...gradients[0].start], stop: [...gradients[0].stop] };
  let diffs = { start: [0,0,0], stop: [0,0,0] };

  function calcDiffs() {
    for (const k of ['start','stop'])
      for (let i = 0; i < 3; i++)
        diffs[k][i] = (gradients[ni][k][i] - gradients[ci][k][i]) / stepsTotal;
  }

  function tick() {
    for (const k of ['start','stop'])
      for (let i = 0; i < 3; i++)
        vals[k][i] += diffs[k][i];

    const c1 = `rgb(${vals.start[0]|0},${vals.start[1]|0},${vals.start[2]|0})`;
    const c2 = `rgb(${vals.stop[0]|0},${vals.stop[1]|0},${vals.stop[2]|0})`;
    el.style.backgroundImage = `linear-gradient(45deg, ${c1}, ${c2})`;

    if (++steps > stepsTotal) {
      steps = 0;
      ci = ni;
      ni = (ni + 1) % gradients.length;
      vals = { start: [...gradients[ci].start], stop: [...gradients[ci].stop] };
      calcDiffs();
    }
    requestAnimationFrame(tick);
  }

  calcDiffs();
  requestAnimationFrame(tick);
})();
