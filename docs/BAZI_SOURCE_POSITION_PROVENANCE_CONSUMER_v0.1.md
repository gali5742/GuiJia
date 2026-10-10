# R10: source position provenance consumer v0.1

R10 supplies normalized inputs and a runtime provenance consumer for the five records already audited by Relation Position Provenance v0.1. It preserves their authority, wording, scope and contested interpretations. It introduces no new classical source, relation realization pattern, effect authorization or production behavior.

## Inputs and states

`SourcePositionProvenanceConsumerContract` stores an immutable snapshot of the existing source records plus seven curated assertion annotations. Normalization emits eight units: the proximity assertion is split into two conditional pairs sharing an alternative-group identity. Annotations are keyed by assertion identity, never obtained by parsing Chinese wording or calculating pillar distances.

The normalizer accepts a registered record ID or an exact registered record. The resolver revalidates the entire normalized structure against that registry. Source/annotation identity, tier, chart, wording, polarity, participants, placements and counterfactual configuration must agree. Extra outcome or priority fields, missing provenance and changed source records fail closed. This intentionally accepts a finite source schema, rather than arbitrary user-provided position assertions.

| Source record | Normalized meaning | Consumer result |
| --- | --- | --- |
| CF-RPP-REC-01 | Two independent wealth/food order patterns | Preserved source pattern; no runtime order priority or actor binding |
| CF-RPP-REC-02 | Mentioned intervening Jia; absent Xin separation | Preserved source pattern; the absent barrier reference creates no actor |
| CF-RPP-REC-03 | Food near killer / food near officer as conditional alternatives | Two source-pattern pairs; neither runtime condition or target is selected |
| CF-RPP-REC-04 | Chengqian chart's actual absolute placements, contested interpretation | Explicit visible wealth set and food placements bind; surface-branch killer remains unresolved |
| CF-RPP-REC-05 | He chart's original placements and counterfactual swap | Original visible identities bind; alternative placements remain counterfactual provenance |

For chart-scoped inputs, the exact four pillars are required. Only explicit visible actor keys with matching pillar labels/indexes and stems are bound. A descriptive actor set retains its keys together and gains neither an executable actor-group identity nor member effects. Surface/hidden scope and role-class participants never acquire an identity through proximity, index order or role guessing.

The He swap preserves original `visible:1:戊` and `visible:3:辛` identities. It retains alternative month/hour placements without inventing alternative actor keys, mutating a chart, licensing a swapped chart or selecting a path. “Resolved source-scoped position provenance” means these identity and placement assertions are consumable; it does not mean any relation is realized. The Chengqian record remains unresolved overall even though some explicit placements bind.

## Synthesis and remaining work

Bootstrap v0.32 explicitly loads the contract, profile and consumer after the existing research chain. Full synthesis exposes `contextualForcePartySourcePositionProvenanceConsumer`: five source-corpus results and runtime results only for an exactly matching chart. Unrelated charts do not consume abstract proximity/order patterns as actual conditions.

The dedicated `SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER` dependency records this narrow consumer capability. It does not replace or resolve the legacy global position provenance, corpus coverage, chart-local target binding or competing-path dependencies. Earlier source/audit snapshots describe their own historical scope; the new consumer's runtime capability is reported separately.

R6 B02 remains unresolved. All four global blockers B02–B05 remain: arbitrary chart/source-sensitive position resolution, competing paths, cross-endpoint transfer and branch/hidden/Structure coverage. The R9 raw-motif calibrations remain intact. Strength stays insufficient and Assessment stays contract-only.

The next substantive step is a source-backed condition matcher that connects a normalized position assertion to a specific relation/path identity. It needs independent annotations of actual conditions, scope and any exclusions or coexistence. Order/proximity alone cannot decide a winner; branch bindings and general corpus migration remain independent work.

## Validation

The full-bootstrap regression covers normalization, order alternatives, negative separation, intervening references, conditional proximity, partial cross-scope binding, counterfactual scope, exact-chart refusals, source/normalized-input tampering, immutability, synthesis boundaries and preservation of R9 mediation. Shared CI runs it alongside the existing research, production boundary and browser checks.
