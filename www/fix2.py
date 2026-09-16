import re

with open('d:/dongho/www/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add transform-box to lid
content = content.replace(
    ".gulp-trash__lid {\n    transform-origin: 30% 100%;",
    ".gulp-trash__lid {\n    transform-origin: 30% 100%;\n    transform-box: fill-box;"
)

# 2. Remove old text animation block
old_text_anim = """.gulp-btn.is-deleting .gulp-btn__text {
    transform: translate(-30px, 15px) scale(0.01) rotate(-15deg);
    opacity: 0;
    filter: blur(2px);
}"""
content = content.replace(old_text_anim, "")

# 3. Append the new keyframes for letter-fall at the end, right before /* Trạng thái thành công (.is-done) */
new_keyframes = """
@keyframes gulp-letter-fall {
    0% { transform: translate(0, 0) scale(1) rotate(0); opacity: 1; }
    30% { transform: translate(calc(var(--dx) * 0.3), -15px) scale(1.2) rotate(-10deg); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0) rotate(-45deg); opacity: 0; }
}

"""
idx = content.find("/* Trạng thái thành công (.is-done) */")
if idx != -1:
    content = content[:idx] + new_keyframes + content[idx:]

with open('d:/dongho/www/style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated style.css for letter animation")
