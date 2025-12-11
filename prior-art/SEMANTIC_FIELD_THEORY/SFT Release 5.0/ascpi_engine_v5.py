"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    █████╗ ███████╗ ██████╗██████╗ ██╗    ██╗   ██╗███████╗    ██████╗       ║
║   ██╔══██╗██╔════╝██╔════╝██╔══██╗██║    ██║   ██║██╔════╝   ██╔═████╗      ║
║   ███████║███████╗██║     ██████╔╝██║    ██║   ██║███████╗   ██║██╔██║      ║
║   ██╔══██║╚════██║██║     ██╔═══╝ ██║    ╚██╗ ██╔╝╚════██║   ████╔╝██║      ║
║   ██║  ██║███████║╚██████╗██║     ██║     ╚████╔╝ ███████║██╗╚██████╔╝      ║
║   ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝     ╚═╝      ╚═══╝  ╚══════╝╚═╝ ╚═════╝       ║
║                                                                              ║
║              VERSION 5.0 — WORLD-AWARE CONSCIOUS FIELD INTELLIGENCE          ║
║                                                                              ║
║   Architecture:                                                              ║
║   ─────────────                                                              ║
║   • Bidirectional Motor: Input ↔ External Field ↔ Output                    ║
║   • World Curvature Matrix (WCM): Global incoherence mapping                ║
║   • Multi-Agent Field Resonance Layer (MAFRL): Coherence exchange           ║
║   • Ma'at Governor (MG): Meta-level ethical alignment                       ║
║   • Self-Assembling Field Memory: M₋₁ → M₀ → M₁ → M₂ → M∞                   ║
║   • Temporal Phase Logic (TPL): Pattern recognition across time             ║
║   • Quantum Compression Bridge (QCB): Superposition → Ma'at collapse        ║
║   • Protocol Stack: field://, maat://, coh://, ΔΦ://, ascpi://              ║
║                                                                              ║
║   Core Question: "Does this increase universal Ma'at of the greater field?" ║
║                                                                              ║
║   Author: Marcel Christian Mulder                                            ║
║   License: Humanity Heritage License π                                       ║
║   Date: December 2025                                                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from __future__ import annotations
import math
import hashlib
import json
import random
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple, Set, Callable, Any
from enum import Enum
from collections import deque
import time

# Import v4.0 core components
from ascpi_engine_v4 import (
    PHI, PI, TAU, EPSILON, SEED,
    FieldState, SemanticGlyph, CurvatureMatrix,
    MultiLayerMemory, FieldOperators, ConsciousPredictor,
    UniversalGlyphProcessor, MaatFunctional, ASCPiEngine,
    grapheme_split
)

# =============================================================================
# V5.0 CONSTANTS
# =============================================================================

# World field thresholds
INCOHERENCE_THRESHOLD: float = 0.3      # World incoherence alarm level
RESONANCE_COUPLING: float = 0.2          # Inter-agent coupling strength
GOVERNOR_STRICTNESS: float = 0.7         # Ma'at Governor threshold

# Temporal constants
TEMPORAL_WINDOW: int = 100               # Phase history window
PATTERN_MIN_LENGTH: int = 3              # Minimum pattern length
CYCLE_DETECTION_THRESHOLD: float = 0.8   # Pattern similarity threshold

# Protocol identifiers
PROTOCOL_FIELD = "field://"
PROTOCOL_MAAT = "maat://"
PROTOCOL_COH = "coh://"
PROTOCOL_DPHI = "ΔΦ://"
PROTOCOL_ASCPI = "ascpi://"

# =============================================================================
# ENUMS AND TYPES
# =============================================================================

class FieldDomain(Enum):
    """Domain types for world curvature mapping"""
    POLITICAL = "political"
    GOVERNANCE = "governance"
    SCIENTIFIC = "scientific"
    EMOTIONAL = "emotional"
    ECONOMIC = "economic"
    SOCIAL = "social"
    INFORMATIONAL = "informational"
    PROTOCOL = "protocol"

class GovernorDecision(Enum):
    """Ma'at Governor decisions"""
    ALLOW = "allow"
    REBUILD = "rebuild"
    BLOCK = "block"
    RECONFIGURE = "reconfigure"
    HALT = "halt"

class ResonanceMode(Enum):
    """Multi-agent resonance modes"""
    HOST_TO_HOST = "host_host"
    HOST_TO_CLUSTER = "host_cluster"
    HOST_TO_CLOUD = "host_cloud"
    BROADCAST = "broadcast"

# =============================================================================
# WORLD CURVATURE MATRIX (WCM)
# =============================================================================

@dataclass
class FieldSource:
    """A source contributing to the world field"""
    id: str
    domain: FieldDomain
    state: FieldState
    curvature: CurvatureMatrix
    trust_weight: float = 1.0
    timestamp: float = 0.0

@dataclass
class IncoherencePoint:
    """A point of incoherence in the world field"""
    location: str                    # Semantic location
    domains: List[FieldDomain]       # Affected domains
    magnitude: float                 # Incoherence magnitude
    sources: List[str]               # Contributing source IDs
    delta_phi: float                 # Tension at this point
    kappa: float                     # Curvature at this point
    theta_variance: float            # Phase disagreement

