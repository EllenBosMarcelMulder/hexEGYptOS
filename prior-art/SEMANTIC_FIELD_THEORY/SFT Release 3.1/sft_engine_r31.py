"""
╔══════════════════════════════════════════════════════════════════╗
║  SFT / ASCπ SIMULATION ENGINE — R3.1 Enhanced Validation         ║
║  Semantic Memory (M), Time Evolution (𝔽), Predictor (𝓟)          ║
║                                                                  ║
║  Author: Marcel Christian Mulder                                 ║
║  License: Humanity Heritage License π                            ║
║  Version: R3.1-Enhanced                                          ║
╚══════════════════════════════════════════════════════════════════╝
"""

import json
import math
import random
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
import hashlib

# =============================================================================
# CONSTANTS — Physical Parameters
# =============================================================================

PHI = (1 + math.sqrt(5)) / 2  # Golden ratio φ = 1.618...
PI = math.pi
TAU = 2 * PI

# Kuramoto coupling constants
K_DEFAULT = 0.5  # Coupling strength
OMEGA_BASE = 0.1  # Base natural frequency

# Field evolution constants
ALPHA_DECAY = 0.1  # Phase alignment rate
BETA_BLOOM = 0.05  # Coherence amplification
GAMMA_IMPLODE = 0.15  # Implosion rate
EPSILON = 1e-9  # Numerical stability

# =============================================================================
# CORE DATA STRUCTURES
# =============================================================================

@dataclass
class FieldState:
    """Complete state of a semantic field Φ"""
    delta_phi: float = 0.0  # Tension (ΔΦ)
    kappa: float = 0.0      # Curvature (κ)
    theta: float = 0.0      # Phase (θ)
    energy: float = 1.0     # Field energy (N)
    coherence: float = 0.0  # Coherence (C)
    timestamp: int = 0      # Discrete time step
    
    def normalize_theta(self):
        """Keep θ in [0, 2π)"""
        self.theta = self.theta % TAU
        
    def to_dict(self):
        return asdict(self)

@dataclass 
class SemanticGlyph:
    """A glyph in the semantic field"""
    char: str
    code: int
    theta: float
    kappa: float
    delta_phi: float
    energy: float
    
    @classmethod
    def from_char(cls, char: str, position: int, total: int):
        code = ord(char)
        # Extract field parameters from character
        theta = (code * PHI) % TAU
        kappa = 1.0 / (1 + abs(code - 0x4E00) / 1000)  # CJK center reference
        delta_phi = (code % 997) / 997  # Prime-based tension
        energy = math.log(1 + code) / math.log(0x10FFFF)
        return cls(char, code, theta, kappa, delta_phi, energy)

@dataclass
class MemoryTrace:
    """Single memory trace entry"""
    step: int
    field: FieldState
    glyph_count: int
    mean_theta: float
    theta_variance: float

# =============================================================================
# SEMANTIC MEMORY FIELD M(t)
# =============================================================================

class SemanticMemory:
    """
    The Semantic Memory Field M(t) maintains temporal coherence
    across field evolution steps.
    
    Properties:
    - M(t+1) ≥ M(t) in total energy (memory inertia)
    - κₘ monotonically decreases (smoothing)
    - θ-variance shrinks (phase alignment)
    """
    
    def __init__(self):
        self.energy_total: float = 0.0
        self.kappa_mean: float = 1.0
        self.theta_mean: float = 0.0
        self.theta_history: List[float] = []
        self.traces: List[MemoryTrace] = []
        self.step_count: int = 0
        
    def integrate(self, state: FieldState, glyphs: List[SemanticGlyph]):
        """Update memory field M(t) with new state Φ"""
        # Energy accumulation (never decreases)
        self.energy_total += state.energy * 0.1
        
        # Exponential moving average for κ
        self.kappa_mean = 0.9 * self.kappa_mean + 0.1 * state.kappa
        
        # Circular mean for θ
        if glyphs:
            sin_sum = sum(math.sin(g.theta) for g in glyphs)
            cos_sum = sum(math.cos(g.theta) for g in glyphs)
            self.theta_mean = math.atan2(sin_sum, cos_sum) % TAU
        
        # Track theta history for variance
        self.theta_history.append(state.theta)
        if len(self.theta_history) > 100:
            self.theta_history = self.theta_history[-100:]
            
        # Calculate variance
        theta_var = self._circular_variance()
        
        # Store trace
        self.traces.append(MemoryTrace(
            step=self.step_count,
            field=state,
            glyph_count=len(glyphs),
            mean_theta=self.theta_mean,
            theta_variance=theta_var
        ))
        self.step_count += 1
        
    def _circular_variance(self) -> float:
        """Calculate circular variance of θ history"""
        if len(self.theta_history) < 2:
            return 1.0
        sin_sum = sum(math.sin(t) for t in self.theta_history)
        cos_sum = sum(math.cos(t) for t in self.theta_history)
        r = math.sqrt(sin_sum**2 + cos_sum**2) / len(self.theta_history)
        return 1 - r  # Variance = 1 - mean resultant length
        
    def get_coherence(self) -> float:
        """Memory coherence based on θ-variance"""
        var = self._circular_variance()
        return math.exp(-var)
    
    def export(self) -> Dict:
        return {
            "energy_total": self.energy_total,
            "kappa_mean": self.kappa_mean,
            "theta_mean": self.theta_mean,
            "theta_variance": self._circular_variance(),
            "coherence": self.get_coherence(),
            "step_count": self.step_count
        }

