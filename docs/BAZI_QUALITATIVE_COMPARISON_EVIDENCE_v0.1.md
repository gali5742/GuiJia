# Qualitative comparison evidence v0.1 (R35)

R35 implements a finite source-supported comparison of root baseline categories and assembles the actual evidence needed for a named daymaster/killer comparison. These are separate operations. The first produces an order within one source axis; the second reports why that order and the R33/R34 contributions still cannot determine whole-side dominance.

## A source rule that can be executed locally

《滴天髓阐微·十七、衰旺》 distinguishes the heavier 长生禄旺 root category from the lighter 墓库余气 category. The text explicitly supplies 甲乙 with 亥寅卯, 甲乙 with 未, and 甲乙 with 辰 as examples. This version implements only the finite 甲 subset. It does not derive a ten-stem table from twelve-growth-stage labels. The source was checked on 2026-11-27. [Primary text](https://zh.wikisource.org/zh-hant/滴天髓闡微)

The retrieved transcription reads `墓库余气，奶之轻者也` and also contains duplicated or damaged enumerations nearby. The source record preserves that character rather than silently correcting it. The interpretation of the parallel clauses as a distinction between heavy and light root categories uses their context and named examples. No corrupted wording is repaired into a formula. The passages comparing numbers of peers with roots are not converted into weights, exchange rates, a counting threshold or an automatic priority between different evidence axes.

The complete classical chart 甲辰｜丁卯｜甲子｜戊辰 follows the commentary. Its author explicitly identifies the two 辰 as wood remainder. 戊辰 after the natal four pillars begins the fortune columns and is excluded. In this natal chart the machine can classify 卯 as the source's heavier baseline root category and each 辰 as the lighter category. The chart already exists as `QL-XLR-C02` in the earlier cross-literature corpus; R35 reuses it for executable baseline calibration and adds no new complete source case. Its authored whole-chart 旺 judgment and later life outcomes are not inputs to this comparator.

## Verified roots, roles and baseline order

For each comparison the implementation rebuilds the current complete chart, verifies the daymaster, and requires a unique actual `rootActorStates` record for each hidden root actor. The record must match chart position, branch, hidden stem, core hidden index and level, root role and physical element. An independent unique membership profile and matching hidden-actor evidence are required as well. Missing or contradictory evidence cannot be replaced by a caller-supplied category.

The comparator preserves three distinctions that matter in this example:

* 卯中乙 is a same-element root of 甲 in the repository's root-role system. It is not rewritten as an exact 甲 root.
* 辰中乙 carries the core hidden level 中气, while the source calls 辰 wood remainder in this root context. The source role and the hidden-level field remain independent.
* A root's existing interaction references and actual effectiveness state survive classification. A heavier baseline category can coexist with unresolved or adverse actual effectiveness. No actual force winner is inferred.

Opposite argument orders produce the same heavier baseline actor. Two light roots receive `same-source-category-no-force-equivalence`, without an equality-of-force conclusion. Comparing one actor with itself yields no comparison. Unlisted stems and branches remain outside this finite source subset. Conditional fixture charts exercising 寅, 亥 and 未 are labeled synthetic structural fixtures, not additional classical natal calibrations.

## The named comparison still needs a rule and evidence

For the two R33/R34 charts, the view assembles one source-named daymaster/counter pair per chart. It does not merge other counter anchors. Visible contributions remain references to their existing records; whole-branch contributions and local force qualifiers are rebuilt with their current validators. Cached review or contribution views cannot replace missing actor evidence.

The first chart exposes the peer support, whole 辰 support and effective 壬→丙 restraint with separate provenance. The author's 身杀两停 is retained only as a calibration target. The second chart retains ineffective 壬→丙 force with unspecified binary realization and has no imported pair verdict. Season remains the daymaster's background; it is not copied into counter strength.

The running blocker list identifies incomplete daymaster contribution coverage, unresolved direct counter→daymaster realization, actual foundation coverage, counter season/foundation coverage, contradictory realization, and the missing source-backed cross-axis comparison rule. Contributions belonging to another daymaster are excluded and reported. Even if test input marks all visible contributions resolved, this cannot supply the missing comparison rule.

The new view does not change synthesis claims, dependencies or sufficiency. The local baseline order cannot consume the two R34 support records as comparable force units: peer support is not a root-category observation, and whole 辰 generating 庚 is not evidence that 辰 is a root of 庚. The 甲 root-category rule cannot be applied to that 庚 chart. All final party dominance and whole-chart strength fields remain null.

## Result and next priority

There is now an executable, source-bounded qualitative order within one evidence family, with real chart identity validation and no numeric conversion. The next substantial step requires explicit evidence for comparing actual contributions across named sides, including how root effectiveness, season and local force interact. Where sources give a whole-chart conclusion without an executable combination rule, that conclusion remains a calibration target. Adding more such labels does not resolve the rule gap.

The regression covers the classical chart, conditional fixtures, root-role/hidden-level distinctions, argument reversal, same-category non-equivalence, actual-effect preservation, malformed identities, independent hidden evidence, named comparison scope, cached-output rejection, contribution exclusion, realization conflict and unchanged final boundaries. Bootstrap v0.57 and the shared workflow include this research view.
