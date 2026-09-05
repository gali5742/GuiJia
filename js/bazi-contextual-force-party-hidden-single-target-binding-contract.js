(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyHiddenSingleTargetBindingContract?.installed) return;

    const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource || null;
    const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource || null;
    if (!targetSource || !annotationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const BINDING_STATES = Object.freeze({
        RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-hidden-single-target',
        UNRESOLVED:'unresolved-hidden-single-target'
    });

    const TARGET_CASE_ID = 'CF-RTLC-CASE-06';
    const SOURCE_REGISTRY = Object.freeze({
        [TARGET_CASE_ID]:Object.freeze({
            sourceCaseId:TARGET_CASE_ID,
            annotationId:'CF-CRSA-ANN-04',
            targetRoleClass:'七杀',
            targetSemanticLevel:'single-actor',
            targetAntecedentSpan:'独杀',
            scope:'hidden-branch',
            sourcePositionWording:'时逢独杀',
            pillar:'hour',
            pillarIndex:3,
            expectedCardinality:1,
            sourcePositionCurated:true,
            runtimeLexicalPositionParserRequired:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-source-scoped-hidden-single-target-only',
        sourceCaseRegistryRequired:true,
        curatedSourcePositionRequired:true,
        curatedAntecedentRequired:true,
        chartKeyRequired:true,
        targetRoleClassRequired:true,
        hiddenScopeRequired:true,
        sourceCardinalityRequired:true,
        stableActorKeyRequired:true,
        existingHiddenActorKeySchemeRequired:true,
        hiddenActorKeyScheme:'hidden:<pillarIndex>:<zhi>:<gan>:<hiddenIndex>',
        runtimeClassicalChineseParserRequired:false,
        runtimeLexicalPositionParserRequired:false,
        sameRoleAcrossChartCreatesCandidate:false,
        sameElementAcrossChartCreatesCandidate:false,
        unregisteredCaseAutoBinding:false,
        sourceScopedBindingCreatesGenericRule:false,
        bindingCreatesRelationEffect:false,
        bindingCreatesMembership:false,
        bindingCreatesRelativeDominance:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Hidden Single Target Binding v0.1 只处理人工审定 registry 中具有明确 chart、target role、antecedent、hidden scope、source position 与 cardinality 的命例。CASE-06 的“四食相制”回指“独杀”，“时逢独杀”被审定为 hour pillar provenance；程序只在该柱既有 cangGan inventory 中寻找七杀 role，要求唯一 candidate 后返回现有统一 hidden actorKey。'
    });

    GuiJia.baziContextualForcePartyHiddenSingleTargetBindingContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        BINDING_STATES,
        TARGET_CASE_ID,
        SOURCE_REGISTRY,
        CONTRACT,
        sourceCaseIds:freezeArray(Object.keys(SOURCE_REGISTRY))
    });
})(typeof window !== 'undefined' ? window : globalThis);