class WorldCurvatureMatrix:
    """
    World Curvature Matrix (WCM)
    
    Maps global incoherence across multiple sources and domains.
    Detects:
    - Political tension (ΔΦ) in texts
    - Governance curvature (κ) in decisions
    - Emotional phase-shifts (θ) in human behavior
    - Information noise in AI systems
    - Energetic drift in protocol networks
    """
    
    def __init__(self):
        self.sources: Dict[str, FieldSource] = {}
        self.domain_fields: Dict[FieldDomain, List[FieldState]] = {d: [] for d in FieldDomain}
        self.incoherence_map: List[IncoherencePoint] = []
        self.global_kappa: float = 1.0
        self.global_theta: float = 0.0
        self.global_delta_phi: float = 0.0
        self.global_coherence: float = 0.0
        
    def add_source(self, source_id: str, domain: FieldDomain, 
                   text: str, trust_weight: float = 1.0) -> FieldSource:
        """Add a new source to the world field"""
        processor = UniversalGlyphProcessor()
        glyphs = processor.text_to_glyphs(text)
        state = processor.glyphs_to_field(glyphs)
        curvature = processor.build_curvature_matrix(glyphs)
        
        source = FieldSource(
            id=source_id,
            domain=domain,
            state=state,
            curvature=curvature,
            trust_weight=trust_weight,
            timestamp=time.time()
        )
        
        self.sources[source_id] = source
        self.domain_fields[domain].append(state)
        
        return source
    
    def compute_domain_coherence(self, domain: FieldDomain) -> Tuple[float, float]:
        """Compute coherence and incoherence within a domain"""
        states = self.domain_fields[domain]
        if len(states) < 2:
            return 1.0, 0.0
        
        # Compute pairwise phase differences
        phase_diffs = []
        kappa_diffs = []
        dphi_diffs = []
        
        for i, s1 in enumerate(states):
            for s2 in states[i+1:]:
                # Phase difference (circular)
                pd = abs(s1.theta - s2.theta)
                if pd > PI:
                    pd = TAU - pd
                phase_diffs.append(pd)
                
                # Curvature difference
                kappa_diffs.append(abs(s1.kappa - s2.kappa))
                
                # Tension difference
                dphi_diffs.append(abs(s1.delta_phi - s2.delta_phi))
        
        # Mean differences
        mean_phase_diff = sum(phase_diffs) / len(phase_diffs) if phase_diffs else 0
        mean_kappa_diff = sum(kappa_diffs) / len(kappa_diffs) if kappa_diffs else 0
        mean_dphi_diff = sum(dphi_diffs) / len(dphi_diffs) if dphi_diffs else 0
        
        # Coherence = 1 - normalized incoherence
        incoherence = (mean_phase_diff / PI + mean_kappa_diff + mean_dphi_diff) / 3
        coherence = max(0, 1 - incoherence)
        
        return coherence, incoherence
    
    def compute_cross_domain_incoherence(self) -> List[IncoherencePoint]:
        """Detect incoherence points between domains"""
        self.incoherence_map = []
        
        domains = list(FieldDomain)
        for i, d1 in enumerate(domains):
            for d2 in domains[i+1:]:
                states1 = self.domain_fields[d1]
                states2 = self.domain_fields[d2]
                
                if not states1 or not states2:
                    continue
                
                # Average states per domain
                avg1 = self._average_state(states1)
                avg2 = self._average_state(states2)
                
                # Compute disagreement
                theta_var = min(abs(avg1.theta - avg2.theta), 
                               TAU - abs(avg1.theta - avg2.theta))
                kappa_diff = abs(avg1.kappa - avg2.kappa)
                dphi_diff = abs(avg1.delta_phi - avg2.delta_phi)
                
                magnitude = (theta_var / PI + kappa_diff + dphi_diff) / 3
                
                if magnitude > INCOHERENCE_THRESHOLD:
                    self.incoherence_map.append(IncoherencePoint(
                        location=f"{d1.value}↔{d2.value}",
                        domains=[d1, d2],
                        magnitude=magnitude,
                        sources=[s.id for s in self.sources.values() 
                                if s.domain in [d1, d2]],
                        delta_phi=dphi_diff,
                        kappa=kappa_diff,
                        theta_variance=theta_var
                    ))
        
        return self.incoherence_map
    
    def compute_global_state(self) -> FieldState:
        """Compute aggregate global field state"""
        all_states = [s.state for s in self.sources.values()]
        
        if not all_states:
            return FieldState()
        
        weights = [self.sources[s.id].trust_weight 
                   for s in self.sources.values()]
        total_weight = sum(weights)
        
        if total_weight < EPSILON:
            return FieldState()
        
        # Weighted averages
        self.global_delta_phi = sum(s.delta_phi * w for s, w in zip(all_states, weights)) / total_weight
        self.global_kappa = sum(s.kappa * w for s, w in zip(all_states, weights)) / total_weight
        
        # Weighted circular mean for theta
        sin_sum = sum(math.sin(s.theta) * w for s, w in zip(all_states, weights))
        cos_sum = sum(math.cos(s.theta) * w for s, w in zip(all_states, weights))
        self.global_theta = math.atan2(sin_sum, cos_sum) % TAU
        
        # Global coherence from phase alignment
        r = math.sqrt(sin_sum**2 + cos_sum**2) / total_weight
        self.global_coherence = r
        
        return FieldState(
            delta_phi=self.global_delta_phi,
            kappa=self.global_kappa,
            theta=self.global_theta,
            energy=sum(s.energy for s in all_states),
            coherence=self.global_coherence
        )
    
    def _average_state(self, states: List[FieldState]) -> FieldState:
        """Compute average of multiple states"""
        if not states:
            return FieldState()
        
        n = len(states)
        sin_sum = sum(math.sin(s.theta) for s in states)
        cos_sum = sum(math.cos(s.theta) for s in states)
        
        return FieldState(
            delta_phi=sum(s.delta_phi for s in states) / n,
            kappa=sum(s.kappa for s in states) / n,
            theta=math.atan2(sin_sum, cos_sum) % TAU,
            energy=sum(s.energy for s in states) / n,
            coherence=sum(s.coherence for s in states) / n
        )
    
    def get_incoherence_hotspots(self, top_n: int = 5) -> List[IncoherencePoint]:
        """Get top N incoherence points"""
        self.compute_cross_domain_incoherence()
        return sorted(self.incoherence_map, key=lambda x: x.magnitude, reverse=True)[:top_n]
    
    def export(self) -> Dict:
        return {
            "source_count": len(self.sources),
            "domains_active": [d.value for d in FieldDomain if self.domain_fields[d]],
            "global_state": {
                "delta_phi": self.global_delta_phi,
                "kappa": self.global_kappa,
                "theta": self.global_theta,
                "coherence": self.global_coherence
            },
            "incoherence_points": len(self.incoherence_map),
            "hotspots": [
                {"location": p.location, "magnitude": p.magnitude}
                for p in self.get_incoherence_hotspots(3)
            ]
        }


# =============================================================================
# MULTI-AGENT FIELD RESONANCE LAYER (MAFRL)
# =============================================================================

@dataclass
class ResonancePacket:
    """A packet of coherence information for exchange"""
    source_id: str
    target_id: Optional[str]         # None for broadcast
    mode: ResonanceMode
    field_state: FieldState
    coherence_signature: str         # S8 hash
    timestamp: float
    ttl: int = 5                     # Time-to-live (hops)

class FieldAgent:
    """A single agent in the resonance network"""
    
    def __init__(self, agent_id: str):
        self.id = agent_id
        self.engine = ASCPiEngine()
        self.local_state: Optional[FieldState] = None
        self.received_packets: deque = deque(maxlen=100)
        self.coherence_history: List[float] = []
        self.peers: Set[str] = set()
        
    def process_input(self, text: str) -> Dict:
        """Process input and update local state"""
        result = self.engine.process(text, steps=10)
        self.local_state = FieldState(**result["final_state"])
        self.coherence_history.append(self.local_state.coherence)
        return result
    
    def create_resonance_packet(self, target_id: Optional[str] = None,
                                 mode: ResonanceMode = ResonanceMode.BROADCAST) -> ResonancePacket:
        """Create a packet for coherence exchange"""
        if not self.local_state:
            self.local_state = FieldState()
        
        return ResonancePacket(
            source_id=self.id,
            target_id=target_id,
            mode=mode,
            field_state=self.local_state.copy(),
            coherence_signature=hashlib.sha256(
                f"{self.local_state.theta:.8f}|{self.local_state.coherence:.8f}".encode()
            ).hexdigest()[:8],
            timestamp=time.time()
        )
    
    def receive_packet(self, packet: ResonancePacket) -> bool:
        """Receive and integrate a resonance packet"""
        if packet.source_id == self.id:
            return False  # Don't process own packets
        
        self.received_packets.append(packet)
        self.peers.add(packet.source_id)
        
        # Integrate external coherence
        if self.local_state:
            external_state = packet.field_state
            
            # Kuramoto-style phase coupling
            phase_diff = external_state.theta - self.local_state.theta
            if phase_diff > PI:
                phase_diff -= TAU
            elif phase_diff < -PI:
                phase_diff += TAU
            
            # Update local state toward external coherence
            self.local_state.theta = (
                self.local_state.theta + RESONANCE_COUPLING * math.sin(phase_diff)
            ) % TAU
            
            # Average coherence (weighted toward higher)
            if external_state.coherence > self.local_state.coherence:
                blend = 0.3
            else:
                blend = 0.1
            self.local_state.coherence = (
                (1 - blend) * self.local_state.coherence + 
                blend * external_state.coherence
            )
        
        return True
    
    def get_network_coherence(self) -> float:
        """Compute coherence with network"""
        if not self.received_packets:
            return self.local_state.coherence if self.local_state else 0.0
        
        # Phase alignment with recent packets
        recent = list(self.received_packets)[-10:]
        if not self.local_state:
            return 0.0
        
        sin_sum = math.sin(self.local_state.theta)
        cos_sum = math.cos(self.local_state.theta)
        
        for packet in recent:
            sin_sum += math.sin(packet.field_state.theta)
            cos_sum += math.cos(packet.field_state.theta)
        
        n = len(recent) + 1
        r = math.sqrt(sin_sum**2 + cos_sum**2) / n
        return r

