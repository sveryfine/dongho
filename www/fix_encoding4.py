# -*- coding: utf-8 -*-
"""
Direct string replacement for all remaining mojibake in app.js.
These are comments only so they don't affect functionality.
"""

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# All remaining mojibake patterns (these are just comments, not functional code)
replacements = [
    # Comments that are purely decorative
    ("C\u00e1\u00ba\u00adp nh\u00e1\u00ba\u00adt l\u00e1\u00bb\u008bch m\u00e1\u00bb\u0097i ph\u00c3\u00bat", "Cập nhật lịch mỗi phút"),
    ("H\u00e1\u00bb\u0097 tr\u00e1\u00bb\u00a3 K\u00c3\u00a9o th\u00e1\u00ba\u00a3 (Draggable) cho L\u00e1\u00bb\u008bch", "Hỗ trợ Kéo thả (Draggable) cho Lịch"),
    ("N\u00e1\u00ba\u00bfu kh\u00c3\u00b4ng hi\u00e1\u00bb\u0087n th\u00c3\u00ac b\u00e1\u00bb\u008f qua", "Nếu không hiện thì bỏ qua"),
    ("Kh\u00c3\u00b4ng vu\u00e1\u00bb\u0091t sheet", "Không vuốt sheet"),
    ("Kh\u00c3\u00b4ng l\u00c6\u00b0u localStorage ngay \u00e1\u00bb\u009f \u00c4\u0091\u00c3\u00a2y \u00c4\u0091\u00e1\u00bb\u0083 tr\u00c3\u00a1nh ghi \u00c4\u0091\u00c3\u00a8 li\u00c3\u00aan t\u00e1\u00bb\u00a5c", "Không lưu localStorage ngay ở đây để tránh ghi đè liên tục"),
    ("ch\u00e1\u00bb\u0089 l\u00c6\u00b0u khi nh\u00e1\u00ba\u00a5n n\u00c3\u00bat L\u00c6\u00b0u \u00e1\u00bb\u009f C\u00c3\u00a0i \u00c4\u0091\u00e1\u00ba\u00b7t. Nh\u00c6\u00b0ng c\u00e1\u00bb\u00a9 g\u00c3\u00a1n v\u00c3\u00a0o bi\u00e1\u00ba\u00bfn settings tr\u00c6\u00b0\u00e1\u00bb\u009bc.", "chỉ lưu khi nhấn nút Lưu ở Cài đặt. Nhưng cứ gán vào biến settings trước."),
]

for bad, good in replacements:
    text = text.replace(bad, good)

# Now try to find and replace ANY remaining lines that have mojibake characters
# by trying the latin1->utf8 trick on individual segments
import re

def fix_segment(match):
    s = match.group(0)
    try:
        return s.encode('latin-1').decode('utf-8')
    except:
        return s

# Find comment lines that still have high bytes
lines = text.split('\r\n')
fixed_lines = []
for line in lines:
    if any(ord(c) > 127 and ord(c) < 256 for c in line):
        # This line might have mojibake
        if line.strip().startswith('//') or line.strip().startswith('*') or line.strip().startswith('/*'):
            # It's a comment, try to fix it
            try:
                fixed = line.encode('latin-1').decode('utf-8')
                fixed_lines.append(fixed)
                continue
            except:
                pass
    fixed_lines.append(line)

text = '\r\n'.join(fixed_lines)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8', newline='') as f:
    f.write(text)

# Count remaining
mojibake = sum(1 for c in text if 0xC0 <= ord(c) <= 0xFF)
print(f"Remaining mojibake chars: {mojibake}")
