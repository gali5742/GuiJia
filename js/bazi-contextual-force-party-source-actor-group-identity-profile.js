(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityContract || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    if (!contractApi || !calibrationSource) return;

    const { VERSION, RULE_ID, GROUP_STATES, MEDIATION_MOTIF_ID, FINITE_SOURCE_GROUP_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const mediationCases = freezeArray(calibrationSource.CASES_BY_MOTIF?.[MEDIATION_MOTIF_ID] || []);
    const sourceCaseById = Object.freeze(Object.fromEntries(mediationCases.map((item) => [item.id, item])));

    const scopeOfActorKey = (actorKey = '') => {
        const prefix = String(actorKey).split(':')[0];
        if (prefix === 'visible') return 'visible-stem';
        if (prefix === 'surface-branch') return 'surface-branch';
        if (prefix === 'hidden') return 'hidden-branch';
        return 'unknown';
    };
    const canonicalMemberKeys = (actorKeys = []) => freezeArray([...new Set((actorKeys || []).filter(Boolean))].sort());

    const validateFiniteSourceGroupCandidate = (sourceCase = {}, registryEntry = {}) => {
        const issues = [];
        const rawMemberKeys = sourceCase.sourceActorKeys || [];
        const memberActorKeys = canonicalMemberKeys(rawMemberKeys);
        const memberScopes = [...new Set(memberActorKeys.map(scopeOfActorKey))];
        const sourceRoles = sourceCase.sourceActorTenGods || [];

        if (!sourceCase.id || sourceCase.id !== registryEntry.sourceCaseId) issues.push('source-case-registry-mismatch');
        if (sourceCase.motifId !== MEDIATION_MOTIF_ID || registryEntry.motifId !== MEDIATION_MOTIF_ID) issues.push('mediation-motif-mismatch');
        if (!sourceCase.chartKey) issues.push('missing-chart-key');
        if (!sourceCase.sourceTerm) issues.push('missing-source-wording');
        if (!rawMemberKeys.length) issues.push('missing-source-actor-keys');
        if (rawMemberKeys.length !== memberActorKeys.length) issues.push('duplicate-source-member-actor-key');
        if (memberActorKeys.length !== registryEntry.expectedCardinality) issues.push('source-cardinality-registry-mismatch');
        if (memberScopes.length !== 1 || memberScopes[0] !== registryEntry.scope) issues.push('source-group-scope-mismatch');
        if (sourceRoles.length !== rawMemberKeys.length || !sourceRoles.every((role) => role === registryEntry.sourceRoleClass)) issues.push('source-role-class-mismatch');
        if (!(registryEntry.requiredSourceMarkers || []).length) issues.push('missing-source-marker-contract');
        (registryEntry.requiredSourceMarkers || []).forEach((marker) => {
            if (!sourceCase.sourceTerm.includes(marker)) issues.push(`source-marker-missing:${marker}`);
        });
        return Object.freeze({
            valid:issues.length === 0,
            issues:freezeArray(issues),
            memberActorKeys,
            memberScopes:freezeArray(memberScopes),
            sourceRoles:freezeArray(sourceRoles)
        });
    };

    const buildFiniteSourceGroup = (sourceCase = {}, registryEntry = {}) => {
        const validation = validateFiniteSourceGroupCandidate(sourceCase, registryEntry);
        if (!validation.valid) {
            return Object.freeze({
                id:registryEntry.id || null,
                status:GROUP_STATES.UNRESOLVED,
                sourceCaseId:sourceCase.id || registryEntry.sourceCaseId || null,
                groupIdentitySide:CONTRACT.groupIdentitySide,
                memberActorKeys:validation.memberActorKeys,
                validation,
                relationExecution:null,
                memberEdges:Object.freeze([]),
                numericWeight:null
            });
        }
        return Object.freeze({
            id:registryEntry.id,
            status:GROUP_STATES.RESOLVED_SOURCE_SCOPED,
            sourceCaseId:sourceCase.id,
            motifId:sourceCase.motifId,
            chartKey:sourceCase.chartKey,
            groupIdentitySide:CONTRACT.groupIdentitySide,
            semanticLevel:CONTRACT.semanticLevel,
            sourceRoleClass:registryEntry.sourceRoleClass,
            scope:registryEntry.scope,
            memberActorKeys:validation.memberActorKeys,
            cardinality:registryEntry.expectedCardinality,
            sourceWording:sourceCase.sourceTerm,
            sourceMarkers:freezeArray(registryEntry.requiredSourceMarkers || []),
            targetActorKeys:freezeArray(sourceCase.targetActorKeys || []),
            membershipComplete:true,
            sourceCaseScopedIdentity:true,
            memberOrderSemantic:false,
            targetActorGroupContractMutation:false,
            relationExecution:null,
            mediationExecution:null,
            memberSpecificRealizationSynthesized:false,
            memberEdgeExpansion:false,
            memberEdges:Object.freeze([]),
            membershipMutation:null,
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'该 source group 只表示 MED CASE-04 原文“干透两杀”对应的两枚 visible 丙杀；group identity 本身不表示两杀分别或整体已对戊印形成 realized mediation edge。'
        });
    };

    const buildRegistryGroups = () => freezeArray(Object.values(FINITE_SOURCE_GROUP_REGISTRY).map((entry) =>
        buildFiniteSourceGroup(sourceCaseById[entry.sourceCaseId] || {}, entry)
    ));

    const buildProfile = () => {
        const groups = buildRegistryGroups();
        const resolvedGroups = groups.filter((item) => item.status === GROUP_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedGroups = groups.filter((item) => item.status !== GROUP_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedGroups.length ? 'finite-source-group-identity-partial' : 'finite-source-group-identity-complete',
            resolverScope:CONTRACT.resolverScope,
            groupIdentitySide:CONTRACT.groupIdentitySide,
            groups,
            resolvedGroups:freezeArray(resolvedGroups),
            unresolvedGroups:freezeArray(unresolvedGroups),
            sourceCaseIds:freezeArray(groups.map((item) => item.sourceCaseId)),
            crossScopeSourceGroups:Object.freeze([]),
            relationExecutions:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            boundary:'Profile coverage 只有 MED CASE-04 一条 explicit visible finite source-set registry；MED CASE-01/05 的 cross-scope source semantics 与其他未登记多 source cases 继续 unresolved。'
        });
    };

    GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        GROUP_STATES,
        CONTRACT,
        scopeOfActorKey,
        canonicalMemberKeys,
        validateFiniteSourceGroupCandidate,
        buildFiniteSourceGroup,
        buildRegistryGroups,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
