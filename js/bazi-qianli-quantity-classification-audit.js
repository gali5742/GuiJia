(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliQuantityClassificationAudit?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliQuantityClassificationSource) {
        document.write('<script src="./js/bazi-qianli-quantity-classification-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziQianliQuantityClassificationSource || null;
    if (!sourceApi) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-QIANLI-QUANTITY-SOURCE-AUDIT-001';
    const { EVIDENCE, AUDIT_CONCLUSIONS } = sourceApi;

    const CONTRACT = Object.freeze({
        id:'QIANLI-QUANTITY-CLASSIFICATION-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceQuantityLanguageObserved:true,
        universalNumericThresholdDefined:false,
        directContributionCountIsNotSourceQuantity:true,
        surfaceStemBranchEvidenceObserved:true,
        branchQiAxisOverlapObserved:true,
        hiddenModifierEvidenceObserved:true,
        hiddenModifierNumericWeightDefined:false,
        distributionIncludedInRestraintDrain:false,
        sourceVariantRequiresCaution:true,
        resolverEnabled:false,
        statement:'《千里命稿》确实使用“多、少、繁、五木、一金”等数量语言，但现有原文没有给出一个可普遍执行的数字阈值；同时支可在“帮扶”和“支得气”语境中分层出现，人元又可改变表层力量，因此不能把当前 realized contribution 条数直接当作原书的多／少分类。',
        boundary:'v0.1 只核定 quantity semantics 的来源范围与 blocker，不生成多帮扶、少帮扶、多克泄、少克泄。'
    });

    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const buildAuditView = () => Object.freeze({
        evidenceIds:freezeArray(EVIDENCE.map((item) => item.id)),
        supportEvidenceIds:freezeArray(EVIDENCE.filter((item) => item.side === 'support').map((item) => item.id)),
        restraintDrainEvidenceIds:freezeArray(EVIDENCE.filter((item) => item.side === 'restraint-drain').map((item) => item.id)),
        hiddenModifierEvidenceIds:freezeArray(EVIDENCE.filter((item) => item.side === 'hidden-modifier').map((item) => item.id)),
        thresholdCalibrationEligibleEvidenceIds:freezeArray(EVIDENCE.filter((item) => ['example-only','relative-example-only'].includes(item.thresholdEvidence)).map((item) => item.id)),
        thresholdCalibrationBlockedEvidenceIds:freezeArray(EVIDENCE.filter((item) => item.thresholdEvidence === 'inadmissible-for-threshold-calibration').map((item) => item.id)),
        conclusions:AUDIT_CONCLUSIONS,
        resolverStatus:'not-defined',
        universalThreshold:null,
        sourceQuantityScope:'contextual-four-pillar-force-description-with-branch-qi-and-hidden-modifier-interaction',
        candidateBridgeInput:'source-quantity-evidence-inventory',
        directContributionCountAccepted:false
    });

    const makeClaim = (auditView) => Object.freeze({
        id:'SC-QIANLI-QUANTITY-SOURCE-AUDIT',
        claimKey:'qianli.quantity-classification.source-audit',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            evidenceCount:auditView.evidenceIds.length,
            universalNumericThresholdDefined:false,
            directContributionCountAccepted:false,
            hiddenModifierNumericWeightDefined:false,
            distributionIncludedInRestraintDrain:false,
            recommendedNextBridge:auditView.conclusions.recommendedNextBridge
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'强弱篇、人元篇与五行篇共同证明数量语言存在，但只形成命例比较、相对描述与人元层级，没有提供统一数字阈值或 contribution-count 等价规则。',
        boundary:'source audit resolved 只表示“不该怎样量化”与下一桥接层已明确，不表示 quantity classification 已完成。'
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

    const rebuildQuantityDependency = (base, id, side) => {
        const current = (base.dependencies || []).find((item) => item.id === id) || {};
        const support = side === 'support';
        return Object.freeze({
            ...current,
            id,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-QIANLI-QUANTITY-SOURCE-SCOPE-AUDIT',
                'SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            sourceAuditStatus:'resolved-no-universal-threshold',
            acceptedAutomaticClassifier:null,
            statement:support
                ? '“多帮扶／少帮扶”来源语言已核实，但原书未给统一数值阈值；现有 realized support contribution 条数也不能直接等价为来源多寡。'
                : '“多克泄／少克泄”来源语言已核实，但原书未给统一数值阈值；现有 restraint + drain contribution 条数也不能直接等价为来源多寡。',
            boundary:support
                ? '下一步需先建立 source-quantity evidence inventory，处理表层干支、月令／支气分层与人元 modifier，再讨论分类器。'
                : '下一步需先建立 source-quantity evidence inventory；distribution/被分继续排除在克泄字面之外，人元 modifier 不得按未定义权重折算。'
        });
    };

    const buildDependencies = (base) => Object.freeze([
        makeDependency({
            id:'SD-QIANLI-QUANTITY-SOURCE-SCOPE-AUDIT',
            scope:'qianli-many-few-source-scope-audit',
            status:'resolved',
            statement:'《千里命稿》数量语言的来源范围已审计：有明确数量描述，但观察口径会与支气、人元力量层交织，且没有统一数字阈值。',
            boundary:'本依赖解决 source scope，不解决多／少分类。',
            resolvedByClaimIds:['SC-QIANLI-QUANTITY-SOURCE-AUDIT']
        }),
        makeDependency({
            id:'SD-QIANLI-QUANTITY-SEMANTIC-BRIDGE',
            scope:'qianli-source-quantity-to-project-evidence-bridge',
            status:'unresolved',
            statement:'尚缺“原书四柱数量／力量描述 → 项目可审计 evidence inventory”的语义桥。',
            boundary:'不得直接采用 realized contribution count、表层五行 count、藏干 count 或任一混合计数作为兜底。',
            dependsOnDependencyIds:['SD-QIANLI-QUANTITY-SOURCE-SCOPE-AUDIT']
        }),
        rebuildQuantityDependency(base, 'SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION', 'support'),
        rebuildQuantityDependency(base, 'SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION', 'restraint-drain')
    ]);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const auditView = buildAuditView();
        const claim = makeClaim(auditView);
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
            qianliQuantityClassificationSourceEvidence:EVIDENCE,
            qianliQuantityClassificationAuditView:auditView,
            qianliQuantityClassificationAuditContract:CONTRACT,
            qianliQuantityClassificationAuditRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Quantity Source Audit v0.1 已确认原书使用数量语言，但没有可直接移植的统一数字阈值。',
                'realized Daymaster Contribution inventory 与《千里命稿》教学层“多帮扶／多克泄”不是同一语义层，必须先建立 source-quantity evidence bridge。',
                '表层干支数量、人元 modifier、支得气轴之间不得未经来源规则直接加总或加权。',
                '网络转录存在个别命例字形异文，相关例证不得用于阈值校准，除非回到可靠影印本核定。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildQianliQuantityClassificationAuditView:buildAuditView
        });
    }

    GuiJia.baziQianliQuantityClassificationAudit = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        EVIDENCE,
        AUDIT_CONCLUSIONS,
        buildAuditView,
        buildDependencies,
        extendSynthesis
    });

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliQuantitySemanticBridge) {
        document.write('<script src="./js/bazi-qianli-quantity-semantic-bridge.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliQuantityCaseCalibration) {
        document.write('<script src="./js/bazi-qianli-quantity-case-calibration.js?v=13.44.0"><\/script>');
    }
})(typeof window !== 'undefined' ? window : globalThis);