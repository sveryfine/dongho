import re

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old block
old_block = """// ====== 3. Helper: Render SÃ¡Â»â€˜ bÃ¡ÂºÂ±ng Ã¡ÂºÂ¢nh ======
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
}"""

# Since there are encoding issues (like Ã¡Â»â€˜ instead of Số), it's better to just use regex to replace from createDigitImage to the end of renderTimeToContainer
pattern = re.compile(r"function createDigitImage.*?function renderTimeToContainer[^}]+\}", re.DOTALL)

new_block = """function createDigitImage(char, className = '') {
    let suffix = '';
    if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    else if (settings.fontStyle === 'font4') suffix = 'c';
    else if (settings.fontStyle === 'font5') suffix = 'd';
    else if (settings.fontStyle === 'font6') suffix = 'e';
    else if (settings.fontStyle === 'font7') suffix = 'n';

    if (char === ':') {
        const img = document.createElement('img');
        img.setAttribute('src', suffix ? `assets/images/chamcham${suffix}.png` : `assets/images/chamcham.png`);
        img.className = 'colon';
        return img;
    }
    const img = document.createElement('img');
    img.setAttribute('src', suffix ? `assets/images/${char}${suffix}.png` : `assets/images/${char}.png`);
    img.alt = char;
    if (className) img.className = className;
    return img;
}

function renderTimeToContainer(timeString, container) {
    let suffix = '';
    if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    else if (settings.fontStyle === 'font4') suffix = 'c';
    else if (settings.fontStyle === 'font5') suffix = 'd';
    else if (settings.fontStyle === 'font6') suffix = 'e';
    else if (settings.fontStyle === 'font7') suffix = 'n';

    if (container.children.length !== timeString.length) {
        container.innerHTML = '';
        for (let i = 0; i < timeString.length; i++) {
            container.appendChild(createDigitImage(timeString[i]));
        }
    } else {
        for (let i = 0; i < timeString.length; i++) {
            const char = timeString[i];
            const img = container.children[i];
            
            let src = '';
            let className = '';
            if (char === ':') {
                src = suffix ? `assets/images/chamcham${suffix}.png` : `assets/images/chamcham.png`;
                className = 'colon';
            } else {
                src = suffix ? `assets/images/${char}${suffix}.png` : `assets/images/${char}.png`;
                className = '';
            }
            
            if (img.getAttribute('src') !== src) {
                img.setAttribute('src', src);
            }
            if (img.className !== className) {
                img.className = className;
            }
            if (img.alt !== char) {
                img.alt = char;
            }
        }
    }
}"""

content = pattern.sub(new_block, content)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed jittering issue in app.js")
