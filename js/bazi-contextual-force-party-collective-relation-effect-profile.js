(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract || null;
    const groupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile || null;
    if (!contractApi || !groupProfileApi) return;

    const { VERSION, RULE_ID, RELATION_TYPE, EFFECT_STATE, FINITE_COLLECTIVE_EFFECT_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const groupMap = () => new Map(
        (groupProfileApi.buildProfile().resolvedGroups || []).map((group) => [group.groupId, group])
    );

    const validateCollectiveEffectCandidate = (registryEntry = {}, group = {}) => {
        const issues = [];
        if (!registryEntry.id || !registryEntry.sourceCaseId) issues.push('missing-source-registry-identity');
        if (!group.groupId || group.groupId !== registryEntry.targetGroupId) issues.push('target-group-id-mismatch');
        if (group.sourceCaseId !== registryEntry.sourceCaseId) issues.push('source-case-group-provenance-mismatch');
        if (group.status !== 'resolved-source-scoped-finite-group') issues.push('target-group-not-resolved');
        if (!registryEntry.sourceActorKey) issues.push('missing-source-actor-key');
        if (!(group.sourceActorKeys || []).includes(registryEntry.sourceActorKey)) issues.push('source-actor-not-in-group-case-provenance');
        if (registryEntry.sourceTenGod !== CONTRACT.sourceTenGodRequired) issues.push('source-role-mismatch');
        if (registryEntry.targetRoleClass !== CONTRACT.targetRoleClassRequired || group.targetRoleClass !== CONTRACT.targetRoleClassRequired) issues.push('target-role-mismatch');
        if (registryEntry.relationType !== RELATION_TYPE) issues.push('relation-type-not-authorized');
        if (registryEntry.functionType !== CONTRACT.functionTypeRequired) issues.push('function-type-mismatch');
        if (!(registryEntry.sourceOutcomeTerms || []).includes('制杀')) issues.push('missing-explicit-collective-source-outcome');
        if (group.scope !== 'visible-stem') issues.push('cross-scope-group-not-authorized');
        if (!group.membershipComplete || !group.memberActorKeys?.length) issues.push('incomplete-target-group-membership');
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const buildCollectiveEffectRecord = (registryEntry = {}, group = {}) => {
        const validation = validateCollectiveEffectCandidate(registryEntry, group);
        if (!validation.valid) {
            return Object.freeze({
                id:registryEntry.id || null,
                status:'unresolved-collective-relation-effect',
                sourceCaseId:registryEntry.sourceCaseId || null,
                sourceActorKey:registryEntry.sourceActorKey || null,
                targetGroupId:registryEntry.targetGroupId || null,
                validation,
                memberEdges:Object.freeze([]),
                relationEffectState:null,
                realized:false,
                numericWeight:null
            });
        }

        return Object.freeze({
            id:registryEntry.id,
            status:'resolved-source-scoped-collective-relation-effect',
            sourceCaseId:registryEntry.sourceCaseId,
            relationIdentityType:CONTRACT.relationIdentityType,
            relationType:registryEntry.relationType,
            functionType:registryEntry.functionType,
            sourceActorKey:registryEntry.sourceActorKey,
            sourceTenGod:registryEntry.sourceTenGod,
            targetGroupId:group.groupId,
            targetRoleClass:group.targetRoleClass,
            targetScope:group.scope,
            targetMemberActorKeys:freezeArray(group.memberActorKeys),
            targetCardinality:group.cardinality,
            targetMembershipComplete:group.membershipComplete,
            sourceOutcomeTerms:freezeArray(registryEntry.sourceOutcomeTerms),
            sourceWording:registryEntry.sourceWording,
            executionAuthority:registryEntry.executionAuthority,
            relationEffectState:EFFECT_STATE,
            realized:true,
            memberSpecificRealizationSynthesized:false,
            memberEdgeExpansion:false,
            memberEdges:Object.freeze([]),
            membershipMutation:null,
            daymasterBenefit:null,
            independentForceUnit:false,
            actorGlobalEffectiveness:null,
            relativeDominanceEffect:null,
            numericWeight:null,
            validation,
            boundary:'该 effect 只表示 exact source case 中 source actor 对已解析 target group 的 collective opposition；不得把它复制成逐 member edge，也不得把“扶身”自动转成日主受益 relation。'
        });
    };

    const buildRegistryEffects = () => {
        const groups = groupMap();
        return freezeArray(Object.values(FINITE_COLLECTIVE_EFFECT_REGISTRY).map((entry) =>
            buildCollectiveEffectRecord(entry, groups.get(entry.targetGroupId) || {})
        ));
    };

    const buildProfile = () => {
        const records = buildRegistryEffects();
        const resolvedRecords = records.filter((item) => item.realized === true);
        const blockerRecords = records.filter((item) => item.realized !== true);
        return Object.freeze({
            status:blockerRecords.length ? 'finite-collective-effect-coverage-partial' : 'finite-collective-effect-coverage-complete',
            resolverScope:CONTRACT.resolverScope,
            records,
            resolvedRecords:freezeArray(resolvedRecords),
            blockerRecords:freezeArray(blockerRecords),
            sourceCaseIds:freezeArray(records.map((item) => item.sourceCaseId)),
            targetGroupIds:freezeArray(records.map((item) => item.targetGroupId)),
            memberEdges:Object.freeze([]),
            crossScopeEffects:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Profile 只覆盖 exact source registry 中的 visible finite actor-group opposition；未登记、cross-scope、mediation/augmentation collective effects 继续 unresolved。'
        });
    };

    GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPE,
        EFFECT_STATE,
        CONTRACT,
        validateCollectiveEffectCandidate,
        buildCollectiveEffectRecord,
        buildRegistryEffects,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
