(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCuratedTargetResolverContract?.installed) return;

    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    if (!targetSource || !annotationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const RESOLUTION_STATES = Object.freeze({
        RESOLVED_ROLE_CLASS:'resolved-source-scoped-role-class',
        RESOLVED_ACTOR_SET:'resolved-source-scoped-actor-set',
        RESOLVED_SINGLE_ACTOR:'resolved-source-scoped-single-actor',
        RESOLVED_CONFIGURATION:'resolved-source-scoped-configuration',
        NOT_APPLICABLE_NO_RELATION_TARGET:'not-applicable-no-relation-target',
        UNRESOLVED:'unresolved-curated-target'
    });

    const TARGET_REFERENCE_TYPES = Object.freeze({
        ROLE_CLASS:'role-class',
        ACTOR_GROUP:'actor-group',
        ACTOR_KEY:'actor-key',
        CONFIGURATION_STATE:'configuration-state',
        NONE:'none'
    });

    const FINITE_CASE_IDS = freezeArray((targetSource.AUDIT_CASES || []).map((item) => item.id));

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER-CONTRACT-001',
        version:VERSION,
        resolverScope:'relation-target-semantic-level-contract-eight-case-audit-corpus-only',
        curatedAnnotationRequired:true,
        sourceCaseIdRequired:true,
        sourcePredicateTypeRequired:true,
        annotationDispositionRequired:true,
        instanceIdentityAdapterRequired:true,
        actorSetConsumesActorGroupIdentity:true,
        singleActorConsumesHiddenSingleTargetBinding:true,
        roleClassDoesNotCreateChartActor:true,
        configurationDoesNotCreateActorIdentity:true,
        noRelationTargetIsNotUnresolved:true,
        zeroRelationUnitAnnotationSupported:true,
        mixedRelationTargetLevelsRequireUnresolved:true,
        finiteResolutionCreatesGlobalResolver:false,
        runtimeClassicalChineseParserRequired:false,
        runtimeLexicalShortcutResolver:false,
        genericRoleToActorBinding:false,
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
        finiteCaseIds:FINITE_CASE_IDS,
        statement:'Curated Finite Target Resolver v0.1 只消费 Relation Target Contract 的 8 个审定 case、Curated Annotation v0.2、Actor Group Identity v0.1 与 Hidden Single Target Binding v0.1。它允许 role-class / actor-set / single-actor / configuration / no-relation-target 五种 source-scoped 结果，但不把 finite corpus 解析能力提升为 global resolver。'
    });

    GuiJia.baziContextualForcePartyCuratedTargetResolverContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES,
        FINITE_CASE_IDS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);