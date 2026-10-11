# R18: transformation result identity input and materialization gates v0.1

R18 makes R17's separation of original operands, transformation operation and result provenance machine-checkable. It provides a normalized identity input, reusable structural validation, a finite source-review adapter, actual operand inventory checks, and separate materialization proposal checks. It resolves operation/result **provenance** for the reviewed case. It does not resolve an executable result endpoint or complete the alternate effect path.

## Provenance identity input

The registered source remains CF-SOKNR-CASE-01, **癸巳 戊午 丙午 壬辰**, from [《滴天髓阐微》](https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE), 通神论 · 官杀 · 四曰合官留杀格. The full R16/R17 natal excerpt, URL, locator, retrieval date 2026-10-11 and unverified historical revision (`null`) are preserved. R18 adds no independent classical case, definition or realization/effect authority.

| Identity | Meaning | Runtime permission |
| --- | --- | --- |
| CF-TRIC-INPUT-01 | Versioned identity input linked to complete source provenance | Structural validity only |
| visible:1:戊 / visible:0:癸 | Reviewed original month/year operands | Actual ordinary operand identities; neither is the result |
| CF-TRIC-OPERATION-01 | Source-asserted compound transformation event | Provenance, not a computed transformation |
| CF-TSBI-TRANSFORM-01 | R17 review authorizing the exact event/result assertion | Does not authorize materialization |
| CF-TSBI-RESULT-01 | Independent result provenance linked back to the operation | No executable endpoint |

The normalized input has closed top-level, operation, operand, assertion and result shapes. It requires separate case/record/operation/result identities, consistent bidirectional operation/result references, distinct original ordinary actor endpoints, source-case/authority evidence IDs and assertion spans contained in the preserved source excerpt. The result retains source labels 火/劫 and an explicitly null executable endpoint. No stem, polarity or normalized ten-god class is invented to give the provenance node an identity. Provenance identity can exist without those ordinary natal-actor attributes.

`validateIdentityInput` is reusable structural validation, **not source authorization**. A coherently changed chart, new operation/result IDs or different result label can be structurally valid and still lack authority. `normalizeSourceReview` first consumes R17's actual finite source validator; it never accepts caller validation flags or reinterprets classical words. `evaluateIdentity` independently compares the normalized record against that registered review before checking current chart and actual original operand profiles/evidence. Missing visible 癸 is not replaced by hidden 辰 癸. Duplicate profiles, wrong role/scope/position, missing evidence and malformed inventories fail closed.

Operation/result provenance is deliberately independent of blade target selection. R18 checks the two original operands; it does not require both 午 branch candidates to establish those original identities. The actual R17 target audit continues to retain its two candidates and refuse target execution. Successful source provenance validation therefore does not imply a resolved blade endpoint.

## Separate materialization proposal and four gates

Materialization is a separate proposed record with its own identity, exact case/chart/operation/result references, independent authority ID and evidence IDs. Its endpoint proposal uses a dedicated deterministic result namespace, source-case-operation-result scope and explicitly declared single endpoint cardinality. This v0.1 proposal shape is limited to one dedicated result endpoint; it does not infer cardinality from one provenance node, two original operands or two blade candidates. Collective result materialization is not defined here.

The reserved proposal type `transformation-result` is **not** added to Relation Endpoint Identity or R4. No ordinary natal actor, hidden 丁, original 戊/癸 compound group or existing fire actor can stand in for the dedicated proposal. No synthetic actor is allocated and no ordinary inventory is reclassified.

The independent materialization gates are:

1. A structurally complete, consistently linked materialization claim.
2. An independently registered source materialization authority that authorizes that exact identity and scope.
3. An authorized materialized-result inventory entry, produced by a separately reviewed adapter.
4. Execution-kernel support for that endpoint type and identity shape.

The materialization authority registry is explicitly empty. The materialized-result inventory adapter does not exist. The actual R4 endpoint validator rejects the reserved proposal type. Consequently `inspectMaterialization` reports missing, invalid or well-formed-but-unregistered proposals and always returns a null executable endpoint. A complete proposal or a forged inventory entry cannot clear the remaining gates. R17's assertion authority, R15's effect license, R16's original nonrealization and the blade definition cannot substitute for result materialization authority.

These states remain distinct: source assertion; schema-valid input; source-authorized operation/result provenance; schema-valid materialization proposal; authorized materialized endpoint; relation realization; effect-type authorization. The first four do not license the latter three. No generic transformation, blade selection, realization/effect resolver, numeric force or final assessment is introduced.

## Integration, verification and next priority

Research bootstrap v0.40 explicitly loads the three identity modules after R17. Synthesis exposes `contextualForcePartyTransformationResultIdentity` with separate schema-readiness, runtime operation-provenance, result-provenance and executable-source-endpoint counts. Its narrow **contract** dependency resolves the defined schema/gates, not endpoint readiness or broad source coverage. On the reviewed chart the operation and result provenance counts are one, while executable source endpoint count remains zero. Other charts retain static schema readiness with no applicable runtime provenance.

The full-bootstrap regression has 57 checks covering source normalization, distinct linked identities, schema validity versus authority, complete unregistered proposal refusal, actual R4 refusal, malformed/sparse input, changed references/chart/labels, original hidden homonyms, forged inventories, independent target/source requirements, immutability and idempotence. The complete materialization proposal fixture is explicitly synthetic and contributes no classical source evidence or registered authority. Shared verification runs this suite alongside previous research stages, core regressions, research/production boundaries, static artifact verification and Chromium browser smoke.

R17's blade ambiguity and refusal, R16's original not-realized result, R15 augmentation, R9 mediation and CASE06 remain intact. Existing motif and direct-realization registries are unchanged. R11 targets, B02–B05 and final Strength/Assessment remain unresolved. Production runtime and LiuYao semantics are unchanged.

Next priority is evidence acquisition and a source-reviewed materialization decision, together with source-specific blade scope/cardinality review. The contract exposes precisely which gates remain missing; defining it does not justify granting a result endpoint. An executable adapter and kernel endpoint extension require their own reviewed source identity and materialization evidence before implementation. A complete independently supported path, plus negative cases, is required before any transferable transformation or effect rule can be considered.
