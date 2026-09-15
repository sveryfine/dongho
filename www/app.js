// ====== 0. CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t (Settings State) ======
const defaultSettings = {
    hideSeconds: false,
    hideMinutes: false,
    hideColons: false,
    showDate: true,
    showWeek: true,
    showLunar: true,
    autoRotate: true,
    vertical: false,
    advancedSize: false,
    globalSize: 80,
    h1Size: 80,
    h2Size: 80,
    m1Size: 80,
    m2Size: 80,
    s1Size: 80,
    s2Size: 80,
    colonSpacing: -12,
    colonSize: 80,
    datePos: { x: 0, y: 0 },
    lunarPos: { x: 0, y: 0 },
    keepAwake: false,
    dimTime: 15,
    fontStyle: 'default',
    clockBg: 'none',
    backgroundStyle: 'bg-black',
    customBlockSize: 100,
    elementPositions: {
        h1: { x: 0, y: 0 }, h2: { x: 0, y: 0 },
        colon1: { x: 0, y: 0 }, m1: { x: 0, y: 0 },
        m2: { x: 0, y: 0 }, colon2: { x: 0, y: 0 },
        s1: { x: 0, y: 0 }, s2: { x: 0, y: 0 },
        date: { x: 0, y: 0 }, week: { x: 0, y: 0 },
        lunar: { x: 0, y: 0 }
    }
};

let settings = { ...defaultSettings };

function loadSettings() {
    const saved = localStorage.getItem('dongho_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            settings = { ...defaultSettings, ...parsed };

            // Fix cho dÃ¡Â»Â¯ liÃ¡Â»â€¡u cÃ…Â©: NÃ¡ÂºÂ¿u globalSize khÃƒÂ¡c 80 nhÃ†Â°ng cÃƒÂ¡c sÃ¡Â»â€˜ lÃ¡ÂºÂ» vÃ¡ÂºÂ«n kÃ¡ÂºÂ¹t Ã¡Â»Å¸ 80 (do lÃ¡Â»â€”i trÃ†Â°Ã¡Â»â€ºc Ã„â€˜ÃƒÂ³)
            if (settings.globalSize !== 80 && settings.h1Size === 80 && settings.m1Size === 80) {
                const advancedKeys = ['h1Size', 'h2Size', 'm1Size', 'm2Size', 's1Size', 's2Size'];
                advancedKeys.forEach(key => settings[key] = settings.globalSize);
            }
        } catch (e) {
            console.error('LÃ¡Â»â€”i Ã„â€˜Ã¡Â»Â c settings:', e);
        }
    }
}
loadSettings();

// ====== 0.5 Quản lý Cấu hình (Profiles) ======
let savedProfiles = {};

function loadProfiles() {
    const saved = localStorage.getItem('dongho_profiles');
    if (saved) {
        try {
            savedProfiles = JSON.parse(saved);
        } catch (e) {
            console.error('Lỗi đọc profiles:', e);
            savedProfiles = {};
        }
    }
}
loadProfiles();

function renderProfileSelector() {
    const selector = document.getElementById('profile-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="current">Cấu hình hiện tại</option>';
    Object.keys(savedProfiles).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        selector.appendChild(opt);
    });
    updateProfileButtons();
}

function updateProfileButtons() {
    const selector = document.getElementById('profile-selector');
    if (!selector) return;
    const isCustom = selector.value !== 'current';
    
    const btnSave = document.getElementById('btn-save-profile');
    const btnUpdate = document.getElementById('btn-update-profile');
    const btnDelete = document.getElementById('btn-delete-profile');
    
    if (btnSave) btnSave.style.display = isCustom ? 'none' : 'block';
    if (btnUpdate) btnUpdate.style.display = isCustom ? 'block' : 'none';
    if (btnDelete) btnDelete.style.display = isCustom ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    renderProfileSelector();
    
    document.getElementById('profile-selector')?.addEventListener('change', (e) => {
        updateProfileButtons();
        if (e.target.value !== 'current') {
            const profileSettings = savedProfiles[e.target.value];
            if (profileSettings) {
                settings = { ...defaultSettings, ...profileSettings };
                applySettingsToUI();
                if (typeof updateClock === 'function') updateClock();
                if (typeof updateDateDisplay === 'function') updateDateDisplay();
                localStorage.setItem('dongho_settings', JSON.stringify(settings));
            }
        }
    });

    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
        const name = prompt('Nhập tên cho cấu hình mới:');
        if (name && name.trim()) {
            savedProfiles[name.trim()] = { ...settings };
            localStorage.setItem('dongho_profiles', JSON.stringify(savedProfiles));
            renderProfileSelector();
            document.getElementById('profile-selector').value = name.trim();
            updateProfileButtons();
        }
    });

    document.getElementById('btn-update-profile')?.addEventListener('click', () => {
        const name = document.getElementById('profile-selector').value;
        if (name !== 'current' && savedProfiles[name]) {
            savedProfiles[name] = { ...settings };
            localStorage.setItem('dongho_profiles', JSON.stringify(savedProfiles));
            alert('Đã cập nhật cấu hình: ' + name);
        }
    });

    document.getElementById('btn-delete-profile')?.addEventListener('click', () => {
        const name = document.getElementById('profile-selector').value;
        if (name !== 'current' && savedProfiles[name]) {
            if (confirm('Bạn có chắc chắn muốn xóa cấu hình: ' + name + '?')) {
                delete savedProfiles[name];
                localStorage.setItem('dongho_profiles', JSON.stringify(savedProfiles));
                renderProfileSelector();
            }
        }
    });
});

// ====== 1. XÃ¡Â»Â­ lÃƒÂ½ chÃ¡ÂºÂ¡m mÃƒÂ n hÃƒÂ¬nh & NÃƒÂºt CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t ======
const settingsBtn = document.getElementById('settings-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsModal = document.getElementById('settings-modal');
const modalOverlay = document.getElementById('modal-overlay');
let hideSettingsTimeout;

let isAppLocked = false;

function showSettings() {
    if (isAppLocked) {
        settingsBtn.classList.add('hidden');
    } else {
        settingsBtn.classList.remove('hidden');
    }
    if (fullscreenBtn) fullscreenBtn.classList.remove('hidden');
    clearTimeout(hideSettingsTimeout);
    hideSettingsTimeout = setTimeout(() => {
        settingsBtn.classList.add('hidden');
        if (fullscreenBtn) fullscreenBtn.classList.add('hidden');
    }, 9000);
}

document.body.addEventListener('touchstart', (e) => {
    if (!settingsModal.classList.contains('active')) showSettings();
});
document.body.addEventListener('mousedown', (e) => {
    if (!settingsModal.classList.contains('active')) showSettings();
});

showSettings();

// Mở modal cài đặt
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal.classList.add('active');
    modalOverlay.classList.add('active');
    clearTimeout(hideSettingsTimeout);
});

// Toàn màn hình
function toggleFullscreen() {
    isAppLocked = !isAppLocked;
    
    let ScreenPinning = null;
    if (window.Capacitor && window.Capacitor.registerPlugin) {
        ScreenPinning = window.Capacitor.registerPlugin('ScreenPinning');
    } else if (window.Capacitor && window.Capacitor.Plugins) {
        ScreenPinning = window.Capacitor.Plugins.ScreenPinning;
    }
    
    if (isAppLocked) {
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } catch (e) {}
        if (ScreenPinning) ScreenPinning.pin();
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }
        } catch (e) {}
        if (ScreenPinning) ScreenPinning.unpin();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
    showSettings();
}
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });
}

// Ä Ã³ng modal
document.getElementById('modal-close').addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    // Revert unsaved changes
    loadSettings();
    applySettingsToUI();
    showSettings();
});

