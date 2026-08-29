from pathlib import Path

p = Path('tests/bazi-semantic-layer-tests.js')
text = p.read_text(encoding='utf-8')
bad = "join('" + "\n" + "');"
if bad not in text:
    raise SystemExit('generated newline test fragment not found')
p.write_text(text.replace(bad, "join('');", 1), encoding='utf-8')

p = Path('tests/run-tests.js')
text = p.read_text(encoding='utf-8')
old_fixture = """        matchedLiterature:[
            {id:'qiong', book:'穷通宝鉴', chapter:'三秋乙木', quote:'三秋乙木', verified:true, contextMatch:'丙已见，癸未见。'},
            {id:'ziping', book:'子平真诠', chapter:'论用神成败·正官', quote:'官逢财印', verified:true, contextMatch:'月令正官；相关条件需逐项核对。'}
        ]
"""
new_fixture = """        matchedLiterature:[
            {id:'qiong', book:'穷通宝鉴', chapter:'三秋乙木', quote:'三秋乙木', verified:true, match:'日干乙、月令申，对应三秋乙木条。', contextMatch:'日干乙、月令申，对应三秋乙木条。后台核对：丙已见，癸未见。'},
            {id:'ziping', book:'子平真诠', chapter:'论用神成败·正官', quote:'官逢财印', verified:true, match:'月令本气为正官，对应正官相关条目。', contextMatch:'月令本气为正官，对应正官相关条目。后台条件仍需逐项核对。'}
        ]
"""
if text.count(old_fixture) != 1:
    raise SystemExit(f'legacy detail fixture expected once, got {text.count(old_fixture)}')
text = text.replace(old_fixture, new_fixture, 1)
old_assert = """    assert(detail.literatureChecks.some((item) => item.book === '穷通宝鉴' && item.check.includes('癸未见')), '详细分析古籍条件对照未优先使用 contextMatch');
"""
new_assert = """    assert(detail.literatureChecks.some((item) => item.book === '穷通宝鉴' && item.check.includes('对应三秋乙木条') && !item.check.includes('癸未见')), '详细分析古籍条件对照未使用 display match 或仍回流 contextMatch');
"""
if text.count(old_assert) != 1:
    raise SystemExit(f'legacy detail assertion expected once, got {text.count(old_assert)}')
text = text.replace(old_assert, new_assert, 1)
p.write_text(text, encoding='utf-8')
