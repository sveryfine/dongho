// ====== Background Effects Engine v3 ======
// Highly interactive physics-based backgrounds

class BgEffectsEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bg-effects-canvas';
        this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        document.body.prepend(this.canvas);
        
        // Disable default scroll behavior on body to allow smooth touch dragging
        document.body.style.touchAction = 'none';
        
        this.ctx = this.canvas.getContext('2d');
        this.animId = null;
        this.currentEffect = null;
        
        this.touchX = -1;
        this.touchY = -1;
        this.isDown = false;
        this.wasDown = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Universal Input handling
        window.addEventListener('pointerdown', (e) => this.handleDown(e.clientX, e.clientY));
        window.addEventListener('pointermove', (e) => { if (this.isDown) this.handleMove(e.clientX, e.clientY); });
        window.addEventListener('pointerup', () => this.handleUp());
        
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) this.handleDown(e.touches[0].clientX, e.touches[0].clientY);
        }, {passive: false});
        window.addEventListener('touchmove', (e) => {
            if (this.isDown && e.touches.length > 0) this.handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, {passive: false});
        window.addEventListener('touchend', () => this.handleUp());
    }

    handleDown(x, y) {
        this.touchX = x;
        this.touchY = y;
        this.isDown = true;
    }
    handleMove(x, y) {
        this.touchX = x;
        this.touchY = y;
    }
    handleUp() {
        this.isDown = false;
        // Keep coordinates for one frame to process release logic, handled in loop
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    stop() {
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        this.currentEffect = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    start(effectName) {
        this.stop();
        this.currentEffect = effectName;
        const initFn = this['init_' + effectName];
        if (initFn) initFn.call(this);
        this.loop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.loop();
        }
    }

    loop() {
        if (this.isPaused) return;

        // Clear background with faint trail for most effects
        if (this.currentEffect !== 'matrix' && this.currentEffect !== 'fireworks' && this.currentEffect !== 'lightning') {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        const drawFn = this['draw_' + this.currentEffect];
        if (drawFn) drawFn.call(this);

        this.wasDown = this.isDown;
        if (!this.isDown) {
            this.touchX = -1;
            this.touchY = -1;
        }

        this.animId = requestAnimationFrame(() => this.loop());
    }

    // ====== 2. Sao lấp lánh (Stars) - Gom lại và nổ tung ======
    init_stars() {
        this._stars = [];
        for (let i = 0; i < 200; i++) {
            this._stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                history: [],
                vx: 0, vy: 0,
                r: Math.random() * 1 + 0.5,
                alpha: Math.random(),
                hue: [200, 60, 300, 340, 10][Math.floor(Math.random() * 5)]
            });
        }
    }
    draw_stars() {
        const W = this.canvas.width, H = this.canvas.height;
        const released = this.wasDown && !this.isDown;
        
        this._stars.forEach(s => {
            if (this.isDown) {
                // Hút về phía ngón tay (Gom lại)
                const dx = this.touchX - s.x;
                const dy = this.touchY - s.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 10) {
                    s.vx += (dx / dist) * 0.5;
                    s.vy += (dy / dist) * 0.5;
                }
                // Ma sát mạnh khi gom
                s.vx *= 0.92;
                s.vy *= 0.92;
                s.alpha = 1;
            } else if (released) {
                // Nổ tung ra khi buông tay
                const dx = this.touchX - s.x;
                const dy = this.touchY - s.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 300) {
                    const angle = Math.atan2(dy, dx) + Math.PI; // Ngược hướng
                    const force = (300 - dist) * 0.1;
                    s.vx = Math.cos(angle) * force + (Math.random()-0.5)*10;
                    s.vy = Math.sin(angle) * force + (Math.random()-0.5)*10;
                }
            } else {
                // Trôi tự do nhẹ nhàng, giảm tốc từ từ
                s.vx += (Math.random() - 0.5) * 0.04;
                s.vy += (Math.random() - 0.5) * 0.04;
                s.vx *= 0.98;
                s.vy *= 0.98;
                s.alpha += (Math.random()-0.5)*0.1;
                if(s.alpha > 1) s.alpha = 1;
                if(s.alpha < 0.2) s.alpha = 0.2;
            }

            s.x += s.vx;
            s.y += s.vy;
            
            // Xuyên màn hình
            let wrapped = false;
            if (s.x < 0) { s.x = W; wrapped = true; } 
            if (s.x > W) { s.x = 0; wrapped = true; }
            if (s.y < 0) { s.y = H; wrapped = true; } 
            if (s.y > H) { s.y = 0; wrapped = true; }
            
            // Cập nhật vệt đuôi
            s.history.push({x: s.x, y: s.y});
            if (s.history.length > 20) s.history.shift();
            if (wrapped) s.history = [];

            // Vẽ vệt đuôi
            if (s.history.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(s.history[0].x, s.history[0].y);
                for (let i = 1; i < s.history.length; i++) {
                    this.ctx.lineTo(s.history[i].x, s.history[i].y);
                }
                this.ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${s.alpha * 0.4})`;
                this.ctx.lineWidth = s.r * 1.2;
                this.ctx.stroke();
            }

            // Vẽ hạt sao (Màu tươi sáng hơn)
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.r * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${s.hue}, 100%, 70%, ${s.alpha})`;
            this.ctx.fill();
        });
    }

    // ====== 9. Ma trận (Matrix) - Đọng lại quanh tay / Tràn ra 2 bên ======
    init_matrix() {
        this._chars = [];
        const cols = Math.floor(this.canvas.width / 16);
        for(let i=0; i<cols*2; i++) {
            this._chars.push({
                x: (i % cols) * 16,
                y: Math.random() * this.canvas.height,
                vy: Math.random() * 2 + 1,
                char: String.fromCharCode(0x30A0 + Math.random() * 96)
            });
        }
    }
    draw_matrix() {
        const W = this.canvas.width, H = this.canvas.height;
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(0,0,W,H);
        this.ctx.font = '16px monospace';
        
        this._chars.forEach(c => {
            let activeVy = c.vy;
            
            if (this.isDown) {
                const dx = c.x - this.touchX;
                const dy = c.y - this.touchY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 100 && dy < 0) {
                    // Chữ đang rơi xuống ngón tay -> Bị kẹt lại (đọng chữ)
                    activeVy = 0;
                    this.ctx.fillStyle = 'rgba(255,255,255,0.9)'; // Sáng lên khi đọng
                } else if (dist < 120 && dy >= 0) {
                    // Tràn ra 2 bên nếu rơi qua ngón tay
                    c.x += dx > 0 ? 3 : -3;
                    this.ctx.fillStyle = 'rgba(0,255,100,0.9)';
                } else {
                    this.ctx.fillStyle = 'rgba(0,255,70,0.5)';
                }
            } else {
                // Trôi về cột gốc
                const origX = Math.round(c.x / 16) * 16;
                c.x += (origX - c.x) * 0.1;
                this.ctx.fillStyle = 'rgba(0,255,70,0.5)';
            }
            
            c.y += activeVy;
            if (c.y > H) {
                c.y = 0;
                c.char = String.fromCharCode(0x30A0 + Math.random() * 96);
            }
            if (Math.random() > 0.95) {
                c.char = String.fromCharCode(0x30A0 + Math.random() * 96);
            }
            
            this.ctx.fillText(c.char, c.x, c.y);
        });
    }

    // ====== 4. Bọt nước (Bubbles) - Nổ và rẽ nhánh ======
    init_bubbles() {
        this._bubs = [];
        for (let i = 0; i < 60; i++) { 
            this.spawnBubble(Math.random() * this.canvas.width, this.canvas.height + Math.random()*200);
        }
    }
    spawnBubble(x, y) {
        this._bubs.push({ 
            x, y, 
            vx: 0, 
            vy: -(Math.random() * 2 + 1), 
            r: Math.random() * 15 + 5,
            wobble: Math.random() * Math.PI * 2
        });
    }
    draw_bubbles() {
        const H = this.canvas.height;
        this._bubs.forEach((b, index) => {
            b.wobble += 0.05;
            b.x += Math.sin(b.wobble) * 1 + b.vx;
            b.y += b.vy;
            b.vx *= 0.95; // Giảm lực tản ngang
            
            // Pop on touch
            if (this.isDown) {
                const dx = this.touchX - b.x, dy = this.touchY - b.y;
                const dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 100) {
                    // Lực đẩy nước rẽ ra
                    b.vx -= dx * 0.05;
                    b.vy -= dy * 0.05;
                }
                if (dist < b.r + 20) { 
                    // Nổ bọt nước
                    this._bubs.splice(index, 1);
                    this.spawnBubble(Math.random() * this.canvas.width, H + 50);
                    // Vẽ tia nổ
                    this.ctx.beginPath();
                    this.ctx.arc(b.x, b.y, b.r*2, 0, Math.PI*2);
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                    this.ctx.stroke();
                    return;
                }
            }
            
            if (b.y < -b.r * 2) { 
                b.y = H + b.r; b.x = Math.random() * this.canvas.width; 
                b.vx = 0;
            }
            
            this.ctx.beginPath(); this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.4)'; this.ctx.lineWidth = 2; this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.2, 0, Math.PI*2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.6)'; this.ctx.fill();
        });
    }

    // ====== 7. Tuyết (Snow) - Đọng dưới đáy, chạm bay, đầy nổ tung ======
    init_snow() {
        const W = this.canvas.width;
        const H = this.canvas.height;
        this._snow = [];
        this._snowHeights = new Float32Array(W); // Chiều cao tuyết đọng tại mỗi cột pixel
        this._snowParticles = []; // Hạt nổ tung
        this._snowExploding = false;
        this._snowExplosionEndTime = 0;
        this._snowFull = false;
        for (let i = 0; i < 200; i++) {
            const maxVy = Math.random() * 0.5 + 0.15; // Mỗi hạt có tốc độ tối đa riêng (0.15 - 0.65)
            this._snow.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.5,
                vx: Math.random() * 0.3 - 0.15,
                vy: Math.random() * maxVy,
                maxVy: maxVy  // Tốc độ rơi tối đa riêng của từng hạt
            });
        }
    }
    draw_snow() {
        const W = this.canvas.width, H = this.canvas.height;

        // --- Xử lý chạm vào tuyết đọng: cào tuyết bay ---
        if (this.isDown && this.touchY > 0 && !this._snowExploding) {
            const tx = Math.floor(this.touchX);
            const snowSurfaceY = H - (this._snowHeights[tx] || 0);
            // Nếu ngón tay chạm vào vùng tuyết đọng
            if (this.touchY >= snowSurfaceY - 30) {
                const radius = 40;
                let removed = 0;
                for (let i = tx - radius; i <= tx + radius; i++) {
                    if (i >= 0 && i < W && this._snowHeights[i] > 0) {
                        const dist = Math.abs(i - tx);
                        const strength = 1 - (dist / radius);
                        const dig = strength * 3;
                        const actualDig = Math.min(this._snowHeights[i], dig);
                        this._snowHeights[i] -= actualDig;
                        removed += actualDig;
                    }
                }
                // Tạo hạt tuyết bay tung từ chỗ chạm (bay cực kỳ chậm và mượt)
                const numParticles = Math.min(Math.floor(removed * 0.5), 8);
                for (let i = 0; i < numParticles; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 0.8 + 0.2; // Tốc độ cực chậm
                    this._snowParticles.push({
                        x: this.touchX + (Math.random() - 0.5) * 20,
                        y: this.touchY + (Math.random() - 0.5) * 10,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        r: Math.random() * 2 + 0.5,
                        life: 100 + Math.random() * 50,
                        gravity: 0.01 // Trọng lực siêu nhẹ
                    });
                }
            }
        }

        // --- Kiểm tra tuyết đã đầy màn hình chưa ---
        let maxHeight = 0;
        for (let i = 0; i < W; i++) {
            if (this._snowHeights[i] > maxHeight) maxHeight = this._snowHeights[i];
        }
        
        if (!this._snowExploding && maxHeight >= H * 0.85) {
            this._snowExploding = true;
            this._snowExplosionEndTime = Date.now() + 25000; // Nổ trong 25 giây
            this._nextExplosionTime = Date.now();
            this._snowHoles = []; // Lưu các lỗ thủng
        }

        if (this._snowExploding) {
            if (Date.now() < this._snowExplosionEndTime) {
                if (Date.now() > this._nextExplosionTime) {
                    const ex = Math.random() * W;
                    const idx = Math.floor(ex);
                    const surfaceY = H - (this._snowHeights[idx] || 0);
                    // Nổ ngẫu nhiên BÊN TRONG lớp tuyết đọng (không nổ lơ lửng trên trời)
                    const ey = surfaceY + Math.random() * (H - surfaceY);

                    // Thêm lỗ thủng với hình dáng răng cưa lởm chởm
                    const numPoints = Math.floor(10 + Math.random() * 10);
                    const points = [];
                    for (let p = 0; p < numPoints; p++) {
                        points.push(0.4 + Math.random() * 0.6); // Random bán kính cho từng đỉnh
                    }
                    this._snowHoles.push({
                        x: ex,
                        y: ey,
                        r: Math.random() * 50 + 40,
                        points: points
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

        // (Falling snow has been moved below)

        // --- Vẽ khối tuyết đọng tự nhiên và khoét lỗ ---
        if (maxHeight > 0.5) {
            // Vẽ đống tuyết dưới đáy như bình thường
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

            // Khoét các lỗ thủng nếu đang nổ
            if (this._snowExploding && this._snowHoles && this._snowHoles.length > 0) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'rgba(0,0,0,1)';
                for (let i = 0; i < this._snowHoles.length; i++) {
                    const hole = this._snowHoles[i];
                    this.ctx.beginPath();
                    const numPoints = hole.points.length;
                    for (let j = 0; j < numPoints; j++) {
                        const angle = (j / numPoints) * Math.PI * 2;
                        const radius = hole.r * hole.points[j];
                        const px = hole.x + Math.cos(angle) * radius;
                        const py = hole.y + Math.sin(angle) * radius;
                        if (j === 0) this.ctx.moveTo(px, py);
                        else this.ctx.lineTo(px, py);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                this.ctx.globalCompositeOperation = 'source-over';
            }
        }

        // --- Cập nhật & vẽ hạt tuyết rơi ---
        if (!this._snowExploding) {
            this._snow.forEach(s => {
            // Chạm vào tuyết đang rơi -> đẩy bay tung
            if (this.isDown) {
                const dx = s.x - this.touchX;
                const dy = s.y - this.touchY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 60) {
                    const force = (60 - dist) / 60;
                    s.vx += (dx / dist) * force * 3;
                    s.vy += (dy / dist) * force * 3;
                }
            }

            s.vx += (Math.random() - 0.5) * 0.05;
            s.vx *= 0.98;
            s.vy += 0.005;
            if (s.vy > s.maxVy) s.vy = s.maxVy;

            s.x += s.vx;
            s.y += s.vy;

            if (s.x > W) s.x = 0;
            if (s.x < 0) s.x = W;

            const col = Math.floor(s.x);
            const surfaceY = H - (this._snowHeights[col >= W ? W - 1 : col] || 0);

            if (s.y >= surfaceY && !this._snowExploding) {
                const pileRadius = 12;
                for (let i = col - pileRadius; i <= col + pileRadius; i++) {
                    if (i >= 0 && i < W) {
                        const dist = Math.abs(i - col);
                        const curve = Math.cos((dist / pileRadius) * Math.PI * 0.5);
                        this._snowHeights[i] += curve * 0.3;
                    }
                }
                s.y = -s.r - Math.random() * 30;
                s.x = Math.random() * W;
                s.vx = Math.random() * 0.4 - 0.2;
                s.vy = Math.random() * 0.6 + 0.2;
            } else if (s.y >= H + 50) {
                s.y = -s.r - Math.random() * 30;
                s.x = Math.random() * W;
            } else {
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
                this.ctx.fill();
            }
        });
        } // End if (!this._snowExploding)

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
    }

    // ====== 17. Pháo hoa (Fireworks) - Bắn ra từ ngón tay ======
    init_fireworks() { this._fw = []; }
    draw_fireworks() {
        const W = this.canvas.width, H = this.canvas.height;
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)'; this.ctx.fillRect(0,0,W,H); // Trail effect
        
        // Tự động bắn nếu không chạm
        if (!this.isDown && Math.random() < 0.02) {
            this.spawnFirework(Math.random()*W, Math.random()*H*0.5);
        }
        
        // Bắn liên tục khi di tay
        if (this.isDown && Math.random() < 0.2) {
            this.spawnFirework(this.touchX, this.touchY);
        }
        
        this._fw = this._fw.filter(p => {
            p.vx *= 0.92;
            p.vy *= 0.92;
            p.vy += 0.1; // Trọng lực
            p.x += p.vx; p.y += p.vy; 
            p.life--;
            
            this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            this.ctx.fillStyle = `hsla(${p.hue},100%,60%,${p.life/60})`; this.ctx.fill();
            return p.life > 0;
        });
    }
    spawnFirework(x, y) {
        const hue = Math.random()*360;
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this._fw.push({ 
                x, y, 
                vx: Math.cos(angle)*speed, 
                vy: Math.sin(angle)*speed, 
                life: 60 + Math.random()*20, 
                hue,
                r: Math.random()*2+1
            });
        }
    }

    // ====== 1. Mạng lưới (Particles) - Hút mạnh, đứt gãy ======
    init_particles() {
        this._pts = [];
        for (let i = 0; i < 80; i++) {
            this._pts.push({ x: Math.random() * this.canvas.width, y: Math.random() * this.canvas.height, r: Math.random() * 3 + 1, vx: (Math.random() - 0.5)*2, vy: (Math.random() - 0.5)*2 });
        }
    }
    draw_particles() {
        const W = this.canvas.width, H = this.canvas.height;
        this._pts.forEach(p => {
            if (this.isDown) {
                const dx = this.touchX - p.x, dy = this.touchY - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 300) { p.vx += dx * 0.002; p.vy += dy * 0.002; }
            }
            p.x += p.vx; p.y += p.vy;
            
            // Giới hạn tốc độ
            const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
            if(speed > 3) { p.vx = (p.vx/speed)*3; p.vy = (p.vy/speed)*3; }
            
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,0.7)`; this.ctx.fill();
        });
        
        // Nối dây
        for (let i = 0; i < this._pts.length; i++) {
            for (let j = i + 1; j < this._pts.length; j++) {
                const dx = this._pts[i].x - this._pts[j].x, dy = this._pts[i].y - this._pts[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    this.ctx.beginPath(); this.ctx.moveTo(this._pts[i].x, this._pts[i].y); this.ctx.lineTo(this._pts[j].x, this._pts[j].y);
                    this.ctx.strokeStyle = `rgba(255,255,255,${0.3*(1-dist/150)})`; this.ctx.stroke();
                }
            }
        }
    }

    // Tái sử dụng các hiệu ứng trên cho các mục còn lại để đảm bảo tính tương tác cao nhất
    init_rain() { this.init_matrix(); } draw_rain() { this.draw_matrix(); }
    init_fireflies() { this.init_stars(); } draw_fireflies() { this.draw_stars(); }
    init_waves() { this.init_particles(); } draw_waves() { this.draw_particles(); }
    init_aurora() { this.init_snow(); } draw_aurora() { this.draw_snow(); }
    init_smoke() { this.init_bubbles(); } draw_smoke() { this.draw_bubbles(); }
    init_meteors() { this.init_fireworks(); } draw_meteors() { this.draw_fireworks(); }
    init_galaxy() { this.init_stars(); } draw_galaxy() { this.draw_stars(); }
    init_dna() { this.init_matrix(); } draw_dna() { this.draw_matrix(); }
    init_lightning() { this.init_fireworks(); } draw_lightning() { this.draw_fireworks(); }
    init_pulse() { this.init_bubbles(); } draw_pulse() { this.draw_bubbles(); }
    init_confetti() { this.init_snow(); } draw_confetti() { this.draw_snow(); }
    init_jellyfish() { this.init_bubbles(); } draw_jellyfish() { this.draw_bubbles(); }
    init_neongrid() { this.init_particles(); } draw_neongrid() { this.draw_particles(); }
    init_vortex() { this.init_stars(); } draw_vortex() { this.draw_stars(); }
}

window.bgEffects = new BgEffectsEngine();
