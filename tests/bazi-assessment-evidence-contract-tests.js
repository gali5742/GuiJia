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

test('身强弱证据合同 v0.1 保持最终 Assessment 规则关闭', () => {
    assert(assessment.STRENGTH_EVIDENCE_SCHEMA_VERSION === '0.1', '证据合同版本异常');
    assert(assessment.STRENGTH_SYNTHESIS_SCHEMA_VERSION === '0.1', 'Synthesis contract 版本异常');
    assert(assessment.assessmentRuleRegistry.rules.length === 0, '当前不应启用正向 Assessment 规则');
    const layer = assessment.buildAssessmentLayer({ facts:[], derivedFacts:[], structures:[] });
    const strength = layer.domains.dayMasterStrength;
    assert(layer.state === 'contract-only', '未启用正向 Assessment 规则却离开 contract-only');
    assert(layer.assessments.length === 0, '当前不应产生 Assessment 结论');
    assert(strength.status === 'not-evaluated', '身强弱不应提前进入已评估状态');
    assert(strength.evidenceContractVersion === '0.1', '身强弱接口未暴露证据合同版本');
    assert(strength.synthesisSchemaVersion === '0.1', '身强弱接口未暴露 Synthesis contract 版本');
});

test('二十条全局 Guard Rule 全部只阻断越级推理', () => {
    const guards = assessment.assessmentGuardRegistry.rules;
    assert(guards.length === 20, `Guard Rule 数量异常：${guards.length}`);
    const ids = guards.map((item) => item.id);
    for (let i = 1; i <= 20; i += 1) {
        const id = `BAZI-ASSESS-GUARD-${String(i).padStart(3, '0')}`;
        assert(ids.includes(id), `缺少 ${id}`);
    }
    assert(guards.every((item) => item.scope === 'global'), 'Guard Rule 不应混入限域正向判断');
    const strength = assessment.buildDayMasterStrengthAssessmentInput({ facts:[], derivedFacts:[], structures:[] });
    assert(strength.guardRuleIds.length === 20, '身强弱接口未挂接全部 Guard Rule');
    assert(strength.activeRuleIds.length === 0, 'Guard Rule 不得伪装成 active Assessment rule');
});

test('中间作用 Guard 阻止计分聚合与同一藏干重复计力', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards['BAZI-ASSESS-GUARD-009']?.includes('数量、分值或权重'), 'GUARD-009 未阻止中间作用直接数值聚合');
    assert(guards['BAZI-ASSESS-GUARD-010']?.includes('同一藏干') && guards['BAZI-ASSESS-GUARD-010']?.includes('不得'), 'GUARD-010 未阻止同一藏干重复计力');
});

test('Synthesis Guard 阻止方向共存伪冲突、数量充分性与 insufficient 越级结论', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards['BAZI-ASSESS-GUARD-011']?.includes('同一待决命题'), 'GUARD-011 未把 Conflict 限定到同一待决命题');
    assert(guards['BAZI-ASSESS-GUARD-012']?.includes('规则覆盖') && guards['BAZI-ASSESS-GUARD-012']?.includes('必要依赖'), 'GUARD-012 未把 Sufficiency 建立在规则覆盖与必要依赖上');
    assert(guards['BAZI-ASSESS-GUARD-013']?.includes('insufficient') && guards['BAZI-ASSESS-GUARD-013']?.includes('indeterminate'), 'GUARD-013 未阻止 insufficient 越级为最终结论');
});

test('月令层级 Guard 阻止分值、一票否决与绝对优先级', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    const text = guards['BAZI-ASSESS-GUARD-014'] || '';
    assert(text.includes('独立一级判断轴'), 'GUARD-014 未明确月令层级');
    assert(text.includes('分值') && text.includes('一票否决') && text.includes('绝对优先'), 'GUARD-014 未完整阻止月令数值化/绝对化');
});

test('根交互 Guard 阻止结构命中直接升级为根效力变化', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    const text = guards['BAZI-ASSESS-GUARD-015'] || '';
    assert(text.includes('冲、合、刑、害、破') && text.includes('组合结构'), 'GUARD-015 未覆盖根所在支的主要结构关系');
    assert(text.includes('进入交互观察'), 'GUARD-015 未把结构命中限制在观察层');
    assert(text.includes('不得自动写成根受扰、削弱、失效或根拔'), 'GUARD-015 未阻止结构命中越级为根效力结论');
});

