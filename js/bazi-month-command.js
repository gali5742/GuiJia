(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const MONTH_COMMAND_SCHEMA_VERSION = '0.1';
    const MONTH_COMMAND_SOURCE_SCOPE = 'source-scoped-no-canonical-merge';
    const DAY_MS = 24 * 60 * 60 * 1000;

    const monthJieByZhi = Object.freeze({
        '寅':'立春', '卯':'惊蛰', '辰':'清明', '巳':'立夏', '午':'芒种', '未':'小暑',
        '申':'立秋', '酉':'白露', '戌':'寒露', '亥':'立冬', '子':'大雪', '丑':'小寒'
    });

    // 《三命通会》卷二《论人元司事》逐月分日。
    // sourceToken preserves the wording carried by the source tradition. 艮土／坤土 are
    // intentionally not rewritten into a heavenly stem here.
    const sanMingTongHuiSchedule = Object.freeze({
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

    const sourceProfiles = Object.freeze({
        SAN_MING_TONG_HUI_REN_YUAN_SI_SHI: Object.freeze({
            id:'SMTH-REN-YUAN-SI-SHI',
            source:'《三命通会》卷二《论人元司事》',
            type:'monthly-day-count-schedule',
            schedule:sanMingTongHuiSchedule,
            calendarMappingStatus:'unresolved',
            statement:'原文逐月列出三十日的人元司事／长生／墓库分段。当前合同保存原文分段，但不自行规定精确节气时刻之后如何把不足或超过三十个现代24小时日映射到该表。'
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
        '不同文献的司事分段与命例主张按来源平行保存，不自动合并成唯一 canonicalCommandGan。',
        '《滴天髓阐微》“立夏后十天，戊土司令”当前只作为该命例的 source assertion，不得改写为立夏后前十天的通用时间窗。',
        '《三命通会》三十日分段的精确现代日期／节气时刻映射尚未定义；在独立 calendar mapping contract 完成前不自动解析当前司令。',
        '月令司事事实即使未来解析，也只是一项来源明确的条件事实，不直接生成身强身弱或六冲实际效力结论。'
    ]);

    const wallEpochFromDate = (date) => Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()
    );

    const wallEpochFromSolar = (solar) => Date.UTC(
        solar.getYear(), solar.getMonth() - 1, solar.getDay(),
        solar.getHour?.() || 0, solar.getMinute?.() || 0, solar.getSecond?.() || 0, 0
    );

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
        return Object.freeze({
            status: elapsedMs >= 0 ? 'observed' : 'invalid-negative-elapsed',
            basis:'adjusted-wall-time-vs-previous-jie',
            calendarEngine:'lunar-javascript',
            monthZhi,
            expectedJie,
            monthJieName:jieName,
            jieAlignment: expectedJie && jieName === expectedJie ? 'matched' : 'mismatched',
            birthWallTime:formatDateWall(adjustedDate),
            monthJieWallTime:formatSolarWall(jieSolar),
            elapsedMinutes:Number((elapsedMs / 60000).toFixed(6)),
            elapsedDays:Number((elapsedMs / DAY_MS).toFixed(9)),
            elapsedWholeDays:elapsedMs >= 0 ? Math.floor(elapsedMs / DAY_MS) : null
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

    function buildMonthCommandObservation(result = {}) {
        const chart = (result.pillars || []).map((item) => item.ganZhi || `${item.gan || ''}${item.zhi || ''}`).join(' ');
        const timeContext = buildMonthCommandTimeContextFromResult(result);
        const dtsCase = sourceProfiles.DI_TIAN_SUI_CHAN_WEI_WAR_CASE;
        const caseChartMatches = chart === dtsCase.chart;
        const caseAnchorMatches = timeContext?.monthJieName === dtsCase.anchorJie && result.pillars?.[1]?.zhi === dtsCase.monthZhi;
        return Object.freeze({
            version:MONTH_COMMAND_SCHEMA_VERSION,
            scope:MONTH_COMMAND_SOURCE_SCOPE,
            state:timeContext?.status === 'observed' ? 'observed-source-scoped' : 'time-context-unavailable',
            canonicalCommandGan:null,
            canonicalStatus:'unresolved',
            timeContext,
            sourceProfiles:Object.freeze([
                Object.freeze({
                    sourceId:sourceProfiles.SAN_MING_TONG_HUI_REN_YUAN_SI_SHI.id,
                    source:sourceProfiles.SAN_MING_TONG_HUI_REN_YUAN_SI_SHI.source,
                    monthZhi:result.pillars?.[1]?.zhi || timeContext?.monthZhi || '',
                    schedule:sourceProfiles.SAN_MING_TONG_HUI_REN_YUAN_SI_SHI.schedule[result.pillars?.[1]?.zhi || timeContext?.monthZhi] || Object.freeze([]),
                    resolutionStatus:'unresolved-calendar-mapping'
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
        const derivedFacts = Object.freeze([
            Object.freeze({
                id:'D08',
                system:'monthCommandTiming',
                systemLabel:'人元司事·时间位置',
                sourceRefs:Object.freeze(['F05','F06']),
                text:`排盘采用时间距${time.monthJieName}经过约${time.elapsedDays.toFixed(6)}日（整24小时已过${time.elapsedWholeDays}日）；这里只记录时间位置，不自动判定当前司令人元。`
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
        sanMingTongHuiSchedule,
        sourceProfiles,
        boundaries,
        buildMonthCommandTimeContext,
        buildMonthCommandTimeContextFromResult,
        buildMonthCommandObservation,
        buildMonthCommandSemanticEntries,
        installStrengthEvidenceHook
    });
    GuiJia.baziMonthCommand = api;
    installStrengthEvidenceHook();
})(typeof window !== 'undefined' ? window : globalThis);
