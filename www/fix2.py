import re

html_file = 'index.html'
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

new_dropdown = """<select id="bg-selector-dropdown" class="styled-select" style="flex: 1;">
                        <option value="custom" id="opt-custom-bg" style="display: none;">Nền của bạn</option>
                        <option value="bg-black">Nền đen tĩnh</option>
                        
                        <option value="fx-particles">Hạt kết nối</option>
                        <option value="fx-stars">Sao lấp lánh</option>
                        <option value="fx-bubbles">Bọt nước</option>
                        <option value="fx-snow">Tuyết rơi</option>
                        <option value="fx-matrix">Chữ rơi (Matrix)</option>
                        <option value="fx-fireworks">Pháo hoa</option>
                        
                        <option value="fx-particles|bg-anim-mystic-2">Hạt kết nối + Nền đen xanh</option>
                        <option value="fx-stars|bg-anim-cold-4">Sao lấp lánh + Nền xanh lam sậm</option>
                        <option value="fx-bubbles|bg-anim-cold-2">Bọt nước + Nền xanh da trời</option>
                        <option value="fx-snow|bg-anim-cold-3">Tuyết rơi + Nền tím lợt</option>
                        <option value="fx-matrix|bg-anim-mystic-4">Chữ rơi + Nền xám đen</option>
                        <option value="fx-fireworks|bg-anim-mystic-1">Pháo hoa + Nền lục lam - tím</option>

                        <option value="bg-anim-warm-1">Nền màu hồng nhạt</option>
                        <option value="bg-anim-warm-2">Nền màu vàng cam</option>
                        <option value="bg-anim-warm-5">Nền màu đỏ cam</option>
                        <option value="bg-anim-cold-1">Nền màu xanh lam</option>
                        <option value="bg-anim-cold-4">Nền màu lam sậm</option>
                        <option value="bg-anim-nature-1">Nền màu xanh ngọc</option>
                        <option value="bg-anim-nature-3">Nền màu xanh lá cây</option>
                        <option value="bg-anim-mystic-2">Nền màu đen ám lam</option>
                        <option value="bg-anim-pastel-3">Nền màu trắng xám</option>
                        <option value="bg-anim-neon-1">Nền màu đỏ vàng</option>
                        <option value="bg-anim-neon-3">Nền màu ngọc - tím</option>
                    </select>"""

pattern = re.compile(r'<select id="bg-selector-dropdown".*?</select>', re.DOTALL)
content = pattern.sub(new_dropdown, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
