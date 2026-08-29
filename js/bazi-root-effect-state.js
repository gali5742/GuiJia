(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziRootEffectState?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const baseEffectsApi = GuiJia.baziStrengthEffects || null;
    const baseSynthesisApi = GuiJia.baziStrengthSynthesis || null;

    const ROOT_EFFECT_STATE_VERSION = '0.1';
    const ROOT_EFFECT_STATE_RULE_ID = 'BAZI-STRENGTH-ROOT-EFFECT-STATE-001';
    const ROOT_EFFECT_CATEGORIES = new Set(['exactRootPresence','sameElementRootPresence']);
    const ROOT_CONTEXT_CATEGORIES = new Set(['exactRootPresence','sameElementRootPresence','hiddenSupportPresence']);

    const rootEffectResolutionStatuses = Object.freeze({
        NOT_APPLICABLE:'not-applicable',
        UNRESOLVED:'unresolved',
        RESOLVED:'resolved'
    });

    // Reserved vocabulary only. v0.1 does not emit any of these effective-state values.
    const rootEffectiveStates = Object.freeze({
        EFFECTIVE:'effective',
        DISTURBED:'disturbed',
        WEAKENED:'weakened',
        INEFFECTIVE:'ineffective'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const collectBranchStructureRefsByPillar = (result = {}, semanticModel = {}) => {
        const availableStructureIds = new Set((semanticModel.structures || []).map((item) => item.id).filter(Boolean));
        const catalog = typeof baziCore.buildBaziStructureCatalog === 'function'
            ? baziCore.buildBaziStructureCatalog(result.internalRelations || [])
            : [];
        const refsByPillar = new Map();

        catalog.forEach((relation) => {
            const meta = typeof baziCore.getBaziRelationMeta === 'function'
                ? baziCore.getBaziRelationMeta(relation)
                : baziCore.baziRelationMeta?.[relation.code];
            if (meta?.scope !== 'branch') return;
            const structureRef = relation._semanticRef || relation.id || '';
            if (!structureRef || !availableStructureIds.has(structureRef)) return;
            (relation.pillarIndices || []).forEach((pillarIndex) => {
                if (!refsByPillar.has(pillarIndex)) refsByPillar.set(pillarIndex, []);
                refsByPillar.get(pillarIndex).push(structureRef);
            });
        });

        refsByPillar.forEach((refs, key) => refsByPillar.set(key, unique(refs)));
        return refsByPillar;
    };

    const enrichRootActorsWithStructureRefs = (result = {}, semanticModel = {}, collection = {}) => {
        const refsByPillar = collectBranchStructureRefsByPillar(result, semanticModel);
        const effects = (collection.effects || []).map((effect) => {
            if (!ROOT_CONTEXT_CATEGORIES.has(effect.category)) return effect;
            const actors = (effect.actors || []).map((actor) => Object.freeze({
                ...actor,
                relatedStructureRefs:freezeArray(refsByPillar.get(actor.pillarIndex) || [])
            }));
            return Object.freeze({ ...effect, actors:Object.freeze(actors) });
        });
        return Object.freeze({ ...collection, effects:Object.freeze(effects) });
    };

    const collectRootActorStates = (strengthEffects = {}) => {
        const records = [];
        (strengthEffects.effects || []).forEach((effect) => {
            if (!ROOT_EFFECT_CATEGORIES.has(effect.category)) return;
            const rootRole = effect.category === 'exactRootPresence' ? 'exact-root' : 'same-element-root';
            (effect.actors || []).forEach((actor) => {
                records.push(Object.freeze({
                    id:`RS-${String(records.length + 1).padStart(2, '0')}`,
                    actorKey:actor.actorKey || '',
                    rootRole,
                    pillarIndex:actor.pillarIndex,
                    position:actor.position || '',
                    positionLabel:actor.positionLabel || '',
                    zhi:actor.zhi || '',
                    gan:actor.gan || '',
                    level:actor.level || '',
                    presence:'present',
                    resolutionStatus:rootEffectResolutionStatuses.UNRESOLVED,
                    effectiveState:null,
                    relatedStructureRefs:freezeArray(actor.relatedStructureRefs || []),
                    sourceEffectIds:Object.freeze([effect.id].filter(Boolean)),
                    statement:(actor.relatedStructureRefs || []).length
                        ? '根 actor 已确认存在，并与一个或以上原局地支 Structure 发生位置关联；实际效力仍待独立规则解析。'
                        : '根 actor 已确认存在；当前未检测到直接关联该位置的地支 Structure，但存在事实仍不自动等同于实际有效。',
                    boundary:'Structure 关联只表示进入交互观察范围；不得据此自动生成 disturbed、weakened、ineffective 或“根拔”等结论。'
                }));
            });
        });
        return Object.freeze(records);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-ROOT-EFFECT-STATE-CONTRACT',
        claimKey:'root.effect-state-contract',
        status:'resolved',
        ruleId:ROOT_EFFECT_STATE_RULE_ID,
        value:Object.freeze({
            recordLevel:'actor',
            presenceSeparatedFromEffect:true,
            relationPresenceSeparatedFromEffectChange:true,
            resolutionStatuses:Object.freeze(Object.values(rootEffectResolutionStatuses)),
            reservedEffectiveStates:Object.freeze(Object.values(rootEffectiveStates))
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'根的存在、根所在支参与结构关系、以及根的实际效力属于三个不同层次。v0.1 先固定 actor 级状态合同，并保留实际效力为待决。',
        boundary:'reservedEffectiveStates 只是未来规则可使用的受控词汇；当前没有规则可由冲、合、刑、害、破或组合结构直接产生这些状态。'
    });

    const makeNotApplicableClaim = ({ id, claimKey, sourceEffects, rationale }) => Object.freeze({
        id,
        claimKey,
        status:'resolved',
        ruleId:ROOT_EFFECT_STATE_RULE_ID,
        value:Object.freeze({ resolutionStatus:rootEffectResolutionStatuses.NOT_APPLICABLE, effectiveState:null }),
        sourceEffectIds:Object.freeze(sourceEffects.map((item) => item.id).filter(Boolean)),
        sourceRefs:Object.freeze(unique(sourceEffects.flatMap((item) => item.sourceRefs || []))),
        rationale,
        boundary:'not-applicable 只表示当前没有对应 actor 可供效力评估，不等同于身弱、无扶助或任何最终强弱结论。'
    });

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') {
            return Object.freeze({ ...base, rootActorStates:Object.freeze([]), rootEffectStateRuleIds:Object.freeze([]) });
        }

        const strengthEffects = semanticModel.strengthEffects || {};
        const effects = strengthEffects.effects || [];
        const exactRootEffect = effects.find((item) => item.category === 'exactRootPresence');
        const sameElementRootEffect = effects.find((item) => item.category === 'sameElementRootPresence');
        const hiddenSupportEffect = effects.find((item) => item.category === 'hiddenSupportPresence');
        const rootEffects = [exactRootEffect, sameElementRootEffect].filter(Boolean);
        const rootActorStates = collectRootActorStates(strengthEffects);
        const hiddenSupportPresent = hiddenSupportEffect?.presence === 'present' && (hiddenSupportEffect.actors || []).length > 0;

        const claims = [...(base.claims || []), makeContractClaim()];
        let rootNotApplicableClaim = null;
        let hiddenNotApplicableClaim = null;
        if (!rootActorStates.length && rootEffects.length) {
            rootNotApplicableClaim = makeNotApplicableClaim({
                id:'SC-ROOT-EFFECTIVENESS-NOT-APPLICABLE',
                claimKey:'root.effectiveness',
                sourceEffects:rootEffects,
                rationale:'本局本干通根与同类得地均未见 actor，因此没有根 actor 可进入实际效力评估。'
            });
            claims.push(rootNotApplicableClaim);
        }
        if (hiddenSupportEffect && !hiddenSupportPresent) {
            hiddenNotApplicableClaim = makeNotApplicableClaim({
                id:'SC-HIDDEN-SUPPORT-EFFECTIVENESS-NOT-APPLICABLE',
                claimKey:'hidden-support.effectiveness',
                sourceEffects:[hiddenSupportEffect],
                rationale:'本局未见藏支比劫或印星 actor，因此没有藏支扶身 actor 可进入实际效力评估。'
            });
            claims.push(hiddenNotApplicableClaim);
        }

        const retainedDependencies = (base.dependencies || []).filter((item) => item.id !== 'SD-ROOT-EFFECTIVENESS');
        const contractDependency = Object.freeze({
            id:'SD-ROOT-EFFECT-STATE-CONTRACT',
            kind:'rule-coverage',
            scope:'root-effect-state',
            status:'resolved',
            sourceEffectIds:Object.freeze(rootEffects.map((item) => item.id).filter(Boolean)),
            sourceRefs:Object.freeze(unique(rootEffects.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(['SC-ROOT-EFFECT-STATE-CONTRACT']),
            statement:'根的 actor 级有效状态合同已建立：存在、Structure 关联与实际效力保持分层。',
            boundary:'状态合同本身不判断任何根 actor 已有效、受扰、削弱或失效。'
        });
        const rootEffectivenessDependency = Object.freeze({
            id:'SD-ROOT-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'root-actors',
            status:rootActorStates.length ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze(rootEffects.map((item) => item.id).filter(Boolean)),
            sourceRefs:Object.freeze(unique(rootEffects.flatMap((item) => item.sourceRefs || []))),
            resolvedByClaimIds:Object.freeze(rootNotApplicableClaim ? [rootNotApplicableClaim.id] : []),
            statement:rootActorStates.length
                ? '已识别根 actor 及其关联 Structure，但当前没有规则把这些结构关系解释为根的实际有效、受扰、削弱或失效。'
                : '本局未见根 actor，根气实际效力在本局为 not-applicable。',
            boundary:'根 actor 存在不等于 effective；关联冲合刑害破或组合结构也不自动改变 effectiveState。'
        });
        const hiddenSupportDependency = Object.freeze({
            id:'SD-HIDDEN-SUPPORT-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'hidden-support-actors',
            status:hiddenSupportPresent ? 'unresolved' : 'resolved',
            sourceEffectIds:Object.freeze([hiddenSupportEffect?.id].filter(Boolean)),
            sourceRefs:Object.freeze(unique(hiddenSupportEffect?.sourceRefs || [])),
            resolvedByClaimIds:Object.freeze(hiddenNotApplicableClaim ? [hiddenNotApplicableClaim.id] : []),
            statement:hiddenSupportPresent
                ? '藏支比劫或印星 actor 已存在，但其实际扶身效力尚无独立规则解析。'
                : '本局未见藏支扶身 actor，其实际效力在本局为 not-applicable。',
            boundary:'藏支扶身候选与根气是不同语义轴；即使 actor 重叠，也不得重复计力或互相代替效力结论。'
        });
        const dependencies = Object.freeze([
            ...retainedDependencies,
            contractDependency,
            rootEffectivenessDependency,
            hiddenSupportDependency
        ]);
        const frozenClaims = Object.freeze(claims.map((item) => Object.freeze(item)));
        const conflicts = typeof baseSynthesisApi?.detectConflicts === 'function'
            ? baseSynthesisApi.detectConflicts(frozenClaims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof baseSynthesisApi?.buildSufficiency === 'function'
            ? baseSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims:frozenClaims,
            dependencies,
            conflicts,
            rootActorStates,
            rootEffectStateRuleIds:Object.freeze([ROOT_EFFECT_STATE_RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                '根的存在、根所在支关联 Structure、根的实际效力必须保持三层分离。',
                '根所在支命中冲合刑害破或组合结构，只表示该 actor 进入交互观察；当前不得自动写成受扰、削弱、失效或根拔。'
            ])
        });
    };

    if (baseEffectsApi && typeof baseEffectsApi.buildStrengthEffects === 'function') {
        const originalBuildStrengthEffects = baseEffectsApi.buildStrengthEffects;
        const wrappedBuildStrengthEffects = (result = {}, semanticModel = {}) =>
            enrichRootActorsWithStructureRefs(result, semanticModel, originalBuildStrengthEffects(result, semanticModel));
        GuiJia.baziStrengthEffects = Object.freeze({ ...baseEffectsApi, buildStrengthEffects:wrappedBuildStrengthEffects });
    }

    if (baseSynthesisApi && typeof baseSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = baseSynthesisApi.buildStrengthSynthesis;
        const wrappedBuildStrengthSynthesis = (semanticModel = {}) =>
            extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel));
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...baseSynthesisApi,
            buildStrengthSynthesis:wrappedBuildStrengthSynthesis,
            rootEffectResolutionStatuses,
            rootEffectiveStates,
            collectRootActorStates
        });
    }

    GuiJia.baziRootEffectState = Object.freeze({
        installed:true,
        ROOT_EFFECT_STATE_VERSION,
        ROOT_EFFECT_STATE_RULE_ID,
        rootEffectResolutionStatuses,
        rootEffectiveStates,
        collectBranchStructureRefsByPillar,
        enrichRootActorsWithStructureRefs,
        collectRootActorStates,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
