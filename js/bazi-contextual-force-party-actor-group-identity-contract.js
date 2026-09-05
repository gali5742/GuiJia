(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyActorGroupIdentityContract?.installed) return;

    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const collectiveSource = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource || null;
    if (!targetSource || !collectiveSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const GROUP_SCOPES = Object.freeze({
        VISIBLE_STEM:'visible-stem'
    });

    const GROUP_STATES = Object.freeze({
        RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-finite-group',
        UNRESOLVED:'unresolved'
    });

    const FINITE_GROUP_SOURCE_REGISTRY = Object.freeze({
        'CF-RTLC-CASE-04':Object.freeze({
            sourceCaseId:'CF-RTLC-CASE-04',
            groupId:'CF-AGI-GROUP-01',
            targetRoleClass:'七杀',
            scope:GROUP_SCOPES.VISIBLE_STEM,
            expectedCardinality:2,
            statement:'“庚金并透”在具体命例中与两枚 visible 庚 candidate、明确 cardinality=2 对齐，只授权本 source case 的有限 actor-set identity。'
        }),
        'CF-RTLC-CASE-05':Object.freeze({
            sourceCaseId:'CF-RTLC-CASE-05',
            groupId:'CF-AGI-GROUP-02',
            targetRoleClass:'七杀',
            scope:GROUP_SCOPES.VISIBLE_STEM,
            expectedCardinality:2,
            statement:'“两杀”在具体命例中与两枚 visible 丙 candidate、明确 cardinality=2 对齐，只授权本 source case 的有限 actor-set identity。'
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-finite-same-role-single-scope-chart-case-only',
        targetSemanticLevelRequired:collectiveSource.TARGET_SEMANTIC_LEVELS.ACTOR_SET,
        sourceContextTypeRequired:targetSource.SOURCE_CONTEXT_TYPES.CHART_CASE,
        predicateTypeRequired:targetSource.PREDICATE_TYPES.RELATION_EVENT,
        stableChartLocalCandidateKeysRequired:true,
        uniqueMemberActorKeysRequired:true,
        explicitCardinalityRequired:true,
        cardinalityMustEqualUniqueMemberCount:true,
        sourceRegistryCardinalityMustAgree:true,
        singleKnownScopeRequired:true,
        membershipCompletenessRequired:true,
        sourceCaseScopedIdentity:true,
        memberOrderSemantic:false,
        sameTenGodAutomaticallyFormsGroup:false,
        sameElementAutomaticallyFormsGroup:false,
        sameStemAutomaticallyFormsGroup:false,
        lexicalCollectiveMarkerAloneFormsGroup:false,
        crossScopeGroupIdentityDefined:false,
        singularActorIdentityDefined:false,
        roleClassCreatesGroup:false,
        configurationCreatesGroup:false,
        groupOutcomeExpandsToMemberEdges:false,
        collectiveRelationEffectExecutionDefined:false,
        relationRealizationMutation:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        relativeDominanceMapping:false,
        finalStrengthMapping:false,
        statement:'Actor Group Identity v0.1 只解决已审定命例中有限、同角色、单一已知 scope 的 actor-set identity。必须同时具备 actor-set target 语义、chart-case relation event、稳定候选 actorKey、明确 cardinality 与 scope，并通过 source-case registry。Group identity 只表示来源指称的有限成员集合，不表示 collective relation 已执行，也不生成 member edges、力量值或相对强弱。'
    });

    GuiJia.baziContextualForcePartyActorGroupIdentityContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        GROUP_SCOPES,
        GROUP_STATES,
        FINITE_GROUP_SOURCE_REGISTRY,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
