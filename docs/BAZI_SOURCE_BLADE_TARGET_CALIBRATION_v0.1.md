# R19: exact source blade locations and month target calibration v0.1

R19 adds three newly registered complete primary-source natal charts after R18. One has an explicit month-blade antecedent and two actual relations targeting it; the other two independently locate the blade at the day and year pillars. The month target is validated against actual branch inventory and consumed by the existing target normalizer and R3 kernel. These records do not select a target in R17's ambiguous two-午 chart or authorize a transformed-result endpoint.

## New complete source cases

The [primary transcription of 《滴天髓阐微》](https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE) was checked on 2026-10-11. Each case freezes the four natal pillars, selected contiguous natal excerpt, locator, URL, retrieval date and unverified historical revision (`null`). No fortune sequence, calendar conversion, career outcome or numerical assessment is imported.

| Record / complete chart | Source locator and identity cue | Reviewed result |
| --- | --- | --- |
| CF-SBTC-CASE-01: 戊子 戊午 丙辰 戊戌 | 六亲论 · 二十四、性情: 丙日午提，刃强当令，子冲之，辰泄之 | Month 午 is the single branch target of both pronouns |
| CF-SBTC-CASE-02: 戊申 癸亥 丙午 壬辰 | 通神论 · 官杀 · 四曰合官留杀格: 日主虽坐旺刃，生于亥月 | Day 午 is a reviewed blade location; no blade-target relation is annotated |
| CF-SBTC-CASE-03: 戊午 癸亥 丙戌 壬辰 | Same 官杀 section: 更喜年逢刃助 | Year 午 is a reviewed blade location; no blade-target relation is annotated |

CF-SBTC-DEF-01 separately reviews the same work's 六亲论 · 性情 definition, “如丙日主，以午为羊刃，干透丁火为露刃。” It is explicitly scoped to these three 丙-day source charts. R17's older definition record remains scoped to its original case. The definition supports 午 branch identity and distinguishes visible 丁 as 露刃; it does not turn hidden 丁 into a branch target, choose between multiple 午 occurrences or declare collective membership.

CF-SBTC-IDENTITY-01/02/03 bind respectively `surface-branch:1:午`, `surface-branch:2:午` and `surface-branch:0:午`. These are documented source-context interpretations using explicit month/day/year cues and the full charts, each containing one 午 branch. They are not runtime Chinese parsers, generic uniqueness selectors, month-priority rules or transferable interpretations of all blade mentions.

The day and year records are retained as **location observations** in this calibration. Their full excerpts contain other relation language, including 合 and 助; the module does not classify those entire excerpts as having no relations. It simply does not manufacture a relation with the blade as target from either location cue. Review of those other relations is separate work.

## Actual month target consumer

CF-SBTC-ANN-01 retains two separate clauses, 子冲之 and 辰泄之, with a shared preceding antecedent 丙日午提，刃强当令. The reviewed sources are year 子 (`surface-branch:0:子`) and day 辰 (`surface-branch:2:辰`); both clauses target month 午. Their identities and path IDs remain separate. Two source paths do not mean two target endpoints or a two-member blade group.

The full source/definition/identity/annotation input must exactly match the registered review. The current complete chart must match the source chart. Actual inventory must contain exactly one profile and consistent surface-branch, position, branch and element evidence for month 午 and both source branches. Missing, duplicate or conflicting evidence fails closed; text spelling alone cannot reconstruct inventory.

The private adapter uses the existing normalized-unit/context helpers, supplies the independently reviewed single-actor identity, and calls the actual normalized-record validator. Both normalized units are then consumed by the actual R3 generic resolver through GTLR-R04-CHART-SINGLE-ACTOR. No resolver decision is hardcoded as its output. Shared regression compares reported resolution with direct calls to the existing consumer.

R19 only authorizes these endpoint identities. It does not independently review relation realization, map 冲/泄 to opposition or another effect type, or create an R5 license. A refusal fixture supplies the actionable R3 targets to actual R4 and confirms that missing relation-function/realization/effect authority cannot execute a positive effect. The fixture is not an additional classical source case.

The source's 弱可知矣 is preserved as joint outcome context. It does not provide two automatically separable per-path effect licenses, a force value, or final Strength. Later outcome review must distinguish the named interactions from the combined assessment and the additional 三戊 context, rather than attributing the entire judgment independently to each path.

## Boundaries and remaining evidence gap

The original R16/R17 chart 癸巳 戊午 丙午 壬辰 has two 午 candidates. R19's three cases do not change its target scope/cardinality. Explicit month identity in one case cannot select month 午 in a different case; day/year blade evidence also shows why a global month-priority assumption is unwarranted. R17 continues to preserve two candidates with no actor/group target and actual R4 refusal.

The newly reviewed natal excerpts and blade definition supply no materialization authority for R18's 化火为劫 result. R18's registry remains empty and its executable source endpoint remains null. This is a bounded conclusion about the reviewed evidence, not a claim that all classical literature has been exhaustively searched or that transformation has no effect.

Research bootstrap v0.41 loads the three calibration modules after R18. Synthesis exposes `contextualForcePartySourceBladeTargetCalibration` with static three-case coverage, runtime location count, distinct target count and target-path count. The narrow source-coverage dependency resolves these finite identity reviews; broad source coverage, generic target selection and final assessment remain unresolved.

The full-bootstrap regression has 42 checks covering exact primary provenance, all three positions, actual normalization/R3 consumption, shared pronoun target, R4 refusal, joint outcome separation, unknown/changed/sparse inputs, hidden/group alias refusal, real inventory checks, cross-case transfer refusal, immutability and idempotence. Core/shared verification also preserves R15 augmentation, R16 nonrealization, R17 ambiguity, R18 gates, R9 mediation, CASE06, R11 and B02–B05. Existing motif/direct-realization registries, production runtime and LiuYao semantics are unchanged.

Next priority is a source outcome review of the new month-blade case: establish relation identity/direction, distinguish source assertions from execution realization, and determine whether any individual or joint effect is actually authorized. The original transformed-result path separately still needs a source-reviewed materialization decision and blade target scope/cardinality. Neither problem is solved by further schema declarations alone.