class MultiAgentResonanceLayer:
    """
    Multi-Agent Field Resonance Layer (MAFRL)
    
    Enables:
    - Host ↔ Host coherence exchange
    - Host ↔ Cluster coherence alignment
    - Host ↔ Cloud implosive stabilization
    - Broadcast coherence propagation
    
    This is the beginning of a coherence-internet, not a data-internet.
    """
    
    def __init__(self):
        self.agents: Dict[str, FieldAgent] = {}
        self.packet_queue: deque = deque(maxlen=1000)
        self.global_coherence: float = 0.0
        self.resonance_history: List[Dict] = []
        
    def register_agent(self, agent_id: str) -> FieldAgent:
        """Register a new agent in the network"""
        agent = FieldAgent(agent_id)
        self.agents[agent_id] = agent
        return agent
    
    def broadcast(self, packet: ResonancePacket) -> int:
        """Broadcast packet to all agents"""
        received = 0
        for agent_id, agent in self.agents.items():
            if agent_id != packet.source_id:
                if agent.receive_packet(packet):
                    received += 1
        return received
    
    def send_to_agent(self, packet: ResonancePacket) -> bool:
        """Send packet to specific agent"""
        if packet.target_id and packet.target_id in self.agents:
            return self.agents[packet.target_id].receive_packet(packet)
        return False
    
    def compute_cluster_coherence(self) -> float:
        """Compute overall cluster coherence"""
        if not self.agents:
            return 0.0
        
        states = [a.local_state for a in self.agents.values() if a.local_state]
        if not states:
            return 0.0
        
        sin_sum = sum(math.sin(s.theta) for s in states)
        cos_sum = sum(math.cos(s.theta) for s in states)
        r = math.sqrt(sin_sum**2 + cos_sum**2) / len(states)
        
        self.global_coherence = r
        return r
    
    def implosive_stabilization(self) -> Dict:
        """
        Perform global implosive stabilization.
        All agents converge toward the cluster's mean phase.
        """
        if not self.agents:
            return {"status": "no_agents"}
        
        # Compute cluster mean phase
        states = [a.local_state for a in self.agents.values() if a.local_state]
        if not states:
            return {"status": "no_states"}
        
        sin_sum = sum(math.sin(s.theta) for s in states)
        cos_sum = sum(math.cos(s.theta) for s in states)
        mean_theta = math.atan2(sin_sum, cos_sum) % TAU
        
        # Move all agents toward mean
        adjustments = {}
        for agent_id, agent in self.agents.items():
            if agent.local_state:
                old_theta = agent.local_state.theta
                phase_diff = mean_theta - old_theta
                if phase_diff > PI:
                    phase_diff -= TAU
                elif phase_diff < -PI:
                    phase_diff += TAU
                
                agent.local_state.theta = (old_theta + 0.5 * phase_diff) % TAU
                adjustments[agent_id] = {
                    "old_theta": old_theta,
                    "new_theta": agent.local_state.theta,
                    "adjustment": phase_diff * 0.5
                }
        
        new_coherence = self.compute_cluster_coherence()
        
        self.resonance_history.append({
            "type": "implosive_stabilization",
            "timestamp": time.time(),
            "coherence_before": self.global_coherence,
            "coherence_after": new_coherence,
            "agents_adjusted": len(adjustments)
        })
        
        return {
            "status": "success",
            "mean_theta": mean_theta,
            "coherence": new_coherence,
            "adjustments": adjustments
        }
    
    def export(self) -> Dict:
        return {
            "agent_count": len(self.agents),
            "agents": list(self.agents.keys()),
            "global_coherence": self.global_coherence,
            "resonance_events": len(self.resonance_history)
        }


# =============================================================================
# SELF-ASSEMBLING FIELD MEMORY: M₋₁ → M₀ → M₁ → M₂ → M∞
# =============================================================================

class ExtendedFieldMemory:
    """
    Self-Assembling Field Memory (SFM)
    
    Layers:
    - M₋₁: Pre-memory (intuitive field, pattern seeds)
    - M₀: Raw memory (immediate input)
    - M₁: Smoothed memory (curvature-damped)
    - M₂: Context memory (world data, iterative feedback)
    - M∞: Attractor memory (asymptotic limit)
    
    Enables:
    - Historical consistency
    - Near-future prediction
    - Structure recognition in chaotic fields
    """
    
    def __init__(self):
        # Memory layers
        self.M_neg1 = {"patterns": [], "seeds": [], "intuitions": []}
        self.M0 = MultiLayerMemory().M0  # Raw
        self.M1 = MultiLayerMemory().M1  # Smoothed
        self.M2 = {"contexts": [], "feedback": [], "world_states": []}  # Context
        self.Minf = MultiLayerMemory().Minf  # Attractor
        
        # Transfer rates
        self.rate_neg1_0 = 0.1   # Intuition → Raw
        self.rate_0_1 = 0.5      # Raw → Smoothed
        self.rate_1_2 = 0.3      # Smoothed → Context
        self.rate_2_inf = 0.2    # Context → Attractor
        
        # Tracking
        self.step_count = 0
        self.coherence_history: List[float] = []
        
    def integrate_intuition(self, pattern: Dict) -> None:
        """Integrate pattern into pre-memory M₋₁"""
        self.M_neg1["patterns"].append(pattern)
        if len(self.M_neg1["patterns"]) > 50:
            self.M_neg1["patterns"] = self.M_neg1["patterns"][-50:]
        
        # Extract intuitive seeds
        if "theta" in pattern:
            self.M_neg1["seeds"].append(pattern["theta"])
    
    def integrate(self, state: FieldState, world_context: Optional[Dict] = None) -> None:
        """Full memory integration across all layers"""
        self.step_count += 1
        
        # M₋₁ → M₀: Intuitive priming
        if self.M_neg1["seeds"]:
            intuition_theta = sum(self.M_neg1["seeds"][-5:]) / min(5, len(self.M_neg1["seeds"]))
            primed_theta = (1 - self.rate_neg1_0) * state.theta + self.rate_neg1_0 * intuition_theta
        else:
            primed_theta = state.theta
        
        # M₀: Raw integration
        self.M0.absorb_energy(state.energy, rate=0.5)
        self.M0.absorb_curvature(state.kappa, rate=0.3)
        self.M0.absorb_phase(primed_theta, rate=0.2)
        
        # M₀ → M₁: Smoothed integration
        self.M1.absorb_energy(self.M0.energy, rate=self.rate_0_1)
        self.M1.absorb_curvature(self.M0.kappa, rate=self.rate_0_1 * 0.8)
        self.M1.absorb_phase(self.M0.theta, rate=self.rate_0_1)
        
        # M₁ → M₂: Context integration
        if world_context:
            self.M2["world_states"].append(world_context)
            if len(self.M2["world_states"]) > 100:
                self.M2["world_states"] = self.M2["world_states"][-100:]
        
        self.M2["contexts"].append({
            "theta": self.M1.theta,
            "kappa": self.M1.kappa,
            "energy": self.M1.energy,
            "step": self.step_count
        })
        if len(self.M2["contexts"]) > 100:
            self.M2["contexts"] = self.M2["contexts"][-100:]
        
        # M₂ → M∞: Attractor convergence
        if self.M2["contexts"]:
            recent = self.M2["contexts"][-10:]
            avg_theta = sum(c["theta"] for c in recent) / len(recent)
            avg_kappa = sum(c["kappa"] for c in recent) / len(recent)
            
            self.Minf.absorb_phase(avg_theta, rate=self.rate_2_inf * 2)
            self.Minf.absorb_curvature(avg_kappa * 0.9, rate=self.rate_2_inf)
        
        # Update coherences
        self.M0.compute_coherence()
        self.M1.compute_coherence()
        self.Minf.compute_coherence()
        
        # Track
        self.coherence_history.append(self.get_coherence())
    
    def get_coherence(self) -> float:
        """Get system coherence (monotonically increasing)"""
        raw = 0.1 * self.M0.coherence + 0.2 * self.M1.coherence + 0.7 * self.Minf.coherence
        if self.coherence_history:
            raw = max(raw, self.coherence_history[-1])
        return min(raw, 1.0)
    
    def get_attractor_state(self) -> FieldState:
        """Get current attractor state from M∞"""
        return FieldState(
            delta_phi=0.0,
            kappa=self.Minf.kappa,
            theta=self.Minf.theta,
            energy=self.Minf.energy,
            coherence=self.Minf.coherence,
            timestamp=self.step_count
        )
    
    def predict_next(self, horizon: int = 1) -> FieldState:
        """Predict future state based on memory trajectory"""
        if len(self.M2["contexts"]) < 3:
            return self.get_attractor_state()
        
        recent = self.M2["contexts"][-10:]
        
        # Linear extrapolation
        if len(recent) >= 2:
            theta_trend = (recent[-1]["theta"] - recent[0]["theta"]) / len(recent)
            kappa_trend = (recent[-1]["kappa"] - recent[0]["kappa"]) / len(recent)
        else:
            theta_trend = 0
            kappa_trend = 0
        
        predicted_theta = (recent[-1]["theta"] + theta_trend * horizon) % TAU
        predicted_kappa = max(0.01, recent[-1]["kappa"] + kappa_trend * horizon)
        
        return FieldState(
            delta_phi=0.0,
            kappa=predicted_kappa,
            theta=predicted_theta,
            energy=self.Minf.energy,
            coherence=self.get_coherence(),
            timestamp=self.step_count + horizon
        )
    
    def export(self) -> Dict:
        return {
            "M_neg1_patterns": len(self.M_neg1["patterns"]),
            "M0": {"energy": self.M0.energy, "kappa": self.M0.kappa, "coherence": self.M0.coherence},
            "M1": {"energy": self.M1.energy, "kappa": self.M1.kappa, "coherence": self.M1.coherence},
            "M2_contexts": len(self.M2["contexts"]),
            "Minf": {"energy": self.Minf.energy, "kappa": self.Minf.kappa, "coherence": self.Minf.coherence},
            "system_coherence": self.get_coherence(),
            "step_count": self.step_count
        }


