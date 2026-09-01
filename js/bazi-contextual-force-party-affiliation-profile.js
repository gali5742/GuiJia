(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyAffiliationProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyAffiliationContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, AFFILIATION_STATES, MOTIFS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const actorProfileMap = (inventory = {}) => new Map(
        (inventory.actorProfiles || []).map((item) => [item.actorKey, item])
    );

    const evidenceByActor = (inventory = {}) => {
        const map = new Map();
        (inventory.evidenceRecords || []).forEach((item) => {
            if (!item.actorKey) return;
            if (!map.has(item.actorKey)) map.set(item.actorKey, []);
            map.get(item.actorKey).push(item);
        });
        return map;
    };

    const actorTenGods = (inventory = {}, actorKey = '') => freezeArray(unique(
        (evidenceByActor(inventory).get(actorKey) || []).map((item) => item.tenGod)
    ));

    const matchesMotif = (edge = {}, motif = {}, inventory = {}) => {
        if (edge.relationScope !== 'cross-visible-actor' || edge.directed === false) return false;
        if (!edge.sourceActorKey || !edge.targetActorKey || edge.functionType !== motif.functionType) return false;

        const profiles = actorProfileMap(inventory);
        const sourceProfile = profiles.get(edge.sourceActorKey);
        const targetProfile = profiles.get(edge.targetActorKey);
        if (!sourceProfile || !targetProfile) return false;
        if (!(sourceProfile.membershipClasses || []).includes('context-dependent-unassigned')) return false;
        if (!(targetProfile.membershipClasses || []).includes(motif.targetMembershipClass)) return false;

        const sourceTenGods = actorTenGods(inventory, edge.sourceActorKey);
        const targetTenGods = actorTenGods(inventory, edge.targetActorKey);
        return sourceTenGods.some((item) => motif.sourceTenGods.includes(item))
            && targetTenGods.some((item) => motif.targetTenGods.includes(item));
    };

    const stateForRealization = (realizationState = '') => {
        if (realizationState === 'realized-in-source-context') return AFFILIATION_STATES.AFFILIATED;
        if (realizationState === 'not-realized-in-source-context') return AFFILIATION_STATES.NOT_AFFILIATED_THROUGH_EDGE;
        return AFFILIATION_STATES.UNRESOLVED_THROUGH_EDGE;
    };

    const makeAffiliationRecord = (edge = {}, motif = {}, inventory = {}, index = 0) => {
        const state = stateForRealization(edge.realizationState);
        const affiliated = state === AFFILIATION_STATES.AFFILIATED;
        const blocked = state === AFFILIATION_STATES.UNRESOLVED_THROUGH_EDGE;
        const targetProfile = actorProfileMap(inventory).get(edge.targetActorKey) || {};
        const targetAnchorId = (targetProfile.counterAnchorIds || [])[0] || `counter-anchor:${edge.targetActorKey}`;
        return Object.freeze({
            id:`CF-PA-${String(index + 1).padStart(2, '0')}`,
            motifId:motif.id,
            sourceRegistryEvidenceIds:motif.sourceEvidenceIds,
            relationRecordId:edge.id || null,
            relationScope:edge.relationScope || null,
            sourcePatternId:edge.sourcePatternId || null,
            sourceActorKey:edge.sourceActorKey,
            targetActorKey:edge.targetActorKey,
            targetAnchorId,
            functionType:edge.functionType,
            sourceActorTenGods:actorTenGods(inventory, edge.sourceActorKey),
            targetActorTenGods:actorTenGods(inventory, edge.targetActorKey),
            realizationState:edge.realizationState || null,
            affiliationState:state,
            affiliated,
            blocked,
            actorGlobalParty:null,
            forceMagnitude:null,
            numericWeight:null,
            statement:affiliated
                ? '该财星→官／杀 anchor 的 generation edge 已在 source context 中兑现，因此只在这一 target context 下记录财星归附并扶助该具体 anchor。'
                : blocked
                    ? '该财星→官／杀 anchor edge 已被识别，但 realization 尚未解析，因此这一 affiliation 继续阻断。'
                    : '该财星→官／杀 anchor edge 已明确未兑现，因此只记录“未通过这一 edge 形成归附”；不得反向归到另一侧。',
            boundary:'Affiliation 严格绑定 source actor、target anchor、function 与 source context；不得升级为 actor global party，也不得传播到其他 anchor。'
        });
    };

    const buildAffiliationRecords = (synthesis = {}) => {
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const edges = synthesis.visibleStemFunctionRealizationRecords || [];
        const records = [];
        edges.forEach((edge) => {
            MOTIFS.forEach((motif) => {
                if (!matchesMotif(edge, motif, inventory)) return;
                records.push(makeAffiliationRecord(edge, motif, inventory, records.length));
            });
        });
        return freezeArray(records);
    };

    const buildAffiliationView = (synthesis = {}) => {
        const records = buildAffiliationRecords(synthesis);
        const blockers = records.filter((item) => item.blocked);
        const affiliatedRecords = records.filter((item) => item.affiliated);
        const nonAffiliationRecords = records.filter((item) => item.affiliationState === AFFILIATION_STATES.NOT_AFFILIATED_THROUGH_EDGE);
        return Object.freeze({
            status:!records.length
                ? 'known-motif-not-applicable'
                : blockers.length
                    ? 'known-motif-coverage-partial'
                    : 'known-motif-coverage-complete',
            motifIds:freezeArray(MOTIFS.map((item) => item.id)),
            records,
            affiliatedRecords:freezeArray(affiliatedRecords),
            nonAffiliationRecords:freezeArray(nonAffiliationRecords),
            blockerRecords:freezeArray(blockers),
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            targetAnchorIds:freezeArray(unique(affiliatedRecords.map((item) => item.targetAnchorId))),
            genericRuleFamilyCoverageComplete:false,
            relativeDominance:null,
            partyConfiguration:null,
            activeMemberCount:null,
            numericScore:null,
            boundary:'Known motif coverage 只说明当前已登记 motif 的可识别 edge 是否均有 affiliation 结论；当前 rule-family 仍不完整，因此不能据此关闭 generic contextual affiliation blocker。'
        });
    };

    GuiJia.baziContextualForcePartyAffiliationProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        AFFILIATION_STATES,
        MOTIFS,
        CONTRACT,
        actorProfileMap,
        evidenceByActor,
        actorTenGods,
        matchesMotif,
        stateForRealization,
        makeAffiliationRecord,
        buildAffiliationRecords,
        buildAffiliationView
    });
})(typeof window !== 'undefined' ? window : globalThis);