modalOverlay.addEventListener('click', () => {
    settingsModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    showSettings();
});

// ====== 1b. Xá»­ lÃ½ Toggle switches ======
function bindToggle(id, settingKey, callback) {
    const el = document.getElementById(id);
    el.addEventListener('change', () => {
        settings[settingKey] = el.checked;
        if (callback) callback();
        updateClock(); // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t lÃ¡ÂºÂ¡i Ã„â€˜Ã¡Â»â€œng hÃ¡Â»â€œ ngay
    });
}

function syncToggleUI(id, settingKey) {
    document.getElementById(id).checked = settings[settingKey];
}

bindToggle('toggle-hide-seconds', 'hideSeconds');
bindToggle('toggle-hide-minutes', 'hideMinutes');
bindToggle('toggle-hide-colons', 'hideColons');
bindToggle('toggle-show-date', 'showDate', updateDateDisplay);
bindToggle('toggle-show-week', 'showWeek', updateDateDisplay);
bindToggle('toggle-show-lunar', 'showLunar', updateDateDisplay);
bindToggle('toggle-auto-rotate', 'autoRotate', () => { updateTimeDisplay(); });
bindToggle('toggle-vertical', 'vertical', () => { updateTimeDisplay(); });
bindToggle('toggle-advanced-size', 'advancedSize', updateSizeControls);
bindToggle('toggle-keep-awake', 'keepAwake', manageWakeLock);

const sliderGlobal = document.getElementById('slider-global-size');
const sliderH1 = document.getElementById('slider-h1-size');
const sliderH2 = document.getElementById('slider-h2-size');
const sliderM1 = document.getElementById('slider-m1-size');
const sliderM2 = document.getElementById('slider-m2-size');
const sliderS1 = document.getElementById('slider-s1-size');
const sliderS2 = document.getElementById('slider-s2-size');
const sliderColonSpacing = document.getElementById('slider-colon-spacing');
const sliderColonSize = document.getElementById('slider-colon-size');


const sliderCustomBlockSize = document.getElementById('slider-custom-block-size');
const inputDimTime = document.getElementById('input-dim-time');
const advancedSizeControls = document.getElementById('advanced-size-controls');
const customBlockSizeControl = document.getElementById('custom-block-size-control');

function updateSizeControls() {
    advancedSizeControls.style.display = settings.advancedSize ? 'block' : 'none';
    updateCSSVariables();
}

function updateCSSVariables() {
    document.documentElement.style.setProperty('--digit-global-size', settings.globalSize + 'px');

    if (settings.advancedSize) {
        document.documentElement.style.setProperty('--digit-h1-size', settings.h1Size + 'px');
        document.documentElement.style.setProperty('--digit-h2-size', settings.h2Size + 'px');
        document.documentElement.style.setProperty('--digit-m1-size', settings.m1Size + 'px');
        document.documentElement.style.setProperty('--digit-m2-size', settings.m2Size + 'px');
        document.documentElement.style.setProperty('--digit-s1-size', settings.s1Size + 'px');
        document.documentElement.style.setProperty('--digit-s2-size', settings.s2Size + 'px');
    } else {
        document.documentElement.style.setProperty('--digit-h1-size', settings.globalSize + 'px');
        document.documentElement.style.setProperty('--digit-h2-size', settings.globalSize + 'px');
        document.documentElement.style.setProperty('--digit-m1-size', settings.globalSize + 'px');
        document.documentElement.style.setProperty('--digit-m2-size', settings.globalSize + 'px');
        document.documentElement.style.setProperty('--digit-s1-size', settings.globalSize + 'px');
        document.documentElement.style.setProperty('--digit-s2-size', settings.globalSize + 'px');
    }

    document.documentElement.style.setProperty('--colon-spacing', settings.colonSpacing);
    document.documentElement.style.setProperty('--colon-size', settings.colonSize + 'px');
    document.documentElement.style.setProperty('--clock-x', (settings.clockX || 0) + 'px');
    document.documentElement.style.setProperty('--clock-y', (settings.clockY || 0) + 'px');
    document.documentElement.style.setProperty('--custom-block-scale', settings.customBlockSize / 100);
    setTimeout(fitClockToScreen, 10);
}

function fitClockToScreen() {
    const sheetContents = document.querySelectorAll('.sheet-content');
    if (sheetContents.length === 0) return;

    sheetContents.forEach(content => {
        // Reset scale to measure real dimensions
        content.style.transform = 'scale(1)';

        const display = content.querySelector('.digits-display');
        let contentWidth = display ? display.scrollWidth : content.scrollWidth;

        const controls = content.querySelector('.controls');
        if (controls) {
            contentWidth = Math.max(contentWidth, controls.scrollWidth);
        }

        // Add safe padding
        let baseWidth = contentWidth + 60;

        // Set a reasonable minimum virtual width to prevent elements from getting too huge on big screens
        if (baseWidth < 800) baseWidth = 800;

        const scaleX = window.innerWidth / baseWidth;
        const scaleY = window.innerHeight / 800;

        // Scale down to fit, but don't scale up beyond 1x
        const scale = Math.min(1, scaleX, scaleY);

        content.style.transform = `scale(${scale})`;
    });
}
window.addEventListener('resize', fitClockToScreen);

function fitModalToScreen() {
    const baseWidth = 380;
    const baseHeight = 550;
    const margin = 20;

    const scaleX = (window.innerWidth - margin) / baseWidth;
    const scaleY = (window.innerHeight - margin) / baseHeight;
    const scale = Math.min(1, scaleX, scaleY);

    document.documentElement.style.setProperty('--modal-scale', scale);
}
window.addEventListener('resize', fitModalToScreen);
fitModalToScreen();

let previousGlobalSize = settings.globalSize;

function syncSliderUI(sliderEl, val) {
    sliderEl.value = val;
    const valEl = document.getElementById(sliderEl.id.replace('slider-', 'val-'));
    if (valEl) valEl.innerText = val;
}

sliderGlobal.addEventListener('input', (e) => {
    const newVal = parseInt(e.target.value);
    const delta = newVal - previousGlobalSize;

    settings.globalSize = newVal;
    const valEl = document.getElementById('val-global-size');
    if (valEl) valEl.innerText = newVal;

    const advancedKeys = ['h1Size', 'h2Size', 'm1Size', 'm2Size', 's1Size', 's2Size', 'colonSize'];
    advancedKeys.forEach(key => {
        let nextVal = settings[key] + delta;
        if (nextVal < 1) nextVal = 1;
        if (nextVal > 1000) nextVal = 1000;
        settings[key] = nextVal;
    });

    syncSliderUI(sliderH1, settings.h1Size);
    syncSliderUI(sliderH2, settings.h2Size);
    syncSliderUI(sliderM1, settings.m1Size);
    syncSliderUI(sliderM2, settings.m2Size);
    syncSliderUI(sliderS1, settings.s1Size);
    syncSliderUI(sliderS2, settings.s2Size);
    syncSliderUI(sliderColonSize, settings.colonSize);



    previousGlobalSize = newVal;
    updateCSSVariables();
});

function bindSlider(sliderEl, settingKey) {
    const valEl = document.getElementById(sliderEl.id.replace('slider-', 'val-'));
    sliderEl.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        settings[settingKey] = val;
        if (valEl) valEl.innerText = val;
        updateCSSVariables();
    });
}

bindSlider(sliderH1, 'h1Size');
bindSlider(sliderH2, 'h2Size');
bindSlider(sliderM1, 'm1Size');
bindSlider(sliderM2, 'm2Size');
bindSlider(sliderS1, 's1Size');
bindSlider(sliderS2, 's2Size');
bindSlider(sliderColonSpacing, 'colonSpacing');
bindSlider(sliderColonSize, 'colonSize');


