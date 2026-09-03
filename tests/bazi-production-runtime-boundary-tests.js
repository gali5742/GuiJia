#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');

function execute(pathname) {
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
    vm.runInContext(source, sandbox, { filename: 'bazi-assessment.js' });
    return { writes, GuiJia: sandbox.GuiJia };
}

for (const pathname of ['/GuiJia/', '/GuiJia/index.html']) {
    const runtime = execute(pathname);
    assert.equal(runtime.writes.length, 0, `${pathname} must not parser-load BaZi research dependencies`);
    assert.ok(runtime.GuiJia?.baziAssessment, `${pathname} must still expose the optional Assessment contract`);
    const layer = runtime.GuiJia.baziAssessment.buildAssessmentLayer({ facts: [], derivedFacts: [], structures: [] });
    assert.equal(layer.state, 'contract-only');
}

const researchPage = execute('/tests/bazi-assessment-test.html');
assert.equal(researchPage.writes.length, 9, 'dedicated non-production pages retain legacy research dependency loading until phase 2 migration');
assert.ok(researchPage.writes.every((value) => value.includes('<script src="./js/bazi-')));

console.log('BaZi production runtime boundary tests passed');
