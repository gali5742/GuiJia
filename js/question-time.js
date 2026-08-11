(function (global) {
    'use strict';

    const GuiJia = global.GuiJia = global.GuiJia || {};

    const DAY_MS = 86400000;
    const WEEKDAY_MAP = { '一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '日':0, '天':0 };
    const CHINESE_DIGITS = { '零':0, '〇':0, '一':1, '二':2, '两':2, '兩':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9 };

    const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());
    const cloneDate = (value) => new Date(value.getTime());
    const noon = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0);
    const dayStart = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
    const dayEnd = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
    const dateKey = (value) => `${value.getFullYear()}/${value.getMonth()+1}/${value.getDate()}`;
    const compareDay = (a, b) => dayStart(a).getTime() - dayStart(b).getTime();
    const addDays = (value, count) => {
        const out = noon(value);
        out.setDate(out.getDate() + Number(count || 0));
        return out;
    };
    const addMonths = (value, count) => {
        const source = noon(value);
        const originalDay = source.getDate();
        const target = new Date(source.getFullYear(), source.getMonth() + Number(count || 0), 1, 12, 0, 0, 0);
        const last = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12, 0, 0, 0).getDate();
        target.setDate(Math.min(originalDay, last));
        return target;
    };
    const addYears = (value, count) => {
        const source = noon(value);
        const year = source.getFullYear() + Number(count || 0);
        const month = source.getMonth();
        const day = source.getDate();
        const last = new Date(year, month + 1, 0, 12, 0, 0, 0).getDate();
        return new Date(year, month, Math.min(day, last), 12, 0, 0, 0);
    };
    const validYmd = (year, month, day) => {
        const result = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
        if (!isValidDate(result)) return null;
        if (result.getFullYear() !== Number(year) || result.getMonth() !== Number(month) - 1 || result.getDate() !== Number(day)) return null;
        return result;
    };
    const endOfMonth = (year, month) => new Date(Number(year), Number(month), 0, 12, 0, 0, 0);
    const startOfWeekMonday = (value) => addDays(value, -((value.getDay() + 6) % 7));
    const endOfWeekSunday = (value) => addDays(startOfWeekMonday(value), 6);
    const clampEffectiveStart = (calendarStart, baseDate) => compareDay(calendarStart, baseDate) < 0 ? noon(baseDate) : noon(calendarStart);

    const parseChineseNumber = (text) => {
        const raw = String(text || '').trim();
        if (!raw) return null;
        if (/^\d+$/.test(raw)) return Number(raw);
        if (raw === '十') return 10;
        if (/^[一二两兩三四五六七八九]十$/.test(raw)) return CHINESE_DIGITS[raw[0]] * 10;
        if (/^十[一二两兩三四五六七八九]$/.test(raw)) return 10 + CHINESE_DIGITS[raw[1]];
        if (/^[一二两兩三四五六七八九]十[一二两兩三四五六七八九]$/.test(raw)) return CHINESE_DIGITS[raw[0]] * 10 + CHINESE_DIGITS[raw[2]];
        if (raw.length === 1 && raw in CHINESE_DIGITS) return CHINESE_DIGITS[raw];
        return null;
    };

    const makeScope = ({ sourceText, type, precision, purpose = 'target', confidence = 'high', hardFilter = true, start = null, end = null, calendarStart = null, calendarEnd = null, dates = [], alternatives = [], boundary = null, anchor = null, note = '' }) => ({
        sourceText:String(sourceText || '').trim(),
        type,
        precision,
        purpose,
        confidence,
        hardFilter:Boolean(hardFilter),
        start:isValidDate(start) ? dayStart(start) : null,
        end:isValidDate(end) ? dayEnd(end) : null,
        calendarStart:isValidDate(calendarStart) ? dayStart(calendarStart) : (isValidDate(start) ? dayStart(start) : null),
        calendarEnd:isValidDate(calendarEnd) ? dayEnd(calendarEnd) : (isValidDate(end) ? dayEnd(end) : null),
        dates:(dates || []).filter(isValidDate).map(noon),
        alternatives:(alternatives || []).filter(isValidDate).map(noon),
        boundary,
        anchor:isValidDate(anchor) ? noon(anchor) : null,
        note
    });

    const inferMonthDay = (month, day, baseDate) => {
        let candidate = validYmd(baseDate.getFullYear(), month, day);
        if (!candidate) return null;
        if (compareDay(candidate, baseDate) < 0) candidate = validYmd(baseDate.getFullYear() + 1, month, day);
        return candidate;
    };

    const extractDayAnchor = (text, baseDate) => {
        const content = String(text || '').trim();
        if (!content) return null;
        let match = content.match(/((?:19|20)\d{2})\s*[年\/\-.]\s*(\d{1,2})\s*[月\/\-.]\s*(\d{1,2})\s*(?:日|号)?/);
        if (match) {
            const date = validYmd(match[1], match[2], match[3]);
            return date ? { sourceText:match[0], date, confidence:'high' } : null;
        }
        match = content.match(/(\d{1,2})月(\d{1,2})(?:日|号)/);
        if (match) {
            const date = inferMonthDay(match[1], match[2], baseDate);
            return date ? { sourceText:match[0], date, confidence:'high' } : null;
        }
        match = content.match(/(?:^|[^\d])(\d{1,2})[\/.](\d{1,2})(?:日|号)?(?:$|[^\d])/);
        if (match) {
            const date = inferMonthDay(match[1], match[2], baseDate);
            return date ? { sourceText:`${match[1]}/${match[2]}`, date, confidence:'high' } : null;
        }
        const relative = [
            { re:/(后天|後天)/, offset:2, label:'后天' },
            { re:/(明天|明日)/, offset:1, label:'明天' },
            { re:/(今天|今日)/, offset:0, label:'今天' }
        ].find((item) => item.re.test(content));
        if (relative) return { sourceText:relative.label, date:addDays(baseDate, relative.offset), confidence:'high' };

        match = content.match(/(下下周|下下週|下周|下週|本周|本週|这周|這週|本星期|这星期|這星期)?\s*(?:周|週|星期)?([一二三四五六日天])/);
        if (match && (match[1] || /(?:周|週|星期)[一二三四五六日天]/.test(match[0]))) {
            const prefix = String(match[1] || '');
            const weekOffset = /下下/.test(prefix) ? 2 : (/下/.test(prefix) ? 1 : 0);
            const weekStart = addDays(startOfWeekMonday(baseDate), weekOffset * 7);
            const targetDay = WEEKDAY_MAP[match[2]];
            const offset = targetDay === 0 ? 6 : targetDay - 1;
            let date = addDays(weekStart, offset);
            if (!prefix && compareDay(date, baseDate) < 0) date = addDays(date, 7);
            return { sourceText:match[0], date, confidence:'high' };
        }
        return null;
    };

    const periodForWeek = (baseDate, offsetWeeks, sourceText) => {
        const calendarStart = addDays(startOfWeekMonday(baseDate), offsetWeeks * 7);
        const calendarEnd = addDays(calendarStart, 6);
        return makeScope({ sourceText, type:'calendar-week', precision:'week', start:clampEffectiveStart(calendarStart, baseDate), end:calendarEnd, calendarStart, calendarEnd });
    };
    const periodForMonth = (baseDate, offsetMonths, sourceText) => {
        const anchor = addMonths(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12), offsetMonths);
        const calendarStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
        const calendarEnd = endOfMonth(anchor.getFullYear(), anchor.getMonth() + 1);
        return makeScope({ sourceText, type:'calendar-month', precision:'month', start:clampEffectiveStart(calendarStart, baseDate), end:calendarEnd, calendarStart, calendarEnd });
    };
    const periodForYear = (baseDate, offsetYears, sourceText) => {
        const year = baseDate.getFullYear() + offsetYears;
        const calendarStart = new Date(year, 0, 1, 12, 0, 0, 0);
        const calendarEnd = new Date(year, 11, 31, 12, 0, 0, 0);
        return makeScope({ sourceText, type:'calendar-year', precision:'year', start:clampEffectiveStart(calendarStart, baseDate), end:calendarEnd, calendarStart, calendarEnd });
    };

    const parseWeekend = (content, baseDate) => {
        const match = content.match(/(下下周末|下下週末|下周末|下週末|本周末|本週末|这周末|這週末|这个周末|這個週末|周末|週末)/);
        if (!match) return null;
        const offsetWeeks = /下下/.test(match[1]) ? 2 : (/下/.test(match[1]) ? 1 : 0);
        const weekStart = addDays(startOfWeekMonday(baseDate), offsetWeeks * 7);
        const saturday = addDays(weekStart, 5);
        const sunday = addDays(weekStart, 6);
        const start = clampEffectiveStart(saturday, baseDate);
        if (compareDay(start, sunday) > 0) return null;
        const dates = [saturday, sunday].filter((item) => compareDay(item, start) >= 0);
        return makeScope({ sourceText:match[1].replace(/週/g,'周').replace('這','这'), type:'weekend', precision:'day-range', start, end:sunday, calendarStart:saturday, calendarEnd:sunday, dates });
    };

    const parseMonthPart = (content, baseDate) => {
        let match = content.match(/(?:(?:((?:19|20)\d{2})年)?(\d{1,2})月|((?:本|这|這)月|下个月|下個月|下月))\s*(上旬|中旬|下旬)/);
        if (!match) return null;
        let year = baseDate.getFullYear();
        let month;
        if (match[2]) {
            month = Number(match[2]);
            if (match[1]) year = Number(match[1]);
            else {
                const probeEnd = endOfMonth(year, month);
                if (compareDay(probeEnd, baseDate) < 0) year += 1;
            }
        } else {
            const keyword = match[3];
            const offset = /下/.test(keyword) ? 1 : 0;
            const probe = addMonths(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12), offset);
            year = probe.getFullYear();
            month = probe.getMonth() + 1;
        }
        const part = match[4];
        const first = part === '上旬' ? 1 : (part === '中旬' ? 11 : 21);
        const last = part === '上旬' ? 10 : (part === '中旬' ? 20 : endOfMonth(year, month).getDate());
        const calendarStart = validYmd(year, month, first);
        const calendarEnd = validYmd(year, month, last);
        if (!calendarStart || !calendarEnd) return null;
        if (compareDay(calendarEnd, baseDate) < 0 && !match[1] && match[2]) {
            year += 1;
            return parseMonthPart(`${year}年${month}月${part}`, baseDate);
        }
        return makeScope({ sourceText:match[0], type:'month-part', precision:'day-range', start:clampEffectiveStart(calendarStart, baseDate), end:calendarEnd, calendarStart, calendarEnd });
    };

    const parseHalfYear = (content, baseDate) => {
        const match = content.match(/(今年|本年|明年)?\s*(上半年|下半年)/);
        if (!match) return null;
        const year = baseDate.getFullYear() + (match[1] === '明年' ? 1 : 0);
        const isFirst = match[2] === '上半年';
        const calendarStart = new Date(year, isFirst ? 0 : 6, 1, 12, 0, 0, 0);
        const calendarEnd = new Date(year, isFirst ? 5 : 11, isFirst ? 30 : 31, 12, 0, 0, 0);
        if (compareDay(calendarEnd, baseDate) < 0 && year === baseDate.getFullYear()) {
            return makeScope({ sourceText:match[0], type:'half-year', precision:'range', purpose:'historical-or-expired', confidence:'medium', hardFilter:false, calendarStart, calendarEnd, note:'所述时间范围已结束' });
        }
        return makeScope({ sourceText:match[0], type:'half-year', precision:'range', start:clampEffectiveStart(calendarStart, baseDate), end:calendarEnd, calendarStart, calendarEnd });
    };

    const parseRolling = (content, baseDate) => {
        const match = content.match(/(?:未来|接下来|接下來)?\s*([一二两兩三四五六七八九十\d]+)\s*(天|日|周|週|个月|個月|月|年)\s*(内|內)?/);
        if (!match) return null;
        const hasFuturePrefix = /未来|接下来|接下來/.test(match[0]);
        const hasWithin = Boolean(match[3]);
        if (!hasFuturePrefix && !hasWithin) return null;
        const count = parseChineseNumber(match[1]);
        if (!Number.isFinite(count) || count <= 0) return null;
        const unit = match[2];
        let end;
        if (/天|日/.test(unit)) end = addDays(baseDate, count);
        else if (/周|週/.test(unit)) end = addDays(baseDate, count * 7);
        else if (/月/.test(unit)) end = addMonths(baseDate, count);
        else end = addYears(baseDate, count);
        return makeScope({ sourceText:match[0], type:'rolling-range', precision:'range', start:baseDate, end, calendarStart:baseDate, calendarEnd:end, boundary:'within' });
    };

    const parseAfterPoint = (content, baseDate) => {
        const duration = content.match(/([一二两兩三四五六七八九十\d]+)\s*(天|日|周|週|个月|個月|月|年)\s*(以后|以後|之后|之後)/);
        if (duration) {
            const count = parseChineseNumber(duration[1]);
            if (count) {
                const unit = duration[2];
                const anchor = /天|日/.test(unit) ? addDays(baseDate, count)
                    : (/周|週/.test(unit) ? addDays(baseDate, count * 7)
                    : (/月/.test(unit) ? addMonths(baseDate, count) : addYears(baseDate, count)));
                return makeScope({ sourceText:duration[0], type:'open-boundary', precision:'open-range', purpose:'search-start', start:anchor, calendarStart:anchor, boundary:'after', anchor });
            }
        }
        const pointDuration = content.match(/([一二两兩三四五六七八九十\d]+)\s*(天|日|周|週|个月|個月|月|年)\s*后(?![以之])/);
        if (pointDuration) {
            const count = parseChineseNumber(pointDuration[1]);
            if (count) {
                const unit = pointDuration[2];
                const date = /天|日/.test(unit) ? addDays(baseDate, count)
                    : (/周|週/.test(unit) ? addDays(baseDate, count * 7)
                    : (/月/.test(unit) ? addMonths(baseDate, count) : addYears(baseDate, count)));
                return makeScope({ sourceText:pointDuration[0], type:'relative-offset', precision:'day', start:date, end:date, calendarStart:date, calendarEnd:date, dates:[date], anchor:date });
            }
        }
        if (/(以后|以後|之后|之後)/.test(content)) {
            const before = content.split(/以后|以後|之后|之後/)[0];
            const anchor = extractDayAnchor(before, baseDate);
            if (anchor) return makeScope({ sourceText:`${anchor.sourceText}以后`, type:'open-boundary', precision:'open-range', purpose:'search-start', start:anchor.date, calendarStart:anchor.date, boundary:'after', anchor:anchor.date });
        }
        return null;
    };

    const parseMonthEndBoundary = (content, baseDate) => {
        let match = content.match(/(下个月|下個月|下月|本月|这个月|這個月)?月底\s*(前|之前|以前|为止|為止)/);
        if (match) {
            const offset = /下/.test(match[1] || '') ? 1 : 0;
            const anchorMonth = addMonths(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1, 12), offset);
            const end = endOfMonth(anchorMonth.getFullYear(), anchorMonth.getMonth() + 1);
            return makeScope({ sourceText:match[0], type:'bounded-range', precision:'day-range', purpose:'search-end', start:baseDate, end, calendarStart:baseDate, calendarEnd:end, boundary:'before', anchor:end });
        }
        match = content.match(/(今年|本年|明年)?年底\s*(前|之前|以前|为止|為止)/);
        if (match) {
            const year = baseDate.getFullYear() + (match[1] === '明年' ? 1 : 0);
            const end = new Date(year, 11, 31, 12, 0, 0, 0);
            return makeScope({ sourceText:match[0], type:'bounded-range', precision:'day-range', purpose:'search-end', start:baseDate, end, calendarStart:baseDate, calendarEnd:end, boundary:'before', anchor:end });
        }
        return null;
    };

    const parseExplicitEndBoundary = (content, baseDate) => {
        const match = content.match(/(.{1,20}?)(?:之前|以前|为止|為止|前(?!后|後))/);
        if (!match) return null;
        const anchor = extractDayAnchor(match[1], baseDate);
        if (!anchor) return null;
        return makeScope({ sourceText:`${anchor.sourceText}前`, type:'bounded-range', precision:'day-range', purpose:'search-end', start:baseDate, end:anchor.date, calendarStart:baseDate, calendarEnd:anchor.date, boundary:'before', anchor:anchor.date });
    };

    const parseRange = (content, baseDate) => {
        let match = content.match(/((?:19|20)\d{2}年)?(\d{1,2})月(\d{1,2})日?\s*(?:到|至|—|–|~|～)\s*(\d{1,2})日/);
        if (match) {
            let year = match[1] ? Number(match[1].replace('年','')) : baseDate.getFullYear();
            const month = Number(match[2]);
            const first = Number(match[3]);
            const last = Number(match[4]);
            let start = validYmd(year, month, first);
            let end = validYmd(year, month, last);
            if (!start || !end) return null;
            if (!match[1] && compareDay(end, baseDate) < 0) {
                year += 1;
                start = validYmd(year, month, first);
                end = validYmd(year, month, last);
            }
            return makeScope({ sourceText:match[0], type:'explicit-range', precision:'day-range', start:clampEffectiveStart(start, baseDate), end, calendarStart:start, calendarEnd:end });
        }
        match = content.match(/(?:从|從)?\s*(.+?)\s*(?:到|至|—|–|~|～)\s*(.+?)(?:怎么样|怎麼樣|如何|出差|出行|旅行|面试|面試|能否|可以|$)/);
        if (!match) return null;
        const left = extractDayAnchor(match[1], baseDate);
        if (!left) return null;
        const right = extractDayAnchor(match[2], baseDate);
        if (!right) return null;
        let end = right.date;
        while (compareDay(end, left.date) < 0) end = addDays(end, 7);
        return makeScope({ sourceText:`${left.sourceText}到${right.sourceText}`, type:'explicit-range', precision:'day-range', start:clampEffectiveStart(left.date, baseDate), end, calendarStart:left.date, calendarEnd:end });
    };

    const parseOneWeekFrom = (content, baseDate) => {
        const match = content.match(/从?(.+?)开始的?一周/);
        if (!match) return null;
        const anchor = extractDayAnchor(match[1], baseDate);
        if (!anchor) return null;
        const end = addDays(anchor.date, 6);
        return makeScope({ sourceText:match[0], type:'anchored-duration', precision:'day-range', start:anchor.date, end, calendarStart:anchor.date, calendarEnd:end });
    };

    const parseAlternatives = (content, baseDate) => {
        if (!/(或者|或是|还是|還是|或)/.test(content)) return null;
        const segments = content.split(/或者|或是|还是|還是|或/);
        const anchors = segments.map((segment) => extractDayAnchor(segment, baseDate)).filter(Boolean);
        if (anchors.length < 2) return null;
        const dates = anchors.map((item) => item.date);
        return makeScope({ sourceText:anchors.map((item) => item.sourceText).join(' / '), type:'alternatives', precision:'discrete-days', purpose:'alternatives', dates, alternatives:dates, start:dates.reduce((a,b) => compareDay(a,b) <= 0 ? a : b), end:dates.reduce((a,b) => compareDay(a,b) >= 0 ? a : b) });
    };

    const parseCorrection = (content, baseDate) => {
        let match = content.match(/(?:不是|并非|並非)\s*([^，,；;]+)[，,；;]\s*(?:是|改成|改为|改為)?\s*(.+)$/);
        if (match) {
            const corrected = parseQuestionTimeScope(match[2], baseDate, { skipCorrection:true });
            if (corrected) return { ...corrected, sourceText:corrected.sourceText, note:'已按后项修正前项时间表达' };
        }
        match = content.match(/([^，,；;]+?)\s*不行[，,；;]\s*(.+)$/);
        if (match) {
            const corrected = parseQuestionTimeScope(match[2], baseDate, { skipCorrection:true });
            if (corrected) return { ...corrected, note:'已忽略被否定的前项时间表达' };
        }
        return null;
    };

    function parseQuestionTimeScope(question, baseDateInput, options = {}) {
        const content = String(question || '').trim();
        const baseDate = isValidDate(baseDateInput) ? noon(baseDateInput) : null;
        if (!content || !baseDate) return null;

        if (!options.skipCorrection) {
            const correction = parseCorrection(content, baseDate);
            if (correction) return correction;
        }

        if (/明后两天|明後兩天/.test(content)) {
            const start = addDays(baseDate, 1);
            const end = addDays(baseDate, 2);
            return makeScope({ sourceText:'明后两天', type:'relative-range', precision:'day-range', start, end, calendarStart:start, calendarEnd:end });
        }

        const alternatives = parseAlternatives(content, baseDate);
        if (alternatives) return alternatives;

        const oneWeek = parseOneWeekFrom(content, baseDate);
        if (oneWeek) return oneWeek;

        const explicitRange = parseRange(content, baseDate);
        if (explicitRange) return explicitRange;

        const monthEndBoundary = parseMonthEndBoundary(content, baseDate);
        if (monthEndBoundary) return monthEndBoundary;

        const afterPoint = parseAfterPoint(content, baseDate);
        if (afterPoint) return afterPoint;

        const explicitEnd = parseExplicitEndBoundary(content, baseDate);
        if (explicitEnd) return explicitEnd;

        const rolling = parseRolling(content, baseDate);
        if (rolling) return rolling;

        const weekend = parseWeekend(content, baseDate);
        if (weekend) return weekend;

        const monthPart = parseMonthPart(content, baseDate);
        if (monthPart) return monthPart;

        const halfYear = parseHalfYear(content, baseDate);
        if (halfYear) return halfYear;

        if (/(月初|年初|年中|月底左右|月末左右|年底左右|前后|前後|左右)/.test(content)) {
            let anchor = null;
            const explicit = extractDayAnchor(content, baseDate);
            if (explicit) anchor = explicit.date;
            else if (/月底|月末/.test(content)) anchor = endOfMonth(baseDate.getFullYear(), baseDate.getMonth() + 1);
            else if (/年底/.test(content)) anchor = new Date(baseDate.getFullYear(), 11, 31, 12, 0, 0, 0);
            return makeScope({ sourceText:(content.match(/(\d{1,2}月\d{1,2}日(?:前后|前後|左右)|月底左右|月末左右|年底左右|月初|年初|年中)/) || ['模糊时间'])[0], type:'approximate', precision:'approximate', purpose:'target', confidence:'medium', hardFilter:false, anchor, note:'模糊时间表达，不用于硬过滤应期' });
        }

        const dayAnchor = extractDayAnchor(content, baseDate);
        if (dayAnchor) return makeScope({ sourceText:dayAnchor.sourceText, type:'day', precision:'day', start:dayAnchor.date, end:dayAnchor.date, calendarStart:dayAnchor.date, calendarEnd:dayAnchor.date, dates:[dayAnchor.date], anchor:dayAnchor.date });

        let match = content.match(/(下下周|下下週|下周|下週|本周|本週|这周|這週)(?!末)/);
        if (match) return periodForWeek(baseDate, /下下/.test(match[1]) ? 2 : (/下/.test(match[1]) ? 1 : 0), match[1].replace(/週/g,'周').replace('這','这'));

        match = content.match(/(下个月|下個月|下月|本月|这个月|這個月)/);
        if (match) return periodForMonth(baseDate, /下/.test(match[1]) ? 1 : 0, match[1].replace('個','个').replace('這','这'));

        match = content.match(/(明年|今年|本年)/);
        if (match) return periodForYear(baseDate, match[1] === '明年' ? 1 : 0, match[1]);


        if (/(最近|近期|近来|近來|过几天|過幾天|未来几天|未來幾天|不久|过阵子|過陣子|这段时间|這段時間)/.test(content)) {
            const source = (content.match(/(最近|近期|近来|近來|过几天|過幾天|未来几天|未來幾天|不久(?:以后|以後)?|过阵子|過陣子|这段时间|這段時間)/) || ['模糊时间'])[0];
            return makeScope({ sourceText:source, type:'vague', precision:'vague', purpose:'target', confidence:'low', hardFilter:false, note:'未限定精确日期范围' });
        }

        if (/(以后|以後|之后|之後)/.test(content)) {
            return makeScope({ sourceText:'以后', type:'vague-future', precision:'open-range', purpose:'search-start', confidence:'low', hardFilter:false, start:baseDate, calendarStart:baseDate, boundary:'after', note:'仅识别为开放式未来' });
        }
        return null;
    }

    const expandScopeDates = (scope, maxDays = 31) => {
        if (!scope) return [];
        if (scope.dates?.length) return scope.dates.map(noon);
        if (!isValidDate(scope.start) || !isValidDate(scope.end)) return [];
        const span = Math.floor((dayStart(scope.end).getTime() - dayStart(scope.start).getTime()) / DAY_MS) + 1;
        if (span < 1 || span > maxDays) return [];
        const out = [];
        for (let index = 0; index < span; index += 1) out.push(addDays(scope.start, index));
        return out;
    };

    const scopeContainsDate = (scope, dateObj) => {
        if (!scope || !isValidDate(dateObj)) return false;
        const time = dayStart(dateObj).getTime();
        if (scope.purpose === 'alternatives' && scope.alternatives?.length) {
            const key = dateKey(dateObj);
            return scope.alternatives.some((item) => dateKey(item) === key);
        }
        const start = isValidDate(scope.start) ? dayStart(scope.start).getTime() : null;
        const end = isValidDate(scope.end) ? dayEnd(scope.end).getTime() : null;
        if (start !== null && time < start) return false;
        if (end !== null && time > end) return false;
        return start !== null || end !== null;
    };

    const scopeRangeText = (scope) => {
        if (!scope) return '';
        if (scope.purpose === 'alternatives' && scope.alternatives?.length) return scope.alternatives.map(dateKey).join(' / ');
        if (scope.start && scope.end && dateKey(scope.start) === dateKey(scope.end)) return dateKey(scope.start);
        if (scope.start && scope.end) return `${dateKey(scope.start)} ～ ${dateKey(scope.end)}`;
        if (scope.start) return `${dateKey(scope.start)} 起`;
        if (scope.end) return `${dateKey(scope.end)} 前`;
        if (scope.anchor) return `约 ${dateKey(scope.anchor)}`;
        return '';
    };

    const classifyQuestionTimeMode = (question, scope = null) => {
        const content = String(question || '').replace(/\s+/g, '');
        if (!content) return 'process-evaluation';
        if (scope?.confidence === 'low' || scope?.hardFilter === false) return 'vague';

        const selectionPattern = /(哪天|哪一日|哪日|哪一天|何日|什么时候|什麼時候|何时|何時|哪个日子|哪個日子|哪天好|哪天更好|哪个好|哪個好|哪天适合|哪天適合)/;
        if (selectionPattern.test(content) || (scope?.purpose === 'alternatives' && /(好|适合|適合|宜|选|選|比较|比較)/.test(content))) {
            return 'date-selection';
        }

        const processPattern = /(如何|怎么样|怎麼樣|顺利|順利|顺不顺|順不順|出差|出行|旅行|行程|旅程|过程|過程|这几天|這幾天|期间|期間)/;
        const outcomePattern = /(能不能|能否|会不会|會不會|是否|可不可以|有没有|有沒有|收到|得到|等到|出现|出現|发生|發生|联系|聯繫|回复|回覆|消息|通知|结果|結果|到账|到賬|录取|錄取|通过|通過|找到|成交|成功|落实|落實)/;

        if ((scope?.purpose === 'search-end' || scope?.boundary === 'before') && outcomePattern.test(content) && !processPattern.test(content)) {
            return 'deadline';
        }
        if (processPattern.test(content)) return 'process-evaluation';
        if (outcomePattern.test(content)) return 'event-occurrence';
        if (scope?.purpose === 'search-end' || scope?.boundary === 'before') return 'deadline';
        if (scope?.purpose === 'alternatives') return 'date-selection';
        return 'process-evaluation';
    };

    GuiJia.questionTime = {
        parseChineseNumber,
        parseQuestionTimeScope,
        expandScopeDates,
        scopeContainsDate,
        scopeRangeText,
        classifyQuestionTimeMode,
        dateKey
    };
})(window);
