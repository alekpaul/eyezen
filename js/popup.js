'use strict';

const ALARM_NAME = 'eyezenAlarm';

const toggleBtn = document.getElementById('toggleAlarm');
const intervalSelect = document.getElementById('interval');
const reminderSettings = document.getElementById('reminder-settings');

// Alarm controls
toggleBtn.addEventListener('click', async () => {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (alarm) {
    await chrome.alarms.clear(ALARM_NAME);
  } else {
    await createAlarm();
  }
  updateUI();
});

intervalSelect.addEventListener('change', async () => {
  chrome.storage.local.set({ interval: intervalSelect.value });
  await chrome.alarms.clear(ALARM_NAME);
  await createAlarm();
  updateUI();
});

async function createAlarm() {
  const data = await chrome.storage.local.get('interval');
  const mins = parseInt(intervalSelect.value || data.interval || '60');
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: mins,
    periodInMinutes: mins,
  });
  chrome.storage.local.set({ interval: mins });
  startCountdown('countdown-clock', Date.now() + mins * 60000);
}

async function updateUI() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (alarm) {
    toggleBtn.textContent = 'Disable Reminders';
    reminderSettings.style.display = 'block';
    chrome.action.setIcon({ path: 'images/on.png' });
    startCountdown('countdown-clock', alarm.scheduledTime);
  } else {
    toggleBtn.textContent = 'Enable Reminders';
    reminderSettings.style.display = 'none';
    chrome.action.setIcon({ path: 'images/off.png' });
  }
}

// Init
chrome.storage.local.get('interval', (data) => {
  intervalSelect.value = data.interval || '60';
});
updateUI();

// Sound settings
const ambientSlider = document.getElementById('popup-ambient');
const gongSlider = document.getElementById('popup-gong');
const muteBtn = document.getElementById('popup-mute-btn');
const muteIconOn = document.getElementById('mute-icon-on');
const muteIconOff = document.getElementById('mute-icon-off');

let soundPrefs = { ambientVolume: 0.08, gongVolume: 0.5, muted: false };

function updateMuteIcon() {
  muteIconOn.style.display = soundPrefs.muted ? 'none' : 'block';
  muteIconOff.style.display = soundPrefs.muted ? 'block' : 'none';
}

chrome.storage.local.get('soundPrefs', (data) => {
  if (data.soundPrefs) Object.assign(soundPrefs, data.soundPrefs);
  ambientSlider.value = soundPrefs.ambientVolume;
  gongSlider.value = soundPrefs.gongVolume;
  updateMuteIcon();
});

function saveSoundPrefs() {
  chrome.storage.local.set({ soundPrefs });
}

ambientSlider.addEventListener('input', () => {
  soundPrefs.ambientVolume = parseFloat(ambientSlider.value);
  saveSoundPrefs();
});

gongSlider.addEventListener('input', () => {
  soundPrefs.gongVolume = parseFloat(gongSlider.value);
  saveSoundPrefs();
});

muteBtn.addEventListener('click', () => {
  soundPrefs.muted = !soundPrefs.muted;
  updateMuteIcon();
  saveSoundPrefs();
});
