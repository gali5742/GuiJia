#!/usr/bin/env python3
from pathlib import Path

path = Path('tests/run-tests.js')
text = path.read_text(encoding='utf-8')
old = """    assert(interpretationSource.includes('scoreBaziRelation } = GuiJia.baziCore'), '解释引擎未读取统一评分函数');\n    assert(!interpretationSource.includes('function scoreRelation('), '解释引擎仍保留重复的关系评分函数');\n"""
new = """    const coreSource = fs.readFileSync(path.join(ROOT, 'js/bazi-core.js'), 'utf8');\n    assert(interpretationSource.includes('buildBaziStructureCatalog'), '解释引擎未读取统一 Structure Catalog');\n    assert(coreSource.includes('const buildBaziStructureCatalog = (relations = []) =>'), 'bazi-core 缺统一 Structure Catalog');\n    assert(coreSource.includes('.sort((a, b) => scoreBaziRelation(b) - scoreBaziRelation(a))'), 'Structure Catalog 未读取统一评分函数');\n    assert(!interpretationSource.includes('function scoreRelation('), '解释引擎仍保留重复的关系评分函数');\n"""
if text.count(old) != 1:
    raise SystemExit(f'run-tests target count={text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('Updated BaZi shared catalog regression contract')
