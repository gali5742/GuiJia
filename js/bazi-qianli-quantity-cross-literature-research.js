(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityCrossLiteratureResearch?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliQuantityCrossLiteratureSource) {
        document.write('<script src="./js/bazi-qianli-quantity-cross-literature-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziQianliQuantityCrossLiteratureSource || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!sourceApi || !priorSynthesisApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH-001';
    const { SOURCES, EVIDENCE, CASES, FINDINGS, CONTRACT } = sourceApi;

    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const buildResearchView = (synthesis = {}) => {
        const chartKey = synthesis.qianliQuantityCaseCalibrationView?.chartKey || null;
        const matchedCases = CASES.filter((item) => chartKey && item.chartKey === chartKey);
        return Object.freeze({
            status:'cross-literature-semantic-direction-supported-no-classifier',
            chartKey,
            matchedResearchCases:freezeArray(matchedCases),
            sourceIds:freezeArray(Object.values(SOURCES).map((item) => item.id)),
            evidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
            findings:FINDINGS,
            semanticDirection:'contextual-relative-force',
            semanticDirectionStatus:'resolved-research-level',
            equalItemCountingAccepted:false,
            qualitativeForceHierarchyRequired:true,
            contextualForceEvidenceModelStatus:'unresolved',
            executableGeneralizationRuleStatus:'unresolved',
            projectQuantityClassification:null,
            automaticClassifier:null
        });
    };

    const makeClaim = () => Object.freeze({
        id:'SC-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH',
        claimKey:'qianli.quantity-classification.cross-literature-research',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            sourceCount:Object.keys(SOURCES).length,
            evidenceCount:EVIDENCE.length,
            researchCaseCount:CASES.length,
            semanticDirection:'contextual-relative-force',
            equalItemCountingAccepted:false,
            qualitativeForceHierarchyRequired:true,
            seasonalContextRequired:true,
            branchRootQualityRequired:true,
            interactionContextRequired:true,
            universalNumericThresholdDefined:false,
            executableGeneralizationRuleDefined:false,
            automaticClassifierDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        rationale:'《命理约言》《神峰通考》《滴天髓阐微》《三命通会》及其所录《玉井奥诀》《元理赋》在不同表述中共同要求考察党势、根气、轻重、月令与交互状态；其中“干多不如根重”“当论多寡，分轻重也”等证据直接排除了等值条目计数。',
        boundary:'research claim resolved 只表示跨文献语义方向已收敛为 contextual-relative-force；项目仍缺可审计的 contextual-force evidence model，因此不产生 many/few classification。'
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

    const rebuildGeneralizationRule = (base) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-QIANLI-QUANTITY-GENERALIZATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-QIANLI-QUANTITY-GENERALIZATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-GENERALIZATION-SEMANTIC-DIRECTION',
                'SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            semanticDirection:'contextual-relative-force',
            acceptedAutomaticClassifier:null,
            statement:'跨文献研究已把 generalization 的语义方向收敛为“上下文相对力量”，但项目尚未定义如何从月令、根气、党势、轻重与交互状态构成可审计的 contextual-force evidence model。',
            boundary:'不得把 semantic direction 已明确误写成 classifier 已明确；更不得退回固定 item count、比例阈值或数字权重。'
        });
    };

    const rebuildClassificationRule = (base) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-QIANLI-QUANTITY-CLASSIFICATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-GENERALIZATION-RULE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            semanticDirection:'contextual-relative-force',
            acceptedAutomaticClassifier:null,
            statement:'many/few 的跨文献语义方向已明确，但没有 contextual-force evidence model 与映射规则，故项目分类器仍未定义。',
            boundary:'研究层的“相对力量”不得直接写成多帮扶／少帮扶／多克泄／少克泄。'
        });
    };

    const buildDependencies = (base) => Object.freeze([
        makeDependency({
            id:'SD-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH',
            scope:'qianli-many-few-cross-literature-source-research',
            status:'resolved',
            statement:'跨《命理约言》《神峰通考》《滴天髓阐微》《三命通会》及其所录早期文本的 quantity/force 语义研究已完成第一轮。',
            boundary:'解决的是来源语义共识，不解决项目执行分类。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CASE-CALIBRATION-CONTRACT'],
            resolvedByClaimIds:['SC-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-GENERALIZATION-SEMANTIC-DIRECTION',
            scope:'qianli-many-few-generalization-semantic-direction',
            status:'resolved',
            statement:'跨来源共同支持“多／少”为受月令、党势、根气、轻重及交互状态制约的 contextual-relative-force 描述，而非 raw item count。',
            boundary:'semantic direction resolved 不等于 evidence model 或 classifier resolved。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH'],
            resolvedByClaimIds:['SC-QIANLI-QUANTITY-CROSS-LITERATURE-RESEARCH']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL',
            scope:'qianli-contextual-relative-force-evidence-model',
            status:'unresolved',
            statement:'尚缺把项目现有月令、根角色、支气、visible contribution、bearing/interaction 等事实组织成非数值、可追溯 contextual-force evidence model 的规则。',
            boundary:'不得用自造权重补齐；根、支、明干、藏干与交互状态也不得等值化。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-GENERALIZATION-SEMANTIC-DIRECTION']
        }),
        rebuildGeneralizationRule(base),
        rebuildClassificationRule(base)
    ]);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const researchView = buildResearchView(base);
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
            qianliQuantityCrossLiteratureSources:SOURCES,
            qianliQuantityCrossLiteratureEvidence:EVIDENCE,
            qianliQuantityCrossLiteratureCases:CASES,
            qianliQuantityCrossLiteratureFindings:FINDINGS,
            qianliQuantityCrossLiteratureContract:CONTRACT,
            qianliQuantityCrossLiteratureResearchView:researchView,
            qianliQuantityCrossLiteratureRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Cross-Literature Research v0.1 已将 many/few 的 generalization semantic direction 收敛为 contextual-relative-force，而不是 raw item count。',
                '《滴天髓阐微》“干多不如根重”与《三命通会》“当论多寡，分轻重也”共同阻止等值计数与自造数字权重。',
                '《命理约言》《神峰通考》的命例说明失令/得令都可能被党势改变，因此月令必须保留为独立上下文而不能单轴决定。',
                '下一 blocker 是 Contextual Force Evidence Model：先组织可追溯的非数值力量证据，再讨论 generalization rule。',
                'Generalization Rule、Quantity Classification 与最终 Assessment 继续 unresolved/not-evaluated。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildQianliQuantityCrossLiteratureResearchView:buildResearchView
    });

    GuiJia.baziQianliQuantityCrossLiteratureResearch = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        CASES,
        FINDINGS,
        CONTRACT,
        buildResearchView,
        buildDependencies,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForceEvidence) {
        document.write('<script src="./js/bazi-contextual-force-evidence.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);
