import re

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract the old updateClock function using regex to be safe about line numbers
old_pattern = r'function updateClock\(\) \{[\s\S]*?applyClockBgEffect\(settings\.clockBg\);\r?\n\}'

new_updateClock = """function updateDigitSrc(imgEl, char) {
    if (char === ':') {
        imgEl.src = `images/dots/${settings.dotsStyle}.png`;
        imgEl.alt = ':';
    } else {
        let numberFolder = settings.clockStyle;
        if (settings.clockStyle === 'mixed') {
            const folders = ['font1', 'font2', 'font3', 'font4', 'font5', 'font6'];
            numberFolder = folders[parseInt(char) % folders.length];
        }
        imgEl.src = `images/${numberFolder}/${char}.png`;
        imgEl.alt = char;
    }
    
    // Apply effects
    imgEl.classList.remove('effect-glow', 'effect-shadow', 'effect-outline');
    if (settings.digitEffect && settings.digitEffect !== 'none') {
        imgEl.classList.add(`effect-${settings.digitEffect}`);
    }
}

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
}"""

if re.search(old_pattern, text):
    text = re.sub(old_pattern, new_updateClock, text)
    with open('d:/dongho/www/app.js', 'w', encoding='utf-8', newline='') as f:
        f.write(text)
    print("Success: updateClock replaced.")
else:
    print("Error: Could not find updateClock to replace.")