if (sliderCustomBlockSize) bindSlider(sliderCustomBlockSize, 'customBlockSize');

// ====== XÃ¡Â»Â­ lÃƒÂ½ chÃ¡Â»â€˜ng trÃ†Â°Ã¡Â»Â£t nhÃ¡ÂºÂ§m thanh cuÃ¡Â»â„¢n trÃƒÂªn mobile ======
let isVerticalScroll = false;
let startTouchY = 0;
let startTouchX = 0;
let initialSliderValues = new Map();

document.querySelectorAll('.styled-slider').forEach(slider => {
    slider.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches[0]) return;
        startTouchY = e.touches[0].clientY;
        startTouchX = e.touches[0].clientX;
        isVerticalScroll = false;
        initialSliderValues.set(slider, slider.value);
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
        if (!e.touches || !e.touches[0]) return;
        const dy = Math.abs(e.touches[0].clientY - startTouchY);
        const dx = Math.abs(e.touches[0].clientX - startTouchX);
        
        // NÃ¡ÂºÂ¿u vuÃ¡Â»â€˜t dÃ¡Â»Âc nhiÃ¡Â»Âu hÃ†Â¡n ngang vÃƒÂ  di chuyÃ¡Â»Æ’n > 5px, nghÃ„Â©a lÃƒÂ  Ã„â€˜ang cuÃ¡Â»â„¢n modal
        if (dy > dx && dy > 5) {
            isVerticalScroll = true;
            const initVal = initialSliderValues.get(slider);
            if (slider.value !== initVal) {
                slider.value = initVal; // HoÃƒÂ n tÃƒÂ¡c giÃƒÂ¡ trÃ¡Â»â€¹
                slider.dispatchEvent(new Event('input')); // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t giao diÃ¡Â»â€¡n
            }
        }
    }, { passive: true });
});

if (inputDimTime) {
    inputDimTime.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 0) val = 0;
        settings.dimTime = val;
        e.target.value = val;
        resetIdleTimer();
    });
}

// ====== IndexedDB cho NÃ¡Â»Ân tÃƒÂ¹y chÃ¡Â»â€°nh & Ãƒâ€šm bÃƒÂ¡o thÃ¡Â»Â©c ======
const DB_NAME = 'ClockAppDB';
const STORE_NAME = 'bgStore';
const ALARM_STORE = 'alarmStore';

function saveCustomBgDB(file) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
    request.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(file, 'customBg');
    };
}
function loadCustomBgDB(callback) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
    request.onsuccess = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) return callback(null);
        const tx = db.transaction(STORE_NAME, 'readonly');
        const getReq = tx.objectStore(STORE_NAME).get('customBg');
        getReq.onsuccess = () => callback(getReq.result);
        getReq.onerror = () => callback(null);
    };
    request.onerror = () => callback(null);
}

function saveCustomBlockBgDB(file) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
    request.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(file, 'customBlockBg');
    };
}
function loadCustomBlockBgDB(callback) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
    request.onsuccess = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) return callback(null);
        const tx = db.transaction(STORE_NAME, 'readonly');
        const getReq = tx.objectStore(STORE_NAME).get('customBlockBg');
        getReq.onsuccess = () => callback(getReq.result);
        getReq.onerror = () => callback(null);
    };
    request.onerror = () => callback(null);
}

let customBgUrl = null;
let currentCustomType = null; // 'image' or 'video'
let customBlockBgUrl = null;

