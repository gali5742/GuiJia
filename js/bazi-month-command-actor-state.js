(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziMonthCommandActorState?.installed) return;

    const baziCore = GuiJia.baziCore || {};
    const effectsApi = GuiJia.baziStrengthEffects || null;

    const MONTH_COMMAND_ACTOR_STATE_VERSION = '0.1';
    const MONTH_COMMAND_ACTOR_STATE_RULE_ID = 'BAZI-MONTH-COMMAND-ACTOR-STATE-001';

    const sourceInteractionStates = Object.freeze({
        INJURED:'source-injured'
    });

    const SOURCE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-CHEN-XU-YI-COMMAND-VULNERABILITY-001',
            source:'《滴天髓阐微·地支》',
            monthZhi:'辰',
            clashPair:Object.freeze(['辰','戌']),
            commandGan:'乙',
            commandElement:'木',
            attackerZhi:'戌',
            attackerHiddenGan:'辛',
            attackerElement:'金',
            sourceTerm:'三月之辰，乙木司令，逢戌冲，则戌中辛金，亦能伤乙木',
            sourceSummaryTerm:'冲则受伤，不足用矣',
            scope:'source-specific-conditional'
        }),
        Object.freeze({
            id:'DTS-WEI-CHOU-DING-COMMAND-VULNERABILITY-001',
            source:'《滴天髓阐微·地支》',
            monthZhi:'未',
            clashPair:Object.freeze(['未','丑']),
            commandGan:'丁',
            commandElement:'火',
            attackerZhi:'丑',
            attackerHiddenGan:'癸',
            attackerElement:'水',
            sourceTerm:'六月之未，丁火司令，逢丑冲，则丑中癸水，亦能伤丁火',
            sourceSummaryTerm:'冲则受伤，不足用矣',
            scope:'source-specific-conditional'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'MONTH-COMMAND-ACTOR-STATE-CONTRACT-001',
        version:MONTH_COMMAND_ACTOR_STATE_VERSION,
        actorRole:'month-command-actor',
        interactionRole:'interaction-target-capable',
        commandPresenceIsInvulnerability:false,
        monthBranchCanSubstituteCommandFact:false,
        sourceInjuredMapsToGenericEffectiveness:false,
        sourceInsufficientForUseMapsToCanonicalCommandRemoval:false,
        genericMonthCommandClashRule:'unresolved',
        directSourcePatterns:Object.freeze(SOURCE_PATTERNS.map((item) => item.id)),
        statement:'人元司令 actor 可以成为地支冲所作用的对象；司令身份本身不赋予“不可受伤”或自动有效。',
        boundary:'只有当对应司令 actor 已由同源或明确兼容的 source-specific observation 独立解析时，才可执行辰戌／丑未两条原典 vulnerability pattern；月支本身不得替代司令事实。'
    });

    const boundaries = Object.freeze([
        '辰月不自动等同于乙木司令，未月不自动等同于丁火司令。',
        '司令 actor 的 source-specific“受伤／不足用”不得自动映射为 generic weakened、ineffective、月令失效、司令消失或最终身强弱。',
        '四库逢冲不自动产生 vulnerability；本层只保存《滴天髓阐微》明确列出的辰戌乙木、丑未丁火条件模式。',
        '不同来源的人元司事表不得自动补齐《滴天髓阐微》模式所要求的司令输入；必须保持来源兼容边界。'
    ]);

    const isResolvedDtsCommandObservation = (profile = {}, requiredGan = '') => {
        if (!profile || profile.sourceCommandGan !== requiredGan) return false;
        if (!String(profile.sourceId || '').startsWith('DTS-')) return false;
        return ['resolved-explicit-source-window','case-assertion-observed','resolved-source-command'].includes(profile.resolutionStatus);
    };

    const findCompatibleCommandObservation = (semanticModel = {}, pattern = {}) =>
        (semanticModel.monthCommand?.sourceProfiles || []).find((profile) =>
            isResolvedDtsCommandObservation(profile, pattern.commandGan)
        ) || null;

    const findClashContext = (result = {}, semanticModel = {}, pattern = {}) => {
        const availableIds = new Set((semanticModel.structures || []).map((item) => item.id).filter(Boolean));
        const catalog = typeof baziCore.buildBaziStructureCatalog === 'function'
            ? baziCore.buildBaziStructureCatalog(result.internalRelations || [])
            : [];
        return catalog.find((relation) => {
            if (relation.code !== 'BRANCH_SIX_CLASH') return false;
            const ref = relation._semanticRef || relation.id || '';
            if (!ref || !availableIds.has(ref)) return false;
            const indices = relation.pillarIndices || [];
            if (!indices.includes(1)) return false;
            const zhis = indices.map((index) => result.pillars?.[index]?.zhi).filter(Boolean).sort().join('');
            return zhis === [...pattern.clashPair].sort().join('');
        }) || null;
    };

    const hasSourceAttackerHiddenGan = (pattern = {}) =>
        (baziCore.cangGanMap?.[pattern.attackerZhi] || []).some(([gan]) => gan === pattern.attackerHiddenGan);

    const buildPatternRecord = (result = {}, semanticModel = {}, pattern = {}, index = 0) => {
        const monthZhi = result.pillars?.[1]?.zhi || result.monthSeason?.monthZhi || '';
        if (monthZhi !== pattern.monthZhi) return null;

        const clash = findClashContext(result, semanticModel, pattern);
        if (!clash) return null;

        const structureRef = clash._semanticRef || clash.id || '';
        const commandObservation = findCompatibleCommandObservation(semanticModel, pattern);
        const attackerVerified = hasSourceAttackerHiddenGan(pattern);
        const base = {
            id:`MCAS-${String(index + 1).padStart(2, '0')}`,
            patternId:pattern.id,
            source:pattern.source,
            monthZhi:pattern.monthZhi,
            clashPair:pattern.clashPair,
            structureRef,
            commandActor:Object.freeze({
                gan:pattern.commandGan,
                element:pattern.commandElement,
                sourceObservationId:commandObservation?.sourceId || '',
                sourceResolutionStatus:commandObservation?.resolutionStatus || 'unresolved'
            }),
            attackerActor:Object.freeze({
                zhi:pattern.attackerZhi,
                hiddenGan:pattern.attackerHiddenGan,
                element:pattern.attackerElement,
                sourceHiddenGanVerified:attackerVerified
            }),
            sourceTerm:pattern.sourceTerm,
            sourceSummaryTerm:pattern.sourceSummaryTerm,
            genericEffectiveness:null,
            canonicalCommandStateChange:null
        };

        if (!commandObservation) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-command-input',
                sourceInteractionState:null,
                sourceUsabilityOutcome:null,
                statement:`已识别${pattern.clashPair.join('')}冲及原典 vulnerability pattern，但当前没有同源已解析的${pattern.commandGan}司令 observation。`,
                boundary:'月份与冲关系均不能替代司令 actor 输入；不得提前生成“受伤”或“不足用”。'
            });
        }

        if (!attackerVerified) {
            return Object.freeze({
                ...base,
                resolutionStatus:'unresolved-source-attacker-provenance',
                sourceInteractionState:null,
                sourceUsabilityOutcome:null,
                statement:'司令输入已解析，但原典所指冲方藏干 actor 无法从当前基础表核验。',
                boundary:'攻击 actor provenance 未核验时不得生成 source outcome。'
            });
        }

        return Object.freeze({
            ...base,
            resolutionStatus:'resolved-source-vulnerability',
            sourceInteractionState:sourceInteractionStates.INJURED,
            sourceUsabilityOutcome:'不足用',
            statement:`按${pattern.source}直接条件，${pattern.commandGan}司令 actor 在该库冲中可受${pattern.attackerZhi}中${pattern.attackerHiddenGan}所伤；记录原典“受伤／不足用”结果。`,
            boundary:'这里只解析原典 source outcome；不得把 source-injured 自动等同 generic weakened/ineffective，也不得删除司令事实。'
        });
    };

    const buildMonthCommandActorState = (result = {}, semanticModel = {}) => {
        const records = SOURCE_PATTERNS.map((pattern, index) => buildPatternRecord(result, semanticModel, pattern, index)).filter(Boolean);
        return Object.freeze({
            version:MONTH_COMMAND_ACTOR_STATE_VERSION,
            ruleId:MONTH_COMMAND_ACTOR_STATE_RULE_ID,
            state:records.length ? 'observed' : 'not-applicable',
            contract:CONTRACT,
            records:Object.freeze(records),
            unresolvedCount:records.filter((item) => item.resolutionStatus !== 'resolved-source-vulnerability').length,
            resolvedCount:records.filter((item) => item.resolutionStatus === 'resolved-source-vulnerability').length,
            boundaries
        });
    };

    function installStrengthEffectsHook() {
        const api = GuiJia.baziStrengthEffects;
        if (!api?.buildStrengthEffects || api.__monthCommandActorStateHookInstalled) return false;
        const originalBuild = api.buildStrengthEffects;
        const wrapped = function (result = {}, semanticModel = {}) {
            const collection = originalBuild(result, semanticModel);
            semanticModel.monthCommandActorState = buildMonthCommandActorState(result, semanticModel);
            return collection;
        };
        GuiJia.baziStrengthEffects = Object.freeze({
            ...api,
            buildStrengthEffects:wrapped,
            __monthCommandActorStateHookInstalled:true
        });
        return true;
    }

    GuiJia.baziMonthCommandActorState = Object.freeze({
        installed:true,
        MONTH_COMMAND_ACTOR_STATE_VERSION,
        MONTH_COMMAND_ACTOR_STATE_RULE_ID,
        sourceInteractionStates,
        SOURCE_PATTERNS,
        CONTRACT,
        boundaries,
        isResolvedDtsCommandObservation,
        findCompatibleCommandObservation,
        findClashContext,
        buildPatternRecord,
        buildMonthCommandActorState,
        installStrengthEffectsHook
    });

    installStrengthEffectsHook();
})(typeof window !== 'undefined' ? window : globalThis);
