(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorGroupIdentityProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyActorGroupIdentityContract || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    if (!contractApi || !targetSource) return;

    const { VERSION, RULE_ID, GROUP_STATES, FINITE_GROUP_SOURCE_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const auditCaseById = Object.freeze(Object.fromEntries((targetSource.AUDIT_CASES || []).map((item) => [item.id, item])));

    const scopeOfActorKey = (actorKey = '') => {
        const prefix = String(actorKey).split(':')[0];
        if (prefix === 'visible') return 'visible-stem';
        if (prefix === 'surface-branch') return 'surface-branch';
        if (prefix === 'hidden') return 'hidden-branch';
        return 'unknown';
    };

    const canonicalMemberKeys = (actorKeys = []) => freezeArray([...new Set(actorKeys.filter(Boolean))].sort());

    const validateFiniteGroupCandidate = (sourceCase = {}, registryEntry = {}) => {
        const issues = [];
        const rawMemberKeys = sourceCase.chartLocalCandidateKeys || [];
        const memberActorKeys = canonicalMemberKeys(rawMemberKeys);
        const memberScopes = [...new Set(memberActorKeys.map(scopeOfActorKey))];

        if (!sourceCase.id || !registryEntry.sourceCaseId || sourceCase.id !== registryEntry.sourceCaseId) issues.push('source-case-registry-mismatch');
        if (sourceCase.expectedTargetLevel !== CONTRACT.targetSemanticLevelRequired) issues.push('target-level-is-not-actor-set');
        if (sourceCase.sourceContextType !== CONTRACT.sourceContextTypeRequired) issues.push('source-context-is-not-chart-case');
        if (sourceCase.predicateType !== CONTRACT.predicateTypeRequired) issues.push('predicate-is-not-relation-event');
        if (!sourceCase.chartKey) issues.push('missing-chart-key');
        if (!rawMemberKeys.length) issues.push('missing-chart-local-candidate-keys');
        if (rawMemberKeys.length !== memberActorKeys.length) issues.push('duplicate-member-actor-key');
        if (!Number.isInteger(sourceCase.explicitCardinality) || sourceCase.explicitCardinality <= 0) issues.push('missing-explicit-cardinality');
        if (sourceCase.explicitCardinality !== memberActorKeys.length) issues.push('cardinality-member-count-mismatch');
        if (registryEntry.expectedCardinality !== sourceCase.explicitCardinality) issues.push('source-registry-cardinality-mismatch');
        if (memberScopes.length !== 1 || memberScopes[0] === 'unknown') issues.push('group-members-must-have-one-known-scope');
        if (memberScopes.length === 1 && memberScopes[0] !== registryEntry.scope) issues.push('source-registry-scope-mismatch');
        if (!registryEntry.targetRoleClass) issues.push('missing-target-role-class');

        return Object.freeze({
            valid:issues.length === 0,
            issues:freezeArray(issues),
            memberActorKeys,
            memberScopes:freezeArray(memberScopes)
        });
    };

    const buildFiniteGroup = (sourceCase = {}, registryEntry = {}) => {
        const validation = validateFiniteGroupCandidate(sourceCase, registryEntry);
        if (!validation.valid) {
            return Object.freeze({
                status:GROUP_STATES.UNRESOLVED,
                sourceCaseId:sourceCase.id || registryEntry.sourceCaseId || null,
                groupId:registryEntry.groupId || null,
                validation,
                memberActorKeys:validation.memberActorKeys,
                relationExecution:null,
                memberEdges:Object.freeze([]),
                numericWeight:null
            });
        }

        return Object.freeze({
            status:GROUP_STATES.RESOLVED_SOURCE_SCOPED,
            groupId:registryEntry.groupId,
            sourceCaseId:sourceCase.id,
            chartKey:sourceCase.chartKey,
            semanticLevel:sourceCase.expectedTargetLevel,
            targetRoleClass:registryEntry.targetRoleClass,
            scope:registryEntry.scope,
            memberActorKeys:validation.memberActorKeys,
            cardinality:sourceCase.explicitCardinality,
            sourceActorKeys:freezeArray(sourceCase.sourceActorKeys || []),
            membershipComplete:true,
            sourceCaseScopedIdentity:true,
            memberOrderSemantic:false,
            groupOutcomeExpandsToMemberEdges:false,
            relationExecution:null,
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'该 group 只表示来源在本命例中指称的有限 actor set；不得投影为 member-specific relation effect，也不得跨 source case 泛化。'
        });
    };

    const buildRegistryGroups = () => freezeArray(Object.values(FINITE_GROUP_SOURCE_REGISTRY).map((registryEntry) => {
        const sourceCase = auditCaseById[registryEntry.sourceCaseId] || {};
        return buildFiniteGroup(sourceCase, registryEntry);
    }));

    const buildProfile = () => {
        const groups = buildRegistryGroups();
        const resolvedGroups = groups.filter((item) => item.status === GROUP_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedGroups = groups.filter((item) => item.status !== GROUP_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedGroups.length ? 'audited-finite-group-identity-partial' : 'audited-finite-group-identity-complete',
            resolverScope:CONTRACT.resolverScope,
            groups,
            resolvedGroups:freezeArray(resolvedGroups),
            unresolvedGroups:freezeArray(unresolvedGroups),
            sourceCaseIds:freezeArray(groups.map((item) => item.sourceCaseId)),
            crossScopeGroups:Object.freeze([]),
            collectiveRelationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            boundary:'Profile coverage 只覆盖 FINITE_GROUP_SOURCE_REGISTRY 中明确审定的同 scope actor-set 命例；未登记来源、跨 scope 与 singular target 保持 unresolved。'
        });
    };

    GuiJia.baziContextualForcePartyActorGroupIdentityProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        GROUP_STATES,
        CONTRACT,
        scopeOfActorKey,
        canonicalMemberKeys,
        validateFiniteGroupCandidate,
        buildFiniteGroup,
        buildRegistryGroups,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
