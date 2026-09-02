(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const relationEffectContract = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const realizationSource = GuiJia.baziVisibleStemFunctionRealizationSource || null;
    if (!relationEffectContract || !realizationSource || !baziCore.shiShenMap) return;

    const VERSION = '0.1';
    const RULE_ID = 'BAZI-STRENGTH-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-SOURCE-AUDIT-001';
    const freezeArray = (items = []) => Object.freeze([...items]);

    const RAW_VISIBLE_MOTIFS = freezeArray((relationEffectContract.MOTIFS || [])
        .filter((item) => item.inputAuthority === 'existing-source-backed-function-realization-edge'));
    const DIRECT_CROSS_VISIBLE_PATTERNS = freezeArray((realizationSource.DIRECT_SOURCE_PATTERNS || [])
        .filter((item) => item.relationScope === 'cross-visible-actor'));

    const actorGanFromKey = (actorKey = '') => String(actorKey).split(':')[2] || '';
    const dayGanFromChartKey = (chartKey = '') => {
        const dayPillar = String(chartKey).split('|')[2] || '';
        return Array.from(dayPillar)[0] || '';
    };
    const tenGodFor = (dayGan = '', actorKey = '') => {
        const gan = actorGanFromKey(actorKey);
        if (!dayGan || !gan) return null;
        return baziCore.shiShenMap?.[dayGan]?.[gan] || null;
    };
    const patternSemantics = (pattern = {}) => {
        const dayGan = dayGanFromChartKey(pattern.chartKey);
        return Object.freeze({
            patternId:pattern.id || null,
            chartKey:pattern.chartKey || null,
            realizationState:pattern.realizationState || null,
            functionType:pattern.functionType || null,
            sourceActorKey:pattern.sourceActorKey || null,
            targetActorKey:pattern.targetActorKey || null,
            sourceTenGod:tenGodFor(dayGan, pattern.sourceActorKey),
            targetTenGod:tenGodFor(dayGan, pattern.targetActorKey),
            relationScope:pattern.relationScope || null
        });
    };
    const motifMatchesPattern = (motif = {}, semantics = {}) =>
        motif.functionType === semantics.functionType
        && (motif.sourceTenGods || []).includes(semantics.sourceTenGod)
        && (motif.targetTenGods || []).includes(semantics.targetTenGod);

    const DIRECT_PATTERN_AUTHORIZATION_MATRIX = freezeArray(DIRECT_CROSS_VISIBLE_PATTERNS.map((pattern) => {
        const semantics = patternSemantics(pattern);
        const matchedMotifs = RAW_VISIBLE_MOTIFS.filter((motif) => motifMatchesPattern(motif, semantics));
        return Object.freeze({
            ...semantics,
            matchedMotifIds:freezeArray(matchedMotifs.map((item) => item.id)),
            authorizedEffectTypes:freezeArray(matchedMotifs.map((item) => item.relationType)),
            currentRegistryAuthorization:matchedMotifs.length
                ? 'authorized-by-known-visible-motif'
                : 'not-authorized-by-current-visible-motif-registry',
            boundary:'未命中当前 registry 只表示“当前来源登记未授权”；不得反写为该 relation 永远无 effect，也不得按五行 shape 自动补一个 effect type。'
        });
    }));

    const POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS = freezeArray(DIRECT_PATTERN_AUTHORIZATION_MATRIX
        .filter((item) => item.realizationState === 'realized-in-source-context'));
    const POSITIVE_AUTHORIZED_DIRECT_PATTERNS = freezeArray(POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS
        .filter((item) => item.matchedMotifIds.length > 0));
    const POSITIVE_UNMAPPED_DIRECT_PATTERNS = freezeArray(POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS
        .filter((item) => item.matchedMotifIds.length === 0));

    const EVIDENCE = Object.freeze([
        Object.freeze({
            id:'CF-VEA-E01',
            kind:'known-effect-types-are-motif-authorized-not-shape-authorized',
            sourceRegistryEvidenceIds:freezeArray(RAW_VISIBLE_MOTIFS.flatMap((item) => item.sourceRegistryEvidenceIds || [])),
            semanticImpact:'opposition / mediation 的授权条件包含十神角色、function type、target-specific actor relation 与 realization；不是单独的 generation/restraint 字典。'
        }),
        Object.freeze({
            id:'CF-VEA-E02',
            kind:'positive-cross-visible-realization-capability-exists',
            sourcePatternIds:freezeArray(POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS.map((item) => item.patternId)),
            semanticImpact:'Direct Source Function Realization 已能产生 realized-in-source-context 的 cross-visible edge，因此 effect-type authorization 可以被真实机器 edge 消费，而不是纯接口预留。'
        }),
        Object.freeze({
            id:'CF-VEA-E03',
            kind:'positive-realized-edge-can-remain-unmapped',
            sourcePatternIds:freezeArray(POSITIVE_UNMAPPED_DIRECT_PATTERNS.map((item) => item.patternId)),
            semanticImpact:'已兑现 edge 若不命中当前 source-backed motif，必须停在 realized-but-unmapped；realization 本身不授权 Party effect type。'
        }),
        Object.freeze({
            id:'CF-VEA-E04',
            kind:'current-raw-visible-motifs-lack-direct-positive-calibration-match',
            motifIds:freezeArray(RAW_VISIBLE_MOTIFS.map((item) => item.id)),
            matchedPositivePatternIds:freezeArray(POSITIVE_AUTHORIZED_DIRECT_PATTERNS.map((item) => item.patternId)),
            semanticImpact:'当前 direct-source realization registry 尚未提供一个同时命中 raw visible Party motif 的正向命例，用于端到端校准 opposition / mediation 的 executable mapping。'
        })
    ]);

    const FINDINGS = Object.freeze([
        Object.freeze({ id:'CF-VEA-F01', key:'visible-edge-effect-type-authorization-is-pattern-specific', status:'required', value:true, evidenceIds:Object.freeze(['CF-VEA-E01']) }),
        Object.freeze({ id:'CF-VEA-F02', key:'positive-cross-visible-realization-capability', status:POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS.length ? 'supported' : 'not-observed', value:POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS.length > 0, evidenceIds:Object.freeze(['CF-VEA-E02']) }),
        Object.freeze({ id:'CF-VEA-F03', key:'realized-visible-edge-always-has-current-party-effect-type', status:'rejected', value:false, evidenceIds:Object.freeze(['CF-VEA-E03']) }),
        Object.freeze({ id:'CF-VEA-F04', key:'raw-visible-known-motif-positive-end-to-end-calibration', status:POSITIVE_AUTHORIZED_DIRECT_PATTERNS.length ? 'observed' : 'not-observed', value:POSITIVE_AUTHORIZED_DIRECT_PATTERNS.length > 0, evidenceIds:Object.freeze(['CF-VEA-E04']) }),
        Object.freeze({ id:'CF-VEA-F05', key:'generic-generation-restraint-effect-type-map', status:'not-defined', value:null, evidenceIds:Object.freeze(['CF-VEA-E01','CF-VEA-E03']) })
    ]);

    const CONTRACT = Object.freeze({
        id:'BAZI-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-SOURCE-AUDIT-CONTRACT-001',
        version:VERSION,
        sourceAuditOnly:true,
        authorizationLevel:'source-backed-role-pattern-x-function-x-realization',
        realizationAloneAuthorizesEffectType:false,
        functionShapeAloneAuthorizesEffectType:false,
        tenGodRoleAloneAuthorizesEffectType:false,
        knownRawVisibleMotifs:freezeArray(RAW_VISIBLE_MOTIFS.map((item) => item.id)),
        positiveCrossVisibleRealizationCapability:POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS.length > 0,
        positiveAuthorizedDirectPatternObserved:POSITIVE_AUTHORIZED_DIRECT_PATTERNS.length > 0,
        genericVisibleEdgeEffectTypeResolverDefined:false,
        numericAggregation:false,
        numericWeights:false,
        majorityVoting:false,
        scalarCollapse:false,
        finalStrengthMapping:false,
        statement:'Visible-edge Party effect type 只能由 source-backed motif authorization 与独立的 target-specific realization 共同成立。当前机器已经具有正向 cross-visible realization，但至少存在 realized edge 不命中当前 Party motif；因此 realization capability 与 effect-type authorization 必须保持分层。'
    });

    GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RAW_VISIBLE_MOTIFS,
        DIRECT_CROSS_VISIBLE_PATTERNS,
        DIRECT_PATTERN_AUTHORIZATION_MATRIX,
        POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS,
        POSITIVE_AUTHORIZED_DIRECT_PATTERNS,
        POSITIVE_UNMAPPED_DIRECT_PATTERNS,
        EVIDENCE,
        FINDINGS,
        CONTRACT,
        actorGanFromKey,
        dayGanFromChartKey,
        tenGodFor,
        patternSemantics,
        motifMatchesPattern
    });
})(typeof window !== 'undefined' ? window : globalThis);
