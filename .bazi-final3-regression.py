from pathlib import Path

p = Path('tests/run-tests.js')
text = p.read_text(encoding='utf-8')
old = """    const branch = output.judgments.find((item) => item.id === 'branch-network');\n    assert(branch && branch.title.includes('合') && branch.title.includes('刑'), '未把地支合刑合成为整体命题');\n    assert(branch.evidence.length >= 4, '地支网络证据不完整');\n"""
new = """    const branch = output.judgments.find((item) => item.id === 'branch-network');\n    assert(branch && (branch.title === '地支关系与组合交织' || (branch.title.includes('合') && branch.title.includes('刑'))), '未把地支关系与组合合成为整体命题');\n    assert(branch.summary.includes('六合') && branch.summary.includes('相刑'), '统一标题后未在正文保留具体合刑关系');\n    assert(branch.evidence.length >= 4, '地支网络证据不完整');\n"""
if text.count(old) != 1:
    raise SystemExit('BaZi branch-network regression block mismatch')
p.write_text(text.replace(old, new, 1), encoding='utf-8')
