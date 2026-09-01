(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    if (GuiJia.baziContextualForcePartyCounterContextProfile?.installed) return;

    const contractApi = GuiJia.baziContextualForcePartyCounterContextContract || null;
    if (!contractApi) return;

    const { VERSION, RULE_ID, SEASONAL_STATES, MONTH_SCOPE, CONTRACT } = contractApi;
    const freezeArray = (items = []) => Object.freeze([...items]);
    const unique = (items = []) => [...new Set(items.filter(Boolean))];

    const monthBranchOf = (synthesis = {}) =>
        (synthesis.qianliQuantitySemanticBridgeInventory?.sourceSurfaceInventory?.branches || [])
            .find((item) => item.position === 'month')?.zhi || null;

    const evidenceForActor = (synthesis = {}, actorKey = '') =>
        (synthesis.contextualForcePartyMembershipInventory?.evidenceRecords || [])
            .filter((item) => item.actorKey === actorKey);

    const actorIdentity = (synthesis = {}, actorKey = '') => {
        const records = evidenceForActor(synthesis, actorKey);
        const first = records[0] || {};
        return Object.freeze({
            actorKey,
            sourceScopes:freezeArray(unique(records.map((item) => item.sourceScope))),
            gan:first.gan || null,
            zhi:first.zhi || null,
            wuxing:first.wuxing || null,
            positions:freezeArray(unique(records.map((item) => item.position))),
            pillarIndices:freezeArray(unique(records.map((item) => item.pillarIndex).filter((item) => item !== null && item !== undefined)))
        });
    };

    const resolveActorSeasonalContext = (synthesis = {}, actorKey = '') => {
        const identity = actorIdentity(synthesis, actorKey);
        const monthZhi = monthBranchOf(synthesis);
        const scope = MONTH_SCOPE[monthZhi] || null;
        if (!identity.wuxing || !monthZhi || !scope) {
            return Object.freeze({
                actorKey,
                status:'unresolved-missing-seasonal-input',
                monthZhi,
                seasonScope:scope,
                actorElement:identity.wuxing,
                state:null,
                sourceEvidenceIds:Object.freeze([]),
                numericValue:null
            });
        }
        if (scope === 'transitional-unresolved') {
            return Object.freeze({
                actorKey,
                status:'unresolved-transitional-month-day-scope',
                monthZhi,
                seasonScope:scope,
                actorElement:identity.wuxing,
                state:null,
                sourceEvidenceIds:Object.freeze(['CF-CC-S01','CF-CC-S02']),
                numericValue:null,
                boundary:'过渡月存在土旺四季十八日等更细时段语义，v0.1 不把整月粗略赋值。'
            });
        }
        const state = SEASONAL_STATES[scope]?.[identity.wuxing] || null;
        return Object.freeze({
            actorKey,
            status:state ? 'resolved-actor-element-seasonal-state' : 'unresolved-seasonal-state-table-gap',
            monthZhi,
            seasonScope:scope,
            actorElement:identity.wuxing,
            state,
            sourceEvidenceIds:Object.freeze(['CF-CC-S01']),
            numericValue:null,
            boundary:'旺相休囚死只描述 actor 五行在月令季节中的状态，不等于该 actor 或 side 的强弱。'
        });
    };

    const resolveVisibleStemFoundation = (synthesis = {}, actorKey = '') => {
        const identity = actorIdentity(synthesis, actorKey);
        if (!identity.sourceScopes.includes('surface-stem') || !identity.gan || !identity.wuxing) return null;
        const hidden = synthesis.qianliQuantitySemanticBridgeInventory?.hiddenModifierInventory || [];
        const exactRoots = hidden.filter((item) => item.gan === identity.gan);
        const sameElementRoots = hidden.filter((item) => item.wuxing === identity.wuxing && item.gan !== identity.gan);
        const normalize = (item) => Object.freeze({
            sourceRecordId:item.id || null,
            actorKey:item.actorKey || null,
            position:item.position || null,
            pillarIndex:item.pillarIndex ?? null,
            zhi:item.zhi || null,
            gan:item.gan || null,
            wuxing:item.wuxing || null,
            level:item.level || null,
            numericWeight:null
        });
        return Object.freeze({
            actorKey,
            status:'resolved-visible-stem-foundation-inventory',
            scope:'visible-stem-root-foundation',
            exactRootPresence:exactRoots.length ? 'present' : 'absent',
            sameElementRootPresence:sameElementRoots.length ? 'present' : 'absent',
            exactRootRecords:freezeArray(exactRoots.map(normalize)),
            sameElementRootRecords:freezeArray(sameElementRoots.map(normalize)),
            rootEffectivenessClassification:null,
            sourceEvidenceIds:Object.freeze(['CF-CC-F01','CF-CC-F02']),
            numericWeight:null,
            boundary:'这里只解析非日主明干的通根/同类根基 inventory；根存在、层级与根实际有效状态继续分离。'
        });
    };

    const resolveActorFoundationContext = (synthesis = {}, actorKey = '') => {
        const visible = resolveVisibleStemFoundation(synthesis, actorKey);
        if (visible) return visible;
        const identity = actorIdentity(synthesis, actorKey);
        const hidden = identity.sourceScopes.includes('hidden-modifier');
        const branch = identity.sourceScopes.includes('surface-branch');
        return Object.freeze({
            actorKey,
            status:hidden
                ? 'unresolved-hidden-actor-foundation-scope'
                : branch
                    ? 'unresolved-surface-branch-foundation-scope'
                    : 'unresolved-foundation-actor-scope',
            scope:hidden ? 'hidden-actor-foundation' : branch ? 'surface-branch-foundation' : 'unknown-actor-foundation',
            exactRootPresence:null,
            sameElementRootPresence:null,
            rootEffectivenessClassification:null,
            sourceEvidenceIds:Object.freeze(['CF-CC-F01','CF-CC-F02']),
            numericWeight:null,
            boundary:'《子平真诠》足以授权非日主天干通根，但 v0.1 不把这一语义自动推广到地支 actor 或藏干 actor。'
        });
    };

    const buildCounterContextView = (synthesis = {}) => {
        const sideView = synthesis.contextualForcePartySideForceProfileView || {};
        const counterSides = sideView.counterSides || [];
        const records = freezeArray(counterSides.map((side) => {
            const actorKey = side.anchor?.actorKey || '';
            return Object.freeze({
                sideId:side.sideId,
                anchorActorKey:actorKey,
                actorIdentity:actorIdentity(synthesis, actorKey),
                seasonalContext:resolveActorSeasonalContext(synthesis, actorKey),
                foundationContext:resolveActorFoundationContext(synthesis, actorKey),
                forceClassification:null,
                relativeDominance:null,
                numericScore:null
            });
        }));
        const seasonalBlockers = records.filter((item) => !String(item.seasonalContext.status || '').startsWith('resolved'));
        const foundationBlockers = records.filter((item) => !String(item.foundationContext.status || '').startsWith('resolved'));
        return Object.freeze({
            status:seasonalBlockers.length || foundationBlockers.length ? 'mapped-partial-counter-context' : 'mapped-complete-counter-context',
            records,
            seasonalCoverageComplete:seasonalBlockers.length === 0,
            foundationCoverageComplete:foundationBlockers.length === 0,
            seasonalBlockerActorKeys:freezeArray(seasonalBlockers.map((item) => item.anchorActorKey)),
            foundationBlockerActorKeys:freezeArray(foundationBlockers.map((item) => item.anchorActorKey)),
            forceClassification:null,
            relativeDominance:null,
            numericScore:null,
            boundary:'Counter Context 只补 actor-specific seasonal/foundation provenance；不把状态折为 side force。'
        });
    };

    GuiJia.baziContextualForcePartyCounterContextProfile = Object.freeze({
        installed:true,
        VERSION,
        RULE_ID,
        CONTRACT,
        monthBranchOf,
        evidenceForActor,
        actorIdentity,
        resolveActorSeasonalContext,
        resolveVisibleStemFoundation,
        resolveActorFoundationContext,
        buildCounterContextView
    });
})(typeof window !== 'undefined' ? window : globalThis);