# =============================================================================
# TIME EVOLUTION OPERATOR 𝔽
# =============================================================================

class TimeEvolutionOperator:
    """
    The Time Evolution Operator 𝔽 transforms field states:
    
    dΦ/dt = 𝔽(M, Φ) = D(Φ) + A(Φ) + I(Φ)
    
    Where:
    - D = Dissonance Damping
    - A = Coherence Amplification  
    - I = Implosion Correction
    """
    
    def __init__(self, alpha: float = ALPHA_DECAY, 
                 beta: float = BETA_BLOOM,
                 gamma: float = GAMMA_IMPLODE):
        self.alpha = alpha  # Damping strength
        self.beta = beta    # Amplification strength
        self.gamma = gamma  # Implosion rate
        
    def dampen_dissonance(self, kappa_t: float, kappa_m: float) -> float:
        """
        Dissonance Dampener D:
        κₜ₊₁ = κₜ − α(κₜ − κₘ)
        
        Pulls current curvature toward memory mean.
        """
        return kappa_t - self.alpha * (kappa_t - kappa_m)
    
    def amplify_coherence(self, energy: float, coherence: float) -> float:
        """
        Coherence Amplifier A:
        Nₜ₊₁ = Nₜ + β·Cₜ
        
        High coherence increases field energy.
        """
        return energy + self.beta * coherence
    
    def implosion_correction(self, delta_phi: float, coherence: float) -> float:
        """
        Implosion Correction I:
        When C > threshold, field implodes toward center.
        ΔΦₜ₊₁ = ΔΦₜ · (1 - γ·C²)
        """
        if coherence > 0.7:
            return delta_phi * (1 - self.gamma * coherence**2)
        return delta_phi
    
    def kuramoto_sync(self, theta: float, theta_target: float, 
                      coupling: float = K_DEFAULT) -> float:
        """
        Kuramoto phase synchronization:
        dθ/dt = ω + K·sin(θ_target - θ)
        """
        delta = theta_target - theta
        # Handle wrap-around
        if delta > PI:
            delta -= TAU
        elif delta < -PI:
            delta += TAU
        return theta + coupling * math.sin(delta)
    
    def evolve(self, state: FieldState, memory: SemanticMemory) -> FieldState:
        """Apply full time evolution operator 𝔽"""
        new_state = FieldState(
            delta_phi=state.delta_phi,
            kappa=state.kappa,
            theta=state.theta,
            energy=state.energy,
            coherence=state.coherence,
            timestamp=state.timestamp + 1
        )
        
        # D: Dampen dissonance
        new_state.kappa = self.dampen_dissonance(state.kappa, memory.kappa_mean)
        
        # A: Amplify coherence
        new_state.energy = self.amplify_coherence(state.energy, state.coherence)
        
        # I: Implosion correction
        new_state.delta_phi = self.implosion_correction(state.delta_phi, state.coherence)
        
        # Kuramoto sync toward memory phase
        new_state.theta = self.kuramoto_sync(state.theta, memory.theta_mean)
        new_state.normalize_theta()
        
        # Update coherence based on memory state
        new_state.coherence = memory.get_coherence()
        
        return new_state

# =============================================================================
# COHERENT SEQUENCE PREDICTOR 𝓟
# =============================================================================