// ====== Xá»­ lÃ½ HÃ¬nh ná»n ======
function applyBackgroundStyle(value) {
    // Remove all bg classes and custom styles
    const dropdown = document.getElementById('bg-selector-dropdown');
    let allBgClasses = ['bg-black', 'animated-gradient-bg'];
    if (dropdown) {
        Array.from(dropdown.options).forEach(opt => {
            const v = opt.value;
            if (v.startsWith('bg-')) allBgClasses.push(v);
            if (v.includes('|')) {
                v.split('|').forEach(part => {
                    if (part.startsWith('bg-')) allBgClasses.push(part);
                });
            }
        });
    }
    document.body.classList.remove(...new Set(allBgClasses));
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';

    const bgVideo = document.getElementById('custom-bg-video');
    if (bgVideo) bgVideo.style.display = 'none';

    // Stop any canvas effect
    if (window.bgEffects) window.bgEffects.stop();
    
    // Check custom color
    if (value && value.startsWith('color|')) {
        const hex = value.split('|')[1];
        document.body.style.backgroundColor = hex;
        
        let optCustom = document.getElementById('opt-custom-bg');
        if (optCustom) {
            optCustom.textContent = 'Nền màu tuỳ chỉnh';
            optCustom.style.display = 'block';
            optCustom.value = value;
        }
        if (dropdown) dropdown.value = value;
        return;
    }

    // Check custom
    if (value === 'custom') {
        const optCustom = document.getElementById('opt-custom-bg');
        if (optCustom) optCustom.style.display = 'block';

        loadCustomBgDB(file => {
            if (file) {
                if (customBgUrl) URL.revokeObjectURL(customBgUrl);
                customBgUrl = URL.createObjectURL(file);
                if (file.type.startsWith('video/')) {
                    if (bgVideo) {
                        bgVideo.src = customBgUrl;
                        bgVideo.style.display = 'block';
                    }
                } else {
                    document.body.style.backgroundImage = `url(${customBgUrl})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                }
            } else {
                // if lost, fallback
                applyBackgroundStyle('bg-black');
            }
        });
        if (dropdown) dropdown.value = value;
        return;
    }

    // Parse value: could be "bg-black", "fx-particles", or "fx-particles|bg-anim-cold-4"
    let fxEffect = null;
    let bgClass = null;

    if (value.includes('|')) {
        const parts = value.split('|');
        fxEffect = parts[0].replace('fx-', '');
        bgClass = parts[1];
    } else if (value.startsWith('fx-')) {
        fxEffect = value.replace('fx-', '');
    } else {
        bgClass = value;
    }

    // Apply gradient bg
    if (bgClass) {
        document.body.classList.add(bgClass);
        if (bgClass.includes('anim')) {
            document.body.classList.add('animated-gradient-bg');
        }
    }

    // Start canvas effect
    if (fxEffect && window.bgEffects) {
        window.bgEffects.start(fxEffect);
    }

    if (dropdown) dropdown.value = value;
}

const bgDropdown = document.getElementById('bg-selector-dropdown');
if (bgDropdown) {
    bgDropdown.addEventListener('change', (e) => {
        const bgClass = e.target.value;
        settings.backgroundStyle = bgClass;
        applyBackgroundStyle(bgClass);
    });
}

const btnColorPicker = document.getElementById('btn-color-picker');
const inputColorBg = document.getElementById('input-color-bg');
if (btnColorPicker && inputColorBg) {
    btnColorPicker.addEventListener('click', () => {
        inputColorBg.click();
    });
    inputColorBg.addEventListener('input', (e) => {
        const hex = e.target.value;
        settings.backgroundStyle = 'color|' + hex;
        applyBackgroundStyle('color|' + hex);
    });
}

const btnUploadBg = document.getElementById('btn-upload-bg');
const inputUploadBg = document.getElementById('input-upload-bg');
if (btnUploadBg && inputUploadBg) {
    btnUploadBg.addEventListener('click', () => {
        inputUploadBg.click();
    });
    inputUploadBg.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            saveCustomBgDB(file);
            settings.backgroundStyle = 'custom';
            applyBackgroundStyle('custom');
        }
    });
}

let widgetCaptureTimeout = null;
function captureAndSendWidget() {
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.saveWidgetImage === 'function') {
        clearTimeout(widgetCaptureTimeout);
        widgetCaptureTimeout = setTimeout(() => {
            const clockDisplay = document.querySelector('#sheet-clock .sheet-content');
            if (clockDisplay && typeof html2canvas !== 'undefined') {
                html2canvas(clockDisplay, {
                    backgroundColor: null,
                    scale: 2 // Tăng chất lượng
                }).then(canvas => {
                    const base64Image = canvas.toDataURL('image/png').split(',')[1];
                    window.AndroidWidgetBridge.saveWidgetImage(base64Image);
                }).catch(err => console.error('html2canvas error', err));
            }
        }, 50); // Đợi UI render xong
    }
}

function syncWidgetSettings() {
    if (typeof captureAndSendWidget === 'function') {
        captureAndSendWidget();
    }
    if (window.AndroidWidgetBridge && typeof window.AndroidWidgetBridge.saveWidgetSettings === 'function') {
        let suffix = '';
        if (settings.fontStyle === 'font2') suffix = 'a';
        else if (settings.fontStyle === 'font3') suffix = 'b';
        else if (settings.fontStyle === 'font4') suffix = 'c';
        else if (settings.fontStyle === 'font5') suffix = 'd';
        else if (settings.fontStyle === 'font6') suffix = 'e';
        else if (settings.fontStyle === 'font7') suffix = 'n';
        
        const widgetConfig = {
            suffix: suffix,
            globalSize: settings.globalSize,
            advancedSize: settings.advancedSize,
            sizes: {
                h1: settings.h1Size, h2: settings.h2Size,
                m1: settings.m1Size, m2: settings.m2Size,
                colon: settings.colonSize
            },
            positions: {
                h1: settings.elementPositions.h1, h2: settings.elementPositions.h2,
                m1: settings.elementPositions.m1, m2: settings.elementPositions.m2,
                colon: settings.elementPositions.colon1
            },
            colonSpacing: settings.colonSpacing,
            hideColons: settings.hideColons
        };
        window.AndroidWidgetBridge.saveWidgetSettings(JSON.stringify(widgetConfig));
    }
}

function applySettingsToUI() {
    syncToggleUI('toggle-hide-seconds', 'hideSeconds');
    syncToggleUI('toggle-hide-minutes', 'hideMinutes');
    syncToggleUI('toggle-hide-colons', 'hideColons');
    syncToggleUI('toggle-show-date', 'showDate');
    syncToggleUI('toggle-show-week', 'showWeek');
    syncToggleUI('toggle-show-lunar', 'showLunar');
    syncToggleUI('toggle-auto-rotate', 'autoRotate');
    syncToggleUI('toggle-vertical', 'vertical');
    syncToggleUI('toggle-keep-awake', 'keepAwake');
    syncToggleUI('toggle-advanced-size', 'advancedSize');
    
    syncWidgetSettings();

    previousGlobalSize = settings.globalSize;
    syncSliderUI(sliderGlobal, settings.globalSize);
    syncSliderUI(sliderH1, settings.h1Size);
    syncSliderUI(sliderH2, settings.h2Size);
    syncSliderUI(sliderM1, settings.m1Size);
    syncSliderUI(sliderM2, settings.m2Size);
    syncSliderUI(sliderS1, settings.s1Size);
    syncSliderUI(sliderS2, settings.s2Size);
    syncSliderUI(sliderColonSpacing, settings.colonSpacing);
    syncSliderUI(sliderColonSize, settings.colonSize);


    if (sliderCustomBlockSize) syncSliderUI(sliderCustomBlockSize, settings.customBlockSize || 100);
    if (inputDimTime) {
        inputDimTime.value = settings.dimTime;
    }

    applyBackgroundStyle(settings.backgroundStyle);

    const fontDropdown = document.getElementById('font-selector-dropdown');
    if (fontDropdown) fontDropdown.value = settings.fontStyle;

    const clockBgDropdown = document.getElementById('clock-bg-selector');
    if (clockBgDropdown) clockBgDropdown.value = settings.clockBg;
    applyClockBgEffect(settings.clockBg);

    if (typeof applyDraggablePositions === 'function') {
        applyElementPositions();
    }

    updateSizeControls();
    updateCSSVariables();
    manageWakeLock();
}

let wakeLock = null;
async function manageWakeLock() {
    if (settings.keepAwake) {
        if ('wakeLock' in navigator) {
            try {
                if (!wakeLock) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    wakeLock.addEventListener('release', () => {
                        wakeLock = null;
                    });
                }
            } catch (err) {
                console.warn('Wake Lock error:', err);
            }
        }
    } else {
        if (wakeLock) {
            wakeLock.release();
            wakeLock = null;
        }
    }
}

// Re-request wake lock when page becomes visible again
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        manageWakeLock();
    }
});

// LÃ†Â°u & MÃ¡ÂºÂ·c Ã„â€˜Ã¡Â»â€¹nh
document.getElementById('btn-save-settings').addEventListener('click', () => {
    localStorage.setItem('dongho_settings', JSON.stringify(settings));
    syncWidgetSettings();
    // Ä Ã³ng modal khi lÆ°u
    document.getElementById('modal-close').click();
});

const confirmModal = document.getElementById('confirm-modal');

document.getElementById('btn-reset-settings').addEventListener('click', () => {
    confirmModal.classList.add('active');
});

document.getElementById('confirm-cancel').addEventListener('click', () => {
    confirmModal.classList.remove('active');
});

document.getElementById('confirm-ok').addEventListener('click', () => {
    confirmModal.classList.remove('active');
    localStorage.removeItem('dongho_settings');
    settings = { ...defaultSettings };
    
    // Reset profile selector
    const selector = document.getElementById('profile-selector');
    if (selector) selector.value = 'current';
    if (typeof updateProfileButtons === 'function') updateProfileButtons();
    
    applySettingsToUI();
    updateClock();
    updateDateDisplay();
});

// ====== QuÃ¡ÂºÂ£n lÃƒÂ½ ChÃ¡ÂºÂ¿ Ã„â€˜Ã¡Â»â„¢ mÃ¡Â»Â khi khÃƒÂ´ng tÃ†Â°Ã†Â¡ng tÃƒÂ¡c (Idle Dimming) ======
let idleTimer;
function resetIdleTimer() {
    document.body.classList.remove('idle-dim');
    clearTimeout(idleTimer);

    // Resume animations to save battery
    if (window.bgEffects) window.bgEffects.resume();
    const video = document.getElementById('custom-bg-video');
    if (video && video.style.display !== 'none') video.play();

    // NÃ¡ÂºÂ¿u dimTime = 0 thÃƒÂ¬ tÃ¡ÂºÂ¯t tÃƒÂ­nh nÃ„Æ’ng mÃ¡Â»Â
    if (settings.dimTime === 0) return;

    // ChÃ¡Â»â€° kÃƒÂ­ch hoÃ¡ÂºÂ¡t chÃ¡ÂºÂ¿ Ã„â€˜Ã¡Â»â„¢ mÃ¡Â»Â nÃ¡ÂºÂ¿u Ã„â€˜ang khÃƒÂ´ng mÃ¡Â»Å¸ CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t
    const modal = document.getElementById('settings-modal');
    if (!modal || !modal.classList.contains('active')) {
        idleTimer = setTimeout(() => {
            document.body.classList.add('idle-dim');
            // Pause animations when dimmed to save huge amounts of battery
            if (window.bgEffects) window.bgEffects.pause();
            if (video && video.style.display !== 'none') video.pause();
        }, settings.dimTime * 1000);
    }
}

// BÃ¡ÂºÂ¯t cÃƒÂ¡c sÃ¡Â»Â± kiÃ¡Â»â€¡n tÃ†Â°Ã†Â¡ng tÃƒÂ¡c Ã„â€˜Ã¡Â»Æ’ reset timer
window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('touchstart', resetIdleTimer);
window.addEventListener('click', resetIdleTimer);
window.addEventListener('keydown', resetIdleTimer);

// KhÃ¡Â»Å¸i chÃ¡ÂºÂ¡y timer ban Ã„â€˜Ã¡ÂºÂ§u
resetIdleTimer();


// ====== 2. XÃ¡Â»Â­ lÃƒÂ½ VuÃ¡Â»â€˜t ngang (Swipe) ======
const sheetsContainer = document.getElementById('sheets-container');
let currentSheetIndex = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let prevTranslate = 0;

const totalSheets = 3;

sheetsContainer.addEventListener('touchstart', touchStart);
sheetsContainer.addEventListener('touchmove', touchMove);
sheetsContainer.addEventListener('touchend', touchEnd);

sheetsContainer.addEventListener('mousedown', touchStart);
sheetsContainer.addEventListener('mousemove', touchMove);
sheetsContainer.addEventListener('mouseup', touchEnd);
sheetsContainer.addEventListener('mouseleave', touchEnd);

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function touchStart(event) {
    if (isAppLocked) return; // Prevent swipe in fullscreen
    if (event.target.tagName.toLowerCase() === 'button' || event.target.tagName.toLowerCase() === 'input') {
        return;
    }
    isDragging = true;
    startX = getPositionX(event);
    sheetsContainer.style.transition = 'none';
}

function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startX;

    if ((currentSheetIndex === 0 && diff > 0) || (currentSheetIndex === totalSheets - 1 && diff < 0)) {
        currentTranslate = prevTranslate + diff * 0.3;
    } else {
        currentTranslate = prevTranslate + diff;
    }

    sheetsContainer.style.transform = `translateX(${currentTranslate}px)`;
}

function touchEnd() {
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    const threshold = window.innerWidth * 0.2;

    sheetsContainer.style.transition = 'transform 0.3s ease-out';

    if (movedBy < -threshold && currentSheetIndex < totalSheets - 1) {
        currentSheetIndex += 1;
    } else if (movedBy > threshold && currentSheetIndex > 0) {
        currentSheetIndex -= 1;
    }

    setPositionByIndex();
}

function setPositionByIndex() {
    currentTranslate = currentSheetIndex * -window.innerWidth;
    prevTranslate = currentTranslate;
    sheetsContainer.style.transform = `translateX(${currentTranslate}px)`;
}

window.addEventListener('resize', () => {
    sheetsContainer.style.transition = 'none';
    setPositionByIndex();
});

let lastIsPortrait = window.innerHeight > window.innerWidth;
window.addEventListener('resize', () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (settings.autoRotate && isPortrait !== lastIsPortrait) {
        lastIsPortrait = isPortrait;
        updateTimeDisplay(); // Re-layout on rotation
    }
});

// ====== Custom Alarm DB & UI Logic ======
function saveCustomAlarmDB(file, name) {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(ALARM_STORE, 'readwrite');
        const store = tx.objectStore(ALARM_STORE);
        store.put({ file: file, name: name }, 'custom_alarm');
    };
}

function loadCustomAlarmDB() {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
        if (!db.objectStoreNames.contains(ALARM_STORE)) db.createObjectStore(ALARM_STORE);
    };
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


// ====== 3. Helper: Render SÃ¡Â»â€˜ bÃ¡ÂºÂ±ng Ã¡ÂºÂ¢nh ======
function createDigitImage(char, className = '') {
    let suffix = '';
    if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    else if (settings.fontStyle === 'font4') suffix = 'c';
    else if (settings.fontStyle === 'font5') suffix = 'd';
    else if (settings.fontStyle === 'font6') suffix = 'e';
    else if (settings.fontStyle === 'font7') suffix = 'n';

    if (char === ':') {
        const img = document.createElement('img');
        img.src = suffix ? `assets/images/chamcham${suffix}.png` : 'chamcham.png';
        img.className = 'colon';
        return img;
    }
    const img = document.createElement('img');
    img.src = suffix ? `assets/images/${char}${suffix}.png` : `assets/images/${char}.png`;
    img.alt = char;
    if (className) img.className = className;
    return img;
}

function renderTimeToContainer(timeString, container) {
    container.innerHTML = '';
    for (let i = 0; i < timeString.length; i++) {
        container.appendChild(createDigitImage(timeString[i]));
    }
}

function getIsVertical() {
    if (settings.autoRotate) {
        return window.innerHeight > window.innerWidth;
    }
    return settings.vertical;
}

function updateTimeDisplay() {
    updateClock();
}

// Render dÃ¡ÂºÂ¡ng nhÃƒÂ³m (cho chÃ¡ÂºÂ¿ Ã„â€˜Ã¡Â»â„¢ dÃ¡Â»Âc): mÃ¡Â»â€”i nhÃƒÂ³m lÃƒÂ  mÃ¡ÂºÂ£ng cÃƒÂ¡c Element
function renderTimeGroupedElements(groups, container) {
    const mediaContainer = container.querySelector('#custom-block-media');
    container.innerHTML = '';
    if (mediaContainer) container.appendChild(mediaContainer);

    container.classList.toggle('vertical', getIsVertical());

    for (let g = 0; g < groups.length; g++) {
        const group = groups[g];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'digit-group';
        for (let i = 0; i < group.length; i++) {
            groupDiv.appendChild(group[i]);
        }
        container.appendChild(groupDiv);

        if (g < groups.length - 1) {
            const colonImg = createDigitImage(':');
            if (settings.hideColons) {
                colonImg.style.visibility = 'hidden';
            }
            container.appendChild(colonImg);
        }
    }
}

function formatTwoDigits(num) {
    return num.toString().padStart(2, '0');
}

document.getElementById('font-selector-dropdown').addEventListener('change', (e) => {
    settings.fontStyle = e.target.value;
    updateClock(); // Force redraw of clock digits
});

// Danh sÃƒÂ¡ch tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ class hiÃ¡Â»â€¡u Ã¡Â»Â©ng khÃ¡Â»â€˜i Ã„â€˜Ã¡Â»â€œng hÃ¡Â»â€œ
const allClockBgClasses = [
    'clock-bg-shadow', 'clock-bg-glow', 'clock-bg-neon-glow', 'clock-bg-fire-glow',
    'clock-bg-rainbow-glow', 'clock-bg-glass', 'clock-bg-blur', 'clock-bg-frosted',
    'clock-bg-crystal', 'clock-bg-3d', 'clock-bg-3d-blur', 'clock-bg-emboss',
    'clock-bg-float', 'clock-bg-ink', 'clock-bg-gradient', 'clock-bg-hologram',
    'clock-bg-aurora-block', 'clock-bg-lava', 'clock-bg-ocean', 'clock-bg-galaxy-block',
    'clock-bg-border-glow', 'clock-bg-border-rainbow', 'clock-bg-border-pulse',
    'clock-bg-frame-gold', 'clock-bg-frame-cyber', 'clock-bg-custom-block'
];

let currentClockBgValue = null;

function applyClockBgEffect(value) {
    const el = document.getElementById('clock-display');
    if (!el) return;

    if (currentClockBgValue === value) return;
    currentClockBgValue = value;

    // Hide or destroy old media container if changing effect
    let mediaContainer = document.getElementById('custom-block-media');
    if (mediaContainer && value !== 'custom-block') {
        mediaContainer.style.display = 'none';
        mediaContainer.innerHTML = '';
    }

    // XÃƒÂ³a tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ class hiÃ¡Â»â€¡u Ã¡Â»Â©ng cÃ…Â©
    allClockBgClasses.forEach(cls => el.classList.remove(cls));

    if (customBlockSizeControl) {
        customBlockSizeControl.style.display = value === 'custom-block' ? 'flex' : 'none';
    }

    if (value === 'custom-block') {
        el.classList.add('clock-bg-custom-block');
        const optCustomBlock = document.getElementById('opt-custom-block');
        if (optCustomBlock) optCustomBlock.style.display = 'block';

        loadCustomBlockBgDB(file => {
            if (file) {
                if (customBlockBgUrl) URL.revokeObjectURL(customBlockBgUrl);
                customBlockBgUrl = URL.createObjectURL(file);

                if (!mediaContainer) {
                    mediaContainer = document.createElement('div');
                    mediaContainer.id = 'custom-block-media';
                    mediaContainer.style.position = 'absolute';
                    mediaContainer.style.top = '0';
                    mediaContainer.style.left = '0';
                    mediaContainer.style.width = '100%';
                    mediaContainer.style.height = '100%';
                    mediaContainer.style.zIndex = '-1';
                    mediaContainer.style.pointerEvents = 'none';
                    mediaContainer.style.display = 'flex';
                    mediaContainer.style.justifyContent = 'center';
                    mediaContainer.style.alignItems = 'center';
                    el.appendChild(mediaContainer);
                } else {
                    mediaContainer.style.display = 'flex';
                }

                if (!el.contains(mediaContainer)) {
                    el.appendChild(mediaContainer);
                }

                if (file.type.startsWith('video/')) {
                    mediaContainer.innerHTML = `<video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:contain; border-radius:inherit; transform: scale(var(--custom-block-scale, 1));"></video>`;
                    mediaContainer.querySelector('video').src = customBlockBgUrl;
                } else {
                    mediaContainer.innerHTML = `<img src="${customBlockBgUrl}" style="width:100%; height:100%; object-fit:contain; border-radius:inherit; transform: scale(var(--custom-block-scale, 1));" />`;
                }
            } else {
                // if lost, fallback
                applyClockBgEffect('none');
                const clockBgDropdown = document.getElementById('clock-bg-selector');
                if (clockBgDropdown) clockBgDropdown.value = 'none';
            }
        });
        return;
    }

    // ThÃƒÂªm class hiÃ¡Â»â€¡u Ã¡Â»Â©ng mÃ¡Â»â€ºi (náº¿u khÃ´ng pháº£i 'none')
    if (value && value !== 'none') {
        el.classList.add(value);
    }
}

