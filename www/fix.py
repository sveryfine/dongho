import re

html_file = 'index.html'
with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

new_dropdown = """<select id="bg-selector-dropdown" class="styled-select" style="flex: 1;">
                        <option value="custom" id="opt-custom-bg" style="display: none;">Nền của bạn</option>
                        <option value="bg-black">Đen tuyền (Mặc định)</option>
                        
                        <!-- Hiệu ứng Động (Canvas) -->
                        <option value="fx-particles">Mạng lưới hạt</option>
                        <option value="fx-stars">Sao lấp lánh</option>
                        <option value="fx-bubbles">Bọt nước bay</option>
                        <option value="fx-snow">Tuyết rơi</option>
                        <option value="fx-matrix">Ma trận (Matrix)</option>
                        <option value="fx-fireworks">Pháo hoa</option>
                        
                        <!-- Hiệu ứng Động + Màu nền -->
                        <option value="fx-particles|bg-anim-mystic-2">Mạng lưới + Vũ trụ</option>
                        <option value="fx-stars|bg-anim-cold-4">Sao + Bầu trời đêm</option>
                        <option value="fx-bubbles|bg-anim-cold-2">Bọt nước + Sóng xanh</option>
                        <option value="fx-snow|bg-anim-cold-3">Tuyết + Băng giá</option>
                        <option value="fx-matrix|bg-anim-mystic-4">Ma trận + Bóng tối</option>
                        <option value="fx-fireworks|bg-anim-mystic-1">Pháo hoa + Ma thuật</option>

                        <!-- Hình nền Màu / Gradient -->
                        <option value="bg-anim-warm-1">Bình minh rực rỡ</option>
                        <option value="bg-anim-warm-2">Hỏa ngục</option>
                        <option value="bg-anim-warm-5">Dung nham</option>
                        <option value="bg-anim-cold-1">Biển sâu</option>
                        <option value="bg-anim-cold-4">Bầu trời đêm</option>
                        <option value="bg-anim-nature-1">Rừng rậm</option>
                        <option value="bg-anim-nature-3">Ngọc lục bảo</option>
                        <option value="bg-anim-mystic-2">Vũ trụ</option>
                        <option value="bg-anim-pastel-3">Giấc mơ</option>
                        <option value="bg-anim-neon-1">Thành phố điện</option>
                        <option value="bg-anim-neon-3">Hacker</option>
                    </select>"""

pattern = re.compile(r'<select id="bg-selector-dropdown".*?</select>', re.DOTALL)
content = pattern.sub(new_dropdown, content)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