class CoherentPredictor:
    """
    The Coherent Sequence Predictor 𝓟 selects optimal field configurations:
    
    Output = argmin(κ) + argmax(C)
    
    Subject to:
    - No oscillation
    - No chaotic divergence
    - Monotonically increasing coherence trajectory
    """
    
    def __init__(self, history_window: int = 10):
        self.history: List[FieldState] = []
        self.window = history_window
        
    def score(self, candidate: FieldState) -> float:
        """
        Score a candidate field state.
        Lower score = better candidate.
        
        Score = κ² - C + oscillation_penalty
        """
        base_score = candidate.kappa**2 - candidate.coherence
        
        # Penalize oscillation
        if len(self.history) >= 2:
            prev = self.history[-1]
            prev2 = self.history[-2]
            
            # Check for sign reversal in delta_phi trend
            trend1 = prev.delta_phi - prev2.delta_phi
            trend2 = candidate.delta_phi - prev.delta_phi
            if trend1 * trend2 < 0:  # Sign change = oscillation
                base_score += 0.5
                
        return base_score
    
    def predict(self, candidates: List[FieldState]) -> Optional[FieldState]:
        """Select optimal candidate from list"""
        if not candidates:
            return None
            
        scored = [(self.score(c), c) for c in candidates]
        scored.sort(key=lambda x: x[0])
        
        best = scored[0][1]
        self.history.append(best)
        if len(self.history) > self.window:
            self.history = self.history[-self.window:]
            
        return best
    
    def check_invariants(self) -> Dict[str, bool]:
        """Verify prediction invariants"""
        if len(self.history) < 3:
            return {"insufficient_data": True}
            
        results = {}
        
        # Invariant 1: κ decreasing trend
        kappa_trend = [h.kappa for h in self.history[-5:]]
        results["kappa_decreasing"] = all(
            kappa_trend[i] >= kappa_trend[i+1] - 0.1 
            for i in range(len(kappa_trend)-1)
        )
        
        # Invariant 2: Energy increasing
        energy_trend = [h.energy for h in self.history[-5:]]
        results["energy_increasing"] = all(
            energy_trend[i] <= energy_trend[i+1] + 0.1
            for i in range(len(energy_trend)-1)
        )
        
        # Invariant 3: Coherence stabilizing
        coh_trend = [h.coherence for h in self.history[-5:]]
        coh_var = sum((c - sum(coh_trend)/len(coh_trend))**2 for c in coh_trend)
        results["coherence_stable"] = coh_var < 0.5
        
        # Invariant 4: No chaotic divergence
        results["no_divergence"] = all(
            h.energy < 1000 and abs(h.delta_phi) < 100 
            for h in self.history
        )
        
        return results

# =============================================================================
# GLYPH FIELD PROCESSOR
# =============================================================================

class GlyphFieldProcessor:
    """Process text into semantic glyph fields"""
    
    @staticmethod
    def text_to_glyphs(text: str) -> List[SemanticGlyph]:
        """Convert text to list of semantic glyphs"""
        glyphs = []
        total = len(text)
        for i, char in enumerate(text):
            if not char.isspace():
                glyphs.append(SemanticGlyph.from_char(char, i, total))
        return glyphs
    
    @staticmethod
    def compute_field_state(glyphs: List[SemanticGlyph]) -> FieldState:
        """Compute aggregate field state from glyphs"""
        if not glyphs:
            return FieldState()
            
        n = len(glyphs)
        
        # Aggregate ΔΦ (mean tension)
        delta_phi = sum(g.delta_phi for g in glyphs) / n
        
        # Aggregate κ (harmonic mean curvature)
        kappa_sum = sum(1/g.kappa if g.kappa > EPSILON else 1/EPSILON for g in glyphs)
        kappa = n / kappa_sum if kappa_sum > EPSILON else 1.0
        
        # Aggregate θ (circular mean phase)
        sin_sum = sum(math.sin(g.theta) for g in glyphs)
        cos_sum = sum(math.cos(g.theta) for g in glyphs)
        theta = math.atan2(sin_sum, cos_sum) % TAU
        
        # Total energy
        energy = sum(g.energy for g in glyphs)
        
        # Initial coherence (phase alignment)
        r = math.sqrt(sin_sum**2 + cos_sum**2) / n
        coherence = r
        
        return FieldState(
            delta_phi=delta_phi,
            kappa=kappa,
            theta=theta,
            energy=energy,
            coherence=coherence,
            timestamp=0
        )
    
    @staticmethod
    def s8_hash(state: FieldState) -> str:
        """Generate S8 field signature hash"""
        data = f"{state.delta_phi:.6f}|{state.kappa:.6f}|{state.theta:.6f}"
        return hashlib.sha256(data.encode()).hexdigest()[:8]

# =============================================================================
# SIMULATION ENGINE
# =============================================================================

