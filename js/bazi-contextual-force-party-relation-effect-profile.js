(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyRelationEffectProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyRelationEffectContract || null;
    const affiliationProfileApi = GuiJia.baziContextualForcePartyAffiliationProfile || null;
    if (!contractApi || !affiliationProfileApi) return;

    const { VERSION, RULE_ID, RELATION_TYPES, EFFECT_STATES, MOTIFS, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const actorProfileMap = (inventory = {}) => new Map(
        (inventory.actorProfiles || []).map((item) => [item.actorKey, item])
    );

    const actorTenGods = (inventory = {}, actorKey = '') =>
        affiliationProfileApi.actorTenGods(inventory, actorKey);

    const stateForRealization = (realizationState = '') => {
        if (realizationState === 'realized-in-source-context') return EFFECT_STATES.REALIZED;
        if (realizationState === 'not-realized-in-source-context') return EFFECT_STATES.NOT_REALIZED;
        return EFFECT_STATES.UNRESOLVED;
    };

    const counterAnchorIdFor = (inventory = {}, actorKey = '') => {
        const profile = actorProfileMap(inventory).get(actorKey) || {};
        return (profile.counterAnchorIds || [])[0] || `counter-anchor:${actorKey}`;
    };

    const hasMembershipClass = (inventory = {}, actorKey = '', membershipClass = '') => {
        const profile = actorProfileMap(inventory).get(actorKey) || {};
        return (profile.membershipClasses || []).includes(membershipClass);
    };

    const tenGodsMatch = (actual = [], expected = []) => actual.some((item) => expected.includes(item));

    const matchesRawMotif = (edge = {}, motif = {}, inventory = {}) => {
        if (edge.relationScope !== 'cross-visible-actor' || edge.directed === false) return false;
        if (!edge.sourcePatternId || !edge.sourceActorKey || !edge.targetActorKey) return false;
        if (edge.functionType !== motif.functionType) return false;

        const sourceTenGods = actorTenGods(inventory, edge.sourceActorKey);
        const targetTenGods = actorTenGods(inventory, edge.targetActorKey);
        if (!tenGodsMatch(sourceTenGods, motif.sourceTenGods)) return false;
        if (!tenGodsMatch(targetTenGods, motif.targetTenGods)) return false;

        if (motif.relationType === RELATION_TYPES.ANCHOR_OPPOSITION) {
            return hasMembershipClass(inventory, edge.sourceActorKey, 'context-dependent-unassigned')
                && hasMembershipClass(inventory, edge.targetActorKey, 'counter-side-anchor-candidate');
        }
        if (motif.relationType === RELATION_TYPES.ANCHOR_MEDIATION) {
            return hasMembershipClass(inventory, edge.sourceActorKey, 'counter-side-anchor-candidate')
                && hasMembershipClass(inventory, edge.targetActorKey, 'daymaster-side-seed-candidate');
        }
        return false;
    };

    const makeAugmentationRecord = (affiliationRecord = {}, motif = {}, index = 0) => {
        const effectState = affiliationRecord.affiliated
            ? EFFECT_STATES.REALIZED
            : affiliationRecord.blocked
                ? EFFECT_STATES.UNRESOLVED
                : EFFECT_STATES.NOT_REALIZED;
        return Object.freeze({
            id:`CF-PRE-AUG-${String(index + 1).padStart(2, '0')}`,
            motifId:motif.id,
            relationType:RELATION_TYPES.ANCHOR_AUGMENTATION,
            sourceRegistryEvidenceIds:motif.sourceRegistryEvidenceIds,
            inputAuthority:motif.inputAuthority,
            sourceIdentityType:'party-affiliation-record',
            sourceIdentityId:affiliationRecord.id || null,
            relationRecordId:affiliationRecord.relationRecordId || null,
            sourcePatternId:affiliationRecord.sourcePatternId || null,
            sourceActorKey:affiliationRecord.sourceActorKey || null,
            targetActorKey:affiliationRecord.targetActorKey || null,
            anchorActorKey:affiliationRecord.targetActorKey || null,
            anchorId:affiliationRecord.targetAnchorId || null,
            opposingActorKey:null,
            mediatorActorKey:null,
            functionType:affiliationRecord.functionType || 'generation',
            realizationState:affiliationRecord.realizationState || null,
            relationEffectState:effectState,
            realized:effectState === EFFECT_STATES.REALIZED,
            blocked:effectState === EFFECT_STATES.UNRESOLVED,
            reusesAffiliationIdentity:true,
            independentForceUnit:false,
            membershipMutation:null,
            actorGlobalParty:null,
            actorGlobalEffectiveness:null,
            daymasterBenefit:null,
            relativeDominanceEffect:null,
            numericWeight:null,
            statement:effectState === EFFECT_STATES.REALIZED
                ? '既有财→官／杀 affiliation edge 已兑现；本层只把同一 edge 解释为对该具体 anchor 的 augmentation，不复制第二份 membership 或力量单位。'
                : effectState === EFFECT_STATES.NOT_REALIZED
                    ? '既有财→官／杀 edge 已明确未兑现；本层只记录该 augmentation 未通过此 edge 形成，不产生反向作用。'
                    : '既有财→官／杀 edge realization 未解；augmentation effect 保持 blocker。',
            boundary:'Augmentation 与 Affiliation 共享同一 relation identity；不得重复计力，也不得传播到其他 anchor。'
        });
    };

    const makeRawRelationRecord = (edge = {}, motif = {}, inventory = {}, index = 0) => {
        const effectState = stateForRealization(edge.realizationState);
        const opposition = motif.relationType === RELATION_TYPES.ANCHOR_OPPOSITION;
        const mediation = motif.relationType === RELATION_TYPES.ANCHOR_MEDIATION;
        const anchorActorKey = opposition ? edge.targetActorKey : edge.sourceActorKey;
        return Object.freeze({
            id:`CF-PRE-${opposition ? 'OPP' : 'MED'}-${String(index + 1).padStart(2, '0')}`,
            motifId:motif.id,
            relationType:motif.relationType,
            sourceRegistryEvidenceIds:motif.sourceRegistryEvidenceIds,
            inputAuthority:motif.inputAuthority,
            sourceIdentityType:'function-realization-record',
            sourceIdentityId:edge.id || null,
            relationRecordId:edge.id || null,
            sourcePatternId:edge.sourcePatternId || null,
            sourceActorKey:edge.sourceActorKey || null,
            targetActorKey:edge.targetActorKey || null,
            anchorActorKey,
            anchorId:counterAnchorIdFor(inventory, anchorActorKey),
            opposingActorKey:opposition ? edge.sourceActorKey : null,
            mediatorActorKey:mediation ? edge.targetActorKey : null,
            functionType:edge.functionType || null,
            sourceActorTenGods:actorTenGods(inventory, edge.sourceActorKey),
            targetActorTenGods:actorTenGods(inventory, edge.targetActorKey),
            realizationState:edge.realizationState || null,
            relationEffectState:effectState,
            realized:effectState === EFFECT_STATES.REALIZED,
            blocked:effectState === EFFECT_STATES.UNRESOLVED,
            reusesAffiliationIdentity:false,
            independentForceUnit:false,
            membershipMutation:null,
            actorGlobalParty:null,
            actorGlobalEffectiveness:null,
            daymasterBenefit:null,
            relativeDominanceEffect:null,
            numericWeight:null,
            statement:opposition
                ? effectState === EFFECT_STATES.REALIZED
                    ? '该食神→七杀 restraint edge 已在 source context 中兑现，因此记录对具体七杀 anchor 的 opposition；不把食神改写为日主侧 member。'
                    : effectState === EFFECT_STATES.NOT_REALIZED
                        ? '该食神→七杀 restraint edge 已明确未兑现；只记录 opposition 未通过此 edge 形成，不产生反向扶杀或 membership。'
                        : '该食神→七杀 restraint edge realization 未解；opposition effect 保持 blocker。'
                : effectState === EFFECT_STATES.REALIZED
                    ? '该七杀→印星 generation edge 已在 source context 中兑现，因此记录 anchor→mediator 的 mediation channel；七杀仍保持 counter anchor identity。'
                    : effectState === EFFECT_STATES.NOT_REALIZED
                        ? '该七杀→印星 generation edge 已明确未兑现；只记录 mediation 未通过此 edge 形成，不反写为印→杀。'
                        : '该七杀→印星 generation edge realization 未解；mediation effect 保持 blocker。',
            boundary:opposition
                ? 'Opposition 是 target-specific 制衡关系，不等于 affiliation；即使后续解释为扶身 outcome，也不能反推 membership。'
                : 'Mediation 保留七杀→印星方向与双方原 membership identity，不形成 party switch 或反向 edge。'
        });
    };

    const buildAugmentationRecords = (synthesis = {}) => {
        const view = synthesis.contextualForcePartyAffiliationView || {};
        const motif = MOTIFS.find((item) => item.relationType === RELATION_TYPES.ANCHOR_AUGMENTATION);
        if (!motif) return Object.freeze([]);
        return freezeArray((view.records || []).map((record, index) => makeAugmentationRecord(record, motif, index)));
    };

    const buildRawRelationRecords = (synthesis = {}) => {
        const inventory = synthesis.contextualForcePartyMembershipInventory || {};
        const edges = synthesis.visibleStemFunctionRealizationRecords || [];
        const motifs = MOTIFS.filter((item) => item.relationType !== RELATION_TYPES.ANCHOR_AUGMENTATION);
        const records = [];
        edges.forEach((edge) => {
            motifs.forEach((motif) => {
                if (!matchesRawMotif(edge, motif, inventory)) return;
                records.push(makeRawRelationRecord(edge, motif, inventory, records.length));
            });
        });
        return freezeArray(records);
    };

    const buildRelationEffectView = (synthesis = {}) => {
        const records = freezeArray([
            ...buildAugmentationRecords(synthesis),
            ...buildRawRelationRecords(synthesis)
        ]);
        const blockers = records.filter((item) => item.blocked);
        const realizedRecords = records.filter((item) => item.realized);
        const nonRealizedRecords = records.filter((item) => item.relationEffectState === EFFECT_STATES.NOT_REALIZED);
        const byType = Object.freeze({
            augmentation:freezeArray(records.filter((item) => item.relationType === RELATION_TYPES.ANCHOR_AUGMENTATION)),
            opposition:freezeArray(records.filter((item) => item.relationType === RELATION_TYPES.ANCHOR_OPPOSITION)),
            mediation:freezeArray(records.filter((item) => item.relationType === RELATION_TYPES.ANCHOR_MEDIATION))
        });
        return Object.freeze({
            status:!records.length
                ? 'known-relation-effect-motifs-not-applicable'
                : blockers.length
                    ? 'known-relation-effect-coverage-partial'
                    : 'known-relation-effect-coverage-complete',
            motifIds:freezeArray(MOTIFS.map((item) => item.id)),
            records,
            realizedRecords:freezeArray(realizedRecords),
            nonRealizedRecords:freezeArray(nonRealizedRecords),
            blockerRecords:freezeArray(blockers),
            byType,
            relationRecordIds:freezeArray(unique(records.map((item) => item.relationRecordId))),
            sourcePatternIds:freezeArray(unique(records.map((item) => item.sourcePatternId))),
            genericRelationEffectCoverageComplete:false,
            relativeDominance:null,
            partyConfiguration:null,
            activeMemberCount:null,
            numericScore:null,
            scalarForce:null,
            boundary:'Known motif coverage 只解释已登记 source-backed relation shapes；记录 relation effect 不等于建立新的 member，也不把 augmentation/opposition/mediation 折成单一正负力量值。'
        });
    };

    GuiJia.baziContextualForcePartyRelationEffectProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        RELATION_TYPES,
        EFFECT_STATES,
        MOTIFS,
        CONTRACT,
        actorProfileMap,
        actorTenGods,
        stateForRealization,
        counterAnchorIdFor,
        hasMembershipClass,
        matchesRawMotif,
        makeAugmentationRecord,
        makeRawRelationRecord,
        buildAugmentationRecords,
        buildRawRelationRecords,
        buildRelationEffectView
    });
})(typeof window !== 'undefined' ? window : globalThis);
