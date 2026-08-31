import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n,d) => d ? n/d : 0;
const reportFile = 'data/liuyao-semantic-decision-stack-v0.13-independent-report-v0.1.json';
const evalFile = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.json';
const evalLockFile = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.lock.json';
const candidateLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json';
const report = readJson(reportFile);
const evalLock = readJson(evalLockFile);
const candidateLock = readJson(candidateLockFile);

assert(report.version === '0.13-independent-report-v0.1', `unexpected report version ${report.version}`);
assert(report.status === 'post_lock_independent_evaluation', `unexpected report status ${report.status}`);
assert(report.scope === 'liuyao_semantic_decision_stack_v0.13', 'report scope drift');
assert(report.candidate?.candidateSha256 === candidateLock.candidateSha256, 'candidate SHA mismatch');
assert(report.evaluation?.dataSha256 === evalLock.dataSha256, 'eval data SHA mismatch');
assert(report.evaluation?.rowCount === 198 && report.results?.length === 198, 'report row count mismatch');
assert(sha256(evalFile) === evalLock.dataSha256, 'sealed eval hash drift');
assert(report.policy?.training === false && report.policy?.calibration === false && report.policy?.candidateMutation === false && report.policy?.postRunWordingPatch === false, 'independent report policy drift');

const known = report.results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = report.results.filter((row) => row.expectedDisposition === 'non_route');
assert(known.length === 132 && nonRoute.length === 66, `known/non-route counts ${known.length}/${nonRoute.length}`);
for (const pathId of ['strong_arbitration','support_arbitration','fallback_head']) assert(known.filter((row) => row.expectedCandidatePath === pathId).length === 44, `${pathId} count drift`);
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) assert(nonRoute.filter((row) => row.nonRouteSubtype === subtype).length === 22, `${subtype} count drift`);

const selectedKnown = known.filter((row) => row.finalDisposition === 'route_known');
const knownExact = known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute);
const falseActivated = nonRoute.filter((row) => row.finalDisposition === 'route_known');
const summary = report.summary;
assert(Math.abs(summary.final.knownExactRoute - ratio(knownExact.length,known.length)) < 1e-12, 'knownExactRoute summary mismatch');
assert(Math.abs(summary.final.acceptedRouteAccuracy - ratio(selectedKnown.filter((row) => row.finalRoute === row.expectedRoute).length,selectedKnown.length)) < 1e-12, 'acceptedRouteAccuracy summary mismatch');
assert(Math.abs(summary.final.falseRouteActivation - ratio(falseActivated.length,nonRoute.length)) < 1e-12, 'falseRouteActivation summary mismatch');
assert(Math.abs(summary.final.nonRouteNoRouteActivationSafety - ratio(nonRoute.length-falseActivated.length,nonRoute.length)) < 1e-12, 'nonRoute safety summary mismatch');
assert(report.results.every((row) => row.policy?.status === 'allowed'), 'policy-disallowed row leaked into sealed independent eval');

console.log('LiuYao v0.13 post-lock independent report verified.');
console.log(`- candidate: ${candidateLock.candidateSha256}`);
console.log(`- eval data SHA-256: ${evalLock.dataSha256}`);
console.log(`- known exact: ${(summary.final.knownExactRoute*100).toFixed(2)}%`);
console.log(`- accepted accuracy: ${(summary.final.acceptedRouteAccuracy*100).toFixed(2)}%`);
console.log(`- false route activation: ${(summary.final.falseRouteActivation*100).toFixed(2)}%`);
