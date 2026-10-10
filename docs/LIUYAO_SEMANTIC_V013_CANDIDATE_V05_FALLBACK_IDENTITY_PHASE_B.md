# Candidate v0.5 · Fallback Identity v0.3 Phase B report

**Fallback v0.3 calibration FAIL: no feasible global threshold; component lock NOT created.**
The 22 new independent heads are trained and their weights are locked. All data
and scoring followed the frozen sequence, and the failed calibration report is
committed as immutable evidence. This is a failed component calibration attempt,
not a Candidate v0.5 development evaluation or Candidate Lock.

Remote HEAD at this component-failure checkpoint:
`7394c6b9e873738347286c6beb1be2c1fa797b61`.

## Commits and CI

| Stage | Commit | Outcome |
| --- | --- | --- |
| Freeze literal authoring, data/training/calibration contract and data tooling | `bd0efb263feec10bedf9df15fa530cc9e5d60690` | Before Phase B encoder scoring |
| CI bot seals all data and membership | `92d263967be50f3057bea1ff9452a441d8775804` | [Data Seal CI 38033870026: SUCCESS](https://github.com/gali5742/GuiJia/actions/runs/38033870026) |
| Freeze execution implementation | `5d88e6d7d1c159eaad07990c2a36ed9ba858a1a7` | Successful seal/CI proven; scoring code pinned |
| CI bot commits upstream audit and conditional membership | `878a879277b40e7aabb147751b23d110b7ac4a37` | Before Fallback weight training |
| CI bot locks and pushes every head's new weights | `8961dfb813ab2e5d80d5a1b70a8bc4974447205e` | Before Fallback calibration probability scoring |
| CI bot preserves failed calibration | `7394c6b9e873738347286c6beb1be2c1fa797b61` | No threshold or component lock |

[Training/calibration CI 38034216904](https://github.com/gali5742/GuiJia/actions/runs/38034216904)
ended **FAILURE** at the explicit `Reject component lock if frozen calibration gates failed`
step. Preflight, synthetic tests, runtime installation, upstream audit/commit,
training, weight verification/commit, saved-result replay, and immutable report commit
all succeeded. Calibration returns exit code 2 under `continue-on-error`, enabling
preservation before the final rejection. Its GitHub step conclusion must not be
mistaken for a component calibration pass; the saved report status is
`calibration_failed_no_feasible_global_threshold`.
The shared [repository verification 38034216813](https://github.com/gali5742/GuiJia/actions/runs/38034216813)
passed on the execution commit. Data-stage shared verification
[38033869913](https://github.com/gali5742/GuiJia/actions/runs/38033869913) also passed.

## Calibration failure and exposure

5,813 candidate thresholds yielded 2,905 distinct all22 admission regimes.
**Feasible regimes: 0. Selected threshold: null.** No threshold-lock file exists.
Across all regimes, the highest raw known exact retention is only
**38/66 = 57.5758%**, below the frozen 80% gate even before imposing the safety
gates. At a regime achieving that maximum, accepted-known accuracy is 38/38,
but non-route activation is 22/66 = 33.3333%; subtype activations are 7/22
route-unresolved, 13/22 near-domain information/procedure, and 2/22 outside22.
Borrow/lend role-ambiguity activation at that diagnostic regime is 3/4 = 75%.
These are read-only diagnostics from the already saved regime table, not a chosen
threshold, a second evaluation, or grounds for repairing this version.
When all precision and non-route/role safety gates are enforced, the maximum
known exact retention is only **2/66 = 3.0303%**. Changing raw membership to a
conditional subset after seeing these scores is prohibited.

The upstream audit retained all 132 raw rows and committed 36 conditional IDs:
32 known and 4 route-unresolved negatives reach Fallback. Five routes have zero
conditional known exposure: financial_fortune, commercial_transaction,
income_bonus, marriage_match, marital_relationship. All22 raw coverage remains
three known rows per route; no all22 conditional-coverage or integrated safety
pass is claimed.

| Upstream metric | Known (n=66) | Non-route (n=66) |
| --- | ---: | ---: |
| Semantic Act eligible | 66 | 45 |
| Sufficiency probability >= frozen threshold (diagnostic on all raw rows) | 65 | 49 |
| Arbitration selected after Act/Suff permission | 25 | 1 |
| Routeability probability >= frozen threshold (diagnostic on all raw rows) | 55 | 28 |
| Actually reaches Fallback | 32 | 4 |

The four non-route conditional IDs are `V013-V05-FI-C-N-1-04`, `-1-05`, `-1-08`
and `-1-10` (each prefix `V013-V05-FI-C-N`). They include one borrow/lend ambiguity,
two debt-direction ambiguities and one generic investment question.
`V013-V05-FI-C-N-2-20`, a near-domain procedure row, passes Act and Suff and receives
strong relationship-development Arbitration. This is an upstream audit finding,
not a final-route prediction; no integrated Candidate runtime was constructed.
Existing locked upstream weights/thresholds were not changed to suppress it.


Branch: `liuyao-semantic-v013-core`. Baseline: `52d4b26654750bf461f49c69dbf33acb2e8f9d50`.
This phase adds only fresh Fallback v0.3 data, audit tooling and component artifacts.
Route Sufficiency and the other frozen components are unchanged.
The session model is Codex (GPT-6-based; exact variant unavailable); GPT-6.1 Sol is not claimed.

## Frozen data and contract

Training assembly is 1,214 rows: 937 known and 277 non-route. It consists of
1,016 historically training-eligible rows (805 known, 211 non-route), plus
198 individually authored literal fresh rows (132 known, 66 non-route).
Historical Router inputs use only `.train` members. The 29-entry expansion label
patch overrides matching training-negative labels and adds no rows. The old
sealed training augmentation is training-only. No legacy Fallback weights are read.
Every current22 route has six fresh training positives and three fresh calibration
positives. Fresh training and calibration each contain 22 route-unresolved,
22 near-domain information/procedure, and 22 outside-current22 negatives.
The separate fresh calibration corpus has 132 rows, 66 known and 66 non-route.

Calibration membership is all raw sealed rows, including upstream-blocked rows.
The upstream audit freezes conditional exposure and vector cache before training,
but cannot remove rows from threshold calibration. This is a deliberately conservative
component safety contract, distinct from the earlier conditional-only v0.2 cohort.
Conditional metrics are diagnostic only. Every row's 22 head scores must be computed;
heads >= the one global threshold are admitted. Exactly one admission selects a
route, and zero/multiple admissions remain unresolved. Router is not loaded and
cannot restrict the universe or break ties.

Predeclared feasibility gates: known exact retention >= 0.80; accepted-known
accuracy >= 0.98; overall non-route false activation <= 0.05; each non-route
subtype <= 0.05; each borrow/lend and collection/repayment role-ambiguity group
<= 0.05. The role groups contain four rows each, so any activation fails their
gates. Empty accepted cohorts or missing groups cannot count as a pass.
Objective: maximize known exact retention within feasible regimes, then minimize
overall non-route activation, then maximum subtype activation, then prefer the
higher representative threshold. All distinct probabilities and adjacent midpoints,
plus 0, 0.5 and 1, are examined; identical all22 admission regimes are deduplicated.
No post-hoc rows, labels, splits, gates, family thresholds, or head retraining are allowed.

## Audit boundaries

Exact duplicates and fresh historical overlaps: 0. Cross-split near duplicates
at 0.82 and fresh historical near overlaps at 0.84: 0. Cross-split maximum
0.1935483870967742; historical maximum 0.2962962962962963. The audit made
160,248 cross-split and 980,760 history comparisons against 16 explicitly bound
sources. Candidate v0.4 development text is opened only inside an automated
comparator that never exposes wording to generation, terminal output or reports.
Failure-report wording is not a data source. Independent, blind and reserved
research corpora are excluded without any content read or comparison.
Trigram checks do not prove absence of all semantic paraphrases; literal fresh
no-copy authoring remains a separate requirement.

## Execution order and validation

1. Commit literal authoring, contract, generator/verifier/sealer and encoder-free tests.
2. CI bot seals augmentation, full training, calibration, contamination audit and complete membership.
3. Confirm the seal commit and successful Data Seal CI before the first Phase B encoder pass.
4. Freeze execution implementation; audit 132 calibration vectors only with frozen upstream components.
5. Commit conditional reachability membership and vector cache before any Fallback head training.
6. Embed the 1,214 training rows only and train every independent head from zero.
7. Commit the 22-head weights and lock before Fallback calibration probability scoring.
8. Reuse the 132 committed upstream vectors for all-raw calibration, retaining an immutable pass/fail report.

The encoder is pinned BGE-small-zh-v1.5 revision
`75c43b069aac4d136ba6bc1122f995fedcfd2781`, Transformers.js 4.2.0, q8,
512 dimensions, mean pooling, normalized, exactly one text per call.
The mature algorithm is unchanged: 360 full-batch epochs, learning rate
0.42/(1+epoch*0.01), L2 0.0015, per-head balanced positive/negative total
weights 0.5/0.5, Float32 weights, Float64 gradients, zero initialization and
unregularized bias. Calibration labels/vectors never train weights.
The CPU runtime is installed outside the checkout with TLS and package integrity
intact; the supported `ONNXRUNTIME_NODE_INSTALL=skip` flag skips optional GPU downloads.

Nine static governance tests and eight synthetic admission/calibration tests passed.
Artifact verifiers replay committed upstream vectors and head probabilities without
any encoder rerun. Failed threshold calibration must be committed and then explicitly
reject the component lock. Re-running scripts verifies immutable artifacts and refuses
retraining or replacing results. Bot pushes use protected-input guards, rebase over
unrelated work only, and never force push.

## Residual risks

The frozen Route Sufficiency Phase A result still has borrow/lend false-pass
2/4 = 50%; this component is not retuned. Routeability's previously recorded
recall limitation remains deferred at threshold 0.7678148573595883.
Scope stays 0.4319473801404805. Selection, Router/Compatibility, Finalization,
BaZi, knowledge base, traditional TR/MR and current22 inventory remain unchanged.
These authored calibration results do not establish fresh development performance
or independent generalization. No Candidate v0.5 development PASS or Candidate Lock
is claimed. No independent or blind corpus was read.

## Sealed corpus identities

| Corpus | SHA-256 | Git blob |
| --- | --- | --- |
| augmentation | `1fdcb6839859cb273b40113559c2aa02289884b180483983261848cb530940c6` | `a4386f823161c02c5f5e41bfdc30605ea8028d82` |
| training | `2917549d009174502f4ccba4ab7c41f5599eb339f13468eeda8b71162f867934` | `680d85bd09c7884806f2ec05a245369630f26e42` |
| calibration | `14e4daefc08cfdefcebcc53dec04b8c1466d91ecd99ca79897223ee60035599e` | `9483acd17cd747acd7ee91a2c97a4d961687be49` |

## Changed files

All 26 paths from the baseline through the failed-result checkpoint are additions.
No existing tracked path was modified. This owner report is the 27th new path.

- `.github/workflows/liuyao-v013-v05-fallback-identity-v03-data.yml`
- `.github/workflows/liuyao-v013-v05-fallback-identity-v03-train.yml`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-authoring-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-report.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-contamination-audit-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-contract-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.lock.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-execution-contract-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.lock.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-reachability-audit-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-reachability.lock.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-training-augmentation.json`
- `data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-training.json`
- `scripts/audit-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-reachability.mjs`
- `scripts/calibrate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-threshold.mjs`
- `scripts/generate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.mjs`
- `scripts/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs`
- `scripts/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-execution-lib.mjs`
- `scripts/seal-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.mjs`
- `scripts/train-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-weights.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.mjs`
- `tests/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-tests.mjs`
- `tests/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-tests.mjs`


## Owner checkpoint and next legal action

- Branch: `liuyao-semantic-v013-core`; artifact checkpoint HEAD `7394c6b9e873738347286c6beb1be2c1fa797b61`.
- Fresh data frozen, contract frozen, deterministic membership sealed: **YES**.
- Data Seal CI PASS: **YES**, run 38033870026.
- Training/weight locking completed: **YES**, all 22 heads from zero; old weights unchanged.
- Calibration feasibility PASS: **NO**, 0 feasible regimes.
- Training/lock workflow CI PASS: **NO**; deliberate final gate rejection after preserving failure.
- Independent evaluation read: **NO**.
- Sealed blind evaluation read: **NO**.
- Reserved independent research corpus read: **NO**.
- Pre-contract/pre-seal/pre-data-CI Phase B encoder scoring: **NO**.
- Encoder scoring occurred: **YES**, 132 upstream + 1,214 training = **1,346** single-text calls.
- Additional encoder calls for Fallback calibration: **0**; 132 committed cache vectors reused after weight commit.
- Model weights changed: **YES**, new Fallback v0.3 heads only.
- Threshold changed/selected: **NO**, null; no threshold lock.
- Route Sufficiency, Semantic Act, Routeability, Router, Scope, finalization or other protected files changed: **NO**.
- Selection v0.6 or integrated Candidate v0.5 runtime built: **NO**.
- Fresh Candidate v0.5 development built or scored: **NO**.
- Candidate v0.5 development PASS or Candidate Lock: **NOT CLAIMED**.

**Stop this attempt before Phase C.** The next legal action is read-only
architecture/family diagnosis and a new versioned design/training/calibration
contract, followed by fresh membership sealing and successful CI before any new
scoring. Any substantive change must explicitly version the failed component and,
where necessary, its parent Candidate design; do not retain the unchanged v0.3
claim, retune its saved calibration, delete hard rows, switch to conditional-only
membership, reuse scores to relabel, or weaken gates in place. The old failed
report, membership, weights and execution contract remain immutable.

Replay without encoder scoring:

```sh
node scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.mjs --require-seal
node scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.mjs --reachability
node scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.mjs --weights
node scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-model.mjs
```
