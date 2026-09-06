(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPathPairContract?.installed) return;

    const placementApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternative || null;
    const modernSupportSource = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    if (!placementApi || !modernSupportSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR-001';
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const path = (item = {}) => Object.freeze({
        ...item,
        intermediateRoleClasses:freezeArray(item.intermediateRoleClasses || []),
        executable:false,
        memberEdgeExpansion:false
    });
    const composition = (item = {}) => Object.freeze({ ...item, paths:freezeArray((item.paths || []).map(path)) });

    const PAIR_STATES = Object.freeze({ RESOLVED_SOURCE_SCOPED:'resolved-source-scoped-counterfactual-path-pair', UNRESOLVED:'unresolved-counterfactual-path-pair' });
    const SOURCE_REGISTRY = Object.freeze({
        'CF-SCPP-REC-01':Object.freeze({
            id:'CF-SCPP-REC-01',
            placementAlternativeId:'CF-PCPA-REC-01',
            modernEvidenceIds:freezeArray(['CF-RSMS-E04','CF-RSMS-E05']),
            sourceId:'CF-RSMS-SRC-XLW',
            interpretationContested:true,
            actual:composition({
                id:'CF-SCPP-REC-01-ACT',
                placementState:'actual-hour-food',
                wording:'年月财生煞旺，时上食以制之',
                compositionMode:'coexisting-source-paths',
                paths:[
                    { id:'CF-SCPP-REC-01-ACT-P01', pathKind:'direct-role-relation', semanticLabel:'wealth-generates-killer', sourceRoleClass:'财星', predicateWording:'生', targetRoleClass:'七杀', sourceWording:'年月财生煞旺' },
                    { id:'CF-SCPP-REC-01-ACT-P02', pathKind:'direct-role-relation', semanticLabel:'food-controls-killer', sourceRoleClass:'食神', predicateWording:'制', targetRoleClass:'七杀', sourceWording:'时上食以制之' }
                ]
            }),
            counterfactual:composition({
                id:'CF-SCPP-REC-01-CF',
                placementState:'counterfactual-year-month-food-class',
                wording:'如辛在年月，则为食神生财，财生煞之局',
                compositionMode:'source-chain',
                paths:[
                    { id:'CF-SCPP-REC-01-CF-P01', pathKind:'direct-role-relation', semanticLabel:'food-generates-wealth', sourceRoleClass:'食神', predicateWording:'生', targetRoleClass:'财星', sourceWording:'食神生财' },
                    { id:'CF-SCPP-REC-01-CF-P02', pathKind:'direct-role-relation', semanticLabel:'wealth-generates-killer', sourceRoleClass:'财星', predicateWording:'生', targetRoleClass:'七杀', sourceWording:'财生煞之局' }
                ]
            })
        })
    });

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PATH-PAIR-CONTRACT-001', version:VERSION,
        resolverScope:'xu-lewu-chengqian-source-interpretation-pair-only', sourceRegistryRequired:true,
        counterfactualPlacementAlternativeRequired:true, modernSupportEvidenceRequired:true, interpretationContestedProvenanceRequired:true,
        actualAndCounterfactualInterpretationsRemainDistinct:true, actualCompositionMayContainCoexistingPaths:true,
        counterfactualCompositionMayContainSourceChain:true, sourcePairEqualsRuntimeSelection:false,
        sourcePairAuthorizesExecution:false, counterfactualPairCreatesAlternateChart:false,
        roleLevelPathCreatesActorBinding:false, compoundOrChainExpansionCreatesMemberEdges:false,
        interpretationContestedCanBecomeUniversalRule:false, numericAggregation:false, numericWeights:false,
        thresholding:false, majorityVoting:false, ranking:false, scalarCollapse:false, finalStrengthMapping:false,
        statement:'Counterfactual Path Pair v0.1 只保存徐乐吾程潜命例的两套来源解释：实际“财生煞 + 食制煞”和反事实“食神生财 → 财生煞”。它描述 placement-sensitive source interpretation difference，不表示任一链已在 runtime 执行，也不把 contested 评注提升为传统通用规则。'
    });

    GuiJia.baziContextualForcePartyCounterfactualPathPairContract = Object.freeze({ installed:true, VERSION, RULE_ID, PAIR_STATES, SOURCE_REGISTRY, CONTRACT });
})(typeof window !== 'undefined' ? window : globalThis);