document.getElementById('clock-bg-selector').addEventListener('change', (e) => {
    settings.clockBg = e.target.value;
    applyClockBgEffect(e.target.value);
});

const btnUploadBlock = document.getElementById('btn-upload-block');
const inputUploadBlock = document.getElementById('input-upload-block');
if (btnUploadBlock && inputUploadBlock) {
    btnUploadBlock.addEventListener('click', () => {
        inputUploadBlock.click();
    });
    inputUploadBlock.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            saveCustomBlockBgDB(file);
            settings.clockBg = 'custom-block';
            const clockBgDropdown = document.getElementById('clock-bg-selector');
            if (clockBgDropdown) clockBgDropdown.value = 'custom-block';
            currentClockBgValue = null; // force reload
            applyClockBgEffect('custom-block');
        }
    });
}

// ====== 4. Sheet 1: Ã„ÂÃ¡Â»â€œng hÃ¡Â»â€œ ======
const clockDisplay = document.getElementById('clock-display');
const dateDisplay = document.getElementById('date-display');
const lunarDisplay = document.getElementById('lunar-display');

function updateDigitSrc(imgEl, char) {
    let suffix = '';
    if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    else if (settings.fontStyle === 'font4') suffix = 'c';
    else if (settings.fontStyle === 'font5') suffix = 'd';
    else if (settings.fontStyle === 'font6') suffix = 'e';
    else if (settings.fontStyle === 'font7') suffix = 'n';

    if (char === ':') {
        imgEl.src = suffix ? `assets/images/chamcham${suffix}.png` : 'chamcham.png';
        imgEl.alt = ':';
    } else {
        imgEl.src = suffix ? `assets/images/${char}${suffix}.png` : `assets/images/${char}.png`;
        imgEl.alt = char;
    }
}

