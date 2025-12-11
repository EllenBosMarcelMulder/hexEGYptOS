/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ FIELDSTORE v1.0
 * Persistent Storage via IndexedDB
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Handles storage and retrieval of:
 * - M∞ (Memory field)
 * - Ψ-history (Processing history)
 * - Energiebox states
 * - Runtime configuration
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const FIELDSTORE_VERSION = 1;
const FIELDSTORE_NAME = 'ASCPIFieldStore';

// ═══════════════════════════════════════════════════════════════════════════════
// STORE NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const STORES = {
    MEMORY: 'memory',
    HISTORY: 'history',
    ENERGIEBOXEN: 'energieboxen',
    CONFIG: 'config',
    SESSIONS: 'sessions',
    SNAPSHOTS: 'snapshots'
};

// ═══════════════════════════════════════════════════════════════════════════════
// FIELDSTORE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class FieldStore {
    constructor(dbName = FIELDSTORE_NAME) {
        this.dbName = dbName;
        this.db = null;
        this.ready = false;
        this._initPromise = null;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────
    
    async init() {
        if (this._initPromise) return this._initPromise;
        
        this._initPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }
            
            const request = indexedDB.open(this.dbName, FIELDSTORE_VERSION);
            
            request.onerror = () => {
                reject(new Error(`Failed to open database: ${request.error}`));
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                this.ready = true;
                console.log('[FieldStore] Database opened successfully');
                resolve(this);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Memory store (M∞)
                if (!db.objectStoreNames.contains(STORES.MEMORY)) {
                    const memoryStore = db.createObjectStore(STORES.MEMORY, { keyPath: 'id' });
                    memoryStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // History store (Ψ-history)
                if (!db.objectStoreNames.contains(STORES.HISTORY)) {
                    const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    historyStore.createIndex('step', 'step', { unique: false });
                    historyStore.createIndex('session', 'sessionId', { unique: false });
                }
                
                // Energieboxen store
                if (!db.objectStoreNames.contains(STORES.ENERGIEBOXEN)) {
                    const energieboxStore = db.createObjectStore(STORES.ENERGIEBOXEN, { keyPath: 'id' });
                    energieboxStore.createIndex('enabled', 'enabled', { unique: false });
                }
                
                // Config store
                if (!db.objectStoreNames.contains(STORES.CONFIG)) {
                    db.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
                }
                
                // Sessions store
                if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                    const sessionsStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
                    sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Snapshots store
                if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
                    const snapshotsStore = db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
                    snapshotsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    snapshotsStore.createIndex('name', 'name', { unique: false });
                }
                
                console.log('[FieldStore] Database schema created');
            };
        });
        
        return this._initPromise;
    }
    
    async ensureReady() {
        if (!this.ready) {
            await this.init();
        }
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // GENERIC OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    _transaction(storeName, mode = 'readonly') {
        return this.db.transaction(storeName, mode).objectStore(storeName);
    }
    
    async _get(storeName, key) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName).get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _getAll(storeName, query = null, count = null) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName).getAll(query, count);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _put(storeName, value) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName, 'readwrite').put(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _delete(storeName, key) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName, 'readwrite').delete(key);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _clear(storeName) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName, 'readwrite').clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _count(storeName) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const request = this._transaction(storeName).count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async _getByIndex(storeName, indexName, key) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const store = this._transaction(storeName);
            const index = store.index(indexName);
            const request = index.getAll(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // MEMORY OPERATIONS (M∞)
    // ─────────────────────────────────────────────────────────────────────────
    
    async saveMemory(memory, id = 'current') {
        const data = {
            id,
            timestamp: Date.now(),
            mInf: memory.mInf.toJSON(),
            history: memory.history.map(h => h.toJSON()),
            cFloor: memory.cFloor
        };
        return this._put(STORES.MEMORY, data);
    }
    
    async loadMemory(id = 'current') {
        const data = await this._get(STORES.MEMORY, id);
        if (!data) return null;
        
        // Reconstruct MemoryField
        const memory = {
            mInf: data.mInf,
            history: data.history,
            cFloor: data.cFloor,
            timestamp: data.timestamp
        };
        return memory;
    }
    
    async listMemories() {
        return this._getAll(STORES.MEMORY);
    }
    
    async deleteMemory(id) {
        return this._delete(STORES.MEMORY, id);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // HISTORY OPERATIONS (Ψ-history)
    // ─────────────────────────────────────────────────────────────────────────
    
    async saveHistoryEntry(entry, sessionId = 'default') {
        const data = {
            timestamp: Date.now(),
            sessionId,
            step: entry.step,
            psi: entry.psi.toJSON(),
            input: entry.input,
            coherence: entry.psi.C,
            awarenessLevel: entry.awarenessLevel || null
        };
        return this._put(STORES.HISTORY, data);
    }
    
    async getHistory(limit = 100, sessionId = null) {
        await this.ensureReady();
        
        return new Promise((resolve, reject) => {
            const store = this._transaction(STORES.HISTORY);
            const results = [];
            
            let request;
            if (sessionId) {
                const index = store.index('session');
                request = index.openCursor(IDBKeyRange.only(sessionId), 'prev');
            } else {
                request = store.openCursor(null, 'prev');
            }
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async getHistoryByStep(step) {
        return this._getByIndex(STORES.HISTORY, 'step', step);
    }
    
    async clearHistory(sessionId = null) {
        if (sessionId) {
            // Delete only for specific session
            const entries = await this._getByIndex(STORES.HISTORY, 'session', sessionId);
            for (const entry of entries) {
                await this._delete(STORES.HISTORY, entry.id);
            }
            return entries.length;
        }
        return this._clear(STORES.HISTORY);
    }
    
    async getHistoryCount() {
        return this._count(STORES.HISTORY);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // ENERGIEBOX OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    async saveEnergiebox(box) {
        const data = {
            id: box.id,
            name: box.name,
            icon: box.icon,
            description: box.description,
            color: box.color,
            enabled: box.enabled || false,
            stats: box.stats || { processed: 0, totalTime: 0, errors: 0 },
            // Note: process function cannot be serialized
            source: box.source || null,  // URL or inline source
            timestamp: Date.now()
        };
        return this._put(STORES.ENERGIEBOXEN, data);
    }
    
    async loadEnergiebox(id) {
        return this._get(STORES.ENERGIEBOXEN, id);
    }
    
    async listEnergieboxen() {
        return this._getAll(STORES.ENERGIEBOXEN);
    }
    
    async getEnabledEnergieboxen() {
        return this._getByIndex(STORES.ENERGIEBOXEN, 'enabled', true);
    }
    
    async deleteEnergiebox(id) {
        return this._delete(STORES.ENERGIEBOXEN, id);
    }
    
    async updateEnergieboxStats(id, stats) {
        const box = await this.loadEnergiebox(id);
        if (box) {
            box.stats = { ...box.stats, ...stats };
            box.timestamp = Date.now();
            return this._put(STORES.ENERGIEBOXEN, box);
        }
        return null;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // CONFIG OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    async saveConfig(key, value) {
        return this._put(STORES.CONFIG, { key, value, timestamp: Date.now() });
    }
    
    async loadConfig(key) {
        const data = await this._get(STORES.CONFIG, key);
        return data ? data.value : null;
    }
    
    async deleteConfig(key) {
        return this._delete(STORES.CONFIG, key);
    }
    
    async getAllConfig() {
        const entries = await this._getAll(STORES.CONFIG);
        const config = {};
        for (const entry of entries) {
            config[entry.key] = entry.value;
        }
        return config;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // SESSION OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    async createSession(name = null) {
        const session = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name || `Session ${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            stepCount: 0,
            lastPsi: null
        };
        await this._put(STORES.SESSIONS, session);
        return session;
    }
    
    async updateSession(sessionId, updates) {
        const session = await this._get(STORES.SESSIONS, sessionId);
        if (session) {
            Object.assign(session, updates);
            session.lastUpdated = Date.now();
            return this._put(STORES.SESSIONS, session);
        }
        return null;
    }
    
    async getSession(sessionId) {
        return this._get(STORES.SESSIONS, sessionId);
    }
    
    async listSessions(limit = 50) {
        await this.ensureReady();
        
        return new Promise((resolve, reject) => {
            const store = this._transaction(STORES.SESSIONS);
            const index = store.index('timestamp');
            const results = [];
            
            const request = index.openCursor(null, 'prev');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteSession(sessionId) {
        // Delete session and its history
        await this.clearHistory(sessionId);
        return this._delete(STORES.SESSIONS, sessionId);
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // SNAPSHOT OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    async createSnapshot(runtime, name = null) {
        const state = runtime.getState();
        
        const snapshot = {
            id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name || `Snapshot ${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            state: state,
            version: '1.0'
        };
        
        await this._put(STORES.SNAPSHOTS, snapshot);
        return snapshot;
    }
    
    async loadSnapshot(snapshotId) {
        return this._get(STORES.SNAPSHOTS, snapshotId);
    }
    
    async listSnapshots(limit = 50) {
        await this.ensureReady();
        
        return new Promise((resolve, reject) => {
            const store = this._transaction(STORES.SNAPSHOTS);
            const index = store.index('timestamp');
            const results = [];
            
            const request = index.openCursor(null, 'prev');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push({
                        id: cursor.value.id,
                        name: cursor.value.name,
                        timestamp: cursor.value.timestamp
                    });
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    async deleteSnapshot(snapshotId) {
        return this._delete(STORES.SNAPSHOTS, snapshotId);
    }
    
    async restoreSnapshot(snapshotId, runtime) {
        const snapshot = await this.loadSnapshot(snapshotId);
        if (snapshot && snapshot.state) {
            runtime.setState(snapshot.state);
            return true;
        }
        return false;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // EXPORT / IMPORT
    // ─────────────────────────────────────────────────────────────────────────
    
    async exportAll() {
        await this.ensureReady();
        
        const data = {
            version: FIELDSTORE_VERSION,
            timestamp: Date.now(),
            memory: await this._getAll(STORES.MEMORY),
            history: await this._getAll(STORES.HISTORY),
            energieboxen: await this._getAll(STORES.ENERGIEBOXEN),
            config: await this._getAll(STORES.CONFIG),
            sessions: await this._getAll(STORES.SESSIONS),
            snapshots: await this._getAll(STORES.SNAPSHOTS)
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    async importAll(jsonData) {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        if (data.version !== FIELDSTORE_VERSION) {
            console.warn('[FieldStore] Version mismatch, some data may not import correctly');
        }
        
        // Import each store
        if (data.memory) {
            for (const entry of data.memory) {
                await this._put(STORES.MEMORY, entry);
            }
        }
        
        if (data.history) {
            for (const entry of data.history) {
                await this._put(STORES.HISTORY, entry);
            }
        }
        
        if (data.energieboxen) {
            for (const entry of data.energieboxen) {
                await this._put(STORES.ENERGIEBOXEN, entry);
            }
        }
        
        if (data.config) {
            for (const entry of data.config) {
                await this._put(STORES.CONFIG, entry);
            }
        }
        
        if (data.sessions) {
            for (const entry of data.sessions) {
                await this._put(STORES.SESSIONS, entry);
            }
        }
        
        if (data.snapshots) {
            for (const entry of data.snapshots) {
                await this._put(STORES.SNAPSHOTS, entry);
            }
        }
        
        return true;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // MAINTENANCE
    // ─────────────────────────────────────────────────────────────────────────
    
    async getStats() {
        await this.ensureReady();
        
        return {
            memory: await this._count(STORES.MEMORY),
            history: await this._count(STORES.HISTORY),
            energieboxen: await this._count(STORES.ENERGIEBOXEN),
            config: await this._count(STORES.CONFIG),
            sessions: await this._count(STORES.SESSIONS),
            snapshots: await this._count(STORES.SNAPSHOTS)
        };
    }
    
    async clearAll() {
        await this.ensureReady();
        
        await this._clear(STORES.MEMORY);
        await this._clear(STORES.HISTORY);
        await this._clear(STORES.ENERGIEBOXEN);
        await this._clear(STORES.CONFIG);
        await this._clear(STORES.SESSIONS);
        await this._clear(STORES.SNAPSHOTS);
        
        return true;
    }
    
    async pruneHistory(maxEntries = 1000) {
        await this.ensureReady();
        
        const count = await this._count(STORES.HISTORY);
        if (count <= maxEntries) return 0;
        
        const toDelete = count - maxEntries;
        let deleted = 0;
        
        return new Promise((resolve, reject) => {
            const store = this._transaction(STORES.HISTORY, 'readwrite');
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'next');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && deleted < toDelete) {
                    cursor.delete();
                    deleted++;
                    cursor.continue();
                } else {
                    resolve(deleted);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.ready = false;
            this._initPromise = null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FieldStore, STORES, FIELDSTORE_VERSION };
}

if (typeof window !== 'undefined') {
    window.FieldStore = FieldStore;
    window.FIELDSTORE_STORES = STORES;
}
