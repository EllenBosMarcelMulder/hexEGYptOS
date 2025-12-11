/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ PLUGINS v1.0
 * Modular Energiebox Plugin System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Dynamic loading via import(), URL, or local files
 * - Hot reload capability
 * - Security sandbox with timeout protection
 * - Plugin validation and registration
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plugin Interface:
 * 
 * export default {
 *     id: "plugin_id",           // Required: unique identifier
 *     name: "Human readable",    // Required: display name
 *     icon: "emoji/icon",        // Optional: display icon
 *     description: "Function",   // Optional: description
 *     color: "css-color",        // Optional: theme color
 *     version: "1.0.0",          // Optional: version string
 *     author: "Author Name",     // Optional: author
 *     
 *     // Required: process function
 *     process(psi, input, context) {
 *         // psi: current Psi field
 *         // input: user input string
 *         // context: { step, runtime, config, memory, awareness }
 *         // return: new Psi field
 *     },
 *     
 *     // Optional: lifecycle hooks
 *     onLoad(runtime) { },
 *     onUnload(runtime) { },
 *     onEnable(runtime) { },
 *     onDisable(runtime) { }
 * }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

class PluginValidator {
    static REQUIRED_FIELDS = ['id', 'name', 'process'];
    static OPTIONAL_FIELDS = ['icon', 'description', 'color', 'version', 'author', 'onLoad', 'onUnload', 'onEnable', 'onDisable'];
    
