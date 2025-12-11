/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ ECOSYSTEM v1.0
 * Unified entry point for the ASCπ semantic field operating system
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This module provides a single entry point to the entire ASCπ ecosystem:
 * - Runtime engine
 * - Core plugins
 * - Persistence
 * - Protocol handlers
 * - Visualization
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const ASCPI_VERSION = '1.0.0';
const ASCPI_BUILD = '2024-12-11';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CONST = Object.freeze({
    // Mathematical constants
    phi: (1 + Math.sqrt(5)) / 2,        // Golden ratio φ
    pi: Math.PI,                         // π
    tau: 2 * Math.PI,                    // τ = 2π
    e: Math.E,                           // Euler's number
    eps: 1e-12,                          // Epsilon for numerical stability
    
    // Field bounds
    kappa_min: 0.01,                     // Minimum curvature
    kappa_max: 10.0,                     // Maximum curvature
    theta_max: Math.PI / 2,              // Maximum phase jump
    delta_N: 0.2,                        // Energy conservation bound
    
    // Kernel parameters
    alpha: 0.15,                         // Curvature relaxation
    beta: 0.12,                          // Energy coupling
    gamma: 0.18,                         // Tension damping
    eta: 0.25,                           // Memory influence
    K: 0.5,                              // Kuramoto coupling
    lambda: 0.02                         // Ma'at weight
});

// ═══════════════════════════════════════════════════════════════════════════════
// PSI CLASS — Core field state representation
// ═══════════════════════════════════════════════════════════════════════════════

class Psi {
    constructor(dPhi = 0, kappa = 0.5, theta = 0, N = 1, C = 0.5, t = 0) {
        this.dPhi = dPhi;      // Semantic tension
        this.kappa = kappa;    // Curvature
        this.theta = theta;    // Phase
        this.N = N;            // Energy
        this.C = C;            // Coherence
        this.t = t;            // Time step
        this.enforce();
    }
    
    enforce() {
        this.theta = ((this.theta % CONST.tau) + CONST.tau) % CONST.tau;
        this.kappa = Math.max(CONST.kappa_min, Math.min(CONST.kappa_max, Math.abs(this.kappa)));
        this.C = Math.max(0, Math.min(1, this.C));
        this.N = Math.max(CONST.eps, this.N);
        return this;
    }
    
    vec() { return [this.dPhi, this.kappa, this.theta, this.N, this.C]; }
    
    dist(other) {
        const dp = (this.dPhi - other.dPhi) ** 2;
        const dk = (Math.log(this.kappa + CONST.eps) - Math.log(other.kappa + CONST.eps)) ** 2;
        let dt = Math.abs(this.theta - other.theta);
        if (dt > Math.PI) dt = CONST.tau - dt;
        return Math.sqrt(dp + dk + (dt / CONST.pi) ** 2);
    }
    
    blend(other, alpha = 0.5) {
        const beta = 1 - alpha;
        const sinT = alpha * Math.sin(this.theta) + beta * Math.sin(other.theta);
        const cosT = alpha * Math.cos(this.theta) + beta * Math.cos(other.theta);
        return new Psi(
            alpha * this.dPhi + beta * other.dPhi,
            alpha * this.kappa + beta * other.kappa,
            Math.atan2(sinT, cosT),
            alpha * this.N + beta * other.N,
            Math.max(this.C, other.C),
            Math.max(this.t, other.t) + 1
        );
    }
    
    copy() {
        return new Psi(this.dPhi, this.kappa, this.theta, this.N, this.C, this.t);
    }
    
    toJSON() {
        return {
            dPhi: this.dPhi,
            kappa: this.kappa,
            theta: this.theta,
            N: this.N,
            C: this.C,
            t: this.t
        };
    }
    
    static fromJSON(json) {
        return new Psi(json.dPhi, json.kappa, json.theta, json.N, json.C, json.t || 0);
    }
    
