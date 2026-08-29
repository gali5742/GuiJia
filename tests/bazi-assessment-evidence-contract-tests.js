#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

function loadAssessment() {
    const context = { console, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    const filename = path.join(ROOT, 'js/bazi-assessment.js');
    vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    return context.GuiJia.baziAssessment;
}

const assessment = loadAssessment();

test('身强弱证据合同 v0.1 只建立输入结构，不启用正向判定规则', () => {
    assert(assessment.STRENGTH_EVIDENCE_SCHEMA_VERSION === '0.1', '证据合同版本异常');
    assert(assessment.assessmentRuleRegistry.rules.length === 0, '证据合同阶段不应启用正向 Assessment 规则');
    const layer = assessment.buildAssessmentLayer({ facts:[], derivedFacts:[], structures:[] });
    const strength = layer.domains.dayMasterStrength;
    assert(layer.state === 'contract-only', '未启用正向规则却离开 contract-only');
    assert(layer.assessments.length === 0, '证据合同阶段不应产生 Assessment 结论');
    assert(strength.status === 'not-evaluated', '身强弱不应提前进入已评估状态');
    assert(strength.evidenceContractVersion === '0.1', '身强弱接口未暴露证据合同版本');
});

test('八条全局 Guard Rule 全部只阻断越级推理', () => {
    const guards = assessment.assessmentGuardRegistry.rules;
    assert(guards.length === 8, `Guard Rule 数量异常：${guards.length}`);
    const ids = guards.map((item) => item.id);
    for (let i = 1; i <= 8; i += 1) {
        const id = `BAZI-ASSESS-GUARD-${String(i).padStart(3, '0')}`;
        assert(ids.includes(id), `缺少 ${id}`);
    }
    assert(guards.every((item) => item.scope === 'global'), 'Guard Rule 不应混入限域正向判断');
    const strength = assessment.buildDayMasterStrengthAssessmentInput({ facts:[], derivedFacts:[], structures:[] });
    assert(strength.guardRuleIds.length === 8, '身强弱接口未挂接全部 Guard Rule');
    assert(strength.activeRuleIds.length === 0, 'Guard Rule 不得伪装成 active Assessment rule');
});

test('《千里命稿·强弱篇》教学证据合同保持扶、克、泄、被分分轴', () => {
    const contract = assessment.qianliBasicStrengthEvidenceContract;
    const fields = contract.fields;
    assert(contract.scope === 'evidence-only', '韦氏教学模型不得直接进入结论层');
    assert(fields.visibleSupportActors.relations.join(',') === '生我,同我', '帮扶轴应只包含生我、同我');
    assert(fields.visibleRestraintActors.relations.join(',') === '克我', '克轴定义异常');
    assert(fields.visibleDrainActors.relations.join(',') === '我生', '泄轴定义异常');
    assert(fields.visibleDistributionActors.relations.join(',') === '我克', '被分轴定义异常');
    assert(fields.visibleDistributionActors.includedInRestraintDrain === false, '我克不应被并入《强弱篇》克泄计数');
    assert(fields.visibleSupportActors.countClassification === 'unresolved', '不得提前发明多/少阈值');
    assert(fields.visibleRestraintActors.countClassification === 'unresolved', '不得提前发明多/少阈值');
    assert(fields.visibleDrainActors.countClassification === 'unresolved', '不得提前发明多/少阈值');
});

test('支气合同只观察年、日、时支，不把月令重复塞入支得气轴', () => {
    const branchQi = assessment.qianliBasicStrengthEvidenceContract.fields.branchQi;
    assert(branchQi.sourceSystem === 'twelveGrowthStages', '支气必须明确来自十二长生体系');
    assert(branchQi.positions.join(',') === 'year,day,hour', `支气位置异常：${branchQi.positions.join(',')}`);
    assert(!branchQi.positions.includes('month'), '月支不得同时进入《强弱篇》年日时支得气轴');
    assert(branchQi.aggregateClassification === 'unresolved', '不得提前把混合十二长生状态归纳为支得气/失气');
});

test('证据合同明确禁止生成强弱等级与多寡阈值', () => {
    const contract = assessment.qianliBasicStrengthEvidenceContract;
    const boundaryText = contract.boundaries.join('');
    assert(boundaryText.includes('不从计数自行生成多帮扶'), '缺少多寡阈值边界');
    assert(boundaryText.includes('不从年日时支十二长生自行归纳支得气或支失气'), '缺少支气总括边界');
    assert(boundaryText.includes('不生成最强、中强、次强、次弱、中弱、最弱'), '缺少韦氏等级输出边界');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
