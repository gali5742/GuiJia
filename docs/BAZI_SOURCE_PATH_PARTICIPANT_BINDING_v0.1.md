# R12: source path participant binding v0.1

R12 consumes the actual R11 condition results and binds only their explicitly referenced source/intermediate participants. It creates chart-scoped partial path instances while keeping target identity, realization and execution separate. This stage adds no classical source, realization pattern or effect authorization.

## Declared participant references

| R11 link | Source path | Source reference | Intermediate reference | Target |
| --- | --- | --- | --- | --- |
| CF-SPPCM-LINK-01 | CF-CRP-REC-01-P01 | wealth: visible 癸 | none | 七杀, identity/scope unresolved |
| CF-SPPCM-LINK-01 | CF-CRP-REC-01-P02 | food: visible 辛 | none | 七杀, identity/scope unresolved |
| CF-SPPCM-LINK-02 | CF-CRP-REC-02-P01 | food: visible 辛 | none | 七杀, identity/scope unresolved |
| CF-SPPCM-LINK-02 | CF-CRP-REC-02-P02 | wealth: visible 癸 | food: visible 辛 | 七杀, identity/scope unresolved |
| CF-SPPCM-LINK-03 | CF-CRP-REC-03-P01 | food | none | killer reference, 七杀 |
| CF-SPPCM-LINK-04 | CF-CRP-REC-03-P02 | food | none | officer reference, 正官 |

Descriptors derive only from R11's curated `pathParticipantRefs`. They do not parse verbs, equate ten-god roles with actor identity or invent references. R11's shared 己生卯月 context, exact source-mentioned visible 癸/辛 identities, order and specified hour placement remain binding gates. Matched order conditions create two partial path instances per applicable clause. The proximity conditions remain unresolved and create no instances, even when visible actors are adjacent.

CF-CRP-REC-02-P02 preserves the single compound 财转食党煞 source path, its predicate and 食神 intermediate identity. The intermediate participant is a binding within this path, not an independent endpoint effect or a new source→food→killer edge sequence. Source-permitted coexistence, declared order and exclusive-selection policies are retained as provenance; no runtime winner is selected.

Targets stay explicitly unresolved. The order records specify 七杀 as a role but do not provide an independently authorized target actor/scope annotation. Neither a unique visible 乙 nor 卯月藏乙 supplies that missing authority. The existing hidden-single-target calibration for a different source case cannot be borrowed. No role-based, nearest-actor or hidden-stem selector runs here.

## Provenance validation and states

`bindCondition(result, chartKey)` recomputes the canonical R11 result for the separately supplied current chart and requires exact structural equality before consuming anything. Synthesis obtains the chart from the semantic model and existing functional records, rather than trusting the result's chart string. Callers cannot alter status, actor keys/scopes, source/context/path identities, intermediate roles, source policy or validation evidence, or append target/execution authority. Invalid results create no path instances and retain no authoritative link IDs. Inputs are not mutated or frozen; outputs and copied source provenance are deeply immutable.

`bindBatch` requires all four distinct registered R11 results. Missing, duplicate, extra or tampered entries reject the whole batch rather than salvage positives or synthesize replacements. Input array order is not path precedence. The path instance ID includes the full structured chart key, R11 link ID and original source path ID; another chart matching the same condition retains the source identity but receives a different instance identity.

| Binding state | Result |
| --- | --- |
| source-path-participants-bound-target-unresolved | Condition matched; source/intermediate actors bound; target remains unknown |
| source-path-binding-condition-not-satisfied | Known false source condition; no path instances |
| source-path-participant-binding-not-applicable | Chart outside the registered source context; no path instances |
| unresolved-source-path-participant-binding | Missing/ambiguous identity or unavailable proximity evidence; no path instances |
| invalid-source-path-condition-provenance | Supplied result differs from canonical current-chart R11 provenance; no path instances |

A false condition does not mean the relation was not realized or produce a reverse effect. A partial participant binding does not resolve relation realization. All instances keep `participantBindingComplete:false`, `realizationState:'unresolved'`, execution authorization false, empty member/effect edges, no winner, and no numeric score or dominance.

## Integration, validation and next priority

Research bootstrap v0.34 explicitly loads the three R12 modules. Full synthesis exposes `contextualForcePartySourcePathParticipantBinding` and a dedicated narrow rule-coverage dependency for four validated links/six descriptors and exact upstream consumption. This capability records the implemented binding schema, independently of whether the current chart matches. Complete endpoint path count remains zero. B02–B05, generic position/competing-path resolution and corpus coverage remain unresolved; Strength is insufficient and Assessment is contract-only. Production runtime and LiuYao behavior are outside this change.

The full-bootstrap regression uses synthetic schema fixtures, not newly sourced classical chart cases or positive effect calibration. It checks both order clauses, compound identity/intermediate binding, chart-scoped IDs, unresolved visible/hidden targets, distinct gating states, proximity refusal, adversarial result/batch edits, immutability, actual synthesis boundaries and existing R9 mediation.

The next priority is an independently sourced and reviewed target identity/scope annotation for a selected path or source pattern. It must distinguish role-level 七杀 from a visible actor, a specific hidden actor or a collective endpoint, including ambiguity and refusal cases. If the existing evidence cannot support that annotation, keep the target unresolved and obtain stronger evidence before implementing a resolver. Target binding still would not complete realization, effect-type authorization or competing-path selection. Actual proximity/intervening evidence and relative-capacity criteria remain separate prerequisites for broader progress.
