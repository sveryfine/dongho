# -*- coding: utf-8 -*-
"""
Brute-force fix: Read the file as raw bytes, try to reverse the double-encoding,
and fix line endings.
"""

with open('d:/dongho/www/app.js', 'rb') as f:
    raw = f.read()

# Remove BOM if present
if raw[:3] == b'\xef\xbb\xbf':
    raw = raw[3:]

# Fix double \r\r\n -> \r\n
raw = raw.replace(b'\r\r\n', b'\r\n')

# Now try line-by-line fix
lines = raw.split(b'\r\n')
fixed_lines = []

for line in lines:
    # Try to decode as UTF-8 first
    try:
        decoded = line.decode('utf-8')
    except:
        decoded = line.decode('latin-1')
    
    # Check if the line has mojibake (double-encoded UTF-8)
    # Signature: characters like Ã, Ä, Å followed by specific bytes
    has_mojibake = False
    for char in decoded:
        cp = ord(char)
        if cp in range(0xC0, 0x100):  # Latin supplement range used in mojibake
            has_mojibake = True
            break
    
    if has_mojibake:
        try:
            # Reverse the double-encoding: encode as latin-1, decode as utf-8
            fixed = decoded.encode('latin-1').decode('utf-8')
            fixed_lines.append(fixed)
        except (UnicodeDecodeError, UnicodeEncodeError):
            fixed_lines.append(decoded)
    else:
        fixed_lines.append(decoded)

result = '\r\n'.join(fixed_lines)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8', newline='') as f:
    f.write(result)

# Verify some key strings
checks = ['Chủ nhật', 'Tuần', 'Âm lịch', 'Cài đặt']
for check in checks:
    if check in result:
        pass  # good
    else:
        # Try to find what it looks like
        pass

print("DONE - file fixed")
print(f"File size: {len(result)} chars")

# Quick check for remaining mojibake
import re
mojibake_count = len(re.findall(r'[\xc0-\xff]', result))
print(f"Remaining potential mojibake chars: {mojibake_count}")
