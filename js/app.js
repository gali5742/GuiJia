// GuiJia v13.27 application shell. Domain rules live in sibling modules under ./js/.
    const { createApp, ref, reactive, computed } = Vue;

    createApp({
        setup() {
            const {
                parseLocalDateTime, formatWallDateTime, formatInputDateTime, formatSignedMinutes, buildSolarCorrection
            } = window.GuiJia.common;
            const {
                shiShenMap, cangGanMap, palaceMap, getWuXing, getColorClass, getStatusClass,
                getShiShenExplanation, getRelationTagClass, getNaYin, getDiShi, getXunInfo, calculateStemRelations,
                calculateBranchRelations, calculateInternalChartRelations, calculatePillarSignals, calculatePairRelations,
                calculateThreeLayerRelations, buildMonthSeason, buildDayMasterEvidence, buildShenSha,
                calculateFourLayerRelations
            } = window.GuiJia.baziCore;
            const { buildMatchedLiterature } = window.GuiJia.baziLiterature;
            const {
                lineKey, getHexagram, liuyaoPalaceMap, naJiaForLines, sixRelation, sixSpirits,
                buildLiuYaoLineStatus, buildMoveAnalysis, buildFullHexagramStructure, buildFlyingHidden,
                suggestUseGod, buildUseGodChoices, buildUseGodAnalysis, zhouyiSourceUrl, buildTimingCandidates
            } = window.GuiJia.liuyaoCore;
            const { buildLiuYaoLiterature } = window.GuiJia.liuyaoLiterature;
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
            const liuyaoForm = reactive({
                question: '',
                datetime: formatInputDateTime(now),
                lines: [null, null, null, null, null, null]
            });
            const yaoPositionLabels = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
            const liuyaoResult = ref(null);
            const selectedUseGodKey = ref('');
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
                baziResultView.value = view === 'timing' ? 'timing' : 'overview';
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

            const scoreBaziRelation = (relation) => {
                const scoreByCode = {
                    SAN_HUI_COMPLETE: 120,
                    SAN_HE_COMPLETE: 115,
                    PUNISHMENT_TRIAD_COMPLETE: 110,
                    SELF_PUNISHMENT: 86,
                    BRANCH_SIX_CLASH: 82,
                    STEM_FIVE_HARMONY: 78,
                    BRANCH_SIX_HARMONY: 72,
                    BRANCH_PUNISHMENT: 70,
                    BRANCH_SIX_HARM: 66,
                    BRANCH_SIX_BREAK: 62,
                    SAN_HE_PARTIAL: 52,
                    SAN_HUI_PARTIAL: 52,
                    STEM_CLASH: 48
                };
                let score = scoreByCode[relation?.code] ?? 40;
                const pillarIndices = Array.isArray(relation?.pillarIndices) ? relation.pillarIndices : [];
                if (pillarIndices.includes(2)) score += 14;
                if (pillarIndices.includes(1)) score += 8;
                if (pillarIndices.includes(0) && pillarIndices.includes(3)) score += 2;
                return score;
            };

            const baziKeyRelations = computed(() => {
                const relations = result.value?.internalRelations || [];
                return [...relations]
                    .map((item, index) => ({ item, index, score: scoreBaziRelation(item) }))
                    .sort((a, b) => b.score - a.score || a.index - b.index)
                    .slice(0, 3)
                    .map((entry) => entry.item);
            });
            const availableYearRange = computed(() => {
                const allYears = result.value?.daYunList
                    ?.flatMap((item) => (item.rawObj?.getLiuNian?.() || []).map((liuNian) => liuNian.getYear()))
                    ?.filter(Number.isFinite) || [];
                return {
                    min: allYears.length ? Math.min(...allYears) : '',
                    max: allYears.length ? Math.max(...allYears) : ''
                };
            });

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
            const literatureFilter = ref('全部');
            const literatureLevelOrder = { exact: 0, structure: 1, method: 2 };
            const matchedLiteratureBooks = computed(() => [...new Set((result.value?.matchedLiterature || []).map((item) => item.book))]);
            const literatureLevelCounts = computed(() => {
                const counts = { exact: 0, structure: 0, method: 0 };
                (result.value?.matchedLiterature || []).forEach((item) => { if (counts[item.levelKey] !== undefined) counts[item.levelKey] += 1; });
                return counts;
            });
            const filteredLiteratureMatches = computed(() => {
                const entries = [...(result.value?.matchedLiterature || [])]
                    .sort((a, b) => (literatureLevelOrder[a.levelKey] ?? 9) - (literatureLevelOrder[b.levelKey] ?? 9));
                return literatureFilter.value === '全部' ? entries : entries.filter((item) => item.book === literatureFilter.value);
            });
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

            const jieMonthDefs = [
                { name: '立春', alias: 'LI_CHUN', zhi: '寅' },
                { name: '惊蛰', alias: 'JING_ZHE', zhi: '卯' },
                { name: '清明', alias: 'QING_MING', zhi: '辰' },
                { name: '立夏', alias: 'LI_XIA', zhi: '巳' },
                { name: '芒种', alias: 'MANG_ZHONG', zhi: '午' },
                { name: '小暑', alias: 'XIAO_SHU', zhi: '未' },
                { name: '立秋', alias: 'LI_QIU', zhi: '申' },
                { name: '白露', alias: 'BAI_LU', zhi: '酉' },
                { name: '寒露', alias: 'HAN_LU', zhi: '戌' },
                { name: '立冬', alias: 'LI_DONG', zhi: '亥' },
                { name: '大雪', alias: 'DA_XUE', zhi: '子' },
                { name: '小寒', alias: 'XIAO_HAN', zhi: '丑' }
            ];
            const solarToDate = (solar) => solar ? new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond?.() || 0) : null;
            const solarText = (solar) => solar ? `${solar.getYear()}-${String(solar.getMonth()).padStart(2,'0')}-${String(solar.getDay()).padStart(2,'0')} ${String(solar.getHour()).padStart(2,'0')}:${String(solar.getMinute()).padStart(2,'0')}` : '—';
            const solarShort = (solar) => solar ? `${solar.getMonth()}/${solar.getDay()}` : '—';
            const findJieQiSolar = (targetYear, def) => {
                const probes = [
                    [targetYear, 1, 15], [targetYear, 6, 15], [targetYear, 12, 15],
                    [targetYear - 1, 12, 15], [targetYear + 1, 1, 15]
                ];
                for (const [year, month, day] of probes) {
                    try {
                        const table = Solar.fromYmd(year, month, day).getLunar().getJieQiTable();
                        const direct = table?.[def.name] || table?.[def.alias];
                        if (direct && direct.getYear() === targetYear) return direct;
                        for (const [key, value] of Object.entries(table || {})) {
                            if (!value?.getYear || value.getYear() !== targetYear) continue;
                            if (key === def.name || key === def.alias || key.includes(def.name)) return value;
                        }
                    } catch (error) {
                        console.warn('读取节气失败', targetYear, def.name, error);
                    }
                }
                return null;
            };
            const buildLiuYueRanges = (liuNianYear) => {
                const starts = jieMonthDefs.map((def, index) => {
                    const year = index === 11 ? liuNianYear + 1 : liuNianYear;
                    return { ...def, solar: findJieQiSolar(year, def) };
                });
                const nextLiChun = findJieQiSolar(liuNianYear + 1, jieMonthDefs[0]);
                return starts.map((item, index) => {
                    const end = index < starts.length - 1 ? starts[index + 1].solar : nextLiChun;
                    const complete = Boolean(item.solar && end);
                    return {
                        startSolar: item.solar,
                        endSolar: end,
                        startDate: solarToDate(item.solar),
                        endDate: solarToDate(end),
                        rangeText: complete ? `${item.name} ${solarText(item.solar)} 起，至 ${index < starts.length - 1 ? starts[index + 1].name : '次年立春'} ${solarText(end)} 前` : `${item.name}起（精确交接时刻读取失败）`,
                        shortRange: complete ? `${solarShort(item.solar)}—${solarShort(end)}` : `${item.name}起`
                    };
                });
            };

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
                if (!liuNian?.rawObj?.getLiuYue) {
                    liuYueError.value = '暂时无法读取流月数据。';
                    return;
                }
                let rawMonths = [];
                try { rawMonths = liuNian.rawObj.getLiuYue() || []; }
                catch (error) { console.warn('读取流月失败', error); liuYueError.value = '读取流月数据时发生异常。'; return; }
                const ranges = buildLiuYueRanges(liuNian.year);
                const originalGans = result.value.originalGans;
                const originalZhis = result.value.originalZhis;
                const dayGan = result.value.dayGan;
                const nowDate = new Date();
                activeLiuYueList.value = rawMonths.map((rawMonth, index) => {
                    const ganZhi = rawMonth.getGanZhi?.() || '';
                    if (ganZhi.length < 2) return null;
                    const gan = ganZhi.substring(0, 1);
                    const zhi = ganZhi.substring(1, 2);
                    const xunInfo = getXunInfo(ganZhi);
                    const range = ranges[index] || {};
                    const isCurrent = Boolean(range.startDate && range.endDate && nowDate >= range.startDate && nowDate < range.endDate);
                    const monthObj = { gan, zhi };
                    return {
                        rawObj: rawMonth,
                        index,
                        monthName: rawMonth.getMonthInChinese?.() || String(index + 1),
                        gan, zhi,
                        ganWuXing: getWuXing(gan),
                        zhiWuXing: getWuXing(zhi),
                        shiShen: shiShenMap[dayGan]?.[gan] || '',
                        diShi: getDiShi(dayGan, zhi),
                        naYin: getNaYin(ganZhi),
                        xun: rawMonth.getXun?.() || xunInfo.xun,
                        xunKong: rawMonth.getXunKong?.() || xunInfo.xunKong,
                        rangeText: range.rangeText || '节令范围读取失败',
                        shortRange: range.shortRange || '—',
                        isCurrent,
                        relations: calculateBranchRelations(zhi, originalZhis),
                        stemRelations: calculateStemRelations(gan, originalGans),
                        pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '流月'),
                        yunRelations: calculatePairRelations(daYun, monthObj, '大运', '流月'),
                        yearRelations: calculatePairRelations(liuNian, monthObj, '流年', '流月'),
                        layeredRelations: calculateFourLayerRelations(daYun, liuNian, monthObj, originalZhis)
                    };
                }).filter(Boolean);
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

            // 古籍匹配层 v13.13：把“资料索引”与“命局匹配”拆开，避免围绕少数测试盘逐条补 if。
            // 已核对公开文本：
            // 1) 穷通宝鉴：https://zh.wikisource.org/wiki/穷通宝鉴
            // 2) 滴天髓：https://zh.wikisource.org/wiki/滴天髓/02
            // 3) 三命通会卷八：https://zh.wikisource.org/zh-hans/三命通會/卷八
            // 4) 子平真诠评注：https://ctext.org/wiki.pl?chapter=974137&if=gb
            // 5) 渊海子平：https://zh.wikisource.org/wiki/淵海子平
            // 6) 八字提要（国家图书馆藏本扫描）：https://commons.wikimedia.org/wiki/File:NLC511-51003343-75959_八字提要.pdf
            // 7) 千里命稿（国家图书馆藏本扫描）：https://commons.wikimedia.org/wiki/File:NLC416-01jh000372-10197_千里命稿.pdf
            const selectDaYun = (index, daYunObj, preferredYear = null) => {
                activeDaYunIndex.value = index;
                activeLiuNianIndex.value = 0;
                activeLiuYueList.value = [];
                activeLiuYueIndex.value = 0;
                liuYueMsg.value = '';
                liuYueError.value = '';
                if (!daYunObj?.rawObj) { activeLiuNianList.value = []; return; }
                const dayGan = result.value.dayGan;
                const originalZhis = result.value.originalZhis;
                const originalGans = result.value.originalGans;
                const liuNianArr = daYunObj.rawObj.getLiuNian() || [];
                activeLiuNianList.value = liuNianArr.map((liuNian) => {
                    const ganZhi = liuNian.getGanZhi();
                    if (!ganZhi || ganZhi.length < 2) return null;
                    const gan = ganZhi.substring(0, 1);
                    const zhi = ganZhi.substring(1, 2);
                    const xunInfo = getXunInfo(ganZhi);
                    const liuNianObj = { gan, zhi };
                    return {
                        rawObj: liuNian,
                        year: liuNian.getYear(),
                        age: liuNian.getAge(),
                        gan, zhi,
                        ganWuXing: getWuXing(gan),
                        zhiWuXing: getWuXing(zhi),
                        shiShen: shiShenMap[dayGan]?.[gan] || '',
                        diShi: getDiShi(dayGan, zhi),
                        naYin: getNaYin(ganZhi),
                        xun: liuNian.getXun?.() || xunInfo.xun,
                        xunKong: liuNian.getXunKong?.() || xunInfo.xunKong,
                        relations: calculateBranchRelations(zhi, originalZhis),
                        stemRelations: calculateStemRelations(gan, originalGans),
                        pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '流年'),
                        yunRelations: calculatePairRelations(daYunObj, liuNianObj, '大运', '流年'),
                        layeredRelations: calculateThreeLayerRelations(daYunObj, liuNianObj, originalZhis)
                    };
                }).filter(Boolean);
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
                let matchedDaYunIndex = -1;
                for (let index = 0; index < result.value.daYunList.length; index += 1) {
                    const years = (result.value.daYunList[index].rawObj?.getLiuNian?.() || []).map((liuNian) => liuNian.getYear());
                    if (years.includes(targetYear)) { matchedDaYunIndex = index; break; }
                }
                if (matchedDaYunIndex < 0) {
                    yearQueryError.value = true;
                    const { min, max } = availableYearRange.value;
                    yearQueryMsg.value = min && max ? `当前排盘可查询 ${min}—${max} 年，${targetYear} 年不在已生成范围内。` : `未找到 ${targetYear} 年对应的大运流年。`;
                    return;
                }
                selectDaYun(matchedDaYunIndex, result.value.daYunList[matchedDaYunIndex], targetYear);
                yearQueryMsg.value = `已定位到 ${targetYear} 年及其所在大运。`;
            };
            const jumpToCurrentYear = () => { queryYear.value = new Date().getFullYear(); jumpToYear(); };


            // 六爻装卦：八宫、纳甲、世应、六亲与六神
            const selectedUseGodTarget = computed(() => {
                const choices = liuyaoResult.value?.useGodChoices || [];
                return choices.find((item) => item.key === selectedUseGodKey.value) || null;
            });
            const useGodAnalysis = computed(() => buildUseGodAnalysis(selectedUseGodTarget.value, liuyaoResult.value));
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
            const applySuggestedUseGod = () => {
                if (liuyaoResult.value?.useGodSuggestion?.suggestedUseKey) selectedUseGodKey.value = liuyaoResult.value.useGodSuggestion.suggestedUseKey;
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

            const timingCandidates = computed(() => buildTimingCandidates(selectedUseGodTarget.value, liuyaoResult.value));

            // v13.16 — 六爻古籍检索：结构特征 -> 文献数据 -> 通用 matcher。
            // 文献正文与匹配逻辑分离；未逐字核对的内容只作为“原典定位”，不伪装成原文摘录。
            const liuyaoLiterature = computed(() => buildLiuYaoLiterature(liuyaoResult.value, selectedUseGodTarget.value));

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
                try {
                    const rawValues = liuyaoForm.lines.map((value) => Number(value));
                    if (rawValues.some((value) => ![6,7,8,9].includes(value))) throw new Error('请完整录入六爻结果（6、7、8、9）。');
                    const castDate = parseLocalDateTime(liuyaoForm.datetime);
                    const solar = Solar.fromDate(castDate);
                    const lunar = solar.getLunar();
                    const eightChar = lunar.getEightChar();
                    eightChar.setSect(2);
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
                        lunarText: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
                        monthGanZhi,
                        monthZhi,
                        dayGanZhi,
                        dayGan,
                        dayZhi,
                        dayXun: eightChar.getDayXun?.() || '',
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
                        fullStructure: buildFullHexagramStructure(rows, originalNaJia, changedNaJia),
                        flyingHidden,
                        useGodSuggestion,
                        useGodChoices,
                        seasonalRuleNote: ['辰','戌','丑','未'].includes(monthZhi) ? '四季土月按“土旺、金相、火休、木囚、水死”列示。' : '旺相休囚死仅用于观察月令季节态势，不等同于完整强弱结论。'
                    };
                    selectedUseGodKey.value = useGodSuggestion.suggestedUseKey || useGodChoices[0]?.key || '';
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

                    const yun = baZi.getYun(Number.parseInt(form.gender, 10), Number.parseInt(form.yunSect, 10));
                    let qiYunInfo = '起运时间读取异常';
                    try {
                        const startSolar = yun.getStartSolar();
                        qiYunInfo = `公历 ${startSolar.getYear()}年${startSolar.getMonth()}月${startSolar.getDay()}日 ${String(startSolar.getHour()).padStart(2,'0')}:00交运`;
                    } catch (error) { console.warn('读取起运时间失败', error); }

                    const daYunList = (yun.getDaYun() || []).map((daYun) => {
                        const ganZhi = daYun.getGanZhi();
                        if (!ganZhi || ganZhi.length < 2) return null;
                        const gan = ganZhi.substring(0,1);
                        const zhi = ganZhi.substring(1,2);
                        const xunInfo = getXunInfo(ganZhi);
                        return {
                            rawObj: daYun,
                            startYear: daYun.getStartYear(), endYear: daYun.getEndYear(),
                            startAge: daYun.getStartAge(), endAge: daYun.getEndAge(),
                            gan, zhi,
                            ganWuXing: getWuXing(gan), zhiWuXing: getWuXing(zhi),
                            shiShen: shiShenMap[dayGan]?.[gan] || '',
                            diShi: getDiShi(dayGan, zhi),
                            naYin: getNaYin(ganZhi),
                            xun: daYun.getXun?.() || xunInfo.xun,
                            xunKong: daYun.getXunKong?.() || xunInfo.xunKong,
                            relations: calculateBranchRelations(zhi, originalZhis),
                            stemRelations: calculateStemRelations(gan, originalGans),
                            pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '大运')
                        };
                    }).filter(Boolean);

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
                        const currentYear = new Date().getFullYear();
                        let defaultIndex = daYunList.findIndex((item) => currentYear >= item.startYear && currentYear <= item.endYear);
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
                form, result, errorMsg, activeModule, currentPage, baziResultView, liuyaoResultView, solarCorrectionPreview, baziKeyRelations, goToInput, setBaziResultView, setLiuyaoResultView, switchModule,
                liuyaoForm, liuyaoResult, selectedUseGodKey, selectedUseGodTarget, useGodAnalysis, liuyaoKeyStructures,
                applySuggestedUseGod, timingCandidates, liuyaoLiterature,
                ichingTextState, currentIChingText, zhouyiSourceUrl,
                yaoPositionLabels, hasEnteredLiuYaoLines, simulateAllLines, clearLiuYaoLines, calculateLiuYao,
                activeDaYunIndex, activeLiuNianList, activeLiuNianIndex,
                activeLiuYueList, activeLiuYueIndex, activeLiuYue, liuYueMsg, liuYueError,
                activeDaYun, activeLiuNian,
                queryYear, yearQueryMsg, yearQueryError, availableYearRange,
                literatureNotes, literatureTab, activeLiterature,
                literatureFilter, matchedLiteratureBooks, literatureLevelCounts, filteredLiteratureMatches, openLiterature,
                calculateBazi, getColorClass, getStatusClass, getPaddedCangGan, selectDaYun, selectLiuNian, selectLiuYue,
                jumpToYear, jumpToCurrentYear, jumpToCurrentLiuYue, getShiShenExplanation, getRelationTagClass
            };
        }
    }).mount('#app');