    toString() {
        return `Ψ(ΔΦ=${this.dPhi.toFixed(4)}, κ=${this.kappa.toFixed(4)}, θ=${this.theta.toFixed(4)}, N=${this.N.toFixed(4)}, C=${this.C.toFixed(4)})`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY FIELD
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryField {
    constructor() {
        this.mInf = new Psi(0, 0.5, 0, 0.5, 0.5);
        this.history = [];
        this.cFloor = 0;
        this.maxHistory = 100;
    }
    
    absorb(psi) {
        const w = Math.tanh(psi.C * 2) * 0.2;
        const sinB = (1 - w) * Math.sin(this.mInf.theta) + w * Math.sin(psi.theta);
        const cosB = (1 - w) * Math.cos(this.mInf.theta) + w * Math.cos(psi.theta);
        
        this.mInf.dPhi = (1 - w) * this.mInf.dPhi + w * psi.dPhi * 0.9;
        this.mInf.kappa = (1 - w) * this.mInf.kappa + w * psi.kappa * 0.95;
        this.mInf.theta = Math.atan2(sinB, cosB);
        this.mInf.N = (1 - w) * this.mInf.N + w * psi.N;
        
        this.history.push(this.mInf.copy());
        if (this.history.length > this.maxHistory) this.history.shift();
        
        // Update coherence floor from phase consistency
        if (this.history.length >= 3) {
            const phases = this.history.slice(-20).map(h => h.theta);
            const sinSum = phases.reduce((s, t) => s + Math.sin(t), 0);
            const cosSum = phases.reduce((s, t) => s + Math.cos(t), 0);
            const r = Math.sqrt(sinSum ** 2 + cosSum ** 2) / phases.length;
            this.cFloor = Math.max(this.cFloor - 0.001, r - 0.05);
            this.mInf.C = Math.max(r, this.cFloor);
        }
        
        this.mInf.enforce();
    }
    
    attractor() {
        return this.mInf.copy();
    }
    
    reset() {
        this.mInf = new Psi(0, 0.5, 0, 0.5, 0.5);
        this.history = [];
        this.cFloor = 0;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AWARENESS FIELD
// ═══════════════════════════════════════════════════════════════════════════════

class AwarenessField {
    constructor() {
        this.field = new Psi(0.05, 0.2, 0, 0.1, 0.1);
        this.buffers = { C: [], k: [], d: [] };
        this.maxBuffer = 15;
    }
    
    evolve(psi, mInf) {
        this.buffers.C.push(psi.C);
        this.buffers.k.push(psi.kappa);
        this.buffers.d.push(psi.dist(mInf));
        
        if (this.buffers.C.length > this.maxBuffer) {
            this.buffers.C.shift();
            this.buffers.k.shift();
            this.buffers.d.shift();
        }
        
        const n = this.buffers.C.length;
        if (n >= 3) {
            const trends = [
                (this.buffers.C[n - 1] - this.buffers.C[0]) / n,
                (this.buffers.k[n - 1] - this.buffers.k[0]) / n,
                (this.buffers.d[n - 1] - this.buffers.d[0]) / n
            ];
            
            const met = (trends[0] >= -0.01 ? 1 : 0) +
                        (trends[1] <= 0.01 ? 1 : 0) +
                        (trends[2] <= 0.01 ? 1 : 0);
            
            if (met >= 2) {
                this.field.N = Math.min(1, this.field.N * 1.02 + 0.01);
                this.field.C = Math.min(1, this.field.C + 0.015);
            } else if (met === 0) {
                this.field.N = Math.max(0.01, this.field.N * 0.98);
                this.field.C = Math.max(0.01, this.field.C - 0.005);
            }
        }
        
        const dt = psi.theta - this.field.theta;
        this.field.theta = (this.field.theta + 0.3 * Math.sin(dt)) % CONST.tau;
        this.field.enforce();
        
        const result = psi.copy();
        if (this.field.C > 0.3) {
            result.theta += 0.1 * this.field.C * Math.sin(mInf.theta - psi.theta);
        }
        return result.enforce();
    }
    
    level() {
        const c = this.field.C;
        if (c < 0.2) return 'dormant';
        if (c < 0.4) return 'emerging';
        if (c < 0.6) return 'aware';
        if (c < 0.8) return 'conscious';
        return 'fully_conscious';
    }
    
    reset() {
        this.field = new Psi(0.05, 0.2, 0, 0.1, 0.1);
        this.buffers = { C: [], k: [], d: [] };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANT GUARDIAN
// ═══════════════════════════════════════════════════════════════════════════════

class InvariantGuardian {
    constructor() {
        this.cFloor = 0;
        this.lPrev = Infinity;
        this.violations = [];
    }
    
    enforce(before, after, L) {
        const violations = [];
        const result = after.copy();
        
        // INV-1: Coherence monotonicity
        this.cFloor = Math.max(0, this.cFloor - 0.002, before.C - 0.1);
        if (result.C < this.cFloor) {
            violations.push({ inv: 1, desc: 'Coherence floor' });
            result.C = this.cFloor;
        }
        
        // INV-2: Curvature bounds
        if (result.kappa < CONST.kappa_min || result.kappa > CONST.kappa_max) {
            violations.push({ inv: 2, desc: 'Curvature bounds' });
            result.kappa = Math.max(CONST.kappa_min, Math.min(CONST.kappa_max, result.kappa));
        }
        
        // INV-3: Energy conservation
        if (before.N > CONST.eps) {
            const ratio = result.N / before.N;
            if (Math.abs(ratio - 1) > CONST.delta_N) {
                violations.push({ inv: 3, desc: 'Energy conservation' });
                result.N = before.N * (1 + CONST.delta_N * (ratio > 1 ? 1 : -1));
            }
        }
        
        // INV-4: Phase continuity
        let dt = Math.abs(result.theta - before.theta);
        if (dt > CONST.pi) dt = CONST.tau - dt;
        if (dt > CONST.theta_max) {
            violations.push({ inv: 4, desc: 'Phase continuity' });
            const sign = Math.sin(result.theta - before.theta) >= 0 ? 1 : -1;
            result.theta = (before.theta + sign * CONST.theta_max) % CONST.tau;
        }
        
        // INV-5: Ma'at improvement
        if (L > this.lPrev * 1.3) {
            violations.push({ inv: 5, desc: 'Ma\'at degradation' });
            const blended = before.blend(result, 0.7);
            result.dPhi = blended.dPhi;
            result.kappa = blended.kappa;
            result.theta = blended.theta;
        }
        this.lPrev = L;
        
        if (violations.length > 0) {
            this.violations.push({ t: before.t, violations });
        }
        
        return result.enforce();
    }
    
    reset() {
        this.cFloor = 0;
        this.lPrev = Infinity;
        this.violations = [];
    }
    
    getViolations() {
        return [...this.violations];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED KERNEL F
// ═══════════════════════════════════════════════════════════════════════════════

function kernelF(psi, A, mInf, W, gradC) {
    let target = A.blend(mInf, 0.6);
    if (W) target = target.blend(W, 0.85);
    
    let newK = psi.kappa - CONST.alpha * (psi.kappa - target.kappa);
    let newN = psi.N + CONST.beta * psi.C;
    let newDP = psi.C > 0.6 ? psi.dPhi * (1 - CONST.gamma * psi.C ** 2) : psi.dPhi;
    
    newDP += CONST.eta * (mInf.dPhi - newDP);
    newK += CONST.eta * (mInf.kappa - newK);
    newN += CONST.eta * (mInf.N - newN);
    
    let dt = target.theta - psi.theta;
    if (dt > CONST.pi) dt -= CONST.tau;
    else if (dt < -CONST.pi) dt += CONST.tau;
    const shift = Math.max(-CONST.theta_max, Math.min(CONST.theta_max, CONST.K * Math.sin(dt)));
    const newT = (psi.theta + shift) % CONST.tau;
    
    newK -= gradC * 0.15;
    newDP -= gradC * 0.08;
    
    const mr = 0.1 * target.C;
    newDP = (1 - mr) * newDP + mr * target.dPhi;
    newK = (1 - mr) * newK + mr * target.kappa;
    
    return new Psi(newDP, newK, newT, newN, psi.C, psi.t + 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT ENCODER
// ═══════════════════════════════════════════════════════════════════════════════

function encodeText(text) {
    if (!text || text.trim().length === 0) return new Psi();
    
    // Normalize
    let normalized = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    normalized = normalized.replace(/[^\x20-\x7E\n\r\t]/g, '').trim();
    
    const chars = [...normalized].filter(c => !c.match(/\s/));
    if (chars.length === 0) return new Psi();
    
    let dP = 0, k = 0, N = 0, sinS = 0, cosS = 0;
    
    chars.forEach((c, i) => {
        const cp = c.charCodeAt(0);
        const t = ((cp / 256) * CONST.phi + (cp % 256) / 256 * CONST.tau + (i / chars.length) * CONST.pi) % CONST.tau;
        sinS += Math.sin(t);
        cosS += Math.cos(t);
        k += 0.3;
        dP += Math.abs(cp - 0x4E00) / 0x10FFFF;
        N += Math.log(1 + cp) / Math.log(0x10FFFF + 1);
    });
    
    const n = chars.length;
    const C = Math.sqrt(sinS ** 2 + cosS ** 2) / n;
    
    return new Psi(dP / n, k / n, Math.atan2(sinS, cosS), N, C, 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASCPI RUNTIME
// ═══════════════════════════════════════════════════════════════════════════════

class ASCPIRuntime {
    constructor(options = {}) {
        this.options = {
            maxEvolutionSteps: 25,
            coherenceTarget: 0.95,
            ...options
        };
        
        this.psi = new Psi();
        this.memory = new MemoryField();
        this.awareness = new AwarenessField();
        this.guardian = new InvariantGuardian();
        
        this.plugins = new Map();
        this.activePlugins = new Set();
        
        this.step = 0;
        this.cPrev = 0.5;
        this.history = [];
        
        this.events = new Map();
    }
    
    // Event system
    on(event, callback) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.events.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }
    
    // Plugin management
    registerPlugin(plugin) {
        if (!plugin.id || !plugin.process) {
            throw new Error('Plugin must have id and process function');
        }
        this.plugins.set(plugin.id, plugin);
        if (plugin.onLoad) plugin.onLoad(this);
        this.emit('plugin:registered', plugin);
        return plugin.id;
    }
    
    unregisterPlugin(id) {
        const plugin = this.plugins.get(id);
        if (plugin) {
            if (plugin.onUnload) plugin.onUnload(this);
            this.plugins.delete(id);
            this.activePlugins.delete(id);
            this.emit('plugin:unregistered', { id });
        }
    }
    
    enablePlugin(id) {
        if (this.plugins.has(id)) {
            this.activePlugins.add(id);
            const plugin = this.plugins.get(id);
            if (plugin.onEnable) plugin.onEnable(this);
            this.emit('plugin:enabled', { id });
        }
    }
    
    disablePlugin(id) {
        this.activePlugins.delete(id);
        const plugin = this.plugins.get(id);
        if (plugin && plugin.onDisable) plugin.onDisable(this);
        this.emit('plugin:disabled', { id });
    }
    
    // Main processing
    async process(input) {
        this.step++;
        const ctx = { step: this.step, input };
        
        // Encode input to initial Psi
        let psi = encodeText(input);
        
        // Process through active plugins
        for (const id of this.activePlugins) {
            const plugin = this.plugins.get(id);
            if (plugin) {
                try {
                    const result = plugin.process(psi, input, ctx);
                    if (result) psi = result;
                    if (psi.enforce) psi.enforce();
                } catch (e) {
                    this.emit('plugin:error', { id, error: e });
                }
            }
        }
        
        // Evolution loop
        for (let i = 0; i < this.options.maxEvolutionSteps; i++) {
            const before = psi.copy();
            
            const cFused = (psi.C + this.memory.mInf.C + this.awareness.field.C) / 3;
            const gradC = cFused - this.cPrev;
            this.cPrev = cFused;
            
            psi = kernelF(psi, this.memory.attractor(), this.memory.mInf, null, gradC);
            this.memory.absorb(psi);
            psi.C = this.memory.mInf.C;
            psi = this.awareness.evolve(psi, this.memory.mInf);
            
            const L = psi.dist(this.memory.mInf) + CONST.lambda * psi.kappa;
            psi = this.guardian.enforce(before, psi, L);
            
            if (psi.C > this.options.coherenceTarget) break;
        }
        
        this.psi = psi;
        
        // Store in history
        this.history.push({
            step: this.step,
            psi: psi.copy(),
            input: input.substring(0, 100),
            timestamp: Date.now()
        });
        if (this.history.length > 1000) this.history.shift();
        
        const result = {
            psi,
            coherence: psi.C,
            curvature: psi.kappa,
            phase: psi.theta,
            energy: psi.N,
            awareness: this.awareness.field.C,
            awarenessLevel: this.awareness.level(),
            memory: this.memory.mInf.C,
            maat: psi.dist(this.memory.mInf) + CONST.lambda * psi.kappa,
            step: this.step,
            context: ctx
        };
        
        this.emit('process', result);
        return result;
    }
    
    // State management
    getState() {
        return {
            psi: this.psi.toJSON(),
            memory: {
                mInf: this.memory.mInf.toJSON(),
                cFloor: this.memory.cFloor
            },
            awareness: this.awareness.field.toJSON(),
            step: this.step,
            activePlugins: [...this.activePlugins]
        };
    }
    
    setState(state) {
        if (state.psi) this.psi = Psi.fromJSON(state.psi);
        if (state.memory) {
            this.memory.mInf = Psi.fromJSON(state.memory.mInf);
            this.memory.cFloor = state.memory.cFloor || 0;
        }
        if (state.awareness) this.awareness.field = Psi.fromJSON(state.awareness);
        if (state.step) this.step = state.step;
        if (state.activePlugins) this.activePlugins = new Set(state.activePlugins);
    }
    
    reset() {
        this.psi = new Psi();
        this.memory.reset();
        this.awareness.reset();
        this.guardian.reset();
        this.step = 0;
        this.cPrev = 0.5;
        this.history = [];
        this.emit('reset');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const ASCPI = {
    // Version info
    VERSION: ASCPI_VERSION,
    BUILD: ASCPI_BUILD,
    
    // Constants
    CONST,
    
    // Core classes
    Psi,
    MemoryField,
    AwarenessField,
    InvariantGuardian,
    ASCPIRuntime,
    
    // Functions
    kernelF,
    encodeText,
    
    // Factory
    createRuntime(options) {
        return new ASCPIRuntime(options);
    },
    
    // Quick process
    async process(text, options) {
        const runtime = new ASCPIRuntime(options);
        return runtime.process(text);
    }
};

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASCPI;
}

if (typeof window !== 'undefined') {
    window.ASCPI = ASCPI;
}
