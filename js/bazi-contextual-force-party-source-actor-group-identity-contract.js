(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceActorGroupIdentityContract?.installed) return;

    const calibrationSource = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource || null;
    const collectiveSemanticsSource = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource || null;
    if (!calibrationSource || !collectiveSemanticsSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const GROUP_STATES = Object.freeze({
        RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-finite-source-group',
        UNRESOLVED:'unresolved-source-actor-group-identity'
    });

    const MEDIATION_MOTIF_ID = calibrationSource.MOTIF_IDS.MEDIATION;
    const FINITE_SOURCE_GROUP_REGISTRY = Object.freeze({
        'CF-VMEC-MED-CASE-04':Object.freeze({
            id:'CF-SAGI-GROUP-01',
            sourceCaseId:'CF-VMEC-MED-CASE-04',
            motifId:MEDIATION_MOTIF_ID,
            sourceRoleClass:'七杀',
            scope:'visible-stem',
            expectedCardinality:2,
            requiredSourceMarkers:freezeArray(['干透两杀']),
            schemaEvidenceIds:freezeArray(['CF-CTS-E02','CF-CTS-E09'])
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-visible-finite-source-actor-set-only',
        groupIdentitySide:'relation-source',
        semanticLevel:collectiveSemanticsSource.TARGET_SEMANTIC_LEVELS.ACTOR_SET,
        exactSourceCaseRegistryRequired:true,
        exactChartRequired:true,
        explicitSourceCardinalityRequired:true,
        sourceWordingProvenanceRequired:true,
        sameRoleMembersRequired:true,
        sameScopeMembersRequired:true,
        visibleFiniteSourceGroupDefined:true,
        crossScopeSourceGroupDefined:false,
        unregisteredSourceGroupResolution:false,
        targetActorGroupContractMutation:false,
        sourceGroupEqualsTargetGroup:false,
        sourceGroupIdentityEqualsRelationExecution:false,
        sourceGroupIdentityEqualsMediationExecution:false,
        sourceGroupIdentityEqualsMemberEdges:false,
        memberOrderSemantic:false,
        memberEdgeExpansion:false,
        membershipMutation:false,
        actorGlobalParty:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Source Actor Group Identity v0.1 只为《滴天髓阐微》MED CASE-04 的“干透两杀”建立 relation-source 侧有限 actor-set identity：月干丙与时干丙同属七杀、同为 visible stem、来源明确“两杀”。该 group 与既有 relation-target Actor Group Identity 平行，不授权“化杀” execution，不扩展到 cross-scope“七杀皆来”，也不把 group outcome 拆成 member edges。'
    });

    GuiJia.baziContextualForcePartySourceActorGroupIdentityContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        GROUP_STATES,
        MEDIATION_MOTIF_ID,
        FINITE_SOURCE_GROUP_REGISTRY,
        CONTRACT,
        freezeArray
    });
})(typeof window !== 'undefined' ? window : globalThis);
