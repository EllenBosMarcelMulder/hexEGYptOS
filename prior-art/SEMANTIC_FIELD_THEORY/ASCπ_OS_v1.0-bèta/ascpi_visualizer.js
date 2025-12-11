/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ VISUALIZER v1.0
 * Enhanced Field Visualization System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Zoomable/pannable canvas
 * - Vector field renderer
 * - Phase histogram
 * - Coherence heatmap
 * - M∞ orbit visualizer
 * - Particle system
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CONST = {
    phi: (1 + Math.sqrt(5)) / 2,
    pi: Math.PI,
    tau: 2 * Math.PI
};

const COLORS = {
    bg: '#0a0a0f',
    surface: '#12121a',
    border: '#2a2a35',
    text: '#e8e8f0',
    muted: '#888899',
    phi: '#f4a261',
    kappa: '#2a9d8f',
    theta: '#9b5de5',
    energy: '#00d4ff',
    coherence: '#7fff00',
    maat: '#ff6b6b'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORM MANAGER (Zoom/Pan)
// ═══════════════════════════════════════════════════════════════════════════════

class Transform {
    constructor() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.minScale = 0.25;
        this.maxScale = 4;
    }
    
    reset() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    zoom(delta, centerX, centerY) {
        const oldScale = this.scale;
        this.scale *= delta > 0 ? 1.1 : 0.9;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale));
        
        // Zoom toward cursor
        const scaleChange = this.scale / oldScale;
        this.offsetX = centerX - (centerX - this.offsetX) * scaleChange;
        this.offsetY = centerY - (centerY - this.offsetY) * scaleChange;
    }
    
    pan(dx, dy) {
        this.offsetX += dx;
        this.offsetY += dy;
    }
    
    apply(ctx) {
        ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
    }
    
    screenToWorld(x, y) {
        return {
            x: (x - this.offsetX) / this.scale,
            y: (y - this.offsetY) / this.scale
        };
    }
    
    worldToScreen(x, y) {
        return {
            x: x * this.scale + this.offsetX,
            y: y * this.scale + this.offsetY
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

class ParticleSystem {
    constructor(count = 150) {
        this.particles = [];
        this.count = count;
    }
    
    init(width, height) {
        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            this.particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                theta: Math.random() * CONST.tau,
                energy: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3,
                hue: Math.random() * 60 + 240
            });
        }
    }
    
    update(psi, width, height, centerX, centerY) {
        this.particles.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Kuramoto-like coupling
            const influence = psi.C * 0.1 / (1 + dist * 0.01);
            p.theta += 0.5 * Math.sin(psi.theta - p.theta) * influence;
            p.theta %= CONST.tau;
            
            // Movement
            const speed = p.energy * (1 + psi.kappa * 0.5);
            p.x += Math.cos(p.theta) * speed;
            p.y += Math.sin(p.theta) * speed;
            
            // Wrap
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            // Update hue based on phase
            p.hue = ((p.theta / CONST.tau) * 60 + 240) % 360;
        });
    }
    
    render(ctx, psi) {
        this.particles.forEach(p => {
            const alpha = 0.3 + psi.C * 0.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.5 + psi.C), 0, CONST.tau);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${alpha})`;
            ctx.fill();
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR FIELD RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

class VectorFieldRenderer {
    constructor(gridSize = 20) {
        this.gridSize = gridSize;
        this.arrows = [];
    }
    
    update(psi, mInf, width, height) {
        this.arrows = [];
        const spacing = Math.max(width, height) / this.gridSize;
        
        for (let x = spacing / 2; x < width; x += spacing) {
            for (let y = spacing / 2; y < height; y += spacing) {
                // Calculate field influence at this point
                const cx = width / 2;
                const cy = height / 2;
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Phase-based direction with radial falloff
                const influence = psi.C / (1 + dist * 0.005);
                const angle = psi.theta + Math.atan2(dy, dx) * 0.3;
                
                // Arrow toward attractor (memory)
                const towardAttractor = Math.atan2(cy - y, cx - x);
                const finalAngle = angle * (1 - influence * 0.3) + towardAttractor * influence * 0.3;
                
                const magnitude = influence * spacing * 0.4;
                
                this.arrows.push({
                    x, y,
                    dx: Math.cos(finalAngle) * magnitude,
                    dy: Math.sin(finalAngle) * magnitude,
                    intensity: influence
                });
            }
        }
    }
    
    render(ctx) {
        ctx.lineWidth = 1;
        
        this.arrows.forEach(arrow => {
            const alpha = 0.2 + arrow.intensity * 0.6;
            ctx.strokeStyle = `rgba(155, 93, 229, ${alpha})`;
            ctx.fillStyle = ctx.strokeStyle;
            
            ctx.beginPath();
            ctx.moveTo(arrow.x, arrow.y);
            ctx.lineTo(arrow.x + arrow.dx, arrow.y + arrow.dy);
            ctx.stroke();
            
            // Arrow head
            const angle = Math.atan2(arrow.dy, arrow.dx);
            const headSize = 4 + arrow.intensity * 4;
            ctx.beginPath();
            ctx.moveTo(arrow.x + arrow.dx, arrow.y + arrow.dy);
            ctx.lineTo(
                arrow.x + arrow.dx - headSize * Math.cos(angle - 0.5),
                arrow.y + arrow.dy - headSize * Math.sin(angle - 0.5)
            );
            ctx.lineTo(
                arrow.x + arrow.dx - headSize * Math.cos(angle + 0.5),
                arrow.y + arrow.dy - headSize * Math.sin(angle + 0.5)
            );
            ctx.closePath();
            ctx.fill();
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE HISTOGRAM
// ═══════════════════════════════════════════════════════════════════════════════

class PhaseHistogram {
    constructor(bins = 36) {
        this.bins = bins;
        this.data = new Array(bins).fill(0);
        this.history = [];
        this.maxHistory = 100;
    }
    
    addPhase(theta) {
        // Normalize to [0, tau)
        theta = ((theta % CONST.tau) + CONST.tau) % CONST.tau;
        const bin = Math.floor(theta / CONST.tau * this.bins) % this.bins;
        
        this.history.push(bin);
        if (this.history.length > this.maxHistory) {
            const oldBin = this.history.shift();
            this.data[oldBin] = Math.max(0, this.data[oldBin] - 1);
        }
        this.data[bin]++;
    }
    
    render(ctx, x, y, width, height) {
        const maxVal = Math.max(...this.data, 1);
        const barWidth = width / this.bins;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Bars
        this.data.forEach((val, i) => {
            const barHeight = (val / maxVal) * height * 0.9;
            const hue = (i / this.bins) * 60 + 240;
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.fillRect(
                x + i * barWidth + 1,
                y + height - barHeight,
                barWidth - 2,
                barHeight
            );
        });
        
        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.strokeRect(x, y, width, height);
        
        // Label
        ctx.fillStyle = COLORS.muted;
        ctx.font = '10px monospace';
        ctx.fillText('Phase Distribution', x + 4, y + 12);
    }
    
    clear() {
        this.data.fill(0);
        this.history = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COHERENCE HEATMAP
// ═══════════════════════════════════════════════════════════════════════════════

class CoherenceHeatmap {
    constructor(resolution = 32) {
        this.resolution = resolution;
        this.data = [];
        this.history = [];
        this.maxHistory = 50;
    }
    
    update(psi, width, height) {
        // Store coherence as radial pattern from center
        const cx = width / 2;
        const cy = height / 2;
        const cellW = width / this.resolution;
        const cellH = height / this.resolution;
        
        this.data = [];
        for (let i = 0; i < this.resolution; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.resolution; j++) {
                const x = (i + 0.5) * cellW;
                const y = (j + 0.5) * cellH;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const maxDist = Math.sqrt(cx * cx + cy * cy);
                
                // Coherence falls off from center
                const baseC = psi.C * (1 - dist / maxDist * 0.7);
                // Add phase modulation
                const angle = Math.atan2(y - cy, x - cx);
                const phaseEffect = 0.1 * Math.cos(angle - psi.theta);
                
                this.data[i][j] = Math.max(0, Math.min(1, baseC + phaseEffect));
            }
        }
    }
    
    render(ctx, x, y, width, height) {
        const cellW = width / this.resolution;
        const cellH = height / this.resolution;
        
        for (let i = 0; i < this.resolution; i++) {
            for (let j = 0; j < this.resolution; j++) {
                const val = this.data[i] ? this.data[i][j] || 0 : 0;
                
                // Green to yellow gradient based on coherence
                const hue = 60 + val * 60; // 60 (yellow) to 120 (green)
                const lightness = 20 + val * 40;
                const alpha = 0.3 + val * 0.5;
                
                ctx.fillStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
                ctx.fillRect(x + i * cellW, y + j * cellH, cellW, cellH);
            }
        }
        
        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.strokeRect(x, y, width, height);
        
        // Label
        ctx.fillStyle = COLORS.muted;
        ctx.font = '10px monospace';
        ctx.fillText('Coherence Field', x + 4, y + 12);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// M∞ ORBIT VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════════

class OrbitVisualizer {
    constructor(maxPoints = 200) {
        this.maxPoints = maxPoints;
        this.currentOrbit = [];
        this.memoryOrbit = [];
        this.awarenessOrbit = [];
    }
    
    addPoint(psi, mInf, awareness) {
        // Project 5D to 2D using phase and coherence
        const projectPoint = (field) => ({
            x: field.theta / CONST.tau,  // 0-1
            y: field.C,                   // 0-1
            kappa: field.kappa
        });
        
        this.currentOrbit.push(projectPoint(psi));
        this.memoryOrbit.push(projectPoint(mInf));
        this.awarenessOrbit.push(projectPoint(awareness));
        
        // Limit size
        if (this.currentOrbit.length > this.maxPoints) {
            this.currentOrbit.shift();
            this.memoryOrbit.shift();
            this.awarenessOrbit.shift();
        }
    }
    
    render(ctx, x, y, width, height) {
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const gx = x + (i / 4) * width;
            const gy = y + (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx, y + height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + width, gy);
            ctx.stroke();
        }
        
        // Draw orbits
        const drawOrbit = (orbit, color, label) => {
            if (orbit.length < 2) return;
            
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            
            orbit.forEach((p, i) => {
                const px = x + p.x * width;
                const py = y + height - p.y * height;
                const alpha = (i / orbit.length) * 0.8 + 0.2;
                
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });
            ctx.stroke();
            
            // Current point
            if (orbit.length > 0) {
                const last = orbit[orbit.length - 1];
                const px = x + last.x * width;
                const py = y + height - last.y * height;
                
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, CONST.tau);
                ctx.fillStyle = color;
                ctx.fill();
            }
        };
        
        drawOrbit(this.memoryOrbit, COLORS.kappa, 'M∞');
        drawOrbit(this.awarenessOrbit, COLORS.theta, 'Ψ_a');
        drawOrbit(this.currentOrbit, COLORS.coherence, 'Ψ');
        
        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Labels
        ctx.fillStyle = COLORS.muted;
        ctx.font = '10px monospace';
        ctx.fillText('Phase-Coherence Orbit', x + 4, y + 12);
        
        // Axis labels
        ctx.fillStyle = COLORS.muted;
        ctx.font = '8px monospace';
        ctx.fillText('θ→', x + width - 20, y + height - 4);
        ctx.fillText('C↑', x + 4, y + 24);
        
        // Legend
        const legendY = y + height - 40;
        ctx.fillStyle = COLORS.coherence;
        ctx.fillRect(x + 4, legendY, 10, 10);
        ctx.fillStyle = COLORS.text;
        ctx.fillText('Ψ', x + 18, legendY + 8);
        
        ctx.fillStyle = COLORS.kappa;
        ctx.fillRect(x + 34, legendY, 10, 10);
        ctx.fillStyle = COLORS.text;
        ctx.fillText('M∞', x + 48, legendY + 8);
        
        ctx.fillStyle = COLORS.theta;
        ctx.fillRect(x + 74, legendY, 10, 10);
        ctx.fillStyle = COLORS.text;
        ctx.fillText('Ψₐ', x + 88, legendY + 8);
    }
    
    clear() {
        this.currentOrbit = [];
        this.memoryOrbit = [];
        this.awarenessOrbit = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════════

class FieldVisualizer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.options = {
            showParticles: true,
            showVectorField: true,
            showPhaseHistogram: true,
            showCoherenceHeatmap: false,
            showOrbit: true,
            showPhaseVector: true,
            showGlyph: true,
            particleCount: 150,
            ...options
        };
        
        // Components
        this.transform = new Transform();
        this.particles = new ParticleSystem(this.options.particleCount);
        this.vectorField = new VectorFieldRenderer(15);
        this.phaseHistogram = new PhaseHistogram(36);
        this.coherenceHeatmap = new CoherenceHeatmap(24);
        this.orbit = new OrbitVisualizer(200);
        
        // State
        this.running = false;
        this.runtime = null;
        this.animationId = null;
        
        // Mouse state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this._bindEvents();
    }
    
    _bindEvents() {
        // Wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.transform.zoom(e.deltaY, x, y);
        });
        
        // Pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.transform.pan(dx, dy);
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        // Double-click to reset
        this.canvas.addEventListener('dblclick', () => {
            this.transform.reset();
        });
    }
    
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.particles.init(this.canvas.width, this.canvas.height);
    }
    
    attach(runtime) {
        this.runtime = runtime;
        this.resize();
        
        // Listen for process events
        runtime.on('process', (result) => {
            this.phaseHistogram.addPhase(result.psi.theta);
            this.orbit.addPoint(
                result.psi,
                runtime.memory.mInf,
                runtime.awareness.field
            );
        });
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.canvas.style.cursor = 'grab';
        this._render();
    }
    
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    _render() {
        if (!this.running) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Get current state
        const psi = this.runtime?.currentPsi || { dPhi: 0, kappa: 0.5, theta: 0, N: 1, C: 0.5 };
        const mInf = this.runtime?.memory?.mInf || psi;
        const awareness = this.runtime?.awareness?.field || psi;
        
        // Clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, width, height);
        
        // Apply transform for main content
        this.transform.apply(ctx);
        
        // Coherence gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        gradient.addColorStop(0, `rgba(127, 255, 0, ${psi.C * 0.15})`);
        gradient.addColorStop(0.5, `rgba(155, 93, 229, ${psi.C * 0.1})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Coherence heatmap (behind everything)
        if (this.options.showCoherenceHeatmap) {
            this.coherenceHeatmap.update(psi, width, height);
            this.coherenceHeatmap.render(ctx, 0, 0, width, height);
        }
        
        // Vector field
        if (this.options.showVectorField) {
            this.vectorField.update(psi, mInf, width, height);
            this.vectorField.render(ctx);
        }
        
        // Particles
        if (this.options.showParticles) {
            this.particles.update(psi, width, height, centerX, centerY);
            this.particles.render(ctx, psi);
        }
        
        // Phase vector
        if (this.options.showPhaseVector) {
            const vecLen = 80 * (1 + psi.N * 0.5);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(psi.theta) * vecLen, centerY + Math.sin(psi.theta) * vecLen);
            ctx.strokeStyle = `rgba(244, 162, 97, ${0.5 + psi.C * 0.5})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Arrow head
            const angle = psi.theta;
            const headLen = 15;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * vecLen, centerY + Math.sin(angle) * vecLen);
            ctx.lineTo(
                centerX + Math.cos(angle) * vecLen - headLen * Math.cos(angle - 0.4),
                centerY + Math.sin(angle) * vecLen - headLen * Math.sin(angle - 0.4)
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * vecLen - headLen * Math.cos(angle + 0.4),
                centerY + Math.sin(angle) * vecLen - headLen * Math.sin(angle + 0.4)
            );
            ctx.closePath();
            ctx.fillStyle = COLORS.phi;
            ctx.fill();
        }
        
        // Center glyph
        if (this.options.showGlyph) {
            ctx.font = '48px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + psi.C * 0.7})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Ψ', centerX, centerY);
        }
        
        // Reset transform for overlays
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Phase histogram (top-right)
        if (this.options.showPhaseHistogram) {
            this.phaseHistogram.render(ctx, width - 180, 10, 170, 80);
        }
        
        // Orbit visualizer (bottom-right)
        if (this.options.showOrbit) {
            this.orbit.render(ctx, width - 180, height - 150, 170, 140);
        }
        
        // Zoom indicator
        if (this.transform.scale !== 1) {
            ctx.fillStyle = COLORS.muted;
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Zoom: ${(this.transform.scale * 100).toFixed(0)}%`, 10, height - 10);
        }
        
        this.animationId = requestAnimationFrame(() => this._render());
    }
    
    setOption(key, value) {
        this.options[key] = value;
        
        if (key === 'particleCount') {
            this.particles = new ParticleSystem(value);
            this.particles.init(this.canvas.width, this.canvas.height);
        }
    }
    
    clear() {
        this.phaseHistogram.clear();
        this.orbit.clear();
    }
    
    // Export current frame as image
    exportImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI VISUALIZERS (for panels)
