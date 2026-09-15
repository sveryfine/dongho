import re

html_file = 'index.html'
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

content = content.replace('<option value="fx-particles">Hạt kết nối</option>', '<option value="fx-particles">Hạt kết nối (Nền đen)</option>')
content = content.replace('<option value="fx-stars">Lấp lánh</option>', '<option value="fx-stars">Lấp lánh (Nền đen)</option>')
content = content.replace('<option value="fx-bubbles">Bọt nước</option>', '<option value="fx-bubbles">Bọt nước (Nền đen)</option>')
content = content.replace('<option value="fx-snow">Tuyết rơi</option>', '<option value="fx-snow">Tuyết rơi (Nền đen)</option>')
content = content.replace('<option value="fx-matrix">Chữ rơi</option>', '<option value="fx-matrix">Chữ rơi (Nền đen)</option>')
content = content.replace('<option value="fx-fireworks">Pháo hoa</option>', '<option value="fx-fireworks">Pháo hoa (Nền đen)</option>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
