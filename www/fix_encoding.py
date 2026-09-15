# -*- coding: utf-8 -*-
# Fix encoding issues in app.js
# The file has UTF-8 BOM but content got double-encoded

with open('d:/dongho/www/app.js', 'rb') as f:
    raw = f.read()

# Remove BOM if present
if raw[:3] == b'\xef\xbb\xbf':
    raw = raw[3:]

# The content was originally UTF-8, then got read as latin-1 and written as UTF-8
# This means we need to decode as UTF-8, then fix the mojibake
text = raw.decode('utf-8', errors='replace')

# Fix all known mojibake patterns (UTF-8 double-encoded Vietnamese)
replacements = {
    'Ch\u00e1\u00bb\u00a7 nh\u00e1\u00ba\u00adt': 'Chủ nhật',
    'Th\u00e1\u00bb\u00a9 ': 'Thứ ',
    'Tu\u00e1\u00ba\u00a7n': 'Tuần',
    '\u00c3\u0082m l\u00e1\u00bb\u008bch:': 'Âm lịch:',
    'L\u00e1\u00bb\u008bch D\u00c6\u00b0\u00c6\u00a1ng': 'Lịch Dương',
    'L\u00e1\u00bb\u008bch \u00c3\u0082m': 'Lịch Âm',
    'L\u00e1\u00bb\u0097i \u00c4\u0091\u00e1\u00bb\u008dc settings:': 'Lỗi đọc settings:',
    'Ng\u00c3\u00a0y th\u00c3\u00a1ng D\u00c6\u00b0\u00c6\u00a1ng & \u00c3\u0082m': 'Ngày tháng Dương & Âm',
    'C\u00e1\u00ba\u00adp nh\u00e1\u00ba\u00adt l\u00e1\u00ba\u00a1i \u00c4\u0091\u00e1\u00bb\u0093ng h\u00e1\u00bb\u0093': 'Cập nhật lại đồng hồ',
    'H\u00e1\u00bb\u0097 tr\u00e1\u00bb\u00a3 K\u00c3\u00a9o th\u00e1\u00ba\u00a3 (Draggable) cho L\u00e1\u00bb\u008bch': 'Hỗ trợ Kéo thả (Draggable) cho Lịch',
    'N\u00e1\u00ba\u00bfu kh\u00c3\u00b4ng hi\u00e1\u00bb\u0087n th\u00c3\u00ac b\u00e1\u00bb\u008f qua': 'Nếu không hiện thì bỏ qua',
    'Kh\u00c3\u00b4ng vu\u00e1\u00bb\u0091t sheet': 'Không vuốt sheet',
    '\u00c4\u0091\u00e1\u00bb\u0093ng h\u00e1\u00bb\u0093': 'đồng hồ',
    'C\u00e1\u00ba\u00adp nh\u00e1\u00ba\u00adt l\u00e1\u00bb\u008bch m\u00e1\u00bb\u0097i ph\u00c3\u00bat': 'Cập nhật lịch mỗi phút',
    'C\u00c3\u00a0i \u00c4\u0091\u00e1\u00ba\u00b7t (Settings State)': 'Cài đặt (Settings State)',
    'Danh s\u00c3\u00a1ch t\u00e1\u00ba\u00a5t c\u00e1\u00ba\u00a3 class hi\u00e1\u00bb\u0087u \u00e1\u00bb\u00a9ng kh\u00e1\u00bb\u0091i': 'Danh sách tất cả class hiệu ứng khối',
    'X\u00c3\u00b3a t\u00e1\u00ba\u00a5t c\u00e1\u00ba\u00a3 class hi\u00e1\u00bb\u0087u \u00e1\u00bb\u00a9ng c\u00c5\u00a9': 'Xóa tất cả class hiệu ứng cũ',
    'Th\u00c3\u00aam class hi\u00e1\u00bb\u0087u \u00e1\u00bb\u00a9ng m\u00e1\u00bb\u009bi': 'Thêm class hiệu ứng mới',
    'n\u00e1\u00ba\u00bfu kh\u00c3\u00b4ng ph\u00e1\u00ba\u00a3i': 'nếu không phải',
}

for bad, good in replacements.items():
    text = text.replace(bad, good)

# Also try a more general approach: decode the mojibake
# The pattern is: UTF-8 bytes were interpreted as latin-1 then re-encoded as UTF-8
import re

def fix_mojibake(text):
    """Try to fix double-encoded UTF-8 text"""
    try:
        # Find sequences that look like mojibake (multi-byte UTF-8 interpreted as latin-1)
        # Common patterns: Ã, Ä, á, etc. followed by specific bytes
        result = text
        # Try encoding back to latin-1 then decoding as utf-8 for remaining bad chars
        parts = result.split('\n')
        fixed_parts = []
        for part in parts:
            try:
                # Check if this line has mojibake
                if any(c in part for c in ['\u00c3', '\u00c4', '\u00c5', '\u00e1']):
                    try:
                        fixed = part.encode('latin-1').decode('utf-8')
                        fixed_parts.append(fixed)
                    except (UnicodeDecodeError, UnicodeEncodeError):
                        fixed_parts.append(part)
                else:
                    fixed_parts.append(part)
            except:
                fixed_parts.append(part)
        return '\n'.join(fixed_parts)
    except:
        return text

text = fix_mojibake(text)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(text)

print("Encoding fixed!")

# Verify
with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    content = f.read()
    
# Check dayNames
import re
match = re.search(r"dayNames = \[([^\]]+)\]", content)
if match:
    print(f"dayNames: {match.group(1)[:80]}")
