import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v03-development.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (data.version !== '0.13-candidate-v0.3-development-v0.1' || data.status !== 'generated_preseal' || data.sealed !== false) {
  throw new Error('Candidate v0.3 execution preseal correction may run only on generated_preseal data');
}
if (data.presealPatch?.rowsPatched !== 25 || data.presealPatch?.modelOrThresholdChanged !== false) {
  throw new Error('Historical 25-row deterministic preseal patch must run before execution-v0.1 correction');
}

const corrections = [
  {
    id:'V013-V03-D-089',
    from:'往后这阵子我手头会不会比现在宽松一点',
    to:'往后这阵子我的日子会不会过得更宽裕些',
    expectedDisposition:'route_known',
    expectedRoute:'financial_fortune',
    expectedCandidatePath:'fallback_head',
    nonRouteSubtype:null,
    reason:'deterministic_path_alignment',
    provenance:'nonlearned Evidence/Arbitration audit only; original wording activated finance-support before any encoder scoring'
  },
  {
    id:'V013-V03-D-166',
    from:'我现在是不是该换一种做法',
    to:'我现在是不是应该改个处理方式',
    expectedDisposition:'non_route',
    expectedRoute:null,
    expectedCandidatePath:null,
    nonRouteSubtype:'route_unresolved',
    reason:'exact_prior_calibration_overlap_removal',
    provenance:'exact normalized text overlap with Routeability v0.3 calibration detected by preseal corpus-isolation verifier before any encoder scoring'
  }
];

for (const correction of corrections) {
  const row = (data.rows || []).find((item) => item.id === correction.id);
  if (!row) throw new Error(`Execution preseal correction target ${correction.id} missing`);
  if (
    row.expectedDisposition !== correction.expectedDisposition ||
    (row.expectedRoute ?? null) !== correction.expectedRoute ||
    (row.expectedCandidatePath ?? null) !== correction.expectedCandidatePath ||
    (row.nonRouteSubtype ?? null) !== correction.nonRouteSubtype
  ) {
    throw new Error(`Execution preseal correction target contract drift ${correction.id}: ${JSON.stringify(row)}`);
  }
  if (row.text !== correction.from) throw new Error(`Execution preseal correction source wording drift ${correction.id}: ${row.text}`);
  row.text = correction.to;
}

const primary = corrections[0];
data.executionPresealCorrection = {
  version:'execution-v0.1',
  // Backward-compatible primary correction fields retained for the existing verifier.
  targetId:primary.id,
  expectedRoute:primary.expectedRoute,
  expectedCandidatePath:primary.expectedCandidatePath,
  correctionsApplied:corrections.length,
  corrections:corrections.map((item) => ({ ...item })),
  encoderScoringObserved:false,
  independentEvaluationRead:false,
  labelChanged:false,
  labelsChanged:false,
  modelOrThresholdChanged:false,
  verifierWeakened:false
};
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Applied ${corrections.length} Candidate v0.3 execution-v0.1 preseal corrections before any encoder scoring.`);
