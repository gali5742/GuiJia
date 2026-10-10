# Candidate v0.7 / Fallback v0.5 responsibility and data-policy freeze

**Design and schema/policy freeze only. No new corpus seal, training,
calibration, component lock, integrated runtime or development PASS.**

Branch: `liuyao-semantic-v013-core`.
Baseline: `f381a8e0368413c90f1617bff191eb531b3324fb`.
Report date: 2026-10-10, Asia/Tokyo.
Actual model: Codex GPT-6-based session; exact variant unavailable;
GPT-6.1 Sol is not claimed.

## Why the next version changes calibration responsibility

Candidate v0.6/Fallback v0.4 remains FAIL, with zero feasible thresholds and
no threshold lock. This review never calibrates a conditional threshold on
that cohort, loads its heads, retrains its weights or changes its report.
It groups previously saved admissions at the exact diagnostic representative
already published in the Phase B report, 0.6347075635992827. This is not an
adopted threshold.

| Non-route standalone activations at that published diagnostic | Rows |
| --- | ---: |
| Blocked by Semantic Act before Fallback | 14 |
| Blocked by Route Sufficiency before Fallback | 4 |
| Takes the Arbitration branch | 1 |
| Actually reaches Fallback | 2 |
| Total | 21/66 |

The raw contract demanded that Fallback reject rows that its runtime branch
never receives. However, both reachable non-route rows also activate at this
representative, including borrow/lend role ambiguity. Changing metric scope
alone does not establish safety. One procedural non-route is selected by strong
Arbitration; Fallback-only calibration cannot cover that path. Three routes
have zero conditional known exposure: lend_money, income_bonus, marriage_match.
The old cohort cannot establish all22 conditional coverage.

Saved training loss and expected-head rankings do not establish convergence,
linear impossibility, independent generalization or a passing new design.

## Frozen Candidate v0.7 / Fallback v0.5 hypothesis

The new version isolates **calibration responsibility and fresh data**. It
retains the v0.4 training algorithm without another optimizer or loss change:
all22 independent logistic heads, frozen512 encoder, zero initialization,
1,800 epochs, learning rate 0.42/(1+epoch*0.002), L2 0.00025, balanced positive
and negative total weights 0.5 each, negative coefficients 4/4/1 for
non-route/shared-family/other-route. No old weights initialize new heads.

All22 heads are scored. Every head >= one global threshold is admitted;
exactly one selects, zero/multiple remain unresolved. Router ranking, Top2,
margin and traditional features cannot restrict or break ties.

The new contract separates three views, while retaining every raw row:

| View | Use |
| --- | --- |
| Conditional Fallback identity | Threshold objective and component gates on **every** row whose frozen upstream decision reaches Fallback |
| Full-raw conservative path safety | Mandatory feasibility gates covering both strong/support Arbitration and reachable unique Fallback selection |
| Full-raw standalone Fallback stress | Complete reported metrics; no direct standalone component gate on upstream-blocked rows |

Conditional known exact retention must be >=80%, accepted-known accuracy
>=98%, non-route activation <=5%, each observed subtype <=5%, and each
credit/debt direction group <=5%. Zero accepted-known is not feasible.
An absent conditional subtype is reported null/not estimable, never as a
subtype safety PASS. This is an explicit change from v0.4's all-raw,
nonempty-every-subtype component contract; it is not a reinterpretation of
the old result.

Full-raw path safety requires <=5% potential false selection overall, for
**every raw non-route subtype**, and for **each raw role-safety group**.
All denominators must be nonzero. Act-ineligible, Suff-insufficient and
unsupported-target rows are blocked. Otherwise an Arbitration route is
counted, or, if Arbitration is null and Routeability permits, a unique
Fallback admission is counted. This conservative check gives no safety
credit for Router conflict or downstream Scope/Finalization suppression.
It is not an integrated-runtime or promotion evaluation. Raw known path
metrics are diagnostic; final integrated recall/precision gates remain
unchanged.

