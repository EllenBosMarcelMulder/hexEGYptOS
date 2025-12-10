# **SFT Release 2.0 — Glyph Projectie Operator Pl**

## **Architecturale Specificatie (Foundational Geometry Layer)**

---

# **1. Inleiding**

De Glyph Projectie Operator Pl vormt de overgang tussen de discrete symbolische wereld (ASCII, Unicode, tekst) en de continue semantische veldgeometrie van SFT.

Waar Release 1.0 vaststelde hoe spanning (DeltaPhi), kromming (kappa) en fase (theta) worden berekend voor **één enkel karakter**, breidt Release 2.0 dit uit naar **complexe glyph-entiteiten** die bestaan uit meerdere codepunten, visuele clusters of bidirectionele scriptkenmerken.

De operator Pl projecteert elke glyph G uit een willekeurig schrift in een **continue veldrepresentatie Phi(x, y)**, die vervolgens compatibel is met de FieldMatrix- en Cluster-lagen van SFT.

---

# **2. Doelstelling van Pl**

Pl moet voldoen aan vier fundamentele eisen:

### **1. Uniformiteit**

Pl moet iedere glyph — ASCII, emoji, Arabisch, CJK, Indic, combining marks — kunnen mappen naar een veld zonder uitzonderingen.

### **2. Geometrische Continuïteit**

In plaats van discrete symbolen wordt de glyph gezien als een **vorm** in een continue semantische ruimte.
Dit is het fundament van de Geometrie Laag.

### **3. Stabiliteit onder transformatie**

Of een glyph nu bestaat uit 1 of 12 Unicode codepoints, de uitkomst moet:

* consistent
* reproduceerbaar
* fysisch coherent

zijn.

### **4. Compatibiliteit met SFT Release 1.0**

Het resultaat moet volledig aansluiten op:

* FieldMatrix
* curvature mapping
* theta extraction
* implosion dynamics
* coherence

---

# **3. Definitie van de Operator Pl**

Pl is een **compositie van vier sub-operators**:

Pl = N o U o C o S

waarbij:

### **S = Symbol Decomposition**

Breekt een glyph op in zijn Unicode-componenten, inclusief:

* ligaturen
* combining marks
* direction markers (RTL, BIDI)
* variation selectors
* emoji modifiers (skin-tone, gender, ZWJ clusters)

Voorbeeld:

Emoji 👨‍👩‍👧‍👦 wordt:

[ U+1F468, ZWJ, U+1F469, ZWJ, U+1F467, ZWJ, U+1F466 ]

---

### **C = Canonical Glyph Formation**

Combineert de Unicode-componenten **zoals het systeem ze rendert**.
Dit vormt een **visueel gestabiliseerde glyph-kern**.

Voorbeeld:

* Arabische letter ب + diakritisch teken → 1 canonieke glyph
* Hangul syllable blocks → precomposition
* Emoji sequences → complete family glyph

Hiermee ontstaat de set **G_canonical**.

---

### **U = Unified Shape Projection**

Dit is de kern van de Geometrie Laag.

U projecteert G_canonical op een **vormruimte**:

U(G) → V(x, y)

Dit is een continue 2D vormrepresentatie in een normaal raster zoals 32×32 of 64×64.

Waarom?

Omdat alleen vormen:

* hebben curvature
* hebben oriëntatie
* kunnen worden gedifferentieerd
* velden kunnen opwekken

Voor elke glyph wordt dus een **vormveld** berekend.

---

### **N = Field Normalization**

Zorgt dat de output consistent is met SFT Release 1.0:

N(V) → FieldMatrix

waar:

* DeltaPhi_base = spanning via centroid deviation
* kappa_base = gemiddelde lokale kromming
* theta_base = globale oriëntatie-as
* energy = integraal van V²

Het resultaat is **automatisch compatibel** met de SFT FieldMatrix.

---

# **4. Formele Specificatie per Stap**

---

## **4.1 Decomposition S(G)**

S(G) retourneert:

* unicode_points
* script_type
* ordering
* directional context
* grapheme cluster boundaries

Voorbeeld:

S("ك") → single grapheme
S("िक") → [devanagari vowel sign + consonant]
S("🇪🇬") → regional indicator pair

---

## **4.2 Canonicalization C(S)**

C:

* normaliseert naar NFKC
* projeceert combining marks naar hun visuele posities
* stabiliseert rechts-naar-links glyphs
* reconstrueert complexe emoji via ZWJ

Resultaat:

een enkel **visueel coherent glyph object**, ongeacht inputcomplexiteit.

---

## **4.3 Shape Projection U(C)**

### Vormprojectie gebeurt via één van drie methoden:

1. vectorvorm (curves)
2. grayscale bitmap
3. signed distance field (SDF)

De aanbevolen methode voor SFT Release 2.0 is:

* **SDF: Signed Distance Field**
  omdat dit:

  * gladde curvatures produceert
  * continu differentiabel is
  * theta kan extraheren uit gradient vectors
  * energy fysisch betekenisvol maakt

U(C) produceert een veld:

V(x, y) voor x,y in [0, N]×[0, N]

waarbij V een continue representatie is van de glyphvorm.

---

## **4.4 Normalization N(V)**

N bouwt een SFT-compatibele FieldMatrix:

* DeltaPhi_base = gemiddelde signed distance
* kappa_base = discrete Laplacian van V
* theta_base = gemiddelde vectorrichting
* energy = som van V²

Dit sluit exact aan op Release 1.0.

---

# **5. Resultaat**

Pl(G) levert:

* een complete FieldMatrix
* DeltaPhi_base
* kappa_base
* theta_base
* energy
* glyph regime (nieuw: 32 of 64 regio’s i.p.v. 16 voor unicode)

Dit maakt unicode-gebaseerde coherentie exact even reproduceerbaar als ASCII-gebaseerde.

---

# **6. Integratie met de SFT-Engine**

Release 2.0 vervangt in de SFT_Engine:

FieldMatrix(c)

door:

FieldMatrix( Pl(c) )

(waarbij Pl(c) alle unicode-complexiteit oplost)

De rest van de engine blijft **identiek** — coherence, implosion, curvature, clusters, documentlagen — want die werken al perfect.

Hierdoor wordt Release 2.0:

### • unicode-volledig

### • cultuur-onafhankelijk

### • script-agnostisch

### • schaalbaar

### • mathematisch elegant

### • fysisch betrouwbaar

---

# **7. Volgende Stap**

Als jij bevestigt dat dit document de juiste architectuur bevat, dan lever ik:

### ✔ de volledige pseudocode voor Pl

### ✔ het Python-prototype voor unicode glyph-extractie

### ✔ de SDF-generator (CPU en GPU)

### ✔ integratie met je SFT engine

### ✔ testcases met:

* Arabisch
* Chinees
* Hangul
* Emoji
* Devanagari
* Ethiopisch
* Combining characters
* ZWJ clusters
