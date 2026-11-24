# Source strength review v0.1 (R33)

R33 joins contribution, local force and authored strength judgments in one exact-case review. Four natal charts now run through a shared verifier with actual research actor evidence. The resulting `sourceStrengthReview` exposes the author's assertions next to the runtime contribution records and unresolved synthesis dependencies. It supplies a calibration corpus for the next resolver work. It does not make the author's conclusion the resolver's answer.

## Evidence and reading decisions

The source is the public-domain text of 《滴天髓阐微》, checked on 2026-11-24. Excerpts are stored in simplified Chinese with their chapter locators. The first four pillars are natal. The following pillar starts the fortune columns: 丁未 for the two 干支总论 examples, 壬午 for the 形象 example, and 辛酉 for the 众寡 example. Fortune and biographical outcomes are excluded from judgment inputs. [Primary text](https://zh.wikisource.org/zh-hant/滴天髓闡微)

| Natal chart | Reviewed evidence | Permitted conclusion |
| --- | --- | --- |
| 壬申｜丙午｜庚午｜庚辰 | Hour 庚 assists the daymaster; whole 辰 generates the daymaster. Year 壬 restrains month 丙 with source-asserted local effectiveness and year 申 context. | The author calls the daymaster and killer 身杀两停. This is a source-scoped pair comparison, without a global `balanced` output. |
| 壬午｜丙午｜庚申｜戊寅 | Year 壬 is described as directing restraint toward month 丙 while lacking force; hour 戊 restrains 壬 and explicitly fails to generate it. | Ineffective restraint retains unresolved binary realization. Explicit failed generation is separately not-realized. No daymaster strength verdict is stated in the reviewed excerpt. |
| 庚申｜辛巳｜丙辰｜乙未 | The author describes 建禄, deep-rooted 庚辛 wealth and damage to the seal, then calls the chart weak. | A favorable season coexists with an authored weak judgment. The seal's endpoints and individual root endpoints remain unspecified. |
| 癸丑｜壬戌｜丙午｜庚寅 | The author describes an out-of-season daymaster with a blade and fire configuration, then calls it 强寡. | Authored strength and minority quantity occupy separate fields. Neither side membership, a transformed fire actor, nor relative dominance is inferred. |

The second chart's commentary explicitly contrasts the preceding chart using 彼 and 此. The reviewer binds previous-chart statements to SSR-C01 and current-chart statements to SSR-C02. This is a reviewed antecedent mapping, not a generic pronoun resolver. The phrase 又可生水 authorizes a capability observation for the first chart's hour 庚 toward year 壬. Binary realization stays unresolved. Similarly, 无力 supplies a local force qualifier, without asserting that the relation never occurred.

## Executable review and boundaries

Each assertion carries a case ID, complete chart key, proposition kind, subject and context actor keys, exact source spans, source locator and current/previous-chart referent. The private immutable corpus is checked for duplicate IDs, valid references and source-span containment. Source spans are audit evidence; runtime code does not parse them to derive force or judgment.

Visible and whole-branch actors require a unique membership inventory profile plus matching scope, position, stem/branch, element and ten-god evidence. The daymaster is verified independently against the existing daymaster evidence and is never inserted into membership. An incomplete chart produces no exact match. Missing or contradictory actor evidence removes the assertion's `verifiedValue` while preserving its authored `sourceValue`. Assertions with independent participants remain available. An unnamed role observation has no actor binding and cannot become an executable pair.

Direct contributions point to the daymaster. Cross-actor effects remain modifiers and do not become extra direct contributions. Whole 辰 remains a whole-branch subject. The two functions of the same 戊→壬 pair retain separate realization states. Local force does not become global actor effectiveness.

The first chart's 壬→丙 realization is already registered in the earlier visible-stem source module. R33 reuses it for runtime alignment and adds the contrasted local force evidence. The other three charts expand this reviewed set. Function alignment checks the same ordered pair and function type. Peer support uses an unordered participant pair with `directed: false`. Missing functions, unresolved runtime realization, unspecified source realization, agreement and contradictory resolved values remain distinct states. A disagreement is reported locally and does not rewrite upstream evidence.

The review does not issue R5 effect-type authorizations or add R4 typed effects. Its authored contribution statements remain distinct from the existing `visibleStemDaymasterContributionRecords`, whose profile and authorization requirements still apply. Actual runtime contribution records, unresolved contribution IDs and synthesis blockers are reported alongside source conclusions, without filling any dependency from an authored label. Existing R29 seal-damage authority remains unchanged.

## Research result and next priority

This batch establishes a usable contrast set across three boundaries:

1. Capability, occurrence and local force are independently reviewable. A capable or ineffective relation cannot supply missing binary realization.
2. A named pair comparison and a whole-chart strength judgment are different propositions. 身杀两停 does not supply the system's final balanced classification, and the second chart's biography cannot supply a weak label.
3. Season and quantity alone are insufficient. Two source judgments demonstrate why favorable-season and majority shortcuts cannot be the strength resolver.

The main gap is now explicit in the running review: the existing pipeline cannot yet reproduce these authored judgments from authorized contribution and profile evidence. The next implementation priority is the source-backed bridge from the two direct support assertions and the contrasted modifier profiles to the existing contribution contract, with separate treatment of 未兑现 and 无力. After that, a qualitative comparison rule must specify its subject scope, required evidence and behavior when axes disagree. More source labels alone cannot establish that rule. Numeric contribution, universal axis precedence and a general final-strength mapping remain unsupported.

## Validation

The new regression covers all four complete charts, previous-chart antecedents, direct/modifier separation, capability versus realization, ineffective versus explicitly absent realization, pair versus global judgments, season and quantity contrasts, unnamed endpoints, missing or contradictory identity evidence, near-chart rejection, immutability and unchanged runtime coverage. Bootstrap v0.55 loads the three modules only through the explicit research entry. The shared verification workflow runs the regression with the existing research, production boundary, core and browser checks.
