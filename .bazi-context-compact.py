from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, got {count}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


# 1) Literature: preserve verbose internal contextMatch, add compact contextDetail for copy context.
path = 'js/bazi-literature.js'
replace_once(path,
"""                applicability,
                contextMatch: appendContextNote(item.match, item.contextNote),
                levelKey,
""",
"""                applicability,
                contextMatch: appendContextNote(item.match, item.contextNote),
                contextDetail: String(item.contextDetail || '').trim(),
                levelKey,
""", 'literature contextDetail normalization')

replace_once(path,
"""                    contextNote: `这里确认的是月令条目的对应关系；原文中的调候取法仍须结合透藏、根气、寒暖与制化逐项判断，不能直接视为全局喜用结论。${buildQiongContextAudit(qiongQuote, originalGans, hidden, dayGan)}`,
                    hint: `本条用于建立${dayGan}日主在【${monthZhi}】月的调候背景，再与原局透藏、根气和制化合看。`,
""",
"""                    contextNote: `这里确认的是月令条目的对应关系；原文中的调候取法仍须结合透藏、根气、寒暖与制化逐项判断，不能直接视为全局喜用结论。${buildQiongContextAudit(qiongQuote, originalGans, hidden, dayGan)}`,
                    contextDetail: buildQiongContextAudit(qiongQuote, originalGans, hidden, dayGan).split('这里明确区分')[0].trim(),
                    hint: `本条用于建立${dayGan}日主在【${monthZhi}】月的调候背景，再与原局透藏、根气和制化合看。`,
""", 'qiong compact detail')

replace_once(path,
"""                    contextNote: '当前本地语料尚未逐字核对该月原文，因此只提供条目定位，不引用同季其他月份的原文代替。',
                    hint: '同一季节内部各月取法并不完全相同；未核对到本月正文时只给定位。',
""",
"""                    contextNote: '当前本地语料尚未逐字核对该月原文，因此只提供条目定位，不引用同季其他月份的原文代替。',
                    contextDetail: '本月原文尚未逐字核对。',
                    hint: '同一季节内部各月取法并不完全相同；未核对到本月正文时只给定位。',
""", 'qiong locator compact detail')

replace_once(path,
"""                    contextNote: '这里确认的是日时细分条目对应；原文同时附带年月条件，不能把其中短断直接视为无条件结论。',
                    hint: '原文同时列出不同年月条件，表明同一日时并不是单一固定结论。',
""",
"""                    contextNote: '这里确认的是日时细分条目对应；原文同时附带年月条件，不能把其中短断直接视为无条件结论。',
                    contextDetail: '原文附带年月条件：戊己丙丁年月。',
                    hint: '原文同时列出不同年月条件，表明同一日时并不是单一固定结论。',
""", 'sanming dinghai compact detail')

replace_once(path,
"""                contextNote: monthMainGod === '正官'
                    ? `本程序确认月令本气为正官，并进一步对照原文可机器核对的条件。${buildZipingZhengGuanAudit(internalRelations, hasGod, relationHitsByCode)}`
                    : '本程序只确认月令十神及相关十神已经出现，因此将此条列作进一步核对；是否符合原文所述成格、破格或救应条件，尚未由此匹配判定。',
                hint: zipingRule.hint,
""",
"""                contextNote: monthMainGod === '正官'
                    ? `本程序确认月令本气为正官，并进一步对照原文可机器核对的条件。${buildZipingZhengGuanAudit(internalRelations, hasGod, relationHitsByCode)}`
                    : '本程序只确认月令十神及相关十神已经出现，因此将此条列作进一步核对；是否符合原文所述成格、破格或救应条件，尚未由此匹配判定。',
                contextDetail: monthMainGod === '正官'
                    ? buildZipingZhengGuanAudit(internalRelations, hasGod, relationHitsByCode).split('这里仅做')[0].trim()
                    : '待核对：原文所述成格、破格或救应条件。',
                hint: zipingRule.hint,
""", 'ziping month compact detail')

