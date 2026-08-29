#!/usr/bin/env python3
from pathlib import Path

ROOT = Path('.')

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing target: {label}')
    if text.count(old) != 1:
        raise SystemExit(f'non-unique target {label}: {text.count(old)}')
    return text.replace(old, new, 1)

assessment = r'''(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const ASSESSMENT_SCHEMA_VERSION = '0.1';
    const ASSESSMENT_RULESET_VERSION = '0.1-draft';

    const baziAssessmentDomains = Object.freeze({ DAY_MASTER_STRENGTH: 'dayMasterStrength' });
    const baziAssessmentStatuses = Object.freeze({
        NOT_EVALUATED: 'not-evaluated', SUPPORTED: 'supported', INSUFFICIENT: 'insufficient', CONFLICT: 'conflict'
    });
    const baziAssessmentConclusionValues = Object.freeze({
        [baziAssessmentDomains.DAY_MASTER_STRENGTH]: Object.freeze(['strong','weak','balanced','indeterminate'])
    });

    const collectSemanticRefs = (semanticModel = {}) => new Set([
        ...(semanticModel.facts || []).map((item) => item.id),
        ...(semanticModel.derivedFacts || []).map((item) => item.id),
        ...(semanticModel.structures || []).map((item) => item.id)
    ].filter(Boolean));

    const validateAssessmentRecord = (record, semanticModel = {}) => {
        const errors = [];
        if (!record || typeof record !== 'object') return { valid:false, errors:['assessment record missing'] };
        if (!record.id) errors.push('id missing');
        if (!record.ruleId) errors.push('ruleId missing');
        if (!Object.values(baziAssessmentDomains).includes(record.domain)) errors.push('domain invalid');
        if (!Object.values(baziAssessmentStatuses).includes(record.status)) errors.push('status invalid');
        const allowed = baziAssessmentConclusionValues[record.domain] || [];
        if (record.conclusion != null && !allowed.includes(record.conclusion)) errors.push('conclusion invalid');
        const refs = collectSemanticRefs(semanticModel);
        (record.sourceRefs || []).forEach((ref) => { if (!refs.has(ref)) errors.push(`unknown sourceRef: ${ref}`); });
        if (record.status === baziAssessmentStatuses.SUPPORTED && !(record.sourceRefs || []).length) errors.push('supported assessment requires sourceRefs');
        return { valid:errors.length === 0, errors };
    };

    const createAssessmentRecord = (input, semanticModel = {}) => {
        const record = {
            id:String(input?.id || ''), ruleId:String(input?.ruleId || ''), domain:input?.domain || '',
            status:input?.status || baziAssessmentStatuses.NOT_EVALUATED, conclusion:input?.conclusion ?? null,
            sourceRefs:[...new Set(input?.sourceRefs || [])], rationale:String(input?.rationale || ''), boundary:String(input?.boundary || '')
        };
        const validation = validateAssessmentRecord(record, semanticModel);
        if (!validation.valid) throw new Error(`Invalid BaZi Assessment: ${validation.errors.join('; ')}`);
        return Object.freeze(record);
    };

    const assessmentRuleRegistry = Object.freeze({ version:ASSESSMENT_RULESET_VERSION, rules:Object.freeze([]) });

    const buildDayMasterStrengthAssessmentInput = (semanticModel = {}) => ({
        domain:baziAssessmentDomains.DAY_MASTER_STRENGTH,
        status:baziAssessmentStatuses.NOT_EVALUATED,
        availableRefs:[...collectSemanticRefs(semanticModel)],
        activeRuleIds:assessmentRuleRegistry.rules.filter((rule) => rule.domain === baziAssessmentDomains.DAY_MASTER_STRENGTH && rule.enabled).map((rule) => rule.id),
        note:'身强弱规则尚未启用；当前仅暴露可追溯输入接口，不生成结论。'
    });

    const evaluateBaziAssessments = (semanticModel = {}) => {
        const activeRules = assessmentRuleRegistry.rules.filter((rule) => rule.enabled);
        if (!activeRules.length) return [];
        return activeRules.flatMap((rule) => {
            if (typeof rule.evaluate !== 'function') return [];
            const output = rule.evaluate(semanticModel);
            if (!output) return [];
            const records = Array.isArray(output) ? output : [output];
            return records.map((record) => createAssessmentRecord({ ...record, ruleId:rule.id, domain:rule.domain }, semanticModel));
        });
    };

    const buildAssessmentLayer = (semanticModel = {}) => ({
        version:ASSESSMENT_SCHEMA_VERSION,
        rulesetVersion:ASSESSMENT_RULESET_VERSION,
        state:assessmentRuleRegistry.rules.some((rule) => rule.enabled) ? 'rules-enabled' : 'contract-only',
        domains:{ [baziAssessmentDomains.DAY_MASTER_STRENGTH]:buildDayMasterStrengthAssessmentInput(semanticModel) },
        assessments:evaluateBaziAssessments(semanticModel)
    });

    GuiJia.baziAssessment = {
        ASSESSMENT_SCHEMA_VERSION, ASSESSMENT_RULESET_VERSION,
        baziAssessmentDomains, baziAssessmentStatuses, baziAssessmentConclusionValues,
        assessmentRuleRegistry, collectSemanticRefs, validateAssessmentRecord, createAssessmentRecord,
        buildDayMasterStrengthAssessmentInput, evaluateBaziAssessments, buildAssessmentLayer
    };
})(typeof window !== 'undefined' ? window : globalThis);
'''
write('js/bazi-assessment.js', assessment)

