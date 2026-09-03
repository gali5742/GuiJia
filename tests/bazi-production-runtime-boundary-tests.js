#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
const bootstrapSource = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function execute(source, pathname) {
    const writes = [];
    const sandbox = {
        console,
        document: {
            readyState: 'loading',
            location: { pathname },
            write(value) { writes.push(String(value)); }
        }
    };
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: 'runtime-boundary-fixture.js' });
    return { writes, GuiJia: sandbox.GuiJia };
}

for (const pathname of ['/GuiJia/', '/GuiJia/index.html', '/tests/bazi-assessment-test.html']) {
    const runtime = execute(assessmentSource, pathname);
    assert.equal(runtime.writes.length, 0, 'bazi-assessment must remain a pure module on every runtime profile');
    assert.ok(runtime.GuiJia?.baziAssessment, 'bazi-assessment contract must still be exposed');
    const layer = runtime.GuiJia.baziAssessment.buildAssessmentLayer({ facts: [], derivedFacts: [], structures: [] });
    assert.equal(layer.state, 'contract-only');
}

assert.ok(!indexHtml.includes('bazi-research-bootstrap.js'), 'production index must not opt into the BaZi research bootstrap');
const researchRuntime = execute(bootstrapSource, '/research/bazi-runtime.html');
const researchDependencies = researchRuntime.GuiJia?.baziResearchBootstrap?.dependencies || [];
assert.equal(researchRuntime.GuiJia?.baziResearchBootstrap?.mode, 'explicit-research-opt-in');
assert.equal(researchRuntime.writes.length, researchDependencies.length, 'research bootstrap must explicitly emit each declared dependency exactly once');

const requiredResearchRoots = [
    'baziMonthCommand',
    'baziStrengthSynthesis',
    'baziRootEffectState',
    'baziRootSixRelations',
    'baziClashPreconditions',
    'baziClashSeasonalPosition',
    'baziClashNonseasonalForce',
    'baziElementPresenceScope',
    'baziClashRescueContext'
];
const declaredResearchKeys = new Set(researchDependencies.map((item) => item.globalKey));
requiredResearchRoots.forEach((globalKey) => {
    assert.ok(declaredResearchKeys.has(globalKey), `research bootstrap lost required root ${globalKey}`);
});

console.log('BaZi production runtime boundary tests passed');
