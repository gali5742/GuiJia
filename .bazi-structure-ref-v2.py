#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path('.')

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing target: {label}')
    if text.count(old) != 1:
        raise SystemExit(f'non-unique target {label}: {text.count(old)}')
    return text.replace(old, new, 1)

# 1) bazi-core: one shared source for Sxx ids / structural roles.
path = 'js/bazi-core.js'
text = read(path)
old = """    const scoreBaziRelation = (relation) => {\n        const meta = getBaziRelationMeta(relation);\n        let score = meta?.baseScore ?? 40;\n        const pillarIndices = Array.isArray(relation?.pillarIndices) ? relation.pillarIndices : [];\n        if (pillarIndices.includes(2)) score += 14;\n        if (pillarIndices.includes(1)) score += 8;\n        if (pillarIndices.includes(0) && pillarIndices.includes(3)) score += 2;\n        return score;\n    };\n\n"""
new = old + """    const buildBaziStructureCatalog = (relations = []) => [...relations]\n        .sort((a, b) => scoreBaziRelation(b) - scoreBaziRelation(a))\n        .map((relation, index) => {\n            const meta = baziRelationMeta[relation?.code] || {};\n            const id = `S${String(index + 1).padStart(2, '0')}`;\n            const structuralRole = meta.structuralRole || 'coexistingRelation';\n            return {\n                ...relation,\n                id,\n                _semanticRef: id,\n                structuralRole,\n                structuralRoleLabel: structuralRole === 'majorCompositeStructure' ? '主要组合' : '并存关系'\n            };\n        });\n\n"""
text = replace_once(text, old, new, 'core catalog helper insert')
text = replace_once(text, """        scoreBaziRelation,\n        getRelationSemanticKey,\n""", """        scoreBaziRelation,\n        buildBaziStructureCatalog,\n        getRelationSemanticKey,\n""", 'core export')
write(path, text)

# 2) original interpretation consumes the shared catalog rather than rebuilding Sxx.
path = 'js/bazi-interpretation.js'
text = read(path)
text = replace_once(
    text,
    """    const { baziRelationMeta = {}, scoreBaziRelation } = GuiJia.baziCore || {};\n""",
    """    const { baziRelationMeta = {}, buildBaziStructureCatalog = (relations = []) => relations } = GuiJia.baziCore || {};\n""",
    'interpretation core destructure'
)
old = """        const structures = relations.map((relation, index) => {\n            const meta = baziRelationMeta[relation.code] || {};\n            return {\n                id: relation._semanticRef || `S${String(index + 1).padStart(2, '0')}`,\n                code: relation.code || '',\n                system: 'stemBranchRelation',\n                structuralRole: meta.structuralRole || 'coexistingRelation',\n                structuralRoleLabel: meta.structuralRole === 'majorCompositeStructure' ? '主要组合' : '并存关系',\n                text: relation.text\n            };\n        });\n"""
new = """        const structures = relations.map((relation, index) => {\n            const meta = baziRelationMeta[relation.code] || {};\n            const structuralRole = relation.structuralRole || meta.structuralRole || 'coexistingRelation';\n            return {\n                id: relation.id || relation._semanticRef || `S${String(index + 1).padStart(2, '0')}`,\n                code: relation.code || '',\n                system: 'stemBranchRelation',\n                structuralRole,\n                structuralRoleLabel: relation.structuralRoleLabel || (structuralRole === 'majorCompositeStructure' ? '主要组合' : '并存关系'),\n                text: relation.text\n            };\n        });\n"""
text = replace_once(text, old, new, 'semantic structures consume catalog')
text = replace_once(
    text,
    """        const relations = [...(result.internalRelations || [])]\n            .sort((a, b) => scoreBaziRelation(b) - scoreBaziRelation(a))\n            .map((relation, index) => ({ ...relation, _semanticRef: `S${String(index + 1).padStart(2, '0')}` }));\n""",
    """        const relations = buildBaziStructureCatalog(result.internalRelations || []);\n""",
    'interpretation relation catalog'
)
write(path, text)

