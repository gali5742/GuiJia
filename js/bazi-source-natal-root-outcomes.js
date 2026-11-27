(function (global) {
    'use strict';
    const g = global.GuiJia;
    if (!g || g.baziSourceNatalRootOutcomes?.installed) return;
    const bridge = g.baziQianliQuantitySemanticBridge, review = g.baziSourceStrengthReviewProfile;
    const charts = g.baziVisibleStemFunctionRealizationSource, contract = g.baziQualitativeComparisonEvidenceContract;
    if (!bridge || !review || !charts || !contract) return;
    const { freeze } = contract;
    const sourceUrl = 'https://zh.wikisource.org/zh-hant/滴天髓闡微';
    const cases = freeze([
        { id: 'NRO-01', chart: '甲申|甲戌|甲寅|甲戌', locator: '干支总论·天全一气·四甲造',
            span: '冲去禄神，其根已拔', anchor: 'daymaster:2:甲', pairs: [[0,2]], outcome: 'uprooted' },
        { id: 'NRO-02', chart: '甲寅|戊辰|丙寅|丙申', locator: '干支总论·地生天者，天衰怕冲·前造',
            span: '第嫌比肩盖头，冲之无力', anchor: null, pairs: [[3,0],[3,2]], outcome: 'weak-clash' },
        { id: 'NRO-03', chart: '壬申|甲辰|丙寅|丙申', locator: '干支总论·地生天者，天衰怕冲·后造',
            span: '两申冲寅，甲木之根拔', anchor: null, pairs: [[0,2],[3,2]], outcome: 'uprooted' }
    ]);
    const rows = (items) => Array.isArray(items) ? items.filter(Boolean) : [];
    const positions = ['year','month','day','hour'];
    const only = (items) => items.length === 1 ? items[0] : null;

    const bindClashes = (entry, model, synthesis) => {
        const contexts = rows(model.strengthEffects?.branchStructureContexts);
        const structures = rows(model.structures);
        const bindings = [];
        for (const [shen, yin] of entry.pairs) {
            const actors = [[shen,'申'], [yin,'寅']];
            if (!actors.every(([index, zhi]) => review.bindChartActor(`surface-branch:${index}:${zhi}`, model, synthesis))) return null;
            const matches = contexts.filter((item) => item.relationCode === 'BRANCH_SIX_CLASH'
                && item.participants?.length === 2 && actors.every(([index,zhi]) => item.participants.some((participant) =>
                    participant?.pillarIndex === index && participant.zhi === zhi && participant.position === positions[index])));
            const match = only(matches);
            if (!match?.structureRef || !only(contexts.filter((item) => item.structureRef === match.structureRef))
                || only(structures.filter((item) => item.id === match.structureRef))?.code !== match.relationCode) return null;
            bindings.push({ structureRef: match.structureRef, shenActorKey: `surface-branch:${shen}:申`, yinActorKey: `surface-branch:${yin}:寅` });
        }
        return bindings;
    };

    // NRO-03 identifies the wood root in 寅. It leaves attribution to visible month 甲 open.
    const bindJiaRoot = (entry, model, synthesis, clashes) => {
        if (entry.anchor && !review.bindChartActor(entry.anchor, model, synthesis)) return null;
        const branches = bridge.buildSurfaceBranchInventory(model);
        if (branches.length !== 4 || !branches.every((row, i) => row.zhi === entry.chart.split('|')[i][1] && row.pillarIndex === i)) return null;
        const key = 'hidden:2:寅:甲:0';
        const expected = bridge.buildHiddenModifierInventory(model, branches).find((row) => row.actorKey === key);
        const root = only(rows(synthesis.qianliQuantitySemanticBridgeInventory?.hiddenModifierInventory).filter((row) => row.actorKey === key));
        const fields = ['id','scope','position','pillarIndex','zhi','gan','level','wuxing','tenGod','parentSurfaceBranchId'];
        if (!root || !expected || !fields.every((field) => root[field] === expected[field])) return null;
        const inventory = synthesis.contextualForcePartyMembershipInventory;
        const evidence = rows(inventory?.evidenceRecords).filter((row) => row.actorKey === key && row.sourceScope !== 'root-foundation');
        if (!only(rows(inventory?.actorProfiles).filter((row) => row.actorKey === key)) || !evidence.length
            || !evidence.every((row) => row.sourceScope === 'hidden-modifier' && row.sourceRecordId === root.id
                && ['position','pillarIndex','zhi','gan','wuxing','tenGod'].every((field) => row[field] === root[field]))) return null;
        let rootStateId = null;
        if (entry.anchor) {
            const state = only(rows(synthesis.rootActorStates).filter((row) => row.actorKey === key));
            if (!state?.id || state.rootRole !== 'exact-root' || state.presence !== 'present'
                || !['pillarIndex','position','zhi','gan','level'].every((field) => state[field] === root[field])
                || !clashes.every((clash) => state.relatedStructureRefs?.includes(clash.structureRef))) return null;
            if (!(state.resolutionStatus === 'unresolved' && state.effectiveState === null)
                && !(state.resolutionStatus === 'resolved' && state.effectiveState === 'ineffective')) return null;
            for (const clash of clashes) {
                const relation = only(rows(synthesis.rootSixRelationRecords).filter((item) =>
                    item.actorKey === key && item.structureRef === clash.structureRef));
                if (relation?.rootStateId !== state.id || relation.relationKind !== 'six-clash'
                    || relation.relationCode !== 'BRANCH_SIX_CLASH' || relation.rootRole !== state.rootRole
                    || (relation.effectiveState !== null && relation.effectiveState !== 'ineffective')) return null;
            }
            rootStateId = state.id;
        }
        return { anchorActorKey: entry.anchor, anchorStatus: entry.anchor ? 'source-named-daymaster' : 'holder-unresolved',
            rootActorKey: key, hiddenRecordId: root.id, rootStateId,
            evidenceRecordIds: evidence.map((row) => row.id), effectiveState: 'ineffective', physicalPresence: 'present' };
    };

    const evaluate = (model = {}, synthesis = {}) => {
        const chartKey = charts.buildStructuredChartKey(model, synthesis);
        const entry = cases.find((item) => item.chart === chartKey);
        if (!entry) return null;
        const result = (status, clashes = [], rootOutcome = null) => freeze({
            chartKey, caseId: entry.id, sourceUrl, locator: entry.locator, natalSpan: entry.span, status, clashes,
            localClashForce: status === 'verified-source-weak-clash' ? 'source-asserted-ineffective' : null,
            rootOutcome, finalStrength: null
        });
        const clashes = bindClashes(entry, model, synthesis);
        if (!clashes) return result('clash-identity-unresolved');
        if (entry.outcome === 'weak-clash') {
            if (!review.bindChartActor('visible:3:丙', model, synthesis)) return result('covering-stem-unresolved', clashes);
            return result('verified-source-weak-clash', clashes);
        }
        const root = bindJiaRoot(entry, model, synthesis, clashes);
        return root ? result('verified-source-uprooted', clashes, root) : result('root-evidence-unresolved', clashes);
    };
    g.baziSourceNatalRootOutcomes = freeze({ installed: true, cases, evaluate });
})(typeof window !== 'undefined' ? window : globalThis);
