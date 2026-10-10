(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerContract?.installed) return;
    const source = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource;
    if (!source) return;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER-001';
    const freeze = (value) => {
        if (value && typeof value === 'object') {
            Object.values(value).forEach(freeze);
            Object.freeze(value);
        }
        return value;
    };
    const copy = (value) => JSON.parse(JSON.stringify(value));
    const STATES = freeze({
        NORMALIZED:'normalized-source-scoped-position-input',
        INVALID:'unresolved-position-input',
        PATTERN:'preserved-source-pattern-position-provenance',
        RESOLVED:'resolved-source-scoped-position-provenance',
        UNRESOLVED:'unresolved-source-scoped-position-provenance'
    });
    // Curated semantic annotations, never selected by parsing wording or measuring pillars.
    const ANNOTATIONS = freeze({
        'CF-RPP-REC-01-A01':[{ mode:'source-pattern', refIds:['wealth','food'], qualifier:'ordered', orderedRefIds:['wealth','food'] }],
        'CF-RPP-REC-01-A02':[{ mode:'source-pattern', refIds:['food','wealth'], qualifier:'ordered', orderedRefIds:['food','wealth'] }],
        'CF-RPP-REC-02-A01':[{ mode:'source-pattern', refIds:['wu','gui','jia'], qualifier:'intervening-mentioned', intermediateRefIds:['jia'], presence:'present' }],
        'CF-RPP-REC-02-A02':[{ mode:'source-pattern', refIds:['gui','ji','xin'], qualifier:'separation-absent', intermediateRefIds:['xin'], presence:'absent' }],
        'CF-RPP-REC-03-A01':[
            { mode:'conditional-source-pattern', refIds:['food','killer'], qualifier:'proximity', alternativeGroupId:'CF-RPP-REC-03-A01-ALTERNATIVES' },
            { mode:'conditional-source-pattern', refIds:['food','officer'], qualifier:'proximity', alternativeGroupId:'CF-RPP-REC-03-A01-ALTERNATIVES' }
        ],
        'CF-RPP-REC-04-A01':[{ mode:'actual-source-chart', refIds:['wealth-set','food','killer'], qualifier:'absolute-placement' }],
        'CF-RPP-REC-05-A01':[{ mode:'counterfactual-source-chart', refIds:['killer','seal'], qualifier:'swap' }]
    });
    const SOURCE_REGISTRY = freeze(Object.fromEntries(source.RECORDS.map((record) => [record.id, copy(record)])));
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER-CONTRACT-001', version:VERSION,
        consumerScope:'registered-source-position-assertion-provenance-only',
        sourcePositionContractId:source.CONTRACT.id, sourceRuleId:source.RULE_ID,
        normalizedSourceIdentityRequired:true, curatedAssertionIdentityRequired:true,
        exactChartRequiredForActorBinding:true, visibleActorBindingDefined:true,
        roleClassPatternCreatesActorBinding:false, surfaceOrHiddenActorBindingDefined:false,
        conditionalProximitySelectsRuntimeTarget:false, absentBarrierCreatesIntermediateActor:false,
        counterfactualPlacementsCreateAlternativeActors:false, runtimeChineseParser:false,
        rawDistanceDefinesProximity:false, betweenIndexesDefineInterveningActors:false,
        genericPositionResolverDefined:false, corpusPositionCoverageComplete:false,
        competingPathResolverDefined:false, relationExecutionAuthorized:false,
        numericWeights:false, ranking:false, finalStrengthMapping:false,
        boundary:'R10 consumes the five audited position records as source-scoped provenance. Source-pattern assertions, absent barriers and counterfactual placements remain distinct; no distance priority, path selection, realization or effect authorization follows.'
    });
    GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerContract = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, ANNOTATIONS, SOURCE_REGISTRY, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
