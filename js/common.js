(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const parseLocalDateTime = (value) => {
        const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
        if (!match) throw new Error('出生时间格式不正确。');
        const [, year, month, day, hour, minute] = match.map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute, 0, 0);
        const fieldsMatch = dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day && dateObj.getHours() === hour && dateObj.getMinutes() === minute;
        if (!fieldsMatch) throw new Error('请输入有效的出生日期和时间。');
        return dateObj;
    };

    const formatWallDateTime = (dateObj) => [
        dateObj.getFullYear(), '年', dateObj.getMonth() + 1, '月', dateObj.getDate(), '日 ',
        String(dateObj.getHours()).padStart(2, '0'), ':', String(dateObj.getMinutes()).padStart(2, '0')
    ].join('');

    const formatInputDateTime = (dateObj) => [
        dateObj.getFullYear(),
        String(dateObj.getMonth() + 1).padStart(2, '0'),
        String(dateObj.getDate()).padStart(2, '0')
    ].join('-') + 'T' + [
        String(dateObj.getHours()).padStart(2, '0'),
        String(dateObj.getMinutes()).padStart(2, '0')
    ].join(':');

    const degToRad = (deg) => deg * Math.PI / 180;
    const radToDeg = (rad) => rad * 180 / Math.PI;
    const normalizeDegrees = (deg) => ((deg % 360) + 360) % 360;

    // NOAA General Solar Position Calculations 的均时差近似式。
    // https://gml.noaa.gov/grad/solcalc/solareqns.PDF （核对日期：2026-08-07）
    const calculateEquationOfTime = (dateObj) => {
        const utcMillis = Date.UTC(
            dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(),
            dateObj.getHours(), dateObj.getMinutes(), 0, 0
        );
        const julianDay = utcMillis / 86400000 + 2440587.5;
        const t = (julianDay - 2451545.0) / 36525;
        const geomMeanLongSun = normalizeDegrees(280.46646 + t * (36000.76983 + t * 0.0003032));
        const geomMeanAnomalySun = 357.52911 + t * (35999.05029 - 0.0001537 * t);
        const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
        const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
        const omega = 125.04 - 1934.136 * t;
        const obliquityCorrection = meanObliquity + 0.00256 * Math.cos(degToRad(omega));
        const y = Math.tan(degToRad(obliquityCorrection) / 2) ** 2;
        const l0 = degToRad(geomMeanLongSun);
        const m = degToRad(geomMeanAnomalySun);
        const equation = y * Math.sin(2 * l0)
            - 2 * eccentricity * Math.sin(m)
            + 4 * eccentricity * y * Math.sin(m) * Math.cos(2 * l0)
            - 0.5 * y * y * Math.sin(4 * l0)
            - 1.25 * eccentricity * eccentricity * Math.sin(2 * m);
        return 4 * radToDeg(equation);
    };

    const formatSignedMinutes = (minutes) => {
        const sign = minutes >= 0 ? '+' : '−';
        const absolute = Math.abs(minutes);
        return `${sign}${absolute.toFixed(1)} 分`;
    };

    const buildSolarCorrection = (civilDate, settings) => {
        const mode = settings.solarTimeMode || 'none';
        const modeLabels = {
            none: '民用时间（不修正）',
            mean: '地方平太阳时',
            apparent: '真太阳时'
        };
        if (mode === 'none') {
            return {
                valid: true,
                mode,
                modeLabel: modeLabels[mode],
                civilDate,
                adjustedDate: new Date(civilDate.getTime()),
                longitudeMinutes: 0,
                equationMinutes: 0,
                dstAdjustment: 0,
                totalMinutes: 0,
                standardMeridian: null
            };
        }

        if (settings.longitude === '' || settings.longitude === null || settings.longitude === undefined) throw new Error('启用太阳时修正时，请填写出生地经度。');
        if (settings.utcOffset === '' || settings.utcOffset === null || settings.utcOffset === undefined) throw new Error('请填写出生地标准时区 UTC 偏移。');
        const longitude = Number(settings.longitude);
        const utcOffset = Number(settings.utcOffset);
        const dstMinutes = Number(settings.dstMinutes || 0);
        if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('启用太阳时修正时，请输入 −180° 至 180° 之间的出生地经度。');
        if (!Number.isFinite(utcOffset) || utcOffset < -14 || utcOffset > 14) throw new Error('请填写有效的出生地标准时区 UTC 偏移。');
        if (!Number.isFinite(dstMinutes) || dstMinutes < 0 || dstMinutes > 180) throw new Error('历史夏令时修正应为 0 至 180 分钟。');

        const standardMeridian = utcOffset * 15;
        const longitudeMinutes = 4 * (longitude - standardMeridian);
        const equationMinutes = mode === 'apparent' ? calculateEquationOfTime(civilDate) : 0;
        const dstAdjustment = -dstMinutes;
        const totalMinutes = longitudeMinutes + equationMinutes + dstAdjustment;
        const adjustedDate = new Date(civilDate.getTime() + totalMinutes * 60000);
        return {
            valid: true,
            mode,
            modeLabel: modeLabels[mode],
            civilDate,
            adjustedDate,
            longitude,
            utcOffset,
            dstMinutes,
            standardMeridian,
            longitudeMinutes,
            equationMinutes,
            dstAdjustment,
            totalMinutes
        };
    };

    GuiJia.common = {
        parseLocalDateTime,
        formatWallDateTime,
        formatInputDateTime,
        degToRad,
        radToDeg,
        normalizeDegrees,
        calculateEquationOfTime,
        formatSignedMinutes,
        buildSolarCorrection
    };
})(window);
