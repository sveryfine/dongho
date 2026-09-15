# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    has_high = any(0xC0 <= ord(c) <= 0xFF for c in line)
    if has_high:
        snippet = line.strip()[:120]
        print(f"Line {i}: {snippet}")