replace_once(path,
"""                match: `原局见完整会合结构：${completeGroupHits.join('；')}。本条仅作为“月令取用存在变化讨论”的延伸索引；当前摘录本身并未直接规定“完整三会／三合”就是该句成立条件。`,
                contextNote: '因此这里不把会局存在当作《真诠》该句的直接证据，也不据此判断已经发生原文意义上的用神变化。',
""",
"""                match: `原局见完整会合结构：${completeGroupHits.join('；')}；本条作为“月令取用变化”相关章节索引。`,
                contextNote: '因此这里不把会局存在当作《真诠》该句的直接证据，也不据此判断已经发生原文意义上的用神变化。',
""", 'ziping hui concise match')

replace_once(path,
"""                contextNote: '这里只确认“七杀月令 + 食神出现”的入口条件；是否形成有效食神制杀，尚需比较旺衰、透藏、位置与制化。',
                hint: '这使“七杀—食神”成为需要继续核对力量与位置的明确结构线索。',
""",
"""                contextNote: '这里只确认“七杀月令 + 食神出现”的入口条件；是否形成有效食神制杀，尚需比较旺衰、透藏、位置与制化。',
                contextDetail: '待核对：食神制杀的旺衰、透藏、位置与制化。',
                hint: '这使“七杀—食神”成为需要继续核对力量与位置的明确结构线索。',
""", 'ziping qisha compact detail')

replace_once(path,
"""                contextNote: '这里只确认正官、七杀同时出现；原文所说的身弱、两停、合煞等条件并未由此自动成立。',
                hint: '原文把“官杀并见”放入强弱、去留与合制条件中讨论，不能只凭“混杂”二字下结论。',
""",
"""                contextNote: '这里只确认正官、七杀同时出现；原文所说的身弱、两停、合煞等条件并未由此自动成立。',
                contextDetail: '原文另含“身弱、两停、合煞”等条件，当前未在本层判定。',
                hint: '原文把“官杀并见”放入强弱、去留与合制条件中讨论，不能只凭“混杂”二字下结论。',
""", 'yuanhai compact detail')

replace_once(path,
"""                contextNote: '这里只确认官杀并见；原文关于“喜克”或“忌克”的分岔仍须先完成日主强弱与喜忌判断。',
                hint: '该书把官杀并见的影响建立在“日主究竟喜克还是忌克”的前提上，而非固定视为吉或凶。',
""",
"""                contextNote: '这里只确认官杀并见；原文关于“喜克”或“忌克”的分岔仍须先完成日主强弱与喜忌判断。',
                contextDetail: '原文另分“日主喜克／忌克”两路，当前未在本层判定。',
                hint: '该书把官杀并见的影响建立在“日主究竟喜克还是忌克”的前提上，而非固定视为吉或凶。',
""", 'qianli compact detail')


# 2) Original-chart copy context: one global boundary, compact literature, no per-judgment caveats.
path = 'js/bazi-interpretation.js'
replace_once(path,
"""            assessmentBoundary: '当前模块不生成身强身弱终判、格局、用神、喜忌、吉凶或具体事件结论。存在性事实与结构关系不得自动升级为实际效力判断。'
""",
"""            assessmentBoundary: '当前模块停在结构层：不生成身强身弱终判、格局、用神、喜忌、吉凶或具体事件结论；存在性事实与结构关系不得自动升级为实际效力判断；尚未纳入的规则不自动补齐。'
""", 'assessment boundary compact')

replace_once(path,
"""    function buildBaziContextText(result, interpretation) {
""",
"""    function compactBaziLiteratureItems(entries = []) {
        const keyOf = (item) => `${item?.book || ''}|${item?.chapter || ''}`;
        const quotedKeys = new Set(entries
            .filter((item) => item?.excerptType !== 'locator' && item?.quote)
            .map(keyOf));
        const punctuate = (value) => {
            const text = String(value || '').trim();
            if (!text) return '';
            return /[。！？]$/.test(text) ? text : `${text}。`;
        };
        return entries
            .filter((item) => !(item?.excerptType === 'locator' && quotedKeys.has(keyOf(item))))
            .map((item) => ({
                ...item,
                contextMatch: `${punctuate(item.match)}${punctuate(item.contextDetail)}`
            }));
    }

    function buildBaziContextText(result, interpretation) {
""", 'insert compact literature helper')

