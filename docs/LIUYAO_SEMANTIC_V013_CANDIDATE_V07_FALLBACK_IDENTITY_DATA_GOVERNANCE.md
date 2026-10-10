# Candidate v0.7 / Fallback Identity v0.5 data governance

**Fresh literal authoring and data-seal phase. No encoder, upstream audit,
weight training, threshold calibration, component lock or development PASS.**

Branch: `liuyao-semantic-v013-core`.
Starting HEAD: `86d6c438b9bf225df50491bac87de75210f3b2e5`.
Report date: 2026-10-11, Asia/Tokyo.
Actual model: Codex GPT-6-based session; exact variant unavailable;
GPT-6.1 Sol is not claimed.

## Frozen scope and authoring

The preexisting Candidate v0.7 design, design lock, Fallback v0.5 schema/data
contract and calibration policy are unchanged. The new implementation
contract binds the literal authoring, generator/library/verifier/sealer,
tests, read guard and dedicated CI workflow before CI generation and seal.
The corpus keeps every preallocated ID, label, role, style and split position.
No membership is selected using upstream or Fallback scores.

All **550** new question strings are individually authored literals from
current22 route categories and semantic/role boundaries, before the first
automated historical comparison. There is no template expansion, synonym
substitution, old-question copying/paraphrasing or model-score feedback.

| Split | Rows | Known | Non-route |
| --- | ---: | ---: | ---: |
| Eligible prior sealed training-only assembly | 1,456 | 1,113 | 343 |
| Fresh training augmentation | 242 | 176 | 66 |
| Complete weight-training corpus | 1,698 | 1,289 | 409 |
| Entirely fresh raw calibration | 308 | 176 | 132 |

Each fresh split has eight known rows per route: two role-explicit, four
semantic-paraphrase and two boundary-contrast. Each of the three non-route
subtypes has 22 fresh training rows and 44 raw calibration rows. Credit
direction and debt direction each have four fresh training negatives and
eight raw calibration negatives. Style is metadata, not a model feature
or a guarantee of conditional reachability. The raw role requirements and
all22 membership remain intact.

The historical assembly comes only from the bound, sealed v0.4 **training**
corpus. Its original ordered training membership, labels and normalized
text hashes are verified against its old lock before copying. Calibration,
validation, development, blind, independent and research wording never
enters weight training. All22 original train counts plus the fresh eight
per route are preserved; no duplicate is silently removed.

## Contamination and exposure boundaries

The encoder-free audit uses strict NFKC/lowercase/space-punctuation-symbol
normalization, exact/label-conflict checks, cross-split trigram similarity
<0.82, and fresh/historical similarity <0.84. It uses an explicit allowlist
of 20 bound historical sources and never scans the data directory.
The old development and calibration sources are opened only within the
automated comparator. Diagnostics expose IDs, source paths and similarity,
never historical question strings.

| Audit metric | Result |
| --- | ---: |
| Exact duplicates / label conflicts | 0 |
| Cross-split near duplicates | 0 |
| Fresh/historical exact overlaps | 0 |
| Fresh/historical near overlaps | 0 |
| Maximum cross-split trigram similarity | 0.18181818181818182 |
| Maximum historical trigram similarity | 0.2727272727272727 |
| Full training × raw calibration comparisons | 522,984 |
| Fresh × historical comparisons | 2,033,900 |

These checks cannot establish absence of every semantic paraphrase; the
independent literal-authoring rule is a separate requirement. The data
audit is not a performance or generalization evaluation.

**This data phase:** independent-evaluation read NO; sealed-blind read NO;
reserved-research read NO; historical wording displayed NO; real encoder
calls 0; model scoring 0. Every directed Node check preloads the committed
evaluation/research read guard. Full `npm test` and default shared push CI
are not invoked. The previous phase's historical-blind read incident
remains unchanged and recorded; this phase's NO values do not erase it.

## Implementation and verification

