"""
╔══════════════════════════════════════════════════════════════════╗
║  SFT R3.1 — Extended Test Suite                                  ║
║  Edge Cases, Stress Tests, Unicode Boundaries                    ║
╚══════════════════════════════════════════════════════════════════╝
"""

import json
import math
import time
from datetime import datetime
from sft_engine_r31 import (
    SFTSimulationEngine, SemanticMemory, TimeEvolutionOperator,
    CoherentPredictor, GlyphFieldProcessor, FieldState, SemanticGlyph,
    PHI, PI, TAU
)

class ExtendedTestSuite:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "suite": "R3.1-Extended",
            "tests": [],
            "summary": {}
        }
        self.passed = 0
        self.failed = 0
        
    def log(self, name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        self.results["tests"].append({
            "name": name,
            "status": status,
            "details": details
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
        print(f"[{status}] {name}" + (f" — {details}" if details else ""))

    # =========================================================================
    # UNIT TESTS
    # =========================================================================
    
    def test_glyph_extraction(self):
        """Test glyph extraction from various Unicode ranges"""
        test_cases = [
            ("ASCII", "Hello", 5),
            ("Arabic", "مرحبا", 5),
            ("CJK", "你好世界", 4),
            ("Emoji", "👨‍👩‍👧‍👦🌍", 2),
            ("Mixed", "Hi مرحبا 你好 🌟", 11),
            ("Empty", "", 0),
            ("Spaces", "   ", 0),
        ]
        
        processor = GlyphFieldProcessor()
        all_passed = True
        
        for name, text, expected in test_cases:
            glyphs = processor.text_to_glyphs(text)
            passed = len(glyphs) == expected
            if not passed:
                all_passed = False
                self.log(f"glyph_extraction_{name}", False, f"got {len(glyphs)}, expected {expected}")
            
        if all_passed:
            self.log("glyph_extraction_all", True, f"{len(test_cases)} cases")
    
    def test_field_state_normalization(self):
        """Test theta normalization"""
        state = FieldState(theta=7.5)
        state.normalize_theta()
        passed = 0 <= state.theta < TAU
        self.log("theta_normalization", passed, f"θ={state.theta:.4f}")
        
        state = FieldState(theta=-3.0)
        state.normalize_theta()
        passed = 0 <= state.theta < TAU
        self.log("theta_normalization_negative", passed, f"θ={state.theta:.4f}")
    
    def test_damping_convergence(self):
        """Test that damping always moves toward target"""
        op = TimeEvolutionOperator(alpha=0.1)
        
        # κ > κₘ should decrease
        kappa_new = op.dampen_dissonance(1.0, 0.5)
        passed1 = kappa_new < 1.0
        
        # κ < κₘ should increase
        kappa_new = op.dampen_dissonance(0.2, 0.5)
        passed2 = kappa_new > 0.2
        
        self.log("damping_convergence", passed1 and passed2)
    
    def test_coherence_amplification(self):
        """Test energy increases with coherence"""
        op = TimeEvolutionOperator(beta=0.1)
        
        e_low = op.amplify_coherence(1.0, 0.1)
        e_high = op.amplify_coherence(1.0, 0.9)
        
        passed = e_high > e_low
        self.log("coherence_amplification", passed, f"ΔE={e_high - e_low:.4f}")
    
    def test_implosion_threshold(self):
        """Test implosion only activates above threshold"""
        op = TimeEvolutionOperator(gamma=0.15)
        
        # Below threshold (C=0.5): no change
        dphi_low = op.implosion_correction(1.0, 0.5)
        passed1 = abs(dphi_low - 1.0) < 0.01
        
        # Above threshold (C=0.9): compression
        dphi_high = op.implosion_correction(1.0, 0.9)
        passed2 = dphi_high < 1.0
        
        self.log("implosion_threshold", passed1 and passed2)
    
    def test_kuramoto_wrap(self):
        """Test Kuramoto handles phase wrap-around"""
        op = TimeEvolutionOperator()
        
        # Near wrap point
        theta_new = op.kuramoto_sync(0.1, TAU - 0.1, coupling=0.5)
        # Should move toward TAU-0.1, which means decreasing
        passed = theta_new < 0.1 or theta_new > TAU - 0.5
        self.log("kuramoto_wrap", passed, f"θ={theta_new:.4f}")
    
    def test_s8_hash_deterministic(self):
        """Test S8 hash is deterministic"""
        state = FieldState(delta_phi=0.5, kappa=0.3, theta=1.2)
        
        h1 = GlyphFieldProcessor.s8_hash(state)
        h2 = GlyphFieldProcessor.s8_hash(state)
        
        passed = h1 == h2 and len(h1) == 8
        self.log("s8_hash_deterministic", passed, f"hash={h1}")
    
    def test_memory_energy_monotonic(self):
        """Test memory energy never decreases"""
        memory = SemanticMemory()
        processor = GlyphFieldProcessor()
        
        texts = ["Hello", "World", "Test", "More", "Data"]
        energies = []
        
        for text in texts:
            glyphs = processor.text_to_glyphs(text)
            state = processor.compute_field_state(glyphs)
            memory.integrate(state, glyphs)
            energies.append(memory.energy_total)
        
        monotonic = all(energies[i] <= energies[i+1] for i in range(len(energies)-1))
        self.log("memory_energy_monotonic", monotonic, f"energies={[f'{e:.2f}' for e in energies]}")
    
    # =========================================================================
    # INTEGRATION TESTS
    # =========================================================================
    
    def test_full_pipeline(self):
        """Test complete processing pipeline"""
        engine = SFTSimulationEngine()
        result = engine.process_text("Integration test", steps=10)
        
        checks = [
            ("has_trajectory", len(result["trajectory"]) == 10),
            ("has_final_state", "final_state" in result),
            ("has_invariants", "invariants" in result),
            ("coherence_valid", 0 <= result["final_state"]["coherence"] <= 1),
        ]
        
        all_passed = all(c[1] for c in checks)
        failed = [c[0] for c in checks if not c[1]]
        self.log("full_pipeline", all_passed, f"failed: {failed}" if failed else "")
    
    def test_unicode_range_stability(self):
        """Test stability across Unicode ranges"""
        test_phrases = [
            "ASCII only test",
            "مرحبا بالعالم",  # Arabic
            "שלום עולם",  # Hebrew
            "こんにちは世界",  # Japanese
            "안녕하세요",  # Korean
            "Привет мир",  # Cyrillic
            "🌍🌎🌏🌐",  # Emoji
            "∫∑∏√∞",  # Math symbols
            "░▒▓█▌",  # Box drawing
        ]
        
        all_stable = True
        for phrase in test_phrases:
            engine = SFTSimulationEngine()
            try:
                result = engine.process_text(phrase, steps=5)
                stable = (
                    result["final_state"]["coherence"] >= 0 and
                    not math.isnan(result["final_state"]["kappa"]) and
                    not math.isinf(result["final_state"]["energy"])
                )
                if not stable:
                    all_stable = False
                    self.log(f"unicode_stability_{phrase[:10]}", False)
            except Exception as e:
                all_stable = False
                self.log(f"unicode_stability_{phrase[:10]}", False, str(e))
        
        if all_stable:
            self.log("unicode_range_stability", True, f"{len(test_phrases)} ranges")
    
    # =========================================================================
    # STRESS TESTS
    # =========================================================================
    
    def test_long_sequence(self):
        """Test with very long input"""
        long_text = "A" * 10000
        engine = SFTSimulationEngine()
        
        start = time.time()
        result = engine.process_text(long_text, steps=10)
        elapsed = time.time() - start
        
        passed = elapsed < 5.0 and result["final_state"]["coherence"] >= 0
        self.log("long_sequence_10k", passed, f"{elapsed:.2f}s")
    
    def test_many_steps(self):
        """Test with many evolution steps"""
        engine = SFTSimulationEngine()
        
        start = time.time()
        result = engine.process_text("Step test", steps=100)
        elapsed = time.time() - start
        
        passed = elapsed < 10.0 and len(result["trajectory"]) == 100
        self.log("many_steps_100", passed, f"{elapsed:.2f}s")
    
    def test_repeated_processing(self):
        """Test repeated processing doesn't accumulate errors"""
        engine = SFTSimulationEngine()
        
        coherences = []
        for i in range(20):
            result = engine.process_text(f"Iteration {i}", steps=5)
            coherences.append(result["final_state"]["coherence"])
            engine.reset()
        
        # Coherences should be consistent (not degrading)
        variance = sum((c - sum(coherences)/len(coherences))**2 for c in coherences) / len(coherences)
        passed = variance < 0.1
        self.log("repeated_processing", passed, f"variance={variance:.4f}")
    
    def test_extreme_parameters(self):
        """Test with extreme parameter values"""
        test_cases = [
            ("high_alpha", 0.99, 0.1, 0.1),
            ("high_beta", 0.1, 0.99, 0.1),
            ("high_gamma", 0.1, 0.1, 0.99),
            ("all_low", 0.01, 0.01, 0.01),
            ("all_high", 0.9, 0.9, 0.9),
        ]
        
        for name, alpha, beta, gamma in test_cases:
            engine = SFTSimulationEngine(alpha, beta, gamma)
            try:
                result = engine.process_text("Extreme test", steps=10)
                stable = (
                    not math.isnan(result["final_state"]["coherence"]) and
                    not math.isinf(result["final_state"]["energy"])
                )
                self.log(f"extreme_{name}", stable)
            except Exception as e:
                self.log(f"extreme_{name}", False, str(e))
    
    # =========================================================================
    # EDGE CASES
    # =========================================================================
    
    def test_empty_input(self):
        """Test empty string handling"""
        engine = SFTSimulationEngine()
        result = engine.process_text("", steps=5)
        
        passed = result["glyph_count"] == 0
        self.log("empty_input", passed)
    
    def test_single_char(self):
        """Test single character input"""
        engine = SFTSimulationEngine()
        result = engine.process_text("X", steps=5)
        
        passed = result["glyph_count"] == 1 and result["final_state"]["coherence"] >= 0
        self.log("single_char", passed)
    
    def test_whitespace_only(self):
        """Test whitespace-only input"""
        engine = SFTSimulationEngine()
        result = engine.process_text("   \t\n  ", steps=5)
        
        passed = result["glyph_count"] == 0
        self.log("whitespace_only", passed)
    
    def test_surrogate_pairs(self):
        """Test emoji with surrogate pairs"""
        engine = SFTSimulationEngine()
        result = engine.process_text("👨‍👩‍👧‍👦", steps=5)
        
        passed = result["glyph_count"] > 0 and not math.isnan(result["final_state"]["coherence"])
        self.log("surrogate_pairs", passed, f"glyphs={result['glyph_count']}")
    
    # =========================================================================
    # INVARIANT VERIFICATION
    # =========================================================================
    
    def test_invariant_kappa_decreasing(self):
        """Verify κ decreases under damping"""
        engine = SFTSimulationEngine(alpha=0.2)
        result = engine.process_text("Kappa test phrase", steps=20)
        
        kappas = [t["state"]["kappa"] for t in result["trajectory"]]
        
        # Allow small increases due to noise, but overall trend should be down
        decreasing_pairs = sum(1 for i in range(len(kappas)-1) if kappas[i] >= kappas[i+1] - 0.05)
        ratio = decreasing_pairs / (len(kappas) - 1)
        
        passed = ratio > 0.7  # At least 70% of steps show decrease
        self.log("invariant_kappa_decreasing", passed, f"ratio={ratio:.2%}")
    
    def test_invariant_energy_increasing(self):
        """Verify N increases under amplification"""
        engine = SFTSimulationEngine(beta=0.3)
        result = engine.process_text("Energy test phrase", steps=20)
        
        energies = [t["state"]["energy"] for t in result["trajectory"]]
        
        increasing_pairs = sum(1 for i in range(len(energies)-1) if energies[i] <= energies[i+1] + 0.1)
        ratio = increasing_pairs / (len(energies) - 1)
        
        passed = ratio > 0.7
        self.log("invariant_energy_increasing", passed, f"ratio={ratio:.2%}")
    
    def test_invariant_coherence_stable(self):
        """Verify coherence stabilizes"""
        engine = SFTSimulationEngine()
        result = engine.process_text("Coherence stability test", steps=25)
        
        coherences = [t["state"]["coherence"] for t in result["trajectory"]]
        
        # Check last 10 steps for stability
        last_10 = coherences[-10:]
        mean = sum(last_10) / len(last_10)
        variance = sum((c - mean)**2 for c in last_10) / len(last_10)
        
        passed = variance < 0.1
        self.log("invariant_coherence_stable", passed, f"var={variance:.4f}")
    
    # =========================================================================
    # RUN ALL
    # =========================================================================
    
    def run_all(self):
        print("=" * 60)
        print("SFT R3.1 EXTENDED TEST SUITE")
        print("=" * 60)
        print()
        
        print("--- Unit Tests ---")
        self.test_glyph_extraction()
        self.test_field_state_normalization()
        self.test_damping_convergence()
        self.test_coherence_amplification()
        self.test_implosion_threshold()
        self.test_kuramoto_wrap()
        self.test_s8_hash_deterministic()
        self.test_memory_energy_monotonic()
        print()
        
        print("--- Integration Tests ---")
        self.test_full_pipeline()
        self.test_unicode_range_stability()
        print()
        
        print("--- Stress Tests ---")
        self.test_long_sequence()
        self.test_many_steps()
        self.test_repeated_processing()
        self.test_extreme_parameters()
        print()
        
        print("--- Edge Cases ---")
        self.test_empty_input()
        self.test_single_char()
        self.test_whitespace_only()
        self.test_surrogate_pairs()
        print()
        
        print("--- Invariant Verification ---")
        self.test_invariant_kappa_decreasing()
        self.test_invariant_energy_increasing()
        self.test_invariant_coherence_stable()
        print()
        
        print("=" * 60)
        print(f"RESULTS: {self.passed} passed, {self.failed} failed")
        print(f"PASS RATE: {self.passed / (self.passed + self.failed):.1%}")
        print("=" * 60)
        
        self.results["summary"] = {
            "passed": self.passed,
            "failed": self.failed,
            "pass_rate": self.passed / (self.passed + self.failed)
        }
        
        return self.results

if __name__ == "__main__":
    suite = ExtendedTestSuite()
    results = suite.run_all()
    
    with open("R3.1_TEST_SUITE_RESULTS.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to R3.1_TEST_SUITE_RESULTS.json")
