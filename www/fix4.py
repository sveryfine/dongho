import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

toggle_html = """            <div class="setting-item">
                <span>Tự xoay theo điện thoại</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="toggle-auto-rotate">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="setting-item">
                <span>Giờ xếp dọc (khi tắt tự xoay)</span>"""

html = html.replace("""            <div class="setting-item">
                <span>Giờ xếp dọc</span>""", toggle_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update app.js
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add autoRotate to default settings
js = js.replace("showLunar: true,", "showLunar: true,\n    autoRotate: true,")

# Add sync logic
js = js.replace("syncToggleUI('toggle-vertical', 'vertical');", "syncToggleUI('toggle-auto-rotate', 'autoRotate');\n    syncToggleUI('toggle-vertical', 'vertical');")
js = js.replace("bindToggle('toggle-vertical', 'vertical');", "bindToggle('toggle-auto-rotate', 'autoRotate', () => { updateTimeDisplay(true); });\nbindToggle('toggle-vertical', 'vertical', () => { updateTimeDisplay(true); });")

# Change settings.vertical checks to use getIsVertical()
vertical_func = """function getIsVertical() {
    if (settings.autoRotate) {
        return window.innerHeight > window.innerWidth;
    }
    return settings.vertical;
}
"""

js = vertical_func + js
js = js.replace("container.classList.toggle('vertical', settings.vertical);", "container.classList.toggle('vertical', getIsVertical());")
js = js.replace("if (settings.vertical) {", "if (getIsVertical()) {")

# Add resize listener to re-layout on orientation change
resize_logic = """
let lastIsPortrait = window.innerHeight > window.innerWidth;
window.addEventListener('resize', () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (settings.autoRotate && isPortrait !== lastIsPortrait) {
        lastIsPortrait = isPortrait;
        updateTimeDisplay(true);
    }
});
"""
js = js + resize_logic

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Done")
