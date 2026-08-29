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

    const makeDependency = ({
        id,
        kind,
        scope,
        status = synthesisDependencyStatuses.UNRESOLVED,
        sourceEffectIds = [],
        sourceRefs = [],
        resolvedByClaimIds = [],
        statement,
        boundary
    }) => Object.freeze({
        id,
        kind,
        scope,
        status,
        sourceEffectIds:Object.freeze([...new Set(sourceEffectIds.filter(Boolean))]),
        sourceRefs:Object.freeze([...new Set(sourceRefs.filter(Boolean))]),
        resolvedByClaimIds:Object.freeze([...new Set(resolvedByClaimIds.filter(Boolean))]),
        statement,
        boundary
    });

    const collectRefsFromEffects = (effects = []) => Object.freeze([
        ...new Set(effects.flatMap((item) => item?.sourceRefs || []).filter(Boolean))
    ]);

    const resolvedClaimsFor = (claims = [], claimKey) => claims.filter((claim) =>
        claim?.claimKey === claimKey && claim?.status === synthesisClaimStatuses.RESOLVED
    );

    const buildDefaultDependencies = (strengthEffects = {}, claims = []) => {
        const effects = strengthEffects.effects || [];
        const seasonal = effects.filter((item) => item.category === 'seasonalContext');
        const visible = effects.filter((item) => item.category === 'visibleStemRelation');
        const roots = effects.filter((item) => ['exactRootPresence','sameElementRootPresence','hiddenSupportPresence'].includes(item.category));
        const branchQi = effects.filter((item) => item.category === 'branchQiContext');
        const seasonalHierarchyClaims = resolvedClaimsFor(claims, 'seasonal.hierarchy');
        const seasonalHierarchyResolved = seasonalHierarchyClaims.length > 0;
        const rootRoleClaims = resolvedClaimsFor(claims, 'root.role-model');
        const rootRoleResolved = rootRoleClaims.length > 0;

        return Object.freeze([
            makeDependency({
                id:'SD-SEASONAL-HIERARCHY',
                kind:synthesisDependencyKinds.HIERARCHY,
                scope:'seasonal-context',
                status:seasonalHierarchyResolved ? synthesisDependencyStatuses.RESOLVED : synthesisDependencyStatuses.UNRESOLVED,
                sourceEffectIds:seasonal.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(seasonal),
                resolvedByClaimIds:seasonalHierarchyClaims.map((item) => item.id),
                statement:seasonalHierarchyResolved
                    ? '月令季节已定义为独立一级判断轴：必须单独保留，不能与一般明干、根气或支气按同一单位换算；它参与后续组合分支，但不是一票式必要条件，也不能单独生成最终强弱结论。'
                    : '月令季节方向已经识别，但季节在最终身强弱综合中属于优先条件、背景条件、必要条件还是独立不可换算维度，当前尚未定义。',
                boundary:'不得用固定分值、证据数量、一票否决或绝对优先级替代月令层级规则。'
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
                status:rootRoleResolved ? synthesisDependencyStatuses.RESOLVED : synthesisDependencyStatuses.UNRESOLVED,
                sourceEffectIds:roots.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(roots),
                resolvedByClaimIds:rootRoleClaims.map((item) => item.id),
                statement:rootRoleResolved
                    ? '本干通根、同类得地与藏支印比的语义角色已经分层：前两者属于根气子类型，后者属于按十神身份识别的藏支扶身候选轴；同一根 actor 可以同时具有比劫扶身语义，但不得据此重复计力，藏支印星也不能替代“有根”命题。'
                    : '本干通根、同类得地与藏支印比已经分轴记录，但三者在综合中的角色、重叠关系与替代边界尚未定义。',
                boundary:'角色分类只解决“是什么”；不得把根或藏支印比的存在事实直接等同于实际扶身效力。'
            }),
            makeDependency({
                id:'SD-ROOT-EFFECTIVENESS',
                kind:synthesisDependencyKinds.EFFECTIVENESS,
                scope:'root-and-hidden-support',
                sourceEffectIds:roots.map((item) => item.id),
                sourceRefs:collectRefsFromEffects(roots),
                statement:'根气与藏支扶身候选的角色已经可以识别，但这些 actor 在具体结构关系中是否保持、削弱或形成实际扶身效力，当前尚未定义。',
                boundary:'不得从 presence-only 或 support-candidate 直接升级为 effective；冲合刑害等结构也不得在没有独立规则时直接删除原始根气事实。'
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
        if (blockingDependencyIds.length) reasons.push('明干实际效力、根气实际效力或支气汇总仍存在未解析依赖。');
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

    const qianliSeasonalHierarchyRule = Object.freeze({
        id:'BAZI-STRENGTH-SYNTH-SEASON-001',
        enabled:true,
        domain:'dayMasterStrength',
        scope:'seasonal-context',
        sourceContractId:'qianli-basic-strength-evidence',
        sourceLocator:'《千里命稿·强弱篇》“身强之构成”“身强之区别”',
        evaluate(semanticModel = {}) {
            const seasonal = (semanticModel?.strengthEffects?.effects || []).find((item) => item.category === 'seasonalContext');
            if (!seasonal || seasonal.status !== 'recognized') return null;
            if (!['seasonal-support','seasonal-non-support'].includes(seasonal.direction)) return null;
            return Object.freeze({
                id:'SC-SEASONAL-HIERARCHY',
                claimKey:'seasonal.hierarchy',
                status:synthesisClaimStatuses.RESOLVED,
                value:Object.freeze({
                    role:'independent-primary-axis',
                    conversion:'non-convertible',
                    necessaryCondition:false,
                    sufficientAlone:false
                }),
                sourceEffectIds:Object.freeze([seasonal.id].filter(Boolean)),
                sourceRefs:Object.freeze([...(seasonal.sourceRefs || [])]),
                sourceContractId:'qianli-basic-strength-evidence',
                sourceLocator:'《千里命稿·强弱篇》“身强之构成”“身强之区别”',
                rationale:'《千里命稿·强弱篇》把月令旺相、多帮扶、支得气分别列为身强构成条件；其强弱区别又同时列出“失令而多帮扶”与“得令而少帮扶”的组合，因此月令应作为独立一级判断轴保留，但不能解释成一票式必要条件或单独最终结论。',
                boundary:'本规则只解析月令在 Synthesis 中的层级；不判断多帮扶、少帮扶、支得气，也不生成最强、中强、次强、强、弱或其他最终等级。'
            });
        }
    });

    const guijiaRootRoleRule = Object.freeze({
        id:'BAZI-STRENGTH-SYNTH-ROOT-001',
        enabled:true,
        domain:'dayMasterStrength',
        scope:'root-and-hidden-support',
        sourceModel:'GuiJia Strength Effect v0.1',
        evaluate(semanticModel = {}) {
            const effects = semanticModel?.strengthEffects?.effects || [];
            const exactRoot = effects.find((item) => item.category === 'exactRootPresence');
            const sameElementRoot = effects.find((item) => item.category === 'sameElementRootPresence');
            const hiddenSupport = effects.find((item) => item.category === 'hiddenSupportPresence');
            if (!exactRoot || !sameElementRoot || !hiddenSupport) return null;

            const sourceEffects = [exactRoot, sameElementRoot, hiddenSupport];
            return Object.freeze({
                id:'SC-ROOT-ROLE',
                claimKey:'root.role-model',
                status:synthesisClaimStatuses.RESOLVED,
                value:Object.freeze({
                    exactRootRole:'root-same-stem-hidden',
                    sameElementRootRole:'root-same-element-different-stem-hidden',
                    hiddenSupportRole:'ten-god-support-umbrella',
                    rootActorMayAlsoBeHiddenSupport:true,
                    hiddenSupportCanSatisfyRootClaim:false,
                    rootSubtypesEquivalent:false,
                    overlapPolicy:'same-actor-may-carry-multiple-semantics-do-not-add',
                    effectivenessResolved:false
                }),
                sourceEffectIds:Object.freeze(sourceEffects.map((item) => item.id).filter(Boolean)),
                sourceRefs:collectRefsFromEffects(sourceEffects),
                sourceModel:'GuiJia Strength Effect v0.1',
                rationale:'当前 Effect contract 以藏干与日主的同干／同五行关系定义本干通根和同类得地，并另以比劫、印星的十神身份定义藏支扶身候选。因此“根气”与“藏支印比”属于不同语义轴：根 actor 可同时具有比劫扶身身份，但这是同一 actor 的多重语义；印星虽可作为藏支扶身候选，却不因此成为日主之根。',
                boundary:'本规则只解析角色、重叠和替代边界；不判断根的层级强弱、实际可用程度、受冲合后的状态，也不生成任何身强身弱结论。'
            });
        }
    });

    const synthesisRuleRegistry = Object.freeze({
        version:'0.1-draft',
        rules:Object.freeze([qianliSeasonalHierarchyRule, guijiaRootRoleRule])
    });

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
        const dependencies = buildDefaultDependencies(strengthEffects, claims);
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
                '月令季节作为独立一级判断轴，不与其他证据按统一分值、权重或条数换算。',
                '本干通根、同类得地与藏支印比保持语义分层；同一 actor 的根气与比劫身份可以重叠，但不得重复计力，藏支印星也不能替代根气命题。',
                '根气角色已解析不等于根气实际效力已解析；presence-only 与 support-candidate 仍不得自动升级为 effective。',
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
        qianliSeasonalHierarchyRule,
        guijiaRootRoleRule,
        collectEffectIds,
        collectActorOverlaps,
        buildDefaultDependencies,
        detectConflicts,
        buildSufficiency,
        buildStrengthSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);