path='js/bazi-interpretation.js'; text=read(path)
old="""        return {\n            version: '1.0',\n            facts,\n            derivedFacts,\n            structures,\n            assessments: [],\n            assessmentBoundary: '当前模块停在结构层：不生成身强身弱终判、格局、用神、喜忌、吉凶或具体事件结论；存在性事实与结构关系不得自动升级为实际效力判断；尚未纳入的规则不自动补齐。'\n        };\n"""
new="""        const semanticModel = {\n            version: '1.0',\n            facts,\n            derivedFacts,\n            structures,\n            assessments: [],\n            assessmentBoundary: '当前模块停在结构层：不生成身强身弱终判、格局、用神、喜忌、吉凶或具体事件结论；存在性事实与结构关系不得自动升级为实际效力判断；尚未纳入的规则不自动补齐。'\n        };\n        const assessmentLayer = GuiJia.baziAssessment?.buildAssessmentLayer?.(semanticModel) || null;\n        semanticModel.assessmentLayer = assessmentLayer;\n        semanticModel.assessments = assessmentLayer?.assessments || [];\n        return semanticModel;\n"""
text=replace_once(text,old,new,'semantic model assessment layer'); write(path,text)

path='index.html'; text=read(path)
text=replace_once(text,'<script src="./js/bazi-literature.js?v=13.44.0"></script>\n<script src="./js/bazi-interpretation.js?v=13.44.0"></script>','<script src="./js/bazi-literature.js?v=13.44.0"></script>\n<script src="./js/bazi-assessment.js?v=13.44.0"></script>\n<script src="./js/bazi-interpretation.js?v=13.44.0"></script>','index assessment script'); write(path,text)

