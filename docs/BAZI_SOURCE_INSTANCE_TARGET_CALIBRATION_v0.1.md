# R14: source instance target calibration v0.1

R14 adds one complete source case with independently reviewed target position, scope and cardinality. It addresses R13's evidence-acquisition priority without inventing identities for the six R11 order/proximity paths. This is positive **identity** calibration; no realization pattern or effect-type authorization is added.

## Source and reviewed identity

The source is Ren Tieqiao's commentary in [《滴天髓阐微》](https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE), 通神论 · 官杀 · 四曰合官留杀格, the 壬申 丁未 丁未 癸卯 example. The complete chart and relevant commentary were verified in the current transcription on 2026-10-11. The new record freezes the excerpt, chart, source URL, locator and retrieval date. A pinned historical revision could not be independently retrieved, so `revisionId` is explicitly null; the older realization registry's revision number is not borrowed.

| Evidence | Reviewed identity consequence |
| --- | --- |
| Complete chart 壬申 丁未 丁未 癸卯 | Exact source-case context, not a generic pattern |
| 时杀无根 | Target refers to the hour-position killer |
| 壬水官星 / 壬水坐申 | Source officer refers to the year 壬 actor |
| 丁 day master | Core ten-god identities: 壬 正官; 癸 七杀 |
| Hour 癸卯; 卯 contains no hidden water actor | Reviewed target scope is the hour stem 癸, cardinality one |

The visible-scope/cardinality annotation is a reviewed inference from the explicit hour cue and the full chart. It does not result from a runtime 时杀 parser, all-chart unique-role selection or an assumption that killers must be visible. The program only consumes the exact registered identity authority and cross-checks its chart roles and scope basis. No root-strength value or realization conclusion is extracted from 无根.

The new identities are CF-SITC-CASE-01, CF-SITC-ANN-01, CF-SITC-IDENTITY-01 and the independent source path CF-SITC-PATH-01. The path is 正官→七杀 under the source's 助 predicate. The source actor is visible:0:壬 and target is visible:3:癸. It has no identity authority over CF-CRP-REC-01–03. The existing CASE06 hidden:3:亥:壬:0 calibration retains its own source identity and is not imported here.

## Runtime gates and target normalization

`evaluateInstance` requires exact structural equality of the registered complete case, target annotation and identity authority. It refuses changed source spans, positions, scopes, cardinality, chart/path identities, extra binding authority or realization/effect fields. An independently supplied current chart must equal all four original source pillars. A changed branch or relocated stem is outside the exact case even if roles match.

The actual membership inventory must contain exactly one profile for each declared endpoint and consistent endpoint ten-god evidence. Missing/duplicate profiles, absent evidence and conflicting roles stay unresolved; chart text alone cannot replace the inventory. Validation does not mutate or freeze caller inputs. Binding and normalized output provenance are deeply immutable.

After these gates, a private source-specific adapter uses the existing `normalizeRelationUnit` and context-span helpers, supplies the validated single-actor identity, and checks the complete result with the existing normalized-record validator. It does not alter the legacy adapter or disguise a visible binding as a hidden binding. The normalized unit has chart-case/relation-event context, `bindingRequired:true`, resolved source-scoped actor identity, visible scope and cardinality one; it contains no expected target level, semantic-level hint or effect-type hint. The existing generic kernel's GTLR-R04 rule then resolves the unit to single-actor.

Invalid source authority, a chart outside the exact case, missing/ambiguous runtime evidence and resolved identity are distinct states. A resolved identity does not change realization or effect authorization: both remain unresolved, with no executed effects/member edges, winner, numeric score or dominance. A regression feeds the resolved target to the actual R4 kernel with unresolved realization/authorization and confirms execution fails closed. The source 助 predicate is not mapped to a generic peer augmentation rule.

## Integration and remaining priorities

Research bootstrap v0.36 explicitly loads the three R14 modules. Full synthesis exposes `contextualForcePartySourceInstanceTargetCalibration` and a narrow source-coverage dependency for this one reviewed identity case and its consumer. Finite source identity coverage is separate from current-chart applicability: the registered source remains covered on other charts, while their resolved runtime target count is zero.

R11/R12/R13 order/proximity targets remain unresolved, the six source-role annotations gain no transferable identity authority, and existing R9 mediation is preserved. B02–B05, broader annotation/identity coverage, generic position/competing-path resolution and final Strength/Assessment remain unresolved. No production runtime or LiuYao behavior changes.

The full-bootstrap regression includes the actual newly reviewed complete source chart as identity evidence, plus adversarial mutations and the retained synthetic R11 fixtures as refusal tests. It is not positive effect calibration or empirical validation of predictive claims.

Next priority is independent exact-source realization and effect-type authorization for the new 正官→七杀 path, with explicit refusal cases. The original predicate and identity must not be converted directly into a universal peer-effect rule. Further complete cases are needed to bind or independently calibrate the existing order/proximity paths; sharing a 七杀 target role is insufficient for transfer.
