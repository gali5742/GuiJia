(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract?.installed) return;
    const position = GuiJia.baziContextualForcePartySourcePositionProvenanceConsumerContract;
    const paths = GuiJia.baziContextualForcePartyCompetingRelationPathSource;
    if (!position || !paths) return;
    const { freeze } = position;
    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER-001';
    const STATES = freeze({
        MATCHED:'matched-source-position-path-condition',
        NOT_SATISFIED:'not-satisfied-source-position-path-condition',
        NOT_APPLICABLE:'source-position-path-condition-not-applicable',
        UNRESOLVED:'unresolved-source-position-path-condition'
    });
    // The second clause inherits 己生卯月 from the same comparison paragraph.
    // This inheritance is curated provenance, not a runtime lexical inference.
    const orderContext = { sourceRecordId:'CF-CRP-REC-01', sourceSpan:'如己生卯月',
        dayGan:'己', monthZhi:'卯', inheritance:'same-source-comparison-paragraph' };
    const LINK_REGISTRY = freeze({
        'CF-SPPCM-LINK-01':{
            id:'CF-SPPCM-LINK-01', pathSourceRecordId:'CF-CRP-REC-01', relationAssertionId:'CF-CRP-REC-01-A01',
            conditionId:'CF-CRP-REC-01-C01', conditionKind:'position-order', conditionWording:'癸先辛后',
            positionRecordId:'CF-RPP-REC-01', positionAssertionId:'CF-RPP-REC-01-A01', positionUnitId:'CF-RPP-REC-01-A01-U1',
            pathIds:['CF-CRP-REC-01-P01','CF-CRP-REC-01-P02'],
            pathParticipantRefs:[{ pathId:'CF-CRP-REC-01-P01', sourceRefId:'wealth', targetRoleClass:'七杀' },{ pathId:'CF-CRP-REC-01-P02', sourceRefId:'food', targetRoleClass:'七杀' }],
            sourceIds:{ position:'CF-RPP-SRC-SXZ', path:'CF-CRP-SRC-SXZ' },
            context:orderContext,
            explicitStemBindings:[{ refId:'wealth', gan:'癸', roleClass:'财星' },{ refId:'food', gan:'辛', roleClass:'食神' }]
        },
        'CF-SPPCM-LINK-02':{
            id:'CF-SPPCM-LINK-02', pathSourceRecordId:'CF-CRP-REC-02', relationAssertionId:'CF-CRP-REC-02-A01',
            conditionId:'CF-CRP-REC-02-C01', conditionKind:'position-order', conditionWording:'辛先而癸在时',
            positionRecordId:'CF-RPP-REC-01', positionAssertionId:'CF-RPP-REC-01-A02', positionUnitId:'CF-RPP-REC-01-A02-U1',
            pathIds:['CF-CRP-REC-02-P01','CF-CRP-REC-02-P02'],
            pathParticipantRefs:[{ pathId:'CF-CRP-REC-02-P01', sourceRefId:'food', targetRoleClass:'七杀' },{ pathId:'CF-CRP-REC-02-P02', sourceRefId:'wealth', targetRoleClass:'七杀', intermediateRefIds:['food'] }],
            sourceIds:{ position:'CF-RPP-SRC-SXZ', path:'CF-CRP-SRC-SXZ' },
            context:orderContext,
            explicitStemBindings:[{ refId:'wealth', gan:'癸', roleClass:'财星' },{ refId:'food', gan:'辛', roleClass:'食神' }]
        },
        'CF-SPPCM-LINK-03':{
            id:'CF-SPPCM-LINK-03', pathSourceRecordId:'CF-CRP-REC-03', relationAssertionId:'CF-CRP-REC-03-A01',
            conditionId:'CF-CRP-REC-03-C01', conditionKind:'position-proximity', conditionWording:'贴近七杀',
            positionRecordId:'CF-RPP-REC-03', positionAssertionId:'CF-RPP-REC-03-A01', positionUnitId:'CF-RPP-REC-03-A01-U1',
            pathIds:['CF-CRP-REC-03-P01'], sourceIds:{ position:'CF-RPP-SRC-WQL', path:'CF-CRP-SRC-WQL' },
            pathParticipantRefs:[{ pathId:'CF-CRP-REC-03-P01', sourceRefId:'food', targetRefId:'killer', targetRoleClass:'七杀' }],
            context:{ sourceRecordId:'CF-CRP-REC-03', sourceSpan:'阳日食神', dayGans:['甲','丙','戊','庚','壬'] },
            explicitStemBindings:[]
        },
        'CF-SPPCM-LINK-04':{
            id:'CF-SPPCM-LINK-04', pathSourceRecordId:'CF-CRP-REC-03', relationAssertionId:'CF-CRP-REC-03-A01',
            conditionId:'CF-CRP-REC-03-C02', conditionKind:'position-proximity', conditionWording:'贴近正官',
            positionRecordId:'CF-RPP-REC-03', positionAssertionId:'CF-RPP-REC-03-A01', positionUnitId:'CF-RPP-REC-03-A01-U2',
            pathIds:['CF-CRP-REC-03-P02'], sourceIds:{ position:'CF-RPP-SRC-WQL', path:'CF-CRP-SRC-WQL' },
            pathParticipantRefs:[{ pathId:'CF-CRP-REC-03-P02', sourceRefId:'food', targetRefId:'officer', targetRoleClass:'正官' }],
            context:{ sourceRecordId:'CF-CRP-REC-03', sourceSpan:'阳日食神', dayGans:['甲','丙','戊','庚','壬'] },
            explicitStemBindings:[]
        }
    });
    const PATH_SOURCE_REGISTRY = freeze(Object.fromEntries(paths.RECORDS.map((record) => [record.id, JSON.parse(JSON.stringify(record))])));
    const CONTRACT = freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER-CONTRACT-001', version:VERSION,
        matcherScope:'registered-cf-crp-01-02-order-conditions-and-cf-crp-03-proximity-links-only',
        normalizedPositionContractId:position.CONTRACT.id, pathSourceContractId:paths.CONTRACT.id,
        pathSourceRuleId:paths.RULE_ID, exactSourceLinkRequired:true, uniqueVisibleStemIdentityRequired:true,
        sharedComparisonContextRequired:true, sourceSpecifiedAbsolutePlacementRequired:true,
        sourceOrderConditionMatcherDefined:true, sourceProximityConditionMatcherDefined:false,
        sourceInterveningConditionMatcherDefined:false, relativeCapacityMatcherDefined:false,
        orderUsesDeclaredPillarSequence:true, sourceOrderEqualsPathPriority:false,
        runtimeConditionMatchEqualsPathRealization:false, conditionFailureEqualsRelationNotRealized:false,
        genericPositionResolverDefined:false, competingPathResolverDefined:false,
        corpusCoverageComplete:false, executionAuthorized:false, memberEdgeExpansion:false,
        numericWeights:false, ranking:false, finalStrengthMapping:false,
        boundary:'R11 matches only the registered source order predicates under 己生卯月 and links four position conditions to their source paths. Matching a condition does not instantiate/execute paths, resolve targets, choose a winner or authorize effects; proximity stays unresolved without independently asserted runtime evidence.'
    });
    GuiJia.baziContextualForcePartySourcePositionPathConditionMatcherContract = Object.freeze({
        installed:true, VERSION, RULE_ID, STATES, LINK_REGISTRY, PATH_SOURCE_REGISTRY, CONTRACT, freeze
    });
})(typeof window !== 'undefined' ? window : globalThis);
