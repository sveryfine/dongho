# -*- coding: utf-8 -*-
import re

###############################################################################
# 1. UPDATE index.html
###############################################################################
with open('d:/dongho/www/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1a. Replace clock-display div with persistent wrappers
old_clock = '''<div class="digits-display" id="clock-display">
                    <!-- Images inserted via JS -->
                </div>'''
new_clock = '''<div class="digits-display" id="clock-display">
                    <div class="drag-wrapper" id="wrap-h1"><img id="img-h1" class="digit-h1" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-h2"><img id="img-h2" class="digit-h2" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-colon1"><img id="img-colon1" class="colon" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-m1"><img id="img-m1" class="digit-m1" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-m2"><img id="img-m2" class="digit-m2" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-colon2"><img id="img-colon2" class="colon" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-s1"><img id="img-s1" class="digit-s1" src="" alt=""></div>
                    <div class="drag-wrapper" id="wrap-s2"><img id="img-s2" class="digit-s2" src="" alt=""></div>
                </div>'''
html = html.replace(old_clock, new_clock)

# 1b. Add "Chinh vi tri" and "Reset" buttons before the save button area
# Find the divider before size section and add position editing buttons
insert_before = '<hr class="modal-divider">\n            <div class="setting-item column-layout">\n                <div class="slider-header">\n                    <span>Kích thước chung</span>'
position_buttons = '''<hr class="modal-divider">
            <div class="setting-item">
                <span>Chỉnh vị trí phần tử</span>
                <button id="btn-edit-positions" style="background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.9rem; cursor: pointer;"><i class="fas fa-arrows-alt"></i> Chỉnh</button>
            </div>
            <div class="setting-item">
                <span>Đặt lại vị trí mặc định</span>
                <button id="btn-reset-positions" style="background: #ef4444; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.9rem; cursor: pointer;"><i class="fas fa-undo"></i> Reset</button>
            </div>

            <hr class="modal-divider">
            <div class="setting-item column-layout">
                <div class="slider-header">
                    <span>Kích thước chung</span>'''
html = html.replace(insert_before, position_buttons)

# 1c. Add "Done" floating button (hidden by default) just before sheets-container
done_btn = '''    <!-- Nút Xong khi chỉnh vị trí -->
    <button id="btn-done-editing" style="display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); z-index:10000; background:#22c55e; color:white; border:none; border-radius:50px; padding:14px 32px; font-size:1.1rem; font-weight:bold; cursor:pointer; box-shadow: 0 4px 20px rgba(34,197,94,0.5);"><i class="fas fa-check"></i> Xong</button>

    <!-- Container cuộn ngang -->'''
html = html.replace('    <!-- Container cuộn ngang -->', done_btn)

with open('d:/dongho/www/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML updated OK")

###############################################################################
# 2. UPDATE style.css
###############################################################################
with open('d:/dongho/www/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add drag-wrapper and editing-mode styles
drag_css = '''
/* ====== Drag Wrapper (Kéo thả phần tử) ====== */
.drag-wrapper {
    display: inline-block;
    position: relative;
    transition: transform 0.15s ease;
}

.editing-mode .drag-wrapper,
.editing-mode .date-display,
.editing-mode .week-display,
.editing-mode .lunar-display {
    outline: 2px dashed rgba(255, 255, 255, 0.5);
    outline-offset: 4px;
    cursor: grab;
    border-radius: 8px;
}

.editing-mode .drag-wrapper:active,
.editing-mode .date-display:active,
.editing-mode .week-display:active,
.editing-mode .lunar-display:active {
    cursor: grabbing;
    outline-color: #3b82f6;
}

.editing-mode .drag-wrapper::after,
.editing-mode .date-display::after,
.editing-mode .week-display::after,
.editing-mode .lunar-display::after {
    content: '⋮⋮';
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    pointer-events: none;
}
'''
css += drag_css

with open('d:/dongho/www/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS updated OK")

###############################################################################
# 3. UPDATE app.js
###############################################################################
with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 3a. Add elementPositions to defaultSettings
js = js.replace(
    "    customBlockSize: 100\n};",
    """    customBlockSize: 100,
    elementPositions: {
        h1: { x: 0, y: 0 }, h2: { x: 0, y: 0 },
        colon1: { x: 0, y: 0 }, m1: { x: 0, y: 0 },
        m2: { x: 0, y: 0 }, colon2: { x: 0, y: 0 },
        s1: { x: 0, y: 0 }, s2: { x: 0, y: 0 },
        date: { x: 0, y: 0 }, week: { x: 0, y: 0 },
        lunar: { x: 0, y: 0 }
    }
};"""
)

# 3b. Rewrite updateClock() to use persistent elements
old_updateClock = '''function updateClock() {
    const now = new Date();
    const h = formatTwoDigits(now.getHours());
    const m = formatTwoDigits(now.getMinutes());
    const s = formatTwoDigits(now.getSeconds());

    const groups = [];

    // Nhóm Giờ (gán class riêng cho từng số)
    const hElements = [
        createDigitImage(h[0], 'digit-h1'),
        createDigitImage(h[1], 'digit-h2')
    ];
    groups.push(hElements);

    // Nhóm Phút & Giây
    if (!settings.hideMinutes) {
        groups.push([createDigitImage(m[0], 'digit-m1'), createDigitImage(m[1], 'digit-m2')]);
    }
    if (!settings.hideSeconds) {
        groups.push([createDigitImage(s[0], 'digit-s1'), createDigitImage(s[1], 'digit-s2')]);
    }

    if (getIsVertical()) {
        renderTimeGroupedElements(groups, clockDisplay);
    } else {
        clockDisplay.classList.remove('vertical');
        const mediaContainer = clockDisplay.querySelector('#custom-block-media');
        clockDisplay.innerHTML = '';
        if (mediaContainer) clockDisplay.appendChild(mediaContainer);

        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].length; j++) {
                clockDisplay.appendChild(groups[i][j]);
            }
            if (i < groups.length - 1) {
                const colonImg = createDigitImage(':');
                if (settings.hideColons) {
                    colonImg.style.visibility = 'hidden';
                }
                clockDisplay.appendChild(colonImg);
            }
        }
    }
    fitClockToScreen();
    applyClockBgEffect(settings.clockBg);
}'''

new_updateClock = '''function getDigitSrc(char) {
    let suffix = '';
    if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    if (char === ':') return suffix ? 'assets/images/chamcham' + suffix + '.png' : 'chamcham.png';
    return suffix ? 'assets/images/' + char + suffix + '.png' : 'assets/images/' + char + '.png';
}

function updatePersistentDigit(imgId, char, className) {
    const img = document.getElementById(imgId);
    if (!img) return;
    const newSrc = getDigitSrc(char);
    if (img.src !== newSrc && !img.src.endsWith(newSrc)) {
        img.src = newSrc;
    }
    if (className && !img.classList.contains(className)) {
        img.className = className;
    }
}

function updateClock() {
    const now = new Date();
    const h = formatTwoDigits(now.getHours());
    const m = formatTwoDigits(now.getMinutes());
    const s = formatTwoDigits(now.getSeconds());

    // Update digit sources
    updatePersistentDigit('img-h1', h[0], 'digit-h1');
    updatePersistentDigit('img-h2', h[1], 'digit-h2');
    updatePersistentDigit('img-m1', m[0], 'digit-m1');
    updatePersistentDigit('img-m2', m[1], 'digit-m2');
    updatePersistentDigit('img-s1', s[0], 'digit-s1');
    updatePersistentDigit('img-s2', s[1], 'digit-s2');
    updatePersistentDigit('img-colon1', ':', 'colon');
    updatePersistentDigit('img-colon2', ':', 'colon');

    // Show/hide based on settings
    const wrapColon1 = document.getElementById('wrap-colon1');
    const wrapM1 = document.getElementById('wrap-m1');
    const wrapM2 = document.getElementById('wrap-m2');
    const wrapColon2 = document.getElementById('wrap-colon2');
    const wrapS1 = document.getElementById('wrap-s1');
    const wrapS2 = document.getElementById('wrap-s2');

    // Minutes
    if (wrapM1) wrapM1.style.display = settings.hideMinutes ? 'none' : '';
    if (wrapM2) wrapM2.style.display = settings.hideMinutes ? 'none' : '';
    if (wrapColon1) wrapColon1.style.display = settings.hideMinutes ? 'none' : '';

    // Seconds
    if (wrapS1) wrapS1.style.display = settings.hideSeconds ? 'none' : '';
    if (wrapS2) wrapS2.style.display = settings.hideSeconds ? 'none' : '';
    if (wrapColon2) wrapColon2.style.display = settings.hideSeconds ? 'none' : '';

    // Colons visibility
    const colon1 = document.getElementById('img-colon1');
    const colon2 = document.getElementById('img-colon2');
    if (colon1) colon1.style.visibility = settings.hideColons ? 'hidden' : '';
    if (colon2) colon2.style.visibility = settings.hideColons ? 'hidden' : '';

    // Vertical mode
    clockDisplay.classList.toggle('vertical', getIsVertical());

    fitClockToScreen();
    applyClockBgEffect(settings.clockBg);
}'''

js = js.replace(old_updateClock, new_updateClock)

# 3c. Add editing mode logic and dragging at the end of the file
editing_code = '''

// ====== Chế độ chỉnh sửa vị trí (Edit Positions Mode) ======
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
        document.getElementById('settings-modal').classList.remove('open');
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
        document.getElementById('settings-modal').classList.add('open');
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
'''

js += editing_code

# 3d. Remove old makeDraggable calls for date/lunar (they're now handled by the new system)
js = js.replace("makeDraggable(dateDisplay, 'datePos');\n", "")
js = js.replace("makeDraggable(lunarDisplay, 'lunarPos');\n", "")
js = js.replace("applyDraggablePositions();\n", "applyElementPositions();\n")

# 3e. Update applySettingsToUI to also apply element positions
js = js.replace(
    "    if (typeof applyDraggablePositions === 'function') {\n        applyDraggablePositions();\n    }",
    "    if (typeof applyElementPositions === 'function') {\n        applyElementPositions();\n    }"
)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("JS updated OK")
print("ALL DONE!")
