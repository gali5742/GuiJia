from pathlib import Path

p = Path('js/bazi-transit-analysis.js')
text = p.read_text(encoding='utf-8')

old = """    const {\n        baziRelationCodes,\n        baziTransitRelationCodes,\n        buildMonthSeason\n    } = core;\n"""
new = """    const {\n        baziRelationCodes,\n        baziRelationMeta,\n        baziTransitRelationCodes,\n        buildMonthSeason,\n        scoreBaziRelation\n    } = core;\n"""
if text.count(old) != 1:
    raise SystemExit('core destructuring mismatch')
text = text.replace(old, new, 1)

old = """    const completeCodes = new Set([\n        baziRelationCodes.SAN_HUI_COMPLETE,\n        baziRelationCodes.SAN_HE_COMPLETE,\n        baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE\n    ]);\n"""
new = old + """\n    const referencableOriginalStructureCodes = new Set([\n        ...completeCodes,\n        baziRelationCodes.SAN_HE_PARTIAL,\n        baziRelationCodes.SAN_HUI_PARTIAL\n    ]);\n"""
if text.count(old) != 1:
    raise SystemExit('completeCodes block mismatch')
text = text.replace(old, new, 1)

marker = """    const isStructureGroup = (group) => {\n"""
if text.count(marker) != 1:
    raise SystemExit('structure helper insertion marker mismatch')
