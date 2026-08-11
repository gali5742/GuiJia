(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const factApi = GuiJia.liuyaoTimeFacts;
    const effectApi = GuiJia.liuyaoTimeEffects;
    const assessmentApi = GuiJia.liuyaoTimeAssessment;
    if (!factApi?.validateTimeFact) throw new Error('liuyao-time-facts.js must be loaded before liuyao-time-evidence.js');
    if (!effectApi?.validateTimeEffectSet) throw new Error('liuyao-time-effects.js must be loaded before liuyao-time-evidence.js');
    if (!assessmentApi?.validateNodeAssessment) throw new Error('liuyao-time-assessment.js must be loaded before liuyao-time-evidence.js');

    const SCHEMA_VERSION = 1;
    const DIMENSIONS = Object.freeze([...effectApi.DIMENSIONS]);
    const TIER_RANK = Object.freeze({ primary:3, secondary:2, context:1 });
    const SINGULAR_SUBJECTS = new Set(['main-observer','main-observer-change','opposite']);

    const safeEventView = (event, index) => ({
        event,
        index,
        code:String(event?.code || ''),
        label:String(event?.label || ''),
        text:String(event?.text || ''),
        subject:String(event?.subject || 'context'),
        tier:String(event?.tier || 'context'),
        score:Number(event?.score || 0),
        fact:event?.fact || null,
        timeEffects:event?.timeEffects || null
    });

    const entityKey = (view) => {
        const ref = view?.fact?.subjectRef || {};
        const kind = String(ref.kind || view?.subject || 'context');
        const position = Number(ref.position);
        if (Number.isFinite(position) && position >= 1 && position <= 6) return `${kind}:p${position}`;
        if (SINGULAR_SUBJECTS.has(kind)) return kind;
        // 三合等同类结构可能同时存在多组；没有位置时不跨事件做“包含”判断。
        return '';
    };

    const semanticKeys = (view) => new Set(Array.isArray(view?.fact?.semanticKeys) ? view.fact.semanticKeys : []);
    const coverageKinds = (view, assessment) => {
        const required = new Set(assessment?.activeKinds || []);
        return DIMENSIONS.filter((kind) => required.has(kind) && Boolean(view?.timeEffects?.dimensions?.[kind]?.length));
    };

    const sameEntity = (a, b) => {
        const ak = entityKey(a);
        const bk = entityKey(b);
        return Boolean(ak && bk && ak === bk);
    };

    const setContainsAll = (outer, inner) => {
        for (const value of inner) if (!outer.has(value)) return false;
        return true;
    };

    const compoundSubsumes = (compound, child, assessment) => {
        if (!sameEntity(compound, child)) return false;
        const subsumes = new Set(compound?.fact?.subsumes || []);
        const childKeys = semanticKeys(child);
        if (!subsumes.size || !childKeys.size || !setContainsAll(subsumes, childKeys)) return false;
        const compoundKeys = semanticKeys(compound);
        if (compoundKeys.size <= childKeys.size) return false;
        const compoundCoverage = new Set(coverageKinds(compound, assessment));
        const childCoverage = new Set(coverageKinds(child, assessment));
        return setContainsAll(compoundCoverage, childCoverage);
    };

    const sameSemanticEvidence = (a, b, assessment) => {
        const ak = entityKey(a);
        const bk = entityKey(b);
        if (!ak || !bk || ak !== bk) return false;
        const aKeys = [...semanticKeys(a)].sort();
        const bKeys = [...semanticKeys(b)].sort();
        if (JSON.stringify(aKeys) !== JSON.stringify(bKeys)) return false;
        const aCoverage = coverageKinds(a, assessment).sort();
        const bCoverage = coverageKinds(b, assessment).sort();
        return JSON.stringify(aCoverage) === JSON.stringify(bCoverage);
    };

    const hasSemanticKey = (view, key) => semanticKeys(view).has(key);

    const composeSiblingFacts = (views = []) => {
        const composites = [];
        const memberToComposite = new Map();
        const groups = new Map();
        views.forEach((view) => {
            const key = entityKey(view);
            if (!key) return;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(view);
        });
        groups.forEach((group) => {
            const out = group.find((view) => hasSemanticKey(view, 'void-transition:out'));
            const value = group.find((view) => hasSemanticKey(view, 'branch-relation:value'));
            if (!out || !value || out === value) return;
            if ((out.fact?.semanticKeys || []).includes('branch-relation:value')) return;
            const components = [];
            const componentSeen = new Set();
            [out, value].forEach((view) => (view.fact?.components || []).forEach((component) => {
                const key = factApi.semanticKeyForComponent(component);
                if (componentSeen.has(key)) return;
                componentSeen.add(key);
                components.push({ ...component });
            }));
            const sourceCode = `EVIDENCE_VOID_OUT_VALUE:${[out.code, value.code].sort().join('+')}`;
            const subjectRef = Object.keys(out.fact?.subjectRef || {}).length >= Object.keys(value.fact?.subjectRef || {}).length
                ? { ...(out.fact?.subjectRef || {}) }
                : { ...(value.fact?.subjectRef || {}) };
            const semantic = [...componentSeen];
            const fact = {
                schemaVersion:factApi.SCHEMA_VERSION,
                sourceCode,
                family:'compound',
                relation:'compound',
                subject:out.subject,
                subjectRef,
                components,
                semanticKeys:semantic,
                subsumes:semantic,
                meta:{ evidenceComposite:true, memberEventCodes:[out.code, value.code] }
            };
            const tier = (TIER_RANK[out.tier] || 0) >= (TIER_RANK[value.tier] || 0) ? out.tier : value.tier;
            const event = {
                code:sourceCode,
                label:'出空并逢值',
                text:[out.text, value.text].filter(Boolean).join('；'),
                subject:out.subject,
                tier,
                score:Math.max(out.score, value.score),
                fact,
                timeEffects:effectApi.mapTimeFactToEffects(fact),
                evidenceComposite:true,
                memberEventCodes:[out.code, value.code]
            };
            const view = safeEventView(event, Math.min(out.index, value.index));
            composites.push(view);
            memberToComposite.set(out.code, view.code);
            memberToComposite.set(value.code, view.code);
        });
        return { composites, memberToComposite };
    };

    const evidencePriority = (view, assessment) => {
        const covers = coverageKinds(view, assessment);
        const mainObserver = view.subject === 'main-observer' ? 1 : 0;
        const compound = (view?.fact?.components || []).length > 1 ? 1 : 0;
        return {
            covers:covers.length,
            mainObserver,
            tier:TIER_RANK[view.tier] || 0,
            compound,
            score:view.score,
            inverseIndex:-view.index
        };
    };

    const comparePriority = (a, b, assessment) => {
        const ap = evidencePriority(a, assessment);
        const bp = evidencePriority(b, assessment);
        for (const key of ['covers','mainObserver','tier','compound','score','inverseIndex']) {
            if (ap[key] !== bp[key]) return bp[key] - ap[key];
        }
        return a.code.localeCompare(b.code);
    };

    const pruneEvidenceCandidates = (events = [], assessment) => {
        const baseViews = (events || []).map(safeEventView).filter((view) => view.code && view.text && view.fact && view.timeEffects);
        const { composites, memberToComposite } = composeSiblingFacts(baseViews);
        const suppressed = [];
        const preDroppedCodes = new Set(memberToComposite.keys());
        memberToComposite.forEach((byEventCode, eventCode) => {
            suppressed.push({ eventCode, reason:'coalesced-into-compound', byEventCode });
        });
        const views = [...baseViews.filter((view) => !preDroppedCodes.has(view.code)), ...composites];
        const dropped = new Set();

        for (let i = 0; i < views.length; i += 1) {
            if (dropped.has(i)) continue;
            for (let j = 0; j < views.length; j += 1) {
                if (i === j || dropped.has(j)) continue;
                if (!compoundSubsumes(views[i], views[j], assessment)) continue;
                dropped.add(j);
                suppressed.push({ eventCode:views[j].code, reason:'subsumed-by-compound', byEventCode:views[i].code });
            }
        }

        const surviving = views.filter((_, index) => !dropped.has(index));
        const semanticDropped = new Set();
        for (let i = 0; i < surviving.length; i += 1) {
            if (semanticDropped.has(i)) continue;
            for (let j = i + 1; j < surviving.length; j += 1) {
                if (semanticDropped.has(j) || !sameSemanticEvidence(surviving[i], surviving[j], assessment)) continue;
                const pair = [surviving[i], surviving[j]].sort((a, b) => comparePriority(a, b, assessment));
                const keep = pair[0];
                const drop = pair[1];
                const dropIndex = surviving.indexOf(drop);
                semanticDropped.add(dropIndex);
                suppressed.push({ eventCode:drop.code, reason:'semantic-duplicate', byEventCode:keep.code });
            }
        }
        return {
            candidates:surviving.filter((_, index) => !semanticDropped.has(index)),
            suppressed
        };
    };

    const toEvidenceItem = (view, assessment) => ({
        eventCode:view.code,
        label:view.label,
        text:view.text,
        subject:view.subject,
        tier:view.tier,
        score:view.score,
        factCode:String(view.fact?.sourceCode || view.code),
        entityKey:entityKey(view),
        semanticKeys:[...(view.fact?.semanticKeys || [])],
        coversKinds:coverageKinds(view, assessment),
        sourceIndex:view.index,
        memberEventCodes:[...(view.event?.memberEventCodes || view.fact?.meta?.memberEventCodes || [view.code])]
    });

    const selectNodeEvidence = (events = [], assessment, preferredLimit = 3) => {
        const assessmentErrors = assessmentApi.validateNodeAssessment(assessment);
        if (assessmentErrors.length) throw new Error(`invalid Node Assessment in evidence selector: ${assessmentErrors.join(',')}`);
        const requiredKinds = [...(assessment.activeKinds || [])];
        const { candidates, suppressed } = pruneEvidenceCandidates(events, assessment);
        const ranked = [...candidates].sort((a, b) => comparePriority(a, b, assessment));
        const uncovered = new Set(requiredKinds);
        const selected = [];

        // RC.1：只要摘要中的某个维度能由“主要观察爻自身”直接证明，
        // Evidence Selector 就先保留该直接证据，再用外围关系爻补齐剩余维度。
        // 这样不会出现观察爻自己逢值，却被同支外围爻的一条多维证据挤出用户输出。
        while (uncovered.size) {
            let bestDirect = null;
            let bestDirectCoverage = -1;
            ranked.forEach((view) => {
                if (selected.includes(view) || view.subject !== 'main-observer') return;
                const newCoverage = coverageKinds(view, assessment).filter((kind) => uncovered.has(kind)).length;
                if (newCoverage > bestDirectCoverage) {
                    bestDirect = view;
                    bestDirectCoverage = newCoverage;
                    return;
                }
                if (newCoverage === bestDirectCoverage && bestDirect && comparePriority(view, bestDirect, assessment) < 0) bestDirect = view;
            });
            if (!bestDirect || bestDirectCoverage <= 0) break;
            selected.push(bestDirect);
            coverageKinds(bestDirect, assessment).forEach((kind) => uncovered.delete(kind));
        }

        while (uncovered.size) {
            let best = null;
            let bestNewCoverage = -1;
            ranked.forEach((view) => {
                if (selected.includes(view)) return;
                const newCoverage = coverageKinds(view, assessment).filter((kind) => uncovered.has(kind)).length;
                if (newCoverage > bestNewCoverage) {
                    best = view;
                    bestNewCoverage = newCoverage;
                    return;
                }
                if (newCoverage === bestNewCoverage && best && comparePriority(view, best, assessment) < 0) best = view;
            });
            if (!best || bestNewCoverage <= 0) break;
            selected.push(best);
            coverageKinds(best, assessment).forEach((kind) => uncovered.delete(kind));
        }

        // Evidence Selector 只负责证明摘要，不为凑满固定条数添加同维度冗余事实。
        // 若覆盖全部摘要维度需要超过 preferredLimit，则允许自动扩容；展示层若想追加上下文，后续另行选择。
        const minimumRequiredCount = selected.length;
        const selectedOrdered = [...selected].sort((a, b) => a.index - b.index);
        const items = selectedOrdered.map((view) => toEvidenceItem(view, assessment));
        const coveredKinds = DIMENSIONS.filter((kind) => items.some((item) => item.coversKinds.includes(kind)));
        const uncoveredKinds = requiredKinds.filter((kind) => !coveredKinds.includes(kind));
        return {
            schemaVersion:SCHEMA_VERSION,
            assessmentSignature:String(assessment.signature || 'none'),
            preferredLimit:Math.max(0, Number(preferredLimit) || 0),
            minimumRequiredCount,
            requiredKinds,
            coveredKinds,
            uncoveredKinds,
            selected:items,
            suppressed,
            candidateCount:candidates.length
        };
    };

    const validateEvidenceBundle = (bundle, assessment) => {
        const errors = [];
        if (!bundle || typeof bundle !== 'object') return ['bundle-not-object'];
        if (bundle.schemaVersion !== SCHEMA_VERSION) errors.push('schema-version');
        if (!Array.isArray(bundle.requiredKinds)) errors.push('required-kinds');
        if (!Array.isArray(bundle.coveredKinds)) errors.push('covered-kinds');
        if (!Array.isArray(bundle.uncoveredKinds)) errors.push('uncovered-kinds');
        if (!Array.isArray(bundle.selected)) errors.push('selected');
        if (!Array.isArray(bundle.suppressed)) errors.push('suppressed');
        const expectedKinds = assessment?.activeKinds || [];
        if (JSON.stringify(bundle.requiredKinds || []) !== JSON.stringify(expectedKinds)) errors.push('required-kind-mismatch');
        if ((bundle.uncoveredKinds || []).length) errors.push(`uncovered:${bundle.uncoveredKinds.join(',')}`);
        const seenCodes = new Set();
        (bundle.selected || []).forEach((item, index) => {
            if (!item?.eventCode) errors.push(`selected-code:${index}`);
            if (!Array.isArray(item?.coversKinds) || !item.coversKinds.length) errors.push(`selected-coverage:${index}`);
            if (seenCodes.has(item.eventCode)) errors.push(`selected-duplicate:${item.eventCode}`);
            seenCodes.add(item.eventCode);
            (item.coversKinds || []).forEach((kind) => {
                if (!DIMENSIONS.includes(kind)) errors.push(`selected-unknown-kind:${kind}`);
            });
        });
        expectedKinds.forEach((kind) => {
            if (!(bundle.selected || []).some((item) => item.coversKinds?.includes(kind))) errors.push(`missing-evidence:${kind}`);
        });
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeEvidence = {
        SCHEMA_VERSION,
        DIMENSIONS,
        entityKey,
        compoundSubsumes,
        sameSemanticEvidence,
        composeSiblingFacts,
        pruneEvidenceCandidates,
        selectNodeEvidence,
        validateEvidenceBundle
    };
})(window);
