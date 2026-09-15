import re

with open('d:/dongho/www/bg-effects.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update trigger
trigger_target = r"        if \(!this\._snowExploding && maxHeight >= H \* 0\.85\) \{(.*?)\}"
trigger_replace = """        if (!this._snowExploding && maxHeight >= H * 0.85) {
            this._snowExploding = true;
            this._snowExplosionEndTime = Date.now() + 25000; // Nổ trong 25 giây
            this._nextExplosionTime = Date.now();
            this._snowHoles = []; // Lưu các lỗ thủng
        }"""
content = re.sub(trigger_target, trigger_replace, content, flags=re.DOTALL)

# 2. Update explosion logic
explode_target = r"        if \(this\._snowExploding\) \{(.*?)// --- Cập nhật & vẽ hạt tuyết rơi ---"
explode_replace = """        if (this._snowExploding) {
            if (Date.now() < this._snowExplosionEndTime) {
                // Nổ TNT tại một điểm ngẫu nhiên trên toàn màn hình
                if (Date.now() > this._nextExplosionTime) {
                    const ex = Math.random() * W;
                    const ey = Math.random() * H;

                    // Thêm lỗ thủng
                    this._snowHoles.push({
                        x: ex,
                        y: ey,
                        r: Math.random() * 50 + 30 // Bán kính lỗ khá to
                    });

                    // Hạt tuyết bắn ra
                    for (let i = 0; i < 20; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = Math.random() * 2 + 0.5;
                        this._snowParticles.push({
                            x: ex, y: ey,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            r: Math.random() * 1.5 + 0.5,
                            life: 40 + Math.random() * 20,
                            gravity: 0.02
                        });
                    }

                    // Nổ liên tục khoảng 10-15 lần mỗi giây
                    this._nextExplosionTime = Date.now() + 50 + Math.random() * 50; 
                }
            } else {
                this._snowExploding = false; // Kết thúc
                this._snowHeights.fill(0); // Reset tuyết
                this._snowHoles = [];
            }
        }

        // --- Cập nhật & vẽ hạt tuyết rơi ---"""
content = re.sub(explode_target, explode_replace, content, flags=re.DOTALL)


# 3. Swap snow pile and particles.
# We will match the entire block of particles and snow pile, and rewrite them in the correct order.
# The particles block starts with: // --- Vẽ & cập nhật hạt nổ tung ---
# The snow pile block starts with: // --- Vẽ lớp tuyết đọng dưới đáy ---
# The function ends with }

swap_target = r"        // --- Vẽ & cập nhật hạt nổ tung ---.*?\}\)\;.*?// --- Vẽ lớp tuyết đọng dưới đáy ---.*?        \}"
swap_replace = """        // --- Vẽ khối tuyết và các lỗ thủng ---
        if (this._snowExploding) {
            // Khi đang nổ, vẽ tuyết trắng xoá toàn màn hình
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
            this.ctx.fillRect(0, 0, W, H);
            
            // Khoét các lỗ thủng (True 2D holes)
            if (this._snowHoles && this._snowHoles.length > 0) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'rgba(0,0,0,1)';
                for (let i = 0; i < this._snowHoles.length; i++) {
                    const hole = this._snowHoles[i];
                    this.ctx.beginPath();
                    this.ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.globalCompositeOperation = 'source-over';
            }
        } else if (maxHeight > 0.5) {
            // Khi bình thường, vẽ đống tuyết dưới đáy
            this.ctx.beginPath();
            this.ctx.moveTo(0, H);
            for (let i = 0; i < W; i += 2) {
                this.ctx.lineTo(i, H - this._snowHeights[i]);
            }
            this.ctx.lineTo(W, H);
            this.ctx.closePath();

            const grad = this.ctx.createLinearGradient(0, H - maxHeight, 0, H);
            grad.addColorStop(0, 'rgba(220, 235, 255, 0.95)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
            this.ctx.fillStyle = grad;
            this.ctx.fill();
        }

        // --- Vẽ & cập nhật hạt nổ tung (Phải vẽ sau nền tuyết để không bị đè mất/xóa nhầm) ---
        this._snowParticles = this._snowParticles.filter(p => {
            p.vy += p.gravity !== undefined ? p.gravity : 0.15;
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.99;
            p.life--;

            const alpha = Math.max(p.life / 150, 0);
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            if (p.r > 2) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = 'rgba(255,255,255,0.8)';
            }
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            return p.life > 0;
        });
    }"""
content = re.sub(swap_target, swap_replace, content, flags=re.DOTALL)

with open('d:/dongho/www/bg-effects.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Script success")
