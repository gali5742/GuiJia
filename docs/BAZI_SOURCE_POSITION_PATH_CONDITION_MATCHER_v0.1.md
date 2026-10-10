# R11: source position/path condition matcher v0.1

R11 connects R10's normalized position units to the existing Competing Relation Path source records. It evaluates two source-mentioned visible-stem order conditions, and preserves two proximity conditions as unresolved source links. A condition result is separate from target identity, path realization, effect authorization and path selection.

## Audited links and runtime scope

| Link | Position unit | Path source condition | Linked source paths | Runtime capability |
| --- | --- | --- | --- | --- |
| CF-SPPCM-LINK-01 | CF-RPP-REC-01-A01-U1 | CF-CRP-REC-01-C01 | CF-CRP-REC-01-P01/P02 | Check 癸先辛后 |
| CF-SPPCM-LINK-02 | CF-RPP-REC-01-A02-U1 | CF-CRP-REC-02-C01 | CF-CRP-REC-02-P01/P02 | Check 辛先 and 癸 at hour |
| CF-SPPCM-LINK-03 | CF-RPP-REC-03-A01-U1 | CF-CRP-REC-03-C01 | CF-CRP-REC-03-P01 | Proximity unresolved |
| CF-SPPCM-LINK-04 | CF-RPP-REC-03-A01-U2 | CF-CRP-REC-03-C02 | CF-CRP-REC-03-P02 | Proximity unresolved |

The first order clause explicitly says “如己生卯月”. The second “若辛先而癸在时” is its same-paragraph comparison. Both conditions therefore require 己 day stem and 卯 month branch. This shared context is an explicit curated registry link to CF-CRP-REC-01; it is not inferred by a runtime text parser. R11 uses the source excerpts already recorded in the repository and adds no new classical source or realization pattern.

Within this context, only the explicitly mentioned 癸 wealth and 辛 food stems can bind. Each must occur exactly once among visible year/month/hour stems, and the core ten-god identity must agree. Hidden stems, duplicate visible stems, alternate wealth/food stems or actor groups cannot substitute. The matcher checks the normalized declared order and any source-specified absolute placement. Comparing the declared earlier/later pillar indexes evaluates this particular order predicate; it supplies no proximity distance, path priority or nearest-target rule.

Unspecified branches remain outside this condition predicate. This is a finite source-pattern condition matcher, not an exact-chart effect calibration. An order match cannot establish that the 七杀 target is bound or that either source path was realized. Compound CF-CRP-REC-02-P02 remains one source path with its 食神 intermediate role; it creates no direct/member edges.

The proximity source specifies 阳日食神. Yin-day charts are outside that source context. For yang-day charts, both proximity conditions stay unresolved: the existing R10 units are source-pattern alternatives, not independently asserted runtime proximity evidence. Adjacency and distance cannot select 去杀 or 合官.

## Validation and states

Input consists only of the registered link, exact path-source snapshot and actual R10 normalized position record. Source/condition/assertion/unit/path identities, source tiers, role references, comparison context, coexistence/order policy and all normalized provenance are checked. Callers cannot relax a context, substitute a source/path, reverse an order, pre-resolve a condition or add an outcome field.

| Result | Meaning |
| --- | --- |
| matched-source-position-path-condition | Applicable context and unique identities; declared position predicate satisfied |
| not-satisfied-source-position-path-condition | Applicable context and unique identities; declared predicate false |
| source-position-path-condition-not-applicable | Chart is outside the registered source context |
| unresolved-source-position-path-condition | Missing/ambiguous identity, invalid provenance or unavailable proximity evidence |

A false condition is not “relation not realized”, a reverse effect or an exclusion/winner for another path. A chart may satisfy neither registered clause. Source-permitted coexistence and source-required exclusive selection remain distinct source policies; neither is converted into execution. Results carry no realized relation, effect, path winner, numeric force or final Strength/Assessment.

## Synthesis and remaining priorities

Bootstrap v0.33 loads the contract/profile/matcher explicitly. Full synthesis exposes `contextualForcePartySourcePositionPathConditionMatcher` and a dedicated narrow capability dependency. All four position/path links are validated; two order conditions can be evaluated. Finite link coverage is separate from runtime condition applicability and global corpus coverage.

R6 B02–B05 remain unresolved. Generic position resolution, proximity/intervening matching, relative-capacity comparisons, cross-endpoint transfer, branch/hidden/Structure coverage and competing-path realization/selection remain separate work. Four other R10 position units and CF-CRP-REC-04's relative-capacity condition have no R11 matcher. R7/R9 effect calibration remains intact; Strength stays insufficient and Assessment stays contract-only.

The full-bootstrap regression uses explicitly synthetic condition fixtures, not new classical chart cases or positive effect calibration. It covers source identity links, two order clauses, shared-context/absolute-placement gates, ambiguous and hidden stem refusals, distinct false/not-applicable/unresolved states, proximity refusal, tampered provenance, compound preservation and global boundaries.

Next priority is source-scoped path-participant binding that consumes these condition results while preserving incomplete targets and compound identity. Independently asserted actual proximity/intervening evidence must precede those respective condition matchers; broader position or competing-path completion cannot be claimed from the two order predicates.