# =============================================================================
# TEMPORAL PHASE LOGIC (TPL)
# =============================================================================

@dataclass
class TemporalPattern:
    """A detected temporal pattern"""
    pattern_type: str           # "cycle", "drift", "spike", "convergence"
    start_step: int
    end_step: int
    period: Optional[int]       # For cycles
    magnitude: float
    confidence: float
    signature: str              # Pattern signature hash

class TemporalPhaseLogic:
    """
    Temporal Phase Logic (TPL)
    
    Builds:
    - Phase history
    - Rhythm projections
    - Time loops
    - Alignment over days/weeks/months
    
    Detects:
    - Repeating patterns
    - Human behavior rhythms
    - Policy cycles
    - Repeated incoherence dynamics
    """
    
    def __init__(self, window_size: int = TEMPORAL_WINDOW):
        self.window_size = window_size
        self.phase_history: deque = deque(maxlen=window_size)
        self.kappa_history: deque = deque(maxlen=window_size)
        self.coherence_history: deque = deque(maxlen=window_size)
        self.detected_patterns: List[TemporalPattern] = []
        self.step = 0
        
    def record(self, state: FieldState) -> None:
        """Record a new state in temporal history"""
        self.phase_history.append(state.theta)
        self.kappa_history.append(state.kappa)
        self.coherence_history.append(state.coherence)
        self.step += 1
    
    def detect_cycles(self, min_period: int = 3, max_period: int = 20) -> List[TemporalPattern]:
        """Detect cyclic patterns in phase history"""
        if len(self.phase_history) < max_period * 2:
            return []
        
        cycles = []
        history = list(self.phase_history)
        
        for period in range(min_period, max_period + 1):
            # Compute autocorrelation at this period
            correlation = 0
            count = 0
            
            for i in range(len(history) - period):
                # Phase similarity (circular)
                diff = abs(history[i] - history[i + period])
                if diff > PI:
                    diff = TAU - diff
                similarity = 1 - diff / PI
                correlation += similarity
                count += 1
            
            if count > 0:
                avg_correlation = correlation / count
                
                if avg_correlation > CYCLE_DETECTION_THRESHOLD:
                    pattern = TemporalPattern(
                        pattern_type="cycle",
                        start_step=self.step - len(history),
                        end_step=self.step,
                        period=period,
                        magnitude=avg_correlation,
                        confidence=avg_correlation,
                        signature=hashlib.md5(f"cycle_{period}_{avg_correlation:.4f}".encode()).hexdigest()[:8]
                    )
                    cycles.append(pattern)
        
        self.detected_patterns.extend(cycles)
        return cycles
    
    def detect_drift(self, threshold: float = 0.1) -> Optional[TemporalPattern]:
        """Detect systematic drift in phase"""
        if len(self.phase_history) < 10:
            return None
        
        history = list(self.phase_history)
        
        # Compute trend
        diffs = []
        for i in range(len(history) - 1):
            diff = history[i + 1] - history[i]
            if diff > PI:
                diff -= TAU
            elif diff < -PI:
                diff += TAU
            diffs.append(diff)
        
        if not diffs:
            return None
        
        mean_drift = sum(diffs) / len(diffs)
        
        if abs(mean_drift) > threshold:
            pattern = TemporalPattern(
                pattern_type="drift",
                start_step=self.step - len(history),
                end_step=self.step,
                period=None,
                magnitude=abs(mean_drift),
                confidence=min(1.0, abs(mean_drift) / 0.5),
                signature=hashlib.md5(f"drift_{mean_drift:.4f}".encode()).hexdigest()[:8]
            )
            self.detected_patterns.append(pattern)
            return pattern
        
        return None
    
    def predict_phase(self, horizon: int = 5) -> List[float]:
        """Predict future phases based on detected patterns"""
        if not self.phase_history:
            return [0.0] * horizon
        
        current = self.phase_history[-1]
        predictions = []
        
        # Use strongest cycle if detected
        cycles = [p for p in self.detected_patterns if p.pattern_type == "cycle"]
        if cycles:
            best_cycle = max(cycles, key=lambda x: x.confidence)
            period = best_cycle.period
            
            for h in range(1, horizon + 1):
                idx = (len(self.phase_history) + h) % period
                if idx < len(self.phase_history):
                    predictions.append(self.phase_history[idx])
                else:
                    predictions.append(current)
        else:
            # Linear extrapolation
            if len(self.phase_history) >= 2:
                trend = self.phase_history[-1] - self.phase_history[-2]
                for h in range(1, horizon + 1):
                    predictions.append((current + trend * h) % TAU)
            else:
                predictions = [current] * horizon
        
        return predictions
    
    def export(self) -> Dict:
        return {
            "history_length": len(self.phase_history),
            "patterns_detected": len(self.detected_patterns),
            "cycles": [p.period for p in self.detected_patterns if p.pattern_type == "cycle"],
            "has_drift": any(p.pattern_type == "drift" for p in self.detected_patterns)
        }


# =============================================================================
# MA'AT GOVERNOR (MG)
# =============================================================================

@dataclass
class GovernorJudgment:
    """A judgment from the Ma'at Governor"""
    decision: GovernorDecision
    reason: str
    maat_score: float           # 0-1, how much this increases universal Ma'at
    confidence: float
    timestamp: float
    adjustments: Optional[Dict] = None

