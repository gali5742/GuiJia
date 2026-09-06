(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeContract?.installed) return;

    const positionSource = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource || null;
    const modernSupportSource = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    if (!positionSource || !modernSupportSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const ALTERNATIVE_STATES = Object.freeze({
        RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-counterfactual-placement-alternative',
        UNRESOLVED:'unresolved-counterfactual-placement-alternative'
    });

    const ALTERNATIVE_KINDS = Object.freeze({
        PLACEMENT_CLASS:'counterfactual-placement-class'
    });

    const SOURCE_REGISTRY = Object.freeze({
        'CF-PCPA-REC-01':Object.freeze({
            id:'CF-PCPA-REC-01',
            positionRecordId:'CF-RPP-REC-04',
            modernEvidenceIds:freezeArray(['CF-RSMS-E04','CF-RSMS-E05']),
            chartKey:'壬午 癸卯 己巳 辛未',
            sourceId:'CF-RPP-SRC-XLW',
            interpretationContested:true,
            alternativeKind:ALTERNATIVE_KINDS.PLACEMENT_CLASS,
            participantId:'food',
            participantRoleClass:'食神',
            participantGan:'辛',
            originalActorKey:'visible:3:辛',
            originalPillar:'hour',
            originalPillarIndex:3,
            counterfactualWording:'如辛在年月',
            alternativePillarOptions:freezeArray([
                Object.freeze({ pillar:'year', pillarIndex:0 }),
                Object.freeze({ pillar:'month', pillarIndex:1 })
            ]),
            actualInterpretationWording:'年月财生煞旺，时上食以制之',
            alternativeInterpretationWording:'如辛在年月，则为食神生财，财生煞之局',
            alternativeChartComplete:false,
            displacedActorResolutionDefined:false,
            exactAlternativeActorKeyDefined:false,
            runtimePlacementMatcherDefined:false
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-xu-lewu-chengqian-counterfactual-placement-class-only',
        sourceRegistryRequired:true,
        sourcePositionRecordRequired:true,
        modernSupportEvidenceRequired:true,
        interpretationContestedProvenanceRequired:true,
        originalPlacementIdentityRequired:true,
        sourceWordingRequired:true,
        alternativePlacementOptionsCurated:true,
        runtimeLexicalPlacementParserRequired:false,
        alternativeKind:ALTERNATIVE_KINDS.PLACEMENT_CLASS,
        alternativeChartCompleteRequired:false,
        sourceWordingDefinesCompleteAlternativeChart:false,
        displacedActorResolutionDefined:false,
        exactAlternativeActorKeyDefined:false,
        placementClassEqualsExactPlacement:false,
        counterfactualPlacementAuthorizesRelationExecution:false,
        counterfactualPlacementSelectsRuntimePath:false,
        counterfactualPlacementCreatesChartMutation:false,
        interpretationContestedCanBecomeUniversalRule:false,
        memberEdgeExpansion:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        sourceRecordIds:freezeArray(Object.keys(SOURCE_REGISTRY)),
        statement:'Counterfactual Placement Alternative v0.1 只结构化徐乐吾程潜命例中的“如辛在年月”。它保留实际盘时上辛食神与 counterfactual 年／月 placement class 的来源对照，但原文没有给出一张完整替代四柱，也没有说明被辛占据位置的原干如何安置，因此不得构造替代命盘、替代 actorKey 或 executable relation。'
    });

    GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        ALTERNATIVE_STATES,
        ALTERNATIVE_KINDS,
        SOURCE_REGISTRY,
        CONTRACT,
        sourceRecordIds:freezeArray(Object.keys(SOURCE_REGISTRY))
    });
})(typeof window !== 'undefined' ? window : globalThis);
