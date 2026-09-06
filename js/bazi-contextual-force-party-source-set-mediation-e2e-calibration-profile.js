(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationContract || null;
    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const sourceGroupProfileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile || null;
    const collectiveMediationProfileApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile || null;
    if (!contractApi || !calibrationSource || !sourceGroupProfileApi || !collectiveMediationProfileApi) return;

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
    const sourceGroupMap = () => new Map(
        (sourceGroupProfileApi.buildProfile().resolvedGroups || []).map((item) => [item.id, item])
    );
    const effectMap = () => new Map(
        (collectiveMediationProfileApi.buildProfile().resolvedRecords || []).map((item) => [item.id, item])
    );

    const validateCalibrationCandidate = (registryEntry = {}, calibrationCase = {}, sourceGroup = {}, effect = {}) => {
        const issues = [];
        if (!registryEntry.calibrationCaseId || registryEntry.calibrationCaseId !== calibrationCase.id) issues.push('calibration-case-registry-mismatch');
        if (registryEntry.motifId !== MOTIF_ID || calibrationCase.motifId !== MOTIF_ID) issues.push('mediation-motif-mismatch');
        if (!registryEntry.sourceGroupId || registryEntry.sourceGroupId !== sourceGroup.id) issues.push('source-group-registry-mismatch');
        if (!registryEntry.collectiveMediationEffectId || registryEntry.collectiveMediationEffectId !== effect.id) issues.push('collective-mediation-effect-registry-mismatch');
        if (!calibrationCase.chartKey || calibrationCase.chartKey !== sourceGroup.chartKey || calibrationCase.chartKey !== effect.chartKey) issues.push('chart-key-mismatch');
        if (calibrationCase.functionType !== CONTRACT.functionTypeRequired || effect.functionType !== CONTRACT.functionTypeRequired) issues.push('function-type-mismatch');
        if (calibrationCase.sourceExplicitOutcome !== true) issues.push('missing-source-explicit-outcome');
        if (calibrationCase.targetSpecificActorResolved !== false || calibrationCase.calibrationEligible !== false) issues.push('legacy-actor-specific-blocker-not-preserved');
        if (!(calibrationCase.blockerReasons || []).includes(CONTRACT.expectedLegacyBlocker)) issues.push('expected-multi-source-blocker-missing');

        if (!sameKeys(calibrationCase.sourceActorKeys, sourceGroup.memberActorKeys)) issues.push('calibration-source-set-group-mismatch');
        if (!sameKeys(calibrationCase.sourceActorKeys, effect.sourceMemberActorKeys)) issues.push('calibration-source-set-effect-mismatch');
        if (sourceGroup.status !== CONTRACT.sourceGroupStateRequired || sourceGroup.membershipComplete !== true) issues.push('source-group-not-resolved-complete');
        if (sourceGroup.groupIdentitySide !== 'relation-source') issues.push('source-group-side-mismatch');
        if (sourceGroup.scope !== 'visible-stem' || effect.sourceScope !== 'visible-stem') issues.push('source-group-scope-mismatch');
        if (sourceGroup.cardinality !== calibrationCase.sourceActorKeys?.length || effect.sourceCardinality !== sourceGroup.cardinality) issues.push('source-cardinality-mismatch');
        if (sourceGroup.sourceRoleClass !== '七杀' || effect.sourceRoleClass !== '七杀') issues.push('source-role-not-killer');

        if ((calibrationCase.targetActorKeys || []).length !== 1) issues.push('target-not-single-actor');
        if ((calibrationCase.targetActorTenGods || []).length !== 1) issues.push('target-ten-god-not-single');
        if (effect.targetActorKey !== calibrationCase.targetActorKeys?.[0]) issues.push('target-actor-effect-mismatch');
        if (effect.targetTenGod !== calibrationCase.targetActorTenGods?.[0]) issues.push('target-ten-god-effect-mismatch');
        if (effect.targetScope !== 'visible-stem') issues.push('target-scope-not-visible');

        if (effect.relationEffectState !== CONTRACT.collectiveMediationEffectStateRequired || effect.realized !== true) issues.push('collective-mediation-effect-not-realized');
        if (effect.relationType !== CONTRACT.collectiveMediationRelationTypeRequired) issues.push('collective-mediation-effect-type-mismatch');
        if (effect.relationIdentityType !== CONTRACT.calibrationIdentityType) issues.push('collective-relation-identity-type-mismatch');
        if (effect.sourceMemberEdgeExpansion !== false || effect.sourceMemberSpecificRealizationSynthesized !== false || (effect.sourceMemberEdges || []).length) issues.push('source-member-edge-expansion-detected');
        if (effect.reverseSealToKillerEdgeCreated !== false) issues.push('reverse-edge-detected');
        if (!(effect.sourceOutcomeTerms || []).includes('化杀')) issues.push('collective-mediation-effect-lacks-source-outcome');
        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues) });
    };

    const buildCalibrationRecord = (registryEntry = {}, sources = {}) => {
        const calibrationCase = sources.calibrationCases?.get(registryEntry.calibrationCaseId) || {};
        const sourceGroup = sources.sourceGroups?.get(registryEntry.sourceGroupId) || {};
        const effect = sources.effects?.get(registryEntry.collectiveMediationEffectId) || {};
        const validation = validateCalibrationCandidate(registryEntry, calibrationCase, sourceGroup, effect);
        if (!validation.valid) {
            return Object.freeze({
                id:`CF-SSME2E-${registryEntry.calibrationCaseId || 'UNKNOWN'}`,
                status:'unresolved-source-set-mediation-e2e-calibration',
                calibrationCaseId:registryEntry.calibrationCaseId || null,
                sourceGroupId:registryEntry.sourceGroupId || null,
                collectiveMediationEffectId:registryEntry.collectiveMediationEffectId || null,
                validation,
                sourceMemberEdges:Object.freeze([]),
                numericWeight:null
            });
        }
        return Object.freeze({
            id:`CF-SSME2E-${calibrationCase.id}`,
            status:'resolved-source-scoped-source-set-mediation-e2e-calibration',
            motifId:MOTIF_ID,
            calibrationIdentityType:CONTRACT.calibrationIdentityType,
            calibrationCaseId:calibrationCase.id,
            chartKey:calibrationCase.chartKey,
            sourceTerm:calibrationCase.sourceTerm,
            sourceGroupId:sourceGroup.id,
            sourceRoleClass:sourceGroup.sourceRoleClass,
            sourceScope:sourceGroup.scope,
            sourceMemberActorKeys:freezeArray(canonicalKeys(sourceGroup.memberActorKeys)),
            sourceCardinality:sourceGroup.cardinality,
            targetActorKey:effect.targetActorKey,
            targetTenGod:effect.targetTenGod,
            targetScope:effect.targetScope,
            collectiveMediationEffectId:effect.id,
            relationType:effect.relationType,
            functionType:effect.functionType,
            relationEffectState:effect.relationEffectState,
            sourceOutcomeTerms:freezeArray(effect.sourceOutcomeTerms || []),
            originalActorSpecificCalibration:Object.freeze({
                targetSpecificActorResolved:calibrationCase.targetSpecificActorResolved,
                calibrationEligible:calibrationCase.calibrationEligible,
                blockerReasons:freezeArray(calibrationCase.blockerReasons || [])
            }),
            sourceSetCalibrationResolved:true,
            sourceCaseScopedCalibration:true,
            sourceMemberSpecificRealizationSynthesized:false,
            sourceMemberEdgeExpansion:false,
            sourceMemberEdges:Object.freeze([]),
            reverseSealToKillerEdgeCreated:false,
            visibleFunctionRealizationRegistryMutation:false,
            genericVisibleEdgeMapping:null,
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'旧 calibration 的 multi-source blocker 在此保留，并由 source actor-set 模型消费；结果只校准 resolved source group→single visible 印 actor 的 collective mediation，不产生任何 member-specific 杀→印 realized edge。'
        });
    };

    const buildProfile = () => {
        const sources = Object.freeze({
            calibrationCases:calibrationCaseMap(),
            sourceGroups:sourceGroupMap(),
            effects:effectMap()
        });
        const records = freezeArray(Object.values(FINITE_CALIBRATION_REGISTRY).map((entry) => buildCalibrationRecord(entry, sources)));
        const resolvedRecords = records.filter((item) => item.sourceSetCalibrationResolved === true);
        const blockerRecords = records.filter((item) => item.sourceSetCalibrationResolved !== true);
        const allMediationCases = calibrationSource.CASES_BY_MOTIF?.[MOTIF_ID] || [];
        const registeredCaseIds = new Set(Object.keys(FINITE_CALIBRATION_REGISTRY));
        const unregisteredMediationCaseIds = freezeArray(allMediationCases.map((item) => item.id).filter((id) => !registeredCaseIds.has(id)));
        return Object.freeze({
            status:blockerRecords.length ? 'finite-source-set-mediation-calibration-partial' : 'finite-source-set-mediation-calibration-complete',
            resolverScope:CONTRACT.resolverScope,
            records,
            resolvedRecords:freezeArray(resolvedRecords),
            blockerRecords:freezeArray(blockerRecords),
            finiteRegistryCoverageComplete:blockerRecords.length === 0,
            registeredCalibrationCaseIds:freezeArray(records.map((item) => item.calibrationCaseId)),
            unregisteredMediationCaseIds,
            mediationCaseFamilyCoverageComplete:unregisteredMediationCaseIds.length === 0,
            actorSpecificVisibleEdgeCalibrationResolved:false,
            oppositionCalibrationAffected:false,
            genericVisibleEdgeMappingResolved:false,
            sourceMemberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            boundary:'v0.1 只覆盖 MED CASE-04 的 resolved source group + collective mediation effect；MED CASE-01/02/03/05 不因同属 mediation corpus 自动纳入。'
        });
    };

    GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationProfile = Object.freeze({
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
