# R7 — Registered Motif Authorization Matcher v0.1

R7 adds a finite actor-to-actor authorization matcher after R6. It consumes independently resolved, exact-source cross-visible edges, matches only the existing three motif authorities, and sends authorized records through the existing R5 normalizer and R4 execution kernel. It does not add source patterns, textual evidence or effect types.

## Input and execution boundaries

- The relation must have an explicit identity and direction, chart-bound visible source/target actors, unambiguous chart-consistent role evidence, and a unique registered direct-source realization pattern.
- Chart, endpoints, function, scope, realization state and realization evidence rule must agree with that pattern. Merely supplying a pattern identifier is insufficient.
- Position/path provenance is preserved within the exact source context. Generic position provenance and competing-path resolution remain undefined.
- Opposition and mediation reuse the existing raw-motif membership gates and record construction. Augmentation additionally requires one consistent upstream affiliation record and retains its identity and evidence.
- An authorized record enters R5 normalization before R4 execution. A valid realized edge without a motif remains `realized-relation-currently-unmapped`; a valid negative edge remains `not-realized-generic-relation-effect`.
- Invalid provenance is unresolved and cannot execute either a supplied positive or a supplied negative outcome.
- Collective, branch and hidden endpoints are outside this matcher. Existing collective effect records are untouched; no group is split into member effects.
- Matcher results are a separate research view, not additional force units. No membership, strength, relative dominance or final assessment is inferred.

## Research integration repair

The full ordered bootstrap regression exposed a pre-existing failure: research modules call `baziStrengthSynthesis.registerExtension`, but the real synthesis API did not define it. Unit fixtures supplied this method, while production smoke tests intentionally exclude the research closure.

`bazi-research-synthesis-extensions.js` now installs the registration API immediately after the base synthesis, only in the explicit research bootstrap. Each registration wraps the current builder so legacy wrappers installed between registrations are preserved. Duplicate names are idempotent. Production `index.html` and the base production synthesis are unchanged.

## Verification and limits

The dedicated regression loads every actual bootstrap dependency in order and checks that it is installed. It runs the real `丁丑|癸卯|乙卯|己卯` chart through interpretation and synthesis, preserving its realized-unmapped and not-realized cross-visible relations. It also checks all nine existing opposition/mediation calibration candidates remain ineligible for positive actor-pair calibration.

Positive opposition, mediation and augmentation mechanics are exercised with explicitly test-only injected realization patterns, using the actual motif contracts, R5 normalization and R4 execution. These fixtures never modify the shipped source registry and are not textual authority or real positive source calibration.

R6 retains all five global blockers. Generic Effect-Type Authorization Resolver, broader scope coverage, Relative Dominance and final Strength/Assessment remain unresolved. The next semantic milestone is a real, independently sourced, endpoint-specific positive calibration case; passing synthetic tests cannot satisfy that milestone.

Run the dedicated regression with:

```text
node tests/bazi-contextual-force-party-registered-motif-authorization-matcher-tests.js
```
