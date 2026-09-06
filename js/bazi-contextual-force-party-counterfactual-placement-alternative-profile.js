(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeContract || null;
    const positionSource = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource || null;
    const modernSupportSource = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    if (!contractApi || !positionSource || !modernSupportSource) return;

    const { VERSION, RULE_ID, ALTERNATIVE_STATES, SOURCE_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const positionRecordById = Object.freeze(Object.fromEntries((positionSource.RECORDS || []).map((item) => [item.id, item])));
    const modernEvidenceById = Object.freeze(Object.fromEntries((modernSupportSource.EVIDENCE || []).map((item) => [item.id, item])));

    const validateAlternativeCandidate = (registryEntry = {}) => {
        const issues = [];
        const positionRecord = positionRecordById[registryEntry.positionRecordId] || null;
        const modernEvidence = (registryEntry.modernEvidenceIds || []).map((id) => modernEvidenceById[id]).filter(Boolean);
        const placementAssertion = (positionRecord?.assertions || []).find((assertion) =>
            (assertion.participants || []).some((participant) =>
                participant.id === registryEntry.participantId &&
                (participant.candidateActorKeys || []).includes(registryEntry.originalActorKey)
            )
        ) || null;
        const participant = (placementAssertion?.participants || []).find((item) => item.id === registryEntry.participantId) || null;
        const optionPairs = (registryEntry.alternativePillarOptions || []).map((item) => `${item.pillar}:${item.pillarIndex}`);

        if (!registryEntry.id) issues.push('missing-registry-id');
        if (!positionRecord) issues.push('missing-position-record');
        if (positionRecord && positionRecord.chartKey !== registryEntry.chartKey) issues.push('chart-key-mismatch');
        if (positionRecord && positionRecord.sourceId !== registryEntry.sourceId) issues.push('source-id-mismatch');
        if (positionRecord && positionRecord.interpretationContested !== registryEntry.interpretationContested) issues.push('interpretation-contested-provenance-mismatch');
        if (!placementAssertion) issues.push('missing-original-placement-assertion');
        if (placementAssertion?.kind !== 'absolute-placement') issues.push('original-placement-is-not-absolute-placement');
        if (!participant) issues.push('missing-original-placement-participant');
        if (participant) {
            if (participant.roleClass !== registryEntry.participantRoleClass) issues.push('participant-role-class-mismatch');
            if (!(participant.candidateActorKeys || []).includes(registryEntry.originalActorKey)) issues.push('original-actor-key-mismatch');
            if (!(participant.pillarLabels || []).includes(registryEntry.originalPillar)) issues.push('original-pillar-label-mismatch');
            if (!(participant.pillarIndexes || []).includes(registryEntry.originalPillarIndex)) issues.push('original-pillar-index-mismatch');
            if (participant.bindingResolved !== true) issues.push('original-participant-binding-must-be-resolved');
        }
        if (!String(positionRecord?.sourceExtract || '').includes(registryEntry.counterfactualWording || '')) issues.push('counterfactual-wording-not-in-position-source');
        if (!String(positionRecord?.sourceExtract || '').includes('时上食以制之')) issues.push('actual-placement-wording-not-in-position-source');
        if ((registryEntry.modernEvidenceIds || []).length !== modernEvidence.length) issues.push('missing-modern-support-evidence');
        modernEvidence.forEach((evidence) => {
            if (evidence.sourceId !== modernSupportSource.SOURCES?.xuLewu?.id) issues.push(`modern-evidence-source-mismatch:${evidence.id || ''}`);
        });
        if (!(registryEntry.modernEvidenceIds || []).includes('CF-RSMS-E04') || !(registryEntry.modernEvidenceIds || []).includes('CF-RSMS-E05')) issues.push('required-modern-evidence-pair-missing');
        if (!modernEvidenceById['CF-RSMS-E04']?.supports?.includes('position-provenance')) issues.push('actual-placement-modern-evidence-missing-position-support');
        if (!modernEvidenceById['CF-RSMS-E05']?.supports?.includes('relation-path-alternatives')) issues.push('counterfactual-modern-evidence-missing-path-alternative-support');
        if (registryEntry.alternativeKind !== 'counterfactual-placement-class') issues.push('invalid-alternative-kind');
        if (optionPairs.length !== 2 || !optionPairs.includes('year:0') || !optionPairs.includes('month:1')) issues.push('alternative-placement-options-must-be-year-month-class');
        if (registryEntry.alternativeChartComplete !== false) issues.push('alternative-chart-must-remain-incomplete');
        if (registryEntry.displacedActorResolutionDefined !== false) issues.push('displaced-actor-resolution-must-remain-undefined');
        if (registryEntry.exactAlternativeActorKeyDefined !== false) issues.push('exact-alternative-actor-key-must-remain-undefined');
        if (registryEntry.runtimePlacementMatcherDefined !== false) issues.push('runtime-placement-matcher-must-remain-undefined');

        return Object.freeze({
            valid:issues.length === 0,
            issues:freezeArray(issues),
            positionRecord,
            placementAssertion,
            participant,
            modernEvidence:freezeArray(modernEvidence)
        });
    };

    const buildAlternative = (registryEntry = {}) => {
        const validation = validateAlternativeCandidate(registryEntry);
        if (!validation.valid) {
            return Object.freeze({
                status:ALTERNATIVE_STATES.UNRESOLVED,
                id:registryEntry.id || null,
                positionRecordId:registryEntry.positionRecordId || null,
                participantRoleClass:registryEntry.participantRoleClass || null,
                originalActorKey:registryEntry.originalActorKey || null,
                alternativePlacementOptions:freezeArray(registryEntry.alternativePillarOptions || []),
                exactAlternativeActorKey:null,
                alternativeChart:null,
                executableRelationAuthorization:false,
                runtimePathSelection:null,
                numericWeight:null,
                validation
            });
        }

        return Object.freeze({
            status:ALTERNATIVE_STATES.RESOLVED_SOURCE_SCOPED,
            id:registryEntry.id,
            sourceId:registryEntry.sourceId,
            positionRecordId:registryEntry.positionRecordId,
            modernEvidenceIds:freezeArray(registryEntry.modernEvidenceIds),
            chartKey:registryEntry.chartKey,
            interpretationContested:true,
            participant:Object.freeze({
                id:registryEntry.participantId,
                roleClass:registryEntry.participantRoleClass,
                gan:registryEntry.participantGan,
                originalActorKey:registryEntry.originalActorKey,
                originalPillar:registryEntry.originalPillar,
                originalPillarIndex:registryEntry.originalPillarIndex
            }),
            counterfactualWording:registryEntry.counterfactualWording,
            alternativeKind:registryEntry.alternativeKind,
            alternativePlacementOptions:freezeArray((registryEntry.alternativePillarOptions || []).map((item) => Object.freeze({ ...item }))),
            actualInterpretationWording:registryEntry.actualInterpretationWording,
            alternativeInterpretationWording:registryEntry.alternativeInterpretationWording,
            alternativeChartComplete:false,
            alternativeChart:null,
            displacedActorResolutionDefined:false,
            displacedActorResolution:null,
            exactAlternativeActorKeyDefined:false,
            exactAlternativeActorKey:null,
            runtimePlacementMatcherDefined:false,
            runtimePlacementMatcher:null,
            executableRelationAuthorization:false,
            runtimePathSelection:null,
            chartMutation:null,
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericWeight:null,
            validation,
            boundary:'“如辛在年月”只被解析为 year/month placement class。来源没有提供完整替代四柱，也没有定义原年月财星被如何重新安置，因此不得构造 alternate chart、alternate actorKey 或 relation execution。'
        });
    };

    const buildProfile = () => {
        const alternatives = freezeArray(Object.values(SOURCE_REGISTRY).map(buildAlternative));
        const resolvedAlternatives = alternatives.filter((item) => item.status === ALTERNATIVE_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedAlternatives = alternatives.filter((item) => item.status !== ALTERNATIVE_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedAlternatives.length ? 'counterfactual-placement-alternative-partial' : 'counterfactual-placement-alternative-complete',
            resolverScope:CONTRACT.resolverScope,
            alternatives,
            resolvedAlternatives:freezeArray(resolvedAlternatives),
            unresolvedAlternatives:freezeArray(unresolvedAlternatives),
            finiteCoverageComplete:alternatives.length === Object.keys(SOURCE_REGISTRY).length && unresolvedAlternatives.length === 0,
            runtimePlacementMatcher:null,
            alternativeCharts:Object.freeze([]),
            relationEffects:Object.freeze([]),
            memberEdges:Object.freeze([]),
            relativeDominance:null,
            numericScore:null,
            scalarForce:null
        });
    };

    GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        ALTERNATIVE_STATES,
        CONTRACT,
        validateAlternativeCandidate,
        buildAlternative,
        buildProfile
    });
})(typeof window !== 'undefined' ? window : globalThis);
