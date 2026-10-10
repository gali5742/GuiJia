# Candidate v0.6 · Fallback Identity v0.4 Phase B report

**Calibration FAIL: no feasible global threshold. No component lock.**
The single versioned retry completed all data governance, upstream auditing,
22-head training and immutable result preservation. Selection/runtime/development
remain blocked. This is a component-calibration failure, not a fresh integrated
Candidate v0.6 development evaluation.

Branch: `liuyao-semantic-v013-core`.
Baseline: `275c7f9914d37ba0ce5bc53a53f21c947a25148d`.
Remote artifact checkpoint HEAD: `df48580c32a52427441d4e5165fa0db96894d915`.

## Commits and CI evidence

| Stage | Commit | Outcome |
| --- | --- | --- |
| Preserve metadata-only v0.3 failure diagnosis | `d9a7dce9cbd3c6803d8f4f12a931ca059547ed2a` | No wording read, encoder call, new probability scoring or retuning |
| Freeze new Candidate design, weighted algorithm and literal-data contract | `d2cbdde1c0f9599cf60b147b9ac9db2a9aac9d3f` | Before new encoder scoring |
| CI bot seals new corpora and complete membership | `580cb046f4d6a2b2aef994cbda0692a1be85a66f` | [Data CI 38035706151 SUCCESS](https://github.com/gali5742/GuiJia/actions/runs/38035706151) |
| Freeze scoring execution implementation | `d532da5f7b66a1cac2ada60794aa43406116299b` | Real seal/CI confirmed before first new encoder pass |
| CI bot commits upstream vector cache and conditional membership | `6a18cb2ef0a721474b0b9f7182c38a299ee14d89` | Before weight training |
| CI bot locks and pushes all22 new weights | `0a4755903f965f0913fb0205cd240258513f3a02` | Before Fallback calibration probability scoring |
| CI bot commits failed calibration | `df48580c32a52427441d4e5165fa0db96894d915` | Threshold null; no threshold-lock file |

[Training/lock CI 38035933598](https://github.com/gali5742/GuiJia/actions/runs/38035933598)
ended FAILURE at the explicit `Reject component lock if frozen calibration gates failed`
step. Preflight, tests, runtime install, upstream audit/commit, training,
weight verification/commit, calibration-result replay and report preservation all
completed successfully. Calibration uses `continue-on-error` so its exit code 2
can preserve evidence before the final rejection; the displayed step conclusion
is not a component PASS. The saved status is
`calibration_failed_no_feasible_global_threshold`.

Shared [repository CI 38035933553](https://github.com/gali5742/GuiJia/actions/runs/38035933553)
passed on the execution commit. Data-stage shared CI
[38035706079](https://github.com/gali5742/GuiJia/actions/runs/38035706079) passed.
Adding the new model module also triggered the existing read-only Candidate v0.4
runtime-lock verification [38035706154](https://github.com/gali5742/GuiJia/actions/runs/38035706154),
which passed and did not alter any v0.4 artifact. The data bot commit message
contains the copied `v0.5` display label; all new corpus versions, paths, design,
contract and locks identify Candidate v0.6/Fallback v0.4. No old file was rewritten.

## Frozen calibration outcome

6,781 candidates yielded 3,389 distinct all22 admission regimes; **0 feasible**.
The selected threshold and selected metrics are **null**. No threshold lock exists.
No failed run was repaired or rescored.

| Diagnostic from the saved regime table | Result |
| --- | ---: |
| Highest known exact retention across all regimes | 72/88 = 81.8182% |
| Regimes meeting both known retention >=80% and accepted-known accuracy >=98% | 11 |
| Lowest non-route activation among those 11 regimes | 21/66 = 31.8182% |
| At that diagnostic regime: known correct / accepted | 72/72 = 100% |
| At that diagnostic regime: route-unresolved false activation | 6/22 = 27.2727% |
| At that diagnostic regime: near-domain information/procedure false activation | 15/22 = 68.1818% |
| At that diagnostic regime: outside22 false activation | 0/22 |
| At that diagnostic regime: borrow/lend ambiguous false activation | 3/4 = 75% |
| At that diagnostic regime: collection/repayment ambiguous false activation | 0/4 |
| Highest known exact count when all precision and non-route/role safety gates hold | 1/88 = 1.1364% |

The diagnostic regime is **not** an adopted threshold or a component lock.
Its numbers are computed read-only from the already saved regime metrics; there
was no second encoder pass or new head scoring. All regimes meeting recall and
precision still violate non-route safety. Ranking diagnostics on the new raw
cohort show expected-head rank 1 for 85/88 and rank 2 for 3/88, but rank correctness
is not unique-admission safety. Saved weighted training objectives range from
0.13358025186808148 to 0.21357080318334745; they do not prove convergence,
calibration feasibility or generalization.

## Frozen upstream exposure

All 154 raw rows remain calibration members. The pre-training upstream lock
records 41 conditionally reachable IDs: 39 known and 2 non-route.
Three routes have zero conditional known exposure: lend_money, income_bonus,
marriage_match. All22 raw coverage remains four known per route; no all22
conditional-coverage or integrated-runtime pass is claimed.

| Upstream metric | Known (n=88) | Non-route (n=66) |
| --- | ---: | ---: |
| Act eligible | 88 | 45 |
| Sufficiency probability >= frozen threshold (all-raw diagnostic) | 87 | 46 |
| Arbitration selected after Act/Suff permission | 38 | 1 |
| Routeability probability >= frozen threshold (all-raw diagnostic) | 69 | 25 |
| Actually reaches Fallback | 39 | 2 |

The reachable non-route IDs are `V013-V06-FI-C-N-1-04` (borrow/lend role ambiguity)
and `V013-V06-FI-C-N-1-21` (generic business topic). The information/procedure row
`V013-V06-FI-C-N-2-20` passes frozen Act/Suff and receives strong
relationship-development Arbitration. That is an upstream diagnostic finding,
not an integrated final-route prediction. The locked upstream components were
not retuned. Conditional filtering after seeing these scores is prohibited for
this version; it cannot turn the raw-calibration failure into a pass.

## Revision decision and frozen scope

Candidate v0.5/Fallback v0.3 remains an immutable component-calibration failure.
A metadata-only diagnosis used saved IDs, labels and probabilities: 57/66 known
rows rank the correct head first, but at most 38/66 have overlapping unique-admission
intervals under one global threshold. Nine rank errors and raw positive/negative
overlap in 19/22 heads mean threshold-only repair is inadequate. These diagnostics
are not per-route calibration parameters. Convergence or underfitting was not
established by the old artifacts; no optimizer sweep or training on old calibration
vectors was performed.

This attempt is explicitly Candidate **v0.6**, Fallback **v0.4**, training module
**v0.2**. Its only new component change is Fallback training data and the loss/training
schedule. Route Sufficiency v0.1 is reused at 0.45004286319719417, not retuned.
The all-current22 independent binary logistic-head architecture and one global
admission threshold remain unchanged. Every head >= threshold is admitted;
exactly one selects, zero/multiple remain unresolved. No Router restriction or
margin tie-break is permitted.

The new hypothesis was fixed before scoring: 1,800 full-batch epochs;
learning rate 0.42/(1+epoch*0.002); L2 0.00025; zero Float32 weights, Float64
gradients, unregularized bias. Each head has positive total loss weight 0.5 and
negative total 0.5. Within negatives, a null/non-route label receives coefficient
4, a current22 label sharing any frozen confusable family receives 4, and another
route receives 1. Multiple shared families do not compound coefficients. Negatives
are normalized by their total coefficient mass. The family relation is derived
only from route labels, not words, Router output, model scores or traditional rules.
The six frozen groups cover general wealth/income, business/cooperation, inventory
and objects, credit/debt role direction, investment five-way, and relationships.
Metadata such as style, source and diagnostic rank never affects the model features
or the loss. Weighted training loss is a saved diagnostic, not a checkpoint-selection
criterion. The single epoch count/hyperparameter tuple was not swept.

## Frozen data and contamination boundary

| Split | Rows | Known | Non-route | Fresh route coverage |
| --- | ---: | ---: | ---: | --- |
| Historically eligible training | 1,214 | 937 | 277 | Historic training-only members |
| Fresh augmentation | 242 | 176 | 66 | 8 known per current22 route |
| Full weight training | 1,456 | 1,113 | 343 | All current22 routes |
| Fresh raw calibration | 154 | 88 | 66 | 4 known per current22 route |

The eligible historical assembly is the prior 1,016-row train-only assembly plus
the sealed 198-row v0.3 **training augmentation only**. Prior v0.3 calibration,
Route Sufficiency corpora, Router validation and development/failure texts are
excluded from training. The 29-entry expansion patch overrides existing training
labels and adds no rows. All 396 fresh questions are individually authored literals,
not word substitutions or score-derived rewrites. Both fresh splits contain 22
route-unresolved, 22 near-domain information/procedure, and 22 outside-current22
negatives. Borrow/lend and collection/repayment unresolved groups each have four
rows per fresh split.

All raw calibration rows remain threshold-selection members. Upstream reachability
only freezes conditional IDs and diagnostic exposure; upstream rejection cannot
remove difficult rows. The unchanged feasibility gates are known exact retention
>=0.80, accepted-known accuracy >=0.98, overall non-route false activation <=0.05,
each subtype <=0.05, and each credit/debt role-safety group <=0.05. Missing groups
and zero accepted-known denominators are not safety passes. The objective and regime
enumeration are unchanged from v0.3. No route/family threshold is allowed.

Exact duplicates, cross-split near duplicates (cutoff 0.82), fresh historical
exact overlaps and near overlaps (cutoff 0.84) are all **0**. Cross-split maximum
0.20833333333333334; historical maximum 0.3125; 224,224 cross-split comparisons;
1,307,592 historical comparisons across 18 explicitly bound audit-only sources.
Candidate v0.4 development and v0.3 calibration question strings are opened only
inside the automated exact/trigram comparator, with no wording exposure to authoring,
terminal errors or reports. The read-only v0.3 diagnosis contains no question text.
Independent, blind and reserved route-expansion research corpora are excluded without
opening their content or comparing against it. Trigram audits cannot prove absence
of every semantic paraphrase; the independent literal no-copy rule remains separate.

## Execution sequence and verification

The new Candidate design, model implementation, authoring and data/training/
calibration contract were committed before any Candidate v0.6 encoder pass. CI then
sealed augmentation, full training, fresh calibration, contamination audit and complete
ordered membership. Preflight checks every committed input binding, the seal ancestor
and GitHub's actual successful data CI result before loading the encoder.

Upstream auditing uses only frozen Semantic Act, Route Sufficiency, Evidence,
Arbitration and Routeability, recording vectors and membership before Fallback
training. Evidence/Arbitration is never run for Act-ineligible or Suff-insufficient
rows. No Router or integrated runtime is loaded. All raw audit vectors are cached
and committed before training. The training process embeds only its 1,456 training
members; calibration labels/vectors never enter the loss. All 22 heads are trained
from zero, with no old weight initialization. Weight artifacts and lock are pushed
before the first new Fallback calibration probability calculation. Calibration
reuses 154 committed upstream vectors, requiring no second encoder invocation.

Encoder: pinned Xenova/bge-small-zh-v1.5 revision
`75c43b069aac4d136ba6bc1122f995fedcfd2781`, Transformers.js 4.2.0, q8, CPU,
512 dimensions, mean pooling and normalization, exactly one question per call.
Total real encoder calls: **1,610 = 154 upstream + 1,456 training + 0 new calibration**.
The external npm runtime installation preserves TLS/package integrity and uses the
supported optional-GPU-download skip flag with the bundled CPU runtime.

Checks passed before scoring: nine data-governance cases, eight synthetic weighted
training cases, and eight synthetic admission/threshold-policy cases. These synthetic
vectors are not fresh-question embeddings or production weights. Final artifact
verification replays cached vectors/probabilities and policy without encoder calls.
Existing reports are verified and never overwritten. No same-version repair,
threshold search beyond the frozen regime enumeration, label change, row removal,
head restart or checkpoint selection is allowed. Bot pushes reject changes to frozen
semantic inputs, rebase over unrelated changes only and never force push.

The exact authoring session variant was not exposed: Codex (GPT-6-based session).
GPT-6.1 Sol is not claimed.

## Protected components and interpretation limits

No pre-existing tracked file was modified. Candidate v0.5's data, model, failure
report, contracts and phase reports are preserved. Existing BaZi, knowledge-base,
traditional LiuYao TR/MR, route inventory, Semantic Act v0.1, Sufficiency v0.1,
Evidence v0.3, Arbitration v0.12, Compatibility v0.3, Routeability model/threshold
0.7678148573595883, Router/TopK, Scope cutoff 0.4319473801404805 and Finalization v0.1
are unchanged. Selection v0.6 and integrated Candidate v0.6 runtime were not built.
No new integrated development, independent evaluation, blind evaluation, Candidate
Lock or promotion claim is made.

The locked Sufficiency's prior borrow/lend 2/4 false-pass, the previously observed
upstream procedure/Arbitration leak and Routeability recall limits remain known risks.
An authored component calibration result does not establish generalization. v0.3 and
v0.4 use different cohorts and losses; their descriptive numbers are not a controlled
A/B comparison. No conclusions about full Candidate v0.6 safety or recall are justified
before a locked integrated runtime and fresh development evaluation.

## Sealed corpus identities

| Corpus | SHA-256 | Git blob |
| --- | --- | --- |
| augmentation | `f8436ebaa96644f438beb9269d61b96d59671a23b14094784a4d19653b66118f` | `f4abaedbb1b10e59ce6eb05da34586fe1b8d064d` |
| training | `edd434baaa8daf29956215f942ac3ac4f213dada2fa7c47b1e45fdbee4c18a78` | `2113833b73dd471b22322d691c25353fbd86eb9b` |
| calibration | `249a6b37ac69272e3c923fca0e1572d1f9a72b19162fd6d11453730115c47093` | `6c2b746e9a22dfec5dca870b74a45dd8f0ed9018` |

## Changed files

All 32 paths below are additions. This owner report adds one further path.

- `.github/workflows/liuyao-v013-v06-fallback-identity-v04-data.yml`
- `.github/workflows/liuyao-v013-v06-fallback-identity-v04-train.yml`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-failure-diagnostic-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-design-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-design.lock.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-authoring-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-calibration-report.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-calibration.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-contamination-audit-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-contract-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data.lock.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-contract-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.lock.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-reachability-audit-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-reachability.lock.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-training-augmentation.json`
- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-training.json`
- `js/liuyao-semantic-fallback-identity-model-v02.js`
- `scripts/audit-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-reachability.mjs`
- `scripts/calibrate-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-threshold.mjs`
- `scripts/diagnose-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-failure.mjs`
- `scripts/generate-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data.mjs`
- `scripts/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-lib.mjs`
- `scripts/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-lib.mjs`
- `scripts/seal-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data.mjs`
- `scripts/train-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-weights.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.mjs`
- `tests/liuyao-semantic-fallback-identity-v02-training-tests.mjs`
- `tests/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-calibration-tests.mjs`
- `tests/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-tests.mjs`

## Owner checkpoint and next legal action

- Fresh design/data/training/calibration contract frozen: **YES**.
- Deterministic membership sealed and data CI PASS: **YES**.
- Before-contract/before-seal/before-data-CI new encoder scoring: **NO**.
- Upstream membership/vector cache committed before weight training: **YES**.
- All22 independent heads trained from zero and weights committed: **YES**.
- Old model weights reused: **NO**.
- Encoder scoring occurred: **YES**, 1,610 single-text calls.
- Calibration used frozen raw membership only: **YES**, 154/154 rows retained.
- Additional calibration encoder calls: **0**; cache reused only after weight commit.
- Model weights changed: **YES**, newly added Fallback v0.4 artifacts only.
- Threshold selected/changed: **NO**, null; no threshold lock.
- Calibration PASS: **NO**, 0 feasible regimes.
- Training/lock CI PASS: **NO**, deliberate gate rejection after immutable failure preservation.
- Independent evaluation read: **NO**.
- Sealed blind evaluation read: **NO**.
- Reserved independent research corpus read: **NO**.
- Existing tracked artifacts modified: **NO**.
- Selection v0.6/integrated Candidate v0.6 runtime built: **NO**.
- Fresh integrated development built/scored or Candidate Lock claimed: **NO**.

**Stop Candidate v0.6/Fallback v0.4 before Phase C.** The next legal action is a
read-only architecture and calibration-responsibility review, concentrating on
role-ambiguous and information/procedure rejection. Any subsequent hypothesis
must have a new versioned Candidate/component design, an explicit calibration
scope and unchanged-or-explicitly-justified predeclared safety requirements,
then entirely new frozen calibration membership, seal and successful CI before
scoring. Do not relax this contract, switch it to conditional-only membership,
reuse old calibration wording/vectors to train or sweep parameters, delete
hard rows, apply per-family thresholds, or repeatedly retrain this attempt.
The current failure and all predecessor evidence remain immutable.

Replay without encoder invocation:

```sh
node scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data.mjs --require-seal
node scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.mjs --reachability
node scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.mjs --weights
node scripts/verify-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-model.mjs
```