Before weights, the frozen upstream audit must provide >=2 reachable known
rows for **each of all22 routes**, >=8 reachable non-route rows including
>=8 route-unresolved rows, and >=2 rows in each credit/debt role group.
Missing exposure creates an immutable failure and stops before training.
No score-directed authoring supplement, row removal, upstream gate bypass
or same-version replacement is permitted.

The single threshold search uses 0, 0.5, 1, every distinct all-raw head
probability and adjacent midpoints, deduplicates complete raw admission
signatures, and retains their highest representative. Among feasible
regimes it maximizes conditional known exact retention, minimizes conditional
non-route activation, minimizes the largest observed subtype activation,
then prefers the higher threshold. No feasible regime means an immutable
FAIL with no threshold lock and no Phase C.

## Frozen future data allocation; not authored or sealed yet

| Split | Planned rows | Known | Non-route |
| --- | ---: | ---: | ---: |
| Eligible prior train-only assembly | 1,456 | 1,113 | 343 |
| New fresh training augmentation | 242 | 176 | 66 |
| Full weight training | 1,698 | 1,289 | 409 |
| Entirely fresh raw calibration | 308 | 176 | 132 |

Eight known literals per route are allocated in each fresh split: two
role-explicit, four semantic-paraphrase and two boundary-contrast styles.
These are coverage metadata, never model features or proof of reachability.
Fresh training has 22 negatives per subtype and four per credit/debt group;
raw calibration has 44 per subtype and eight per credit/debt group.
The contract fixes all 550 fresh IDs, labels, roles, styles and split order.
**Zero fresh question strings have been authored in this phase.**

The prior sealed full training corpus is the eligible training source; no
validation, calibration, development, independent, blind or literature
question enters training. Old weights/calibration vectors cannot be used.
Fresh literals must be independently authored from route categories and
semantic/role boundaries. The existing normalization, exact/conflict,
cross-split trigram 0.82 and historical trigram 0.84 exclusion policies are
retained; v0.4 training augmentation and calibration are added to the
automated contamination audit's bound sources. Twenty historical audit
sources are bound. Audit errors must expose IDs and similarity, not wording.

Duplicate/near-duplicate counts: **not run / not estimable**, because new
literal corpora do not exist. Allocated ID collisions: zero. This design
lock is explicitly not a membership seal.

The required next sequence is literal authoring + generator/verifier/sealer
and data workflow commit; CI corpus generation/contamination audit/complete
ordered text-hash membership seal; real successful data CI confirmation;
new execution contract with seal/CI proof; frozen upstream audit and
exposure/cache commit; only if exposure passes, new weight training and
weight commit; only then cached all-raw Fallback scoring and conditional
calibration with mandatory raw path safety. No encoder may start before
that successful data CI. A failed exposure check stops before weights.

## Evaluation-read incident and remediation

The review script itself reads only the saved calibration and upstream
reports, which contain IDs, labels, hashes, vectors and decisions, not
question text. It never uses vector features or loads an encoder/model.

Two inspection mistakes are recorded, not hidden:

1. Inspecting the old v0.2 threshold membership manifest accidentally printed
   its calibration question strings. They are excluded as fresh sources.
2. Running full `npm test` before auditing transitive reads opened historical
   blind data, independent diagnostic artifacts and next-topic policy/inventory
   metadata through existing validators. The command passed, but that does
   not satisfy this phase's no-read boundary. No question strings from those
   protected files were printed, used for authoring or used for new training,
   scoring or threshold search.

The bound incident identifies 12 automatically opened protected paths and
the transitive validators. **Historical sealed-blind read: YES. Prior
independent diagnostic-artifact read: YES. v0.13 independent-evaluation
corpus read: NO**: the legacy directory scans explicitly exclude decision-stack
v0.13 corpora. Reserved literature text sources were not opened; research
policy/inventory metadata was opened by the legacy checks. Aggregate
“independent/blind read NO” is not claimed for this phase.