let lastCapturedSecond = -1;
function updateClock() {
    const now = new Date();
    const h = formatTwoDigits(now.getHours());
    const m = formatTwoDigits(now.getMinutes());
    const s = formatTwoDigits(now.getSeconds());

    // Update src and class for H
    const imgH1 = document.getElementById('img-h1');
    const imgH2 = document.getElementById('img-h2');
    if (imgH1) { updateDigitSrc(imgH1, h[0]); imgH1.className = 'digit-h1'; }
    if (imgH2) { updateDigitSrc(imgH2, h[1]); imgH2.className = 'digit-h2'; }

    // Update src and class for M
    const wrapM1 = document.getElementById('wrap-m1');
    const wrapM2 = document.getElementById('wrap-m2');
    const wrapColon1 = document.getElementById('wrap-colon1');
    if (settings.hideMinutes) {
        if (wrapM1) wrapM1.style.display = 'none';
        if (wrapM2) wrapM2.style.display = 'none';
        if (wrapColon1) wrapColon1.style.display = 'none';
    } else {
        if (wrapM1) { wrapM1.style.display = 'inline-block'; const img = document.getElementById('img-m1'); if (img) { updateDigitSrc(img, m[0]); img.className = 'digit-m1'; } }
        if (wrapM2) { wrapM2.style.display = 'inline-block'; const img = document.getElementById('img-m2'); if (img) { updateDigitSrc(img, m[1]); img.className = 'digit-m2'; } }
        if (wrapColon1) { wrapColon1.style.display = 'inline-block'; const img = document.getElementById('img-colon1'); if (img) { updateDigitSrc(img, ':'); img.className = 'colon'; img.style.visibility = settings.hideColons ? 'hidden' : 'visible'; } }
    }

    // Update src and class for S
    const wrapS1 = document.getElementById('wrap-s1');
    const wrapS2 = document.getElementById('wrap-s2');
    const wrapColon2 = document.getElementById('wrap-colon2');
    if (settings.hideSeconds) {
        if (wrapS1) wrapS1.style.display = 'none';
        if (wrapS2) wrapS2.style.display = 'none';
        if (wrapColon2) wrapColon2.style.display = 'none';
    } else {
        if (wrapS1) { wrapS1.style.display = 'inline-block'; const img = document.getElementById('img-s1'); if (img) { updateDigitSrc(img, s[0]); img.className = 'digit-s1'; } }
        if (wrapS2) { wrapS2.style.display = 'inline-block'; const img = document.getElementById('img-s2'); if (img) { updateDigitSrc(img, s[1]); img.className = 'digit-s2'; } }
        if (wrapColon2) { 
            wrapColon2.style.display = 'inline-block'; 
            const img = document.getElementById('img-colon2'); 
            if (img) { updateDigitSrc(img, ':'); img.className = 'colon'; img.style.visibility = settings.hideColons ? 'hidden' : 'visible'; } 
        }
    }

    // Instead of rebuilding DOM, just toggle classes and adjust layout
    if (getIsVertical()) {
        clockDisplay.classList.add('vertical');
    } else {
        clockDisplay.classList.remove('vertical');
    }
    
    // Apply position adjustments so they persist through updates (if not dragging right now)
    if (typeof isDragging === 'undefined' || !isDragging) {
        applyElementPositions();
    }

    fitClockToScreen();
    applyClockBgEffect(settings.clockBg);

    if (now.getSeconds() !== lastCapturedSecond) {
        lastCapturedSecond = now.getSeconds();
        if (typeof captureAndSendWidget === 'function') captureAndSendWidget();
    }
}

setInterval(updateClock, 1000);
updateClock();