test('六冲与六合专项 Guard 锁定条件规则边界', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    const clash = guards['BAZI-ASSESS-GUARD-016'] || '';
    const harmony = guards['BAZI-ASSESS-GUARD-017'] || '';
    assert(clash.includes('相对旺衰') && clash.includes('有力程度'), 'GUARD-016 未要求六冲双方强弱／有力比较');
    assert(clash.includes('扶助、制化、解救'), 'GUARD-016 未保留六冲外围条件');
    assert(clash.includes('不得仅凭“冲”'), 'GUARD-016 未阻止逢冲即断');
    assert(harmony.includes('只证明相合'), 'GUARD-017 未把六合限制在关系事实层');
    assert(harmony.includes('根被合住') && harmony.includes('根更有效') && harmony.includes('根失效'), 'GUARD-017 未阻止六合越级为根状态');
});

test('六冲相对状态 Guard 阻止季节单轴替代整体旺衰与补偿式比较', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    const seasonal = guards['BAZI-ASSESS-GUARD-018'] || '';
    const comparison = guards['BAZI-ASSESS-GUARD-019'] || '';
    assert(seasonal.includes('旺相休囚死') && seasonal.includes('条件输入'), 'GUARD-018 未把季节五态限制为条件输入');
    assert(seasonal.includes('旺者／衰者') && seasonal.includes('不得直接等同'), 'GUARD-018 未阻止季节五态替代整体旺衰');
    assert(comparison.includes('分数') && comparison.includes('权重') && comparison.includes('条数多数'), 'GUARD-019 未阻止数值／多数表决');
    assert(comparison.includes('insufficient') && comparison.includes('incomparable'), 'GUARD-019 未锁定未解析与双方各有优势的处理');
});

test('六冲非季节力量 Guard 锁定原文支类匹配与五行有无 scope', () => {
    const guards = Object.fromEntries(assessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    const text = guards['BAZI-ASSESS-GUARD-020'] || '';
    assert(text.includes('支中有') && text.includes('存在性匹配'), 'GUARD-020 未限制为原文支类存在性匹配');
    assert(text.includes('不得多数表决'), 'GUARD-020 未阻止相反支类多数表决');
    assert(text.includes('有木／无金') && text.includes('element-presence scope'), 'GUARD-020 未保留五行有无 scope 未决');
    assert(text.includes('明干、地支本气或藏干'), 'GUARD-020 未明确禁止擅选五行观察范围');
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

test('《千里命稿·强弱篇》月令合同固定为独立一级、不可换算轴', () => {
    const seasonal = assessment.qianliBasicStrengthEvidenceContract.fields.seasonalState;
    assert(seasonal.required === true, '月令季节轴应作为必采输入');
    assert(seasonal.assessmentMeaning === 'independent-primary-axis', `月令层级异常：${seasonal.assessmentMeaning}`);
    assert(seasonal.hierarchyStatus === 'resolved', '月令层级依赖应标记为 resolved');
    assert(seasonal.conversion === 'non-convertible', '月令不得进入统一换算单位');
    assert(seasonal.necessaryCondition === false, '月令不得作为一票式必要条件');
    assert(seasonal.sufficientAlone === false, '月令不得单独生成最终身强弱结论');
});

test('支气合同只观察年、日、时支，不把月令重复塞入支得气轴', () => {
    const branchQi = assessment.qianliBasicStrengthEvidenceContract.fields.branchQi;
    assert(branchQi.sourceSystem === 'twelveGrowthStages', '支气必须明确来自十二长生体系');
    assert(branchQi.positions.join(',') === 'year,day,hour', `支气位置异常：${branchQi.positions.join(',')}`);
    assert(!branchQi.positions.includes('month'), '月支不得同时进入《强弱篇》年日时支得气轴');
    assert(branchQi.aggregateClassification === 'unresolved', '不得提前把混合十二长生状态归纳为支得气/失气');
});

test('证据合同明确禁止生成强弱等级、多寡阈值与月令绝对化', () => {
    const contract = assessment.qianliBasicStrengthEvidenceContract;
    const boundaryText = contract.boundaries.join('');
    assert(boundaryText.includes('独立一级判断轴'), '缺少月令独立层级边界');
    assert(boundaryText.includes('一票式必要条件'), '缺少月令非一票式边界');
    assert(boundaryText.includes('不从计数自行生成多帮扶'), '缺少多寡阈值边界');
    assert(boundaryText.includes('不从年日时支十二长生自行归纳支得气或支失气'), '缺少支气总括边界');
    assert(boundaryText.includes('不生成最强、中强、次强、次弱、中弱、最弱'), '缺少韦氏等级输出边界');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
