(function() {
    'use strict';

    chrome.alarms.onAlarm.addListener(function(alarm) {
        chrome.action.setIcon({
            path: 'images/break.gif'
        });
        createNotification();
    });

    chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
        if (buttonIndex === 0) {
            chrome.tabs.create({
                url: chrome.runtime.getURL("exercises.html")
            });
            chrome.storage.local.set({ lastExerciseTime: new Date().toISOString() });
        }
        chrome.notifications.clear(notificationId);
    });

    chrome.notifications.onClosed.addListener(function() {
        chrome.action.setIcon({
            path: 'images/on.png'
        });
    });

    function createNotification() {
        chrome.storage.local.get('lastExerciseTime', function(data) {
            var message;
            if (!data.lastExerciseTime) {
                message = 'Time to rest your eyes and do some exercises.';
            } else {
                var exerciseDuration = 4 * 1000 * 60;
                var timePassed = Date.now() - Date.parse(data.lastExerciseTime) + exerciseDuration;
                var hours = Math.floor((timePassed / (1000 * 60 * 60)) % 24);
                var days = Math.floor(timePassed / (1000 * 60 * 60 * 24));

                if (days > 0) {
                    message = 'Last exercise was ' + days + ' day' + (days > 1 ? 's' : '') + ' ago.';
                } else if (hours > 0) {
                    message = 'Last exercise was ' + hours + ' hour' + (hours > 1 ? 's' : '') + ' ago.';
                } else {
                    message = 'Last exercise was less than an hour ago. Keep it up!';
                }
            }

            var options = {
                type: 'basic',
                iconUrl: 'images/alarm.png',
                title: 'Take a break',
                message: message,
                buttons: [{
                    title: 'Start exercises',
                    iconUrl: ''
                }, {
                    title: 'Skip',
                    iconUrl: ''
                }],
                requireInteraction: true
            };

            chrome.notifications.create('eyezenNotification', options);
        });
    }

})();
