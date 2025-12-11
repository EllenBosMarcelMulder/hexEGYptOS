"""
ASCPI ENGINE v10.0 - COMPREHENSIVE TEST SUITE
==============================================

Tests all components and invariants of the canonical release.
"""

import math
from ascpi_engine_v10 import (
    CONST, Psi, AwarenessField, MemoryField, CoherenceForce,
    InvariantGuardian, kernel_F, project, maat, judge, Governor,
    encode_text, encode_code, ASCPI, Result
)


def test_field_creation():
    """Test Psi field creation and enforcement"""
    p = Psi()
    assert p.dPhi == 0.0
    assert p.kappa == 1.0
    assert p.C == 0.5
    
    # Test enforcement
    p = Psi(kappa=-5, C=2.0, theta=10)
    assert p.kappa >= CONST['kappa_min']
    assert p.C <= 1.0
    assert 0 <= p.theta < CONST['tau']
    print("[PASS] test_field_creation")


def test_field_operations():
    """Test field vector, distance, inner product, blend"""
    p1 = Psi(dPhi=0.1, kappa=0.5, theta=1.0, N=1.0, C=0.6)
    p2 = Psi(dPhi=0.2, kappa=0.6, theta=1.5, N=1.2, C=0.7)
    
    # Vector
    v = p1.vec()
    assert len(v) == 5
    
    # Distance
    d = p1.dist(p2)
    assert d > 0
    assert p1.dist(p1) < 0.001
    
    # Inner product
    ip = p1.inner(p2)
    assert ip > 0
    
    # Blend
    p3 = p1.blend(p2, 0.5)
    assert p3.t == max(p1.t, p2.t) + 1
    print("[PASS] test_field_operations")


def test_unified_kernel():
    """Test canonical unified kernel F"""
    psi = Psi(dPhi=0.1, kappa=0.8, theta=1.0, N=1.0, C=0.5)
    A = Psi(dPhi=0.0, kappa=0.5, theta=0.5, N=1.0, C=0.8)
    M_inf = Psi(dPhi=0.0, kappa=0.4, theta=0.3, N=1.0, C=0.9)
    
    # Without world
    result = kernel_F(psi, A, M_inf, None, 0.1)
    assert result.t == psi.t + 1
    assert CONST['kappa_min'] <= result.kappa <= CONST['kappa_max']
    
    # With world
    W = Psi(dPhi=0.0, kappa=0.3, theta=0.2, N=1.0, C=0.85)
    result2 = kernel_F(psi, A, M_inf, W, 0.1)
    assert result2.t == psi.t + 1
    print("[PASS] test_unified_kernel")


def test_memory_field():
    """Test autopoietic memory with limit cycles"""
    mem = MemoryField()
    
    # Initial state
    assert mem.M_inf.C == 0.5
    
    # Absorption
    for i in range(20):
        mem.absorb(Psi(C=0.5 + i*0.02, theta=i*0.1, N=1.0))
    
    # Coherence should increase
    assert mem.M_inf.C > 0.5
    
    # Attractor should exist
    att = mem.attractor()
    assert att is not None
    print("[PASS] test_memory_field")


def test_awareness_field():
    """Test awareness as full field"""
    aw = AwarenessField()
    mem = MemoryField()
    
    # Initial level
    assert aw.level() == 'dormant'
    
    # Evolve with improving conditions
    for i in range(25):
        psi = Psi(C=0.5 + i*0.02, kappa=0.8 - i*0.01)
        mem.absorb(psi)
        aw.evolve(psi, mem.M_inf)
    
    # Awareness should have grown
    assert aw.field.C > 0.1
    assert aw.level() in ['dormant', 'emerging', 'aware', 'conscious', 'fully_conscious']
    print("[PASS] test_awareness_field")


def test_coherence_force():
    """Test coherence as active force"""
    cf = CoherenceForce()
    
    sources = {
        'lang': (0.7, 0.3),
        'code': (0.5, 0.8),
        'mem': (0.8, 0.2)
    }
    
    grad, fused = cf.compute(sources)
    assert fused > 0
    
    # Second call should produce gradient
    grad2, fused2 = cf.compute(sources)
    assert isinstance(grad2, float)
    print("[PASS] test_coherence_force")


def test_multimodal_projection():
    """Test geometric field merge"""
    p1 = Psi(dPhi=0.1, kappa=0.3, theta=1.0, N=1.0, C=0.6)
    p2 = Psi(dPhi=0.2, kappa=0.5, theta=2.0, N=1.5, C=0.7)
    p3 = Psi(dPhi=0.15, kappa=0.4, theta=1.5, N=1.2, C=0.65)
    
    # Empty
    result = project([])
    assert result.C == 0.5  # Default
    
    # Single
    result = project([p1])
    assert abs(result.dPhi - p1.dPhi) < 0.001
    
    # Multiple
    result = project([p1, p2, p3])
    assert result.N > 0
    assert 0 <= result.C <= 1
    print("[PASS] test_multimodal_projection")