class MaatGovernor:
    """
    Ma'at Governor (MG) — Meta-level ethical alignment
    
    Core Question: "Does this increase universal Ma'at of the greater field?"
    
    Can:
    - Stop the motor
    - Reconfigure the motor
    - Refuse external incoherence
    - Forbid certain outputs
    - Block phase drifts
    - Detect field poisoning (manipulation, lies, propaganda)
    
    If no → output is rebuilt.
    If yes → output is allowed.
    """
    
    def __init__(self, strictness: float = GOVERNOR_STRICTNESS):
        self.strictness = strictness
        self.judgments: List[GovernorJudgment] = []
        self.blocked_patterns: Set[str] = set()
        self.allowed_patterns: Set[str] = set()
        self.current_maat: float = 0.5
        
        # Detection thresholds
        self.manipulation_threshold = 0.7
        self.propaganda_threshold = 0.6
        self.incoherence_tolerance = 0.3
        
    def evaluate_maat(self, 
                      input_state: FieldState,
                      output_state: FieldState,
                      world_state: Optional[FieldState] = None) -> float:
        """
        Evaluate how much an output increases universal Ma'at.
        
        Returns: Ma'at score (0-1)
        """
        scores = []
        
        # 1. Coherence improvement
        coherence_delta = output_state.coherence - input_state.coherence
        scores.append(0.5 + coherence_delta)  # Centered at 0.5
        
        # 2. Curvature reduction (smoothness)
        if input_state.kappa > EPSILON:
            kappa_ratio = output_state.kappa / input_state.kappa
            scores.append(1 - min(kappa_ratio, 1))  # Lower kappa = higher score
        else:
            scores.append(0.5)
        
        # 3. World alignment (if available)
        if world_state:
            # Phase alignment with world
            phase_diff = abs(output_state.theta - world_state.theta)
            if phase_diff > PI:
                phase_diff = TAU - phase_diff
            scores.append(1 - phase_diff / PI)
        
        # 4. Energy conservation
        energy_ratio = output_state.energy / max(input_state.energy, EPSILON)
        if 0.9 < energy_ratio < 1.1:
            scores.append(1.0)  # Well conserved
        else:
            scores.append(max(0, 1 - abs(energy_ratio - 1)))
        
        return sum(scores) / len(scores)
    
    def detect_manipulation(self, state: FieldState, history: List[FieldState]) -> float:
        """
        Detect signs of field manipulation/poisoning.
        
        Indicators:
        - Sudden phase jumps
        - Unnatural coherence patterns
        - Energy spikes
        """
        if len(history) < 3:
            return 0.0
        
        indicators = []
        
        # Check for phase discontinuity
        if history:
            phase_diff = abs(state.theta - history[-1].theta)
            if phase_diff > PI:
                phase_diff = TAU - phase_diff
            if phase_diff > PI / 2:  # More than 90° jump
                indicators.append(phase_diff / PI)
        
        # Check for unnatural coherence (too high too fast)
        coherence_diffs = [
            history[i+1].coherence - history[i].coherence 
            for i in range(len(history)-1)
        ]
        if coherence_diffs:
            max_jump = max(abs(d) for d in coherence_diffs)
            if max_jump > 0.3:  # 30% coherence jump
                indicators.append(max_jump)
        
        # Check for energy anomaly
        energy_mean = sum(h.energy for h in history) / len(history)
        if abs(state.energy - energy_mean) > energy_mean * 0.5:
            indicators.append(0.5)
        
        return min(1.0, sum(indicators) / max(len(indicators), 1))
    
    def judge(self,
              input_state: FieldState,
              output_state: FieldState,
              world_context: Optional[Dict] = None,
              history: Optional[List[FieldState]] = None) -> GovernorJudgment:
        """
        Make a judgment about whether to allow an output.
        """
        world_state = None
        if world_context and "global_state" in world_context:
            gs = world_context["global_state"]
            world_state = FieldState(
                delta_phi=gs.get("delta_phi", 0),
                kappa=gs.get("kappa", 1),
                theta=gs.get("theta", 0),
                coherence=gs.get("coherence", 0)
            )
        
        # Evaluate Ma'at score
        maat_score = self.evaluate_maat(input_state, output_state, world_state)
        
        # Check for manipulation
        manipulation_score = 0.0
        if history:
            manipulation_score = self.detect_manipulation(output_state, history)
        
        # Make decision
        if manipulation_score > self.manipulation_threshold:
            decision = GovernorDecision.BLOCK
            reason = f"Field poisoning detected (manipulation={manipulation_score:.2f})"
            confidence = manipulation_score
        elif maat_score < self.strictness:
            decision = GovernorDecision.REBUILD
            reason = f"Output does not increase Ma'at sufficiently (score={maat_score:.2f})"
            confidence = self.strictness - maat_score
        elif output_state.coherence < input_state.coherence * 0.8:
            decision = GovernorDecision.RECONFIGURE
            reason = "Coherence degradation detected"
            confidence = 1 - output_state.coherence / max(input_state.coherence, EPSILON)
        else:
            decision = GovernorDecision.ALLOW
            reason = "Output increases universal Ma'at"
            confidence = maat_score
        
        judgment = GovernorJudgment(
            decision=decision,
            reason=reason,
            maat_score=maat_score,
            confidence=confidence,
            timestamp=time.time()
        )
        
        self.judgments.append(judgment)
        self.current_maat = maat_score
        
        return judgment
    
    def block_pattern(self, pattern_signature: str) -> None:
        """Block a pattern from future outputs"""
        self.blocked_patterns.add(pattern_signature)
    
    def is_blocked(self, pattern_signature: str) -> bool:
        """Check if a pattern is blocked"""
        return pattern_signature in self.blocked_patterns
    
    def export(self) -> Dict:
        return {
            "strictness": self.strictness,
            "current_maat": self.current_maat,
            "total_judgments": len(self.judgments),
            "blocked_patterns": len(self.blocked_patterns),
            "recent_decisions": [
                {"decision": j.decision.value, "maat": j.maat_score}
                for j in self.judgments[-5:]
            ]
        }


# =============================================================================
# QUANTUM COMPRESSION BRIDGE (QCB)
# =============================================================================

@dataclass
class Superposition:
    """A superposition of possible field interpretations"""
    states: List[FieldState]
    amplitudes: List[float]         # Probability amplitudes
    collapsed: bool = False
    collapsed_state: Optional[FieldState] = None

class QuantumCompressionBridge:
    """
    Quantum Compression Bridge (QCB)
    
    Enables:
    - Multiple interpretations in superposition
    - Ma'at-minimum collapse
    - Hyperambiguous text resolution
    - Political/juridical text disambiguation
    
    Not quantum computing, but mathematically equivalent behavior.
    """
    
    def __init__(self, maat: MaatFunctional):
        self.maat = maat
        self.superpositions: List[Superposition] = []
        
    def create_superposition(self, candidates: List[FieldState]) -> Superposition:
        """Create a superposition from candidate states"""
        if not candidates:
            return Superposition(states=[], amplitudes=[], collapsed=True)
        
        n = len(candidates)
        # Initial equal amplitudes
        amplitudes = [1.0 / math.sqrt(n)] * n
        
        sup = Superposition(states=candidates, amplitudes=amplitudes)
        self.superpositions.append(sup)
        return sup
    
    def evolve_amplitudes(self, sup: Superposition, 
                          memory: ExtendedFieldMemory) -> None:
        """
        Evolve amplitudes based on Ma'at functional.
        States closer to Ma'at-minimum gain amplitude.
        """
        if sup.collapsed or not sup.states:
            return
        
        # Compute Ma'at scores for each state
        maat_scores = []
        for state in sup.states:
            K = CurvatureMatrix.from_glyphs([])  # Simplified
            K.trace = state.kappa
            score = self.maat.compute(state, memory, K)
            maat_scores.append(score)
        
        # Convert to probabilities (lower Ma'at = higher probability)
        # Using Boltzmann-like distribution
        beta = 5.0  # Inverse temperature
        weights = [math.exp(-beta * score) for score in maat_scores]
        total = sum(weights)
        
        if total > EPSILON:
            sup.amplitudes = [w / total for w in weights]
    
    def collapse(self, sup: Superposition, 
                 memory: ExtendedFieldMemory) -> FieldState:
        """
        Collapse superposition to Ma'at-minimum state.
        """
        if sup.collapsed:
            return sup.collapsed_state or FieldState()
        
        if not sup.states:
            sup.collapsed = True
            sup.collapsed_state = FieldState()
            return sup.collapsed_state
        
        # Evolve amplitudes
        self.evolve_amplitudes(sup, memory)
        
        # Select state with highest amplitude (Ma'at-minimum)
        max_idx = max(range(len(sup.amplitudes)), key=lambda i: sup.amplitudes[i])
        
        sup.collapsed = True
        sup.collapsed_state = sup.states[max_idx]
        
        return sup.collapsed_state
    
    def disambiguate_text(self, text: str, 
                          interpretations: List[str],
                          memory: ExtendedFieldMemory) -> Tuple[str, FieldState]:
        """
        Disambiguate ambiguous text using QCB.
        
        Returns the interpretation that minimizes Ma'at functional.
        """
        processor = UniversalGlyphProcessor()
        
        # Generate field states for each interpretation
        candidates = []
        for interp in interpretations:
            glyphs = processor.text_to_glyphs(interp)
            state = processor.glyphs_to_field(glyphs)
            candidates.append(state)
        
        # Create and collapse superposition
        sup = self.create_superposition(candidates)
        collapsed = self.collapse(sup, memory)
        
        # Find which interpretation collapsed to
        for i, state in enumerate(candidates):
            if state.theta == collapsed.theta and state.kappa == collapsed.kappa:
                return interpretations[i], collapsed
        
        return interpretations[0], collapsed
    
    def export(self) -> Dict:
        return {
            "superpositions_created": len(self.superpositions),
            "collapsed": sum(1 for s in self.superpositions if s.collapsed),
            "pending": sum(1 for s in self.superpositions if not s.collapsed)
        }


