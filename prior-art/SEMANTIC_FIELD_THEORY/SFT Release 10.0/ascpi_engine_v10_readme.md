# ASCPI ENGINE v10.0 - CANONICAL UNIFIED KERNEL RELEASE

## Overview

ASCPI Engine v10.0 is the **canonical, minimal, mathematically pure** implementation of the Unified Field Intelligence system. This is not a feature expansion but a consolidation refactor that reduces all dynamics into a single unified tensor kernel.

## Installation

No external dependencies required. Uses only Python standard library:
- `math`
- `hashlib`
- `json`
- `time`
- `collections`

```bash
# Copy ascpi_engine_v10.py to your project
python3 ascpi_engine_v10.py  # Run verification
```

## Quick Start

```python
from ascpi_engine_v10 import ASCPI

# Create engine
engine = ASCPI()

# Process input
result = engine.process(
    text="Your input text here",
    code="optional code string",
    world={"context": "optional world context"}
)

# Access results
print(f"Coherence: {result.coherence}")
print(f"Ma'at Score: {result.maat_score}")
print(f"Awareness: {result.awareness_level}")
print(f"Governor: {result.governor}")
print(f"Signature: {result.signature}")
```

## API Reference

### ASCPI Class

```python
class ASCPI:
    def process(
        self,
        text: str,
        code: str = None,
        world: Dict[str, str] = None,
        max_steps: int = 25
    ) -> Result
```

**Parameters:**
- `text`: Input text to process (required)
- `code`: Optional code string (hexSOFtwareCODe physics applied)
- `world`: Optional dictionary of world context
- `max_steps`: Maximum evolution steps (default: 25)

**Returns:** `Result` dataclass with:
- `output`: Final Psi field
- `coherence`: Final coherence value [0, 1]
- `maat_score`: Ma'at governance score
- `awareness`: Awareness field coherence
- `awareness_level`: 'dormant' | 'emerging' | 'aware' | 'conscious' | 'fully_conscious'
- `governor`: 'allow' | 'rebuild'
- `steps`: Number of evolution steps
- `signature`: 8-char hex signature

### Psi Class (Semantic Field)

```python
@dataclass
class Psi:
    dPhi: float   # Tension
    kappa: float  # Curvature
    theta: float  # Phase
    N: float      # Energy
    C: float      # Coherence
    t: int        # Timestamp
```

**Methods:**
- `vec()`: Returns tuple of field values
- `dist(other)`: Geodesic distance to another field
- `inner(other)`: Inner product with another field
- `blend(other, alpha)`: Superposition blend
- `copy()`: Deep copy
- `to_dict()`: Dictionary representation

## Core Equation

All dynamics are unified into a single kernel:

```
Psi(t+1) = F(Psi(t), A, M_inf, W)
```

Where F integrates:
- Damping (curvature relaxation)
- Amplification (energy from coherence)
- Implosion (tension collapse)
- Memory coupling
- Phase alignment (Kuramoto)
- Coherence force
- Semantic merge

## Invariants

The engine enforces 5 invariants:

1. **INV-1**: Coherence monotonicity - C cannot decrease below floor
2. **INV-2**: Curvature bounds - kappa in [0.01, 10.0]
3. **INV-3**: Energy conservation - |dN| < 20%
4. **INV-4**: Phase continuity - |d_theta| < pi/2
5. **INV-5**: Ma'at improvement - L cannot degrade significantly

## Testing

```bash
# Run test suite
python3 ascpi_engine_v10_tests.py

# Run verification
python3 ascpi_engine_v10.py
```

Expected output:
```
ASCPI v10.0 VERIFICATION
========================================
  [Y] encode_text
  [Y] encode_code
  [Y] kernel_F
  [Y] memory_autopoietic
  [Y] awareness_field
  [Y] pipeline_coherence
  [Y] pipeline_awareness
  [Y] convergence
  [Y] INV-2_kappa
  [Y] unicode_He
  [Y] unicode_你好
========================================
RESULT: 11/11 passed
```

## File Structure

```
ascpi_engine_v10.py      # Main engine (< 500 lines)
ascpi_engine_v10_spec.md # Mathematical specification
ascpi_engine_v10_tests.py # Comprehensive test suite
ascpi_engine_v10_readme.md # This file
```

## Constants

All physical constants are centralized in `CONST` dictionary:

| Symbol | Value | Description |
|--------|-------|-------------|
| alpha | 0.15 | Damping rate |
| beta | 0.12 | Amplification |
| gamma | 0.18 | Implosion rate |
| eta | 0.25 | Memory coupling |
| K | 0.5 | Phase coupling |
| lambda | 0.02 | Ma'at regularization |
| kappa_min | 0.01 | Min curvature |
| kappa_max | 10.0 | Max curvature |
| theta_max | pi/2 | Max phase shift |
| delta_N | 0.2 | Energy tolerance |

## License

**Humanity Heritage License Pi**

Prior Art ID: `hexPRIorART-EXA-SFT-2025-MCM`

Author: Marcel Christian Mulder

## Version History

- **v10.0**: Canonical unified kernel release (461 lines)
- **v9.0**: Final unified field architecture (1153 lines)
- **v8.0**: Unified tensor engine (1176 lines)
- **v5.0**: Complete SFT implementation (3112 lines)

## Citation

```bibtex
@software{ascpi_v10,
  title = {ASCPI Engine v10.0: Canonical Unified Kernel Release},
  author = {Mulder, Marcel Christian},
  year = {2025},
  note = {Prior Art: hexPRIorART-EXA-SFT-2025-MCM}
}
```