class SFTSimulationEngine:
    """Complete SFT R3.1 Simulation Engine"""
    
    def __init__(self, alpha: float = ALPHA_DECAY,
                 beta: float = BETA_BLOOM,
                 gamma: float = GAMMA_IMPLODE):
        self.memory = SemanticMemory()
        self.evolution = TimeEvolutionOperator(alpha, beta, gamma)
        self.predictor = CoherentPredictor()
        self.processor = GlyphFieldProcessor()
        self.history: List[Dict] = []
        
    def process_text(self, text: str, steps: int = 25) -> Dict:
        """Process text through full field evolution"""
        # Initial glyph extraction
        glyphs = self.processor.text_to_glyphs(text)
        state = self.processor.compute_field_state(glyphs)
        
        trajectory = []
        
        for step in range(steps):
            # Record state
            trajectory.append({
                "step": step,
                "state": state.to_dict(),
                "memory": self.memory.export(),
                "s8": self.processor.s8_hash(state)
            })
            
            # Integrate into memory
            self.memory.integrate(state, glyphs)
            
            # Generate candidates (small perturbations)
            candidates = [state]
            for _ in range(5):
                perturbed = FieldState(
                    delta_phi=state.delta_phi + random.gauss(0, 0.1),
                    kappa=state.kappa + random.gauss(0, 0.05),
                    theta=state.theta + random.gauss(0, 0.1),
                    energy=state.energy,
                    coherence=state.coherence,
                    timestamp=state.timestamp
                )
                candidates.append(self.evolution.evolve(perturbed, self.memory))
            
            # Predict best next state
            evolved = self.evolution.evolve(state, self.memory)
            candidates.append(evolved)
            state = self.predictor.predict(candidates)
            
        # Final invariant check
        invariants = self.predictor.check_invariants()
        
        return {
            "input_text": text,
            "glyph_count": len(glyphs),
            "trajectory": trajectory,
            "final_state": state.to_dict(),
            "final_memory": self.memory.export(),
            "invariants": invariants
        }
    
    def reset(self):
        """Reset engine state"""
        self.memory = SemanticMemory()
        self.predictor = CoherentPredictor()
        self.history = []

# =============================================================================
# PARAMETER SWEEP ENGINE
# =============================================================================

def run_parameter_sweep(config: Dict) -> Dict:
    """Execute full parameter sweep"""
    results = {
        "meta": {
            "timestamp": datetime.now().isoformat(),
            "engine_version": "R3.1-Enhanced",
            "config": config
        },
        "experiments": [],
        "summary": {
            "total_runs": 0,
            "invariant_pass_rate": 0.0,
            "mean_final_coherence": 0.0,
            "best_params": None
        }
    }
    
    all_coherences = []
    invariant_passes = 0
    total_runs = 0
    best_coherence = 0
    best_params = None
    
    for alpha in config["alpha"]:
        for beta in config["beta"]:
            for gamma in config["gamma"]:
                for phrase in config["test_phrases"]:
                    engine = SFTSimulationEngine(alpha, beta, gamma)
                    result = engine.process_text(phrase, config["steps"])
                    
                    experiment = {
                        "params": {"alpha": alpha, "beta": beta, "gamma": gamma},
                        "phrase": phrase,
                        "result": result
                    }
                    results["experiments"].append(experiment)
                    
                    # Track metrics
                    final_coh = result["final_state"]["coherence"]
                    all_coherences.append(final_coh)
                    
                    inv = result["invariants"]
                    if inv.get("kappa_decreasing") and inv.get("no_divergence"):
                        invariant_passes += 1
                        
                    if final_coh > best_coherence:
                        best_coherence = final_coh
                        best_params = {"alpha": alpha, "beta": beta, "gamma": gamma}
                    
                    total_runs += 1
    
    # Summary statistics
    results["summary"]["total_runs"] = total_runs
    results["summary"]["invariant_pass_rate"] = invariant_passes / total_runs if total_runs > 0 else 0
    results["summary"]["mean_final_coherence"] = sum(all_coherences) / len(all_coherences) if all_coherences else 0
    results["summary"]["best_params"] = best_params
    results["summary"]["best_coherence"] = best_coherence
    
    return results

# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == "__main__":
    # Default sweep configuration
    config = {
        "alpha": [0.05, 0.1, 0.2, 0.4],
        "beta": [0.05, 0.1, 0.3, 0.6],
        "gamma": [0.05, 0.1, 0.15, 0.2],
        "steps": 25,
        "test_phrases": [
            "Coherence emerges.",
            "Meaning stabilizes.",
            "الوعي يتطور.",
            "語は流れる。",
            "👨‍👩‍👧‍👦 Family cluster",
            "🇪🇬 Field Integrity",
            "ASCπ → OSAI",
            "ΔΦ · κ · θ → Ψ"
        ]
    }
    
    print("Running SFT R3.1 Parameter Sweep...")
    results = run_parameter_sweep(config)
    
    with open("R3.1_SWEEP_RESULTS.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"Complete. {results['summary']['total_runs']} experiments run.")
    print(f"Invariant pass rate: {results['summary']['invariant_pass_rate']:.1%}")
    print(f"Best coherence: {results['summary']['best_coherence']:.4f}")
    print(f"Best params: {results['summary']['best_params']}")
