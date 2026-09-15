# -*- coding: utf-8 -*-
with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    has_high = any(0xC0 <= ord(c) <= 0xFF for c in line)
    if has_high:
        # Show the line number and the high-byte chars
        high_chars = [(j, c, hex(ord(c))) for j, c in enumerate(line) if 0xC0 <= ord(c) <= 0xFF]
        snippet = line.strip()[:100]
        print(f"Line {i}: {snippet}")
