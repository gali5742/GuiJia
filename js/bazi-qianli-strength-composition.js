(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziQianliStrengthComposition?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziQianliStrengthCompositionSource) {
        document.write('<script src="./js/bazi-qianli-strength-composition-source.js?v=13.44.0"><\/script>');
    }

    const sourceApi = GuiJia.baziQianliStrengthCompositionSource || null;
    if (!sourceApi) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const {
        sourceTerms,
        SOURCE_BASIS,
        SOURCE_COMPOSITION_MODEL
    } = sourceApi;

    const QIANLI_STRENGTH_COMPOSITION_VERSION = '0.1';
    const QIANLI_STRENGTH_COMPOSITION_RULE_ID = 'BAZI-STRENGTH-QIANLI-COMPOSITION-001';

    const classificationStatuses = Object.freeze({
        RESOLVED:'resolved',
        UNRESOLVED:'unresolved'
    });

    const patternStatuses = Object.freeze({
        MATCHED:'matched-source-pattern',
        BLOCKED:'blocked-unresolved-source-condition',
        NOT_MATCHED:'not-matched-source-pattern'
    });

    const CONTRACT = Object.freeze({
        id:'QIANLI-STRENGTH-COMPOSITION-CONTRACT-001',
        version:QIANLI_STRENGTH_COMPOSITION_VERSION,
        inputLevel:'resolved-seasonal-axis-plus-contribution-inventory-plus-future-quantity-and-branch-qi-classifiers',
        outputLevel:'source-scoped-composition-pattern-evaluation',
        sourceConclusionCount:SOURCE_COMPOSITION_MODEL.length,
        sourceBranchCount:SOURCE_COMPOSITION_MODEL.reduce((sum, item) => sum + item.branches.length, 0),
        mediumStrongHasTwoBranches:true,
        mediumWeakHasTwoBranches:true,
        supportQuantityThresholdDefined:false,
        restraintDrainQuantityThresholdDefined:false,
        branchQiAggregationDefined:false,
        distributionIncludedInRestraintDrain:false,
        contributionCountIsNotQuantityClassification:true,
        sourcePatternMatchIsNotAssessment:true,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        scalarCollapse:false,
        finalAssessmentMapping:false,
        statement:'本层只把《千里命稿·强弱篇》六类强弱区别冻结为来源级组合模板。现阶段可以整理实际 contribution inventory，但不得把 contribution 条数直接解释成“多／少”，也不得把十二长生单项状态直接解释成“支得气／无气”。',
        boundary:'即使未来某条来源模板全部匹配，也只得到 source-scoped composition match；从来源术语“最强／中强／次强／最弱／中弱／次弱”到项目 Assessment strong/weak/balanced 的映射仍须另立规则。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const seasonalSourceClassification = (semanticModel = {}) => {
        const seasonal = (semanticModel?.strengthEffects?.effects || []).find((item) => item.category === 'seasonalContext');
        if (!seasonal || seasonal.status !== 'recognized') {
            return Object.freeze({ status:classificationStatuses.UNRESOLVED, value:null, sourceEffectIds:Object.freeze([]) });
        }
        if (seasonal.direction === 'seasonal-support') {
            return Object.freeze({ status:classificationStatuses.RESOLVED, value:'当令', sourceEffectIds:Object.freeze([seasonal.id].filter(Boolean)) });
        }
        if (seasonal.direction === 'seasonal-non-support') {
            return Object.freeze({ status:classificationStatuses.RESOLVED, value:'失令', sourceEffectIds:Object.freeze([seasonal.id].filter(Boolean)) });
        }
        return Object.freeze({ status:classificationStatuses.UNRESOLVED, value:null, sourceEffectIds:Object.freeze([seasonal.id].filter(Boolean)) });
    };

    const contributionInventory = (synthesis = {}) => {
        const records = synthesis.visibleStemDaymasterContributionRecords || [];
        const realized = records.filter((item) => item.contributionState === 'realized-daymaster-contribution-in-source-context');
        const byMeaning = (meaning) => freezeArray(realized.filter((item) => item.strengthMeaning === meaning).map((item) => item.id));
        const restraintIds = byMeaning('restraint');
        const drainIds = byMeaning('drain');
        return Object.freeze({
            realizedSupportContributionIds:byMeaning('support'),
            realizedRestraintContributionIds:restraintIds,
            realizedDrainContributionIds:drainIds,
            realizedDistributionContributionIds:byMeaning('distribution'),
            restraintDrainContributionIds:freezeArray(unique([...restraintIds, ...drainIds])),
            distributionExcludedFromRestraintDrain:true,
            statement:'这里只保存已兑现 contribution 的语义清单；清单长度不是“多帮扶／少帮扶／多克泄／少克泄”的分类器。'
        });
    };

    const buildSourceInputProfile = (semanticModel = {}, synthesis = {}) => {
        const seasonal = seasonalSourceClassification(semanticModel);
        const inventory = contributionInventory(synthesis);
        const branchQiEffects = (semanticModel?.strengthEffects?.effects || []).filter((item) => item.category === 'branchQiContext');
        return Object.freeze({
            seasonal,
            supportQuantity:Object.freeze({
                status:classificationStatuses.UNRESOLVED,
                value:null,
                candidateContributionIds:inventory.realizedSupportContributionIds,
                blocker:'missing-source-backed-many-few-support-classifier',
                boundary:'不得按 contribution 数量、天干数量或十神数量自行设置“多／少”阈值。'
            }),
            restraintDrainQuantity:Object.freeze({
                status:classificationStatuses.UNRESOLVED,
                value:null,
                candidateContributionIds:inventory.restraintDrainContributionIds,
                excludedDistributionContributionIds:inventory.realizedDistributionContributionIds,
                blocker:'missing-source-backed-many-few-restraint-drain-classifier',
                boundary:'“多克泄／少克泄”只观察克我与我生；我克之被分保持独立，不并入克泄数量分类。'
            }),
            branchQi:Object.freeze({
                status:classificationStatuses.UNRESOLVED,
                value:null,
                sourceEffectIds:freezeArray(branchQiEffects.map((item) => item.id)),
                observedStates:freezeArray(branchQiEffects.map((item) => `${item.position || ''}:${item.zhi || ''}:${item.state || ''}`)),
                blocker:'missing-year-day-hour-branch-qi-aggregation-resolver',
                boundary:'年、日、时支十二长生已记录，但不能逐项直接折成“支得气／支无气”。'
            }),
            contributionInventory:inventory
        });
    };

    const readInput = (profile = {}, key) => profile?.[key] || Object.freeze({ status:classificationStatuses.UNRESOLVED, value:null });

    const evaluateBranch = (branch = {}, profile = {}) => {
        const requirements = branch.requirements || {};
        const matchedConditionKeys = [];
        const blockedConditionKeys = [];
        const mismatchedConditionKeys = [];

        Object.entries(requirements).forEach(([key, expected]) => {
            const input = readInput(profile, key);
            if (input.status !== classificationStatuses.RESOLVED) {
                blockedConditionKeys.push(key);
                return;
            }
            if (input.value === expected) matchedConditionKeys.push(key);
            else mismatchedConditionKeys.push(key);
        });

        const status = mismatchedConditionKeys.length
            ? patternStatuses.NOT_MATCHED
            : blockedConditionKeys.length
                ? patternStatuses.BLOCKED
                : patternStatuses.MATCHED;

        return Object.freeze({
            branchId:branch.id,
            requirements:Object.freeze({ ...requirements }),
            status,
            matchedConditionKeys:freezeArray(matchedConditionKeys),
            blockedConditionKeys:freezeArray(blockedConditionKeys),
            mismatchedConditionKeys:freezeArray(mismatchedConditionKeys)
        });
    };

    const evaluateSourceComposition = (profile = {}) => Object.freeze(
        SOURCE_COMPOSITION_MODEL.map((entry) => {
            const branchEvaluations = entry.branches.map((branch) => evaluateBranch(branch, profile));
            const matchedBranchIds = branchEvaluations.filter((item) => item.status === patternStatuses.MATCHED).map((item) => item.branchId);
            const blockedBranchIds = branchEvaluations.filter((item) => item.status === patternStatuses.BLOCKED).map((item) => item.branchId);
            const status = matchedBranchIds.length
                ? patternStatuses.MATCHED
                : blockedBranchIds.length
                    ? patternStatuses.BLOCKED
                    : patternStatuses.NOT_MATCHED;
            return Object.freeze({
                id:`QSC-EVAL-${entry.id}`,
                sourceModelId:entry.id,
                sourceTerm:entry.sourceTerm,
                sourceFamily:entry.sourceFamily,
                status,
                matchedBranchIds:freezeArray(matchedBranchIds),
                blockedBranchIds:freezeArray(blockedBranchIds),
                branchEvaluations:freezeArray(branchEvaluations),
                assessmentConclusion:null,
                statement:status === patternStatuses.MATCHED
                    ? `来源条件完整匹配《千里命稿》“${entry.sourceTerm}”的一条构成分支；本层仅保存 source composition match。`
                    : status === patternStatuses.BLOCKED
                        ? `“${entry.sourceTerm}”至少一条来源构成分支仍受未解析条件阻断。`
                        : `当前已解析条件与“${entry.sourceTerm}”各构成分支均不匹配。`,
                boundary:'source composition match 不等于项目最终 strong / weak / balanced Assessment。'
            });
        })
    );

    const makeContractClaim = () => Object.freeze({
        id:'SC-QIANLI-STRENGTH-COMPOSITION-MODEL',
        claimKey:'qianli.strength-composition.model',
        status:'resolved',
        ruleId:QIANLI_STRENGTH_COMPOSITION_RULE_ID,
        value:Object.freeze({
            sourceConclusionCount:CONTRACT.sourceConclusionCount,
            sourceBranchCount:CONTRACT.sourceBranchCount,
            supportQuantityThresholdDefined:false,
            restraintDrainQuantityThresholdDefined:false,
            branchQiAggregationDefined:false,
            distributionIncludedInRestraintDrain:false,
            finalAssessmentMapping:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceContractId:SOURCE_BASIS.sourceContractId,
        sourceLocator:SOURCE_BASIS.sourceLocator,
        rationale:'《千里命稿·强弱篇》明确给出六类强弱区别的组合条件，因此可以先冻结来源模板；但“多／少”与“支得气／无气”的可执行分类仍不能由项目自行补阈值。',
        boundary:'模型 resolved 只表示来源结构已冻结，不表示任一真实命盘已完成来源分类或最终 Assessment。'
    });

    const makeInputClaim = (profile = {}) => Object.freeze({
        id:'SC-QIANLI-STRENGTH-COMPOSITION-INPUT',
        claimKey:'qianli.strength-composition.input-readiness',
        status:[profile.seasonal, profile.supportQuantity, profile.restraintDrainQuantity, profile.branchQi].every((item) => item.status === classificationStatuses.RESOLVED)
            ? 'resolved'
            : 'blocked',
        ruleId:QIANLI_STRENGTH_COMPOSITION_RULE_ID,
        value:Object.freeze({
            seasonal:profile.seasonal.value,
            supportQuantity:profile.supportQuantity.value,
            restraintDrainQuantity:profile.restraintDrainQuantity.value,
            branchQi:profile.branchQi.value,
            distributionIncludedInRestraintDrain:false
        }),
        sourceEffectIds:freezeArray(unique([
            ...(profile.seasonal.sourceEffectIds || []),
            ...(profile.branchQi.sourceEffectIds || [])
        ])),
        sourceRefs:Object.freeze([]),
        rationale:'来源模板的输入轴已经定义，但“多／少”与支气汇总仍缺独立 resolver。',
        boundary:'输入未 ready 时不得按当前 contribution 数量或十二长生字面状态猜测来源等级。'
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
        ruleId:QIANLI_STRENGTH_COMPOSITION_RULE_ID,
        statement,
        boundary
    });

    const buildDependencies = (profile = {}, evaluations = []) => {
        const fullyResolvedInputs = [profile.seasonal, profile.supportQuantity, profile.restraintDrainQuantity, profile.branchQi]
            .every((item) => item.status === classificationStatuses.RESOLVED);
        const matched = evaluations.filter((item) => item.status === patternStatuses.MATCHED);
        return Object.freeze([
            makeDependency({
                id:'SD-QIANLI-STRENGTH-COMPOSITION-MODEL',
                scope:'qianli-source-composition-contract',
                status:'resolved',
                statement:'《千里命稿·强弱篇》六类来源结论与八条条件分支已经冻结。',
                boundary:'来源模型存在不等于真实命盘可以完成分类。',
                resolvedByClaimIds:['SC-QIANLI-STRENGTH-COMPOSITION-MODEL']
            }),
            makeDependency({
                id:'SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION',
                scope:'many-few-support-classification',
                status:profile.supportQuantity.status,
                statement:'“多帮扶／少帮扶”尚缺来源支持的通用分类器。',
                boundary:'不得用 contribution 条数或固定数字阈值代替。',
                dependsOnDependencyIds:['SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE']
            }),
            makeDependency({
                id:'SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION',
                scope:'many-few-restraint-drain-classification',
                status:profile.restraintDrainQuantity.status,
                statement:'“多克泄／少克泄”尚缺来源支持的通用分类器。',
                boundary:'只观察 restraint + drain；distribution 不并入。',
                dependsOnDependencyIds:['SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE']
            }),
            makeDependency({
                id:'SD-QIANLI-STRENGTH-COMPOSITION-COVERAGE',
                scope:'qianli-source-composition-evaluation-coverage',
                status:fullyResolvedInputs && matched.length === 1 ? 'resolved' : 'unresolved',
                statement:fullyResolvedInputs
                    ? matched.length === 1
                        ? '来源输入已完整解析，并且恰有一个来源结论模式匹配。'
                        : '来源输入虽然完整，但尚未形成唯一来源结论模式；不得自行优先或多数裁决。'
                    : '至少一个来源必要输入仍未解析，因此 Strength Composition coverage 继续 unresolved。',
                boundary:'Coverage 不以证据数量决定；即使 resolved 也仍只是 source composition，不直接启动 Assessment。',
                dependsOnDependencyIds:[
                    'SD-QIANLI-STRENGTH-COMPOSITION-MODEL',
                    'SD-SEASONAL-HIERARCHY',
                    'SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE',
                    'SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION',
                    'SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION',
                    'SD-BRANCH-QI-AGGREGATION'
                ]
            })
        ]);
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const profile = buildSourceInputProfile(semanticModel, base);
        const evaluations = evaluateSourceComposition(profile);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), makeInputClaim(profile)]);
        const newDependencies = buildDependencies(profile, evaluations);
        const replacedIds = new Set(newDependencies.map((item) => item.id));
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
            qianliStrengthCompositionSourceBasis:SOURCE_BASIS,
            qianliStrengthCompositionModel:SOURCE_COMPOSITION_MODEL,
            qianliStrengthCompositionInputProfile:profile,
            qianliStrengthCompositionEvaluations:evaluations,
            qianliStrengthCompositionContract:CONTRACT,
            qianliStrengthCompositionRuleIds:Object.freeze([QIANLI_STRENGTH_COMPOSITION_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '《千里命稿》Strength Composition v0.1 只冻结六类来源结论与八条条件分支；不自行定义多／少阈值。',
                'realized contribution inventory 只是未来“多帮扶／多克泄”分类器的输入证据，条数本身不是分类结果。',
                'distribution / 被分保持独立，不并入原文“多克泄／少克泄”。',
                '年、日、时支十二长生尚未汇总为“支得气／支无气”，不得逐项字面替代。',
                'source composition match 与项目最终 strong / weak / balanced Assessment 之间仍保留独立映射边界。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildQianliStrengthCompositionInputProfile:buildSourceInputProfile,
            evaluateQianliStrengthComposition:evaluateSourceComposition
        });
    }

    GuiJia.baziQianliStrengthComposition = Object.freeze({
        installed:true,
        QIANLI_STRENGTH_COMPOSITION_VERSION,
        QIANLI_STRENGTH_COMPOSITION_RULE_ID,
        classificationStatuses,
        patternStatuses,
        sourceTerms,
        SOURCE_BASIS,
        SOURCE_COMPOSITION_MODEL,
        CONTRACT,
        seasonalSourceClassification,
        contributionInventory,
        buildSourceInputProfile,
        evaluateBranch,
        evaluateSourceComposition,
        buildDependencies,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
