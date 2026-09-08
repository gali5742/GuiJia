(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract?.installed) return;

    const normalizedInputContract = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract || null;
    if (!normalizedInputContract) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const TARGET_LEVELS = Object.freeze({
        ROLE_CLASS:'role-class',
        ACTOR_SET:'actor-set',
        SINGLE_ACTOR:'single-actor',
        CONFIGURATION:'configuration'
    });

    const RESOLUTION_STATES = Object.freeze({
        RESOLVED_ROLE_CLASS:'resolved-generic-role-class',
        RESOLVED_ACTOR_SET:'resolved-generic-actor-set',
        RESOLVED_SINGLE_ACTOR:'resolved-generic-single-actor',
        RESOLVED_CONFIGURATION:'resolved-generic-configuration',
        RESOLVED_RELATION_TARGET_RECORD:'resolved-generic-relation-target-record',
        NOT_APPLICABLE_NO_RELATION_TARGET:'not-applicable-no-relation-target',
        UNRESOLVED_UNIT:'unresolved-generic-target-unit',
        UNRESOLVED_RECORD:'unresolved-generic-target-record'
    });

    const TARGET_REFERENCE_TYPES = Object.freeze({
        ROLE_CLASS:'role-class',
        ACTOR_GROUP:'actor-group',
        ACTOR_KEY:'actor-key',
        CONFIGURATION_STATE:'configuration-state',
        NONE:'none'
    });

    const SOURCE_CONTEXT_TYPES = Object.freeze({
        THEORY_GENERAL:'theory-general',
        CHART_CASE:'chart-case',
        MIXED_COMMENTARY:'mixed-commentary'
    });

    const PREDICATE_TYPES = Object.freeze({
        RELATION_EVENT:'relation-event',
        GENERALIZED_RELATION_RULE:'generalized-relation-rule',
        CONFIGURATION_STATE:'configuration-state',
        INSTANCE_DESCRIPTION:'instance-description'
    });

    const DECISION_RULES = Object.freeze([
        Object.freeze({
            id:'GTLR-R01-NO-TARGET',
            output:'not-applicable-no-relation-target',
            statement:'annotationDisposition=no-relation-target 且 normalized record 有效时，返回合法 not-applicable，不制造 target。'
        }),
        Object.freeze({
            id:'GTLR-R02-CONFIGURATION',
            output:TARGET_LEVELS.CONFIGURATION,
            statement:'annotationDisposition=configuration-state-only 且 configurationSpans 有来源时，解析为 configuration；不物化 actor/group。'
        }),
        Object.freeze({
            id:'GTLR-R03-THEORY-ROLE-CLASS',
            output:TARGET_LEVELS.ROLE_CLASS,
            statement:'theory-general + generalized-relation-rule + 无 chart binding 要求 + target role provenance 完整时，relation-target unit 解析为 role-class。'
        }),
        Object.freeze({
            id:'GTLR-R04-CHART-SINGLE-ACTOR',
            output:TARGET_LEVELS.SINGLE_ACTOR,
            statement:'chart-case + relation-event + bindingRequired + source-scoped resolved actor identity + actorKey/scope/cardinality=1 时，解析为 single-actor。'
        }),
        Object.freeze({
            id:'GTLR-R05-CHART-ACTOR-SET',
            output:TARGET_LEVELS.ACTOR_SET,
            statement:'chart-case + relation-event + bindingRequired + source-scoped resolved actor-group identity + groupId/scope/cardinality/member completeness 时，解析为 actor-set。'
        }),
        Object.freeze({
            id:'GTLR-R06-FAIL-CLOSED',
            output:'unresolved',
            statement:'未满足上述 provenance gate 时保持 unresolved；不得用 case id、source text、数量词或 semantic hint 补足。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT-001',
        version:VERSION,
        resolverInput:'relation-target-normalized-provenance-input-v0.1',
        resolverUnit:'relation-target-unit',
        genericDecisionKernelDefined:true,
        sourceCaseIdIsDecisionFeature:false,
        annotationIdIsDecisionFeature:false,
        sourceTextIsDecisionFeature:false,
        lexicalMarkersAreDecisionFeatures:false,
        expectedTargetLevelIsInput:false,
        semanticLevelHintIsInput:false,
        legacyResolutionIsInput:false,
        curatedFiniteResolverIsDependency:false,
        sentenceLevelSingleLabelRejected:true,
        unresolvedOutcomeSupported:true,
        noRelationTargetIsNotUnresolved:true,
        configurationDoesNotCreateActorIdentity:true,
        roleClassRequiresTheoryGeneral:true,
        roleClassRequiresGeneralizedRelationRule:true,
        roleClassRequiresIdentityNotRequired:true,
        instanceLevelRequiresChartCase:true,
        instanceLevelRequiresChartKey:true,
        instanceLevelRequiresRelationEvent:true,
        instanceLevelRequiresBindingRequired:true,
        instanceLevelRequiresSourceScopedIdentity:true,
        singleActorRequiresActorKeyScopeAndCardinalityOne:true,
        actorSetRequiresGroupIdScopeCardinalityAndCompleteMembers:true,
        mixedCommentaryRequiresUpstreamSegmentation:true,
        broaderSourceCoverageProven:false,
        globalSourceCoverageResolved:false,
        runtimeClassicalChineseParser:false,
        runtimeLexicalShortcutResolver:false,
        relationEffectExecution:false,
        membershipMutation:false,
        relativeDominanceMapping:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Generic Target-Level Resolver v0.1 只消费 Relation Target Normalized Input。它用 source context、predicate、binding requirement 与已解析 identity provenance 判定 role-class / single-actor / actor-set / configuration；case id、source text、expectedTargetLevel、semanticLevelHint 与旧 finite resolution 都不是决策特征。当前只定义 generic decision kernel，不声称 broader source coverage 或最终 global coverage 已完成。'
    });

    GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        TARGET_LEVELS,
        RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        SOURCE_CONTEXT_TYPES,
        PREDICATE_TYPES,
        DECISION_RULES:freezeArray(DECISION_RULES),
        IDENTITY_PROVENANCE_STATES:normalizedInputContract.IDENTITY_PROVENANCE_STATES,
        ENDPOINT_TYPES:normalizedInputContract.ENDPOINT_TYPES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
