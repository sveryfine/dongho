# -*- coding: utf-8 -*-
"""
Ultimate fix: Try multiple rounds of latin1->utf8 decoding until no more mojibake
"""

with open('d:/dongho/www/app.js', 'rb') as f:
    raw = f.read()

# Remove BOM
if raw[:3] == b'\xef\xbb\xbf':
    raw = raw[3:]

# Normalize line endings
raw = raw.replace(b'\r\r\n', b'\r\n').replace(b'\r\n', b'\n')

text = raw.decode('utf-8', errors='replace')

# Try multiple rounds of fix
for round_num in range(5):
    try:
        new_text = text.encode('latin-1').decode('utf-8')
        if new_text == text:
            break
        text = new_text
    except (UnicodeDecodeError, UnicodeEncodeError):
        # Try line by line
        lines = text.split('\n')
        fixed = []
        for line in lines:
            try:
                new_line = line.encode('latin-1').decode('utf-8')
                fixed.append(new_line)
            except (UnicodeDecodeError, UnicodeEncodeError):
                fixed.append(line)
        new_text = '\n'.join(fixed)
        if new_text == text:
            break
        text = new_text

# Write with \r\n line endings
text = text.replace('\n', '\r\n')

with open('d:/dongho/www/app.js', 'wb') as f:
    f.write(text.encode('utf-8'))

# Verify
import re
mojibake = len(re.findall(r'[\xc0-\xff]', text))
print(f"Remaining mojibake chars: {mojibake}")

# Check specific strings
for s in ['Chủ nhật', 'Tuần', 'đồng hồ']:
    if s in text:
        print(f"  OK: found '{s}'")
    else:
        print(f"  MISSING: '{s}'")
