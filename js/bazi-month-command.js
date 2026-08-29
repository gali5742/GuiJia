(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const MONTH_COMMAND_SCHEMA_VERSION = '0.2';
    const MONTH_COMMAND_SOURCE_SCOPE = 'source-scoped-no-canonical-merge';
    const DAY_MS = 24 * 60 * 60 * 1000;

    const monthJieByZhi = Object.freeze({
        '寅':'立春', '卯':'惊蛰', '辰':'清明', '巳':'立夏', '午':'芒种', '未':'小暑',
        '申':'立秋', '酉':'白露', '戌':'寒露', '亥':'立冬', '子':'大雪', '丑':'小寒'
    });

    const calendarPositionContract = Object.freeze({
        id:'MONTH-COMMAND-CALENDAR-POSITION-001',
        durationBasis:'exact-adjusted-wall-time-minus-jie-wall-time',
        ordinalBasis:'jie-civil-date-inclusive',
        ordinalMeaning:'交节所在的排盘民用日期记为第1日，之后每跨一个民用日期序号加一。',
        traditionalEquivalence:'not-asserted-globally',
        boundary:'civilOrdinalDayAfterJie 是中性 calendar-position 规范化字段；它本身不证明任何古籍分日表应被采用，也不把古籍“日”一律解释为完整24小时 duration。'
    });

    // 《三命通会》卷二《论人元司事》开头先列出的一套逐月分日。
    // 同一章节随后又“再考玉井”列另一套，并引醉醒子批评固定三五七日界限；
    // 因此这里只命名为 opening recorded schedule，不代表《三命通会》的唯一最终算法。
    const sanMingTongHuiOpeningSchedule = Object.freeze({
        '寅': Object.freeze([
            Object.freeze({ sourceToken:'艮土', gan:null, days:5, role:'用事' }),
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:5, role:'长生' }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:20, role:'用事' })
        ]),
        '卯': Object.freeze([
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:23, role:'用事' })
        ]),
        '辰': Object.freeze([
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:5, role:'墓库' }),
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:18, role:'用事' })
        ]),
        '巳': Object.freeze([
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:5, role:'长生' }),
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:18, role:'用事' })
        ]),
        '午': Object.freeze([
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'丁火', gan:'丁', days:23, role:'用事' })
        ]),
        '未': Object.freeze([
            Object.freeze({ sourceToken:'丁火', gan:'丁', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:5, role:'墓库' }),
            Object.freeze({ sourceToken:'己土', gan:'己', days:18, role:'用事' })
        ]),
        '申': Object.freeze([
            Object.freeze({ sourceToken:'坤土', gan:null, days:5, role:'用事' }),
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:5, role:'长生' }),
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:20, role:'用事' })
        ]),
        '酉': Object.freeze([
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:23, role:'用事' })
        ]),
        '戌': Object.freeze([
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:5, role:'墓库' }),
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:18, role:'用事' })
        ]),
        '亥': Object.freeze([
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:5, role:'用事' }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:5, role:'长生' }),
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:20, role:'用事' })
        ]),
        '子': Object.freeze([
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:23, role:'用事' })
        ]),
        '丑': Object.freeze([
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:7, role:'用事' }),
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:5, role:'墓库' }),
            Object.freeze({ sourceToken:'己土', gan:'己', days:18, role:'用事' })
        ])
    });

    // 《三命通会》同节“再考玉井”所录另一套分配。
    // 酉月末项在现存数字转录中见“三日／五日”差异，因此不伪造单一数字。
    const sanMingTongHuiYuJingSchedule = Object.freeze({
        '寅': Object.freeze([
            Object.freeze({ sourceToken:'己土', gan:'己', days:7 }),
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:5 }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:18 })
        ]),
        '卯': Object.freeze([
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:18 }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:9 }),
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:3 })
        ]),
        '辰': Object.freeze([
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:18 }),
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:9 }),
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:3 })
        ]),
        '巳': Object.freeze([
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:18 }),
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:7 }),
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:5 })
        ]),
        '午': Object.freeze([
            Object.freeze({ sourceToken:'丁火', gan:'丁', days:18 }),
            Object.freeze({ sourceToken:'丙火', gan:'丙', days:9 }),
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:3 })
        ]),
        '未': Object.freeze([
            Object.freeze({ sourceToken:'己土', gan:'己', days:18 }),
            Object.freeze({ sourceToken:'乙木', gan:'乙', days:5 }),
            Object.freeze({ sourceToken:'丁火', gan:'丁', days:7 })
        ]),
        '申': Object.freeze([
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:17 }),
            Object.freeze({ sourceToken:'己土', gan:'己', days:7 }),
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:3 }),
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:3 })
        ]),
        '酉': Object.freeze([
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:20 }),
            Object.freeze({ sourceToken:'庚金', gan:'庚', days:7 }),
            Object.freeze({
                sourceToken:'丁火', gan:'丁', days:null,
                textualVariantStatus:'unresolved',
                textualVariants:Object.freeze([
                    Object.freeze({ days:5, witness:'《钦定四库全书》数字转录' }),
                    Object.freeze({ days:3, witness:'另一数字转录' })
                ])
            })
        ]),
        '戌': Object.freeze([
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:18 }),
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:7 }),
            Object.freeze({ sourceToken:'丁火', gan:'丁', days:5 })
        ]),
        '亥': Object.freeze([
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:18 }),
            Object.freeze({ sourceToken:'甲木', gan:'甲', days:5 }),
            Object.freeze({ sourceToken:'戊土', gan:'戊', days:7 })
        ]),
        '子': Object.freeze([
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:18 }),
            Object.freeze({ sourceToken:'壬水', gan:'壬', days:5 }),
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:3 })
        ]),
        '丑': Object.freeze([
            Object.freeze({ sourceToken:'己土', gan:'己', days:18 }),
            Object.freeze({ sourceToken:'癸水', gan:'癸', days:7 }),
            Object.freeze({ sourceToken:'辛金', gan:'辛', days:5 })
        ])
    });

    const dtsYinOrdinalWindows = Object.freeze([
        Object.freeze({ startDay:1, endDay:7, sourceToken:'戊土', gan:'戊' }),
        Object.freeze({ startDay:8, endDay:14, sourceToken:'丙火', gan:'丙' }),
        Object.freeze({ startDay:15, endDay:null, sourceToken:'甲木', gan:'甲' })
    ]);

    const smthOpeningProfile = Object.freeze({
        id:'SMTH-REN-YUAN-OPENING-SCHEDULE',
        source:'《三命通会》卷二《论人元司事》',
        attribution:'section-opening-recorded-schedule',
        type:'recorded-monthly-day-count-schedule',
        schedule:sanMingTongHuiOpeningSchedule,
        resolverPolicy:'disabled-no-default-tradition-choice',
        statement:'本节开头确实逐月列出一套分日；但同节随后“再考玉井”另列一套，并保存醉醒子对固定三五七日界限的批评，因此不得把开头表冒充成《三命通会》唯一最终算法。'
    });

    const sourceProfiles = Object.freeze({
        SAN_MING_TONG_HUI_REN_YUAN_SI_SHI: smthOpeningProfile,
        SAN_MING_TONG_HUI_OPENING_SCHEDULE: smthOpeningProfile,
        SAN_MING_TONG_HUI_YU_JING: Object.freeze({
            id:'SMTH-YUJING-RECORDED-SCHEDULE',
            source:'《三命通会》卷二《论人元司事》所录《玉井》',
            type:'recorded-alternative-monthly-schedule',
            schedule:sanMingTongHuiYuJingSchedule,
            resolverPolicy:'disabled-textual-and-methodological-conflict',
            textualStatus:'酉月丁火日数存在数字转录差异，未作强行校定。',
            statement:'《三命通会》在首列分日之后又称“再考玉井”，保存另一套年度与逐月分配；它与首表并不相同。'
        }),
        SAN_MING_TONG_HUI_ZUI_XING_ZI: Object.freeze({
            id:'SMTH-ZUI-XING-ZI-CRITIQUE',
            source:'《三命通会》卷二《论人元司事》所引醉醒子',
            type:'methodological-critique',
            rigidDayLimitStatus:'rejected',
            preferredFraming:'main-qi-with-initial-middle-late-depth',
            resolverPolicy:'blocks-default-fixed-day-resolver',
            statement:'醉醒子明确质疑“岂可以几日为限”“又岂可以三五七日为限”，主张本宫主气为主，初中末三气有浅深，宜较量轻重。'
        }),
        DI_TIAN_SUI_CHAN_WEI_YIN_MONTH: Object.freeze({
            id:'DTS-CW-YIN-MONTH-ORDINAL',
            source:'《滴天髓阐微·月令》原注',
            type:'explicit-source-ordinal-window',
            monthZhi:'寅',
            anchorJie:'立春',
            windows:dtsYinOrdinalWindows,
            sourceWording:'立春后七日前皆值戊土；八日后十四日前丙火；十五日后甲木。',
            calendarNormalization:'jie-civil-date-inclusive',
            normalizationStatus:'project-formalization-from-explicit-source-ordinal-language',
            resolverPolicy:'source-specific-only'
        }),
        DI_TIAN_SUI_CHAN_WEI_WAR_CASE: Object.freeze({
            id:'DTS-CW-WAR-CASE-001',
            source:'《滴天髓阐微·战局》任氏命例',
            type:'case-assertion',
            chart:'乙亥 辛巳 戊申 甲寅',
            monthZhi:'巳',
            anchorJie:'立夏',
            offsetText:'立夏后十天',
            assertedCommandGan:'戊',
            assertedCommandElement:'土',
            assertedOutcome:'亥水受制而巳火不伤',
            genericWindow:null,
            generalizationStatus:'case-only',
            statement:'原文在该命例中明确称“立夏后十天，戊土司令”。本合同不把个案中的“后十天”改写为“立夏后前十天均戊土司令”。'
        })
    });

    const boundaries = Object.freeze([
        '藏干构成与人元司事分日必须分层；不得从本气、中气、余气标签直接推出当前司令。',
        '不同文献之间、同一文献内部记录的不同分日说法与批评意见都必须按来源分层保存，不自动合并成唯一 canonicalCommandGan。',
        '《三命通会》首列分日表只是该节记录的一套说法；同节另录《玉井》异表，并引醉醒子反对把三五七日当刚性界限，因此当前不得设置默认《三命通会》fixed-day resolver。',
        'civilOrdinalDayAfterJie 只把交节所在民用日期规范化为第1日；它不等于证明所有传统“日”都采用这一现代映射。',
        '《滴天髓阐微·月令》寅月原注因明确给出七日前、八至十四日前、十五日后的序日边界，可做 source-specific ordinal resolver，但不得推广成其他月份的完整分野表。',
        '《滴天髓阐微》“立夏后十天，戊土司令”当前只作为该命例的 source assertion，不得改写为立夏后前十天的通用时间窗。',
        '月令司事事实即使按某一来源解析，也只是一项来源明确的条件事实，不直接生成身强身弱或六冲实际效力结论。'
    ]);

    const wallEpochFromDate = (date) => Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()
    );

    const wallEpochFromSolar = (solar) => Date.UTC(
        solar.getYear(), solar.getMonth() - 1, solar.getDay(),
        solar.getHour?.() || 0, solar.getMinute?.() || 0, solar.getSecond?.() || 0, 0
    );

    const wallDateOrdinalFromDate = (date) => Math.floor(Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate()
    ) / DAY_MS);

    const wallDateOrdinalFromSolar = (solar) => Math.floor(Date.UTC(
        solar.getYear(), solar.getMonth() - 1, solar.getDay()
    ) / DAY_MS);

    const formatSolarWall = (solar) => {
        if (!solar) return '';
        if (typeof solar.toYmdHms === 'function') return solar.toYmdHms();
        const pad = (value) => String(value).padStart(2, '0');
        return `${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())} ${pad(solar.getHour?.() || 0)}:${pad(solar.getMinute?.() || 0)}:${pad(solar.getSecond?.() || 0)}`;
    };

    const formatDateWall = (date) => {
        const pad = (value) => String(value).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    function buildMonthCommandTimeContext(adjustedDate, lunar, monthZhi) {
        if (!(adjustedDate instanceof Date) || Number.isNaN(adjustedDate.getTime()) || !lunar || !monthZhi) {
            return Object.freeze({ status:'unavailable', reason:'missing-adjusted-date-or-lunar-context' });
        }
        const expectedJie = monthJieByZhi[monthZhi] || '';
        const prevJie = typeof lunar.getPrevJie === 'function' ? lunar.getPrevJie(false) : null;
        const jieSolar = prevJie?.getSolar?.() || null;
        const jieName = prevJie?.getName?.() || '';
        if (!jieSolar) {
            return Object.freeze({ status:'unavailable', reason:'month-jie-unavailable', monthZhi, expectedJie });
        }
        const birthWallEpoch = wallEpochFromDate(adjustedDate);
        const jieWallEpoch = wallEpochFromSolar(jieSolar);
        const elapsedMs = birthWallEpoch - jieWallEpoch;
        const civilOrdinalDayAfterJie = elapsedMs >= 0
            ? wallDateOrdinalFromDate(adjustedDate) - wallDateOrdinalFromSolar(jieSolar) + 1
            : null;
        return Object.freeze({
            status: elapsedMs >= 0 ? 'observed' : 'invalid-negative-elapsed',
            basis:'adjusted-wall-time-vs-previous-jie',
            calendarEngine:'lunar-javascript',
            calendarPositionContractId:calendarPositionContract.id,
            monthZhi,
            expectedJie,
            monthJieName:jieName,
            jieAlignment: expectedJie && jieName === expectedJie ? 'matched' : 'mismatched',
            birthWallTime:formatDateWall(adjustedDate),
            monthJieWallTime:formatSolarWall(jieSolar),
            elapsedMinutes:Number((elapsedMs / 60000).toFixed(6)),
            elapsedDays:Number((elapsedMs / DAY_MS).toFixed(9)),
            elapsedWholeDays:elapsedMs >= 0 ? Math.floor(elapsedMs / DAY_MS) : null,
            civilOrdinalDayAfterJie,
            civilOrdinalBasis:calendarPositionContract.ordinalBasis,
            sameCivilDateAsJie:civilOrdinalDayAfterJie === 1
        });
    }

    function buildMonthCommandTimeContextFromResult(result = {}) {
        if (result.monthCommandTimeContext?.status) return result.monthCommandTimeContext;
        const text = String(result.solarStr || '').trim();
        const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        const SolarCtor = global.Solar;
        if (!match || !SolarCtor?.fromYmdHms) {
            return Object.freeze({ status:'unavailable', reason:match ? 'solar-engine-unavailable' : 'adjusted-solar-time-unavailable' });
        }
        const [, y, m, d, hh, mm, ss = '0'] = match;
        const parts = [y,m,d,hh,mm,ss].map(Number);
        const adjustedDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5], 0);
        const solar = SolarCtor.fromYmdHms(...parts);
        const lunar = solar.getLunar();
        const monthZhi = result.pillars?.[1]?.zhi || result.monthSeason?.monthZhi || '';
        return buildMonthCommandTimeContext(adjustedDate, lunar, monthZhi);
    }

    function resolveDtsYinMonthCommand(timeContext = {}, monthZhi = '') {
        const source = sourceProfiles.DI_TIAN_SUI_CHAN_WEI_YIN_MONTH;
        if (monthZhi !== source.monthZhi || timeContext.monthJieName !== source.anchorJie) {
            return Object.freeze({ resolutionStatus:'not-applicable-to-current-month', sourceCommandGan:null });
        }
        const dayIndex = timeContext.civilOrdinalDayAfterJie;
        if (!Number.isInteger(dayIndex) || dayIndex < 1) {
            return Object.freeze({ resolutionStatus:'calendar-position-unavailable', sourceCommandGan:null });
        }
        const window = source.windows.find((item) => dayIndex >= item.startDay && (item.endDay == null || dayIndex <= item.endDay));
        if (!window) return Object.freeze({ resolutionStatus:'source-window-unresolved', sourceCommandGan:null, sourceDayIndex:dayIndex });
        return Object.freeze({
            resolutionStatus:'resolved-explicit-source-window',
            sourceCommandGan:window.gan,
            sourceCommandToken:window.sourceToken,
            sourceDayIndex:dayIndex,
            matchedWindow:Object.freeze({ startDay:window.startDay, endDay:window.endDay })
        });
    }

    function buildMonthCommandObservation(result = {}) {
        const chart = (result.pillars || []).map((item) => item.ganZhi || `${item.gan || ''}${item.zhi || ''}`).join(' ');
        const timeContext = buildMonthCommandTimeContextFromResult(result);
        const monthZhi = result.pillars?.[1]?.zhi || timeContext?.monthZhi || '';
        const dtsYin = sourceProfiles.DI_TIAN_SUI_CHAN_WEI_YIN_MONTH;
        const dtsYinResolution = resolveDtsYinMonthCommand(timeContext, monthZhi);
        const dtsCase = sourceProfiles.DI_TIAN_SUI_CHAN_WEI_WAR_CASE;
        const caseChartMatches = chart === dtsCase.chart;
        const caseAnchorMatches = timeContext?.monthJieName === dtsCase.anchorJie && monthZhi === dtsCase.monthZhi;
        return Object.freeze({
            version:MONTH_COMMAND_SCHEMA_VERSION,
            scope:MONTH_COMMAND_SOURCE_SCOPE,
            state:timeContext?.status === 'observed' ? 'observed-source-scoped' : 'time-context-unavailable',
            canonicalCommandGan:null,
            canonicalStatus:'unresolved',
            calendarPositionContract,
            timeContext,
            sourceProfiles:Object.freeze([
                Object.freeze({
                    sourceId:smthOpeningProfile.id,
                    source:smthOpeningProfile.source,
                    attribution:smthOpeningProfile.attribution,
                    monthZhi,
                    schedule:smthOpeningProfile.schedule[monthZhi] || Object.freeze([]),
                    resolutionStatus:'recorded-schedule-not-default-resolver'
                }),
                Object.freeze({
                    sourceId:sourceProfiles.SAN_MING_TONG_HUI_YU_JING.id,
                    source:sourceProfiles.SAN_MING_TONG_HUI_YU_JING.source,
                    monthZhi,
                    schedule:sourceProfiles.SAN_MING_TONG_HUI_YU_JING.schedule[monthZhi] || Object.freeze([]),
                    textualStatus:sourceProfiles.SAN_MING_TONG_HUI_YU_JING.textualStatus,
                    resolutionStatus:'recorded-alternative-not-default-resolver'
                }),
                Object.freeze({
                    sourceId:sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI.id,
                    source:sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI.source,
                    type:sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI.type,
                    rigidDayLimitStatus:sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI.rigidDayLimitStatus,
                    preferredFraming:sourceProfiles.SAN_MING_TONG_HUI_ZUI_XING_ZI.preferredFraming,
                    resolutionStatus:'methodological-objection-recorded'
                }),
                Object.freeze({
                    sourceId:dtsYin.id,
                    source:dtsYin.source,
                    type:dtsYin.type,
                    monthZhi:dtsYin.monthZhi,
                    anchorJie:dtsYin.anchorJie,
                    calendarNormalization:dtsYin.calendarNormalization,
                    ...dtsYinResolution
                }),
                Object.freeze({
                    sourceId:dtsCase.id,
                    source:dtsCase.source,
                    type:dtsCase.type,
                    chartMatches:caseChartMatches,
                    anchorMatches:Boolean(caseAnchorMatches),
                    offsetText:dtsCase.offsetText,
                    assertedCommandGan:dtsCase.assertedCommandGan,
                    genericWindow:dtsCase.genericWindow,
                    resolutionStatus:caseChartMatches && caseAnchorMatches ? 'case-assertion-observed' : 'not-applicable-to-current-chart'
                })
            ]),
            boundaries
        });
    }

    function buildMonthCommandSemanticEntries(result = {}) {
        const observation = buildMonthCommandObservation(result);
        const time = observation.timeContext;
        if (!time || time.status !== 'observed') {
            return Object.freeze({ facts:Object.freeze([]), derivedFacts:Object.freeze([]), observation });
        }
        const facts = Object.freeze([
            Object.freeze({ id:'F05', kind:'adjusted-birth-time', text:`排盘采用时间：${time.birthWallTime}` }),
            Object.freeze({ id:'F06', kind:'month-jie-boundary', text:`月令${time.monthZhi}月的节令起点：${time.monthJieName} ${time.monthJieWallTime}` })
        ]);
        const ordinalText = Number.isInteger(time.civilOrdinalDayAfterJie)
            ? `；按“交节所在民用日期记第1日”的中性序日位置为第${time.civilOrdinalDayAfterJie}日`
            : '';
        const derivedFacts = Object.freeze([
            Object.freeze({
                id:'D08',
                system:'monthCommandTiming',
                systemLabel:'人元司事·时间位置',
                sourceRefs:Object.freeze(['F05','F06']),
                text:`排盘采用时间距${time.monthJieName}经过约${time.elapsedDays.toFixed(6)}日（完整24小时已过${time.elapsedWholeDays}日）${ordinalText}；这里只记录 calendar position，不表示默认采用任何固定分日表。`
            })
        ]);
        return Object.freeze({ facts, derivedFacts, observation });
    }

    function installStrengthEvidenceHook() {
        const api = GuiJia.baziStrengthEvidence;
        if (!api?.buildStrengthEvidence || api.__monthCommandHookInstalled) return false;
        const originalBuild = api.buildStrengthEvidence;
        const wrapped = function (result = {}, semanticModel = {}) {
            const entries = buildMonthCommandSemanticEntries(result);
            semanticModel.monthCommand = entries.observation;
            const factIds = new Set((semanticModel.facts || []).map((item) => item.id));
            const derivedIds = new Set((semanticModel.derivedFacts || []).map((item) => item.id));
            entries.facts.forEach((item) => { if (!factIds.has(item.id)) semanticModel.facts.push(item); });
            entries.derivedFacts.forEach((item) => { if (!derivedIds.has(item.id)) semanticModel.derivedFacts.push(item); });
            return originalBuild(result, semanticModel);
        };
        GuiJia.baziStrengthEvidence = Object.freeze({
            ...api,
            buildStrengthEvidence:wrapped,
            __monthCommandHookInstalled:true
        });
        return true;
    }

    const api = Object.freeze({
        installed:true,
        MONTH_COMMAND_SCHEMA_VERSION,
        MONTH_COMMAND_SOURCE_SCOPE,
        monthJieByZhi,
        calendarPositionContract,
        sanMingTongHuiOpeningSchedule,
        sanMingTongHuiSchedule:sanMingTongHuiOpeningSchedule,
        sanMingTongHuiYuJingSchedule,
        dtsYinOrdinalWindows,
        sourceProfiles,
        boundaries,
        buildMonthCommandTimeContext,
        buildMonthCommandTimeContextFromResult,
        resolveDtsYinMonthCommand,
        buildMonthCommandObservation,
        buildMonthCommandSemanticEntries,
        installStrengthEvidenceHook
    });
    GuiJia.baziMonthCommand = api;
    installStrengthEvidenceHook();
})(typeof window !== 'undefined' ? window : globalThis);
