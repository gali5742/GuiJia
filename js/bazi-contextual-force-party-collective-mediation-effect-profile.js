(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract || null;
    const sourceGroupProfileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    if (!contractApi || !sourceGroupProfileApi || !calibrationSource) return;

    const {
        VERSION,
        RULE_ID,
        RELATION_TYPE,
        EFFECT_STATE,
        MEDIATION_MOTIF_ID,
        FINITE_COLLECTIVE_MEDIATION_REGISTRY,
        CONTRACT
    } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const canonicalKeys = (items = []) => [...new Set((items || []).filter(Boolean))].sort();
    const sameKeys = (a = [], b = []) => {
        const left = canonicalKeys(a);
        const right = canonicalKeys(b);
        return left.length === right.length && left.every((item, index) => item === right[index]);
    };
    const scopeOfActorKey = (actorKey = '') => {
        const prefix = String(actorKey).split(':')[0];
        if (prefix === 'visible') return 'visible-stem';
        if (prefix === 'surface-branch') return 'surface-branch';
        if (prefix === 'hidden') return 'hidden-branch';
        return 'unknown';
    };

    const mediationCaseMap = () => new Map(
        (calibrationSource.CASES_BY_MOTIF?.[MEDIATION_MOTIF_ID] || []).map((item) => [item.id, item])
    );
    const sourceGroupMap = () => new Map(
        (sourceGroupProfileApi.buildProfile().resolvedGroups || []).map((item) => [item.id, item])
    );

    const validateCollectiveMediationCandidate = (registryEntry = {}, sourceCase = {}, sourceGroup = {}) => {
        const issues = [];
        const targetActorKeys = sourceCase.targetActorKeys || [];
        const targetActorTenGods = sourceCase.targetActorTenGods || [];

        if (!registryEntry.id || !registryEntry.sourceCaseId) issues.push('incomplete-registry-entry');
        if (registryEntry.sourceCaseId !== sourceCase.id) issues.push('source-case-registry-mismatch');
        if (sourceCase.motifId !== MEDIATION_MOTIF_ID) issues.push('mediation-motif-mismatch');
        if (!sourceCase.chartKey || sourceCase.chartKey !== sourceGroup.chartKey) issues.push('chart-key-mismatch');
        if (!registryEntry.sourceGroupId || registryEntry.sourceGroupId !== sourceGroup.id) issues.push('source-group-registry-mismatch');
        if (sourceGroup.status !== sourceGroupProfileApi.GROUP_STATES.RESOLVED_SOURCE_SCOPED) issues.push('source-group-not-resolved');
        if (sourceGroup.groupIdentitySide !== CONTRACT.sourceGroupIdentitySideRequired) issues.push('source-group-side-mismatch');
        if (sourceGroup.sourceCaseId !== sourceCase.id) issues.push('source-group-case-mismatch');
        if (sourceGroup.sourceRoleClass !== CONTRACT.sourceRoleClassRequired || registryEntry.sourceRoleClass !== CONTRACT.sourceRoleClassRequired) issues.push('source-role-class-mismatch');
        if (!sameKeys(sourceGroup.memberActorKeys, sourceCase.sourceActorKeys)) issues.push('source-member-set-mismatch');
        if (sourceGroup.membershipComplete !== true) issues.push('source-group-membership-incomplete');
        if (sourceGroup.relationExecution !== null || sourceGroup.mediationExecution !== null) issues.push('source-group-preexecuted');
        if ((sourceGroup.memberEdges || []).length || sourceGroup.memberEdgeExpansion !== false) issues.push('source-group-member-edge-expansion-detected');

        if (targetActorKeys.length !== 1) issues.push('target-must-be-single-actor');
        if (!registryEntry.targetActorKey || registryEntry.targetActorKey !== targetActorKeys[0]) issues.push('target-actor-registry-mismatch');
        if (scopeOfActorKey(registryEntry.targetActorKey) !== CONTRACT.targetActorScopeRequired) issues.push('target-actor-scope-mismatch');
        if (targetActorTenGods.length !== 1 || targetActorTenGods[0] !== registryEntry.targetTenGod) issues.push('target-ten-god-case-mismatch');
        if (!CONTRACT.targetTenGodsAllowed.includes(registryEntry.targetTenGod)) issues.push('target-ten-god-not-allowed');

        if (sourceCase.functionType !== CONTRACT.functionTypeRequired || registryEntry.functionType !== CONTRACT.functionTypeRequired) issues.push('function-type-mismatch');
        if (registryEntry.relationType !== RELATION_TYPE) issues.push('relation-type-mismatch');
        if (sourceCase.sourceExplicitOutcome !== true) issues.push('missing-source-explicit-outcome');
        if (!sourceCase.sourceTerm || sourceCase.sourceTerm !== registryEntry.sourceWording) issues.push('source-wording-mismatch');
        (registryEntry.requiredSourceMarkers || []).forEach((marker) => {
            if (!sourceCase.sourceTerm.includes(marker)) issues.push(`source-marker-missing:${marker}`);
        });
        if (!(registryEntry.sourceOutcomeTerms || []).length) issues.push('missing-source-outcome-terms');
        (registryEntry.sourceOutcomeTerms || []).forEach((term) => {
            if (!sourceCase.sourceTerm.includes(term)) issues.push(`source-outcome-term-missing:${term}`);
        });

        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const buildCollectiveMediationRecord = (registryEntry = {}, sources = {}) => {
        const sourceCase = sources.cases?.get(registryEntry.sourceCaseId) || {};
        const sourceGroup = sources.groups?.get(registryEntry.sourceGroupId) || {};
        const validation = validateCollectiveMediationCandidate(registryEntry, sourceCase, sourceGroup);
        if (!validation.valid) {
            return Object.freeze({
                id:registryEntry.id || null,
                status:'unresolved-collective-mediation-effect',
                sourceCaseId:registryEntry.sourceCaseId || null,
                sourceGroupId:registryEntry.sourceGroupId || null,
                targetActorKey:registryEntry.targetActorKey || null,
                relationIdentityType:CONTRACT.relationIdentityType,
                validation,
                sourceMemberEdges:Object.freeze([]),
                numericWeight:null
            });
        }
        return Object.freeze({
            id:registryEntry.id,
            status:EFFECT_STATE,
            sourceCaseId:sourceCase.id,
            motifId:sourceCase.motifId,
            chartKey:sourceCase.chartKey,
            relationIdentityType:CONTRACT.relationIdentityType,
            sourceGroupId:sourceGroup.id,
            sourceRoleClass:sourceGroup.sourceRoleClass,
            sourceScope:sourceGroup.scope,
            sourceMemberActorKeys:freezeArray(canonicalKeys(sourceGroup.memberActorKeys)),
            sourceCardinality:sourceGroup.cardinality,
            targetActorKey:registryEntry.targetActorKey,
            targetTenGod:registryEntry.targetTenGod,
            targetScope:scopeOfActorKey(registryEntry.targetActorKey),
            relationType:registryEntry.relationType,
            functionType:registryEntry.functionType,
            relationEffectState:EFFECT_STATE,
            realized:true,
            sourceWording:registryEntry.sourceWording,
            sourceOutcomeTerms:freezeArray(registryEntry.sourceOutcomeTerms || []),
            executionAuthority:registryEntry.executionAuthority,
            sourceMemberSpecificRealizationSynthesized:false,
            sourceMemberEdgeExpansion:false,
            sourceMemberEdges:Object.freeze([]),
            reverseSealToKillerEdgeCreated:false,
            membershipMutation:false,
            sourceActorGroupContractMutation:false,
            targetActorGroupContractMutation:false,
            independentForceUnit:false,
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'该 realized effect 只表示 MED CASE-04 来源明确的两杀 collective source → visible 戊印 mediation outcome；不声称 visible:1:丙 或 visible:3:丙 各自已有 target-specific generation edge。'
        });
    };

    const buildProfile = () => {
        const sources = Object.freeze({ cases:mediationCaseMap(), groups:sourceGroupMap() });
        const records = freezeArray(Object.values(FINITE_COLLECTIVE_MEDIATION_REGISTRY).map((entry) => buildCollectiveMediationRecord(entry, sources)));
        const resolvedRecords = records.filter((item) => item.realized === true);
        const unresolvedRecords = records.filter((item) => item.realized !== true);
        return Object.freeze({
            status:unresolvedRecords.length ? 'finite-collective-mediation-effect-partial' : 'finite-collective-mediation-effect-complete',
            resolverScope:CONTRACT.resolverScope,
            relationIdentityType:CONTRACT.relationIdentityType,
            records,
            resolvedRecords:freezeArray(resolvedRecords),
            unresolvedRecords:freezeArray(unresolvedRecords),
            finiteVisibleCoverageComplete:unresolvedRecords.length === 0,
            sourceCaseIds:freezeArray(records.map((item) => item.sourceCaseId)),
            crossScopeExecutions:Object.freeze([]),
            sourceMemberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            boundary:'v0.1 只有 MED CASE-04 一条 group→actor visible finite mediation execution；其他 mediation cases 与 generic collective mediation resolver 继续 unresolved。'
        });
    };

    GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPE,
        EFFECT_STATE,
        CONTRACT,
        canonicalKeys,
        sameKeys,
        scopeOfActorKey,
        validateCollectiveMediationCandidate,
        buildCollectiveMediationRecord,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
