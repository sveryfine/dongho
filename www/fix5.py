import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update IndexedDB logic to support alarmStore
js = js.replace("""const DB_NAME = 'ClockAppDB';
const STORE_NAME = 'bgStore';""", """const DB_NAME = 'ClockAppDB';
const STORE_NAME = 'bgStore';
const ALARM_STORE = 'alarmStore';""")

js = js.replace("""        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }""", """        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(ALARM_STORE)) {
            db.createObjectStore(ALARM_STORE);
        }""")


# 2. Add functions for saving and loading custom alarm
alarm_db_funcs = """
function saveCustomAlarmDB(file, name) {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(ALARM_STORE, 'readwrite');
        const store = tx.objectStore(ALARM_STORE);
        store.put({ file: file, name: name }, 'custom_alarm');
    };
}

function loadCustomAlarmDB() {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(ALARM_STORE)) return;
        const tx = db.transaction(ALARM_STORE, 'readonly');
        const store = tx.objectStore(ALARM_STORE);
        const req = store.get('custom_alarm');
        req.onsuccess = () => {
            if (req.result && req.result.file) {
                const url = URL.createObjectURL(req.result.file);
                const alarmAudio = document.getElementById('alarm-audio');
                if (alarmAudio) alarmAudio.src = url;
                const nameLabel = document.getElementById('alarm-sound-name');
                if (nameLabel) nameLabel.innerText = req.result.name;
            }
        };
    };
}
loadCustomAlarmDB();

const alarmInput = document.getElementById('alarm-sound-input');
const btnTestAlarm = document.getElementById('btn-test-alarm');
if (alarmInput) {
    alarmInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            saveCustomAlarmDB(file, file.name);
            const url = URL.createObjectURL(file);
            const alarmAudio = document.getElementById('alarm-audio');
            if (alarmAudio) alarmAudio.src = url;
            const nameLabel = document.getElementById('alarm-sound-name');
            if (nameLabel) nameLabel.innerText = file.name;
        }
    });
}
if (btnTestAlarm) {
    btnTestAlarm.addEventListener('click', () => {
        triggerAlarm();
        setTimeout(stopAlarm, 3000); // Test for 3 seconds
    });
}
"""
js = js + alarm_db_funcs

# 3. Handle Alarm Triggering and Stopping
js = js.replace("""function tmTick() {
    if (tmSecondsRemaining > 0) {
        tmSecondsRemaining--;
        renderTimer();
    } else {
        clearInterval(tmInterval);
        alarmSound.play().catch(e => console.log('Autoplay prevented', e));
        tmStartBtn.style.display = 'none';
        tmPauseBtn.style.display = 'none';
        tmResumeBtn.style.display = 'none';
        tmStopBtn.style.display = 'block';
    }
}""", """
let isAlarmRinging = false;
let vibrateInterval;

function triggerAlarm() {
    isAlarmRinging = true;
    const alarmAudio = document.getElementById('alarm-audio');
    const defaultAlarm = document.getElementById('alarm-sound');
    
    // Play custom audio if available, else default beep
    if (alarmAudio && alarmAudio.src) {
        alarmAudio.play().catch(e => console.log('Autoplay prevented', e));
    } else {
        defaultAlarm.play().catch(e => console.log('Autoplay prevented', e));
    }
    
    // Trigger vibration looping
    if (navigator.vibrate) {
        navigator.vibrate([500, 500, 500, 500]);
        vibrateInterval = setInterval(() => {
            navigator.vibrate([500, 500, 500, 500]);
        }, 2000);
    }
}

function stopAlarm() {
    isAlarmRinging = false;
    const alarmAudio = document.getElementById('alarm-audio');
    const defaultAlarm = document.getElementById('alarm-sound');
    
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }
    if (defaultAlarm) {
        defaultAlarm.pause();
        defaultAlarm.currentTime = 0;
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(0);
        clearInterval(vibrateInterval);
    }
}

// Stop alarm when touching/clicking screen
window.addEventListener('click', () => { if (isAlarmRinging) stopAlarm(); });
window.addEventListener('touchstart', () => { if (isAlarmRinging) stopAlarm(); });

function tmTick() {
    if (tmSecondsRemaining > 0) {
        tmSecondsRemaining--;
        renderTimer();
    } else {
        clearInterval(tmInterval);
        triggerAlarm();
        tmStartBtn.style.display = 'none';
        tmPauseBtn.style.display = 'none';
        tmResumeBtn.style.display = 'none';
        tmStopBtn.style.display = 'block';
    }
}""")

# 4. Also stop alarm on Stop button
js = js.replace("""tmStopBtn.addEventListener('click', () => {
    clearInterval(tmInterval);
    alarmSound.pause();
    alarmSound.currentTime = 0;
    tmSetup.style.display = 'flex';
    tmDisplay.style.display = 'none';
    tmControls.style.display = 'none';
});""", """tmStopBtn.addEventListener('click', () => {
    clearInterval(tmInterval);
    stopAlarm();
    tmSetup.style.display = 'flex';
    tmDisplay.style.display = 'none';
    tmControls.style.display = 'none';
});""")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Done")
