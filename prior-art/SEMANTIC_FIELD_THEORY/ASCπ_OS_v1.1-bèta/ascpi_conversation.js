/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ASCπ CONVERSATION EXTENSIONS v1.0
 * Unicode Normalizer, DialogueBox, ResponseSynthesizer, ConversationManager
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Extensions for ASCπ Runtime v2.0 enabling conversational field processing.
 * 
 * License: Humanity Heritage License π
 * Prior Art: hexPRIorART-EXA-SFT-2025-MCM
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const CONST = {
    phi: (1 + Math.sqrt(5)) / 2,
    pi: Math.PI,
    tau: 2 * Math.PI,
    eps: 1e-12,
    kappa_min: 0.01,
    kappa_max: 10.0
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. UNICODE NORMALIZER ENERGIEBOX
// ═══════════════════════════════════════════════════════════════════════════════

const EMOJI_SEMANTIC_MAP = {
    // Emotions
    '😀': '[joy]', '😃': '[joy]', '😄': '[joy]', '😁': '[joy]', '😊': '[happy]',
    '🙂': '[content]', '😉': '[wink]', '😍': '[love]', '🥰': '[love]', '😘': '[kiss]',
    '😢': '[sad]', '😭': '[crying]', '😤': '[angry]', '😠': '[angry]', '😡': '[rage]',
    '😱': '[fear]', '😨': '[fear]', '😰': '[anxious]', '😥': '[sad]', '🥺': '[pleading]',
    '😎': '[cool]', '🤔': '[thinking]', '🤨': '[skeptical]', '😐': '[neutral]',
    '😴': '[sleep]', '🤯': '[mindblown]', '🥳': '[celebrate]', '😇': '[innocent]',
    
    // Gestures
    '👍': '[approve]', '👎': '[disapprove]', '👏': '[applause]', '🙏': '[please]',
    '💪': '[strength]', '🤝': '[handshake]', '✌️': '[peace]', '🤞': '[hope]',
    '👋': '[wave]', '🖐️': '[stop]', '✋': '[stop]', '👌': '[ok]', '🤙': '[call]',
    
    // Objects & Symbols
    '❤️': '[love]', '💔': '[heartbreak]', '💯': '[perfect]', '✨': '[sparkle]',
    '🔥': '[fire]', '💡': '[idea]', '⚡': '[energy]', '🎯': '[target]',
    '✅': '[check]', '❌': '[cross]', '⭐': '[star]', '🌟': '[star]',
    '📌': '[pin]', '📝': '[note]', '💬': '[speech]', '💭': '[thought]',
    '🔗': '[link]', '📎': '[attach]', '🔒': '[lock]', '🔓': '[unlock]',
    
    // Nature
    '☀️': '[sun]', '🌙': '[moon]', '⛈️': '[storm]', '🌈': '[rainbow]',
    '🌊': '[wave]', '🌸': '[flower]', '🌺': '[flower]', '🌻': '[sunflower]',
    '🌲': '[tree]', '🍀': '[luck]', '🔮': '[crystal]',
    
    // Tech
    '💻': '[computer]', '📱': '[phone]', '🤖': '[robot]', '🧠': '[brain]',
    '⚙️': '[gear]', '🔧': '[tool]', '📊': '[chart]', '📈': '[growth]',
    
    // Misc
    '🎉': '[celebrate]', '🎊': '[party]', '🎁': '[gift]', '🏆': '[trophy]',
    '🚀': '[rocket]', '✈️': '[plane]', '🏠': '[home]', '🌍': '[world]'
};

const UNICODE_FALLBACK_MAP = {
    // Latin Extended
    'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'ð': 'd', 'þ': 'th',
    'ø': 'o', 'đ': 'd', 'ł': 'l', 'ħ': 'h', 'ŋ': 'ng',
    
    // Currency
    '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR', '₽': 'RUB',
    '฿': 'THB', '₿': 'BTC', '¢': 'c', '₩': 'KRW',
    
    // Math symbols
    '×': 'x', '÷': '/', '±': '+/-', '≈': '~', '≠': '!=',
    '≤': '<=', '≥': '>=', '∞': 'inf', '√': 'sqrt', 'π': 'pi',
    '∑': 'sum', '∏': 'prod', '∫': 'int', '∂': 'd', '∆': 'delta',
    '∇': 'nabla', '∈': 'in', '∉': 'notin', '⊂': 'subset',
    '∪': 'union', '∩': 'intersect', '∀': 'forall', '∃': 'exists',
    
    // Arrows
    '→': '->', '←': '<-', '↑': '^', '↓': 'v', '↔': '<->',
    '⇒': '=>', '⇐': '<=', '⇔': '<=>', '↵': '[enter]',
    
    // Punctuation
    '\u2026': '...', '\u2013': '-', '\u2014': '--', '\u201E': '"', '\u201C': '"',
    '\u201D': '"', '\u2018': "'", '\u2019': "'", '\u00AB': '<<', '\u00BB': '>>',
    '•': '*', '·': '.', '°': 'deg', '′': "'", '″': '"',
    
    // Greek (common)
    'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta',
    'ε': 'epsilon', 'θ': 'theta', 'λ': 'lambda', 'μ': 'mu',
    'σ': 'sigma', 'φ': 'phi', 'ψ': 'psi', 'ω': 'omega',
    'Ψ': 'Psi', 'Φ': 'Phi', 'Ω': 'Omega', 'Σ': 'Sigma',
    
    // Fractions
    '½': '1/2', '⅓': '1/3', '¼': '1/4', '⅔': '2/3', '¾': '3/4',
    
    // Superscripts/Subscripts
    '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5',
    '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4'
};

const UnicodeNormalizerEnergiebox = {
    id: 'unicode_normalizer',
    name: 'Unicode Normalizer',
    icon: '🔤',
    description: 'NFKD decomposition, diacritic removal, emoji mapping',
    color: 'var(--energy)',
    version: '1.0.0',
    
    // State for deterministic processing
    _cache: new Map(),
    
    /**
     * Normalize Unicode string to ASCII
     */
    normalize(text) {
        if (!text) return '';
        
        // Check cache for determinism
        if (this._cache.has(text)) {
            return this._cache.get(text);
        }
        
        let result = text;
        
        // Step 1: Map emojis to semantic tags
        for (const [emoji, tag] of Object.entries(EMOJI_SEMANTIC_MAP)) {
            result = result.split(emoji).join(tag);
        }
        
        // Step 2: Apply fallback mappings for special characters
        for (const [char, replacement] of Object.entries(UNICODE_FALLBACK_MAP)) {
            result = result.split(char).join(replacement);
        }
        
        // Step 3: NFKD decomposition
        result = result.normalize('NFKD');
        
        // Step 4: Remove combining diacritical marks (U+0300 - U+036F)
        result = result.replace(/[\u0300-\u036f]/g, '');
        
        // Step 5: Remove remaining non-ASCII, keep printable ASCII
        result = result.replace(/[^\x20-\x7E\n\r\t]/g, (char) => {
            // Try to provide a meaningful replacement
            const code = char.charCodeAt(0);
            if (code >= 0x4E00 && code <= 0x9FFF) {
                // CJK character - mark as such
                return '[CJK]';
            } else if (code >= 0x0600 && code <= 0x06FF) {
                // Arabic
                return '[AR]';
            } else if (code >= 0x0400 && code <= 0x04FF) {
                // Cyrillic
                return '[CYR]';
            } else if (code >= 0x0900 && code <= 0x097F) {
                // Devanagari
                return '[DEV]';
            }
            return '';
        });
        
        // Step 6: Normalize whitespace
        result = result.replace(/\s+/g, ' ').trim();
        
        // Cache result
        if (this._cache.size > 10000) {
            // Prevent memory leak
            this._cache.clear();
        }
        this._cache.set(text, result);
        
        return result;
    },
    
    /**
     * Process as Energiebox
     */
    process(psi, input, context) {
        if (!input) return psi;
        
        // Normalize the input
        const normalized = this.normalize(input);
        
        // Store normalized text in context for downstream
        if (context) {
            context.normalizedInput = normalized;
        }
        
        // Calculate field adjustments based on normalization
        const originalLen = input.length;
        const normalizedLen = normalized.length;
        const compressionRatio = normalizedLen / Math.max(originalLen, 1);
        
        // Count semantic tags added
        const tagCount = (normalized.match(/\[[\w]+\]/g) || []).length;
        
        const result = psi.copy ? psi.copy() : { ...psi };
        
        // Compression affects curvature (more compression = higher structure)
        result.kappa *= (1 + (1 - compressionRatio) * 0.2);
        result.kappa = Math.min(CONST.kappa_max, result.kappa);
        
        // Semantic tags increase information density
        result.N += tagCount * 0.05;
        
        // Phase shift based on content transformation
        result.theta += compressionRatio * 0.1;
        result.theta = result.theta % CONST.tau;
        
        if (result.enforce) result.enforce();
        
        return result;
    },
    
    /**
     * Clear normalization cache
     */
    clearCache() {
        this._cache.clear();
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DIALOGUE BOX ENERGIEBOX
// ═══════════════════════════════════════════════════════════════════════════════

const DialogueBoxEnergiebox = {
    id: 'dialogue_box',
    name: 'DialogueBox',
    icon: '💬',
    description: 'Rolling context window with weighted Ψ merge',
    color: 'var(--phi)',
    version: '1.0.0',
    
    // Rolling context window
    _contextWindow: [],
    _maxContext: 20,
    _dialogueState: null,
    
    /**
     * Compact Ψ vector representation
     */
    _compactPsi(psi) {
        return {
            v: [psi.dPhi, psi.kappa, psi.theta, psi.N, psi.C],
            t: psi.t || 0
        };
    },
    
    /**
     * Expand compact vector back to Psi-like object
     */
    _expandPsi(compact) {
        return {
            dPhi: compact.v[0],
            kappa: compact.v[1],
            theta: compact.v[2],
            N: compact.v[3],
            C: compact.v[4],
            t: compact.t
        };
    },
    
    /**
     * Calculate weight for context entry based on recency and coherence
     */
    _calculateWeight(entry, index, total) {
        // Recency weight (more recent = higher weight)
        const recencyWeight = (index + 1) / total;
        
        // Coherence weight
        const coherenceWeight = entry.v[4]; // C component
        
        // Curvature weight (lower curvature = more stable = higher weight)
        const curvatureWeight = 1 / (1 + entry.v[1]);
        
        // Combined weight
        return recencyWeight * 0.4 + coherenceWeight * 0.4 + curvatureWeight * 0.2;
    },
    
    /**
     * Merge context window into dialogue state Ψ_d
     */
    _mergeContext() {
        if (this._contextWindow.length === 0) {
            this._dialogueState = {
                dPhi: 0,
                kappa: 0.5,
                theta: 0,
                N: 1,
                C: 0.5,
                t: 0
            };
            return;
        }
        
        const n = this._contextWindow.length;
        let totalWeight = 0;
        let merged = { dPhi: 0, kappa: 0, theta: 0, N: 0, C: 0 };
        let sinSum = 0, cosSum = 0;
        
        this._contextWindow.forEach((entry, i) => {
            const w = this._calculateWeight(entry, i, n);
            totalWeight += w;
            
            merged.dPhi += w * entry.v[0];
            merged.kappa += w * entry.v[1];
            merged.N += w * entry.v[3];
            merged.C += w * entry.v[4];
            
            // Circular mean for phase
            sinSum += w * Math.sin(entry.v[2]);
            cosSum += w * Math.cos(entry.v[2]);
        });
        
        if (totalWeight > 0) {
            merged.dPhi /= totalWeight;
            merged.kappa /= totalWeight;
            merged.theta = Math.atan2(sinSum, cosSum);
            merged.N /= totalWeight;
            merged.C /= totalWeight;
        }
        
        // Apply bounds
        merged.kappa = Math.max(CONST.kappa_min, Math.min(CONST.kappa_max, merged.kappa));
        merged.C = Math.max(0, Math.min(1, merged.C));
        merged.theta = ((merged.theta % CONST.tau) + CONST.tau) % CONST.tau;
        
        merged.t = this._contextWindow[n - 1].t;
        
        this._dialogueState = merged;
    },
    
    /**
     * Add Ψ to context window
     */
    addToContext(psi) {
        const compact = this._compactPsi(psi);
        this._contextWindow.push(compact);
        
        // Maintain window size
        while (this._contextWindow.length > this._maxContext) {
            this._contextWindow.shift();
        }
        
        // Recompute dialogue state
        this._mergeContext();
    },
    
    /**
     * Get current dialogue state
     */
    getDialogueState() {
        if (!this._dialogueState) {
            this._mergeContext();
        }
        return { ...this._dialogueState };
    },
    
    /**
     * Get context window as array
     */
    getContextWindow() {
        return this._contextWindow.map(c => this._expandPsi(c));
    },
    
    /**
     * Process as Energiebox
     */
    process(psi, input, context) {
        // Add current Ψ to context
        this.addToContext(psi);
        
        // Get merged dialogue state
        const dialogueState = this.getDialogueState();
        
        // Store in context for downstream
        if (context) {
            context.dialogueState = dialogueState;
            context.contextLength = this._contextWindow.length;
        }
        
        // Blend current Ψ with dialogue state
        const result = psi.copy ? psi.copy() : { ...psi };
        
        // Blend factor based on context length
        const blendFactor = Math.min(0.3, this._contextWindow.length * 0.02);
        
        result.dPhi = (1 - blendFactor) * result.dPhi + blendFactor * dialogueState.dPhi;
        result.kappa = (1 - blendFactor) * result.kappa + blendFactor * dialogueState.kappa;
        result.N = (1 - blendFactor) * result.N + blendFactor * dialogueState.N;
        
        // Phase blending (circular)
        const sinBlend = (1 - blendFactor) * Math.sin(result.theta) + blendFactor * Math.sin(dialogueState.theta);
        const cosBlend = (1 - blendFactor) * Math.cos(result.theta) + blendFactor * Math.cos(dialogueState.theta);
        result.theta = Math.atan2(sinBlend, cosBlend);
        
        // Coherence boost from dialogue continuity
        result.C = Math.min(1, result.C + this._contextWindow.length * 0.005);
        
        if (result.enforce) result.enforce();
        
        return result;
    },
    
    /**
     * Clear dialogue context
     */
    clear() {
        this._contextWindow = [];
        this._dialogueState = null;
    },
    
    /**
     * Set max context size
     */
    setMaxContext(n) {
        this._maxContext = Math.max(1, Math.min(100, n));
        while (this._contextWindow.length > this._maxContext) {
            this._contextWindow.shift();
        }
        this._mergeContext();
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RESPONSE SYNTHESIZER
// ═══════════════════════════════════════════════════════════════════════════════

const ResponseSynthesizer = {
    id: 'response_synthesizer',
    name: 'Response Synthesizer',
    version: '1.0.0',
    
    // Sentence structure templates based on curvature
    _structureTemplates: {
        low: [      // κ < 0.3: Simple, direct
            '{subject} {verb} {object}.',
            '{statement}.',
            '{observation}.'
        ],
        medium: [   // 0.3 ≤ κ < 0.7: Moderate complexity
            '{subject} {verb} {object}, {qualifier}.',
            'Given {context}, {conclusion}.',
            '{statement}, which {elaboration}.'
        ],
        high: [     // κ ≥ 0.7: Complex, nested
            'While {context}, {subject} {verb} {object}, {qualifier}.',
            'Considering {premise}, it follows that {conclusion}, {elaboration}.',
            '{observation}; moreover, {extension}, {synthesis}.'
        ]
    },
    
    // Tone modifiers based on phase θ
    _toneMap: {
        // θ in [0, π/4): Analytical
        analytical: {
            qualifiers: ['specifically', 'precisely', 'notably', 'technically'],
            verbs: ['indicates', 'demonstrates', 'suggests', 'implies'],
            connectors: ['therefore', 'thus', 'hence', 'consequently']
        },
        // θ in [π/4, π/2): Neutral
        neutral: {
            qualifiers: ['generally', 'typically', 'usually', 'commonly'],
            verbs: ['is', 'represents', 'shows', 'reflects'],
            connectors: ['and', 'while', 'as', 'since']
        },
        // θ in [π/2, 3π/4): Emphatic
        emphatic: {
            qualifiers: ['significantly', 'importantly', 'remarkably', 'clearly'],
            verbs: ['reveals', 'establishes', 'confirms', 'affirms'],
            connectors: ['indeed', 'certainly', 'undoubtedly', 'evidently']
        },
        // θ in [3π/4, π): Cautious
        cautious: {
            qualifiers: ['potentially', 'possibly', 'seemingly', 'apparently'],
            verbs: ['might indicate', 'could suggest', 'appears to show', 'seems to imply'],
            connectors: ['however', 'although', 'perhaps', 'yet']
        },
        // θ in [π, 5π/4): Reflective
        reflective: {
            qualifiers: ['interestingly', 'curiously', 'notably', 'surprisingly'],
            verbs: ['emerges', 'manifests', 'unfolds', 'develops'],
            connectors: ['meanwhile', 'furthermore', 'additionally', 'moreover']
        },
        // θ in [5π/4, 3π/2): Assertive
        assertive: {
            qualifiers: ['definitively', 'conclusively', 'decisively', 'firmly'],
            verbs: ['determines', 'establishes', 'proves', 'validates'],
            connectors: ['specifically', 'particularly', 'especially', 'primarily']
        },
        // θ in [3π/2, 7π/4): Contemplative
        contemplative: {
            qualifiers: ['thoughtfully', 'carefully', 'deeply', 'thoroughly'],
            verbs: ['considers', 'examines', 'explores', 'investigates'],
            connectors: ['in essence', 'fundamentally', 'at its core', 'ultimately']
        },
        // θ in [7π/4, 2π): Synthesizing
        synthesizing: {
            qualifiers: ['comprehensively', 'holistically', 'collectively', 'jointly'],
            verbs: ['integrates', 'unifies', 'combines', 'synthesizes'],
            connectors: ['together', 'overall', 'in summary', 'collectively']
        }
    },
    
    // Semantic density markers based on ΔΦ
    _densityMarkers: {
        sparse: ['simply', 'basically', 'just', 'merely'],
        normal: ['', '', '', ''],  // No markers
        dense: ['complexly', 'intricately', 'elaborately', 'thoroughly'],
        very_dense: ['comprehensively', 'exhaustively', 'extensively', 'deeply']
    },
    
    // Confidence markers based on C
    _confidenceMarkers: {
        low: ['possibly', 'might be', 'could be', 'perhaps'],
        medium: ['likely', 'probably', 'appears to be', 'seems'],
        high: ['clearly', 'evidently', 'certainly', 'definitely'],
        very_high: ['undoubtedly', 'absolutely', 'unquestionably', 'assuredly']
    },
    
    /**
     * Deterministic selection from array based on field values
     */
    _select(arr, psi, offset = 0) {
        if (!arr || arr.length === 0) return '';
        // Use field values for deterministic selection
        const index = Math.floor(
            ((psi.theta + psi.C * CONST.phi + psi.kappa + offset) * 1000) % arr.length
        );
        return arr[Math.abs(index) % arr.length];
    },
    
    /**
     * Get tone based on phase
     */
    _getTone(theta) {
        const normalized = ((theta % CONST.tau) + CONST.tau) % CONST.tau;
        const segment = Math.floor(normalized / (CONST.pi / 4));
        const tones = ['analytical', 'neutral', 'emphatic', 'cautious', 
                       'reflective', 'assertive', 'contemplative', 'synthesizing'];
        return this._toneMap[tones[segment % 8]];
    },
    
    /**
     * Get structure complexity based on curvature
     */
    _getStructure(kappa) {
        if (kappa < 0.3) return 'low';
        if (kappa < 0.7) return 'medium';
        return 'high';
    },
    
    /**
     * Get density level based on ΔΦ
     */
    _getDensity(dPhi) {
        const abs = Math.abs(dPhi);
        if (abs < 0.1) return 'sparse';
        if (abs < 0.3) return 'normal';
        if (abs < 0.6) return 'dense';
        return 'very_dense';
    },
    
    /**
     * Get confidence level based on C
     */
    _getConfidence(C) {
        if (C < 0.3) return 'low';
        if (C < 0.6) return 'medium';
        if (C < 0.85) return 'high';
        return 'very_high';
    },
    
    /**
     * Generate field state description
     */
    _describeFieldState(psi) {
        const structure = this._getStructure(psi.kappa);
        const tone = this._getTone(psi.theta);
        const density = this._getDensity(psi.dPhi);
        const confidence = this._getConfidence(psi.C);
        
        return {
            structure,
            tone,
            density,
            confidence,
            curvature: psi.kappa.toFixed(3),
            phase: (psi.theta / CONST.pi).toFixed(3) + 'pi',
            coherence: (psi.C * 100).toFixed(1) + '%'
        };
    },
    
    /**
     * Synthesize response text from Ψ
     */
    synthesize(psi, context = {}) {
        const state = this._describeFieldState(psi);
        const tone = state.tone;
        
        // Build response components
        const confidenceMarker = this._select(
            this._confidenceMarkers[state.confidence], psi, 1
        );
        const densityMarker = this._select(
            this._densityMarkers[state.density], psi, 2
        );
        const qualifier = this._select(tone.qualifiers, psi, 3);
        const verb = this._select(tone.verbs, psi, 4);
        const connector = this._select(tone.connectors, psi, 5);
        
        // Generate field description
        const fieldDesc = `Field state: kappa=${state.curvature}, theta=${state.phase}, C=${state.coherence}`;
        
        // Generate semantic response based on structure
        let response = '';
        
        if (state.structure === 'low') {
            response = `${confidenceMarker} the field ${verb} coherent processing. ${fieldDesc}.`;
        } else if (state.structure === 'medium') {
            response = `${connector}, the semantic field ${qualifier} ${verb} structured patterns, ${densityMarker} reflecting the input. ${fieldDesc}.`;
        } else {
            response = `${connector}, considering the ${densityMarker} processed input, the field ${qualifier} ${verb} complex semantic structure; ${fieldDesc}, with ${state.confidence} confidence.`;
        }
        
        // Clean up
        response = response.replace(/\s+/g, ' ').trim();
        response = response.charAt(0).toUpperCase() + response.slice(1);
        
        return {
            text: response,
            state: state,
            metadata: {
                structure: state.structure,
                tone: Object.keys(this._toneMap).find(k => this._toneMap[k] === tone),
                density: state.density,
                confidence: state.confidence
            }
        };
    },
    
    /**
     * Generate summary of dialogue state
     */
    summarizeDialogue(dialogueState, contextLength) {
        if (!dialogueState) {
            return { text: 'No dialogue context available.', state: null };
        }
        
        const state = this._describeFieldState(dialogueState);
        const tone = state.tone;
        const connector = this._select(tone.connectors, dialogueState, 0);
        
        let summary = `${connector}, after ${contextLength} exchanges, dialogue coherence is at ${state.coherence}`;
        
        if (dialogueState.C > 0.7) {
            summary += ', indicating strong contextual continuity.';
        } else if (dialogueState.C > 0.4) {
            summary += ', showing moderate dialogue flow.';
        } else {
            summary += ', suggesting fragmented context.';
        }
        
        return {
            text: summary,
            state: state
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONVERSATION MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

class ConversationManager {
    constructor(runtime) {
        this.runtime = runtime;
        this.unicodeNormalizer = UnicodeNormalizerEnergiebox;
        this.dialogueBox = DialogueBoxEnergiebox;
        this.responseSynthesizer = ResponseSynthesizer;
        
        // Ensure energieboxen are registered
        this._registerComponents();
    }
    
    _registerComponents() {
        // Register if runtime has energieboxen map
        if (this.runtime && this.runtime.energieboxen) {
            if (!this.runtime.energieboxen.has('unicode_normalizer')) {
                this.runtime.energieboxen.set('unicode_normalizer', this.unicodeNormalizer);
            }
            if (!this.runtime.energieboxen.has('dialogue_box')) {
                this.runtime.energieboxen.set('dialogue_box', this.dialogueBox);
            }
        }
    }
    
    /**
     * Main chat pipeline
     * unicode_normalizer → text encoder → active plugins → kernel F → DialogueBox → ResponseSynthesizer
     */
    async chat(input) {
        const context = {
            originalInput: input,
            normalizedInput: null,
            dialogueState: null,
            contextLength: 0
        };
        
        // Step 1: Unicode normalization
        const normalizedInput = this.unicodeNormalizer.normalize(input);
        context.normalizedInput = normalizedInput;
        
        // Step 2-4: Process through runtime (includes text encoder, active plugins, kernel F)
        let result;
        if (this.runtime && this.runtime.process) {
            // Use runtime's process which handles text encoding and kernel evolution
            result = await this.runtime.process(normalizedInput);
        } else {
            // Fallback: create basic Psi from normalized input
            result = { psi: this._basicEncode(normalizedInput) };
        }
        
        let psi = result.psi;
        
        // Step 5: DialogueBox merge
        psi = this.dialogueBox.process(psi, normalizedInput, context);
        
        // Step 6: Response synthesis
        const response = this.responseSynthesizer.synthesize(psi, context);
        const dialogueSummary = this.responseSynthesizer.summarizeDialogue(
            context.dialogueState,
            context.contextLength
        );
        
        return {
            input: {
                original: input,
                normalized: normalizedInput
            },
            field: {
                psi: psi,
                coherence: psi.C,
                curvature: psi.kappa,
                phase: psi.theta,
                energy: psi.N
            },
            dialogue: {
                state: context.dialogueState,
                contextLength: context.contextLength,
                summary: dialogueSummary.text
            },
            response: {
                text: response.text,
                metadata: response.metadata,
                state: response.state
            },
            runtime: result
        };
    }
    
    /**
     * Basic text encoding fallback
     */
    _basicEncode(text) {
        if (!text) return { dPhi: 0, kappa: 0.5, theta: 0, N: 1, C: 0.5, t: 0 };
        
        const chars = [...text].filter(c => !c.match(/\s/));
        if (chars.length === 0) return { dPhi: 0, kappa: 0.5, theta: 0, N: 1, C: 0.5, t: 0 };
        
        let dP = 0, k = 0, N = 0, sinS = 0, cosS = 0;
        chars.forEach((c, i) => {
            const cp = c.charCodeAt(0);
            const t = ((cp / 256) * CONST.phi + (cp % 256) / 256 * CONST.tau + (i / chars.length) * CONST.pi) % CONST.tau;
            sinS += Math.sin(t);
            cosS += Math.cos(t);
            k += 0.3;
            dP += Math.abs(cp - 0x4E00) / 0x10FFFF;
            N += Math.log(1 + cp) / Math.log(0x10FFFF + 1);
        });
        
        const n = chars.length;
        return {
            dPhi: dP / n,
            kappa: Math.min(CONST.kappa_max, k / n),
            theta: Math.atan2(sinS, cosS),
            N: N,
            C: Math.sqrt(sinS ** 2 + cosS ** 2) / n,
            t: 0
        };
    }
    
    /**
     * Clear dialogue context
     */
    clearContext() {
        this.dialogueBox.clear();
    }
    
    /**
     * Get current dialogue state
     */
    getDialogueState() {
        return this.dialogueBox.getDialogueState();
    }
    
    /**
     * Get context window
     */
    getContextWindow() {
        return this.dialogueBox.getContextWindow();
    }
    
    /**
     * Set max context size
     */
    setMaxContext(n) {
        this.dialogueBox.setMaxContext(n);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. INTEGRATION HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Integrate conversation extensions into existing runtime
 */
function integrateConversation(runtime) {
    // Create conversation manager
    const conversationManager = new ConversationManager(runtime);
    
    // Add chat method to runtime
    runtime.chat = async function(input) {
        return conversationManager.chat(input);
    };
    
    // Add conversation manager reference
    runtime.conversation = conversationManager;
    
    // Add individual energieboxen
    if (runtime.energieboxen) {
        runtime.energieboxen.set('unicode_normalizer', UnicodeNormalizerEnergiebox);
        runtime.energieboxen.set('dialogue_box', DialogueBoxEnergiebox);
    }
    
    return conversationManager;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UnicodeNormalizerEnergiebox,
        DialogueBoxEnergiebox,
        ResponseSynthesizer,
        ConversationManager,
        integrateConversation,
        EMOJI_SEMANTIC_MAP,
        UNICODE_FALLBACK_MAP
    };
}

if (typeof window !== 'undefined') {
    window.ASCPIConversation = {
        UnicodeNormalizerEnergiebox,
        DialogueBoxEnergiebox,
        ResponseSynthesizer,
        ConversationManager,
        integrateConversation,
        EMOJI_SEMANTIC_MAP,
        UNICODE_FALLBACK_MAP
    };
}
