# -*- coding: utf-8 -*-
"""Fix all remaining mojibake by encoding each problematic line as latin-1 then decoding as UTF-8"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed_lines = []
fix_count = 0

for i, line in enumerate(lines):
    has_mojibake = any(0xC0 <= ord(c) <= 0xFF for c in line)
    if has_mojibake:
        try:
            fixed = line.encode('latin-1').decode('utf-8')
            fixed_lines.append(fixed)
            fix_count += 1
            continue
        except (UnicodeDecodeError, UnicodeEncodeError):
            # Line has mix of good UTF-8 and mojibake - can't auto-fix
            pass
    fixed_lines.append(line)

text = ''.join(fixed_lines)

# Fix any remaining line endings
text = text.replace('\r\r\n', '\r\n')

with open('d:/dongho/www/app.js', 'w', encoding='utf-8', newline='') as f:
    f.write(text)

print(f"Fixed {fix_count} lines")

# Recheck
mojibake = sum(1 for c in text if 0xC0 <= ord(c) <= 0xFF)
print(f"Remaining mojibake chars: {mojibake}")