Directed checks and the dedicated CI preload a committed filesystem guard
that rejects independent/blind/research data-path reads before I/O. A
synthetic nonexistent protected-path test verifies synchronous, asynchronous
and stream rejection without opening real evaluation data. This is a
regression guard for these checks, not an OS sandbox. Full `npm test` and
the default shared push CI are not used again in this phase. Push commits
use `[skip ci]` to prevent those legacy validators; the **required dedicated
policy checks are explicitly dispatched through the registered `test.yml`
entry on an isolated CI ref and must actually pass**. The new standalone
workflow was not registered by the skipped push and direct dispatch returned
404. The isolated ref changes only the CI entry; its policy source tree
matches its development-branch parent. No CI wrapper is merged back.

## Preservation and verification

The new design lock binds 48 predecessor paths and all frozen upstream
dependencies by SHA256/Git blob, with baseline-commit proof. Prior Candidate
designs, failed models/reports, Sufficiency model/threshold, Act, Router,
Evidence, Arbitration, Compatibility, Routeability, Scope, Finalization,
TR/MR and BaZi/KB assets are unchanged. Selection v0.6 remains a plan,
unimplemented until component lock. Fresh integrated development and
post-lock independent evaluation remain required.

Real new encoder calls: **0**. New weights: **none**. Selected threshold:
**none**. Conditional threshold search on old probabilities: **none**.
The raw representative was already published before this review.

New dedicated policy tests: **10 passed / 0 failed** locally, including
blocked-row retention, Arbitration safety, direction ambiguity, all22
coverage, global admission, no Sufficiency bypass, empty-denominator
handling and the evaluation-read guard. Design/contract/baseline bindings
and immutable metadata diagnosis pass under the same guard.

Design/contract/policy freeze commit:
`0a2ea45bce1eea8c337b615422690f1385adaa1b`.

The first isolated CI wrapper commit was
`f6f572e032c9103f7b8bce7e437a90b08b71dc97`.
[CI 38057486762](https://github.com/gali5742/GuiJia/actions/runs/38057486762)
failed at checkout before any policy test: job-level `NODE_OPTIONS` preloaded
the guard while checkout had not created the guard file. Encoder/evaluation
calls were zero and the checks were skipped; this is not a policy-test PASS.

The immutable v0.1 workflow remains bound by the design lock. A new **v0.2**
verification workflow activates the guard only in shell checks after checkout.
Its verification-only contract binds both workflows and the original design
lock, records the failure, and requires proof that the isolated CI commit
changes only `test.yml` and that the entry exactly derives from the corrected
workflow. It changes no model, gate, label, membership or calibration policy.
Corrected CI evidence is recorded below after execution.

## Added files

- `data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-responsibility-review-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v07-design-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v07-design.lock.json`
- `data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-contract-v0.1.json`
- `data/liuyao-semantic-v013-candidate-v07-regression-read-incident-v0.1.json`
- `scripts/diagnose-liuyao-semantic-v013-candidate-v06-fallback-identity-v04-responsibility.mjs`
- `scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs`
- `scripts/verify-liuyao-semantic-v013-candidate-v07-fallback-identity-v05-design.mjs`
- `scripts/liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs`
- `tests/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-policy-tests.mjs`
- `.github/workflows/liuyao-v013-v07-fallback-identity-v05-policy.yml`
- `.github/workflows/liuyao-v013-v07-fallback-identity-v05-policy-v0.2.yml`
- `data/liuyao-semantic-v013-candidate-v07-policy-verification-contract-v0.2.json`
- `scripts/verify-liuyao-semantic-v013-candidate-v07-policy-ci-v0.2.mjs`
- This owner report.

Next legal action: author and seal the 550 allocated fresh literals and
data tooling under this frozen contract, then require successful data CI
before the upstream exposure audit. The current phase does not authorize
relabeling or rerunning any old failed cohort.