addition = r'''    const sameBranchSet = (a = [], b = []) => {
        const left = [...a].sort().join('');
        const right = [...b].sort().join('');
        return left === right;
    };

    const buildOriginalStructureCatalog = (result) => [...(result?.internalRelations || [])]
        .sort((a, b) => scoreBaziRelation(b) - scoreBaziRelation(a))
        .map((relation, index) => ({
            ...relation,
            id: `S${String(index + 1).padStart(2, '0')}`,
            structuralRole: baziRelationMeta?.[relation.code]?.structuralRole || 'coexistingRelation'
        }))
        .filter((relation) => referencableOriginalStructureCodes.has(relation.code))
        .map((relation) => ({
            ...relation,
            name: structureName(relation),
            branches: [...(relation.branches || [])]
        }));

    const relationMembersInsideStructure = (relation, structure, sourceZhi = '') => {
        const memberSet = new Set(structure?.branches || []);
        const hits = [];
        if (relation?.originalZhi && memberSet.has(relation.originalZhi)) hits.push(relation.originalZhi);
        (relation?.branches || []).forEach((zhi) => {
            if (zhi && zhi !== sourceZhi && memberSet.has(zhi)) hits.push(zhi);
        });
        return [...new Set(hits)];
    };

    const buildStructureReferences = (result, item, sourceLabel = '') => {
        if (!result || !item?.zhi) return [];
        const sourceZhi = item.zhi;
        const sourceGanZhi = `${item.gan || ''}${item.zhi || ''}`;
        const relations = uniqueByText(item.relations || []);
        const catalog = buildOriginalStructureCatalog(result);
        const references = [];

        catalog.forEach((structure) => {
            const retrigger = relations.find((relation) =>
                relation.action === 'retrigger'
                && relation.code === structure.code
                && sameBranchSet(relation.branches || [], structure.branches || [])
            );
            if (retrigger) {
                references.push({
                    sourceLayer: String(sourceLabel || '').toLowerCase(),
                    sourceLabel,
                    sourceGanZhi,
                    sourceZhi,
                    targetStructureId: structure.id,
                    targetStructureCode: structure.code,
                    targetStructureRole: structure.structuralRole,
                    targetStructureName: structure.name,
                    targetStructureBranches: [...structure.branches],
                    targetMembers: structure.branches.includes(sourceZhi) ? [sourceZhi] : [],
                    mode: 'retrigger',
                    relations: []
                });
                return;
            }

            const completion = relations.find((relation) =>
                relation.action === 'complete-by-external'
                && completeCodes.has(relation.code)
                && (structure.branches || []).every((zhi) => (relation.branches || []).includes(zhi))
                && (relation.branches || []).includes(sourceZhi)
            );
            if (completion) {
                references.push({
                    sourceLayer: String(sourceLabel || '').toLowerCase(),
                    sourceLabel,
                    sourceGanZhi,
                    sourceZhi,
                    targetStructureId: structure.id,
                    targetStructureCode: structure.code,
                    targetStructureRole: structure.structuralRole,
                    targetStructureName: structure.name,
                    targetStructureBranches: [...structure.branches],
                    targetMembers: [...structure.branches],
                    mode: 'complete',
                    relations: [],
                    completedStructure: {
                        code: completion.code,
                        name: structureName(completion),
                        branches: [...(completion.branches || [])]
                    }
                });
                return;
            }

            if (structure.structuralRole !== 'majorCompositeStructure') return;
            const details = [];
            relations.forEach((relation) => {
                if (relation.action === 'retrigger') return;
                const members = relationMembersInsideStructure(relation, structure, sourceZhi);
                members.forEach((member) => details.push({
                    member,
                    code: relation.code || '',
                    label: relationLabel(relation),
                    action: relation.action || '',
                    branches: [...(relation.branches || [])]
                }));
            });
            const seen = new Set();
            const uniqueDetails = details.filter((detail) => {
                const key = `${detail.member}|${detail.code}|${detail.label}|${detail.branches.join('')}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            if (!uniqueDetails.length) return;
            references.push({
                sourceLayer: String(sourceLabel || '').toLowerCase(),
                sourceLabel,
                sourceGanZhi,
                sourceZhi,
                targetStructureId: structure.id,
                targetStructureCode: structure.code,
                targetStructureRole: structure.structuralRole,
                targetStructureName: structure.name,
                targetStructureBranches: [...structure.branches],
                targetMembers: [...new Set(uniqueDetails.map((detail) => detail.member))],
                mode: 'touch',
                relations: uniqueDetails
            });
        });

        return references;
    };

    const formatStructureReference = (reference) => {
        if (!reference) return '';
        const role = reference.targetStructureRole === 'majorCompositeStructure' ? '原局主要组合' : '原局结构';
        const target = `${role} ${reference.targetStructureId} ${reference.targetStructureName}【${(reference.targetStructureBranches || []).join('')}】`;
        const source = `${reference.sourceLabel || '时间层'}支【${reference.sourceZhi || ''}】`;
        if (reference.mode === 'retrigger') return `${source}再次参与${target}`;
        if (reference.mode === 'complete' && reference.completedStructure) {
            return `${source}加入后，在${target}基础上补齐${reference.completedStructure.name}【${(reference.completedStructure.branches || []).join('')}】`;
        }
        if (reference.mode === 'touch') {
            const members = (reference.targetMembers || []).map((zhi) => `【${zhi}】`).join('、');
            const details = (reference.relations || []).map((detail) => {
                if (detail.code === baziRelationCodes.SAN_HE_PARTIAL || detail.code === baziRelationCodes.SAN_HUI_PARTIAL) {
                    return `与【${detail.member}】形成${detail.label}组合`;
                }
                if (completeCodes.has(detail.code)) {
                    return `以【${detail.member}】为成员形成${detail.label}【${(detail.branches || []).join('')}】`;
                }
                return `与【${detail.member}】见${detail.label}`;
            });
            return `${source}触及${target}中的${members}${details.length ? `：${details.join('，')}` : ''}`;
        }
        return '';
    };

    const contextRowsWithStructureReferences = (analysis) => {
        const rows = [...(analysis?.rows || [])];
        const visible = (analysis?.structureReferences || []).filter((reference) => reference.mode !== 'retrigger');
        const texts = visible.map(formatStructureReference).filter(Boolean);
        if (texts.length) rows.push({ label: '结构引用', text: joinNarratives(texts) });
        return rows;
    };

'''
text = text.replace(marker, addition + marker, 1)