replace_once(path,
"""        (interpretation?.judgments || []).forEach((item, index) => {
            lines.push(`${index + 1}. ${item.title}`);
            const contextExplanation = [item.summary, item.contextNote].filter(Boolean).join('');
            lines.push(`解释：${contextExplanation}`);
            if (item.evidenceRefs?.length) lines.push(`  依据：${item.evidenceRefs.join('、')}`);
""",
"""        (interpretation?.judgments || []).forEach((item, index) => {
            lines.push(`${index + 1}. ${item.title}`);
            lines.push(`解释：${item.summary || '—'}`);
            if (item.evidenceRefs?.length) lines.push(`  依据：${item.evidenceRefs.join('、')}`);
""", 'remove per-judgment contextNote')

replace_once(path,
"""        lines.push('', '【使用边界】');
        (interpretation?.limitations || []).forEach((item) => lines.push(`- ${item}`));

        lines.push('', '【古籍参考】');
        lines.push(...buildLiteratureContextLines(result.matchedLiterature, '暂无匹配条目'));

        lines.push('', '【使用要求】', '请只基于以上已列 Fact、Derived Fact 与 Structure 进行综合解释；不要把“出现”自动升级为“有效”，不要自行重排四柱，不要虚构盘中不存在的关系或古籍原文。');
""",
"""        lines.push('', '【古籍参考】');
        lines.push('说明：古籍条目仅作原文对照；条目命中、条件出现与原文结论成立属于不同层次，不得据条目命中反向补造盘中未列出的事实或关系。');
        lines.push(...buildLiteratureContextLines(compactBaziLiteratureItems(result.matchedLiterature || []), '暂无匹配条目'));

        lines.push('', '【使用要求】', '命盘事实与结构判断仅以以上 Fact、Derived Fact 与 Structure 为依据；古籍参考仅作解释与对照，不得据古籍原文反向补造盘中未列出的事实、关系或条件；不要自行重排四柱。');
""", 'unify context boundary and literature scope')


# 3) Transit copy context: explicit interpretation-hint vs structural-fact sections; conditional completion wording.
path = 'js/bazi-transit-analysis.js'
replace_once(path,
"""    const appendTransitAnalysisContext = (lines, title, item, analysis, metaLines = []) => {
        if (!item || !analysis) return;
        lines.push('', `【${title}】`);
        metaLines.filter(Boolean).forEach((line) => lines.push(line));
        if (analysis.headline) lines.push(`概述：${analysis.headline}`);
        (analysis.rows || []).forEach((row) => lines.push(`- ${row.label}：${row.text}`));
        if (analysis.evidenceGroups?.length) {
""",
"""    const transitHintLabels = new Set(['长期背景', '年度主题']);

    const appendTransitRowsContext = (lines, item, rows = [], indent = '') => {
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

    const appendTransitAnalysisContext = (lines, title, item, analysis, metaLines = []) => {
        if (!item || !analysis) return;
        lines.push('', `【${title}】`);
        metaLines.filter(Boolean).forEach((line) => lines.push(line));
        if (analysis.headline) lines.push(`概述：${analysis.headline}`);
        appendTransitRowsContext(lines, item, analysis.rows || []);
        if (analysis.evidenceGroups?.length) {
""", 'split transit hints and facts')

replace_once(path,
"""            const analysis = buildDaYunAnalysis(result, segment.daYun);
            (analysis?.rows || []).forEach((row) => lines.push(`  - ${row.label}：${row.text}`));
""",
"""            const analysis = buildDaYunAnalysis(result, segment.daYun);
            appendTransitRowsContext(lines, segment.daYun, analysis?.rows || [], '  ');
""", 'transition context row split')

replace_once(path,
"""        lines.push('', '【使用要求】');
        lines.push('请基于以上原局与当前大运、流年、流月结构进行综合解释；优先说明各时间层对原局结构的延续、补齐、再次参与与新增关系，不要自行重排四柱或虚构未列出的干支关系。');
""",
"""        lines.push('', '【使用要求】');
        lines.push('请基于以上原局与当前大运、流年、流月结构进行综合解释；优先说明各时间层对原局结构的延续、再次参与与新增关系，仅在结构事实明确标记为补齐时说明结构补齐；不要自行重排四柱或虚构未列出的干支关系。');
""", 'conditional completion wording')


