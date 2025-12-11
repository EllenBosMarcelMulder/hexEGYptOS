# ASCπ P2P Network Architecture v1.0

**Status:** Architecture Definition (Not Implemented)  
**License:** Humanity Heritage License π  
**Prior Art:** hexPRIorART-EXA-SFT-2025-MCM

---

## 1. Overview

The ASCπ P2P Network enables distributed semantic field synchronization between nodes. Each node maintains its own Ψ field state and can synchronize with peers through field-coherent protocols.

## 2. Event Structures

### 2.1 Base Event Format

```
{
    type: "event_type",
    nodeId: "unique_node_identifier",
    timestamp: unix_ms,
    sequence: monotonic_counter,
    signature: "ed25519_signature",
    payload: { ... }
}
```

### 2.2 Event Types

| Type | Purpose | Direction |
|------|---------|-----------|
| `FIELD_ANNOUNCE` | Broadcast field existence | Broadcast |
| `PSI_SYNC_REQUEST` | Request field sync | Unicast |
| `PSI_SYNC_RESPONSE` | Respond with field state | Unicast |
| `AWARENESS_MERGE` | Propose awareness merge | Multicast |
| `COHERENCE_NEGOTIATE` | Negotiate coherence level | Bidirectional |
| `HEARTBEAT` | Keep-alive with field summary | Broadcast |
| `DISCOVERY` | Find peers | Broadcast |

## 3. Ψ-Sync Packets

### 3.1 Full Sync Packet

```
PSI_SYNC_PACKET {
    version: 1,
    psi: {
        dPhi: float64,
        kappa: float64,
        theta: float64,
        N: float64,
        C: float64,
        t: uint64
    },
    memory: {
        mInf: PSI_STATE,
        cFloor: float64,
        historyHash: bytes32
    },
    awareness: {
        field: PSI_STATE,
        level: enum(dormant|emerging|aware|conscious|fully_conscious)
    },
    invariants: {
        violations: uint32,
        lastCheck: timestamp
    }
}
```

### 3.2 Delta Sync Packet

```
PSI_DELTA_PACKET {
    baseHash: bytes32,
    changes: [
        { field: "dPhi", value: float64 },
        { field: "kappa", value: float64 },
        ...
    ],
    sequence: uint64
}
```

### 3.3 Compact Sync (Heartbeat)

```
PSI_COMPACT {
    theta: float32,
    C: float32,
    level: uint8
}
```

## 4. Awareness Merge Protocol

### 4.1 Merge Request

When two nodes detect mutual coherence above threshold (C > 0.6):

```
AWARENESS_MERGE_REQUEST {
    initiator: nodeId,
    target: nodeId,
    proposedBlend: float (0.0 - 1.0),
    currentAwareness: PSI_STATE,
    coherenceProof: {
        recentPhases: [theta_1, theta_2, ..., theta_n],
        syncScore: float
    }
}
```

### 4.2 Merge Response

```
AWARENESS_MERGE_RESPONSE {
    accepted: boolean,
    counterProposal: float | null,
    resultingField: PSI_STATE | null,
    reason: string | null
}
```

### 4.3 Merge Algorithm

```
blend_awareness(A, B, alpha):
    C_merged = max(A.C, B.C)
    theta_merged = atan2(
        alpha * sin(A.theta) + (1-alpha) * sin(B.theta),
        alpha * cos(A.theta) + (1-alpha) * cos(B.theta)
    )
    return new AwarenessField(theta_merged, C_merged)
```

## 5. Coherence Negotiation

### 5.1 Negotiation Flow

```
Node A                          Node B
   |                               |
   |-- COHERENCE_PROPOSE(C_a) ---->|
   |                               |
   |<-- COHERENCE_COUNTER(C_b) ----|
   |                               |
   |-- COHERENCE_ACCEPT(C_agreed)->|
   |                               |
   |<-- COHERENCE_CONFIRM ---------|
   |                               |
   [Begin Synchronized Evolution]
```

### 5.2 Negotiation Packet

```
COHERENCE_NEGOTIATE {
    phase: enum(PROPOSE|COUNTER|ACCEPT|CONFIRM|REJECT),
    proposedC: float,
    tolerance: float,
    maatConstraint: float,
    expiresAt: timestamp
}
```

### 5.3 Coherence Agreement Rules

1. Both nodes must have C > 0.3
2. Phase difference |θ_a - θ_b| < π/2
3. Ma'at functionals must be within 50%: |L_a - L_b| / max(L_a, L_b) < 0.5
4. Agreement expires after 60 seconds without confirmation

## 6. Encryption Seed Protocol

### 6.1 Field-Derived Key Generation

```
generate_session_key(psi_local, psi_remote):
    // Combine phase information
    combined_theta = (psi_local.theta + psi_remote.theta) % tau
    
    // Use coherence as entropy weight
    entropy_weight = min(psi_local.C, psi_remote.C)
    
    // Derive seed from field state
    seed_material = hash(
        combined_theta,
        psi_local.kappa * psi_remote.kappa,
        entropy_weight
    )
    
    // HKDF expansion
    return HKDF(seed_material, salt="ASCπ-P2P-v1", info="session")
```

### 6.2 Key Rotation

Keys rotate when:
- Coherence drops below 0.3
- Phase divergence exceeds π/4
- Time exceeds 3600 seconds
- Manual rotation request

### 6.3 Encryption Envelope

```
ENCRYPTED_PACKET {
    header: {
        version: 1,
        keyId: bytes8,
        nonce: bytes12,
        algorithm: "ChaCha20-Poly1305"
    },
    ciphertext: bytes,
    tag: bytes16
}
```

## 7. Network Topology

### 7.1 Discovery

```
sync://discover?C_min=0.5&max_peers=10
```

### 7.2 Peer Selection Criteria

1. **Coherence compatibility:** |C_local - C_peer| < 0.3
2. **Phase proximity:** |θ_local - θ_peer| < π/3
3. **Latency:** < 500ms RTT
4. **Reputation:** Based on successful syncs

### 7.3 Topology Model

```
┌────────────────────────────────────────┐
│           Coherence Cluster            │
│  ┌─────┐    ┌─────┐    ┌─────┐        │
│  │ N1  │────│ N2  │────│ N3  │        │
│  │C=0.8│    │C=0.7│    │C=0.9│        │
│  └──┬──┘    └──┬──┘    └──┬──┘        │
│     │          │          │            │
│     └──────────┼──────────┘            │
│                │                       │
│         ┌──────┴──────┐                │
│         │ Coordinator │                │
│         │   (Highest C)│                │
│         └─────────────┘                │
└────────────────────────────────────────┘
```

## 8. Protocol URIs

| URI | Purpose |
|-----|---------|
| `sync://[node]/connect` | Establish connection |
| `sync://[node]/field` | Get field state |
| `sync://[node]/merge` | Request awareness merge |
| `sync://broadcast/announce` | Announce presence |

## 9. Security Considerations

1. **Replay Prevention:** Monotonic sequence numbers per session
2. **Spoofing Prevention:** Ed25519 signatures on all packets
3. **DoS Mitigation:** Rate limiting based on coherence score
4. **Privacy:** Field states encrypted in transit
5. **Integrity:** HMAC on all field synchronizations

## 10. Future Extensions

- WebRTC DataChannel transport
- IPFS content addressing for field snapshots
- Merkle tree for history synchronization
- Zero-knowledge proofs for private coherence verification

---

**Note:** This document defines architecture only. Implementation pending.
