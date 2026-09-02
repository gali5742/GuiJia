import { spawnSync } from 'node:child_process';

const tests = [
  'tests/liuyao-domain-assessment-pretraining-v01-tests.js',
  'tests/liuyao-domain-comparator-pretraining-v01-tests.js',
  'tests/liuyao-domain-assessment-pretraining-v02-tests.js',
  'tests/liuyao-domain-comparator-pretraining-v02-tests.js',
  'tests/liuyao-reading-identity-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-assessment-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-comparator-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-evidence-binding-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-assessment-comparator-e2e-v01-tests.js',
  'tests/liuyao-travel-safety-assessment-pretraining-v01-tests.js',
  'tests/liuyao-travel-safety-comparator-pretraining-v01-tests.js',
  'tests/liuyao-travel-evidence-binding-pretraining-v01-tests.js',
  'tests/liuyao-travel-duty-separation-e2e-v01-tests.js',
  'tests/liuyao-travel-evidence-source-pretraining-v01-tests.js',
  'tests/liuyao-line-status-fact-adapter-pretraining-v01-tests.js',
  'tests/liuyao-line-status-fact-adapter-pretraining-v02-tests.js',
  'tests/liuyao-shi-ying-fact-adapter-pretraining-v01-tests.js',
  'tests/liuyao-move-transform-fact-adapter-pretraining-v01-tests.js',
  'tests/liuyao-travel-line-evidence-adapter-pretraining-v01-tests.js',
  'tests/liuyao-travel-line-fact-assessment-e2e-v01-tests.js',
  'tests/liuyao-travel-line-evidence-adapter-pretraining-v02-tests.js',
  'tests/liuyao-travel-execution-assessment-pretraining-v02-tests.js',
  'tests/liuyao-travel-execution-atomic-calendar-e2e-v02-tests.js',
  'tests/liuyao-travel-execution-comparator-pretraining-v02-tests.js',
  'tests/liuyao-travel-execution-comparator-cross-version-v01-tests.js',
  'tests/liuyao-travel-execution-atomic-calendar-comparator-e2e-v02-tests.js',
  'tests/liuyao-travel-line-evidence-adapter-pretraining-v03-tests.js',
  'tests/liuyao-travel-destination-evidence-adapter-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-evidence-compose-pretraining-v03-tests.js',
  'tests/liuyao-travel-execution-assessment-pretraining-v03-tests.js',
  'tests/liuyao-travel-execution-comparator-pretraining-v03-tests.js',
  'tests/liuyao-travel-execution-reading-scoped-e2e-v03-tests.js',
  'tests/liuyao-travel-alternative-anchor-pretraining-v01-tests.js',
  'tests/liuyao-travel-transport-object-resolver-pretraining-v01-tests.js',
  'tests/liuyao-travel-transport-delay-evidence-adapter-pretraining-v01-tests.js',
  'tests/liuyao-travel-transport-retreat-evidence-e2e-v01-tests.js',
  'tests/liuyao-travel-transport-resolver-retreat-e2e-v01-tests.js'
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], { cwd: process.cwd(), stdio:'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Design-only LiuYao assessment/comparator regressions: ${tests.length} files passed.`);
