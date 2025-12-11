/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ CORE PLUGIN LIBRARY v1.0
 * Production-ready Energieboxen for semantic field processing
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const CONST = {
    phi: (1 + Math.sqrt(5)) / 2,
    pi: Math.PI,
    tau: 2 * Math.PI,
    eps: 1e-12,
    kappa_min: 0.01,
    kappa_max: 10.0
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TRUTH DETECTOR
// Analyzes field coherence patterns to estimate truth-likeness
// ═══════════════════════════════════════════════════════════════════════════════

const TruthDetector = {
    id: 'truth_detector',
    name: 'Truth Detector',
    icon: '🔍',
    description: 'Estimates truth-likeness from field coherence patterns',
    version: '1.0.0',
    
    _history: [],
    _threshold: {
        high: { C: 0.85, kappa: 0.4 },
        medium: { C: 0.6, kappa: 0.7 },
        low: { C: 0.3, kappa: 1.0 }
    },
    
    process(psi, input, ctx) {
        if (!input) return psi;
        
        // Truth indicators:
        // 1. High coherence = consistent internal structure
        // 2. Low curvature = simple, direct statements
        // 3. Stable phase = consistent semantic direction
        
        let truthScore = 0;
        
        // Coherence contribution (0-0.4)
        truthScore += psi.C * 0.4;
        
        // Curvature contribution (0-0.3) - lower is better
        const kappaNorm = 1 - Math.min(psi.kappa / 2, 1);
        truthScore += kappaNorm * 0.3;
        
        // Phase stability contribution (0-0.3)
        if (this._history.length >= 3) {
            const recentPhases = this._history.slice(-5).map(h => h.theta);
            const sinSum = recentPhases.reduce((s, t) => s + Math.sin(t), 0);
            const cosSum = recentPhases.reduce((s, t) => s + Math.cos(t), 0);
            const phaseCoherence = Math.sqrt(sinSum ** 2 + cosSum ** 2) / recentPhases.length;
            truthScore += phaseCoherence * 0.3;
        } else {
            truthScore += 0.15; // Neutral for insufficient history
        }
        
        // Store in context
        ctx.truthScore = truthScore;
        ctx.truthLevel = truthScore > 0.8 ? 'high' : truthScore > 0.5 ? 'medium' : 'low';
        
        // Update history
        this._history.push({ theta: psi.theta, C: psi.C, score: truthScore });
        if (this._history.length > 20) this._history.shift();
        
        // Boost coherence for high truth scores
        if (truthScore > 0.7) {
            psi.C = Math.min(1, psi.C + 0.02);
        }
        
        return psi;
    },
    
    getTruthHistory() {
        return this._history.map(h => h.score);
    },
    
    reset() {
        this._history = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CONTRADICTION DETECTOR
// Detects semantic contradictions through phase discontinuities
// ═══════════════════════════════════════════════════════════════════════════════

const ContradictionDetector = {
    id: 'contradiction_detector',
    name: 'Contradiction Detector',
    icon: '⚠️',
    description: 'Detects contradictions via phase discontinuities',
    version: '1.0.0',
    
    _prevPsi: null,
    _contradictions: [],
    _threshold: Math.PI / 3, // 60 degrees
    
    process(psi, input, ctx) {
        ctx.contradictions = [];
        ctx.contradictionLevel = 'none';
        
        if (this._prevPsi) {
            // Phase discontinuity check
            let dTheta = Math.abs(psi.theta - this._prevPsi.theta);
            if (dTheta > Math.PI) dTheta = CONST.tau - dTheta;
            
            // Coherence drop check
            const dC = this._prevPsi.C - psi.C;
            
            // Curvature spike check
            const dKappa = psi.kappa - this._prevPsi.kappa;
            
            // Calculate contradiction score
            let contradictionScore = 0;
            
            if (dTheta > this._threshold) {
                contradictionScore += 0.4;
                ctx.contradictions.push({
                    type: 'phase_discontinuity',
                    delta: dTheta,
                    threshold: this._threshold
                });
            }
            
            if (dC > 0.2) {
                contradictionScore += 0.3;
                ctx.contradictions.push({
                    type: 'coherence_drop',
                    delta: dC
                });
            }
            
            if (dKappa > 0.5) {
                contradictionScore += 0.3;
                ctx.contradictions.push({
                    type: 'curvature_spike',
                    delta: dKappa
                });
            }
            
            // Set level
            if (contradictionScore > 0.6) {
                ctx.contradictionLevel = 'high';
                this._contradictions.push({ step: ctx.step, score: contradictionScore });
            } else if (contradictionScore > 0.3) {
                ctx.contradictionLevel = 'medium';
            }
            
            // Reduce coherence for detected contradictions
            if (contradictionScore > 0.3) {
                psi.C *= (1 - contradictionScore * 0.2);
            }
        }
        
        this._prevPsi = { theta: psi.theta, C: psi.C, kappa: psi.kappa };
        return psi;
    },
    
    getContradictions() {
        return [...this._contradictions];
    },
    
    reset() {
        this._prevPsi = null;
        this._contradictions = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SEMANTIC CLUSTER
// Groups semantically similar content through field proximity
// ═══════════════════════════════════════════════════════════════════════════════

const SemanticCluster = {
    id: 'semantic_cluster',
    name: 'Semantic Cluster',
    icon: '🎯',
    description: 'Clusters semantically similar content',
    version: '1.0.0',
    
    _clusters: [],
    _threshold: 0.3,
    _maxClusters: 10,
    
    _distance(a, b) {
        const dp = (a.dPhi - b.dPhi) ** 2;
        const dk = (Math.log(a.kappa + CONST.eps) - Math.log(b.kappa + CONST.eps)) ** 2;
        const dt = Math.min(Math.abs(a.theta - b.theta), CONST.tau - Math.abs(a.theta - b.theta)) ** 2;
        return Math.sqrt(dp + dk + dt / CONST.pi ** 2);
    },
    
    _findNearestCluster(psi) {
        let nearest = null;
        let minDist = Infinity;
        
        this._clusters.forEach((cluster, i) => {
            const dist = this._distance(psi, cluster.centroid);
            if (dist < minDist) {
                minDist = dist;
                nearest = { index: i, dist };
            }
        });
        
        return nearest;
    },
    
    _updateCentroid(cluster) {
        const n = cluster.members.length;
        if (n === 0) return;
        
        let dPhi = 0, kappa = 0, N = 0, C = 0;
        let sinSum = 0, cosSum = 0;
        
        cluster.members.forEach(m => {
            dPhi += m.dPhi;
            kappa += m.kappa;
            N += m.N;
            C += m.C;
            sinSum += Math.sin(m.theta);
            cosSum += Math.cos(m.theta);
        });
        
        cluster.centroid = {
            dPhi: dPhi / n,
            kappa: kappa / n,
            theta: Math.atan2(sinSum, cosSum),
            N: N / n,
            C: C / n
        };
    },
    
    process(psi, input, ctx) {
        const psiData = { dPhi: psi.dPhi, kappa: psi.kappa, theta: psi.theta, N: psi.N, C: psi.C };
        
        const nearest = this._findNearestCluster(psiData);
        
        if (nearest && nearest.dist < this._threshold) {
            // Add to existing cluster
            this._clusters[nearest.index].members.push(psiData);
            this._updateCentroid(this._clusters[nearest.index]);
            ctx.clusterId = nearest.index;
            ctx.clusterDist = nearest.dist;
            
            // Boost coherence for clustered content
            psi.C = Math.min(1, psi.C + 0.01);
        } else if (this._clusters.length < this._maxClusters) {
            // Create new cluster
            const newCluster = {
                id: this._clusters.length,
                centroid: { ...psiData },
                members: [psiData],
                created: ctx.step || Date.now()
            };
            this._clusters.push(newCluster);
            ctx.clusterId = newCluster.id;
            ctx.clusterDist = 0;
            ctx.newCluster = true;
        } else {
            // Assign to nearest even if above threshold
            if (nearest) {
                this._clusters[nearest.index].members.push(psiData);
                this._updateCentroid(this._clusters[nearest.index]);
                ctx.clusterId = nearest.index;
                ctx.clusterDist = nearest.dist;
                ctx.forcedCluster = true;
            }
        }
        
        ctx.totalClusters = this._clusters.length;
        return psi;
    },
    
    getClusters() {
        return this._clusters.map(c => ({
            id: c.id,
            centroid: c.centroid,
            size: c.members.length,
            created: c.created
        }));
    },
    
    reset() {
        this._clusters = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TONE ANALYZER
// Extracts emotional tone from field characteristics
// ═══════════════════════════════════════════════════════════════════════════════

const ToneAnalyzer = {
    id: 'tone_analyzer',
    name: 'Tone Analyzer',
    icon: '🎭',
    description: 'Analyzes emotional tone from field state',
    version: '1.0.0',
    
    _toneMap: [
        { range: [0, Math.PI/4], tone: 'analytical', valence: 0 },
        { range: [Math.PI/4, Math.PI/2], tone: 'neutral', valence: 0.1 },
        { range: [Math.PI/2, 3*Math.PI/4], tone: 'positive', valence: 0.5 },
        { range: [3*Math.PI/4, Math.PI], tone: 'emphatic', valence: 0.3 },
        { range: [Math.PI, 5*Math.PI/4], tone: 'reflective', valence: 0 },
        { range: [5*Math.PI/4, 3*Math.PI/2], tone: 'negative', valence: -0.5 },
        { range: [3*Math.PI/2, 7*Math.PI/4], tone: 'cautious', valence: -0.2 },
        { range: [7*Math.PI/4, 2*Math.PI], tone: 'assertive', valence: 0.2 }
    ],
    
    _history: [],
    
    process(psi, input, ctx) {
        // Determine tone from phase
        const theta = ((psi.theta % CONST.tau) + CONST.tau) % CONST.tau;
        let tone = 'neutral';
        let valence = 0;
        
        for (const t of this._toneMap) {
            if (theta >= t.range[0] && theta < t.range[1]) {
                tone = t.tone;
                valence = t.valence;
                break;
            }
        }
        
        // Intensity from curvature
        const intensity = Math.min(1, psi.kappa / 2);
        
        // Confidence from coherence
        const confidence = psi.C;
        
        // Energy level
        const energy = Math.min(1, psi.N);
        
        // Composite emotional state
        ctx.tone = {
            primary: tone,
            valence: valence * intensity,
            arousal: intensity,
            confidence: confidence,
            energy: energy
        };
        
        // Track history
        this._history.push(ctx.tone);
        if (this._history.length > 50) this._history.shift();
        
        // Calculate emotional stability
        if (this._history.length >= 5) {
            const recentValences = this._history.slice(-5).map(t => t.valence);
            const avgValence = recentValences.reduce((a, b) => a + b, 0) / 5;
            const variance = recentValences.reduce((s, v) => s + (v - avgValence) ** 2, 0) / 5;
            ctx.tone.stability = 1 - Math.min(1, Math.sqrt(variance) * 2);
        }
        
        return psi;
    },
    
    getToneHistory() {
        return [...this._history];
    },
    
    getDominantTone() {
        if (this._history.length === 0) return null;
        
        const counts = {};
        this._history.forEach(t => {
            counts[t.primary] = (counts[t.primary] || 0) + 1;
        });
        
        let dominant = null;
        let maxCount = 0;
        for (const [tone, count] of Object.entries(counts)) {
            if (count > maxCount) {
                dominant = tone;
                maxCount = count;
            }
        }
        
        return { tone: dominant, frequency: maxCount / this._history.length };
    },
    
    reset() {
        this._history = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. COHERENCE PROFILER
// Tracks coherence evolution and identifies patterns
// ═══════════════════════════════════════════════════════════════════════════════

const CoherenceProfiler = {
    id: 'coherence_profiler',
    name: 'Coherence Profiler',
    icon: '📈',
    description: 'Profiles coherence evolution patterns',
    version: '1.0.0',
    
    _history: [],
    _windowSize: 20,
    
    process(psi, input, ctx) {
        // Record coherence
        this._history.push({
            step: ctx.step || this._history.length,
            C: psi.C,
            kappa: psi.kappa,
            theta: psi.theta
        });
        
        if (this._history.length > 100) this._history.shift();
        
        // Calculate metrics
        const n = this._history.length;
        const window = this._history.slice(-this._windowSize);
        
        // Average coherence
        const avgC = window.reduce((s, h) => s + h.C, 0) / window.length;
        
        // Coherence trend (positive = improving)
        let trend = 0;
        if (window.length >= 3) {
            const firstHalf = window.slice(0, Math.floor(window.length / 2));
            const secondHalf = window.slice(Math.floor(window.length / 2));
            const firstAvg = firstHalf.reduce((s, h) => s + h.C, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((s, h) => s + h.C, 0) / secondHalf.length;
            trend = secondAvg - firstAvg;
        }
        
        // Volatility
        const variance = window.reduce((s, h) => s + (h.C - avgC) ** 2, 0) / window.length;
        const volatility = Math.sqrt(variance);
        
        // Peak detection
        let peaks = 0;
        for (let i = 1; i < window.length - 1; i++) {
            if (window[i].C > window[i-1].C && window[i].C > window[i+1].C) {
                peaks++;
            }
        }
        
        // Profile classification
        let profile = 'stable';
        if (volatility > 0.15) profile = 'volatile';
        else if (trend > 0.05) profile = 'improving';
        else if (trend < -0.05) profile = 'declining';
        else if (avgC > 0.8) profile = 'high_coherence';
        else if (avgC < 0.3) profile = 'low_coherence';
        
        ctx.coherenceProfile = {
            average: avgC,
            trend: trend,
            volatility: volatility,
            peaks: peaks,
            profile: profile,
            samples: n
        };
        
        // Auto-stabilize if too volatile
        if (volatility > 0.2) {
            psi.C = avgC * 0.3 + psi.C * 0.7; // Smooth toward average
        }
        
        return psi;
    },
    
    getProfile() {
        if (this._history.length === 0) return null;
        
        const Cs = this._history.map(h => h.C);
        return {
            min: Math.min(...Cs),
            max: Math.max(...Cs),
            avg: Cs.reduce((a, b) => a + b, 0) / Cs.length,
            current: Cs[Cs.length - 1],
            samples: Cs.length
        };
    },
    
    getHistory() {
        return [...this._history];
    },
    
    reset() {
        this._history = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. FIELD HARMONIZER
// Smooths field transitions and maintains coherence
// ═══════════════════════════════════════════════════════════════════════════════

const FieldHarmonizer = {
    id: 'field_harmonizer',
    name: 'Field Harmonizer',
    icon: '🎵',
    description: 'Harmonizes field transitions for stability',
    version: '1.0.0',
    
    _prevPsi: null,
    _smoothing: 0.3,
    _targetPhase: null,
    
    process(psi, input, ctx) {
        if (!this._prevPsi) {
            this._prevPsi = { dPhi: psi.dPhi, kappa: psi.kappa, theta: psi.theta, N: psi.N, C: psi.C };
            return psi;
        }
        
        const s = this._smoothing;
        const prev = this._prevPsi;
        
        // Smooth all components
        psi.dPhi = prev.dPhi * s + psi.dPhi * (1 - s);
        psi.kappa = prev.kappa * s + psi.kappa * (1 - s);
        psi.N = prev.N * s + psi.N * (1 - s);
        
        // Circular smoothing for phase
        const sinBlend = s * Math.sin(prev.theta) + (1 - s) * Math.sin(psi.theta);
        const cosBlend = s * Math.cos(prev.theta) + (1 - s) * Math.cos(psi.theta);
        psi.theta = Math.atan2(sinBlend, cosBlend);
        
        // Coherence floor - never let it drop too fast
        psi.C = Math.max(prev.C * 0.95, psi.C);
        
        // Optional: attract to target phase
        if (this._targetPhase !== null) {
            const dt = this._targetPhase - psi.theta;
            psi.theta += 0.1 * Math.sin(dt);
        }
        
        // Update previous
        this._prevPsi = { dPhi: psi.dPhi, kappa: psi.kappa, theta: psi.theta, N: psi.N, C: psi.C };
        
        ctx.harmonized = true;
        return psi;
    },
    
    setSmoothing(value) {
        this._smoothing = Math.max(0, Math.min(0.9, value));
    },
    
    setTargetPhase(theta) {
        this._targetPhase = theta;
    },
    
    clearTargetPhase() {
        this._targetPhase = null;
    },
    
    reset() {
        this._prevPsi = null;
        this._targetPhase = null;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ENTROPY ANALYZER
// Measures semantic entropy and information density
// ═══════════════════════════════════════════════════════════════════════════════

const EntropyAnalyzer = {
    id: 'entropy_analyzer',
    name: 'Entropy Analyzer',
    icon: '🌀',
    description: 'Measures semantic entropy and information density',
    version: '1.0.0',
    
    _history: [],
    
    process(psi, input, ctx) {
        if (!input) {
            ctx.entropy = { text: 0, field: 0, combined: 0 };
            return psi;
        }
        
        // Text entropy (Shannon)
        const charCounts = {};
        for (const c of input.toLowerCase()) {
            charCounts[c] = (charCounts[c] || 0) + 1;
        }
        
        let textEntropy = 0;
        const total = input.length;
        for (const count of Object.values(charCounts)) {
            const p = count / total;
            textEntropy -= p * Math.log2(p);
        }
        textEntropy /= Math.log2(Math.min(total, 256)); // Normalize
        
        // Field entropy (from distribution of components)
        const components = [
            Math.abs(psi.dPhi),
            psi.kappa / CONST.kappa_max,
            psi.theta / CONST.tau,
            Math.min(psi.N, 1),
            psi.C
        ];
        
        const compSum = components.reduce((a, b) => a + b, 0);
        let fieldEntropy = 0;
        components.forEach(c => {
            const p = c / compSum;
            if (p > 0) fieldEntropy -= p * Math.log2(p);
        });
        fieldEntropy /= Math.log2(5); // Normalize to 5 components
        
        // Combined entropy
        const combined = (textEntropy + fieldEntropy) / 2;
        
        ctx.entropy = {
            text: textEntropy,
            field: fieldEntropy,
            combined: combined
        };
        
        // High entropy = more complex, increase curvature
        if (combined > 0.7) {
            psi.kappa *= (1 + (combined - 0.7) * 0.3);
        }
        
        // Track
        this._history.push(ctx.entropy);
        if (this._history.length > 50) this._history.shift();
        
        return psi;
    },
    
    getAverageEntropy() {
        if (this._history.length === 0) return null;
        
        return {
            text: this._history.reduce((s, h) => s + h.text, 0) / this._history.length,
            field: this._history.reduce((s, h) => s + h.field, 0) / this._history.length,
            combined: this._history.reduce((s, h) => s + h.combined, 0) / this._history.length
        };
    },
    
    reset() {
        this._history = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. RESONANCE DETECTOR
// Detects harmonic resonances between inputs
// ═══════════════════════════════════════════════════════════════════════════════

const ResonanceDetector = {
    id: 'resonance_detector',
    name: 'Resonance Detector',
    icon: '🔔',
    description: 'Detects harmonic resonances in semantic fields',
    version: '1.0.0',
    
    _history: [],
    _harmonics: [1, CONST.phi, 2, Math.E, CONST.pi],
    
    process(psi, input, ctx) {
        ctx.resonances = [];
        
        if (this._history.length < 2) {
            this._history.push({ theta: psi.theta, C: psi.C });
            return psi;
        }
        
        // Check for phase resonance with harmonics
        for (const harmonic of this._harmonics) {
            const targetPhase = (this._history[0].theta * harmonic) % CONST.tau;
            const diff = Math.abs(psi.theta - targetPhase);
            const resonance = Math.cos(diff);
            
            if (resonance > 0.9) {
                ctx.resonances.push({
                    harmonic: harmonic,
                    strength: resonance,
                    phase: psi.theta
                });
            }
        }
        
        // Check for coherence resonance
        const avgC = this._history.reduce((s, h) => s + h.C, 0) / this._history.length;
        if (Math.abs(psi.C - avgC) < 0.05 && psi.C > 0.7) {
            ctx.resonances.push({
                type: 'coherence_lock',
                strength: psi.C,
                average: avgC
            });
        }
        
        // Boost coherence for resonant states
        if (ctx.resonances.length > 0) {
            const maxStrength = Math.max(...ctx.resonances.map(r => r.strength));
            psi.C = Math.min(1, psi.C + maxStrength * 0.02);
            ctx.resonant = true;
        }
        
        // Update history
        this._history.push({ theta: psi.theta, C: psi.C });
        if (this._history.length > 20) this._history.shift();
        
        return psi;
    },
    
    reset() {
        this._history = [];
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

const ASCPIPlugins = {
    TruthDetector,
    ContradictionDetector,
    SemanticCluster,
    ToneAnalyzer,
    CoherenceProfiler,
    FieldHarmonizer,
    EntropyAnalyzer,
    ResonanceDetector,
    
    // Get all plugins as array
    all() {
        return [
            TruthDetector,
            ContradictionDetector,
            SemanticCluster,
            ToneAnalyzer,
            CoherenceProfiler,
            FieldHarmonizer,
            EntropyAnalyzer,
            ResonanceDetector
        ];
    },
    
    // Get plugin by ID
    get(id) {
        return this.all().find(p => p.id === id);
    },
    
    // Reset all plugins
    resetAll() {
        this.all().forEach(p => {
            if (p.reset) p.reset();
        });
    }
};

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASCPIPlugins;
}

if (typeof window !== 'undefined') {
    window.ASCPIPlugins = ASCPIPlugins;
}