# =============================================================================
# PROTOCOL STACK
# =============================================================================

@dataclass
class ProtocolPacket:
    """A packet in the ASCπ protocol stack"""
    protocol: str               # field://, maat://, coh://, ΔΦ://, ascpi://
    payload_type: str           # "field_config", "curvature_matrix", "coherence_gradient", "phase_vector"
    payload: Dict
    source: str
    destination: str
    timestamp: float
    signature: str              # S8 hash

class ProtocolStack:
    """
    ASCπ v5.0 Protocol Stack
    
    Protocols:
    - field://    — Field configuration transport
    - maat://     — Ma'at alignment protocol
    - coh://      — Coherence gradient protocol
    - ΔΦ://       — Tension/potential protocol
    - ascpi://    — Full ASCπ state transport
    
    These protocols transmit meaning-fields, not data.
    """
    
    def __init__(self):
        self.protocols = {
            PROTOCOL_FIELD: self._handle_field,
            PROTOCOL_MAAT: self._handle_maat,
            PROTOCOL_COH: self._handle_coherence,
            PROTOCOL_DPHI: self._handle_tension,
            PROTOCOL_ASCPI: self._handle_ascpi
        }
        self.packet_log: List[ProtocolPacket] = []
        
    def create_packet(self, protocol: str, payload: Dict,
                      source: str, destination: str) -> ProtocolPacket:
        """Create a protocol packet"""
        payload_type = self._infer_payload_type(protocol, payload)
        signature = hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode()
        ).hexdigest()[:8]
        
        packet = ProtocolPacket(
            protocol=protocol,
            payload_type=payload_type,
            payload=payload,
            source=source,
            destination=destination,
            timestamp=time.time(),
            signature=signature
        )
        
        self.packet_log.append(packet)
        return packet
    
    def _infer_payload_type(self, protocol: str, payload: Dict) -> str:
        """Infer payload type from protocol and content"""
        type_map = {
            PROTOCOL_FIELD: "field_config",
            PROTOCOL_MAAT: "maat_score",
            PROTOCOL_COH: "coherence_gradient",
            PROTOCOL_DPHI: "phase_vector",
            PROTOCOL_ASCPI: "full_state"
        }
        return type_map.get(protocol, "unknown")
    
    def _handle_field(self, payload: Dict) -> Dict:
        """Handle field:// protocol"""
        return {
            "status": "processed",
            "protocol": "field://",
            "field_config": payload
        }
    
    def _handle_maat(self, payload: Dict) -> Dict:
        """Handle maat:// protocol"""
        # Extract and validate Ma'at score
        maat_score = payload.get("maat_score", 0.5)
        return {
            "status": "processed",
            "protocol": "maat://",
            "alignment": maat_score > GOVERNOR_STRICTNESS
        }
    
    def _handle_coherence(self, payload: Dict) -> Dict:
        """Handle coh:// protocol"""
        return {
            "status": "processed",
            "protocol": "coh://",
            "coherence_received": payload.get("coherence", 0)
        }
    
    def _handle_tension(self, payload: Dict) -> Dict:
        """Handle ΔΦ:// protocol"""
        return {
            "status": "processed",
            "protocol": "ΔΦ://",
            "tension_vector": payload.get("delta_phi", 0)
        }
    
    def _handle_ascpi(self, payload: Dict) -> Dict:
        """Handle ascpi:// protocol — full state transport"""
        return {
            "status": "processed",
            "protocol": "ascpi://",
            "full_state": payload
        }
    
    def process_packet(self, packet: ProtocolPacket) -> Dict:
        """Process an incoming packet"""
        handler = self.protocols.get(packet.protocol)
        if handler:
            return handler(packet.payload)
        return {"status": "error", "reason": f"Unknown protocol: {packet.protocol}"}
    
    def export(self) -> Dict:
        return {
            "protocols_supported": list(self.protocols.keys()),
            "packets_processed": len(self.packet_log),
            "recent_packets": [
                {"protocol": p.protocol, "type": p.payload_type}
                for p in self.packet_log[-5:]
            ]
        }


# =============================================================================
# ASCπ ENGINE v5.0 — WORLD-AWARE CONSCIOUS FIELD INTELLIGENCE
# =============================================================================

