(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityCaseCalibration?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliQuantityCaseCalibrationSource) {
        document.write('<script src="./js/bazi-qianli-quantity-case-calibration-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziQianliQuantityCaseCalibrationSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-QIANLI-QUANTITY-CASE-CALIBRATION-001';
    const { SOURCE_CASES, CALIBRATION_CONSTRAINTS, CONTRACT } = sourceApi;
    const POSITION_ORDER = Object.freeze(['year','month','day','hour']);

    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const buildChartKey = (semanticModel = {}, synthesis = {}) => {
        const bridge = synthesis.qianliQuantitySemanticBridgeInventory || {};
        const stems = new Map((bridge.sourceSurfaceInventory?.stems || []).map((item) => [item.position, item.gan]));
        const branches = new Map((bridge.sourceSurfaceInventory?.branches || []).map((item) => [item.position, item.zhi]));
        const dayMasterGan = semanticModel?.strengthEvidence?.dayMaster?.gan || '';
        stems.set('day', dayMasterGan);
        const pillars = POSITION_ORDER.map((position) => ({ gan:stems.get(position) || '', zhi:branches.get(position) || '' }));
        if (pillars.some((item) => !item.gan || !item.zhi)) return null;
        return pillars.map((item) => item.gan + item.zhi).join('|');
    };

    const matchSourceCases = (chartKey) => freezeArray(
        SOURCE_CASES.filter((item) => chartKey && item.chartKeys.includes(chartKey)).map((item) => Object.freeze({
            caseId:item.id,
            chartKey,
            side:item.side,
            sourceQuantityLabel:item.sourceQuantityLabel,
            sourceCompositionTerm:item.sourceCompositionTerm,
            compositionBranchId:item.compositionBranchId,
            observationScope:item.observationScope,
            calibrationStatus:item.calibrationStatus,
            sourceEvidenceIds:item.sourceEvidenceIds,
            sourceCaseLabelReproduced:item.calibrationStatus === 'eligible-exact-source-label',
            projectClassificationAuthority:false,
            genericRuleEvidence:false,
            note:item.note
        }))
    );

    const buildCalibrationView = (semanticModel = {}, synthesis = {}) => {
        const chartKey = buildChartKey(semanticModel, synthesis);
        const matches = matchSourceCases(chartKey);
        const reproducible = matches.filter((item) => item.sourceCaseLabelReproduced);
        const blocked = matches.filter((item) => !item.sourceCaseLabelReproduced);
        const status = reproducible.length
            ? 'matched-exact-source-case-label-only'
            : blocked.length
                ? 'matched-source-case-calibration-blocked'
                : 'no-exact-source-case';
        return Object.freeze({
            chartKey,
            status,
            matchedCases:matches,
            reproducibleSourceCaseLabels:freezeArray(reproducible.map((item) => Object.freeze({
                caseId:item.caseId,
                side:item.side,
                sourceQuantityLabel:item.sourceQuantityLabel,
                sourceCompositionTerm:item.sourceCompositionTerm,
                projectClassificationAuthority:false
            }))),
            blockedCaseIds:freezeArray(blocked.map((item) => item.caseId)),
            projectQuantityClassification:null,
            genericRuleStatus:'not-defined',
            universalThreshold:null,
            universalRatioRule:null,
            universalBranchInclusionRule:null,
            sourceCaseReproductionOnly:true
        });
    };

    const makeClaim = () => Object.freeze({
        id:'SC-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT',
        claimKey:'qianli.quantity-classification.source-case-calibration-contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCaseCount:SOURCE_CASES.length,
            calibrationConstraintCount:CALIBRATION_CONSTRAINTS.length,
            exactSourceCaseLabelsReproducible:true,
            exactSourceCaseLabelIsProjectClassification:false,
            genericManyFewRuleDefined:false,
            universalNumericThresholdDefined:false,
            universalRatioRuleDefined:false,
            universalBranchInclusionRuleDefined:false,
            hiddenStemNumericWeightDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(unique([
            ...SOURCE_CASES.flatMap((item) => item.sourceEvidenceIds || []),
            ...CALIBRATION_CONSTRAINTS.flatMap((item) => item.sourceEvidenceIds || [])
        ])),
        rationale:'《千里命稿》可冻结多个命例级多／少标签，但不同命例实际采用的观察语境并不统一，且存在人元修正与来源完整性 blocker；因此只能建立 exact-source case calibration，不能建立通用阈值。',
        boundary:'resolved 只表示 case registry 与 generalization blocker 已明确，不表示任意命盘可以执行 many/few classification。'
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id,
        kind:'aggregation',
        scope,
        status,
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds),
        ruleId:RULE_ID,
        statement,
        boundary
    });

    const rebuildClassificationRuleDependency = (base) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT',
                'SD-QIANLI-QUANTITY-GENERALIZATION-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            acceptedAutomaticClassifier:null,
            statement:'命例级 source labels 已可复现，但尚无来源支持的规则把任意 evidence inventory 泛化为多／少。',
            boundary:'不得从校准案例反推固定 item count、比例、hidden-stem 权重、月支排除式或多数表决。'
        });
    };

    const rebuildQuantityDependency = (base, id, side) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            sourceCaseReproductionAvailable:true,
            acceptedAutomaticClassifier:null,
            statement:side === 'support'
                ? '多／少帮扶已有 exact-source case calibration，但任意命盘 classifier 仍未定义。'
                : '多／少克泄已有 exact-source case calibration，但任意命盘 classifier 仍未定义。',
            boundary:'source-case label 只能复现原书命例，不得写入项目 quantity classification。'
        });
    };

    const buildDependencies = (base) => Object.freeze([
        makeDependency({
            id:'SD-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT',
            scope:'qianli-many-few-source-case-calibration',
            status:'resolved',
            statement:'《千里命稿》明确命例的多／少来源标签、观察语境与 blocker 已冻结为 exact-source case calibration contract。',
            boundary:'该依赖只授权复现来源命例标签，不授权通用分类。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-EVIDENCE-INVENTORY-COVERAGE'],
            resolvedByClaimIds:['SC-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-GENERALIZATION-RULE',
            scope:'qianli-many-few-cross-case-generalization-rule',
            status:'unresolved',
            statement:'现有来源案例没有给出跨命例一致的数量边界、比例规则或统一地支计入法；人元还能修正表层力量。',
            boundary:'除非新增来源证据明确说明 generalization semantics，否则保持 unresolved。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT']
        }),
        rebuildClassificationRuleDependency(base),
        rebuildQuantityDependency(base, 'SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION', 'support'),
        rebuildQuantityDependency(base, 'SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION', 'restraint-drain')
    ]);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const calibrationView = buildCalibrationView(semanticModel, base);
        const claim = makeClaim();
        const newDependencies = buildDependencies(base);
        const replacedIds = new Set(newDependencies.map((item) => item.id));
        const claims = Object.freeze([...(base.claims || []), claim]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...newDependencies
        ]);
        const conflicts = typeof priorSynthesisApi?.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi?.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            qianliQuantityCaseCalibrationCases:SOURCE_CASES,
            qianliQuantityCaseCalibrationConstraints:CALIBRATION_CONSTRAINTS,
            qianliQuantityCaseCalibrationContract:CONTRACT,
            qianliQuantityCaseCalibrationView:calibrationView,
            qianliQuantityCaseCalibrationRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Quantity Case Calibration v0.1 只复现《千里命稿》明确命例的 source-case label；该标签没有 project classification authority。',
                '多／少命例的观察语境并不统一：表层四柱、月令分层、天干帮扶与年日时支气会在不同命例中分别承担说明职责。',
                '人元能够改变表层力量，但最重／次重／稍轻没有数字换算，因此简单计数与固定权重都不能作为 generalization fallback。',
                '存在命例异文或正文与盘面不一致时，保留来源标签但退出通用公式校准。',
                'Generalization Rule 与两个 quantity classifier 继续 unresolved；Strength Synthesis 与 Assessment 不得因此启动。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildQianliQuantityCaseCalibrationView:buildCalibrationView
    });

    GuiJia.baziQianliQuantityCaseCalibration = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_CASES,
        CALIBRATION_CONSTRAINTS,
        CONTRACT,
        buildChartKey,
        matchSourceCases,
        buildCalibrationView,
        buildDependencies,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);