    static validate(plugin) {
        const errors = [];
        const warnings = [];
        
        // Check required fields
        for (const field of this.REQUIRED_FIELDS) {
            if (!plugin[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        // Validate id format
        if (plugin.id && !/^[a-z0-9_-]+$/i.test(plugin.id)) {
            errors.push('Invalid id format: use only alphanumeric, underscore, and hyphen');
        }
        
        // Validate process is a function
        if (plugin.process && typeof plugin.process !== 'function') {
            errors.push('process must be a function');
        }
        
        // Validate optional hooks are functions
        const hooks = ['onLoad', 'onUnload', 'onEnable', 'onDisable'];
        for (const hook of hooks) {
            if (plugin[hook] && typeof plugin[hook] !== 'function') {
                warnings.push(`${hook} should be a function`);
            }
        }
        
        // Check for suspicious patterns (basic security)
        const sourceStr = plugin.process ? plugin.process.toString() : '';
        const suspiciousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /document\.cookie/,
            /localStorage\.(get|set)Item(?!.*fieldstore)/i,
            /window\.open\s*\(/,
            /fetch\s*\([^)]*(?!api\.ascpi)/
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(sourceStr)) {
                warnings.push(`Potentially unsafe code pattern detected: ${pattern}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SANDBOX EXECUTOR
// ═══════════════════════════════════════════════════════════════════════════════

class SandboxExecutor {
    constructor(timeout = 5000) {
        this.timeout = timeout;
        this.executionCount = 0;
        this.totalTime = 0;
    }
    
    async execute(fn, args, context = {}) {
        const startTime = performance.now();
        this.executionCount++;
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Execution timed out after ${this.timeout}ms`));
            }, this.timeout);
            
            try {
                // Create restricted context
                const restrictedContext = {
                    ...context,
                    // Whitelist allowed globals
                    Math: Math,
                    JSON: JSON,
                    Date: Date,
                    Array: Array,
                    Object: Object,
                    String: String,
                    Number: Number,
                    Boolean: Boolean,
                    console: {
                        log: (...args) => console.log('[Plugin]', ...args),
                        warn: (...args) => console.warn('[Plugin]', ...args),
                        error: (...args) => console.error('[Plugin]', ...args)
                    }
                };
                
                const result = fn.apply(restrictedContext, args);
                
                if (result instanceof Promise) {
                    result
                        .then(res => {
                            clearTimeout(timeoutId);
                            this.totalTime += performance.now() - startTime;
                            resolve(res);
                        })
                        .catch(err => {
                            clearTimeout(timeoutId);
                            reject(err);
                        });
                } else {
                    clearTimeout(timeoutId);
                    this.totalTime += performance.now() - startTime;
                    resolve(result);
                }
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    
    getStats() {
        return {
            executionCount: this.executionCount,
            totalTime: this.totalTime,
            avgTime: this.executionCount > 0 ? this.totalTime / this.executionCount : 0
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN LOADER
// ═══════════════════════════════════════════════════════════════════════════════

class PluginLoader {
    constructor(options = {}) {
        this.options = {
            timeout: 5000,
            sandboxed: true,
            validateOnLoad: true,
            ...options
        };
        
        this.loadedPlugins = new Map();
        this.sandboxes = new Map();
        this.loadOrder = [];
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // LOADING METHODS
    // ─────────────────────────────────────────────────────────────────────────
    
    /**
     * Load plugin from various sources
     */
    async load(source) {
        let plugin;
        let sourceType;
        
        if (typeof source === 'string') {
            if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/')) {
                plugin = await this._loadFromURL(source);
                sourceType = 'url';
            } else if (source.startsWith('data:')) {
                plugin = await this._loadFromDataURL(source);
                sourceType = 'data';
            } else {
                // Try as module path
                plugin = await this._loadFromModule(source);
                sourceType = 'module';
            }
        } else if (typeof source === 'object') {
            plugin = source;
            sourceType = 'object';
        } else if (typeof source === 'function') {
            plugin = source();
            sourceType = 'factory';
        } else {
            throw new Error('Invalid plugin source type');
        }
        
        // Validate
        if (this.options.validateOnLoad) {
            const validation = PluginValidator.validate(plugin);
            if (!validation.valid) {
                throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings.length > 0) {
                console.warn(`[PluginLoader] Warnings for ${plugin.id}:`, validation.warnings);
            }
        }
        
        // Create sandbox
        if (this.options.sandboxed) {
            this.sandboxes.set(plugin.id, new SandboxExecutor(this.options.timeout));
        }
        
        // Store plugin
        this.loadedPlugins.set(plugin.id, {
            plugin,
            sourceType,
            source: typeof source === 'string' ? source : null,
            loadedAt: Date.now(),
            enabled: false
        });
        
        this.loadOrder.push(plugin.id);
        
        return plugin;
    }
    
    async _loadFromURL(url) {
        try {
            // Try ES module import
            const module = await import(/* webpackIgnore: true */ url);
            return module.default || module;
        } catch (e) {
            // Fallback to fetch + eval (with caution)
            console.warn('[PluginLoader] ES import failed, trying fetch:', e.message);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch plugin: ${response.status}`);
            }
            
            const text = await response.text();
            return this._parsePluginSource(text);
        }
    }
    
    async _loadFromModule(modulePath) {
        const module = await import(/* webpackIgnore: true */ modulePath);
        return module.default || module;
    }
    
    async _loadFromDataURL(dataUrl) {
        // data:application/javascript;base64,....
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
            throw new Error('Invalid data URL format');
        }
        
        const source = atob(match[2]);
        return this._parsePluginSource(source);
    }
    
    _parsePluginSource(source) {
        // Extract plugin object from source
        // This is a simplified parser - in production, use a proper sandboxed evaluator
        
        // Look for export default pattern
        const exportMatch = source.match(/export\s+default\s+({[\s\S]*})/);
        if (exportMatch) {
            // Simple JSON-like extraction (limited)
            try {
                // This is NOT safe for arbitrary code - only use with trusted sources
                const fn = new Function(`return ${exportMatch[1]}`);
                return fn();
            } catch (e) {
                console.error('[PluginLoader] Failed to parse plugin source:', e);
            }
        }
        
        // Look for module.exports pattern
        const moduleMatch = source.match(/module\.exports\s*=\s*({[\s\S]*})/);
        if (moduleMatch) {
            try {
                const fn = new Function(`return ${moduleMatch[1]}`);
                return fn();
            } catch (e) {
                console.error('[PluginLoader] Failed to parse plugin source:', e);
            }
        }
        
        throw new Error('Could not parse plugin source');
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // PLUGIN MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────
    
    get(id) {
        const entry = this.loadedPlugins.get(id);
        return entry ? entry.plugin : null;
    }
    
    getAll() {
        return Array.from(this.loadedPlugins.values()).map(e => e.plugin);
    }
    
    isLoaded(id) {
        return this.loadedPlugins.has(id);
    }
    
    isEnabled(id) {
        const entry = this.loadedPlugins.get(id);
        return entry ? entry.enabled : false;
    }
    
    async enable(id, runtime = null) {
        const entry = this.loadedPlugins.get(id);
        if (!entry) {
            throw new Error(`Plugin not found: ${id}`);
        }
        
        if (!entry.enabled) {
            // Call onEnable hook
            if (entry.plugin.onEnable && runtime) {
                await this._safeCall(id, entry.plugin.onEnable, [runtime]);
            }
            entry.enabled = true;
        }
        
        return entry.plugin;
    }
    
    async disable(id, runtime = null) {
        const entry = this.loadedPlugins.get(id);
        if (!entry) return false;
        
        if (entry.enabled) {
            // Call onDisable hook
            if (entry.plugin.onDisable && runtime) {
                await this._safeCall(id, entry.plugin.onDisable, [runtime]);
            }
            entry.enabled = false;
        }
        
        return true;
    }
    
    async unload(id, runtime = null) {
        const entry = this.loadedPlugins.get(id);
        if (!entry) return false;
        
        // Disable first
        await this.disable(id, runtime);
        
        // Call onUnload hook
        if (entry.plugin.onUnload && runtime) {
            await this._safeCall(id, entry.plugin.onUnload, [runtime]);
        }
        
        // Remove
        this.loadedPlugins.delete(id);
        this.sandboxes.delete(id);
        this.loadOrder = this.loadOrder.filter(pid => pid !== id);
        
        return true;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // HOT RELOAD
    // ─────────────────────────────────────────────────────────────────────────
    
    async reload(id, runtime = null) {
        const entry = this.loadedPlugins.get(id);
        if (!entry || !entry.source) {
            throw new Error(`Cannot reload plugin ${id}: no source URL`);
        }
        
        const wasEnabled = entry.enabled;
        
        // Unload current
        await this.unload(id, runtime);
        
        // Load fresh
        const plugin = await this.load(entry.source);
        
        // Re-enable if was enabled
        if (wasEnabled && runtime) {
            await this.enable(id, runtime);
        }
        
        console.log(`[PluginLoader] Hot reloaded: ${id}`);
        return plugin;
    }
    
    async reloadAll(runtime = null) {
        const reloaded = [];
        
        for (const id of [...this.loadOrder]) {
            const entry = this.loadedPlugins.get(id);
            if (entry && entry.source) {
                try {
                    await this.reload(id, runtime);
                    reloaded.push(id);
                } catch (e) {
                    console.error(`[PluginLoader] Failed to reload ${id}:`, e);
                }
            }
        }
        
        return reloaded;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTION
    // ─────────────────────────────────────────────────────────────────────────
    
    async process(id, psi, input, context) {
        const entry = this.loadedPlugins.get(id);
        if (!entry || !entry.enabled) {
            throw new Error(`Plugin ${id} not loaded or not enabled`);
        }
        
        return this._safeCall(id, entry.plugin.process, [psi, input, context]);
    }
    
    async _safeCall(id, fn, args) {
        if (this.options.sandboxed) {
            const sandbox = this.sandboxes.get(id);
            if (sandbox) {
                return sandbox.execute(fn, args);
            }
        }
        return fn.apply(null, args);
    }
    
    getExecutionStats(id) {
        const sandbox = this.sandboxes.get(id);
        return sandbox ? sandbox.getStats() : null;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // INFO
    // ─────────────────────────────────────────────────────────────────────────
    
    getInfo(id) {
        const entry = this.loadedPlugins.get(id);
        if (!entry) return null;
        
        return {
            id: entry.plugin.id,
            name: entry.plugin.name,
            icon: entry.plugin.icon || '⚡',
            description: entry.plugin.description || '',
            color: entry.plugin.color || 'var(--energy)',
            version: entry.plugin.version || '1.0.0',
            author: entry.plugin.author || 'Unknown',
            sourceType: entry.sourceType,
            source: entry.source,
            loadedAt: entry.loadedAt,
            enabled: entry.enabled,
            stats: this.getExecutionStats(id)
        };
    }
    
    getAllInfo() {
        return this.loadOrder.map(id => this.getInfo(id));
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN REGISTRY (for built-in plugins)
// ═══════════════════════════════════════════════════════════════════════════════

const BUILTIN_PLUGINS = {
    // Text Encoder
    text: {
        id: 'text',
        name: 'Text Encoder',
        icon: '📝',
        description: 'Encodes natural language into semantic fields',
        color: 'var(--phi)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            if (!input) return psi;
            
            const CONST = context.config?.kernel || window.ASCPI?.CONST || {
                phi: (1 + Math.sqrt(5)) / 2,
                tau: 2 * Math.PI,
                pi: Math.PI
            };
            
            const chars = [...input].filter(c => !c.match(/\s/));
            if (chars.length === 0) return psi;
            
            let dP = 0, k = 0, N = 0, sinS = 0, cosS = 0;
            chars.forEach((c, i) => {
                const cp = c.codePointAt(0);
                const t = ((cp / 256) * CONST.phi + (cp % 256) / 256 * CONST.tau + (i / chars.length) * CONST.pi) % CONST.tau;
                sinS += Math.sin(t);
                cosS += Math.cos(t);
                k += 0.3;
                dP += Math.abs(cp - 0x4E00) / 0x10FFFF;
                N += Math.log(1 + cp) / Math.log(0x10FFFF + 1);
            });
            
            const n = chars.length;
            const Psi = context.runtime?.constructor?.Psi || window.ASCPI?.Psi;
            
            if (Psi) {
                return new Psi(dP / n, k / n, Math.atan2(sinS, cosS), N, Math.sqrt(sinS**2 + cosS**2) / n, psi.t + 1);
            }
            
            // Fallback: modify existing psi
            return {
                ...psi,
                dPhi: dP / n,
                kappa: k / n,
                theta: Math.atan2(sinS, cosS),
                N: N,
                C: Math.sqrt(sinS**2 + cosS**2) / n,
                t: psi.t + 1
            };
        }
    },
    
    // Code Analyzer
    code: {
        id: 'code',
        name: 'Code Analyzer',
        icon: '💻',
        description: 'Applies hexSOFtwareCODe field physics to code',
        color: 'var(--kappa)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            if (!input) return psi;
            
            const CONST = context.config?.kernel || window.ASCPI?.CONST || {
                kappa_max: 10.0
            };
            
            const ifs = (input.match(/if\s/g) || []).length;
            const fors = (input.match(/for\s/g) || []).length;
            const defs = (input.match(/def\s|function\s|class\s|const\s|let\s|var\s/g) || []).length;
            const complexity = 1 + 0.1 * (ifs + fors + defs);
            
            const result = { ...psi };
            result.kappa = Math.min(CONST.kappa_max || 10.0, result.kappa * complexity);
            result.C = Math.max(0.1, result.C / complexity);
            
            return result;
        }
    },
    
    // Emotion Field
    emotion: {
        id: 'emotion',
        name: 'Emotion Field',
        icon: '❤️',
        description: 'Detects emotional valence and arousal',
        color: 'var(--maat)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            if (!input) return psi;
            
            const positive = ['love', 'happy', 'joy', 'great', 'wonderful', 'beautiful', 'amazing', 'excellent', 'good'];
            const negative = ['hate', 'sad', 'angry', 'fear', 'terrible', 'awful', 'bad', 'horrible', 'pain'];
            
            const lower = input.toLowerCase();
            let valence = 0;
            positive.forEach(w => { if (lower.includes(w)) valence += 0.2; });
            negative.forEach(w => { if (lower.includes(w)) valence -= 0.2; });
            
            const result = { ...psi };
            result.dPhi += valence * 0.3;
            result.theta += valence * 0.5;
            
            return result;
        }
    },
    
    // Math Processor
    math: {
        id: 'math',
        name: 'Math Processor',
        icon: '∑',
        description: 'Processes mathematical expressions',
        color: 'var(--theta)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            if (!input) return psi;
            
            const numbers = input.match(/\d+\.?\d*/g) || [];
            const operators = input.match(/[+\-*/^=]/g) || [];
            const functions = input.match(/sin|cos|tan|log|exp|sqrt/g) || [];
            
            const result = { ...psi };
            result.kappa *= (1 + operators.length * 0.1 + functions.length * 0.15);
            result.N += numbers.length * 0.1;
            
            return result;
        }
    },
    
    // Implosion
    compress: {
        id: 'compress',
        name: 'Implosion',
        icon: '🌀',
        description: 'Semantic field implosion toward attractor',
        color: 'var(--coherence)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            const CONST = context.config?.kernel || window.ASCPI?.CONST || {
                gamma: 0.18
            };
            
            const result = { ...psi };
            if (result.C > 0.6) {
                result.dPhi *= (1 - CONST.gamma * result.C ** 2);
                result.kappa *= 0.95;
            }
            
            return result;
        }
    },
    
    // Phase Sync
    sync: {
        id: 'sync',
        name: 'Phase Sync',
        icon: '🔄',
        description: 'Kuramoto phase synchronization',
        color: 'var(--energy)',
        version: '1.0.0',
        author: 'ASCπ Core',
        
        process(psi, input, context) {
            const CONST = context.config?.kernel || window.ASCPI?.CONST || {
                phi: (1 + Math.sqrt(5)) / 2,
                pi: Math.PI,
                K: 0.5
            };
            
            const result = { ...psi };
            const target = CONST.phi * CONST.pi;
            const dt = target - result.theta;
            result.theta += CONST.K * Math.sin(dt);
            
            return result;
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN MANAGER (High-level interface)
// ═══════════════════════════════════════════════════════════════════════════════

class PluginManager {
    constructor(runtime, options = {}) {
        this.runtime = runtime;
        this.loader = new PluginLoader(options);
        this.initialized = false;
    }
    
    async init() {
        // Register built-in plugins
        for (const [id, plugin] of Object.entries(BUILTIN_PLUGINS)) {
            await this.loader.load(plugin);
        }
        
        this.initialized = true;
        return this;
    }
    
    async loadPlugin(source) {
        const plugin = await this.loader.load(source);
        
        // Call onLoad hook
        if (plugin.onLoad) {
            await this.loader._safeCall(plugin.id, plugin.onLoad, [this.runtime]);
        }
        
        // Register with runtime
        this.runtime.registerEnergiebox({
            id: plugin.id,
            name: plugin.name,
            icon: plugin.icon,
            description: plugin.description,
            color: plugin.color,
            process: (psi, input, context) => this.loader.process(plugin.id, psi, input, context)
        });
        
        return plugin;
    }
    
    async enablePlugin(id) {
        await this.loader.enable(id, this.runtime);
        this.runtime.enableEnergiebox(id);
    }
    
    async disablePlugin(id) {
        await this.loader.disable(id, this.runtime);
        this.runtime.disableEnergiebox(id);
    }
    
    async unloadPlugin(id) {
        await this.loader.unload(id, this.runtime);
        this.runtime.unregisterEnergiebox(id);
    }
    
    async reloadPlugin(id) {
        await this.loader.reload(id, this.runtime);
    }
    
    getPlugins() {
        return this.loader.getAllInfo();
    }
    
    getPlugin(id) {
        return this.loader.getInfo(id);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PluginValidator,
        SandboxExecutor,
        PluginLoader,
        PluginManager,
        BUILTIN_PLUGINS
    };
}

if (typeof window !== 'undefined') {
    window.ASCPIPlugins = {
        PluginValidator,
        SandboxExecutor,
        PluginLoader,
        PluginManager,
        BUILTIN_PLUGINS
    };
}