old = """        return {\n            level: 'dayun',\n            headline: `${daYun.gan}${daYun.zhi}大运的十年背景。`,\n            rows,\n            keyRelations: original.relations,\n            evidenceGroups: [evidenceGroup('与原局', originalEvidenceItems(daYun, '大运', result))].filter(Boolean)\n        };\n"""
new = """        return {\n            level: 'dayun',\n            headline: `${daYun.gan}${daYun.zhi}大运的十年背景。`,\n            rows,\n            keyRelations: original.relations,\n            structureReferences: buildStructureReferences(result, daYun, '大运'),\n            evidenceGroups: [evidenceGroup('与原局', originalEvidenceItems(daYun, '大运', result))].filter(Boolean)\n        };\n"""
if text.count(old) != 1:
    raise SystemExit('dayun return mismatch')
text = text.replace(old, new, 1)

old = """        return {\n            level: 'liunian',\n            headline,\n            rows,\n            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),\n            evidenceGroups: evidenceGroups.filter(Boolean)\n        };\n"""
new = """        return {\n            level: 'liunian',\n            headline,\n            rows,\n            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),\n            structureReferences: buildStructureReferences(result, liuNian, '流年'),\n            evidenceGroups: evidenceGroups.filter(Boolean)\n        };\n"""
if text.count(old) != 1:
    raise SystemExit('liunian return mismatch')
text = text.replace(old, new, 1)

old = """        return {\n            level: 'liuyue',\n            headline,\n            rows,\n            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),\n            season,\n            contextHints: [...new Set(contextHints.filter(Boolean))].map((text) => ({ label: '层间主题', text: `${text}。` })),\n            evidenceGroups: evidenceGroups.filter(Boolean)\n        };\n"""
new = """        return {\n            level: 'liuyue',\n            headline,\n            rows,\n            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),\n            season,\n            contextHints: [...new Set(contextHints.filter(Boolean))].map((text) => ({ label: '层间主题', text: `${text}。` })),\n            structureReferences: buildStructureReferences(result, liuYue, '流月'),\n            evidenceGroups: evidenceGroups.filter(Boolean)\n        };\n"""
if text.count(old) != 1:
    raise SystemExit('liuyue return mismatch')
text = text.replace(old, new, 1)

old = """        if (analysis.headline) lines.push(`概述：${analysis.headline}`);\n        appendTransitRowsContext(lines, item, analysis.rows || [], '', analysis.contextHints || []);\n"""
new = """        if (analysis.headline) lines.push(`概述：${analysis.headline}`);\n        appendTransitRowsContext(lines, item, contextRowsWithStructureReferences(analysis), '', analysis.contextHints || []);\n"""
if text.count(old) != 1:
    raise SystemExit('appendTransitAnalysisContext mismatch')
text = text.replace(old, new, 1)

old = """            const analysis = buildDaYunAnalysis(result, segment.daYun);\n            appendTransitRowsContext(lines, segment.daYun, analysis?.rows || [], '  ', analysis?.contextHints || []);\n"""
new = """            const analysis = buildDaYunAnalysis(result, segment.daYun);\n            appendTransitRowsContext(lines, segment.daYun, contextRowsWithStructureReferences(analysis), '  ', analysis?.contextHints || []);\n"""
if text.count(old) != 1:
    raise SystemExit('transition context mismatch')
text = text.replace(old, new, 1)

old = """        if (result.internalRelations?.length) {\n            lines.push('', '原局关系：');\n            result.internalRelations.forEach((item) => lines.push(`- ${item.text}`));\n        }\n"""
new = """        const semanticStructures = interpretation?.semanticModel?.structures || [];\n        if (semanticStructures.length) {\n            lines.push('', '原局关系：');\n            semanticStructures.forEach((item) => lines.push(`- ${item.id}｜[${item.structuralRoleLabel || '并存关系'}] ${item.text}`));\n        } else if (result.internalRelations?.length) {\n            lines.push('', '原局关系：');\n            result.internalRelations.forEach((item) => lines.push(`- ${item.text}`));\n        }\n"""
if text.count(old) != 1:
    raise SystemExit('original relation context mismatch')