// ═══════════════════════════════════════════════════════════════════════════════

class MiniCoherenceMeter {
    static render(ctx, x, y, width, height, coherence) {
        // Background
        ctx.fillStyle = COLORS.surface;
        ctx.fillRect(x, y, width, height);
        
        // Fill
        const fillWidth = coherence * width;
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, COLORS.maat);
        gradient.addColorStop(0.5, COLORS.phi);
        gradient.addColorStop(1, COLORS.coherence);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, fillWidth, height);
        
        // Border
        ctx.strokeStyle = COLORS.border;
        ctx.strokeRect(x, y, width, height);
        
        // Value
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${(coherence * 100).toFixed(0)}%`, x + width / 2, y + height / 2 + 4);
    }
}

class MiniPhaseDial {
    static render(ctx, x, y, radius, theta, coherence) {
        // Background circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, CONST.tau);
        ctx.fillStyle = COLORS.surface;
        ctx.fill();
        ctx.strokeStyle = COLORS.border;
        ctx.stroke();
        
        // Phase arc
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, -CONST.pi / 2, theta - CONST.pi / 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(155, 93, 229, ${0.3 + coherence * 0.5})`;
        ctx.fill();
        
        // Phase line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(theta - CONST.pi / 2) * radius,
            y + Math.sin(theta - CONST.pi / 2) * radius
        );
        ctx.strokeStyle = COLORS.theta;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Center dot
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, CONST.tau);
        ctx.fillStyle = COLORS.text;
        ctx.fill();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Transform,
        ParticleSystem,
        VectorFieldRenderer,
        PhaseHistogram,
        CoherenceHeatmap,
        OrbitVisualizer,
        FieldVisualizer,
        MiniCoherenceMeter,
        MiniPhaseDial,
        COLORS
    };
}

if (typeof window !== 'undefined') {
    window.ASCPIVisualizer = {
        Transform,
        ParticleSystem,
        VectorFieldRenderer,
        PhaseHistogram,
        CoherenceHeatmap,
        OrbitVisualizer,
        FieldVisualizer,
        MiniCoherenceMeter,
        MiniPhaseDial,
        COLORS
    };
}