# 4) BaZi semantic regression tests.
path = 'tests/bazi-semantic-layer-tests.js'
replace_once(path,
"""    const contextText = baziInterpretation.buildBaziContextText(result, output);
    assert(contextText.includes('后续 Assessment 层') && contextText.includes('实际扶身效力'), '复制上下文未保留内部边界');
});
""",
"""    const contextText = baziInterpretation.buildBaziContextText(result, output);
    assert(!contextText.includes('后续 Assessment 层') && !contextText.includes('实际扶身效力'), '复制上下文仍逐条重复内部边界');
    assert((contextText.match(/不得自动升级为实际效力判断/g) || []).length === 1, 'Assessment 全局边界未收束为一次');
});
""", 'context boundary regression')

replace_once(path,
"""    assert(!text.includes('【强弱相关证据】') && !text.includes('【原局干支关系】'), '新上下文仍重复输出旧证据区');
    assert(text.includes('不要把“出现”自动升级为“有效”'), '使用要求未阻断存在到效力的越级');
});
""",
"""    assert(!text.includes('【强弱相关证据】') && !text.includes('【原局干支关系】'), '新上下文仍重复输出旧证据区');
    assert(!text.includes('【使用边界】'), 'Assessment 之外仍重复输出独立使用边界区');
    assert(text.includes('命盘事实与结构判断仅以以上 Fact、Derived Fact 与 Structure 为依据'), '使用要求未明确事实来源权限');
    assert(text.includes('古籍参考仅作解释与对照'), '使用要求未明确古籍权限边界');
});
""", 'context source authority regression')

marker = """test('详细页古籍条件对照不回流 contextMatch 防御说明', () => {
"""
p = Path(path)
text = p.read_text(encoding='utf-8')
if marker not in text:
    raise SystemExit('literature detail test marker missing')
new_test = """test('复制上下文古籍去重并只保留具体核对条件', () => {
    const chart = makeDingChart();
    const entries = baziLit.buildMatchedLiterature(
        chart.dayGan, chart.gans, chart.zhis, chart.pillars, chart.internalRelations, chart.monthSeason
    );
    const result = makeResult();
    result.matchedLiterature = entries;
    const output = baziInterpretation.buildBaziInterpretation(result);
    const text = baziInterpretation.buildBaziContextText(result, output);
    const literatureText = text.split('【古籍参考】')[1]?.split('【使用要求】')[0] || '';
    const count = (needle) => literatureText.split(needle).length - 1;
    assert(count('《三命通会》·卷八·六丁日己酉时断') === 1, '已有原文时仍重复输出《三命通会》定位条');
    assert(count('《八字提要》·丁日子月·己酉时') === 1, '已有原文时仍重复输出《八字提要》定位条');
    assert(literatureText.includes('原文点名天干核对') && literatureText.includes('甲未见于天干（未透）；藏干见于日柱亥'), '穷通宝鉴具体透藏核对被压缩丢失');
    assert(!/(这里只确认|不据此|不能直接视为|本程序|当前程序)/.test(literatureText), `古籍复制区仍重复防御叙述：${literatureText}`);
});

"""
p.write_text(text.replace(marker, new_test + marker, 1), encoding='utf-8')


# 5) Existing broad regression: lock transit-copy role separation and conditional completion wording.
path = 'tests/run-tests.js'
replace_once(path,
"""    assert(text.includes('结构证据：'), '岁运上下文缺结构证据');
    assert(text.includes('【使用要求】'), '岁运上下文缺使用要求');
    assert(!/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/.test(text), `岁运复制上下文泄露机器关系码：${text.match(/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/)?.[0] || ''}`);
""",
"""    assert(text.includes('结构证据：'), '岁运上下文缺结构证据');
    assert(text.includes('解释提示：') && text.includes('结构事实：'), '岁运上下文未区分解释提示与结构事实');
    assert(text.includes('【使用要求】'), '岁运上下文缺使用要求');
    assert(text.includes('仅在结构事实明确标记为补齐时说明结构补齐'), '岁运上下文未把补齐改为条件式措辞');
    assert(!text.includes('延续、补齐、再次参与与新增关系'), '岁运上下文仍无条件要求寻找结构补齐');
    assert(!/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/.test(text), `岁运复制上下文泄露机器关系码：${text.match(/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/)?.[0] || ''}`);
""", 'transit context regression')
