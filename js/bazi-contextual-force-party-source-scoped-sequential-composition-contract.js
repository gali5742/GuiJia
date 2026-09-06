(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourceScopedSequentialCompositionContract?.installed) return;

    const competingPathSource = GuiJia.baziContextualForcePartyCompetingRelationPathSource || null;
    const positionSource = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource || null;
    if (!competingPathSource || !positionSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);

    const COMPOSITION_STATES = Object.freeze({
        RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-sequential-composition',
        UNRESOLVED:'unresolved-source-scoped-sequential-composition'
    });

    const COMPOSITION_INTERACTION_KINDS = Object.freeze({
        ORDERED_COEXISTENCE:'ordered-coexistence',
        LATER_COMPOUND_REFRAMES_COMPOSITION:'later-compound-path-reframes-composition'
    });

    const SOURCE_REGISTRY = Object.freeze({
        'CF-CRP-REC-01':Object.freeze({
            sourceRecordId:'CF-CRP-REC-01',
            relationAssertionId:'CF-CRP-REC-01-A01',
            conditionId:'CF-CRP-REC-01-C01',
            positionEvidenceId:'CF-RPP-REC-01-A01',
            expectedOrderedPathIds:freezeArray(['CF-CRP-REC-01-P01','CF-CRP-REC-01-P02']),
            interactionKind:COMPOSITION_INTERACTION_KINDS.ORDERED_COEXISTENCE,
            expectedContainsCompoundPath:false,
            laterCompoundPathReframesComposition:false
        }),
        'CF-CRP-REC-02':Object.freeze({
            sourceRecordId:'CF-CRP-REC-02',
            relationAssertionId:'CF-CRP-REC-02-A01',
            conditionId:'CF-CRP-REC-02-C01',
            positionEvidenceId:'CF-RPP-REC-01-A02',
            expectedOrderedPathIds:freezeArray(['CF-CRP-REC-02-P01','CF-CRP-REC-02-P02']),
            interactionKind:COMPOSITION_INTERACTION_KINDS.LATER_COMPOUND_REFRAMES_COMPOSITION,
            expectedContainsCompoundPath:true,
            laterCompoundPathReframesComposition:true
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-CONTRACT-001',
        version:VERSION,
        resolverScope:'audited-source-ordered-coexisting-path-records-cf-crp-rec-01-02-only',
        sourceRegistryRequired:true,
        competingPathSourceRecordRequired:true,
        sourceOrderedAssertionRequired:true,
        sourcePermitsCoexistenceRequired:true,
        sourceConditionalAssertionRequired:true,
        positionOrderProvenanceRequired:true,
        exactOrderedPathIdentityRequired:true,
        sourceOrderIsCompositionSequence:true,
        sourceOrderEqualsRuntimePriority:false,
        compositionSequenceExecutesPaths:false,
        pathPresenceEqualsExecution:false,
        runtimeWinnerSelection:false,
        runtimeArbitraryChartOrderMatcherDefined:false,
        compoundSourceRelationPreserved:true,
        compoundSourceRelationExpandsToDirectEdges:false,
        memberEdgeExpansion:false,
        laterCompoundPathMayReframeCompositionOnlyWhenSourceRegistered:true,
        independentPathAggregation:false,
        numericAggregation:false,
        numericWeights:false,
        thresholding:false,
        majorityVoting:false,
        ranking:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        sourceRecordIds:freezeArray(Object.keys(SOURCE_REGISTRY)),
        statement:'Source-Scoped Sequential Composition v0.1 只处理《子平真诠》七煞财食先后中已登记的 CF-CRP-REC-01/02。它把 source-ordered coexistence 保存为 composition sequence：财先食后保留“财助杀→食制杀”的来源顺序；食先财后保留“食制杀→财转食党杀”的来源顺序，并把后一 compound source relation 作为整体保存。来源顺序不是 numeric priority，composition 也不执行 path、选择 winner 或生成 Strength。'
    });

    GuiJia.baziContextualForcePartySourceScopedSequentialCompositionContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        COMPOSITION_STATES,
        COMPOSITION_INTERACTION_KINDS,
        SOURCE_REGISTRY,
        CONTRACT,
        sourceRecordIds:freezeArray(Object.keys(SOURCE_REGISTRY))
    });
})(typeof window !== 'undefined' ? window : globalThis);
