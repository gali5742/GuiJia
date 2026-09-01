(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterContext?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyCounterContextContract) {
        document.write('<script src="./js/bazi-contextual-force-party-counter-context-contract.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyCounterContextProfile) {
        document.write('<script src="./js/bazi-contextual-force-party-counter-context-profile.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForcePartyCounterContextContract || null;
    const profileApi = GuiJia.baziContextualForcePartyCounterContextProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const isResolved = (status = '') => String(status).startsWith('resolved');

    const refineSideForceProfileView = (baseView = {}, counterContextView = {}) => {
        const contextMap = new Map((counterContextView.records || []).map((item) => [item.sideId, item]));
        const sideProfiles = freezeArray((baseView.sideProfiles || []).map((side) => {
            const context = contextMap.get(side.sideId);
            if (!context) return side;
            return Object.freeze({
                ...side,
                seasonalStanding:Object.freeze({
                    family:side.seasonalStanding?.family || 'seasonal-standing-context',
                    scope:'counter-anchor-seasonal-standing',
                    ...context.seasonalContext,
                    referenceOnly:false
                }),
                foundationContext:Object.freeze({
                    family:side.foundationContext?.family || 'root-and-foundation-context',
                    ...context.foundationContext
                })
            });
        }));
        const recordByActor = new Map((counterContextView.records || []).map((item) => [item.anchorActorKey, item]));
        const blockerRecords = freezeArray((baseView.blockerRecords || []).filter((blocker) => {
            const context = recordByActor.get(blocker.actorKey);
            if (!context) return true;
            if (String(blocker.id || '').startsWith('CF-SFP-B-SEASON-')) return !isResolved(context.seasonalContext?.status);
            if (String(blocker.id || '').startsWith('CF-SFP-B-FOUNDATION-')) return !isResolved(context.foundationContext?.status);
            return true;
        }));
        const counterSides = freezeArray(sideProfiles.filter((item) => item.sideType === 'counter-anchor-side'));
        const daymasterSide = sideProfiles.find((item) => item.sideType === 'daymaster-side') || baseView.daymasterSide || null;
        return Object.freeze({
            ...baseView,
            status:blockerRecords.length ? 'mapped-partial-required-input-coverage' : 'mapped-complete-required-input-coverage',
            sideProfiles,
            counterSides,
            daymasterSide,
            blockerRecords,
            coverageComplete:blockerRecords.length === 0,
            qualitativeComparison:null,
            relativeDominance:null,
            partyConfiguration:null,
            numericScore:null,
            scalarForce:null
        });
    };

    const makeClaim = ({ id, claimKey, status, value, rationale, boundary }) => Object.freeze({
        id, claimKey, status, ruleId:RULE_ID, value:Object.freeze(value),
        sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]), rationale, boundary
    });

    const makeDependency = ({ id, scope, status, statement, boundary, dependsOnDependencyIds = [], resolvedByClaimIds = [] }) => Object.freeze({
        id, kind:'aggregation', scope, status, ruleId:RULE_ID,
        sourceEffectIds:Object.freeze([]), sourceRefs:Object.freeze([]),
        dependsOnDependencyIds:freezeArray(dependsOnDependencyIds),
        resolvedByClaimIds:freezeArray(resolvedByClaimIds), statement, boundary
    });

    const buildClaims = (view = {}) => Object.freeze([
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-MODEL',
            claimKey:'strength.contextual-force.party.counter-context.seasonal-model',
            status:'resolved',
            value:{ actorSpecific:true, copiedFromDaymaster:false, transitionalWholeMonthRule:false },
            rationale:'《三命通会》直接给出各五行随季节的旺相休囚死状态，可用于具体 actor 五行；过渡月细分仍保留来源限制。',
            boundary:'Seasonal model resolved 不表示所有月份 coverage resolved，更不表示旺相休囚死等于 side force。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE',
            claimKey:'strength.contextual-force.party.counter-context.seasonal-coverage',
            status:view.seasonalCoverageComplete ? 'resolved' : 'unresolved',
            value:{ coverageComplete:view.seasonalCoverageComplete === true, blockerActorKeys:freezeArray(view.seasonalBlockerActorKeys || []) },
            rationale:view.seasonalCoverageComplete ? '当前所有 counter anchors 均具有 actor-specific seasonal context。' : '仍有过渡月或输入缺失导致的 seasonal context blocker。',
            boundary:'Coverage 只表示季节上下文可追溯，不提供相对强弱比较。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-MODEL',
            claimKey:'strength.contextual-force.party.counter-context.foundation-model',
            status:'resolved',
            value:{ visibleStemGeneralization:true, surfaceBranchGeneralization:false, hiddenActorGeneralization:false },
            rationale:'《子平真诠》明确“不特日主如此，喜用忌神皆同此论”，足以把通根 inventory 扩展到非日主明干，但不足以把同一规则直接套给地支或藏干 actor。',
            boundary:'Foundation model resolved 只是 resolver scope 已确定；根存在仍不等于 effective。'
        }),
        makeClaim({
            id:'SC-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE',
            claimKey:'strength.contextual-force.party.counter-context.foundation-coverage',
            status:view.foundationCoverageComplete ? 'resolved' : 'unresolved',
            value:{ coverageComplete:view.foundationCoverageComplete === true, blockerActorKeys:freezeArray(view.foundationBlockerActorKeys || []) },
            rationale:view.foundationCoverageComplete ? '当前所有 counter anchors 均具备 source-authorized foundation context。' : '地支/藏干 actor foundation scope 或输入仍未得到来源授权。',
            boundary:'不得用 actor 存在、藏干数量或十二长生替代 foundation coverage。'
        })
    ]);

    const buildDependencies = (view = {}, refinedSideView = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-MODEL', scope:'counter-anchor-seasonal-context-model', status:'resolved',
            statement:'Actor-specific 五行季节状态模型已建立；不再复制日主 seasonal standing。',
            boundary:'辰戌丑整月状态仍无 v0.1 通用 resolver。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE', scope:'counter-anchor-seasonal-context-coverage', status:view.seasonalCoverageComplete ? 'resolved' : 'unresolved',
            statement:view.seasonalCoverageComplete ? '当前 counter anchors 的季节上下文覆盖完整。' : '仍有 counter anchor 季节上下文未解析。',
            boundary:'Coverage 不映射 force classification。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-MODEL'],
            resolvedByClaimIds:view.seasonalCoverageComplete ? ['SC-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE'] : []
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-MODEL', scope:'counter-anchor-foundation-context-model', status:'resolved',
            statement:'非日主明干的通根/同类根基 inventory resolver 已建立，并保留地支/藏干 actor 的 scope blocker。',
            boundary:'根存在、根来源层级与根有效性继续分层。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-MODEL']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE', scope:'counter-anchor-foundation-context-coverage', status:view.foundationCoverageComplete ? 'resolved' : 'unresolved',
            statement:view.foundationCoverageComplete ? '当前 counter anchors 的 foundation context 覆盖完整。' : '仍有地支/藏干 counter anchor foundation scope 未解析。',
            boundary:'不得用表层 presence 或 hidden item count 补齐。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-MODEL'],
            resolvedByClaimIds:view.foundationCoverageComplete ? ['SC-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE'] : []
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE', scope:'contextual-force-party-side-force-profile-coverage', status:refinedSideView.coverageComplete ? 'resolved' : 'unresolved',
            statement:refinedSideView.coverageComplete ? 'Counter-specific seasonal/foundation context 已补入，当前 required side profile input coverage 完整。' : `Counter context 已补入，但仍有 ${(refinedSideView.blockerRecords || []).length} 项 required input blocker。`,
            boundary:'Profile coverage 不等于 qualitative comparison 或 relative dominance。',
            dependsOnDependencyIds:[
                'SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-MODEL',
                'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
                'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE',
                'SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE'
            ],
            resolvedByClaimIds:refinedSideView.coverageComplete ? ['SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-COVERAGE'] : []
        })
    ]);

    const rebuildCoverageClaim = (base = {}, refined = {}) => {
        const old = (base.claims || []).find((item) => item.id === 'SC-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE-COVERAGE') || {};
        return Object.freeze({
            ...old,
            status:refined.coverageComplete ? 'resolved' : 'unresolved',
            ruleId:RULE_ID,
            value:Object.freeze({ status:refined.status, coverageComplete:refined.coverageComplete === true, blockerIds:freezeArray((refined.blockerRecords || []).map((item) => item.id)), qualitativeComparison:null, relativeDominance:null }),
            rationale:refined.coverageComplete ? 'Side profile required inputs 已具有可追溯上下文。' : 'Counter-specific context 已部分补齐，但仍有 required input blocker。',
            boundary:'Coverage complete 也不授权 count、score、priority 或双方胜负。'
        });
    };

    const rebuildComparisonDependencies = (base = {}) => ['SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE','SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER','SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'].map((id) => {
        const current = (base.dependencies || []).find((item) => item.id === id);
        if (!current) return null;
        return Object.freeze({
            ...current,
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([...(current.dependsOnDependencyIds || []),'SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE','SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE'])),
            resolvedByClaimIds:Object.freeze([])
        });
    }).filter(Boolean);

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForcePartySideForceProfileView) return base;
        const counterView = profileApi.buildCounterContextView(base);
        const refinedSideView = refineSideForceProfileView(base.contextualForcePartySideForceProfileView, counterView);
        const newClaims = buildClaims(counterView);
        const coverageClaim = rebuildCoverageClaim(base, refinedSideView);
        const newDependencies = buildDependencies(counterView, refinedSideView);
        const rebuiltDownstream = rebuildComparisonDependencies(base);
        const replacedClaimIds = new Set([coverageClaim.id, ...newClaims.map((item) => item.id)]);
        const replacedDependencyIds = new Set([...newDependencies.map((item) => item.id), ...rebuiltDownstream.map((item) => item.id)]);
        const claims = Object.freeze([...(base.claims || []).filter((item) => !replacedClaimIds.has(item.id)), coverageClaim, ...newClaims]);
        const dependencies = Object.freeze([...(base.dependencies || []).filter((item) => !replacedDependencyIds.has(item.id)), ...newDependencies, ...rebuiltDownstream]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function' ? priorSynthesisApi.detectConflicts(claims) : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function' ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] }) : base.sufficiency;
        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            contextualForcePartyCounterContextContract:CONTRACT,
            contextualForcePartyCounterContextView:counterView,
            contextualForcePartySideForceProfileView:refinedSideView,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Counter Context v0.1 用 actor 自身五行解析季节状态，不复制日主 seasonal standing。',
                '辰戌丑过渡月整月 seasonal resolver 继续关闭，等待更细 source/time scope。',
                '《子平真诠》非日主通根授权只用于 visible-stem foundation；地支/藏干 actor 不越级套用。',
                '旺相休囚死、根存在与根层级都只是 side profile context，不生成 force classification、relative dominance 或最终强弱。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyCounterContextView:profileApi.buildCounterContextView
    });

    GuiJia.baziContextualForcePartyCounterContext = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        profileApi,
        refineSideForceProfileView,
        buildClaims,
        buildDependencies,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
