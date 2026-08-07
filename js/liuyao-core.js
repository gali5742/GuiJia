(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { chongMap, heMap, getWuXing } = GuiJia.baziCore;
    const trigramData = {
        7: { name: '乾', nature: '天', element: '金', innerStem: '甲', outerStem: '壬', innerBranches: ['子','寅','辰'], outerBranches: ['午','申','戌'] },
        3: { name: '兑', nature: '泽', element: '金', innerStem: '丁', outerStem: '丁', innerBranches: ['巳','卯','丑'], outerBranches: ['亥','酉','未'] },
        5: { name: '离', nature: '火', element: '火', innerStem: '己', outerStem: '己', innerBranches: ['卯','丑','亥'], outerBranches: ['酉','未','巳'] },
        1: { name: '震', nature: '雷', element: '木', innerStem: '庚', outerStem: '庚', innerBranches: ['子','寅','辰'], outerBranches: ['午','申','戌'] },
        6: { name: '巽', nature: '风', element: '木', innerStem: '辛', outerStem: '辛', innerBranches: ['丑','亥','酉'], outerBranches: ['未','巳','卯'] },
        2: { name: '坎', nature: '水', element: '水', innerStem: '戊', outerStem: '戊', innerBranches: ['寅','辰','午'], outerBranches: ['申','戌','子'] },
        4: { name: '艮', nature: '山', element: '土', innerStem: '丙', outerStem: '丙', innerBranches: ['辰','午','申'], outerBranches: ['戌','子','寅'] },
        0: { name: '坤', nature: '地', element: '土', innerStem: '乙', outerStem: '癸', innerBranches: ['未','巳','卯'], outerBranches: ['丑','亥','酉'] }
    };
    const trigramCodeByName = Object.fromEntries(Object.entries(trigramData).map(([code, item]) => [item.name, Number(code)]));
    const hexagramNames = {
        '乾-乾':'乾','乾-兑':'夬','乾-离':'大有','乾-震':'大壮','乾-巽':'小畜','乾-坎':'需','乾-艮':'大畜','乾-坤':'泰',
        '兑-乾':'履','兑-兑':'兑','兑-离':'睽','兑-震':'归妹','兑-巽':'中孚','兑-坎':'节','兑-艮':'损','兑-坤':'临',
        '离-乾':'同人','离-兑':'革','离-离':'离','离-震':'丰','离-巽':'家人','离-坎':'既济','离-艮':'贲','离-坤':'明夷',
        '震-乾':'无妄','震-兑':'随','震-离':'噬嗑','震-震':'震','震-巽':'益','震-坎':'屯','震-艮':'颐','震-坤':'复',
        '巽-乾':'姤','巽-兑':'大过','巽-离':'鼎','巽-震':'恒','巽-巽':'巽','巽-坎':'井','巽-艮':'蛊','巽-坤':'升',
        '坎-乾':'讼','坎-兑':'困','坎-离':'未济','坎-震':'解','坎-巽':'涣','坎-坎':'坎','坎-艮':'蒙','坎-坤':'师',
        '艮-乾':'遁','艮-兑':'咸','艮-离':'旅','艮-震':'小过','艮-巽':'渐','艮-坎':'蹇','艮-艮':'艮','艮-坤':'谦',
        '坤-乾':'否','坤-兑':'萃','坤-离':'晋','坤-震':'豫','坤-巽':'观','坤-坎':'比','坤-艮':'剥','坤-坤':'坤'
    };
    const kingWenOrder = ['乾','坤','屯','蒙','需','讼','师','比','小畜','履','泰','否','同人','大有','谦','豫','随','蛊','临','观','噬嗑','贲','剥','复','无妄','大畜','颐','大过','坎','离','咸','恒','遁','大壮','晋','明夷','家人','睽','蹇','解','损','益','夬','姤','萃','升','困','井','革','鼎','震','艮','渐','归妹','丰','旅','巽','兑','涣','节','中孚','小过','既济','未济'];
    const lineKey = (lines) => lines.map((value) => value ? '1' : '0').join('');
    const trigramCode = (lines) => lines.reduce((sum, value, index) => sum + (value ? (1 << index) : 0), 0);
    const getHexagram = (lines) => {
        const lower = trigramData[trigramCode(lines.slice(0, 3))];
        const upper = trigramData[trigramCode(lines.slice(3, 6))];
        const name = hexagramNames[`${lower.name}-${upper.name}`];
        const number = kingWenOrder.indexOf(name) + 1;
        return { name, number, symbol: String.fromCodePoint(0x4DC0 + number - 1), lower, upper, lines: [...lines] };
    };
    const liuyaoPalaceMap = (() => {
        const map = {};
        const stages = [
            { stage: '本宫六世', shi: 6, ying: 3 },
            { stage: '一世', shi: 1, ying: 4 },
            { stage: '二世', shi: 2, ying: 5 },
            { stage: '三世', shi: 3, ying: 6 },
            { stage: '四世', shi: 4, ying: 1 },
            { stage: '五世', shi: 5, ying: 2 },
            { stage: '游魂', shi: 4, ying: 1 },
            { stage: '归魂', shi: 3, ying: 6 }
        ];
        Object.values(trigramData).forEach((palace) => {
            const code = trigramCodeByName[palace.name];
            let current = [...Array(6)].map((_, index) => Boolean(code & (1 << (index % 3))));
            const sequence = [[...current]];
            for (let index = 0; index < 5; index += 1) {
                current[index] = !current[index];
                sequence.push([...current]);
            }
            current[3] = !current[3];
            sequence.push([...current]);
            [0, 1, 2].forEach((index) => { current[index] = !current[index]; });
            sequence.push([...current]);
            sequence.forEach((lines, index) => {
                map[lineKey(lines)] = { palace: palace.name, element: palace.element, ...stages[index] };
            });
        });
        return map;
    })();
    const naJiaForLines = (lines) => {
        const lower = trigramData[trigramCode(lines.slice(0, 3))];
        const upper = trigramData[trigramCode(lines.slice(3, 6))];
        return lines.map((_, index) => {
            const inner = index < 3;
            const branchIndex = inner ? index : index - 3;
            const trigram = inner ? lower : upper;
            const stem = inner ? trigram.innerStem : trigram.outerStem;
            const branch = inner ? trigram.innerBranches[branchIndex] : trigram.outerBranches[branchIndex];
            return { stem, branch, element: getWuXing(branch), text: `${stem}${branch}${getWuXing(branch)}` };
        });
    };
    const generateMap = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    const controlMap = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    const sixRelation = (lineElement, palaceElement) => {
        if (lineElement === palaceElement) return '兄弟';
        if (generateMap[lineElement] === palaceElement) return '父母';
        if (generateMap[palaceElement] === lineElement) return '子孙';
        if (controlMap[lineElement] === palaceElement) return '官鬼';
        if (controlMap[palaceElement] === lineElement) return '妻财';
        return '';
    };
    const sixSpirits = (dayGan) => {
        const order = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
        const starts = { '甲':0, '乙':0, '丙':1, '丁':1, '戊':2, '己':3, '庚':4, '辛':4, '壬':5, '癸':5 };
        const start = starts[dayGan] ?? 0;
        return Array.from({ length: 6 }, (_, index) => order[(start + index) % 6]);
    };
    // 六爻结构分析口径：月建、日辰、动变、用神与飞伏。
    // 参考《增删卜易》月建章、日辰章、用神元忌章、进退神章、六合六冲章、反伏章；
    // 八宫飞伏参照《京氏易传》。核对日期：2026-08-07。
    const liuyaoSeasonStates = {
        spring: { '木':'旺', '火':'相', '水':'休', '金':'囚', '土':'死' },
        summer: { '火':'旺', '土':'相', '木':'休', '水':'囚', '金':'死' },
        autumn: { '金':'旺', '水':'相', '土':'休', '火':'囚', '木':'死' },
        winter: { '水':'旺', '木':'相', '金':'休', '土':'囚', '火':'死' },
        earth: { '土':'旺', '金':'相', '火':'休', '木':'囚', '水':'死' }
    };
    const liuyaoMonthSeason = (branch) => {
        if (['寅','卯'].includes(branch)) return 'spring';
        if (['巳','午'].includes(branch)) return 'summer';
        if (['申','酉'].includes(branch)) return 'autumn';
        if (['亥','子'].includes(branch)) return 'winter';
        return 'earth';
    };
    const liuyaoSeasonState = (monthBranch, element) => liuyaoSeasonStates[liuyaoMonthSeason(monthBranch)]?.[element] || '—';
    const uniqueStatusTags = (tags) => {
        const seen = new Set();
        return tags.filter((tag) => {
            const key = `${tag.code || tag.text}|${tag.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };
    const hasStatusCode = (line, code) => Boolean(line?.statusTags?.some((tag) => tag.code === code));
    const hasMoveCode = (line, code) => Boolean(line?.moveTags?.some((tag) => tag.code === code));
    const buildLiuYaoLineStatus = (line, monthBranch, dayBranch, xunKong, moving = false) => {
        const tags = [];
        const element = line.element;
        const branch = line.branch;
        const monthElement = getWuXing(monthBranch);
        const dayElement = getWuXing(dayBranch);
        const seasonState = liuyaoSeasonState(monthBranch, element);
        tags.push({ code: 'SEASON_STATE', text: `月令${seasonState}`, type: ['旺','相'].includes(seasonState) ? 'support' : (['囚','死'].includes(seasonState) ? 'constraint' : 'neutral') });

        if (branch === monthBranch) tags.push({ code: 'MONTH_COMMAND', text: '临月建', type: 'support' });
        if (heMap[branch] === monthBranch) tags.push({ code: 'MONTH_HARMONY', text: '月合', type: 'support' });
        if (chongMap[branch] === monthBranch) tags.push({ code: 'MONTH_BREAK', text: '月破', type: 'constraint' });
        if (branch !== monthBranch) {
            if (generateMap[monthElement] === element) tags.push({ code: 'MONTH_GENERATE', text: '月建生', type: 'support' });
            else if (controlMap[monthElement] === element) tags.push({ code: 'MONTH_CONTROL', text: '月建克', type: 'constraint' });
            else if (monthElement === element) tags.push({ code: 'MONTH_SUPPORT', text: '月令比扶', type: 'support' });
        }

        if (branch === dayBranch) tags.push({ code: 'DAY_COMMAND', text: '临日辰', type: 'support' });
        if (heMap[branch] === dayBranch) tags.push({ code: 'DAY_HARMONY', text: moving ? '日合·合绊提示' : '日合·合起提示', type: 'trigger' });
        const dayClash = chongMap[branch] === dayBranch;
        if (dayClash) {
            if (moving) {
                tags.push({ code: 'DAY_CLASH', text: '日冲', type: 'trigger' });
            } else {
                const monthSupport = branch === monthBranch || monthElement === element || generateMap[monthElement] === element || ['旺','相'].includes(seasonState);
                tags.push(monthSupport
                    ? { code: 'DARK_MOVING', text: '日冲·暗动提示', type: 'trigger' }
                    : { code: 'DAY_BREAK', text: '日冲·日破提示', type: 'trigger' });
            }
        }
        if (branch !== dayBranch) {
            if (generateMap[dayElement] === element) tags.push({ code: 'DAY_GENERATE', text: '日辰生', type: 'support' });
            else if (controlMap[dayElement] === element) tags.push({ code: 'DAY_CONTROL', text: '日辰克', type: 'constraint' });
            else if (dayElement === element) tags.push({ code: 'DAY_SUPPORT', text: '日辰比扶', type: 'support' });
        }
        if ((xunKong || '').includes(branch)) tags.push({ code: 'VOID', text: '旬空', type: 'void' });
        return { seasonState, tags: uniqueStatusTags(tags), dayClash };
    };
    const liuyaoProgressMap = { '亥子':'化进神', '寅卯':'化进神', '巳午':'化进神', '申酉':'化进神', '丑辰':'化进神', '辰未':'化进神', '未戌':'化进神' };
    const liuyaoRetreatMap = { '子亥':'化退神', '卯寅':'化退神', '午巳':'化退神', '酉申':'化退神', '辰丑':'化退神', '未辰':'化退神', '戌未':'化退神' };
    const liuyaoGrowthMarkers = {
        '木': { '亥':'化长生', '卯':'化帝旺', '未':'化墓', '申':'化绝' },
        '火': { '寅':'化长生', '午':'化帝旺', '戌':'化墓', '亥':'化绝' },
        '金': { '巳':'化长生', '酉':'化帝旺', '丑':'化墓', '寅':'化绝' },
        '水': { '申':'化长生', '子':'化帝旺', '辰':'化墓', '巳':'化绝' },
        '土': { '申':'化长生', '子':'化帝旺', '辰':'化墓', '巳':'化绝' }
    };
    const growthMarkerCode = {
        '化长生': 'TRANSFORM_GROWTH',
        '化帝旺': 'TRANSFORM_PROSPER',
        '化墓': 'TRANSFORM_TOMB',
        '化绝': 'TRANSFORM_EXTINCTION'
    };
    const buildMoveAnalysis = (originalLine, changedLine, monthBranch, xunKong) => {
        const tags = [];
        if (changedLine.element === originalLine.element) tags.push({ code: 'TRANSFORM_PEER', text: '比和', type: 'transform' });
        if (generateMap[changedLine.element] === originalLine.element) tags.push({ code: 'RETURN_GENERATE', text: '回头生', type: 'support' });
        if (controlMap[changedLine.element] === originalLine.element) tags.push({ code: 'RETURN_CONTROL', text: '回头克', type: 'constraint' });
        if (heMap[originalLine.branch] === changedLine.branch) tags.push({ code: 'RETURN_HARMONY', text: '回头合', type: 'transform' });
        if (chongMap[originalLine.branch] === changedLine.branch) tags.push({ code: 'RETURN_CLASH', text: '回头冲', type: 'trigger' });
        const pair = `${originalLine.branch}${changedLine.branch}`;
        if (liuyaoProgressMap[pair]) tags.push({ code: 'PROGRESS', text: liuyaoProgressMap[pair], type: 'support' });
        if (liuyaoRetreatMap[pair]) tags.push({ code: 'RETREAT', text: liuyaoRetreatMap[pair], type: 'constraint' });
        const growth = liuyaoGrowthMarkers[originalLine.element]?.[changedLine.branch];
        if (growth) tags.push({ code: growthMarkerCode[growth] || 'TRANSFORM_GROWTH_STATE', text: growth, type: ['化长生','化帝旺'].includes(growth) ? 'support' : 'constraint' });
        if ((xunKong || '').includes(changedLine.branch)) tags.push({ code: 'TRANSFORM_VOID', text: '化空', type: 'void' });
        if (chongMap[changedLine.branch] === monthBranch) tags.push({ code: 'TRANSFORM_MONTH_BREAK', text: '化月破', type: 'constraint' });
        return uniqueStatusTags(tags.length ? tags : [{ code: 'MOVING_CHANGE', text: '动而有变', type: 'neutral' }]);
    };
    const elementGenerator = (element) => Object.keys(generateMap).find((candidate) => generateMap[candidate] === element) || '';
    const elementController = (element) => Object.keys(controlMap).find((candidate) => controlMap[candidate] === element) || '';
    const describeElementDirection = (a, b, aLabel = '世', bLabel = '应') => {
        if (a === b) return `${aLabel}${bLabel}比和`;
        if (generateMap[a] === b) return `${aLabel}生${bLabel}`;
        if (generateMap[b] === a) return `${bLabel}生${aLabel}`;
        if (controlMap[a] === b) return `${aLabel}克${bLabel}`;
        if (controlMap[b] === a) return `${bLabel}克${aLabel}`;
        return `${aLabel}${bLabel}五行无直接生克`;
    };
    const buildShiYingSummary = (rows) => {
        const shi = rows.find((line) => line.isShi);
        const ying = rows.find((line) => line.isYing);
        if (!shi || !ying) return { text: '未读取到完整世应位置。', tags: [] };
        const tags = [{ text: describeElementDirection(shi.element, ying.element), type: 'neutral' }];
        if (heMap[shi.branch] === ying.branch) tags.push({ text: '世应六合', type: 'transform' });
        if (chongMap[shi.branch] === ying.branch) tags.push({ text: '世应六冲', type: 'trigger' });
        if (shi.moving && ying.moving) tags.push({ text: '世应俱动', type: 'trigger' });
        else if (shi.moving) tags.push({ text: '世爻发动', type: 'trigger' });
        else if (ying.moving) tags.push({ text: '应爻发动', type: 'trigger' });
        if (hasStatusCode(shi, 'VOID')) tags.push({ text: '世爻旬空', type: 'void' });
        if (hasStatusCode(ying, 'VOID')) tags.push({ text: '应爻旬空', type: 'void' });
        return {
            text: `世爻为${shi.label}${shi.relation}${shi.branch}${shi.element}；应爻为${ying.label}${ying.relation}${ying.branch}${ying.element}。`,
            tags: uniqueStatusTags(tags)
        };
    };
    const getHexagramPairNature = (naJiaLines) => {
        const pairs = [[0,3],[1,4],[2,5]];
        if (pairs.every(([a,b]) => chongMap[naJiaLines[a].branch] === naJiaLines[b].branch)) return { code: 'SIX_CLASH', text: '六冲卦' };
        if (pairs.every(([a,b]) => heMap[naJiaLines[a].branch] === naJiaLines[b].branch)) return { code: 'SIX_HARMONY', text: '六合卦' };
        return { code: 'NEUTRAL', text: '非六冲六合卦' };
    };
    const liuyaoSanHeSets = [
        { branches:['申','子','辰'], element:'水' },
        { branches:['亥','卯','未'], element:'木' },
        { branches:['寅','午','戌'], element:'火' },
        { branches:['巳','酉','丑'], element:'金' }
    ];
    const buildMovingSanHe = (rows) => {
        const active = [];
        rows.filter((line) => line.moving).forEach((line) => {
            active.push(line.branch, line.changedBranch);
        });
        const branchSet = new Set(active);
        const complete = [];
        const pending = [];
        const pendingDetails = [];
        liuyaoSanHeSets.forEach((group) => {
            const hits = group.branches.filter((branch) => branchSet.has(branch));
            if (hits.length === 3) complete.push(`动变支会齐${group.branches.join('')}三合${group.element}局`);
            else if (hits.length === 2) {
                const missingBranch = group.branches.find((branch) => !branchSet.has(branch));
                const text = `${hits.join('')}两支待${missingBranch}（未成局）`;
                pending.push(text);
                pendingDetails.push({
                    text,
                    missingBranch,
                    presentBranches: [...hits],
                    groupBranches: [...group.branches],
                    element: group.element
                });
            }
        });
        return { complete, pending, pendingDetails };
    };
    const buildFanFuSummary = (rows) => {
        const signals = [];
        const sections = [
            { name:'内卦', positions:[1,2,3] },
            { name:'外卦', positions:[4,5,6] }
        ];
        sections.forEach((section) => {
            const lines = rows.filter((line) => section.positions.includes(line.position));
            if (!lines.some((line) => line.moving)) return;
            if (lines.every((line) => line.branch === line.changedBranch)) signals.push(`${section.name}伏吟`);
            else if (lines.every((line) => chongMap[line.branch] === line.changedBranch)) signals.push(`${section.name}反吟`);
            else {
                lines.filter((line) => line.moving && line.branch === line.changedBranch).forEach((line) => signals.push(`${line.label}动化同支`));
                lines.filter((line) => line.moving && chongMap[line.branch] === line.changedBranch).forEach((line) => signals.push(`${line.label}动化相冲`));
            }
        });
        return signals;
    };
    const buildFullHexagramStructure = (rows, originalNaJia, changedNaJia) => {
        const originalNature = getHexagramPairNature(originalNaJia);
        const changedNature = getHexagramPairNature(changedNaJia);
        let transition = `${originalNature.text} → ${changedNature.text}`;
        if (originalNature.code === 'SIX_CLASH' && changedNature.code === 'SIX_HARMONY') transition = '六冲化六合';
        if (originalNature.code === 'SIX_HARMONY' && changedNature.code === 'SIX_CLASH') transition = '六合化六冲';
        const sanHe = buildMovingSanHe(rows);
        return {
            originalNature: originalNature.text,
            originalNatureCode: originalNature.code,
            changedNature: changedNature.text,
            changedNatureCode: changedNature.code,
            transition,
            shiYing: buildShiYingSummary(rows),
            sanHe,
            fanFu: buildFanFuSummary(rows)
        };
    };
    const getPurePalaceLines = (palaceName) => {
        const code = trigramCodeByName[palaceName];
        return Array.from({ length: 6 }, (_, index) => Boolean(code & (1 << (index % 3))));
    };
    const describeFlyHiddenRelation = (flyElement, hiddenElement) => {
        if (flyElement === hiddenElement) return '飞伏比和';
        if (generateMap[flyElement] === hiddenElement) return '飞来生伏';
        if (generateMap[hiddenElement] === flyElement) return '伏去生飞';
        if (controlMap[flyElement] === hiddenElement) return '飞来克伏';
        if (controlMap[hiddenElement] === flyElement) return '伏去克飞';
        return '飞伏无直接生克';
    };
    const buildFlyingHidden = (rows, palace, monthBranch, dayBranch, xunKong) => {
        const pureLines = getPurePalaceLines(palace.palace);
        const pureNaJia = naJiaForLines(pureLines);
        const presentRelations = new Set(rows.map((line) => line.relation));
        return rows.map((line, index) => {
            const hidden = pureNaJia[index];
            const hiddenRelation = sixRelation(hidden.element, palace.element);
            const hiddenStatus = buildLiuYaoLineStatus(hidden, monthBranch, dayBranch, xunKong, false);
            return {
                position: line.position,
                label: line.label,
                flyRelation: line.relation,
                flyBranch: line.branch,
                flyElement: line.element,
                flyText: `${line.relation}${line.naJia}`,
                hiddenRelation,
                hiddenStem: hidden.stem,
                hiddenBranch: hidden.branch,
                hiddenElement: hidden.element,
                hiddenText: `${hiddenRelation}${hidden.text}`,
                relationText: describeFlyHiddenRelation(line.element, hidden.element),
                candidate: !presentRelations.has(hiddenRelation),
                statusTags: hiddenStatus.tags
            };
        });
    };
    const suggestUseGod = (question, rows, flyingHidden) => {
        const content = (question || '').trim();
        const rules = [
            { re:/父亲|母亲|父母|长辈|文书|合同|证件|房屋|住宅|车辆|学校|学业|考试|申请|资料/, target:'父母', reason:'问题涉及父母、文书、房宅、车辆或学业，常以父母爻为主要候选。' },
            { re:/孩子|子女|儿子|女儿|怀孕|生产|药|医药|治疗|解忧|宠物/, target:'子孙', reason:'问题涉及子女、医药或解忧，常以子孙爻为主要候选。' },
            { re:/工资|收入|钱|财|投资|生意|买卖|利润|货款|妻子|女友|女性对象/, target:'妻财', reason:'问题涉及财物、收益或女性伴侣，常以妻财爻为主要候选。' },
            { re:/工作|职位|求职|升职|事业|官职|诉讼|官司|疾病|病情|丈夫|男友|男性对象/, target:'官鬼', reason:'问题涉及事业职位、诉讼、疾病或男性伴侣，常以官鬼爻为主要候选。' },
            { re:/兄弟|姐妹|同事|同辈|朋友|竞争|对手|合伙人/, target:'兄弟', reason:'问题涉及同辈、朋友、竞争或合作关系，常以兄弟爻为候选。' },
            { re:/对方|他人|别人|客户|面试官|公司|单位|感情|关系|合作/, target:'应', reason:'问题核心在对方或外部对象，先以应爻观察；具体身份仍可另取六亲。' },
            { re:/自己|本人|我|自身|个人|出行|能否|是否/, target:'世', reason:'问题以占者自身为中心，先以世爻观察。' }
        ];
        const matched = rules.find((rule) => rule.re.test(content));
        const target = matched?.target || '世';
        let key = '';
        let candidates = [];
        if (target === '世') candidates = rows.filter((line) => line.isShi).map((line) => `line-${line.position}`);
        else if (target === '应') candidates = rows.filter((line) => line.isYing).map((line) => `line-${line.position}`);
        else candidates = rows.filter((line) => line.relation === target).sort((a,b) => Number(b.moving) - Number(a.moving)).map((line) => `line-${line.position}`);
        if (!candidates.length && !['世','应'].includes(target)) {
            candidates = flyingHidden.filter((item) => item.candidate && item.hiddenRelation === target).map((item) => `hidden-${item.position}`);
        }
        key = candidates[0] || `line-${rows.find((line) => line.isShi)?.position || 1}`;
        const missingNote = !candidates.length ? `本卦明爻及已列伏神中未找到“${target}”候选，暂以世爻作为查看起点。` : '';
        return {
            target,
            reason: matched?.reason || '占问文字未命中明确类别，默认先以世爻观察，再由使用者按实际问题确认。',
            suggestedUseKey: key,
            candidates,
            missingNote
        };
    };
    const buildUseGodChoices = (rows, flyingHidden) => {
        const choices = rows.map((line) => ({
            key: `line-${line.position}`,
            type: 'line',
            position: line.position,
            label: `${line.label} · ${line.relation}${line.branch}${line.element}${line.isShi ? '（世）' : ''}${line.isYing ? '（应）' : ''}${line.moving ? '（动）' : ''}`,
            relation: line.relation,
            branch: line.branch,
            element: line.element,
            statusTags: line.statusTags,
            moveTags: line.moveTags || [],
            moving: line.moving,
            changedBranch: line.changedBranch,
            changedElement: line.changedElement,
            isShi: line.isShi,
            isYing: line.isYing,
            sourceText: '本卦明爻'
        }));
        flyingHidden.filter((item) => item.candidate).forEach((item) => {
            choices.push({
                key: `hidden-${item.position}`,
                type: 'hidden',
                position: item.position,
                label: `伏神候选 · ${item.label}下 ${item.hiddenRelation}${item.hiddenBranch}${item.hiddenElement}`,
                relation: item.hiddenRelation,
                branch: item.hiddenBranch,
                element: item.hiddenElement,
                statusTags: item.statusTags,
                moveTags: [],
                moving: false,
                changedBranch: '',
                changedElement: '',
                isShi: false,
                isYing: false,
                sourceText: `伏于${item.label}${item.flyRelation}${item.flyBranch}${item.flyElement}之下（${item.relationText}）`
            });
        });
        return choices;
    };
    const buildUseGodAnalysis = (target, resultObj) => {
        if (!target || !resultObj) return null;
        const useElement = target.element;
        const sourceElement = elementGenerator(useElement);
        const tabooElement = elementController(useElement);
        const enemyElement = elementGenerator(tabooElement);
        const describeLines = (element) => {
            const hits = resultObj.lines.filter((line) => line.element === element);
            return hits.length ? hits.map((line) => `${line.label}${line.relation}${line.branch}${line.moving ? '动' : '静'}`).join('、') : '本卦明爻未见';
        };
        const sameRelation = resultObj.lines.filter((line) => line.relation === target.relation);
        return {
            target,
            useElement,
            sourceElement,
            tabooElement,
            enemyElement,
            sourceLines: describeLines(sourceElement),
            tabooLines: describeLines(tabooElement),
            enemyLines: describeLines(enemyElement),
            sameRelationText: sameRelation.length > 1 ? `同类${target.relation}共现${sameRelation.length}爻，需要比较各自位置、动静与日月状态。` : `本卦明爻中${target.relation}出现${sameRelation.length}处。`,
            statusText: target.statusTags.map((tag) => tag.text).join('、') || '无额外状态标签'
        };
    };
    const zhouyiSourceUrl = (name) => `https://zh.wikisource.org/wiki/${encodeURIComponent(`周易/${name}`)}`;
    const formatCandidateDate = (dateObj, branch, label = '') => `${label || branch + '日'} · ${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`;
    const getDayBranchAt = (dateObj) => {
        try {
            const eightChar = Solar.fromDate(dateObj).getLunar().getEightChar();
            eightChar.setSect(2);
            return { branch: eightChar.getDayZhi(), xun: eightChar.getDayXun?.() || '' };
        } catch (error) { return { branch: '', xun: '' }; }
    };
    const findNextBranchDate = (startDate, branch, maxDays = 60) => {
        for (let offset = 1; offset <= maxDays; offset += 1) {
            const dateObj = new Date(startDate.getTime() + offset * 86400000);
            if (getDayBranchAt(dateObj).branch === branch) return dateObj;
        }
        return null;
    };
    const findNextXunDate = (startDate, currentXun, maxDays = 15) => {
        for (let offset = 1; offset <= maxDays; offset += 1) {
            const dateObj = new Date(startDate.getTime() + offset * 86400000);
            const info = getDayBranchAt(dateObj);
            if (info.xun && info.xun !== currentXun) return dateObj;
        }
        return null;
    };
    const buildTimingCandidates = (target, resultObj) => {
        if (!target || !resultObj) return [];
        const candidates = [];
        const seen = new Set();
        const startDate = new Date(resultObj.castTimestamp);
        const add = (id, title, reason, branches = [], extras = []) => {
            if (seen.has(id)) return;
            seen.add(id);
            const dates = [];
            branches.forEach(({ branch, label }) => {
                if (!branch) return;
                const dateObj = findNextBranchDate(startDate, branch);
                if (dateObj) dates.push(formatCandidateDate(dateObj, branch, label));
            });
            dates.push(...extras.filter(Boolean));
            candidates.push({ id, title, reason, dates });
        };
        if (hasStatusCode(target, 'VOID')) {
            const outXun = findNextXunDate(startDate, resultObj.dayXun);
            add('void', '旬空：填实、冲空与出旬', `${target.relation}${target.branch}${target.element}落旬空，先观察本支值日、相冲之日以及下一旬开始后的变化。`, [
                { branch: target.branch, label: `${target.branch}日填实` },
                { branch: chongMap[target.branch], label: `${chongMap[target.branch]}日冲空` }
            ], [outXun ? `出旬 · ${outXun.getFullYear()}/${outXun.getMonth()+1}/${outXun.getDate()}` : '']);
        }
        if (hasStatusCode(target, 'MONTH_BREAK')) {
            add('month-break', '月破：填实、合破与出月', `${target.branch}受月建相冲。可观察本支值日、六合之日及节令交接后的状态变化。`, [
                { branch: target.branch, label: `${target.branch}日填实` },
                { branch: heMap[target.branch], label: `${heMap[target.branch]}日合破` }
            ], ['出月 · 下一节令交接后']);
        }
        if (hasStatusCode(target, 'MONTH_HARMONY') || hasStatusCode(target, 'DAY_HARMONY')) {
            add('bound', '合绊／合起：待冲开', `${target.branch}与日月存在合的关系，若实际表现为合住或迟滞，可观察冲${target.branch}之支出现时。`, [
                { branch: chongMap[target.branch], label: `${chongMap[target.branch]}日冲开` }
            ]);
        }
        if (target.moving) {
            add('moving', '动而待合', '用神发动时，可把与本支六合的日月作为一个观察点，并同时比较变爻是否回头生克。', [
                { branch: heMap[target.branch], label: `${heMap[target.branch]}日合动爻` }
            ]);
        } else {
            add('static', '静而待冲', '用神静止时，可把相冲之日作为可能的启动点；若本爻休囚受伤，冲也可能表现为进一步破损，不能只按“动”理解。', [
                { branch: chongMap[target.branch], label: `${chongMap[target.branch]}日冲动` }
            ]);
        }
        if (hasMoveCode(target, 'TRANSFORM_TOMB')) {
            const tombBranch = target.changedBranch;
            add('tomb', '化墓：待冲墓', `动爻化入${tombBranch}墓，观察冲墓之支出现时是否打开该结构。`, [
                { branch: chongMap[tombBranch], label: `${chongMap[tombBranch]}日冲墓` }
            ]);
        }
        if (hasMoveCode(target, 'TRANSFORM_VOID')) {
            add('transform-void', '化空：待填冲', `变爻${target.changedBranch}落空，可观察变支填实或受冲之时。`, [
                { branch: target.changedBranch, label: `${target.changedBranch}日填实` },
                { branch: chongMap[target.changedBranch], label: `${chongMap[target.changedBranch]}日冲空` }
            ]);
        }
        if (hasMoveCode(target, 'PROGRESS')) {
            add('progress', '化进神：逢值、逢合', `本爻由${target.branch}化${target.changedBranch}为进神，列出原支、变支及变支六合日作为观察点。`, [
                { branch: target.branch, label: `${target.branch}日值原神` },
                { branch: target.changedBranch, label: `${target.changedBranch}日值进神` },
                { branch: heMap[target.changedBranch], label: `${heMap[target.changedBranch]}日合进神` }
            ]);
        }
        if (hasMoveCode(target, 'RETREAT')) {
            add('retreat', '化退神：值退、冲退', `本爻由${target.branch}化${target.changedBranch}为退神，可观察退支值日与冲退之日。`, [
                { branch: target.changedBranch, label: `${target.changedBranch}日值退神` },
                { branch: chongMap[target.changedBranch], label: `${chongMap[target.changedBranch]}日冲退神` }
            ]);
        }
        (resultObj.fullStructure?.sanHe?.pendingDetails || []).forEach((item, index) => {
            if (!item?.missingBranch) return;
            add(`sanhe-${index}`, '虚三待用：待缺支补齐', `${item.text}。只有在空破、入墓及用神位置等条件也允许时，才可进一步讨论成局。`, [
                { branch: item.missingBranch, label: `${item.missingBranch}日补局` }
            ]);
        });
        if (!candidates.length) {
            add('generic', '值日与值月', `当前用神为${target.relation}${target.branch}${target.element}，可先观察本支值日、值月及元神发动的现实窗口。`, [
                { branch: target.branch, label: `${target.branch}日值用神` }
            ]);
        }
        return candidates;
    };

    GuiJia.liuyaoCore = {
        trigramData,
        trigramCodeByName,
        hexagramNames,
        kingWenOrder,
        lineKey,
        trigramCode,
        getHexagram,
        liuyaoPalaceMap,
        naJiaForLines,
        generateMap,
        controlMap,
        sixRelation,
        sixSpirits,
        liuyaoSeasonStates,
        liuyaoMonthSeason,
        liuyaoSeasonState,
        uniqueStatusTags,
        hasStatusCode,
        hasMoveCode,
        buildLiuYaoLineStatus,
        liuyaoProgressMap,
        liuyaoRetreatMap,
        liuyaoGrowthMarkers,
        growthMarkerCode,
        buildMoveAnalysis,
        elementGenerator,
        elementController,
        describeElementDirection,
        buildShiYingSummary,
        getHexagramPairNature,
        liuyaoSanHeSets,
        buildMovingSanHe,
        buildFanFuSummary,
        buildFullHexagramStructure,
        getPurePalaceLines,
        describeFlyHiddenRelation,
        buildFlyingHidden,
        suggestUseGod,
        buildUseGodChoices,
        buildUseGodAnalysis,
        zhouyiSourceUrl,
        formatCandidateDate,
        getDayBranchAt,
        findNextBranchDate,
        findNextXunDate,
        buildTimingCandidates
    };
})(window);