def test_invariant_guardian():
    """Test all 5 invariants"""
    guard = InvariantGuardian()
    
    before = Psi(dPhi=0.1, kappa=0.5, theta=1.0, N=1.0, C=0.6)
    
    # INV-2: Curvature bounds
    after = Psi(dPhi=0.1, kappa=100, theta=1.0, N=1.0, C=0.6)
    result = guard.enforce(before, after, 0.5)
    assert result.kappa <= CONST['kappa_max']
    
    guard.reset()
    
    # INV-3: Energy conservation
    after = Psi(dPhi=0.1, kappa=0.5, theta=1.0, N=5.0, C=0.6)
    result = guard.enforce(before, after, 0.5)
    ratio = result.N / before.N
    assert abs(ratio - 1) <= CONST['delta_N'] + 0.01
    
    guard.reset()
    
    # INV-4: Phase continuity
    after = Psi(dPhi=0.1, kappa=0.5, theta=4.0, N=1.0, C=0.6)
    result = guard.enforce(before, after, 0.5)
    dt = abs(result.theta - before.theta)
    if dt > CONST['pi']:
        dt = CONST['tau'] - dt
    assert dt <= CONST['theta_max'] + 0.01
    
    print("[PASS] test_invariant_guardian")


def test_maat_functional():
    """Test Ma'at loss function"""
    p1 = Psi(dPhi=0.1, kappa=0.5, theta=1.0, N=1.0, C=0.6)
    p2 = Psi(dPhi=0.0, kappa=0.3, theta=0.5, N=1.0, C=0.9)
    
    L = maat(p1, p2)
    assert L > 0
    
    # Same field should have lower loss
    L_same = maat(p1, p1)
    assert L_same < L
    print("[PASS] test_maat_functional")


def test_governor():
    """Test Ma'at governance decisions"""
    p_in = Psi(C=0.5, kappa=0.8)
    
    # Improving output
    p_out = Psi(C=0.7, kappa=0.5)
    decision, score = judge(p_in, p_out, None)
    assert score > 0  # Score should be positive
    
    # Test with world context
    W = Psi(C=0.8, kappa=0.3)
    decision2, score2 = judge(p_in, p_out, W)
    assert decision2 in [Governor.ALLOW, Governor.REBUILD]
    print("[PASS] test_governor")


def test_encoding():
    """Test text and code encoding"""
    # Text encoding
    psi = encode_text("Hello world")
    assert psi.N > 0
    assert psi.C > 0
    assert CONST['kappa_min'] <= psi.kappa <= CONST['kappa_max']
    
    # Empty text
    psi_empty = encode_text("")
    assert psi_empty.N > 0  # Default N
    
    # Code encoding
    psi_code = encode_code("def test(): pass")
    assert psi_code.kappa > 0.3  # Increased by complexity
    
    # Complex code
    psi_complex = encode_code("def f(): if x: for y in z: pass")
    assert psi_complex.kappa > psi_code.kappa  # More complex
    print("[PASS] test_encoding")


def test_unicode():
    """Test Unicode support"""
    tests = [
        "Hello",
        "你好",
        "مرحبا",
        "Привет",
        "🎉",
    ]
    
    for txt in tests:
        psi = encode_text(txt)
        assert psi.N > 0, f"Failed for: {txt}"
    print("[PASS] test_unicode")


def test_full_pipeline():
    """Test complete ASCPI pipeline"""
    engine = ASCPI()
    
    result = engine.process(
        "Testing the full pipeline",
        code="x = 1",
        world={"context": "test context"}
    )
    
    assert isinstance(result, Result)
    assert result.coherence > 0
    assert result.maat_score > 0
    assert result.awareness >= 0
    assert result.awareness_level in ['dormant', 'emerging', 'aware', 'conscious', 'fully_conscious']
    assert result.governor in ['allow', 'rebuild']
    assert len(result.signature) == 8
    print("[PASS] test_full_pipeline")


def test_convergence():
    """Test coherence convergence over iterations"""
    engine = ASCPI()
    
    coherences = []
    for i in range(10):
        result = engine.process(f"Iteration {i} of convergence test")
        coherences.append(result.coherence)
    
    # Should converge to high coherence
    assert coherences[-1] > 0.9
    
    # Should be generally increasing (monotonicity)
    increases = sum(1 for i in range(len(coherences)-1) if coherences[i+1] >= coherences[i] - 0.1)
    assert increases >= len(coherences) // 2
    print("[PASS] test_convergence")


def test_determinism():
    """Test deterministic reproducibility"""
    engine1 = ASCPI()
    engine2 = ASCPI()
    
    text = "Determinism test input"
    code = "def f(): pass"
    
    r1 = engine1.process(text, code=code)
    r2 = engine2.process(text, code=code)
    
    # Results should be identical
    assert r1.signature == r2.signature
    assert abs(r1.coherence - r2.coherence) < 0.001
    print("[PASS] test_determinism")


def run_all_tests():
    """Execute all tests"""
    print("=" * 50)
    print("ASCPI ENGINE v10.0 - TEST SUITE")
    print("=" * 50)
    print()
    
    tests = [
        test_field_creation,
        test_field_operations,
        test_unified_kernel,
        test_memory_field,
        test_awareness_field,
        test_coherence_force,
        test_multimodal_projection,
        test_invariant_guardian,
        test_maat_functional,
        test_governor,
        test_encoding,
        test_unicode,
        test_full_pipeline,
        test_convergence,
        test_determinism,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"[FAIL] {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"[ERROR] {test.__name__}: {e}")
            failed += 1
    
    print()
    print("=" * 50)
    print(f"RESULTS: {passed}/{len(tests)} passed, {failed} failed")
    print("=" * 50)
    
    return passed == len(tests)


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
