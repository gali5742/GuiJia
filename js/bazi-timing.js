(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};
    const core = GuiJia.baziCore;
    if (!core) throw new Error('GuiJia.baziCore must be loaded before bazi-timing.js');

    const {
        shiShenMap,
        getWuXing,
        getDiShi,
        getNaYin,
        getXunInfo,
        calculateStemRelations,
        calculateBranchRelations,
        calculatePillarSignals,
        calculatePairRelations,
        calculateThreeLayerRelations,
        calculateFourLayerRelations
    } = core;

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

    const solarToDate = (solar) => solar
        ? new Date(
            solar.getYear(),
            solar.getMonth() - 1,
            solar.getDay(),
            solar.getHour(),
            solar.getMinute(),
            solar.getSecond?.() || 0
        )
        : null;

    const solarText = (solar) => solar
        ? `${solar.getYear()}-${String(solar.getMonth()).padStart(2,'0')}-${String(solar.getDay()).padStart(2,'0')} ${String(solar.getHour()).padStart(2,'0')}:${String(solar.getMinute()).padStart(2,'0')}`
        : '—';

    const solarShort = (solar) => solar ? `${solar.getMonth()}/${solar.getDay()}` : '—';

    const dateTimeText = (date) => date instanceof Date && !Number.isNaN(date.getTime())
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
        : '—';

    const findJieQiSolar = (targetYear, def, SolarApi = global.Solar) => {
        if (!SolarApi?.fromYmd) return null;
        const probes = [
            [targetYear, 1, 15], [targetYear, 6, 15], [targetYear, 12, 15],
            [targetYear - 1, 12, 15], [targetYear + 1, 1, 15]
        ];
        for (const [year, month, day] of probes) {
            try {
                const table = SolarApi.fromYmd(year, month, day).getLunar().getJieQiTable();
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


    const buildLiuNianRange = (year, SolarApi = global.Solar) => {
        const liChunDef = jieMonthDefs[0];
        const startSolar = findJieQiSolar(year, liChunDef, SolarApi);
        const endSolar = findJieQiSolar(year + 1, liChunDef, SolarApi);
        const startDate = solarToDate(startSolar);
        const endDate = solarToDate(endSolar);
        return {
            startSolar, endSolar, startDate, endDate,
            rangeText: startDate && endDate
                ? `${solarText(startSolar)} 起，至 ${solarText(endSolar)} 前`
                : ''
        };
    };

    const buildDaYunSegmentsForRange = (daYunList = [], startDate, endDate) => {
        if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime()) || !(endDate instanceof Date) || Number.isNaN(endDate.getTime()) || startDate >= endDate) return [];
        const candidates = (daYunList || [])
            .map((daYun, index) => ({ daYun, index, startDate: daYun?.startDate, endDate: daYun?.endDate }))
            .filter((item) => item.startDate instanceof Date && !Number.isNaN(item.startDate.getTime()) && item.endDate instanceof Date && !Number.isNaN(item.endDate.getTime()))
            .sort((a, b) => a.startDate - b.startDate);
        const segments = [];
        let cursor = new Date(startDate);
        candidates.forEach((item) => {
            const overlapStart = new Date(Math.max(startDate.getTime(), item.startDate.getTime()));
            const overlapEnd = new Date(Math.min(endDate.getTime(), item.endDate.getTime()));
            if (overlapStart >= overlapEnd) return;
            if (cursor < overlapStart) {
                segments.push({ daYun: null, daYunIndex: -1, startDate: new Date(cursor), endDate: new Date(overlapStart), label: '起运前' });
            }
            segments.push({ daYun: item.daYun, daYunIndex: item.index, startDate: overlapStart, endDate: overlapEnd, label: `${item.daYun.gan}${item.daYun.zhi}大运` });
            if (cursor < overlapEnd) cursor = new Date(overlapEnd);
        });
        if (cursor < endDate) {
            segments.push({ daYun: null, daYunIndex: -1, startDate: new Date(cursor), endDate: new Date(endDate), label: '起运前' });
        }
        return segments.map((segment) => ({
            ...segment,
            startDateTimeText: dateTimeText(segment.startDate),
            endDateTimeText: dateTimeText(segment.endDate)
        }));
    };

    const findDaYunIndexForDate = (daYunList = [], targetDate) => {
        if (!(targetDate instanceof Date) || Number.isNaN(targetDate.getTime())) return -1;
        return daYunList.findIndex((item) => item?.startDate instanceof Date && item?.endDate instanceof Date && targetDate >= item.startDate && targetDate < item.endDate);
    };

    const buildLiuYueRanges = (liuNianYear, SolarApi = global.Solar) => {
        const starts = jieMonthDefs.map((def, index) => {
            const year = index === 11 ? liuNianYear + 1 : liuNianYear;
            return { ...def, solar: findJieQiSolar(year, def, SolarApi) };
        });
        const nextLiChun = findJieQiSolar(liuNianYear + 1, jieMonthDefs[0], SolarApi);
        return starts.map((item, index) => {
            const end = index < starts.length - 1 ? starts[index + 1].solar : nextLiChun;
            const complete = Boolean(item.solar && end);
            return {
                startSolar: item.solar,
                endSolar: end,
                startDate: solarToDate(item.solar),
                endDate: solarToDate(end),
                rangeText: complete
                    ? `${item.name} ${solarText(item.solar)} 起，至 ${index < starts.length - 1 ? starts[index + 1].name : '次年立春'} ${solarText(end)} 前`
                    : `${item.name}起（精确交接时刻读取失败）`,
                shortRange: complete ? `${solarShort(item.solar)}—${solarShort(end)}` : `${item.name}起`
            };
        });
    };

    const buildDaYunList = (yun, { dayGan, originalGans, originalZhis }) => {
        let firstStartSolar = null;
        try {
            firstStartSolar = yun?.getStartSolar?.() || null;
        } catch (error) {
            console.warn('读取大运精确起点失败', error);
        }
        return (yun?.getDaYun?.() || [])
            .map((daYun) => {
                const ganZhi = daYun.getGanZhi?.() || '';
                if (ganZhi.length < 2) return null;
                const gan = ganZhi.substring(0, 1);
                const zhi = ganZhi.substring(1, 2);
                const xunInfo = getXunInfo(ganZhi);
                const index = Number(daYun.getIndex?.());
                let startSolar = null;
                let endSolar = null;
                if (firstStartSolar && Number.isInteger(index) && index >= 1) {
                    try {
                        startSolar = firstStartSolar.nextYear((index - 1) * 10);
                        endSolar = firstStartSolar.nextYear(index * 10);
                    } catch (error) {
                        console.warn('计算大运精确区间失败', ganZhi, error);
                    }
                }
                return {
                    rawObj: daYun,
                    startYear: daYun.getStartYear(),
                    endYear: daYun.getEndYear(),
                    startAge: daYun.getStartAge(),
                    endAge: daYun.getEndAge(),
                    startDate: startSolar ? solarToDate(startSolar) : null,
                    endDate: endSolar ? solarToDate(endSolar) : null,
                    startDateTimeText: startSolar ? solarText(startSolar) : '',
                    endDateTimeText: endSolar ? solarText(endSolar) : '',
                    gan,
                    zhi,
                    ganWuXing: getWuXing(gan),
                    zhiWuXing: getWuXing(zhi),
                    shiShen: shiShenMap[dayGan]?.[gan] || '',
                    diShi: getDiShi(dayGan, zhi),
                    naYin: getNaYin(ganZhi),
                    xun: daYun.getXun?.() || xunInfo.xun,
                    xunKong: daYun.getXunKong?.() || xunInfo.xunKong,
                    relations: calculateBranchRelations(zhi, originalZhis),
                    stemRelations: calculateStemRelations(gan, originalGans),
                    pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '大运')
                };
            })
            .filter(Boolean);
    };

    const buildYunProfile = (baZi, { gender, yunSect, dayGan, originalGans, originalZhis }) => {
        const yun = baZi.getYun(Number.parseInt(gender, 10), Number.parseInt(yunSect, 10));
        let qiYunInfo = '起运时间读取异常';
        try {
            const startSolar = yun.getStartSolar();
            qiYunInfo = `公历 ${startSolar.getYear()}年${startSolar.getMonth()}月${startSolar.getDay()}日 ${String(startSolar.getHour()).padStart(2,'0')}:${String(startSolar.getMinute?.() || 0).padStart(2,'0')}交运`;
        } catch (error) {
            console.warn('读取起运时间失败', error);
        }
        return {
            yun,
            qiYunInfo,
            daYunList: buildDaYunList(yun, { dayGan, originalGans, originalZhis })
        };
    };

    const buildLiuNianList = (daYunObj, { dayGan, originalGans, originalZhis }, { daYunList = [daYunObj], SolarApi = global.Solar } = {}) => (daYunObj?.rawObj?.getLiuNian?.() || [])
        .map((liuNian) => {
            const ganZhi = liuNian.getGanZhi?.() || '';
            if (ganZhi.length < 2) return null;
            const gan = ganZhi.substring(0, 1);
            const zhi = ganZhi.substring(1, 2);
            const year = liuNian.getYear();
            const xunInfo = getXunInfo(ganZhi);
            const liuNianObj = { gan, zhi };
            const yearRange = buildLiuNianRange(year, SolarApi);
            const daYunSegments = buildDaYunSegmentsForRange(daYunList, yearRange.startDate, yearRange.endDate)
                .map((segment) => segment.daYun ? {
                    ...segment,
                    yunRelations: calculatePairRelations(segment.daYun, liuNianObj, '大运', '流年'),
                    layeredRelations: calculateThreeLayerRelations(segment.daYun, liuNianObj, originalZhis)
                } : segment);
            const effectiveDaYun = daYunSegments.length === 1 ? daYunSegments[0].daYun : null;
            return {
                rawObj: liuNian,
                year,
                age: liuNian.getAge(),
                gan,
                zhi,
                ganWuXing: getWuXing(gan),
                zhiWuXing: getWuXing(zhi),
                shiShen: shiShenMap[dayGan]?.[gan] || '',
                diShi: getDiShi(dayGan, zhi),
                naYin: getNaYin(ganZhi),
                xun: liuNian.getXun?.() || xunInfo.xun,
                xunKong: liuNian.getXunKong?.() || xunInfo.xunKong,
                yearStartDate: yearRange.startDate,
                yearEndDate: yearRange.endDate,
                yearRangeText: yearRange.rangeText,
                daYunSegments,
                isTransitionYear: daYunSegments.length > 1,
                effectiveDaYun,
                relations: calculateBranchRelations(zhi, originalZhis),
                stemRelations: calculateStemRelations(gan, originalGans),
                pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '流年'),
                yunRelations: effectiveDaYun
                    ? calculatePairRelations(effectiveDaYun, liuNianObj, '大运', '流年')
                    : (daYunSegments.length ? [] : calculatePairRelations(daYunObj, liuNianObj, '大运', '流年')),
                layeredRelations: effectiveDaYun
                    ? calculateThreeLayerRelations(effectiveDaYun, liuNianObj, originalZhis)
                    : (daYunSegments.length ? [] : calculateThreeLayerRelations(daYunObj, liuNianObj, originalZhis))
            };
        })
        .filter(Boolean);

    const buildLiuYueList = (
        liuNian,
        daYun,
        { dayGan, originalGans, originalZhis },
        { nowDate = new Date(), SolarApi = global.Solar, daYunList = [daYun] } = {}
    ) => {
        if (!liuNian?.rawObj?.getLiuYue) {
            return { items: [], error: '暂时无法读取流月数据。' };
        }
        let rawMonths = [];
        try {
            rawMonths = liuNian.rawObj.getLiuYue() || [];
        } catch (error) {
            console.warn('读取流月失败', error);
            return { items: [], error: '读取流月数据时发生异常。' };
        }
        const ranges = buildLiuYueRanges(liuNian.year, SolarApi);
        const items = rawMonths.map((rawMonth, index) => {
            const ganZhi = rawMonth.getGanZhi?.() || '';
            if (ganZhi.length < 2) return null;
            const gan = ganZhi.substring(0, 1);
            const zhi = ganZhi.substring(1, 2);
            const xunInfo = getXunInfo(ganZhi);
            const range = ranges[index] || {};
            const isCurrent = Boolean(range.startDate && range.endDate && nowDate >= range.startDate && nowDate < range.endDate);
            const monthObj = { gan, zhi };
            const baseLayeredRelations = calculateFourLayerRelations(null, liuNian, monthObj, originalZhis);
            const daYunSegments = buildDaYunSegmentsForRange(daYunList, range.startDate, range.endDate)
                .map((segment) => segment.daYun ? {
                    ...segment,
                    yunRelations: calculatePairRelations(segment.daYun, monthObj, '大运', '流月'),
                    layeredRelations: calculateFourLayerRelations(segment.daYun, liuNian, monthObj, originalZhis)
                } : {
                    ...segment,
                    yunRelations: [],
                    layeredRelations: baseLayeredRelations
                });
            const effectiveDaYun = daYunSegments.length === 1 ? daYunSegments[0].daYun : null;
            return {
                rawObj: rawMonth,
                index,
                monthName: rawMonth.getMonthInChinese?.() || String(index + 1),
                gan,
                zhi,
                ganWuXing: getWuXing(gan),
                zhiWuXing: getWuXing(zhi),
                shiShen: shiShenMap[dayGan]?.[gan] || '',
                diShi: getDiShi(dayGan, zhi),
                naYin: getNaYin(ganZhi),
                xun: rawMonth.getXun?.() || xunInfo.xun,
                xunKong: rawMonth.getXunKong?.() || xunInfo.xunKong,
                startDate: range.startDate || null,
                endDate: range.endDate || null,
                rangeText: range.rangeText || '节令范围读取失败',
                shortRange: range.shortRange || '—',
                isCurrent,
                daYunSegments,
                baseLayeredRelations,
                isTransitionMonth: daYunSegments.length > 1,
                effectiveDaYun,
                relations: calculateBranchRelations(zhi, originalZhis),
                stemRelations: calculateStemRelations(gan, originalGans),
                pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '流月'),
                yunRelations: effectiveDaYun ? calculatePairRelations(effectiveDaYun, monthObj, '大运', '流月') : [],
                yearRelations: calculatePairRelations(liuNian, monthObj, '流年', '流月'),
                layeredRelations: effectiveDaYun ? calculateFourLayerRelations(effectiveDaYun, liuNian, monthObj, originalZhis) : baseLayeredRelations
            };
        }).filter(Boolean);
        return { items, error: '' };
    };

    const getAvailableYearRange = (daYunList = []) => {
        const allYears = daYunList
            .flatMap((item) => (item.rawObj?.getLiuNian?.() || []).map((liuNian) => liuNian.getYear()))
            .filter(Number.isFinite);
        return {
            min: allYears.length ? Math.min(...allYears) : '',
            max: allYears.length ? Math.max(...allYears) : ''
        };
    };

    const findDaYunIndexForYear = (daYunList = [], targetYear) => {
        for (let index = 0; index < daYunList.length; index += 1) {
            const years = (daYunList[index].rawObj?.getLiuNian?.() || []).map((liuNian) => liuNian.getYear());
            if (years.includes(targetYear)) return index;
        }
        return -1;
    };

    GuiJia.baziTiming = {
        jieMonthDefs,
        solarToDate,
        solarText,
        solarShort,
        findJieQiSolar,
        buildLiuNianRange,
        buildDaYunSegmentsForRange,
        findDaYunIndexForDate,
        buildLiuYueRanges,
        buildDaYunList,
        buildYunProfile,
        buildLiuNianList,
        buildLiuYueList,
        getAvailableYearRange,
        findDaYunIndexForYear
    };
})(window);
