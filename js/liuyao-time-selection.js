(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const outputApi = GuiJia.liuyaoTimeOutput;
    const relevanceApi = GuiJia.liuyaoTimeRelevance;
    if (!outputApi?.buildCandidateNodeOutput) throw new Error('liuyao-time-output.js must be loaded before liuyao-time-selection.js');
    if (!relevanceApi?.buildStructuralRelevanceProfile) throw new Error('liuyao-time-relevance.js must be loaded before liuyao-time-selection.js');

    const SCHEMA_VERSION = 1;
    const BENEFIT_KINDS = Object.freeze(['support','peer']);
    const SOFT_COST_KINDS = Object.freeze(['outflow','exertion']);

    const profileFromNode = (node) => node?.candidateOutput?.dateAssessment || node?.dateAssessment || node?.assessment || null;
    const flag = (profile, kind) => Boolean(profile?.flags?.[kind]);

    const materialSelectionProfile = (profile) => ({
        constraint:flag(profile, 'constraint'),
        support:flag(profile, 'support'),
        peer:flag(profile, 'peer'),
        outflow:flag(profile, 'outflow'),
        exertion:flag(profile, 'exertion')
    });

    const selectionSignature = (profile) => {
        const item = materialSelectionProfile(profile);
        return ['constraint','support','peer','outflow','exertion']
            .map((kind) => `${kind}:${Number(item[kind])}`)
            .join('|');
    };

    const materiallyEquivalent = (a, b) => selectionSignature(a) === selectionSignature(b);

    const relevanceProfileFromSelection = (profile) => profile?.structuralRelevance || null;
    const relevanceRank = (profile, kind) => Number(relevanceProfileFromSelection(profile)?.dimensions?.[kind]?.rank || 0);
    const materialPolarity = (profile) => {
        const item = materialSelectionProfile(profile);
        const benefit = item.support || item.peer;
        const burden = item.constraint || item.outflow || item.exertion;
        return { benefit, burden, cleanBenefit:benefit && !burden, burdenOnly:!benefit && burden };
    };

    // 结构相关性只用于细化“实质效力完全相同”的日期，不跨越生扶/比和、泄力/耗力等
    // 不可比类别，也不重新引入总分。每个维度仍采用非补偿 Pareto：
    // - 生扶/比和来源越直接越有参考价值；
    // - 受制/泄力/耗力越直接，负担越明确，因此越不利；
    // - 触发重要度只在纯助力或纯负担场景中作为同质日期的最后细化：
    //   纯助力希望触发更直接，纯负担则希望触发不要过于直接。
    const structuralRelevanceDominatesEquivalent = (a, b) => {
        if (!materiallyEquivalent(a, b)) return false;
        const av = materialSelectionProfile(a);
        const axes = [];
        ['support','peer'].forEach((kind) => {
            if (av[kind]) axes.push({ kind, prefer:'higher' });
        });
        ['constraint','outflow','exertion'].forEach((kind) => {
            if (av[kind]) axes.push({ kind, prefer:'lower' });
        });
        const polarity = materialPolarity(a);
        const aTrigger = relevanceRank(a, 'trigger');
        const bTrigger = relevanceRank(b, 'trigger');
        if ((polarity.cleanBenefit || polarity.burdenOnly) && (aTrigger || bTrigger)) {
            axes.push({ kind:'trigger', prefer:polarity.cleanBenefit ? 'higher' : 'lower' });
        }
        if (!axes.length) return false;
        let strictlyBetter = false;
        for (const axis of axes) {
            const ar = relevanceRank(a, axis.kind);
            const br = relevanceRank(b, axis.kind);
            if (axis.prefer === 'higher') {
                if (ar < br) return false;
                if (ar > br) strictlyBetter = true;
            } else {
                if (ar > br) return false;
                if (ar < br) strictlyBetter = true;
            }
        }
        return strictlyBetter;
    };

    const structuralRelevanceSignature = (profile) => {
        const relevance = relevanceProfileFromSelection(profile);
        return ['trigger','support','peer','constraint','outflow','exertion']
            .map((kind) => `${kind}:${Number(relevance?.dimensions?.[kind]?.rank || 0)}`)
            .join('|');
    };

    // 日期选择原则（alpha.10 起冻结）：
    // 1) “受制”是硬门槛。只要范围内存在未见受制的日期，就先在未受制层比较；
    //    若全部受制，再只在受制层内部比较。
    // 2) 同一受制层级内直接使用六维非补偿 Pareto：
    //    - 生扶、比和分别作为独立有利维度，存在优于不存在；
    //    - 泄力、耗力分别作为独立负担维度，不存在优于存在；
    //    - 不把生扶与比和互换分值，也不把泄力与耗力互换轻重。
    // 3) A 只有在所有实质维度都不差，且至少一个维度严格更好时，才明确支配 B。
    //    “多一种助力同时多一种负担”属于真实权衡，保留并列。
    // 4) 只有实质效力完全相同，才允许 Structural Relevance 进一步细化；
    //    结构相关性不得跨越六维效力边界重新引入总分。
    const paretoDominatesWithinConstraintClass = (a, b) => {
        const av = materialSelectionProfile(a);
        const bv = materialSelectionProfile(b);
        if (av.constraint !== bv.constraint) return false;
        const noWorse = Number(av.support) >= Number(bv.support)
            && Number(av.peer) >= Number(bv.peer)
            && Number(av.outflow) <= Number(bv.outflow)
            && Number(av.exertion) <= Number(bv.exertion);
        if (!noWorse) return false;
        const strictlyBetter = av.support !== bv.support
            || av.peer !== bv.peer
            || av.outflow !== bv.outflow
            || av.exertion !== bv.exertion;
        if (strictlyBetter) return true;
        return structuralRelevanceDominatesEquivalent(a, b);
    };

    const preferredConstraintClass = (nodes = []) => {
        const profiles = (nodes || []).map(profileFromNode).filter(Boolean);
        if (!profiles.length) return null;
        return profiles.some((profile) => !flag(profile, 'constraint')) ? false : true;
    };

    const nondominatedFrontier = (nodes = []) => {
        const usable = (nodes || []).filter((node) => profileFromNode(node));
        if (!usable.length) return [];
        const constraintClass = preferredConstraintClass(usable);
        const sameClass = usable.filter((node) => flag(profileFromNode(node), 'constraint') === constraintClass);
        return sameClass.filter((candidate, index) => !sameClass.some((other, otherIndex) => (
            index !== otherIndex
            && paretoDominatesWithinConstraintClass(profileFromNode(other), profileFromNode(candidate))
        )));
    };

    const dominanceFronts = (nodes = []) => {
        const remaining = [...(nodes || []).filter((node) => profileFromNode(node))];
        const fronts = [];
        while (remaining.length) {
            const constraintClass = preferredConstraintClass(remaining);
            const classNodes = remaining.filter((node) => flag(profileFromNode(node), 'constraint') === constraintClass);
            const front = classNodes.filter((candidate, index) => !classNodes.some((other, otherIndex) => (
                index !== otherIndex
                && paretoDominatesWithinConstraintClass(profileFromNode(other), profileFromNode(candidate))
            )));
            const stable = front.sort((a,b) => Number(a?.sortTime || 0) - Number(b?.sortTime || 0));
            fronts.push(stable);
            const removed = new Set(stable);
            for (let i = remaining.length - 1; i >= 0; i -= 1) if (removed.has(remaining[i])) remaining.splice(i, 1);
        }
        return fronts;
    };

    const selectionLabel = (profile) => {
        const item = materialSelectionProfile(profile);
        if (item.constraint) return '受制日期';
        const hasBenefit = item.support || item.peer;
        const hasCost = item.outflow || item.exertion;
        if (hasBenefit && !hasCost) return '顺势日期';
        if (hasBenefit && hasCost) return '有助亦有负担日期';
        if (!hasBenefit && hasCost) return '仅见泄力／耗力日期';
        return '中性观察日期';
    };

    const comparisonSummary = (fronts) => {
        const top = fronts?.[0] || [];
        if (!top.length) return null;
        const formatDate = (item) => `${item.dateText} ${item.dayGanZhi}日`;
        if (top.length > 1) {
            const profiles = top.map((item) => profileFromNode(item));
            const materialSignatures = new Set(profiles.map(selectionSignature));
            const relevanceSignatures = new Set(profiles.map(structuralRelevanceSignature));
            const sameConditions = materialSignatures.size === 1 && relevanceSignatures.size === 1;
            const tieNote = sameConditions
                ? '当前条件接近，暂不强行排出单一优先日。'
                : '各有侧重，暂不强行排出单一优先日。';
            return {
                status:'tie',
                preferredDates:top.map((item) => item.dateText),
                summary:`较值得比较：${top.map(formatDate).join('、')}；${tieNote}`,
                tieReason:sameConditions ? 'equivalent-conditions' : 'tradeoff',
                selectionMode:'six-dimensional-non-compensatory-pareto',
                frontierSize:top.length
            };
        }
        const first = top[0];
        const nextFront = fronts?.[1] || [];
        const profile = profileFromNode(first);
        const item = materialSelectionProfile(profile);
        let prefix = '相对可先观察';
        if (!item.constraint && (item.support || item.peer) && !(item.outflow || item.exertion)) prefix = '相对优先观察';
        else if (!item.constraint && !(item.outflow || item.exertion)) prefix = '相对平稳';
        else if (!item.constraint) prefix = '相对可先观察';
        else prefix = '当前范围均见受制，相对可先观察';
        const nextText = nextFront.length ? `；次看：${nextFront.map(formatDate).join('、')}` : '';
        return {
            status:'preferred',
            preferredDates:[first.dateText],
            summary:`${prefix}：${formatDate(first)}${nextText}。`,
            selectionMode:'six-dimensional-non-compensatory-pareto',
            frontierSize:1,
            topProfileLabel:selectionLabel(profile)
        };
    };

    const buildDateSelectionComparison = (nodes = []) => comparisonSummary(dominanceFronts(nodes));

    const selectCandidateNodesForReview = (nodes = [], limit = 4) => {
        const fronts = dominanceFronts(nodes);
        const selected = [];
        for (const front of fronts) {
            for (const node of front) {
                if (selected.length >= limit) return selected;
                selected.push(node);
            }
        }
        return selected;
    };

    const validateSelectionComparison = (comparison, nodes = []) => {
        const errors = [];
        if (!comparison || typeof comparison !== 'object') return ['comparison-not-object'];
        if (!['tie','preferred'].includes(comparison.status)) errors.push('status');
        if (!Array.isArray(comparison.preferredDates) || !comparison.preferredDates.length) errors.push('preferred-dates');
        if (typeof comparison.summary !== 'string' || !comparison.summary) errors.push('summary');
        if (comparison.selectionMode !== 'six-dimensional-non-compensatory-pareto') errors.push('selection-mode');
        const frontier = nondominatedFrontier(nodes);
        const expected = frontier.map((item) => item.dateText).sort();
        const actual = [...(comparison.preferredDates || [])].sort();
        if (JSON.stringify(expected) !== JSON.stringify(actual)) errors.push('frontier-mismatch');
        if (comparison.status === 'preferred' && expected.length !== 1) errors.push('preferred-not-single-frontier');
        if (comparison.status === 'tie' && expected.length < 2) errors.push('tie-not-multiple-frontier');
        return [...new Set(errors)];
    };

    GuiJia.liuyaoTimeSelection = {
        SCHEMA_VERSION,
        BENEFIT_KINDS,
        SOFT_COST_KINDS,
        profileFromNode,
        materialSelectionProfile,
        selectionSignature,
        materiallyEquivalent,
        relevanceProfileFromSelection,
        relevanceRank,
        materialPolarity,
        structuralRelevanceDominatesEquivalent,
        structuralRelevanceSignature,
        paretoDominatesWithinConstraintClass,
        preferredConstraintClass,
        nondominatedFrontier,
        dominanceFronts,
        selectionLabel,
        buildDateSelectionComparison,
        selectCandidateNodesForReview,
        validateSelectionComparison
    };
})(window);
