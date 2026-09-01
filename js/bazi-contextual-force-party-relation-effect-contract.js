(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEffectContract?.installed) return;

    const sourceApi = GuiJia.baziContextualForcePartyAffiliationExpansionSource || null;
    if (!sourceApi) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-001';
    const { RELATION_TYPES } = sourceApi;

    const EFFECT_STATES = Object.freeze({
        REALIZED:'realized-relation-effect-in-source-context',
        NOT_REALIZED:'not-realized-relation-effect-through-edge',
        UNRESOLVED:'unresolved-relation-effect-through-edge'
    });

    const MOTIFS = Object.freeze([
        Object.freeze({
            id:'CF-PRE-MOTIF-WEALTH-AUGMENTS-KILLER-001',
            relationType:RELATION_TYPES.ANCHOR_AUGMENTATION,
            sourceTenGods:Object.freeze(['正财','偏财']),
            targetTenGods:Object.freeze(['正官','七杀']),
            functionType:'generation',
            sourceRegistryEvidenceIds:Object.freeze(['CF-PAE-E01','CF-PAE-E02','CF-PAE-E08']),
            inputAuthority:'existing-party-affiliation-record',
            statement:'财星通过已登记、target-specific、source-backed relation 扶助具体官／杀 anchor 时，可记录 anchor augmentation；本层复用既有 Affiliation record，不重复建立 membership identity。'
        }),
        Object.freeze({
            id:'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001',
            relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
            sourceTenGods:Object.freeze(['食神']),
            targetTenGods:Object.freeze(['七杀']),
            functionType:'restraint',
            sourceRegistryEvidenceIds:Object.freeze(['CF-PAE-E03','CF-PAE-E04']),
            inputAuthority:'existing-source-backed-function-realization-edge',
            statement:'食神对具体七杀 anchor 的已登记 restraint edge 可记录 anchor opposition；“制杀／扶身”不得改写为日主侧 membership。'
        }),
        Object.freeze({
            id:'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001',
            relationType:RELATION_TYPES.ANCHOR_MEDIATION,
            sourceTenGods:Object.freeze(['七杀']),
            targetTenGods:Object.freeze(['正印','偏印']),
            functionType:'generation',
            sourceRegistryEvidenceIds:Object.freeze(['CF-PAE-E05','CF-PAE-E06','CF-PAE-E07']),
            inputAuthority:'existing-source-backed-function-realization-edge',
            statement:'七杀→印星的已登记 generation edge 可记录 anchor mediation；保留杀→印方向，不把七杀改写为日主侧 member，也不反写为印→杀。'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-CONTRACT-001',
        version:VERSION,
        resolverScope:'known-source-backed-cross-actor-relation-effect-motifs',
        relationTypes:Object.freeze(Object.values(RELATION_TYPES)),
        existingEdgeRequired:true,
        sourcePatternRequired:true,
        targetSpecific:true,
        realizationRequiredForPositiveEffect:true,
        augmentationReusesAffiliationIdentity:true,
        oppositionCreatesMembership:false,
        mediationCreatesMembership:false,
        mediationReversesEdge:false,
        notRealizedCreatesReverseEffect:false,
        unresolvedCreatesEffect:false,
        actorGlobalParty:false,
        actorGlobalEffectiveness:false,
        transitiveClosure:false,
        enemyOfEnemyShortcut:false,
        relativeDominanceMapping:false,
        partyConfigurationMapping:false,
        activeMemberCount:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        priorityAggregation:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Party Cross-Actor Relation Effect v0.1 只消费已有、source-backed、target-specific 的 cross-visible function realization，并按来源审计后的 augmentation / opposition / mediation 三类保存 relation effect。augmentation 复用既有 Affiliation edge identity；opposition 与 mediation 只形成关系作用记录，不产生 membership。',
        boundary:'本层不新造五行生克 edge，不把“制衡对方”解释为加入我方，不把“化杀／杀印相生”解释为 party switch，不从 not-realized 或 unresolved edge 生成反向作用，也不比较双方相对强弱。'
    });

    GuiJia.baziContextualForcePartyRelationEffectContract = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPES,
        EFFECT_STATES,
        MOTIFS,
        CONTRACT
    });
})(typeof window !== 'undefined' ? window : globalThis);