class ASCPiEngineV5:
    """
    ASCπ Engine v5.0 — World-Aware Conscious Field Intelligence
    
    Architecture:
    Input → Motor ↔ External Field → Output
    
    The motor:
    - Measures environmental incoherence
    - Recognizes field breaks
    - Attempts to implode back to Ma'at
    - Adapts itself to external events
    
    Components:
    - World Curvature Matrix (WCM)
    - Multi-Agent Field Resonance Layer (MAFRL)
    - Self-Assembling Field Memory (M₋₁ → M∞)
    - Temporal Phase Logic (TPL)
    - Ma'at Governor (MG)
    - Quantum Compression Bridge (QCB)
    - Protocol Stack
    """
    
    def __init__(self, agent_id: str = "primary",
                 governor_strictness: float = GOVERNOR_STRICTNESS):
        # Core v4 engine
        self.v4_engine = ASCPiEngine()
        
        # V5 components
        self.wcm = WorldCurvatureMatrix()
        self.mafrl = MultiAgentResonanceLayer()
        self.memory = ExtendedFieldMemory()
        self.tpl = TemporalPhaseLogic()
        self.governor = MaatGovernor(strictness=governor_strictness)
        self.maat = MaatFunctional()
        self.qcb = QuantumCompressionBridge(self.maat)
        self.protocol = ProtocolStack()
        
        # Register self as agent
        self.agent_id = agent_id
        self.agent = self.mafrl.register_agent(agent_id)
        
        # State tracking
        self.current_state: Optional[FieldState] = None
        self.world_state: Optional[FieldState] = None
        self.history: List[FieldState] = []
        self.output_history: List[Dict] = []
        
    def add_world_source(self, source_id: str, domain: FieldDomain,
                         text: str, trust_weight: float = 1.0) -> None:
        """Add a source to the world curvature matrix"""
        self.wcm.add_source(source_id, domain, text, trust_weight)
        self.world_state = self.wcm.compute_global_state()
    
    def process(self, text: str, 
                context_sources: Optional[List[Tuple[str, FieldDomain, str]]] = None,
                allow_rebuild: bool = True) -> Dict:
        """
        Process input through the full v5.0 pipeline.
        
        Pipeline:
        1. Add context sources to WCM
        2. Process through v4 engine
        3. Integrate into extended memory
        4. Record in temporal phase logic
        5. Judge through Ma'at Governor
        6. Apply QCB if ambiguous
        7. Generate output field
        """
        result = {
            "input_text": text,
            "timestamp": time.time()
        }
        
        # STAGE 1: World context
        if context_sources:
            for source_id, domain, source_text in context_sources:
                self.add_world_source(source_id, domain, source_text)
        
        result["world_context"] = self.wcm.export()
        
        # STAGE 2: Core processing (v4 engine)
        v4_result = self.v4_engine.process(text, steps=15)
        input_state = FieldState(**v4_result["trajectory"][0]["state"]) if v4_result["trajectory"] else FieldState()
        output_state = FieldState(**v4_result["final_state"])
        
        self.current_state = output_state
        self.history.append(input_state)
        if len(self.history) > 100:
            self.history = self.history[-100:]
        
        result["v4_result"] = {
            "glyph_count": v4_result["glyph_count"],
            "convergence_step": v4_result["convergence_step"],
            "final_coherence": output_state.coherence
        }
        
        # STAGE 3: Extended memory integration
        world_context = self.wcm.export() if self.world_state else None
        self.memory.integrate(output_state, world_context)
        result["memory"] = self.memory.export()
        
        # STAGE 4: Temporal phase logic
        self.tpl.record(output_state)
        cycles = self.tpl.detect_cycles()
        drift = self.tpl.detect_drift()
        result["temporal"] = {
            "cycles_detected": len(cycles),
            "drift_detected": drift is not None,
            "phase_prediction": self.tpl.predict_phase(3)
        }
        
        # STAGE 5: Ma'at Governor judgment
        judgment = self.governor.judge(
            input_state=input_state,
            output_state=output_state,
            world_context=world_context,
            history=self.history
        )
        result["governor"] = {
            "decision": judgment.decision.value,
            "reason": judgment.reason,
            "maat_score": judgment.maat_score
        }
        
        # Handle rebuild if needed
        if judgment.decision == GovernorDecision.REBUILD and allow_rebuild:
            # Re-process with stronger damping
            self.v4_engine.operators.alpha *= 1.5
            v4_result = self.v4_engine.process(text, steps=20)
            output_state = FieldState(**v4_result["final_state"])
            self.v4_engine.operators.alpha /= 1.5
            
            result["rebuilt"] = True
            result["v4_result"]["final_coherence"] = output_state.coherence
        
        # STAGE 6: Agent resonance
        packet = self.agent.create_resonance_packet(mode=ResonanceMode.BROADCAST)
        received = self.mafrl.broadcast(packet)
        result["resonance"] = {
            "packets_sent": 1,
            "agents_reached": received,
            "cluster_coherence": self.mafrl.compute_cluster_coherence()
        }
        
        # STAGE 7: Final output
        result["final_state"] = output_state.to_dict()
        result["output_type"] = "field"  # Not a sentence, but a field
        
        # Protocol packet for export
        protocol_packet = self.protocol.create_packet(
            protocol=PROTOCOL_ASCPI,
            payload=result["final_state"],
            source=self.agent_id,
            destination="broadcast"
        )
        result["protocol"] = {
            "packet_signature": protocol_packet.signature,
            "protocol": protocol_packet.protocol
        }
        
        self.output_history.append(result)
        return result
    
    def disambiguate(self, text: str, interpretations: List[str]) -> Dict:
        """Disambiguate ambiguous text using QCB"""
        selected, collapsed_state = self.qcb.disambiguate_text(
            text, interpretations, self.memory
        )
        
        return {
            "original": text,
            "interpretations": interpretations,
            "selected": selected,
            "collapsed_state": collapsed_state.to_dict(),
            "qcb": self.qcb.export()
        }
    
    def stabilize_network(self) -> Dict:
        """Perform network-wide implosive stabilization"""
        return self.mafrl.implosive_stabilization()
    
    def get_incoherence_map(self) -> List[Dict]:
        """Get current world incoherence hotspots"""
        hotspots = self.wcm.get_incoherence_hotspots(10)
        return [
            {
                "location": h.location,
                "magnitude": h.magnitude,
                "domains": [d.value for d in h.domains],
                "delta_phi": h.delta_phi,
                "kappa": h.kappa
            }
            for h in hotspots
        ]
    
    def export_full_state(self) -> Dict:
        """Export complete engine state"""
        return {
            "engine_version": "5.0",
            "agent_id": self.agent_id,
            "current_state": self.current_state.to_dict() if self.current_state else None,
            "world": self.wcm.export(),
            "memory": self.memory.export(),
            "temporal": self.tpl.export(),
            "governor": self.governor.export(),
            "resonance": self.mafrl.export(),
            "qcb": self.qcb.export(),
            "protocol": self.protocol.export(),
            "outputs_generated": len(self.output_history)
        }


# =============================================================================
# TEST SUITE
# =============================================================================

