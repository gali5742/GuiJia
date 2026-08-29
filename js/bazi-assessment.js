(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    // The static page still loads classic scripts in dependency order. Keep the new
    // Synthesis layers independent while ensuring they are available before Assessment.
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziStrengthSynthesis) {
        document.write('<script src="./js/bazi-strength-synthesis.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziRootEffectState) {
        document.write('<script src="./js/bazi-root-effect-state.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziRootSixRelations) {
        document.write('<script src="./js/bazi-root-six-relations.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziClashPreconditions) {
        document.write('<script src="./js/bazi-clash-preconditions.js?v=13.44.0"><\/script>');
    }

    const ASSESSMENT_SCHEMA_VERSION = '0.1';
    const ASSESSMENT_RULESET_VERSION = '0.1-draft';
    const STRENGTH_EVIDENCE_SCHEMA_VERSION = '0.1';
    const STRENGTH_EFFECTS_SCHEMA_VERSION = '0.1';
    const STRENGTH_SYNTHESIS_SCHEMA_VERSION = '0.1';

    const baziAssessmentDomains = Object.freeze({ DAY_MASTER_STRENGTH: 'dayMasterStrength' });
    const baziAssessmentStatuses = Object.freeze({
        NOT_EVALUATED: 'not-evaluated', SUPPORTED: 'supported', INSUFFICIENT: 'insufficient', CONFLICT: 'conflict'
    });
    const baziAssessmentConclusionValues = Object.freeze({
        [baziAssessmentDomains.DAY_MASTER_STRENGTH]: Object.freeze(['strong','weak','balanced','indeterminate'])
    });

    // Guard rules only prohibit unsupported inference shortcuts. They do not emit Assessment conclusions.
    const assessmentGuardRegistry = Object.freeze({
        version: '0.1',
        rules: Object.freeze([
            Object.freeze({ id:'BAZI-ASSESS-GUARD-001', scope:'global', statement:'季节状态不得单独生成身强身弱结论。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-002', scope:'global', statement:'同类或相关要素数量不得直接等同于实际力量。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-003', scope:'global', statement:'十二长生支气与藏干通根必须保持为不同证据轴。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-004', scope:'global', statement:'根的存在事实与根的实际状态必须保持分层。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-005', scope:'global', statement:'根所在支见冲不得直接生成根拔结论。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-006', scope:'global', statement:'完整三合、三会等组合不得单独生成对应五行强弱或得势结论。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-007', scope:'global', statement:'天干明现不得自动等同于已获得有效承载或扶助。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-008', scope:'global', statement:'不得自行设置党众、多帮扶、多克泄等全局数字阈值。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-009', scope:'global', statement:'中间作用方向不得直接按数量、分值或权重累加为身强身弱结论。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-010', scope:'global', statement:'同一藏干可同时具有通根与印比等多重语义，但不得在未设规则时重复计作多份力量。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-011', scope:'global', statement:'不同作用方向候选同时存在不得仅因此判定为 Conflict；Conflict 必须针对同一待决命题的互斥规则结果。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-012', scope:'global', statement:'Sufficiency 不得依据证据数量、方向数量或 actor 数量决定，必须依据明确规则覆盖与必要依赖是否满足。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-013', scope:'global', statement:'Synthesis 的 insufficient 只表示尚不足以执行最终判断，不得直接转换为 strong、weak、balanced 或 indeterminate。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-014', scope:'global', statement:'月令季节作为独立一级判断轴，不得被改写为固定倍数、分值、一票否决或绝对优先于其他判断轴的规则。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-015', scope:'global', statement:'根所在支命中冲、合、刑、害、破或组合结构，只表示进入交互观察；在没有独立效力规则时不得自动写成根受扰、削弱、失效或根拔。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-016', scope:'global', statement:'根所在支参与六冲时，不得仅凭“冲”决定根拔、受伤或发动；至少须先比较冲双方相对旺衰与有力程度，并保留扶助、制化、解救等未解析条件。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-017', scope:'global', statement:'根所在支参与六合时，六合关系本身只证明相合；不得直接等同于根被合住、根更有效、根失效或成化。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-018', scope:'global', statement:'六冲双方的旺相休囚死等单一季节状态只可作为条件输入，不得直接等同于《滴天髓》所谓旺者／衰者，也不得单独生成冲双方的相对占优结论。' }),
            Object.freeze({ id:'BAZI-ASSESS-GUARD-019', scope:'global', statement:'六冲相对状态比较不得采用分数、权重、条数多数或补偿式累加；必要语义维度未解析时必须 insufficient，双方分别存在已解析优势且无独立优先规则时必须 incomparable。' })
        ])
    });

    // Source-specific evidence contract for the basic teaching layer in 《千里命稿·强弱篇》.
    // It defines what may be collected; it intentionally does not classify “多/少” or emit strength levels.
    const qianliBasicStrengthEvidenceContract = Object.freeze({
        id: 'qianli-basic-strength-evidence',
        version: STRENGTH_EVIDENCE_SCHEMA_VERSION,
        scope: 'evidence-only',
        sourceLayer: '《千里命稿·强弱篇》教学层',
        fields: Object.freeze({
            seasonalState: Object.freeze({
                sourceSystem: 'seasonalFiveStates',
                required: true,
                assessmentMeaning: 'independent-primary-axis',
                hierarchyStatus: 'resolved',
                conversion: 'non-convertible',
                necessaryCondition: false,
                sufficientAlone: false
            }),
            visibleSupportActors: Object.freeze({
                relations: Object.freeze(['生我','同我']),
                countClassification: 'unresolved'
            }),
            visibleRestraintActors: Object.freeze({
                relations: Object.freeze(['克我']),
                countClassification: 'unresolved'
            }),
            visibleDrainActors: Object.freeze({
                relations: Object.freeze(['我生']),
                countClassification: 'unresolved'
            }),
            visibleDistributionActors: Object.freeze({
                relations: Object.freeze(['我克']),
                includedInRestraintDrain: false,
                countClassification: 'separate'
            }),
            branchQi: Object.freeze({
                sourceSystem: 'twelveGrowthStages',
                positions: Object.freeze(['year','day','hour']),
                aggregateClassification: 'unresolved'
            })
        }),
        boundaries: Object.freeze([
            '月令季节必须作为独立一级判断轴保留，不与明干、根气或支气按统一分值、权重或条数换算。',
            '月令得令或失令都不得单独生成最终身强身弱结论，也不得解释为一票式必要条件。',
            '不从计数自行生成多帮扶、少帮扶、多克泄或少克泄。',
            '不从年日时支十二长生自行归纳支得气或支失气。',
            '不把我克之“被分”并入《强弱篇》的克泄计数。',
            '不生成最强、中强、次强、次弱、中弱、最弱或其他身强弱结论。'
        ])
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

    const ensureStrengthSynthesis = (semanticModel = {}) => {
        if (!semanticModel.strengthSynthesis && GuiJia.baziStrengthSynthesis?.buildStrengthSynthesis) {
            semanticModel.strengthSynthesis = GuiJia.baziStrengthSynthesis.buildStrengthSynthesis(semanticModel);
        }
        return semanticModel.strengthSynthesis || null;
    };

    const buildDayMasterStrengthAssessmentInput = (semanticModel = {}) => {
        const evidenceCollection = semanticModel?.strengthEvidence || null;
        const effectCollection = semanticModel?.strengthEffects || null;
        const synthesisCollection = semanticModel?.strengthSynthesis || null;
        return {
            domain:baziAssessmentDomains.DAY_MASTER_STRENGTH,
            status:baziAssessmentStatuses.NOT_EVALUATED,
            availableRefs:[...collectSemanticRefs(semanticModel)],
            activeRuleIds:assessmentRuleRegistry.rules.filter((rule) => rule.domain === baziAssessmentDomains.DAY_MASTER_STRENGTH && rule.enabled).map((rule) => rule.id),
            guardRuleIds:assessmentGuardRegistry.rules.map((rule) => rule.id),
            evidenceContractVersion:STRENGTH_EVIDENCE_SCHEMA_VERSION,
            effectsSchemaVersion:STRENGTH_EFFECTS_SCHEMA_VERSION,
            synthesisSchemaVersion:STRENGTH_SYNTHESIS_SCHEMA_VERSION,
            evidenceContracts:Object.freeze({ qianliBasic:qianliBasicStrengthEvidenceContract }),
            evidenceCollection,
            evidenceCollectionStatus:evidenceCollection?.state || 'not-collected',
            effectCollection,
            effectCollectionStatus:effectCollection?.state || 'not-interpreted',
            synthesisCollection,
            synthesisCollectionStatus:synthesisCollection?.state || 'not-synthesized',
            synthesisSufficiencyStatus:synthesisCollection?.sufficiency?.status || 'not-evaluated',
            note:'身强弱最终规则尚未启用；当前已完成证据抽取、中间作用解释，并已解析月令层级、根角色、根有效状态合同、六冲／六合条件契约及六冲非补偿比较合同；六冲必要语义维度、六合实际效力、明干实际效力、藏支扶身 actor 效力及支气汇总仍未解析，因此不执行最终强弱结论。'
        };
    };

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

    const buildAssessmentLayer = (semanticModel = {}) => {
        ensureStrengthSynthesis(semanticModel);
        return {
            version:ASSESSMENT_SCHEMA_VERSION,
            rulesetVersion:ASSESSMENT_RULESET_VERSION,
            state:assessmentRuleRegistry.rules.some((rule) => rule.enabled) ? 'rules-enabled' : 'contract-only',
            domains:{ [baziAssessmentDomains.DAY_MASTER_STRENGTH]:buildDayMasterStrengthAssessmentInput(semanticModel) },
            assessments:evaluateBaziAssessments(semanticModel)
        };
    };

    GuiJia.baziAssessment = {
        ASSESSMENT_SCHEMA_VERSION, ASSESSMENT_RULESET_VERSION, STRENGTH_EVIDENCE_SCHEMA_VERSION, STRENGTH_EFFECTS_SCHEMA_VERSION, STRENGTH_SYNTHESIS_SCHEMA_VERSION,
        baziAssessmentDomains, baziAssessmentStatuses, baziAssessmentConclusionValues,
        assessmentGuardRegistry, qianliBasicStrengthEvidenceContract,
        assessmentRuleRegistry, collectSemanticRefs, validateAssessmentRecord, createAssessmentRecord,
        ensureStrengthSynthesis, buildDayMasterStrengthAssessmentInput, evaluateBaziAssessments, buildAssessmentLayer
    };
})(typeof window !== 'undefined' ? window : globalThis);
