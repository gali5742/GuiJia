(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baziCore = GuiJia.baziCore || {};

    const STRENGTH_EVIDENCE_EXTRACTOR_VERSION = '0.1';
    const STRENGTH_EVIDENCE_CONTRACT_ID = 'qianli-basic-strength-evidence';
    const STRENGTH_EVIDENCE_CONTRACT_VERSION = '0.1';

    const tenGodRelationMap = Object.freeze({
        '比肩':'同我', '劫财':'同我',
        '正印':'生我', '偏印':'生我',
        '正官':'克我', '七杀':'克我',
        '食神':'我生', '伤官':'我生',
        '正财':'我克', '偏财':'我克'
    });

    const relationAxisMap = Object.freeze({
        '生我':'visibleSupportActors',
        '同我':'visibleSupportActors',
        '克我':'visibleRestraintActors',
        '我生':'visibleDrainActors',
        '我克':'visibleDistributionActors'
    });

    const visibleStemPositions = Object.freeze([
        Object.freeze({ pillarIndex:0, position:'year', label:'年干', evidenceId:'SE02' }),
        Object.freeze({ pillarIndex:1, position:'month', label:'月干', evidenceId:'SE03' }),
        Object.freeze({ pillarIndex:3, position:'hour', label:'时干', evidenceId:'SE04' })
    ]);

    const branchQiPositions = Object.freeze([
        Object.freeze({ pillarIndex:0, position:'year', label:'年支', evidenceId:'SE05' }),
        Object.freeze({ pillarIndex:2, position:'day', label:'日支', evidenceId:'SE06' }),
        Object.freeze({ pillarIndex:3, position:'hour', label:'时支', evidenceId:'SE07' })
    ]);

    const collectSemanticRefs = (semanticModel = {}) => new Set([
        ...(semanticModel.facts || []).map((item) => item.id),
        ...(semanticModel.derivedFacts || []).map((item) => item.id),
        ...(semanticModel.structures || []).map((item) => item.id)
    ].filter(Boolean));

    const checkedRefs = (refs, semanticModel = {}) => {
        const available = collectSemanticRefs(semanticModel);
        return [...new Set(refs || [])].filter((ref) => available.has(ref));
    };

    const resolveTenGod = (result, pillar, pillarIndex) => {
        if (pillarIndex === 2) return '日主';
        if (pillar?.shishenGan) return pillar.shishenGan;
        return baziCore.shiShenMap?.[result?.dayGan]?.[pillar?.gan] || '';
    };

    const buildSeasonalEvidence = (result, semanticModel) => {
        const state = result?.monthSeason?.states?.find((item) => item.isDayMaster);
        if (!state) return null;
        return Object.freeze({
            id:'SE01',
            category:'seasonalState',
            system:state.system || 'seasonalFiveStates',
            systemLabel:state.systemLabel || '旺相休囚死',
            state:state.status || '',
            season:result.monthSeason?.season || '',
            monthZhi:result.monthSeason?.monthZhi || result.pillars?.[1]?.zhi || '',
            assessmentMeaning:'baseline-only',
            sourceRefs:checkedRefs(['D02'], semanticModel)
        });
    };

    const buildVisibleStemEvidence = (result, semanticModel) => visibleStemPositions.flatMap((position) => {
        const pillar = result?.pillars?.[position.pillarIndex];
        if (!pillar?.gan) return [];
        const tenGod = resolveTenGod(result, pillar, position.pillarIndex);
        const relation = tenGodRelationMap[tenGod] || '';
        const axis = relationAxisMap[relation] || '';
        if (!axis) return [];
        return [Object.freeze({
            id:position.evidenceId,
            category:axis,
            actorScope:'visibleStem',
            position:position.position,
            positionLabel:position.label,
            pillarIndex:position.pillarIndex,
            gan:pillar.gan,
            wuxing:baziCore.getWuXing?.(pillar.gan) || '',
            tenGod,
            relation,
            countClassification:axis === 'visibleDistributionActors' ? 'separate' : 'unresolved',
            sourceRefs:checkedRefs(['F03','D07'], semanticModel)
        })];
    });

    const buildBranchQiEvidence = (result, semanticModel) => branchQiPositions.flatMap((position) => {
        const pillar = result?.pillars?.[position.pillarIndex];
        if (!pillar?.zhi || !result?.dayGan) return [];
        const record = baziCore.getDiShiRecord?.(result.dayGan, pillar.zhi) || {
            system:'twelveGrowthStages', systemLabel:'十二长生', state:baziCore.getDiShi?.(result.dayGan, pillar.zhi) || '—'
        };
        return [Object.freeze({
            id:position.evidenceId,
            category:'branchQi',
            position:position.position,
            positionLabel:position.label,
            pillarIndex:position.pillarIndex,
            zhi:pillar.zhi,
            system:record.system || 'twelveGrowthStages',
            systemLabel:record.systemLabel || '十二长生',
            state:record.state || '—',
            aggregateClassification:'unresolved',
            sourceRefs:checkedRefs(['F01'], semanticModel)
        })];
    });

    const buildStrengthEvidence = (result = {}, semanticModel = {}) => {
        const emptyEvidence = {
            seasonalState:null,
            visibleSupportActors:[],
            visibleRestraintActors:[],
            visibleDrainActors:[],
            visibleDistributionActors:[],
            branchQi:[]
        };
        if (!Array.isArray(result?.pillars) || result.pillars.length !== 4 || !result.dayGan) {
            return Object.freeze({
                version:STRENGTH_EVIDENCE_EXTRACTOR_VERSION,
                contractId:STRENGTH_EVIDENCE_CONTRACT_ID,
                contractVersion:STRENGTH_EVIDENCE_CONTRACT_VERSION,
                state:'unavailable',
                dayMaster:null,
                evidence:Object.freeze(emptyEvidence),
                issues:Object.freeze(['chart-unavailable'])
            });
        }

        const seasonalState = buildSeasonalEvidence(result, semanticModel);
        const visibleActors = buildVisibleStemEvidence(result, semanticModel);
        const branchQi = buildBranchQiEvidence(result, semanticModel);
        const byAxis = (axis) => Object.freeze(visibleActors.filter((item) => item.category === axis));
        const evidence = Object.freeze({
            seasonalState,
            visibleSupportActors:byAxis('visibleSupportActors'),
            visibleRestraintActors:byAxis('visibleRestraintActors'),
            visibleDrainActors:byAxis('visibleDrainActors'),
            visibleDistributionActors:byAxis('visibleDistributionActors'),
            branchQi:Object.freeze(branchQi)
        });
        const issues = [];
        if (!seasonalState) issues.push('seasonal-state-unavailable');
        if (visibleActors.length !== 3) issues.push('visible-stem-evidence-incomplete');
        if (branchQi.length !== 3) issues.push('branch-qi-evidence-incomplete');

        return Object.freeze({
            version:STRENGTH_EVIDENCE_EXTRACTOR_VERSION,
            contractId:STRENGTH_EVIDENCE_CONTRACT_ID,
            contractVersion:STRENGTH_EVIDENCE_CONTRACT_VERSION,
            state:issues.length ? 'partial' : 'collected-unclassified',
            dayMaster:Object.freeze({
                gan:result.dayGan,
                wuxing:result.dayGanWuXing || baziCore.getWuXing?.(result.dayGan) || ''
            }),
            evidence,
            issues:Object.freeze(issues),
            boundaries:Object.freeze([
                '证据已抽取但尚未进行多寡分类、效力判断或身强弱归纳。',
                '年、日、时支十二长生与藏干通根保持为不同证据轴。',
                '天干明现只记录关系类别，不自动等同于实际帮扶、克制、泄力或耗力强度。'
            ])
        });
    };

    GuiJia.baziStrengthEvidence = Object.freeze({
        STRENGTH_EVIDENCE_EXTRACTOR_VERSION,
        STRENGTH_EVIDENCE_CONTRACT_ID,
        STRENGTH_EVIDENCE_CONTRACT_VERSION,
        tenGodRelationMap,
        relationAxisMap,
        visibleStemPositions,
        branchQiPositions,
        collectSemanticRefs,
        buildSeasonalEvidence,
        buildVisibleStemEvidence,
        buildBranchQiEvidence,
        buildStrengthEvidence
    });
})(typeof window !== 'undefined' ? window : globalThis);