path='tests/bazi-semantic-layer-tests.js'; text=read(path)
marker="loadScript('js/bazi-core.js');\n"
if marker not in text: raise SystemExit('missing bazi core load marker')
text=text.replace(marker,marker+"loadScript('js/bazi-assessment.js');\n",1)
insert="console.log(`\\n${passed} passed, ${failed} failed`);\n"
newtests=r'''
test('Assessment v0.1 只建立合同，未启用规则时不得生成身强弱结论', () => {
    const result = makeResult();
    const output = baziInterpretation.buildBaziInterpretation(result);
    const layer = output.semanticModel?.assessmentLayer;
    assert(layer?.version === '0.1', `Assessment schema 版本异常：${layer?.version}`);
    assert(layer?.state === 'contract-only', `未启用规则却进入执行态：${layer?.state}`);
    assert(Array.isArray(layer?.assessments) && layer.assessments.length === 0, 'Assessment 骨架阶段不应产生结论');
    const strength = layer?.domains?.dayMasterStrength;
    assert(strength?.status === 'not-evaluated', `身强弱接口不应提前判定：${strength?.status}`);
    assert(strength?.activeRuleIds?.length === 0, '身强弱接口不得携带未审定规则');
    assert(output.semanticModel.assessments.length === 0, '旧 assessments 字段应继续保持空层');
});

test('Assessment record 必须带 ruleId 且 sourceRefs 只能引用既有 F/D/S', () => {
    const result = makeResult();
    const output = baziInterpretation.buildBaziInterpretation(result);
    const semanticModel = output.semanticModel;
    const assessment = context.GuiJia.baziAssessment;
    const valid = assessment.createAssessmentRecord({ id:'A01', ruleId:'TEST-ONLY', domain:'dayMasterStrength', status:'supported', conclusion:'indeterminate', sourceRefs:['D02','D03','S01'], rationale:'测试记录' }, semanticModel);
    assert(valid.sourceRefs.join(',') === 'D02,D03,S01', '合法 Assessment 未保留来源引用');
    let failedAsExpected = false;
    try { assessment.createAssessmentRecord({ id:'A02', ruleId:'TEST-ONLY', domain:'dayMasterStrength', status:'supported', conclusion:'weak', sourceRefs:['D99'] }, semanticModel); }
    catch (error) { failedAsExpected = /unknown sourceRef/.test(String(error?.message || error)); }
    assert(failedAsExpected, 'Assessment 允许引用不存在的语义证据');
});

test('复制八字上下文在 Assessment 合同阶段仍保持空层边界，不泄漏内部接口元数据', () => {
    const result = makeResult();
    const output = baziInterpretation.buildBaziInterpretation(result);
    const text = baziInterpretation.buildBaziContextText(result, output);
    assert(text.includes('【Assessment｜作用与结论层】'), '复制上下文缺 Assessment 空层');
    assert(text.includes('当前模块停在结构层'), 'Assessment 边界未保留');
    assert(!text.includes('contract-only') && !text.includes('activeRuleIds') && !text.includes('dayMasterStrength'), '内部 Assessment 合同元数据泄漏到复制上下文');
});

'''
text=replace_once(text,insert,newtests+insert,'assessment tests insert'); write(path,text)

path='tests/run-tests.js'; text=read(path)
insert="test('重新排八字会重置古籍筛选，避免跨命盘残留', () => {\n"
newtest=r'''test('八字 Assessment 使用独立模块并在规则启用前保持空层', () => {
    const indexSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    const interpretationSource = fs.readFileSync(path.join(ROOT, 'js/bazi-interpretation.js'), 'utf8');
    assert(indexSource.includes('js/bazi-assessment.js'), '生产页面未加载独立 Assessment 模块');
    assert(indexSource.indexOf('js/bazi-assessment.js') < indexSource.indexOf('js/bazi-interpretation.js'), 'Assessment 必须先于解释层加载');
    assert(assessmentSource.includes('rules:Object.freeze([])') || assessmentSource.includes('rules: Object.freeze([])'), 'Assessment v0.1 不应预置未经审定的结论规则');
    assert(assessmentSource.includes('validateAssessmentRecord'), 'Assessment 缺少证据引用校验');
    assert(interpretationSource.includes('buildAssessmentLayer'), '解释层未接入独立 Assessment 合同');
    assert(!interpretationSource.includes("conclusion:'weak'") && !interpretationSource.includes("conclusion:'strong'"), '解释层不应硬编码身强弱结论');
});

'''
text=replace_once(text,insert,newtest+insert,'main assessment regression'); write(path,text)
print('BaZi Assessment contract patch applied')
