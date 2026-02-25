'use strict';

const ALARM_NAME = 'eyezenAlarm';
const NOTIFICATION_ID = 'eyezenBreak';

chrome.alarms.onAlarm.addListener(() => {
  chrome.action.setIcon({ path: 'images/break.gif' });
  showBreakNotification();
});

chrome.notifications.onButtonClicked.addListener((id, btnIndex) => {
  if (btnIndex === 0) {
    chrome.tabs.create({ url: chrome.runtime.getURL('exercises.html') });
    chrome.storage.local.set({ lastExerciseTime: Date.now() });
  }
  chrome.notifications.clear(id);
});

chrome.notifications.onClosed.addListener(() => {
  chrome.action.setIcon({ path: 'images/on.png' });
});

function showBreakNotification() {
  chrome.storage.local.get('lastExerciseTime', (data) => {
    let message = 'Time to rest your eyes and do some exercises.';

    if (data.lastExerciseTime) {
      const elapsed = Date.now() - data.lastExerciseTime;
      const hrs = Math.floor(elapsed / 3600000);
      const days = Math.floor(elapsed / 86400000);

      if (days > 0) {
        message = `Last exercise was ${days} day${days > 1 ? 's' : ''} ago.`;
      } else if (hrs > 0) {
        message = `Last exercise was ${hrs} hour${hrs > 1 ? 's' : ''} ago.`;
      } else {
        message = 'Last exercise was less than an hour ago. Keep it up!';
      }
    }

    chrome.notifications.create(NOTIFICATION_ID, {
      type: 'basic',
      iconUrl: 'images/alarm.png',
      title: 'Take a break',
      message,
      buttons: [{ title: 'Start exercises' }, { title: 'Skip' }],
      requireInteraction: true,
    });
  });
}
