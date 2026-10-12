# Source Seal Damage Effect Scope Audit v0.1 (R28)

R28 audits the missing effect-type authority for R27's source-asserted **month whole 卯→day whole 丑 damage** in **戊辰｜乙卯｜辛丑｜丁酉**. It reuses the complete registered natal source and preserves the realized-unmapped event through actual R27/normalization/R3/R4. The new result identifies a recipient-relative damage semantics gap, rather than guessing an existing anchor effect or deleting the event. Counts: one reused complete chart, zero new charts, zero new effect authorities or R5 families.

## Source and independent review

Primary provenance is unchanged from [R27](BAZI_SOURCE_SEAL_OBSTRUCTION_CONTRAST_v0.1.md): [《滴天髓阐微》通神论 · 二十、通关](https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE), retrieved 2026-10-12, revision ID unavailable (`null`). R28's independent review date is 2026-10-12; the source is not re-registered under a new case ID.

The source names 日支之丑土 as the recipient of 卯木所坏. `CF-SSOC-PATH-02`, `CF-SSOC-IDENTITY-02` and `CF-SSOC-REALIZATION-02` remain the upstream identity/realization authorities. `CF-SSDES-REVIEW-01` is an effect-scope audit, **not** a positive effect-type authority. R27's failed visible communication and non-actionable whole-chart configuration remain separate.

## Recipient evidence and scope comparison

| Evidence or authority | Verified scope | Consequence for this audit |
| --- | --- | --- |
| Actual `CF-PM-alliedSupport-2` / `QBR-BRANCH-day` | Whole 丑 branch, earth, generation-support, direct-support seed candidate; actor `surface-branch:2:丑` | The current recipient is a daymaster-side seed candidate, with no counter-anchor ID; no active membership or effective support is established |
| Actual whole-branch hidden role context | 己偏印、癸食神、辛比肩 relative to 辛 | A seal-bearing branch stays whole; it is not assigned one pure 印 role or replaced by hidden 己 |
| `CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001` | Registered 食神→七杀 restraint, evidence `CF-PAE-E03/E04` | The existing killer-opposition motif does not license this whole seal-bearing recipient |
| `CF-SBOO-EFFECT-01` / R22 | Exact 壬午｜己酉｜甲申｜甲子, whole 午→酉 officer restraint with path-specific 去官 | The exact officer-opposition authority cannot transfer to this chart, actor pair or damage predicate |

The runtime consumer requires the exact recipient evidence fields and unique profile/evidence identities. It rebuilds the recipient profile with the actual Membership API and checks agreement with the supplied profile and seed/counter indices. Missing, duplicate, malformed, sparse or contradictory records fail closed. A consistently forged incoming-restraint evidence/profile pair also fails because it does not match the registered whole-branch support evidence. Unused actors are not newly required.

The evidence is an inventory candidate classification, not source-backed proof of active party membership. The source's damage assertion and the inventory's support seed answer different questions. Neither one determines a numeric loss, all-support absence, relative strength, source party switch or the failure of an independently unidentified killer→branch-seal path.

## Meaning of the gap

`CF-SSDES-GAP-01` records `independent-recipient-relative-damage-semantics-unlicensed`. The reviewed existing opposition authorities concern killer/officer recipients, while this source asserts damage to a seal-bearing support candidate. An independent recipient-relative effect review is therefore required before positive typed execution.

This is **not** a universal prohibition against naming future support damage as opposition, a declaration that the three current types are exhaustive, or a generic recipient-class gate added to R4. R4 remains an authorization consumer. The audit does not alter the existing six R5 families or infer type from 木克土, 坏印, membership class, hidden ten gods or realization. Any decision to reuse a type, define a new type, or add a new source family needs its own semantic contract and source-backed exact authority.

The event remains `realized-relation-currently-unmapped`; unmapped does not mean no effect, nonrealization or reverse effect. Actual source assertion is retained even though positive typed execution is unauthorized.

## Next priority

Review primary natal evidence that explicitly attributes damage to an identifiable support recipient, and define the qualitative recipient-relative damage semantics and compatibility with the existing vocabulary before registering a positive authority. Keep whole-branch versus hidden-stem scope explicit. The separate branch-mediation negative identity/realization gap remains open; seal damage alone must not fill it. This phase does not close B02–B05 or provide aggregation/final strength.

## Wiring and verification

- Research bootstrap v0.50 appends contract/profile/integration and the sealed verifier requires this order.
- Synthesis view: `contextualForcePartySourceSealDamageEffectScopeAudit`.
- APIs: `inputForCase`, `validateSourceInput`, `evaluateSource`, `buildProfile`.
- Finite review coverage resolves only the narrow source-coverage dependency. Matching runtime has one audited recipient and one realized-unmapped path; empty/other-chart context has zero runtime coverage.
- Shared regression: `tests/bazi-contextual-force-party-source-seal-damage-effect-scope-audit-tests.js`, 50 checks for actual upstream consumption, reconstructed evidence, scope/provenance refusal, no authority transfer, positive prior cases, immutability and finite/global boundaries.
- Production entry points and LiuYao semantics are unchanged. Six R5 families, three legacy motifs, three legal shapes, all four global blockers, insufficient synthesis and contract-only assessment remain unchanged.
