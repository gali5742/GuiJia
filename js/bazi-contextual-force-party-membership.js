(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyMembership?.installed) return;

    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyMembershipContract) {
        document.write('<script src="./js/bazi-contextual-force-party-membership-contract.js?v=13.44.0"><\/script>');
    }
    if (typeof document !== 'undefined' && document.readyState === 'loading' && !GuiJia.baziContextualForcePartyMembershipProfile) {
        document.write('<script src="./js/bazi-contextual-force-party-membership-profile.js?v=13.44.0"><\/script>');
    }

    const contractApi = GuiJia.baziContextualForcePartyMembershipContract || null;
    const profileApi = GuiJia.baziContextualForcePartyMembershipProfile || null;
    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    if (!contractApi || !profileApi || !priorSynthesisApi) return;

    const { VERSION, RULE_ID, SOURCE_EVIDENCE_IDS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const makeContractClaim = () => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-CONTRACT',
        claimKey:'strength.contextual-force.party.membership.contract',
        status:'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            resolverScope:CONTRACT.resolverScope,
            membershipCandidateIsNotRealizedMember:true,
            daymasterSupportSeedDefined:true,
            directRestraintCounterAnchorDefined:true,
            drainGlobalAffiliationDefined:false,
            distributionGlobalAffiliationDefined:false,
            crossActorAffiliationExpansionDefined:false,
            relativeDominanceDefined:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:SOURCE_EVIDENCE_IDS,
        rationale:'Party Source Audit 已确认比印、根基、明暗支干与敌我双方关系需要分层观察；同时“官星虽寡，得财星扶则强”证明财等 actor 的党派不能只由其对日主的单一关系预先决定。因此 v0.1 只定义直接 seed/anchor affiliation。',
        boundary:'Contract resolved 不等于任一 actor 已成为 active party member，也不等于 cross-actor affiliation、relative dominance 或 party configuration 已解析。'
    });

    const makeInventoryClaim = (inventory) => Object.freeze({
        id:'SC-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY',
        claimKey:'strength.contextual-force.party.membership.inventory',
        status:inventory.unresolvedActorKeys.length ? 'unresolved' : 'resolved',
        ruleId:RULE_ID,
        value:Object.freeze({
            status:inventory.status,
            actorProfileCount:inventory.actorProfiles.length,
            daymasterSideSeedActorCount:inventory.daymasterSideActorKeys.length,
            counterAnchorActorCount:inventory.counterAnchorActorKeys.length,
            contextDependentActorCount:inventory.contextDependentActorKeys.length,
            unresolvedActorCount:inventory.unresolvedActorKeys.length,
            activeMemberCount:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourceRegistryEvidenceIds:SOURCE_EVIDENCE_IDS,
        rationale:'现有 Contextual Force profile 已提供根基、扶助、克、泄、被分及 contribution qualifier 的可追溯 actor evidence；Membership v0.1 只把这些 actor 分到直接 seed、counter anchor 或 context-dependent 类别。',
        boundary:'Inventory coverage 不是党众计数；count 字段只用于审计记录数量，不参与强弱、众寡或 relative dominance。'
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

    const buildMembershipDependencies = (inventory = {}) => Object.freeze([
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER',
            scope:'contextual-force-party-direct-seed-membership-resolver',
            status:'resolved',
            statement:'Party Membership v0.1 已定义直接 seed affiliation：日主侧扶助／根基、直接克我 counter anchor，以及泄／被分的 context-dependent 保留类。',
            boundary:'Resolver resolved 只说明分类模型存在；不把 candidate 变成 active member，也不比较双方力量。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL','SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE'],
            resolvedByClaimIds:['SC-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-CONTRACT']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE',
            scope:'contextual-force-party-membership-direct-seed-inventory-coverage',
            status:inventory.unresolvedActorKeys?.length ? 'unresolved' : 'resolved',
            statement:inventory.unresolvedActorKeys?.length
                ? `仍有 ${inventory.unresolvedActorKeys.length} 个 actor 无法进入直接 seed/anchor/context-dependent 类别。`
                : '当前 Contextual Force profile 中可见的直接 membership 候选均已进入 seed、counter-anchor 或 context-dependent inventory。',
            boundary:'Coverage resolved 不表示这些 actor 已经得力，也不表示 party 已经形成。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER'],
            resolvedByClaimIds:inventory.unresolvedActorKeys?.length ? [] : ['SC-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY']
        }),
        makeDependency({
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
            scope:'contextual-force-party-cross-actor-affiliation-expansion',
            status:'unresolved',
            statement:'尚未定义如何依据已兑现 actor-to-actor 生克关系，把财生官、食伤制官等 context-dependent actor 纳入某一具体 side。',
            boundary:'不得用“我生／我克／克我”对日主的单一关系直接推断跨 actor 党派，也不得使用敌人的敌人自动归盟。',
            dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE']
        })
    ]);

    const rebuildRelativeDominance = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            statement:'直接 membership seed inventory 已建立，但跨 actor affiliation 与定性 relative dominance 仍未定义。',
            boundary:'不能把 seed candidate 数量、counter anchor 数量或 contribution 数量拿来多数表决。'
        });
    };

    const rebuildPartyRule = (base = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE') || {};
        return Object.freeze({
            ...current,
            id:'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE',
            status:'unresolved',
            ruleId:RULE_ID,
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER',
                'SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE',
                'SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION',
                'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
            ])),
            resolvedByClaimIds:Object.freeze([]),
            automaticClassifier:null,
            statement:'Party Membership 直接种子层已完成，但跨 actor 扩党与 relative dominance 未完成，因此不得生成党盛／党众／势孤／得势／失势。',
            boundary:'Membership resolver 的完成不能越级成为 Party Configuration 结果。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable' || !base.contextualForceEvidenceProfile) return base;
        const inventory = profileApi.buildMembershipInventory(base);
        const inventoryClaim = makeInventoryClaim(inventory);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), inventoryClaim]);
        const membershipDependencies = buildMembershipDependencies(inventory);
        const relativeDominance = rebuildRelativeDominance(base);
        const partyRule = rebuildPartyRule(base);
        const replacedIds = new Set([
            ...membershipDependencies.map((item) => item.id),
            'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
            'SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            ...membershipDependencies,
            relativeDominance,
            partyRule
        ]);
        const conflicts = typeof priorSynthesisApi.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            contextualForcePartyMembershipContract:CONTRACT,
            contextualForcePartyMembershipInventory:inventory,
            contextualForcePartyMembershipRuleIds:Object.freeze([RULE_ID]),
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Party Membership v0.1 只定义 direct seed affiliation，不把 membership candidate 写成 active member。',
                '比印扶助与根基可以成为日主侧 seed；直接克我 actor 各自成为 counter-side anchor，而不是自动合并成一个统一对立党。',
                '我生与我克 actor 保持 context-dependent；其党派必须等待 actor-to-actor function relation 的 source-context realization。',
                '同一 actor 的根基、扶助与其他语义按 actor identity 合并证据，不做重复计力或 last-write-wins。',
                'Party Membership 完成仍不生成 party score、党盛／势孤、many/few、capacity 或最终 strong/weak。'
            ])
        });
    };

    const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
    GuiJia.baziStrengthSynthesis = Object.freeze({
        ...priorSynthesisApi,
        buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
        buildContextualForcePartyMembershipInventory:profileApi.buildMembershipInventory
    });

    GuiJia.baziContextualForcePartyMembership = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCE_EVIDENCE_IDS,
        CONTRACT,
        profileApi,
        buildMembershipDependencies,
        rebuildRelativeDominance,
        rebuildPartyRule,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
