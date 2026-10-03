# Candidate v0.5 · Route Sufficiency v0.1 Phase A report

Route Sufficiency v0.1 has completed fresh data governance, membership sealing,
weight training, and calibration under the predeclared global gates. The component
weights and one global threshold are locked. This is a component calibration
result, not a Candidate v0.5 development result or Candidate Lock.

Branch: `liuyao-semantic-v013-core`.
Remote HEAD at the component-lock checkpoint:
`17fbc28fd85337d8069a279ac4033e716f9e6a11`.

The initial remote audit confirmed `9c19687a2d0df154f50483c87a4ef80ee3449e13`.
The only commit after design freeze `a7885bd` was the unrelated traditional
moving-chain research document; it was preserved. Every path added in this phase
is a new Route Sufficiency asset. Existing BaZi, knowledge-base, traditional
TR/MR, Candidate v0.4, Semantic Act, Evidence, Arbitration, Compatibility,
Routeability, Router, Scope, Finalization, and route-inventory files were not changed.

The authoring session used the provided GPT-6-based Codex model. The exact model
variant was not exposed, and use of GPT-6.1 Sol is not claimed.

## Commits and CI evidence

| Stage | Commit | Outcome |
| --- | --- | --- |
| Freeze literal authoring, data/training/calibration contract, generator and static governance | `04f925061773ca26001a49e833c7f19efe162fc1` | Committed and pushed before encoder scoring |
| CI bot seals both corpora, audit and membership lock | `45f8d1492c660f73026d32aecb8b9738ebd4bed8` | [Data Seal CI success](https://github.com/gali5742/GuiJia/actions/runs/37097153707) |
| Freeze training/calibration execution implementation | `21b915826af19d0d1d562e772c04740a525a8b6e` | [Workflow rejected before jobs ran](https://github.com/gali5742/GuiJia/actions/runs/37097768910); zero encoder calls |
| Preserve v0.1 execution contract and version initialization correction as v0.2 | `45cc912874a96a635a7adfbd934fe070338f8ec6` | [Training and lock CI success](https://github.com/gali5742/GuiJia/actions/runs/37097864597) |
| CI bot locks and pushes weights before calibration | `b7c5038296f18c7dbc15212d0109e2ac68bfb3f4` | Weights committed before the first calibration encoder pass |
| CI bot records calibration and locks global threshold | `17fbc28fd85337d8069a279ac4033e716f9e6a11` | Frozen gates satisfied; component lock written |

The initial training workflow used `runner.temp` in job-level environment
expressions, where GitHub does not allow that context. The v0.2 execution contract
records that failure and moves initialization into a shell step using
`RUNNER_TEMP`. There was no model feedback, data change, algorithm change, or
gate change. The original execution contract remains committed as immutable
evidence. The successful workflow's failure-rejection step was expectedly skipped
because calibration passed; the train, weight commit, calibration, verification,
and result-commit steps all executed successfully.

The existing [shared repository verification](https://github.com/gali5742/GuiJia/actions/runs/37097864582)
also passed on `45cc912`. Data governance tests executed 9 cases, and calibration
selection tests executed 6 cases. Local final verification replayed the sealed
membership, weights lock, saved calibration vectors/probabilities, and threshold
selection without another encoder invocation.

## Frozen data and membership

| Split | Total | Sufficient | Insufficient | Positive styles |
| --- | ---: | ---: | ---: | --- |
| Training | 132 | 66 | 66 | 22 strong, 22 support, 22 fallback |
| Calibration | 88 | 44 | 44 | 22 support, 22 fallback |

All current 22 routes have three positive/negative contrast pairs in training
and two in calibration. There are 110 distinct contrast groups across 10 domain
families; a contrast group never crosses splits. Authoring consists of literal,
individually written pairs, with no template expansion, synonym expansion, Router
labels, Routeability labels, or encoder feedback. Only text enters the encoder;
only the binary label is the head target. Route IDs, styles, family and pair
metadata remain diagnostics.

| Corpus | SHA-256 | Git blob |
| --- | --- | --- |
| Training | `194b292079fbdfd169a6d3dd064edc5fa786ee2b3c0f11d1ac232ef2e2139683` | `f543e13370b8d608766d1c8b62d7ace2fcf6e371` |
| Calibration | `8549bdab5473874b4274de64b60266e4c01fc6e1cf24a4dfe7c79f79c46f956d` | `011fee775f611a7159044b255d52d65269c85f33` |

The data lock records complete ordered membership, normalized-text hashes,
labels, styles, coverage counts and source/code bindings. Regeneration and
re-sealing verify equality and refuse to overwrite divergent or partially sealed
state.

## Contamination and no-read boundary

Exact duplicates within/across current splits: **0**.
Train/calibration near duplicates at Jaccard >= 0.82: **0**.
Historical exact overlap: **0**.
Historical near overlap at Jaccard >= 0.84: **0**.
Highest cross-split similarity: **0.21212121212121213**.
Highest audit-only historical similarity: **0.2608695652173913**.

The verifier performed 11,616 cross-split comparisons and 605,440 historical
comparisons against 14 explicitly bound audit-only sources. It never passes
historical wording to the generator or exposes that wording in audit reports,
terminal output or failures. Candidate v0.4 development content is read only by
this automated contamination comparator; it is not training, calibration,
generation, threshold-selection or model-feedback input. Candidate v0.4 failure
diagnostic/report wording was not read for generation.

Independent and sealed blind corpora, and reserved literature/research corpora,
were excluded without opening their contents. Protection uses an explicit
source allowlist and forbidden-name rejection, rather than searching those
corpora for similar text. Exact/trigram checks cannot prove absence of every
semantic paraphrase; the fresh-authoring no-copy/no-paraphrase rule remains a
separate authoring responsibility.

## Training and calibration result

The frozen encoder is `Xenova/bge-small-zh-v1.5`, revision
`75c43b069aac4d136ba6bc1122f995fedcfd2781`, Transformers.js `4.2.0`, `q8`,
512-dimensional mean-pooled normalized vectors. Each invocation contained
exactly one question. CPU inference used the npm package's bundled native ONNX
runtime. The supported `ONNXRUNTIME_NODE_INSTALL=skip` flag skips optional GPU
downloads; package integrity and TLS verification were retained.

One binary logistic head was trained from zero weights and bias using the mature
360-epoch full-batch contract: learning rate 0.42 with epoch decay, L2 0.0015,
balanced total label weights of 0.5/0.5, and no bias regularization. There were
**132 training encoder invocations**, then a committed weight lock, then
**88 calibration encoder invocations**. The encoder was not retrained.

The numeric feasibility gates were frozen before data generation/scoring:
insufficient false-pass <= 0.05 and sufficient retention >= 0.90. The policy
maximizes sufficient retention within feasible regimes, then minimizes false-pass,
then uses the higher representative threshold as the final tie-break. Calibration
examined 89 distinct regimes; 4 were feasible. It did not use per-family or
per-route thresholds.

The selected single global threshold is **0.45004286319719417**. It is the midpoint
of the highest rejected probability, `0.4299705859616322`, and the lowest admitted
probability, `0.47011514043275615`, and preserves the selected prediction regime.

| Calibration metric | Result | Frozen gate |
| --- | ---: | ---: |
| Sufficient retention | 43/44 = 97.7273% | >= 90% |
| Insufficient false-pass | 2/44 = 4.5455% | <= 5% |

The two false passes are `V013-V05-RS-C-06-4-I` and
`V013-V05-RS-C-06-5-I`, both in the borrow/lend role-direction family. That family
has **2/4 = 50% insufficient false-pass**. The one false reject is
`V013-V05-RS-C-20-4-S`, a relationship-development row. These are retained results.
Per-family values were predeclared as diagnostic only; no per-family safety pass
is claimed, and no rows, labels, weights or thresholds were changed after seeing
these results. The small authored calibration cohort does not establish fresh
development or independent generalization.

## Assets added

Under `data/liuyao-semantic-v013-candidate-v05-route-sufficiency`:

- `-authoring-v0.1.json`
- `-data-contract-v0.1.json`
- `-training.json` and `-calibration.json`
- `-contamination-audit-v0.1.json` and `-data.lock.json`
- `-execution-contract-v0.1.json` and active `-execution-contract-v0.2.json`
- `-v01-model.json` and `-v01-model.lock.json`
- `-v01-calibration-report.json` and `-v01-threshold.lock.json`

Implementation and checks:

- `js/liuyao-semantic-route-sufficiency-model-v01.js`
- `scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs`
- `scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs`
- `scripts/generate-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs`
- `scripts/seal-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs`
- `scripts/train-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-weights.mjs`
- `scripts/calibrate-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-threshold.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-model.mjs`
- `tests/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-tests.mjs`
- `tests/liuyao-semantic-v013-candidate-v05-route-sufficiency-calibration-tests.mjs`
- `.github/workflows/liuyao-v013-v05-route-sufficiency-data.yml`
- `.github/workflows/liuyao-v013-v05-route-sufficiency-train.yml`

Verification, in the existing isolated checkout with Node 22 activated:

```sh
cd /workspace/GuiJia
node scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-data.mjs --require-seal
node scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-model.mjs --weights
node scripts/verify-liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-model.mjs
```

Verification needs no encoder runtime or rescoring. The scoring entrypoints also
refuse to retrain existing committed weights or recalibrate an existing report.
First scoring preflight separately confirms committed bindings, the original bot
seal ancestor, and successful Data Seal CI through the GitHub API. Parallel
unrelated commits may be rebased over; changes to frozen semantic inputs block
stale bot pushes. No force push is used.

## Owner checkpoint and next legal action

- Fresh data frozen: **YES**.
- Data/training/calibration objective frozen: **YES**.
- Membership sealed and CI passed: **YES**.
- Pre-seal or pre-data-CI encoder scoring: **NO**.
- Independent evaluation read: **NO**.
- Sealed blind evaluation read: **NO**.
- Encoder scoring occurred: **YES**, 132 training + 88 calibration.
- Model weights changed: **YES**, new Route Sufficiency head only; legacy models unchanged.
- Threshold changed: **YES**, new Route Sufficiency threshold only; legacy thresholds unchanged.
- Route Sufficiency component locked: **YES**, under the declared global gates.
- Fallback Identity v0.3 started: **NO**.
- Selection v0.6 or integrated Candidate v0.5 runtime built: **NO**.
- Fresh Candidate v0.5 development built/scored: **NO**.
- Candidate v0.5 development PASS or Candidate Lock: **NOT CLAIMED**.

The next legal action is to freeze Fallback Identity v0.3 fresh data and its
training/calibration contract, with all-22 independent heads and one global
fallback threshold. The measured borrow/lend sufficiency risk remains explicit.
It must not be repaired by retuning this locked component against the same
calibration split. This phase stops at the Route Sufficiency lock.
