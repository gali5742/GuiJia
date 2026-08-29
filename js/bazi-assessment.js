(function (global) {
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
