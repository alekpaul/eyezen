(function($) {
    'use strict';

    var alarmName = 'eyezenAlarm';

    $('#toggleAlarm').click(toggleAlarm);

    $("#interval").change(resetAlarm);

    chrome.storage.local.get('interval', function(data) {
        $("#interval").val(data.interval || '60');
    });

    initialSettings();

    chrome.alarms.get(alarmName, synchronizeClockWithAlarmTimer);

    function toggleAlarm() {
        chrome.alarms.get(alarmName, function(isAlarmExists) {
            if (isAlarmExists) {
                cancelAlarm();
                initialSettings();
            } else {
                createAlarm(function() {
                    initialSettings();
                });
            }
        });
    }

    function resetAlarm() {
        chrome.storage.local.set({ interval: $(this).val() });
        chrome.alarms.get(alarmName, function(isAlarmExists) {
            if (isAlarmExists) cancelAlarm();
            createAlarm(function() {
                initialSettings();
            });
        });
    }

    function initialSettings() {
        chrome.alarms.get(alarmName, function(isAlarmExists) {
            var toggleLabel;
            if (isAlarmExists) {
                toggleLabel = 'Disable';
                $(".wrapper").slideDown("fast");
                chrome.action.setIcon({
                    path: 'images/on.png'
                });
            } else {
                toggleLabel = 'Enable';
                $(".wrapper").slideUp("fast");
                chrome.action.setIcon({
                    path: 'images/off.png'
                });
            }
            document.getElementById('toggleAlarm').innerText = toggleLabel;
        });
    }

    function synchronizeClockWithAlarmTimer(alarm) {
        if (alarm) {
            var deadline = new Date(alarm.scheduledTime).toUTCString();
            initializeClock('countdown-clock', deadline);
        }
    };

    function createAlarm(callback) {
        chrome.storage.local.get('interval', function(data) {
            var $interval = parseInt($("#interval").val() || data.interval || '60');
            chrome.alarms.create(alarmName, {
                delayInMinutes: $interval,
                periodInMinutes: $interval
            });
            chrome.storage.local.set({ interval: $interval });
            var deadline = new Date(Date.now() + $interval * 60 * 1000);
            initializeClock('countdown-clock', deadline);
            if (callback) callback();
        });
    }

    function cancelAlarm() {
        chrome.alarms.clear(alarmName);
    }

})(jQuery);
