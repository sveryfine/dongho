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
    transition: width 0.4s ease, min-width 0.4s ease, padding 0.4s ease, background 0.3s;
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
    transition: margin 0.4s ease;
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
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gulp-btn:hover .gulp-trash__lid {
    transform: rotate(-25deg) translateY(-2px);
}

.gulp-spinner {
    position: absolute;
    width: 24px;
    height: 24px;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.3s, transform 0.3s;
}

.gulp-btn__text {
    position: relative;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s, filter 0.4s;
    white-space: nowrap;
    z-index: 1;
}

/* --- Trạng thái đang xóa (.is-deleting) --- */
.gulp-btn.is-deleting {
    min-width: 50px;
    width: 50px;
    padding: 0;
    background: #0f172a;
    pointer-events: none;
}

.gulp-btn.is-deleting .gulp-btn__icon {
    margin-right: 0;
}

.gulp-btn.is-deleting .gulp-trash__lid {
    animation: gulp-lid-open-close 0.6s forwards;
}

.gulp-btn.is-deleting .gulp-trash {
    animation: gulp-trash-shake 0.4s 0.2s forwards;
}

.gulp-btn.is-deleting .gulp-btn__text {
    transform: translate(-30px, 15px) scale(0.01) rotate(-15deg);
    opacity: 0;
    filter: blur(2px);
}

.gulp-btn.is-deleting .gulp-spinner {
    opacity: 1;
    transform: scale(1);
    animation: gulp-spin 1s linear infinite;
    transition-delay: 0.6s;
}
.gulp-btn.is-deleting .gulp-spinner circle {
    stroke-dasharray: 100;
    animation: gulp-stroke 1.5s ease-in-out infinite;
}

@keyframes gulp-lid-open-close {
    0% { transform: rotate(-25deg) translateY(-2px); }
    40% { transform: rotate(-45deg) translateY(-5px); }
    100% { transform: rotate(0) translateY(0); }
}

@keyframes gulp-trash-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px) rotate(-5deg); }
    50% { transform: translateX(2px) rotate(5deg); }
    75% { transform: translateX(-2px) rotate(-5deg); }
}

@keyframes gulp-spin {
    100% { transform: rotate(360deg); }
}

@keyframes gulp-stroke {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* Trạng thái thành công (.is-done) */
.gulp-btn.is-done {
    min-width: 150px;
    width: auto;
    padding: 0 25px;
    background: #10b981;
}
.gulp-btn.is-done .gulp-btn__icon {
    margin-right: 10px;
}
.gulp-btn.is-done .gulp-trash {
    display: none;
}
.gulp-btn.is-done .gulp-spinner {
    display: none;
    animation: none;
}
.gulp-btn.is-done .gulp-btn__text {
    transform: translateX(0) scale(1);
    opacity: 1;
    filter: none;
}
"""

with open('d:/dongho/www/style.css', 'w', encoding='utf-8') as f:
    f.write(content + correct_css)

print("Fixed style.css")
