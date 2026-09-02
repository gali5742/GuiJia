(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource?.installed) return;

    const affiliationSource = GuiJia.baziContextualForcePartyAffiliationExpansionSource || null;
    if (!affiliationSource) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...items]);

    const SOURCES = Object.freeze({
        affiliationExpansion:Object.freeze({
            id:'CF-REG-SRC-AFFILIATION-EXPANSION',
            title:'Party Affiliation Expansion Source Audit v0.2',
            sourceRole:'upstream-source-audit',
            upstreamEvidenceIds:freezeArray((affiliationSource.EVIDENCE || []).map((item) => item.id))
        })
    });

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-REG-E01',
            upstreamEvidenceIds:Object.freeze(['CF-PAE-E01','CF-PAE-E02','CF-PAE-E08']),
            kind:'augmentation-is-contextual-not-shape-global',
            semanticImpact:'财滋杀／党杀支持 target-specific augmentation，但来源同时要求具体命局与关系语境；不能把任意 generation shape 自动推广为 anchor augmentation。'
        }),
        Object.freeze({
            id:'CF-REG-E02',
            upstreamEvidenceIds:Object.freeze(['CF-PAE-E03','CF-PAE-E04']),
            kind:'opposition-is-target-specific-and-not-membership',
            semanticImpact:'食神制杀支持具体 restraint edge 的 opposition；“制杀扶身”仍不能推出任意克制关系都属于日主侧 effect 或 membership。'
        }),
        Object.freeze({
            id:'CF-REG-E03',
            upstreamEvidenceIds:Object.freeze(['CF-PAE-E05','CF-PAE-E06','CF-PAE-E07']),
            kind:'mediation-requires-specific-directed-sequence',
            semanticImpact:'杀印相生／印绶化杀要求保留具体杀→印方向与承接语义；普通 generation identity 不能自动等于 mediation。'
        }),
        Object.freeze({
            id:'CF-REG-E04',
            upstreamEvidenceIds:Object.freeze(['CF-PAE-E08']),
            kind:'relation-presence-is-not-realization',
            semanticImpact:'来源明确保留命局语境，因此普通五行 relation presence 不能直接升级为 realized relation effect。'
        }),
        Object.freeze({
            id:'CF-REG-E05',
            upstreamEvidenceIds:Object.freeze(['CF-PAE-E03','CF-PAE-E04','CF-PAE-E05','CF-PAE-E06','CF-PAE-E07']),
            kind:'relation-types-cannot-be-collapsed',
            semanticImpact:'augmentation、opposition、mediation 是不同作用语义；不能仅按“生／克”统一折成正负 effect，也不能由结果反推 actor party。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-REG-F01', key:'known-source-backed-motif-effects-remain-authorized', status:'required', value:true, evidenceIds:Object.freeze(['CF-REG-E01','CF-REG-E02','CF-REG-E03']) }),
        Object.freeze({ id:'CF-REG-F02', key:'ordinary-five-element-relation-presence-equals-effect', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-REG-E04']) }),
        Object.freeze({ id:'CF-REG-F03', key:'all-generation-equals-augmentation', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-REG-E01','CF-REG-E03']) }),
        Object.freeze({ id:'CF-REG-F04', key:'all-restraint-equals-opposition', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-REG-E02']) }),
        Object.freeze({ id:'CF-REG-F05', key:'all-generation-to-supportive-actor-equals-mediation', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-REG-E03']) }),
        Object.freeze({ id:'CF-REG-F06', key:'peer-relation-has-generic-directed-effect', status:'not-defined', value:null, evidenceIds:Object.freeze([]) }),
        Object.freeze({ id:'CF-REG-F07', key:'not-realized-or-unresolved-edge-creates-reverse-effect', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-REG-E01','CF-REG-E02','CF-REG-E03']) }),
        Object.freeze({ id:'CF-REG-F08', key:'generic-cross-actor-relation-effect-resolver', status:'not-defined', value:null, evidenceIds:Object.freeze([]) })
    ]);

    const REQUIRED_PROVENANCE_GATES = Object.freeze([
        'stable-source-and-target-actor-identity',
        'relation-identity',
        'target-specific-direction-when-directional',
        'source-pattern-or-equivalent-semantic-authority',
        'realization-state',
        'relation-effect-type-authorization'
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        secondOrderAuditOfExistingTraditionalEvidence:true,
        knownMotifsRemainAuthorized:true,
        relationPresenceIsNotRealization:true,
        realizedEdgeIsNotAutomaticallyGenericPartyEffect:true,
        genericGenerationToAugmentationDefined:false,
        genericRestraintToOppositionDefined:false,
        genericGenerationToMediationDefined:false,
        genericPeerEffectDefined:false,
        reverseEffectFromNonRealization:false,
        actorGlobalPartyFromEffect:false,
        actorGlobalEffectivenessFromEffect:false,
        transitiveClosure:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        requiredProvenanceGates:REQUIRED_PROVENANCE_GATES,
        statement:'现有传统来源足以继续授权财→官杀 augmentation、食神→七杀 opposition、七杀→印 mediation 等已登记 motif，也足以否定“relation presence = realized effect”。但现有来源尚不足以把所有 generation / restraint / peer shape 自动推广为 generic party relation effect；generic resolver 必须继续保持 unresolved。'
    });

    GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        SOURCES,
        EVIDENCE,
        FINDINGS,
        REQUIRED_PROVENANCE_GATES,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
