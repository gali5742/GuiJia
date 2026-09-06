(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterfactualPathPairProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCounterfactualPathPairContract || null;
    const placementApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternative || null;
    const modernSupportSource = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource || null;
    if (!contractApi || !placementApi || !modernSupportSource) return;

    const { VERSION, RULE_ID, PAIR_STATES, SOURCE_REGISTRY, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...(items || [])]);
    const modernEvidenceById = Object.freeze(Object.fromEntries((modernSupportSource.EVIDENCE || []).map((item) => [item.id, item])));

    const validatePath = (path = {}, prefix = '') => {
        const issues = [];
        if (!path.id || !path.semanticLabel || !path.sourceRoleClass || !path.predicateWording || !path.targetRoleClass || !path.sourceWording) issues.push(`${prefix}incomplete-path`);
        if (path.executable !== false) issues.push(`${prefix}path-cannot-be-executable`);
        if (path.memberEdgeExpansion !== false) issues.push(`${prefix}path-cannot-expand-member-edges`);
        return issues;
    };

    const validatePair = (entry = {}) => {
        const issues = [];
        const placementAudit = placementApi.buildAudit?.() || null;
        const placement = placementAudit?.profile?.resolvedAlternatives?.find((item) => item.id === entry.placementAlternativeId) || null;
        const evidence = (entry.modernEvidenceIds || []).map((id) => modernEvidenceById[id]).filter(Boolean);
        const actualPaths = entry.actual?.paths || [];
        const counterfactualPaths = entry.counterfactual?.paths || [];

        if (!entry.id) issues.push('missing-id');
        if (!placement) issues.push('missing-resolved-placement-alternative');
        if (placement) {
            if (placement.interpretationContested !== true) issues.push('placement-must-preserve-contested-provenance');
            if (placement.alternativeChart !== null || placement.exactAlternativeActorKey !== null) issues.push('placement-must-not-synthesize-alternate-chart-or-actor');
            if (placement.actualInterpretationWording !== entry.actual?.wording) issues.push('actual-wording-mismatch');
            if (placement.alternativeInterpretationWording !== entry.counterfactual?.wording) issues.push('counterfactual-wording-mismatch');
        }
        if (entry.interpretationContested !== true) issues.push('pair-must-preserve-contested-provenance');
        if (evidence.length !== (entry.modernEvidenceIds || []).length) issues.push('missing-modern-evidence');
        if (!(entry.modernEvidenceIds || []).includes('CF-RSMS-E04') || !(entry.modernEvidenceIds || []).includes('CF-RSMS-E05')) issues.push('required-modern-evidence-pair-missing');
        evidence.forEach((item) => { if (item.sourceId !== entry.sourceId) issues.push(`modern-evidence-source-mismatch:${item.id || ''}`); });

        if (entry.actual?.compositionMode !== 'coexisting-source-paths') issues.push('actual-composition-mode-mismatch');
        if (actualPaths.length !== 2) issues.push('actual-path-count-mismatch');
        actualPaths.forEach((path, index) => issues.push(...validatePath(path, `actual-${index}:`)));
        if (!actualPaths.some((path) => path.semanticLabel === 'wealth-generates-killer')) issues.push('actual-missing-wealth-generates-killer');
        if (!actualPaths.some((path) => path.semanticLabel === 'food-controls-killer')) issues.push('actual-missing-food-controls-killer');

        if (entry.counterfactual?.compositionMode !== 'source-chain') issues.push('counterfactual-composition-mode-mismatch');
        if (counterfactualPaths.length !== 2) issues.push('counterfactual-path-count-mismatch');
        counterfactualPaths.forEach((path, index) => issues.push(...validatePath(path, `counterfactual-${index}:`)));
        if (counterfactualPaths[0]?.semanticLabel !== 'food-generates-wealth') issues.push('counterfactual-step-1-mismatch');
        if (counterfactualPaths[1]?.semanticLabel !== 'wealth-generates-killer') issues.push('counterfactual-step-2-mismatch');
        if (counterfactualPaths[0]?.targetRoleClass !== counterfactualPaths[1]?.sourceRoleClass) issues.push('counterfactual-chain-role-continuity-mismatch');

        return Object.freeze({ valid:issues.length === 0, issues:freezeArray(issues), placement, evidence:freezeArray(evidence) });
    };

    const freezeComposition = (composition = {}) => Object.freeze({
        id:composition.id || null, placementState:composition.placementState || null, wording:composition.wording || '', compositionMode:composition.compositionMode || null,
        paths:freezeArray((composition.paths || []).map((path) => Object.freeze({ ...path, intermediateRoleClasses:freezeArray(path.intermediateRoleClasses || []) }))),
        executionAuthorized:false, runtimeWinnerPathId:null, memberEdges:Object.freeze([]), numericWeight:null
    });

    const buildPair = (entry = {}) => {
        const validation = validatePair(entry);
        if (!validation.valid) return Object.freeze({ status:PAIR_STATES.UNRESOLVED, id:entry.id || null, validation, actual:null, counterfactual:null, runtimeSelection:null, relationEffects:Object.freeze([]), memberEdges:Object.freeze([]) });
        return Object.freeze({
            status:PAIR_STATES.RESOLVED_SOURCE_SCOPED, id:entry.id, placementAlternativeId:entry.placementAlternativeId,
            sourceId:entry.sourceId, modernEvidenceIds:freezeArray(entry.modernEvidenceIds), interpretationContested:true,
            actual:freezeComposition(entry.actual), counterfactual:freezeComposition(entry.counterfactual),
            sourceScopedInterpretationPair:true, runtimeSelection:null, alternateChart:null, exactCounterfactualActorKey:null,
            relationEffects:Object.freeze([]), memberEdges:Object.freeze([]), relativeDominance:null, numericScore:null,
            validation,
            boundary:'该 pair 只保存徐氏对同一命例实际 placement 与反事实 placement class 的两套 source interpretation；不选择哪一套用于任意新命盘，也不把 role-level path 转成 actor-level executable edges。'
        });
    };

    const buildProfile = () => {
        const pairs = freezeArray(Object.values(SOURCE_REGISTRY).map(buildPair));
        const resolvedPairs = pairs.filter((item) => item.status === PAIR_STATES.RESOLVED_SOURCE_SCOPED);
        const unresolvedPairs = pairs.filter((item) => item.status !== PAIR_STATES.RESOLVED_SOURCE_SCOPED);
        return Object.freeze({
            status:unresolvedPairs.length ? 'counterfactual-path-pair-partial' : 'counterfactual-path-pair-complete',
            resolverScope:CONTRACT.resolverScope, pairs, resolvedPairs:freezeArray(resolvedPairs), unresolvedPairs:freezeArray(unresolvedPairs),
            finiteCoverageComplete:pairs.length === Object.keys(SOURCE_REGISTRY).length && unresolvedPairs.length === 0,
            runtimePairSelector:null, relationEffects:Object.freeze([]), memberEdges:Object.freeze([]), relativeDominance:null, numericScore:null, scalarForce:null
        });
    };

    GuiJia.baziContextualForcePartyCounterfactualPathPairProfile = Object.freeze({ installed:true, VERSION, RULE_ID, PAIR_STATES, CONTRACT, validatePair, buildPair, buildProfile });
})(typeof window !== 'undefined' ? window : globalThis);
