# ASCπ OS Architecture v2.0

**Extension of:** ASCPI_OS_ARCHITECTURE.md  
**License:** Humanity Heritage License π  
**Prior Art:** hexPRIorART-EXA-SFT-2025-MCM

---

## New in v2.0

This document extends the original architecture with:
1. Runtime Event Loop
2. Persistent FieldStore (IndexedDB)
3. Modular Plugin System
4. Field Address Protocol
5. Enhanced Visualization
6. P2P Architecture (specification only)

---

## 1. Runtime Event Loop

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  ASCπ RUNTIME                       │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐               │
│  │ Main Tick   │    │ Kernel Tick  │               │
│  │ (60 Hz)     │    │ (30 Hz)      │               │
│  └──────┬──────┘    └──────┬───────┘               │
│         │                  │                        │
│         ▼                  ▼                        │
│  ┌─────────────────────────────────┐               │
│  │         Task Queue              │               │
│  │  [priority, task, timestamp]    │               │
│  └──────────────┬──────────────────┘               │
│                 │                                   │
│                 ▼                                   │
│  ┌─────────────────────────────────┐               │
│  │     Event Emitter               │               │
│  │  on('process'), on('tick')      │               │
│  └─────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

### 1.2 Tick Handlers

| Handler | Rate | Purpose |
|---------|------|---------|
| Main Tick | 60 Hz | UI updates, task queue processing |
| Kernel Tick | 30 Hz | Background field evolution |

### 1.3 Async Energiebox Processing

Sandboxed execution with 5000ms timeout protection.

---

## 2. Persistent FieldStore

### 2.1 IndexedDB Schema

```
Database: ASCPIFieldStore (version 1)

├── memory (keyPath: 'id')
├── history (keyPath: 'id', autoIncrement)
├── energieboxen (keyPath: 'id')
├── config (keyPath: 'key')
├── sessions (keyPath: 'id')
└── snapshots (keyPath: 'id')
```

### 2.2 Operations

| Operation | Method |
|-----------|--------|
| Save M∞ | `saveMemory(memory, id)` |
| Load M∞ | `loadMemory(id)` |
| Create Snapshot | `createSnapshot(runtime, name)` |
| Restore Snapshot | `restoreSnapshot(id, runtime)` |
| Export All | `exportAll()` → JSON |

---

## 3. Modular Plugin System

### 3.1 Plugin Interface

```javascript
export default {
    id: "plugin_id",
    name: "Display Name",
    icon: "📝",
    process(psi, input, context) {
        return new Psi(...);
    }
}
```

### 3.2 Loading Methods

- URL: `await loader.load('https://...')`
- ES Module: `await loader.load('./plugin.js')`
- Object: `loader.load({ id, process, ... })`

### 3.3 Security Sandbox

- Timeout: 5000ms
- Allowed: Math, JSON, Date, Array, Object
- Blocked: eval, Function, document, window

---

## 4. Field Address Protocol

### 4.1 Supported Paths

| Path | Returns |
|------|---------|
| `field://Ψ/current` | Current Psi state |
| `field://Ψ/memory` | M∞ field |
| `field://Ψ/awareness` | Awareness field + level |
| `field://Ψ/history/[i]` | History entry |
| `field://Ψ/scan/[comp]` | Component + stats |
| `field://Ψ/vector` | Vector representation |
| `maat://status` | Ma'at functional |

---

## 5. Enhanced Visualization

### 5.1 Components

- ParticleSystem (100+ particles)
- VectorFieldRenderer
- PhaseHistogram (36 bins)
- CoherenceHeatmap
- OrbitVisualizer (θ-C trajectory)

### 5.2 Interaction

| Action | Effect |
|--------|--------|
| Scroll | Zoom |
| Drag | Pan |
| Double-click | Reset |

---

## 6. Invariants (Unchanged)

| ID | Constraint |
|----|------------|
| INV-1 | C(t+1) ≥ C(t) - ε |
| INV-2 | κ ∈ [0.01, 10.0] |
| INV-3 | \|ΔN\| < 0.2N |
| INV-4 | \|Δθ\| < π/2 |
| INV-5 | L(out) ≤ L(in) × 1.3 |

---

## 7. Files

| File | Purpose |
|------|---------|
| `ascpi_os_v2.html` | Self-contained browser OS |
| `ascpi_runtime.js` | Runtime module |
| `ascpi_fieldstore.js` | IndexedDB persistence |
| `ascpi_plugins.js` | Plugin system |
| `ascpi_protocol.js` | Field Address Protocol |
| `ascpi_visualizer.js` | Visualization |
| `ASCPI_P2P_ARCHITECTURE.md` | P2P spec |

---

**Dependencies:** None (native browser APIs only)