// ====== 4b. NgÃƒÂ y thÃƒÂ¡ng DÃ†Â°Ã†Â¡ng & Ãƒâ€šm ======
const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function updateDateDisplay() {
    const now = new Date();

    // LÃ¡Â»â€¹ch DÃ†Â°Ã†Â¡ng
    if (settings.showDate) {
        const dayName = dayNames[now.getDay()];
        const dd = formatTwoDigits(now.getDate());
        const mm = formatTwoDigits(now.getMonth() + 1);
        const yyyy = now.getFullYear();
        dateDisplay.textContent = `${dayName}, ${dd}/${mm}/${yyyy}`;
        dateDisplay.classList.add('visible');
    } else {
        dateDisplay.classList.remove('visible');
    }

    // Tuáº§n
    const weekDisplay = document.getElementById('week-display');
    if (settings.showWeek && weekDisplay) {
        // Compute ISO Week Number
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        weekDisplay.textContent = `Tuần ${weekNo}`;
        weekDisplay.classList.add('visible');
    } else if (weekDisplay) {
        weekDisplay.classList.remove('visible');
    }

    // LÃ¡Â»â€¹ch Ãƒâ€šm
    if (settings.showLunar) {
        const lunar = convertSolar2Lunar(now.getDate(), now.getMonth() + 1, now.getFullYear(), 7);
        lunarDisplay.textContent = `Âm lịch: ${formatTwoDigits(lunar[0])}/${formatTwoDigits(lunar[1])}/${lunar[2]}`;
        lunarDisplay.classList.add('visible');
    } else {
        lunarDisplay.classList.remove('visible');
    }
}

// CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t lÃ¡Â»â€¹ch mÃ¡Â»â€”i phÃƒÂºt
setInterval(updateDateDisplay, 60000);
updateDateDisplay();

// ====== HÃ¡Â»â€” trÃ¡Â»Â£ KÃƒÂ©o thÃ¡ÂºÂ£ (Draggable) cho LÃ¡Â»â€¹ch ======
function makeDraggable(el, settingKey) {
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;
    let hasMoved = false;

    function onStart(e) {
        // NÃ¡ÂºÂ¿u khÃƒÂ´ng hiÃ¡Â»â€¡n thÃƒÂ¬ bÃ¡Â»Â qua
        if (!el.classList.contains('visible')) return;

        isDragging = true;
        hasMoved = false;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        currentX = settings[settingKey].x || 0;
        currentY = settings[settingKey].y || 0;

        startX = clientX - currentX;
        startY = clientY - currentY;

        el.style.transition = 'none';
        e.stopPropagation(); // KhÃƒÂ´ng vuÃ¡Â»â€˜t sheet
    }

    function onMove(e) {
        if (!isDragging) return;
        hasMoved = true;

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        currentX = clientX - startX;
        currentY = clientY - startY;

        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
        e.stopPropagation();
    }

    function onEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        el.style.transition = 'transform 0.2s ease';

        if (hasMoved) {
            settings[settingKey] = { x: currentX, y: currentY };
            // KhÃƒÂ´ng lÃ†Â°u localStorage ngay Ã¡Â»Å¸ Ã„â€˜ÃƒÂ¢y Ã„â€˜Ã¡Â»Æ’ trÃƒÂ¡nh ghi Ã„â€˜ÃƒÂ¨ liÃƒÂªn tÃ¡Â»Â¥c, 
            // chÃ¡Â»â€° lÃ†Â°u khi nhÃ¡ÂºÂ¥n nÃƒÂºt LÃ†Â°u Ã¡Â»Å¸ CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t. NhÃ†Â°ng cÃ¡Â»Â© gÃƒÂ¡n vÃƒÂ o biÃ¡ÂºÂ¿n settings trÃ†Â°Ã¡Â»â€ºc.
        }
        e.stopPropagation();
    }

    el.addEventListener('mousedown', onStart, { passive: false });
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd, { passive: false });

    el.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });
}

function applyDraggablePositions() {
    dateDisplay.style.transform = `translate(${settings.datePos?.x || 0}px, ${settings.datePos?.y || 0}px)`;
    lunarDisplay.style.transform = `translate(${settings.lunarPos?.x || 0}px, ${settings.lunarPos?.y || 0}px)`;
}

applyElementPositions();

// Init UI from settings
applySettingsToUI();


// ====== 5. Sheet 2: Báº¥m giá» (Stopwatch) ======
const swDisplay = document.getElementById('stopwatch-display');
let swInterval;
let swStartTime = 0;
let swElapsedTime = 0;

function renderStopwatch() {
    const totalMs = swElapsedTime;
    const m = formatTwoDigits(Math.floor(totalMs / 60000));
    const s = formatTwoDigits(Math.floor((totalMs % 60000) / 1000));
    const ms = formatTwoDigits(Math.floor((totalMs % 1000) / 10));
    renderTimeToContainer(`${m}:${s}:${ms}`, swDisplay);
}

document.getElementById('sw-start').addEventListener('click', () => {
    if (!swInterval) {
        swStartTime = Date.now() - swElapsedTime;
        swInterval = setInterval(() => {
            swElapsedTime = Date.now() - swStartTime;
            renderStopwatch();
        }, 10);
    }
});

document.getElementById('sw-stop').addEventListener('click', () => {
    clearInterval(swInterval);
    swInterval = null;
});

document.getElementById('sw-reset').addEventListener('click', () => {
    clearInterval(swInterval);
    swInterval = null;
    swElapsedTime = 0;
    renderStopwatch();
});
renderStopwatch();


// ====== 6. Sheet 3: BÃ¡o thá»©c (Timer) ======
const tmSetup = document.getElementById('timer-setup');
const tmDisplay = document.getElementById('timer-display');
const tmControls = document.getElementById('timer-controls');
const alarmSound = document.getElementById('alarm-sound');

let tmInterval;
let tmSecondsRemaining = 0;
let isAlarmRinging = false;
let vibrateInterval;

