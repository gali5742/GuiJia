(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const core = GuiJia.baziCore || {};
    const {
        baziRelationMeta = {},
        getBaziRelationMeta,
        getWuXing
    } = core;

    const SUPPORT_GODS = new Set(['比肩', '劫财', '正印', '偏印']);
    const GROUPS = [
        { key:'peer', label:'比劫', gods:['比肩','劫财'] },
        { key:'seal', label:'印星', gods:['正印','偏印'] },
        { key:'output', label:'食伤', gods:['食神','伤官'] },
        { key:'wealth', label:'财星', gods:['正财','偏财'] },
        { key:'officer', label:'官杀', gods:['正官','七杀'] }
    ];
    const COMPLETE_CODES = new Set(Object.entries(baziRelationMeta)
        .filter(([, meta]) => meta.complete)
        .map(([code]) => code));
    const PARTIAL_CODES = new Set(['SAN_HE_PARTIAL', 'SAN_HUI_PARTIAL']);
    const pillarNames = ['年柱','月柱','日柱','时柱'];
    const { formatNaturalCount = (value) => String(value) } = GuiJia.common || {};

    function hiddenItems(result) {
        return (result?.pillars || []).flatMap((pillar, pillarIndex) =>
            (pillar.cangGan || []).map((item) => ({
                ...item,
                pillarIndex,
                pillarTitle: pillar.title || pillarNames[pillarIndex],
                zhi: pillar.zhi,
                god: item.shishen || ''
            }))
        );
    }

    function visibleItems(result) {
        return (result?.pillars || []).map((pillar, pillarIndex) => ({
            pillarIndex,
            pillarTitle: pillar.title || pillarNames[pillarIndex],
            gan: pillar.gan,
            god: pillarIndex === 2 ? '日主' : (pillar.shishenGan || ''),
            wuxing: pillar.ganWuXing || getWuXing?.(pillar.gan) || ''
        })).filter((item) => item.pillarIndex !== 2);
    }

    function fmtHidden(item) {
        return `${item.pillarTitle}${item.zhi}藏${item.gan}${item.level ? `（${item.level}）` : ''}${item.god ? `·${item.god}` : ''}`;
    }

    function fmtVisible(item) {
        return `${item.pillarTitle}${item.gan}${item.god ? `·${item.god}` : ''}`;
    }

    function describeList(items, formatter, empty = '未见') {
        return items.length ? items.map(formatter).join('、') : empty;
    }

    function userFacingText(text) {
        return String(text || '')
            .replace(/本程序确认/g, '这里确认')
            .replace(/本程序只确认/g, '这里只确认')
            .replace(/当前程序只确认/g, '这里只确认')
            .replace(/按当前程序采用的/g, '按这里采用的')
            .replace(/当前程序采用的/g, '这里采用的')
            .replace(/程序已识别结构/g, '本局已列结构')
            .replace(/程序已识别的/g, '本局已列的')
            .replace(/程序并未/g, '这里并未')
            .replace(/程序可核对/g, '可直接核对')
            .replace(/可机器核对/g, '可直接核对')
            .replace(/机器确认/g, '直接确认')
            .replace(/当前宽口径原局检查/g, '就本局已列关系而言')
            .replace(/采用原局宽口径检查/g, '按原局已列的刑、冲、破、害关系核对')
            .replace(/当前本地语料/g, '现有资料')
            .replace(/与当前已核对的/g, '与已核对的')
            .replace(/不表示程序已经由/g, '不表示已经由')
            .replace(/原局检测到/g, '原局见')
            .replace(/因此将此条列作进一步核对/g, '因此可将此条作为进一步核对')
            .replace(/尚未由此匹配判定/g, '仍需结合全局条件判断')
            .replace(/未编码/g, '尚未纳入');
    }

    function buildStrength(result, visible, hidden) {
        const dayGan = result.dayGan;
        const dayElement = result.dayGanWuXing;
        const dayState = (result.monthSeason?.states || []).find((item) => item.isDayMaster)?.status || '—';
        const monthZhi = result.monthSeason?.monthZhi || result.originalZhis?.[1] || '—';
        const exactRoots = hidden.filter((item) => item.gan === dayGan);
        const sameElement = hidden.filter((item) => item.wuxing === dayElement && item.gan !== dayGan);
        const visibleSupport = visible.filter((item) => SUPPORT_GODS.has(item.god));
        const hiddenSupport = hidden.filter((item) => SUPPORT_GODS.has(item.god));
        const visibleDrain = visible.filter((item) => !SUPPORT_GODS.has(item.god));
        const hiddenDrain = hidden.filter((item) => !SUPPORT_GODS.has(item.god));
        const statePhrase = ['旺','相'].includes(dayState)
            ? '季节上较有助力'
            : (['休','囚','死'].includes(dayState) ? '季节上不占优势' : '季节状态需结合全局观察');
        const summaryParts = [`${dayGan}${dayElement}在${monthZhi}月为“${dayState}”，${statePhrase}`];
        if (exactRoots.length) summaryParts.push(`见本干通根${formatNaturalCount(exactRoots.length)}处`);
        if (sameElement.length) summaryParts.push(`另有同类得地${formatNaturalCount(sameElement.length)}处`);
        if (visibleSupport.length || hiddenSupport.length) {
            summaryParts.push(`扶助见于${visibleSupport.length ? `天干${formatNaturalCount(visibleSupport.length)}处` : ''}${visibleSupport.length && hiddenSupport.length ? '、' : ''}${hiddenSupport.length ? `藏干${formatNaturalCount(hiddenSupport.length)}处` : ''}`);
        }
        if (visibleDrain.length || hiddenDrain.length) {
            summaryParts.push(`泄耗克见于${visibleDrain.length ? `天干${formatNaturalCount(visibleDrain.length)}处` : ''}${visibleDrain.length && hiddenDrain.length ? '、' : ''}${hiddenDrain.length ? `藏干${formatNaturalCount(hiddenDrain.length)}处` : ''}`);
        }
        return {
            headline: `${monthZhi}月${result.monthSeason?.season || ''}，${dayGan}${dayElement}季节状态为“${dayState}”`,
            summary: `${summaryParts.join('；')}。`,
            seasonRows: [
                { key:'月令', value:`${monthZhi}月 · ${result.monthSeason?.season || '—'}；日主${dayElement}为“${dayState}”` },
                { key:'本干通根', value:describeList(exactRoots, fmtHidden) },
                { key:'同类得地', value:describeList(sameElement, fmtHidden) }
            ],
            forceRows: [
                { key:'天干扶助', value:describeList(visibleSupport, fmtVisible) },
                { key:'藏干扶助', value:describeList(hiddenSupport, fmtHidden) },
                { key:'天干泄耗克', value:describeList(visibleDrain, fmtVisible) },
                { key:'藏干泄耗克', value:describeList(hiddenDrain, fmtHidden) }
            ]
        };
    }

    function godCountMap(items) {
        const map = new Map();
        items.forEach((item) => {
            if (!item.god) return;
            map.set(item.god, (map.get(item.god) || 0) + 1);
        });
        return map;
    }

    const TEN_GODS = ['比肩','劫财','正印','偏印','食神','伤官','正财','偏财','正官','七杀'];

    function uniqueGods(items) {
        const seen = new Set(items.map((item) => item.god).filter(Boolean));
        return TEN_GODS.filter((god) => seen.has(god));
    }

    function joinChineseAnd(items) {
        if (items.length <= 1) return items[0] || '';
        if (items.length === 2) return `${items[0]}与${items[1]}`;
        return `${items.slice(0, -1).join('、')}与${items[items.length - 1]}`;
    }

    function pillarPrefix(item) {
        return String(item?.pillarTitle || pillarNames[item?.pillarIndex] || '').replace('柱', '');
    }

    function fmtVisibleLocation(item) {
        return `${pillarPrefix(item)}干${item.gan}`;
    }

    function fmtHiddenLocation(item) {
        return `${pillarPrefix(item)}支${item.zhi}中${item.gan}${item.level ? `（${item.level}）` : ''}`;
    }

    function describeGodHits(items, formatter) {
        const parts = TEN_GODS.map((god) => {
            const hits = items.filter((item) => item.god === god);
            if (!hits.length) return '';
            const count = hits.length > 1 ? `${formatNaturalCount(hits.length)}处` : '';
            return `${god}${count}：${hits.map(formatter).join('、')}`;
        }).filter(Boolean);
        return parts.join('；');
    }

    function buildTenGodSummary(visible, hidden) {
        const visibleGods = uniqueGods(visible);
        const hiddenGods = uniqueGods(hidden);
        const first = [
            visibleGods.length ? `天干见${visibleGods.join('、')}` : '天干除日主外未见其他十神',
            hiddenGods.length ? `藏干${visibleGods.length ? '另' : ''}见${hiddenGods.join('、')}` : '藏干未见其他十神'
        ].join('；');

        const onlyVisible = [];
        const onlyHidden = [];
        const both = [];
        GROUPS.forEach((group) => {
            const hasVisible = visible.some((item) => group.gods.includes(item.god));
            const hasHidden = hidden.some((item) => group.gods.includes(item.god));
            if (hasVisible && hasHidden) both.push(group.label);
            else if (hasVisible) onlyVisible.push(group.label);
            else if (hasHidden) onlyHidden.push(group.label);
        });
        const distribution = [];
        if (onlyVisible.length) distribution.push(`${joinChineseAnd(onlyVisible)}仅见于天干`);
        if (onlyHidden.length) distribution.push(`${joinChineseAnd(onlyHidden)}仅藏于地支`);
        if (both.length) distribution.push(`${both.join('、')}则在天干与藏干两层均有分布`);
        return `${first}。${distribution.length ? `${distribution.join('；')}。` : ''}`;
    }

    function buildTenGodGroups(visible, hidden) {
        return GROUPS.map((group) => {
            const visibleHits = visible.filter((item) => group.gods.includes(item.god));
            const hiddenHits = hidden.filter((item) => group.gods.includes(item.god));
            let text = '';
            if (visibleHits.length && hiddenHits.length) {
                text = `天干见${describeGodHits(visibleHits, fmtVisibleLocation)}；藏干另见${describeGodHits(hiddenHits, fmtHiddenLocation)}。`;
            } else if (visibleHits.length) {
                text = `天干见${describeGodHits(visibleHits, fmtVisibleLocation)}；藏干不见。`;
            } else if (hiddenHits.length) {
                text = `天干不见；藏干见${describeGodHits(hiddenHits, fmtHiddenLocation)}。`;
            } else {
                text = '天干、藏干均未见。';
            }
            return {
                key: group.key,
                label: group.label,
                text
            };
        });
    }

    function buildExactTenGodRows(visible, hidden) {
        return TEN_GODS.map((god) => {
            const v = visible.filter((item) => item.god === god);
            const h = hidden.filter((item) => item.god === god);
            const parts = [];
            if (v.length) parts.push(v.map(fmtVisibleLocation).join('、'));
            if (h.length) parts.push(h.map(fmtHiddenLocation).join('、'));
            return {
                god,
                count: v.length + h.length,
                text: parts.join('；')
            };
        }).filter((item) => item.count > 0);
    }

    function buildMonthCommand(result, visible, hidden) {
        const month = result.pillars?.[1];
        const monthHidden = month?.cangGan || [];
        const main = monthHidden[0] || null;
        if (!month) return null;
        const mainVisible = main ? visible.filter((item) => item.gan === main.gan) : [];
        const sameStemHidden = main ? hidden.filter((item) => item.gan === main.gan) : [];
        const otherHidden = sameStemHidden.filter((item) => item.pillarIndex !== 1);
        const summary = main
            ? `${month.zhi}月以${main.gan}${main.wuxing || ''}为本气，对${result.dayGan}日主为${main.shishen || '—'}；${mainVisible.length ? `本气在${mainVisible.map((item) => `${item.pillarTitle}${item.gan}`).join('、')}透出` : '本气未透天干'}${otherHidden.length ? `，并在${otherHidden.map((item) => `${item.pillarTitle}${item.zhi}`).join('、')}再见` : ''}。`
            : `${month.zhi}月藏干层次如下。`;
        return {
            monthZhi: month.zhi,
            season: result.monthSeason?.season || '',
            mainGan: main?.gan || '',
            mainGod: main?.shishen || '',
            summary,
            hiddenRows: monthHidden.map((item) => ({
                level: item.level,
                value: `${item.gan}${item.wuxing ? `·${item.wuxing}` : ''}${item.shishen ? `·${item.shishen}` : ''}`
            })),
            rows: [
                { key:'本气', value: main ? `${main.gan}${main.wuxing ? `·${main.wuxing}` : ''} · ${main.shishen || '—'}` : '—' },
                { key:'本气透干', value: describeList(mainVisible, fmtVisible) },
                { key:'本气藏支', value: describeList(sameStemHidden, fmtHidden) }
            ]
        };
    }

    const relationLabels = Object.freeze({
        STEM_FIVE_HARMONY: '五合',
        STEM_CLASH: '相冲',
        BRANCH_SIX_CLASH: '六冲',
        BRANCH_SIX_HARMONY: '六合',
        BRANCH_SIX_HARM: '六害',
        BRANCH_SIX_BREAK: '六破',
        BRANCH_PUNISHMENT: '相刑',
        SELF_PUNISHMENT: '自刑',
        PUNISHMENT_TRIAD_COMPLETE: '完整三刑',
        SAN_HE_COMPLETE: '三合局',
        SAN_HE_PARTIAL: '半合',
        SAN_HUI_COMPLETE: '三会方',
        SAN_HUI_PARTIAL: '同方'
    });

    function relationLabel(item) {
        if (item.code === 'SAN_HE_COMPLETE') return `三合${item.element || ''}局`;
        if (item.code === 'SAN_HE_PARTIAL') return `${item.pairKind || '半合'}${item.element || ''}（未成三合局）`;
        if (item.code === 'SAN_HUI_COMPLETE') return `三会${item.element || ''}方`;
        if (item.code === 'SAN_HUI_PARTIAL') return `同方${item.element || ''}（未成三会）`;
        if (item.code === 'PUNISHMENT_TRIAD_COMPLETE') return String(item.text || '').replace(/^原局构成完整/, '完整');
        if (item.code === 'SELF_PUNISHMENT') return `${item.branches?.[0] || ''}${item.branches?.[0] || ''}自刑`;
        return relationLabels[item.code] || getBaziRelationMeta?.(item)?.family || '关系';
    }

    function scopeOf(item) {
        return getBaziRelationMeta?.(item)?.scope || (item.type === 'stem' ? 'stem' : 'branch');
    }

    function compactRelation(item, result) {
        const indices = item.pillarIndices || [];
        const scope = scopeOf(item);
        const values = scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
        if (item.code === 'SELF_PUNISHMENT') {
            const branch = item.branches?.[0] || values[indices[0]] || '';
            const positions = indices.map((index) => pillarNames[index].replace('柱', '')).join('、');
            return `${positions}支同见${branch}，构成${branch}${branch}自刑`;
        }
        if (indices.length === 2) {
            const [a, b] = indices;
            const suffix = scope === 'stem' ? '干' : '支';
            return `${pillarNames[a].replace('柱', '')}${suffix}${values[a] || ''}与${pillarNames[b].replace('柱', '')}${suffix}${values[b] || ''}${relationLabel(item)}`;
        }
        return String(item.text || '').replace(/^原局(?:构成|有)/, '');
    }

    function relationPairTitle(item) {
        const indices = item.pillarIndices || [];
        if (item.code === 'SELF_PUNISHMENT') {
            const branch = item.branches?.[0] || '';
            return `${indices.map((index) => pillarNames[index].replace('柱', '')).join('、')}支${branch}自刑`;
        }
        if (indices.length !== 2) return '另一处关系';
        const positions = indices.map((index) => pillarNames[index].replace('柱', '')).join('');
        return `${positions}之间另见${relationLabel(item)}`;
    }

    function describePairBundle(result, indices, items) {
        const [a, b] = indices;
        const byScope = new Map();
        items.forEach((item) => {
            const scope = scopeOf(item);
            if (!byScope.has(scope)) byScope.set(scope, []);
            byScope.get(scope).push(item);
        });
        const clauses = [];
        byScope.forEach((scopeItems, scope) => {
            const suffix = scope === 'stem' ? '干' : '支';
            const values = scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
            const left = `${pillarNames[a].replace('柱', '')}${suffix}${values[a] || ''}`;
            const right = `${pillarNames[b].replace('柱', '')}${suffix}${values[b] || ''}`;
            const labels = scopeItems.map(relationLabel);
            clauses.push(labels.length > 1 ? `${left}与${right}同时见${labels.join('、')}` : `${left}与${right}${labels[0]}`);
        });
        return clauses.join('；');
    }

    function buildPairBundleStory(result, indices, items, storyIndex) {
        const positions = indices.map((index) => pillarNames[index].replace('柱', '')).join('');
        return {
            id:`pair-${storyIndex}-${indices.join('-')}`,
            title:`${positions}两柱关系重叠`,
            summary:`${describePairBundle(result, indices, items)}。`
        };
    }

    function buildFanStory(result, anchor, scope, label, items, storyIndex) {
        const suffix = scope === 'stem' ? '干' : '支';
        const values = scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
        const left = `${pillarNames[anchor].replace('柱', '')}${suffix}${values[anchor] || ''}`;
        const targets = items.map((item) => {
            const other = (item.pillarIndices || []).find((index) => index !== anchor);
            return `${pillarNames[other].replace('柱', '')}${suffix}${values[other] || ''}`;
        });
        return {
            id:`fan-${storyIndex}-${anchor}-${scope}-${label}`,
            title:`${left}形成重复${label}`,
            summary:`${left}同时与${targets.join('、')}${label}。`
        };
    }

    function buildHubStory(result, hubIndex, hits, storyIndex) {
        const grouped = new Map();
        const free = [];
        hits.forEach((item) => {
            const indices = item.pillarIndices || [];
            const scope = scopeOf(item);
            if (indices.length === 2 && indices.includes(hubIndex) && item.code !== 'SELF_PUNISHMENT') {
                const other = indices.find((index) => index !== hubIndex);
                const key = `${scope}:${other}`;
                if (!grouped.has(key)) grouped.set(key, { scope, other, items:[] });
                grouped.get(key).items.push(item);
            } else {
                free.push(item);
            }
        });

        const clauses = [];
        grouped.forEach((group) => {
            const suffix = group.scope === 'stem' ? '干' : '支';
            const values = group.scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
            const left = `${pillarNames[hubIndex].replace('柱', '')}${suffix}${values[hubIndex] || ''}`;
            const right = `${pillarNames[group.other].replace('柱', '')}${suffix}${values[group.other] || ''}`;
            const labels = group.items.map(relationLabel);
            clauses.push(labels.length > 1 ? `${left}与${right}同时见${labels.join('、')}` : `${left}与${right}${labels[0]}`);
        });
        free.forEach((item) => clauses.push(compactRelation(item, result)));

        const scopes = new Set(hits.map(scopeOf));
        let title;
        if (scopes.size === 1 && scopes.has('stem')) title = `${pillarNames[hubIndex].replace('柱', '')}干${result.originalGans?.[hubIndex] || ''}连接两端`;
        else if (scopes.size === 1 && scopes.has('branch')) title = `${pillarNames[hubIndex].replace('柱', '')}支${result.originalZhis?.[hubIndex] || ''}连接两端`;
        else title = `${pillarNames[hubIndex]}连接多组关系`;
        return { id:`hub-${storyIndex}-${hubIndex}`, title, summary:`${clauses.join('；')}。` };
    }

    function buildRelationThreads(result, relations) {
        const remaining = new Set(relations.map((_, index) => index));
        const threads = [];
        let storyIndex = 0;

        // 同一对柱位若同时存在多种关系，先合成为一条主线。
        const pairMap = new Map();
        relations.forEach((item, index) => {
            const indices = item.pillarIndices || [];
            if (indices.length !== 2 || item.code === 'SELF_PUNISHMENT') return;
            const key = [...indices].sort((a, b) => a - b).join('-');
            if (!pairMap.has(key)) pairMap.set(key, { indices:[...indices].sort((a, b) => a - b), relationIndices:[] });
            pairMap.get(key).relationIndices.push(index);
        });
        [...pairMap.values()]
            .filter((bundle) => bundle.relationIndices.length >= 2)
            .sort((a, b) => b.relationIndices.length - a.relationIndices.length || a.indices[0] - b.indices[0])
            .forEach((bundle) => {
                const active = bundle.relationIndices.filter((index) => remaining.has(index));
                if (active.length < 2) return;
                threads.push(buildPairBundleStory(result, bundle.indices, active.map((index) => relations[index]), storyIndex));
                active.forEach((index) => remaining.delete(index));
                storyIndex += 1;
            });

        // 同一干支若以同一种关系反复指向不同柱位，再合成为“重复作用”。
        while (remaining.size) {
            const fanMap = new Map();
            [...remaining].forEach((relationIndex) => {
                const item = relations[relationIndex];
                const indices = item.pillarIndices || [];
                if (indices.length !== 2 || item.code === 'SELF_PUNISHMENT') return;
                const scope = scopeOf(item);
                const label = relationLabel(item);
                indices.forEach((anchor) => {
                    const key = `${anchor}:${scope}:${label}`;
                    if (!fanMap.has(key)) fanMap.set(key, { anchor, scope, label, relationIndices:[] });
                    fanMap.get(key).relationIndices.push(relationIndex);
                });
            });
            const fan = [...fanMap.values()]
                .filter((item) => new Set(item.relationIndices).size >= 2)
                .sort((a, b) => b.relationIndices.length - a.relationIndices.length || a.anchor - b.anchor)[0];
            if (!fan) break;
            const uniqueIndices = [...new Set(fan.relationIndices)].filter((index) => remaining.has(index));
            if (uniqueIndices.length < 2) break;
            threads.push(buildFanStory(result, fan.anchor, fan.scope, fan.label, uniqueIndices.map((index) => relations[index]), storyIndex));
            uniqueIndices.forEach((index) => remaining.delete(index));
            storyIndex += 1;
        }

        // 剩余关系若仍围绕同一柱位相接，再按共同节点合并。
        while (remaining.size) {
            let bestIndex = -1;
            let bestHits = [];
            for (let pillarIndex = 0; pillarIndex < 4; pillarIndex += 1) {
                const hits = [...remaining].filter((relationIndex) => (relations[relationIndex].pillarIndices || []).includes(pillarIndex));
                if (hits.length > bestHits.length) {
                    bestIndex = pillarIndex;
                    bestHits = hits;
                }
            }
            if (bestIndex >= 0 && bestHits.length >= 2) {
                const hitItems = bestHits.map((index) => relations[index]);
                threads.push(buildHubStory(result, bestIndex, hitItems, storyIndex));
                bestHits.forEach((index) => remaining.delete(index));
                storyIndex += 1;
                continue;
            }
            const leftover = [...remaining].map((index) => relations[index]);
            leftover.forEach((item, offset) => {
                threads.push({
                    id:`rest-${storyIndex + offset}`,
                    title:relationPairTitle(item),
                    summary:`${compactRelation(item, result)}。`
                });
            });
            break;
        }
        return threads;
    }



    function relationVisualLabel(item) {
        if (item.code === 'SAN_HE_PARTIAL') return `${item.pairKind || '半合'}${item.element || ''}`;
        if (item.code === 'SAN_HUI_PARTIAL') return `同方${item.element || ''}`;
        if (item.code === 'SAN_HE_COMPLETE') return `三合${item.element || ''}局`;
        if (item.code === 'SAN_HUI_COMPLETE') return `三会${item.element || ''}方`;
        return relationLabel(item).replace(/（[^）]*）/g, '');
    }

    function relationTone(item) {
        if ([
            'STEM_CLASH',
            'BRANCH_SIX_CLASH',
            'BRANCH_PUNISHMENT',
            'PUNISHMENT_TRIAD_COMPLETE',
            'SELF_PUNISHMENT',
            'BRANCH_SIX_HARM',
            'BRANCH_SIX_BREAK'
        ].includes(item.code)) return 'tension';
        if ([
            'STEM_FIVE_HARMONY',
            'BRANCH_SIX_HARMONY',
            'SAN_HE_COMPLETE',
            'SAN_HE_PARTIAL',
            'SAN_HUI_COMPLETE',
            'SAN_HUI_PARTIAL'
        ].includes(item.code)) return 'harmony';
        return 'neutral';
    }

    const sanHuiDirection = Object.freeze({ 木:'东方木', 火:'南方火', 金:'西方金', 水:'北方水' });

    function completeStructureTitle(item) {
        if (item.code === 'SAN_HUI_COMPLETE') return `三会${sanHuiDirection[item.element] || `${item.element || ''}方`}`;
        if (item.code === 'SAN_HE_COMPLETE') return `三合${item.element || ''}局`;
        if (item.code === 'PUNISHMENT_TRIAD_COMPLETE') return `${(item.branches || []).join('')}三刑`;
        return relationLabel(item);
    }

    function buildCompleteStructure(result, scope, item, index) {
        const values = scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
        const suffix = scope === 'stem' ? '干' : '支';
        const participants = (item.branches || item.stems || []).map((value) => {
            const positions = (item.pillarIndices || [])
                .filter((pillarIndex) => values[pillarIndex] === value)
                .map((pillarIndex) => `${pillarNames[pillarIndex].replace('柱', '')}${suffix}`);
            return { value, positions:positions.join('、') || '原局' };
        });
        return {
            id:`${scope}-complete-${index}-${item.code}`,
            code:item.code,
            title:completeStructureTitle(item),
            participants,
            tone:relationTone(item),
            summary:`${participants.map((part) => part.value).join('、')}三${participants.length === 3 ? '支' : '项'}齐见，构成${completeStructureTitle(item)}`
        };
    }

    function graphNodeLabel(result, scope, index) {
        const value = scope === 'stem' ? result.originalGans?.[index] : result.originalZhis?.[index];
        return {
            id:`${scope}-${index}`,
            index,
            value:value || '',
            pillar:pillarNames[index].replace('柱', ''),
            position:`${pillarNames[index].replace('柱', '')}${scope === 'stem' ? '干' : '支'}`,
            x:380,
            y:110
        };
    }

    function layoutGraphNodes(nodes) {
        const layouts = {
            1: [[380, 112]],
            2: [[225, 112], [535, 112]],
            3: [[170, 78], [380, 158], [590, 78]],
            4: [[145, 74], [305, 154], [455, 154], [615, 74]]
        };
        const points = layouts[nodes.length] || nodes.map((_, i) => {
            const angle = (-Math.PI / 2) + (Math.PI * 2 * i / nodes.length);
            return [380 + Math.cos(angle) * 235, 116 + Math.sin(angle) * 72];
        });
        return nodes.map((node, i) => ({ ...node, x:points[i][0], y:points[i][1] }));
    }

    function makeGraphPath(fromNode, toNode, edgeOrder) {
        const x1 = fromNode.x;
        const y1 = fromNode.y;
        const x2 = toNode.x;
        const y2 = toNode.y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const nx = -dy / distance;
        const ny = dx / distance;

        // 标签向边的外侧轻微偏移；水平边统一置于上方，避免压在线上。
        let offset = edgeOrder % 2 === 0 ? 17 : -17;
        if (Math.abs(dy) < 10) offset = -22;
        const labelX = mx + nx * offset;
        const labelY = my + ny * offset;

        return {
            d:`M ${x1} ${y1} L ${x2} ${y2}`,
            labelX,
            labelY
        };
    }

    function buildRelationGraphGroup(result, scope, items) {
        if (!items.length) return null;
        const suffix = scope === 'stem' ? '干' : '支';
        const values = scope === 'stem' ? (result.originalGans || []) : (result.originalZhis || []);
        const pairMap = new Map();
        const groupRelations = [];
        const completeStructures = [];
        const selfRelations = [];
        const involved = new Set();

        items.forEach((item) => {
            const indices = [...new Set(item.pillarIndices || [])];
            indices.forEach((index) => involved.add(index));
            if (item.code === 'SELF_PUNISHMENT' || indices.length === 1) {
                selfRelations.push(item);
                return;
            }
            if (indices.length !== 2) {
                if (scope === 'branch' && COMPLETE_CODES.has(item.code)) completeStructures.push(item);
                else groupRelations.push(item);
                return;
            }
            const sorted = [...indices].sort((a, b) => a - b);
            const key = sorted.join('-');
            if (!pairMap.has(key)) pairMap.set(key, { indices:sorted, items:[] });
            pairMap.get(key).items.push(item);
        });

        const pairInvolved = new Set();
        pairMap.forEach((bundle) => bundle.indices.forEach((index) => pairInvolved.add(index)));
        const rawNodes = [...pairInvolved].sort((a, b) => a - b).map((index) => graphNodeLabel(result, scope, index));
        const nodes = layoutGraphNodes(rawNodes);
        const nodeByIndex = new Map(nodes.map((node) => [node.index, node]));
        const edges = [...pairMap.values()].map((bundle, edgeOrder) => {
            const [a, b] = bundle.indices;
            const from = nodeByIndex.get(a);
            const to = nodeByIndex.get(b);
            const labels = bundle.items.map(relationVisualLabel);
            const fullLabels = bundle.items.map(relationLabel);
            const tones = new Set(bundle.items.map(relationTone));
            const tone = tones.size === 1 ? [...tones][0] : 'mixed';
            const labelItems = [];
            const seenLabels = new Set();
            bundle.items.forEach((item) => {
                const label = relationVisualLabel(item);
                if (seenLabels.has(label)) return;
                seenLabels.add(label);
                labelItems.push({ label, tone:relationTone(item) });
            });
            return {
                id:`${scope}-edge-${a}-${b}`,
                from:a,
                to:b,
                label:[...new Set(labels)].join(' · '),
                fullLabel:[...new Set(fullLabels)].join('、'),
                tone,
                labelItems,
                ...makeGraphPath(from, to, edgeOrder)
            };
        });

        const edgeByPair = new Map(edges.map((edge) => [`${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`, edge]));
        const matrixRows = nodes.map((rowNode, rowIndex) => ({
            id:`${scope}-matrix-row-${rowNode.index}`,
            node:rowNode,
            cells:nodes.map((colNode, colIndex) => {
                if (colIndex < rowIndex) return { id:`${rowNode.index}-${colNode.index}`, kind:'lower', labels:[] };
                if (colIndex === rowIndex) return { id:`${rowNode.index}-${colNode.index}`, kind:'diagonal', labels:[] };
                const edge = edgeByPair.get(`${Math.min(rowNode.index, colNode.index)}-${Math.max(rowNode.index, colNode.index)}`);
                return {
                    id:`${rowNode.index}-${colNode.index}`,
                    kind:edge ? 'relation' : 'empty',
                    labels:edge?.labelItems || [],
                    fullLabel:edge?.fullLabel || ''
                };
            })
        }));
        const displayMode = (nodes.length >= 4 || edges.length >= 4) ? 'matrix' : 'graph';

        const relationClauses = edges.map((edge) => {
            const left = `${pillarNames[edge.from].replace('柱', '')}${suffix}${values[edge.from] || ''}`;
            const right = `${pillarNames[edge.to].replace('柱', '')}${suffix}${values[edge.to] || ''}`;
            return `${left}与${right}见${edge.fullLabel}`;
        });
        selfRelations.forEach((item) => relationClauses.push(compactRelation(item, result)));
        groupRelations.forEach((item) => relationClauses.push(compactRelation(item, result)));

        const majorStructures = completeStructures.map((item, index) => buildCompleteStructure(result, scope, item, index));
        const majorClauses = majorStructures.map((item) => item.summary);
        let summary = '';
        if (majorClauses.length) {
            const secondary = relationClauses.length ? `；此外，${relationClauses.join('；')}` : '';
            summary = `${majorClauses.join('；')}${secondary}。`;
        } else if (nodes.length >= 3 && relationClauses.length >= 2) {
            summary = `${nodes.map((node) => node.value).join('、')}形成一组彼此交叠的${scope === 'stem' ? '天干' : '地支'}关系：${relationClauses.join('；')}。`;
        } else if (relationClauses.length) {
            summary = `${relationClauses.join('；')}。`;
        }

        const titleNodes = [...involved].sort((a, b) => a - b).map((index) => values[index] || '');
        return {
            id:`graph-${scope}`,
            scope,
            title:`${scope === 'stem' ? '天干' : '地支'}${titleNodes.length ? ` · ${titleNodes.join(' · ')}` : ''}`,
            nodes,
            edges,
            matrixRows,
            displayMode,
            majorStructures,
            selfRelations:selfRelations.map((item, index) => ({ id:`${scope}-self-${index}`, label:compactRelation(item, result) })),
            groupRelations:groupRelations.map((item, index) => ({ id:`${scope}-group-${index}`, label:compactRelation(item, result) })),
            overviewLines:[...majorClauses, ...relationClauses].map((line) => /[。！？]$/.test(line) ? line : `${line}。`),
            summary,
            dense:displayMode === 'matrix'
        };
    }

    function buildRelationGraphs(result, relations) {
        const stems = relations.filter((item) => scopeOf(item) === 'stem');
        const branches = relations.filter((item) => scopeOf(item) === 'branch');
        return [
            buildRelationGraphGroup(result, 'stem', stems),
            buildRelationGraphGroup(result, 'branch', branches)
        ].filter(Boolean);
    }

    function buildRelations(result) {
        const relations = result.internalRelations || [];
        const stems = relations.filter((item) => getBaziRelationMeta?.(item)?.scope === 'stem');
        const branches = relations.filter((item) => getBaziRelationMeta?.(item)?.scope === 'branch');
        const complete = branches.filter((item) => COMPLETE_CODES.has(item.code));
        const partial = branches.filter((item) => PARTIAL_CODES.has(item.code));
        const direct = branches.filter((item) => !COMPLETE_CODES.has(item.code) && !PARTIAL_CODES.has(item.code));
        const hubs = [];
        for (let index = 0; index < 4; index += 1) {
            const hits = relations.filter((item) => (item.pillarIndices || []).includes(index));
            if (hits.length >= 2) {
                hubs.push({
                    pillar: pillarNames[index],
                    pillarIndex:index,
                    count: hits.length,
                    relations: [...new Set(hits.map((item) => item.text))]
                });
            }
        }
        hubs.sort((a, b) => b.count - a.count || a.pillarIndex - b.pillarIndex);
        const threads = buildRelationThreads(result, relations);
        const graphs = buildRelationGraphs(result, relations);
        return {
            all: relations,
            stems,
            branches,
            complete,
            partial,
            direct,
            hubs,
            threads,
            graphs,
            hasAny: relations.length > 0,
            summary: threads.map((item) => item.summary).join(' ')
        };
    }

    function literatureStatus(item) {
        const isLocator = item?.applicability === 'locator-only'
            || item?.excerptType === 'locator'
            || item?.verified === false
            || item?.sourceKind === '原典定位';
        if (isLocator) return '条目定位';
        if (item?.applicability === 'needs-review') return '条件对应';
        return '条目对应';
    }

    function buildLiteratureChecks(result) {
        const entries = result.matchedLiterature || [];
        const preferredBooks = new Set(['穷通宝鉴','子平真诠','千里命稿','三命通会']);
        const displayEntries = entries.filter((item) => item.match && !['reference-only','method-only'].includes(item.applicability));
        const preferred = displayEntries.filter((item) => preferredBooks.has(item.book));
        const selected = [...preferred, ...displayEntries.filter((item) => !preferredBooks.has(item.book))]
            .filter((item, index, array) => array.findIndex((x) => x.id === item.id) === index)
            .slice(0, 6);
        return selected.map((item) => ({
            id: item.id,
            book: item.book,
            chapter: item.chapter,
            sourceType: (item.excerptType === 'locator' || item.verified === false || item.sourceKind === '原典定位') ? '条目定位' : '原文',
            sourceText: item.quote || item.chapter || '—',
            check: userFacingText(item.match || ''),
            status: literatureStatus(item)
        }));
    }

    function buildBaziDetail(result) {
        if (!result?.pillars?.length) {
            return {
                strength:null,
                tenGodSummary:'',
                tenGodGroups:[],
                exactTenGodRows:[],
                monthCommand:null,
                relations:{all:[],stems:[],branches:[],complete:[],partial:[],direct:[],hubs:[],threads:[],graphs:[],hasAny:false,summary:''},
                literatureChecks:[]
            };
        }
        const visible = visibleItems(result);
        const hidden = hiddenItems(result);
        const strength = buildStrength(result, visible, hidden);
        const tenGodGroups = buildTenGodGroups(visible, hidden);
        const exactTenGodRows = buildExactTenGodRows(visible, hidden);
        const monthCommand = buildMonthCommand(result, visible, hidden);
        const relations = buildRelations(result);
        const literatureChecks = buildLiteratureChecks(result);
        return {
            headline: `${result.dayGan}${result.dayGanWuXing}日主 · ${result.monthSeason?.monthZhi || result.originalZhis?.[1] || '—'}月 · ${result.monthSeason?.season || '—'}`,
            strength,
            tenGodSummary: buildTenGodSummary(visible, hidden),
            tenGodGroups,
            exactTenGodRows,
            monthCommand,
            relations,
            literatureChecks
        };
    }

    GuiJia.baziDetail = { buildBaziDetail };
})(window);
