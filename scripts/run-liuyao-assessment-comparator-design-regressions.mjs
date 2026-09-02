import { spawnSync } from 'node:child_process';

const tests = [
  'tests/liuyao-domain-assessment-pretraining-v01-tests.js',
  'tests/liuyao-domain-comparator-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-assessment-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-comparator-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-evidence-binding-pretraining-v01-tests.js',
  'tests/liuyao-travel-execution-assessment-comparator-e2e-v01-tests.js',
  'tests/liuyao-travel-safety-assessment-pretraining-v01-tests.js',
  'tests/liuyao-travel-safety-comparator-pretraining-v01-tests.js',
  'tests/liuyao-travel-evidence-binding-pretraining-v01-tests.js',
  'tests/liuyao-travel-duty-separation-e2e-v01-tests.js'
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], { cwd: process.cwd(), stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Design-only LiuYao assessment/comparator regressions: ${tests.length} files passed.`);
