(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { buildLiteratureContextLines, formatNaturalCount = (value) => String(value) } = GuiJia.common || {};

    const SUPPORT_GODS = new Set(['比肩', '劫财', '正印', '偏印']);
    const PEER_GODS = new Set(['比肩', '劫财']);
    const SEAL_GODS = new Set(['正印', '偏印']);
    const OUTPUT_GODS = new Set(['食神', '伤官']);
    const WEALTH_GODS = new Set(['正财', '偏财']);
    const OFFICER_GODS = new Set(['正官', '七杀']);
    const { baziRelationMeta = {}, scoreBaziRelation } = GuiJia.baziCore || {};
    const COMPLETE_CODES = new Set(Object.entries(baziRelationMeta)
        .filter(([, meta]) => meta.complete)
        .map(([code]) => code));
    const STEM_RELATION_CODES = new Set(Object.entries(baziRelationMeta)
        .filter(([, meta]) => meta.scope === 'stem')
        .map(([code]) => code));
    const BRANCH_RELATION_CODES = new Set(Object.entries(baziRelationMeta)
        .filter(([, meta]) => meta.scope === 'branch')
        .map(([code]) => code));

    const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
    const branchOrder = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const familyOrder = ['合','刑','冲','害','破'];

    function godOf(item) {
        return item?.shishen || item?.shishenGan || '';
    }

    function rootsAndSupport(result) {
        const dayGan = result.dayGan;
        const dayElement = result.dayGanWuXing;
        const hidden = (result.pillars || []).flatMap((pillar) =>
            (pillar.cangGan || []).map((item) => ({ ...item, title: pillar.title, zhi: pillar.zhi }))
        );
        const exactRoots = hidden.filter((item) => item.gan === dayGan);
        const sameElementRoots = hidden.filter((item) => item.wuxing === dayElement && item.gan !== dayGan);
        const roots = [...exactRoots, ...sameElementRoots];
        const visibleOthers = (result.pillars || [])
            .map((pillar, index) => ({ ...pillar, pillarIndex: index }))
            .filter((item) => item.pillarIndex !== 2);
        const visibleSupport = visibleOthers.filter((item) => SUPPORT_GODS.has(godOf(item)));
        const hiddenSupport = hidden.filter((item) => SUPPORT_GODS.has(godOf(item)));
        const hiddenPeers = hidden.filter((item) => PEER_GODS.has(godOf(item)));
        const hiddenSeals = hidden.filter((item) => SEAL_GODS.has(godOf(item)));
        return {
            hidden, exactRoots, sameElementRoots, roots, visibleOthers,
            visibleSupport, hiddenSupport, hiddenPeers, hiddenSeals
        };
    }

    function makeJudgment(id, title, summary, evidence, tags = [], priority = 50, evidenceRefs = []) {
        return {
            id,
            semanticLayer: 'structure',
            title,
            summary,
            evidence: evidence.filter(Boolean),
            evidenceRefs: [...new Set(evidenceRefs.filter(Boolean))],
            tags,
            priority
        };
    }

    function monthMainQi(result) {
        const monthPillar = result.pillars?.[1];
        const main = monthPillar?.cangGan?.[0];
        if (!monthPillar || !main) return null;
        return {
            zhi: monthPillar.zhi,
            gan: main.gan,
            wuxing: main.wuxing,
            god: main.shishen || ''
        };
    }

    function stateHeadline(dayState) {
        if (dayState === '旺') return '得令';
        if (dayState === '相') return '得季节相助';
        if (['休', '囚', '死'].includes(dayState)) return '季节失令';
        return `季节状态为“${dayState}”`;
    }

    function stateSentence(dayState) {
        if (dayState === '旺') return '日主在季节上得令';
        if (dayState === '相') return '日主在季节上得相助';
        if (['休', '囚', '死'].includes(dayState)) return '日主在季节上不占优势';
        return `日主季节状态为“${dayState}”`;
    }

    function rootEvidenceText(item) {
        return `${item.title}${item.zhi}藏${item.gan}${item.level ? `（${item.level}）` : ''}`;
    }

    function buildMonthJudgment(result, monthSeason, dayState, support) {
        const main = monthMainQi(result);
        const monthLead = main?.god
            ? `${main.god}居月令`
            : `${monthSeason.monthZhi}月先定季节背景`;
        const rootClause = support.exactRoots.length
            ? '地支仍见日主本干通根'
            : support.sameElementRoots.length
                ? '地支虽未见本干通根，但见同类得地'
                : '地支未见本干通根或同类得地';
        const mainSentence = main?.god
            ? `${monthSeason.monthZhi}月本气${main.gan}${main.wuxing}，对${result.dayGan}${result.dayGanWuXing}日主为${main.god}`
            : `${monthSeason.monthZhi}月属${monthSeason.season}`;
        const summary = `${mainSentence}；${monthSeason.season}令中${result.dayGanWuXing}为“${dayState}”，${stateSentence(dayState)}。${rootClause}；月令状态、根气与印比要素共同构成这一层的强弱线索；这些要素的实际效力仍属于后续 Assessment 层。`;
        const evidence = [
            main ? `月支${monthSeason.monthZhi}；本气${main.gan}${main.wuxing}；对应十神${main.god || '—'}` : `月支${monthSeason.monthZhi}；季节${monthSeason.season}`,
            `日主${result.dayGan}${result.dayGanWuXing}；旺相休囚死状态：${dayState}`,
            support.exactRoots.length ? `本干通根：${support.exactRoots.map(rootEvidenceText).join('、')}` : '本干通根：未见',
            support.sameElementRoots.length ? `同类得地：${support.sameElementRoots.map(rootEvidenceText).join('、')}` : '同类得地：未见'
        ];
        return makeJudgment(
            'month-command',
            `${monthLead}，日主${stateHeadline(dayState)}`,
            summary,
            evidence,
            ['月令', main?.god || '季节'],
            100,
            ['D01', 'D02', 'D03', 'D04']
        );
    }

    function buildSupportJudgment(result, support) {
        const hasVisible = support.visibleSupport.length > 0;
        const hasHidden = support.hiddenSupport.length > 0;
        let title = '根气与扶身要素分布在不同层面';
        if (!hasVisible && hasHidden) title = '扶身要素主要见于藏支';
        else if (hasVisible && hasHidden) title = '扶身要素在天干与藏支均有出现';
        else if (hasVisible && !hasHidden) title = '扶身要素主要见于天干';
        else if (!hasVisible && !hasHidden) title = '原局未见印比扶身要素';

        let rootSentence;
        if (support.exactRoots.length) {
            rootSentence = `${result.dayGan}${result.dayGanWuXing}在地支见本干通根${formatNaturalCount(support.exactRoots.length)}处`;
            if (support.sameElementRoots.length) rootSentence += `，另有同类得地${formatNaturalCount(support.sameElementRoots.length)}处`;
            rootSentence += '。';
        } else if (support.sameElementRoots.length) {
            rootSentence = `地支未见${result.dayGan}本干通根，但见${formatNaturalCount(support.sameElementRoots.length)}处同类得地。`;
        } else {
            rootSentence = `四支藏干未见${result.dayGan}本干通根或同类得地。`;
        }

        const visibleText = support.visibleSupport.map((item) => `${item.title}${item.gan}为${godOf(item)}`).join('、');
        const hiddenText = support.hiddenSupport.map((item) => `${item.title}${item.zhi}藏${item.gan}为${godOf(item)}`).join('、');
        let supportSentence;
        if (!hasVisible && hasHidden) {
            supportSentence = `天干未见比劫或印星；地支藏干见${hiddenText}。这里只确认扶身要素存在于藏支，不据此直接判断其实际扶身效力。`;
        } else if (hasVisible && hasHidden) {
            supportSentence = `天干见${visibleText}；地支藏干另见${hiddenText}。明暗两层均有扶身要素，但“出现”不自动等于“实际有效”。`;
        } else if (hasVisible) {
            supportSentence = `天干见${visibleText}；地支藏干未另见比劫或印星。这里只确认扶身要素出现于天干层。`;
        } else {
            supportSentence = '天干与藏干均未见比劫或印星这一类扶身要素；这里仍不据单项缺失直接作身强身弱终判。';
        }

        return makeJudgment(
            'support-location',
            title,
            `${rootSentence}${supportSentence}`,
            [
                support.exactRoots.length ? `本干通根：${support.exactRoots.map(rootEvidenceText).join('、')}` : '本干通根：未见',
                support.sameElementRoots.length ? `同类得地：${support.sameElementRoots.map(rootEvidenceText).join('、')}` : '同类得地：未见',
                hasVisible ? `天干扶身要素：${visibleText}` : '天干扶身要素：未见比劫或印星',
                hasHidden ? `藏干扶身要素：${hiddenText}` : '藏干扶身要素：未见比劫或印星'
            ],
            ['通根', '扶助'],
            94,
            ['D03', 'D04', 'D05', 'D06']
        );
    }

    function visibleTenGodItems(result) {
        return (result.pillars || [])
            .map((pillar, index) => ({
                pillarIndex: index,
                title: pillar.title || pillarNames[index],
                gan: pillar.gan,
                god: index === 2 ? '日主' : pillar.shishenGan
            }))
            .filter((item) => item.pillarIndex !== 2 && item.god && item.god !== '日主');
    }

    function buildVisibleTheme(visible) {
        const counts = visible.reduce((acc, item) => {
            acc[item.god] = (acc[item.god] || 0) + 1;
            return acc;
        }, {});
        const distinctGods = Object.keys(counts);
        const gods = new Set(distinctGods);
        const repeated = Object.entries(counts)
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1]);
        const hasOfficer = distinctGods.some((god) => OFFICER_GODS.has(god));
        const hasOutput = distinctGods.some((god) => OUTPUT_GODS.has(god));
        const hasWealth = distinctGods.some((god) => WEALTH_GODS.has(god));
        const hasSupport = distinctGods.some((god) => SUPPORT_GODS.has(god));
        const hasOfficerPair = gods.has('正官') && gods.has('七杀');

        if (distinctGods.length === 1 && visible.length >= 2) return `${distinctGods[0]}集中透出`;
        if (repeated.length) {
            const [god, count] = repeated[0];
            const countText = count === 2 ? '两透' : `${formatNaturalCount(count)}透`;
            const others = distinctGods.filter((item) => item !== god);
            return `${god}${countText}${others.length ? `，并见${others.join('、')}` : ''}`;
        }
        const officerGods = distinctGods.filter((god) => OFFICER_GODS.has(god));
        const outputGods = distinctGods.filter((god) => OUTPUT_GODS.has(god));
        const wealthGods = distinctGods.filter((god) => WEALTH_GODS.has(god));
        const supportGods = distinctGods.filter((god) => SUPPORT_GODS.has(god));
        if (hasOfficerPair && gods.has('伤官')) return '官杀与伤官同时明透';
        if (hasOfficerPair && gods.has('食神')) return '官杀并透，食神同时出现';
        if (hasOfficerPair) return '正官、七杀同时明透';
        if (hasOfficer && hasOutput) return `${outputGods.join('、')}与${officerGods.join('、')}同见天干`;
        if (hasWealth && hasOfficer) return `${wealthGods.join('、')}与${officerGods.join('、')}同见天干`;
        if (hasSupport && hasOfficer) return `${supportGods.join('、')}与${officerGods.join('、')}同见天干`;
        if (hasWealth && hasOutput) return `${wealthGods.join('、')}与${outputGods.join('、')}同见天干`;
        if (distinctGods.length >= 2) return '天干有多类十神同时明透';
        return visible.length ? `${visible[0].god}明透于${visible[0].title}` : '';
    }

    function godAtPillar(result, index) {
        if (index === 2) return '日主';
        return result.pillars?.[index]?.shishenGan || '';
    }

    function stemPairKey(relation) {
        const stems = relation?.stems || [];
        return `${relation?.code || ''}:${[...stems].sort().join('')}`;
    }

    function stemIndexLabel(index) {
        return ['年干', '月干', '日干', '时干'][index] || `第${index + 1}干`;
    }

    function buildRepeatedStemRelationSentence(result, stemRelations) {
        const groups = new Map();
        stemRelations.forEach((relation) => {
            const key = stemPairKey(relation);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(relation);
        });
        const repeatedGroup = [...groups.values()]
            .filter((items) => items.length >= 2)
            .sort((a, b) => b.length - a.length)[0];
        if (!repeatedGroup) return '';

        const stemPositions = new Map();
        repeatedGroup.forEach((relation) => {
            (relation.pillarIndices || []).forEach((index) => {
                const stem = result.pillars?.[index]?.gan;
                if (!stem) return;
                if (!stemPositions.has(stem)) stemPositions.set(stem, new Set());
                stemPositions.get(stem).add(index);
            });
        });
        const ranked = [...stemPositions.entries()]
            .map(([stem, indices]) => ({ stem, indices: [...indices].sort((a,b)=>a-b) }))
            .sort((a, b) => b.indices.length - a.indices.length);
        const repeated = ranked.find((item) => item.indices.length >= 2);
        const counterpart = ranked.find((item) => item !== repeated);
        if (!repeated || !counterpart) return '';
        const repeatedLabels = repeated.indices.map(stemIndexLabel);
        const repeatedText = repeatedLabels.length === 2
            ? `${repeatedLabels.join('、')}两干皆为${repeated.stem}`
            : `${repeatedLabels.join('、')}均为${repeated.stem}`;
        const counterpartText = counterpart.indices.length === 1
            ? `${stemIndexLabel(counterpart.indices[0])}${counterpart.stem}`
            : `${counterpart.indices.map(stemIndexLabel).join('、')}${counterpart.stem}`;
        const family = baziRelationMeta[repeatedGroup[0]?.code]?.family || '发生关系';
        const verb = family === '冲' ? '相冲' : family === '合' ? '相合' : `形成${family}`;
        return `${repeatedText}，均与${counterpartText}${verb}；同一组天干关系在多个柱位重复出现，构成一条连续的关系主线。`;
    }

    function buildVisibleJudgment(result, relations) {
        const visible = visibleTenGodItems(result);
        if (!visible.length) return null;
        const theme = buildVisibleTheme(visible);
        const counts = visible.reduce((acc, item) => {
            acc[item.god] = (acc[item.god] || 0) + 1;
            return acc;
        }, {});
        const distinctGods = Object.keys(counts);
        const repeatedSingleGod = distinctGods.length === 1 && visible.length >= 2;
        const repeatedMixed = Object.entries(counts)
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])[0];
        const stemRelations = relations.filter((item) => STEM_RELATION_CODES.has(item.code));
        const descriptors = visible.map((item) => `${item.title.replace('柱', '干')}${item.gan}为${item.god}`);
        let relationSentence = '';
        if (stemRelations.length) {
            const repeatedRelationSentence = buildRepeatedStemRelationSentence(result, stemRelations);
            if (repeatedRelationSentence) {
                relationSentence = repeatedRelationSentence;
            } else {
                const relation = stemRelations[0];
                const indices = relation.pillarIndices || [];
                const linkedGods = indices.map((index) => godAtPillar(result, index)).filter(Boolean);
                relationSentence = `其中${relation.text}${linkedGods.length === 2 ? `，直接连接${linkedGods.join('与')}` : ''}；这组天干关系把相关十神直接联在一起。`;
            }
        } else if (repeatedSingleGod) {
            relationSentence = `${distinctGods[0]}在天干层面反复出现，构成较集中的重复主题。`;
        } else if (repeatedMixed) {
            const [repeatedGod] = repeatedMixed;
            const others = distinctGods.filter((god) => god !== repeatedGod);
            relationSentence = `${repeatedGod}在天干重复透出，并与${others.join('、')}同现；几类十神在天干层形成直接的结构联系。`;
        } else if (distinctGods.length >= 2) {
            relationSentence = '这些不同十神同时处在天干明面，彼此之间形成直接的生克制化联系。';
        } else {
            relationSentence = '这一十神明透于天干，是原局明面上的直接十神线索。';
        }
        return makeJudgment(
            'visible-combination',
            theme,
            `${descriptors.join('、')}。${relationSentence}`,
            [
                `天干明透：${descriptors.join('、')}`,
                ...stemRelations.slice(0, 3).map((item) => item.text)
            ],
            ['十神', '透干'],
            92,
            ['D07', ...stemRelations.slice(0, 3).map((item) => item._semanticRef)]
        );
    }

    function completeRelationLabel(relation) {
        const branches = relation.branches?.join('') || '';
        if (relation.code === 'SAN_HUI_COMPLETE') return `${branches}三会${relation.element || ''}方`;
        if (relation.code === 'SAN_HE_COMPLETE') return `${branches}三合${relation.element || ''}局`;
        if (relation.code === 'PUNISHMENT_TRIAD_COMPLETE') return `${branches}完整三刑`;
        return relation.text || '完整结构';
    }

    function buildCompleteJudgment(completeRelations) {
        if (!completeRelations.length) return null;
        const labels = completeRelations.map(completeRelationLabel);
        return makeJudgment(
            'complete-structure',
            `${labels[0]}形成完整结构`,
            `原局地支会齐${labels.join('、')}。完整方局或完整三刑在结构层标记为主要组合，应优先作为整体背景观察；其他已识别关系仍作为并存结构保留，不自动判定失效、被取代或已经成化。`,
            completeRelations.map((item) => item.text),
            ['完整结构'],
            96,
            completeRelations.map((item) => item._semanticRef)
        );
    }

    function branchFamily(relation) {
        const meta = baziRelationMeta[relation?.code];
        return meta?.scope === 'branch' ? (meta.family || '其他') : '其他';
    }

    function shortBranchRelation(relation) {
        const branches = relation.branches || [];
        const pair = branches.length === 2
            ? [...branches].sort((a, b) => branchOrder.indexOf(a) - branchOrder.indexOf(b)).join('')
            : branches.join('');
        if (relation.code === 'BRANCH_SIX_HARMONY') return `${pair}合`;
        if (relation.code === 'BRANCH_SIX_CLASH') return `${pair}冲`;
        if (relation.code === 'BRANCH_PUNISHMENT') return `${pair}刑`;
        if (relation.code === 'SELF_PUNISHMENT') return `${branches[0] || ''}${branches[0] || ''}自刑`;
        if (relation.code === 'BRANCH_SIX_HARM') return `${pair}害`;
        if (relation.code === 'BRANCH_SIX_BREAK') return `${pair}破`;
        if (relation.code === 'SAN_HE_COMPLETE') return `${branches.join('')}三合${relation.element || ''}`;
        if (relation.code === 'SAN_HE_PARTIAL') return `${branches.join('')}半合${relation.element || ''}`;
        if (relation.code === 'SAN_HUI_COMPLETE') return `${branches.join('')}三会${relation.element || ''}`;
        if (relation.code === 'SAN_HUI_PARTIAL') return `${branches.join('')}同方${relation.element || ''}`;
        if (relation.code === 'PUNISHMENT_TRIAD_COMPLETE') return `${branches.join('')}完整三刑`;
        return relation.text || '地支关系';
    }

    function pillarScopeText(indices = []) {
        const labels = [...new Set(indices)]
            .sort((a, b) => a - b)
            .map((index) => ['年支', '月支', '日支', '时支'][index])
            .filter(Boolean);
        return labels.join('与');
    }

    function groupedBranchRelations(branchRelations) {
        const groups = new Map();
        branchRelations.forEach((relation) => {
            const branches = relation.branches || [];
            const key = branches.length === 2
                ? [...branches].sort((a, b) => branchOrder.indexOf(a) - branchOrder.indexOf(b)).join('')
                : `${relation.code}:${branches.join('')}:${relation.text || ''}`;
            if (!groups.has(key)) groups.set(key, { key, branches:[...branches], relations:[], pillarIndices:new Set() });
            const group = groups.get(key);
            group.relations.push(relation);
            (relation.pillarIndices || []).forEach((index) => group.pillarIndices.add(index));
        });
        return [...groups.values()].map((group) => {
            const families = [...new Set(group.relations.map(branchFamily).filter((item) => item !== '其他'))]
                .sort((a, b) => familyOrder.indexOf(a) - familyOrder.indexOf(b));
            const label = group.relations.length >= 2 && group.branches.length === 2
                ? `${group.key}${families.join('')}`
                : shortBranchRelation(group.relations[0]);
            return { ...group, families, label, pillarIndices:[...group.pillarIndices].sort((a,b)=>a-b) };
        });
    }

    function buildRepeatedBranchPattern(branchRelations) {
        const selfRelations = branchRelations.filter((item) => item.code === 'SELF_PUNISHMENT' && item.branches?.length === 1);
        const pairGroups = groupedBranchRelations(branchRelations)
            .filter((group) => group.branches.length === 2 && group.relations.length >= 2);
        for (const selfRelation of selfRelations) {
            const repeatedBranch = selfRelation.branches[0];
            const linked = pairGroups.find((group) => group.branches.includes(repeatedBranch));
            if (!linked) continue;
            const otherBranch = linked.branches.find((branch) => branch !== repeatedBranch) || '';
            const selfIndices = (selfRelation.pillarIndices || []).map((index) => ['年支','月支','日支','时支'][index]).filter(Boolean);
            const linkedFamily = linked.families[0] || '关系';
            const pairLabel = `${repeatedBranch}${otherBranch}${linkedFamily}`;
            const repeatedCount = selfRelation.pillarIndices?.length || 2;
            const repeatedPrefix = repeatedCount === 2 ? `双${repeatedBranch}` : `${formatNaturalCount(repeatedCount)}个${repeatedBranch}`;
            const linkedCountText = linked.relations.length === 2 ? '两组' : `${formatNaturalCount(linked.relations.length)}组`;
            const title = `${repeatedPrefix}同时牵动${otherBranch}支：既见${repeatedBranch}${repeatedBranch}自刑，又有${linkedCountText}${pairLabel}`;
            const summary = `${selfIndices.join('、')}同为${repeatedBranch}，彼此形成${repeatedBranch}${repeatedBranch}自刑；同时这${formatNaturalCount(repeatedCount)}个${repeatedBranch}又分别与${otherBranch}支形成${linkedFamily}。这些关系围绕“${repeatedBranch}—${otherBranch}”展开，${otherBranch}支同时处在多组关系的共同位置。`;
            return { title, summary };
        }
        return null;
    }

    function buildBranchInterplaySentence(branchRelations) {
        const groups = groupedBranchRelations(branchRelations);
        const clauses = [];
        const multi = groups.filter((group) => group.relations.length >= 2 && group.families.length >= 2);
        multi.slice(0, 2).forEach((group) => {
            const scope = pillarScopeText(group.pillarIndices);
            clauses.push(`${group.key}之间同时见${group.families.join('、')}${scope ? `，直接牵涉${scope}` : ''}`);
        });

        const coveredKeys = new Set(multi.map((group) => group.key));
        const near = groups.filter((group) => !coveredKeys.has(group.key) && group.pillarIndices.some((index) => index === 1 || index === 2));
        if (near.length) {
            const nearText = near.slice(0, 3).map((group) => {
                const scopes = [];
                if (group.pillarIndices.includes(1)) scopes.push('月令');
                if (group.pillarIndices.includes(2)) scopes.push('日支');
                return `${group.label}${scopes.length ? `涉及${scopes.join('与')}` : ''}`;
            }).join('，');
            if (nearText) clauses.push(nearText);
        }

        const branchGroups = new Map();
        groups.forEach((group) => {
            group.branches.forEach((branch) => {
                if (!branchGroups.has(branch)) branchGroups.set(branch, []);
                branchGroups.get(branch).push(group);
            });
        });
        const hub = [...branchGroups.entries()]
            .filter(([, items]) => items.length >= 3)
            .sort((a, b) => b[1].length - a[1].length)[0];
        if (hub) {
            const [branch, items] = hub;
            const labels = [...new Set(items.map((item) => item.label))].slice(0, 4);
            clauses.push(`${branch}支又同时参与${labels.join('、')}，成为多组关系的共同节点`);
        }

        if (!clauses.length) return '';
        return `${clauses.join('；')}，共同形成交叠结构。`;
    }

    function buildBranchJudgment(relations) {
        // 完整三合、三会、三刑由 complete-structure 单独承担主解释，
        // 此处只讨论其余地支关系，避免同一完整结构在两张判断卡里重复出现。
        const branchRelations = relations.filter((item) => BRANCH_RELATION_CODES.has(item.code) && !COMPLETE_CODES.has(item.code));
        if (!branchRelations.length) return null;
        const families = [...new Set(branchRelations.map(branchFamily).filter((item) => item !== '其他'))]
            .sort((a, b) => familyOrder.indexOf(a) - familyOrder.indexOf(b));
        const shortLabels = branchRelations.map(shortBranchRelation);
        const positions = [...new Set(branchRelations.flatMap((item) => item.pillarIndices || []))]
            .sort((a, b) => a - b)
            .map((index) => pillarNames[index])
            .filter(Boolean);
        const near = branchRelations.filter((item) => (item.pillarIndices || []).includes(1) || (item.pillarIndices || []).includes(2));
        const nearLabels = [...new Set(near.map(shortBranchRelation))];

        const repeatedPattern = buildRepeatedBranchPattern(branchRelations);
        let title;
        if (repeatedPattern) title = repeatedPattern.title;
        else if (families.length >= 2) title = `地支${families.join('、')}交织`;
        else if (branchRelations.length >= 2) title = `地支多组${families[0] || '关系'}同时成立`;
        else title = '地支见一组直接关系';

        let summary = repeatedPattern?.summary || `地支层面识别到${formatNaturalCount(branchRelations.length)}项关系或组合${families.length ? `，涉及${families.join('、')}` : ''}`;
        if (!repeatedPattern) {
            if (positions.length) summary += `，分布于${positions.join('、')}`;
            summary += '。';
            if (branchRelations.length >= 2) {
                summary += '原局地支呈现多种关系并存。';
                summary += buildBranchInterplaySentence(branchRelations) || '这些关系共同构成当前地支层的交叠结构。';
            } else if (nearLabels.length) {
                summary += `${nearLabels[0]}直接牵涉月令或日支，是当前地支关系的主要落点。`;
            }
        }

        return makeJudgment(
            'branch-network',
            title,
            summary,
            branchRelations.map((item) => item.text),
            ['地支关系'],
            branchRelations.length >= 2 ? 90 : 76,
            branchRelations.map((item) => item._semanticRef)
        );
    }

    function buildHeadline(result, monthSeason, dayState, support, visibleJudgment, completeJudgment, branchJudgment) {
        const main = monthMainQi(result);
        const first = main?.god ? `${main.god}居月令` : `${monthSeason.monthZhi}月定季节背景`;
        const rootPhrase = support.exactRoots.length
            ? '而地支见本干通根'
            : support.sameElementRoots.length
                ? '而地支见同类得地'
                : '且地支未见本干通根';
        const second = `${result.dayGan}${result.dayGanWuXing}${stateHeadline(dayState)}${rootPhrase}`;
        const later = [];
        if (visibleJudgment?.title) later.push(visibleJudgment.title);
        if (completeJudgment?.title) later.push(completeJudgment.title.replace('形成完整结构', ''));
        if (branchJudgment) {
            const branchRelations = (result.internalRelations || [])
                .filter((item) => BRANCH_RELATION_CODES.has(item.code) && !COMPLETE_CODES.has(item.code));
            const families = [...new Set(branchRelations
                .map(branchFamily)
                .filter((item) => item !== '其他'))]
                .sort((a, b) => familyOrder.indexOf(a) - familyOrder.indexOf(b));
            if (families.length >= 2) later.push(`地支${families.join('')}交织`);
            else if (families.length === 1 && branchRelations.length >= 2) later.push(`地支见多组${families[0]}`);
            else if (families.length === 1 && branchRelations.length === 1) later.push(`地支仅见一处${families[0]}`);
        }
        return `${first}，${second}${later.length ? `；${later.join('，')}` : ''}。`;
    }

    function buildSemanticModel(result, monthSeason, dayState, support, relations) {
        const chart = (result.pillars || []).map((item) => item.ganZhi || `${item.gan}${item.zhi}`).join(' ');
        const month = result.pillars?.[1];
        const monthMain = monthMainQi(result);
        const visible = visibleTenGodItems(result);
        const hidden = support.hidden || [];
        const visibleStems = (result.pillars || []).map((item) => `${item.title || ''}${item.gan}`).join('、');
        const hiddenStems = hidden.map((item) => `${item.title}${item.zhi}藏${item.gan}${item.level ? `（${item.level}）` : ''}`).join('、');
        const monthHidden = (month?.cangGan || []).map((item) => `${item.gan}${item.level ? `（${item.level}）` : ''}`).join('、') || '未见';
        const visibleSupportText = support.visibleSupport.length
            ? support.visibleSupport.map((item) => `${item.title}${item.gan}为${godOf(item)}`).join('、')
            : '未见比劫或印星';
        const hiddenSupportText = support.hiddenSupport.length
            ? support.hiddenSupport.map((item) => `${item.title}${item.zhi}藏${item.gan}为${godOf(item)}`).join('、')
            : '未见比劫或印星';
        const visibleTenGodText = visible.length
            ? visible.map((item) => `${item.title.replace('柱', '干')}${item.gan}为${item.god}`).join('、')
            : '未见';

        const facts = [
            { id:'F01', kind:'chart', text:`四柱为${chart}` },
            { id:'F02', kind:'month-hidden-stems', text:`月支${monthSeason.monthZhi}藏干：${monthHidden}` },
            { id:'F03', kind:'visible-stems', text:`天干原始位置：${visibleStems}` },
            { id:'F04', kind:'hidden-stems', text:`地支藏干原始位置：${hiddenStems || '未见'}` }
        ];

        const derivedFacts = [
            {
                id:'D01', system:'tenGod', systemLabel:'十神', sourceRefs:['F01','F02'],
                text: monthMain ? `月支${monthSeason.monthZhi}本气${monthMain.gan}，相对日主${result.dayGan}为${monthMain.god || '—'}` : `月支${monthSeason.monthZhi}本气未取得`
            },
            {
                id:'D02', system:'seasonalFiveStates', systemLabel:'旺相休囚死', sourceRefs:['F01'],
                text:`日主${result.dayGanWuXing}在${monthSeason.season}令的季节状态为“${dayState}”`
            },
            {
                id:'D03', system:'rooting', systemLabel:'通根', sourceRefs:['F04'],
                text: support.exactRoots.length ? `本干通根：${support.exactRoots.map(rootEvidenceText).join('、')}` : '本干通根：未见'
            },
            {
                id:'D04', system:'rooting', systemLabel:'同类得地', sourceRefs:['F04'],
                text: support.sameElementRoots.length ? `同类得地：${support.sameElementRoots.map(rootEvidenceText).join('、')}` : '同类得地：未见'
            },
            { id:'D05', system:'supportPresence', systemLabel:'扶身要素·天干', sourceRefs:['F03'], text:`天干扶身要素：${visibleSupportText}` },
            { id:'D06', system:'supportPresence', systemLabel:'扶身要素·藏干', sourceRefs:['F04'], text:`藏干扶身要素：${hiddenSupportText}` },
            { id:'D07', system:'tenGod', systemLabel:'十神·透干', sourceRefs:['F03'], text:`天干十神：${visibleTenGodText}` }
        ];

        const structures = relations.map((relation, index) => {
            const meta = baziRelationMeta[relation.code] || {};
            return {
                id: relation._semanticRef || `S${String(index + 1).padStart(2, '0')}`,
                code: relation.code || '',
                system: 'stemBranchRelation',
                structuralRole: meta.structuralRole || 'coexistingRelation',
                structuralRoleLabel: meta.structuralRole === 'majorCompositeStructure' ? '主要组合' : '并存关系',
                text: relation.text
            };
        });

        return {
            version: '1.0',
            facts,
            derivedFacts,
            structures,
            assessments: [],
            assessmentBoundary: '当前模块不生成身强身弱终判、格局、用神、喜忌、吉凶或具体事件结论。存在性事实与结构关系不得自动升级为实际效力判断。'
        };
    }

    function buildBaziInterpretation(result) {
        if (!result || !Array.isArray(result.pillars) || result.pillars.length !== 4) {
            return { version: '2.0', headline: '暂无可用命盘结构。', judgments: [], semanticModel: null, limitations: [] };
        }

        const monthSeason = result.monthSeason || { monthZhi: '—', season: '—', states: [] };
        const dayState = monthSeason.states?.find((item) => item.isDayMaster)?.status || '—';
        const support = rootsAndSupport(result);
        const relations = [...(result.internalRelations || [])]
            .sort((a, b) => scoreBaziRelation(b) - scoreBaziRelation(a))
            .map((relation, index) => ({ ...relation, _semanticRef: `S${String(index + 1).padStart(2, '0')}` }));
        const completeRelations = relations.filter((item) => COMPLETE_CODES.has(item.code));
        const semanticModel = buildSemanticModel(result, monthSeason, dayState, support, relations);

        const monthJudgment = buildMonthJudgment(result, monthSeason, dayState, support);
        const supportJudgment = buildSupportJudgment(result, support);
        const visibleJudgment = buildVisibleJudgment(result, relations);
        const completeJudgment = buildCompleteJudgment(completeRelations);
        const branchJudgment = buildBranchJudgment(relations);
        const candidates = [
            monthJudgment,
            completeJudgment,
            supportJudgment,
            visibleJudgment,
            branchJudgment
        ].filter(Boolean);

        const unique = [];
        const seen = new Set();
        candidates
            .sort((a, b) => b.priority - a.priority)
            .forEach((item) => {
                if (seen.has(item.id)) return;
                seen.add(item.id);
                unique.push(item);
            });

        const finalJudgments = unique.slice(0, 5);
        return {
            version: '2.0',
            headline: buildHeadline(result, monthSeason, dayState, support, visibleJudgment, completeJudgment, branchJudgment),
            judgments: finalJudgments,
            semanticModel,
            limitations: [
                '本模块只做原局结构综合，不直接给出吉凶、格局、用神、婚姻、事业或具体事件断语。',
                '旺相休囚死、通根、透干与干支关系需要互相参照；任何单项标签都不单独等于强弱或成败结论。',
                '结构解释来源于当前程序已识别的事实、派生事实与关系；尚未纳入的流派规则不会被自动补齐。',
                '古籍条目与现代结构判断分开呈现；古籍匹配只表示索引或参考层级，不自动进入 Assessment 结论。'
            ]
        };
    }

    function buildBaziContextText(result, interpretation) {
        if (!result) return '';
        const chart = (result.pillars || []).map((item) => item.ganZhi || `${item.gan}${item.zhi}`).join(' ');
        const semanticModel = interpretation?.semanticModel;
        const lines = [
            '【龟甲 · 八字分析上下文】',
            `四柱：${chart}`,
            `日主：${result.dayGan}${result.dayGanWuXing}`,
            `月令：${result.monthSeason?.monthZhi || '—'}月 · ${result.monthSeason?.season || '—'}`,
            `农历：${result.lunarStr || '—'}`,
            `排盘口径：${result.ruleSummary || '—'}`,
            '',
            '【结构解读】',
            interpretation?.headline || '—'
        ];

        (interpretation?.judgments || []).forEach((item, index) => {
            lines.push(`${index + 1}. ${item.title}`);
            lines.push(`解释：${item.summary}`);
            if (item.evidenceRefs?.length) lines.push(`  依据：${item.evidenceRefs.join('、')}`);
            else item.evidence.forEach((evidence, evidenceIndex) => lines.push(`  ${evidenceIndex + 1}. ${evidence}`));
        });

        if (semanticModel) {
            lines.push('', '【Fact｜原始事实】');
            semanticModel.facts.forEach((item) => lines.push(`- ${item.id}｜${item.text}`));

            lines.push('', '【Derived Fact｜派生事实】');
            semanticModel.derivedFacts.forEach((item) => {
                const source = item.sourceRefs?.length ? `｜来源 ${item.sourceRefs.join('、')}` : '';
                lines.push(`- ${item.id}｜[${item.systemLabel || item.system}] ${item.text}${source}`);
            });

            lines.push('', '【Structure｜结构关系】');
            if (semanticModel.structures.length) {
                semanticModel.structures.forEach((item) => lines.push(`- ${item.id}｜[${item.structuralRoleLabel}] ${item.text}`));
            } else {
                lines.push('- 未检测到直接结构关系');
            }

            lines.push('', '【Assessment｜作用与结论层】');
            lines.push(`- ${semanticModel.assessmentBoundary}`);
        } else {
            lines.push('', '【强弱相关证据】');
            (result.dayMasterEvidence || []).forEach((item) => lines.push(`- ${item.key}：${item.value}`));
            lines.push('', '【原局干支关系】');
            if (result.internalRelations?.length) result.internalRelations.forEach((item) => lines.push(`- ${item.text}`));
            else lines.push('- 未检测到直接关系');
        }

        lines.push('', '【使用边界】');
        (interpretation?.limitations || []).forEach((item) => lines.push(`- ${item}`));

        lines.push('', '【古籍参考】');
        lines.push(...buildLiteratureContextLines(result.matchedLiterature, '暂无匹配条目'));

        lines.push('', '【使用要求】', '请只基于以上已列 Fact、Derived Fact 与 Structure 进行综合解释；不要把“出现”自动升级为“有效”，不要自行重排四柱，不要虚构盘中不存在的关系或古籍原文。');
        return lines.join('\n');
    }

    GuiJia.baziInterpretation = {
        buildBaziInterpretation,
        buildBaziContextText
    };
})(window);
