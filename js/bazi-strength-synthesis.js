(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const STRENGTH_SYNTHESIS_VERSION = '0.1';

    const synthesisStates = Object.freeze({
        UNAVAILABLE: 'unavailable',
        CONTRACT_ONLY: 'contract-only',
        EVALUATED: 'evaluated'
    });

    const synthesisClaimStatuses = Object.freeze({
        RESOLVED: 'resolved',
        UNRESOLVED: 'unresolved',
        BLOCKED: 'blocked'
    });

    const synthesisDependencyKinds = Object.freeze({
        RULE_COVERAGE: 'rule-coverage',
        EFFECTIVENESS: 'effectiveness',
        HIERARCHY: 'hierarchy',
        AGGREGATION: 'aggregation',
        INTERACTION: 'interaction'
    });

    const synthesisDependencyStatuses = Object.freeze({
        RESOLVED: 'resolved',
        UNRESOLVED: 'unresolved'
    });

    const synthesisSufficiencyStatuses = Object.freeze({
        INSUFFICIENT: 'insufficient',
        SUFFICIENT: 'sufficient'
    });

    const collectEffectIds = (strengthEffects = {}) => Object.freeze(
        [...new Set((strengthEffects.effects || []).map((item) => item.id).filter(Boolean))]
    );

    const collectActorOverlaps = (strengthEffects = {}) => {
        const roles = new Map();
        (strengthEffects.effects || []).forEach((effect) => {
            const effectActors = [];
            if (effect.actorKey) effectActors.push({ actorKey:effect.actorKey, actor:effect });
            (effect.actors || []).forEach((actor) => {
                if (actor?.actorKey) effectActors.push({ actorKey:actor.actorKey, actor });
            });
            effectActors.forEach(({ actorKey, actor }) => {
                if (!roles.has(actorKey)) roles.set(actorKey, []);
                roles.get(actorKey).push(Object.freeze({
                    effectId:effect.id || '',
                    category:effect.category || '',
                    direction:effect.direction || '',
                    semanticRole:effect.category || '',
                    position:actor.position || effect.position || '',
                    positionLabel:actor.positionLabel || effect.positionLabel || '',
                    zhi:actor.zhi || '',
                    gan:actor.gan || effect.gan || '',
                    tenGod:actor.tenGod || effect.tenGod || ''
                }));
            });
        });

        return Object.freeze([...roles.entries()]
            .filter(([, items]) => items.length > 1)
            .map(([actorKey, items], index) => Object.freeze({
                id:`SO-${String(index + 1).padStart(2, '0')}`,
                actorKey,
                effectIds:Object.freeze([...new Set(items.map((item) => item.effectId).filter(Boolean))]),
                roles:Object.freeze(items),
                policy:'same-actor-may-carry-multiple-semantics-do-not-add',
                statement:'同一物理 actor 在多个语义轴中出现；这些语义可以并存，但不得因此重复计作多份力量。'
            })));
    };

    const makeDependency = ({ id, kind, scope, sourceEffectIds = [], sourceRefs = [], statement, boundary }) => Object.freeze({
        id,
        kind,
        scope,
        status:synthesisDependencyStatuses.UNRESOLVED,
        sourceEffectIds:Object.freeze([...new Set(sourceEffectIds.filter(Boolean))]),
        sourceRefs:Object.freeze([...new Set(sourceRefs.filter(Boolean))]),
        statement,
        boundary
    });

    const collectRefsFromEffects = (effects = []) => Object.freeze([
        ...new Set(effects.flatMap((item) => item?.sourceRefs || []).filter(Boolean))
    ]);

    const buildDefaultDependencies = (strengthEffects = {}) => {
        const effects = strengthEffects.effects || [];
        const seasonal = effects.filter((item) => item.category === 'seasonalContext');
        const visible = effects.filter((item) => item.category === 'visibleStemRelation');
        const roots = effects.filter((item) => ['exactRootPresence','sameElementRootPresence','hiddenSupportPresence'].includes(item.category));
        const branchQi = effects.filter((item) => item.category === 'branchQiContext');

        return Object.freeze([
            makeDependency({
                id:'SD-SEASONAL-HIERARCHY',
                kind:synthesisDependencyKinds.HIERARCHY,
                scope:'seasonal-context',
                sourceEffectIds:seasonal.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(seasonal),
                statement:'月令季节方向已经识别，但季节在最终身强弱综合中属于优先条件、背景条件、必要条件还是独立不可换算维度，当前尚未定义。',
                boundary:'不得用固定分值或证据数量替代月令层级规则。'
            }),
            makeDependency({
                id:'SD-VISIBLE-EFFECTIVENESS',
                kind:synthesisDependencyKinds.EFFECTIVENESS,
                scope:'visible-stem-effects',
                sourceEffectIds:visible.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(visible),
                statement:'明干的扶、克、泄、分力方向资格已经识别，但明干存在如何转化为实际作用、是否需要根气或其他承载条件，当前尚未定义。',
                boundary:'presence-only 与 candidate 不能直接升级为 effective。'
            }),
            makeDependency({
                id:'SD-ROOT-ROLE',
                kind:synthesisDependencyKinds.INTERACTION,
                scope:'root-and-hidden-support',
                sourceEffectIds:roots.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(roots),
                statement:'本干通根、同类得地与藏支印比已经分轴记录，但三者在综合中的层级、替代关系和实际有效条件，当前尚未定义。',
                boundary:'根或藏支印比的存在事实不得直接等同于实际扶身效力。'
            }),
            makeDependency({
                id:'SD-BRANCH-QI-AGGREGATION',
                kind:synthesisDependencyKinds.AGGREGATION,
                scope:'branch-qi',
                sourceEffectIds:branchQi.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(branchQi),
                statement:'年、日、时支十二长生状态已经记录，但如何形成支得气、支失气或其他可参与综合的判断，当前尚未定义。',
                boundary:'十二长生字面状态不得直接映射为扶身强度。'
            })
        ]);
    };

    const detectConflicts = (claims = []) => {
        const resolvedByKey = new Map();
        claims.filter((claim) => claim?.status === synthesisClaimStatuses.RESOLVED && claim.claimKey)
            .forEach((claim) => {
                if (!resolvedByKey.has(claim.claimKey)) resolvedByKey.set(claim.claimKey, []);
                resolvedByKey.get(claim.claimKey).push(claim);
            });

        const conflicts = [];
        resolvedByKey.forEach((items, claimKey) => {
            const values = [...new Set(items.map((item) => JSON.stringify(item.value)))];
            if (values.length <= 1) return;
            conflicts.push(Object.freeze({
                id:`CF-${String(conflicts.length + 1).padStart(2, '0')}`,
                claimKey,
                status:'unresolved',
                claimIds:Object.freeze(items.map((item) => item.id).filter(Boolean)),
                reason:'两个或以上已解析 Claim 对同一待决命题给出互斥结果。'
            }));
        });
        return Object.freeze(conflicts);
    };

    const buildSufficiency = ({ dependencies = [], conflicts = [], activeRuleIds = [] } = {}) => {
        const blockingDependencyIds = dependencies
            .filter((item) => item.status !== synthesisDependencyStatuses.RESOLVED)
            .map((item) => item.id);
        const blockingConflictIds = conflicts
            .filter((item) => item.status !== 'resolved')
            .map((item) => item.id);
        const reasons = [];

        if (!activeRuleIds.length) reasons.push('尚未建立将中间作用候选转化为可用于最终身强弱判断的正向 Synthesis 规则。');
        if (blockingDependencyIds.length) reasons.push('月令、明干实际效力、根气层级或支气汇总仍存在未解析依赖。');
        if (blockingConflictIds.length) reasons.push('同一待决命题仍存在未解决的互斥规则结果。');

        const sufficient = activeRuleIds.length > 0 && !blockingDependencyIds.length && !blockingConflictIds.length;
        return Object.freeze({
            target:'dayMasterStrength-assessment',
            status:sufficient ? synthesisSufficiencyStatuses.SUFFICIENT : synthesisSufficiencyStatuses.INSUFFICIENT,
            blockingDependencyIds:Object.freeze(blockingDependencyIds),
            blockingConflictIds:Object.freeze(blockingConflictIds),
            reasons:Object.freeze(reasons)
        });
    };

    const synthesisRuleRegistry = Object.freeze({ version:'0.1-draft', rules:Object.freeze([]) });

    const buildStrengthSynthesis = (semanticModel = {}) => {
        const strengthEffects = semanticModel?.strengthEffects || null;
        if (!strengthEffects || strengthEffects.state === 'unavailable') {
            return Object.freeze({
                version:STRENGTH_SYNTHESIS_VERSION,
                domain:'dayMasterStrength',
                state:synthesisStates.UNAVAILABLE,
                sourceEffectIds:Object.freeze([]),
                claims:Object.freeze([]),
                dependencies:Object.freeze([]),
                conflicts:Object.freeze([]),
                actorOverlaps:Object.freeze([]),
                sufficiency:Object.freeze({
                    target:'dayMasterStrength-assessment',
                    status:synthesisSufficiencyStatuses.INSUFFICIENT,
                    blockingDependencyIds:Object.freeze([]),
                    blockingConflictIds:Object.freeze([]),
                    reasons:Object.freeze(['strength-effects-unavailable'])
                }),
                activeRuleIds:Object.freeze([]),
                boundaries:Object.freeze(['中间作用层不可用时，不补推综合或最终身强弱结论。'])
            });
        }

        const activeRules = synthesisRuleRegistry.rules.filter((rule) => rule.enabled);
        const claims = Object.freeze(activeRules.flatMap((rule) => {
            if (typeof rule.evaluate !== 'function') return [];
            const output = rule.evaluate(semanticModel);
            if (!output) return [];
            const records = Array.isArray(output) ? output : [output];
            return records.map((record) => Object.freeze({ ...record, ruleId:rule.id }));
        }));
        const dependencies = buildDefaultDependencies(strengthEffects);
        const conflicts = detectConflicts(claims);
        const activeRuleIds = Object.freeze(activeRules.map((rule) => rule.id));

        return Object.freeze({
            version:STRENGTH_SYNTHESIS_VERSION,
            domain:'dayMasterStrength',
            state:activeRules.length ? synthesisStates.EVALUATED : synthesisStates.CONTRACT_ONLY,
            sourceEffectIds:collectEffectIds(strengthEffects),
            claims,
            dependencies,
            conflicts,
            actorOverlaps:collectActorOverlaps(strengthEffects),
            sufficiency:buildSufficiency({ dependencies, conflicts, activeRuleIds }),
            activeRuleIds,
            boundaries:Object.freeze([
                'Synthesis 组织 Intermediate Effect，不复制或改写其方向事实。',
                '不同作用方向候选同时存在不构成 Conflict；Conflict 只针对同一 claimKey 的互斥已解析结果。',
                'Sufficiency 依据规则覆盖与必要依赖，不依据证据、方向或 actor 数量。',
                'insufficient 只表示尚不足以执行最终 Assessment，不等同于 indeterminate，更不生成 strong、weak 或 balanced。'
            ])
        });
    };

    GuiJia.baziStrengthSynthesis = Object.freeze({
        STRENGTH_SYNTHESIS_VERSION,
        synthesisStates,
        synthesisClaimStatuses,
        synthesisDependencyKinds,
        synthesisDependencyStatuses,
        synthesisSufficiencyStatuses,
        synthesisRuleRegistry,
        collectEffectIds,
        collectActorOverlaps,
        buildDefaultDependencies,
        detectConflicts,
        buildSufficiency,
        buildStrengthSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