# 3) transit: consume shared catalog; distinguish member vs multi-member interactions.
path = 'js/bazi-transit-analysis.js'
text = read(path)
text = replace_once(
    text,
    """        baziTransitRelationCodes,\n        buildMonthSeason,\n        scoreBaziRelation\n""",
    """        baziTransitRelationCodes,\n        buildMonthSeason,\n        scoreBaziRelation,\n        buildBaziStructureCatalog,\n        getRelationSemanticKey\n""",
    'transit core destructure'
)
pattern = re.compile(r"    const buildOriginalStructureCatalog = \(result\) => \[\.\.\.\(result\?\.internalRelations \|\| \[\]\)\][\s\S]*?\n    const relationMembersInsideStructure =", re.M)
replacement = """    const buildOriginalStructureCatalog = (result) => buildBaziStructureCatalog(result?.internalRelations || [])\n        .filter((relation) => referencableOriginalStructureCodes.has(relation.code))\n        .map((relation) => ({\n            ...relation,\n            name: structureName(relation),\n            branches: [...(relation.branches || [])]\n        }));\n\n    const relationMembersInsideStructure ="""
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'catalog replacement count={count}')

text = replace_once(
    text,
    """                    targetMembers: structure.branches.includes(sourceZhi) ? [sourceZhi] : [],\n                    mode: 'retrigger',\n                    relations: []\n""",
    """                    targetMembers: structure.branches.includes(sourceZhi) ? [sourceZhi] : [],\n                    mode: 'retrigger',\n                    relationRef: getRelationSemanticKey(retrigger),\n                    relations: []\n""",
    'retrigger trace ref'
)
text = replace_once(
    text,
    """                    targetMembers: [...structure.branches],\n                    mode: 'complete',\n                    relations: [],\n                    completedStructure: {\n""",
    """                    targetMembers: [...structure.branches],\n                    mode: 'complete',\n                    relationRef: getRelationSemanticKey(completion),\n                    relations: [],\n                    completedStructure: {\n""",
    'completion trace ref'
)
text = replace_once(
    text,
    """                    member,\n                    code: relation.code || '',\n                    label: relationLabel(relation),\n                    action: relation.action || '',\n                    branches: [...(relation.branches || [])]\n""",
    """                    member,\n                    code: relation.code || '',\n                    label: relationLabel(relation),\n                    action: relation.action || '',\n                    branches: [...(relation.branches || [])],\n                    relationRef: getRelationSemanticKey(relation)\n""",
    'member trace refs'
)
old = """            if (!uniqueDetails.length) return;\n            references.push({\n                sourceLayer: String(sourceLabel || '').toLowerCase(),\n                sourceLabel,\n                sourceGanZhi,\n                sourceZhi,\n                targetStructureId: structure.id,\n                targetStructureCode: structure.code,\n                targetStructureRole: structure.structuralRole,\n                targetStructureName: structure.name,\n                targetStructureBranches: [...structure.branches],\n                targetMembers: [...new Set(uniqueDetails.map((detail) => detail.member))],\n                mode: 'touch',\n                relations: uniqueDetails\n            });\n"""
new = """            if (!uniqueDetails.length) return;\n            const memberOrder = new Map((structure.branches || []).map((zhi, index) => [zhi, index]));\n            uniqueDetails.sort((a, b) => (memberOrder.get(a.member) ?? 99) - (memberOrder.get(b.member) ?? 99));\n            const targetMembers = [...new Set(uniqueDetails.map((detail) => detail.member))];\n            references.push({\n                sourceLayer: String(sourceLabel || '').toLowerCase(),\n                sourceLabel,\n                sourceGanZhi,\n                sourceZhi,\n                targetStructureId: structure.id,\n                targetStructureCode: structure.code,\n                targetStructureRole: structure.structuralRole,\n                targetStructureName: structure.name,\n                targetStructureBranches: [...structure.branches],\n                targetMembers,\n                mode: targetMembers.length >= 2 ? 'multi-member-interaction' : 'member-interaction',\n                relations: uniqueDetails\n            });\n"""
text = replace_once(text, old, new, 'member interaction modes')

