(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziClashRescueContext?.installed) return;

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const preconditionsApi = GuiJia.baziClashPreconditions || null;
    const baziCore = GuiJia.baziCore || {};

    const CLASH_RESCUE_CONTEXT_VERSION = '0.1';
    const CLASH_RESCUE_CONTEXT_RULE_ID = 'BAZI-STRENGTH-CLASH-RESCUE-CONTEXT-001';

    const dimensionStatuses = preconditionsApi?.dimensionStatuses || Object.freeze({
        UNRESOLVED:'unresolved', RESOLVED:'resolved', NOT_APPLICABLE:'not-applicable'
    });
    const dimensionPreferences = preconditionsApi?.dimensionPreferences || Object.freeze({
        ROOT_SIDE:'root-side', COUNTERPART_SIDE:'counterpart-side', EQUIVALENT:'equivalent'
    });

    const SOURCE_PATTERN = Object.freeze({
        id:'DTS-YIN-SHEN-HAI-RESCUE-001',
        pair:Object.freeze(['寅','申']),
        targetZhi:'寅',
        clashZhi:'申',
        rescueZhi:'亥',
        requiredRelationCode:'BRANCH_SIX_HARMONY',
        sourceTerm:'又得亥解申冲',
        mechanismTerm:'泄金生木',
        scope:'source-example-only'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({ source:'《滴天髓阐微·地支》', term:'必先察其衰旺，四柱有无解救，或抑冲，或助泄，观其大势' }),
        Object.freeze({ source:'《滴天髓阐微》命例', term:'壬申 辛亥 辛酉 庚寅：虽用寅木之财，却喜亥水，泄金生木……又得亥解申冲' }),
        Object.freeze({ source:'《滴天髓阐微·地支》命例', term:'庚寅 壬午 丁卯 癸卯：此则有水，遇火劫有救' }),
        Object.freeze({ source:'《滴天髓阐微·干支总论·相战》', term:'必得合神有力，会神成局，息其动气……天地交战，虽有合神会神，亦不息其动气' })
    ]);

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);
    const pairContains = (root = {}, counterpart = {}, a, b) =>
        (root.zhi === a && counterpart.zhi === b) || (root.zhi === b && counterpart.zhi === a);

    const getStructureContexts = (semanticModel = {}) => semanticModel.strengthEffects?.branchStructureContexts || [];

    const findHarmonyContext = (semanticModel = {}, targetSide = {}, rescueZhi = '') => {
        const clashIndices = new Set([targetSide?.pillarIndex].filter(Number.isInteger));
        return getStructureContexts(semanticModel).find((context) => {
            if (context?.relationCode !== SOURCE_PATTERN.requiredRelationCode) return false;
            const participants = context.participants || [];
            const targetParticipant = participants.find((item) => item.pillarIndex === targetSide?.pillarIndex && item.zhi === targetSide?.zhi);
            const rescueParticipant = participants.find((item) => item.zhi === rescueZhi && !clashIndices.has(item.pillarIndex));
            return !!targetParticipant && !!rescueParticipant;
        }) || null;
    };

    const collectConcurrentContextRefs = (semanticModel = {}, participantIndices = []) => {
        const indices = new Set(participantIndices.filter(Number.isInteger));
        return freezeArray(unique(getStructureContexts(semanticModel)
            .filter((context) => (context.participants || []).some((item) => indices.has(item.pillarIndex)))
            .map((context) => context.structureRef)));
    };

    const buildYinShenHaiRescueSignal = (record = {}, semanticModel = {}) => {
        const root = record.rootSide || {};
        const counterpart = record.counterpartSide || {};
        if (!pairContains(root, counterpart, SOURCE_PATTERN.targetZhi, SOURCE_PATTERN.clashZhi)) {
            return Object.freeze({
                status:'not-applicable',
                preference:null,
                reasonCode:'no-direct-source-rescue-pattern',
                pattern:SOURCE_PATTERN
            });
        }

        const targetSide = root.zhi === SOURCE_PATTERN.targetZhi ? root : counterpart;
        const clashSide = root.zhi === SOURCE_PATTERN.clashZhi ? root : counterpart;
        const preference = targetSide === root ? dimensionPreferences.ROOT_SIDE : dimensionPreferences.COUNTERPART_SIDE;
        const harmonyContext = findHarmonyContext(semanticModel, targetSide, SOURCE_PATTERN.rescueZhi);
        const clashIndices = [root.pillarIndex, counterpart.pillarIndex].filter(Number.isInteger);
        const concurrentContextRefs = collectConcurrentContextRefs(semanticModel, clashIndices);
        const base = {
            pattern:SOURCE_PATTERN,
            targetZhi:SOURCE_PATTERN.targetZhi,
            clashZhi:SOURCE_PATTERN.clashZhi,
            rescueZhi:SOURCE_PATTERN.rescueZhi,
            targetPillarIndex:targetSide.pillarIndex,
            clashPillarIndex:clashSide.pillarIndex,
            harmonyStructureRef:harmonyContext?.structureRef || '',
            concurrentContextRefs,
            elementFlow:Object.freeze({
                fromZhi:SOURCE_PATTERN.clashZhi,
                fromElement:baziCore.getWuXing?.(SOURCE_PATTERN.clashZhi) || '金',
                viaZhi:SOURCE_PATTERN.rescueZhi,
                viaElement:baziCore.getWuXing?.(SOURCE_PATTERN.rescueZhi) || '水',
                toZhi:SOURCE_PATTERN.targetZhi,
                toElement:baziCore.getWuXing?.(SOURCE_PATTERN.targetZhi) || '木',
                sourceTerm:SOURCE_PATTERN.mechanismTerm,
                interpretation:'source-example-only'
            })
        };

        if (!Number.isInteger(targetSide.pillarIndex) || !Number.isInteger(clashSide.pillarIndex)) {
            return Object.freeze({ ...base, status:'unresolved', preference:null, reasonCode:'clash-participant-provenance-incomplete' });
        }

        if (!harmonyContext) {
            return Object.freeze({
                ...base,
                status:'not-matched',
                preference:null,
                reasonCode:'source-rescue-branch-or-harmony-missing',
                statement:'寅申冲已识别，但当前没有命中任氏“亥解申冲”这一直接命例模式。',
                boundary:'未命中该命例只表示这一条 source-specific rescue pattern 不成立；不得据此判定“四柱无解救”，也不得反推申方占优。'
            });
        }

        return Object.freeze({
            ...base,
            status:'resolved',
            preference,
            reasonCode:'source-example-hai-resolves-shen-clash',
            statement:'任氏命例明确称“亥解申冲”，并以“泄金生木”说明该局亥水的作用；本层仅据此为寅方生成 rescue-context preference。',
            boundary:'该规则只覆盖寅申冲见亥且寅亥六合这一直接命例模式；不得推广为“六合皆解冲”，也不得把亥水出现重复累计为多份力量。'
        });
    };

    const makeDimension = ({ record, signal }) => Object.freeze({
        id:`CD-${record.id || 'UNKNOWN'}-RESCUE-CONTEXT`,
        key:'support-restraint-rescue-context',
        required:true,
        status:signal.status === 'resolved' ? dimensionStatuses.RESOLVED : dimensionStatuses.UNRESOLVED,
        preference:signal.status === 'resolved' ? signal.preference : null,
        reasonCode:signal.status === 'resolved' ? signal.reasonCode : 'generic-rescue-context-unresolved',
        observations:Object.freeze({
            sourceSignal:signal,
            sourceTerms:Object.freeze(['解救','抑冲','助泄']),
            genericMechanisms:Object.freeze({
                suppressClash:'unresolved',
                assistDrain:'unresolved'
            }),
            genericHarmonyRescue:false,
            genericCombinationRescue:false
        }),
        sourceBasis:Object.freeze(SOURCE_BASIS.map((item) => Object.freeze({ ...item }))),
        statement:signal.status === 'resolved'
            ? signal.statement
            : '原典明确要求继续观察“有无解救，或抑冲，或助泄”，但当前没有可安全泛化的统一关系→解救规则；本局只检查已核证的直接命例模式。',
        boundary:signal.status === 'resolved'
            ? signal.boundary
            : '普通五行生克、六合、三合、三会、刑害破或单一“有某五行”均不得在无独立规则时自动解释为解救；source pattern 未命中也不等于“无救”。'
    });

    const updateContextPrecondition = (record = {}, dimension = {}) => Object.freeze((record.preconditions || []).map((item) => {
        if (item.key !== 'support-restraint-rescue-context') return item;
        return Object.freeze({
            ...item,
            status:dimension.status,
            observations:Object.freeze({
                ...(item.observations || {}),
                rescueContextDimensionId:dimension.id,
                rescueContextSignal:dimension.observations?.sourceSignal || null
            }),
            statement:dimension.statement,
            boundary:dimension.boundary
        });
    }));

    const mergeRescueDimension = (record = {}, semanticModel = {}) => {
        const signal = buildYinShenHaiRescueSignal(record, semanticModel);
        const dimension = makeDimension({ record, signal });
        const existing = (record.comparisonDimensions || []).filter((item) => item.key !== 'support-restraint-rescue-context');
        const dimensions = Object.freeze([...existing, dimension]);
        const comparison = typeof preconditionsApi?.compareSemanticDimensions === 'function'
            ? preconditionsApi.compareSemanticDimensions(dimensions)
            : record.comparison;
        return Object.freeze({
            ...record,
            preconditions:updateContextPrecondition(record, dimension),
            comparisonDimensions:dimensions,
            comparison,
            resolutionStatus:comparison?.status === 'resolved' ? 'resolved' : 'unresolved',
            statement:dimension.status === dimensionStatuses.RESOLVED
                ? '解救上下文已有直接命例规则解析；六冲整体仍必须等待其余必要维度共同完成非补偿比较。'
                : record.statement,
            boundary:'rescue-context resolved 只解决外围解救这一维；不得单独生成“冲解”“根保住”“根拔”或最终根效力。'
        });
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-CLASH-RESCUE-CONTEXT-CONTRACT',
        claimKey:'root.six-clash.rescue-context-contract',
        status:'resolved',
        ruleId:CLASH_RESCUE_CONTEXT_RULE_ID,
        value:Object.freeze({
            sourceTerms:Object.freeze(['解救','抑冲','助泄']),
            role:'independent-required-comparison-dimension',
            genericSuppressClashRule:'unresolved',
            genericAssistDrainRule:'unresolved',
            genericHarmonyRescue:false,
            genericCombinationRescue:false,
            directSourcePatterns:Object.freeze([SOURCE_PATTERN.id]),
            numericAggregation:false,
            failedPatternImpliesNoRescue:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'任氏在六冲总论中把“有无解救，或抑冲，或助泄”列为察旺衰之后仍须继续观察的条件；另有命例直接称“亥解申冲”。因此先把解救建立为独立必要维度，并只执行有原文直证的窄模式。',
        boundary:'“抑冲”“助泄”当前保留为原典机制词汇，不自行拆成全局五行算法；同书亦明言合会有时能息动、有时不能，故不得把六合／三合／三会存在自动等同于解冲。'
    });

    const makePatternClaim = (record, dimension, index) => Object.freeze({
        id:`SC-CLASH-RESCUE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`root.six-clash.${record.structureRef || record.id || index}.rescue-context`,
        status:'resolved',
        ruleId:CLASH_RESCUE_CONTEXT_RULE_ID,
        value:dimension.preference,
        sourceEffectIds:freezeArray(record.sourceEffectIds || []),
        sourceRefs:freezeArray(unique([
            record.structureRef,
            dimension.observations?.sourceSignal?.harmonyStructureRef
        ])),
        dependencyIds:Object.freeze(['SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT']),
        rationale:dimension.statement,
        boundary:dimension.boundary
    });

    const rebuildRescueDependency = (base = {}, records = [], claimIds = []) => {
        const dimensions = records.map((record) => (record.comparisonDimensions || []).find((item) => item.key === 'support-restraint-rescue-context')).filter(Boolean);
        const allResolved = dimensions.length > 0 && dimensions.every((item) => item.status === dimensionStatuses.RESOLVED);
        return Object.freeze({
            id:'SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT',
            kind:'interaction',
            scope:'root-six-clash-rescue-context',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
            sourceRefs:Object.freeze(unique(records.flatMap((record) => {
                const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'support-restraint-rescue-context');
                return [record.structureRef, dimension?.observations?.sourceSignal?.harmonyStructureRef];
            }))),
            resolvedByClaimIds:Object.freeze(records.length ? claimIds : ['SC-CLASH-RESCUE-CONTEXT-CONTRACT']),
            ruleId:CLASH_RESCUE_CONTEXT_RULE_ID,
            statement:!records.length
                ? '当前没有根 actor 参与六冲，解救上下文在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 的 rescue-context 已由直接 source-specific pattern 解析。'
                    : '至少一个 root clash 尚无已核证的解救／抑冲／助泄规则可解析，rescue-context 保持 unresolved。',
            boundary:'不得用关系数量、五行数量、合会数量或自定权重填补未解析的解救机制。'
        });
    };

    const rebuildComparisonDependency = (base = {}, records = [], rescueDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CLASH-RELATIVE-STATE-COMPARISON') || {};
        const allResolved = records.length > 0 && records.every((record) => record.comparison?.status === 'resolved');
        return Object.freeze({
            ...current,
            id:'SD-CLASH-RELATIVE-STATE-COMPARISON',
            status:records.length ? (allResolved ? 'resolved' : 'unresolved') : 'resolved',
            dependsOnDependencyIds:Object.freeze(unique([
                ...(current.dependsOnDependencyIds || []),
                rescueDependency.id
            ])),
            statement:!records.length
                ? '当前没有根 actor 参与六冲，相对状态比较在本局为 not-applicable。'
                : allResolved
                    ? '本局所有 root clash 的必要语义维度均已解析，可形成非补偿式相对状态 comparison。'
                    : '至少一个 root clash 仍有必要语义维度未解析；相对状态 comparison 继续 insufficient。',
            boundary:'解救维度与季节地位、非季节力量并列为必要维度；不得以其中任何一维补偿另一维的 unresolved。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({
                ...base,
                rescueContextRuleIds:Object.freeze([])
            });
        }

        const records = Object.freeze((base.clashPreconditionRecords || []).map((record) => mergeRescueDimension(record, semanticModel)));
        const existingClaimKeys = new Set((base.claims || []).map((item) => item.claimKey));
        const patternClaims = records.flatMap((record, index) => {
            const dimension = (record.comparisonDimensions || []).find((item) => item.key === 'support-restraint-rescue-context');
            const claimKey = `root.six-clash.${record.structureRef || record.id || index}.rescue-context`;
            return dimension?.status === dimensionStatuses.RESOLVED && !existingClaimKeys.has(claimKey)
                ? [makePatternClaim(record, dimension, index)]
                : [];
        });
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...patternClaims]);
        const rescueDependency = rebuildRescueDependency(base, records, patternClaims.map((item) => item.id));
        const comparisonDependency = rebuildComparisonDependency(base, records, rescueDependency);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => ![
                'SD-CLASH-SUPPORT-RESTRAINT-RESCUE-CONTEXT',
                'SD-CLASH-RELATIVE-STATE-COMPARISON'
            ].includes(item.id)),
            comparisonDependency,
            rescueDependency
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
            clashPreconditionRecords:records,
            rescueContextRuleIds:Object.freeze([CLASH_RESCUE_CONTEXT_RULE_ID]),
            rescueContextContract:Object.freeze({
                version:CLASH_RESCUE_CONTEXT_VERSION,
                sourceTerms:Object.freeze(['解救','抑冲','助泄']),
                genericMechanismsResolved:false,
                directSourcePatterns:Object.freeze([SOURCE_PATTERN.id]),
                genericHarmonyRescue:false,
                genericCombinationRescue:false
            }),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '六冲中的解救、抑冲、助泄是独立上下文条件，不得由普通五行生克或关系存在自动推定。',
                '“亥解申冲”只按原典直接命例形成寅申冲的 source-specific rescue signal，不推广为六合皆解冲。',
                'direct rescue pattern 未命中不等于“四柱无解救”，更不得反推冲方 preference。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis
        });
    }

    GuiJia.baziClashRescueContext = Object.freeze({
        installed:true,
        CLASH_RESCUE_CONTEXT_VERSION,
        CLASH_RESCUE_CONTEXT_RULE_ID,
        SOURCE_PATTERN,
        SOURCE_BASIS,
        buildYinShenHaiRescueSignal,
        mergeRescueDimension,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