text = text.replace(old, new, 1)

old = """        normalizeInteractionFacts,\n        buildDaYunAnalysis,\n"""
new = """        normalizeInteractionFacts,\n        buildOriginalStructureCatalog,\n        buildStructureReferences,\n        buildDaYunAnalysis,\n"""
if text.count(old) != 1:
    raise SystemExit('export block mismatch')
text = text.replace(old, new, 1)

p.write_text(text, encoding='utf-8')

p = Path('tests/bazi-semantic-layer-tests.js')
text = p.read_text(encoding='utf-8')
marker = "\nconsole.log(`\\n${passed} passed, ${failed} failed`);"
if text.count(marker) != 1:
    raise SystemExit('semantic test insertion marker mismatch')
addition = r'''

test('岁运 StructureReference 把时间层关系挂回原局 Structure ID', () => {
    const result = makeResult();
    result.originalGans = ['丁','壬','丁','己'];
    result.originalZhis = ['丑','子','亥','酉'];
    const interpretation = baziInterpretation.buildBaziInterpretation(result);
    const s01 = interpretation.semanticModel.structures.find((item) => item.code === bazi.baziRelationCodes.SAN_HUI_COMPLETE);
    const s06 = interpretation.semanticModel.structures.find((item) => item.code === bazi.baziRelationCodes.SAN_HE_PARTIAL && /酉丑|丑酉/.test(item.text));
    assert(s01?.id === 'S01', `三会主要组合 ID 异常：${s01?.id}`);
    assert(Boolean(s06?.id), '未找到原局酉丑半合结构 ID');

    const makeTransit = (gan, zhi, shiShen, label) => ({
        gan, zhi, shiShen, diShi:'—', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals: bazi.calculatePillarSignals(gan, zhi, result.originalGans, result.originalZhis, label),
        stemRelations: bazi.calculateStemRelations(gan, result.originalGans),
        relations: bazi.calculateBranchRelations(zhi, result.originalZhis)
    });

    const daYun = makeTransit('己', '酉', '食神', '大运');
    const daYunAnalysis = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const yunRef = daYunAnalysis.structureReferences.find((item) => item.targetStructureId === s06.id);
    assert(yunRef?.mode === 'retrigger' && yunRef.sourceZhi === '酉', `大运酉未统一归入原局半合再次参与：${JSON.stringify(daYunAnalysis.structureReferences)}`);

    const liuNian = {
        ...makeTransit('丙', '午', '劫财', '流年'),
        year:2026, age:30, yunRelations:[], layeredRelations:[]
    };
    liuNian.yunRelations = bazi.calculatePairRelations(daYun, liuNian, '大运', '流年');
    const liuNianAnalysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, liuNian);
    const yearRef = liuNianAnalysis.structureReferences.find((item) => item.targetStructureId === s01.id);
    assert(yearRef?.mode === 'touch' && yearRef.targetMembers.includes('子'), `午冲子未识别为触及 S01 成员：${JSON.stringify(liuNianAnalysis.structureReferences)}`);
    assert(yearRef.relations.some((item) => item.member === '子' && item.code === bazi.baziRelationCodes.BRANCH_SIX_CLASH), 'S01 子成员未保留六冲关系');

    const liuYue = {
        ...makeTransit('丙', '申', '劫财', '流月'),
        monthName:'七', rangeText:'测试范围', yearRelations:[], yunRelations:[], layeredRelations:[]
    };
    liuYue.yearRelations = bazi.calculatePairRelations(liuNian, liuYue, '流年', '流月');
    liuYue.yunRelations = bazi.calculatePairRelations(daYun, liuYue, '大运', '流月');
    const liuYueAnalysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, liuNian, liuYue);
    const monthRef = liuYueAnalysis.structureReferences.find((item) => item.targetStructureId === s01.id);
    assert(monthRef?.mode === 'touch' && monthRef.targetMembers.includes('子') && monthRef.targetMembers.includes('亥'), `申未同时识别 S01 子亥成员：${JSON.stringify(liuYueAnalysis.structureReferences)}`);
    assert(monthRef.relations.some((item) => item.member === '子' && item.code === bazi.baziRelationCodes.SAN_HE_PARTIAL), '申子半合未进入 S01 结构引用');
    assert(monthRef.relations.some((item) => item.member === '亥' && item.code === bazi.baziRelationCodes.BRANCH_SIX_HARM), '申亥害未进入 S01 结构引用');

    const context = baziTransitAnalysis.buildBaziTransitContextText(result, interpretation, {
        daYun, liuNian, liuYue, daYunAnalysis, liuNianAnalysis, liuYueAnalysis
    });
    assert(context.includes(`- ${s01.id}｜[主要组合]`), '岁运上下文原局关系未携带 Structure ID');
    assert(context.includes(`触及原局主要组合 ${s01.id}`), '岁运上下文未输出主要组合成员级结构引用');
    assert(!/(冲破|受损|水势增强|得助|成化)/.test(context), `结构引用越级进入 Assessment：${context}`);
});

test('StructureReference 无组合时为空，只有真实补齐才标记 complete', () => {
    const makeCustomResult = (gans, zhis, dayGan = '丁') => {
        const pillars = gans.map((gan, index) => ({
            title: ['年柱','月柱','日柱','时柱'][index],
            gan, zhi: zhis[index], ganZhi: gan + zhis[index],
            shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
            cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
                gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
            }))
        }));
        const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
        const monthSeason = bazi.buildMonthSeason(zhis[1], bazi.getWuXing(dayGan));
        return {
            dayGan,
            dayGanWuXing:bazi.getWuXing(dayGan),
            pillars,
            internalRelations,
            monthSeason,
            originalGans:[...gans],
            originalZhis:[...zhis],
            lunarStr:'测试农历',
            ruleSummary:'测试口径',
            matchedLiterature:[]
        };
    };
    const makeTransit = (result, gan, zhi, label) => ({
        gan, zhi, shiShen:bazi.shiShenMap[result.dayGan][gan], diShi:'—', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:bazi.calculatePillarSignals(gan, zhi, result.originalGans, result.originalZhis, label),
        stemRelations:bazi.calculateStemRelations(gan, result.originalGans),
        relations:bazi.calculateBranchRelations(zhi, result.originalZhis)
    });

    const noComposite = makeCustomResult(['甲','乙','丁','戊'], ['子','卯','巳','戌']);
    const noCompositeAnalysis = baziTransitAnalysis.buildDaYunAnalysis(noComposite, makeTransit(noComposite, '庚', '酉', '大运'));
    assert(noCompositeAnalysis.structureReferences.length === 0, `无原局组合却生成结构引用：${JSON.stringify(noCompositeAnalysis.structureReferences)}`);

    const completable = makeCustomResult(['甲','乙','丁','戊'], ['申','子','午','未']);
    const interpretation = baziInterpretation.buildBaziInterpretation(completable);
    const partial = interpretation.semanticModel.structures.find((item) => item.code === bazi.baziRelationCodes.SAN_HE_PARTIAL && item.text.includes('申子'));
    assert(Boolean(partial), '测试盘未形成申子半合原局结构');
    const chen = makeTransit(completable, '庚', '辰', '大运');
    const analysis = baziTransitAnalysis.buildDaYunAnalysis(completable, chen);
    const completed = analysis.structureReferences.find((item) => item.targetStructureId === partial.id && item.mode === 'complete');
    assert(completed?.completedStructure?.code === bazi.baziRelationCodes.SAN_HE_COMPLETE, `辰未按真实条件补齐申子辰：${JSON.stringify(analysis.structureReferences)}`);
    assert((completed.completedStructure.branches || []).includes('申') && completed.completedStructure.branches.includes('子') && completed.completedStructure.branches.includes('辰'), '补齐结构成员不完整');
});
'''
text = text.replace(marker, addition + marker, 1)
p.write_text(text, encoding='utf-8')
