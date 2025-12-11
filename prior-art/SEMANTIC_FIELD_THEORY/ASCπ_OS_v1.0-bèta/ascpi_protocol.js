/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ PROTOCOL v1.0
 * Field Address Protocol Implementation
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Implements the field:// protocol for navigating semantic field space.
 * 
 * Supported paths:
 * - field://Ψ/current          - Current field state
 * - field://Ψ/memory           - Memory M∞ field
 * - field://Ψ/awareness        - Awareness field
 * - field://Ψ/history/[i]      - Historical state at index i
 * - field://Ψ/scan/[component] - Scan specific component (dPhi, kappa, theta, N, C)
 * - field://Ψ/vector           - Full vector representation
 * - field://Ψ/nav/[x]/[y]/[z]  - Navigate to field coordinates
 * - maat://[query]             - Ma'at governance query
 * - sync://[peer]              - Peer synchronization (future)
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PROTOCOLS = {
    FIELD: 'field',
    MAAT: 'maat',
    SYNC: 'sync',
    HTTP: 'http',
    HTTPS: 'https'
};

const FIELD_COMPONENTS = ['dPhi', 'kappa', 'theta', 'N', 'C'];

// ═══════════════════════════════════════════════════════════════════════════════
// ADDRESS PARSER
// ═══════════════════════════════════════════════════════════════════════════════

class FieldAddress {
    constructor(address) {
        this.raw = address;
        this.protocol = null;
        this.path = [];
        this.params = {};
        this.valid = false;
        this.error = null;
        
        this._parse(address);
    }
    
