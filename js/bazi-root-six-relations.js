(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootSixRelations?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const baseSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_SIX_RELATIONS_VERSION = '0.1';
    const ROOT_SIX_CLASH_RULE_ID = 'BAZI-STRENGTH-ROOT-SIX-CLASH-001';
    const ROOT_SIX_HARMONY_RULE_ID = 'BAZI-STRENGTH-ROOT-SIX-HARMONY-001';

    const RELATION_CONFIG = Object.freeze({
        BRANCH_SIX_CLASH:Object.freeze({
            kind:'six-clash',
            family:'冲',
            ruleId:ROOT_SIX_CLASH_RULE_ID,
            sourceBasis:Object.freeze([
                Object.freeze({ source:'《滴天髓·地支》', term:'旺者冲衰衰者拔，衰者冲旺旺神发' }),
                Object.freeze({ source:'《滴天髓阐微·地支》', term:'得令者冲衰则拔，失时者冲旺无伤；冲之者有力，则能去之，冲之者无力，则反激之' })
            ]),
            prerequisiteKeys:Object.freeze([
                'root-branch-relative-strength',
                'counterpart-branch-relative-strength',
                'support-restraint-rescue-context'
            ]),
            statement:'六冲已命中根所在支；传统条件规则要求先判断冲双方的相对旺衰与有力程度，并结合扶助、制化或解救背景，当前这些前提尚未解析。',
            boundary:'不得把“六冲”本身直接映射为根拔、根受伤、根发动或任何 effectiveState。'
        }),
        BRANCH_SIX_HARMONY:Object.freeze({
            kind:'six-harmony',
            family:'合',
            ruleId:ROOT_SIX_HARMONY_RULE_ID,
            sourceBasis:Object.freeze([
                Object.freeze({ source:'《三命通会·论支元六合》', term:'夫合者，和也，乃阴阳相和，其气自合' })
            ]),
            prerequisiteKeys:Object.freeze([
                'six-harmony-effectiveness-rule'
            ]),
            statement:'六合已命中根所在支；现有依据足以确认相合关系，但不足以把六合统一解释为根被合住、根增强、根失效或其他实际效力变化。',
            boundary:'六合关系存在与根的实际可用状态属于不同层次；当前不输出 effectiveState。'
        })
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const buildRootSixRelationRecords = (semanticModel = {}, synthesis = {}) => {
        const structureMap = new Map((semanticModel.structures || []).map((item) => [item.id, item]));
        const records = [];

        (synthesis.rootActorStates || []).forEach((rootState) => {
            (rootState.relatedStructureRefs || []).forEach((structureRef) => {
                const structure = structureMap.get(structureRef);
                const config = RELATION_CONFIG[structure?.code];
                if (!structure || !config) return;
                records.push(Object.freeze({
                    id:`RI-${String(records.length + 1).padStart(2, '0')}`,
                    rootStateId:rootState.id || '',
                    actorKey:rootState.actorKey || '',
                    rootRole:rootState.rootRole || '',
                    pillarIndex:rootState.pillarIndex,
                    zhi:rootState.zhi || '',
                    gan:rootState.gan || '',
                    structureRef,
                    relationCode:structure.code,
                    relationKind:config.kind,
                    relationFamily:config.family,
                    resolutionStatus:'unresolved',
                    effectiveState:null,
                    prerequisiteKeys:freezeArray(config.prerequisiteKeys),
                    sourceBasis:Object.freeze(config.sourceBasis.map((item) => Object.freeze({ ...item }))),
                    statement:config.statement,
                    boundary:config.boundary
                }));
            });
        });

        return Object.freeze(records);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-SIX-RELATION-CONTRACT',
        claimKey:'root.six-relations.effectiveness-contract',
        status:'resolved',
        ruleId:'BAZI-STRENGTH-ROOT-SIX-RELATIONS-CONTRACT-001',
        value:Object.freeze({
            sixClash:Object.freeze({
                relationRecognized:true,
                fixedEffectiveState:false,
                requiresRelativeStrengthComparison:true,
                sourceOutcomeTerms:Object.freeze(['拔','发','无伤','反激'])
            }),
            sixHarmony:Object.freeze({
                relationRecognized:true,
                fixedEffectiveState:false,
                requiresIndependentEffectivenessRule:true
            })
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'六冲与六合都先作为关系事实处理。六冲的传统结果具有明显条件性；六合现有依据只足以确认相合关系，均不能直接输出根实际状态。',
        boundary:'“拔”“发”“无伤”“反激”等原典术语暂不自动映射为 effective / disturbed / weakened / ineffective。'
    });

    const buildRelationDependency = ({ id, scope, records, ruleId, notApplicableStatement, unresolvedStatement, boundary }) => Object.freeze({
        id,
        kind:'interaction',
        scope,
        status:records.length ? 'unresolved' : 'resolved',
        sourceEffectIds:Object.freeze(unique(records.flatMap((item) => item.sourceEffectIds || []))),
        sourceRefs:Object.freeze(unique(records.map((item) => item.structureRef))),
        resolvedByClaimIds:Object.freeze(records.length ? [] : ['SC-ROOT-SIX-RELATION-CONTRACT']),
        ruleId,
        prerequisiteKeys:Object.freeze(unique(records.flatMap((item) => item.prerequisiteKeys || []))),
        statement:records.length ? unresolvedStatement : notApplicableStatement,
        boundary
    });

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({ ...base, rootSixRelationRecords:Object.freeze([]), rootSixRelationRuleIds:Object.freeze([]) });
        }

        const records = buildRootSixRelationRecords(semanticModel, base);
        const clashRecords = records.filter((item) => item.relationKind === 'six-clash');
        const harmonyRecords = records.filter((item) => item.relationKind === 'six-harmony');
        const claims = Object.freeze([...(base.claims || []), makeContractClaim()]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []),
            buildRelationDependency({
                id:'SD-ROOT-SIX-CLASH-EFFECTIVENESS',
                scope:'root-six-clash',
                records:clashRecords,
                ruleId:ROOT_SIX_CLASH_RULE_ID,
                notApplicableStatement:'当前没有根 actor 参与六冲，因此六冲根效力在本局为 not-applicable。',
                unresolvedStatement:'已有根 actor 参与六冲，但相对旺衰、有力程度及扶助／制化／解救背景尚未完成，六冲对根的实际效力保持 unresolved。',
                boundary:'不得仅凭“冲”字决定根拔、受伤或发动。'
            }),
            buildRelationDependency({
                id:'SD-ROOT-SIX-HARMONY-EFFECTIVENESS',
                scope:'root-six-harmony',
                records:harmonyRecords,
                ruleId:ROOT_SIX_HARMONY_RULE_ID,
                notApplicableStatement:'当前没有根 actor 参与六合，因此六合根效力在本局为 not-applicable。',
                unresolvedStatement:'已有根 actor 参与六合，但当前没有统一的六合→根实际状态规则，保持 unresolved。',
                boundary:'不得把相合直接等同于根被合住、增强、失效或成化。'
            })
        ]);
        const conflicts = typeof baseSynthesisApi?.detectConflicts === 'function'
            ? baseSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof baseSynthesisApi?.buildSufficiency === 'function'
            ? baseSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            rootSixRelationRecords:records,
            rootSixRelationRuleIds:Object.freeze([ROOT_SIX_CLASH_RULE_ID, ROOT_SIX_HARMONY_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '六冲对根的作用必须经过相对旺衰／有力程度等前提，不得使用“逢冲即拔”的固定映射。',
                '六合目前只确认关系事实，不把“合”直接解释为根被合住、根增强、根失效或成化。'
            ])
        });
    };

    if (baseSynthesisApi && typeof baseSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = baseSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...baseSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis,
            buildRootSixRelationRecords
        });
    }

    GuiJia.baziRootSixRelations = Object.freeze({
        installed:true,
        ROOT_SIX_RELATIONS_VERSION,
        ROOT_SIX_CLASH_RULE_ID,
        ROOT_SIX_HARMONY_RULE_ID,
        RELATION_CONFIG,
        buildRootSixRelationRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
