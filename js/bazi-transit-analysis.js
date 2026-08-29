(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const core = GuiJia.baziCore;
    if (!core) throw new Error('GuiJia.baziCore must be loaded before bazi-transit-analysis.js');

    const {
        baziRelationCodes,
        baziTransitRelationCodes,
        buildMonthSeason
    } = core;

    const completeCodes = new Set([
        baziRelationCodes.SAN_HUI_COMPLETE,
        baziRelationCodes.SAN_HE_COMPLETE,
        baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE
    ]);

    const strongTransitCodes = new Set([
        baziTransitRelationCodes.PILLAR_FUYIN,
        baziTransitRelationCodes.PILLAR_FANYIN,
        baziTransitRelationCodes.PILLAR_HEAVEN_EARTH_HARMONY,
        baziTransitRelationCodes.LAYER_SAME_GANZHI,
        baziTransitRelationCodes.LAYER_HEAVEN_EARTH_CLASH,
        baziTransitRelationCodes.LAYER_HEAVEN_EARTH_HARMONY
    ]);

    const tensionCodes = new Set([
        baziRelationCodes.BRANCH_SIX_CLASH,
        baziRelationCodes.BRANCH_PUNISHMENT,
        baziRelationCodes.SELF_PUNISHMENT,
        baziRelationCodes.BRANCH_SIX_HARM,
        baziRelationCodes.BRANCH_SIX_BREAK,
        baziRelationCodes.STEM_CLASH
    ]);

    const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
    const stemNames = ['年干', '月干', '日干', '时干'];
    const branchNames = ['年支', '月支', '日支', '时支'];

    const relationPriority = (relation) => {
        if (!relation) return 0;
        if (completeCodes.has(relation.code)) return 120;
        if (strongTransitCodes.has(relation.code)) return 112;
        if (relation.code === baziRelationCodes.BRANCH_SIX_CLASH || relation.code === baziRelationCodes.SELF_PUNISHMENT) return 96;
        if (relation.code === baziRelationCodes.BRANCH_PUNISHMENT) return 92;
        if (relation.code === baziRelationCodes.BRANCH_SIX_HARMONY) return 88;
        if (relation.code === baziRelationCodes.BRANCH_SIX_HARM) return 84;
        if (relation.code === baziRelationCodes.BRANCH_SIX_BREAK) return 82;
        if (relation.code === baziRelationCodes.SAN_HE_PARTIAL || relation.code === baziRelationCodes.SAN_HUI_PARTIAL) return 78;
        if (relation.code === baziRelationCodes.STEM_FIVE_HARMONY) return 74;
        if (relation.code === baziRelationCodes.STEM_CLASH) return 72;
        if (relation.code === baziTransitRelationCodes.BRANCH_SAME) return 60;
        if (relation.code === baziTransitRelationCodes.STEM_SAME) return 56;
        return 40;
    };

    const uniqueByText = (items = []) => {
        const seen = new Set();
        return items.filter((item) => {
            const key = `${item?.code || ''}|${item?.text || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const prioritize = (groups = [], limit = 3) => uniqueByText(groups.flat().filter(Boolean))
        .map((item, index) => ({ item, index, score: relationPriority(item) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, limit)
        .map((entry) => entry.item);

    const hasTension = (items = []) => items.some((item) => tensionCodes.has(item.code));

    const shiShenThemeBrief = Object.freeze({
        '比肩': '自我立场、协作与资源边界',
        '劫财': '竞争、结盟与资源流动',
        '食神': '输出、表达与生活经验',
        '伤官': '表达突破、求变与规则张力',
        '偏财': '流动资源、机会与项目往来',
        '正财': '稳定资源、经营与责任落实',
        '七杀': '压力、决断与风险承担',
        '正官': '规则、职责与组织秩序',
        '偏印': '独立研究、方法转换与内向吸收',
        '正印': '学习、支持与经验吸收'
    });

    const buildThemeSentence = (item) => {
        if (!item) return '';
        const shiShen = item.shiShen || '—';
        const brief = shiShenThemeBrief[shiShen];
        return `${item.gan}为${shiShen}${brief ? `，主题偏向${brief}` : ''}`;
    };

    const relationLabel = (relation) => {
        if (!relation) return '关系';
        const byCode = {
            [baziRelationCodes.STEM_FIVE_HARMONY]: '天干五合',
            [baziRelationCodes.STEM_CLASH]: '天干相冲',
            [baziRelationCodes.BRANCH_SIX_CLASH]: '六冲',
            [baziRelationCodes.BRANCH_SIX_HARMONY]: '六合',
            [baziRelationCodes.BRANCH_SIX_HARM]: '六害',
            [baziRelationCodes.BRANCH_SIX_BREAK]: '六破',
            [baziRelationCodes.SELF_PUNISHMENT]: '自刑',
            [baziTransitRelationCodes.STEM_SAME]: '同干',
            [baziTransitRelationCodes.BRANCH_SAME]: '同支',
            [baziTransitRelationCodes.PILLAR_FUYIN]: '伏吟',
            [baziTransitRelationCodes.PILLAR_FANYIN]: '天克地冲（反吟）',
            [baziTransitRelationCodes.PILLAR_HEAVEN_EARTH_HARMONY]: '天合地合',
            [baziTransitRelationCodes.LAYER_SAME_GANZHI]: '并临',
            [baziTransitRelationCodes.LAYER_HEAVEN_EARTH_CLASH]: '天克地冲',
            [baziTransitRelationCodes.LAYER_HEAVEN_EARTH_HARMONY]: '天合地合'
        };
        if (byCode[relation.code]) return byCode[relation.code];
        if (relation.code === baziRelationCodes.BRANCH_PUNISHMENT) {
            const match = relation.text?.match(/构成([^；。]+)/);
            return match?.[1] || '相刑';
        }
        if (relation.code === baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE) return '完整三刑';
        if (relation.code === baziRelationCodes.SAN_HE_COMPLETE) return `三合${relation.element || ''}局`;
        if (relation.code === baziRelationCodes.SAN_HUI_COMPLETE) return `三会${relation.element || ''}方`;
        if (relation.code === baziRelationCodes.SAN_HE_PARTIAL) return `${relation.pairKind || '半合'}${relation.element || ''}`;
        if (relation.code === baziRelationCodes.SAN_HUI_PARTIAL) return `同方${relation.element || ''}`;
        return relation.text || '关系';
    };

    const relationGroupKey = (relation) => {
        if (!relation) return 'none';
        if (completeCodes.has(relation.code) || relation.code === baziRelationCodes.SAN_HE_PARTIAL || relation.code === baziRelationCodes.SAN_HUI_PARTIAL) {
            return `structure|${relation.code}|${(relation.branches || []).join('')}|${relation.action || ''}`;
        }
        if (strongTransitCodes.has(relation.code)) {
            return `strong|${relation.code}|${(relation.layerLabels || []).join('-')}|${(relation.pillarIndices || []).join(',')}`;
        }
        if (relation.layerLabels?.length) {
            const scope = relation.type === 'stem' ? 'stem' : 'branch';
            return `pair|${scope}|${relation.layerLabels.join('-')}`;
        }
        if ((relation.pillarIndices || []).length === 1) {
            const scope = relation.type === 'stem' ? 'stem' : 'branch';
            return `original|${scope}|${relation.pillarIndices[0]}`;
        }
        return `single|${relation.code}|${relation.text}`;
    };

    const buildGroupText = (members, targetLabel = '') => {
        const first = members[0];
        if (!first) return '';
        if (members.length === 1) return first.text || '';
        const labels = [...new Set(members.map(relationLabel))];
        if (first.layerLabels?.length === 2) {
            const [a, b] = first.layerLabels;
            if (first.type === 'stem') {
                const [ga, gb] = first.stems || [];
                return `${a}【${ga}】与${b}【${gb}】同时见${labels.join('、')}`;
            }
            const [za, zb] = first.branches || [];
            return `${a}【${za}】与${b}【${zb}】同时见${labels.join('、')}`;
        }
        if ((first.pillarIndices || []).length === 1) {
            const index = first.pillarIndices[0];
            if (first.type === 'stem') {
                return `${targetLabel}【${first.targetGan}】与${stemNames[index]}【${first.originalGan}】同时见${labels.join('、')}`;
            }
            return `${targetLabel}【${first.targetZhi}】与${branchNames[index]}【${first.originalZhi}】同时见${labels.join('、')}`;
        }
        return members.map((item) => item.text).join('；');
    };

    const compactRelationGroups = (relations = [], targetLabel = '') => {
        const buckets = new Map();
        uniqueByText(relations.filter(Boolean)).forEach((relation, index) => {
            const key = relationGroupKey(relation);
            if (!buckets.has(key)) buckets.set(key, { key, members: [], index });
            buckets.get(key).members.push(relation);
        });
        return [...buckets.values()].map((group) => {
            const sorted = [...group.members].sort((a, b) => relationPriority(b) - relationPriority(a));
            const top = sorted[0];
            return {
                ...top,
                members: sorted,
                text: buildGroupText(sorted, targetLabel),
                score: relationPriority(top),
                groupIndex: group.index
            };
        });
    };

    const prioritizeGroups = (groups = [], limit = 3) => groups.flat().filter(Boolean)
        .sort((a, b) => (b.score ?? relationPriority(b)) - (a.score ?? relationPriority(a)) || (a.groupIndex || 0) - (b.groupIndex || 0))
        .slice(0, limit);

    const sentenceList = (items = [], emptyText = '') => {
        if (!items.length) return emptyText;
        return items.map((item) => item.text).join('；') + '。';
    };

    const coveredByPillarSignal = (relation, pillarSignals = []) => pillarSignals.some((signal) => {
        const samePillar = (signal.pillarIndices || []).some((index) => (relation.pillarIndices || []).includes(index));
        if (!samePillar) return false;
        if (signal.code === baziTransitRelationCodes.PILLAR_FANYIN) {
            return relation.code === baziRelationCodes.STEM_CLASH || relation.code === baziRelationCodes.BRANCH_SIX_CLASH;
        }
        if (signal.code === baziTransitRelationCodes.PILLAR_HEAVEN_EARTH_HARMONY) {
            return relation.code === baziRelationCodes.STEM_FIVE_HARMONY || relation.code === baziRelationCodes.BRANCH_SIX_HARMONY;
        }
        return false;
    });

    const buildOriginalTrigger = (item, targetLabel) => {
        if (!item) return { text: '', relations: [] };
        const pillarSignals = item.pillarSignals || [];
        const secondary = [...(item.relations || []), ...(item.stemRelations || [])]
            .filter((relation) => !coveredByPillarSignal(relation, pillarSignals));
        const groups = compactRelationGroups([...pillarSignals, ...secondary], targetLabel);
        const key = prioritizeGroups(groups, 3);
        return {
            text: key.length ? sentenceList(key) : '',
            relations: key
        };
    };

    const buildPairSummary = (relations = []) => prioritizeGroups(compactRelationGroups(relations), 3);

    const toneType = (relations = []) => {
        const tension = hasTension(relations);
        const harmony = relations.some((item) => item.type === 'hehui');
        if (tension && harmony) return 'neutral';
        if (tension) return 'chong';
        if (harmony) return 'hehui';
        return relations[0]?.type || 'neutral';
    };

    const originalValueSources = (result, value, scope = 'branch') => {
        const values = scope === 'stem' ? (result?.originalGans || []) : (result?.originalZhis || []);
        const names = scope === 'stem' ? stemNames : branchNames;
        return values.map((item, index) => item === value ? `原局${names[index]}` : null).filter(Boolean);
    };

    const formatSourcedMember = (value, sources = []) => {
        const unique = [...new Set(sources.filter(Boolean))];
        return `${value || '—'}${unique.length ? `（${unique.join('／')}）` : ''}`;
    };

    const structureFormationLabel = (relation, targetLabel = '') => {
        if (!relation) return '';
        if (relation.action === 'complete-by-external') return `${targetLabel}补齐`;
        if (relation.action === 'retrigger') return `${targetLabel}再次参与`;
        if (relation.action === 'formed-by-external') return `${targetLabel}形成`;
        if (relation.action === 'complete-by-three-layers') return '大运、流年共同补齐';
        if (relation.action === 'complete-by-liuyue') return '流月补齐';
        if (relation.action === 'retrigger-by-liuyue') return '流月再次参与';
        return '';
    };

    const originalStructureMembersText = (relation, targetLabel, result) => (relation.branches || []).map((zhi) => {
        const sources = originalValueSources(result, zhi, 'branch');
        if (relation.targetZhi === zhi && targetLabel) sources.push(`${targetLabel}支`);
        return formatSourcedMember(zhi, sources);
    }).join(' · ');

    const structureEvidenceItem = (relation, targetLabel, result) => {
        const category = completeCodes.has(relation.code) ? '完整结构' : '组合结构';
        const parts = [
            category,
            originalStructureMembersText(relation, targetLabel, result),
            structureName(relation),
            structureFormationLabel(relation, targetLabel)
        ].filter(Boolean);
        return {
            object: category,
            values: parts[1] || '',
            relation: parts[2] || relationLabel(relation),
            formation: parts[3] || '',
            parts,
            type: relation.type || 'neutral'
        };
    };

    const directFactEvidenceItem = (entry, targetLabel, scope = 'branch') => {
        if (!entry || entry.loose) return null;
        const targetSource = `${targetLabel}${scope === 'stem' ? '干' : '支'}`;
        const originalNames = entry.indices.map((index) => `原局${scope === 'stem' ? stemNames[index] : branchNames[index]}`);
        const members = `${formatSourcedMember(entry.targetValue, [targetSource])} · ${formatSourcedMember(entry.originalValue, originalNames)}`;
        const relation = entry.labels.join(' · ');
        return {
            object: scope === 'stem' ? '天干关系' : '二元关系',
            values: members,
            relation,
            parts: [scope === 'stem' ? '天干关系' : '二元关系', members, relation],
            type: toneType((entry.group?.members || [entry.first]).filter(Boolean))
        };
    };

    const strongOriginalEvidenceItem = (group, targetLabel) => {
        const first = group.members?.[0] || group;
        const index = (first.pillarIndices || [])[0];
        if (!Number.isInteger(index)) return null;
        const targetGanZhi = `${first.targetGan || ''}${first.targetZhi || ''}`;
        const originalGanZhi = `${first.originalGan || ''}${first.originalZhi || ''}`;
        const members = `${formatSourcedMember(targetGanZhi, [targetLabel])} · ${formatSourcedMember(originalGanZhi, [`原局${pillarNames[index]}`])}`;
        const relation = relationLabel(first);
        return {
            object: '整柱关系',
            values: members,
            relation,
            parts: ['整柱关系', members, relation],
            type: first.type || 'neutral'
        };
    };

    const partialCoveredByComplete = (relation, completeRelations = []) => {
        if (!relation) return false;
        const completeCode = relation.code === baziRelationCodes.SAN_HE_PARTIAL
            ? baziRelationCodes.SAN_HE_COMPLETE
            : relation.code === baziRelationCodes.SAN_HUI_PARTIAL
                ? baziRelationCodes.SAN_HUI_COMPLETE
                : '';
        if (!completeCode) return false;
        const partial = new Set(relation.branches || []);
        return completeRelations.some((candidate) => {
            if (candidate?.code !== completeCode) return false;
            if (relation.element && candidate.element && relation.element !== candidate.element) return false;
            const full = new Set(candidate.branches || []);
            return [...partial].every((zhi) => full.has(zhi));
        });
    };

    const shouldExcludeStructure = (relation, excludeRelations = []) => {
        if (!relation) return false;
        const signature = structureSignature(relation);
        if (signature && excludeRelations.some((candidate) => structureSignature(candidate) === signature)) return true;
        return partialCoveredByComplete(relation, excludeRelations);
    };

    const originalEvidenceItems = (item, targetLabel, result, excludeRelations = []) => {
        if (!item) return [];
        const pillarSignals = item.pillarSignals || [];
        const secondary = [...(item.relations || []), ...(item.stemRelations || [])]
            .filter((relation) => !coveredByPillarSignal(relation, pillarSignals));
        const groups = compactRelationGroups([...pillarSignals, ...secondary], targetLabel);
        const evidence = [];

        groups.filter((group) => strongTransitCodes.has((group.members?.[0] || group).code))
            .forEach((group) => {
                const itemEvidence = strongOriginalEvidenceItem(group, targetLabel);
                if (itemEvidence) evidence.push(itemEvidence);
            });

        groups.filter((group) => {
            const first = group.members?.[0] || group;
            return (completeCodes.has(first.code) || first.code === baziRelationCodes.SAN_HE_PARTIAL || first.code === baziRelationCodes.SAN_HUI_PARTIAL)
                && !shouldExcludeStructure(first, excludeRelations);
        }).forEach((group) => evidence.push(structureEvidenceItem(group.members?.[0] || group, targetLabel, result)));

        const directGroups = groups.filter((group) => {
            const first = group.members?.[0] || group;
            return !strongTransitCodes.has(first.code)
                && !completeCodes.has(first.code)
                && first.code !== baziRelationCodes.SAN_HE_PARTIAL
                && first.code !== baziRelationCodes.SAN_HUI_PARTIAL;
        });
        const facts = normalizeInteractionFacts(directGroups);
        facts.stem.forEach((entry) => {
            const itemEvidence = directFactEvidenceItem(entry, targetLabel, 'stem');
            if (itemEvidence) evidence.push(itemEvidence);
        });
        facts.branch.direct.forEach((entry) => {
            const itemEvidence = directFactEvidenceItem(entry, targetLabel, 'branch');
            if (itemEvidence) evidence.push(itemEvidence);
        });
        return evidence;
    };

    const pairEvidenceItems = (relations = []) => compactRelationGroups(relations).map((group) => {
        const first = group.members[0];
        const [labelA = '前层', labelB = '后层'] = first.layerLabels || [];
        const labels = [...new Set(group.members.map(relationLabel))].join(' · ');
        if (strongTransitCodes.has(first.code)) {
            const left = `${(first.stems || [])[0] || ''}${(first.branches || [])[0] || ''}`;
            const right = `${(first.stems || [])[1] || ''}${(first.branches || [])[1] || ''}`;
            const members = `${formatSourcedMember(left, [labelA])} · ${formatSourcedMember(right, [labelB])}`;
            return { object:'层间整柱关系', values:members, relation:relationLabel(first), parts:['层间整柱关系', members, relationLabel(first)], type:first.type || 'neutral' };
        }
        if (first.type === 'stem') {
            const members = `${formatSourcedMember((first.stems || [])[0] || '', [`${labelA}干`])} · ${formatSourcedMember((first.stems || [])[1] || '', [`${labelB}干`])}`;
            return { object:'层间天干关系', values:members, relation:labels, parts:['层间天干关系', members, labels], type:toneType(group.members) };
        }
        const members = `${formatSourcedMember((first.branches || [])[0] || '', [`${labelA}支`])} · ${formatSourcedMember((first.branches || [])[1] || '', [`${labelB}支`])}`;
        return { object:'层间地支关系', values:members, relation:labels, parts:['层间地支关系', members, labels], type:toneType(group.members) };
    });

    const layeredStructureMembersText = (relation, result, daYun, liuNian, liuYue = null) => (relation.branches || []).map((zhi) => {
        const sources = originalValueSources(result, zhi, 'branch');
        if (daYun?.zhi === zhi) sources.push('大运支');
        if (liuNian?.zhi === zhi) sources.push('流年支');
        if (liuYue?.zhi === zhi) sources.push('流月支');
        return formatSourcedMember(zhi, sources);
    }).join(' · ');

    const layeredEvidenceItems = (relations = [], result, daYun, liuNian, liuYue = null) => relations.map((relation) => {
        const members = layeredStructureMembersText(relation, result, daYun, liuNian, liuYue);
        const relationText = structureName(relation);
        const formation = structureFormationLabel(relation, liuYue ? '流月' : '流年');
        return {
            object:'完整结构', values:members, relation:relationText, formation,
            parts:['完整结构', members, relationText, formation].filter(Boolean),
            type:relation.type || 'neutral'
        };
    });

    const evidenceGroup = (label, items) => items.length ? { label, items } : null;

    const sanHuiDirection = Object.freeze({
        '木': '东方木',
        '火': '南方火',
        '金': '西方金',
        '水': '北方水'
    });

    const joinNarratives = (items = []) => {
        const cleaned = items.filter(Boolean).map((text) => String(text).replace(/[。；;]+$/u, ''));
        return cleaned.length ? `${cleaned.join('；')}。` : '';
    };

    const structureName = (relation) => {
        if (!relation) return '完整结构';
        if (relation.code === baziRelationCodes.SAN_HUI_COMPLETE) return `三会${sanHuiDirection[relation.element] || relation.element || ''}`;
        if (relation.code === baziRelationCodes.SAN_HE_COMPLETE) return `三合${relation.element || ''}局`;
        if (relation.code === baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE) return relationLabel(relation);
        if (relation.code === baziRelationCodes.SAN_HE_PARTIAL) return `${relation.pairKind || '半合'}${relation.element || ''}`;
        if (relation.code === baziRelationCodes.SAN_HUI_PARTIAL) return `同方${relation.element || ''}`;
        return relationLabel(relation);
    };

    const isStructureGroup = (group) => {
        const code = group?.members?.[0]?.code || group?.code;
        return completeCodes.has(code)
            || code === baziRelationCodes.SAN_HE_PARTIAL
            || code === baziRelationCodes.SAN_HUI_PARTIAL
            || strongTransitCodes.has(code);
    };

    const explainStructureGroup = (group, targetLabel) => {
        const first = group?.members?.[0] || group;
        if (!first) return '';
        const branches = (first.branches || []).join('');
        const targetZhi = first.targetZhi || '';
        const name = structureName(first);
        const index = (first.pillarIndices || [])[0];

        if (strongTransitCodes.has(first.code) && Number.isInteger(index)) {
            const pillar = pillarNames[index];
            const targetGanZhi = `${first.targetGan || ''}${first.targetZhi || ''}`;
            const originalGanZhi = `${first.originalGan || ''}${first.originalZhi || ''}`;
            if (first.code === baziTransitRelationCodes.PILLAR_FUYIN) {
                return `${targetLabel}【${targetGanZhi}】与原局${pillar}【${originalGanZhi || targetGanZhi}】伏吟，同一柱位干支完整重复`;
            }
            if (first.code === baziTransitRelationCodes.PILLAR_FANYIN) {
                return `${targetLabel}【${targetGanZhi}】与原局${pillar}【${originalGanZhi}】天克地冲（反吟），干支两层同时相冲`;
            }
            if (first.code === baziTransitRelationCodes.PILLAR_HEAVEN_EARTH_HARMONY) {
                return `${targetLabel}【${targetGanZhi}】与原局${pillar}【${originalGanZhi}】天合地合，干支两层同时相合`;
            }
        }

        if (completeCodes.has(first.code)) {
            if (first.action === 'retrigger') {
                return `${targetLabel}支【${targetZhi}】再次参与原局已成的${name}【${branches}】`;
            }
            if (first.action === 'complete-by-external') {
                return `${targetLabel}支【${targetZhi}】加入后，与原局已有支位会成${name}【${branches}】`;
            }
        }

        return group.text || first.text || '';
    };

    const joinPositionNames = (names = []) => {
        const unique = [...new Set(names.filter(Boolean))];
        if (!unique.length) return '';
        if (unique.length === 1) return unique[0];
        if (unique.length === 2) return `${unique[0]}和${unique[1]}`;
        return `${unique.slice(0, -1).join('、')}和${unique[unique.length - 1]}`;
    };

    // 先把“外来干支 -> 原局柱位”的直接关系标准化成事实，再交给文案层。
    // 同一外来干/支、同一原局干/支值、同一组关系会在这里合并所有柱位，
    // 避免渲染阶段再逐句拼接导致“年支见六合、时支见六合”一类重复。
    const normalizeDirectInteractionFacts = (groups = [], scope = 'branch') => {
        const buckets = new Map();
        const loose = [];

        groups.forEach((group, order) => {
            const first = group?.members?.[0] || group;
            const indices = [...new Set((group?.members || [first])
                .flatMap((member) => member?.pillarIndices || first?.pillarIndices || [])
                .filter(Number.isInteger))];
            if (!first || !indices.length) {
                loose.push({ loose: true, group, order });
                return;
            }

            const labels = [...new Set((group.members || [first]).map(relationLabel))];
            const originalValue = scope === 'stem' ? (first.originalGan || '') : (first.originalZhi || '');
            const targetValue = scope === 'stem' ? (first.targetGan || '') : (first.targetZhi || '');
            const selfPunishment = scope === 'branch' && first.code === baziRelationCodes.SELF_PUNISHMENT;
            const key = [
                scope,
                targetValue,
                originalValue,
                [...labels].sort().join('|'),
                selfPunishment ? 'self' : 'direct'
            ].join('|');

            if (!buckets.has(key)) {
                buckets.set(key, {
                    scope,
                    first,
                    labels,
                    originalValue,
                    targetValue,
                    selfPunishment,
                    indices: [],
                    order
                });
            }
            const bucket = buckets.get(key);
            bucket.indices.push(...indices);
            bucket.indices = [...new Set(bucket.indices)].sort((a, b) => a - b);
            bucket.order = Math.min(bucket.order, order);
        });

        return [
            ...[...buckets.values()],
            ...loose
        ].sort((a, b) => a.order - b.order);
    };

    const normalizeInteractionFacts = (groups = []) => {
        const stemGroups = [];
        const branchDirectGroups = [];
        const branchStructures = [];

        groups.forEach((group, order) => {
            const first = group?.members?.[0] || group;
            if (!first) return;
            if (first.type === 'stem') {
                stemGroups.push(group);
                return;
            }
            if (first.code === baziRelationCodes.SAN_HE_PARTIAL || first.code === baziRelationCodes.SAN_HUI_PARTIAL) {
                branchStructures.push({
                    first,
                    descriptor: `${structureName(first)}组合【${(first.branches || []).join('')}】`,
                    action: first.action || '',
                    order
                });
                return;
            }
            branchDirectGroups.push(group);
        });

        return {
            stem: normalizeDirectInteractionFacts(stemGroups, 'stem'),
            branch: {
                direct: normalizeDirectInteractionFacts(branchDirectGroups, 'branch'),
                structures: branchStructures.sort((a, b) => a.order - b.order)
            }
        };
    };

    const explainInteractionFacts = (facts, targetLabel = '') => {
        const sentences = [];

        if (facts?.stem?.length) {
            const firstStem = facts.stem.find((entry) => !entry.loose && entry.targetValue);
            const targetGan = firstStem?.targetValue || '';
            const actions = facts.stem.map((entry) => {
                if (entry.loose) {
                    const first = entry.group?.members?.[0] || entry.group;
                    return entry.group?.text || first?.text || '';
                }
                const positions = joinPositionNames(entry.indices.map((index) => stemNames[index]));
                const relationText = entry.labels.join('、');
                const repeated = entry.indices.length > 1;
                return `与${positions}【${entry.originalValue}】${repeated ? '均' : ''}见${relationText}`;
            }).filter(Boolean);
            if (actions.length) sentences.push(`${targetLabel}干【${targetGan}】${actions.join('，')}`);
        }

        const branchFacts = facts?.branch;
        if (branchFacts && (branchFacts.direct.length || branchFacts.structures.length)) {
            const firstDirect = branchFacts.direct.find((entry) => !entry.loose && entry.targetValue);
            const firstStructure = branchFacts.structures.find((entry) => entry.first?.targetZhi);
            const targetZhi = firstDirect?.targetValue || firstStructure?.first?.targetZhi || '';

            const retriggerStructures = branchFacts.structures
                .filter((entry) => entry.action === 'retrigger')
                .map((entry) => entry.descriptor);
            const formedStructures = branchFacts.structures
                .filter((entry) => entry.action === 'formed-by-external')
                .map((entry) => entry.descriptor);
            const otherStructures = branchFacts.structures
                .filter((entry) => entry.action !== 'retrigger' && entry.action !== 'formed-by-external')
                .map((entry) => entry.descriptor);

            const directActions = branchFacts.direct.map((entry) => {
                if (entry.loose) {
                    const first = entry.group?.members?.[0] || entry.group;
                    return entry.group?.text || first?.text || '';
                }
                const positions = joinPositionNames(entry.indices.map((index) => branchNames[index]));
                const relationText = entry.labels.join('、');
                const repeated = entry.indices.length > 1;
                if (entry.selfPunishment) {
                    return `与${positions}同为【${targetZhi || entry.originalValue}】，${repeated ? '均' : ''}见自刑`;
                }
                return `与${positions}【${entry.originalValue}】${repeated ? '均' : ''}见${relationText}`;
            }).filter(Boolean);

            const structureActions = [];
            if (retriggerStructures.length) structureActions.push(`参与原局${retriggerStructures.join('、')}`);
            if (formedStructures.length) structureActions.push(`与原局支位形成${formedStructures.join('、')}`);
            if (otherStructures.length) structureActions.push(otherStructures.join('、'));

            let actionText = '';
            if (structureActions.length && directActions.length) {
                actionText = `${structureActions.join('，')}，并${directActions.join('，')}`;
            } else {
                actionText = [...structureActions, ...directActions].join('，');
            }
            if (actionText) sentences.push(`${targetLabel}支【${targetZhi}】${actionText}`);
        }

        return sentences;
    };

    const explainInteractionGroups = (groups = [], targetLabel = '') => {
        if (!groups.length) return [];
        return explainInteractionFacts(normalizeInteractionFacts(groups), targetLabel);
    };

    const structureSignature = (relation) => {
        if (!relation) return '';
        if (completeCodes.has(relation.code)) return `${relation.code}|${[...(relation.branches || [])].sort().join('')}`;
        if (relation.code === baziRelationCodes.SELF_PUNISHMENT) return `${relation.code}|${(relation.branches || [relation.targetZhi]).filter(Boolean).join('')}`;
        return '';
    };

    const buildOriginalExplanations = (item, targetLabel, excludeRelations = []) => {
        if (!item) return { structure: [], direct: [], groups: [] };
        const pillarSignals = item.pillarSignals || [];
        const secondary = [...(item.relations || []), ...(item.stemRelations || [])]
            .filter((relation) => !coveredByPillarSignal(relation, pillarSignals));
        const groups = compactRelationGroups([...pillarSignals, ...secondary], targetLabel)
            .sort((a, b) => (b.score ?? relationPriority(b)) - (a.score ?? relationPriority(a)) || (a.groupIndex || 0) - (b.groupIndex || 0));

        // 只有完整结构与整柱关系单独成句；半合、同方及普通干支关系合并到当前时间层主语下，
        // 避免同一“流年支/流月支”在连续句子中反复出现。
        const structureGroups = groups.filter((group) => {
            const first = group.members?.[0] || group;
            if (shouldExcludeStructure(first, excludeRelations)) return false;
            return completeCodes.has(first.code) || strongTransitCodes.has(first.code);
        });
        const interactionGroups = groups.filter((group) => {
            const first = group.members?.[0] || group;
            if (shouldExcludeStructure(first, excludeRelations)) return false;
            return !(completeCodes.has(first.code) || strongTransitCodes.has(first.code));
        });

        return {
            structure: structureGroups.slice(0, 3).map((group) => explainStructureGroup(group, targetLabel)).filter(Boolean),
            direct: explainInteractionGroups(interactionGroups.slice(0, 6), targetLabel),
            groups
        };
    };

    const explainPairGroup = (group, itemA, itemB) => {
        const first = group?.members?.[0] || group;
        if (!first) return '';
        const [labelA = '前层', labelB = '后层'] = first.layerLabels || [];
        const labels = [...new Set((group.members || [first]).map(relationLabel))];
        const shiShen = itemB?.shiShen || itemA?.shiShen || '';

        if (first.code === baziTransitRelationCodes.LAYER_SAME_GANZHI) {
            const gz = `${(first.stems || [])[0] || ''}${(first.branches || [])[0] || ''}`;
            return `${labelB}【${gz}】与${labelA}【${gz}】并临，同一组干支在两个时间层重复`;
        }
        if (first.code === baziTransitRelationCodes.LAYER_HEAVEN_EARTH_CLASH) {
            const a = `${(first.stems || [])[0] || ''}${(first.branches || [])[0] || ''}`;
            const b = `${(first.stems || [])[1] || ''}${(first.branches || [])[1] || ''}`;
            return `${labelB}【${b}】与${labelA}【${a}】天克地冲，干支两层同时相冲`;
        }
        if (first.code === baziTransitRelationCodes.LAYER_HEAVEN_EARTH_HARMONY) {
            const a = `${(first.stems || [])[0] || ''}${(first.branches || [])[0] || ''}`;
            const b = `${(first.stems || [])[1] || ''}${(first.branches || [])[1] || ''}`;
            return `${labelB}【${b}】与${labelA}【${a}】天合地合，干支两层同时相合`;
        }
        if (first.code === baziTransitRelationCodes.STEM_SAME) {
            const gan = (first.stems || [])[0] || itemB?.gan || '';
            return `${labelB}干与${labelA}干同为【${gan}】，同一天干在两个时间层重复`;
        }
        if (first.code === baziTransitRelationCodes.BRANCH_SAME) {
            const zhi = (first.branches || [])[0] || itemB?.zhi || '';
            return `${labelB}支与${labelA}支同为【${zhi}】，地支在两个时间层重复`;
        }
        if (first.code === baziRelationCodes.SELF_PUNISHMENT && first.action === 'layer-self-punishment') {
            const zhi = (first.branches || [])[0] || itemB?.zhi || '';
            return `${labelB}支与${labelA}支同为【${zhi}】，并见${zhi}${zhi}自刑`;
        }
        if (labels.length > 1 && first.type !== 'stem') {
            const [za = '', zb = ''] = first.branches || [];
            return `${labelB}支【${zb}】与${labelA}支【${za}】同时见${labels.join('、')}，多种关系并存`;
        }
        if (first.type === 'stem') {
            const [ga = '', gb = ''] = first.stems || [];
            return `${labelB}干【${gb}】与${labelA}干【${ga}】见${labels[0]}`;
        }
        const [za = '', zb = ''] = first.branches || [];
        return `${labelB}支【${zb}】与${labelA}支【${za}】见${labels[0]}`;
    };

    const buildPairExplanations = (relations, itemA, itemB, skipCodes = new Set()) => compactRelationGroups(relations || [])
        .filter((group) => !group.members.every((member) => skipCodes.has(member.code)))
        .sort((a, b) => (b.score ?? relationPriority(b)) - (a.score ?? relationPriority(a)) || (a.groupIndex || 0) - (b.groupIndex || 0))
        .slice(0, 3)
        .map((group) => explainPairGroup(group, itemA, itemB))
        .filter(Boolean);

    const explainLayeredRelation = (relation, daYun, liuNian, liuYue = null) => {
        if (!relation) return '';
        const name = structureName(relation);
        const branches = (relation.branches || []).join('');
        if (relation.action === 'complete-by-three-layers') {
            return `流年支【${liuNian?.zhi || ''}】与大运支【${daYun?.zhi || ''}】共同加入后，补齐${name}【${branches}】`;
        }
        if (relation.code === baziRelationCodes.SELF_PUNISHMENT && relation.action === 'complete-by-liuyue') {
            const zhi = liuYue?.zhi || relation.targetZhi || (relation.branches || [])[0] || '';
            return `流月支【${zhi}】加入后，形成${zhi}${zhi}自刑`;
        }
        if (relation.code === baziRelationCodes.SELF_PUNISHMENT && relation.action === 'retrigger-by-liuyue') {
            const zhi = liuYue?.zhi || relation.targetZhi || (relation.branches || [])[0] || '';
            return `流月支【${zhi}】再次参与前三层已有的${zhi}${zhi}自刑`;
        }
        if (relation.action === 'complete-by-liuyue') {
            return `流月支【${liuYue?.zhi || ''}】加入后，补齐${name}【${branches}】`;
        }
        if (relation.action === 'retrigger-by-liuyue') {
            return `流月支【${liuYue?.zhi || relation.targetZhi || ''}】再次参与前三层已成的${name}【${branches}】`;
        }
        return relation.text || '';
    };

    const buildLayeredExplanations = (relations, daYun, liuNian, liuYue = null) => {
        const selected = prioritize(relations || [], 3);
        if (!selected.length) return [];

        if (liuYue) {
            const retriggered = selected.filter((relation) => relation.action === 'retrigger-by-liuyue' && completeCodes.has(relation.code));
            const completed = selected.filter((relation) => relation.action === 'complete-by-liuyue' && completeCodes.has(relation.code));
            const consumed = new Set([...retriggered, ...completed]);
            const texts = [];

            if (retriggered.length) {
                texts.push(`流月支【${liuYue.zhi || ''}】再次参与前三层已成的${retriggered.map((relation) => `${structureName(relation)}【${(relation.branches || []).join('')}】`).join('、')}`);
            }
            if (completed.length) {
                texts.push(`流月支【${liuYue.zhi || ''}】加入后，补齐${completed.map((relation) => `${structureName(relation)}【${(relation.branches || []).join('')}】`).join('、')}`);
            }
            selected.filter((relation) => !consumed.has(relation))
                .map((relation) => explainLayeredRelation(relation, daYun, liuNian, liuYue))
                .filter(Boolean)
                .forEach((item) => texts.push(item));
            return texts;
        }

        return selected
            .map((relation) => explainLayeredRelation(relation, daYun, liuNian, liuYue))
            .filter(Boolean);
    };

    const buildThreeLayerContinuity = (daYun, liuNian, liuYue) => {
        const texts = [];
        const themeHints = [];
        const skipCodes = new Set();
        if (daYun?.gan && daYun.gan === liuNian?.gan && liuNian.gan === liuYue?.gan) {
            const shiShen = liuYue.shiShen || liuNian.shiShen || daYun.shiShen || '';
            texts.push(`流月干与流年、大运干同为【${liuYue.gan}】，同一天干连续出现在三个时间层`);
            if (shiShen) themeHints.push(`大运、流年、流月同见【${shiShen}】，可继续观察这一十神主题在流月层的延续`);
            skipCodes.add(baziTransitRelationCodes.STEM_SAME);
        }
        if (daYun?.zhi && daYun.zhi === liuNian?.zhi && liuNian.zhi === liuYue?.zhi) {
            texts.push(`流月支与流年、大运支同为【${liuYue.zhi}】，同一地支连续出现在三个时间层`);
            skipCodes.add(baziTransitRelationCodes.BRANCH_SAME);
        }
        return { texts, themeHints, skipCodes };
    };

    const buildSameStemThemeHints = (relations = [], itemA, itemB, skipCodes = new Set()) => compactRelationGroups(relations || [])
        .filter((group) => group.members.some((member) => member.code === baziTransitRelationCodes.STEM_SAME && !skipCodes.has(member.code)))
        .map((group) => {
            const first = group.members.find((member) => member.code === baziTransitRelationCodes.STEM_SAME) || group.members[0];
            const [labelA = '前层', labelB = '后层'] = first.layerLabels || [];
            const gan = (first.stems || [])[0] || itemB?.gan || itemA?.gan || '';
            const shiShen = itemB?.shiShen || itemA?.shiShen || '';
            return shiShen
                ? `${labelB}干与${labelA}干同为【${gan}】，可继续观察【${shiShen}】主题在${labelB}层的延续`
                : `${labelB}干与${labelA}干同为【${gan}】，可作为层间主题延续的观察入口`;
        });

    const buildDaYunAnalysis = (result, daYun) => {
        if (!result || !daYun) return null;
        const original = buildOriginalTrigger(daYun, '大运');
        const explanations = buildOriginalExplanations(daYun, '大运');
        const rows = [
            {
                label: '长期背景',
                text: `${buildThemeSentence(daYun)}。`
            }
        ];
        if (explanations.structure.length) rows.push({ label: '结构变化', text: joinNarratives(explanations.structure) });
        if (explanations.direct.length) rows.push({ label: '关系落点', text: joinNarratives(explanations.direct) });
        return {
            level: 'dayun',
            headline: `${daYun.gan}${daYun.zhi}大运的十年背景。`,
            rows,
            keyRelations: original.relations,
            evidenceGroups: [evidenceGroup('与原局', originalEvidenceItems(daYun, '大运', result))].filter(Boolean)
        };
    };

    const segmentRangePhrase = (segment, total = 1) => {
        if (!segment) return '';
        const start = segment.startDateTimeText || '';
        const end = segment.endDateTimeText || '';
        if (total > 1) return `${start} 起，至 ${end} 前`;
        return start && end ? `${start} 起，至 ${end} 前` : '';
    };

    const segmentDaYunName = (segment) => segment?.daYun ? `【${segment.daYun.gan}${segment.daYun.zhi}】大运` : '起运前';

    const buildDaYunSegmentSentence = (segments = []) => segments.map((segment) => {
        const range = segmentRangePhrase(segment, segments.length);
        return `${range ? `${range}，` : ''}${segmentDaYunName(segment)}`;
    }).join('；');

    const segmentScopedEvidenceItems = (items = [], segment, totalSegments = 1) => {
        const range = segmentRangePhrase(segment, totalSegments);
        if (!range) return items;
        return items.map((item) => ({
            ...item,
            validity: range,
            parts: [
                '分段关系',
                item.object,
                item.values,
                item.relation,
                item.formation,
                `适用：${range}`
            ].filter(Boolean)
        }));
    };

    const buildSegmentedYearRelations = (result, segments = [], liuNian) => {
        const texts = [];
        const evidenceGroups = [];
        const keyGroups = [];
        segments.forEach((segment) => {
            if (!segment?.daYun) return;
            const pair = buildPairExplanations(segment.yunRelations || [], segment.daYun, liuNian);
            const layered = buildLayeredExplanations(segment.layeredRelations || [], segment.daYun, liuNian);
            const prefix = `${segment.startDateTimeText} 起的【${segment.daYun.gan}${segment.daYun.zhi}】阶段`;
            const parts = [...pair, ...layered];
            if (parts.length) texts.push(`${prefix}，${joinNarratives(parts)}`);
            const evidence = segmentScopedEvidenceItems([
                ...pairEvidenceItems(segment.yunRelations || []),
                ...layeredEvidenceItems(segment.layeredRelations || [], result, segment.daYun, liuNian)
            ], segment, segments.length);
            if (evidence.length) evidenceGroups.push(evidenceGroup(`${segment.daYun.gan}${segment.daYun.zhi}阶段`, evidence));
            keyGroups.push(...compactRelationGroups(segment.yunRelations || []), ...compactRelationGroups(segment.layeredRelations || []));
        });
        return { texts, evidenceGroups: evidenceGroups.filter(Boolean), keyGroups };
    };

    const buildLiuNianAnalysis = (result, daYun, liuNian) => {
        if (!result || !liuNian) return null;
        const original = buildOriginalTrigger(liuNian, '流年');
        const originalExplanations = buildOriginalExplanations(liuNian, '流年');
        const hasResolvedSegments = Array.isArray(liuNian.daYunSegments) && liuNian.daYunSegments.length > 0;
        const segments = hasResolvedSegments
            ? liuNian.daYunSegments
            : [{ daYun, yunRelations: liuNian.yunRelations || [], layeredRelations: liuNian.layeredRelations || [], startDateTimeText: '', endDateTimeText: '' }];
        const transition = segments.length > 1;
        const singleDaYun = !transition ? (hasResolvedSegments ? (segments[0]?.daYun || null) : daYun) : null;
        const preYunOnly = !transition && hasResolvedSegments && !segments[0]?.daYun;
        const rows = [
            {
                label: '年度主题',
                text: `${buildThemeSentence(liuNian)}；地支【${liuNian.zhi}】十二长生为“${liuNian.diShi}”。`
            }
        ];
        let keyGroups = [];
        const evidenceGroups = [];

        if (transition) {
            rows.push({ label: '交运分段', text: `${buildDaYunSegmentSentence(segments)}。` });
            const segmented = buildSegmentedYearRelations(result, segments, liuNian);
            if (segmented.texts.length) rows.push({ label: '分段关系', text: segmented.texts.join('；') });
            keyGroups.push(...segmented.keyGroups);
            evidenceGroups.push(...segmented.evidenceGroups);
        } else if (singleDaYun) {
            const pairExplanations = buildPairExplanations(liuNian.yunRelations || [], singleDaYun, liuNian);
            const layeredExplanations = buildLayeredExplanations(liuNian.layeredRelations || [], singleDaYun, liuNian);
            if (pairExplanations.length) rows.push({ label: '岁运衔接', text: joinNarratives(pairExplanations) });
            if (layeredExplanations.length) rows.push({ label: '共同结构', text: joinNarratives(layeredExplanations) });
            keyGroups.push(...compactRelationGroups(liuNian.layeredRelations || []), ...compactRelationGroups(liuNian.yunRelations || []));
            const pairEvidence = pairEvidenceItems(liuNian.yunRelations || []);
            const layerEvidence = layeredEvidenceItems(liuNian.layeredRelations || [], result, singleDaYun, liuNian);
            if (pairEvidence.length) evidenceGroups.push(evidenceGroup('与大运', pairEvidence));
            if (layerEvidence.length) evidenceGroups.push(evidenceGroup('多层结构', layerEvidence));
        }

        const originalTexts = [...originalExplanations.structure, ...originalExplanations.direct];
        if (originalTexts.length) rows.push({ label: '原局作用', text: joinNarratives(originalTexts) });
        const originalEvidence = originalEvidenceItems(liuNian, '流年', result);
        if (originalEvidence.length) evidenceGroups.push(evidenceGroup('与原局', originalEvidence));

        let headline = `${liuNian.year}年【${liuNian.gan}${liuNian.zhi}】`;
        if (transition) headline += '跨越大运交接。';
        else if (singleDaYun) headline += `处于【${singleDaYun.gan}${singleDaYun.zhi}】大运。`;
        else if (preYunOnly) headline += '处于起运前阶段。';
        else headline += '未解析到对应大运。';

        return {
            level: 'liunian',
            headline,
            rows,
            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),
            evidenceGroups: evidenceGroups.filter(Boolean)
        };
    };

    const structureIdentity = (relation) => `${relation?.code || ''}|${[...(relation?.branches || [])].sort().join('')}`;

    const buildSegmentedMonthRelations = (result, segments = [], liuNian, liuYue, baseLayeredRelations = []) => {
        const texts = [];
        const layeredTexts = [];
        const evidenceGroups = [];
        const keyGroups = [];
        segments.forEach((segment) => {
            if (!segment?.daYun) return;
            const continuity = buildThreeLayerContinuity(segment.daYun, liuNian, liuYue);
            const yunPair = buildPairExplanations(segment.yunRelations || [], segment.daYun, liuYue, continuity.skipCodes);
            const localTexts = [...continuity.texts, ...yunPair];
            const prefix = `${segment.startDateTimeText} 起的【${segment.daYun.gan}${segment.daYun.zhi}】阶段`;
            if (localTexts.length) texts.push(`${prefix}，${joinNarratives(localTexts)}`);
            const baseKeys = new Set((baseLayeredRelations || []).map(structureIdentity));
            const segmentSpecificLayered = (segment.layeredRelations || []).filter((relation) => !baseKeys.has(structureIdentity(relation)));
            const layered = buildLayeredExplanations(segmentSpecificLayered, segment.daYun, liuNian, liuYue);
            if (layered.length) layeredTexts.push(`${prefix}，${joinNarratives(layered)}`);
            const pairEvidence = pairEvidenceItems(segment.yunRelations || []);
            const layerEvidence = layeredEvidenceItems(segmentSpecificLayered, result, segment.daYun, liuNian, liuYue);
            if (pairEvidence.length || layerEvidence.length) evidenceGroups.push(evidenceGroup(`${segment.daYun.gan}${segment.daYun.zhi}阶段`, [...pairEvidence, ...layerEvidence]));
            keyGroups.push(...compactRelationGroups(segment.yunRelations || []), ...compactRelationGroups(segmentSpecificLayered));
        });
        return { texts, layeredTexts, evidenceGroups: evidenceGroups.filter(Boolean), keyGroups };
    };

    const buildLiuYueAnalysis = (result, daYun, liuNian, liuYue) => {
        if (!result || !liuNian || !liuYue) return null;
        const dayElement = result.dayGanWuXing || core.getWuXing(result.dayGan);
        const season = buildMonthSeason(liuYue.zhi, dayElement);
        const dayState = season.states.find((item) => item.isDayMaster)?.status || '—';
        const rows = [
            {
                label: '节令背景',
                text: `${liuYue.zhi}月属${season.season}，日主${dayElement}在此月令为“${dayState}”。`
            }
        ];
        const hasResolvedSegments = Array.isArray(liuYue.daYunSegments) && liuYue.daYunSegments.length > 0;
        const segments = hasResolvedSegments
            ? liuYue.daYunSegments
            : [{ daYun, yunRelations: liuYue.yunRelations || [], layeredRelations: liuYue.layeredRelations || [], startDateTimeText: '', endDateTimeText: '' }];
        const transition = segments.length > 1;
        const singleDaYun = !transition ? (hasResolvedSegments ? (segments[0]?.daYun || null) : daYun) : null;
        const preYunOnly = !transition && hasResolvedSegments && !segments[0]?.daYun;
        const yearPair = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue);
        const contextHints = buildSameStemThemeHints(liuYue.yearRelations || [], liuNian, liuYue);
        const evidenceGroups = [];
        let keyGroups = [...compactRelationGroups(liuYue.yearRelations || [])];
        let layeredStructuresForOriginal = [];
        const baseLayeredRelations = liuYue.baseLayeredRelations || (preYunOnly ? (liuYue.layeredRelations || []) : []);

        if (transition) {
            rows.push({ label: '交运分段', text: `${buildDaYunSegmentSentence(segments)}。` });
            if (yearPair.length) rows.push({ label: '岁月关系', text: joinNarratives(yearPair) });
            const baseLayeredExplanations = buildLayeredExplanations(baseLayeredRelations, null, liuNian, liuYue);
            if (baseLayeredExplanations.length) rows.push({ label: '结构变化', text: joinNarratives(baseLayeredExplanations) });
            const baseLayerEvidence = layeredEvidenceItems(baseLayeredRelations, result, null, liuNian, liuYue);
            if (baseLayerEvidence.length) evidenceGroups.push(evidenceGroup('流年与流月结构', baseLayerEvidence));
            keyGroups.push(...compactRelationGroups(baseLayeredRelations));
            const segmented = buildSegmentedMonthRelations(result, segments, liuNian, liuYue, baseLayeredRelations);
            if (segmented.texts.length) rows.push({ label: '分段衔接', text: segmented.texts.join('；') });
            if (segmented.layeredTexts.length) rows.push({ label: '分段结构', text: segmented.layeredTexts.join('；') });
            evidenceGroups.push(...segmented.evidenceGroups);
            keyGroups.push(...segmented.keyGroups);
            layeredStructuresForOriginal = [...baseLayeredRelations, ...segments.flatMap((segment) => segment.layeredRelations || [])];
        } else if (singleDaYun) {
            const continuity = buildThreeLayerContinuity(singleDaYun, liuNian, liuYue);
            contextHints.push(...continuity.themeHints);
            contextHints.push(...buildSameStemThemeHints(liuYue.yunRelations || [], singleDaYun, liuYue, continuity.skipCodes));
            const yearPairFiltered = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue, continuity.skipCodes);
            const yunPair = buildPairExplanations(liuYue.yunRelations || [], singleDaYun, liuYue, continuity.skipCodes);
            const pairExplanations = [...continuity.texts, ...yearPairFiltered, ...yunPair];
            if (pairExplanations.length) rows.push({ label: '层间衔接', text: joinNarratives(pairExplanations) });
            const layeredExplanations = buildLayeredExplanations(liuYue.layeredRelations || [], singleDaYun, liuNian, liuYue);
            if (layeredExplanations.length) rows.push({ label: '结构变化', text: joinNarratives(layeredExplanations) });
            const yunEvidence = pairEvidenceItems(liuYue.yunRelations || []);
            const layeredEvidence = layeredEvidenceItems(liuYue.layeredRelations || [], result, singleDaYun, liuNian, liuYue);
            if (yunEvidence.length) evidenceGroups.push(evidenceGroup('与大运', yunEvidence));
            if (layeredEvidence.length) evidenceGroups.push(evidenceGroup('多层结构', layeredEvidence));
            keyGroups.push(...compactRelationGroups(liuYue.yunRelations || []), ...compactRelationGroups(liuYue.layeredRelations || []));
            layeredStructuresForOriginal = liuYue.layeredRelations || [];
        } else if (preYunOnly) {
            if (yearPair.length) rows.push({ label: '岁月关系', text: joinNarratives(yearPair) });
            const layeredExplanations = buildLayeredExplanations(baseLayeredRelations, null, liuNian, liuYue);
            if (layeredExplanations.length) rows.push({ label: '结构变化', text: joinNarratives(layeredExplanations) });
            const layeredEvidence = layeredEvidenceItems(baseLayeredRelations, result, null, liuNian, liuYue);
            if (layeredEvidence.length) evidenceGroups.push(evidenceGroup('流年与流月结构', layeredEvidence));
            keyGroups.push(...compactRelationGroups(baseLayeredRelations));
            layeredStructuresForOriginal = baseLayeredRelations;
        } else if (yearPair.length) {
            rows.push({ label: '岁月关系', text: joinNarratives(yearPair) });
        }

        const original = buildOriginalTrigger(liuYue, '流月');
        const originalExplanations = buildOriginalExplanations(liuYue, '流月', layeredStructuresForOriginal);
        const originalTexts = [...originalExplanations.structure, ...originalExplanations.direct];
        if (originalTexts.length) rows.push({ label: '原局作用', text: joinNarratives(originalTexts) });
        const yearEvidence = pairEvidenceItems(liuYue.yearRelations || []);
        if (yearEvidence.length) evidenceGroups.unshift(evidenceGroup('与流年', yearEvidence));
        const originalEvidence = originalEvidenceItems(liuYue, '流月', result, layeredStructuresForOriginal);
        if (originalEvidence.length) evidenceGroups.push(evidenceGroup('与原局', originalEvidence));

        let headline = `${liuYue.monthName}月【${liuYue.gan}${liuYue.zhi}】进入${liuNian.year}年`;
        if (transition) headline += '，本月跨越大运交接。';
        else if (singleDaYun) headline += `，处于【${singleDaYun.gan}${singleDaYun.zhi}】大运。`;
        else if (preYunOnly) headline += '，处于起运前阶段。';
        else headline += '，未解析到对应大运。';

        return {
            level: 'liuyue',
            headline,
            rows,
            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),
            season,
            contextHints: [...new Set(contextHints.filter(Boolean))].map((text) => ({ label: '层间主题', text: `${text}。` })),
            evidenceGroups: evidenceGroups.filter(Boolean)
        };
    };


    const transitHintLabels = new Set(['长期背景', '年度主题']);

    const appendTransitRowsContext = (lines, item, rows = [], indent = '', extraHints = []) => {
        const hints = [...rows.filter((row) => transitHintLabels.has(row.label)), ...extraHints];
        const facts = rows.filter((row) => !transitHintLabels.has(row.label));
        if (hints.length) {
            lines.push(`${indent}解释提示：`);
            hints.forEach((row) => {
                const text = row.label === '年度主题' ? `${buildThemeSentence(item)}。` : row.text;
                lines.push(`${indent}- ${row.label}：${text}`);
            });
        }
        if (facts.length) {
            if (hints.length) lines.push('');
            lines.push(`${indent}结构事实：`);
            facts.forEach((row) => lines.push(`${indent}- ${row.label}：${row.text}`));
        }
    };

    const appendTransitAnalysisContext = (lines, title, item, analysis, metaLines = []) => {
        if (!item || !analysis) return;
        lines.push('', `【${title}】`);
        metaLines.filter(Boolean).forEach((line) => lines.push(line));
        if (analysis.headline) lines.push(`概述：${analysis.headline}`);
        appendTransitRowsContext(lines, item, analysis.rows || [], '', analysis.contextHints || []);
        if (analysis.evidenceGroups?.length) {
            lines.push('', '结构证据：');
            analysis.evidenceGroups.forEach((group) => {
                (group.items || []).forEach((evidence) => {
                    const parts = evidence.parts?.length
                        ? evidence.parts
                        : [group.label, evidence.object, evidence.values, evidence.relation, evidence.formation].filter(Boolean);
                    lines.push(`- ${parts.join('｜')}`);
                });
            });
        }
    };

    const daYunContextMeta = (daYun) => [
        `大运：${daYun ? `${daYun.gan}${daYun.zhi} · ${daYun.shiShen || '—'}运` : '—'}`,
        daYun?.startDateTimeText && daYun?.endDateTimeText
            ? `区间：${daYun.startDateTimeText} 起，至 ${daYun.endDateTimeText} 前${daYun.startAge != null && daYun.endAge != null ? ` · 虚岁${daYun.startAge}—${daYun.endAge}` : ''}`
            : (daYun?.startYear != null && daYun?.endYear != null ? `范围：${daYun.startYear}—${daYun.endYear}${daYun.startAge != null && daYun.endAge != null ? ` · 虚岁${daYun.startAge}—${daYun.endAge}` : ''}` : ''),
        daYun ? `十二长生：${daYun.diShi || '—'}；纳音：${daYun.naYin || '—'}；${daYun.xun || '旬次未列'}${daYun.xunKong ? ` · 空${daYun.xunKong}` : ''}` : ''
    ];

    const appendDaYunTransitionContext = (lines, result, segments = []) => {
        lines.push('', '【大运交接】');
        segments.forEach((segment) => {
            const range = `${segment.startDateTimeText || '—'} 起，至 ${segment.endDateTimeText || '—'} 前`;
            if (!segment.daYun) {
                lines.push(`- ${range}：起运前`);
                return;
            }
            lines.push(`- ${range}：【${segment.daYun.gan}${segment.daYun.zhi}】大运 · ${segment.daYun.shiShen || '—'}运`);
            const analysis = buildDaYunAnalysis(result, segment.daYun);
            appendTransitRowsContext(lines, segment.daYun, analysis?.rows || [], '  ', analysis?.contextHints || []);
        });
    };

    const buildBaziTransitContextText = (result, interpretation, selection = {}) => {
        if (!result) return '';
        const {
            daYun = null,
            liuNian = null,
            liuYue = null,
            daYunAnalysis = null,
            liuNianAnalysis = null,
            liuYueAnalysis = null
        } = selection || {};
        const chart = (result.pillars || []).map((item) => item.ganZhi || `${item.gan || ''}${item.zhi || ''}`).join(' ');
        const lines = [
            '【龟甲 · 岁运分析上下文】',
            `四柱：${chart || '—'}`,
            `日主：${result.dayGan || '—'}${result.dayGanWuXing || ''}`,
            `月令：${result.monthSeason?.monthZhi || '—'}月 · ${result.monthSeason?.season || '—'}`,
            `农历：${result.lunarStr || '—'}`,
            `排盘口径：${result.ruleSummary || '—'}`
        ];

        lines.push('', '【原局结构摘要】');
        if (interpretation?.headline) lines.push(interpretation.headline);
        if (interpretation?.judgments?.length) {
            interpretation.judgments.forEach((item, index) => {
                lines.push(`${index + 1}. ${item.title}：${item.summary}`);
            });
        }
        if (result.internalRelations?.length) {
            lines.push('', '原局关系：');
            result.internalRelations.forEach((item) => lines.push(`- ${item.text}`));
        }

        const actualSegments = (liuYue?.daYunSegments?.length ? liuYue.daYunSegments : liuNian?.daYunSegments) || [];
        if (actualSegments.length === 1) {
            if (actualSegments[0]?.daYun) {
                const actualDaYun = actualSegments[0].daYun;
                appendTransitAnalysisContext(lines, '当前大运', actualDaYun, buildDaYunAnalysis(result, actualDaYun), daYunContextMeta(actualDaYun));
            } else {
                const upcomingDaYun = (liuNian?.daYunSegments || []).find((segment) => segment?.daYun)?.daYun || daYun || null;
                lines.push('', '【当前大运阶段】');
                lines.push('状态：起运前');
                if (upcomingDaYun?.startDateTimeText) lines.push(`起运时刻：${upcomingDaYun.startDateTimeText}`);
                if (upcomingDaYun) lines.push(`下一步大运：${upcomingDaYun.gan}${upcomingDaYun.zhi} · ${upcomingDaYun.shiShen || '—'}运`);
            }
        } else if (actualSegments.length > 1) {
            appendDaYunTransitionContext(lines, result, actualSegments);
        } else {
            appendTransitAnalysisContext(lines, '当前大运', daYun, daYunAnalysis, daYunContextMeta(daYun));
        }

        appendTransitAnalysisContext(lines, '当前流年', liuNian, liuNianAnalysis, [
            liuNian ? `流年：${liuNian.year || '—'}年 · ${liuNian.gan}${liuNian.zhi} · ${liuNian.shiShen || '—'}${liuNian.age != null ? ` · 虚岁${liuNian.age}` : ''}` : '',
            liuNian?.yearRangeText ? `流年区间：${liuNian.yearRangeText}` : '',
            liuNian?.isTransitionYear ? `交运：本流年跨越大运交接，按精确交运时刻分段。` : '',
            liuNian ? `十二长生：${liuNian.diShi || '—'}；纳音：${liuNian.naYin || '—'}；${liuNian.xun || '旬次未列'}${liuNian.xunKong ? ` · 空${liuNian.xunKong}` : ''}` : ''
        ]);

        appendTransitAnalysisContext(lines, '当前流月', liuYue, liuYueAnalysis, [
            liuYue ? `流月：${liuYue.monthName || '—'}月 · ${liuYue.gan}${liuYue.zhi} · ${liuYue.shiShen || '—'}` : '',
            liuYue?.rangeText ? `节令区间：${liuYue.rangeText}` : '',
            liuYue?.isTransitionMonth ? `交运：本流月跨越大运交接，按精确交运时刻分段。` : (liuYue?.effectiveDaYun ? `所在大运：${liuYue.effectiveDaYun.gan}${liuYue.effectiveDaYun.zhi}` : (liuYue?.daYunSegments?.length === 1 && !liuYue.daYunSegments[0]?.daYun ? '所在阶段：起运前' : '')),
            liuYue ? `十二长生：${liuYue.diShi || '—'}；纳音：${liuYue.naYin || '—'}；${liuYue.xun || '旬次未列'}${liuYue.xunKong ? ` · 空${liuYue.xunKong}` : ''}` : ''
        ]);

        lines.push('', '【使用要求】');
        lines.push('请基于以上原局与当前大运、流年、流月结构进行综合解释；优先说明各时间层对原局结构的延续、再次参与与新增关系，仅在结构事实明确标记为补齐时说明结构补齐；不要自行重排四柱或虚构未列出的干支关系。');
        return lines.join('\n');
    };


    GuiJia.baziTransitAnalysis = {
        relationPriority,
        prioritize,
        compactRelationGroups,
        normalizeDirectInteractionFacts,
        normalizeInteractionFacts,
        buildDaYunAnalysis,
        buildLiuNianAnalysis,
        buildLiuYueAnalysis,
        buildBaziTransitContextText
    };
})(typeof window !== 'undefined' ? window : globalThis);