function triggerAlarm() {
    isAlarmRinging = true;
    const alarmAudio = document.getElementById('alarm-audio');
    const defaultAlarm = document.getElementById('alarm-sound');

    // Play custom audio if available, else default beep
    if (alarmAudio && alarmAudio.src && alarmAudio.src !== window.location.href) {
        alarmAudio.play().catch(e => console.log('Autoplay prevented', e));
    } else {
        if (defaultAlarm) defaultAlarm.play().catch(e => console.log('Autoplay prevented', e));
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

function renderTimer() {
    const m = formatTwoDigits(Math.floor(tmSecondsRemaining / 60));
    const s = formatTwoDigits(tmSecondsRemaining % 60);
    renderTimeToContainer(`${m}:${s}`, tmDisplay);
}

function tmTick() {
    if (tmSecondsRemaining > 0) {
        tmSecondsRemaining--;
        renderTimer();
    } else {
        clearInterval(tmInterval);
        triggerAlarm();
    }
}

document.getElementById('tm-start').addEventListener('click', () => {
    const mins = parseInt(document.getElementById('timer-minutes').value);
    if (isNaN(mins) || mins <= 0) return;

    tmSecondsRemaining = mins * 60;

    tmSetup.style.display = 'none';
    tmDisplay.style.display = 'flex';
    tmControls.style.display = 'flex';

    renderTimer();

    tmInterval = setInterval(tmTick, 1000);
});

document.getElementById('tm-stop').addEventListener('click', () => {
    clearInterval(tmInterval);
    stopAlarm();

    tmSetup.style.display = 'flex';
    tmDisplay.style.display = 'none';
    tmControls.style.display = 'none';
});


// ================================================================
// ====== 7. ThuÃ¡ÂºÂ­t toÃƒÂ¡n chuyÃ¡Â»Æ’n Ã„â€˜Ã¡Â»â€¢i DÃ†Â°Ã†Â¡ng lÃ¡Â»â€¹ch Ã¢â€ â€™ Ãƒâ€šm lÃ¡Â»â€¹ch ======
// DÃ¡Â»Â±a trÃƒÂªn thuÃ¡ÂºÂ­t toÃƒÂ¡n cÃ¡Â»Â§a HÃ¡Â»â€œ NgÃ¡Â»Âc Ã„ÂÃ¡Â»Â©c (https://www.informatik.uni-leipzig.de/~duc/amlich/)
// ================================================================

function jdFromDate(dd, mm, yy) {
    var a = Math.floor((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) {
        jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    }
    return jd;
}

function NewMoon(k) {
    var T = k / 1236.85;
    var T2 = T * T;
    var T3 = T2 * T;
    var dr = Math.PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var deltat;
    if (T < -11) {
        deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
        deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    return Jd1 + C1 - deltat;
}

function SunLongitude(jdn) {
    var T = (jdn - 2451545.0) / 36525;
    var T2 = T * T;
    var dr = Math.PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = L0 + DL;
    L = L * dr;
    L = L - Math.PI * 2 * (Math.floor(L / (Math.PI * 2)));
    return Math.floor(L / Math.PI * 6);
}

function getNewMoonDay(k, timeZone) {
    return Math.floor(NewMoon(k) + 0.5 + timeZone / 24);
}

function getLunarMonth11(yy, timeZone) {
    var off = jdFromDate(31, 12, yy) - 2415021;
    var k = Math.floor(off / 29.530588853);
    var nm = getNewMoonDay(k, timeZone);
    var sunLong = SunLongitude(nm - timeZone / 24);
    if (sunLong >= 9) {
        nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
}

function getLeapMonthOffset(a11, timeZone) {
    var k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0;
    var i = 1;
    var arc = SunLongitude(getNewMoonDay(k + i, timeZone) - timeZone / 24);
    do {
        last = arc;
        i++;
        arc = SunLongitude(getNewMoonDay(k + i, timeZone) - timeZone / 24);
    } while (arc !== last && i < 14);
    return i - 1;
}

function convertSolar2Lunar(dd, mm, yy, timeZone) {
    var k, dayNumber, monthStart, a11, b11, lunarDay, lunarMonth, lunarYear, lunarLeap;
    dayNumber = jdFromDate(dd, mm, yy);
    k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
        monthStart = getNewMoonDay(k, timeZone);
    }
    a11 = getLunarMonth11(yy, timeZone);
    b11 = a11;
    if (a11 >= monthStart) {
        lunarYear = yy;
        a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
        lunarYear = yy + 1;
        b11 = getLunarMonth11(yy + 1, timeZone);
    }
    lunarDay = dayNumber - monthStart + 1;
    var diff = Math.floor((monthStart - a11) / 29);
    lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
        var leapMonthDiff = getLeapMonthOffset(a11, timeZone);
        if (diff >= leapMonthDiff) {
            lunarMonth = diff + 10;
            if (diff === leapMonthDiff) {
                lunarLeap = 1;
            }
        }
    }
    if (lunarMonth > 12) {
        lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
        lunarYear -= 1;
    }
    return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}


// ====== Cháº¿ Ä‘á»™ chá»‰nh sá»­a vá»‹ trÃ­ (Edit Positions Mode) ======
let isEditingPositions = false;

function applyElementPositions() {
    const pos = settings.elementPositions || {};
    const mappings = {
        h1: 'wrap-h1', h2: 'wrap-h2',
        colon1: 'wrap-colon1', m1: 'wrap-m1',
        m2: 'wrap-m2', colon2: 'wrap-colon2',
        s1: 'wrap-s1', s2: 'wrap-s2',
        date: 'date-display', week: 'week-display',
        lunar: 'lunar-display'
    };
    Object.keys(mappings).forEach(key => {
        const el = document.getElementById(mappings[key]);
        if (el && pos[key]) {
            el.style.transform = `translate(${pos[key].x || 0}px, ${pos[key].y || 0}px)`;
        }
    });
}

function makeElementDraggable(el, posKey) {
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;

    function onStart(e) {
        if (!isEditingPositions) return;
        isDragging = true;
        const pos = settings.elementPositions || {};
        currentX = (pos[posKey] && pos[posKey].x) || 0;
        currentY = (pos[posKey] && pos[posKey].y) || 0;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        startX = clientX - currentX;
        startY = clientY - currentY;
        el.style.transition = 'none';
        e.preventDefault();
        e.stopPropagation();
    }

    function onMove(e) {
        if (!isDragging) return;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        currentX = clientX - startX;
        currentY = clientY - startY;
        el.style.transform = `translate(${currentX}px, ${currentY}px)`;
        e.preventDefault();
        e.stopPropagation();
    }

    function onEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        el.style.transition = 'transform 0.15s ease';
        if (!settings.elementPositions) settings.elementPositions = {};
        settings.elementPositions[posKey] = { x: currentX, y: currentY };
        e.stopPropagation();
    }

    el.addEventListener('mousedown', onStart, { passive: false });
    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd, { passive: false });
    el.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });
}

// Bind draggable to all elements
const draggableMap = {
    h1: 'wrap-h1', h2: 'wrap-h2',
    colon1: 'wrap-colon1', m1: 'wrap-m1',
    m2: 'wrap-m2', colon2: 'wrap-colon2',
    s1: 'wrap-s1', s2: 'wrap-s2',
    date: 'date-display', week: 'week-display',
    lunar: 'lunar-display'
};
Object.keys(draggableMap).forEach(key => {
    const el = document.getElementById(draggableMap[key]);
    if (el) makeElementDraggable(el, key);
});

// Enter edit mode
const btnEditPositions = document.getElementById('btn-edit-positions');
const btnDoneEditing = document.getElementById('btn-done-editing');
const btnResetPositions = document.getElementById('btn-reset-positions');

if (btnEditPositions) {
    btnEditPositions.addEventListener('click', () => {
        isEditingPositions = true;
        document.body.classList.add('editing-mode');
        // Close settings modal
        document.getElementById('settings-modal').classList.remove('active');
        document.getElementById('modal-overlay').classList.remove('active');
        // Show done button
        if (btnDoneEditing) btnDoneEditing.style.display = 'block';
    });
}

if (btnDoneEditing) {
    btnDoneEditing.addEventListener('click', () => {
        isEditingPositions = false;
        document.body.classList.remove('editing-mode');
        btnDoneEditing.style.display = 'none';
        // Re-open settings modal
        document.getElementById('settings-modal').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
    });
}

if (btnResetPositions) {
    btnResetPositions.addEventListener('click', () => {
        const defaultPos = {
            h1: { x: 0, y: 0 }, h2: { x: 0, y: 0 },
            colon1: { x: 0, y: 0 }, m1: { x: 0, y: 0 },
            m2: { x: 0, y: 0 }, colon2: { x: 0, y: 0 },
            s1: { x: 0, y: 0 }, s2: { x: 0, y: 0 },
            date: { x: 0, y: 0 }, week: { x: 0, y: 0 },
            lunar: { x: 0, y: 0 }
        };
        settings.elementPositions = { ...defaultPos };
        applyElementPositions();
    });
}

// Apply positions on load
applyElementPositions();

// Auto pin screen when app starts
window.addEventListener('load', () => {
    setTimeout(() => {
        let ScreenPinning = null;
        if (window.Capacitor && window.Capacitor.registerPlugin) {
            ScreenPinning = window.Capacitor.registerPlugin('ScreenPinning');
        } else if (window.Capacitor && window.Capacitor.Plugins) {
            ScreenPinning = window.Capacitor.Plugins.ScreenPinning;
        }
        
        if (ScreenPinning) {
            ScreenPinning.pin();
            isAppLocked = true;
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        }
    }, 500); // Wait a brief moment to ensure Capacitor bridge is ready
});
