(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const shiShenMap = {
        '甲': {'甲':'比肩', '乙':'劫财', '丙':'食神', '丁':'伤官', '戊':'偏财', '己':'正财', '庚':'七杀', '辛':'正官', '壬':'偏印', '癸':'正印'},
        '乙': {'甲':'劫财', '乙':'比肩', '丙':'伤官', '丁':'食神', '戊':'正财', '己':'偏财', '庚':'正官', '辛':'七杀', '壬':'正印', '癸':'偏印'},
        '丙': {'甲':'偏印', '乙':'正印', '丙':'比肩', '丁':'劫财', '戊':'食神', '己':'伤官', '庚':'偏财', '辛':'正财', '壬':'七杀', '癸':'正官'},
        '丁': {'甲':'正印', '乙':'偏印', '丙':'劫财', '丁':'比肩', '戊':'伤官', '己':'食神', '庚':'正财', '辛':'偏财', '壬':'正官', '癸':'七杀'},
        '戊': {'甲':'七杀', '乙':'正官', '丙':'偏印', '丁':'正印', '戊':'比肩', '己':'劫财', '庚':'食神', '辛':'伤官', '壬':'偏财', '癸':'正财'},
        '己': {'甲':'正官', '乙':'七杀', '丙':'正印', '丁':'偏印', '戊':'劫财', '己':'比肩', '庚':'伤官', '辛':'食神', '壬':'正财', '癸':'偏财'},
        '庚': {'甲':'偏财', '乙':'正财', '丙':'七杀', '丁':'正官', '戊':'偏印', '己':'正印', '庚':'比肩', '辛':'劫财', '壬':'食神', '癸':'伤官'},
        '辛': {'甲':'正财', '乙':'偏财', '丙':'正官', '丁':'七杀', '戊':'正印', '己':'偏印', '庚':'劫财', '辛':'比肩', '壬':'伤官', '癸':'食神'},
        '壬': {'甲':'食神', '乙':'伤官', '丙':'偏财', '丁':'正财', '戊':'七杀', '己':'正官', '庚':'偏印', '辛':'正印', '壬':'比肩', '癸':'劫财'},
        '癸': {'甲':'伤官', '乙':'食神', '丙':'正财', '丁':'偏财', '戊':'正官', '己':'七杀', '庚':'正印', '辛':'偏印', '壬':'劫财', '癸':'比肩'}
    };

    const shiShenDesc = {
        '比肩': '自我立场、独立行动、同辈关系、协作边界与资源分配成为较显眼的主题。',
        '劫财': '竞争、共享、结盟、行动冲劲及资源重新分配成为较显眼的主题。',
        '食神': '表达、技艺、创造、照料、生活体验与成果输出成为较显眼的主题。',
        '伤官': '表达突破、质疑规则、技术发挥、求变及与既有秩序的张力成为较显眼的主题。',
        '偏财': '流动资源、机会、人际往来、项目经营与非固定收益成为较显眼的主题。',
        '正财': '稳定资源、日常经营、责任落实、预算秩序与长期积累成为较显眼的主题。',
        '七杀': '压力、竞争、决断、风险管理、边界建立与承担任务成为较显眼的主题。',
        '正官': '规则、职责、组织关系、名分、评价体系与自我约束成为较显眼的主题。',
        '偏印': '非标准知识、独立研究、直觉判断、方法转换与精神内向成为较显眼的主题。',
        '正印': '学习、支持、吸收、资质凭证、保护系统与经验传承成为较显眼的主题。'
    };

    const ganOrder = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const zhiOrder = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const wuXingOrder = ['木','火','土','金','水'];
    const cangGanMap = {
        '子': [['癸','本气']],
        '丑': [['己','本气'],['癸','中气'],['辛','余气']],
        '寅': [['甲','本气'],['丙','中气'],['戊','余气']],
        '卯': [['乙','本气']],
        '辰': [['戊','本气'],['乙','中气'],['癸','余气']],
        '巳': [['丙','本气'],['戊','中气'],['庚','余气']],
        '午': [['丁','本气'],['己','中气']],
        '未': [['己','本气'],['丁','中气'],['乙','余气']],
        '申': [['庚','本气'],['壬','中气'],['戊','余气']],
        '酉': [['辛','本气']],
        '戌': [['戊','本气'],['辛','中气'],['丁','余气']],
        '亥': [['壬','本气'],['甲','中气']]
    };
    const palaceMap = {
        '年柱': { short: '家族·祖上·早年环境', detail: '常用于观察家族系统、祖上资源及早期外部环境。传统书目对六亲分配并不完全一致，因此只作位置参考。' },
        '月柱': { short: '提纲·父母手足·社会环境', detail: '月支为月令提纲，月柱也常用于观察成长家庭、父母手足、工作与社会秩序。' },
        '日柱': { short: '本人·亲密关系', detail: '日干为命局主体；日支常作为配偶宫或亲密关系位置，同时也是日主所坐之地。' },
        '时柱': { short: '子女·成果·后期发展', detail: '常用于观察子女、作品与成果、内在规划及人生后段，但不能机械地按年龄切割。' }
    };

    const naYinPairs = [
        ['甲子','乙丑','海中金'],['丙寅','丁卯','炉中火'],['戊辰','己巳','大林木'],['庚午','辛未','路旁土'],['壬申','癸酉','剑锋金'],
        ['甲戌','乙亥','山头火'],['丙子','丁丑','涧下水'],['戊寅','己卯','城头土'],['庚辰','辛巳','白蜡金'],['壬午','癸未','杨柳木'],
        ['甲申','乙酉','泉中水'],['丙戌','丁亥','屋上土'],['戊子','己丑','霹雳火'],['庚寅','辛卯','松柏木'],['壬辰','癸巳','长流水'],
        ['甲午','乙未','沙中金'],['丙申','丁酉','山下火'],['戊戌','己亥','平地木'],['庚子','辛丑','壁上土'],['壬寅','癸卯','金箔金'],
        ['甲辰','乙巳','覆灯火'],['丙午','丁未','天河水'],['戊申','己酉','大驿土'],['庚戌','辛亥','钗钏金'],['壬子','癸丑','桑柘木'],
        ['甲寅','乙卯','大溪水'],['丙辰','丁巳','沙中土'],['戊午','己未','天上火'],['庚申','辛酉','石榴木'],['壬戌','癸亥','大海水']
    ];
    const naYinMap = Object.fromEntries(naYinPairs.flatMap(([a,b,name]) => [[a,name],[b,name]]));

    const changShengStart = {'甲':'亥','乙':'午','丙':'寅','丁':'酉','戊':'寅','己':'酉','庚':'巳','辛':'子','壬':'申','癸':'卯'};
    const changShengStages = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
    const yangGan = new Set(['甲','丙','戊','庚','壬']);

    const getWuXing = (char) => ({
        '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
        '寅':'木','卯':'木','巳':'火','午':'火','辰':'土','戌':'土','丑':'土','未':'土','申':'金','酉':'金','亥':'水','子':'水'
    }[char] || '');

    const getColorClass = (wuxing) => ({
        '木':'wu-xing-mu', '火':'wu-xing-huo', '土':'wu-xing-tu', '金':'wu-xing-jin', '水':'wu-xing-shui'
    }[wuxing] || '');

    const getStatusClass = (status) => ({
        '旺':'status-wang', '相':'status-xiang', '休':'status-xiu', '囚':'status-qiu', '死':'status-si'
    }[status] || 'status-si');

    const getShiShenExplanation = (shiShen) => shiShenDesc[shiShen] || '暂无主题说明。';
    const getRelationTagClass = (type) => ({
        'hehui': 'tag-hehui', 'chong': 'tag-chong', 'xing': 'tag-xing', 'hai': 'tag-hai',
        'po': 'tag-po', 'stem': 'tag-stem', 'neutral': 'tag-neutral'
    }[type] || 'tag-neutral');

    const getNaYin = (ganZhi) => naYinMap[ganZhi] || '—';
    const getDiShi = (dayGan, zhi) => {
        const start = zhiOrder.indexOf(changShengStart[dayGan]);
        const target = zhiOrder.indexOf(zhi);
        if (start < 0 || target < 0) return '—';
        const direction = yangGan.has(dayGan) ? 1 : -1;
        let distance = direction === 1 ? target - start : start - target;
        while (distance < 0) distance += 12;
        return changShengStages[distance % 12];
    };
    const getXunInfo = (ganZhi) => {
        const jiaZi = [];
        for (let i = 0; i < 60; i += 1) jiaZi.push(ganOrder[i % 10] + zhiOrder[i % 12]);
        const index = jiaZi.indexOf(ganZhi);
        if (index < 0) return { xun: '—', xunKong: '—' };
        const group = Math.floor(index / 10);
        const xunNames = ['甲子旬','甲戌旬','甲申旬','甲午旬','甲辰旬','甲寅旬'];
        const kong = ['戌亥','申酉','午未','辰巳','寅卯','子丑'];
        return { xun: xunNames[group], xunKong: kong[group] };
    };

    const chongMap = {'子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳'};
    const heMap = {'子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午'};
    const haiMap = {'子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉'};
    const poMap = {'子':'酉','酉':'子','卯':'午','午':'卯','辰':'丑','丑':'辰','未':'戌','戌':'未','寅':'亥','亥':'寅','巳':'申','申':'巳'};
    const xingPairMap = {
        '子卯':'子卯无礼之刑','卯子':'子卯无礼之刑',
        '寅巳':'寅巳相刑','巳寅':'寅巳相刑','巳申':'巳申相刑','申巳':'巳申相刑','申寅':'申寅相刑','寅申':'申寅相刑',
        '丑未':'丑未相刑','未丑':'丑未相刑','未戌':'未戌相刑','戌未':'未戌相刑','戌丑':'戌丑相刑','丑戌':'戌丑相刑'
    };
    const selfXingBranches = new Set(['辰','午','酉','亥']);
    const xingTriads = [
        { set: ['寅','巳','申'], name: '寅巳申三刑' },
        { set: ['丑','未','戌'], name: '丑未戌三刑' }
    ];
    const sanHeGroups = [
        { set: ['申','子','辰'], wx: '水', pairs: {'申子':'生旺半合','子辰':'旺墓半合','申辰':'拱子'} },
        { set: ['亥','卯','未'], wx: '木', pairs: {'亥卯':'生旺半合','卯未':'旺墓半合','亥未':'拱卯'} },
        { set: ['寅','午','戌'], wx: '火', pairs: {'寅午':'生旺半合','午戌':'旺墓半合','寅戌':'拱午'} },
        { set: ['巳','酉','丑'], wx: '金', pairs: {'巳酉':'生旺半合','酉丑':'旺墓半合','巳丑':'拱酉'} }
    ];
    const sanHuiGroups = [
        { set: ['寅','卯','辰'], wx: '木' }, { set: ['巳','午','未'], wx: '火' },
        { set: ['申','酉','戌'], wx: '金' }, { set: ['亥','子','丑'], wx: '水' }
    ];
    const tianGanHeMap = {'甲':'己','己':'甲','乙':'庚','庚':'乙','丙':'辛','辛':'丙','丁':'壬','壬':'丁','戊':'癸','癸':'戊'};
    const tianGanChongMap = {'甲':'庚','庚':'甲','乙':'辛','辛':'乙','丙':'壬','壬':'丙','丁':'癸','癸':'丁'};

    // 原局关系的机器语义码。界面展示使用 text；排序、证据与文献 matcher 使用 code，
    // 避免以后修改中文措辞时悄悄改变业务逻辑。
    const baziRelationCodes = Object.freeze({
        STEM_FIVE_HARMONY: 'STEM_FIVE_HARMONY',
        STEM_CLASH: 'STEM_CLASH',
        BRANCH_SIX_CLASH: 'BRANCH_SIX_CLASH',
        BRANCH_SIX_HARMONY: 'BRANCH_SIX_HARMONY',
        BRANCH_SIX_HARM: 'BRANCH_SIX_HARM',
        BRANCH_SIX_BREAK: 'BRANCH_SIX_BREAK',
        BRANCH_PUNISHMENT: 'BRANCH_PUNISHMENT',
        SELF_PUNISHMENT: 'SELF_PUNISHMENT',
        PUNISHMENT_TRIAD_COMPLETE: 'PUNISHMENT_TRIAD_COMPLETE',
        SAN_HE_COMPLETE: 'SAN_HE_COMPLETE',
        SAN_HE_PARTIAL: 'SAN_HE_PARTIAL',
        SAN_HUI_COMPLETE: 'SAN_HUI_COMPLETE',
        SAN_HUI_PARTIAL: 'SAN_HUI_PARTIAL'
    });

    const uniqueRelations = (relations) => {
        const seen = new Set();
        return relations.filter((rel) => {
            const key = `${rel.type}|${rel.text}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };
    const countMap = (items) => items.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
    const containsAll = (setObj, items) => items.every((item) => setObj.has(item));
    const getSanHePair = (group, present) => {
        if (present.length !== 2) return null;
        const ordered = group.set.filter((zhi) => present.includes(zhi));
        return { pair: ordered.join(''), kind: group.pairs[ordered.join('')] || '两支组合' };
    };

    const calculateStemRelations = (targetGan, originalGansArr) => {
        const relations = [];
        const pillarNames = ['年干','月干','日干（主）','时干'];
        originalGansArr.forEach((originalGan, index) => {
            if (tianGanHeMap[targetGan] === originalGan) relations.push({ type: 'stem', text: `与${pillarNames[index]}【${originalGan}】天干五合` });
            if (tianGanChongMap[targetGan] === originalGan) relations.push({ type: 'stem', text: `与${pillarNames[index]}【${originalGan}】天干相冲` });
        });
        return uniqueRelations(relations);
    };

    const calculateBranchRelations = (targetZhi, originalZhisArr) => {
        const relations = [];
        const originalSet = new Set(originalZhisArr);
        const combinedSet = new Set([...originalZhisArr, targetZhi]);
        const pillarNames = ['年支','月支','日支','时支'];
        const completedXingTriads = xingTriads.filter((group) => group.set.includes(targetZhi) && containsAll(combinedSet, group.set));

        originalZhisArr.forEach((originalZhi, index) => {
            if (chongMap[targetZhi] === originalZhi) relations.push({ type: 'chong', text: `冲${pillarNames[index]}【${originalZhi}】` });
            if (heMap[targetZhi] === originalZhi) relations.push({ type: 'hehui', text: `合${pillarNames[index]}【${originalZhi}】（六合）` });
            if (haiMap[targetZhi] === originalZhi) relations.push({ type: 'hai', text: `害${pillarNames[index]}【${originalZhi}】（六害）` });
            if (poMap[targetZhi] === originalZhi) relations.push({ type: 'po', text: `破${pillarNames[index]}【${originalZhi}】（六破）` });
            const xingName = xingPairMap[`${targetZhi}${originalZhi}`];
            const belongsToCompletedTriad = completedXingTriads.some((group) => group.set.includes(targetZhi) && group.set.includes(originalZhi));
            if (xingName && !belongsToCompletedTriad) relations.push({ type: 'xing', text: `与${pillarNames[index]}【${originalZhi}】构成${xingName}` });
            if (targetZhi === originalZhi && selfXingBranches.has(targetZhi)) relations.push({ type: 'xing', text: `与${pillarNames[index]}【${originalZhi}】构成${targetZhi}${targetZhi}自刑` });
        });

        completedXingTriads.forEach((group) => {
            const alreadyComplete = containsAll(originalSet, group.set);
            relations.push({ type: 'xing', text: alreadyComplete ? `原局已有${group.name}，外来【${targetZhi}】再次引动` : `外来【${targetZhi}】引动完整${group.name}` });
        });

        sanHeGroups.forEach((group) => {
            if (!group.set.includes(targetZhi)) return;
            const before = group.set.filter((zhi) => originalSet.has(zhi));
            const after = group.set.filter((zhi) => combinedSet.has(zhi));
            if (after.length === 3) {
                relations.push({ type: 'hehui', text: before.length === 3 ? `原局已有三合${group.wx}局【${group.set.join('')}】，外来【${targetZhi}】再次引动` : `外来【${targetZhi}】补齐三合${group.wx}局【${group.set.join('')}】` });
            } else if (after.length === 2) {
                const pairInfo = getSanHePair(group, after);
                if (pairInfo) relations.push({ type: 'hehui', text: before.length === 2 ? `原局已有${pairInfo.kind}${group.wx}组合【${pairInfo.pair}】，外来【${targetZhi}】重复引动` : `与原局形成${pairInfo.kind}${group.wx}组合【${pairInfo.pair}】（尚未成三合局）` });
            }
        });

        sanHuiGroups.forEach((group) => {
            if (!group.set.includes(targetZhi)) return;
            const before = group.set.filter((zhi) => originalSet.has(zhi));
            const after = group.set.filter((zhi) => combinedSet.has(zhi));
            if (after.length === 3) {
                relations.push({ type: 'hehui', text: before.length === 3 ? `原局已有三会${group.wx}方【${group.set.join('')}】，外来【${targetZhi}】再次引动` : `外来【${targetZhi}】补齐三会${group.wx}方【${group.set.join('')}】` });
            } else if (after.length === 2) {
                const pair = group.set.filter((zhi) => combinedSet.has(zhi)).join('');
                relations.push({ type: 'hehui', text: before.length === 2 ? `原局已有同方组合【${pair}】，外来【${targetZhi}】重复引动（未成三会${group.wx}方）` : `与原局形成同方组合【${pair}】（未成三会${group.wx}方）` });
            }
        });
        return uniqueRelations(relations);
    };

    const calculateInternalChartRelations = (gans, zhis) => {
        const relations = [];
        const pillarNames = ['年柱','月柱','日柱','时柱'];
        const zhiSet = new Set(zhis);
        const zhiCounts = countMap(zhis);
        const completeXingTriads = xingTriads.filter((group) => containsAll(zhiSet, group.set));
        const indicesForBranches = (branches) => zhis
            .map((zhi, index) => branches.includes(zhi) ? index : null)
            .filter((index) => index !== null);
        for (let i = 0; i < 4; i += 1) {
            for (let j = i + 1; j < 4; j += 1) {
                if (tianGanHeMap[gans[i]] === gans[j]) relations.push({
                    type: 'stem', code: baziRelationCodes.STEM_FIVE_HARMONY, pillarIndices: [i,j],
                    stems: [gans[i], gans[j]], text: `${pillarNames[i]}天干【${gans[i]}】与${pillarNames[j]}天干【${gans[j]}】五合`
                });
                if (tianGanChongMap[gans[i]] === gans[j]) relations.push({
                    type: 'stem', code: baziRelationCodes.STEM_CLASH, pillarIndices: [i,j],
                    stems: [gans[i], gans[j]], text: `${pillarNames[i]}天干【${gans[i]}】与${pillarNames[j]}天干【${gans[j]}】相冲`
                });
                const z1 = zhis[i];
                const z2 = zhis[j];
                if (chongMap[z1] === z2) relations.push({
                    type: 'chong', code: baziRelationCodes.BRANCH_SIX_CLASH, pillarIndices: [i,j], branches: [z1,z2],
                    text: `${pillarNames[i]}地支【${z1}】与${pillarNames[j]}地支【${z2}】六冲`
                });
                if (heMap[z1] === z2) relations.push({
                    type: 'hehui', code: baziRelationCodes.BRANCH_SIX_HARMONY, pillarIndices: [i,j], branches: [z1,z2],
                    text: `${pillarNames[i]}地支【${z1}】与${pillarNames[j]}地支【${z2}】六合`
                });
                if (haiMap[z1] === z2) relations.push({
                    type: 'hai', code: baziRelationCodes.BRANCH_SIX_HARM, pillarIndices: [i,j], branches: [z1,z2],
                    text: `${pillarNames[i]}地支【${z1}】与${pillarNames[j]}地支【${z2}】六害`
                });
                if (poMap[z1] === z2) relations.push({
                    type: 'po', code: baziRelationCodes.BRANCH_SIX_BREAK, pillarIndices: [i,j], branches: [z1,z2],
                    text: `${pillarNames[i]}地支【${z1}】与${pillarNames[j]}地支【${z2}】六破`
                });
                const xingName = xingPairMap[`${z1}${z2}`];
                const belongsToCompleteTriad = completeXingTriads.some((group) => group.set.includes(z1) && group.set.includes(z2));
                if (xingName && !belongsToCompleteTriad) relations.push({
                    type: 'xing', code: baziRelationCodes.BRANCH_PUNISHMENT, pillarIndices: [i,j], branches: [z1,z2],
                    text: `${pillarNames[i]}地支【${z1}】与${pillarNames[j]}地支【${z2}】构成${xingName}`
                });
            }
        }
        selfXingBranches.forEach((zhi) => {
            if ((zhiCounts[zhi] || 0) >= 2) relations.push({
                type: 'xing', code: baziRelationCodes.SELF_PUNISHMENT,
                pillarIndices: zhis.map((item,index) => item === zhi ? index : null).filter((index) => index !== null),
                branches: [zhi], text: `原局有${zhiCounts[zhi]}个【${zhi}】，构成${zhi}${zhi}自刑`
            });
        });
        completeXingTriads.forEach((group) => relations.push({
            type: 'xing', code: baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE,
            pillarIndices: indicesForBranches(group.set), branches: [...group.set],
            text: `原局构成完整${group.name}【${group.set.join('')}】`
        }));
        sanHeGroups.forEach((group) => {
            const present = group.set.filter((zhi) => zhiSet.has(zhi));
            if (present.length === 3) relations.push({
                type: 'hehui', code: baziRelationCodes.SAN_HE_COMPLETE,
                pillarIndices: indicesForBranches(group.set), branches: [...group.set], element: group.wx,
                text: `原局构成三合${group.wx}局【${group.set.join('')}】`
            });
            else if (present.length === 2) {
                const pairInfo = getSanHePair(group, present);
                if (pairInfo) relations.push({
                    type: 'hehui', code: baziRelationCodes.SAN_HE_PARTIAL,
                    pillarIndices: indicesForBranches(present), branches: [...present], element: group.wx, pairKind: pairInfo.kind,
                    text: `原局有${pairInfo.kind}${group.wx}组合【${pairInfo.pair}】（尚未成三合局）`
                });
            }
        });
        sanHuiGroups.forEach((group) => {
            const present = group.set.filter((zhi) => zhiSet.has(zhi));
            if (present.length === 3) relations.push({
                type: 'hehui', code: baziRelationCodes.SAN_HUI_COMPLETE,
                pillarIndices: indicesForBranches(group.set), branches: [...group.set], element: group.wx,
                text: `原局构成三会${group.wx}方【${group.set.join('')}】`
            });
            else if (present.length === 2) relations.push({
                type: 'hehui', code: baziRelationCodes.SAN_HUI_PARTIAL,
                pillarIndices: indicesForBranches(present), branches: [...present], element: group.wx,
                text: `原局有同方组合【${present.join('')}】（未成三会${group.wx}方）`
            });
        });
        return uniqueRelations(relations);
    };

    const calculatePillarSignals = (targetGan, targetZhi, originalGans, originalZhis, targetLabel) => {
        const names = ['年柱','月柱','日柱','时柱'];
        const relations = [];
        names.forEach((name, index) => {
            const sameGan = targetGan === originalGans[index];
            const sameZhi = targetZhi === originalZhis[index];
            const ganChong = tianGanChongMap[targetGan] === originalGans[index];
            const zhiChong = chongMap[targetZhi] === originalZhis[index];
            const ganHe = tianGanHeMap[targetGan] === originalGans[index];
            const zhiHe = heMap[targetZhi] === originalZhis[index];
            if (sameGan && sameZhi) relations.push({ type: 'neutral', text: `${targetLabel}与${name}同柱，构成伏吟【${targetGan}${targetZhi}】` });
            else if (ganChong && zhiChong) relations.push({ type: 'chong', text: `${targetLabel}与${name}天克地冲（反吟）` });
            else if (ganHe && zhiHe) relations.push({ type: 'hehui', text: `${targetLabel}与${name}天合地合` });
        });
        return uniqueRelations(relations);
    };

    const calculatePairRelations = (a, b, labelA, labelB) => {
        if (!a || !b) return [];
        const relations = [];
        if (a.gan === b.gan && a.zhi === b.zhi) return [{ type: 'neutral', text: `${labelA}与${labelB}干支相同，岁运并临【${a.gan}${a.zhi}】` }];
        if (tianGanChongMap[a.gan] === b.gan && chongMap[a.zhi] === b.zhi) return [{ type: 'chong', text: `${labelA}与${labelB}天克地冲` }];
        if (tianGanHeMap[a.gan] === b.gan && heMap[a.zhi] === b.zhi) return [{ type: 'hehui', text: `${labelA}与${labelB}天合地合` }];
        if (a.gan === b.gan) relations.push({ type: 'stem', text: `${labelA}与${labelB}天干同为【${a.gan}】` });
        if (tianGanHeMap[a.gan] === b.gan) relations.push({ type: 'stem', text: `${labelA}【${a.gan}】与${labelB}【${b.gan}】天干五合` });
        if (tianGanChongMap[a.gan] === b.gan) relations.push({ type: 'stem', text: `${labelA}【${a.gan}】与${labelB}【${b.gan}】天干相冲` });
        if (a.zhi === b.zhi) relations.push({ type: selfXingBranches.has(a.zhi) ? 'xing' : 'neutral', text: `${labelA}与${labelB}地支同为【${a.zhi}】${selfXingBranches.has(a.zhi) ? '，并见自刑条件' : ''}` });
        if (heMap[a.zhi] === b.zhi) relations.push({ type: 'hehui', text: `${labelA}【${a.zhi}】与${labelB}【${b.zhi}】六合` });
        if (chongMap[a.zhi] === b.zhi) relations.push({ type: 'chong', text: `${labelA}【${a.zhi}】与${labelB}【${b.zhi}】六冲` });
        if (haiMap[a.zhi] === b.zhi) relations.push({ type: 'hai', text: `${labelA}【${a.zhi}】与${labelB}【${b.zhi}】六害` });
        if (poMap[a.zhi] === b.zhi) relations.push({ type: 'po', text: `${labelA}【${a.zhi}】与${labelB}【${b.zhi}】六破` });
        const xingName = xingPairMap[`${a.zhi}${b.zhi}`];
        if (xingName) relations.push({ type: 'xing', text: `${labelA}【${a.zhi}】与${labelB}【${b.zhi}】构成${xingName}` });
        return uniqueRelations(relations);
    };

    const calculateThreeLayerRelations = (daYun, liuNian, originalZhis) => {
        if (!daYun || !liuNian) return [];
        const relations = [];
        const base = new Set(originalZhis);
        const withYun = new Set([...originalZhis, daYun.zhi]);
        const withYear = new Set([...originalZhis, liuNian.zhi]);
        const all = new Set([...originalZhis, daYun.zhi, liuNian.zhi]);
        const requiresBoth = (set) => containsAll(all, set) && !containsAll(withYun, set) && !containsAll(withYear, set) && !containsAll(base, set);
        sanHeGroups.forEach((group) => {
            if (requiresBoth(group.set)) relations.push({ type: 'hehui', text: `原局＋大运【${daYun.zhi}】＋流年【${liuNian.zhi}】共同会齐三合${group.wx}局【${group.set.join('')}】` });
        });
        sanHuiGroups.forEach((group) => {
            if (requiresBoth(group.set)) relations.push({ type: 'hehui', text: `原局＋大运【${daYun.zhi}】＋流年【${liuNian.zhi}】共同会齐三会${group.wx}方【${group.set.join('')}】` });
        });
        xingTriads.forEach((group) => {
            if (requiresBoth(group.set)) relations.push({ type: 'xing', text: `原局＋大运【${daYun.zhi}】＋流年【${liuNian.zhi}】共同会齐${group.name}` });
        });
        return uniqueRelations(relations);
    };

    const buildMonthSeason = (monthZhi, dayElement) => {
        const tables = {
            '春': {'木':'旺','火':'相','水':'休','金':'囚','土':'死'},
            '夏': {'火':'旺','土':'相','木':'休','水':'囚','金':'死'},
            '秋': {'金':'旺','水':'相','土':'休','火':'囚','木':'死'},
            '冬': {'水':'旺','木':'相','金':'休','土':'囚','火':'死'},
            '四季土': {'土':'旺','金':'相','火':'休','木':'囚','水':'死'}
        };
        const season = ['寅','卯'].includes(monthZhi) ? '春'
            : ['巳','午'].includes(monthZhi) ? '夏'
            : ['申','酉'].includes(monthZhi) ? '秋'
            : ['亥','子'].includes(monthZhi) ? '冬' : '四季土';
        return {
            monthZhi,
            season,
            states: wuXingOrder.map((wuxing) => ({ wuxing, status: tables[season][wuxing], isDayMaster: wuxing === dayElement }))
        };
    };

    const buildDayMasterEvidence = (pillars, monthSeason, internalRelations, dayGan) => {
        const dayElement = getWuXing(dayGan);
        const visibleOther = pillars.filter((_, i) => i !== 2).map((p) => ({ gan: p.gan, shishen: p.shishenGan, title: p.title }));
        const hidden = pillars.flatMap((p) => p.cangGan.map((c) => ({ ...c, title: p.title, zhi: p.zhi })));
        const exactRoots = hidden.filter((c) => c.gan === dayGan).map((c) => `${c.title}${c.zhi}中${c.gan}（${c.level}）`);
        const sameElementRoots = hidden.filter((c) => c.wuxing === dayElement && c.gan !== dayGan).map((c) => `${c.title}${c.zhi}中${c.gan}（${c.level}）`);
        const supportVisible = visibleOther.filter((x) => ['比肩','劫财','正印','偏印'].includes(x.shishen));
        const supportHidden = hidden.filter((x) => ['比肩','劫财','正印','偏印'].includes(x.shishen));
        const outputVisible = visibleOther.filter((x) => ['食神','伤官','正财','偏财','正官','七杀'].includes(x.shishen));
        const outputHidden = hidden.filter((x) => ['食神','伤官','正财','偏财','正官','七杀'].includes(x.shishen));
        const dayStatus = monthSeason.states.find((x) => x.wuxing === dayElement)?.status || '—';
        const fullStructureCodes = new Set([baziRelationCodes.SAN_HE_COMPLETE, baziRelationCodes.SAN_HUI_COMPLETE, baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE]);
        const fullStructures = internalRelations.filter((x) => fullStructureCodes.has(x.code)).map((x) => x.text);
        return [
            { key: '得令', value: `${monthSeason.monthZhi}月属${monthSeason.season}，日主${dayElement}在旺相休囚死表中为“${dayStatus}”。这只是季节状态。` },
            { key: '通根', value: exactRoots.length ? `见本干根：${exactRoots.join('；')}。${sameElementRoots.length ? `另有同五行根气：${sameElementRoots.join('；')}。` : ''}` : (sameElementRoots.length ? `未见本干同字，见同五行根气：${sameElementRoots.join('；')}。` : '四支藏干未见日主同五行根气。') },
            { key: '扶助', value: `天干可见比劫、印星 ${supportVisible.length} 处；地支藏干可见 ${supportHidden.length} 处。位置与层级比单纯数量更重要。` },
            { key: '泄耗克', value: `天干可见食伤、财、官杀 ${outputVisible.length} 处；地支藏干可见 ${outputHidden.length} 处。需分别观察是否透出、是否得令与是否有制化。` },
            { key: '方局', value: fullStructures.length ? `${fullStructures.join('；')}。成方成局可能改变整体气势，不能仍按孤立五行计数。` : '原局未检测到完整三合、三会或三刑；半合、同方组合仍需结合透干与月令观察。' }
        ];
    };

    const buildShenSha = (dayGan, originalZhis) => {
        const pillarNames = ['年柱','月柱','日柱','时柱'];
        const positionsFor = (target) => originalZhis.map((zhi, i) => zhi === target ? `${pillarNames[i]}【${zhi}】` : null).filter(Boolean);
        const ganStar = (name, targets, note, variant = '') => {
            const hits = targets.flatMap(positionsFor);
            return { name, present: hits.length > 0, basis: `以日干【${dayGan}】查【${targets.join('、')}】${variant}`, hitsText: hits.length ? [...new Set(hits)].join('、') : '原局四支未见', note };
        };
        const groupStar = (name, mapping, note) => {
            const checks = [
                { source: `年支【${originalZhis[0]}】`, target: mapping[originalZhis[0]] },
                { source: `日支【${originalZhis[2]}】`, target: mapping[originalZhis[2]] }
            ];
            const hitParts = [];
            checks.forEach((check) => {
                const hits = positionsFor(check.target);
                if (hits.length) hitParts.push(`${check.source}查【${check.target}】：${hits.join('、')}`);
            });
            return { name, present: hitParts.length > 0, basis: checks.map((x) => `${x.source}查【${x.target}】`).join('；'), hitsText: hitParts.length ? hitParts.join('；') : '按年支与日支两路均未命中', note };
        };
        const tianYiMap = {'甲':['丑','未'],'戊':['丑','未'],'庚':['丑','未'],'乙':['子','申'],'己':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'壬':['卯','巳'],'癸':['卯','巳'],'辛':['寅','午']};
        const wenChangMap = {'甲':['巳'],'乙':['午'],'丙':['申'],'戊':['申'],'丁':['酉'],'己':['酉'],'庚':['亥'],'辛':['子'],'壬':['寅'],'癸':['卯']};
        const luMap = {'甲':['寅'],'乙':['卯'],'丙':['巳'],'戊':['巳'],'丁':['午'],'己':['午'],'庚':['申'],'辛':['酉'],'壬':['亥'],'癸':['子']};
        const renMap = {'甲':['卯'],'乙':['寅'],'丙':['午'],'戊':['午'],'丁':['巳'],'己':['巳'],'庚':['酉'],'辛':['申'],'壬':['子'],'癸':['亥']};
        const yiMa = {'申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳'};
        const taoHua = {'申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子'};
        const huaGai = {'申':'辰','子':'辰','辰':'辰','寅':'戌','午':'戌','戌':'戌','巳':'丑','酉':'丑','丑':'丑','亥':'未','卯':'未','未':'未'};
        const jiangXing = {'申':'子','子':'子','辰':'子','寅':'午','午':'午','戌':'午','巳':'酉','酉':'酉','丑':'酉','亥':'卯','卯':'卯','未':'卯'};
        return [
            ganStar('天乙贵人', tianYiMap[dayGan] || [], '传统上用于辅助观察助力与解厄条件，不代表必有外援。'),
            ganStar('文昌贵人', wenChangMap[dayGan] || [], '多用于辅助观察学习、表达与文书主题。'),
            ganStar('禄神', luMap[dayGan] || [], '用于辅助观察日干临官之位、资源与职分主题。'),
            ganStar('羊刃', renMap[dayGan] || [], '用于辅助观察日干旺极之位与行动锋芒；阴干羊刃查法存在版本差异。', '（采用常见十干表）'),
            groupStar('驿马', yiMa, '用于辅助观察移动、迁转与环境变化，不等同一定奔波。'),
            groupStar('桃花／咸池', taoHua, '用于辅助观察社交吸引、审美与人际互动，不单指情感事件。'),
            groupStar('华盖', huaGai, '用于辅助观察独立、精神性、技艺与内向倾向，不可单断孤独。'),
            groupStar('将星', jiangXing, '用于辅助观察组织、承担与统摄主题，不代表固定权位。')
        ];
    };

    const calculateFourLayerRelations = (daYun, liuNian, liuYue, originalZhis) => {
        if (!daYun || !liuNian || !liuYue) return [];
        const relations = [];
        const beforeItems = [...originalZhis, daYun.zhi, liuNian.zhi];
        const afterItems = [...beforeItems, liuYue.zhi];
        const before = new Set(beforeItems);
        const after = new Set(afterItems);
        const addGroup = (group, label, type) => {
            if (!containsAll(after, group.set)) return;
            if (!containsAll(before, group.set)) {
                relations.push({ type, text: `流月【${liuYue.zhi}】加入后补齐${label}【${group.set.join('')}】` });
            } else if (group.set.includes(liuYue.zhi)) {
                relations.push({ type, text: `前三层已有${label}【${group.set.join('')}】，流月【${liuYue.zhi}】再次引动` });
            }
        };
        sanHeGroups.forEach((group) => addGroup(group, `三合${group.wx}局`, 'hehui'));
        sanHuiGroups.forEach((group) => addGroup(group, `三会${group.wx}方`, 'hehui'));
        xingTriads.forEach((group) => addGroup(group, group.name, 'xing'));
        const beforeCount = countMap(beforeItems);
        const afterCount = countMap(afterItems);
        selfXingBranches.forEach((zhi) => {
            if ((afterCount[zhi] || 0) >= 2 && (beforeCount[zhi] || 0) < 2) {
                relations.push({ type: 'xing', text: `流月【${liuYue.zhi}】加入后出现${zhi}${zhi}自刑条件` });
            } else if (liuYue.zhi === zhi && (beforeCount[zhi] || 0) >= 2) {
                relations.push({ type: 'xing', text: `前三层已有${zhi}${zhi}自刑条件，流月【${zhi}】再次引动` });
            }
        });
        return uniqueRelations(relations);
    };

    GuiJia.baziCore = {
        shiShenMap,
        shiShenDesc,
        ganOrder,
        zhiOrder,
        wuXingOrder,
        cangGanMap,
        palaceMap,
        naYinPairs,
        naYinMap,
        changShengStart,
        changShengStages,
        yangGan,
        getWuXing,
        getColorClass,
        getStatusClass,
        getShiShenExplanation,
        getRelationTagClass,
        getNaYin,
        getDiShi,
        getXunInfo,
        chongMap,
        heMap,
        haiMap,
        poMap,
        xingPairMap,
        selfXingBranches,
        xingTriads,
        sanHeGroups,
        sanHuiGroups,
        tianGanHeMap,
        tianGanChongMap,
        baziRelationCodes,
        uniqueRelations,
        countMap,
        containsAll,
        getSanHePair,
        calculateStemRelations,
        calculateBranchRelations,
        calculateInternalChartRelations,
        calculatePillarSignals,
        calculatePairRelations,
        calculateThreeLayerRelations,
        buildMonthSeason,
        buildDayMasterEvidence,
        buildShenSha,
        calculateFourLayerRelations
    };
})(window);
