from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, got {count}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


path = 'js/bazi-transit-analysis.js'

# Keep same-stem relation itself as a structural fact only.
replace_once(path,
"""        if (first.code === baziTransitRelationCodes.STEM_SAME) {
            const gan = (first.stems || [])[0] || itemB?.gan || '';
            return `${labelB}干与${labelA}干同为【${gan}】，重复${labelA}已经带入的${shiShen ? `【${shiShen}】` : ''}主题，属于层间延续`;
        }
""",
"""        if (first.code === baziTransitRelationCodes.STEM_SAME) {
            const gan = (first.stems || [])[0] || itemB?.gan || '';
            return `${labelB}干与${labelA}干同为【${gan}】，同一天干在两个时间层重复`;
        }
""", 'same stem structural wording')

# Triple-layer continuity also keeps structural fact and interpretation hint separate.
replace_once(path,
"""    const buildThreeLayerContinuity = (daYun, liuNian, liuYue) => {
        const texts = [];
        const skipCodes = new Set();
        if (daYun?.gan && daYun.gan === liuNian?.gan && liuNian.gan === liuYue?.gan) {
            const shiShen = liuYue.shiShen || liuNian.shiShen || daYun.shiShen || '';
            texts.push(`流月干与流年、大运干同为【${liuYue.gan}】${shiShen ? `，延续前两层的【${shiShen}】主题` : '，天干主题连续重复'}`);
            skipCodes.add(baziTransitRelationCodes.STEM_SAME);
        }
        if (daYun?.zhi && daYun.zhi === liuNian?.zhi && liuNian.zhi === liuYue?.zhi) {
            texts.push(`流月支与流年、大运支同为【${liuYue.zhi}】，同一地支连续出现在三个时间层`);
            skipCodes.add(baziTransitRelationCodes.BRANCH_SAME);
        }
        return { texts, skipCodes };
    };
""",
"""    const buildThreeLayerContinuity = (daYun, liuNian, liuYue) => {
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
""", 'three layer continuity split')

# Track copy-only interpretation hints for the month without changing frontend rows.
replace_once(path,
"""        const yearPair = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue);
        const evidenceGroups = [];
        let keyGroups = [...compactRelationGroups(liuYue.yearRelations || [])];
""",
"""        const yearPair = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue);
        const contextHints = buildSameStemThemeHints(liuYue.yearRelations || [], liuNian, liuYue);
        const evidenceGroups = [];
        let keyGroups = [...compactRelationGroups(liuYue.yearRelations || [])];
""", 'month context hints init')

replace_once(path,
"""        } else if (singleDaYun) {
            const continuity = buildThreeLayerContinuity(singleDaYun, liuNian, liuYue);
            const yearPairFiltered = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue, continuity.skipCodes);
            const yunPair = buildPairExplanations(liuYue.yunRelations || [], singleDaYun, liuYue, continuity.skipCodes);
            const pairExplanations = [...continuity.texts, ...yearPairFiltered, ...yunPair];
""",
"""        } else if (singleDaYun) {
            const continuity = buildThreeLayerContinuity(singleDaYun, liuNian, liuYue);
            contextHints.push(...continuity.themeHints);
            contextHints.push(...buildSameStemThemeHints(liuYue.yunRelations || [], singleDaYun, liuYue, continuity.skipCodes));
            const yearPairFiltered = buildPairExplanations(liuYue.yearRelations || [], liuNian, liuYue, continuity.skipCodes);
            const yunPair = buildPairExplanations(liuYue.yunRelations || [], singleDaYun, liuYue, continuity.skipCodes);
            const pairExplanations = [...continuity.texts, ...yearPairFiltered, ...yunPair];
""", 'single dayun continuity hints')

replace_once(path,
"""            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),
            season,
            evidenceGroups: evidenceGroups.filter(Boolean)
""",
"""            keyRelations: prioritizeGroups([...keyGroups, ...original.relations], 4),
            season,
            contextHints: [...new Set(contextHints.filter(Boolean))].map((text) => ({ label: '层间主题', text: `${text}。` })),
            evidenceGroups: evidenceGroups.filter(Boolean)
""", 'month context hints return')

# Make copy-context blocks genuinely parallel by closing bullet lists with blank lines.
replace_once(path,
"""    const appendTransitRowsContext = (lines, item, rows = [], indent = '') => {
        const hints = rows.filter((row) => transitHintLabels.has(row.label));
        const facts = rows.filter((row) => !transitHintLabels.has(row.label));
        if (hints.length) {
            lines.push(`${indent}解释提示：`);
            hints.forEach((row) => lines.push(`${indent}- ${row.label}：${buildThemeSentence(item)}。`));
        }
        if (facts.length) {
            lines.push(`${indent}结构事实：`);
            facts.forEach((row) => lines.push(`${indent}- ${row.label}：${row.text}`));
        }
    };
""",
"""    const appendTransitRowsContext = (lines, item, rows = [], indent = '', extraHints = []) => {
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
""", 'parallel context blocks')

