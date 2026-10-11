# Source Branch Officer Opposition v0.1 (R22)

R22 independently reviews one exact natal branch pair for qualitative opposition. In 壬午、己酉、甲申、甲子, the commentary explicitly names 午火 as restraining 酉金 and describes 去官留煞. Actual inventory validation, target normalization/R3, a separately registered R5 source validator and R4 now execute 午→酉 as `anchor-opposition`. This is one finite source authority, not a generic branch-restraint effect resolver.

## Primary evidence and attribution

The source is [《滴天髓阐微》](https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE), 通神论 · 九、干支总论, under “甲申戊寅，真为杀印相生”, retrieved 2026-10-11. Revision ID is unknown. CF-SBOO-CASE-01 preserves the complete natal chart and the exact excerpt:

> 甲申日元，生于八月，官杀当权，喜其午火紧制酉金，子水化其申金，所谓去官留煞。煞印相生，木凋金旺，印星为用，

The following career outcomes are excluded, as are fortune columns. The source explicitly names both branches. 酉 is the 官 contrasted with 申煞; 酉 contains only 辛, which is 正官 relative to the named 甲 day. This supports the role annotation without replacing the named 酉 branch endpoint with a hidden 辛 actor. 午 contains 丁 and 己; the whole source branch is not assigned one Ten God or replaced by hidden 丁.

The path-specific attribution of 去官 to 午→酉 is an independently reviewed inference, recorded separately from the affirmative restraint realization. It authorizes qualitative opposition against that officer endpoint. It does not establish removal from the chart, a universal ineffective state, quantity, dominance, final strength or a beneficial/adverse judgment relative to the day master.

The adjacent complete chart 壬辰、己酉、甲申、甲子 is CF-SBOO-COMPARE-01. Its separately preserved excerpt is:

> 夫制者克而去之，合者有去有不去也。如以辰土为财，则化金而助杀；以酉金为官，仍化金而党杀。

This is contextual comparison material only. It inherits no positive authority, supplies no negative realization authority, and is not registered as executable input. Its statements about combination/transformation are not materialized into actors or effects. These are source-authored neighboring examples, not an experimentally controlled counterfactual pair. A missing 午 in the comparison does not itself prove failed restraint.

## Independent authorities and actual consumers

| Authority | Reviewed content | Scope |
| --- | --- | --- |
| CF-SBOO-IDENTITY-01 | Year surface 午 → month surface 酉; one actor at each endpoint | Exact named natal branch pair |
| CF-SBOO-REALIZATION-01 | Affirmative 喜其午火紧制酉金; directed restraint realized in the source context | Exact pair; no adjacency or element-based realization rule |
| CF-SBOO-EFFECT-01 | 去官 attributed to the named 酉官 restrained by 午 | Qualitative `anchor-opposition` only |

The source validator accepts only the full canonical source case, annotation, identity review, realization review, effect review and deferred-path disposition. A caller-provided valid flag, changed wording, substituted hidden actor, changed cardinality, missing review or alternative effect type is rejected.

For the exact current chart, both named surface branches must exist uniquely in the actual inventory, with matching branch scope, position and element evidence. Actual target normalization builds a validated single-target record. Actual R3 resolves 酉 as `single-actor`; the source actor remains year 午. The effect record preserves all five evidence IDs: case, annotation, identity, realization and effect.

R5 adds the fifth registered source family, `actor-to-actor-exact-source-branch-case`, using `normalizeExactBranchPair`. It looks up the registered R22 validator at call time, checks its rule/contract identity and invokes full validation again against the current chart and inventory. The older R15 `normalizeExactActorPair` remains a separate wrapper. A private helper shares normalization mechanics; it is not exported as a caller-selectable family adapter.

R5 preserves source family, source contract/rule/case/record, independent authority IDs, complete source provenance and wording. It consumes the registered effect type and does not parse the wording to determine one. R4 receives one source-scoped actor→actor input and returns `realized-generic-relation-effect` with `anchor-opposition` on the original branch endpoints. There are still three endpoint shapes, three legacy motifs and the existing effect-type vocabulary.

## Deferred clause and earlier boundaries

“子水化其申金” is recorded as CF-SBOO-DEFERRED-01. It needs its own identity, realization and effect review. No 子→申 mediation, 留煞-derived augmentation, combined effect, hidden-member expansion or new membership is emitted. The source's general 煞印相生/印星为用 context also does not supply another effect authority.

R20's 子→午 clash and 辰→午 drainage remain realized but unmapped. R21's 酉→寅 barrier remains unmapped; its failed visible 壬→丙 restraint, non-actionable configuration failure and ambiguous two-午 clash remain distinct. No “制”, “去”, restraint, officer role, fire/metal or adjacency rule transfers this license to those paths.

R16's original failed officer→killer relation remains not realized. R17 still has two unresolved blade targets and a non-executable transformation result; R18's materialization-authority registry remains empty. R15 augmentation, R9 mediation and CASE06 hidden target identity remain unchanged. R11 target ambiguity, B02–B05 global blockers and final `insufficient`/`contract-only` assessment remain open.

## Coverage, integration and verification

The profile reports one positive executable source case, one contextual comparison and one new effect authority. Static finite source-review coverage is separate from runtime execution: no current chart/inventory means unresolved with zero executed effects; another chart means not applicable. The synthesis extension resolves only the narrow source-coverage dependency and stores the result in its own research view. It does not inject a new legacy motif or production realization pattern.

Research bootstrap v0.44 loads the three R22 modules after R21. The loader verifier requires this tail, and shared verification runs the new regression. Production entry points and LiuYao semantics are unchanged.

`tests/bazi-contextual-force-party-source-branch-officer-opposition-tests.js` exercises actual inventory/normalization/R3/R5/R4 execution; independent provenance; hidden substitution and role boundaries; source mutation and missing review refusals; late-bound R5 validation; comparison/deferred-path isolation; scope/cardinality/evidence failures; no target removal or numeric strength; runtime/static counters; extension idempotency; and prior-phase boundaries. The standard core and shared verification workflows provide broader regressions and production/build boundaries. CI additionally runs the existing Chromium smoke against the built Pages artifact.

The next research bottleneck remains independently attributable source-backed effect outcomes on additional exact paths, particularly the deferred 子→申 relation and earlier unmapped blade paths. One successful branch opposition does not establish general effect-type mapping or final chart-strength aggregation.
