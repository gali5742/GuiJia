(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { chongMap, heMap, getWuXing } = GuiJia.baziCore;
    const { formatNaturalCount = (value) => String(value) } = GuiJia.common || {};
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
    const snapshotLiuYaoLine = (line, extra = {}) => line ? ({
        position: line.position,
        label: line.label,
        relation: line.relation,
        branch: line.branch,
        element: line.element,
        moving: Boolean(line.moving),
        changedBranch: line.changedBranch || '',
        changedElement: line.changedElement || '',
        ...extra
    }) : null;
    const getShiYingElementFact = (shi, ying) => {
        if (shi.element === ying.element) return { code:'SHI_YING_SAME_ELEMENT', text:'世应比和', type:'neutral' };
        if (generateMap[shi.element] === ying.element) return { code:'SHI_GENERATES_YING', text:'世生应', type:'neutral' };
        if (generateMap[ying.element] === shi.element) return { code:'YING_GENERATES_SHI', text:'应生世', type:'neutral' };
        if (controlMap[shi.element] === ying.element) return { code:'SHI_CONTROLS_YING', text:'世克应', type:'neutral' };
        if (controlMap[ying.element] === shi.element) return { code:'YING_CONTROLS_SHI', text:'应克世', type:'neutral' };
        return { code:'SHI_YING_NO_DIRECT_ELEMENT_RELATION', text:'世应五行无直接生克', type:'neutral' };
    };
    const buildShiYingSummary = (rows) => {
        const shi = rows.find((line) => line.isShi);
        const ying = rows.find((line) => line.isYing);
        if (!shi || !ying) return { text: '未读取到完整世应位置。', tags: [], facts: [], shi: null, ying: null };
        const members = [
            snapshotLiuYaoLine(shi, { role:'shi' }),
            snapshotLiuYaoLine(ying, { role:'ying' })
        ];
        const facts = [{ ...getShiYingElementFact(shi, ying), family:'shi-ying', members }];
        if (heMap[shi.branch] === ying.branch) facts.push({ code:'SHI_YING_SIX_HARMONY', text:'世应六合', type:'transform', family:'shi-ying', members });
        if (chongMap[shi.branch] === ying.branch) facts.push({ code:'SHI_YING_SIX_CLASH', text:'世应六冲', type:'trigger', family:'shi-ying', members });
        if (shi.moving && ying.moving) facts.push({ code:'SHI_YING_BOTH_MOVING', text:'世应俱动', type:'trigger', family:'shi-ying', members });
        else if (shi.moving) facts.push({ code:'SHI_MOVING', text:'世爻发动', type:'trigger', family:'shi-ying', members:[members[0]] });
        else if (ying.moving) facts.push({ code:'YING_MOVING', text:'应爻发动', type:'trigger', family:'shi-ying', members:[members[1]] });
        if (hasStatusCode(shi, 'VOID')) facts.push({ code:'SHI_VOID', text:'世爻旬空', type:'void', family:'shi-ying', members:[members[0]] });
        if (hasStatusCode(ying, 'VOID')) facts.push({ code:'YING_VOID', text:'应爻旬空', type:'void', family:'shi-ying', members:[members[1]] });
        const tags = uniqueStatusTags(facts.map(({ code, text, type }) => ({ code, text, type })));
        return {
            text: `世爻为${shi.label}${shi.relation}${shi.branch}${shi.element}；应爻为${ying.label}${ying.relation}${ying.branch}${ying.element}。`,
            tags,
            facts,
            shi: members[0],
            ying: members[1]
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
        const sourceRows = Array.isArray(rows) ? rows : [];
        const isActiveOriginal = (line) => Boolean(line?.moving || hasStatusCode(line, 'DARK_MOVING'));
        const sourceToken = (line, source = 'original') => {
            const changed = source === 'changed';
            const branch = changed ? line?.changedBranch : line?.branch;
            if (!branch) return null;
            return snapshotLiuYaoLine(line, {
                source,
                sourceLabel: changed ? '变爻' : '本爻',
                relation: changed ? (line?.changedRelation || '') : (line?.relation || ''),
                branch,
                element: changed ? (line?.changedElement || getWuXing(branch)) : (line?.element || getWuXing(branch)),
                active: changed ? Boolean(line?.moving) : isActiveOriginal(line),
                darkMoving: !line?.moving && hasStatusCode(line, 'DARK_MOVING')
            });
        };
        const originalTokens = sourceRows.map((line) => sourceToken(line, 'original')).filter(Boolean);
        const changedTokens = sourceRows.filter((line) => line?.moving).map((line) => sourceToken(line, 'changed')).filter(Boolean);
        const sourceMembers = (branches, tokens) => branches.map((branch) => ({
            branch,
            sources: tokens.filter((item) => item.branch === branch)
        }));
        const uniquePositions = (tokens) => [...new Set(tokens.map((item) => item.position).filter((item) => Number.isInteger(item)))].sort((a,b) => a-b);
        const positionLabel = (positions) => positions.map((position) => ({ 1:'初爻',2:'二爻',3:'三爻',4:'四爻',5:'五爻',6:'上爻' }[position] || `${position}爻`)).join('、');
        const completeCandidates = [];
        const pendingCandidates = [];
        const addComplete = (group, formation) => {
            completeCandidates.push({ group, formation });
        };
        const addPending = (group, formation) => {
            pendingCandidates.push({ group, formation });
        };

        // 1) 本卦三支本身成局：三支必须都在本卦出现，并至少有两支来自明动／暗动爻。
        //    这样既覆盖“三爻俱动”，也覆盖“两爻动、一爻静”；静卦中仅因三支齐见不作成局。
        liuyaoSanHeSets.forEach((group) => {
            const presentOriginal = group.branches.filter((branch) => originalTokens.some((item) => item.branch === branch));
            const activeOriginal = group.branches.filter((branch) => originalTokens.some((item) => item.branch === branch && item.active));
            if (presentOriginal.length === 3 && activeOriginal.length >= 2) {
                const tokens = originalTokens.filter((item) => group.branches.includes(item.branch));
                addComplete(group, {
                    mode:'ORIGINAL_BRANCHES',
                    scope:'whole',
                    sourceTokens:tokens,
                    positions:uniquePositions(tokens),
                    activeBranches:[...activeOriginal]
                });
                return;
            }
            // “虚三待用”：仅两支已由明动／暗动爻实际发动，第三支尚未在本卦出现。
            if (activeOriginal.length === 2 && presentOriginal.length === 2) {
                const missingBranch = group.branches.find((branch) => !presentOriginal.includes(branch));
                const tokens = originalTokens.filter((item) => activeOriginal.includes(item.branch) && item.active);
                addPending(group, {
                    mode:'ACTIVE_PAIR_PENDING',
                    scope:'whole',
                    sourceTokens:tokens,
                    positions:uniquePositions(tokens),
                    presentBranches:[...activeOriginal],
                    missingBranch
                });
            }
        });

        // 2) 《增删卜易》明确列出的内卦初、三爻及外卦四、六爻动变成局。
        const transformScopes = [
            { scope:'inner', label:'内卦', positions:[1,3] },
            { scope:'outer', label:'外卦', positions:[4,6] }
        ];
        transformScopes.forEach((scopeInfo) => {
            const lines = scopeInfo.positions.map((position) => sourceRows.find((line) => line?.position === position));
            if (lines.some((line) => !line?.moving)) return;
            const scopeTokens = lines.flatMap((line) => [sourceToken(line, 'original'), sourceToken(line, 'changed')]).filter(Boolean);
            const scopeBranchSet = new Set(scopeTokens.map((item) => item.branch));
            liuyaoSanHeSets.forEach((group) => {
                if (!group.branches.every((branch) => scopeBranchSet.has(branch))) return;
                addComplete(group, {
                    mode:scopeInfo.scope === 'inner' ? 'INNER_FIRST_THIRD_CHANGE' : 'OUTER_FOURTH_SIXTH_CHANGE',
                    scope:scopeInfo.scope,
                    scopeLabel:scopeInfo.label,
                    sourceTokens:scopeTokens.filter((item) => group.branches.includes(item.branch)),
                    positions:[...scopeInfo.positions]
                });
            });
        });

        const formationPriority = {
            INNER_FIRST_THIRD_CHANGE: 30,
            OUTER_FOURTH_SIXTH_CHANGE: 30,
            ORIGINAL_BRANCHES: 20
        };
        const completeByGroup = new Map();
        completeCandidates.forEach(({ group, formation }) => {
            const key = group.branches.join('');
            if (!completeByGroup.has(key)) completeByGroup.set(key, { group, formations:[] });
            completeByGroup.get(key).formations.push(formation);
        });
        const completeDetails = [...completeByGroup.values()].map(({ group, formations }) => {
            const primary = [...formations].sort((a,b) => (formationPriority[b.mode] || 0) - (formationPriority[a.mode] || 0))[0];
            const text = primary.mode === 'INNER_FIRST_THIRD_CHANGE'
                ? `内卦初、三爻动变成${group.branches.join('')}三合${group.element}局`
                : primary.mode === 'OUTER_FOURTH_SIXTH_CHANGE'
                    ? `外卦四、上爻动变成${group.branches.join('')}三合${group.element}局`
                    : `本卦${group.branches.join('')}三合${group.element}局`;
            const combinedTokens = formations.flatMap((item) => item.sourceTokens || []);
            return {
                code:'MOVING_SAN_HE_COMPLETE',
                family:'moving-san-he',
                type:'transform',
                text,
                element:group.element,
                groupBranches:[...group.branches],
                presentBranches:[...group.branches],
                missingBranch:'',
                formationMode:primary.mode,
                formationModes:[...new Set(formations.map((item) => item.mode))],
                scope:primary.scope,
                positions:uniquePositions(combinedTokens),
                formations,
                members:sourceMembers(group.branches, combinedTokens)
            };
        });

        // 已经以合法路径成局的同组，不再同时列“待补”。
        const completeKeys = new Set(completeDetails.map((item) => item.groupBranches.join('')));
        const pendingDetails = pendingCandidates
            .filter(({ group }) => !completeKeys.has(group.branches.join('')))
            .map(({ group, formation }) => {
                const positions = formation.positions || [];
                const textPrefix = positions.length ? `${positionLabel(positions)}见` : '';
                const text = `${textPrefix}${formation.presentBranches.join('')}，待${formation.missingBranch}成${group.branches.join('')}三合${group.element}局（未成局）`;
                return {
                    code:'MOVING_SAN_HE_PENDING',
                    family:'moving-san-he',
                    type:'neutral',
                    text,
                    missingBranch:formation.missingBranch,
                    presentBranches:[...formation.presentBranches],
                    groupBranches:[...group.branches],
                    element:group.element,
                    formationMode:formation.mode,
                    scope:formation.scope,
                    positions:[...positions],
                    formations:[formation],
                    members:sourceMembers(formation.presentBranches, formation.sourceTokens || [])
                };
            });
        return {
            complete: completeDetails.map((item) => item.text),
            completeDetails,
            pending: pendingDetails.map((item) => item.text),
            pendingDetails,
            facts:[...completeDetails, ...pendingDetails]
        };
    };
    const buildFanFuFacts = (rows) => {
        const facts = [];
        const sections = [
            { name:'内卦', scope:'inner', positions:[1,2,3], fuCode:'INNER_FU_YIN', fanCode:'INNER_FAN_YIN' },
            { name:'外卦', scope:'outer', positions:[4,5,6], fuCode:'OUTER_FU_YIN', fanCode:'OUTER_FAN_YIN' }
        ];
        sections.forEach((section) => {
            const lines = rows.filter((line) => section.positions.includes(line.position));
            if (!lines.some((line) => line.moving)) return;
            const members = lines.map((line) => snapshotLiuYaoLine(line, { scope:section.scope }));
            if (lines.every((line) => line.branch === line.changedBranch)) {
                facts.push({ code:section.fuCode, family:'fan-fu', scope:section.scope, type:'trigger', text:`${section.name}伏吟`, members });
            } else if (lines.every((line) => chongMap[line.branch] === line.changedBranch)) {
                facts.push({ code:section.fanCode, family:'fan-fu', scope:section.scope, type:'trigger', text:`${section.name}反吟`, members });
            } else {
                lines.filter((line) => line.moving && line.branch === line.changedBranch).forEach((line) => {
                    facts.push({ code:'LINE_CHANGE_SAME_BRANCH', family:'fan-fu', scope:section.scope, type:'trigger', text:`${line.label}动化同支`, members:[snapshotLiuYaoLine(line, { scope:section.scope })] });
                });
                lines.filter((line) => line.moving && chongMap[line.branch] === line.changedBranch).forEach((line) => {
                    facts.push({ code:'LINE_CHANGE_CLASH', family:'fan-fu', scope:section.scope, type:'trigger', text:`${line.label}动化相冲`, members:[snapshotLiuYaoLine(line, { scope:section.scope })] });
                });
            }
        });
        return facts;
    };
    const buildFanFuSummary = (rows) => buildFanFuFacts(rows).map((item) => item.text);
    const buildFullHexagramStructure = (rows, originalNaJia, changedNaJia) => {
        const originalNature = getHexagramPairNature(originalNaJia);
        const changedNature = getHexagramPairNature(changedNaJia);
        let transition = `${originalNature.text} → ${changedNature.text}`;
        let transitionCode = 'HEXAGRAM_NATURE_TRANSITION';
        if (originalNature.code === 'SIX_CLASH' && changedNature.code === 'SIX_HARMONY') {
            transition = '六冲化六合';
            transitionCode = 'SIX_CLASH_TO_SIX_HARMONY';
        }
        if (originalNature.code === 'SIX_HARMONY' && changedNature.code === 'SIX_CLASH') {
            transition = '六合化六冲';
            transitionCode = 'SIX_HARMONY_TO_SIX_CLASH';
        }
        const shiYing = buildShiYingSummary(rows);
        const sanHe = buildMovingSanHe(rows);
        const fanFuDetails = buildFanFuFacts(rows);
        const fanFu = fanFuDetails.map((item) => item.text);
        const natureFacts = [
            { code:`ORIGINAL_${originalNature.code}`, family:'hexagram-nature', scope:'original', text:originalNature.text, type:'neutral' },
            { code:`CHANGED_${changedNature.code}`, family:'hexagram-nature', scope:'changed', text:changedNature.text, type:'neutral' },
            { code:transitionCode, family:'hexagram-transition', scope:'whole', text:transition, type:'neutral' }
        ];
        return {
            originalNature: originalNature.text,
            originalNatureCode: originalNature.code,
            changedNature: changedNature.text,
            changedNatureCode: changedNature.code,
            transition,
            transitionCode,
            shiYing,
            sanHe,
            fanFu,
            fanFuDetails,
            facts:[...natureFacts, ...(shiYing.facts || []), ...(sanHe.facts || []), ...fanFuDetails]
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
        const visibleRelations = new Set(rows.map((line) => line.relation).filter(Boolean));
        const changedRelations = new Set(rows
            .filter((line) => line.moving)
            .map((line) => line.changedRelation || (line.changedElement ? sixRelation(line.changedElement, palace.element) : ''))
            .filter(Boolean));
        return rows.map((line, index) => {
            const hidden = pureNaJia[index];
            const hiddenRelation = sixRelation(hidden.element, palace.element);
            const hiddenStatus = buildLiuYaoLineStatus(hidden, monthBranch, dayBranch, xunKong, false);
            const visiblePresent = visibleRelations.has(hiddenRelation);
            const changedPresent = changedRelations.has(hiddenRelation);
            const candidate = !visiblePresent && !changedPresent;
            const candidateCode = candidate
                ? 'HIDDEN_PRIMARY_CANDIDATE'
                : (visiblePresent && changedPresent
                    ? 'HIDDEN_RELATION_VISIBLE_AND_CHANGED'
                    : visiblePresent ? 'HIDDEN_RELATION_VISIBLE' : 'HIDDEN_RELATION_CHANGED');
            const candidateText = candidate
                ? '明爻与变爻均未见，可作伏神候选'
                : (visiblePresent && changedPresent
                    ? '同类六亲在明爻与变爻均已出现'
                    : visiblePresent ? '同类六亲已见于明爻' : '同类六亲已见于变爻');
            return {
                position: line.position,
                label: line.label,
                flyRelation: line.relation,
                flyBranch: line.branch,
                flyElement: line.element,
                flyText: `${line.relation}${line.naJia || `${line.stem || ''}${line.branch}${line.element}`}`,
                hiddenRelation,
                hiddenStem: hidden.stem,
                hiddenBranch: hidden.branch,
                hiddenElement: hidden.element,
                hiddenText: `${hiddenRelation}${hidden.text}`,
                relationText: describeFlyHiddenRelation(line.element, hidden.element),
                candidate,
                candidateCode,
                candidateText,
                presence: {
                    visiblePresent,
                    changedPresent,
                    hiddenPresent: true,
                    candidate
                },
                statusTags: hiddenStatus.tags
            };
        });
    };
    const RELATIONSHIP_HUSBAND_TERMS = Object.freeze(['丈夫','老公']);
    const RELATIONSHIP_WIFE_TERMS = Object.freeze(['妻子','老婆','媳妇']);
    const TRAVEL_SUPPRESS_TERMS = Object.freeze(['天气','下雨','晴天','气温','温度','降雨','天气预报','台风']);
    const LOST_ITEM_ANIMATE_TERMS = Object.freeze(['宠物','孩子','小孩','小朋友','宝宝','儿子','女儿','父亲','母亲','爸爸','妈妈','家人','朋友','同事','猫','猫咪','狗','狗狗']);
    const matchLostItemPattern = (content) => {
        if (!content || content.includes('走丢') || content.includes('失踪')) return [];
        if (LOST_ITEM_ANIMATE_TERMS.some((term) => content.includes(term))) return [];
        const hasLossCue = /丢|遗失|不见|找不到/.test(content);
        const hasLocateCue = /哪里|哪儿|在哪|找到|找回/.test(content);
        return hasLossCue && hasLocateCue ? ['失物句式'] : [];
    };
    const resolveRelationshipTarget = (content) => {
        const hasHusbandRole = RELATIONSHIP_HUSBAND_TERMS.some((term) => content.includes(term));
        const hasWifeRole = RELATIONSHIP_WIFE_TERMS.some((term) => content.includes(term));
        if (hasHusbandRole && !hasWifeRole) return '官鬼';
        if (hasWifeRole && !hasHusbandRole) return '妻财';
        return '应';
    };
    const relationshipReason = (target) => {
        if (target === '官鬼') return '占问明确以丈夫／男方配偶角色为对象。传统婚占以官鬼论夫，同时结合世应关系。';
        if (target === '妻财') return '占问明确以妻子／女方配偶角色为对象。传统婚占以妻财论妻，同时结合世应关系。';
        return '占问明确涉及感情、恋爱或婚姻。传统婚占同时重视世应与财官；未明确夫妻角色时，先以应爻作为关系对象的观察起点。';
    };
    const USE_GOD_QUESTION_RULES = Object.freeze([
        {
            id:'relationship', target:'应', focusId:'relationship', priority:20,
            strongTerms:['恋爱','感情','婚姻','结婚','复合','分手','表白','相亲','暧昧','正缘','男朋友','女朋友','男友','女友','伴侣','丈夫','老公','妻子','老婆','媳妇'],
            relatedTerms:['喜欢','在一起','关系'],
            resolveTarget: resolveRelationshipTarget,
            scoreBonus:(content) => [...RELATIONSHIP_HUSBAND_TERMS, ...RELATIONSHIP_WIFE_TERMS].some((term) => content.includes(term)) ? 2 : 0,
            reasonForTarget: relationshipReason
        },
        {
            id:'parents-docs-study', target:'父母',
            strongTerms:['父亲','母亲','爸爸','妈妈','父母','长辈','合同','证件','文书','考试','成绩','学业','考研','论文','志愿','留学'],
            relatedTerms:['学校','申请','资料'],
            reason:'占问明确涉及父母、文书证件或考试学业，优先参考父母爻。'
        },
        {
            id:'children-offspring', target:'子孙',
            strongTerms:['孩子','小孩','子女','儿子','女儿','怀孕','生产','宠物','男孩还是女孩','男宝女宝','胎儿性别'],
            relatedTerms:[],
            reason:'占问明确涉及子女、生育或宠物，优先参考子孙爻。'
        },
        {
            id:'lost-item', target:'妻财', focusId:'lost-item', priority:15,
            strongTerms:['失物','遗失物品','物品遗失','物品丢失','东西丢了','东西丢失','东西不见','寻找物品','找东西'],
            relatedTerms:[],
            matchStrong:matchLostItemPattern,
            reasonForTarget:(_target, matched) => {
                const hits = [...new Set(matched?.strongHits || [])];
                if (hits.includes('失物句式')) return '占问明确涉及物品遗失，并询问位置或能否找回；失物与寻找问题先以妻财爻作为主要观察对象。';
                const hitText = hits.length ? `“${hits.join('、')}”` : '明确失物事项';
                return `占问明确提到${hitText}，失物与寻找问题先以妻财爻作为主要观察对象。`;
            },
            headline:'观察方向：失物与寻找（高置信）'
        },
        {
            id:'money-income', target:'妻财',
            strongTerms:['工资','收入','款项','到账','回款','货款','欠款','利润','收益','付款','赚钱','回本','奖金'],
            relatedTerms:['钱','财务','投资','生意','买卖','交易','加薪'],
            reason:'占问明确涉及收入、款项或财务结果，优先参考妻财爻。'
        },
        {
            id:'career-litigation-illness', target:'官鬼',
            strongTerms:['求职','面试','录用','入职','升职','转正','跳槽','职位','官司','诉讼','仲裁','疾病','病情'],
            relatedTerms:['工作','事业','职业'],
            reason:'占问明确涉及任职结果、诉讼或疾病，优先参考官鬼爻。'
        },
        {
            id:'peers-competition', target:'兄弟',
            strongTerms:['兄弟','姐妹','哥哥','弟弟','姐姐','妹妹','同事','朋友','竞争对手'],
            relatedTerms:['同辈','竞争','合作'],
            reason:'占问明确涉及同辈、朋友、同事或竞争者，优先参考兄弟爻。'
        },
        {
            id:'counterparty', target:'应', focusId:'counterparty', priority:10,
            strongTerms:['对方','客户','合作方','合作伙伴','合伙人','甲方','乙方'],
            relatedTerms:['谈判','合作','关系'],
            reason:'占问明确把外部对象或对方作为焦点，优先参考应爻。'
        },
        {
            id:'travel', target:'世', focusId:'travel',
            strongTerms:['出行','出门','远行','旅行','旅游','出差','行程','旅途','航班'],
            relatedTerms:['启程','目的地','路上'],
            suppressTerms:TRAVEL_SUPPRESS_TERMS,
            reasonForTarget:(_target, matched) => {
                const hits = [...new Set(matched?.strongHits || [])];
                const hitText = hits.length ? `“${hits.join('、')}”` : '明确出行事项';
                return `占问明确提到${hitText}，出行问题先以世爻观察自身状态，并参考应爻与行程结构。`;
            },
            headline:'观察方向：出行（高置信）'
        }
    ]);
    const USE_GOD_FOCUS_OPTIONS = Object.freeze([
        { id:'self', target:'世', label:'自己当前的状态', description:'先看自己在这件事中的状态与承受。' },
        { id:'travel', target:'世', label:'出行、旅行与行程', description:'出门、旅行、出差等先看自身状态，同时参考应爻与行程结构。' },
        { id:'relationship', target:'应', label:'感情、恋爱与婚姻', description:'关系问题先看世应；明确夫妻角色时可按传统财官取用。' },
        { id:'counterparty', target:'应', label:'对方／外部对象', description:'对方、客户、合作方、合作伙伴、合伙人或外部回应。' },
        { id:'parents-docs', target:'父母', label:'父母、长辈、学业与文书', description:'父母长辈、考试学业、合同证件等。' },
        { id:'children-pleasure', target:'子孙', label:'子女、生育、宠物与娱乐', description:'子女宠物，以及游乐、放松、称意等。' },
        { id:'lost-item', target:'妻财', label:'失物与寻找', description:'遗失物品、寻找东西等，先以妻财为主要观察对象。' },
        { id:'money-income', target:'妻财', label:'钱财、收入与交易', description:'款项、收益、买卖、交易等。' },
        { id:'career-health', target:'官鬼', label:'工作、职位、诉讼与疾病', description:'任职工作、诉讼、疾病等。' },
        { id:'peers-competition', target:'兄弟', label:'同辈、朋友与竞争', description:'兄弟姐妹、朋友、同事或竞争关系。' }
    ]);
    const useGodFocusOptionByTarget = (target) => USE_GOD_FOCUS_OPTIONS.find((item) => item.target === target) || null;
    const useGodFocusOptionById = (id) => USE_GOD_FOCUS_OPTIONS.find((item) => item.id === id) || null;
    const findUseGodCandidates = (target, rows = [], flyingHidden = []) => {
        if (target === '世') return rows.filter((line) => line.isShi).map((line) => `line-${line.position}`);
        if (target === '应') return rows.filter((line) => line.isYing).map((line) => `line-${line.position}`);
        const visible = rows
            .filter((line) => line.relation === target)
            .sort((a,b) => Number(b.moving) - Number(a.moving) || a.position - b.position)
            .map((line) => `line-${line.position}`);
        if (visible.length) return visible;
        return flyingHidden
            .filter((item) => item.candidate && item.hiddenRelation === target)
            .sort((a,b) => a.position - b.position)
            .map((item) => `hidden-${item.position}`);
    };
    const resolveUseGodFocus = (target, rows = [], flyingHidden = []) => {
        const candidates = findUseGodCandidates(target, rows, flyingHidden);
        return {
            target,
            candidates,
            count: candidates.length,
            suggestedUseKey: candidates[0] || '',
            available: candidates.length > 0
        };
    };

    const QUESTION_STRONG_SCORE = 4;
    const QUESTION_RELATED_SCORE = 1;
    const QUESTION_CONFIDENCE_THRESHOLD = 4;
    const QUESTION_CONFIDENCE_MARGIN = 2;
    const EMPTY_QUESTION_REASON = '尚未填写占问，暂不自动推荐用神。下方暂以世爻展示分析，也可以从“观察重点”选择实际想观察的人或事。';
    const UNMATCHED_QUESTION_REASON = '当前占问未识别到高置信度取用方向，暂不自动推荐用神。下方暂以世爻展示分析，你可以从“观察重点”选择实际想观察的人或事。';

    const normalizeQuestionText = (question) => String(question || '').trim().toLowerCase().replace(/\s+/g, '');
    const termOccurrences = (content, term) => {
        const starts = [];
        let cursor = 0;
        while (term && cursor <= content.length - term.length) {
            const index = content.indexOf(term, cursor);
            if (index < 0) break;
            starts.push(index);
            cursor = index + 1;
        }
        return starts;
    };
    const isQuestionTermShadowed = (content, term, allTerms = []) => {
        const shortStarts = termOccurrences(content, term);
        if (!shortStarts.length) return false;
        const longerTerms = allTerms.filter((candidate) => candidate.length > term.length && candidate.includes(term) && content.includes(candidate));
        if (!longerTerms.length) return false;
        return shortStarts.every((shortStart) => longerTerms.some((longer) => termOccurrences(content, longer).some((longStart) => (
            shortStart >= longStart && shortStart + term.length <= longStart + longer.length
        ))));
    };
    const matchQuestionTerms = (content, terms = [], allTerms = []) => terms
        .map((term) => String(term).toLowerCase())
        .filter((term) => content.includes(term) && !isQuestionTermShadowed(content, term, allTerms));
    const scoreQuestionRule = (content, rule, allTerms = []) => {
        const suppressHits = matchQuestionTerms(content, rule.suppressTerms || [], allTerms);
        if (suppressHits.length) return { rule, target:rule.target, strongHits:[], relatedHits:[], suppressHits, score:0 };
        const lexicalStrongHits = matchQuestionTerms(content, rule.strongTerms, allTerms);
        const patternStrongHits = typeof rule.matchStrong === 'function' ? (rule.matchStrong(content) || []) : [];
        const strongHits = [...new Set([...lexicalStrongHits, ...patternStrongHits])];
        const relatedHits = matchQuestionTerms(content, rule.relatedTerms, allTerms);
        const target = typeof rule.resolveTarget === 'function' ? rule.resolveTarget(content, strongHits, relatedHits) : rule.target;
        const bonus = typeof rule.scoreBonus === 'function' ? Number(rule.scoreBonus(content, strongHits, relatedHits) || 0) : 0;
        return {
            rule,
            target,
            strongHits,
            relatedHits,
            suppressHits,
            score: strongHits.length * QUESTION_STRONG_SCORE + relatedHits.length * QUESTION_RELATED_SCORE + bonus
        };
    };
    const rankUseGodQuestionRules = (question) => {
        const content = normalizeQuestionText(question);
        if (!content) return { content, status:'empty', ranked:[], top:null, second:null };
        const allTerms = [...new Set(USE_GOD_QUESTION_RULES.flatMap((rule) => [...(rule.strongTerms || []), ...(rule.relatedTerms || []), ...(rule.suppressTerms || [])].map((term) => String(term).toLowerCase())))];
        const ranked = USE_GOD_QUESTION_RULES
            .map((rule) => scoreQuestionRule(content, rule, allTerms))
            .filter((item) => item.strongHits.length && item.score >= QUESTION_CONFIDENCE_THRESHOLD)
            .sort((a,b) => b.score - a.score || Number(b.rule.priority || 0) - Number(a.rule.priority || 0) || b.strongHits.length - a.strongHits.length || a.rule.id.localeCompare(b.rule.id));
        if (!ranked.length) return { content, status:'unmatched', ranked, top:null, second:null };
        const top = ranked[0];
        const second = ranked[1] || null;
        const closeContenders = ranked.filter((item) => top.score - item.score < QUESTION_CONFIDENCE_MARGIN);
        const closeTargets = new Set(closeContenders.map((item) => item.target));
        if (closeTargets.size > 1) {
            return { content, status:'ambiguous', ranked, top, second };
        }
        return { content, status:'confident', ranked, top, second };
    };

    const suggestUseGod = (question, rows, flyingHidden) => {
        const rankedResult = rankUseGodQuestionRules(question);
        const matched = rankedResult.status === 'confident' ? rankedResult.top : null;
        const target = matched?.target || '世';
        const displayTarget = matched?.target || '暂未自动判断';
        const resolution = resolveUseGodFocus(target, rows, flyingHidden);
        const candidates = resolution.candidates;
        const fallbackUseKey = `line-${rows.find((line) => line.isShi)?.position || 1}`;
        const suggestedUseKey = resolution.suggestedUseKey || fallbackUseKey;
        const missingNote = matched && !candidates.length
            ? `本卦明爻及已列伏神中未见“${target}”候选，暂以世爻作为观察起点；也可以从“观察重点”选择实际想观察的人或事。`
            : '';
        const candidateCount = candidates.length;
        const candidateSpecificity = !matched
            ? 'default'
            : candidateCount === 0 ? 'missing'
            : candidateCount === 1 ? 'single'
            : 'multiple';
        const candidateNote = matched && candidateCount > 1
            ? `取用类别已明确为【${target}】，本卦有${formatNaturalCount(candidateCount)}处候选；当前只以其中一处作为展示起点，同类候选会完整保留在盘面中。`
            : '';
        let reason = matched
            ? (typeof matched.rule.reasonForTarget === 'function'
                ? matched.rule.reasonForTarget(matched.target, matched)
                : matched.strongHits?.length
                    ? `占问明确提到“${[...new Set(matched.strongHits)].join('、')}”，优先参考${matched.target}爻。`
                    : matched.rule.reason)
            : (rankedResult.status === 'empty' ? EMPTY_QUESTION_REASON : UNMATCHED_QUESTION_REASON);
        if (rankedResult.status === 'ambiguous') {
            const directions = [...new Set(rankedResult.ranked.slice(0, 2).map((item) => item.target))].join('、');
            reason = `当前占问同时涉及${directions}等多个可能方向，暂不自动推荐用神。下方暂以世爻展示分析，你可以从“观察重点”选择实际想观察的人或事。`;
        }
        return {
            target: displayTarget,
            headline: matched ? (matched.rule.headline || `取用类别：${displayTarget}（高置信）`) : `取用参考：${displayTarget}`,
            recommendedTarget: matched?.target || '',
            focusId: matched?.rule?.focusId || '',
            status: rankedResult.status,
            reason,
            suggestedUseKey,
            candidates,
            candidateCount,
            candidateSpecificity,
            candidateNote,
            canApplySuggestion: Boolean(matched && candidates.length),
            missingNote,
            matchMeta: {
                ruleId: matched?.rule?.id || '',
                score: matched?.score || 0,
                margin: matched && rankedResult.second ? matched.score - rankedResult.second.score : matched ? matched.score : 0,
                strongHits: matched?.strongHits || [],
                relatedHits: matched?.relatedHits || []
            }
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
    const deityRoleInfo = (element, useElement) => {
        if (!element || !useElement) return null;
        const sourceElement = elementGenerator(useElement);
        const tabooElement = elementController(useElement);
        const enemyElement = elementGenerator(tabooElement);
        if (element === sourceElement) return { code:'SOURCE', label:'元神', element };
        if (element === tabooElement) return { code:'TABOO', label:'忌神', element };
        if (element === enemyElement) return { code:'ENEMY', label:'仇神', element };
        return null;
    };
    const useGodLayerEntry = (layer, line, role, extra = {}) => ({
        layer,
        roleCode: role?.code || '',
        roleLabel: role?.label || '',
        position: line.position,
        label: line.label,
        relation: line.relation || '',
        branch: line.branch || '',
        element: line.element || '',
        moving: Boolean(line.moving),
        isShi: Boolean(line.isShi),
        isYing: Boolean(line.isYing),
        statusTags: line.statusTags || [],
        moveTags: line.moveTags || [],
        ...extra
    });
    const buildUseGodRelationPresence = (resultObj) => {
        const relations = ['父母','兄弟','子孙','妻财','官鬼'];
        const map = Object.fromEntries(relations.map((relation) => [relation, { visible:[], changed:[], hidden:[], hiddenCandidates:[] }]));
        (resultObj.lines || []).forEach((line) => {
            if (map[line.relation]) map[line.relation].visible.push(line);
            if (line.moving && line.changedRelation && map[line.changedRelation]) map[line.changedRelation].changed.push(line);
        });
        (resultObj.flyingHidden || []).forEach((item) => {
            if (!map[item.hiddenRelation]) return;
            map[item.hiddenRelation].hidden.push(item);
            if (item.candidate) map[item.hiddenRelation].hiddenCandidates.push(item);
        });
        return map;
    };
    const directMovingElementFact = (source, target, layer) => {
        const prefix = layer === 'changed' ? 'CHANGED_LINE' : 'MOVING_LINE';
        if (source.element === target.element) return { code:`${prefix}_PEER_USE`, text:'与用神五行比和', type:'neutral' };
        if (generateMap[source.element] === target.element) return { code:`${prefix}_GENERATES_USE`, text:'生用神', type:'support' };
        if (generateMap[target.element] === source.element) return { code:`USE_GENERATES_${prefix}`, text:'受用神所生', type:'neutral' };
        if (controlMap[source.element] === target.element) return { code:`${prefix}_CONTROLS_USE`, text:'克用神', type:'constraint' };
        if (controlMap[target.element] === source.element) return { code:`USE_CONTROLS_${prefix}`, text:'受用神所克', type:'neutral' };
        return null;
    };
    const buildUseGodEntryRelationFacts = (entry, target) => {
        if (!entry || !target) return [];
        const facts = [];
        const add = (code, text, type = 'neutral') => facts.push({
            code,
            family:'use-god-entry-direct',
            type,
            sourceLayer:entry.layer,
            sourcePosition:entry.position,
            sourceLabel:entry.label,
            text,
            members:[entry, {
                role:'use-god',
                sourceLayer:target.type === 'hidden' ? 'hidden' : 'visible',
                position:target.position,
                label:target.label,
                relation:target.relation,
                branch:target.branch,
                element:target.element
            }]
        });
        if (entry.element === target.element) add('USE_GOD_ENTRY_PEER_USE', '与用神五行比和');
        else if (generateMap[entry.element] === target.element) add('USE_GOD_ENTRY_GENERATES_USE', '生用神', 'support');
        else if (generateMap[target.element] === entry.element) add('USE_GENERATES_ENTRY', '受用神所生');
        else if (controlMap[entry.element] === target.element) add('USE_GOD_ENTRY_CONTROLS_USE', '克用神', 'constraint');
        else if (controlMap[target.element] === entry.element) add('USE_CONTROLS_ENTRY', '受用神所克');
        if (heMap[entry.branch] === target.branch) add('USE_GOD_ENTRY_SIX_HARMONY_USE', '与用神六合', 'transform');
        if (chongMap[entry.branch] === target.branch) add('USE_GOD_ENTRY_SIX_CLASH_USE', '与用神六冲', 'trigger');
        return facts;
    };
    const buildDirectMovingUseFacts = (target, resultObj) => {
        if (!target || !resultObj) return [];
        const facts = [];
        const targetMember = {
            role:'use-god',
            sourceLayer:target.type === 'hidden' ? 'hidden' : 'visible',
            position:target.position,
            label:target.type === 'hidden' ? `伏神（${target.label || target.position}）` : target.label,
            relation:target.relation,
            branch:target.branch,
            element:target.element
        };
        const addSourceFacts = (line, layer, source) => {
            const sourceLabel = layer === 'changed' ? `${line.label}之变` : line.label;
            const sourceMember = {
                role:'moving-source', sourceLayer:layer, position:line.position, label:sourceLabel,
                relation:source.relation || '', branch:source.branch, element:source.element
            };
            const elementFact = directMovingElementFact(source, target, layer);
            if (elementFact) facts.push({
                ...elementFact,
                family:'use-god-direct',
                sourceLayer:layer,
                sourcePosition:line.position,
                sourceLabel,
                members:[sourceMember, targetMember]
            });
            const prefix = layer === 'changed' ? 'CHANGED_LINE' : 'MOVING_LINE';
            if (heMap[source.branch] === target.branch) facts.push({
                code:`${prefix}_SIX_HARMONY_USE`, family:'use-god-direct', type:'transform', sourceLayer:layer,
                sourcePosition:line.position, sourceLabel, text:'与用神六合', members:[sourceMember, targetMember]
            });
            if (chongMap[source.branch] === target.branch) facts.push({
                code:`${prefix}_SIX_CLASH_USE`, family:'use-god-direct', type:'trigger', sourceLayer:layer,
                sourcePosition:line.position, sourceLabel, text:'与用神六冲', members:[sourceMember, targetMember]
            });
        };
        (resultObj.lines || []).filter((line) => line.moving).forEach((line) => {
            const sameVisibleTarget = target.type !== 'hidden' && line.position === target.position;
            if (!sameVisibleTarget) addSourceFacts(line, 'visible', { relation:line.relation, branch:line.branch, element:line.element });
            if (!sameVisibleTarget && line.changedBranch && line.changedElement) addSourceFacts(line, 'changed', {
                relation:line.changedRelation || '', branch:line.changedBranch, element:line.changedElement
            });
        });
        return facts;
    };
    const buildUseGodAnalysis = (target, resultObj) => {
        if (!target || !resultObj) return null;
        const useElement = target.element;
        const sourceElement = elementGenerator(useElement);
        const tabooElement = elementController(useElement);
        const enemyElement = elementGenerator(tabooElement);
        const relationPresence = buildUseGodRelationPresence(resultObj);
        const visibleEntries = (resultObj.lines || []).map((line) => {
            const role = deityRoleInfo(line.element, useElement);
            return role ? useGodLayerEntry('visible', line, role, { sourceText:'本卦明爻' }) : null;
        }).filter(Boolean);
        const changedEntries = (resultObj.lines || []).filter((line) => line.moving && line.changedElement).map((line) => {
            const role = deityRoleInfo(line.changedElement, useElement);
            return role ? useGodLayerEntry('changed', {
                ...line,
                relation:line.changedRelation,
                branch:line.changedBranch,
                element:line.changedElement,
                statusTags:[],
                moving:true
            }, role, { sourceText:`${line.label}所化`, parentRelation:line.relation, parentBranch:line.branch, parentElement:line.element }) : null;
        }).filter(Boolean);
        const hiddenAllEntries = (resultObj.flyingHidden || []).map((item) => {
            const role = deityRoleInfo(item.hiddenElement, useElement);
            return role ? useGodLayerEntry('hidden', {
                position:item.position,
                label:item.label,
                relation:item.hiddenRelation,
                branch:item.hiddenBranch,
                element:item.hiddenElement,
                moving:false,
                statusTags:item.statusTags || []
            }, role, {
                sourceText:`伏于${item.label}${item.flyRelation}${item.flyBranch}${item.flyElement}之下`,
                candidate:Boolean(item.candidate),
                candidateCode:item.candidateCode || '',
                candidateText:item.candidateText || '',
                flyRelation:item.flyRelation,
                flyBranch:item.flyBranch,
                flyElement:item.flyElement,
                relationText:item.relationText
            }) : null;
        }).filter(Boolean);
        const hiddenCandidateEntries = hiddenAllEntries.filter((entry) => entry.candidate);
        const roleEntries = {
            source:[...visibleEntries, ...changedEntries, ...hiddenCandidateEntries].filter((entry) => entry.roleCode === 'SOURCE'),
            taboo:[...visibleEntries, ...changedEntries, ...hiddenCandidateEntries].filter((entry) => entry.roleCode === 'TABOO'),
            enemy:[...visibleEntries, ...changedEntries, ...hiddenCandidateEntries].filter((entry) => entry.roleCode === 'ENEMY')
        };
        const describeEntry = (entry) => {
            if (entry.layer === 'changed') return `${entry.label}化${entry.relation}${entry.branch}${entry.element}`;
            if (entry.layer === 'hidden') return `${entry.label}下伏${entry.relation}${entry.branch}${entry.element}`;
            const movement = entry.moving ? '动' : hasStatusCode(entry, 'DARK_MOVING') ? '静（暗动提示）' : '静';
            return `${entry.label}${entry.relation}${entry.branch}${movement}`;
        };
        const describeRole = (entries) => {
            const visible = entries.filter((entry) => entry.layer === 'visible');
            const changed = entries.filter((entry) => entry.layer === 'changed');
            const hidden = entries.filter((entry) => entry.layer === 'hidden');
            return [
                visible.length ? `明爻：${visible.map(describeEntry).join('、')}` : '明爻未见',
                changed.length ? `变爻：${changed.map(describeEntry).join('、')}` : '变爻未见',
                hidden.length ? `伏神候选：${hidden.map(describeEntry).join('、')}` : '伏神候选未见'
            ].join('；');
        };
        const roleFacts = [];
        Object.entries(roleEntries).forEach(([key, entries]) => entries.forEach((entry) => roleFacts.push({
            code:`USE_GOD_${entry.roleCode}_${entry.layer.toUpperCase()}`,
            family:'use-god-chain',
            type:entry.roleCode === 'SOURCE' ? 'support' : entry.roleCode === 'TABOO' ? 'constraint' : 'neutral',
            role:key,
            roleCode:entry.roleCode,
            roleLabel:entry.roleLabel,
            sourceLayer:entry.layer,
            text:`${entry.roleLabel}见于${entry.sourceText}`,
            members:[entry]
        })));
        const entryRelationFacts = [];
        Object.values(roleEntries).flat().forEach((entry) => {
            entry.directFacts = buildUseGodEntryRelationFacts(entry, target);
            entryRelationFacts.push(...entry.directFacts);
        });
        const directMovingFacts = buildDirectMovingUseFacts(target, resultObj);
        const targetPresence = relationPresence[target.relation] || { visible:[], changed:[], hidden:[], hiddenCandidates:[] };
        const sameRelationText = [
            targetPresence.visible.length ? `明爻${formatNaturalCount(targetPresence.visible.length)}处` : '明爻未见',
            targetPresence.changed.length ? `变爻${formatNaturalCount(targetPresence.changed.length)}处` : '变爻未见',
            targetPresence.hiddenCandidates.length ? `伏神候选${formatNaturalCount(targetPresence.hiddenCandidates.length)}处` : '伏神候选未见'
        ].join('；');
        return {
            target,
            useElement,
            sourceElement,
            tabooElement,
            enemyElement,
            layers:{ visible:visibleEntries, changed:changedEntries, hidden:hiddenAllEntries, hiddenCandidates:hiddenCandidateEntries },
            relationPresence,
            roleEntries,
            sourceEntries:roleEntries.source,
            tabooEntries:roleEntries.taboo,
            enemyEntries:roleEntries.enemy,
            sourceLines:describeRole(roleEntries.source),
            tabooLines:describeRole(roleEntries.taboo),
            enemyLines:describeRole(roleEntries.enemy),
            sameRelationText,
            entryRelationFacts,
            directMovingFacts,
            facts:[...roleFacts, ...entryRelationFacts, ...directMovingFacts],
            statusText:(target.statusTags || []).map((tag) => tag.text).join('、') || '无额外状态标签'
        };
    };
    const zhouyiSourceUrl = (name) => `https://zh.wikisource.org/wiki/${encodeURIComponent(`周易/${name}`)}`;
    const normalizeLiuYaoDaySect = (value) => Number(value) === 1 ? 1 : 2;
    const candidateDateKey = (dateObj) => `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}`;
    const candidateDateWindow = (dateObj, daySect = 2, mode = 'display') => {
        const dateKey = candidateDateKey(dateObj);
        if (normalizeLiuYaoDaySect(daySect) !== 1) return dateKey;
        const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 0, 0);
        if (dateObj.getHours() < 23) start.setDate(start.getDate() - 1);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 22, 59, 0);
        const startKey = candidateDateKey(start);
        if (mode === 'context') return `${startKey} 23:00 ～ ${candidateDateKey(end)} 22:59`;
        return `${startKey} 23:00 起`;
    };
    const formatCandidateDate = (dateObj, branch, label = '', daySect = 2, mode = 'display') => `${label || branch + '日'} · ${candidateDateWindow(dateObj, daySect, mode)}`;
    const candidateDateTimeText = (dateObj) => dateObj instanceof Date && !Number.isNaN(dateObj.getTime())
        ? `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`
        : '';
    const solarToLocalDate = (solar) => solar?.getYear
        ? new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond?.() || 0)
        : null;
    const findNextJieBoundary = (startDate) => {
        try {
            const next = global.Solar?.fromDate?.(startDate)?.getLunar?.()?.getNextJie?.(false);
            const solar = next?.getSolar?.();
            const dateObj = solarToLocalDate(solar);
            if (!next || !dateObj || Number.isNaN(dateObj.getTime())) return null;
            return { name: next.getName?.() || '下一节令', dateObj };
        } catch (error) {
            return null;
        }
    };
    const getDayBranchAt = (dateObj, daySect = 2) => {
        try {
            const eightChar = Solar.fromDate(dateObj).getLunar().getEightChar();
            eightChar.setSect(normalizeLiuYaoDaySect(daySect));
            return { branch: eightChar.getDayZhi(), xun: eightChar.getDayXun?.() || '' };
        } catch (error) { return { branch: '', xun: '' }; }
    };
    const findNextBranchDate = (startDate, branch, maxDays = 60, daySect = 2) => {
        const sect = normalizeLiuYaoDaySect(daySect);
        for (let offset = 1; offset <= maxDays; offset += 1) {
            const dateObj = new Date(startDate.getTime() + offset * 86400000);
            if (getDayBranchAt(dateObj, sect).branch === branch) return dateObj;
        }
        return null;
    };
    const findNextXunDate = (startDate, currentXun, maxDays = 15, daySect = 2) => {
        const sect = normalizeLiuYaoDaySect(daySect);
        for (let offset = 1; offset <= maxDays; offset += 1) {
            const dateObj = new Date(startDate.getTime() + offset * 86400000);
            const info = getDayBranchAt(dateObj, sect);
            if (info.xun && info.xun !== currentXun) return dateObj;
        }
        return null;
    };
    const mergeTimingCandidatesByDate = (candidates) => {
        const flatEvents = [];
        (candidates || []).forEach((candidate) => {
            if (Array.isArray(candidate.events) && candidate.events.length) {
                candidate.events.forEach((event) => flatEvents.push({ ...event, sourceId: candidate.id, sourceTitle: candidate.title, tier: event.tier || candidate.tier || 'structure' }));
                return;
            }
            const legacyDates = candidate.dates || [];
            legacyDates.forEach((dateText, index) => {
                const contextDateText = candidate.contextDates?.[index] || dateText;
                const dateMatch = String(contextDateText).match(/(\d{4}\/\d{1,2}\/\d{1,2}(?: 23:00 ～ \d{4}\/\d{1,2}\/\d{1,2} 22:59)?)/);
                const windowContext = dateMatch?.[1] || contextDateText;
                const displayWindow = String(dateText).split('·').slice(1).join('·').trim() || dateText;
                const branchMatch = String(dateText).match(/^([子丑寅卯辰巳午未申酉戌亥])日/);
                const dayLabel = branchMatch ? `${branchMatch[1]}日` : (String(dateText).split('·')[0].trim() || candidate.title);
                flatEvents.push({
                    key: `legacy:${windowContext}`,
                    sortTime: Number.MAX_SAFE_INTEGER,
                    dayLabel,
                    displayWindow,
                    contextWindow: windowContext,
                    eventLabel: candidate.title,
                    reason: candidate.reason,
                    sourceId: candidate.id,
                    sourceTitle: candidate.title,
                    tier: candidate.tier || 'structure'
                });
            });
            if (!legacyDates.length) {
                flatEvents.push({
                    key: `undated-source:${candidate.id}`,
                    sortTime: Number.MAX_SAFE_INTEGER,
                    dayLabel: candidate.title,
                    displayWindow: '',
                    contextWindow: '',
                    eventLabel: candidate.title,
                    reason: candidate.reason,
                    sourceId: candidate.id,
                    sourceTitle: candidate.title,
                    tier: candidate.tier || 'structure'
                });
            }
        });

        const groups = new Map();
        flatEvents.forEach((event) => {
            const key = event.key || `undated:${event.contextWindow || event.displayWindow || event.dayLabel || event.sourceId}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(event);
        });

        const output = [...groups.entries()].map(([key, events]) => {
            const uniqueTriggers = [...new Map(events.map((event) => [
                `${event.sourceId}|${event.eventLabel}|${event.reason}`,
                {
                    id: event.sourceId,
                    label: event.eventLabel || event.sourceTitle || '触发',
                    reason: event.reason || '',
                    tier: event.tier || 'structure'
                }
            ])).values()];
            const first = events[0];
            const branchDayEvent = events.find((event) => /^[子丑寅卯辰巳午未申酉戌亥]日$/.test(String(event.dayLabel || '')));
            const titleEvent = branchDayEvent || first;
            const dayLabel = titleEvent.dayLabel || '时间点';
            const displayWindow = titleEvent.displayWindow || first.displayWindow || '';
            const contextWindow = titleEvent.contextWindow || first.contextWindow || displayWindow;
            const title = displayWindow ? `${dayLabel} · ${displayWindow}` : dayLabel;
            const contextTitle = contextWindow ? `${dayLabel} · ${contextWindow}` : title;
            return {
                id: `timing-${String(key).replace(/[^0-9A-Za-z\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '')}`,
                title,
                contextTitle,
                reason: (() => {
                    const parts = uniqueTriggers.map((item) => String(item.reason || '').replace(/[。；]+$/g, '')).filter(Boolean);
                    return parts.length ? `${parts.join('；')}。` : '';
                })(),
                triggers: uniqueTriggers,
                dates: [],
                contextDates: [],
                tier: uniqueTriggers.some((item) => item.tier !== 'regular') ? 'structure' : 'regular',
                sortTime: Math.min(...events.map((item) => Number.isFinite(item.sortTime) ? item.sortTime : Number.MAX_SAFE_INTEGER))
            };
        });

        return output.sort((a, b) => a.sortTime - b.sortTime || a.title.localeCompare(b.title, 'zh-CN'));
    };

    const buildTimingCandidates = (target, resultObj) => {
        if (!target || !resultObj) return [];
        const candidates = [];
        const seen = new Set();
        const startDate = new Date(resultObj.castTimestamp);
        const daySect = normalizeLiuYaoDaySect(resultObj.daySect);
        const add = (id, title, reason, branches = [], extras = [], tier = 'structure') => {
            if (seen.has(id)) return;
            seen.add(id);
            const dates = [];
            const contextDates = [];
            const events = [];
            branches.forEach(({ branch, label, eventLabel, eventReason }) => {
                if (!branch) return;
                const dateObj = findNextBranchDate(startDate, branch, 60, daySect);
                if (!dateObj) {
                    events.push({
                        key: `undated:${id}:${branch}:${eventLabel || title}`,
                        sortTime: Number.MAX_SAFE_INTEGER,
                        dayLabel: `${branch}日`,
                        displayWindow: '',
                        contextWindow: '',
                        eventLabel: eventLabel || title,
                        reason: eventReason || reason,
                        tier
                    });
                    return;
                }
                const displayWindow = candidateDateWindow(dateObj, daySect, 'display');
                const contextWindow = candidateDateWindow(dateObj, daySect, 'context');
                const display = formatCandidateDate(dateObj, branch, label, daySect, 'display');
                const context = formatCandidateDate(dateObj, branch, label, daySect, 'context');
                dates.push(display);
                contextDates.push(context);
                events.push({
                    key: `date:${contextWindow}`,
                    sortTime: dateObj.getTime(),
                    dayLabel: `${branch}日`,
                    displayWindow,
                    contextWindow,
                    eventLabel: eventLabel || title,
                    reason: eventReason || reason,
                    tier
                });
            });
            extras.filter(Boolean).forEach((extra) => {
                if (typeof extra === 'string') {
                    dates.push(extra);
                    contextDates.push(extra);
                    const [dayLabel, ...rest] = extra.split('·').map((part) => part.trim());
                    const window = rest.join(' · ') || '';
                    events.push({ key: `undated:${id}:${extra}`, sortTime: Number.MAX_SAFE_INTEGER, dayLabel: dayLabel || title, displayWindow: window, contextWindow: window, eventLabel: title, reason, tier });
                    return;
                }
                const display = extra.display || extra.context || '';
                const context = extra.context || extra.display || '';
                dates.push(display);
                contextDates.push(context);
                const dateObj = extra.dateObj instanceof Date ? extra.dateObj : null;
                const displayWindow = dateObj ? candidateDateWindow(dateObj, daySect, 'display') : (extra.displayWindow || String(display).split('·').slice(1).join('·').trim());
                const contextWindow = dateObj ? candidateDateWindow(dateObj, daySect, 'context') : (extra.contextWindow || String(context).split('·').slice(1).join('·').trim() || displayWindow);
                const dayLabel = extra.dayLabel || String(display || context).split('·')[0].trim() || title;
                const extraSortTime = Number.isFinite(extra.sortTime) ? extra.sortTime : null;
                events.push({
                    key: dateObj ? `date:${contextWindow}` : `undated:${id}:${context}`,
                    sortTime: dateObj ? dateObj.getTime() : (extraSortTime ?? Number.MAX_SAFE_INTEGER),
                    dayLabel,
                    displayWindow,
                    contextWindow,
                    eventLabel: extra.eventLabel || title,
                    reason: extra.eventReason || reason,
                    tier
                });
            });
            candidates.push({ id, title, reason, dates, contextDates, events, tier });
        };
        const targetText = `${target.relation}${target.branch}${target.element}`;
        if (hasStatusCode(target, 'VOID')) {
            const outXun = findNextXunDate(startDate, resultObj.dayXun, 15, daySect);
            const clashBranch = chongMap[target.branch];
            add('void', '旬空', `${targetText}落旬空。`, [
                { branch: target.branch, label: `${target.branch}日填实`, eventLabel: '填实', eventReason: `${targetText}值日，旬空填实。` },
                { branch: clashBranch, label: `${clashBranch}日冲空`, eventLabel: '冲空', eventReason: `${targetText}旬空逢${clashBranch}日相冲，为冲空。` }
            ], [outXun ? {
                dateObj: outXun,
                display: `出旬 · ${candidateDateWindow(outXun, daySect, 'display')}`,
                context: `出旬 · ${candidateDateWindow(outXun, daySect, 'context')}`,
                dayLabel: '出旬',
                eventLabel: '出空',
                eventReason: `${resultObj.xunKong ? `【${resultObj.xunKong}】旬空` : '当前旬空'}结束，${targetText}出空。`
            } : null]);
        }
        if (hasStatusCode(target, 'MONTH_BREAK')) {
            const harmonyBranch = heMap[target.branch];
            const nextJie = findNextJieBoundary(startDate);
            const outBreak = nextJie ? {
                display: `出破 · ${nextJie.name}交节后 · ${candidateDateTimeText(nextJie.dateObj)}`,
                context: `出破 · ${nextJie.name}交节后 · ${candidateDateTimeText(nextJie.dateObj)}`,
                dayLabel: '出破',
                displayWindow: `${nextJie.name}交节后 · ${candidateDateTimeText(nextJie.dateObj)}`,
                contextWindow: `${nextJie.name}交节后 · ${candidateDateTimeText(nextJie.dateObj)}`,
                sortTime: nextJie.dateObj.getTime(),
                eventLabel: '出破',
                eventReason: `${nextJie.name}交节后，${targetText}不再受当前月建相冲。`
            } : {
                display: '出破 · 下一节令交接后',
                context: '出破 · 下一节令交接后',
                dayLabel: '出破',
                displayWindow: '下一节令交接后',
                contextWindow: '下一节令交接后',
                eventLabel: '出破',
                eventReason: `下一节令交接后，${targetText}不再受当前月建相冲。`
            };
            add('month-break', '月破', `${target.branch}受月建相冲。`, [
                { branch: target.branch, label: `${target.branch}日逢值`, eventLabel: '逢值', eventReason: `${targetText}逢${target.branch}日值日。` },
                { branch: harmonyBranch, label: `${harmonyBranch}日合破`, eventLabel: '合破', eventReason: `${targetText}月破，${harmonyBranch}日与${target.branch}六合，为合破。` }
            ], [outBreak]);
        }
        if (hasStatusCode(target, 'MONTH_HARMONY') || hasStatusCode(target, 'DAY_HARMONY')) {
            const clashBranch = chongMap[target.branch];
            add('bound', '日月见合', `${target.branch}与日月见合。`, [
                { branch: clashBranch, label: `${clashBranch}日冲开`, eventLabel: '冲开', eventReason: `${target.branch}与日月见合，逢${clashBranch}日相冲。` }
            ]);
        }
        if (target.type === 'hidden') {
            const flyItem = (resultObj.flyingHidden || []).find((item) => item.position === target.position
                && item.hiddenRelation === target.relation && item.hiddenBranch === target.branch);
            if (!hasStatusCode(target, 'VOID') && !hasStatusCode(target, 'MONTH_BREAK')) {
                add('hidden-value', '伏神逢值', `${targetText}为伏神。`, [
                    { branch: target.branch, label: `${target.branch}日值伏神`, eventLabel: '伏神值日', eventReason: `伏神${targetText}逢${target.branch}日值日。` }
                ], [], 'regular');
            }
            if (flyItem?.flyBranch) {
                const clashFlyBranch = chongMap[flyItem.flyBranch];
                add('hidden-fly-clash', '冲飞', `${targetText}伏于${flyItem.label}${flyItem.flyRelation}${flyItem.flyBranch}${flyItem.flyElement}之下。`, [
                    { branch: clashFlyBranch, label: `${clashFlyBranch}日冲飞`, eventLabel: '冲飞', eventReason: `伏神${targetText}伏于${flyItem.label}${flyItem.flyRelation}${flyItem.flyBranch}${flyItem.flyElement}之下，${clashFlyBranch}日冲飞神${flyItem.flyRelation}${flyItem.flyBranch}${flyItem.flyElement}。` }
                ], [], 'regular');
            }
        } else if (target.moving) {
            const harmonyBranch = heMap[target.branch];
            add('moving', '动爻逢合', `${targetText}发动。`, [
                { branch: harmonyBranch, label: `${harmonyBranch}日合动爻`, eventLabel: '动爻逢合', eventReason: `${targetText}发动，${harmonyBranch}日与${target.branch}六合。` }
            ], [], 'regular');
        } else {
            const clashBranch = chongMap[target.branch];
            add('static', '静爻逢冲', `${targetText}为静爻。`, [
                { branch: clashBranch, label: `${clashBranch}日相冲`, eventLabel: '静爻逢冲', eventReason: `${targetText}为静爻，${clashBranch}日与${target.branch}相冲。` }
            ], [], 'regular');
        }
        if (hasMoveCode(target, 'TRANSFORM_TOMB')) {
            const tombBranch = target.changedBranch;
            const clashBranch = chongMap[tombBranch];
            add('tomb', '化墓', `动爻化入${tombBranch}墓。`, [
                { branch: clashBranch, label: `${clashBranch}日冲墓`, eventLabel: '冲墓', eventReason: `变爻${tombBranch}入墓，逢${clashBranch}日相冲。` }
            ]);
        }
        if (hasMoveCode(target, 'TRANSFORM_VOID')) {
            const clashBranch = chongMap[target.changedBranch];
            add('transform-void', '化空', `变爻${target.changedBranch}落空。`, [
                { branch: target.changedBranch, label: `${target.changedBranch}日填实`, eventLabel: '化空填实', eventReason: `变爻${target.changedBranch}值日，化空填实。` },
                { branch: clashBranch, label: `${clashBranch}日冲空`, eventLabel: '化空冲空', eventReason: `变爻${target.changedBranch}落空，逢${clashBranch}日相冲。` }
            ]);
        }
        if (hasMoveCode(target, 'PROGRESS')) {
            const harmonyBranch = heMap[target.changedBranch];
            add('progress', '化进神', `本爻由${target.branch}化${target.changedBranch}为进神。`, [
                { branch: target.branch, label: `${target.branch}日值原神`, eventLabel: '原爻值日', eventReason: `${target.branch}日值本爻，进入化进神观察点。` },
                { branch: target.changedBranch, label: `${target.changedBranch}日值进神`, eventLabel: '进神值日', eventReason: `变爻${target.changedBranch}值日，进入化进神观察点。` },
                { branch: harmonyBranch, label: `${harmonyBranch}日合进神`, eventLabel: '进神逢合', eventReason: `${harmonyBranch}日与进神${target.changedBranch}六合。` }
            ]);
        }
        if (hasMoveCode(target, 'RETREAT')) {
            const clashBranch = chongMap[target.changedBranch];
            add('retreat', '化退神', `本爻由${target.branch}化${target.changedBranch}为退神。`, [
                { branch: target.changedBranch, label: `${target.changedBranch}日值退神`, eventLabel: '退神值日', eventReason: `变爻${target.changedBranch}值日，进入化退神观察点。` },
                { branch: clashBranch, label: `${clashBranch}日冲退神`, eventLabel: '冲退神', eventReason: `${clashBranch}日冲变爻${target.changedBranch}。` }
            ]);
        }
        (resultObj.fullStructure?.sanHe?.pendingDetails || []).forEach((item, index) => {
            if (!item?.missingBranch) return;
            add(`sanhe-${index}`, '三合待补', `${item.text}。`, [
                { branch: item.missingBranch, label: `${item.missingBranch}日补局`, eventLabel: '三合补局', eventReason: `${item.text}；${item.missingBranch}日补足所缺一支。` }
            ]);
        });
        if (!candidates.length) {
            add('generic', target.type === 'hidden' ? '伏神逢值' : '值用神', `${resultObj?.useGodSelection?.specificity === 'display-start' && Number(resultObj?.useGodSelection?.candidateCount || 0) > 1 ? '当前观察对象' : '当前用神'}为${targetText}。`, [
                { branch: target.branch, label: target.type === 'hidden' ? `${target.branch}日值伏神` : `${target.branch}日值用神`, eventLabel: target.type === 'hidden' ? '伏神值日' : '值用神', eventReason: target.type === 'hidden' ? `伏神${targetText}逢${target.branch}日值日。` : `${targetText}值日。` }
            ], [], 'regular');
        }
        return mergeTimingCandidatesByDate(candidates);
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
        buildFanFuFacts,
        buildFanFuSummary,
        buildFullHexagramStructure,
        getPurePalaceLines,
        describeFlyHiddenRelation,
        buildFlyingHidden,
        USE_GOD_FOCUS_OPTIONS,
        useGodFocusOptionByTarget,
        useGodFocusOptionById,
        findUseGodCandidates,
        resolveUseGodFocus,
        rankUseGodQuestionRules,
        suggestUseGod,
        buildUseGodChoices,
        deityRoleInfo,
        buildUseGodRelationPresence,
        buildDirectMovingUseFacts,
        buildUseGodAnalysis,
        zhouyiSourceUrl,
        formatCandidateDate,
        candidateDateWindow,
        findNextJieBoundary,
        getDayBranchAt,
        findNextBranchDate,
        findNextXunDate,
        mergeTimingCandidatesByDate,
        buildTimingCandidates
    };
})(window);
