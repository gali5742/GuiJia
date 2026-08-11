// GuiJia application shell. Domain rules, timing builders, interpretation engines, and detail builders live in sibling modules under ./js/.
    const { createApp, ref, reactive, computed, watch } = Vue;
    const { formatNaturalCount = (value) => String(value) } = window.GuiJia?.common || {};

    const literatureLevelOrder = { exact: 0, structure: 1, method: 2 };
    const literatureLevelLabels = { exact: '精确', structure: '结构', method: '方法' };
    const resolveLiteratureLevelKey = (item) => {
        if (['exact', 'structure', 'method'].includes(item?.levelKey)) return item.levelKey;
        return ({ '精确结构': 'exact', '精确匹配': 'exact', '结构匹配': 'structure', '方法参考': 'method', '条目定位': 'method' })[item?.level] || 'method';
    };

    // 八字、六爻共用同一套古籍“总览 / 单书分览”浏览组件。
    // 领域 matcher 只负责返回条目；本组件只做排序、按书聚合与展示，不参与命理判断。
    const LiteratureBrowser = {
        template: '#literature-browser-template',
        props: {
            modelValue: { type: String, default: '总览' },
            entries: { type: Array, default: () => [] },
            intro: { type: String, default: '' },
            emptyText: { type: String, default: '当前暂无匹配的古籍文段或条目定位。' }
        },
        emits: ['update:modelValue'],
        setup(props, { emit }) {
            const normalizedEntries = computed(() => [...(props.entries || [])]
                .map((item) => {
                    const isLocator = item.excerptType === 'locator' || item.verified === false || item.sourceKind === '原典定位';
                    return {
                        ...item,
                        _levelKey: resolveLiteratureLevelKey(item),
                        _isLocator: isLocator,
                        _sourceLabel: isLocator ? '条目定位' : '已核对来源',
                        _sourceAction: isLocator ? '查看原典入口 ↗' : '查看核对来源 ↗'
                    };
                })
                .sort((a, b) => (literatureLevelOrder[a._levelKey] ?? 9) - (literatureLevelOrder[b._levelKey] ?? 9)));

            const books = computed(() => [...new Set(normalizedEntries.value.map((item) => item.book).filter(Boolean))]);
            const activeFilter = computed(() => {
                const value = props.modelValue || '总览';
                return value === '总览' || books.value.includes(value) ? value : '总览';
            });
            const filteredEntries = computed(() => activeFilter.value === '总览'
                ? []
                : normalizedEntries.value.filter((item) => item.book === activeFilter.value));
            const counts = computed(() => {
                const result = { total: normalizedEntries.value.length, exact: 0, structure: 0, method: 0, verified: 0, locator: 0 };
                normalizedEntries.value.forEach((item) => {
                    if (result[item._levelKey] !== undefined) result[item._levelKey] += 1;
                    if (item._isLocator) result.locator += 1;
                    else result.verified += 1;
                });
                return result;
            });
            const overview = computed(() => books.value.map((book) => {
                const items = normalizedEntries.value.filter((item) => item.book === book);
                const levelCounts = { exact: 0, structure: 0, method: 0 };
                let verified = 0;
                let locator = 0;
                items.forEach((item) => {
                    levelCounts[item._levelKey] += 1;
                    if (item._isLocator) locator += 1;
                    else verified += 1;
                });
                const chapters = [...new Set(items.map((item) => item.chapter).filter(Boolean))];
                const levelText = Object.entries(levelCounts)
                    .filter(([, count]) => count > 0)
                    .map(([key, count]) => `${literatureLevelLabels[key]} ${count}`)
                    .join(' · ');
                return {
                    book,
                    count: items.length,
                    verified,
                    locator,
                    levelText,
                    chapterText: `${chapters.slice(0, 3).join('、')}${chapters.length > 3 ? ` 等 ${formatNaturalCount(chapters.length)}个条目` : ''}`
                };
            }));
            const selectBook = (book) => emit('update:modelValue', book);
            return { normalizedEntries, books, activeFilter, filteredEntries, counts, overview, selectBook };
        }
    };

    createApp({
        components: { LiteratureBrowser },
        setup() {
            const {
                parseLocalDateTime, formatWallDateTime, formatInputDateTime, civilTimeBranch, formatSignedMinutes, buildSolarCorrection
            } = window.GuiJia.common;
            const {
                shiShenMap, cangGanMap, palaceMap, getWuXing, getColorClass, getStatusClass,
                getShiShenExplanation, getRelationTagClass, calculateInternalChartRelations,
                buildMonthSeason, buildDayMasterEvidence, buildShenSha
            } = window.GuiJia.baziCore;
            const {
                buildYunProfile, buildLiuNianList, buildLiuYueList,
                getAvailableYearRange, findDaYunIndexForYear, findDaYunIndexForDate
            } = window.GuiJia.baziTiming;
            const {
                buildDaYunAnalysis, buildLiuNianAnalysis, buildLiuYueAnalysis, buildBaziTransitContextText
            } = window.GuiJia.baziTransitAnalysis;
            const { buildMatchedLiterature } = window.GuiJia.baziLiterature;
            const { buildBaziInterpretation, buildBaziContextText } = window.GuiJia.baziInterpretation;
            const { buildBaziDetail } = window.GuiJia.baziDetail;
            const {
                lineKey, getHexagram, liuyaoPalaceMap, naJiaForLines, sixRelation, sixSpirits,
                buildLiuYaoLineStatus, buildMoveAnalysis, buildFullHexagramStructure, buildFlyingHidden,
                USE_GOD_FOCUS_OPTIONS, useGodFocusOptionByTarget, useGodFocusOptionById, resolveUseGodFocus,
                suggestUseGod, buildUseGodChoices, buildUseGodAnalysis, zhouyiSourceUrl, buildQuestionTimeFocus, buildTimingCandidates
            } = window.GuiJia.liuyaoCore;
            const { buildLiuYaoLiterature } = window.GuiJia.liuyaoLiterature;
            const { buildLiuYaoInterpretation, buildLiuYaoContextText } = window.GuiJia.liuyaoInterpretation;
            const { ichingTextRecords, ichingTextState } = window.GuiJia.createIChingLoader(ref, reactive);


            const now = new Date();
            const browserUtcOffset = -now.getTimezoneOffset() / 60;

            const form = reactive({
                gender: '1',
                daySect: '2',
                yunSect: '1',
                birthPlace: '',
                solarTimeMode: 'none',
                longitude: '',
                utcOffset: browserUtcOffset,
                dstMinutes: 0,
                datetime: formatInputDateTime(now)
            });

            const activeModule = ref('bazi');
            const currentPage = ref('input');
            const baziResultView = ref('overview');
            const liuyaoResultView = ref('overview');
            const liuyaoDaySectStorageKey = 'guijia.liuyao.daySect';
            const readStoredLiuYaoDaySect = () => {
                try {
                    const stored = window.localStorage?.getItem(liuyaoDaySectStorageKey);
                    return stored === '1' ? '1' : '2';
                } catch (error) {
                    return '2';
                }
            };
            const liuyaoForm = reactive({
                question: '',
                datetime: formatInputDateTime(now),
                daySect: readStoredLiuYaoDaySect(),
                lines: [null, null, null, null, null, null]
            });
            watch(() => liuyaoForm.daySect, (value) => {
                const normalized = value === '1' ? '1' : '2';
                if (liuyaoForm.daySect !== normalized) liuyaoForm.daySect = normalized;
                try { window.localStorage?.setItem(liuyaoDaySectStorageKey, normalized); } catch (error) { /* localStorage 不可用时保持当前会话设置 */ }
            });
            const liuyaoLateZiHour = computed(() => {
                try {
                    const value = parseLocalDateTime(liuyaoForm.datetime);
                    return value.getHours() === 23;
                } catch (error) {
                    return false;
                }
            });
            const yaoPositionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
            const liuyaoResult = ref(null);
            const selectedUseGodKey = ref('');
            const selectedUseGodFocusId = ref('');
            const useGodFocusFeedback = ref('');
            const result = ref(null);
            const errorMsg = ref('');
            const activeDaYunIndex = ref(0);
            const activeLiuNianList = ref([]);
            const activeLiuNianIndex = ref(0);
            const activeLiuYueList = ref([]);
            const activeLiuYueIndex = ref(0);
            const liuYueMsg = ref('');
            const liuYueError = ref('');
            const queryYear = ref(now.getFullYear());
            const yearQueryMsg = ref('');
            const yearQueryError = ref(false);
            const literatureTab = ref(2);
            const copyBaziContextStatus = ref('');
            const copyBaziTransitContextStatus = ref('');
            const copyLiuYaoContextStatus = ref('');

            const solarCorrectionPreview = computed(() => {
                if (form.solarTimeMode === 'none') return { valid: true };
                try {
                    const civilDate = parseLocalDateTime(form.datetime);
                    const correction = buildSolarCorrection(civilDate, form);
                    const meridian = correction.standardMeridian;
                    return {
                        valid: true,
                        civilText: formatWallDateTime(civilDate),
                        adjustedText: formatWallDateTime(correction.adjustedDate),
                        standardMeridianText: `${Math.abs(meridian).toFixed(2)}°${meridian >= 0 ? 'E' : 'W'}`,
                        longitudeText: formatSignedMinutes(correction.longitudeMinutes),
                        equationText: formatSignedMinutes(correction.equationMinutes),
                        dstText: formatSignedMinutes(correction.dstAdjustment),
                        totalText: formatSignedMinutes(correction.totalMinutes)
                    };
                } catch (error) {
                    return { valid: false, message: error.message };
                }
            });

            const normalizeInitialHash = () => {
                const validHashes = new Set(['#bazi', '#bazi-result', '#liuyao', '#liuyao-result']);
                if (!validHashes.has(window.location.hash)) {
                    window.history.replaceState({ page: 'input', module: 'bazi' }, '', '#bazi');
                }
            };
            const applyHashState = () => {
                const hash = window.location.hash;
                const module = hash.startsWith('#liuyao') ? 'liuyao' : 'bazi';
                const wantsResult = hash.endsWith('-result');
                const hasResult = module === 'liuyao' ? Boolean(liuyaoResult.value) : Boolean(result.value);
                activeModule.value = module;
                currentPage.value = wantsResult && hasResult ? 'result' : 'input';
                if (wantsResult && !hasResult) {
                    window.history.replaceState({ page: 'input', module }, '', `#${module}`);
                }
            };
            normalizeInitialHash();
            applyHashState();
            const navigateTo = (page, { replace = false, module = activeModule.value } = {}) => {
                activeModule.value = module;
                currentPage.value = page;
                const hash = page === 'result' ? `#${module}-result` : `#${module}`;
                const method = replace ? 'replaceState' : 'pushState';
                window.history[method]({ page, module }, '', hash);
                window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            };
            const goToInput = () => navigateTo('input', { replace: true, module: activeModule.value });
            const setBaziResultView = (view) => {
                baziResultView.value = ['overview', 'detail', 'timing'].includes(view) ? view : 'overview';
                requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            };
            const setLiuyaoResultView = (view) => {
                liuyaoResultView.value = view === 'detail' ? 'detail' : 'overview';
                requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            };
            const switchModule = (module) => {
                errorMsg.value = '';
                navigateTo('input', { replace: true, module });
            };
            window.addEventListener('popstate', () => {
                applyHashState();
                window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
            });

            const activeDaYun = computed(() => result.value?.daYunList?.[activeDaYunIndex.value] || null);
            const activeLiuNian = computed(() => activeLiuNianList.value[activeLiuNianIndex.value] || null);
            const activeLiuYue = computed(() => activeLiuYueList.value[activeLiuYueIndex.value] || null);
            const activeDaYunAnalysis = computed(() => buildDaYunAnalysis(result.value, activeDaYun.value));
            const activeLiuNianAnalysis = computed(() => buildLiuNianAnalysis(result.value, activeDaYun.value, activeLiuNian.value));
            const activeLiuYueAnalysis = computed(() => buildLiuYueAnalysis(result.value, activeDaYun.value, activeLiuNian.value, activeLiuYue.value));

            const baziInterpretation = computed(() => buildBaziInterpretation(result.value));
            const baziDetail = computed(() => buildBaziDetail(result.value));

            const copyBaziAnalysisContext = async () => {
                const text = buildBaziContextText(result.value, baziInterpretation.value);
                if (!text) return;
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        textarea.setAttribute('readonly', '');
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        const copied = document.execCommand('copy');
                        textarea.remove();
                        if (!copied) throw new Error('浏览器未允许复制。');
                    }
                    copyBaziContextStatus.value = '已复制分析上下文';
                } catch (error) {
                    console.warn('复制分析上下文失败', error);
                    copyBaziContextStatus.value = '复制失败，请手动选择文本';
                }
                window.setTimeout(() => { copyBaziContextStatus.value = ''; }, 2200);
            };

            const copyBaziTransitAnalysisContext = async () => {
                const text = buildBaziTransitContextText(result.value, baziInterpretation.value, {
                    daYun: activeDaYun.value,
                    liuNian: activeLiuNian.value,
                    liuYue: activeLiuYue.value,
                    daYunAnalysis: activeDaYunAnalysis.value,
                    liuNianAnalysis: activeLiuNianAnalysis.value,
                    liuYueAnalysis: activeLiuYueAnalysis.value
                });
                if (!text) return;
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        textarea.setAttribute('readonly', '');
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        const copied = document.execCommand('copy');
                        textarea.remove();
                        if (!copied) throw new Error('浏览器未允许复制。');
                    }
                    copyBaziTransitContextStatus.value = '已复制岁运上下文';
                } catch (error) {
                    console.warn('复制岁运上下文失败', error);
                    copyBaziTransitContextStatus.value = '复制失败，请手动选择文本';
                }
                window.setTimeout(() => { copyBaziTransitContextStatus.value = ''; }, 2200);
            };

            const availableYearRange = computed(() => getAvailableYearRange(result.value?.daYunList || []));

            const selectLiuYue = (index) => {
                if (index < 0 || index >= activeLiuYueList.value.length) return;
                activeLiuYueIndex.value = index;
                liuYueMsg.value = '';
            };
            const buildActiveLiuYueList = () => {
                activeLiuYueList.value = [];
                activeLiuYueIndex.value = 0;
                liuYueError.value = '';
                liuYueMsg.value = '';
                const liuNian = activeLiuNian.value;
                const daYun = activeDaYun.value;
                const { items, error } = buildLiuYueList(liuNian, daYun, result.value || {}, { daYunList: result.value?.daYunList || [daYun] });
                if (error) {
                    liuYueError.value = error;
                    return;
                }
                activeLiuYueList.value = items;
                const currentIndex = activeLiuYueList.value.findIndex((item) => item.isCurrent);
                activeLiuYueIndex.value = currentIndex >= 0 ? currentIndex : 0;
            };

            const selectLiuNian = (index) => {
                if (index < 0 || index >= activeLiuNianList.value.length) return;
                activeLiuNianIndex.value = index;
                buildActiveLiuYueList();
            };
            const jumpToCurrentLiuYue = () => {
                const index = activeLiuYueList.value.findIndex((item) => item.isCurrent);
                if (index >= 0) {
                    activeLiuYueIndex.value = index;
                    liuYueMsg.value = '已定位到当前节令流月。';
                } else {
                    liuYueMsg.value = '当前日期不在所选流年的节令范围内；请先切换到当前流年。';
                }
            };

            const selectDaYun = (index, daYunObj, preferredYear = null) => {
                activeDaYunIndex.value = index;
                activeLiuNianIndex.value = 0;
                activeLiuYueList.value = [];
                activeLiuYueIndex.value = 0;
                liuYueMsg.value = '';
                liuYueError.value = '';
                if (!daYunObj?.rawObj) { activeLiuNianList.value = []; return; }
                activeLiuNianList.value = buildLiuNianList(daYunObj, result.value || {}, { daYunList: result.value?.daYunList || [daYunObj] });
                if (Number.isFinite(preferredYear)) {
                    const preferredIndex = activeLiuNianList.value.findIndex((item) => item.year === preferredYear);
                    activeLiuNianIndex.value = preferredIndex >= 0 ? preferredIndex : 0;
                }
                buildActiveLiuYueList();
            };

            const jumpToYear = () => {
                yearQueryMsg.value = '';
                yearQueryError.value = false;
                if (!result.value?.daYunList?.length) { yearQueryError.value = true; yearQueryMsg.value = '请先完成排盘。'; return; }
                const targetYear = Number(queryYear.value);
                if (!Number.isInteger(targetYear)) { yearQueryError.value = true; yearQueryMsg.value = '请输入完整的公历年份。'; return; }
                const matchedDaYunIndex = findDaYunIndexForYear(result.value.daYunList, targetYear);
                if (matchedDaYunIndex < 0) {
                    yearQueryError.value = true;
                    const { min, max } = availableYearRange.value;
                    yearQueryMsg.value = min && max ? `当前排盘可查询 ${min}—${max} 年，${targetYear} 年不在已生成范围内。` : `未找到 ${targetYear} 年对应的大运流年。`;
                    return;
                }
                selectDaYun(matchedDaYunIndex, result.value.daYunList[matchedDaYunIndex], targetYear);
                const matchedYear = activeLiuNianList.value[activeLiuNianIndex.value];
                yearQueryMsg.value = matchedYear?.isTransitionYear
                    ? `已定位到 ${targetYear} 年；该流年跨越大运交接。`
                    : `已定位到 ${targetYear} 年及其所在大运。`;
            };
            const jumpToCurrentYear = () => {
                const currentDate = new Date();
                queryYear.value = currentDate.getFullYear();
                const exactIndex = findDaYunIndexForDate(result.value?.daYunList || [], currentDate);
                if (exactIndex >= 0) {
                    selectDaYun(exactIndex, result.value.daYunList[exactIndex], currentDate.getFullYear());
                    yearQueryMsg.value = `已按当前日期定位到 ${currentDate.getFullYear()} 年及实际所在大运。`;
                    yearQueryError.value = false;
                    return;
                }
                jumpToYear();
            };


            const literatureNotes = [
                {
                    title: '穷通宝鉴',
                    focus: '调候与月令气候',
                    text: '按日干与月令季节定位对应章节，再由具体月份细读寒暖燥湿；页面只呈现已核对的季节入口，不直接推出调候用神。',
                    boundary: '同一季内三个月仍有明显差异；季节入口不能替代逐月原文，也不能脱离全局透藏、根气与制化。'
                },
                {
                    title: '滴天髓',
                    focus: '气势、旺衰与通变',
                    text: '得令、通根、透干、方局分开陈列，避免把单一季节标签或五行数量直接等同为强弱结论。',
                    boundary: '“旺中有衰、衰中有旺”的通变需要综合判断，此处只列结构证据。'
                },
                {
                    title: '三命通会',
                    focus: '旺相休囚死、十二长生与神煞',
                    text: '卷八按日干与时柱直接定位日时条目；五行季节状态仍参照卷二旺相休囚死的解释边界。',
                    boundary: '日时条只是进入原文的索引，年月条件与六个日支细分仍需继续核对；生旺休囚也不直接等同吉凶。'
                },
                {
                    title: '八字提要',
                    focus: '日干、月支与时辰的观察次序',
                    text: '按日干、月支与时辰建立条目定位；已逐字核对的条目显示摘录，尚未转录全文的组合只显示定位。',
                    boundary: '条目定位不是断语；年柱、日支、会合及全局条件仍需另行判断，也不会用程序拟写未核对的原文。'
                },
                {
                    title: '子平真诠',
                    focus: '月令、格局与用神入口',
                    text: '月令与月支藏干层级、十神并列展示，作为判断格局的观察入口。',
                    boundary: '格局是否成立、清纯或破格需要通盘判断，不能据单项信息直接定格局与用神。'
                },
                {
                    title: '渊海子平',
                    focus: '日主、提纲、四柱位置与传统法则',
                    text: '宫位提示与部分神煞查法参考其相关篇章，同时保留“先看提纲、再合年日时”的观察顺序。',
                    boundary: '宫位与六亲分配在不同传承中存在差异，因此界面统一标为“宫位参考”。'
                },
                {
                    title: '千里命稿',
                    focus: '近代术语整理与命例校验',
                    text: '用于对照近代排盘术语、根气和命例中的综合判断方式；胎元、命宫、身宫仅作为辅助信息。',
                    boundary: '命例结论不能直接迁移到相同单柱或单一神煞，不据此作类比断语。'
                }
            ];
            const activeLiterature = computed(() => literatureNotes[literatureTab.value] || literatureNotes[0]);
            const literatureFilter = ref('总览');
            const liuyaoLiteratureFilter = ref('总览');
            const openLiterature = (book, index = null) => {
                if (Number.isInteger(index)) literatureTab.value = index;
                literatureFilter.value = book;
                requestAnimationFrame(() => {
                    const target = document.getElementById('matched-literature');
                    if (target) {
                        target.open = true;
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            };



            // 六爻装卦：八宫、纳甲、世应、六亲与六神
            const selectedUseGodTarget = computed(() => {
                const choices = liuyaoResult.value?.useGodChoices || [];
                return choices.find((item) => item.key === selectedUseGodKey.value) || null;
            });
            const useGodAnalysis = computed(() => buildUseGodAnalysis(selectedUseGodTarget.value, liuyaoResult.value));
            const useGodSelectionIsDisplayStart = computed(() => {
                const selection = liuyaoResult.value?.useGodSelection;
                return selection?.specificity === 'display-start' && Number(selection?.candidateCount || 0) > 1;
            });
            const useGodSelectionIsTravel = computed(() => liuyaoResult.value?.useGodSelection?.focusId === 'travel');
            const useGodSelectionIsObservation = computed(() => useGodSelectionIsDisplayStart.value || useGodSelectionIsTravel.value);
            const useGodTargetLocationText = computed(() => {
                const target = useGodAnalysis.value?.target;
                if (!target) return '';
                if (!useGodSelectionIsObservation.value) return target.sourceText || '';
                const labels = ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
                const position = target.type === 'hidden'
                    ? `${labels[target.position] || ''}下伏`
                    : `${labels[target.position] || ''}${target.isShi ? '（世）' : ''}${target.isYing ? '（应）' : ''}`;
                return [position, target.sourceText].filter(Boolean).join(' · ');
            });
            const liuyaoKeyStructures = computed(() => {
                const chart = liuyaoResult.value;
                if (!chart?.fullStructure) return [];
                const full = chart.fullStructure;
                const items = [];
                const add = (text, type = 'neutral') => {
                    if (!text || items.some((item) => item.text === text)) return;
                    items.push({ text, type });
                };

                if (full.originalNatureCode !== 'NEUTRAL' || full.changedNatureCode !== 'NEUTRAL') {
                    add(full.transition, 'transform');
                }
                (full.shiYing?.tags || []).filter((tag) => tag.type !== 'neutral').forEach((tag) => add(tag.text, tag.type));
                (full.sanHe?.complete || []).forEach((text) => add(text, 'transform'));
                (full.fanFu || []).forEach((text) => add(text, 'trigger'));

                const movingSignals = (chart.lines || [])
                    .filter((line) => line.moving)
                    .flatMap((line) => (line.moveTags || [])
                        .filter((tag) => ['support','constraint','trigger','void','transform'].includes(tag.type))
                        .map((tag) => ({ text: `${line.label}：${tag.text}`, type: tag.type })));
                movingSignals.slice(0, 2).forEach((item) => add(item.text, item.type));

                if (!items.length) {
                    const shiYingTag = full.shiYing?.tags?.[0];
                    if (shiYingTag) add(`世应：${shiYingTag.text}`, shiYingTag.type || 'neutral');
                    if ((full.sanHe?.pending || []).length) add(full.sanHe.pending[0], 'neutral');
                    if (!items.length) add(chart.movingText || '当前无特殊全卦结构提示', 'neutral');
                }
                return items.slice(0, 4);
            });
            const useGodFocusOptions = computed(() => {
                const chart = liuyaoResult.value;
                if (!chart) return [];
                return USE_GOD_FOCUS_OPTIONS.map((option) => {
                    const resolution = resolveUseGodFocus(option.target, chart.lines || [], chart.flyingHidden || []);
                    return {
                        ...option,
                        ...resolution,
                        countLabel: resolution.count ? `${formatNaturalCount(resolution.count)}处候选` : '当前未见候选'
                    };
                });
            });
            const setUseGodSelectionMeta = (meta = {}) => {
                if (!liuyaoResult.value) return;
                liuyaoResult.value.useGodSelection = {
                    mode: meta.mode || 'manual',
                    focusId: meta.focusId || '',
                    focusLabel: meta.focusLabel || '',
                    target: meta.target || '',
                    key: selectedUseGodKey.value || '',
                    candidateCount: Number(meta.candidateCount || 0),
                    specificity: meta.specificity || 'specific',
                    categoryConfidence: meta.categoryConfidence || ''
                };
            };
            const focusChoiceLabel = (key) => liuyaoResult.value?.useGodChoices?.find((item) => item.key === key)?.label || '';
            const selectUseGodFocus = (focusId) => {
                const chart = liuyaoResult.value;
                const option = USE_GOD_FOCUS_OPTIONS.find((item) => item.id === focusId);
                if (!chart || !option) return;
                const resolution = resolveUseGodFocus(option.target, chart.lines || [], chart.flyingHidden || []);
                if (!resolution.available) {
                    selectedUseGodFocusId.value = '';
                    useGodFocusFeedback.value = `本卦明爻及已列伏神候选中暂未见“${option.target}”候选，当前观察对象未切换。可以改选其他观察重点，或展开下方手动选择具体爻。`;
                    return;
                }
                selectedUseGodFocusId.value = option.id;
                selectedUseGodKey.value = resolution.suggestedUseKey;
                const choiceLabel = focusChoiceLabel(resolution.suggestedUseKey);
                if (resolution.count > 1) {
                    useGodFocusFeedback.value = `这一观察重点在本卦有${formatNaturalCount(resolution.count)}处候选，当前先以${choiceLabel}展开；同类候选会完整保留在盘面中，也可以在下方调整具体爻。`;
                } else {
                    useGodFocusFeedback.value = `已按“${option.label}”切换到${choiceLabel}。`;
                }
                setUseGodSelectionMeta({
                    mode:'focus',
                    focusId:option.id,
                    focusLabel:option.label,
                    target:option.target,
                    candidateCount:resolution.count,
                    specificity:resolution.count > 1 ? 'display-start' : 'specific',
                    categoryConfidence:'user-selected'
                });
            };
            const applySuggestedUseGod = () => {
                const suggestion = liuyaoResult.value?.useGodSuggestion;
                if (!suggestion?.suggestedUseKey) return;
                selectedUseGodKey.value = suggestion.suggestedUseKey;
                const focusOption = useGodFocusOptionById(suggestion.focusId) || useGodFocusOptionByTarget(suggestion.recommendedTarget);
                selectedUseGodFocusId.value = focusOption?.id || '';
                const choiceLabel = focusChoiceLabel(suggestion.suggestedUseKey);
                useGodFocusFeedback.value = suggestion.candidateCount > 1
                    ? `已采用【${suggestion.recommendedTarget}】取用类别；本卦有${formatNaturalCount(suggestion.candidateCount)}处候选，当前以${choiceLabel}作为展示起点。`
                    : (focusOption ? `已采用占问建议，并按“${focusOption.label}”作为当前观察重点。` : '已采用占问建议。');
                setUseGodSelectionMeta({
                    mode:'suggestion',
                    focusId:focusOption?.id || '',
                    focusLabel:focusOption?.label || '',
                    target:suggestion.recommendedTarget || '',
                    candidateCount:suggestion.candidateCount || 0,
                    specificity:suggestion.candidateCount > 1 ? 'display-start' : 'specific',
                    categoryConfidence:'high'
                });
            };
            const onManualUseGodChange = () => {
                selectedUseGodFocusId.value = '';
                useGodFocusFeedback.value = '';
                const choice = selectedUseGodTarget.value;
                setUseGodSelectionMeta({ mode:'manual', target:choice?.relation || '' });
            };

            const currentIChingText = computed(() => {
                const resultObj = liuyaoResult.value;
                if (!resultObj || !ichingTextRecords.value.length) return null;
                const original = ichingTextRecords.value.find((item) => item.name === resultObj.original.name);
                const changed = ichingTextRecords.value.find((item) => item.name === resultObj.changed.name);
                if (!original || !changed) return null;
                const movingPositions = resultObj.lines.filter((line) => line.moving).map((line) => line.position);
                const movingLines = (original.lines || []).filter((line) => movingPositions.includes(line.id) && line.id <= 6);
                const allMoving = movingPositions.length === 6;
                const specialLine = allMoving && ['乾','坤'].includes(original.name)
                    ? (original.lines || []).find((line) => line.id === 7) || null
                    : null;
                return {
                    original: { ...original, url: zhouyiSourceUrl(original.name) },
                    changed: { ...changed, url: zhouyiSourceUrl(changed.name) },
                    movingLines,
                    specialLine
                };
            });

            const questionTimeFocus = computed(() => buildQuestionTimeFocus(liuyaoResult.value, selectedUseGodTarget.value));
            const timingCandidates = computed(() => buildTimingCandidates(selectedUseGodTarget.value, liuyaoResult.value));

            // v13.16 — 六爻古籍检索：结构特征 -> 文献数据 -> 通用 matcher。
            // 文献正文与匹配逻辑分离；未逐字核对的内容只作为“原典定位”，不伪装成原文摘录。
            const liuyaoLiterature = computed(() => buildLiuYaoLiterature(liuyaoResult.value, selectedUseGodTarget.value));
            const liuyaoInterpretation = computed(() => buildLiuYaoInterpretation(
                liuyaoResult.value,
                selectedUseGodTarget.value,
                useGodAnalysis.value,
                timingCandidates.value
            ));
            const copyLiuYaoAnalysisContext = async () => {
                const text = buildLiuYaoContextText(
                    liuyaoResult.value,
                    selectedUseGodTarget.value,
                    useGodAnalysis.value,
                    liuyaoInterpretation.value,
                    timingCandidates.value,
                    liuyaoLiterature.value,
                    questionTimeFocus.value
                );
                if (!text) return;
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        textarea.setAttribute('readonly', '');
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        const copied = document.execCommand('copy');
                        textarea.remove();
                        if (!copied) throw new Error('浏览器未允许复制。');
                    }
                    copyLiuYaoContextStatus.value = '已复制分析上下文';
                } catch (error) {
                    console.warn('复制六爻分析上下文失败', error);
                    copyLiuYaoContextStatus.value = '复制失败，请手动选择文本';
                }
                window.setTimeout(() => { copyLiuYaoContextStatus.value = ''; }, 2200);
            };

            const simulateCoinLine = () => {
                let total = 0;
                for (let index = 0; index < 3; index += 1) total += Math.random() < 0.5 ? 2 : 3;
                return total;
            };
            const simulateAllLines = () => {
                for (let index = 0; index < 6; index += 1) liuyaoForm.lines[index] = simulateCoinLine();
            };
            const hasEnteredLiuYaoLines = computed(() => liuyaoForm.lines.some((value) => value != null));
            const clearLiuYaoLines = () => {
                if (!hasEnteredLiuYaoLines.value) return;
                if (!window.confirm('清空已录入的六爻结果？此操作无法撤销。')) return;
                for (let index = 0; index < 6; index += 1) liuyaoForm.lines[index] = null;
            };
            const calculateLiuYao = () => {
                errorMsg.value = '';
                copyLiuYaoContextStatus.value = '';
                try {
                    const rawValues = liuyaoForm.lines.map((value) => Number(value));
                    if (rawValues.some((value) => ![6,7,8,9].includes(value))) throw new Error('请完整录入六爻结果（6、7、8、9）。');
                    const castDate = parseLocalDateTime(liuyaoForm.datetime);
                    const solar = Solar.fromDate(castDate);
                    const lunar = solar.getLunar();
                    const eightChar = lunar.getEightChar();
                    const liuyaoDaySect = liuyaoForm.daySect === '1' ? 1 : 2;
                    eightChar.setSect(liuyaoDaySect);
                    const dayChangeLabel = liuyaoDaySect === 1 ? '23:00 子初换日' : '24:00 换日（默认）';
                    const monthGan = eightChar.getMonthGan();
                    const monthZhi = eightChar.getMonthZhi();
                    const monthGanZhi = `${monthGan}${monthZhi}`;
                    const dayGan = eightChar.getDayGan();
                    const dayZhi = eightChar.getDayZhi();
                    const dayGanZhi = `${dayGan}${dayZhi}`;
                    const xunKong = eightChar.getDayXunKong();
                    const originalLines = rawValues.map((value) => value === 7 || value === 9);
                    const moving = rawValues.map((value) => value === 6 || value === 9);
                    const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
                    const original = getHexagram(originalLines);
                    const changed = getHexagram(changedLines);
                    const palace = liuyaoPalaceMap[lineKey(originalLines)];
                    if (!palace) throw new Error('未能识别本卦八宫归属。');
                    const originalNaJia = naJiaForLines(originalLines);
                    const changedNaJia = naJiaForLines(changedLines);
                    const spirits = sixSpirits(dayGan);
                    const labels = ['初爻','二爻','三爻','四爻','五爻','上爻'];
                    const rows = rawValues.map((value, index) => {
                        const originalLine = originalNaJia[index];
                        const changedLine = changedNaJia[index];
                        const status = buildLiuYaoLineStatus(originalLine, monthZhi, dayZhi, xunKong, moving[index]);
                        return {
                            position: index + 1,
                            label: labels[index],
                            spirit: spirits[index],
                            relation: sixRelation(originalLine.element, palace.element),
                            stem: originalLine.stem,
                            branch: originalLine.branch,
                            element: originalLine.element,
                            naJia: originalLine.text,
                            originalYang: originalLines[index],
                            changedYang: changedLines[index],
                            changedRelation: sixRelation(changedLine.element, palace.element),
                            changedStem: changedLine.stem,
                            changedBranch: changedLine.branch,
                            changedElement: changedLine.element,
                            changedNaJia: changedLine.text,
                            moving: moving[index],
                            moveMark: value === 9 ? '○' : (value === 6 ? '×' : ''),
                            isShi: palace.shi === index + 1,
                            isYing: palace.ying === index + 1,
                            seasonState: status.seasonState,
                            statusTags: status.tags,
                            moveTags: moving[index] ? buildMoveAnalysis(originalLine, changedLine, monthZhi, xunKong) : []
                        };
                    });
                    const movingPositions = rows.filter((row) => row.moving).map((row) => row.label);
                    const nuclearLines = [originalLines[1], originalLines[2], originalLines[3], originalLines[2], originalLines[3], originalLines[4]];
                    const flyingHidden = buildFlyingHidden(rows, palace, monthZhi, dayZhi, xunKong);
                    const useGodSuggestion = suggestUseGod(liuyaoForm.question, rows, flyingHidden);
                    const useGodChoices = buildUseGodChoices(rows, flyingHidden);
                    liuyaoResult.value = {
                        question: liuyaoForm.question,
                        solarText: formatWallDateTime(castDate),
                        lunarText: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${civilTimeBranch(castDate) || lunar.getTimeZhi()}时`,
                        monthGanZhi,
                        monthZhi,
                        dayGanZhi,
                        dayGan,
                        dayZhi,
                        dayXun: eightChar.getDayXun?.() || '',
                        daySect: liuyaoDaySect,
                        dayChangeLabel,
                        castTimestamp: castDate.getTime(),
                        xunKong,
                        original,
                        changed,
                        nuclear: getHexagram(nuclearLines),
                        opposite: getHexagram(originalLines.map((value) => !value)),
                        reversed: getHexagram([...originalLines].reverse()),
                        palace,
                        movingText: movingPositions.length ? movingPositions.join('、') : '静卦（无动爻）',
                        lines: rows,
                        displayLines: [...rows].reverse(),
                        fullStructure: buildFullHexagramStructure(rows, originalNaJia, changedNaJia, monthZhi, dayZhi),
                        flyingHidden,
                        useGodSuggestion,
                        useGodChoices,
                        useGodSelection: null,
                        seasonalRuleNote: ['辰','戌','丑','未'].includes(monthZhi) ? '四季土月按“土旺、金相、火休、木囚、水死”列示。' : '旺相休囚死仅用于观察月令季节态势，不等同于完整强弱结论。'
                    };
                    liuyaoLiteratureFilter.value = '总览';
                    selectedUseGodKey.value = useGodSuggestion.suggestedUseKey || useGodChoices[0]?.key || '';
                    const suggestedFocus = useGodSuggestion.canApplySuggestion ? (useGodFocusOptionById(useGodSuggestion.focusId) || useGodFocusOptionByTarget(useGodSuggestion.recommendedTarget)) : null;
                    selectedUseGodFocusId.value = suggestedFocus?.id || '';
                    useGodFocusFeedback.value = '';
                    liuyaoResult.value.useGodSelection = suggestedFocus
                        ? {
                            mode:'suggestion',
                            focusId:suggestedFocus.id,
                            focusLabel:suggestedFocus.label,
                            target:useGodSuggestion.recommendedTarget || suggestedFocus.target,
                            key:selectedUseGodKey.value,
                            candidateCount:useGodSuggestion.candidateCount || 0,
                            specificity:(useGodSuggestion.candidateCount || 0) > 1 ? 'display-start' : 'specific',
                            categoryConfidence:'high'
                        }
                        : { mode:'default', focusId:'', focusLabel:'', target:'世', key:selectedUseGodKey.value, candidateCount:1, specificity:'display-start', categoryConfidence:'' };
                    liuyaoResultView.value = 'overview';
                    navigateTo('result', { module: 'liuyao' });
                } catch (error) {
                    console.error(error);
                    errorMsg.value = `六爻排盘出错：${error.message}`;
                }
            };

            const calculateBazi = () => {
                errorMsg.value = '';
                result.value = null;
                activeDaYunIndex.value = 0;
                activeLiuNianIndex.value = 0;
                activeLiuNianList.value = [];
                activeLiuYueList.value = [];
                activeLiuYueIndex.value = 0;
                liuYueMsg.value = '';
                liuYueError.value = '';
                queryYear.value = new Date().getFullYear();
                yearQueryMsg.value = '';
                yearQueryError.value = false;
                literatureFilter.value = '总览';

                try {
                    if (!form.datetime) throw new Error('请选择出生时间。');
                    const civilDateObj = parseLocalDateTime(form.datetime);
                    const correction = buildSolarCorrection(civilDateObj, form);
                    const dateObj = correction.adjustedDate;
                    const solar = Solar.fromDate(dateObj);
                    const lunar = solar.getLunar();
                    const baZi = lunar.getEightChar();
                    baZi.setSect(Number.parseInt(form.daySect, 10));

                    const dayGan = baZi.getDayGan();
                    const originalGans = [baZi.getYearGan(), baZi.getMonthGan(), baZi.getDayGan(), baZi.getTimeGan()];
                    const originalZhis = [baZi.getYearZhi(), baZi.getMonthZhi(), baZi.getDayZhi(), baZi.getTimeZhi()];
                    const pillarDefs = [
                        { title: '年柱', gan: originalGans[0], zhi: originalZhis[0], shishenGan: baZi.getYearShiShenGan(), naYin: baZi.getYearNaYin(), diShi: baZi.getYearDiShi(), xun: baZi.getYearXun(), xunKong: baZi.getYearXunKong() },
                        { title: '月柱', gan: originalGans[1], zhi: originalZhis[1], shishenGan: baZi.getMonthShiShenGan(), naYin: baZi.getMonthNaYin(), diShi: baZi.getMonthDiShi(), xun: baZi.getMonthXun(), xunKong: baZi.getMonthXunKong() },
                        { title: '日柱', gan: originalGans[2], zhi: originalZhis[2], shishenGan: '日主', naYin: baZi.getDayNaYin(), diShi: baZi.getDayDiShi(), xun: baZi.getDayXun(), xunKong: baZi.getDayXunKong() },
                        { title: '时柱', gan: originalGans[3], zhi: originalZhis[3], shishenGan: baZi.getTimeShiShenGan(), naYin: baZi.getTimeNaYin(), diShi: baZi.getTimeDiShi(), xun: baZi.getTimeXun(), xunKong: baZi.getTimeXunKong() }
                    ];
                    const pillars = pillarDefs.map((p) => ({
                        ...p,
                        ganZhi: p.gan + p.zhi,
                        ganWuXing: getWuXing(p.gan),
                        zhiWuXing: getWuXing(p.zhi),
                        palace: palaceMap[p.title],
                        cangGan: (cangGanMap[p.zhi] || []).map(([gan, level]) => ({ gan, level, wuxing: getWuXing(gan), shishen: shiShenMap[dayGan]?.[gan] || '' }))
                    }));

                    const internalRelations = calculateInternalChartRelations(originalGans, originalZhis);
                    const monthSeason = buildMonthSeason(originalZhis[1], getWuXing(dayGan));
                    const dayMasterEvidence = buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan);
                    const auxiliary = [
                        { name: '胎元', ganZhi: baZi.getTaiYuan(), naYin: baZi.getTaiYuanNaYin(), note: '由月柱推衍，常作先天辅助信息。' },
                        { name: '命宫', ganZhi: baZi.getMingGong(), naYin: baZi.getMingGongNaYin(), note: '按月支、时支推算，流派权重差异较大。' },
                        { name: '身宫', ganZhi: baZi.getShenGong(), naYin: baZi.getShenGongNaYin(), note: '按月支、时支推算，仅作辅助参照。' }
                    ].map((item) => ({ ...item, shiShen: shiShenMap[dayGan]?.[item.ganZhi.substring(0,1)] || '' }));

                    const { qiYunInfo, daYunList } = buildYunProfile(baZi, {
                        gender: form.gender,
                        yunSect: form.yunSect,
                        dayGan,
                        originalGans,
                        originalZhis
                    });


                    const daySectLabel = form.daySect === '1' ? '子初换日（23:00起按次日）' : '午夜换日（晚子时按当天）';
                    const yunSectLabel = form.yunSect === '2' ? '分钟细分起运' : '时辰折算起运';
                    const correctionDetailParts = [];
                    if (correction.mode !== 'none') {
                        correctionDetailParts.push(`${correction.modeLabel}，总修正 ${formatSignedMinutes(correction.totalMinutes)}`);
                        correctionDetailParts.push(`经度 ${formatSignedMinutes(correction.longitudeMinutes)}`);
                        if (correction.mode === 'apparent') correctionDetailParts.push(`均时差 ${formatSignedMinutes(correction.equationMinutes)}`);
                        if (correction.dstMinutes) correctionDetailParts.push(`夏令时 ${formatSignedMinutes(correction.dstAdjustment)}`);
                    }
                    result.value = {
                        civilStr: formatWallDateTime(civilDateObj),
                        solarStr: formatWallDateTime(dateObj),
                        birthPlace: form.birthPlace,
                        correctionApplied: correction.mode !== 'none',
                        timeCorrectionInfo: correctionDetailParts.join('；'),
                        lunarStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
                        ruleSummary: `年柱立春、月柱节令；${correction.modeLabel}；${daySectLabel}；${yunSectLabel}`,
                        dayGan,
                        dayGanWuXing: getWuXing(dayGan),
                        originalGans, originalZhis,
                        pillars,
                        internalRelations,
                        monthSeason,
                        dayMasterEvidence,
                        matchedLiterature: buildMatchedLiterature(dayGan, originalGans, originalZhis, pillars, internalRelations, monthSeason),
                        shenSha: buildShenSha(dayGan, originalZhis),
                        auxiliary,
                        qiYunInfo,
                        daYunList
                    };

                    if (daYunList.length > 0) {
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear();
                        let defaultIndex = findDaYunIndexForDate(daYunList, currentDate);
                        if (defaultIndex < 0) defaultIndex = daYunList.findIndex((item) => currentYear >= item.startYear && currentYear <= item.endYear);
                        if (defaultIndex < 0) defaultIndex = 0;
                        selectDaYun(defaultIndex, daYunList[defaultIndex], currentYear);
                    }
                    baziResultView.value = 'overview';
                    navigateTo('result', { module: 'bazi' });
                } catch (error) {
                    console.error(error);
                    errorMsg.value = `排盘出错：${error.message}`;
                }
            };

            const getPaddedCangGan = (cangGanList = []) => {
                const rows = Array.isArray(cangGanList)
                    ? cangGanList.slice(0, 3).map((item) => ({ ...item, empty: false }))
                    : [];
                while (rows.length < 3) {
                    rows.push({ gan: '', level: '', shishen: '', wuxing: '', empty: true });
                }
                return rows;
            };

            return {
                form, result, errorMsg, activeModule, currentPage, baziResultView, liuyaoResultView, solarCorrectionPreview, baziInterpretation, baziDetail, copyBaziAnalysisContext, copyBaziContextStatus, copyBaziTransitAnalysisContext, copyBaziTransitContextStatus, goToInput, setBaziResultView, setLiuyaoResultView, switchModule,
                liuyaoForm, liuyaoLateZiHour, liuyaoResult, selectedUseGodKey, selectedUseGodTarget, selectedUseGodFocusId, useGodFocusOptions, useGodFocusFeedback, useGodAnalysis, useGodSelectionIsDisplayStart, useGodSelectionIsTravel, useGodSelectionIsObservation, useGodTargetLocationText, liuyaoKeyStructures, liuyaoInterpretation,
                selectUseGodFocus, applySuggestedUseGod, onManualUseGodChange, questionTimeFocus, timingCandidates, liuyaoLiterature, liuyaoLiteratureFilter, copyLiuYaoAnalysisContext, copyLiuYaoContextStatus,
                ichingTextState, currentIChingText, zhouyiSourceUrl,
                yaoPositionLabels, hasEnteredLiuYaoLines, simulateAllLines, clearLiuYaoLines, calculateLiuYao,
                activeDaYunIndex, activeLiuNianList, activeLiuNianIndex,
                activeLiuYueList, activeLiuYueIndex, activeLiuYue, liuYueMsg, liuYueError,
                activeDaYun, activeLiuNian, activeDaYunAnalysis, activeLiuNianAnalysis, activeLiuYueAnalysis,
                queryYear, yearQueryMsg, yearQueryError, availableYearRange,
                literatureNotes, literatureTab, activeLiterature,
                literatureFilter, openLiterature,
                calculateBazi, getColorClass, getStatusClass, getPaddedCangGan, selectDaYun, selectLiuNian, selectLiuYue,
                jumpToYear, jumpToCurrentYear, jumpToCurrentLiuYue, getShiShenExplanation, getRelationTagClass
            };
        }
    }).mount('#app');