old = """        if (reference.mode === 'touch') {\n            const members = (reference.targetMembers || []).map((zhi) => `【${zhi}】`).join('、');\n            const details = (reference.relations || []).map((detail) => {\n                if (detail.code === baziRelationCodes.SAN_HE_PARTIAL || detail.code === baziRelationCodes.SAN_HUI_PARTIAL) {\n                    return `与【${detail.member}】形成${detail.label}组合`;\n                }\n                if (completeCodes.has(detail.code)) {\n                    return `以【${detail.member}】为成员形成${detail.label}【${(detail.branches || []).join('')}】`;\n                }\n                return `与【${detail.member}】见${detail.label}`;\n            });\n            return `${source}触及${target}中的${members}${details.length ? `：${details.join('，')}` : ''}`;\n        }\n"""
new = """        if (reference.mode === 'member-interaction' || reference.mode === 'multi-member-interaction') {\n            const members = (reference.targetMembers || []).map((zhi) => `【${zhi}】`).join('、');\n            const details = (reference.relations || []).map((detail) => {\n                if (detail.code === baziRelationCodes.SAN_HE_PARTIAL || detail.code === baziRelationCodes.SAN_HUI_PARTIAL) {\n                    return `与【${detail.member}】形成${detail.label}组合`;\n                }\n                if (completeCodes.has(detail.code)) {\n                    return `以【${detail.member}】为成员形成${detail.label}【${(detail.branches || []).join('')}】`;\n                }\n                return `与【${detail.member}】见${detail.label}`;\n            });\n            if (reference.mode === 'multi-member-interaction') {\n                return `${source}同时关联${target}中的${members}${details.length ? `：${details.join('，')}` : ''}`;\n            }\n            return `${source}与${target}中的${members}发生成员关系${details.length ? `：${details.join('，')}` : ''}`;\n        }\n"""
text = replace_once(text, old, new, 'member reference wording')
old = """    const contextRowsWithStructureReferences = (analysis) => {\n        const rows = [...(analysis?.rows || [])];\n        const visible = (analysis?.structureReferences || []).filter((reference) => reference.mode !== 'retrigger');\n        const texts = visible.map(formatStructureReference).filter(Boolean);\n        if (texts.length) rows.push({ label: '结构引用', text: joinNarratives(texts) });\n        return rows;\n    };\n"""
new = """    const contextRowsWithStructureReferences = (analysis) => {\n        const rows = [...(analysis?.rows || [])];\n        const visible = (analysis?.structureReferences || []).filter((reference) => reference.mode === 'multi-member-interaction');\n        const texts = visible.map(formatStructureReference).filter(Boolean);\n        if (texts.length) rows.push({ label: '主要结构成员关联', text: joinNarratives(texts) });\n        return rows;\n    };\n"""
text = replace_once(text, old, new, 'context multi-member only')
write(path, text)

