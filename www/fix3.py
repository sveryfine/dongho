import re

with open('d:/dongho/www/style.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the gulp button block
start_marker = "/* ====== Nút Xóa Gulp (Animated Delete Button) ====== */"
idx = content.find(start_marker)

if idx != -1:
    content = content[:idx]

# The correct CSS block to append
correct_css = """/* ====== Nút Xóa Gulp (Animated Delete Button) ====== */
.gulp-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e293b;
    border: none;
    border-radius: 30px;
    height: 50px;
    min-width: 150px;
    padding: 0 25px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: background 0.3s;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.gulp-btn:hover {
    background: #334155;
}

.gulp-btn__icon {
    position: relative;
    width: 24px;
    height: 24px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 2;
}

.gulp-trash {
    position: absolute;
    width: 20px;
    height: 20px;
    transition: transform 0.3s;
    overflow: visible;
}

.gulp-trash__lid {
    transform-origin: 30% 100%;
    transform-box: fill-box;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gulp-trash__fill {
    transform-origin: center bottom;
    transform: scaleY(0);
    transition: transform 0.8s ease;
}

.gulp-btn:hover .gulp-trash__lid {
    transform: rotate(-25deg) translateY(-2px);
}

.gulp-spinner {
    display: none;
}

.gulp-btn__text {
    position: relative;
    transition: opacity 0.4s, filter 0.4s;
    white-space: nowrap;
    z-index: 1;
}

/* --- Trạng thái đang xóa (.is-deleting) --- */
.gulp-btn.is-deleting {
    background: #0f172a;
    pointer-events: none;
}

.gulp-btn.is-deleting .gulp-trash__lid {
    animation: gulp-lid-open-close 1.2s forwards;
}

.gulp-btn.is-deleting .gulp-trash {
    animation: gulp-trash-shake 0.4s 0.8s forwards;
}

.gulp-btn.is-deleting .gulp-trash__fill {
    transform: scaleY(1);
}

@keyframes gulp-lid-open-close {
    0% { transform: rotate(-25deg) translateY(-2px); }
    10% { transform: rotate(-45deg) translateY(-5px); }
    80% { transform: rotate(-45deg) translateY(-5px); }
    100% { transform: rotate(0) translateY(0); }
}

@keyframes gulp-trash-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px) rotate(-5deg); }
    50% { transform: translateX(2px) rotate(5deg); }
    75% { transform: translateX(-2px) rotate(-5deg); }
}

@keyframes gulp-letter-fall {
    0% { transform: translate(0, 0) scale(1) rotate(0); opacity: 1; }
    30% { transform: translate(calc(var(--dx) * 0.3), -15px) scale(1.2) rotate(-10deg); opacity: 1; }
    100% { transform: translate(var(--dx), var(--dy)) scale(0) rotate(-45deg); opacity: 0; }
}

/* Trạng thái thành công (.is-done) */
.gulp-btn.is-done {
    background: #10b981;
}
.gulp-btn.is-done .gulp-trash {
    display: none;
}
.gulp-btn.is-done .gulp-btn__text {
    opacity: 1;
    filter: none;
}
"""

with open('d:/dongho/www/style.css', 'w', encoding='utf-8') as f:
    f.write(content + correct_css)

print("Fixed style.css for phase 3")
