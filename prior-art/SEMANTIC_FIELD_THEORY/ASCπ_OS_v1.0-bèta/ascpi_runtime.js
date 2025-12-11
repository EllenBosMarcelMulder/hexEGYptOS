/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ RUNTIME v1.0
 * Event Loop, Scheduling, Tick Handlers, Async Energiebox Processing
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Core runtime engine for the ASCπ OS browser environment.
 * Manages the main event loop, kernel updates, and async processing.
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS (Canonical from v10.0)
// ═══════════════════════════════════════════════════════════════════════════════

const CONST = {
    phi: (1 + Math.sqrt(5)) / 2,
    pi: Math.PI,
    tau: 2 * Math.PI,
    eps: 1e-12,
    kappa_min: 0.01,
    kappa_max: 10.0,
    theta_max: Math.PI / 2,
    delta_N: 0.2,
    alpha: 0.15,
    beta: 0.12,
    gamma: 0.18,
    eta: 0.25,
    K: 0.5,
    lambda: 0.02
};

// ═══════════════════════════════════════════════════════════════════════════════
// PSI CLASS (Canonical Semantic Field)
// ═══════════════════════════════════════════════════════════════════════════════

class Psi {
    constructor(dPhi = 0, kappa = 1, theta = 0, N = 1, C = 0.5, t = 0) {
        this.dPhi = dPhi;
        this.kappa = kappa;
        this.theta = theta;
        this.N = N;
        this.C = C;
        this.t = t;
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
    
    dist(o) {
        const dp = (this.dPhi - o.dPhi) ** 2;
        const dk = (Math.log(this.kappa + CONST.eps) - Math.log(o.kappa + CONST.eps)) ** 2;
        const dt = Math.min(Math.abs(this.theta - o.theta), CONST.tau - Math.abs(this.theta - o.theta)) ** 2;
        return Math.sqrt(dp + dk + dt / CONST.pi ** 2);
    }
    
    inner(o) {
        return Math.cos(this.theta - o.theta) * Math.sqrt(this.N * o.N);
    }
    
    blend(o, a = 0.5) {
        const b = 1 - a;
        const sinT = a * Math.sin(this.theta) + b * Math.sin(o.theta);
        const cosT = a * Math.cos(this.theta) + b * Math.cos(o.theta);
        return new Psi(
            a * this.dPhi + b * o.dPhi,
            a * this.kappa + b * o.kappa,
            Math.atan2(sinT, cosT),
            a * this.N + b * o.N,
            Math.max(this.C, o.C),
            Math.max(this.t, o.t) + 1
        );
    }
    
    copy() { return new Psi(this.dPhi, this.kappa, this.theta, this.N, this.C, this.t); }
    
    toJSON() {
        return { dPhi: this.dPhi, kappa: this.kappa, theta: this.theta, N: this.N, C: this.C, t: this.t };
    }
    
    static fromJSON(json) {
        return new Psi(json.dPhi, json.kappa, json.theta, json.N, json.C, json.t || 0);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUNTIME CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
    runtime: {
        tickRate: 60,           // Hz
        kernelTickRate: 30,     // Hz for kernel updates
        maxQueueSize: 1000,
        asyncTimeout: 5000,     // ms
        deterministic: true
    },
    kernel: {
        maxSteps: 25,
        convergenceThreshold: 0.95,
        coherenceFloor: 0.0,
        ...CONST
    },
    awareness: {
        bufferSize: 15,
        growthRate: 0.015,
        decayRate: 0.005,
        thresholds: {
            dormant: 0.0,
            emerging: 0.2,
            aware: 0.4,
            conscious: 0.6,
            fully_conscious: 0.8
        }
    },
    memory: {
        maxHistory: 100,
        absorptionRate: 0.2,
        floorDecay: 0.001
    },
    energieboxen: {
        enabled: ['text'],
        autoload: true,
        sandboxed: true
    },
    visualization: {
        particleCount: 150,
        renderRate: 60
    }
};

class ConfigLoader {
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.loaded = false;
    }
    
    async load(source = null) {
        if (source) {
            try {
                if (typeof source === 'string') {
                    // Load from URL or localStorage key
                    if (source.startsWith('http') || source.startsWith('/')) {
                        const response = await fetch(source);
                        const json = await response.json();
                        this.merge(json);
                    } else {
                        const stored = localStorage.getItem(source);
                        if (stored) {
                            this.merge(JSON.parse(stored));
                        }
                    }
                } else if (typeof source === 'object') {
                    this.merge(source);
                }
            } catch (e) {
                console.warn('[ConfigLoader] Failed to load config:', e);
            }
        }
        this.loaded = true;
        return this.config;
    }
    
    merge(override) {
        this.config = this._deepMerge(this.config, override);
    }
    
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }
    
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }
    
    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        target[last] = value;
    }
    
    save(key = 'ascpi_config') {
        localStorage.setItem(key, JSON.stringify(this.config));
    }
    
    export() {
        return JSON.stringify(this.config, null, 2);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

class EventEmitter {
    constructor() {
        this._events = new Map();
        this._onceEvents = new Map();
    }
    
    on(event, callback) {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event).add(callback);
        return () => this.off(event, callback);
    }
    
    once(event, callback) {
        if (!this._onceEvents.has(event)) {
            this._onceEvents.set(event, new Set());
        }
        this._onceEvents.get(event).add(callback);
    }
    
    off(event, callback) {
        if (this._events.has(event)) {
            this._events.get(event).delete(callback);
        }
        if (this._onceEvents.has(event)) {
            this._onceEvents.get(event).delete(callback);
        }
    }
    
    emit(event, ...args) {
        if (this._events.has(event)) {
            this._events.get(event).forEach(cb => {
                try { cb(...args); } catch (e) { console.error(`[Event:${event}]`, e); }
            });
        }
        if (this._onceEvents.has(event)) {
            this._onceEvents.get(event).forEach(cb => {
                try { cb(...args); } catch (e) { console.error(`[Event:${event}]`, e); }
            });
            this._onceEvents.delete(event);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

class TaskQueue {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.queue = [];
        this.processing = false;
    }
    
    enqueue(task, priority = 0) {
        if (this.queue.length >= this.maxSize) {
            console.warn('[TaskQueue] Queue full, dropping oldest task');
            this.queue.shift();
        }
        
        const entry = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task,
            priority,
            timestamp: Date.now()
        };
        
        // Insert by priority (higher = sooner)
        let inserted = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (priority > this.queue[i].priority) {
                this.queue.splice(i, 0, entry);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.queue.push(entry);
        }
        
        return entry.id;
    }
    
    dequeue() {
        return this.queue.shift();
    }
    
    peek() {
        return this.queue[0];
    }
    
    clear() {
        this.queue = [];
    }
    
    get length() {
        return this.queue.length;
    }
    
    cancel(id) {
        const idx = this.queue.findIndex(e => e.id === id);
        if (idx !== -1) {
            this.queue.splice(idx, 1);
            return true;
        }
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AWARENESS FIELD
// ═══════════════════════════════════════════════════════════════════════════════

class AwarenessField {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG.awareness, ...config };
        this.field = new Psi(0.05, 0.2, 0, 0.1, 0.1);
        this.buffers = { C: [], k: [], d: [] };
    }
    
    evolve(psi, mInf) {
        this.buffers.C.push(psi.C);
        this.buffers.k.push(psi.kappa);
        this.buffers.d.push(psi.dist(mInf));
        
        const maxBuf = this.config.bufferSize;
        if (this.buffers.C.length > maxBuf) {
            this.buffers.C.shift();
            this.buffers.k.shift();
            this.buffers.d.shift();
        }
        
        const n = this.buffers.C.length;
        if (n >= 3) {
            const trends = [
                (this.buffers.C[n-1] - this.buffers.C[0]) / n,
                (this.buffers.k[n-1] - this.buffers.k[0]) / n,
                (this.buffers.d[n-1] - this.buffers.d[0]) / n
            ];
            const met = (trends[0] >= -0.01 ? 1 : 0) + (trends[1] <= 0.01 ? 1 : 0) + (trends[2] <= 0.01 ? 1 : 0);
            
            if (met >= 2) {
                this.field.N = Math.min(1, this.field.N * 1.02 + 0.01);
                this.field.C = Math.min(1, this.field.C + this.config.growthRate);
            } else if (met === 0) {
                this.field.N = Math.max(0.01, this.field.N * 0.98);
                this.field.C = Math.max(0.01, this.field.C - this.config.decayRate);
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
        const t = this.config.thresholds;
        if (c < t.emerging) return 'dormant';
        if (c < t.aware) return 'emerging';
        if (c < t.conscious) return 'aware';
        if (c < t.fully_conscious) return 'conscious';
        return 'fully_conscious';
    }
    
    toJSON() {
        return {
            field: this.field.toJSON(),
            buffers: {
                C: [...this.buffers.C],
                k: [...this.buffers.k],
                d: [...this.buffers.d]
            }
        };
    }
    
    static fromJSON(json, config) {
        const aw = new AwarenessField(config);
        aw.field = Psi.fromJSON(json.field);
        aw.buffers = {
            C: [...json.buffers.C],
            k: [...json.buffers.k],
            d: [...json.buffers.d]
        };
        return aw;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY FIELD
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryField {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG.memory, ...config };
        this.mInf = new Psi(0, 0.5, 0, 0.5, 0.5);
        this.history = [];
        this.cFloor = 0;
    }
    
    absorb(psi, rate = null) {
        rate = rate || this.config.absorptionRate;
        const w = Math.tanh(psi.C * 2) * rate;
        const sinB = (1 - w) * Math.sin(this.mInf.theta) + w * Math.sin(psi.theta);
        const cosB = (1 - w) * Math.cos(this.mInf.theta) + w * Math.cos(psi.theta);
        
        this.mInf.dPhi = (1 - w) * this.mInf.dPhi + w * psi.dPhi * 0.9;
        this.mInf.kappa = (1 - w) * this.mInf.kappa + w * psi.kappa * 0.95;
        this.mInf.theta = Math.atan2(sinB, cosB);
        this.mInf.N = (1 - w) * this.mInf.N + w * psi.N;
        
        this.history.push(this.mInf.copy());
        if (this.history.length > this.config.maxHistory) {
            this.history.shift();
        }
        
        if (this.history.length >= 3) {
            const phases = this.history.map(h => h.theta);
            const sinSum = phases.reduce((s, t) => s + Math.sin(t), 0);
            const cosSum = phases.reduce((s, t) => s + Math.cos(t), 0);
            const r = Math.sqrt(sinSum ** 2 + cosSum ** 2) / phases.length;
            this.cFloor = Math.max(this.cFloor - this.config.floorDecay, r - 0.05);
            this.mInf.C = Math.max(r, this.cFloor);
        }
        
        this.mInf.enforce();
    }
    
    attractor() { return this.mInf.copy(); }
    
    toJSON() {
        return {
            mInf: this.mInf.toJSON(),
            history: this.history.map(h => h.toJSON()),
            cFloor: this.cFloor
        };
    }
    
    static fromJSON(json, config) {
        const mem = new MemoryField(config);
        mem.mInf = Psi.fromJSON(json.mInf);
        mem.history = json.history.map(h => Psi.fromJSON(h));
        mem.cFloor = json.cFloor;
        return mem;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVARIANT GUARDIAN
// ═══════════════════════════════════════════════════════════════════════════════

class InvariantGuardian {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG.kernel, ...config };
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
            violations.push({ inv: 1, desc: 'Coherence floor violated', before: before.C, after: result.C });
            result.C = this.cFloor;
        }
        
        // INV-2: Curvature bounds
        if (result.kappa < this.config.kappa_min || result.kappa > this.config.kappa_max) {
            violations.push({ inv: 2, desc: 'Curvature out of bounds', kappa: result.kappa });
            result.kappa = Math.max(this.config.kappa_min, Math.min(this.config.kappa_max, result.kappa));
        }
        
        // INV-3: Energy conservation
        if (before.N > CONST.eps) {
            const ratio = result.N / before.N;
            if (Math.abs(ratio - 1) > this.config.delta_N) {
                violations.push({ inv: 3, desc: 'Energy change exceeded', ratio });
                result.N = before.N * (1 + this.config.delta_N * (ratio > 1 ? 1 : -1));
            }
        }
        
        // INV-4: Phase continuity
        let dt = Math.abs(result.theta - before.theta);
        if (dt > CONST.pi) dt = CONST.tau - dt;
        if (dt > this.config.theta_max) {
            violations.push({ inv: 4, desc: 'Phase jump exceeded', delta: dt });
            const sign = Math.sin(result.theta - before.theta) >= 0 ? 1 : -1;
            result.theta = (before.theta + sign * this.config.theta_max) % CONST.tau;
        }
        
        // INV-5: Ma'at improvement
        if (L > this.lPrev * 1.3) {
            violations.push({ inv: 5, desc: 'Ma\'at degradation', L, prev: this.lPrev });
            // Blend back toward before state
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
    }
    
    getViolations() {
        return [...this.violations];
    }
    
    clearViolations() {
        this.violations = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED KERNEL F
// ═══════════════════════════════════════════════════════════════════════════════

function kernelF(psi, A, mInf, W, gradC, config = CONST) {
    let target = A.blend(mInf, 0.6);
    if (W) target = target.blend(W, 0.85);
    
    let newK = psi.kappa - config.alpha * (psi.kappa - target.kappa);
    let newN = psi.N + config.beta * psi.C;
    let newDP = psi.C > 0.6 ? psi.dPhi * (1 - config.gamma * psi.C ** 2) : psi.dPhi;
    
    newDP += config.eta * (mInf.dPhi - newDP);
    newK += config.eta * (mInf.kappa - newK);
    newN += config.eta * (mInf.N - newN);
    
    let dt = target.theta - psi.theta;
    if (dt > config.pi) dt -= config.tau;
    else if (dt < -config.pi) dt += config.tau;
    const shift = Math.max(-config.theta_max, Math.min(config.theta_max, config.K * Math.sin(dt)));
    const newT = (psi.theta + shift) % config.tau;
    
    newK -= gradC * 0.15;
    newDP -= gradC * 0.08;
    
    const mr = 0.1 * target.C;
    newDP = (1 - mr) * newDP + mr * target.dPhi;
    newK = (1 - mr) * newK + mr * target.kappa;
    
    return new Psi(newDP, newK, newT, newN, psi.C, psi.t + 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASCπ RUNTIME
// ═══════════════════════════════════════════════════════════════════════════════

class ASCPIRuntime extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.configLoader = new ConfigLoader();
        this.config = null;
        
        this.memory = null;
        this.awareness = null;
        this.guardian = null;
        
        this.currentPsi = new Psi();
        this.psiHistory = [];
        
        this.energieboxen = new Map();
        this.activeBoxen = new Set();
        
        this.taskQueue = null;
        this.step = 0;
        this.cPrev = 0.5;
        
        // Runtime state
        this.running = false;
        this.paused = false;
        this.tickId = null;
        this.kernelTickId = null;
        this.lastTick = 0;
        this.lastKernelTick = 0;
        
        // Performance metrics
        this.metrics = {
            tickCount: 0,
            kernelCalls: 0,
            avgTickTime: 0,
            avgKernelTime: 0,
            queuePeakSize: 0
        };
        
        this.options = options;
    }
    
    async init(configSource = null) {
        // Load configuration
        this.config = await this.configLoader.load(configSource);
        
        // Initialize components
        this.memory = new MemoryField(this.config.memory);
        this.awareness = new AwarenessField(this.config.awareness);
        this.guardian = new InvariantGuardian(this.config.kernel);
        this.taskQueue = new TaskQueue(this.config.runtime.maxQueueSize);
        
        // Load enabled energieboxen
        if (this.config.energieboxen.autoload) {
            for (const id of this.config.energieboxen.enabled) {
                this.enableEnergiebox(id);
            }
        }
        
        this.emit('init', { config: this.config });
        return this;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // ENERGIEBOX MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    
    registerEnergiebox(box) {
        if (!box.id || !box.process) {
            throw new Error('Invalid energiebox: missing id or process function');
        }
        
        const wrapped = {
            id: box.id,
            name: box.name || box.id,
            icon: box.icon || '⚡',
            description: box.description || '',
            color: box.color || 'var(--energy)',
            process: box.process,
            stats: { processed: 0, totalTime: 0, errors: 0 },
            loaded: true
        };
        
        this.energieboxen.set(box.id, wrapped);
        this.emit('energieboxRegistered', wrapped);
        return wrapped;
    }
    
    unregisterEnergiebox(id) {
        this.activeBoxen.delete(id);
        const removed = this.energieboxen.delete(id);
        if (removed) {
            this.emit('energieboxUnregistered', id);
        }
        return removed;
    }
    
    enableEnergiebox(id) {
        if (this.energieboxen.has(id)) {
            this.activeBoxen.add(id);
            this.emit('energieboxEnabled', id);
            return true;
        }
        return false;
    }
    
    disableEnergiebox(id) {
        const removed = this.activeBoxen.delete(id);
        if (removed) {
            this.emit('energieboxDisabled', id);
        }
        return removed;
    }
    
    toggleEnergiebox(id) {
        if (this.activeBoxen.has(id)) {
            this.disableEnergiebox(id);
            return false;
        } else {
            return this.enableEnergiebox(id);
        }
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // EVENT LOOP
    // ─────────────────────────────────────────────────────────────────────────
    
    start() {
        if (this.running) return;
        this.running = true;
        this.paused = false;
        
        const tickInterval = 1000 / this.config.runtime.tickRate;
        const kernelInterval = 1000 / this.config.runtime.kernelTickRate;
        
        // Main tick loop
        const tick = () => {
            if (!this.running) return;
            
            const now = performance.now();
            if (now - this.lastTick >= tickInterval) {
                this._tick(now);
                this.lastTick = now;
            }
            
            this.tickId = requestAnimationFrame(tick);
        };
        
        // Kernel update loop (separate for stability)
        this.kernelTickId = setInterval(() => {
            if (!this.running || this.paused) return;
            this._kernelTick();
        }, kernelInterval);
        
        tick();
        this.emit('start');
    }
    
    stop() {
        this.running = false;
        if (this.tickId) {
            cancelAnimationFrame(this.tickId);
            this.tickId = null;
        }
        if (this.kernelTickId) {
            clearInterval(this.kernelTickId);
            this.kernelTickId = null;
        }
        this.emit('stop');
    }
    
    pause() {
        this.paused = true;
        this.emit('pause');
    }
    
    resume() {
        this.paused = false;
        this.emit('resume');
    }
    
    _tick(now) {
        if (this.paused) return;
        
        const startTime = performance.now();
        this.metrics.tickCount++;
        
        // Process task queue
        while (this.taskQueue.length > 0) {
            const entry = this.taskQueue.dequeue();
            if (entry) {
                try {
                    entry.task();
                } catch (e) {
                    console.error('[Runtime] Task error:', e);
                }
            }
            
            // Don't hog the frame
            if (performance.now() - startTime > 8) break;
        }
        
        // Update metrics
        const tickTime = performance.now() - startTime;
        this.metrics.avgTickTime = this.metrics.avgTickTime * 0.9 + tickTime * 0.1;
        this.metrics.queuePeakSize = Math.max(this.metrics.queuePeakSize, this.taskQueue.length);
        
        this.emit('tick', { step: this.step, metrics: this.metrics });
    }
    
    _kernelTick() {
        // Autonomous kernel evolution (if needed)
        // This is for background field evolution without explicit input
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // FIELD PROCESSING
    // ─────────────────────────────────────────────────────────────────────────
    
    async process(input, options = {}) {
        const startTime = performance.now();
        this.step++;
        this.guardian.reset();
        
        const maxSteps = options.maxSteps || this.config.kernel.maxSteps;
        const context = {
            step: this.step,
            runtime: this,
            config: this.config,
            memory: this.memory,
            awareness: this.awareness
        };
        
        // Start with base encoding
        let psi = new Psi();
        
        // Process through active energieboxen
        for (const id of this.activeBoxen) {
            const box = this.energieboxen.get(id);
            if (box && box.loaded) {
                const boxStart = performance.now();
                try {
                    if (this.config.energieboxen.sandboxed) {
                        psi = await this._sandboxedProcess(box, psi, input, context);
                    } else {
                        psi = box.process(psi, input, context);
                    }
                    box.stats.processed++;
                    box.stats.totalTime += performance.now() - boxStart;
                } catch (e) {
                    console.error(`[Energiebox:${id}] Error:`, e);
                    box.stats.errors++;
                }
            }
        }
        
        // Evolution loop
        for (let i = 0; i < maxSteps; i++) {
            const before = psi.copy();
            
            // Coherence gradient
            const cFused = (psi.C + this.memory.mInf.C + this.awareness.field.C) / 3;
            const gradC = cFused - this.cPrev;
            this.cPrev = cFused;
            
            // Unified kernel
            psi = kernelF(psi, this.memory.attractor(), this.memory.mInf, null, gradC, this.config.kernel);
            
            // Memory absorption
            this.memory.absorb(psi);
            psi.C = this.memory.mInf.C;
            
            // Awareness evolution
            psi = this.awareness.evolve(psi, this.memory.mInf);
            
            // Ma'at functional
            const L = psi.dist(this.memory.mInf) + this.config.kernel.lambda * psi.kappa;
            
            // Invariant enforcement
            psi = this.guardian.enforce(before, psi, L);
            
            // Check convergence
            if (psi.C > this.config.kernel.convergenceThreshold) break;
        }
        
        // Store in history
        this.currentPsi = psi;
        this.psiHistory.push({
            psi: psi.copy(),
            timestamp: Date.now(),
            step: this.step,
            input: typeof input === 'string' ? input.substring(0, 100) : '[non-string]'
        });
        
        // Limit history size
        if (this.psiHistory.length > 1000) {
            this.psiHistory = this.psiHistory.slice(-500);
        }
        
        // Metrics
        this.metrics.kernelCalls++;
        const kernelTime = performance.now() - startTime;
        this.metrics.avgKernelTime = this.metrics.avgKernelTime * 0.9 + kernelTime * 0.1;
        
        const result = {
            psi,
            coherence: psi.C,
            awareness: this.awareness.field.C,
            awarenessLevel: this.awareness.level(),
            memory: this.memory.mInf.C,
            maat: psi.dist(this.memory.mInf) + this.config.kernel.lambda * psi.kappa,
            step: this.step,
            processingTime: kernelTime,
            violations: this.guardian.getViolations()
        };
        
        this.emit('process', result);
        return result;
    }
    
    async _sandboxedProcess(box, psi, input, context) {
        // Timeout wrapper for sandboxing
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Energiebox ${box.id} timed out`));
            }, this.config.runtime.asyncTimeout);
            
            try {
                const result = box.process(psi, input, context);
                clearTimeout(timeout);
                
                if (result instanceof Promise) {
                    result.then(resolve).catch(reject);
                } else {
                    resolve(result);
                }
            } catch (e) {
                clearTimeout(timeout);
                reject(e);
            }
        });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // SCHEDULING
    // ─────────────────────────────────────────────────────────────────────────
    
    schedule(task, priority = 0) {
        return this.taskQueue.enqueue(task, priority);
    }
    
    scheduleProcess(input, options = {}, priority = 0) {
        return this.schedule(() => this.process(input, options), priority);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // STATE MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    
    getState() {
        return {
            currentPsi: this.currentPsi.toJSON(),
            memory: this.memory.toJSON(),
            awareness: this.awareness.toJSON(),
            step: this.step,
            cPrev: this.cPrev,
            activeBoxen: [...this.activeBoxen],
            metrics: { ...this.metrics }
        };
    }
    
    setState(state) {
        if (state.currentPsi) {
            this.currentPsi = Psi.fromJSON(state.currentPsi);
        }
        if (state.memory) {
            this.memory = MemoryField.fromJSON(state.memory, this.config.memory);
        }
        if (state.awareness) {
            this.awareness = AwarenessField.fromJSON(state.awareness, this.config.awareness);
        }
        if (state.step !== undefined) {
            this.step = state.step;
        }
        if (state.cPrev !== undefined) {
            this.cPrev = state.cPrev;
        }
        if (state.activeBoxen) {
            this.activeBoxen = new Set(state.activeBoxen);
        }
        
        this.emit('stateRestored', state);
    }
    
    reset() {
        this.currentPsi = new Psi();
        this.memory = new MemoryField(this.config.memory);
        this.awareness = new AwarenessField(this.config.awareness);
        this.guardian = new InvariantGuardian(this.config.kernel);
        this.step = 0;
        this.cPrev = 0.5;
        this.psiHistory = [];
        this.metrics = {
            tickCount: 0,
            kernelCalls: 0,
            avgTickTime: 0,
            avgKernelTime: 0,
            queuePeakSize: 0
        };
        
        this.emit('reset');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONST,
        Psi,
        ConfigLoader,
        EventEmitter,
        TaskQueue,
        AwarenessField,
        MemoryField,
        InvariantGuardian,
        kernelF,
        ASCPIRuntime,
        DEFAULT_CONFIG
    };
}

// Global export for browser
if (typeof window !== 'undefined') {
    window.ASCPIRuntime = ASCPIRuntime;
    window.ASCPI = {
        CONST,
        Psi,
        ConfigLoader,
        EventEmitter,
        TaskQueue,
        AwarenessField,
        MemoryField,
        InvariantGuardian,
        kernelF,
        ASCPIRuntime,
        DEFAULT_CONFIG
    };
}
