from pathlib import Path

path = Path('tests/run-tests.js')
text = path.read_text(encoding='utf-8')

old1 = """    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const pairRow = ln.rows.find((row) => row.label === '岁运衔接');
    assert(pairRow?.text.includes('重复大运已经带入的【食神】主题'), `同干未解释为层间延续：${pairRow?.text || '缺失'}`);

    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const linkRow = ly.rows.find((row) => row.label === '层间衔接');
    assert(linkRow?.text.includes('流月干与流年、大运干同为【丙】'), `三层同干未合并解释：${linkRow?.text || '缺失'}`);
    assert(linkRow?.text.includes('延续前两层的【食神】主题'), '三层同干仍停留在关系名层面');
"""
new1 = """    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const pairRow = ln.rows.find((row) => row.label === '岁运衔接');
    assert(pairRow?.text.includes('流年干与大运干同为【丙】，同一天干在两个时间层重复'), `同干结构事实异常：${pairRow?.text || '缺失'}`);
    assert(!pairRow?.text.includes('主题'), `流年结构事实仍混入主题解释：${pairRow?.text || '缺失'}`);

    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const linkRow = ly.rows.find((row) => row.label === '层间衔接');
    assert(linkRow?.text.includes('流月干与流年、大运干同为【丙】，同一天干连续出现在三个时间层'), `三层同干结构事实异常：${linkRow?.text || '缺失'}`);
    assert(!linkRow?.text.includes('主题'), `三层同干结构事实仍混入主题解释：${linkRow?.text || '缺失'}`);
    assert(ly.contextHints?.some((item) => item.text.includes('食神') && item.text.includes('延续')), '三层同干的食神主题未进入解释提示');
"""
if text.count(old1) != 1:
    raise SystemExit(f'first BaZi test contract: expected 1 match, got {text.count(old1)}')
text = text.replace(old1, new1, 1)

old2 = """    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const lnLink = ln.rows.find((row) => row.label === '岁运衔接')?.text || '';
    assert(lnLink.includes('流年干与大运干同为【丙】，重复大运已经带入的【正印】主题，属于层间延续'), `流年主语或衔接文案不自然：${lnLink}`);
"""
new2 = """    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const lnLink = ln.rows.find((row) => row.label === '岁运衔接')?.text || '';
    assert(lnLink.includes('流年干与大运干同为【丙】，同一天干在两个时间层重复'), `流年同干结构事实不自然：${lnLink}`);
    assert(!lnLink.includes('主题'), `流年结构事实仍混入主题提示：${lnLink}`);
"""
if text.count(old2) != 1:
    raise SystemExit(f'second BaZi test contract: expected 1 match, got {text.count(old2)}')
text = text.replace(old2, new2, 1)

path.write_text(text, encoding='utf-8')