replace_once(path,
"""        if (analysis.headline) lines.push(`概述：${analysis.headline}`);
        appendTransitRowsContext(lines, item, analysis.rows || []);
        if (analysis.evidenceGroups?.length) {
            lines.push('结构证据：');
""",
"""        if (analysis.headline) lines.push(`概述：${analysis.headline}`);
        appendTransitRowsContext(lines, item, analysis.rows || [], '', analysis.contextHints || []);
        if (analysis.evidenceGroups?.length) {
            lines.push('', '结构证据：');
""", 'separate evidence block')

replace_once(path,
"""            const analysis = buildDaYunAnalysis(result, segment.daYun);
            appendTransitRowsContext(lines, segment.daYun, analysis?.rows || [], '  ');
""",
"""            const analysis = buildDaYunAnalysis(result, segment.daYun);
            appendTransitRowsContext(lines, segment.daYun, analysis?.rows || [], '  ', analysis?.contextHints || []);
""", 'transition context hints')


# Focused BaZi regression in the dedicated semantic-layer test file.
path = 'tests/bazi-semantic-layer-tests.js'
replace_once(path,
"""    'js/bazi-timing.js',
    'js/bazi-literature.js',
""",
"""    'js/bazi-timing.js',
    'js/bazi-transit-analysis.js',
    'js/bazi-literature.js',
""", 'load transit analysis in bazi tests')

replace_once(path,
"""const baziLit = GuiJia.baziLiterature;
const baziInterpretation = GuiJia.baziInterpretation;
""",
"""const baziTransitAnalysis = GuiJia.baziTransitAnalysis;
const baziLit = GuiJia.baziLiterature;
const baziInterpretation = GuiJia.baziInterpretation;
""", 'bind transit analysis in bazi tests')

append = r'''

test('岁运复制上下文分区平级，并将同干主题与结构事实分层', () => {
    const result = makeResult();
    result.originalGans = ['丁','壬','丁','己'];
    result.originalZhis = ['丑','子','亥','酉'];
    result.internalRelations = [];
    const daYun = {
        gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[]
    };
    const liuNian = {
        year:2026, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[]
    };
    const sameStem = {
        code:bazi.baziTransitRelationCodes.STEM_SAME,
        type:'stem', layerLabels:['流年','流月'], stems:['丙','丙'], text:'测试同干'
    };
    const liuYue = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'劫财', diShi:'沐浴', naYin:'—', xun:'—', xunKong:'—',
        pillarSignals:[], stemRelations:[], relations:[], yearRelations:[sameStem], yunRelations:[], layeredRelations:[]
    };
    const daYunAnalysis = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const liuNianAnalysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, liuNian);
    const liuYueAnalysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, liuNian, liuYue);
    const layerFact = liuYueAnalysis.rows.find((row) => row.label === '层间衔接')?.text || '';
    assert(layerFact.includes('同一天干在两个时间层重复'), `同干结构事实未收纯：${layerFact}`);
    assert(!layerFact.includes('主题'), `主题解释仍混入结构事实：${layerFact}`);
    assert(liuYueAnalysis.contextHints?.some((item) => item.text.includes('劫财') && item.text.includes('延续')), '流月同干主题未移入解释提示');

    const text = baziTransitAnalysis.buildBaziTransitContextText(result, { headline:'测试原局', judgments:[] }, {
        daYun, liuNian, liuYue, daYunAnalysis, liuNianAnalysis, liuYueAnalysis
    });
    assert(text.includes('解释提示：\n- 层间主题：'), '流月解释提示区缺层间主题');
    assert(text.includes('\n\n结构事实：'), '结构事实标题未与上一 bullet 平级分隔');
    assert(text.includes('\n\n结构证据：'), '结构证据标题未与上一 bullet 平级分隔');
});
'''
p = Path(path)
text = p.read_text(encoding='utf-8')
marker = "\nconsole.log(`\\n${passed} passed, ${failed} failed`);"
if marker not in text:
    raise SystemExit('bazi test append marker not found')
if "岁运复制上下文分区平级，并将同干主题与结构事实分层" not in text:
    text = text.replace(marker, append + marker, 1)
p.write_text(text, encoding='utf-8')
