from pathlib import Path

p = Path('tests/run-tests.js')
text = p.read_text(encoding='utf-8')
old = """    assert(Array.isArray(interpretation.limitations) && interpretation.limitations.length >= 1, '复制上下文所需后台边界被误删');
    assert(source.includes(\"lines.push('', '【使用边界】')\"), '复制分析上下文未保留使用边界');
"""
new = """    assert(Array.isArray(interpretation.limitations) && interpretation.limitations.length >= 1, '解释对象内部边界被误删');
    const contextText = baziInterpretation.buildBaziContextText(result, interpretation);
    assert(contextText.includes('【Assessment｜作用与结论层】') && contextText.includes('不得自动升级为实际效力判断'), '复制分析上下文未在 Assessment 层保留全局边界');
    assert(!contextText.includes('【使用边界】'), '复制分析上下文仍重复输出独立使用边界区');
"""
if text.count(old) != 1:
    raise SystemExit(f'expected 1 old BaZi boundary regression, got {text.count(old)}')
p.write_text(text.replace(old, new, 1), encoding='utf-8')
