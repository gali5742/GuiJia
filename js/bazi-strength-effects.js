(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const baziCore = GuiJia.baziCore || {};

    const STRENGTH_EFFECTS_VERSION = '0.1';
    const SUPPORT_GODS = new Set(['比肩','劫财','正印','偏印']);

    const strengthEffectStatuses = Object.freeze({
        RECOGNIZED: 'recognized',
        PRESENCE_ONLY: 'presence-only',
        CONTEXT_ONLY: 'context-only',
        ABSENT: 'absent',
        UNAVAILABLE: 'unavailable'
    });

    const strengthEffectDirections = Object.freeze({
        SEASONAL_SUPPORT: 'seasonal-support',
        SEASONAL_NON_SUPPORT: 'seasonal-non-support',
        SUPPORT_CANDIDATE: 'support-candidate',
        RESTRAINT_CANDIDATE: 'restraint-candidate',
        DRAIN_CANDIDATE: 'drain-candidate',
        DISTRIBUTION_CANDIDATE: 'distribution-candidate',
        CONTEXTUAL: 'contextual',
        NONE: 'none'
    });

    const collectSemanticRefs = (semanticModel = {}) => new Set([
        ...(semanticModel.facts || []).map((item) => item.id),
        ...(semanticModel.derivedFacts || []).map((item) => item.id),
        ...(semanticModel.structures || []).map((item) => item.id)
    ].filter(Boolean));

    const checkedRefs = (refs, semanticModel = {}) => {
        const available = collectSemanticRefs(semanticModel);
        return [...new Set(refs || [])].filter((ref) => available.has(ref));
    };

    const freezeActors = (actors = []) => Object.freeze(actors.map((item) => Object.freeze({ ...item })));

    const hiddenActors = (result = {}) => (result.pillars || []).flatMap((pillar, pillarIndex) =>
        (pillar.cangGan || []).map((item, hiddenIndex) => Object.freeze({
            actorKey:`hidden:${pillarIndex}:${pillar.zhi}:${item.gan}:${hiddenIndex}`,
            scope:'hiddenStem',
            pillarIndex,
            position:['year','month','day','hour'][pillarIndex] || '',
            positionLabel:['年支','月支','日支','时支'][pillarIndex] || '',
            zhi:pillar.zhi || '',
            gan:item.gan || '',
            wuxing:item.wuxing || baziCore.getWuXing?.(item.gan) || '',
            tenGod:item.shishen || baziCore.shiShenMap?.[result.dayGan]?.[item.gan] || '',
            level:item.level || ''
        }))
    );

    const seasonalStatement = (state) => {
        if (state === '旺') return { direction:strengthEffectDirections.SEASONAL_SUPPORT, statement:'月令季节位置形成得令背景。' };
        if (state === '相') return { direction:strengthEffectDirections.SEASONAL_SUPPORT, statement:'月令季节位置形成得季节相助背景。' };
        if (['休','囚','死'].includes(state)) return { direction:strengthEffectDirections.SEASONAL_NON_SUPPORT, statement:'月令季节位置不构成得令或相助背景。' };
        return { direction:strengthEffectDirections.CONTEXTUAL, statement:'月令季节状态已记录，但当前不进一步解释其方向。' };
    };

    const buildSeasonalEffect = (strengthEvidence = {}, semanticModel = {}) => {
        const source = strengthEvidence?.evidence?.seasonalState;
        if (!source) return Object.freeze({
            id:'FX-SEASONAL', category:'seasonalContext', status:strengthEffectStatuses.UNAVAILABLE,
            direction:strengthEffectDirections.NONE, sourceEvidenceIds:Object.freeze([]), sourceRefs:Object.freeze([]),
            statement:'月令季节证据不可用。', boundary:'缺少季节证据时不得补推季节效应。'
        });
        const interpreted = seasonalStatement(source.state);
        return Object.freeze({
            id:'FX-SEASONAL',
            category:'seasonalContext',
            status:strengthEffectStatuses.RECOGNIZED,
            direction:interpreted.direction,
            state:source.state || '',
            season:source.season || '',
            monthZhi:source.monthZhi || '',
            sourceEvidenceIds:Object.freeze([source.id].filter(Boolean)),
            sourceRefs:Object.freeze(checkedRefs(source.sourceRefs, semanticModel)),
            statement:interpreted.statement,
            boundary:'季节方向只是一个独立轴，不得单独生成身强身弱结论。'
        });
    };

    const visibleAxisMeta = Object.freeze({
        visibleSupportActors:Object.freeze({ direction:strengthEffectDirections.SUPPORT_CANDIDATE, label:'扶身方向' }),
        visibleRestraintActors:Object.freeze({ direction:strengthEffectDirections.RESTRAINT_CANDIDATE, label:'克制方向' }),
        visibleDrainActors:Object.freeze({ direction:strengthEffectDirections.DRAIN_CANDIDATE, label:'泄力方向' }),
        visibleDistributionActors:Object.freeze({ direction:strengthEffectDirections.DISTRIBUTION_CANDIDATE, label:'向财星分力方向' })
    });

    const buildVisibleEffects = (strengthEvidence = {}, semanticModel = {}) => Object.entries(visibleAxisMeta).flatMap(([axis, meta]) =>
        (strengthEvidence?.evidence?.[axis] || []).map((item) => Object.freeze({
            id:`FX-${item.id || axis}`,
            category:'visibleStemRelation',
            axis,
            status:strengthEffectStatuses.PRESENCE_ONLY,
            direction:meta.direction,
            actorKey:`visible:${item.pillarIndex}:${item.gan}`,
            position:item.position || '',
            positionLabel:item.positionLabel || '',
            gan:item.gan || '',
            wuxing:item.wuxing || '',
            tenGod:item.tenGod || '',
            relation:item.relation || '',
            sourceEvidenceIds:Object.freeze([item.id].filter(Boolean)),
            sourceRefs:Object.freeze(checkedRefs(item.sourceRefs, semanticModel)),
            statement:`${item.positionLabel || ''}${item.gan || ''}与日主构成“${item.relation || '未定'}”关系，记为${meta.label}的存在证据。`,
            boundary:'这里只确认作用方向候选，不判断该天干是否已经获得有效承载、通根或实际发挥多少力量。'
        }))
    );

    const buildRootEffects = (result = {}, semanticModel = {}) => {
        const dayGan = result.dayGan || '';
        const dayElement = result.dayGanWuXing || baziCore.getWuXing?.(dayGan) || '';
        const hidden = hiddenActors(result);
        const exactRoots = hidden.filter((item) => item.gan === dayGan);
        const sameElementRoots = hidden.filter((item) => item.wuxing === dayElement && item.gan !== dayGan);
        const hiddenSupport = hidden.filter((item) => SUPPORT_GODS.has(item.tenGod));

        const makePresenceEffect = ({ id, category, actors, sourceRefs, presentStatement, absentStatement }) => Object.freeze({
            id,
            category,
            status:actors.length ? strengthEffectStatuses.PRESENCE_ONLY : strengthEffectStatuses.ABSENT,
            direction:actors.length ? strengthEffectDirections.SUPPORT_CANDIDATE : strengthEffectDirections.NONE,
            presence:actors.length ? 'present' : 'absent',
            actors:freezeActors(actors),
            sourceEvidenceIds:Object.freeze([]),
            sourceRefs:Object.freeze(checkedRefs(sourceRefs, semanticModel)),
            statement:actors.length ? presentStatement : absentStatement,
            boundary:'存在事实只表示这一类扶身条件出现；根或藏支印比的实际状态、受制与可用程度仍未判断。'
        });

        return Object.freeze([
            makePresenceEffect({
                id:'FX-ROOT-EXACT', category:'exactRootPresence', actors:exactRoots, sourceRefs:['F04','D03'],
                presentStatement:`地支藏干见日主本干${dayGan}，形成本干通根的存在事实。`,
                absentStatement:`地支藏干未见日主本干${dayGan}通根。`
            }),
            makePresenceEffect({
                id:'FX-ROOT-SAME-ELEMENT', category:'sameElementRootPresence', actors:sameElementRoots, sourceRefs:['F04','D04'],
                presentStatement:'地支藏干见与日主同五行的异干，形成同类得地的存在事实。',
                absentStatement:'地支藏干未见日主同五行异干得地。'
            }),
            makePresenceEffect({
                id:'FX-HIDDEN-SUPPORT', category:'hiddenSupportPresence', actors:hiddenSupport, sourceRefs:['F04','D06'],
                presentStatement:'地支藏干见比劫或印星，形成藏支扶身要素的存在事实。',
                absentStatement:'地支藏干未见比劫或印星扶身要素。'
            })
        ]);
    };

    const buildBranchQiEffects = (strengthEvidence = {}, semanticModel = {}) => (strengthEvidence?.evidence?.branchQi || []).map((item) => Object.freeze({
        id:`FX-${item.id || `BQ-${item.position || ''}`}`,
        category:'branchQiContext',
        status:strengthEffectStatuses.CONTEXT_ONLY,
        direction:strengthEffectDirections.CONTEXTUAL,
        position:item.position || '',
        positionLabel:item.positionLabel || '',
        zhi:item.zhi || '',
        system:item.system || 'twelveGrowthStages',
        systemLabel:item.systemLabel || '十二长生',
        state:item.state || '—',
        sourceEvidenceIds:Object.freeze([item.id].filter(Boolean)),
        sourceRefs:Object.freeze(checkedRefs(item.sourceRefs, semanticModel)),
        statement:`${item.positionLabel || ''}【${item.zhi || ''}】在十二长生中为“${item.state || '—'}”，当前只作为支气状态记录。`,
        boundary:'十二长生状态在本阶段不映射为“得气／失气”、扶身强度或身强弱结论。'
    }));

    const buildStrengthEffects = (result = {}, semanticModel = {}) => {
        const strengthEvidence = semanticModel?.strengthEvidence || null;
        if (!strengthEvidence || strengthEvidence.state === 'unavailable') {
            return Object.freeze({
                version:STRENGTH_EFFECTS_VERSION,
                state:'unavailable',
                dayMaster:strengthEvidence?.dayMaster || null,
                effects:Object.freeze([]),
                issues:Object.freeze(['strength-evidence-unavailable'])
            });
        }

        const effects = Object.freeze([
            buildSeasonalEffect(strengthEvidence, semanticModel),
            ...buildVisibleEffects(strengthEvidence, semanticModel),
            ...buildRootEffects(result, semanticModel),
            ...buildBranchQiEffects(strengthEvidence, semanticModel)
        ]);
        const issues = [...(strengthEvidence.issues || [])];

        return Object.freeze({
            version:STRENGTH_EFFECTS_VERSION,
            state:issues.length ? 'partial-unaggregated' : 'interpreted-unaggregated',
            dayMaster:strengthEvidence.dayMaster || null,
            effects,
            issues:Object.freeze(issues),
            overlapPolicy:'same-actor-may-carry-multiple-semantics-do-not-add',
            blockedInferences:Object.freeze([
                '不把候选方向按数量相加为强弱分数。',
                '不把同一藏干在通根与印比两种语义中的重复出现计作两份力量。',
                '不把三合、三会、五合等结构直接解释成某五行已经增强、减弱或成化。',
                '不从十二长生单项状态直接生成支得气、支失气或身强身弱。'
            ]),
            boundaries:Object.freeze([
                '本层只把已确认事实翻译为中间作用方向或存在状态。',
                '本层不设置权重、分值、强度等级或多寡阈值。',
                '不同方向之间尚未进行冲突处理、充分性判断或最终归纳。'
            ])
        });
    };

    GuiJia.baziStrengthEffects = Object.freeze({
        STRENGTH_EFFECTS_VERSION,
        strengthEffectStatuses,
        strengthEffectDirections,
        collectSemanticRefs,
        buildSeasonalEffect,
        buildVisibleEffects,
        buildRootEffects,
        buildBranchQiEffects,
        buildStrengthEffects
    });
})(typeof window !== 'undefined' ? window : globalThis);