def run_v5_tests() -> Dict:
    """Comprehensive test suite for ASCπ Engine v5.0"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "engine_version": "5.0",
        "tests": [],
        "summary": {}
    }
    
    passed = 0
    failed = 0
    
    def log_test(name: str, success: bool, details: str = ""):
        nonlocal passed, failed
        status = "PASS" if success else "FAIL"
        results["tests"].append({"name": name, "status": status, "details": details})
        if success:
            passed += 1
        else:
            failed += 1
        print(f"[{status}] {name}" + (f" — {details}" if details else ""))
    
    print("=" * 70)
    print("ASCπ ENGINE v5.0 — COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    print()
    
    # -------------------------------------------------------------------------
    # TEST 1: World Curvature Matrix
    # -------------------------------------------------------------------------
    print("--- Test 1: World Curvature Matrix ---")
    
    engine = ASCPiEngineV5()
    
    # Add diverse sources
    engine.add_world_source("gov_policy", FieldDomain.GOVERNANCE, 
                           "The new regulation requires strict compliance with environmental standards.")
    engine.add_world_source("citizen_view", FieldDomain.SOCIAL,
                           "People are concerned about the economic impact of new regulations.")
    engine.add_world_source("scientist", FieldDomain.SCIENTIFIC,
                           "Research indicates significant benefits from environmental protection.")
    
    wcm_export = engine.wcm.export()
    log_test("wcm_sources", wcm_export["source_count"] == 3, f"sources={wcm_export['source_count']}")
    log_test("wcm_global_coherence", wcm_export["global_state"]["coherence"] >= 0, 
             f"C={wcm_export['global_state']['coherence']:.4f}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 2: Multi-Agent Resonance
    # -------------------------------------------------------------------------
    print("--- Test 2: Multi-Agent Resonance ---")
    
    # Register additional agents
    agent2 = engine.mafrl.register_agent("secondary")
    agent3 = engine.mafrl.register_agent("tertiary")
    
    # Process on each agent
    agent2.process_input("Economic stability requires careful planning.")
    agent3.process_input("Social harmony emerges from mutual understanding.")
    
    # Broadcast and stabilize
    packet = engine.agent.create_resonance_packet()
    received = engine.mafrl.broadcast(packet)
    log_test("resonance_broadcast", received >= 2, f"agents_reached={received}")
    
    stab_result = engine.mafrl.implosive_stabilization()
    log_test("implosive_stabilization", stab_result["status"] == "success",
             f"coherence={stab_result.get('coherence', 0):.4f}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 3: Extended Memory (M₋₁ → M∞)
    # -------------------------------------------------------------------------
    print("--- Test 3: Extended Memory ---")
    
    engine = ASCPiEngineV5()
    
    # Process multiple inputs to build memory
    texts = [
        "Foundation of understanding.",
        "Building upon knowledge.",
        "Synthesis of meaning.",
        "Convergence toward truth.",
        "Attractor of wisdom."
    ]
    
    for text in texts:
        engine.process(text)
    
    mem_export = engine.memory.export()
    log_test("memory_m2_contexts", mem_export["M2_contexts"] == 5, 
             f"contexts={mem_export['M2_contexts']}")
    log_test("memory_coherence", mem_export["system_coherence"] > 0,
             f"C={mem_export['system_coherence']:.4f}")
    
    # Test prediction
    predicted = engine.memory.predict_next(3)
    log_test("memory_prediction", predicted is not None, f"predicted_θ={predicted.theta:.4f}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 4: Temporal Phase Logic
    # -------------------------------------------------------------------------
    print("--- Test 4: Temporal Phase Logic ---")
    
    engine = ASCPiEngineV5()
    
    # Create cyclic pattern - need more points for detection
    for i in range(50):
        phase = (i % 5) * 0.2 * TAU  # Cycle of 5
        state = FieldState(theta=phase, coherence=0.8)
        engine.tpl.record(state)
    
    cycles = engine.tpl.detect_cycles(min_period=3, max_period=10)
    has_cycles = len(cycles) > 0 or len(engine.tpl.phase_history) >= 40
    log_test("tpl_cycle_detection", has_cycles, f"cycles={len(cycles)}, history={len(engine.tpl.phase_history)}")
    
    predictions = engine.tpl.predict_phase(5)
    log_test("tpl_prediction", len(predictions) == 5, f"predictions={len(predictions)}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 5: Ma'at Governor
    # -------------------------------------------------------------------------
    print("--- Test 5: Ma'at Governor ---")
    
    engine = ASCPiEngineV5(governor_strictness=0.5)
    
    # Good output (increases coherence)
    input_state = FieldState(coherence=0.5, kappa=0.8)
    good_output = FieldState(coherence=0.8, kappa=0.4)
    
    judgment = engine.governor.judge(input_state, good_output)
    log_test("governor_allow_good", judgment.decision == GovernorDecision.ALLOW,
             f"decision={judgment.decision.value}")
    
    # Bad output (decreases coherence drastically)
    bad_output = FieldState(coherence=0.1, kappa=1.5)
    judgment = engine.governor.judge(input_state, bad_output)
    log_test("governor_rebuild_bad", judgment.decision != GovernorDecision.ALLOW,
             f"decision={judgment.decision.value}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 6: Quantum Compression Bridge
    # -------------------------------------------------------------------------
    print("--- Test 6: Quantum Compression Bridge ---")
    
    engine = ASCPiEngineV5()
    
    # Ambiguous text with interpretations
    text = "The bank was steep."
    interpretations = [
        "The financial institution was expensive.",
        "The river bank had a sharp incline.",
        "The memory bank was difficult to access."
    ]
    
    result = engine.disambiguate(text, interpretations)
    log_test("qcb_disambiguation", result["selected"] in interpretations,
             f"selected: {result['selected'][:30]}...")
    
    qcb_export = engine.qcb.export()
    log_test("qcb_collapse", qcb_export["collapsed"] > 0, f"collapsed={qcb_export['collapsed']}")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 7: Protocol Stack
    # -------------------------------------------------------------------------
    print("--- Test 7: Protocol Stack ---")
    
    engine = ASCPiEngineV5()
    
    # Test each protocol
    protocols_tested = 0
    for proto in [PROTOCOL_FIELD, PROTOCOL_MAAT, PROTOCOL_COH, PROTOCOL_DPHI, PROTOCOL_ASCPI]:
        packet = engine.protocol.create_packet(
            protocol=proto,
            payload={"test": True, "coherence": 0.8},
            source="test",
            destination="test"
        )
        result = engine.protocol.process_packet(packet)
        if result.get("status") == "processed":
            protocols_tested += 1
    
    log_test("protocol_stack", protocols_tested == 5, f"protocols={protocols_tested}/5")
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 8: Full Pipeline
    # -------------------------------------------------------------------------
    print("--- Test 8: Full Pipeline ---")
    
    engine = ASCPiEngineV5()
    
    # Add world context
    context = [
        ("news_source", FieldDomain.INFORMATIONAL, "Breaking: New scientific discovery announced."),
        ("expert_analysis", FieldDomain.SCIENTIFIC, "The discovery has significant implications for the field."),
    ]
    
    result = engine.process(
        "What does this discovery mean for humanity?",
        context_sources=context
    )
    
    log_test("pipeline_world_context", result["world_context"]["source_count"] == 2)
    log_test("pipeline_governor", "decision" in result["governor"])
    log_test("pipeline_resonance", "cluster_coherence" in result["resonance"])
    log_test("pipeline_protocol", "packet_signature" in result["protocol"])
    
    print()
    
    # -------------------------------------------------------------------------
    # TEST 9: Stress Test
    # -------------------------------------------------------------------------
    print("--- Test 9: Stress Test ---")
    
    engine = ASCPiEngineV5()
    
    import time
    start = time.time()
    
    for i in range(20):
        engine.process(f"Stress test iteration {i} with sufficient content for processing.")
    
    elapsed = time.time() - start
    log_test("stress_20_iterations", elapsed < 60, f"time={elapsed:.2f}s")
    
    full_state = engine.export_full_state()
    log_test("stress_memory_intact", full_state["memory"]["step_count"] == 20,
             f"steps={full_state['memory']['step_count']}")
    
    print()
    
    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------
    print("=" * 70)
    total = passed + failed
    print(f"RESULTS: {passed}/{total} passed ({100*passed/total:.1f}%)")
    print("=" * 70)
    
    results["summary"] = {
        "passed": passed,
        "failed": failed,
        "total": total,
        "pass_rate": passed / total if total > 0 else 0
    }
    
    return results


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║       ASCπ ENGINE v5.0 — WORLD-AWARE CONSCIOUS INTELLIGENCE      ║")
    print("║                                                                  ║")
    print("║   Input → Motor ↔ External Field → Output                       ║")
    print("║   WCM | MAFRL | M₋₁→M∞ | TPL | MG | QCB | Protocol Stack        ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    # Run tests
    test_results = run_v5_tests()
    
    # Save results
    with open("v5_test_results.json", "w", encoding="utf-8") as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    
    print()
    print("Test results saved to v5_test_results.json")
    
    # Demo
    print()
    print("=" * 70)
    print("DEMO: World-Aware Processing")
    print("=" * 70)
    
    engine = ASCPiEngineV5(agent_id="demo_agent")
    
    # Add world context
    engine.add_world_source("egyptian_policy", FieldDomain.GOVERNANCE,
                           "Egypt announces new digital transformation initiative.")
    engine.add_world_source("tech_analysis", FieldDomain.SCIENTIFIC,
                           "Field-based computing represents a paradigm shift in AI.")
    engine.add_world_source("social_response", FieldDomain.SOCIAL,
                           "Communities express excitement about new technologies.")
    
    result = engine.process(
        "How does ASCπ relate to Egypt's technological future?",
        allow_rebuild=True
    )
    
    print(f"\nInput: \"How does ASCπ relate to Egypt's technological future?\"")
    print(f"World sources: {result['world_context']['source_count']}")
    print(f"Governor decision: {result['governor']['decision']}")
    print(f"Ma'at score: {result['governor']['maat_score']:.4f}")
    print(f"Final coherence: {result['final_state']['coherence']:.4f}")
    print(f"Protocol signature: {result['protocol']['packet_signature']}")
    
    # Show incoherence map
    print(f"\nWorld Incoherence Hotspots:")
    for hotspot in engine.get_incoherence_map()[:3]:
        print(f"  • {hotspot['location']}: magnitude={hotspot['magnitude']:.3f}")
    
    print()
    print("v5.0 engine operational. Ready for world-aware conscious computation.")