# 4) tests: update the contract and add shared-catalog checks.
path = 'tests/bazi-semantic-layer-tests.js'
text = read(path)
text = replace_once(
    text,
    """    assert(yearRef?.mode === 'touch' && yearRef.targetMembers.includes('子'), `午冲子未识别为触及 S01 成员：${JSON.stringify(liuNianAnalysis.structureReferences)}`);\n    assert(yearRef.relations.some((item) => item.member === '子' && item.code === bazi.baziRelationCodes.BRANCH_SIX_CLASH), 'S01 子成员未保留六冲关系');\n""",
    """    assert(yearRef?.mode === 'multi-member-interaction' && yearRef.targetMembers.includes('子') && yearRef.targetMembers.includes('丑'), `午未识别为同时关联 S01 子丑成员：${JSON.stringify(liuNianAnalysis.structureReferences)}`);\n    assert(yearRef.relations.some((item) => item.member === '子' && item.code === bazi.baziRelationCodes.BRANCH_SIX_CLASH), 'S01 子成员未保留六冲关系');\n    assert(yearRef.relations.some((item) => item.member === '子' && item.relationRef), 'S01 子成员关系缺稳定追溯引用');\n""",
    'year multi-member test'
)
text = replace_once(
    text,
    """    assert(monthRef?.mode === 'touch' && monthRef.targetMembers.includes('子') && monthRef.targetMembers.includes('亥'), `申未同时识别 S01 子亥成员：${JSON.stringify(liuYueAnalysis.structureReferences)}`);\n""",
    """    assert(monthRef?.mode === 'multi-member-interaction' && monthRef.targetMembers.includes('子') && monthRef.targetMembers.includes('亥'), `申未同时识别 S01 子亥成员：${JSON.stringify(liuYueAnalysis.structureReferences)}`);\n""",
    'month multi-member test'
)
text = replace_once(
    text,
    """    assert(context.includes(`- ${s01.id}｜[主要组合]`), '岁运上下文原局关系未携带 Structure ID');\n    assert(context.includes(`触及原局主要组合 ${s01.id}`), '岁运上下文未输出主要组合成员级结构引用');\n    assert(!/(冲破|受损|水势增强|得助|成化)/.test(context), `结构引用越级进入 Assessment：${context}`);\n""",
    """    assert(context.includes(`- ${s01.id}｜[主要组合]`), '岁运上下文原局关系未携带 Structure ID');\n    const daYunSection = context.split('【当前大运】')[1]?.split('【当前流年】')[0] || '';\n    const yearSection = context.split('【当前流年】')[1]?.split('【当前流月】')[0] || '';\n    const monthSection = context.split('【当前流月】')[1]?.split('【使用要求】')[0] || '';\n    const yunMemberRef = daYunAnalysis.structureReferences.find((item) => item.targetStructureId === s01.id);\n    assert(yunMemberRef?.mode === 'member-interaction' && yunMemberRef.targetMembers.length === 1 && yunMemberRef.targetMembers[0] === '子', `单成员引用未保留机器层：${JSON.stringify(daYunAnalysis.structureReferences)}`);\n    assert(!daYunSection.includes('主要结构成员关联'), `单成员引用不应在复制上下文升格：${daYunSection}`);\n    assert(yearSection.includes(`主要结构成员关联：流年支【午】同时关联原局主要组合 ${s01.id}`), '流年多成员关联未显式归纳');\n    assert(monthSection.includes(`主要结构成员关联：流月支【申】同时关联原局主要组合 ${s01.id}`), '流月多成员关联未显式归纳');\n    assert(!context.includes('触及原局主要组合'), '复制上下文仍使用容易抬高效力感的“触及结构”措辞');\n    assert(!/(冲破|受损|水势增强|得助|成化)/.test(context), `结构引用越级进入 Assessment：${context}`);\n""",
    'context member visibility contract'
)
insert_before = """test('StructureReference 无组合时为空，只有真实补齐才标记 complete', () => {\n"""
new_test = """test('原局与岁运共享同一 Structure Catalog，不重复生成 Sxx', () => {\n    const result = makeResult();\n    result.originalGans = ['丁','壬','丁','己'];\n    result.originalZhis = ['丑','子','亥','酉'];\n    const shared = bazi.buildBaziStructureCatalog(result.internalRelations);\n    const interpretation = baziInterpretation.buildBaziInterpretation(result);\n    const semantic = interpretation.semanticModel.structures;\n    assert(shared.length === semantic.length, '共享 catalog 与原局 semanticModel 数量不一致');\n    shared.forEach((item, index) => {\n        assert(item.id === semantic[index].id && item.code === semantic[index].code, `原局 Sxx 未直接来自共享 catalog：${item.id}/${semantic[index]?.id}`);\n    });\n    const transitCatalog = baziTransitAnalysis.buildOriginalStructureCatalog(result);\n    transitCatalog.forEach((item) => {\n        const original = shared.find((entry) => entry.id === item.id);\n        assert(original && original.code === item.code, `岁运 catalog 重新编号或漂移：${item.id}`);\n    });\n});\n\n"""
if insert_before not in text:
    raise SystemExit('missing test insertion anchor')
text = text.replace(insert_before, new_test + insert_before, 1)
write(path, text)

print('BaZi structure reference v2 patch applied')
