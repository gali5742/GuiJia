(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziVisibleStemFunctionRealizationSource?.installed) return;

    // Research bootstrap dependency: ./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0

    const priorSynthesisApi = GuiJia.baziStrengthSynthesis || null;
    const baseRealizationApi = GuiJia.baziVisibleStemFunctionRealization || null;

    const VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION = '0.4';
    const VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID = 'BAZI-STRENGTH-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-001';

    const sourceRealizationStates = Object.freeze({
        REALIZED_IN_SOURCE_CONTEXT:'realized-in-source-context',
        NOT_REALIZED_IN_SOURCE_CONTEXT:'not-realized-in-source-context'
    });

    const DTS_SOURCE = Object.freeze({
        title:'《滴天髓阐微》',
        sourceUrl:'https://zh.wikisource.org/zh-hans/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE',
        revisionId:2600158,
        retrievedOn:'2026-10-10'
    });

    const SOURCE_BASIS = Object.freeze([
        Object.freeze({
            source:'《滴天髓阐微·干支总论》左右贵乎同志前后造比较',
            chart:'壬申 丙午 庚午 庚辰',
            term:'日主有比肩之助；彼则时干比劫帮身，又可生水',
            supports:Object.freeze(['hour-geng-daymaster-peer-support-realized-without-directed-generation'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》左右贵乎同志后造',
            chart:'壬午 丙午 庚申 戊寅',
            term:'此则时上枭神克水，而不能生食',
            supports:Object.freeze(['visible-wu-to-visible-ren-restraint-realized','visible-wu-to-visible-ren-generation-not-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'最喜丁火独发，泄其精英',
            supports:Object.freeze(['daymaster-yi-to-visible-ding-generation-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'惜癸水克丁，仍伤秀气',
            supports:Object.freeze(['visible-gui-to-visible-ding-restraint-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·八格》命例',
            chart:'丁丑 癸卯 乙卯 己卯',
            term:'时干己土临绝，不能去其癸水',
            supports:Object.freeze(['visible-ji-to-visible-gui-restraint-not-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·干支总论》左右贵乎同志命例',
            chart:'壬申 丙午 庚午 庚辰',
            term:'用壬制杀，天干之同志者',
            supports:Object.freeze(['visible-ren-to-visible-bing-restraint-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·何知章》何知其人贱命例',
            chart:'丁卯 甲辰 辛亥 癸巳',
            term:'癸水克丁，亥水冲巳，似乎制杀有情，不知春水休囚，木火并旺，不但不能克火',
            supports:Object.freeze(['visible-gui-to-visible-ding-restraint-not-realized'])
        }),
        Object.freeze({
            source:'《滴天髓阐微·通关》命例',
            chart:'癸酉 甲子 丁卯 丙午',
            term:'此造天干地支皆杀生印，印生身',
            supports:Object.freeze(['visible-gui-to-visible-jia-generation-realized'])
        })
    ]);

    const COMPARISON_SOURCE = Object.freeze({ ...DTS_SOURCE, revisionId:null, retrievedOn:'2026-11-25' });
    const DIRECT_SOURCE_PATTERNS = Object.freeze([
        Object.freeze({
            id:'DTS-PEER-REALIZATION-HOUR-GENG-HELPS-DAYMASTER-001',
            chartKey:'壬申|丙午|庚午|庚辰',
            relationScope:'daymaster-related',
            directed:false,
            peerParticipantActorKeys:Object.freeze(['visible:3:庚', 'daymaster:2:庚']),
            functionType:'peer-support',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'日主有比肩之助',
            sourceCitation:'《滴天髓阐微·干支总论》左右贵乎同志前后造比较',
            sourceProvenance:COMPARISON_SOURCE,
            sourceContext:'此丙火之杀虽旺，壬水之根亦固，日主有比肩之助，辰土之生，谓身杀两停。彼则时干比劫帮身，又可生水。',
            endpointBinding:'前造唯一非日干庚为时干庚，后造比较又明确以前造时干比劫帮身指认该参与者。保存为时干庚与日主的无向 peer pair，不建立有向 generation。又可生水只说明另一 function 的能力，不授权其 realization。',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-WU-RESTRAINS-REN-001',
            chartKey:'壬午|丙午|庚申|戊寅',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:3:戊', targetActorKey:'visible:0:壬', functionType:'restraint',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'此则时上枭神克水',
            sourceCitation:'《滴天髓阐微·干支总论》左右贵乎同志后造',
            sourceProvenance:COMPARISON_SOURCE,
            sourceContext:'此则壬水坐午之绝地，敌杀无力；彼则时干比劫帮身，又可生水，此则时上枭神克水，而不能生食。',
            endpointBinding:'此指后造，时上枭神为时干戊，水与食均承接年干壬。前造时干庚的功能不迁移到后造；敌杀无力没有注册为壬→丙 not-realized。',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-WU-NOT-GENERATES-REN-001',
            chartKey:'壬午|丙午|庚申|戊寅',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:3:戊', targetActorKey:'visible:0:壬', functionType:'generation',
            realizationState:sourceRealizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'此则时上枭神克水，而不能生食',
            sourceCitation:'《滴天髓阐微·干支总论》左右贵乎同志后造',
            sourceProvenance:COMPARISON_SOURCE,
            sourceContext:'此则壬水坐午之绝地，敌杀无力；彼则时干比劫帮身，又可生水，此则时上枭神克水，而不能生食。',
            endpointBinding:'食承接庚日主的年干壬食神。不能生食明确否定戊→壬 generation；同一 pair 的 restraint 独立保存，不能作为日主的直接 support 或反向力量。',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'daymaster-related',
            sourceActorKey:'daymaster:2:乙',
            targetActorKey:'visible:0:丁',
            functionType:'generation',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'最喜丁火独发，泄其精英',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:1:癸',
            targetActorKey:'visible:0:丁',
            functionType:'restraint',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'惜癸水克丁，仍伤秀气',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-JI-RESTRAINS-GUI-001',
            chartKey:'丁丑|癸卯|乙卯|己卯',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:3:己',
            targetActorKey:'visible:1:癸',
            functionType:'restraint',
            realizationState:sourceRealizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'时干己土临绝，不能去其癸水',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001',
            chartKey:'壬申|丙午|庚午|庚辰',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:0:壬',
            targetActorKey:'visible:1:丙',
            functionType:'restraint',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'用壬制杀，天干之同志者',
            sourceCitation:'《滴天髓阐微·干支总论》左右贵乎同志命例',
            sourceProvenance:DTS_SOURCE,
            sourceContext:'此丙火之杀虽旺，壬水之根亦固，日主有比肩之助，辰土之生，谓身杀两停。用壬制杀，天干之同志者；地支之同志者，辰土也，一制一化，可谓有情。',
            endpointBinding:'原文分别点名壬水、丙火之杀，并明确把用壬制杀归于天干；四柱只有年干壬和月干丙两个对应 visible actor。地支辰土之化另属 branch scope，不合并到该 edge。',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-002',
            chartKey:'丁卯|甲辰|辛亥|癸巳',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:3:癸',
            targetActorKey:'visible:0:丁',
            functionType:'restraint',
            realizationState:sourceRealizationStates.NOT_REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'癸水克丁，亥水冲巳，似乎制杀有情，不知春水休囚，木火并旺，不但不能克火',
            sourceCitation:'《滴天髓阐微·何知章》何知其人贱命例',
            sourceProvenance:DTS_SOURCE,
            sourceContext:'此春金逢火，理宜印化杀，财星坏印，癸水克丁，亥水冲巳，似乎制杀有情，不知春水休囚，木火并旺，不但不能克火，反去生木泄金；财官本可荣身，而日空不能胜任，虽心专必欲求之。',
            endpointBinding:'癸水克丁点名唯一时干癸→年干丁；后文似乎／不知／不但不能克火否定该制杀结果。亥冲巳另属 branch relation；反去生木不自动生成 reverse effect 或其他 effect type。',
            scope:'exact-source-case-only'
        }),
        Object.freeze({
            id:'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001',
            chartKey:'癸酉|甲子|丁卯|丙午',
            relationScope:'cross-visible-actor',
            sourceActorKey:'visible:0:癸',
            targetActorKey:'visible:1:甲',
            functionType:'generation',
            realizationState:sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT,
            sourceTerm:'此造天干地支皆杀生印，印生身',
            sourceCitation:'《滴天髓阐微·通关》命例',
            sourceProvenance:DTS_SOURCE,
            sourceContext:'此造天干地支皆杀生印，印生身，时归禄旺，尤妙四冲反为四助，金见水克木而生水，水见木不克火而生木，此自然不隔不占，无阻节之物。',
            endpointBinding:'原文明确把杀生印同时落在天干与地支。丁日主的天干只有年干癸为七杀、月干甲为正印，故天干 clause 唯一绑定癸→甲；地支杀印关系仍属独立 branch scope，不创建其 hidden/member edges。',
            scope:'exact-source-case-only'
        })
    ]);

    const CONTRACT = Object.freeze({
        id:'VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT-001',
        version:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION,
        inputLevel:'function-realization-records-plus-direct-source-case',
        outputLevel:'exact-source-relation-edge-realization-refinement',
        directSourceExactCaseOnly:true,
        mayResolveExistingDayMasterEdge:true,
        mayIntroduceSourceExplicitCrossVisibleEdge:true,
        mayResolveExactSourcePeerPair:true,
        peerUsesUnorderedParticipantPair:true,
        peerDoesNotCreateDirectedEndpoints:true,
        elementalRelationAloneDoesNotCreateEdge:true,
        bearingAloneDoesNotResolveEdge:true,
        sourceContextStateIsNotActorGlobalState:true,
        genericReachabilityResolverIntroduced:false,
        genericRealizationResolverIntroduced:false,
        actorGlobalEffectiveState:false,
        numericAggregation:false,
        majorityVoting:false,
        priorityAggregation:false,
        finalStrengthMapping:false,
        statement:'本层把原典命例中明确落到 directed source→target→function 或无向 peer participant pair 的叙述写成 exact-source realization；可细化既有 day-master relation，并补入原文明确点名的 cross-visible edge。',
        boundary:'命例外不得仅凭五行相生相克、柱位距离、bearing-supported 或 actor presence 泛化为 realized / not-realized；source-context realization 也不得升级为 actor global effective / ineffective。'
    });

    const unique = (items = []) => [...new Set(items.filter(Boolean))];
    const freezeArray = (items = []) => Object.freeze([...items]);

    const visibleEffects = (semanticModel = {}) => (semanticModel.strengthEffects?.effects || [])
        .filter((item) => item.category === 'visibleStemRelation');

    const actorPillarIndex = (actorKey = '') => {
        const value = Number(String(actorKey).split(':')[1]);
        return Number.isInteger(value) ? value : null;
    };

    const buildStructuredChartKey = (semanticModel = {}, synthesis = {}) => {
        const stems = ['', '', semanticModel.strengthEvidence?.dayMaster?.gan || '', ''];
        const branches = ['', '', '', ''];

        visibleEffects(semanticModel).forEach((effect) => {
            const pillarIndex = actorPillarIndex(effect.actorKey);
            if (pillarIndex != null && pillarIndex !== 2) stems[pillarIndex] = effect.gan || '';
        });

        (synthesis.visibleStemFunctionalAvailabilityRecords || []).forEach((record) => {
            const pillarIndex = Number(record.pillarIndex);
            if (Number.isInteger(pillarIndex) && pillarIndex !== 2) branches[pillarIndex] = record.bearingZhi || '';
        });

        (semanticModel.strengthEvidence?.evidence?.branchQi || []).forEach((record) => {
            if (Number(record.pillarIndex) === 2) branches[2] = record.zhi || '';
        });

        if (!branches[1]) branches[1] = semanticModel.strengthEvidence?.evidence?.seasonalState?.monthZhi || '';
        if (stems.some((item) => !item) || branches.some((item) => !item)) return null;
        return stems.map((gan, index) => `${gan}${branches[index]}`).join('|');
    };

    const knownActorKeys = (semanticModel = {}) => {
        const dayGan = semanticModel.strengthEvidence?.dayMaster?.gan || '';
        return new Set([
            ...(dayGan ? [`daymaster:2:${dayGan}`] : []),
            ...visibleEffects(semanticModel).map((item) => item.actorKey).filter(Boolean)
        ]);
    };

    const participantEffectIdsFor = (semanticModel = {}, actorKeys = []) => {
        const byActor = new Map(visibleEffects(semanticModel).map((item) => [item.actorKey, item.id]));
        return freezeArray(unique(actorKeys.map((actorKey) => byActor.get(actorKey))));
    };

    const contextConditionIdsFor = (synthesis = {}, actorKeys = []) => {
        if (typeof baseRealizationApi?.bearingConditionIdsForActors === 'function') {
            return baseRealizationApi.bearingConditionIdsForActors(synthesis, actorKeys);
        }
        return Object.freeze([]);
    };

    const participantKeysFor = (pattern = {}) => pattern.directed === false
        ? pattern.peerParticipantActorKeys || [] : [pattern.sourceActorKey, pattern.targetActorKey];
    const identityFor = (record = {}) => record.directed === false
        ? `${record.relationScope}|peer|${unique(record.peerParticipantActorKeys || []).sort().join('|')}|${record.functionType}`
        : `${record.relationScope}|directed|${record.sourceActorKey}|${record.targetActorKey}|${record.functionType}`;
    const findMatchingRecord = (records = [], pattern = {}) => records.find((record) =>
        identityFor(record) === identityFor(pattern)
    ) || null;

    const makeDirectSourceRecord = (pattern = {}, existingRecord = null, semanticModel = {}, synthesis = {}, index = 0) => {
        const actorKeys = participantKeysFor(pattern);
        const peer = pattern.directed === false;
        const realized = pattern.realizationState === sourceRealizationStates.REALIZED_IN_SOURCE_CONTEXT;
        return Object.freeze({
            ...(existingRecord || {}),
            id:existingRecord && Object.values(sourceRealizationStates).includes(existingRecord.realizationState)
                && existingRecord.realizationState !== pattern.realizationState
                ? `${existingRecord.id}-SOURCE` : existingRecord?.id || `VSFRZS-${String(index + 1).padStart(2, '0')}`,
            relationScope:existingRecord?.relationScope || pattern.relationScope,
            upstreamDirectedFunctionRecordId:existingRecord?.upstreamDirectedFunctionRecordId || null,
            sourcePatternId:pattern.id,
            sourceEvidenceRuleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
            sourceEvidenceKind:'direct-source-relation-outcome',
            sourceCitation:pattern.sourceCitation || '《滴天髓阐微·八格》命例',
            sourceProvenance:pattern.sourceProvenance || null,
            sourceContext:pattern.sourceContext || null,
            endpointBinding:pattern.endpointBinding || null,
            sourceTerm:pattern.sourceTerm,
            relationFromDayMaster:existingRecord?.relationFromDayMaster || null,
            flow:existingRecord?.flow || (pattern.relationScope === 'daymaster-related' ? null : 'cross-actor-directed'),
            functionType:pattern.functionType,
            strengthMeaning:existingRecord?.strengthMeaning || null,
            directed:!peer,
            sourceActorKey:peer ? null : pattern.sourceActorKey,
            targetActorKey:peer ? null : pattern.targetActorKey,
            peerParticipantActorKeys:freezeArray(peer ? actorKeys : []),
            participantActorKeys:freezeArray(actorKeys),
            participantEffectIds:participantEffectIdsFor(semanticModel, actorKeys),
            reachabilityRecordId:existingRecord?.reachabilityRecordId || null,
            reachabilityState:existingRecord?.reachabilityState || null,
            contextConditionRecordIds:existingRecord?.contextConditionRecordIds || contextConditionIdsFor(synthesis, actorKeys),
            realizationState:pattern.realizationState,
            resolutionStatus:realized
                ? 'resolved-direct-source-function-realized'
                : 'resolved-direct-source-function-not-realized',
            actorGlobalEffectiveState:null,
            genericVisibleEffectiveState:null,
            statement:peer
                ? '原典命例及前后造比较明确说明该 peer pair 的扶助已发生；只保存无向参与者与该命例的 realization。'
                : realized
                ? '原典命例明确描述该 source→target function 已实际发生，因此仅在该 exact source context 下记录 realized-in-source-context。'
                : '原典命例明确描述该 source→target function 未能发生，因此仅在该 exact source context 下记录 not-realized-in-source-context。',
            boundary:'该结果严格绑定命例、参与者与 function；不得迁移到其他命局或其他参与者，也不得升级为 actor 的全局 effective / ineffective。'
        });
    };

    const buildDirectSourceRecords = (semanticModel = {}, synthesis = {}) => {
        const key = buildStructuredChartKey(semanticModel, synthesis);
        if (!key) return Object.freeze([]);
        const actors = knownActorKeys(semanticModel);
        const baseRecords = synthesis.visibleStemFunctionRealizationRecords || [];
        return Object.freeze(DIRECT_SOURCE_PATTERNS
            .filter((pattern) => pattern.chartKey === key)
            .filter((pattern) => participantKeysFor(pattern).length === 2 && participantKeysFor(pattern).every((actorKey) => actors.has(actorKey)))
            .filter((pattern) => pattern.directed !== false || (synthesis.visibleStemDirectedFunctionRecords || []).filter((record) =>
                record.directed === false && record.functionType === pattern.functionType
                && record.flow === 'peer-with-daymaster' && record.strengthMeaning === 'support'
                && record.sourceActor === null && record.targetActor === null
                && (record.peerParticipants || []).length === 2
                && unique((record.peerParticipants || []).map((actor) => actor.actorKey)).length === 2
                && participantKeysFor(pattern).every((key) => (record.peerParticipants || []).some((actor) => actor.actorKey === key))).length === 1)
            .map((pattern, index) => makeDirectSourceRecord(
                pattern,
                findMatchingRecord(baseRecords, pattern),
                semanticModel,
                synthesis,
                index
            )));
    };

    const refineRealizationRecords = (semanticModel = {}, synthesis = {}, sourceRecords = buildDirectSourceRecords(semanticModel, synthesis)) => {
        const replacements = new Map(sourceRecords.map((record) => [
            identityFor(record),
            record
        ]));
        const consumed = new Set();
        const refined = (synthesis.visibleStemFunctionRealizationRecords || []).map((record) => {
            const key = identityFor(record);
            const replacement = replacements.get(key);
            if (!replacement) return record;
            // Keep contrary resolved evidence for the aggregation layer to flag as inconsistent.
            if (Object.values(sourceRealizationStates).includes(record.realizationState)
                && record.realizationState !== replacement.realizationState) return record;
            consumed.add(key);
            return replacement;
        });
        sourceRecords.forEach((record) => {
            const key = identityFor(record);
            if (!consumed.has(key)) refined.push(record);
        });
        return Object.freeze(refined);
    };

    const makeContractClaim = () => Object.freeze({
        id:'SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT',
        claimKey:'visibleStem.function-realization.direct-source.contract',
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        value:Object.freeze({
            exactSourceOnly:true,
            states:Object.freeze(Object.values(sourceRealizationStates)),
            sourceContextStateIsNotActorGlobalState:true,
            genericResolverIntroduced:false
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        rationale:'《滴天髓阐微》同一命例分别明确描述丁火泄秀、癸水克丁以及己土不能去癸水，可作为 source→target→function 层的正反 realization 直证。',
        boundary:'本 Claim 只授权 exact-source pattern；不授权由元素关系、柱距、承载或关系存在自动产生 realization。'
    });

    const makeSourceRecordClaim = (record = {}, index = 0) => Object.freeze({
        id:`SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-${String(index + 1).padStart(2, '0')}`,
        claimKey:`visibleStem.function-realization.direct-source.${record.sourcePatternId || index}`,
        status:'resolved',
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        value:Object.freeze({
            sourceActorKey:record.sourceActorKey,
            targetActorKey:record.targetActorKey,
            directed:record.directed,
            peerParticipantActorKeys:freezeArray(record.peerParticipantActorKeys || []),
            functionType:record.functionType,
            realizationState:record.realizationState,
            sourcePatternId:record.sourcePatternId,
            actorGlobalEffectiveState:null
        }),
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        participantEffectIds:freezeArray(record.participantEffectIds || []),
        dependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        rationale:record.statement,
        boundary:record.boundary
    });

    const buildSourceEvidenceDependency = (sourceRecords = [], claims = []) => Object.freeze({
        id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE',
        kind:'interaction',
        scope:'exact-source-visible-stem-function-realization',
        status:'resolved',
        sourceEffectIds:Object.freeze([]),
        sourceRefs:Object.freeze([]),
        sourcePatternIds:freezeArray(sourceRecords.map((item) => item.sourcePatternId)),
        resolvedByClaimIds:Object.freeze(sourceRecords.length
            ? claims.map((item) => item.id)
            : ['SC-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-CONTRACT']),
        ruleId:VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        dependsOnDependencyIds:Object.freeze(['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']),
        statement:sourceRecords.length
            ? '当前命局命中 exact-source relation outcome；相应 source→target function 已获得 source-context realization 结论。'
            : '当前命局未命中已登记的 exact-source realization pattern；source evidence resolver 本身已完成且不作泛化。',
        boundary:'source evidence resolved 只表示 resolver 已执行；未命中不能解释为 function 未实现，命中也不能解释为 actor 全局有效或无效。'
    });

    const rebuildCoverageDependency = (base = {}, records = [], sourceDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE') || {};
        const unresolved = records.filter((item) => item.realizationState === 'unresolved');
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
            kind:'effectiveness',
            scope:'known-visible-stem-function-realization-coverage',
            status:unresolved.length ? 'unresolved' : 'resolved',
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                sourceDependency.id
            ])),
            statement:!records.length
                ? '本局无已知 visible-stem function edge，realization coverage 为 not-applicable。'
                : unresolved.length
                    ? 'exact-source evidence 已补充部分正反 realization，但仍有已知 function edge 未解析。'
                    : '当前所有已知 function edge 都已有受控 realization 结论。',
            boundary:'Coverage 不按 realized / not-realized 数量投票；任何 source-context 结果仍严格属于对应 relation edge。'
        });
    };

    const rebuildVisibleEffectivenessDependency = (base = {}, coverageDependency = {}, sourceDependency = {}) => {
        const current = (base.dependencies || []).find((item) => item.id === 'SD-VISIBLE-EFFECTIVENESS') || {};
        return Object.freeze({
            ...current,
            id:'SD-VISIBLE-EFFECTIVENESS',
            kind:'effectiveness',
            scope:'visible-stem-effects',
            status:'unresolved',
            dependsOnDependencyIds:freezeArray(unique([
                ...(current.dependsOnDependencyIds || []),
                coverageDependency.id,
                sourceDependency.id
            ])),
            statement:'部分具体 function edge 已有 exact-source realized / not-realized 结论，但 actor profile interpretation 与 generic Visible Effectiveness 仍未解析。',
            boundary:'realized-in-source-context 不等于 actor effective；not-realized-in-source-context 不等于 actor ineffective；不得跨 edge 传播。'
        });
    };

    const extendSynthesis = (semanticModel = {}, base = {}) => {
        if (!base || base.state === 'unavailable') return base;
        const sourceRecords = buildDirectSourceRecords(semanticModel, base);
        const records = refineRealizationRecords(semanticModel, base, sourceRecords);
        const sourceClaims = sourceRecords.map(makeSourceRecordClaim);
        const claims = Object.freeze([...(base.claims || []), makeContractClaim(), ...sourceClaims]);
        const sourceDependency = buildSourceEvidenceDependency(sourceRecords, sourceClaims);
        const coverageDependency = rebuildCoverageDependency(base, records, sourceDependency);
        const visibleDependency = rebuildVisibleEffectivenessDependency(base, coverageDependency, sourceDependency);
        const replacedIds = new Set([
            'SD-VISIBLE-EFFECTIVENESS',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE',
            'SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE'
        ]);
        const dependencies = Object.freeze([
            ...(base.dependencies || []).filter((item) => !replacedIds.has(item.id)),
            visibleDependency,
            sourceDependency,
            coverageDependency
        ]);
        const conflicts = typeof priorSynthesisApi?.detectConflicts === 'function'
            ? priorSynthesisApi.detectConflicts(claims)
            : base.conflicts || Object.freeze([]);
        const sufficiency = typeof priorSynthesisApi?.buildSufficiency === 'function'
            ? priorSynthesisApi.buildSufficiency({ dependencies, conflicts, activeRuleIds:base.activeRuleIds || [] })
            : base.sufficiency;

        return Object.freeze({
            ...base,
            claims,
            dependencies,
            conflicts,
            visibleStemFunctionRealizationRecords:records,
            visibleStemFunctionRealizationSourceRecords:sourceRecords,
            visibleStemFunctionRealizationSourceRuleIds:Object.freeze([VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID]),
            visibleStemFunctionRealizationSourceContract:CONTRACT,
            sufficiency,
            boundaries:Object.freeze([
                ...(base.boundaries || []),
                'Direct Source Function Realization 只接受原典明确点名的 source→target→function outcome，并严格绑定 exact source chart。',
                '正向 realized-in-source-context 与负向 not-realized-in-source-context 处于同一 relation-edge 层级；两者都不是 actor global effectiveState。',
                '未命中 source pattern 的既有 unresolved edge 原样保留，不由五行字面关系或柱位距离兜底。'
            ])
        });
    };

    if (priorSynthesisApi && typeof priorSynthesisApi.buildStrengthSynthesis === 'function') {
        const originalBuildStrengthSynthesis = priorSynthesisApi.buildStrengthSynthesis;
        GuiJia.baziStrengthSynthesis = Object.freeze({
            ...priorSynthesisApi,
            buildStrengthSynthesis:(semanticModel = {}) => extendSynthesis(semanticModel, originalBuildStrengthSynthesis(semanticModel)),
            buildVisibleStemDirectSourceRealizationRecords:buildDirectSourceRecords
        });
    }

    GuiJia.baziVisibleStemFunctionRealizationSource = Object.freeze({
        installed:true,
        VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION,
        VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        sourceRealizationStates,
        DTS_SOURCE,
        SOURCE_BASIS,
        DIRECT_SOURCE_PATTERNS,
        CONTRACT,
        buildStructuredChartKey,
        buildDirectSourceRecords,
        refineRealizationRecords,
        extendSynthesis
    });
})(typeof window !== 'undefined' ? window : globalThis);
