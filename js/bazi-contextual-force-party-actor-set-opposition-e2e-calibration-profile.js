(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationContract || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const groupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile || null;
    const collectiveEffectProfileApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile || null;
    if (!contractApi || !calibrationSource || !targetSource || !groupProfileApi || !collectiveEffectProfileApi) return;

    const { VERSION, RULE_ID, MOTIF_ID, FINITE_CALIBRATION_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const canonicalKeys = (items = []) => [...new Set((items || []).filter(Boolean))].sort();
    const sameKeys = (a = [], b = []) => {
        const left = canonicalKeys(a);
        const right = canonicalKeys(b);
        return left.length === right.length && left.every((item, index) => item === right[index]);
    };

    const calibrationCaseMap = () => new Map(
        (calibrationSource.CASES_BY_MOTIF?.[MOTIF_ID] || []).map((item) => [item.id, item])
    );
    const targetCaseMap = () => new Map(
        (targetSource.AUDIT_CASES || []).map((item) => [item.id, item])
    );
    const groupMap = () => new Map(
        (groupProfileApi.buildProfile().resolvedGroups || []).map((item) => [item.groupId, item])
    );
    const effectMap = () => new Map(
        (collectiveEffectProfileApi.buildProfile().resolvedRecords || []).map((item) => [item.id, item])
    );

    const validateCalibrationCandidate = (registryEntry = {}, calibrationCase = {}, targetCase = {}, group = {}, effect = {}) => {
        const issues = [];
        if (!registryEntry.calibrationCaseId || registryEntry.calibrationCaseId !== calibrationCase.id) issues.push('calibration-case-registry-mismatch');
        if (registryEntry.motifId !== MOTIF_ID || calibrationCase.motifId !== MOTIF_ID) issues.push('opposition-motif-mismatch');
        if (!registryEntry.sourceCaseId || registryEntry.sourceCaseId !== targetCase.id) issues.push('target-source-case-registry-mismatch');
        if (!registryEntry.groupId || registryEntry.groupId !== group.groupId) issues.push('group-registry-mismatch');
        if (!registryEntry.collectiveEffectId || registryEntry.collectiveEffectId !== effect.id) issues.push('collective-effect-registry-mismatch');
        if (!calibrationCase.chartKey || calibrationCase.chartKey !== targetCase.chartKey || calibrationCase.chartKey !== group.chartKey) issues.push('chart-key-mismatch');
        if (targetCase.expectedTargetLevel !== CONTRACT.targetSemanticLevelRequired) issues.push('target-level-not-actor-set');
        if (targetCase.sourceContextType !== CONTRACT.sourceContextTypeRequired) issues.push('target-source-context-not-chart-case');
        if (targetCase.predicateType !== CONTRACT.predicateTypeRequired) issues.push('target-predicate-not-relation-event');
        if (calibrationCase.functionType !== CONTRACT.functionTypeRequired || effect.functionType !== CONTRACT.functionTypeRequired) issues.push('function-type-mismatch');
        if (calibrationCase.sourceExplicitOutcome !== true) issues.push('missing-source-explicit-outcome');
        if (calibrationCase.targetSpecificActorResolved !== false || calibrationCase.calibrationEligible !== false) issues.push('legacy-actor-specific-blocker-not-preserved');
        if (!(calibrationCase.blockerReasons || []).includes('multiple-visible-killer-targets')) issues.push('expected-multi-target-blocker-missing');
        if (!sameKeys(calibrationCase.sourceActorKeys, targetCase.sourceActorKeys)) issues.push('source-actor-target-case-mismatch');
        if ((calibrationCase.sourceActorKeys || []).length !== 1 || effect.sourceActorKey !== calibrationCase.sourceActorKeys?.[0]) issues.push('collective-effect-source-actor-mismatch');
        if (!sameKeys(calibrationCase.targetActorKeys, targetCase.chartLocalCandidateKeys)) issues.push('calibration-target-set-source-case-mismatch');
        if (!sameKeys(calibrationCase.targetActorKeys, group.memberActorKeys)) issues.push('calibration-target-set-group-mismatch');
        if (!sameKeys(calibrationCase.targetActorKeys, effect.targetMemberActorKeys)) issues.push('calibration-target-set-effect-mismatch');
        if (group.status !== CONTRACT.groupStateRequired || group.membershipComplete !== true) issues.push('target-group-not-resolved-complete');
        if (group.scope !== 'visible-stem' || effect.targetScope !== 'visible-stem') issues.push('target-group-scope-mismatch');
        if (group.cardinality !== calibrationCase.targetActorKeys?.length || effect.targetCardinality !== group.cardinality) issues.push('target-cardinality-mismatch');
        if (group.targetRoleClass !== '七杀' || effect.targetRoleClass !== '七杀') issues.push('target-role-not-killer');
        if (effect.relationEffectState !== CONTRACT.collectiveEffectStateRequired || effect.realized !== true) issues.push('collective-effect-not-realized');
        if (effect.relationType !== CONTRACT.collectiveRelationTypeRequired) issues.push('collective-effect-type-mismatch');
        if (effect.relationIdentityType !== CONTRACT.calibrationIdentityType) issues.push('collective-relation-identity-type-mismatch');
        if (effect.memberEdgeExpansion !== false || effect.memberSpecificRealizationSynthesized !== false || (effect.memberEdges || []).length) issues.push('member-edge-expansion-detected');
        if (!(effect.sourceOutcomeTerms || []).includes('制杀')) issues.push('collective-effect-lacks-source-outcome');
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const buildCalibrationRecord = (registryEntry = {}, sources = {}) => {
        const calibrationCase = sources.calibrationCases?.get(registryEntry.calibrationCaseId) || {};
        const targetCase = sources.targetCases?.get(registryEntry.sourceCaseId) || {};
        const group = sources.groups?.get(registryEntry.groupId) || {};
        const effect = sources.effects?.get(registryEntry.collectiveEffectId) || {};
        const validation = validateCalibrationCandidate(registryEntry, calibrationCase, targetCase, group, effect);
        if (!validation.valid) {
            return Object.freeze({
                id:`CF-ASOE2E-${registryEntry.calibrationCaseId || 'UNKNOWN'}`,
                status:'unresolved-actor-set-opposition-e2e-calibration',
                calibrationCaseId:registryEntry.calibrationCaseId || null,
                sourceCaseId:registryEntry.sourceCaseId || null,
                targetGroupId:registryEntry.groupId || null,
                collectiveEffectId:registryEntry.collectiveEffectId || null,
                validation,
                memberEdges:Object.freeze([]),
                numericWeight:null
            });
        }
        return Object.freeze({
            id:`CF-ASOE2E-${calibrationCase.id}`,
            status:'resolved-source-scoped-actor-set-opposition-e2e-calibration',
            motifId:MOTIF_ID,
            calibrationIdentityType:CONTRACT.calibrationIdentityType,
            calibrationCaseId:calibrationCase.id,
            sourceCaseId:targetCase.id,
            chartKey:calibrationCase.chartKey,
            sourceTerm:calibrationCase.sourceTerm,
            sourceActorKey:effect.sourceActorKey,
            sourceActorTenGod:'食神',
            targetGroupId:group.groupId,
            targetRoleClass:group.targetRoleClass,
            targetScope:group.scope,
            targetMemberActorKeys:freezeArray(canonicalKeys(group.memberActorKeys)),
            targetCardinality:group.cardinality,
            collectiveEffectId:effect.id,
            relationType:effect.relationType,
            functionType:effect.functionType,
            relationEffectState:effect.relationEffectState,
            sourceOutcomeTerms:freezeArray(effect.sourceOutcomeTerms || []),
            originalActorSpecificCalibration:Object.freeze({
                targetSpecificActorResolved:calibrationCase.targetSpecificActorResolved,
                calibrationEligible:calibrationCase.calibrationEligible,
                blockerReasons:freezeArray(calibrationCase.blockerReasons || [])
            }),
            actorSetCalibrationResolved:true,
            sourceCaseScopedCalibration:true,
            memberSpecificRealizationSynthesized:false,
            memberEdgeExpansion:false,
            memberEdges:Object.freeze([]),
            visibleFunctionRealizationRegistryMutation:false,
            genericVisibleEdgeMapping:null,
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'旧 calibration 的 multi-target blocker 在此被保留并改用 actor-set target model 消费；结果只校准 source actor→resolved group collective opposition，不产生任何 member-specific realized edge。'
        });
    };

    const buildProfile = () => {
        const sources = Object.freeze({
            calibrationCases:calibrationCaseMap(),
            targetCases:targetCaseMap(),
            groups:groupMap(),
            effects:effectMap()
        });
        const records = freezeArray(Object.values(FINITE_CALIBRATION_REGISTRY).map((entry) => buildCalibrationRecord(entry, sources)));
        const resolvedRecords = records.filter((item) => item.actorSetCalibrationResolved === true);
        const blockerRecords = records.filter((item) => item.actorSetCalibrationResolved !== true);
        const allOppositionCases = calibrationSource.CASES_BY_MOTIF?.[MOTIF_ID] || [];
        const registeredCaseIds = new Set(Object.keys(FINITE_CALIBRATION_REGISTRY));
        const unregisteredOppositionCaseIds = freezeArray(allOppositionCases.map((item) => item.id).filter((id) => !registeredCaseIds.has(id)));
        return Object.freeze({
            status:blockerRecords.length ? 'finite-actor-set-opposition-calibration-partial' : 'finite-actor-set-opposition-calibration-complete',
            resolverScope:CONTRACT.resolverScope,
            records,
            resolvedRecords:freezeArray(resolvedRecords),
            blockerRecords:freezeArray(blockerRecords),
            finiteRegistryCoverageComplete:blockerRecords.length === 0,
            registeredCalibrationCaseIds:freezeArray(records.map((item) => item.calibrationCaseId)),
            unregisteredOppositionCaseIds,
            oppositionCaseFamilyCoverageComplete:unregisteredOppositionCaseIds.length === 0,
            actorSpecificVisibleEdgeCalibrationResolved:false,
            mediationCalibrationResolved:false,
            genericVisibleEdgeMappingResolved:false,
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            boundary:'v0.1 只覆盖两个已有 RTLC group identity + collective effect 的 opposition cases；其他 opposition cases 与 mediation 不因相似 wording 自动纳入。'
        });
    };

    GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        MOTIF_ID,
        CONTRACT,
        canonicalKeys,
        sameKeys,
        validateCalibrationCandidate,
        buildCalibrationRecord,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