    _parse(address) {
        try {
            // Check for protocol
            const protocolMatch = address.match(/^([a-z]+):\/\//i);
            if (!protocolMatch) {
                // Default to field protocol if starts with Ψ
                if (address.startsWith('Ψ/') || address.startsWith('psi/')) {
                    this.protocol = PROTOCOLS.FIELD;
                    address = address;
                } else {
                    throw new Error('Invalid address: missing protocol');
                }
            } else {
                this.protocol = protocolMatch[1].toLowerCase();
                address = address.substring(protocolMatch[0].length);
            }
            
            // Parse query params
            const queryIndex = address.indexOf('?');
            let query = '';
            if (queryIndex !== -1) {
                query = address.substring(queryIndex + 1);
                address = address.substring(0, queryIndex);
            }
            
            // Parse path
            this.path = address.split('/').filter(p => p.length > 0);
            
            // Parse query params
            if (query) {
                const pairs = query.split('&');
                for (const pair of pairs) {
                    const [key, value] = pair.split('=');
                    this.params[decodeURIComponent(key)] = decodeURIComponent(value || '');
                }
            }
            
            this.valid = true;
        } catch (e) {
            this.error = e.message;
            this.valid = false;
        }
    }
    
    toString() {
        if (!this.valid) return this.raw;
        
        let str = `${this.protocol}://`;
        str += this.path.join('/');
        
        if (Object.keys(this.params).length > 0) {
            const params = Object.entries(this.params)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');
            str += `?${params}`;
        }
        
        return str;
    }
    
    // Convenience getters
    get isField() { return this.protocol === PROTOCOLS.FIELD; }
    get isMaat() { return this.protocol === PROTOCOLS.MAAT; }
    get isSync() { return this.protocol === PROTOCOLS.SYNC; }
    get isHttp() { return this.protocol === PROTOCOLS.HTTP || this.protocol === PROTOCOLS.HTTPS; }
    
    get root() { return this.path[0] || null; }
    get subpath() { return this.path.slice(1); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

class ProtocolHandler {
    constructor(runtime) {
        this.runtime = runtime;
        this.handlers = new Map();
        this.history = [];
        this.currentAddress = null;
        
        // Register default handlers
        this._registerDefaults();
    }
    
    _registerDefaults() {
        // Field protocol handler
        this.handlers.set(PROTOCOLS.FIELD, async (address) => {
            return this._handleField(address);
        });
        
        // Ma'at protocol handler
        this.handlers.set(PROTOCOLS.MAAT, async (address) => {
            return this._handleMaat(address);
        });
        
        // Sync protocol handler (placeholder)
        this.handlers.set(PROTOCOLS.SYNC, async (address) => {
            return this._handleSync(address);
        });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // FIELD PROTOCOL
    // ─────────────────────────────────────────────────────────────────────────
    
    async _handleField(address) {
        const path = address.subpath;
        const command = path[0] || 'current';
        
        switch (command) {
            case 'current':
                return this._getFieldResult('current', this.runtime.currentPsi);
                
            case 'memory':
                return this._getFieldResult('memory', this.runtime.memory.mInf);
                
            case 'awareness':
                return this._getFieldResult('awareness', this.runtime.awareness.field, {
                    level: this.runtime.awareness.level()
                });
                
            case 'history':
                return this._handleHistory(path.slice(1));
                
            case 'scan':
                return this._handleScan(path.slice(1));
                
            case 'vector':
                return this._handleVector();
                
            case 'nav':
                return this._handleNav(path.slice(1), address.params);
                
            case 'attractor':
                return this._getFieldResult('attractor', this.runtime.memory.attractor());
                
            case 'metrics':
                return this._handleMetrics();
                
            case 'invariants':
                return this._handleInvariants();
                
            default:
                return {
                    success: false,
                    error: `Unknown field command: ${command}`,
                    suggestions: ['current', 'memory', 'awareness', 'history', 'scan', 'vector', 'nav', 'attractor', 'metrics', 'invariants']
                };
        }
    }
    
    _getFieldResult(name, psi, extra = {}) {
        return {
            success: true,
            type: 'field',
            name,
            psi: psi.toJSON ? psi.toJSON() : psi,
            vector: psi.vec ? psi.vec() : [psi.dPhi, psi.kappa, psi.theta, psi.N, psi.C],
            coherence: psi.C,
            ...extra
        };
    }
    
    _handleHistory(path) {
        const index = parseInt(path[0], 10);
        
        if (isNaN(index)) {
            // Return history summary
            return {
                success: true,
                type: 'history',
                count: this.runtime.psiHistory.length,
                latest: this.runtime.psiHistory.slice(-10).map((h, i) => ({
                    index: this.runtime.psiHistory.length - 10 + i,
                    step: h.step,
                    coherence: h.psi.C,
                    timestamp: h.timestamp
                }))
            };
        }
        
        // Get specific history entry
        if (index < 0 || index >= this.runtime.psiHistory.length) {
            return {
                success: false,
                error: `History index out of range: ${index} (0-${this.runtime.psiHistory.length - 1})`
            };
        }
        
        const entry = this.runtime.psiHistory[index];
        return {
            success: true,
            type: 'history_entry',
            index,
            ...this._getFieldResult(`history[${index}]`, entry.psi),
            step: entry.step,
            timestamp: entry.timestamp,
            input: entry.input
        };
    }
    
    _handleScan(path) {
        const component = path[0];
        
        if (!component) {
            // Return all components
            const psi = this.runtime.currentPsi;
            return {
                success: true,
                type: 'scan',
                components: {
                    dPhi: { value: psi.dPhi, label: 'Tension', unit: '' },
                    kappa: { value: psi.kappa, label: 'Curvature', unit: '', bounds: [0.01, 10.0] },
                    theta: { value: psi.theta, label: 'Phase', unit: 'rad', bounds: [0, 2 * Math.PI] },
                    N: { value: psi.N, label: 'Energy', unit: '' },
                    C: { value: psi.C, label: 'Coherence', unit: '', bounds: [0, 1] }
                }
            };
        }
        
        if (!FIELD_COMPONENTS.includes(component)) {
            return {
                success: false,
                error: `Unknown component: ${component}`,
                valid: FIELD_COMPONENTS
            };
        }
        
        const psi = this.runtime.currentPsi;
        const value = psi[component];
        
        // Get historical values for this component
        const history = this.runtime.psiHistory.slice(-50).map(h => ({
            step: h.step,
            value: h.psi[component]
        }));
        
        return {
            success: true,
            type: 'scan_component',
            component,
            value,
            history,
            stats: {
                min: Math.min(...history.map(h => h.value)),
                max: Math.max(...history.map(h => h.value)),
                avg: history.reduce((s, h) => s + h.value, 0) / history.length
            }
        };
    }
    
    _handleVector() {
        const psi = this.runtime.currentPsi;
        const mInf = this.runtime.memory.mInf;
        const awareness = this.runtime.awareness.field;
        
        return {
            success: true,
            type: 'vector',
            current: psi.vec(),
            memory: mInf.vec ? mInf.vec() : [mInf.dPhi, mInf.kappa, mInf.theta, mInf.N, mInf.C],
            awareness: awareness.vec ? awareness.vec() : [awareness.dPhi, awareness.kappa, awareness.theta, awareness.N, awareness.C],
            distances: {
                toMemory: psi.dist ? psi.dist(mInf) : null,
                toAwareness: psi.dist ? psi.dist(awareness) : null
            }
        };
    }
    
    _handleNav(path, params) {
        // Navigate to field coordinates
        // field://Ψ/nav/[dPhi]/[kappa]/[theta]
        
        if (path.length < 3) {
            return {
                success: false,
                error: 'Navigation requires at least 3 coordinates (dPhi, kappa, theta)',
                usage: 'field://Ψ/nav/[dPhi]/[kappa]/[theta]?N=[N]&C=[C]'
            };
        }
        
        const dPhi = parseFloat(path[0]);
        const kappa = parseFloat(path[1]);
        const theta = parseFloat(path[2]);
        const N = params.N ? parseFloat(params.N) : 1.0;
        const C = params.C ? parseFloat(params.C) : 0.5;
        
        if (isNaN(dPhi) || isNaN(kappa) || isNaN(theta)) {
            return {
                success: false,
                error: 'Invalid coordinate values'
            };
        }
        
        // Create target field
        const Psi = window.ASCPI?.Psi;
        if (Psi) {
            const target = new Psi(dPhi, kappa, theta, N, C);
            
            return {
                success: true,
                type: 'navigation',
                target: target.toJSON(),
                distance: this.runtime.currentPsi.dist(target),
                action: 'navigate'
            };
        }
        
        return {
            success: true,
            type: 'navigation',
            target: { dPhi, kappa, theta, N, C },
            action: 'navigate'
        };
    }
    
    _handleMetrics() {
        return {
            success: true,
            type: 'metrics',
            step: this.runtime.step,
            coherence: this.runtime.currentPsi.C,
            memory: this.runtime.memory.mInf.C,
            awareness: {
                level: this.runtime.awareness.level(),
                value: this.runtime.awareness.field.C
            },
            runtime: this.runtime.metrics
        };
    }
    
    _handleInvariants() {
        const violations = this.runtime.guardian.getViolations();
        
        return {
            success: true,
            type: 'invariants',
            definitions: {
                'INV-1': 'Coherence monotonicity: C(t+1) ≥ C(t) - ε',
                'INV-2': 'Curvature bounds: κ ∈ [0.01, 10.0]',
                'INV-3': 'Energy conservation: |ΔN| < 0.2N',
                'INV-4': 'Phase continuity: |Δθ| < π/2',
                'INV-5': 'Ma\'at improvement: L(out) ≤ L(in) × 1.3'
            },
            violations: violations.slice(-20),
            totalViolations: violations.length
        };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // MA'AT PROTOCOL
    // ─────────────────────────────────────────────────────────────────────────
    
    async _handleMaat(address) {
        const query = address.path.join('/');
        const psi = this.runtime.currentPsi;
        const mInf = this.runtime.memory.mInf;
        
        const CONST = this.runtime.config?.kernel || { lambda: 0.02 };
        const L = psi.dist(mInf) + CONST.lambda * psi.kappa;
        
        switch (query) {
            case '':
            case 'status':
                return {
                    success: true,
                    type: 'maat',
                    functional: L,
                    components: {
                        distance: psi.dist(mInf),
                        curvaturePenalty: CONST.lambda * psi.kappa
                    },
                    coherence: psi.C,
                    judgment: L < 0.5 ? 'excellent' : L < 1.0 ? 'good' : L < 2.0 ? 'acceptable' : 'needs_improvement'
                };
                
            case 'judge':
                const cGain = psi.C - 0.5; // Baseline
                const kReduction = 1 - Math.min(psi.kappa / 1.0, 1);
                const score = 0.5 + cGain + kReduction * 0.3;
                
                return {
                    success: true,
                    type: 'maat_judgment',
                    score,
                    decision: score >= 0.75 ? 'allow' : 'rebuild',
                    factors: {
                        coherenceGain: cGain,
                        curvatureReduction: kReduction
                    }
                };
                
            case 'history':
                const maatHistory = this.runtime.psiHistory.slice(-50).map(h => {
                    const d = h.psi.dist ? h.psi.dist(mInf) : 0;
                    return {
                        step: h.step,
                        L: d + CONST.lambda * h.psi.kappa,
                        C: h.psi.C
                    };
                });
                
                return {
                    success: true,
                    type: 'maat_history',
                    history: maatHistory
                };
                
            default:
                return {
                    success: false,
                    error: `Unknown Ma'at query: ${query}`,
                    suggestions: ['status', 'judge', 'history']
                };
        }
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // SYNC PROTOCOL (placeholder for P2P)
    // ─────────────────────────────────────────────────────────────────────────
    
    async _handleSync(address) {
        return {
            success: false,
            type: 'sync',
            error: 'P2P sync protocol not yet implemented',
            address: address.toString(),
            status: 'planned'
        };
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────
    
    async navigate(addressStr) {
        const address = new FieldAddress(addressStr);
        
        if (!address.valid) {
            return {
                success: false,
                error: address.error,
                raw: addressStr
            };
        }
        
        // Record in history
        this.history.push({
            address: address.toString(),
            timestamp: Date.now()
        });
        if (this.history.length > 100) {
            this.history.shift();
        }
        
        this.currentAddress = address;
        
        // Get handler
        const handler = this.handlers.get(address.protocol);
        if (!handler) {
            // Check for HTTP(S)
            if (address.isHttp) {
                return {
                    success: true,
                    type: 'external',
                    url: addressStr,
                    action: 'open'
                };
            }
            
            return {
                success: false,
                error: `Unknown protocol: ${address.protocol}`,
                supported: [...this.handlers.keys()]
            };
        }
        
        try {
            const result = await handler(address);
            return {
                ...result,
                address: address.toString(),
                timestamp: Date.now()
            };
        } catch (e) {
            return {
                success: false,
                error: e.message,
                address: address.toString()
            };
        }
    }
    
    parse(addressStr) {
        return new FieldAddress(addressStr);
    }
    
    registerHandler(protocol, handler) {
        this.handlers.set(protocol.toLowerCase(), handler);
    }
    
    getHistory() {
        return [...this.history];
    }
    
    back() {
        if (this.history.length < 2) return null;
        this.history.pop(); // Remove current
        const prev = this.history[this.history.length - 1];
        return prev ? prev.address : null;
    }
    
    // Build address helper
    static buildAddress(protocol, ...path) {
        return `${protocol}://${path.join('/')}`;
    }
    
    static fieldAddress(...path) {
        return `field://Ψ/${path.join('/')}`;
    }
    
    static maatAddress(query = '') {
        return `maat://${query}`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// URL BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

class FieldAddressBar {
    constructor(inputElement, runtime, options = {}) {
        this.input = inputElement;
        this.runtime = runtime;
        this.protocol = new ProtocolHandler(runtime);
        this.options = {
            onNavigate: null,
            onResult: null,
            onError: null,
            ...options
        };
        
        this._bindEvents();
    }
    
    _bindEvents() {
        this.input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await this.navigate(this.input.value);
            }
        });
        
        this.input.addEventListener('focus', () => {
            this.input.select();
        });
    }
    
    async navigate(address) {
        if (this.options.onNavigate) {
            this.options.onNavigate(address);
        }
        
        const result = await this.protocol.navigate(address);
        
        if (result.success) {
            if (this.options.onResult) {
                this.options.onResult(result);
            }
        } else {
            if (this.options.onError) {
                this.options.onError(result);
            }
        }
        
        return result;
    }
    
    setAddress(address) {
        this.input.value = address;
    }
    
    getAddress() {
        return this.input.value;
    }
    
    back() {
        const prev = this.protocol.back();
        if (prev) {
            this.setAddress(prev);
            return this.navigate(prev);
        }
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PROTOCOLS,
        FIELD_COMPONENTS,
        FieldAddress,
        ProtocolHandler,
        FieldAddressBar
    };
}

if (typeof window !== 'undefined') {
    window.ASCPIProtocol = {
        PROTOCOLS,
        FIELD_COMPONENTS,
        FieldAddress,
        ProtocolHandler,
        FieldAddressBar
    };
}