The literal authoring file contains the 550 complete rows, without text
interpolation. The generator joins the independently authored literals to
the frozen allocation and the verified historical train-only assembly.
Generation refuses partial or divergent existing outputs. Validation
requires all counts, all22 coverage, every raw negative subtype, every
role group, normalized uniqueness and exact regeneration.

The seal covers augmentation, full training and entire raw calibration
together. It binds the original design/lock/schema contract, implementation
contract, authoring, all data tools, guard, workflow, corpora and audit,
plus every ordered member's ID, label, role, style, split, source, literal
text SHA256 and normalized text SHA256. A partial seal fails. Regeneration
and resealing verify identical existing artifacts rather than rewriting
them. Conditional membership is explicitly **not selected yet**.

Eight new data-governance tests and ten retained policy/isolation tests
pass locally: **18 passed, 0 failed**. Failure cases exercise altered
allocation/labels, raw-row removal, duplicate/conflicting labels, missing
route/role coverage, traditional terms, exact/near cross-split copies and
forbidden audit sources. No test writes changed questions into the corpus
or opens a protected evaluation source.

The source-authoring/tooling commit precedes the real seal CI. Push commits
use `[skip ci]` to avoid legacy regression validators that read blind data.
The required data CI runs through the existing registered `test.yml` entry
on an isolated ref. It proves that its wrapper commit changes only that
entry and exactly derives from the bound dedicated workflow. It then
checks out the exact frozen development-source parent, runs the audits
and tests under the read guard, seals the corpus, verifies deterministic
regeneration/reseal and pushes only the five generated seal artifacts
with a CI bot commit. The original development-branch `test.yml` is
unchanged. Stale semantic-input changes stop the seal push; unrelated
parallel work is preserved by rebase.

Literal source/tooling freeze commit:
`4169c97e81584902e98e0f4eccb47f2bd2f62456`.
Isolated CI wrapper commit:
`f5c41a39a53b57369485bf14d02906fffb3db342`, on
`codex/v07-data-ci-4169c97e`.
[Actual data-seal CI 38066388981](https://github.com/gali5742/GuiJia/actions/runs/38066388981)
completed **SUCCESS**. All 18 tests, full raw membership/contamination
verification, deterministic generation/reseal and bot seal commit/push
completed successfully. The five generated seal artifacts were added by
the bot in commit `7d15671` and replayed locally with committed-input proof.
Full SHA, API step evidence and artifact bindings are saved in
`data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-ci-evidence-v0.1.json`.
Local untracked preseal corpora were archived outside the checkout before
fast-forwarding to the real bot seal; they were not committed as the seal.
Real encoder calls in this data phase remain **0**.

## Next gate

Data seal and real successful data CI are required before a new scoring
execution contract. That contract must bind the actual seal ancestry and
successful run. Only then may the pinned encoder audit the **308** raw
calibration rows under the frozen upstream components and commit vectors,
all decisions, conditional IDs and exposure status.

The pre-training exposure gates remain >=2 reachable known rows for every
current22 route, >=8 reachable non-route rows, >=8 reachable unresolved
negatives and >=2 rows for each credit/debt role group. Failed exposure
requires an immutable report and stops before weights, without same-version
data replenishment, row deletion or upstream retuning. No passing exposure
or calibration is claimed by this data phase.

No new weights or threshold exist. Selection v0.6, integrated runtime,
fresh Candidate development and independent promotion remain unstarted.
All old failures, upstream model/threshold bindings, Router, traditional
TR/MR and BaZi/KB assets remain unchanged.

## Added source assets

- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-authoring-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-implementation-contract-v0.1.json`
- `scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs`
- `scripts/generate-liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data.mjs`
- `scripts/seal-liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-ci-source.mjs`
- `tests/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-tests.mjs`
- `.github/workflows/liuyao-v013-v07-fallback-identity-v05-data.yml`
- This report.
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-ci-evidence-v0.1.json`

The bot seal adds the full training corpus, fresh augmentation, raw
calibration corpus, contamination audit and complete data membership lock.
