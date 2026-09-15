import re

with open('d:/dongho/www/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = r"if \(settings\.fontStyle === 'font2'\) suffix = 'a';\s*else if \(settings\.fontStyle === 'font3'\) suffix = 'b';"
replacement = """if (settings.fontStyle === 'font2') suffix = 'a';
    else if (settings.fontStyle === 'font3') suffix = 'b';
    else if (settings.fontStyle === 'font4') suffix = 'c';
    else if (settings.fontStyle === 'font5') suffix = 'd';"""

content = re.sub(target, replacement, content)

with open('d:/dongho/www/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
