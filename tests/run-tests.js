#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}
function loadScripts(relativeFiles) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    relativeFiles.forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js',
    'js/question-time.js',
    'js/bazi-core.js',
    'js/bazi-timing.js',
    'js/bazi-transit-analysis.js',
    'js/bazi-literature.js',
    'js/bazi-interpretation.js',
    'js/bazi-detail.js',
    'js/liuyao-time-facts.js',
    'js/liuyao-time-effects.js',
    'js/liuyao-time-assessment.js',
    'js/liuyao-time-evidence.js',
    'js/liuyao-time-relevance.js',
    'js/liuyao-time-output.js',
    'js/liuyao-time-selection.js',
    'js/liuyao-core.js',
    'js/liuyao-interpretation.js',
    'js/liuyao-literature.js'
]);
const bazi = GuiJia.baziCore;
const baziTiming = GuiJia.baziTiming;
const baziTransitAnalysis = GuiJia.baziTransitAnalysis;
const baziLit = GuiJia.baziLiterature;
const baziInterpretation = GuiJia.baziInterpretation;
const baziDetail = GuiJia.baziDetail;
const liuyao = GuiJia.liuyaoCore;
const liuyaoInterpretation = GuiJia.liuyaoInterpretation;
const liuyaoLit = GuiJia.liuyaoLiterature;

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

test('十神 10×10 映射完整', () => {
    GAN.forEach((dayGan) => GAN.forEach((otherGan) => {
        assert(Boolean(bazi.shiShenMap[dayGan]?.[otherGan]), `${dayGan}日见${otherGan}缺十神`);
    }));
});

test('自然语言计数一至十统一使用汉字', () => {
    const formatNaturalCount = GuiJia.common.formatNaturalCount;
    const expected = ['一','两','三','四','五','六','七','八','九','十'];
    expected.forEach((word, index) => assert(formatNaturalCount(index + 1) === word, `${index + 1} 未格式化为 ${word}`));
    assert(formatNaturalCount(11) === '11', '十一以上不应被当前小计数格式器误改');
});

test('六爻占问取用仅在高置信度时推荐，模糊问题保持未自动判断', () => {
    const rows = [
        { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
        { position:2, relation:'妻财', isShi:false, isYing:false, moving:false },
        { position:3, relation:'官鬼', isShi:false, isYing:false, moving:true },
        { position:4, relation:'兄弟', isShi:false, isYing:true, moving:false },
        { position:5, relation:'子孙', isShi:false, isYing:false, moving:false },
        { position:6, relation:'父母', isShi:false, isYing:false, moving:false }
    ];
    const confidentCases = [
        ['这次面试能否通过？', '官鬼'],
        ['这笔款项什么时候到账？', '妻财'],
        ['我的东西丢了还能找到吗？', '妻财'],
        ['这次考试成绩怎么样？', '父母'],
        ['孩子最近的事情顺不顺？', '子孙'],
        ['我朋友会不会来？', '兄弟'],
        ['这个客户会不会答应合作？', '应'],
        ['合作伙伴是不是真心靠谱？', '应'],
        ['我的合伙人靠不靠谱？', '应'],
        ['这次合作方是否可靠？', '应'],
        ['我和男朋友还能复合吗？', '应'],
        ['我和女朋友最近感情怎么样？', '应'],
        ['我和老公感情怎么样？', '官鬼'],
        ['我和妻子婚姻如何？', '妻财']
    ];
    confidentCases.forEach(([question, expected]) => {
        const result = liuyao.suggestUseGod(question, rows, []);
        assert(result.status === 'confident' && result.target === expected && result.recommendedTarget === expected, `${question} 未高置信命中 ${expected}`);
        assert(result.canApplySuggestion === true, `${question} 有候选却未开放采用建议`);
    });

    const dating = liuyao.suggestUseGod('我和男朋友还能复合吗？', rows, []);
    assert(dating.focusId === 'relationship' && dating.reason.includes('世应与财官'), '泛化恋爱问题未进入感情观察重点或缺传统婚占说明');
    ['恋爱','感情','婚姻','结婚','复合','分手','表白','相亲','暧昧','男朋友','女朋友','男友','女友','伴侣'].forEach((term) => {
        const result = liuyao.suggestUseGod(`我想问${term}`, rows, []);
        assert(result.status === 'confident' && result.target === '应' && result.focusId === 'relationship', `感情通用词“${term}”未稳定落到关系观察入口`);
    });
    ['丈夫','老公'].forEach((term) => {
        const result = liuyao.suggestUseGod(`我想问${term}最近怎么样`, rows, []);
        assert(result.status === 'confident' && result.target === '官鬼' && result.focusId === 'relationship', `夫方角色“${term}”未按传统官鬼取用`);
    });
    ['妻子','老婆','媳妇'].forEach((term) => {
        const result = liuyao.suggestUseGod(`我想问${term}最近怎么样`, rows, []);
        assert(result.status === 'confident' && result.target === '妻财' && result.focusId === 'relationship', `妻方角色“${term}”未按传统妻财取用`);
    });
    const husband = liuyao.suggestUseGod('我和老公感情怎么样？', rows, []);
    assert(husband.focusId === 'relationship' && husband.reason.includes('官鬼论夫'), '丈夫角色未按传统官鬼取用说明');
    const wife = liuyao.suggestUseGod('我和妻子婚姻如何？', rows, []);
    assert(wife.focusId === 'relationship' && wife.reason.includes('妻财论妻'), '妻子角色未按传统妻财取用说明');
    const moneyFocus = liuyao.suggestUseGod('老公工资什么时候到账？', rows, []);
    assert(moneyFocus.target === '妻财', '明确财务焦点不应被配偶身份词压过');

    ['合作伙伴','合作方','合伙人','客户','甲方','乙方'].forEach((term) => {
        const result = liuyao.suggestUseGod(`${term}是不是真心靠谱`, rows, []);
        assert(result.status === 'confident' && result.target === '应' && result.recommendedTarget === '应', `外部合作对象“${term}”未高置信落应爻`);
        assert(result.focusId === 'counterparty', `外部合作对象“${term}”虽落应爻，但观察重点未指向“对方／外部对象”：${result.focusId}`);
        assert(result.reason.includes(term), `外部合作对象“${term}”的自动取用理由未使用实际命中词：${result.reason}`);
    });
    const partner = liuyao.suggestUseGod('我的合伙人靠不靠谱？', rows, []);
    assert(partner.matchMeta.ruleId === 'counterparty', `合伙人仍被兄弟规则截获：${partner.matchMeta.ruleId}`);
    const competitor = liuyao.suggestUseGod('竞争对手最近会怎么做？', rows, []);
    assert(competitor.status === 'confident' && competitor.target === '兄弟', '竞争对手不应因外部对象规则改动而失去兄弟取用');
    const broadCooperation = liuyao.suggestUseGod('这次合作能不能顺利？', rows, []);
    assert(['unmatched','ambiguous'].includes(broadCooperation.status), '只有宽泛“合作”不应自动高置信取应爻');

    ['失物','遗失物品','物品遗失','物品丢失','东西丢了','东西丢失','东西不见','寻找物品','找东西'].forEach((term) => {
        const result = liuyao.suggestUseGod(`我想问${term}还能不能找到`, rows, []);
        assert(result.status === 'confident' && result.target === '妻财' && result.recommendedTarget === '妻财', `失物表达“${term}”未高置信落妻财`);
        assert(result.focusId === 'lost-item', `失物表达“${term}”未绑定 lost-item 观察重点：${result.focusId}`);
        assert(result.headline === '观察方向：失物与寻找（高置信）', `失物自动提示仍与普通钱财类别混淆：${result.headline}`);
    });

    ['出行','出门','远行','旅行','旅游','出差','行程','旅途'].forEach((term) => {
        const result = liuyao.suggestUseGod(`明天${term}顺不顺利`, rows, []);
        assert(result.status === 'confident' && result.target === '世' && result.recommendedTarget === '世', `出行表达“${term}”未高置信落世爻`);
        assert(result.focusId === 'travel', `出行表达“${term}”未绑定 travel 观察重点：${result.focusId}`);
        assert(result.headline === '观察方向：出行（高置信）', `出行自动提示仍误写成六亲取用类别：${result.headline}`);
        assert(result.reason.includes('应爻') && result.reason.includes('行程结构'), `出行自动提示缺少应爻辅助观察说明：${result.reason}`);
    });

    const vagueCases = [
        '我今天出去玩能不能玩得开心',
        '明天会怎么样？',
        '这件事情能不能顺利？',
        '我最近状态怎么样？',
        '和某人的关系接下来会怎样？'
    ];
    vagueCases.forEach((question) => {
        const result = liuyao.suggestUseGod(question, rows, []);
        assert(['unmatched','ambiguous'].includes(result.status), `${question} 不应被高置信自动分类：${result.status}`);
        assert(result.target === '暂未自动判断' && result.recommendedTarget === '', `${question} 不应展示确定用神`);
        assert(result.suggestedUseKey === 'line-1', `${question} 未命中时应仅把世爻作为展示起点`);
        assert(result.canApplySuggestion === false, `${question} 未命中时不应显示采用建议`);
    });

    const ambiguous = liuyao.suggestUseGod('父母和孩子最近关系如何？', rows, []);
    assert(ambiguous.status === 'ambiguous' && ambiguous.target === '暂未自动判断', '多方向并列时应保持模糊状态');
    assert(ambiguous.reason.includes('多个可能方向'), '模糊状态缺少多方向说明');

    const focusWins = liuyao.suggestUseGod('朋友介绍的面试，最后能不能录用？', rows, []);
    assert(focusWins.status === 'confident' && focusWins.target === '官鬼', '两个官鬼强词应明显压过朋友身份词');

    const empty = liuyao.suggestUseGod('', rows, []);
    assert(empty.status === 'empty' && empty.target === '暂未自动判断' && empty.reason.includes('暂不自动推荐用神'), '空白占问提示不完整');
});


test('六爻自然语言固定回归集覆盖典型事业、感情、学业、出行、失物、子女与纠纷问法', () => {
    const rows = [
        { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
        { position:2, relation:'妻财', isShi:false, isYing:false, moving:false },
        { position:3, relation:'官鬼', isShi:false, isYing:false, moving:true },
        { position:4, relation:'兄弟', isShi:false, isYing:true, moving:false },
        { position:5, relation:'子孙', isShi:false, isYing:false, moving:false },
        { position:6, relation:'父母', isShi:false, isYing:false, moving:false }
    ];
    const cases = [
        ['这次面试能不能通过', 'confident', '官鬼'],
        ['今年有没有机会升职加薪', 'confident', '官鬼'],
        ['跳槽去那家新公司好不好', 'confident', '官鬼'],
        ['创业开这个店能不能赚钱', 'confident', '妻财'],
        ['这笔投资能不能回本', 'confident', '妻财'],
        ['合作伙伴是不是真心靠谱', 'confident', '应', 'counterparty'],
        ['能不能拿下这个客户', 'confident', '应', 'counterparty'],
        ['年终奖金会有多少', 'confident', '妻财'],
        ['他心里还有没有我', 'unmatched', ''],
        ['这次相亲能不能成', 'confident', '应', 'relationship'],
        ['我们会不会分手', 'confident', '应', 'relationship'],
        ['什么时候能遇到正缘', 'confident', '应', 'relationship'],
        ['对方是不是真心想结婚', 'confident', '应', 'relationship'],
        ['冷战之后他会不会主动联系我', 'unmatched', ''],
        ['这段关系还有没有挽回余地', 'unmatched', ''],
        ['她对我到底是什么态度', 'unmatched', ''],
        ['这次考试能不能及格', 'confident', '父母'],
        ['考研能不能上岸', 'confident', '父母'],
        ['论文能不能顺利通过', 'confident', '父母'],
        ['志愿填哪所学校更好', 'confident', '父母'],
        ['出国留学申请会不会顺利', 'confident', '父母'],
        ['面试能排第几名', 'confident', '官鬼'],
        ['明天出行路上安不安全', 'confident', '世', 'travel'],
        ['这趟出差顺不顺利', 'confident', '世', 'travel'],
        ['车子在路上会不会出毛病', 'unmatched', ''],
        ['旅游目的地天气好不好', 'unmatched', ''],
        ['坐这趟航班会不会延误', 'confident', '世', 'travel'],
        ['手机丢在哪里了还能找到吗', 'confident', '妻财', 'lost-item'],
        ['宠物走丢了能不能自己回来', 'confident', '子孙'],
        ['肚子里是男孩还是女孩', 'confident', '子孙'],
        ['孩子这次生病几时能好', 'confident', '子孙'],
        ['小孩适不适合去那所学校', 'confident', '子孙'],
        ['这个官司有没有胜算', 'confident', '官鬼'],
        ['仲裁能不能顺利解决', 'confident', '官鬼'],
        ['对方会不会主动和解', 'confident', '应', 'counterparty'],
        ['会不会被对方反咬一口', 'confident', '应', 'counterparty']
    ];
    cases.forEach(([question, expectedStatus, expectedTarget, expectedFocusId = '']) => {
        const result = liuyao.suggestUseGod(question, rows, []);
        assert(result.status === expectedStatus, `${question} 状态异常：${result.status}，预期 ${expectedStatus}`);
        if (expectedStatus === 'confident') {
            assert(result.recommendedTarget === expectedTarget, `${question} 取用异常：${result.recommendedTarget}，预期 ${expectedTarget}`);
            if (expectedFocusId) assert(result.focusId === expectedFocusId, `${question} 观察重点异常：${result.focusId}，预期 ${expectedFocusId}`);
        } else {
            assert(result.recommendedTarget === '' && result.target === '暂未自动判断', `${question} 未命中时不应给出确定取用`);
        }
    });
    const relationshipVsCounterparty = liuyao.suggestUseGod('对方是不是真心想结婚', rows, []);
    assert(relationshipVsCounterparty.matchMeta.ruleId === 'relationship', '同为应爻的感情与外部对象规则并列时，应优先保留更具体的感情观察重点');
    const weatherTravel = liuyao.suggestUseGod('旅游目的地天气好不好', rows, []);
    assert(weatherTravel.status === 'unmatched', '天气焦点不应被“旅游/目的地”误判为出行取用');
    const lostPhone = liuyao.suggestUseGod('手机丢在哪里了还能找到吗', rows, []);
    assert(lostPhone.reason.includes('物品遗失') && !lostPhone.reason.includes('失物句式'), '动态失物句式不应向用户暴露内部匹配标签');
    const lostPet = liuyao.suggestUseGod('宠物走丢了能不能自己回来', rows, []);
    assert(lostPet.recommendedTarget === '子孙' && lostPet.focusId !== 'lost-item', '宠物走丢不应被通用失物句式误判为妻财');
});

test('六爻观察重点以有限普通语言类别映射到世应与六亲，不要求用户先懂用神', () => {
    const options = liuyao.USE_GOD_FOCUS_OPTIONS;
    assert(Array.isArray(options) && options.length === 10, `观察重点类别数量异常：${options?.length}`);
    assert(new Set(options.map((item) => item.id)).size === options.length, '观察重点 id 存在重复');
    assert(options.filter((item) => item.target === '应').length === 2, '感情关系与一般外部对象应分别提供入口但共同落应爻');
    ['世','应','父母','子孙','妻财','官鬼','兄弟'].forEach((target) => {
        assert(options.some((item) => item.target === target), `观察重点缺 ${target}`);
    });

    const relationshipOption = options.find((item) => item.id === 'relationship');
    assert(relationshipOption?.target === '应' && relationshipOption.label.includes('感情'), '感情、恋爱与婚姻观察重点未映射到世应关系入口');
    const travelOption = options.find((item) => item.id === 'travel');
    assert(travelOption?.target === '世' && travelOption.label.includes('出行'), '出行、旅行与行程观察重点未映射到世爻');
    assert(travelOption.description.includes('应爻') && travelOption.description.includes('行程结构'), '出行观察重点缺少应爻与行程结构辅助说明');
    const lostItemOption = options.find((item) => item.id === 'lost-item');
    assert(lostItemOption?.target === '妻财' && lostItemOption.label === '失物与寻找', '失物与寻找观察重点未独立映射到妻财');
    assert(options.filter((item) => item.target === '妻财').length === 2, '失物与钱财应提供两个独立入口但共同落妻财');

    const rows = [
        { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
        { position:2, relation:'子孙', isShi:false, isYing:false, moving:false },
        { position:3, relation:'妻财', isShi:false, isYing:false, moving:false },
        { position:4, relation:'官鬼', isShi:false, isYing:true, moving:false },
        { position:5, relation:'子孙', isShi:false, isYing:false, moving:true },
        { position:6, relation:'兄弟', isShi:false, isYing:false, moving:false }
    ];
    const hidden = [{ position:3, candidate:true, hiddenRelation:'妻财' }];
    const self = liuyao.resolveUseGodFocus('世', rows, hidden);
    const other = liuyao.resolveUseGodFocus('应', rows, hidden);
    const children = liuyao.resolveUseGodFocus('子孙', rows, hidden);
    assert(self.suggestedUseKey === 'line-1' && self.count === 1, '自身状态未映射世爻');
    assert(other.suggestedUseKey === 'line-4' && other.count === 1, '对方/外部对象未映射应爻');
    assert(children.count === 2 && children.candidates[0] === 'line-5', '同类多现时未保留全部候选或未优先发动爻');

    const noWealthVisible = rows.map((line) => line.position === 3 ? { ...line, relation:'父母' } : line);
    const wealthHidden = liuyao.resolveUseGodFocus('妻财', noWealthVisible, hidden);
    assert(wealthHidden.suggestedUseKey === 'hidden-3', '明爻未见时未回落伏神候选');
    const missing = liuyao.resolveUseGodFocus('妻财', noWealthVisible, []);
    assert(!missing.available && missing.count === 0 && missing.suggestedUseKey === '', '无候选时不应伪造具体用神');
});

test('六爻观察重点 UI 以普通语言为主，专业具体爻选择下沉为可展开项', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const overviewStart = html.indexOf('v-if="liuyaoResultView === \'overview\'"');
    const detailStart = html.indexOf('v-if="liuyaoResultView === \'detail\'"', overviewStart);
    const overview = html.slice(overviewStart, detailStart);
    assert(overview.includes('<h2 class="panel-title">观察重点</h2>'), '六爻总览仍以“用神选择”作为普通用户主标题');
    assert(overview.includes('你主要想观察什么？') && overview.includes('use-god-focus-option-grid'), '普通语言观察重点选择器缺失');
    assert(overview.includes('手动选择具体爻（熟悉六爻时）') && overview.includes('@change="onManualUseGodChange"'), '专业具体爻选择未下沉到可展开项');
    assert(!overview.includes('<h2 class="panel-title">用神选择</h2>'), '旧“用神选择”主标题仍存在');
    assert(app.includes('selectUseGodFocus') && app.includes('resolveUseGodFocus') && app.includes('useGodSelection'), '观察重点选择状态未接入应用编排');
});

test('十二支藏干全部存在且层级合法', () => {
    const allowed = new Set(['本气','中气','余气']);
    ZHI.forEach((zhi) => {
        const items = bazi.cangGanMap[zhi];
        assert(Array.isArray(items) && items.length >= 1, `${zhi}缺藏干`);
        items.forEach(([gan, level]) => {
            assert(GAN.includes(gan), `${zhi}藏干${gan}非法`);
            assert(allowed.has(level), `${zhi}藏干层级${level}非法`);
        });
    });
});

test('六十甲子旬空查询无缺项', () => {
    for (let i = 0; i < 60; i += 1) {
        const ganZhi = GAN[i % 10] + ZHI[i % 12];
        const info = bazi.getXunInfo(ganZhi);
        assert(info.xun !== '—' && info.xunKong !== '—', `${ganZhi}旬空缺失`);
    }
});

test('八字原局关键结构带稳定 code', () => {
    const relations = bazi.calculateInternalChartRelations(
        ['丁','壬','丁','己'],
        ['丑','子','亥','酉']
    );
    const codes = new Set(relations.map((item) => item.code));
    assert(codes.has('SAN_HUI_COMPLETE'), '亥子丑三会未产生 SAN_HUI_COMPLETE');
    relations.forEach((item) => assert(typeof item.code === 'string' && item.code.length > 0, `关系缺 code：${item.text}`));
});


test('八字典型地支结构回归：子午冲、辰辰自刑、申子辰三合、亥子丑三会', () => {
    const cases = [
        { name:'子午冲', zhis:['子','午','酉','亥'], code:'BRANCH_SIX_CLASH' },
        { name:'辰辰自刑', zhis:['辰','辰','酉','亥'], code:'SELF_PUNISHMENT' },
        { name:'申子辰三合水局', zhis:['申','子','辰','午'], code:'SAN_HE_COMPLETE' },
        { name:'亥子丑三会水方', zhis:['亥','子','丑','酉'], code:'SAN_HUI_COMPLETE' }
    ];
    cases.forEach(({ name, zhis, code }) => {
        const relations = bazi.calculateInternalChartRelations(['甲','乙','丙','丁'], zhis);
        assert(relations.some((item) => item.code === code), `${name} 未产生 ${code}`);
    });
});

test('八字文献 matcher 依据 code 命中会局，不依赖展示文案', () => {
    const originalRelations = bazi.calculateInternalChartRelations(
        ['丁','壬','丁','己'],
        ['丑','子','亥','酉']
    );
    const mutatedTextRelations = originalRelations.map((item) => ({ ...item, text: `显示文案已替换-${item.code}` }));
    const pillars = [
        { title:'年柱', zhi:'丑', cangGan: bazi.cangGanMap['丑'].map(([gan,level]) => ({gan,level,wuxing:bazi.getWuXing(gan),shishen:bazi.shiShenMap['丁'][gan]})) },
        { title:'月柱', zhi:'子', cangGan: bazi.cangGanMap['子'].map(([gan,level]) => ({gan,level,wuxing:bazi.getWuXing(gan),shishen:bazi.shiShenMap['丁'][gan]})) },
        { title:'日柱', zhi:'亥', cangGan: bazi.cangGanMap['亥'].map(([gan,level]) => ({gan,level,wuxing:bazi.getWuXing(gan),shishen:bazi.shiShenMap['丁'][gan]})) },
        { title:'时柱', zhi:'酉', cangGan: bazi.cangGanMap['酉'].map(([gan,level]) => ({gan,level,wuxing:bazi.getWuXing(gan),shishen:bazi.shiShenMap['丁'][gan]})) }
    ];
    const monthSeason = bazi.buildMonthSeason('子', '火');
    const entries = baziLit.buildMatchedLiterature('丁', ['丁','壬','丁','己'], ['丑','子','亥','酉'], pillars, mutatedTextRelations, monthSeason);
    assert(entries.some((item) => item.id === 'ziping-hui-change'), '修改 relation.text 后会局文献匹配失效');
});


test('已知卦例回归：乾坤卦序、八宫世应与乾卦纳甲', () => {
    const qianLines = [true,true,true,true,true,true];
    const kunLines = [false,false,false,false,false,false];
    const qian = liuyao.getHexagram(qianLines);
    const kun = liuyao.getHexagram(kunLines);
    assert(qian.name === '乾' && qian.number === 1, `全阳应为乾1，实际 ${qian.name}${qian.number}`);
    assert(kun.name === '坤' && kun.number === 2, `全阴应为坤2，实际 ${kun.name}${kun.number}`);

    const qianPalace = liuyao.liuyaoPalaceMap[liuyao.lineKey(qianLines)];
    const kunPalace = liuyao.liuyaoPalaceMap[liuyao.lineKey(kunLines)];
    assert(qianPalace?.palace === '乾' && qianPalace.stage === '本宫六世' && qianPalace.shi === 6 && qianPalace.ying === 3,
        `乾为天八宫世应异常：${JSON.stringify(qianPalace)}`);
    assert(kunPalace?.palace === '坤' && kunPalace.stage === '本宫六世' && kunPalace.shi === 6 && kunPalace.ying === 3,
        `坤为地八宫世应异常：${JSON.stringify(kunPalace)}`);

    const qianNaJia = liuyao.naJiaForLines(qianLines).map((item) => item.stem + item.branch);
    assert(JSON.stringify(qianNaJia) === JSON.stringify(['甲子','甲寅','甲辰','壬午','壬申','壬戌']),
        `乾卦纳甲回归异常：${qianNaJia.join('、')}`);
});

test('64 种阴阳组合映射为 64 个唯一卦且卦序完整', () => {
    const names = new Set();
    const numbers = new Set();
    for (let mask = 0; mask < 64; mask += 1) {
        const lines = Array.from({ length: 6 }, (_, i) => Boolean(mask & (1 << i)));
        const hex = liuyao.getHexagram(lines);
        assert(hex && hex.name, `mask=${mask} 无卦名`);
        names.add(hex.name);
        numbers.add(hex.number);
    }
    assert(names.size === 64, `唯一卦名仅 ${names.size}`);
    assert(numbers.size === 64 && Math.min(...numbers) === 1 && Math.max(...numbers) === 64, '卦序不完整');
});

test('八宫映射覆盖全部 64 卦键', () => {
    assert(Object.keys(liuyao.liuyaoPalaceMap).length === 64, `八宫映射仅 ${Object.keys(liuyao.liuyaoPalaceMap).length}`);
    for (let mask = 0; mask < 64; mask += 1) {
        const lines = Array.from({ length: 6 }, (_, i) => Boolean(mask & (1 << i)));
        assert(liuyao.liuyaoPalaceMap[liuyao.lineKey(lines)], `mask=${mask} 缺八宫映射`);
    }
});

test('每卦纳甲始终输出完整六爻', () => {
    for (let mask = 0; mask < 64; mask += 1) {
        const lines = Array.from({ length: 6 }, (_, i) => Boolean(mask & (1 << i)));
        const najia = liuyao.naJiaForLines(lines);
        assert(najia.length === 6, `mask=${mask} 纳甲不是六爻`);
        najia.forEach((item) => assert(item.stem && item.branch && item.element, `mask=${mask} 纳甲字段缺失`));
    }
});

test('十日干六神起例均输出六神且无重复', () => {
    GAN.forEach((gan) => {
        const spirits = liuyao.sixSpirits(gan);
        assert(spirits.length === 6, `${gan}日六神数量错误`);
        assert(new Set(spirits).size === 6, `${gan}日六神重复`);
    });
});

test('动变三合待支保存 missingBranch，不再依赖文字反解析', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'子', element:'水' },
        { position:2, label:'二爻', moving:false, branch:'卯', element:'木' },
        { position:3, label:'三爻', moving:true, branch:'辰', element:'土' },
        { position:4, label:'四爻', moving:false, branch:'午', element:'火' },
        { position:5, label:'五爻', moving:false, branch:'酉', element:'金' },
        { position:6, label:'上爻', moving:false, branch:'亥', element:'水' }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    assert(sanHe.pendingDetails.length >= 1, '未生成待支详情');
    const water = sanHe.pendingDetails.find((item) => item.element === '水');
    assert(water?.missingBranch === '申', `子辰待支应为申，实际 ${water?.missingBranch}`);
    assert(water?.formationMode === 'ACTIVE_PAIR_PENDING', `待补三合 formationMode 异常：${water?.formationMode}`);
    assert(water?.positions?.join(',') === '1,3', `待补三合爻位来源异常：${JSON.stringify(water?.positions)}`);
});



test('六爻世应结构输出稳定机器码与成员来源', () => {
    const rows = [
        { position:1, label:'初爻', relation:'兄弟', branch:'巳', element:'火', moving:true, isShi:true, isYing:false, statusTags:[{code:'VOID',text:'旬空',type:'void'}] },
        { position:4, label:'四爻', relation:'官鬼', branch:'亥', element:'水', moving:false, isShi:false, isYing:true, statusTags:[] }
    ];
    const summary = liuyao.buildShiYingSummary(rows);
    const codes = new Set(summary.tags.map((item) => item.code));
    assert(codes.has('YING_CONTROLS_SHI'), `世应五行关系缺机器码：${JSON.stringify(summary.tags)}`);
    assert(codes.has('SHI_YING_SIX_CLASH'), '巳亥世应六冲未产生 SHI_YING_SIX_CLASH');
    assert(codes.has('SHI_MOVING'), '世爻发动未产生 SHI_MOVING');
    assert(codes.has('SHI_VOID'), '世爻旬空未产生 SHI_VOID');
    assert(summary.facts.every((item) => item.code && item.family === 'shi-ying'), '世应 facts 缺稳定 code/family');
    assert(summary.shi?.position === 1 && summary.ying?.position === 4, '世应成员来源未保存爻位');
});

test('六爻内卦初三爻动变三合保存 complete code 与原爻/变爻成员来源', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'卯', element:'木', changedBranch:'未', changedElement:'土' },
        { position:2, label:'二爻', moving:false, branch:'丑', element:'土' },
        { position:3, label:'三爻', moving:true, branch:'亥', element:'水', changedBranch:'卯', changedElement:'木' }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    const wood = sanHe.completeDetails.find((item) => item.element === '木');
    assert(wood?.code === 'MOVING_SAN_HE_COMPLETE', `完整动变三合缺机器码：${JSON.stringify(wood)}`);
    assert(JSON.stringify(wood.groupBranches) === JSON.stringify(['亥','卯','未']), '完整三合 groupBranches 错误');
    assert(wood?.formationMode === 'INNER_FIRST_THIRD_CHANGE', `内卦动变成局未标记专用 formationMode：${wood?.formationMode}`);
    const hai = wood.members.find((item) => item.branch === '亥');
    const mao = wood.members.find((item) => item.branch === '卯');
    const wei = wood.members.find((item) => item.branch === '未');
    assert(hai?.sources.some((item) => item.position === 3 && item.source === 'original'), '亥来源未记录为三爻本爻');
    assert(mao?.sources.some((item) => item.position === 1 && item.source === 'original'), '卯来源未记录为初爻本爻');
    assert(wei?.sources.some((item) => item.position === 1 && item.source === 'changed'), '未来源未记录为初爻变爻');
});

test('六爻本卦三合仅在三支齐见且至少两支发动时成立', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'申', element:'金', statusTags:[] },
        { position:2, label:'二爻', moving:true, branch:'子', element:'水', statusTags:[] },
        { position:3, label:'三爻', moving:false, branch:'辰', element:'土', statusTags:[] },
        { position:4, label:'四爻', moving:false, branch:'午', element:'火', statusTags:[] },
        { position:5, label:'五爻', moving:false, branch:'酉', element:'金', statusTags:[] },
        { position:6, label:'上爻', moving:false, branch:'亥', element:'水', statusTags:[] }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    const water = sanHe.completeDetails.find((item) => item.element === '水');
    assert(water?.formationMode === 'ORIGINAL_BRANCHES', `两动一静本卦三合未成立：${JSON.stringify(sanHe)}`);

    const oneMoving = rows.map((item) => ({ ...item, moving:item.position === 1 }));
    const oneMovingSanHe = liuyao.buildMovingSanHe(oneMoving);
    assert(!oneMovingSanHe.completeDetails.some((item) => item.element === '水'), '仅一支发动时不应把三支静态齐见直接判为三合成局');
});

test('六爻一明动一暗动可共同计入三合活跃支', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'申', element:'金', statusTags:[] },
        { position:2, label:'二爻', moving:false, branch:'子', element:'水', statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}] },
        { position:3, label:'三爻', moving:false, branch:'辰', element:'土', statusTags:[] }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    assert(sanHe.completeDetails.some((item) => item.element === '水'), `明动+暗动+静支未形成三合：${JSON.stringify(sanHe)}`);
});

test('《增删卜易》内外卦动变例可分别形成木局与金局', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'卯', element:'木', changedBranch:'未', changedElement:'土', statusTags:[] },
        { position:2, label:'二爻', moving:false, branch:'丑', element:'土', statusTags:[] },
        { position:3, label:'三爻', moving:true, branch:'亥', element:'水', changedBranch:'卯', changedElement:'木', statusTags:[] },
        { position:4, label:'四爻', moving:true, branch:'酉', element:'金', changedBranch:'丑', changedElement:'土', statusTags:[] },
        { position:5, label:'五爻', moving:false, branch:'未', element:'土', statusTags:[] },
        { position:6, label:'上爻', moving:true, branch:'巳', element:'火', changedBranch:'酉', changedElement:'金', statusTags:[] }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    const wood = sanHe.completeDetails.find((item) => item.element === '木');
    const metal = sanHe.completeDetails.find((item) => item.element === '金');
    assert(wood?.formationMode === 'INNER_FIRST_THIRD_CHANGE', `内卦木局未按初三爻动变识别：${JSON.stringify(wood)}`);
    assert(metal?.formationMode === 'OUTER_FOURTH_SIXTH_CHANGE', `外卦金局未按四六爻动变识别：${JSON.stringify(metal)}`);
});

test('泰变否六爻全动不得把十二支全局拼接成四个完整三合局', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'子', element:'水', changedBranch:'未', changedElement:'土', statusTags:[] },
        { position:2, label:'二爻', moving:true, branch:'寅', element:'木', changedBranch:'巳', changedElement:'火', statusTags:[] },
        { position:3, label:'三爻', moving:true, branch:'辰', element:'土', changedBranch:'卯', changedElement:'木', statusTags:[] },
        { position:4, label:'四爻', moving:true, branch:'丑', element:'土', changedBranch:'午', changedElement:'火', statusTags:[] },
        { position:5, label:'五爻', moving:true, branch:'亥', element:'水', changedBranch:'申', changedElement:'金', statusTags:[] },
        { position:6, label:'上爻', moving:true, branch:'酉', element:'金', changedBranch:'戌', changedElement:'土', statusTags:[] }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    assert(sanHe.completeDetails.length === 0, `泰变否被过度识别为完整三合：${JSON.stringify(sanHe.complete)}`);
    const pendingElements = new Set(sanHe.pendingDetails.map((item) => item.element));
    assert(pendingElements.has('水') && pendingElements.has('金'), `泰变否应保留子辰待申、丑酉待巳：${JSON.stringify(sanHe.pending)}`);
    assert(!pendingElements.has('木') && !pendingElements.has('火'), `泰变否不应把仅由跨层拼接得到的木火两局列为待补：${JSON.stringify(sanHe.pending)}`);
});

test('六爻反吟伏吟输出稳定机器事实', () => {
    const rows = [
        { position:1, label:'初爻', moving:true, branch:'子', changedBranch:'午' },
        { position:2, label:'二爻', moving:true, branch:'丑', changedBranch:'未' },
        { position:3, label:'三爻', moving:true, branch:'寅', changedBranch:'申' },
        { position:4, label:'四爻', moving:false, branch:'卯', changedBranch:'卯' },
        { position:5, label:'五爻', moving:false, branch:'辰', changedBranch:'辰' },
        { position:6, label:'上爻', moving:false, branch:'巳', changedBranch:'巳' }
    ];
    const facts = liuyao.buildFanFuFacts(rows);
    const inner = facts.find((item) => item.code === 'INNER_FAN_YIN');
    assert(inner?.text === '内卦反吟', `内卦反吟机器事实错误：${JSON.stringify(facts)}`);
    assert(inner.members.length === 3 && inner.members.every((item) => item.scope === 'inner'), '内卦反吟成员范围未保存');
    assert(liuyao.buildFanFuSummary(rows).includes('内卦反吟'), '兼容展示文本发生变化');
});

test('六爻解释层按世应 code 判断，不依赖中文标签文本', () => {
    const target = { position:6,label:'上爻',relation:'兄弟',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻' };
    const ying = { position:3,label:'三爻',relation:'官鬼',branch:'亥',element:'水',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true };
    const rows = [ying, target];
    const result = {
        lines:rows,
        fullStructure:{
            originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'非六冲六合卦 → 非六冲六合卦',
            shiYing:{text:'世应测试。',tags:[
                {code:'YING_CONTROLS_SHI',text:'显示文案已替换-A',type:'neutral'},
                {code:'SHI_YING_SIX_CLASH',text:'显示文案已替换-B',type:'trigger'}
            ]},
            sanHe:{complete:[],pending:[]},fanFu:[]
        }
    };
    const use = liuyao.buildUseGodAnalysis(target, result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, use, []);
    const relations = output.judgments.find((item) => item.id === 'use-relations');
    assert(relations?.summary.includes('与用神六冲') && relations?.summary.includes('克用神'), `世应关系仍依赖中文标签文本：${relations?.summary}`);
});

test('六爻 4096 种掷币组合的结构事实均带稳定 code', () => {
    const rawOptions = [6,7,8,9];
    let checked = 0;
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        let cursor = encoded;
        const rawValues = [];
        for (let i = 0; i < 6; i += 1) {
            rawValues.push(rawOptions[cursor % 4]);
            cursor = Math.floor(cursor / 4);
        }
        const originalLines = rawValues.map((value) => value === 7 || value === 9);
        const moving = rawValues.map((value) => value === 6 || value === 9);
        const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
        const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
        const originalNaJia = liuyao.naJiaForLines(originalLines);
        const changedNaJia = liuyao.naJiaForLines(changedLines);
        const rows = rawValues.map((value, index) => ({
            position:index + 1,
            label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
            relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),
            branch:originalNaJia[index].branch,
            element:originalNaJia[index].element,
            moving:moving[index],
            changedBranch:changedNaJia[index].branch,
            changedElement:changedNaJia[index].element,
            isShi:palace.shi === index + 1,
            isYing:palace.ying === index + 1,
            statusTags:[]
        }));
        const full = liuyao.buildFullHexagramStructure(rows, originalNaJia, changedNaJia);
        assert(full.shiYing.tags.every((item) => typeof item.code === 'string' && item.code), `encoded=${encoded} 世应 tag 缺 code`);
        assert((full.shiYing.facts || []).every((item) => typeof item.code === 'string' && item.code), `encoded=${encoded} 世应 fact 缺 code`);
        assert((full.sanHe.completeDetails || []).every((item) => item.code === 'MOVING_SAN_HE_COMPLETE'), `encoded=${encoded} 完整三合 code 异常`);
        assert((full.sanHe.pendingDetails || []).every((item) => item.code === 'MOVING_SAN_HE_PENDING'), `encoded=${encoded} 待补三合 code 异常`);
        assert((full.fanFuDetails || []).every((item) => typeof item.code === 'string' && item.code), `encoded=${encoded} 反伏 fact 缺 code`);
        assert((full.facts || []).every((item) => typeof item.code === 'string' && item.code), `encoded=${encoded} full facts 缺 code`);
        checked += 1;
    }
    assert(checked === 4096, `结构事实压力测试仅检查 ${checked} 组`);
});

test('六爻 4096 卦 × 十类观察重点映射压力测试', () => {
    const rawOptions = [6,7,8,9];
    let checks = 0;
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        let cursor = encoded;
        const rawValues = [];
        for (let i = 0; i < 6; i += 1) {
            rawValues.push(rawOptions[cursor % 4]);
            cursor = Math.floor(cursor / 4);
        }
        const originalLines = rawValues.map((value) => value === 7 || value === 9);
        const moving = rawValues.map((value) => value === 6 || value === 9);
        const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
        const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
        const originalNaJia = liuyao.naJiaForLines(originalLines);
        const changedNaJia = liuyao.naJiaForLines(changedLines);
        const rows = rawValues.map((value, index) => ({
            position:index + 1,
            label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
            relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),
            stem:originalNaJia[index].stem, branch:originalNaJia[index].branch, element:originalNaJia[index].element, naJia:originalNaJia[index].text,
            moving:moving[index],
            changedRelation:liuyao.sixRelation(changedNaJia[index].element, palace.element),
            changedBranch:changedNaJia[index].branch, changedElement:changedNaJia[index].element,
            statusTags:[], moveTags:[], isShi:palace.shi === index + 1, isYing:palace.ying === index + 1
        }));
        const flyingHidden = liuyao.buildFlyingHidden(rows, palace, '申', '子', '午未');
        const choiceKeys = new Set(liuyao.buildUseGodChoices(rows, flyingHidden).map((item) => item.key));
        liuyao.USE_GOD_FOCUS_OPTIONS.forEach((option) => {
            const resolution = liuyao.resolveUseGodFocus(option.target, rows, flyingHidden);
            assert(resolution.count === resolution.candidates.length, `encoded=${encoded} ${option.id} 候选数量不一致`);
            assert(resolution.available === (resolution.count > 0), `encoded=${encoded} ${option.id} available 状态错误`);
            if (resolution.available) {
                assert(resolution.suggestedUseKey === resolution.candidates[0], `encoded=${encoded} ${option.id} 主候选不是首项`);
                resolution.candidates.forEach((key) => {
                    assert(choiceKeys.has(key), `encoded=${encoded} ${option.id} 返回不可选 key：${key}`);
                    if (key.startsWith('line-')) {
                        const position = Number(key.split('-')[1]);
                        const line = rows.find((item) => item.position === position);
                        if (option.target === '世') assert(line?.isShi, `encoded=${encoded} 自身状态未落世爻：${key}`);
                        else if (option.target === '应') assert(line?.isYing, `encoded=${encoded} 对方观察未落应爻：${key}`);
                        else assert(line?.relation === option.target, `encoded=${encoded} ${option.target} 错映射到 ${line?.relation}`);
                    } else {
                        const position = Number(key.split('-')[1]);
                        const hidden = flyingHidden.find((item) => item.position === position && item.candidate);
                        assert(hidden?.hiddenRelation === option.target, `encoded=${encoded} ${option.target} 错映射伏神 ${hidden?.hiddenRelation || '缺失'}`);
                    }
                });
            } else {
                assert(resolution.suggestedUseKey === '', `encoded=${encoded} ${option.id} 无候选却生成主 key`);
            }
            checks += 1;
        });
    }
    assert(checks === 40960, `观察重点压力测试数量异常：${checks}`);
});

test('六爻伏神候选同时检查明爻与变爻是否已经出现同类六亲', () => {
    const rawValues = [7,6,6,6,6,6];
    const originalLines = rawValues.map((value) => value === 7 || value === 9);
    const moving = rawValues.map((value) => value === 6 || value === 9);
    const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
    const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
    const originalNaJia = liuyao.naJiaForLines(originalLines);
    const changedNaJia = liuyao.naJiaForLines(changedLines);
    const rows = rawValues.map((value, index) => ({
        position:index + 1,
        label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
        relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),
        stem:originalNaJia[index].stem,
        branch:originalNaJia[index].branch,
        element:originalNaJia[index].element,
        naJia:originalNaJia[index].text,
        moving:moving[index],
        changedRelation:liuyao.sixRelation(changedNaJia[index].element, palace.element),
        changedBranch:changedNaJia[index].branch,
        changedElement:changedNaJia[index].element,
        statusTags:[], moveTags:[]
    }));
    const flyingHidden = liuyao.buildFlyingHidden(rows, palace, '申', '子', '午未');
    const parentHidden = flyingHidden.find((item) => item.position === 2 && item.hiddenRelation === '父母');
    assert(parentHidden, '未生成二爻父母伏神测试项');
    assert(parentHidden.presence.visiblePresent === false, '测试向量中父母不应明现');
    assert(parentHidden.presence.changedPresent === true, '测试向量中父母应只在变爻出现');
    assert(parentHidden.candidate === false && parentHidden.candidateCode === 'HIDDEN_RELATION_CHANGED', `仅变现时仍误列伏神候选：${JSON.stringify(parentHidden)}`);
    assert(!liuyao.buildUseGodChoices(rows, flyingHidden).some((item) => item.key === 'hidden-2'), '仅变现的六亲仍进入伏神用神候选');
});

test('六爻仅伏神时保留明确伏神候选及三层出现状态', () => {
    const rawValues = [8,6,7,6,6,6];
    const originalLines = rawValues.map((value) => value === 7 || value === 9);
    const moving = rawValues.map((value) => value === 6 || value === 9);
    const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
    const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
    const originalNaJia = liuyao.naJiaForLines(originalLines);
    const changedNaJia = liuyao.naJiaForLines(changedLines);
    const rows = rawValues.map((value, index) => ({
        position:index + 1,
        label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
        relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),
        stem:originalNaJia[index].stem,
        branch:originalNaJia[index].branch,
        element:originalNaJia[index].element,
        naJia:originalNaJia[index].text,
        moving:moving[index],
        changedRelation:liuyao.sixRelation(changedNaJia[index].element, palace.element),
        changedBranch:changedNaJia[index].branch,
        changedElement:changedNaJia[index].element,
        statusTags:[], moveTags:[]
    }));
    const flyingHidden = liuyao.buildFlyingHidden(rows, palace, '申', '子', '午未');
    const wifeHidden = flyingHidden.find((item) => item.position === 2 && item.hiddenRelation === '妻财');
    assert(wifeHidden?.candidate === true && wifeHidden.candidateCode === 'HIDDEN_PRIMARY_CANDIDATE', `仅伏神测试未成为候选：${JSON.stringify(wifeHidden)}`);
    assert(wifeHidden.presence.visiblePresent === false && wifeHidden.presence.changedPresent === false, '仅伏神测试仍检测到明现或变现');
    const hiddenChoice = liuyao.buildUseGodChoices(rows, flyingHidden).find((item) => item.key === 'hidden-2');
    assert(hiddenChoice?.relation === '妻财', '仅伏神六亲没有进入可选用神');
    const result = { lines:rows, flyingHidden };
    const analysis = liuyao.buildUseGodAnalysis(hiddenChoice, result);
    const presence = analysis.relationPresence['妻财'];
    assert(presence.visible.length === 0 && presence.changed.length === 0 && presence.hiddenCandidates.length >= 1, '用神三层出现状态没有保留“仅伏神”');
});


test('伏神作为当前用神时使用独立形态、完整日月关系、飞伏主线与应期分流', () => {
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'子',element:'水',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false},
        {position:2,label:'二爻',relation:'兄弟',branch:'寅',element:'木',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'妻财',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'妻财',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:5,label:'五爻',relation:'子孙',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'兄弟',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const hiddenStatus = liuyao.buildLiuYaoLineStatus({branch:'酉',element:'金'}, '申', '辰', '子丑', false).tags;
    const flyingHidden = [{
        position:3,label:'三爻',flyRelation:'妻财',flyBranch:'辰',flyElement:'土',
        hiddenRelation:'官鬼',hiddenBranch:'酉',hiddenElement:'金',candidate:true,candidateCode:'HIDDEN_PRIMARY_CANDIDATE',
        candidateText:'明爻与变爻均未见，可作伏神候选',relationText:'飞来生伏',statusTags:hiddenStatus,
        presence:{visiblePresent:false,changedPresent:false,hiddenPresent:true,candidate:true}
    }];
    const target = liuyao.buildUseGodChoices(rows, flyingHidden).find((item) => item.key === 'hidden-3');
    const result = {
        monthZhi:'申',dayZhi:'辰',xunKong:'子丑',dayXun:'甲寅',castTimestamp:'2026-08-10T12:40:00+09:00',daySect:2,
        lines:rows,displayLines:[...rows].reverse(),flyingHidden,
        fullStructure:{originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'非六冲六合卦 → 非六冲六合卦',shiYing:{text:'世爻为初爻父母子水；应爻为四爻妻财未土。',tags:[]},sanHe:{complete:[],pending:[],pendingDetails:[]},fanFu:[]}
    };
    const use = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, use, []);
    const state = interpretation.judgments.find((item) => item.id === 'use-state');
    const relation = interpretation.judgments.find((item) => item.id === 'use-relations');
    assert(state?.summary.includes('伏神官鬼酉金为当前用神'), `伏神用神状态未标记伏神：${state?.summary}`);
    assert(state?.summary.includes('日辰【辰】与酉金六合') && state.summary.includes('日辰【辰】土生酉金'), `伏神日合与日生未同时进入摘要：${state?.summary}`);
    assert(!state?.summary.includes('本爻静') && !state?.summary.includes('为静爻'), `伏神仍沿用明爻静爻语义：${state?.summary}`);
    assert(relation?.summary.includes('官鬼酉金伏于三爻妻财辰土之下') && relation.summary.includes('飞神妻财辰土生伏神官鬼酉金') && relation.summary.includes('辰酉六合'), `飞伏关系未提升到用神关系链：${relation?.summary}`);
    assert(!relation?.summary.includes('元神土见三爻妻财辰土'), `飞神已经进入飞伏主线后仍被重复罗列为普通元神：${relation?.summary}`);

    const timing = liuyao.buildTimingCandidates(target, result);
    const triggers = timing.flatMap((item) => item.triggers || []);
    assert(!triggers.some((item) => item.id === 'static'), '伏神用神仍套用“静爻逢冲”应期规则');
    assert(triggers.some((item) => item.id === 'hidden-value'), '伏神用神缺“伏神值日”观察点');
    assert(triggers.some((item) => item.id === 'hidden-fly-clash'), '伏神用神缺“冲飞”观察点');

    const context = liuyaoInterpretation.buildLiuYaoContextText(result, target, use, interpretation, timing, []);
    assert(context.includes('官鬼酉金；三爻下伏；') && context.includes('；伏神\n'), `复制上下文未把伏神与静爻区分：${context.split('\n').slice(10,18).join('\n')}`);
    assert(context.includes('日辰【辰】与用神【酉】金六合') && context.includes('日辰【辰】土生用神【酉】金'), '复制上下文漏掉伏神日合或日生');
    assert(!context.includes('静爻逢冲：官鬼酉金'), '复制上下文仍把伏神输出为静爻逢冲');
});

test('六爻 4096 卦伏神主观察对象压力测试：不混用静爻语义且飞伏应期可追溯', () => {
    const rawOptions = [6,7,8,9];
    let hiddenTargets = 0;
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        let cursor = encoded;
        const rawValues = [];
        for (let i = 0; i < 6; i += 1) {
            rawValues.push(rawOptions[cursor % 4]);
            cursor = Math.floor(cursor / 4);
        }
        const originalLines = rawValues.map((value) => value === 7 || value === 9);
        const moving = rawValues.map((value) => value === 6 || value === 9);
        const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
        const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
        const originalNaJia = liuyao.naJiaForLines(originalLines);
        const changedNaJia = liuyao.naJiaForLines(changedLines);
        const rows = rawValues.map((value, index) => {
            const status = liuyao.buildLiuYaoLineStatus(originalNaJia[index], '申', '辰', '子丑', moving[index]);
            return {
                position:index + 1,label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
                relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),branch:originalNaJia[index].branch,element:originalNaJia[index].element,
                moving:moving[index],changedRelation:liuyao.sixRelation(changedNaJia[index].element, palace.element),changedBranch:changedNaJia[index].branch,changedElement:changedNaJia[index].element,
                statusTags:status.tags,moveTags:moving[index] ? liuyao.buildMoveAnalysis(originalNaJia[index], changedNaJia[index], '申', '子丑') : [],
                isShi:palace.shi === index + 1,isYing:palace.ying === index + 1
            };
        });
        const flyingHidden = liuyao.buildFlyingHidden(rows, palace, '申', '辰', '子丑');
        const fullStructure = liuyao.buildFullHexagramStructure(rows, originalNaJia, changedNaJia);
        const result = {monthZhi:'申',dayZhi:'辰',xunKong:'子丑',dayXun:'甲寅',castTimestamp:'2026-08-10T12:40:00+09:00',daySect:2,lines:rows,flyingHidden,fullStructure};
        liuyao.buildUseGodChoices(rows, flyingHidden).filter((choice) => choice.type === 'hidden').forEach((target) => {
            const use = liuyao.buildUseGodAnalysis(target, result);
            const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, use, []);
            const state = interpretation.judgments.find((item) => item.id === 'use-state');
            const relation = interpretation.judgments.find((item) => item.id === 'use-relations');
            assert(state && !state.summary.includes('本爻静') && !state.summary.includes('为静爻'), `encoded=${encoded} ${target.key} 伏神状态混入静爻语义`);
            assert(relation?.summary.includes('伏于'), `encoded=${encoded} ${target.key} 飞伏关系未进入主结构解读`);
            const triggers = liuyao.buildTimingCandidates(target, result).flatMap((item) => item.triggers || []);
            assert(!triggers.some((item) => item.id === 'static'), `encoded=${encoded} ${target.key} 伏神仍进入静爻应期`);
            assert(triggers.some((item) => item.id === 'hidden-fly-clash'), `encoded=${encoded} ${target.key} 伏神缺冲飞观察点`);
            hiddenTargets += 1;
        });
    }
    assert(hiddenTargets > 0, '4096 卦压力测试未生成任何伏神主观察对象');
});

test('六爻元忌仇链覆盖明爻、变爻与伏神候选并输出稳定 facts', () => {
    const target = { type:'line', position:1, label:'初爻', relation:'妻财', branch:'子', element:'水', moving:false, statusTags:[], moveTags:[], sourceText:'本卦明爻' };
    const rows = [
        target,
        { position:2,label:'二爻',relation:'兄弟',branch:'申',element:'金',moving:true,changedRelation:'父母',changedBranch:'戌',changedElement:'土',statusTags:[],moveTags:[] },
        { position:3,label:'三爻',relation:'父母',branch:'丑',element:'土',moving:true,changedRelation:'官鬼',changedBranch:'午',changedElement:'火',statusTags:[],moveTags:[] },
        { position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[] },
        { position:5,label:'五爻',relation:'兄弟',branch:'酉',element:'金',moving:true,changedRelation:'官鬼',changedBranch:'巳',changedElement:'火',statusTags:[],moveTags:[] },
        { position:6,label:'上爻',relation:'子孙',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[] }
    ];
    const flyingHidden = [
        { position:1,label:'初爻',hiddenRelation:'兄弟',hiddenBranch:'申',hiddenElement:'金',candidate:true,candidateCode:'HIDDEN_PRIMARY_CANDIDATE',candidateText:'明爻与变爻均未见，可作伏神候选',flyRelation:'妻财',flyBranch:'子',flyElement:'水',relationText:'飞伏测试',statusTags:[] }
    ];
    const analysis = liuyao.buildUseGodAnalysis(target, { lines:rows, flyingHidden });
    assert(analysis.sourceEntries.some((entry) => entry.layer === 'visible'), '元神链缺明爻来源');
    assert(analysis.tabooEntries.some((entry) => entry.layer === 'changed'), '忌神链缺变爻来源');
    assert(analysis.enemyEntries.some((entry) => entry.layer === 'changed'), '仇神链缺变爻来源');
    assert(analysis.sourceEntries.some((entry) => entry.layer === 'hidden' && entry.candidate), '元神链缺伏神候选来源');
    assert(analysis.facts.length > 0 && analysis.facts.every((fact) => typeof fact.code === 'string' && fact.code), '用神链 facts 缺稳定 code');
    assert(analysis.sourceLines.includes('明爻：') && analysis.sourceLines.includes('变爻') && analysis.sourceLines.includes('伏神候选：'), `用神链摘要未区分三层：${analysis.sourceLines}`);
});

test('六爻其他动爻与用神的五行生克、六合六冲进入直接作用 facts', () => {
    const target = { type:'line', position:1, label:'初爻', relation:'妻财', branch:'子', element:'水', moving:false, statusTags:[], moveTags:[], sourceText:'本卦明爻' };
    const rows = [
        target,
        { position:2,label:'二爻',relation:'父母',branch:'丑',element:'土',moving:true,changedRelation:'官鬼',changedBranch:'午',changedElement:'火',statusTags:[],moveTags:[] },
        { position:3,label:'三爻',relation:'兄弟',branch:'申',element:'金',moving:true,changedRelation:'兄弟',changedBranch:'酉',changedElement:'金',statusTags:[],moveTags:[] },
        { position:4,label:'四爻',relation:'子孙',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[] },
        { position:5,label:'五爻',relation:'官鬼',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[] },
        { position:6,label:'上爻',relation:'妻财',branch:'亥',element:'水',moving:false,statusTags:[],moveTags:[] }
    ];
    const analysis = liuyao.buildUseGodAnalysis(target, { lines:rows, flyingHidden:[] });
    const codes = new Set(analysis.directMovingFacts.map((fact) => fact.code));
    assert(codes.has('MOVING_LINE_CONTROLS_USE'), `丑土动爻克水用神未入 facts：${[...codes].join(',')}`);
    assert(codes.has('MOVING_LINE_SIX_HARMONY_USE'), '丑与子六合未入直接作用 facts');
    assert(codes.has('USE_CONTROLS_CHANGED_LINE'), '午火变爻受水用神所克未入 facts');
    assert(codes.has('CHANGED_LINE_SIX_CLASH_USE'), '午与子六冲未入变爻直接作用 facts');
    assert(codes.has('MOVING_LINE_GENERATES_USE'), '申金动爻生水用神未入 facts');
    assert(analysis.directMovingFacts.every((fact) => fact.members?.length === 2 && fact.sourcePosition), '直接作用 fact 缺成员来源或爻位');
});

test('六爻 4096 卦 × 全部可选用神的完整关系链压力测试', () => {
    const rawOptions = [6,7,8,9];
    let analyses = 0;
    for (let encoded = 0; encoded < 4096; encoded += 1) {
        let cursor = encoded;
        const rawValues = [];
        for (let i = 0; i < 6; i += 1) {
            rawValues.push(rawOptions[cursor % 4]);
            cursor = Math.floor(cursor / 4);
        }
        const originalLines = rawValues.map((value) => value === 7 || value === 9);
        const moving = rawValues.map((value) => value === 6 || value === 9);
        const changedLines = originalLines.map((value, index) => moving[index] ? !value : value);
        const palace = liuyao.liuyaoPalaceMap[liuyao.lineKey(originalLines)];
        const originalNaJia = liuyao.naJiaForLines(originalLines);
        const changedNaJia = liuyao.naJiaForLines(changedLines);
        const rows = rawValues.map((value, index) => ({
            position:index + 1,
            label:['初爻','二爻','三爻','四爻','五爻','上爻'][index],
            relation:liuyao.sixRelation(originalNaJia[index].element, palace.element),
            stem:originalNaJia[index].stem,
            branch:originalNaJia[index].branch,
            element:originalNaJia[index].element,
            naJia:originalNaJia[index].text,
            moving:moving[index],
            changedRelation:liuyao.sixRelation(changedNaJia[index].element, palace.element),
            changedBranch:changedNaJia[index].branch,
            changedElement:changedNaJia[index].element,
            statusTags:[], moveTags:[],
            isShi:palace.shi === index + 1,
            isYing:palace.ying === index + 1
        }));
        const flyingHidden = liuyao.buildFlyingHidden(rows, palace, '申', '子', '午未');
        flyingHidden.forEach((item) => {
            assert(item.presence && typeof item.presence.visiblePresent === 'boolean' && typeof item.presence.changedPresent === 'boolean', `encoded=${encoded} 伏神缺三层出现状态`);
            assert(item.candidate === (!item.presence.visiblePresent && !item.presence.changedPresent), `encoded=${encoded} 伏神 candidate 与明变状态不一致`);
        });
        const result = { lines:rows, flyingHidden, fullStructure:liuyao.buildFullHexagramStructure(rows, originalNaJia, changedNaJia) };
        const choices = liuyao.buildUseGodChoices(rows, flyingHidden);
        choices.forEach((choice) => {
            const analysis = liuyao.buildUseGodAnalysis(choice, result);
            assert(analysis && analysis.layers && analysis.relationPresence && analysis.roleEntries, `encoded=${encoded} ${choice.key} 用神链结构缺失`);
            assert((analysis.facts || []).every((fact) => typeof fact.code === 'string' && fact.code), `encoded=${encoded} ${choice.key} 用神链 fact 缺 code`);
            assert((analysis.directMovingFacts || []).every((fact) => fact.family === 'use-god-direct' && fact.members?.length === 2), `encoded=${encoded} ${choice.key} 动爻直接作用 fact 不完整`);
            assert((analysis.entryRelationFacts || []).every((fact) => fact.family === 'use-god-entry-direct' && fact.members?.length === 2 && fact.sourcePosition), `encoded=${encoded} ${choice.key} 元忌仇逐条直接作用 fact 不完整`);
            const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, choice, analysis, []);
            assert(interpretation.judgments.length >= 2 && interpretation.judgments.length <= 3, `encoded=${encoded} ${choice.key} 结构解读未收束为2-3层：${interpretation.judgments.length}`);
            assert(interpretation.judgments.every((item) => ['use-state','use-relations','whole-structure'].includes(item.id)), `encoded=${encoded} ${choice.key} 出现旧结构解读卡：${interpretation.judgments.map((item)=>item.id).join(',')}`);
            analyses += 1;
        });
    }
    assert(analyses >= 24576, `完整关系链压力测试仅生成 ${analyses} 个用神状态`);
});

test('应期候选直接读取三合 missingBranch，不依赖“待某支”显示文字', () => {
    const target = {
        relation:'妻财', branch:'子', element:'水', moving:false,
        statusTags:[], moveTags:[]
    };
    const resultObj = {
        castTimestamp: Date.now(), dayXun:'',
        fullStructure: {
            sanHe: { pendingDetails:[{ element:'水', missingBranch:'辰', text:'显示文案已完全替换' }] }
        }
    };
    const candidates = liuyao.buildTimingCandidates(target, resultObj);
    assert(candidates.some((item) => item.triggers?.some((trigger) => trigger.id === 'sanhe-0')), '显示文案不含“待辰”时三合应期候选丢失');
});

test('六爻古籍 matcher 使用结构 code/tag 基础路径可运行', () => {
    const result = {
        lines: [{ moving:true, statusTags:[{code:'VOID'}], moveTags:[{code:'PROGRESS'}] }],
        fullStructure: { sanHe:{ complete:[], pending:[] }, fanFu:[], originalNatureCode:'SIX_CLASH', changedNatureCode:'NEUTRAL' },
        flyingHidden: []
    };
    const features = liuyaoLit.collectLiuYaoLiteratureFeatures(result, null);
    assert(features.has('moving'), '未识别 moving');
    assert(features.has('void'), '未识别 void');
    assert(features.has('progress'), '未识别 progress');
    assert(features.has('original-six-clash'), '未识别 original-six-clash');
});



test('生产 HTML 不再依赖 Tailwind Play CDN，静态样式资源齐全', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(!html.includes('cdn.tailwindcss.com'), '仍存在 Tailwind Play CDN');
    assert(html.includes('assets/tailwind-utilities.css'), '未引用静态 Tailwind utility CSS');
    assert(html.includes('assets/app.css'), '未引用独立 app.css');
    assert(fs.existsSync(path.join(ROOT, 'assets/tailwind-utilities.css')), 'tailwind-utilities.css 不存在');
    assert(fs.existsSync(path.join(ROOT, 'assets/app.css')), 'app.css 不存在');
});

test('六爻录入界面自上而下展示上爻至初爻，同时索引仍映射 lines[5]→lines[0]', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('v-for="index in [5, 4, 3, 2, 1, 0]"'), '六爻录入展示顺序不是 5→0');
    assert(html.includes('v-model.number="liuyaoForm.lines[index]"'), '六爻录入未按原始 lines 索引写入');
});

test('vendor 版本清单、监测 package 与运行版本保持一致', () => {
    const vendorConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'vendor-config.json'), 'utf8'));
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const versions = JSON.parse(fs.readFileSync(path.join(ROOT, 'vendor-versions.json'), 'utf8'));
    Object.values(vendorConfig.packages).forEach((dep) => {
        assert(packageJson.devDependencies?.[dep.packageName] === dep.version, `${dep.packageName} package pin 不一致`);
        assert(versions.production?.[dep.packageName] === dep.version, `${dep.packageName} production pin 不一致`);
    });
});

test('GitHub Pages 构建会生成同源 vendor，而不是直接发布第三方 CDN 版本', () => {
    const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/pages.yml'), 'utf8');
    assert(workflow.includes('node scripts/build-pages-site.mjs'), 'Pages 未执行 vendor 构建');
    assert(workflow.includes('node scripts/verify-vendor.mjs .site'), 'Pages 未验证 vendor');
    assert(workflow.includes('actions/deploy-pages@'), 'Pages 未使用 Actions 部署');
});

test('依赖监测存在且不包含自动改写 production vendor 的步骤', () => {
    const dependabot = fs.readFileSync(path.join(ROOT, '.github/dependabot.yml'), 'utf8');
    const watch = fs.readFileSync(path.join(ROOT, '.github/workflows/dependency-watch.yml'), 'utf8');
    assert(dependabot.includes('package-ecosystem: "npm"'), 'Dependabot 未监测 npm');
    assert(watch.includes('check-dependency-updates.mjs'), '缺少依赖版本检查');
    assert(watch.includes('issues: write'), '依赖监测无法写入 tracking issue');
    assert(!watch.includes('fetch-vendor.mjs'), '依赖监测不应自动刷新 vendor');
});

test('Vue 应用 setup 可在离线环境完成初始化，且 #liuyao 不被重置为八字', () => {
    let setupResult = null;
    let appDefinition = null;
    const makeRef = (value) => ({ value });
    const makeReactive = (value) => value;
    const makeComputed = (getter) => Object.defineProperty({}, 'value', { get: getter });
    const quietConsole = { log(){}, info(){}, warn(){}, error(){} };
    const context = {
        console: quietConsole,
        Date, Math, JSON, Intl, Set, Map,
        setTimeout, clearTimeout,
        fetch: async () => { throw new Error('offline smoke test'); },
        Vue: {
            createApp: (definition) => { appDefinition = definition; return { mount: () => { setupResult = definition.setup(); } }; },
            ref: makeRef,
            reactive: makeReactive,
            computed: makeComputed,
            watch: () => {}
        },
        location: { hash:'#liuyao', protocol:'file:' },
        history: {
            replaceState(_state, _title, hash) { if (hash) context.location.hash = hash; },
            pushState(_state, _title, hash) { if (hash) context.location.hash = hash; }
        },
        requestAnimationFrame: (callback) => callback(),
        scrollTo(){}, addEventListener(){},
        localStorage: { getItem(){ return null; }, setItem(){} },
        confirm(){ return true; }
    };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    [
        'js/common.js', 'js/bazi-core.js', 'js/bazi-timing.js', 'js/bazi-transit-analysis.js', 'js/bazi-literature.js', 'js/bazi-interpretation.js', 'js/bazi-detail.js',
        'js/liuyao-time-facts.js', 'js/liuyao-time-effects.js', 'js/liuyao-time-assessment.js', 'js/liuyao-time-evidence.js', 'js/liuyao-time-relevance.js', 'js/liuyao-time-output.js', 'js/liuyao-time-selection.js', 'js/liuyao-core.js', 'js/liuyao-interpretation.js', 'js/liuyao-literature.js', 'js/iching-loader.js', 'js/app.js'
    ].forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    assert(setupResult, 'Vue setup 未执行');
    assert(setupResult.activeModule.value === 'liuyao', `#liuyao 初始化成了 ${setupResult.activeModule.value}`);
    assert(setupResult.currentPage.value === 'input', '无结果时不应进入 result 页');
    const literatureBrowser = appDefinition?.components?.LiteratureBrowser;
    assert(literatureBrowser, '共享 LiteratureBrowser 未注册到 Vue 应用');
    const emitted = [];
    const browserState = literatureBrowser.setup({
        modelValue:'总览', intro:'', emptyText:'',
        entries:[
            {id:'a', book:'增删卜易', chapter:'用神章', level:'结构匹配', levelKey:'structure', excerptType:'quote', quote:'甲', verified:true},
            {id:'b', book:'增删卜易', chapter:'旬空章', level:'方法参考', levelKey:'method', excerptType:'locator', quote:'', verified:false},
            {id:'c', book:'黄金策', chapter:'千金赋', level:'精确结构', levelKey:'exact', excerptType:'quote', quote:'乙', verified:true}
        ]
    }, { emit:(event, value) => emitted.push([event, value]) });
    assert(browserState.books.value.join(',') === '黄金策,增删卜易' || browserState.books.value.join(',') === '增删卜易,黄金策', '共享古籍组件书目聚合异常');
    assert(browserState.overview.value.length === 2, '共享古籍组件总览未按书聚合');
    const zengshan = browserState.overview.value.find((item) => item.book === '增删卜易');
    assert(zengshan?.count === 2 && zengshan.verified === 1 && zengshan.locator === 1, '共享古籍组件总览计数异常');
    browserState.selectBook('黄金策');
    assert(emitted.some(([event, value]) => event === 'update:modelValue' && value === '黄金策'), '共享古籍组件未通过 v-model 发出单书选择');
});



test('部署前文档与 Pages 策略保持一致', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert(readme.includes('GitHub Actions'), 'README 未说明 GitHub Actions Pages');
    assert(!readme.includes('Deploy from a branch`，发布'), 'README 仍把 branch deploy 作为发布方式');
    assert(!readme.includes('Tailwind Play CDN 3.4.17'), 'README 仍声称依赖 Tailwind Play CDN');
    assert(fs.existsSync(path.join(ROOT, 'docs/DEPLOYMENT_CHECKLIST.md')), '缺少部署检查清单');
    assert(fs.existsSync(path.join(ROOT, '.nojekyll')), '缺少 .nojekyll');
    assert(fs.existsSync(path.join(ROOT, '.gitattributes')), '缺少 .gitattributes');
});

test('vendor lock 生成逻辑具有确定性，不写入每次变化的 generatedAt', () => {
    const vendorLib = fs.readFileSync(path.join(ROOT, 'scripts/vendor-lib.mjs'), 'utf8');
    assert(!vendorLib.includes('generatedAt: new Date()'), 'vendor-lock 仍包含动态 generatedAt');
});

test('Pages 与 CI 都校验最终静态 artifact', () => {
    const pages = fs.readFileSync(path.join(ROOT, '.github/workflows/pages.yml'), 'utf8');
    const ci = fs.readFileSync(path.join(ROOT, '.github/workflows/test.yml'), 'utf8');
    assert(pages.includes('verify-static-site.mjs .site deployed'), 'Pages 未校验最终静态 artifact');
    assert(ci.includes('verify-static-site.mjs .site deployed'), 'CI 未校验最终静态 artifact');
});


test('八字解释引擎 v2 输出 3-5 条结构判断且保留使用边界', () => {
    const dayGan = '丁';
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('子', '火');
    const result = {
        dayGan, dayGanWuXing:'火', pillars, internalRelations:relations, monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, relations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', ruleSummary:'测试口径'
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    assert(output.judgments.length >= 3 && output.judgments.length <= 5, `解释条数异常：${output.judgments.length}`);
    assert(output.judgments.every((item) => item.evidence.length >= 1), '解释条目缺结构依据');
    assert(output.judgments.some((item) => item.id === 'complete-structure'), '亥子丑三会未进入完整结构解释');
    assert(output.version === '2.0', '解释引擎版本未升级到 v2');
    assert(output.limitations.length >= 2, '解释模块缺使用边界');
});

test('八字解释引擎不依赖关系展示文案识别完整结构', () => {
    const dayGan = '丁';
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index], gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis).map((item) => ({ ...item, text:`替换文案-${item.code}` }));
    const result = { dayGan, dayGanWuXing:'火', pillars, internalRelations:relations, monthSeason:bazi.buildMonthSeason('子','火'), dayMasterEvidence:[], matchedLiterature:[] };
    const output = baziInterpretation.buildBaziInterpretation(result);
    assert(output.judgments.some((item) => item.id === 'complete-structure'), '修改 relation.text 后完整结构解释失效');
});

test('复制分析上下文包含四柱、中文关系、综合判断与古籍入口，且不泄露机器码', () => {
    const result = {
        dayGan:'丁', dayGanWuXing:'火', lunarStr:'测试农历', ruleSummary:'测试口径',
        monthSeason:{monthZhi:'子', season:'冬'},
        pillars:[{ganZhi:'丁丑'},{ganZhi:'壬子'},{ganZhi:'丁亥'},{ganZhi:'己酉'}],
        dayMasterEvidence:[{key:'得令', value:'测试证据'}],
        internalRelations:[{code:'SAN_HUI_COMPLETE', text:'测试三会'}],
        matchedLiterature:[
            {book:'滴天髓', chapter:'十干·丁火', level:'方法参考', excerptType:'quote', verified:true, quote:'丁火柔中，内性昭融。', match:'本局日干为丁。'},
            {book:'三命通会', chapter:'卷八·六丁日己酉时断', level:'精确匹配', excerptType:'locator', verified:false, quote:'六丁日己酉时断', match:'日干丁、时柱己酉可直接定位。'}
        ]
    };
    const interpretation = { headline:'测试总述', judgments:[{ title:'测试判断', summary:'测试摘要', evidence:['测试依据'] }], limitations:['测试边界'] };
    const text = baziInterpretation.buildBaziContextText(result, interpretation);
    assert(text.includes('丁丑 壬子 丁亥 己酉'), '上下文缺四柱');
    assert(text.includes('测试三会'), '上下文缺中文关系文本');
    assert(!text.includes('SAN_HUI_COMPLETE'), '上下文不应泄露机器关系码');
    assert(text.includes('测试判断'), '上下文缺综合判断');
    assert(text.includes('《滴天髓》'), '上下文缺古籍参考');
    assert(text.includes('【结构解读】') && !text.includes('【结构解读 v2】'), '八字复制上下文仍暴露内部解释版本号');
    assert(text.includes('原文：丁火柔中，内性昭融。'), '八字复制上下文未输出已核对古籍原文');
    assert(text.includes('匹配依据：本局日干为丁。'), '八字复制上下文缺古籍匹配依据');
    assert(text.includes('条目定位：六丁日己酉时断'), '八字未核对条目没有保留明确定位');
    assert(!text.includes('｜方法参考｜') && !text.includes('｜精确匹配｜') && !text.includes('已核对来源'), '八字复制上下文仍输出内部匹配层级或核对状态');
});


test('复制上下文古籍格式只保留原文/条目定位与匹配依据', () => {
    const lines = GuiJia.common.buildLiteratureContextLines([
        { book:'增删卜易', chapter:'暗动章第二十二', level:'精确结构', excerptType:'quote', verified:true, quote:'静爻旺相日辰冲之为暗动。', match:'三爻官鬼酉符合暗动条件。' },
        { book:'卜筮正宗', chapter:'飞伏神定例', level:'条目定位', excerptType:'locator', verified:false, quote:'', match:'当前识别出伏神候选。' }
    ]);
    const text = lines.join('\n');
    assert(text.includes('《增删卜易》·暗动章第二十二'), '古籍格式缺书名章节');
    assert(text.includes('原文：静爻旺相日辰冲之为暗动。'), '已核对条目未输出原文');
    assert(text.includes('条目定位：飞伏神定例'), '未核对条目未输出定位');
    assert(text.includes('匹配依据：三爻官鬼酉符合暗动条件。'), '古籍格式缺匹配依据');
    assert(!text.includes('精确结构') && !text.includes('条目定位｜') && !text.includes('已核对来源'), '古籍格式泄露展示/内部元数据');
});


test('复制上下文优先采用面向进一步分析的 contextMatch', () => {
    const lines = GuiJia.common.buildLiteratureContextLines([
        { book:'子平真诠', chapter:'论用神成败·食神', excerptType:'quote', verified:true, quote:'食神生财，或食带煞而无财，弃食就煞而透印，食格成也。', match:'月令为食神。', contextMatch:'月令为食神。本程序只确认入口条件；是否成格尚未判定。' }
    ]);
    const text = lines.join('\n');
    assert(text.includes('匹配依据：月令为食神。本程序只确认入口条件；是否成格尚未判定。'), '上下文没有优先采用 contextMatch');
    assert(!text.includes('匹配依据：月令为食神。\n'), '上下文错误退回 UI 匹配文案');
});

test('八字条件论述型古籍在复制上下文中明确只作为进一步核对', () => {
    const dayGan = '戊';
    const gans = ['戊','庚','戊','甲'];
    const zhis = ['寅','申','子','寅'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('申', '土');
    const items = baziLit.buildMatchedLiterature(dayGan, gans, zhis, pillars, relations, monthSeason);
    const ziping = items.find((item) => item.book === '子平真诠' && item.chapter.includes('食神'));
    assert(ziping, '食神月令未匹配《子平真诠》食神条');
    assert(ziping.contextMatch.includes('只确认月令十神') && ziping.contextMatch.includes('是否符合原文所述成格'), `条件论述未注明匹配边界：${ziping.contextMatch}`);
    const qianli = items.find((item) => item.id === 'qianli-relations-priority');
    assert(qianli && qianli.contextMatch.includes('分析原则'), '关系类古籍没有区分“方法原则”与已成立结论');
});

test('穷通宝鉴不会用同季其他月份原文替代当前月原文', () => {
    const makeItems = (monthZhi) => {
        const dayGan = '戊';
        const gans = ['戊','庚','戊','甲'];
        const zhis = ['寅',monthZhi,'子','寅'];
        const pillars = gans.map((gan, index) => ({
            title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index],
            cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
        }));
        return baziLit.buildMatchedLiterature(dayGan, gans, zhis, pillars, bazi.calculateInternalChartRelations(gans, zhis), bazi.buildMonthSeason(monthZhi, '土'));
    };
    const shen = makeItems('申').find((item) => item.book === '穷通宝鉴');
    assert(shen && shen.excerptType === 'quote' && shen.quote.startsWith('七月戊土'), '申月戊土应使用已核对七月原文');
    const you = makeItems('酉').find((item) => item.book === '穷通宝鉴');
    assert(you && you.excerptType === 'locator', '酉月戊土尚未核对本月正文时应退化为条目定位');
    assert(!String(you.quote).includes('七月戊土'), '酉月错误引用七月戊土原文');
    assert(you.contextMatch.includes('不引用同季其他月份的原文代替'), '非精确月份定位缺少防误用说明');
});


test('穷通宝鉴十干十二月引用范围全部遵守本月/本季边界', () => {
    GAN.forEach((dayGan) => ZHI.forEach((monthZhi) => {
        const season = baziLit.MONTH_SEASON_INDEX[monthZhi];
        const sourceQuote = baziLit.QIONGTONG_SEASON_INDEX[dayGan]?.[season];
        if (!sourceQuote) return;
        const gans = [dayGan, dayGan, dayGan, dayGan];
        const zhis = ['子', monthZhi, '辰', '午'];
        const pillars = gans.map((gan, index) => ({
            title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index],
            cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
        }));
        const item = baziLit.buildMatchedLiterature(dayGan, gans, zhis, pillars, bazi.calculateInternalChartRelations(gans, zhis), bazi.buildMonthSeason(monthZhi, bazi.getWuXing(dayGan))).find((entry) => entry.book === '穷通宝鉴');
        assert(item, `${dayGan}${monthZhi}缺《穷通宝鉴》入口`);
        const scope = baziLit.getQiongQuoteScope(sourceQuote, season);
        const monthLabel = baziLit.BRANCH_MONTH_LABEL[monthZhi];
        const shouldQuote = scope.type === 'season' || (scope.type === 'month' && scope.monthLabel === monthLabel);
        assert((item.excerptType === 'quote') === shouldQuote, `${dayGan}${monthZhi}《穷通宝鉴》引用范围错误：${item.chapter}`);
        if (!shouldQuote) assert(item.contextMatch.includes('不引用同季其他月份的原文代替'), `${dayGan}${monthZhi}定位缺防错说明`);
    }));
});

test('六爻条件型古籍上下文明确区分结构命中与古籍结论', () => {
    const result = {
        monthGanZhi:'乙未', monthZhi:'未', dayGanZhi:'甲申', dayGan:'甲', xunKong:'午未',
        palace:{palace:'乾',stage:'本宫六世'}, original:{symbol:'䷀',name:'乾'},
        lines:[
            {label:'初爻',relation:'父母',branch:'子',moving:false,statusTags:[{code:'DARK_MOVING',text:'暗动'}],moveTags:[]},
            {label:'二爻',relation:'官鬼',branch:'丑',moving:false,statusTags:[],moveTags:[]},
            {label:'三爻',relation:'兄弟',branch:'寅',moving:false,statusTags:[],moveTags:[]},
            {label:'四爻',relation:'妻财',branch:'卯',moving:false,statusTags:[],moveTags:[]},
            {label:'五爻',relation:'子孙',branch:'辰',moving:false,statusTags:[],moveTags:[]},
            {label:'上爻',relation:'父母',branch:'巳',moving:false,statusTags:[],moveTags:[]}
        ],
        fullStructure:{sanHe:{complete:[],pending:[]},fanFu:[],shiYing:{text:'世应已定位'}} , flyingHidden:[]
    };
    const items = liuyaoLit.buildLiuYaoLiterature(result, null);
    const dark = items.find((item) => item.id === 'zengshan-dark');
    assert(dark, '暗动结构未匹配《增删卜易》暗动条');
    assert(dark.contextMatch.includes('原文条件核对') && dark.contextMatch.includes('静爻 ✓') && dark.contextMatch.includes('日辰相冲 ✓'), `暗动古籍上下文未逐项核对当前可确认条件：${dark.contextMatch}`);
    const sixSpirits = items.find((item) => item.id === 'zengshan-sixspirits');
    assert(sixSpirits && sixSpirits.contextMatch.includes('不据六神名称'), '六神方法参考缺少防止直接定吉凶的上下文说明');
});


test('八字解释 v2 能把月令、根气、透干与地支关系合成为命题', () => {
    const dayGan = '庚';
    const gans = ['丁','癸','庚','丙'];
    const zhis = ['丑','卯','戌','子'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('卯', '金');
    const result = {
        dayGan, dayGanWuXing:'金', pillars, internalRelations:relations, monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, relations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', ruleSummary:'测试口径'
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    assert(output.headline.includes('正财居月令'), `总括未体现月令十神：${output.headline}`);
    assert(output.headline.includes('庚金季节失令而地支见同类得地'), `总括未区分本干通根与同类得地：${output.headline}`);
    const visible = output.judgments.find((item) => item.id === 'visible-combination');
    assert(visible && visible.title.includes('官杀') && visible.title.includes('伤官'), '未识别官杀与伤官并透');
    assert(visible.summary.includes('正官') && visible.summary.includes('七杀') && visible.summary.includes('伤官'), '透干命题未保留具体十神');
    assert(visible.summary.includes('相冲'), '透干命题未把天干直接关系纳入同一判断');
    const branch = output.judgments.find((item) => item.id === 'branch-network');
    assert(branch && branch.title.includes('合') && branch.title.includes('刑'), '未把地支合刑合成为整体命题');
    assert(branch.evidence.length >= 4, '地支网络证据不完整');
    assert(output.judgments.some((item) => item.id === 'support-location'), '扶助落点命题缺失');
});

test('透干命题优先描述实际重复结构，丙午丙申乙卯戊寅识别为伤官两透并见正财', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','戊'];
    const zhis = ['午','申','卯','寅'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('申','木');
    const result = {
        dayGan, dayGanWuXing:'木', pillars, internalRelations:relations,
        monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, relations, dayGan),
        matchedLiterature:[]
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    const visible = output.judgments.find((item) => item.id === 'visible-combination');
    const month = output.judgments.find((item) => item.id === 'month-command');
    const support = output.judgments.find((item) => item.id === 'support-location');
    const branch = output.judgments.find((item) => item.id === 'branch-network');
    assert(visible?.title === '伤官两透，并见正财', `重复透干标题未具体化：${visible?.title}`);
    assert(visible.summary.includes('伤官在天干重复透出，并与正财同现'), `重复透干正文未说明实际组合：${visible?.summary}`);
    assert(output.headline.includes('伤官两透，并见正财'), `总括未保留具体透干结构：${output.headline}`);
    assert(month?.evidence.some((item) => item.startsWith('本干通根：日柱卯藏乙')), '月令判断未区分本干通根');
    assert(month?.evidence.some((item) => item.startsWith('同类得地：时柱寅藏甲')), '月令判断未区分同类得地');
    assert(support?.summary.includes('本干通根一处') && support.summary.includes('同类得地一处'), '扶身判断仍把本根与同类混称为根气或使用阿拉伯计数');
    assert(result.dayMasterEvidence.find((item) => item.key === '根气')?.value.includes('同类得地'), '强弱线索未统一根气术语');
    assert(branch?.summary.includes('同时见刑、冲') && branch.summary.includes('共同节点'), `地支关系仍停留在程序排序语言：${branch?.summary}`);
    assert(!branch?.summary.includes('位置上可优先观察'), '地支关系仍出现程序排序措辞');
});

test('八字重复天干关系合成为同一结构，双丙同时冲壬不只取第一条', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','壬'];
    const zhis = ['午','申','卯','午'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const output = baziInterpretation.buildBaziInterpretation({
        dayGan, dayGanWuXing:'木', pillars, internalRelations:relations,
        monthSeason:bazi.buildMonthSeason('申','木'), dayMasterEvidence:[], matchedLiterature:[]
    });
    const visible = output.judgments.find((item) => item.id === 'visible-combination');
    assert(visible?.title === '伤官两透，并见正印', `双丙壬盘透干标题错误：${visible?.title}`);
    assert(visible?.summary.includes('年干、月干两干皆为丙') && visible.summary.includes('均与时干壬相冲'), `重复丙壬冲未合成为整体结构：${visible?.summary}`);
    assert(visible.evidence.filter((item) => item.includes('相冲')).length === 2, '两组丙壬冲证据未完整保留');
});

test('八字重复地支关系合成为具体网络，双午自刑并两破卯', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','壬'];
    const zhis = ['午','申','卯','午'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const output = baziInterpretation.buildBaziInterpretation({
        dayGan, dayGanWuXing:'木', pillars, internalRelations:relations,
        monthSeason:bazi.buildMonthSeason('申','木'), dayMasterEvidence:[], matchedLiterature:[]
    });
    const branch = output.judgments.find((item) => item.id === 'branch-network');
    assert(branch?.title.includes('双午同时牵动卯支'), `双午重复关系标题未具体化：${branch?.title}`);
    assert(branch?.title.includes('午午自刑') && branch.title.includes('两组午卯破'), `双午自刑/两破未在同一标题：${branch?.title}`);
    assert(branch?.summary.includes('共同位置'), `重复地支网络正文未说明共同作用点：${branch?.summary}`);
});

test('八字古籍条件核对：正官条与三秋乙木按程序事实逐项说明', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','壬'];
    const zhis = ['午','申','卯','午'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index], gan, zhi: zhis[index],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const entries = baziLit.buildMatchedLiterature(dayGan, gans, zhis, pillars, relations, bazi.buildMonthSeason('申','木'));
    const ziping = entries.find((item) => item.id === 'ziping-month-正官');
    const qiong = entries.find((item) => item.book === '穷通宝鉴');
    assert(ziping?.contextMatch.includes('原文条件核对'), `正官条未进入条件核对：${ziping?.contextMatch}`);
    assert(ziping?.contextMatch.includes('印星：已见') && ziping.contextMatch.includes('无刑冲破害') && ziping.contextMatch.includes('不满足'), `正官条未对照印星/刑破条件：${ziping?.contextMatch}`);
    assert(qiong?.contextMatch.includes('原文点名天干核对') && qiong.contextMatch.includes('丙已见') && qiong.contextMatch.includes('癸未见'), `三秋乙木未核对丙癸实际出现：${qiong?.contextMatch}`);
    assert(qiong?.contextMatch.includes('同五行异干不能自动替代'), '穷通条件核对未声明壬癸等不能自动替代');
});

test('同一十神重复透出不误判为多类十神，丙午丙申乙卯丙子识别为伤官集中透出', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','丙'];
    const zhis = ['午','申','卯','子'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const result = {
        dayGan, dayGanWuXing:'木', pillars, internalRelations:relations,
        monthSeason:bazi.buildMonthSeason('申','木'), dayMasterEvidence:[], matchedLiterature:[]
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    const visible = output.judgments.find((item) => item.id === 'visible-combination');
    assert(visible, '缺透干命题');
    assert(visible.title === '伤官集中透出', `同一十神重复透出标题错误：${visible.title}`);
    assert(!visible.title.includes('多类十神'), '同一伤官三透仍误判为多类十神');
    assert(visible.summary.includes('反复出现'), '重复透出未生成对应综合说明');
    assert(output.headline.includes('伤官集中透出'), `总括未体现伤官集中透出：${output.headline}`);
});


test('结构解读总括对单一地支关系不误写“多组”', () => {
    const dayGan = '甲';
    const gans = ['甲','丙','甲','戊'];
    const zhis = ['寅','子','辰','申'];
    const pillars = gans.map((gan, index) => ({
        title: ['年柱','月柱','日柱','时柱'][index],
        gan, zhi: zhis[index], ganZhi: gan + zhis[index],
        shishenGan: index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan: bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan: hiddenGan, level, wuxing: bazi.getWuXing(hiddenGan), shishen: bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const result = {
        dayGan, dayGanWuXing:'木', pillars,
        internalRelations:[{
            code:'BRANCH_SIX_HARMONY',
            text:'月柱地支【子】与日柱地支【丑】六合',
            pillarIndices:[1,2]
        }],
        monthSeason:bazi.buildMonthSeason('子','木'),
        dayMasterEvidence:[], matchedLiterature:[]
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    assert(output.headline.includes('地支仅见一处合'), `单一地支关系总括措辞错误：${output.headline}`);
    assert(!output.headline.includes('地支见多组'), `单一地支关系仍被误写为多组：${output.headline}`);
});

test('结构解读依据保留在复制上下文数据层，不要求前台重复展示', () => {
    const result = {
        dayGan:'乙', dayGanWuXing:'木', lunarStr:'测试农历', ruleSummary:'测试口径',
        monthSeason:{monthZhi:'申', season:'秋'}, pillars:[{ganZhi:'丙午'},{ganZhi:'丙申'},{ganZhi:'乙卯'},{ganZhi:'丙子'}],
        dayMasterEvidence:[], internalRelations:[], matchedLiterature:[]
    };
    const interpretation = { headline:'测试总述', judgments:[{title:'伤官集中透出', summary:'测试摘要', evidence:['第一项','第二项']}], limitations:[] };
    const text = baziInterpretation.buildBaziContextText(result, interpretation);
    assert(text.includes('  1. 第一项') && text.includes('  2. 第二项'), '复制上下文证据未改为编号列表');
    assert(!text.includes('- 依据：'), '复制上下文仍重复“依据”字样');
});

test('八字总览结构解读只保留综合判断，依据与使用边界不再重复占据前台', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const baziStart = html.indexOf("<div v-if=\"currentPage === 'result' && activeModule === 'bazi'");
    const liuyaoStart = html.indexOf("<div v-if=\"currentPage === 'result' && activeModule === 'liuyao'", baziStart);
    const baziHtml = html.slice(baziStart, liuyaoStart);
    const interpretationStart = baziHtml.indexOf('bazi-interpretation-panel');
    const monthStart = baziHtml.indexOf('月令与强弱线索', interpretationStart);
    const interpretationHtml = baziHtml.slice(interpretationStart, monthStart);
    assert(interpretationHtml.includes('{{ item.summary }}'), '八字总览结构解读缺综合判断正文');
    assert(!interpretationHtml.includes('查看依据'), '八字总览结构解读仍重复展示依据折叠');
    assert(!interpretationHtml.includes('使用边界'), '八字总览结构解读仍把后台边界展示给用户');
});


test('八字关系元数据覆盖全部机器码，排序统一由 bazi-core 提供', () => {
    const codes = new Set(Object.values(bazi.baziRelationCodes));
    const metaCodes = new Set(Object.keys(bazi.baziRelationMeta));
    assert(codes.size === metaCodes.size, `关系元数据数量 ${metaCodes.size} 与机器码 ${codes.size} 不一致`);
    codes.forEach((code) => {
        const meta = bazi.baziRelationMeta[code];
        assert(meta, `${code} 缺关系元数据`);
        assert(['stem','branch'].includes(meta.scope), `${code} scope 非法`);
        assert(Number.isFinite(meta.baseScore), `${code} baseScore 非法`);
    });
    assert(bazi.scoreBaziRelation({ code:'BRANCH_SIX_CLASH', pillarIndices:[1,2] }) === 104,
        '月柱+日柱六冲统一评分应为 82+8+14=104');
    assert(bazi.scoreBaziRelation({ code:'STEM_CLASH', pillarIndices:[0,3] }) === 50,
        '年柱+时柱天干冲统一评分应含跨首尾 +2');

    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const interpretationSource = fs.readFileSync(path.join(ROOT, 'js/bazi-interpretation.js'), 'utf8');
    assert(appSource.includes('calculateInternalChartRelations'), 'app 未从 bazi-core 读取原局关系计算');
    assert(!appSource.includes('scoreBaziRelation'), '总览已取消关系标签排名后，app 仍保留无用评分依赖');
    assert(!appSource.includes('const scoreBaziRelation = (relation)'), 'app 仍保留重复的关系评分表');
    assert(interpretationSource.includes('scoreBaziRelation } = GuiJia.baziCore'), '解释引擎未读取统一评分函数');
    assert(!interpretationSource.includes('function scoreRelation('), '解释引擎仍保留重复的关系评分函数');
});

test('重新排八字会重置古籍筛选，避免跨命盘残留', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const start = appSource.indexOf('const calculateBazi = () => {');
    const end = appSource.indexOf('const getPaddedCangGan', start);
    assert(start >= 0 && end > start, '无法定位 calculateBazi');
    const calculateSource = appSource.slice(start, end);
    assert(calculateSource.includes("literatureFilter.value = '总览';"), 'calculateBazi 未重置 literatureFilter');
});

test('解释引擎已清理未使用统计与 fallback 死代码', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-interpretation.js'), 'utf8');
    assert(!source.includes('function countGods('), 'countGods 死代码仍存在');
    assert(!source.includes('visibleCounts'), 'visibleCounts 未使用字段仍存在');
    assert(!source.includes('hiddenCounts'), 'hiddenCounts 未使用字段仍存在');
    assert(!source.includes('function buildFallbackRelationJudgment('), '未调用 fallback 判断仍存在');
});

test('Pages 构建严格使用已提交 vendor，不再静默联网回退', () => {
    const build = fs.readFileSync(path.join(ROOT, 'scripts/build-pages-site.mjs'), 'utf8');
    const verifySource = fs.readFileSync(path.join(ROOT, 'scripts/verify-source-config.mjs'), 'utf8');
    assert(!build.includes('materializeVendor'), 'Pages 构建仍可静默下载 vendor');
    assert(build.includes('Checked-in vendor snapshots are required'), 'Pages 构建缺少 vendor 缺失时的明确失败');
    assert(build.includes('verifyVendorTree(ROOT)'), 'Pages 构建未先校验仓库 vendor');
    assert(verifySource.includes('must use checked-in local vendor reference'), '源码校验未强制 local vendor');
    assert(verifySource.includes('still contains remote runtime reference'), '源码校验未拒绝 remote runtime reference');
});

test('Vendor Snapshot rerun 使用 run attempt 避免同名分支冲突', () => {
    const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/vendor-snapshot-pr.yml'), 'utf8');
    assert(workflow.includes('${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}'), 'vendor snapshot 分支名未包含 GITHUB_RUN_ATTEMPT');
});



test('岁运关系全部带机器语义 code，展示文本与语义分离', () => {
    const groups = [
        bazi.calculateStemRelations('甲', ['己','庚','辛','壬']),
        bazi.calculateBranchRelations('子', ['丑','卯','午','辰']),
        bazi.calculatePillarSignals('甲', '子', ['甲','乙','庚','辛'], ['子','丑','午','未'], '流年'),
        bazi.calculatePairRelations({gan:'甲', zhi:'子'}, {gan:'甲', zhi:'子'}, '大运', '流年'),
        bazi.calculateThreeLayerRelations({zhi:'子'}, {zhi:'辰'}, ['申','午','酉','亥']),
        bazi.calculateFourLayerRelations({zhi:'子'}, {zhi:'未'}, {zhi:'辰'}, ['申','午','酉','亥'])
    ];
    groups.forEach((relations, groupIndex) => {
        assert(relations.length > 0, `第 ${groupIndex + 1} 组岁运关系为空，测试向量失效`);
        relations.forEach((relation) => {
            assert(typeof relation.code === 'string' && relation.code.length > 0, `岁运关系缺 code：${relation.text}`);
            assert(typeof relation.text === 'string' && relation.text.length > 0, `岁运关系缺展示文本：${relation.code}`);
        });
    });
    const pillar = groups[2];
    assert(pillar.some((item) => item.code === 'TRANSIT_PILLAR_FUYIN'), '流年同柱未生成伏吟机器码');
    const pair = groups[3];
    assert(pair[0].code === 'TRANSIT_LAYER_SAME_GANZHI', `岁运并临机器码错误：${pair[0].code}`);
    assert(groups[4].some((item) => item.code === 'SAN_HE_COMPLETE'), '原局+大运+流年补齐三合未保留 SAN_HE_COMPLETE');
    assert(groups[5].some((item) => item.code === 'SAN_HE_COMPLETE'), '流月补齐三合未保留 SAN_HE_COMPLETE');
    assert(bazi.getBaziRelationMeta('TRANSIT_PILLAR_FUYIN')?.family === '伏吟', '统一关系元数据入口未覆盖岁运 code');
});

test('关系去重优先使用机器语义 key，不因显示文案改变而重复', () => {
    const relations = [
        { type:'chong', code:'BRANCH_SIX_CLASH', pillarIndices:[1,2], branches:['子','午'], text:'第一种显示写法' },
        { type:'chong', code:'BRANCH_SIX_CLASH', pillarIndices:[2,1], branches:['午','子'], text:'第二种显示写法' }
    ];
    const unique = bazi.uniqueRelations(relations);
    assert(unique.length === 1, `同一机器关系因显示文案不同未去重：${unique.length}`);
});

test('完整三合三会三刑不在结构解读的地支网络证据中重复出现', () => {
    const dayGan = '丁';
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]}))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const result = {
        dayGan, dayGanWuXing:'火', pillars, internalRelations,
        monthSeason:bazi.buildMonthSeason('子','火'), dayMasterEvidence:[], matchedLiterature:[]
    };
    const output = baziInterpretation.buildBaziInterpretation(result);
    const complete = output.judgments.find((item) => item.id === 'complete-structure');
    const branch = output.judgments.find((item) => item.id === 'branch-network');
    assert(complete && complete.evidence.some((item) => item.includes('三会水方')), '完整三会未进入完整结构判断');
    if (branch) assert(!branch.evidence.some((item) => item.includes('三会水方')), '完整三会仍在地支网络证据中重复出现');
    assert(output.headline.includes('三会水方'), `移除重复后总括未保留完整结构：${output.headline}`);
});

test('lunar 集成回归已接入 npm test / predeploy', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    assert(pkg.scripts.test.includes('tests/lunar-integration-tests.js'), 'npm test 未接入 lunar 集成测试');
    assert(pkg.scripts.predeploy.includes('tests/lunar-integration-tests.js'), 'predeploy 未接入 lunar 集成测试');
    assert(fs.existsSync(path.join(ROOT, 'tests/lunar-integration-tests.js')), '缺少 lunar 集成测试文件');
});



test('bazi-timing 拆分后由独立模块承担岁运数据组装，app 只保留选择状态编排', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const timingSource = fs.readFileSync(path.join(ROOT, 'js/bazi-timing.js'), 'utf8');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(typeof baziTiming.buildYunProfile === 'function', 'bazi-timing 缺 buildYunProfile');
    assert(typeof baziTiming.buildLiuNianList === 'function', 'bazi-timing 缺 buildLiuNianList');
    assert(typeof baziTiming.buildLiuYueList === 'function', 'bazi-timing 缺 buildLiuYueList');
    assert(typeof baziTiming.findDaYunIndexForYear === 'function', 'bazi-timing 缺年份定位函数');
    assert(!appSource.includes('const jieMonthDefs = ['), 'app.js 仍保留节令流月定义');
    assert(!appSource.includes('const buildLiuYueRanges ='), 'app.js 仍保留流月范围构造器');
    assert(!appSource.includes("pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '大运')"), 'app.js 仍直接组装大运关系');
    assert(timingSource.includes("pillarSignals: calculatePillarSignals(gan, zhi, originalGans, originalZhis, '大运')"), 'bazi-timing 未接管大运关系组装');
    const corePos = html.indexOf('<script src="./js/bazi-core.js?v=13.44.0"></script>');
    const timingPos = html.indexOf('<script src="./js/bazi-timing.js?v=13.44.0"></script>');
    const appPos = html.indexOf('<script src="./js/app.js?v=13.44.0"></script>');
    assert(corePos >= 0 && timingPos > corePos && appPos > timingPos, 'bazi-timing script 加载顺序错误');
});

test('bazi-timing 大运/流年 builder 保留既有字段与机器关系', () => {
    const makeSolar = () => ({ getYear:()=>2027, getMonth:()=>3, getDay:()=>4, getHour:()=>5 });
    const liuNianRaw = {
        getGanZhi:()=> '甲子', getYear:()=>2030, getAge:()=>34,
        getXun:()=> '甲子旬', getXunKong:()=> '戌亥', getLiuYue:()=>[]
    };
    const daYunRaw = {
        getGanZhi:()=> '癸亥', getStartYear:()=>2028, getEndYear:()=>2037,
        getStartAge:()=>32, getEndAge:()=>41, getXun:()=> '甲寅旬', getXunKong:()=> '子丑',
        getLiuNian:()=>[liuNianRaw]
    };
    const yun = { getStartSolar: makeSolar, getDaYun:()=>[daYunRaw] };
    const baZi = { getYun:(gender, sect) => { assert(gender === 1 && sect === 1, '起运参数传递改变'); return yun; } };
    const chart = { dayGan:'丁', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const profile = baziTiming.buildYunProfile(baZi, { gender:'1', yunSect:'1', ...chart });
    assert(profile.qiYunInfo === '公历 2027年3月4日 05:00交运', `起运文案改变：${profile.qiYunInfo}`);
    assert(profile.daYunList.length === 1, '大运 builder 数量错误');
    const daYun = profile.daYunList[0];
    ['rawObj','startYear','endYear','startAge','endAge','gan','zhi','ganWuXing','zhiWuXing','shiShen','diShi','naYin','xun','xunKong','relations','stemRelations','pillarSignals']
        .forEach((key) => assert(Object.prototype.hasOwnProperty.call(daYun, key), `大运缺字段 ${key}`));
    daYun.relations.concat(daYun.stemRelations, daYun.pillarSignals).forEach((item) => assert(item.code, `大运关系缺机器码：${item.text}`));

    const years = baziTiming.buildLiuNianList(daYun, chart);
    assert(years.length === 1 && years[0].year === 2030, '流年 builder 输出错误');
    ['relations','stemRelations','pillarSignals','yunRelations','layeredRelations'].forEach((key) => {
        assert(Array.isArray(years[0][key]), `流年 ${key} 不是数组`);
        years[0][key].forEach((item) => assert(item.code, `流年 ${key} 缺机器码：${item.text}`));
    });
    assert(baziTiming.getAvailableYearRange([daYun]).min === 2030, '可查询年份下限错误');
    assert(baziTiming.getAvailableYearRange([daYun]).max === 2030, '可查询年份上限错误');
    assert(baziTiming.findDaYunIndexForYear([daYun], 2030) === 0, '年份未定位到对应大运');
    assert(baziTiming.findDaYunIndexForYear([daYun], 2040) === -1, '不存在年份错误命中大运');
});

test('bazi-timing 流月 builder 保留节令范围、当前月与四层关系字段', () => {
    const makeSolar = (year, month, day, hour=0, minute=0) => ({
        getYear:()=>year, getMonth:()=>month, getDay:()=>day, getHour:()=>hour, getMinute:()=>minute, getSecond:()=>0
    });
    const tableForYear = (year) => Object.fromEntries(baziTiming.jieMonthDefs.map((def, index) => {
        const month = index + 2 > 12 ? 1 : index + 2;
        const actualYear = def.name === '小寒' ? year : year;
        return [def.name, makeSolar(actualYear, month, 5, 6, 0)];
    }));
    const SolarApi = {
        fromYmd:(year) => ({ getLunar:()=>({ getJieQiTable:()=>tableForYear(year) }) })
    };
    const rawMonths = baziTiming.jieMonthDefs.map((def, index) => ({
        getGanZhi:()=> ['丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥','丙子','丁丑'][index],
        getMonthInChinese:()=>String(index + 1),
        getXun:()=>'', getXunKong:()=>''
    }));
    const liuNian = { year:2030, gan:'甲', zhi:'子', rawObj:{ getLiuYue:()=>rawMonths } };
    const daYun = { gan:'癸', zhi:'亥' };
    const chart = { dayGan:'丁', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const nowDate = new Date(2030, 1, 10, 12, 0, 0);
    const output = baziTiming.buildLiuYueList(liuNian, daYun, chart, { nowDate, SolarApi });
    assert(!output.error, `流月 builder 意外报错：${output.error}`);
    assert(output.items.length === 12, `流月数量错误：${output.items.length}`);
    const first = output.items[0];
    ['rangeText','shortRange','isCurrent','relations','stemRelations','pillarSignals','yunRelations','yearRelations','layeredRelations']
        .forEach((key) => assert(Object.prototype.hasOwnProperty.call(first, key), `流月缺字段 ${key}`));
    assert(output.items.some((item) => item.isCurrent), '流月 builder 未定位当前节令月');
    output.items.forEach((item) => {
        ['relations','stemRelations','pillarSignals','yunRelations','yearRelations','layeredRelations'].forEach((key) => {
            item[key].forEach((rel) => assert(rel.code, `流月 ${key} 缺机器码：${rel.text}`));
        });
    });
});

test('八字与六爻古籍浏览统一使用 LiteratureBrowser，总览不直接展开全部正文', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const componentUses = (html.match(/<literature-browser\b/g) || []).length;
    assert(componentUses === 2, `LiteratureBrowser 应由八字、六爻各使用一次，实际 ${componentUses}`);
    assert(html.includes('<template id="literature-browser-template">'), '缺少共享古籍浏览模板');
    assert(html.includes("activeFilter === '总览'"), '共享模板缺少总览分支');
    assert(html.includes('查看该书分览 →'), '总览缺少单书分览入口');
    assert(!html.includes('<div class="classic-grid"><article v-for="item in liuyaoLiterature"'), '六爻仍保留旧的全量 classic-grid 展示');
    assert(appSource.includes('const LiteratureBrowser = {'), 'app.js 未注册共享古籍浏览组件');
    assert(appSource.includes("const literatureFilter = ref('总览')"), '八字古籍筛选默认值不是总览');
    assert(appSource.includes("const liuyaoLiteratureFilter = ref('总览')"), '六爻古籍筛选默认值不是总览');
    assert(!appSource.includes('matchedLiteratureBooks'), '八字仍保留旧的独立书目筛选 computed');
    assert(!appSource.includes('filteredLiteratureMatches'), '八字仍保留旧的独立筛选列表 computed');
});

test('六爻文献 matcher 输出与八字一致的展示语义字段', () => {
    const result = {
        monthGanZhi:'甲子', monthZhi:'子', dayGanZhi:'乙丑', dayGan:'乙', dayZhi:'丑', xunKong:'戌亥',
        lines:[{ label:'初爻', relation:'父母', branch:'子', moving:true, statusTags:[], moveTags:[] }],
        fullStructure:{ sanHe:{complete:[], pending:[]}, fanFu:[], shiYing:{text:'测试世应'}, originalNatureCode:'NEUTRAL', changedNatureCode:'NEUTRAL' },
        flyingHidden:[], palace:{palace:'乾', stage:'本宫六世'}, original:{name:'乾', symbol:'䷀'}
    };
    const entries = liuyaoLit.buildLiuYaoLiterature(result, null);
    assert(entries.length > 0, '六爻文献 matcher 未返回条目');
    entries.forEach((item) => {
        assert(['exact','structure','method'].includes(item.levelKey), `${item.id} 缺统一 levelKey`);
        assert(['quote','locator'].includes(item.excerptType), `${item.id} 缺统一 excerptType`);
        assert(item.excerptType === (item.verified ? 'quote' : 'locator'), `${item.id} excerptType 与 verified 不一致`);
    });
});

test('重新排盘分别把八字与六爻古籍视图恢复到总览', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    assert(appSource.includes("literatureFilter.value = '总览';"), '八字重排未恢复古籍总览');
    assert(appSource.includes("liuyaoLiteratureFilter.value = '总览';"), '六爻重排未恢复古籍总览');
});


test('六爻详细页不再重复展示全卦完整关系模块', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(!html.includes('<div class="detail-section-title">全卦完整关系</div>'), '六爻详细页仍重复展示全卦完整关系模块');
    const interpretationSource = fs.readFileSync(path.join(ROOT, 'js/liuyao-interpretation.js'), 'utf8');
    assert(html.includes('<h3>{{ item.title }}</h3>') && interpretationSource.includes("'动变与卦体结构'"), '删除全卦完整关系后结构解读未保留卦体动变入口');
});


test('六爻结构解读按当前用神组合日月、动变、世应与全卦结构', () => {
    const rows = [
        { position:1, label:'初爻', relation:'父母', branch:'寅', element:'木', moving:false, statusTags:[{code:'MONTH_GENERATE', text:'月建生', type:'support'}], moveTags:[], isShi:false, isYing:false },
        { position:2, label:'二爻', relation:'官鬼', branch:'亥', element:'水', moving:true, changedBranch:'子', changedElement:'水', statusTags:[{code:'MONTH_COMMAND', text:'临月建', type:'support'}, {code:'VOID', text:'旬空', type:'void'}], moveTags:[{code:'PROGRESS', text:'化进神', type:'support'}], isShi:true, isYing:false },
        { position:3, label:'三爻', relation:'兄弟', branch:'丑', element:'土', moving:false, statusTags:[], moveTags:[], isShi:false, isYing:false },
        { position:4, label:'四爻', relation:'子孙', branch:'卯', element:'木', moving:false, statusTags:[], moveTags:[], isShi:false, isYing:false },
        { position:5, label:'五爻', relation:'妻财', branch:'午', element:'火', moving:false, statusTags:[], moveTags:[], isShi:false, isYing:true },
        { position:6, label:'上爻', relation:'兄弟', branch:'未', element:'土', moving:false, statusTags:[], moveTags:[], isShi:false, isYing:false }
    ];
    const target = { ...rows[1], type:'line', sourceText:'本卦明爻' };
    const result = {
        lines:rows,
        fullStructure:{
            originalNature:'六冲卦', originalNatureCode:'SIX_CLASH',
            changedNature:'六合卦', changedNatureCode:'SIX_HARMONY',
            transition:'六冲化六合',
            shiYing:{ text:'世爻为二爻官鬼亥水；应爻为五爻妻财午火。', tags:[{code:'SHI_MOVING', text:'世爻发动', type:'trigger'}] },
            sanHe:{ complete:[], pending:['申子两支待辰（未成局）'], pendingDetails:[] },
            fanFu:[]
        }
    };
    const useAnalysis = liuyao.buildUseGodAnalysis(target, result);
    const timing = [{id:'void', title:'旬空：填实、冲空与出旬', reason:'测试', dates:[]}];
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, useAnalysis, timing);
    assert(output.judgments.length === 3, `六爻结构解读应收束为三层，实际：${output.judgments.length}`);
    assert(output.headline.includes('官鬼亥水'), `总括未围绕当前用神：${output.headline}`);
    assert(output.headline.includes('六冲卦'), `总括未纳入全卦结构：${output.headline}`);
    const state = output.judgments.find((item) => item.id === 'use-state');
    const relations = output.judgments.find((item) => item.id === 'use-relations');
    const whole = output.judgments.find((item) => item.id === 'whole-structure');
    assert(state?.summary.includes('官鬼亥水') && state.summary.includes('旬空') && state.summary.includes('化进神'), `用神状态未合并日月与动变：${state?.summary}`);
    assert(relations, '未生成统一的用神关系链');
    assert(whole?.title === '动变与卦体结构', '全卦结构未收束为卦体与动变结构');
});

test('六爻结构解读与复制上下文不泄露机器码', () => {
    const target = {
        type:'line', position:1, relation:'妻财', branch:'子', element:'水', sourceText:'本卦明爻',
        moving:true, changedBranch:'亥', changedElement:'水', isShi:false, isYing:false,
        statusTags:[{code:'VOID', text:'旬空', type:'void'}, {code:'DAY_CLASH', text:'日冲', type:'trigger'}],
        moveTags:[{code:'RETREAT', text:'化退神', type:'constraint'}]
    };
    const rows = [target, {position:2,label:'二爻',relation:'父母',branch:'寅',element:'木',moving:false,statusTags:[],moveTags:[]}, {position:3,label:'三爻',relation:'兄弟',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[]}, {position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[]}, {position:5,label:'五爻',relation:'子孙',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[]}, {position:6,label:'上爻',relation:'兄弟',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[]}];
    const result = {
        question:'测试占问', solarText:'2026/8/9 03:00', lunarText:'丙午年 六月廿七 寅时', monthGanZhi:'乙未', dayGanZhi:'甲申', xunKong:'午未',
        original:{symbol:'䷀', name:'乾', number:1}, changed:{symbol:'䷫', name:'姤', number:44}, palace:{palace:'乾', stage:'本宫六世', element:'金'}, movingText:'初爻',
        lines:rows, displayLines:[...rows].reverse(),
        fullStructure:{ originalNature:'六冲卦', originalNatureCode:'SIX_CLASH', changedNature:'非六冲六合卦', changedNatureCode:'NEUTRAL', transition:'六冲卦 → 非六冲六合卦', shiYing:{text:'世应测试',tags:[]}, sanHe:{complete:[],pending:[]}, fanFu:[] }
    };
    const useAnalysis = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, useAnalysis, []);
    const literature = [
        {book:'增删卜易', chapter:'暗动章第二十二', level:'精确结构', excerptType:'quote', verified:true, quote:'静爻旺相日辰冲之为暗动，静爻休囚日辰冲之为破。', match:'测试暗动匹配。'},
        {book:'京氏易传', chapter:'八宫·世应·飞伏', level:'条目定位', excerptType:'locator', verified:false, quote:'', match:'测试八宫定位。'}
    ];
    const context = liuyaoInterpretation.buildLiuYaoContextText(result, target, useAnalysis, interpretation, [], literature);
    assert(!/\[[A-Z0-9_]+\]/.test(context), `复制文本泄露机器码：${context.match(/\[[A-Z0-9_]+\]/)?.[0]}`);
    assert(!context.includes('VOID') && !context.includes('DAY_CLASH') && !context.includes('RETREAT'), '复制文本出现内部 code');
    assert(context.includes('旬空') && context.includes('日冲') && context.includes('化退神'), '复制文本丢失用户可读结构');
    assert(context.includes('【结构解读】') && !context.includes('【结构解读 v1】'), '六爻复制上下文仍暴露内部解释版本号');
    assert(context.includes('原文：静爻旺相日辰冲之为暗动，静爻休囚日辰冲之为破。'), '六爻复制上下文未输出古籍原文');
    assert(context.includes('匹配依据：测试暗动匹配。'), '六爻复制上下文缺匹配依据');
    assert(context.includes('条目定位：八宫·世应·飞伏'), '六爻未核对古籍未输出条目定位');
    assert(!context.includes('｜精确结构｜') && !context.includes('已核对来源'), '六爻复制上下文仍输出内部匹配层级或核对状态');
});

test('六爻结构解读合并多重身份：忌神落应爻并与世爻用神冲克', () => {
    const target = { position:6,label:'上爻',relation:'兄弟',branch:'巳',element:'火',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令囚',type:'constraint'},{code:'MONTH_HARMONY',text:'月合',type:'support'},{code:'DAY_GENERATE',text:'日辰生',type:'support'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻' };
    const ying = { position:3,label:'三爻',relation:'官鬼',branch:'亥',element:'水',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令相',type:'support'},{code:'MONTH_GENERATE',text:'月建生',type:'support'}],moveTags:[],isShi:false,isYing:true };
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'卯',element:'木',moving:false,statusTags:[{code:'DAY_COMMAND',text:'临日辰',type:'support'}],moveTags:[],isShi:false,isYing:false},
        {position:2,label:'二爻',relation:'子孙',branch:'丑',element:'土',moving:false,statusTags:[{code:'VOID',text:'旬空',type:'void'}],moveTags:[],isShi:false,isYing:false},
        ying,
        {position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}],moveTags:[],isShi:false,isYing:false},
        {position:5,label:'五爻',relation:'子孙',branch:'未',element:'土',moving:true,changedRelation:'妻财',changedBranch:'申',changedElement:'金',statusTags:[],moveTags:[{code:'TRANSFORM_GROWTH',text:'化长生',type:'support'}],isShi:false,isYing:false},
        target
    ];
    const result = { lines:rows, fullStructure:{ originalNature:'六冲卦',originalNatureCode:'SIX_CLASH',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'六冲卦 → 非六冲六合卦', shiYing:{text:'世爻为上爻兄弟巳火；应爻为三爻官鬼亥水。',tags:[{code:'YING_CONTROLS_SHI',text:'应克世',type:'neutral'},{code:'SHI_YING_SIX_CLASH',text:'世应六冲',type:'trigger'}]}, sanHe:{complete:[],pending:[]},fanFu:[] } };
    const use = liuyao.buildUseGodAnalysis(target, result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, use, []);
    const state = output.judgments.find((item) => item.id === 'use-state');
    const relations = output.judgments.find((item) => item.id === 'use-relations');
    assert(state?.title === '用神月合、日生' && state.summary.includes('世爻兄弟巳火') && state.summary.includes('月合') && state.summary.includes('日辰生') && state.summary.includes('“囚”'), `用神状态未按三层结构收束：${state?.title} / ${state?.summary}`);
    assert(relations?.summary.includes('忌神水见三爻（应）官鬼亥水') && relations.summary.includes('与用神六冲') && relations.summary.includes('克用神'), `忌神=应爻未合并进用神关系链：${relations?.summary}`);
    assert(relations?.summary.includes('五爻子孙未土发动') && relations.summary.includes('变爻为仇神'), `非用神动爻未合并进用神关系链：${relations?.summary}`);
    assert(!output.judgments.some((item) => ['shi-ying','role-overlap','related-moving','deity-chain','use-movement'].includes(item.id)), '旧的重复结构判断仍单独输出');
    assert(use.enemyLines.includes('静（暗动提示）'), `用神链摘要未保留静爻暗动提示：${use.enemyLines}`);
});

test('六爻应期候选按同一日期聚合多个触发依据', () => {
    const merged = liuyao.mergeTimingCandidatesByDate([
        {id:'bound',title:'日月见合：逢冲',reason:'巳与月建见合。',dates:['亥日冲开 · 2026/8/17'],tier:'structure'},
        {id:'static',title:'静爻逢冲',reason:'妻财巳火为静爻。',dates:['亥日冲动 · 2026/8/17'],tier:'regular'}
    ]);
    assert(merged.length === 1, `同日触发未聚合：${JSON.stringify(merged)}`);
    assert(merged[0].title === '亥日 · 2026/8/17', `聚合后的日期标题错误：${merged[0].title}`);
    assert(merged[0].triggers?.length === 2, `聚合后未保留两条触发依据：${JSON.stringify(merged[0])}`);
    assert(merged[0].triggers.some((item) => item.label === '日月见合：逢冲') && merged[0].triggers.some((item) => item.label === '静爻逢冲'), `聚合触发标签异常：${JSON.stringify(merged[0].triggers)}`);
    assert(merged[0].dates.length === 0, '日期已经作为聚合标题时不应再次重复输出日期标签');
    assert(merged[0].tier === 'structure', '同一日期同时含结构触发与常规观察时应归入结构触发');
});

test('六爻复制上下文在未填写占问时提示人工用神边界，并保留暗动状态', () => {
    const target = { position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}],moveTags:[],isShi:false,isYing:false,sourceText:'本卦明爻' };
    const result = { question:'',solarText:'测试',lunarText:'测试',monthGanZhi:'丙申',dayGanZhi:'乙卯',xunKong:'子丑', original:{name:'离',number:30,symbol:'䷝'},changed:{name:'同人',number:13,symbol:'䷌'},palace:{palace:'离',stage:'本宫六世',element:'火'},movingText:'五爻',lines:[target],displayLines:[target],fullStructure:{transition:'六冲卦 → 非六冲六合卦',shiYing:{text:'—',tags:[]},sanHe:{complete:[],pending:[]},fanFu:[]} };
    const use = {sourceElement:'水',sourceLines:'—',tabooElement:'火',tabooLines:'—',enemyElement:'木',enemyLines:'—'};
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,target,use,{headline:'测试',judgments:[]},[],[]);
    assert(text.includes('静爻（暗动提示）'), '复制上下文未保留静爻的暗动提示');
    assert(text.includes('所占之事：未填写') && text.includes('选择方式：当前观察对象为人工选定。'), '未填写占问时缺少简洁的人工观察对象说明');
});



test('六爻复制上下文：静卦不伪造独立变卦，解释与事实层不重复 evidence', () => {
    const rows = [
        {position:1,label:'初爻',spirit:'青龙',relation:'子孙',branch:'辰',element:'土',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令休',type:'neutral'},{code:'DAY_CONTROL',text:'日辰克',type:'constraint'}],moveTags:[],isShi:true,isYing:false},
        {position:2,label:'二爻',spirit:'朱雀',relation:'兄弟',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',spirit:'勾陈',relation:'妻财',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',spirit:'螣蛇',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:5,label:'五爻',spirit:'白虎',relation:'子孙',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',spirit:'玄武',relation:'兄弟',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const target = {...rows[0], type:'line', sourceText:'本卦明爻'};
    const result = {
        question:'', solarText:'2026年8月9日 22:19', lunarText:'丙午年 六月廿七 亥时', monthGanZhi:'丙申', dayGanZhi:'乙卯', xunKong:'子丑',
        original:{symbol:'䷷',name:'旅',number:56}, changed:{symbol:'䷷',name:'旅',number:56}, palace:{palace:'离',stage:'一世',element:'火'}, movingText:'静卦（无动爻）',
        lines:rows, displayLines:[...rows].reverse(),
        fullStructure:{originalNature:'六合卦',originalNatureCode:'SIX_HARMONY',changedNature:'六合卦',changedNatureCode:'SIX_HARMONY',transition:'六合卦 → 六合卦',shiYing:{text:'世爻为初爻子孙辰土；应爻为四爻妻财酉金。',tags:[{code:'SHI_GENERATES_YING',text:'世生应',type:'neutral'},{code:'SHI_YING_SIX_HARMONY',text:'世应六合',type:'transform'}]},sanHe:{complete:[],pending:[]},fanFu:[]},
        flyingHidden:[{position:1,label:'初爻',flyRelation:'子孙',flyBranch:'辰',flyElement:'土',hiddenRelation:'父母',hiddenBranch:'卯',hiddenElement:'木',relationText:'飞来克伏',candidate:true,statusTags:[{code:'DAY_COMMAND',text:'临日辰',type:'support'}]}]
    };
    const use = {sourceElement:'火',sourceLines:'明爻：二爻兄弟午静；变爻未见；伏神候选未见',tabooElement:'木',tabooLines:'明爻未见；变爻未见；伏神候选：初爻下伏父母卯木',enemyElement:'水',enemyLines:'明爻未见；变爻未见；伏神候选未见'};
    const interpretation = {headline:'不应复制',judgments:[{title:'用神日克',summary:'世爻子孙辰土为当前用神。',evidence:['不应复制的重复依据']},{title:'卦体与动变结构',summary:'本卦为六合卦，当前为静卦。',evidence:['六合卦 → 六合卦']}]};
    const literature = [
        {book:'增删卜易',chapter:'月将章',matchKey:'month',quote:'月建总论',verified:true,excerptType:'quote',match:'月建通用规则。'},
        {book:'增删卜易',chapter:'用神章',matchKey:'useGod',quote:'占何人占何事，以何爻为用神。',verified:true,excerptType:'quote',match:'当前观察对象为子孙辰土。'},
        {book:'增删卜易',chapter:'世应章',matchKey:'shiYing',quote:'隔世爻两位即是应爻。',verified:true,excerptType:'quote',match:'当前世应位置已定。'},
        {book:'卜筮正宗',chapter:'飞伏神定例',matchKey:'flyingHidden',quote:'',verified:false,excerptType:'locator',match:'当前有伏神候选。'}
    ];
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,target,use,interpretation,[],literature);
    assert(text.includes('变卦：无独立变卦（静卦）'), `静卦仍伪造独立变卦：${text}`);
    assert(text.includes('卦体：本卦为六合卦；静卦'), '静卦结构事实未收束');
    assert(!text.includes('不应复制的重复依据') && !text.includes('六合卦 → 六合卦'), '复制上下文仍重复输出内部 evidence 或静卦伪变关系');
    assert(text.includes('上爻 · 玄武') && text.includes('初爻（世） · 青龙'), '逐爻状态未带六神');
    assert(text.includes('【飞伏】') && text.includes('飞神子孙辰土') && text.includes('伏神父母卯木') && text.includes('飞来克伏'), '飞伏事实未补足');
    assert(!text.includes('月建通用规则。') && text.includes('当前观察对象为子孙辰土。'), '复制古籍未过滤通用月建条目或丢失直接相关条目');
});

test('六爻静爻应期观察直接说明相冲，不使用“冲动”措辞', () => {
    const target = {relation:'子孙',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[]};
    const result = {castTimestamp:new Date('2026-08-09T12:00:00').getTime(),dayXun:'甲寅',fullStructure:{sanHe:{pendingDetails:[]}}};
    const timing = liuyao.buildTimingCandidates(target,result);
    const item = timing.find((entry)=>entry.triggers?.some((trigger)=>trigger.id==='static'));
    const trigger = item?.triggers?.find((entry)=>entry.id==='static');
    assert(trigger?.reason.includes('戌日与辰相冲'), `静爻常规观察未直接说明相冲：${trigger?.reason}`);
    const coreSource = fs.readFileSync(path.join(ROOT, 'js/liuyao-core.js'), 'utf8');
    assert(coreSource.includes('日相冲') && !coreSource.includes('日冲动`'), '静爻日期标签生成逻辑仍使用“冲动”措辞');
});

test('六爻结构解读下沉详细分析并复用八字解释组件样式', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(/<script src="\.\/js\/liuyao-interpretation\.js(?:\?v=[^"]+)?"><\/script>/.test(html), '未加载六爻解释模块');
    const overviewStart = html.indexOf('v-if="liuyaoResultView === \'overview\'"');
    const detailStart = html.indexOf('v-if="liuyaoResultView === \'detail\'"', overviewStart);
    assert(overviewStart >= 0 && detailStart > overviewStart, '无法定位六爻总览/详细分析页面');
    const overviewHtml = html.slice(overviewStart, detailStart);
    const detailHtml = html.slice(detailStart);
    assert(!overviewHtml.includes('{{ liuyaoInterpretation.headline }}'), '六爻总览仍重复展示结构解读');
    assert(!detailHtml.includes('{{ liuyaoInterpretation.headline }}'), '六爻详细分析仍重复展示结构解读顶部总括');
    assert(detailHtml.includes('class="bazi-interpretation-item"'), '六爻解释未复用现有解释卡样式');
    const interpretationStart = detailHtml.indexOf('<h2 class="panel-title">结构解读</h2>');
    const interpretationEnd = detailHtml.indexOf('<div class="detail-section-title">应期观察</div>', interpretationStart);
    const interpretationHtml = detailHtml.slice(interpretationStart, interpretationEnd);
    assert(!interpretationHtml.includes('查看依据'), '六爻结构解读仍在前台重复展示依据折叠');
    assert(!interpretationHtml.includes('item.evidence'), '六爻结构解读仍把内部 evidence 直接渲染到前台');
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    assert(interpretationHtml.includes('liuyao-interpretation-points') && interpretationHtml.includes('liuyao-interpretation-point'), '六爻结构解读长内容未切换为分点呈现');
    assert(css.includes('.liuyao-interpretation-points') && css.includes('.liuyao-interpretation-point'), '六爻分点解释缺少对应样式');
});

test('六爻总览与详细分析完成职责拆分', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const overviewStart = html.indexOf('v-if="liuyaoResultView === \'overview\'"');
    const detailStart = html.indexOf('v-if="liuyaoResultView === \'detail\'"', overviewStart);
    const overviewHtml = html.slice(overviewStart, detailStart);
    const detailHtml = html.slice(detailStart);
    assert(overviewHtml.includes('卦象总览') && overviewHtml.includes('六爻速览') && overviewHtml.includes('关键结构') && overviewHtml.includes('观察重点'), '六爻总览缺扫盘核心模块');
    assert(!overviewHtml.includes('<div class="detail-section-title">应期观察</div>'), '六爻总览仍重复展示应期观察模块');
    assert(!overviewHtml.includes('使用边界'), '六爻总览仍展示后台边界说明');
    assert(!overviewHtml.includes('@click="copyLiuYaoAnalysisContext"'), '六爻总览仍保留复制分析上下文入口');
    assert(!overviewHtml.includes('legacy-overview-secondary'), '六爻总览仍保留隐藏旧布局 DOM');
    assert(overviewHtml.includes('查看详细分析 →'), '六爻总览缺详细分析跳转');
    assert(detailHtml.includes('详细装卦与逐爻状态') && detailHtml.includes('用神与元忌仇神') && detailHtml.includes('结构解读') && detailHtml.includes('应期观察'), '六爻详细分析核心模块不完整');
    assert(!detailHtml.includes('全卦完整关系'), '六爻详细分析仍保留与结构解读重复的全卦完整关系模块');
    assert(detailHtml.includes('@click="copyLiuYaoAnalysisContext"') && detailHtml.includes('复制分析上下文'), '六爻复制上下文入口未下沉详细分析页');
});


test('八字详细分析 builder 展开强弱、十神、月令与关系网络，不直接复述总览判断', () => {
    const gans = ['丙','丙','乙','壬'];
    const zhis = ['午','申','卯','午'];
    const dayGan = '乙';
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi: zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const result = {
        dayGan,
        dayGanWuXing:'木',
        originalGans:gans,
        originalZhis:zhis,
        pillars,
        internalRelations:bazi.calculateInternalChartRelations(gans, zhis),
        monthSeason:bazi.buildMonthSeason('申', '木'),
        matchedLiterature:[
            {id:'qiong', book:'穷通宝鉴', chapter:'三秋乙木', quote:'三秋乙木', verified:true, match:'日干乙、月令申，对应三秋乙木条。', contextMatch:'日干乙、月令申，对应三秋乙木条。后台核对：丙已见，癸未见。'},
            {id:'ziping', book:'子平真诠', chapter:'论用神成败·正官', quote:'官逢财印', verified:true, match:'月令本气为正官，对应正官相关条目。', contextMatch:'月令本气为正官，对应正官相关条目。后台条件仍需逐项核对。'}
        ]
    };
    const detail = baziDetail.buildBaziDetail(result);
    assert(detail.strength?.seasonRows?.length >= 3, '详细分析缺季节与根气拆解');
    assert(detail.exactTenGodRows.length >= 1, '详细分析应直接提供十神具体落点');
    assert(detail.monthCommand?.mainGod === '正官', `申月乙日月令本气应为正官，实际 ${detail.monthCommand?.mainGod}`);
    assert(detail.relations.branches.length >= 3, '详细分析未展开地支关系网络');
    assert(detail.relations.hubs.some((item) => item.pillar === '日柱' && item.count >= 2), '详细分析未识别关系共同节点');
    assert(detail.relations.threads.length >= 2, '详细分析未把关系整理为综合主线');
    assert(detail.literatureChecks.some((item) => item.book === '穷通宝鉴' && item.check.includes('对应三秋乙木条') && !item.check.includes('癸未见')), '详细分析古籍条件对照未使用 display match 或仍回流 contextMatch');
});


test('八字详细分析增加局部归纳，并清理面向开发实现的展示语言', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','壬'];
    const zhis = ['午','申','卯','午'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi: zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('申', '木');
    const matchedLiterature = baziLit.buildMatchedLiterature(dayGan, gans, zhis, pillars, internalRelations, monthSeason);
    const detail = baziDetail.buildBaziDetail({
        dayGan, dayGanWuXing:'木', originalGans:gans, originalZhis:zhis,
        pillars, internalRelations, monthSeason, matchedLiterature
    });
    assert(detail.strength.summary.includes('乙木在申月为“死”') && detail.strength.summary.includes('本干通根'), `强弱归纳未直接描述当前盘面：${detail.strength.summary}`);
    assert(detail.tenGodSummary.includes('天干见正印、伤官') && detail.tenGodSummary.includes('印星、食伤则在天干与藏干两层均有分布'), `十神归纳未体现当前盘面：${detail.tenGodSummary}`);
    assert(detail.monthCommand.summary.includes('申月以庚金为本气') && detail.monthCommand.summary.includes('正官'), '月令模块缺本节归纳');
    const relationText = detail.relations.threads.map((item) => `${item.title} ${item.summary}`).join('\n');
    assert(relationText.includes('日支卯形成重复六破') && relationText.includes('时干壬形成重复相冲'), `关系网络未把重复作用合成为主线：${relationText}`);
    assert(!relationText.includes('宜') && !relationText.includes('检测'), '关系网络归纳仍夹带阅读方法或实现提示');
    const userChecks = detail.literatureChecks.map((item) => item.check).join('\n');
    assert(!/(本程序|当前程序|程序已识别|可机器核对|机器确认|未编码|matcher)/.test(userChecks), `详细页仍暴露实现语言：${userChecks}`);
});

test('八字详细分析关系网络以节点和合并边呈现三支交叠关系', () => {
    const dayGan = '乙';
    const gans = ['丙','丙','乙','癸'];
    const zhis = ['午','申','卯','未'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const detail = baziDetail.buildBaziDetail({
        dayGan, dayGanWuXing:'木', originalGans:gans, originalZhis:zhis,
        pillars, internalRelations, monthSeason:bazi.buildMonthSeason('申', '木'), matchedLiterature:[]
    });
    const branchGraph = detail.relations.graphs.find((item) => item.scope === 'branch');
    assert(branchGraph, '午申卯未样本没有生成地支关系图');
    assert(branchGraph.nodes.map((item) => item.value).join('') === '午卯未', `关系图节点不应混入无关系的申：${branchGraph.nodes.map((item) => item.value).join('')}`);
    assert(branchGraph.edges.length === 3, `午卯未应形成三条合并边，实际 ${branchGraph.edges.length}`);
    const edgeText = branchGraph.edges.map((item) => item.label).join('\n');
    assert(edgeText.includes('六破'), `关系图缺午卯六破：${edgeText}`);
    assert(edgeText.includes('六合') && edgeText.includes('同方火'), `午未多重关系未合并到同一条边：${edgeText}`);
    assert(edgeText.includes('半合木'), `关系图缺卯未半合木：${edgeText}`);
    assert(branchGraph.summary.includes('彼此交叠') && !branchGraph.summary.includes('连接两端') && !branchGraph.summary.includes('关系重叠'), `关系图摘要仍沿用清单式标题：${branchGraph.summary}`);
    assert(branchGraph.displayMode === 'graph', `三节点三边样本仍应使用关系图，实际 ${branchGraph.displayMode}`);
    assert(branchGraph.edges.find((item) => item.label.includes('六破'))?.tone === 'tension', '六破没有使用 tension 色调');
    assert(branchGraph.edges.find((item) => item.label.includes('六合'))?.tone === 'harmony', '六合/同方没有使用 harmony 色调');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('relation-network-svg') && html.includes('v-for="edge in graph.edges"'), '详细页没有保留节点—连线网络作为简单关系主视图');
    assert(html.includes("graph.displayMode === 'matrix'") && html.includes('relation-matrix'), '详细页没有为复杂关系增加矩阵视图');
});

function buildDetailForStress(gans, zhis) {
    const dayGan = gans[2];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    return baziDetail.buildBaziDetail({
        dayGan, dayGanWuXing:bazi.getWuXing(dayGan), originalGans:gans, originalZhis:zhis,
        pillars, internalRelations:bazi.calculateInternalChartRelations(gans, zhis),
        monthSeason:bazi.buildMonthSeason(zhis[1], bazi.getWuXing(dayGan)), matchedLiterature:[]
    });
}

test('丁丑 壬子 丁亥 己酉：亥子丑三会北方水提升为地支关系一级结构', () => {
    const detail = buildDetailForStress(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const graph = detail.relations.graphs.find((item) => item.scope === 'branch');
    assert(graph, '用户命盘没有生成地支关系结构');
    assert(graph.displayMode === 'graph', `完整三会不应单独触发矩阵，实际 ${graph.displayMode}`);
    assert(graph.title.includes('丑') && graph.title.includes('子') && graph.title.includes('亥') && graph.title.includes('酉'), `地支标题未覆盖完整结构参与支：${graph.title}`);
    assert(graph.majorStructures.length === 1, `用户命盘应有一个完整结构，实际 ${graph.majorStructures.length}`);
    const major = graph.majorStructures[0];
    assert(major.code === 'SAN_HUI_COMPLETE', `用户命盘完整结构类型错误：${major.code}`);
    assert(major.title === '三会北方水', `三会水方没有转换为清晰方位名称：${major.title}`);
    assert(major.participants.map((item) => item.value).join('') === '亥子丑', `三会参与支顺序错误：${major.participants.map((item) => item.value).join('')}`);
    assert(major.participants.map((item) => item.positions).join('|') === '日支|月支|年支', `三会参与柱位映射错误：${major.participants.map((item) => item.positions).join('|')}`);
    assert(graph.summary.startsWith('亥、子、丑三支齐见，构成三会北方水'), `完整三会没有被提升到摘要首句：${graph.summary}`);
    assert(!graph.groupRelations.some((item) => item.label.includes('三会')), '完整三会仍重复留在底部附注');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('relation-major-structures') && html.includes('graph.majorStructures'), '详细页模板没有完整结构一级区域');
});

test('完整三合与完整三刑同样使用一级结构呈现', () => {
    const sanHe = buildDetailForStress(['甲','乙','丙','丁'], ['申','子','辰','酉']).relations.graphs.find((item) => item.scope === 'branch');
    assert(sanHe.majorStructures.some((item) => item.code === 'SAN_HE_COMPLETE' && item.title === '三合水局'), `完整三合未进入一级结构：${JSON.stringify(sanHe.majorStructures)}`);
    const sanXing = buildDetailForStress(['甲','乙','丙','丁'], ['寅','巳','申','酉']).relations.graphs.find((item) => item.scope === 'branch');
    const xing = sanXing.majorStructures.find((item) => item.code === 'PUNISHMENT_TRIAD_COMPLETE');
    assert(xing && xing.title === '寅巳申三刑' && xing.tone === 'tension', `完整三刑一级结构或色调错误：${JSON.stringify(xing)}`);
});

test('复杂地支关系自动切换为矩阵，并保留同一柱位对的多重关系', () => {
    const detail = buildDetailForStress(['甲','乙','丙','丁'], ['子','丑','午','未']);
    const graph = detail.relations.graphs.find((item) => item.scope === 'branch');
    assert(graph, '子丑午未样本没有生成地支关系结构');
    assert(graph.nodes.length === 4, `矩阵样本应有四个参与节点，实际 ${graph.nodes.length}`);
    assert(graph.edges.length === 6, `子丑午未应形成六个柱位对关系，实际 ${graph.edges.length}`);
    assert(graph.displayMode === 'matrix', `四节点六边应切换矩阵，实际 ${graph.displayMode}`);
    const cells = graph.matrixRows.flatMap((row) => row.cells).filter((cell) => cell.kind === 'relation');
    const ziChou = cells.find((cell) => cell.labels.some((item) => item.label === '六合') && cell.labels.some((item) => item.label === '同方水'));
    assert(ziChou, '子丑的六合与同方水没有合并到同一矩阵格');
    const chouWei = cells.find((cell) => cell.labels.some((item) => item.label === '六冲') && cell.labels.some((item) => item.label === '相刑'));
    assert(chouWei, '丑未的六冲与相刑没有合并到同一矩阵格');
    assert(chouWei.labels.every((item) => item.tone === 'tension'), '六冲/相刑矩阵标签没有使用 tension 色调');
});

test('巳申多重关系在矩阵中按关系分别着色，不把和与刑破混成同一色调', () => {
    const detail = buildDetailForStress(['甲','乙','丙','丁'], ['巳','巳','申','申']);
    const graph = detail.relations.graphs.find((item) => item.scope === 'branch');
    assert(graph?.displayMode === 'matrix', '巳巳申申高密关系没有切换矩阵');
    const relationCells = graph.matrixRows.flatMap((row) => row.cells).filter((cell) => cell.kind === 'relation');
    assert(relationCells.length === 4, `巳巳申申应有四个有效矩阵格，实际 ${relationCells.length}`);
    relationCells.forEach((cell) => {
        const labels = Object.fromEntries(cell.labels.map((item) => [item.label, item.tone]));
        assert(labels['六合'] === 'harmony', `巳申六合色调错误：${JSON.stringify(labels)}`);
        assert(labels['六破'] === 'tension' && labels['相刑'] === 'tension', `巳申刑破色调错误：${JSON.stringify(labels)}`);
    });
});

test('回归：丙午 丙申 甲寅 壬申应为天干图、地支矩阵，避免四节点关系交叉叠放', () => {
    const detail = buildDetailForStress(['丙','丙','甲','壬'], ['午','申','寅','申']);
    const stemGraph = detail.relations.graphs.find((item) => item.scope === 'stem');
    const branchGraph = detail.relations.graphs.find((item) => item.scope === 'branch');
    assert(stemGraph?.displayMode === 'graph', `该样本天干应保留关系图，实际 ${stemGraph?.displayMode}`);
    assert(stemGraph.nodes.length === 3 && stemGraph.edges.length === 2, `该样本天干图结构异常：nodes=${stemGraph?.nodes.length}, edges=${stemGraph?.edges.length}`);
    assert(branchGraph?.displayMode === 'matrix', `该样本地支四节点关系应切换矩阵，实际 ${branchGraph?.displayMode}`);
    assert(branchGraph.nodes.length === 4, `该样本地支应有四个柱位节点，实际 ${branchGraph?.nodes.length}`);
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes("graph.edges.length && graph.displayMode === 'graph'") && html.includes("graph.edges.length && graph.displayMode === 'matrix'"), '模板没有按 displayMode 分流图与矩阵，可能再次退化为全部画图');
});

test('四柱地支全部 20736 种排列的关系视图遵守自适应阈值且矩阵数据完整', () => {
    const zhiList = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const gans = ['甲','乙','丙','丁'];
    let checked = 0;
    let graphCases = 0;
    let matrixCases = 0;
    for (const a of zhiList) for (const b of zhiList) for (const c of zhiList) for (const d of zhiList) {
        const detail = buildDetailForStress(gans, [a,b,c,d]);
        const graph = detail.relations.graphs.find((item) => item.scope === 'branch');
        if (!graph || !graph.edges.length) { checked += 1; continue; }
        const shouldMatrix = graph.nodes.length >= 4 || graph.edges.length >= 4;
        assert(graph.displayMode === (shouldMatrix ? 'matrix' : 'graph'), `${a}${b}${c}${d} 自适应模式错误：nodes=${graph.nodes.length}, edges=${graph.edges.length}, mode=${graph.displayMode}`);
        if (shouldMatrix) {
            matrixCases += 1;
            const relationCells = graph.matrixRows.flatMap((row) => row.cells).filter((cell) => cell.kind === 'relation');
            assert(relationCells.length === graph.edges.length, `${a}${b}${c}${d} 矩阵有效格 ${relationCells.length} 与合并边 ${graph.edges.length} 不一致`);
        } else {
            graphCases += 1;
        }
        checked += 1;
    }
    assert(checked === 20736, `压力测试组合数错误：${checked}`);
    assert(graphCases > 0 && matrixCases > 0, `自适应压力测试没有同时覆盖图与矩阵：graph=${graphCases}, matrix=${matrixCases}`);
});

test('八字详细分析只展示实际存在的干支关系，不为零项关系生成空卡', () => {
    const dayGan = '己';
    const gans = ['丁','戊','己','己'];
    const zhis = ['未','辰','未','未'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi: zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    assert(internalRelations.length === 0, '零关系回归样本本身出现了关系');
    const detail = baziDetail.buildBaziDetail({
        dayGan, dayGanWuXing:'土', originalGans:gans, originalZhis:zhis,
        pillars, internalRelations, monthSeason:bazi.buildMonthSeason('辰', '土'), matchedLiterature:[]
    });
    assert(detail.relations.hasAny === false, '零关系命盘仍被标记为有关系');
    assert(detail.relations.summary === '', '零关系命盘仍生成关系说明');
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const detailStart = html.indexOf("v-if=\"baziResultView === 'detail'\"");
    const timingStart = html.indexOf("v-if=\"baziResultView === 'timing'\"", detailStart);
    const detailHtml = html.slice(detailStart, timingStart);
    assert(detailHtml.includes('v-if="baziDetail.relations.hasAny"'), '关系网络没有按实际关系存在性控制显示');
    assert(!detailHtml.includes('未检测到天干') && !detailHtml.includes('未检测到直接地支关系') && !detailHtml.includes('未形成完整三合'), '详细页仍显示零项关系的空状态文案');
    assert(!detailHtml.includes('详细分析使用边界'), '详细页仍保留面向实现说明的高权重边界卡');
});

test('八字详细页清除实现说明与重复阅读指令，只保留命盘描述和必要边界', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const detailStart = html.indexOf("v-if=\"baziResultView === 'detail'\"");
    const timingStart = html.indexOf("v-if=\"baziResultView === 'timing'\"", detailStart);
    const detailHtml = html.slice(detailStart, timingStart);
    assert(!html.includes('三页共用同一命盘数据，切换不会重新排盘'), '八字子导航仍暴露页面实现说明');
    assert(!detailHtml.includes('先看月令与根气') && !detailHtml.includes('先看十神是否明透'), '详细页仍保留重复阅读顺序提示');
    assert(!detailHtml.includes('relations.scopeNote') && !detailHtml.includes('地支 {{') && !detailHtml.includes('天干 {{'), '详细页仍显示统计面板式关系计数');
    assert(!detailHtml.includes('逐层查看') && !detailHtml.includes('可从下方逐项查看'), '详细页仍使用界面操作式归纳文案');
    assert(detailHtml.includes('查看全部干支关系') && !detailHtml.includes('>天干关系<') && !detailHtml.includes('>地支关系<') && !detailHtml.includes('>半合与同方<'), '干支关系网络仍以分类罗列作为主视图');
});

test('八字复制分析上下文入口从原局总览移到详细分析页', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const overviewStart = html.indexOf("v-if=\"baziResultView === 'overview'\"");
    const detailStart = html.indexOf("v-if=\"baziResultView === 'detail'\"", overviewStart);
    const timingStart = html.indexOf("v-if=\"baziResultView === 'timing'\"", detailStart);
    const overviewHtml = html.slice(overviewStart, detailStart);
    const detailHtml = html.slice(detailStart, timingStart);
    assert(!overviewHtml.includes('@click="copyBaziAnalysisContext"'), '原局总览仍保留复制分析上下文入口');
    assert(detailHtml.includes('@click="copyBaziAnalysisContext"') && detailHtml.includes('复制分析上下文'), '详细分析页缺复制分析上下文入口');
});

test('八字结果页增加独立详细分析视图，原局总览与流年流月保持三页并列', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    assert(html.includes("@click=\"setBaziResultView('detail')\">详细分析</button>"), '八字子导航缺详细分析入口');
    assert(html.includes('v-if="baziResultView === \'detail\'"'), '八字详细分析主页面未独立渲染');
    assert(html.includes('日主强弱证据拆解') && html.includes('十神透藏分布') && html.includes('月令主线与显隐') && html.includes('原局关系网络') && html.includes('古籍条件对照'), '八字详细分析核心分区不完整');
    assert(app.includes("['overview', 'detail', 'timing'].includes(view)"), '八字视图切换仍未接受 detail');
});

test('十神透藏分布只保留结构概括与具体落点两层', () => {
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const dayGan = '丁';
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi: zhis[index],
        ganWuXing:bazi.getWuXing(gan),
        zhiWuXing:bazi.getWuXing(zhis[index]),
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:(bazi.cangGanMap[zhis[index]] || []).map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const detail = baziDetail.buildBaziDetail({
        dayGan, dayGanWuXing:'火', originalGans:gans, originalZhis:zhis, pillars,
        internalRelations:bazi.calculateInternalChartRelations(gans, zhis),
        monthSeason:bazi.buildMonthSeason('子', '火'), matchedLiterature:[]
    });
    assert(detail.tenGodSummary === '天干见比肩、食神、正官；藏干另见正印、食神、偏财、正官、七杀。比劫仅见于天干；印星与财星仅藏于地支；食伤、官杀则在天干与藏干两层均有分布。', `十神总述不符合预期：${detail.tenGodSummary}`);
    const exact = Object.fromEntries(detail.exactTenGodRows.map((row) => [row.god, row.text]));
    assert(exact['食神'] === '时干己；年支丑中己（本气）', `食神具体落点异常：${exact['食神']}`);
    assert(exact['正官'] === '月干壬；日支亥中壬（本气）', `正官具体落点异常：${exact['正官']}`);

    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const detailStart = html.indexOf("v-if=\"baziResultView === 'detail'\"");
    const timingStart = html.indexOf("v-if=\"baziResultView === 'timing'\"", detailStart);
    const detailHtml = html.slice(detailStart, timingStart);
    assert(detailHtml.includes('天干与藏干分层观察'), '十神透藏分布辅助文案缺失');
    assert(detailHtml.includes('v-for="row in baziDetail.exactTenGodRows"'), '十神具体落点没有直接展示');
    assert(!detailHtml.includes('v-for="group in baziDetail.tenGodGroups"'), '十神模块仍在页面重复展示五类中间层');
    assert(!detailHtml.includes('查看十神具体落点'), '十神具体落点仍被折叠隐藏');
    assert(!detailHtml.includes('明透 {{ group.visibleCount }}') && !detailHtml.includes('藏支 {{ group.hiddenCount }}') && !detailHtml.includes('明透：{{ row.visibleText }}'), '十神透藏分布仍保留统计式输出');
});

test('证据行长标签不换行且左右文字基线对齐', () => {
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    assert(css.includes('grid-template-columns: 72px minmax(0, 1fr)'), '证据行标签列宽不足，长标签可能再次换行');
    assert(css.includes('.evidence-key { color: #1d4ed8; font-weight: 700; white-space: nowrap; }'), '证据行标签未锁定单行显示');
    assert(css.includes('align-items: baseline'), '证据行没有按文字基线对齐');
    assert(css.includes('.evidence-row > .evidence-value { margin-top: 0; }'), '证据值仍可能继承 margin-top 导致灰字下沉');
});

test('八字详细分析模块独立加载且不新增专用 CSS', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    const interpretationPos = html.indexOf('<script src="./js/bazi-interpretation.js?v=13.44.0"></script>');
    const detailPos = html.indexOf('<script src="./js/bazi-detail.js?v=13.44.0"></script>');
    const appPos = html.indexOf('<script src="./js/app.js?v=13.44.0"></script>');
    assert(interpretationPos >= 0 && detailPos > interpretationPos && appPos > detailPos, 'bazi-detail 加载顺序错误');
    assert(!css.includes('bazi-detail-'), '详细分析新增了专用 CSS，未复用现有组件');
});


test('岁运分析模块按“大运背景—流年叠加—流月触发”分层输出', () => {
    assert(typeof baziTransitAnalysis.buildDaYunAnalysis === 'function', '缺少大运分析 builder');
    assert(typeof baziTransitAnalysis.buildLiuNianAnalysis === 'function', '缺少流年分析 builder');
    assert(typeof baziTransitAnalysis.buildLiuYueAnalysis === 'function', '缺少流月分析 builder');

    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = {
        gan:'甲', zhi:'寅', shiShen:'正印', diShi:'死',
        pillarSignals:[], stemRelations:[],
        relations:bazi.calculateBranchRelations('寅', result.originalZhis)
    };
    const year = {
        year:2026, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官',
        pillarSignals:bazi.calculatePillarSignals('丙','午',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('午',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'午'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'午'},result.originalZhis)
    };
    const month = {
        monthName:'四', gan:'癸', zhi:'巳', shiShen:'七杀', diShi:'帝旺',
        pillarSignals:bazi.calculatePillarSignals('癸','巳',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('癸',result.originalGans),
        relations:bazi.calculateBranchRelations('巳',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'癸',zhi:'巳'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'午'},{gan:'癸',zhi:'巳'},'流年','流月'),
        layeredRelations:bazi.calculateFourLayerRelations(daYun,{gan:'丙',zhi:'午'},{gan:'癸',zhi:'巳'},result.originalZhis)
    };

    const dy = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    assert(dy.rows.some((row) => row.label === '长期背景'), '大运分析缺长期背景层');
    assert(ln.rows.some((row) => row.label === '年度主题'), '流年分析缺年度主题层');
    assert(!ln.rows.some((row) => row.text.includes('未见需优先处理')), '无岁运关系时不应生成否定占位行');
    assert(ly.rows.some((row) => row.label === '节令背景'), '流月分析缺节令背景层');
    assert(!ly.rows.some((row) => row.label === '组合触发') || ly.rows.find((row) => row.label === '组合触发').text.length > 0, '流月组合触发不应输出空结果');
    const seasonText = ly.rows.find((row) => row.label === '节令背景').text;
    assert(seasonText.includes('月属') && seasonText.includes('日主'), `流月节令背景未正面说明月令状态：${seasonText}`);
    ['只作', '不改写', '不重写', '而不是', '并非', '不会', '不直接'].forEach((phrase) => {
        assert(!seasonText.includes(phrase), `流月节令背景仍包含后台边界说明：${phrase}`);
    });
});

test('岁运用户文案只正面说明结构，不暴露后台控制边界', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-transit-analysis.js'), 'utf8');
    ['只作流月节令参考', '不改写原局', '不重写原局', '而不是另起', '不是另成', '并非另成', '不直接判'].forEach((phrase) => {
        assert(!source.includes(phrase), `岁运分析源码仍包含用户可见的边界说明：${phrase}`);
    });
});


test('岁运分析优先完整方局/三层结构，而不是只取第一条二元关系', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['申','午','酉','亥'] };
    const daYun = { gan:'甲', zhi:'子', shiShen:'正印', diShi:'绝', pillarSignals:[], stemRelations:[], relations:bazi.calculateBranchRelations('子',result.originalZhis) };
    const year = {
        year:2030, gan:'庚', zhi:'辰', shiShen:'正财', diShi:'冠带',
        pillarSignals:[], stemRelations:bazi.calculateStemRelations('庚',result.originalGans), relations:bazi.calculateBranchRelations('辰',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'庚',zhi:'辰'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'庚',zhi:'辰'},result.originalZhis)
    };
    assert(year.layeredRelations.some((item) => item.code === 'SAN_HE_COMPLETE'), '测试向量未形成三层三合');
    const analysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const relationRow = analysis.rows.find((row) => row.label === '共同结构');
    assert(relationRow && relationRow.text.includes('三合'), `流年共同结构未解释完整三合：${relationRow?.text || '缺失'}`);
});

test('岁运页面以分析层为主，结构证据不再重复呈现在用户界面', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const transitScript = html.indexOf('<script src="./js/bazi-transit-analysis.js?v=13.44.0"></script>');
    const timingScript = html.indexOf('<script src="./js/bazi-timing.js?v=13.44.0"></script>');
    const appScript = html.indexOf('<script src="./js/app.js?v=13.44.0"></script>');
    assert(transitScript > timingScript && transitScript < appScript, '岁运分析模块加载顺序错误');
    assert(html.includes('activeDaYunAnalysis.headline'), '大运页未接入综合分析');
    assert(html.includes('activeLiuNianAnalysis.headline'), '流年页未接入综合分析');
    assert(html.includes('activeLiuYueAnalysis.headline'), '流月页未接入综合分析');
    assert(!html.includes('查看大运结构证据'), '大运结构证据仍重复显示');
    assert(!html.includes('查看流年详细结构与十二流月'), '流年旧证据折叠仍存在');
    assert(!html.includes('查看流月结构证据'), '流月结构证据仍重复显示');
    assert(html.includes('<span>十二流月（按节令交接）</span>'), '十二流月入口被误删');
    assert(app.includes('activeDaYunAnalysis = computed'), 'app 未建立大运分析 computed');
    assert(app.includes('activeLiuNianAnalysis = computed'), 'app 未建立流年分析 computed');
    assert(app.includes('activeLiuYueAnalysis = computed'), 'app 未建立流月分析 computed');
});

test('流年整柱反吟已覆盖同一柱位的干支冲，不在默认分析重复列出', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生' };
    const year = {
        year:2026, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官',
        pillarSignals:bazi.calculatePillarSignals('丙','午',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('午',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'午'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'午'},result.originalZhis)
    };
    const analysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const text = analysis.rows.map((row) => row.text).join(' ');
    assert(text.includes('流年【丙午】与原局月柱【壬子】天克地冲（反吟）'), '流年未解释月柱反吟');
    assert(!text.includes('流年支【午】与月支【子】见六冲'), '反吟已覆盖月支子午冲，默认层仍重复列出');
    assert(text.includes('流年支【午】与年支【丑】见六害'), '与其他柱位的独立引动被误删');
});

test('流月默认层只显示实际发生的组合与关系，不为未发生结构生成否定行', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', pillarSignals:[], stemRelations:[], relations:[] };
    const year = { year:2026, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[] };
    const month = { monthName:'七', gan:'丙', zhi:'申', shiShen:'劫财', diShi:'沐浴', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], yearRelations:[], layeredRelations:[] };
    const analysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    assert(analysis.rows.length === 1, `无触发流月应只保留节令背景，实际 ${analysis.rows.length} 行`);
    assert(analysis.rows[0].label === '节令背景', '无触发流月首行不是节令背景');
    assert(!analysis.rows.some((row) => row.text.includes('未检测到')), '流月默认层仍输出未发生关系的否定句');
});


test('岁月同一对地支的多重关系合并为一个事实', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', pillarSignals:[], stemRelations:[], relations:[] };
    const year = { year:2019, gan:'己', zhi:'亥', shiShen:'食神', diShi:'胎', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[] };
    const month = {
        monthName:'正', gan:'丙', zhi:'寅', shiShen:'劫财', diShi:'死',
        pillarSignals:bazi.calculatePillarSignals('丙','寅',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('寅',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'寅'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'己',zhi:'亥'},{gan:'丙',zhi:'寅'},'流年','流月'),
        layeredRelations:[]
    };
    const analysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const pairRow = analysis.rows.find((row) => row.label === '层间衔接');
    assert(pairRow?.text.includes('流月支【寅】与流年支【亥】同时见六合、六破'), `岁月六合六破未合并解释：${pairRow?.text || '缺失'}`);
    const originalRow = analysis.rows.find((row) => row.label === '原局作用');
    assert(originalRow?.text.includes('流月支【寅】与日支【亥】见六合、六破'), `原局日支六合六破未合并解释：${originalRow?.text || '缺失'}`);
    assert(!pairRow.text.includes('；流月支【寅】与流年支【亥】见六破'), '同一岁月对象仍被拆成两条事实');
});

test('岁运证据层使用对象、干支值、关系三段式而非重复整句', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', pillarSignals:[], stemRelations:[], relations:[] };
    const year = {
        year:2019, gan:'己', zhi:'亥', shiShen:'食神', diShi:'胎',
        pillarSignals:bazi.calculatePillarSignals('己','亥',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('己',result.originalGans),
        relations:bazi.calculateBranchRelations('亥',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'己',zhi:'亥'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'己',zhi:'亥'},result.originalZhis)
    };
    const analysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    assert(Array.isArray(analysis.evidenceGroups) && analysis.evidenceGroups.length > 0, '流年分析缺 evidenceGroups');
    const items = analysis.evidenceGroups.flatMap((group) => group.items);
    assert(items.every((item) => item.object && item.values && item.relation), '证据行未完整输出 object / values / relation');
    assert(items.some((item) => item.relation === '自刑' && item.object === '二元关系' && item.values.includes('亥（流年支）') && item.values.includes('亥（原局日支）')), '日支亥亥自刑未转为带来源的核对式证据');
    assert(items.every((item) => !item.relation.includes('流年与') && !item.relation.includes('原局已有')), '证据关系字段仍复制完整自然语言结论');
});

test('岁运分析标题移除方法说明式语言', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', pillarSignals:[], stemRelations:[], relations:[] };
    const year = { year:2019, gan:'己', zhi:'亥', shiShen:'食神', diShi:'胎', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[] };
    const month = { monthName:'正', gan:'丙', zhi:'寅', shiShen:'劫财', diShi:'死', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], yearRelations:[], layeredRelations:[] };
    const headlines = [
        baziTransitAnalysis.buildDaYunAnalysis(result, daYun).headline,
        baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year).headline,
        baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month).headline
    ].join(' ');
    assert(!headlines.includes('先看') && !headlines.includes('按短期触发层观察') && !headlines.includes('先以十年层'), `标题仍含方法说明式语言：${headlines}`);
});

test('岁运 evidenceGroups 保留为内部结构数据，但不直接渲染到页面', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(!html.includes('activeDaYunAnalysis.evidenceGroups'), '大运 evidenceGroups 仍直接渲染');
    assert(!html.includes('activeLiuNianAnalysis.evidenceGroups'), '流年 evidenceGroups 仍直接渲染');
    assert(!html.includes('activeLiuYueAnalysis.evidenceGroups'), '流月 evidenceGroups 仍直接渲染');
    assert(!html.includes('transit-evidence-object') && !html.includes('transit-evidence-values'), '证据核对 DOM 仍残留在页面');
});


test('岁运分析解释层间延续、结构补齐与既有结构再动，而非只报关系名', () => {
    const result = { dayGan:'甲', dayGanWuXing:'木', originalGans:['戊','庚','甲','辛'], originalZhis:['辰','申','子','酉'] };
    const daYun = {
        gan:'丙', zhi:'戌', shiShen:'食神', diShi:'养',
        pillarSignals:bazi.calculatePillarSignals('丙','戌',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('戌',result.originalZhis)
    };
    const year = {
        year:2026, gan:'丙', zhi:'午', shiShen:'食神', diShi:'死',
        pillarSignals:bazi.calculatePillarSignals('丙','午',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('午',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'午'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'午'},result.originalZhis)
    };
    const month = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'食神', diShi:'绝',
        pillarSignals:bazi.calculatePillarSignals('丙','申',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('申',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'申'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},'流年','流月'),
        layeredRelations:bazi.calculateFourLayerRelations(daYun,{gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},result.originalZhis)
    };

    const dy = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const dyText = dy.rows.map((row) => row.text).join(' ');
    assert(dyText.includes('大运支【戌】加入后，与原局已有支位会成三会西方金【申酉戌】'), `大运补齐三会未被解释：${dyText}`);
    assert(dyText.includes('大运支【戌】与年支【辰】见六冲，与时支【酉】见六害'), '大运关系未按当前层主语合并');

    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const pairRow = ln.rows.find((row) => row.label === '岁运衔接');
    assert(pairRow?.text.includes('重复大运已经带入的【食神】主题'), `同干未解释为层间延续：${pairRow?.text || '缺失'}`);

    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const linkRow = ly.rows.find((row) => row.label === '层间衔接');
    assert(linkRow?.text.includes('流月干与流年、大运干同为【丙】'), `三层同干未合并解释：${linkRow?.text || '缺失'}`);
    assert(linkRow?.text.includes('延续前两层的【食神】主题'), '三层同干仍停留在关系名层面');
    const structureRow = ly.rows.find((row) => row.label === '结构变化');
    assert(structureRow?.text.includes('再次参与前三层已成的'), `流月再动未解释：${structureRow?.text || '缺失'}`);
});

test('原局完整结构被岁运再次触及时以当前时间层为主语简洁说明', () => {
    const result = { dayGan:'丁', dayGanWuXing:'火', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] };
    const daYun = { gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', pillarSignals:[], stemRelations:[], relations:[] };
    const year = {
        year:2019, gan:'己', zhi:'亥', shiShen:'食神', diShi:'胎',
        pillarSignals:bazi.calculatePillarSignals('己','亥',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('己',result.originalGans),
        relations:bazi.calculateBranchRelations('亥',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'己',zhi:'亥'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'己',zhi:'亥'},result.originalZhis)
    };
    const analysis = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const text = analysis.rows.map((row) => row.text).join(' ');
    assert(text.includes('流年支【亥】再次参与原局已成的三会北方水【亥子丑】'), `原局三会再动未命中：${text}`);
    assert(!text.includes('不是另成') && !text.includes('而不是'), '再动解释仍使用多余的反向排除句');
});


test('流月既有完整结构只在层间结构解释一次，不再在原局作用重复', () => {
    const result = { dayGan:'己', dayGanWuXing:'土', originalGans:['戊','庚','己','辛'], originalZhis:['辰','申','子','酉'] };
    const daYun = { gan:'丙', zhi:'戌', shiShen:'正印', diShi:'养', pillarSignals:[], stemRelations:[], relations:[] };
    const year = { year:2026, gan:'丙', zhi:'午', shiShen:'正印', diShi:'临官', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[] };
    const month = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'正印', diShi:'沐浴',
        pillarSignals:bazi.calculatePillarSignals('丙','申',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('申',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'申'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},'流年','流月'),
        layeredRelations:bazi.calculateFourLayerRelations(daYun,{gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},result.originalZhis)
    };
    const analysis = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const structureRow = analysis.rows.find((row) => row.label === '结构变化');
    const originalRow = analysis.rows.find((row) => row.label === '原局作用');
    assert(structureRow?.text.includes('三合水局【申子辰】'), '流月层间结构未保留原局三合再动解释');
    assert(!originalRow?.text.includes('原局已成三合水局【申子辰】'), `同一三合再动在原局作用重复：${originalRow?.text || '缺失'}`);
});


test('岁运自然语言以当前时间层为主语，合并同一干支的多项原局关系', () => {
    const result = { dayGan:'己', dayGanWuXing:'土', originalGans:['戊','庚','己','辛'], originalZhis:['辰','申','亥','酉'] };
    const daYun = {
        gan:'丙', zhi:'戌', shiShen:'正印', diShi:'养',
        pillarSignals:bazi.calculatePillarSignals('丙','戌',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('戌',result.originalZhis)
    };
    const year = {
        year:2026, gan:'丙', zhi:'午', shiShen:'正印', diShi:'临官',
        pillarSignals:bazi.calculatePillarSignals('丙','午',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('午',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'午'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'午'},result.originalZhis)
    };
    const month = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'正印', diShi:'沐浴',
        pillarSignals:bazi.calculatePillarSignals('丙','申',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('申',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'申'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},'流年','流月'),
        layeredRelations:[]
    };

    const dy = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const dyPoint = dy.rows.find((row) => row.label === '关系落点')?.text || '';
    assert(dyPoint.includes('大运支【戌】与年支【辰】见六冲，与时支【酉】见六害'), `大运多项关系未合并：${dyPoint}`);

    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const lnLink = ln.rows.find((row) => row.label === '岁运衔接')?.text || '';
    assert(lnLink.includes('流年干与大运干同为【丙】，重复大运已经带入的【正印】主题，属于层间延续'), `流年主语或衔接文案不自然：${lnLink}`);

    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const lyOriginal = ly.rows.find((row) => row.label === '原局作用')?.text || '';
    assert(lyOriginal.includes('流月支【申】参与原局拱子水组合【申辰】、同方金组合【申酉】，并与日支【亥】见六害'), `流月原局作用未合并成自然句：${lyOriginal}`);

    const allText = [...dy.rows, ...ln.rows, ...ly.rows].map((row) => row.text).join(' ');
    ['这项二元关系直接落在', '作用位置在原局', '而不是另起', '不是另成一组', '属于既有两支组合在这一时间层的再次参与'].forEach((phrase) => {
        assert(!allText.includes(phrase), `岁运文案仍残留模板化短语：${phrase}`);
    });
});




test('岁运原局关系按相同对象与相同关系合并重复柱位，避免逐柱填空式复述', () => {
    const result = {
        dayGan:'甲', dayGanWuXing:'木',
        originalGans:['甲','甲','丙','丁'],
        originalZhis:['卯','卯','未','戌']
    };
    const makeTransit = (label, gan, zhi, extra = {}) => ({
        gan, zhi, shiShen:'正财', diShi:'胎',
        pillarSignals:bazi.calculatePillarSignals(gan,zhi,result.originalGans,result.originalZhis,label),
        stemRelations:bazi.calculateStemRelations(gan,result.originalGans),
        relations:bazi.calculateBranchRelations(zhi,result.originalZhis),
        ...extra
    });

    const daYun = makeTransit('大运','己','子');
    const dyText = baziTransitAnalysis.buildDaYunAnalysis(result, daYun).rows.map((row) => row.text).join(' ');
    assert(dyText.includes('大运支【子】与年支和月支【卯】均见子卯无礼之刑'), `大运重复卯刑仍逐柱复述：${dyText}`);
    assert(dyText.includes('大运干【己】与年干和月干【甲】均见天干五合'), `大运重复天干关系仍逐柱复述：${dyText}`);
    assert(!dyText.includes('与年支【卯】见子卯无礼之刑，与月支【卯】见子卯无礼之刑'), '大运重复卯刑未合并');

    const baseYun = { gan:'庚', zhi:'申', shiShen:'七杀', diShi:'绝', pillarSignals:[], stemRelations:[], relations:[] };
    const year = makeTransit('流年','己','子', {
        year:2026,
        yunRelations:bazi.calculatePairRelations(baseYun,{gan:'己',zhi:'子'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(baseYun,{gan:'己',zhi:'子'},result.originalZhis)
    });
    const lnOriginal = baziTransitAnalysis.buildLiuNianAnalysis(result, baseYun, year).rows.find((row) => row.label === '原局作用')?.text || '';
    assert(lnOriginal.includes('流年支【子】与年支和月支【卯】均见子卯无礼之刑'), `流年重复卯刑仍逐柱复述：${lnOriginal}`);

    const month = makeTransit('流月','己','子', {
        monthName:'十一',
        yunRelations:bazi.calculatePairRelations(baseYun,{gan:'己',zhi:'子'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'辛',zhi:'酉'},{gan:'己',zhi:'子'},'流年','流月'),
        layeredRelations:[]
    });
    const dummyYear = { year:2026, gan:'辛', zhi:'酉', shiShen:'正官', diShi:'沐浴', pillarSignals:[], stemRelations:[], relations:[], yunRelations:[], layeredRelations:[] };
    const lyOriginal = baziTransitAnalysis.buildLiuYueAnalysis(result, baseYun, dummyYear, month).rows.find((row) => row.label === '原局作用')?.text || '';
    assert(lyOriginal.includes('流月支【子】与年支和月支【卯】均见子卯无礼之刑'), `流月重复卯刑仍逐柱复述：${lyOriginal}`);
});

test('八字原局总览完成职责收束：月令只留强弱线索，关系概览不再复述全量清单', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    const appSource = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const baziStart = html.indexOf("<div v-if=\"currentPage === 'result' && activeModule === 'bazi'");
    const detailStart = html.indexOf("<main v-if=\"baziResultView === 'detail'\"", baziStart);
    const overviewHtml = html.slice(baziStart, detailStart);
    assert(overviewHtml.includes('月令与强弱线索'), '原局总览未采用“月令与强弱线索”');
    assert(!overviewHtml.includes('月令与结构证据'), '原局总览仍保留旧标题“月令与结构证据”');
    assert(overviewHtml.includes('原局关系概览'), '原局总览缺“原局关系概览”');
    assert(overviewHtml.includes('baziDetail.relations.graphs'), '关系概览未复用已合并的关系图数据');
    assert(overviewHtml.includes('graph.overviewLines'), '关系概览未按关系逐条换行');
    assert(!overviewHtml.includes('查看全部干支关系（'), '原局总览仍重复提供全量关系清单');
    assert(!overviewHtml.includes('relation-tag'), '原局关系概览仍使用与周围文字不协调的彩色关系标签');
    assert(!overviewHtml.includes('section-soft-warm'), '原局关系概览仍继承暖色卡片样式');
    assert(!overviewHtml.includes('查看关系网络 →'), '原局关系概览仍保留多余的关系网络跳转');
    assert(css.includes('.overview-relation-label') && css.includes('color: #1d4ed8;'), '关系概览标签未与左侧证据标签统一');
    assert(css.includes('.overview-relation-text') && css.includes('color: #334155;'), '关系概览正文未与左侧证据正文统一');
    assert(!appSource.includes('baziKeyRelations'), '总览关系标签移除后仍残留 baziKeyRelations 计算');
});

test('八字原局总览月令线索不再与关系模块重复方局信息', () => {
    const dayGan = '丁';
    const gans = ['丁','壬','丁','己'];
    const zhis = ['丑','子','亥','酉'];
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const relations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason('子', '火');
    const rows = bazi.buildDayMasterEvidence(pillars, monthSeason, relations, dayGan);
    assert(rows.map((row) => row.key).join('|') === '月令|根气|扶助|泄耗克', `总览强弱线索职责异常：${rows.map((row) => row.key).join('|')}`);
    assert(!rows.some((row) => row.key === '方局'), '方局仍在月令线索与关系概览两处重复');
    assert(rows.find((row) => row.key === '月令')?.value === '子月属冬，日主火处“死”。', '月令线索仍夹带方法边界说明');
});

test('八字三页命名与前台文案经过全体审视，时间页明确包含大运', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('>岁运分析</button>'), '八字结果子导航未统一为“岁运分析”');
    assert(html.includes('<div class="result-page-intro-title">大运流年流月</div>'), '岁运页标题仍遗漏大运');
    assert(html.includes("'大运流年流月分析'"), '结果工具栏标题仍遗漏大运');
    assert(!html.includes('典籍参考与使用边界'), '原局总览仍把“使用边界”作为前台栏目标题');
    assert(html.includes('典籍参考说明'), '典籍参考栏目未采用正向说明标题');
    assert(!html.includes('原局总览不再被时间信息挤压'), '总览仍暴露页面重构过程说明');
});

test('八字结构解读前台只描述命盘结构，后台限制仍保留给复制上下文', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-interpretation.js'), 'utf8');
    const result = {
        dayGan:'乙', dayGanWuXing:'木', originalGans:['丙','丙','乙','戊'], originalZhis:['午','申','卯','寅']
    };
    result.pillars = result.originalGans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:result.originalZhis[index], ganZhi:gan + result.originalZhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[result.dayGan][gan],
        cangGan:bazi.cangGanMap[result.originalZhis[index]].map(([hiddenGan, level]) => ({gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[result.dayGan][hiddenGan]}))
    }));
    result.internalRelations = bazi.calculateInternalChartRelations(result.originalGans, result.originalZhis);
    result.monthSeason = bazi.buildMonthSeason('申','木');
    const interpretation = baziInterpretation.buildBaziInterpretation(result);
    const visibleText = interpretation.judgments.map((item) => `${item.title} ${item.summary}`).join(' ');
    ['需要同时观察', '不能只据', '不宜只取', '解释时应先看', '仍需结合'].forEach((phrase) => {
        assert(!visibleText.includes(phrase), `结构解读前台仍有方法说明式文案：${phrase}`);
    });
    assert(Array.isArray(interpretation.limitations) && interpretation.limitations.length >= 1, '解释对象内部边界被误删');
    const contextText = baziInterpretation.buildBaziContextText(result, interpretation);
    assert(contextText.includes('【Assessment｜作用与结论层】') && contextText.includes('不得自动升级为实际效力判断'), '复制分析上下文未在 Assessment 层保留全局边界');
    assert(!contextText.includes('【使用边界】'), '复制分析上下文仍重复输出独立使用边界区');
});


test('原局关系概览提供逐条关系行，不再把多项关系压成一段摘要', () => {
    const result = {
        originalGans:['丁','壬','丁','己'],
        originalZhis:['丑','子','亥','酉'],
        dayGan:'丁', dayGanWuXing:'火',
        pillars:[]
    };
    result.pillars = result.originalGans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:result.originalZhis[index],
        ganZhi:gan + result.originalZhis[index], shishenGan:index === 2 ? '日主' : bazi.shiShenMap[result.dayGan][gan],
        cangGan:bazi.cangGanMap[result.originalZhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[result.dayGan][hiddenGan]
        }))
    }));
    result.internalRelations = bazi.calculateInternalChartRelations(result.originalGans, result.originalZhis);
    result.monthSeason = bazi.buildMonthSeason('子','火');
    result.matchedLiterature = [];
    const detail = baziDetail.buildBaziDetail(result);
    const branchGraph = detail.relations.graphs.find((graph) => graph.scope === 'branch');
    assert(branchGraph && branchGraph.overviewLines.length >= 3, `地支关系没有拆成多行：${branchGraph?.overviewLines?.join(' | ')}`);
    assert(branchGraph.overviewLines.some((line) => line.includes('三会北方水')), '完整三会未进入关系概览逐条行');
    assert(branchGraph.overviewLines.every((line) => /[。！？]$/.test(line)), '关系概览逐条行缺少完整句末标点');
});

test('原局总览底部同时提供详细分析与岁运分析两个同级入口', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    const overviewStart = html.indexOf('<aside v-if="baziResultView === \'overview\'"');
    const detailStart = html.indexOf('<main v-if="baziResultView === \'detail\'"', overviewStart);
    const overviewHtml = html.slice(overviewStart, detailStart);
    assert(overviewHtml.includes('查看详细分析 →'), '原局总览底部缺“查看详细分析”入口');
    assert(overviewHtml.includes('查看岁运分析 →'), '原局总览底部缺“查看岁运分析”入口');
    assert(overviewHtml.includes('class="result-link-actions"'), '原局总览双入口未使用统一按钮组');
    assert(css.includes('.result-link-actions'), '双入口缺少按钮组响应式样式');
    assert(!html.includes('查看流年流月 →'), '八字结果页仍残留旧“查看流年流月”导航文案');
});


test('岁运关系事实在文案生成前按对象值、关系组与柱位统一标准化', () => {
    const result = {
        dayGan:'甲', dayGanWuXing:'木',
        originalGans:['甲','乙','丙','丁'],
        originalZhis:['酉','申','午','酉']
    };
    const daYun = {
        gan:'戊', zhi:'辰', shiShen:'偏财', diShi:'衰',
        pillarSignals:bazi.calculatePillarSignals('戊','辰',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('戊',result.originalGans),
        relations:bazi.calculateBranchRelations('辰',result.originalZhis)
    };
    const analysis = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const point = analysis.rows.find((row) => row.label === '关系落点')?.text || '';
    assert(point.includes('大运支【辰】与原局支位形成拱子水组合【申辰】'), `半合结构未保留：${point}`);
    assert(point.includes('与年支和时支【酉】均见六合'), `重复酉六合未在事实层合并：${point}`);
    assert(!point.includes('与年支【酉】见六合，与时支【酉】见六合'), `仍逐柱生成重复六合：${point}`);

    const compact = baziTransitAnalysis.compactRelationGroups(daYun.relations, '大运');
    const facts = baziTransitAnalysis.normalizeInteractionFacts(compact);
    const heFact = facts.branch.direct.find((fact) => !fact.loose && fact.originalValue === '酉' && fact.labels.includes('六合'));
    assert(heFact && heFact.indices.length === 2 && heFact.indices[0] === 0 && heFact.indices[1] === 3,
        `标准化事实未合并年支/时支酉：${JSON.stringify(heFact)}`);
});

test('重复原局支的多重关系也作为一个事实合并，不按柱位拆句', () => {
    const result = {
        dayGan:'甲', dayGanWuXing:'木',
        originalGans:['甲','乙','丙','丁'],
        originalZhis:['申','午','亥','申']
    };
    const daYun = {
        gan:'戊', zhi:'巳', shiShen:'偏财', diShi:'病',
        pillarSignals:bazi.calculatePillarSignals('戊','巳',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('戊',result.originalGans),
        relations:bazi.calculateBranchRelations('巳',result.originalZhis)
    };
    const text = baziTransitAnalysis.buildDaYunAnalysis(result, daYun).rows.map((row) => row.text).join(' ');
    const repeatedShen = text.match(/与年支和时支【申】均见([^。；]+)/)?.[1] || '';
    assert(repeatedShen.includes('六合') && repeatedShen.includes('六破') && repeatedShen.includes('相刑'),
        `巳申多重关系未合并为同一事实：${text}`);
    assert(!text.includes('与年支【申】') || !text.includes('与时支【申】'), `巳申多重关系仍按柱位重复：${text}`);
});

test('岁运分析页提供独立复制上下文入口，并复用详细页轻量工具样式', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const timingStart = html.indexOf(`<main v-if="baziResultView === 'timing'`);
    const timingEnd = html.indexOf(`<section v-if="baziResultView === 'overview' class="panel-card ui-layer-reference`, timingStart);
    const timingHtml = html.slice(timingStart, timingEnd);
    assert(timingHtml.includes('@click="copyBaziTransitAnalysisContext"'), '岁运分析页缺复制岁运上下文入口');
    assert(timingHtml.includes('复制岁运上下文'), '岁运复制入口文案缺失');
    assert(timingHtml.includes('result-page-utility-button'), '岁运复制入口未复用轻量工具按钮样式');
    assert(timingHtml.includes('copyBaziTransitContextStatus'), '岁运复制状态提示未接入页面');
});

test('岁运复制上下文包含原局、大运、流年、流月与结构证据，且不泄露机器关系码', () => {
    assert(typeof baziTransitAnalysis.buildBaziTransitContextText === 'function', '缺少岁运上下文 builder');
    const result = {
        pillars:[{ganZhi:'丁丑'},{ganZhi:'壬子'},{ganZhi:'丁亥'},{ganZhi:'己酉'}],
        dayGan:'丁', dayGanWuXing:'火', monthSeason:{monthZhi:'子',season:'冬'},
        lunarStr:'丁丑年 冬月', ruleSummary:'年柱立春、月柱节令',
        originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'],
        internalRelations:[{text:'亥、子、丑三支齐见，构成三会北方水'}]
    };
    const interpretation = {
        headline:'官杀与印比并见。',
        judgments:[{title:'原局主线',summary:'月令与根气需要合并观察。'}]
    };
    const daYun = {
        gan:'己', zhi:'酉', shiShen:'食神', diShi:'长生', naYin:'大驿土', xun:'甲辰', xunKong:'寅卯',
        startYear:2019,endYear:2028,startAge:23,endAge:32,
        pillarSignals:bazi.calculatePillarSignals('己','酉',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('己',result.originalGans),
        relations:bazi.calculateBranchRelations('酉',result.originalZhis)
    };
    const year = {
        year:2026, age:30, gan:'丙', zhi:'午', shiShen:'劫财', diShi:'临官', naYin:'天河水', xun:'甲辰', xunKong:'寅卯',
        pillarSignals:bazi.calculatePillarSignals('丙','午',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('午',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'午'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'午'},result.originalZhis)
    };
    const month = {
        monthName:'七', gan:'丙', zhi:'申', shiShen:'劫财', diShi:'沐浴', naYin:'山下火', xun:'甲午', xunKong:'辰巳',
        rangeText:'立秋 2026-08-07 起，至白露 2026-09-07 前',
        pillarSignals:bazi.calculatePillarSignals('丙','申',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('申',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'申'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},'流年','流月'),
        layeredRelations:bazi.calculateFourLayerRelations(daYun,{gan:'丙',zhi:'午'},{gan:'丙',zhi:'申'},result.originalZhis)
    };
    const dy = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const text = baziTransitAnalysis.buildBaziTransitContextText(result, interpretation, {
        daYun, liuNian:year, liuYue:month,
        daYunAnalysis:dy, liuNianAnalysis:ln, liuYueAnalysis:ly
    });
    assert(text.includes('【龟甲 · 岁运分析上下文】'), '岁运上下文标题缺失');
    assert(text.includes('四柱：丁丑 壬子 丁亥 己酉'), '岁运上下文缺原局四柱');
    assert(text.includes('【当前大运】') && text.includes('大运：己酉 · 食神运'), '岁运上下文缺当前大运');
    assert(text.includes('【当前流年】') && text.includes('流年：2026年 · 丙午 · 劫财'), '岁运上下文缺当前流年');
    assert(text.includes('【当前流月】') && text.includes('流月：七月 · 丙申 · 劫财'), '岁运上下文缺当前流月');
    assert(text.includes('结构证据：'), '岁运上下文缺结构证据');
    assert(text.includes('解释提示：') && text.includes('结构事实：'), '岁运上下文未区分解释提示与结构事实');
    assert(text.includes('【使用要求】'), '岁运上下文缺使用要求');
    assert(text.includes('仅在结构事实明确标记为补齐时说明结构补齐'), '岁运上下文未把补齐改为条件式措辞');
    assert(!text.includes('延续、补齐、再次参与与新增关系'), '岁运上下文仍无条件要求寻找结构补齐');
    assert(!/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/.test(text), `岁运复制上下文泄露机器关系码：${text.match(/BRANCH_|LAYER_|SAN_HE_|SAN_HUI_|PILLAR_/)?.[0] || ''}`);
});

test('岁运分析脚本使用版本化 URL，升级后避免浏览器继续命中旧文案缓存', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('<script src="./js/bazi-transit-analysis.js?v=13.44.0"></script>'), '岁运分析脚本缓存版本参数未同步');
    assert(!html.includes('<script src="./js/bazi-transit-analysis.js"></script>'), '仍保留未版本化的岁运分析脚本加载');
});


test('全部 12^4 原局地支 × 12 外来支的直接关系标准化不会把同值同关系拆成多条事实', () => {
    const zhis = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    let checked = 0;
    for (const a of zhis) for (const b of zhis) for (const c of zhis) for (const d of zhis) {
        const originals = [a,b,c,d];
        for (const target of zhis) {
            const relations = bazi.calculateBranchRelations(target, originals);
            const compact = baziTransitAnalysis.compactRelationGroups(relations, '压力测试');
            const interactionCompact = compact.filter((group) => {
                const first = group.members?.[0] || group;
                return !['SAN_HE_COMPLETE','SAN_HUI_COMPLETE','PUNISHMENT_TRIAD_COMPLETE'].includes(first.code);
            });
            const directGroups = interactionCompact.filter((group) => {
                const first = group.members?.[0] || group;
                return first.type !== 'stem'
                    && first.code !== 'SAN_HE_PARTIAL'
                    && first.code !== 'SAN_HUI_PARTIAL';
            });
            const expected = new Map();
            directGroups.forEach((group) => {
                const first = group.members?.[0] || group;
                const indices = [...new Set((group.members || [first]).flatMap((member) => member.pillarIndices || []))];
                if (!indices.length) return;
                const labels = [...new Set((group.members || [first]).map((relation) => {
                    if (relation.code === 'BRANCH_SIX_CLASH') return '六冲';
                    if (relation.code === 'BRANCH_SIX_HARMONY') return '六合';
                    if (relation.code === 'BRANCH_SIX_HARM') return '六害';
                    if (relation.code === 'BRANCH_SIX_BREAK') return '六破';
                    if (relation.code === 'SELF_PUNISHMENT') return '自刑';
                    if (relation.code === 'BRANCH_PUNISHMENT') return relation.text.match(/构成([^；。]+)/)?.[1] || '相刑';
                    return relation.text || relation.code;
                }))];
                const key = `${target}|${first.originalZhi || ''}|${[...labels].sort().join('|')}|${first.code === 'SELF_PUNISHMENT' ? 'self' : 'direct'}`;
                if (!expected.has(key)) expected.set(key, new Set());
                indices.forEach((index) => expected.get(key).add(index));
            });

            const facts = baziTransitAnalysis.normalizeInteractionFacts(interactionCompact).branch.direct.filter((fact) => !fact.loose);
            const actual = new Map();
            facts.forEach((fact) => {
                const key = `${fact.targetValue}|${fact.originalValue}|${[...fact.labels].sort().join('|')}|${fact.selfPunishment ? 'self' : 'direct'}`;
                assert(!actual.has(key), `标准化后仍存在重复事实：${originals.join('')} + ${target} => ${key}`);
                actual.set(key, new Set(fact.indices));
            });
            expected.forEach((indices, key) => {
                assert(actual.has(key), `标准化事实缺失：${originals.join('')} + ${target} => ${key}`);
                assert([...indices].every((index) => actual.get(key).has(index)), `标准化事实遗漏柱位：${originals.join('')} + ${target} => ${key}`);
            });
            checked += 1;
        }
    }
    assert(checked === 248832, `岁运地支标准化压力测试数量异常：${checked}`);
});


test('岁运结构证据记录每个成员来源，完整结构成立后不重复下级半合/同方', () => {
    const result = {
        pillars:[{ganZhi:'丙午'},{ganZhi:'丙申'},{ganZhi:'乙卯'},{ganZhi:'丙戌'}],
        dayGan:'乙', dayGanWuXing:'木', monthSeason:{monthZhi:'申',season:'秋'},
        lunarStr:'丙午年 六月廿七 戌时', ruleSummary:'年柱立春、月柱节令',
        originalGans:['丙','丙','乙','丙'], originalZhis:['午','申','卯','戌'],
        internalRelations:bazi.calculateInternalChartRelations(['丙','丙','乙','丙'],['午','申','卯','戌'])
    };
    const daYun = {
        gan:'丁', zhi:'酉', shiShen:'食神', diShi:'绝', naYin:'山下火', xun:'甲午', xunKong:'辰巳',
        startYear:2036,endYear:2045,startAge:11,endAge:20,
        pillarSignals:bazi.calculatePillarSignals('丁','酉',result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations('丁',result.originalGans), relations:bazi.calculateBranchRelations('酉',result.originalZhis)
    };
    const year = {
        year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带',naYin:'沙中土',xun:'甲寅',xunKong:'子丑',
        pillarSignals:bazi.calculatePillarSignals('丙','辰',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans), relations:bazi.calculateBranchRelations('辰',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丙',zhi:'辰'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丙',zhi:'辰'},result.originalZhis)
    };
    const month = {
        monthName:'正',gan:'庚',zhi:'寅',shiShen:'正官',diShi:'帝旺',naYin:'松柏木',xun:'甲申',xunKong:'午未',
        rangeText:'立春 2036-02-04 14:19 起，至 惊蛰 2036-03-05 08:11 前',
        pillarSignals:bazi.calculatePillarSignals('庚','寅',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('庚',result.originalGans), relations:bazi.calculateBranchRelations('寅',result.originalZhis),
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'庚',zhi:'寅'},'大运','流月'),
        yearRelations:bazi.calculatePairRelations({gan:'丙',zhi:'辰'},{gan:'庚',zhi:'寅'},'流年','流月'),
        layeredRelations:bazi.calculateFourLayerRelations(daYun,{gan:'丙',zhi:'辰'},{gan:'庚',zhi:'寅'},result.originalZhis)
    };
    const dy = baziTransitAnalysis.buildDaYunAnalysis(result, daYun);
    const ln = baziTransitAnalysis.buildLiuNianAnalysis(result, daYun, year);
    const ly = baziTransitAnalysis.buildLiuYueAnalysis(result, daYun, year, month);
    const monthOriginal = ly.rows.find((row) => row.label === '原局作用')?.text || '';
    assert(!monthOriginal.includes('同方木组合【寅卯】'), `完整三会成立后仍重复同方木：${monthOriginal}`);
    assert(!monthOriginal.includes('半合'), `完整结构成立后仍重复下级半合：${monthOriginal}`);
    const text = baziTransitAnalysis.buildBaziTransitContextText(result, {headline:'测试',judgments:[]}, {
        daYun, liuNian:year, liuYue:month, daYunAnalysis:dy, liuNianAnalysis:ln, liuYueAnalysis:ly
    });
    assert(text.includes('完整结构｜申（原局月支） · 酉（大运支） · 戌（原局时支）｜三会西方金｜大运补齐'), '大运三会成员来源未标清');
    assert(text.includes('组合结构｜申（原局月支） · 辰（流年支）｜拱子水｜流年形成'), '流年拱子水错误标成原局组合');
    assert(text.includes('完整结构｜寅（流月支） · 午（原局年支） · 戌（原局时支）｜三合火局｜流月补齐'), '流月三合火成员来源未标清');
    assert(text.includes('完整结构｜寅（流月支） · 卯（原局日支） · 辰（流年支）｜三会东方木｜流月补齐'), '跨层三会木成员来源未标清');
    assert(!text.includes('原局三合火局'), '上下文仍把流月补齐的三合火误称原局三合');
    assert(!text.includes('原局组合｜寅卯'), '上下文仍把流月形成的寅卯误称原局组合');
});

test('大运 builder 可输出精确交运区间供岁运上下文使用', () => {
    const makeSolar = (year, month, day, hour, minute) => ({
        getYear:()=>year, getMonth:()=>month, getDay:()=>day, getHour:()=>hour, getMinute:()=>minute,
        nextYear:(offset)=>makeSolar(year + offset, month, day, hour, minute)
    });
    const daYunRaw = {
        getIndex:()=>1, getGanZhi:()=> '癸亥', getStartYear:()=>2028, getEndYear:()=>2037,
        getStartAge:()=>32, getEndAge:()=>41, getXun:()=> '甲寅旬', getXunKong:()=> '子丑', getLiuNian:()=>[]
    };
    const yun = { getStartSolar:()=>makeSolar(2027,3,4,5,26), getDaYun:()=>[daYunRaw] };
    const profile = baziTiming.buildYunProfile({getYun:()=>yun}, { gender:'1', yunSect:'1', dayGan:'丁', originalGans:['丁','壬','丁','己'], originalZhis:['丑','子','亥','酉'] });
    const item = profile.daYunList[0];
    assert(profile.qiYunInfo.includes('05:26交运'), `起运分钟未保留：${profile.qiYunInfo}`);
    assert(item.startDateTimeText === '2027-03-04 05:26', `大运精确起点错误：${item.startDateTimeText}`);
    assert(item.endDateTimeText === '2037-03-04 05:26', `大运精确终点错误：${item.endDateTimeText}`);
});



test('精确交运区间可切分普通年份、交运年与跨交运流月', () => {
    const prev = {
        gan:'丙', zhi:'申', shiShen:'伤官',
        startDate:new Date(2026,3,19,19,20), endDate:new Date(2036,3,19,19,20),
        startDateTimeText:'2026-04-19 19:20', endDateTimeText:'2036-04-19 19:20'
    };
    const next = {
        gan:'丁', zhi:'酉', shiShen:'食神',
        startDate:new Date(2036,3,19,19,20), endDate:new Date(2046,3,19,19,20),
        startDateTimeText:'2036-04-19 19:20', endDateTimeText:'2046-04-19 19:20'
    };
    const list = [prev, next];
    const fullYear = baziTiming.buildDaYunSegmentsForRange(list, new Date(2036,1,4,14,19), new Date(2037,1,4,10,0));
    assert(fullYear.length === 2, `交运年应拆成两段，实际 ${fullYear.length}`);
    assert(fullYear[0].daYun === prev && fullYear[1].daYun === next, '交运年前后大运归属错误');
    assert(fullYear[0].endDateTimeText === '2036-04-19 19:20', `交运切点错误：${fullYear[0].endDateTimeText}`);

    const beforeMonth = baziTiming.buildDaYunSegmentsForRange(list, new Date(2036,1,4,14,19), new Date(2036,2,5,8,11));
    assert(beforeMonth.length === 1 && beforeMonth[0].daYun === prev, '交运前流月未归入上一大运');

    const crossingMonth = baziTiming.buildDaYunSegmentsForRange(list, new Date(2036,3,5,8,0), new Date(2036,4,5,8,0));
    assert(crossingMonth.length === 2, `跨交运流月应拆成两段，实际 ${crossingMonth.length}`);
    assert(crossingMonth[0].daYun === prev && crossingMonth[1].daYun === next, '跨交运流月前后大运归属错误');
    assert(baziTiming.findDaYunIndexForDate(list, new Date(2036,3,19,19,19)) === 0, '交运前一分钟应仍属上一大运');
    assert(baziTiming.findDaYunIndexForDate(list, new Date(2036,3,19,19,20)) === 1, '交运时刻起应进入下一大运');
});

test('交运年的流年分析按大运区间分段，不把全年归入新大运', () => {
    const result = {
        dayGan:'乙', dayGanWuXing:'木',
        originalGans:['丙','丙','乙','丙'], originalZhis:['午','申','卯','戌']
    };
    const makeDy = (gan,zhi,shiShen,start,end) => ({
        gan,zhi,shiShen,diShi:'绝',naYin:'—',xun:'—',xunKong:'—',
        startDate:start,endDate:end,startDateTimeText:baziTiming.dateTimeText ? baziTiming.dateTimeText(start) : '',endDateTimeText:baziTiming.dateTimeText ? baziTiming.dateTimeText(end) : '',
        pillarSignals:bazi.calculatePillarSignals(gan,zhi,result.originalGans,result.originalZhis,'大运'),
        stemRelations:bazi.calculateStemRelations(gan,result.originalGans),
        relations:bazi.calculateBranchRelations(zhi,result.originalZhis)
    });
    const prev = makeDy('丙','申','伤官',new Date(2026,3,19,19,20),new Date(2036,3,19,19,20));
    prev.startDateTimeText='2026-04-19 19:20'; prev.endDateTimeText='2036-04-19 19:20';
    const next = makeDy('丁','酉','食神',new Date(2036,3,19,19,20),new Date(2046,3,19,19,20));
    next.startDateTimeText='2036-04-19 19:20'; next.endDateTimeText='2046-04-19 19:20';
    const yearObj={gan:'丙',zhi:'辰'};
    const segments=baziTiming.buildDaYunSegmentsForRange([prev,next],new Date(2036,1,4,14,19),new Date(2037,1,4,10,0)).map((segment)=>segment.daYun?{
        ...segment,
        yunRelations:bazi.calculatePairRelations(segment.daYun,yearObj,'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(segment.daYun,yearObj,result.originalZhis)
    }:segment);
    const year={
        year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带',naYin:'—',xun:'—',xunKong:'—',
        daYunSegments:segments,isTransitionYear:true,
        pillarSignals:bazi.calculatePillarSignals('丙','辰',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('辰',result.originalZhis)
    };
    const analysis=baziTransitAnalysis.buildLiuNianAnalysis(result,next,year);
    assert(analysis.headline.includes('跨越大运交接'), `交运年标题未分段：${analysis.headline}`);
    const split=analysis.rows.find((row)=>row.label==='交运分段')?.text||'';
    assert(split.includes('【丙申】大运')&&split.includes('【丁酉】大运')&&split.includes('2036-04-19 19:20'), `交运分段信息不足：${split}`);
    assert(!analysis.headline.includes('处于【丁酉】大运'), '交运年仍被整年归入新大运');
    const scopedEvidence = (analysis.evidenceGroups || []).filter((group) => String(group.label || '').endsWith('阶段')).flatMap((group) => group.items || []);
    assert(scopedEvidence.length > 0, '交运年没有生成可核对的分段结构证据');
    assert(scopedEvidence.every((item) => item.parts?.[0] === '分段关系'), `交运年分段结构证据未显式标为分段关系：${JSON.stringify(scopedEvidence)}`);
    assert(scopedEvidence.every((item) => item.parts?.some((part) => String(part).startsWith('适用：'))), `交运年分段结构证据缺适用区间：${JSON.stringify(scopedEvidence)}`);
    const scopedText = scopedEvidence.map((item) => item.parts.join('｜')).join('\n');
    const originalEvidenceText = (analysis.evidenceGroups || []).filter((group) => group.label === '与原局').flatMap((group) => group.items || []).map((item) => item.parts.join('｜')).join('\n');
    assert(!originalEvidenceText.includes('适用：') && !originalEvidenceText.includes('分段关系｜'), `全年成立的原局关系不应被误标为分段：${originalEvidenceText}`);
    assert(scopedText.includes('适用：2036-02-04 14:19 起，至 2036-04-19 19:20 前'), `上一大运阶段证据区间错误：${scopedText}`);
    assert(scopedText.includes('适用：2036-04-19 19:20 起，至 2037-02-04 10:00 前'), `下一大运阶段证据区间错误：${scopedText}`);
});

test('交运前流月使用实际上一大运，跨交运流月使用分段分析', () => {
    const result={dayGan:'乙',dayGanWuXing:'木',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌']};
    const prev={gan:'丙',zhi:'申',shiShen:'伤官',startDate:new Date(2026,3,19,19,20),endDate:new Date(2036,3,19,19,20),startDateTimeText:'2026-04-19 19:20',endDateTimeText:'2036-04-19 19:20'};
    const next={gan:'丁',zhi:'酉',shiShen:'食神',startDate:new Date(2036,3,19,19,20),endDate:new Date(2046,3,19,19,20),startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2046-04-19 19:20'};
    const year={year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带'};
    const monthBase={monthName:'正',gan:'庚',zhi:'寅',shiShen:'正官',diShi:'帝旺',naYin:'—',xun:'—',xunKong:'—',pillarSignals:bazi.calculatePillarSignals('庚','寅',result.originalGans,result.originalZhis,'流月'),stemRelations:bazi.calculateStemRelations('庚',result.originalGans),relations:bazi.calculateBranchRelations('寅',result.originalZhis),yearRelations:bazi.calculatePairRelations(year,{gan:'庚',zhi:'寅'},'流年','流月')};
    const beforeSeg=baziTiming.buildDaYunSegmentsForRange([prev,next],new Date(2036,1,4,14,19),new Date(2036,2,5,8,11)).map((segment)=>({...segment,yunRelations:bazi.calculatePairRelations(segment.daYun,{gan:'庚',zhi:'寅'},'大运','流月'),layeredRelations:bazi.calculateFourLayerRelations(segment.daYun,year,{gan:'庚',zhi:'寅'},result.originalZhis)}));
    const before={...monthBase,daYunSegments:beforeSeg,effectiveDaYun:prev,isTransitionMonth:false,yunRelations:beforeSeg[0].yunRelations,layeredRelations:beforeSeg[0].layeredRelations};
    const beforeAnalysis=baziTransitAnalysis.buildLiuYueAnalysis(result,next,year,before);
    assert(beforeAnalysis.headline.includes('处于【丙申】大运'), `交运前流月仍错误使用所选新大运：${beforeAnalysis.headline}`);

    const crossingSeg=baziTiming.buildDaYunSegmentsForRange([prev,next],new Date(2036,3,5,8,0),new Date(2036,4,5,8,0)).map((segment)=>({...segment,yunRelations:bazi.calculatePairRelations(segment.daYun,{gan:'庚',zhi:'寅'},'大运','流月'),layeredRelations:bazi.calculateFourLayerRelations(segment.daYun,year,{gan:'庚',zhi:'寅'},result.originalZhis)}));
    const crossing={...monthBase,monthName:'三',daYunSegments:crossingSeg,effectiveDaYun:null,isTransitionMonth:true};
    const crossingAnalysis=baziTransitAnalysis.buildLiuYueAnalysis(result,next,year,crossing);
    assert(crossingAnalysis.headline.includes('本月跨越大运交接'), `跨交运流月标题错误：${crossingAnalysis.headline}`);
    const split=crossingAnalysis.rows.find((row)=>row.label==='交运分段')?.text||'';
    assert(split.includes('【丙申】大运')&&split.includes('【丁酉】大运'), `跨交运流月缺前后大运：${split}`);
});

test('岁运复制上下文以所选流月实际大运为准，并标明虚岁与交运区间', () => {
    const result={pillars:[{ganZhi:'丙午'},{ganZhi:'丙申'},{ganZhi:'乙卯'},{ganZhi:'丙戌'}],dayGan:'乙',dayGanWuXing:'木',monthSeason:{monthZhi:'申',season:'秋'},lunarStr:'丙午年 六月廿七 戌时',ruleSummary:'测试',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌'],internalRelations:[]};
    const prev={gan:'丙',zhi:'申',shiShen:'伤官',diShi:'胎',naYin:'—',xun:'—',xunKong:'—',startAge:1,endAge:10,startDate:new Date(2026,3,19,19,20),endDate:new Date(2036,3,19,19,20),startDateTimeText:'2026-04-19 19:20',endDateTimeText:'2036-04-19 19:20',pillarSignals:[],stemRelations:[],relations:[]};
    const next={gan:'丁',zhi:'酉',shiShen:'食神',diShi:'绝',naYin:'—',xun:'—',xunKong:'—',startAge:11,endAge:20,startDate:new Date(2036,3,19,19,20),endDate:new Date(2046,3,19,19,20),startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2046-04-19 19:20',pillarSignals:[],stemRelations:[],relations:[]};
    const year={year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带',naYin:'—',xun:'—',xunKong:'—',yearRangeText:'2036-02-04 14:19 起，至 2037-02-04 10:00 前',isTransitionYear:true,daYunSegments:[{daYun:prev,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-04-19 19:20'},{daYun:next,startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2037-02-04 10:00'}],pillarSignals:[],stemRelations:[],relations:[]};
    const month={monthName:'正',gan:'庚',zhi:'寅',shiShen:'正官',diShi:'帝旺',naYin:'—',xun:'—',xunKong:'—',rangeText:'立春 2036-02-04 14:19 起，至 惊蛰 2036-03-05 08:11 前',daYunSegments:[{daYun:prev,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-03-05 08:11'}],effectiveDaYun:prev,isTransitionMonth:false,pillarSignals:[],stemRelations:[],relations:[],yearRelations:[],yunRelations:[],layeredRelations:[]};
    const dyAnalysis=baziTransitAnalysis.buildDaYunAnalysis(result,next);
    const yearAnalysis=baziTransitAnalysis.buildLiuNianAnalysis(result,next,year);
    const monthAnalysis=baziTransitAnalysis.buildLiuYueAnalysis(result,next,year,month);
    const text=baziTransitAnalysis.buildBaziTransitContextText(result,{headline:'测试',judgments:[]},{daYun:next,liuNian:year,liuYue:month,daYunAnalysis:dyAnalysis,liuNianAnalysis:yearAnalysis,liuYueAnalysis:monthAnalysis});
    assert(text.includes('【当前大运】')&&text.includes('大运：丙申 · 伤官运'), `复制上下文未使用流月实际上一大运：${text}`);
    assert(!text.includes('【当前大运】\n大运：丁酉'), '复制上下文仍把所选新大运当作当前大运');
    assert(text.includes('流年区间：2036-02-04 14:19 起，至 2037-02-04 10:00 前'), '复制上下文缺流年节令区间');
    assert(text.includes('虚岁11'), '复制上下文年龄未明确虚岁口径');
    assert(text.includes('所在大运：丙申'), '复制上下文未标明当前流月实际所在大运');
});

test('岁运页面明确虚岁口径，并对交运年/月显示时间状态', () => {
    const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    assert(html.includes('虚岁 {{ dy.startAge }}—{{ dy.endAge }}'), '大运年龄未标虚岁');
    assert(html.includes('虚岁{{ activeLiuNian.age }}'), '流年年龄未标虚岁');
    assert(html.includes('activeLiuNian.isTransitionYear'), '交运年缺页面标识');
    assert(html.includes('activeLiuYue.isTransitionMonth'), '跨交运流月缺页面标识');
    assert(html.includes('activeLiuYue.effectiveDaYun'), '普通流月未显示实际所在大运');
    assert(html.includes('<script src="./js/bazi-core.js?v=13.44.0"></script>'), 'bazi-core 未版本化避免缓存');
    assert(html.includes('<script src="./js/bazi-timing.js?v=13.44.0"></script>'), 'bazi-timing 未版本化避免缓存');
    assert(html.includes('<script src="./js/app.js?v=13.44.0"></script>'), 'app.js 未版本化避免缓存');
});


test('交运年顶层关系不误用所选大运，必须由精确分段承担', () => {
    const liuNianRaw={getGanZhi:()=> '丙辰',getYear:()=>2036,getAge:()=>11,getXun:()=>'',getXunKong:()=>'',getLiuYue:()=>[]};
    const selectedRaw={getLiuNian:()=>[liuNianRaw]};
    const selected={gan:'丁',zhi:'酉',rawObj:selectedRaw,startDate:new Date(2036,3,19,19,20),endDate:new Date(2046,3,19,19,20)};
    const list=baziTiming.buildLiuNianList(selected,{dayGan:'乙',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌']},{
        daYunList:[selected],
        SolarApi:{fromYmd:(year)=>({getLunar:()=>({getJieQiTable:()=>({
            '立春':{getYear:()=>year,getMonth:()=>2,getDay:()=>4,getHour:()=>14,getMinute:()=>19,getSecond:()=>0}
        })})})}
    });
    const year=list[0];
    assert(year?.isTransitionYear, '交运年未识别为分段年份');
    assert(year.effectiveDaYun===null, '交运年不应绑定单一大运');
    assert(Array.isArray(year.yunRelations) && year.yunRelations.length===0, '交运年顶层 yunRelations 误用了所选大运');
    assert(Array.isArray(year.layeredRelations) && year.layeredRelations.length===0, '交运年顶层 layeredRelations 误用了所选大运');
});

test('首步大运之前按起运前处理，流年流月结构仍正常计算', () => {
    const result={dayGan:'乙',dayGanWuXing:'木',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌']};
    const firstDaYun={gan:'丁',zhi:'酉',shiShen:'食神',diShi:'绝',naYin:'山下火',xun:'甲午',xunKong:'辰巳',startAge:11,endAge:20,startDate:new Date(2036,3,19,19,20),endDate:new Date(2046,3,19,19,20),startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2046-04-19 19:20',pillarSignals:[],stemRelations:[],relations:[]};
    const year={year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带'};
    const monthObj={gan:'庚',zhi:'寅'};
    const baseLayered=bazi.calculateFourLayerRelations(null,year,monthObj,result.originalZhis);
    const codes=new Set(baseLayered.map((item)=>`${item.code}|${(item.branches||[]).join('')}`));
    assert([...codes].some((key)=>key.startsWith('SAN_HE_COMPLETE|')&&key.includes('寅')&&key.includes('午')&&key.includes('戌')), '起运前未识别寅午戌三合火');
    assert([...codes].some((key)=>key.startsWith('SAN_HUI_COMPLETE|')&&key.includes('寅')&&key.includes('卯')&&key.includes('辰')), '起运前未识别寅卯辰三会木');

    const month={
        monthName:'正',gan:'庚',zhi:'寅',shiShen:'正官',diShi:'帝旺',naYin:'松柏木',xun:'甲申',xunKong:'午未',
        daYunSegments:[{daYun:null,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-03-05 08:11',yunRelations:[],layeredRelations:baseLayered}],
        baseLayeredRelations:baseLayered,effectiveDaYun:null,isTransitionMonth:false,
        yearRelations:bazi.calculatePairRelations(year,monthObj,'流年','流月'),
        yunRelations:[],layeredRelations:baseLayered,
        pillarSignals:bazi.calculatePillarSignals('庚','寅',result.originalGans,result.originalZhis,'流月'),
        stemRelations:bazi.calculateStemRelations('庚',result.originalGans),relations:bazi.calculateBranchRelations('寅',result.originalZhis)
    };
    const analysis=baziTransitAnalysis.buildLiuYueAnalysis(result,firstDaYun,year,month);
    assert(analysis.headline.includes('处于起运前阶段'), `首运前流月错误套用第一步大运：${analysis.headline}`);
    const structure=analysis.rows.find((row)=>row.label==='结构变化')?.text||'';
    assert(structure.includes('三合火局')&&structure.includes('三会东方木'), `起运前跨层结构遗漏：${structure}`);
    const all=analysis.rows.map((row)=>row.text).join(' ');
    assert(!all.includes('大运支【酉】')&&!all.includes('与大运'), `起运前流月错误引入第一步大运：${all}`);
});

test('首步大运前的岁运上下文明确写起运前，不把第一步大运当作当前大运', () => {
    const result={pillars:[{ganZhi:'丙午'},{ganZhi:'丙申'},{ganZhi:'乙卯'},{ganZhi:'丙戌'}],dayGan:'乙',dayGanWuXing:'木',monthSeason:{monthZhi:'申',season:'秋'},lunarStr:'丙午年 六月廿七 戌时',ruleSummary:'测试',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌'],internalRelations:[]};
    const firstDaYun={gan:'丁',zhi:'酉',shiShen:'食神',diShi:'绝',naYin:'山下火',xun:'甲午',xunKong:'辰巳',startAge:11,endAge:20,startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2046-04-19 19:20',pillarSignals:[],stemRelations:[],relations:[]};
    const year={year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带',naYin:'沙中土',xun:'甲寅',xunKong:'子丑',yearRangeText:'2036-02-04 14:19 起，至 2037-02-03 20:11 前',isTransitionYear:true,daYunSegments:[{daYun:null,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-04-19 19:20'},{daYun:firstDaYun,startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2037-02-03 20:11',yunRelations:[],layeredRelations:[]}],pillarSignals:[],stemRelations:[],relations:[]};
    const baseLayered=bazi.calculateFourLayerRelations(null,year,{gan:'庚',zhi:'寅'},result.originalZhis);
    const month={monthName:'正',gan:'庚',zhi:'寅',shiShen:'正官',diShi:'帝旺',naYin:'松柏木',xun:'甲申',xunKong:'午未',rangeText:'立春 2036-02-04 14:19 起，至 惊蛰 2036-03-05 08:11 前',daYunSegments:[{daYun:null,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-03-05 08:11',yunRelations:[],layeredRelations:baseLayered}],baseLayeredRelations:baseLayered,effectiveDaYun:null,isTransitionMonth:false,yearRelations:[],yunRelations:[],layeredRelations:baseLayered,pillarSignals:[],stemRelations:[],relations:[]};
    const text=baziTransitAnalysis.buildBaziTransitContextText(result,{headline:'测试',judgments:[]},{daYun:firstDaYun,liuNian:year,liuYue:month,daYunAnalysis:baziTransitAnalysis.buildDaYunAnalysis(result,firstDaYun),liuNianAnalysis:baziTransitAnalysis.buildLiuNianAnalysis(result,firstDaYun,year),liuYueAnalysis:baziTransitAnalysis.buildLiuYueAnalysis(result,firstDaYun,year,month)});
    assert(text.includes('【当前大运阶段】\n状态：起运前'), `上下文未明确起运前：${text}`);
    assert(text.includes('所在阶段：起运前'), '流月上下文未标起运前');
    const currentBlock=text.split('【当前大运阶段】')[1]?.split('【当前流年】')[0]||'';
    assert(currentBlock.includes('起运时刻：2036-04-19 19:20'), `起运前未给出精确起运时刻：${currentBlock}`);
    assert(currentBlock.includes('下一步大运：丁酉 · 食神运'), `起运前未给出下一步大运：${currentBlock}`);
    assert(!currentBlock.includes('区间：2036-02-04 14:19'), `当前大运阶段误用了流月区间：${currentBlock}`);
});


test('首次起运年的流年层间证据仅在起运后分段成立，并带精确适用区间', () => {
    const result={dayGan:'乙',dayGanWuXing:'木',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌']};
    const firstDaYun={gan:'丁',zhi:'酉',shiShen:'食神',startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2046-04-19 19:20'};
    const yearObj={gan:'丙',zhi:'辰'};
    const postRelations=bazi.calculatePairRelations(firstDaYun,yearObj,'大运','流年');
    const postLayered=bazi.calculateThreeLayerRelations(firstDaYun,yearObj,result.originalZhis);
    const year={
        year:2036,age:11,gan:'丙',zhi:'辰',shiShen:'伤官',diShi:'冠带',
        daYunSegments:[
            {daYun:null,startDateTimeText:'2036-02-04 14:19',endDateTimeText:'2036-04-19 19:20',yunRelations:[],layeredRelations:[]},
            {daYun:firstDaYun,startDateTimeText:'2036-04-19 19:20',endDateTimeText:'2037-02-03 20:11',yunRelations:postRelations,layeredRelations:postLayered}
        ],
        pillarSignals:bazi.calculatePillarSignals('丙','辰',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丙',result.originalGans),
        relations:bazi.calculateBranchRelations('辰',result.originalZhis)
    };
    const analysis=baziTransitAnalysis.buildLiuNianAnalysis(result,firstDaYun,year);
    const evidence=(analysis.evidenceGroups||[]).flatMap((group)=>group.items||[]);
    assert(evidence.length>0,'首次起运年起运后阶段应存在层间证据');
    const text=evidence.map((item)=>item.parts.join('｜')).join('\n');
    assert(text.includes('分段关系｜'),`首次起运年证据未标分段关系：${text}`);
    assert(text.includes('适用：2036-04-19 19:20 起，至 2037-02-03 20:11 前'),`首次起运年证据缺起运后适用区间：${text}`);
    assert(!text.includes('适用：2036-02-04 14:19 起，至 2036-04-19 19:20 前'),`起运前阶段不应生成大运层间证据：${text}`);
});

test('普通非交运年层间证据不附分段适用区间', () => {
    const result={dayGan:'乙',dayGanWuXing:'木',originalGans:['丙','丙','乙','丙'],originalZhis:['午','申','卯','戌']};
    const daYun={gan:'丁',zhi:'酉',shiShen:'食神'};
    const year={year:2037,age:12,gan:'丁',zhi:'巳',shiShen:'食神',diShi:'沐浴',
        yunRelations:bazi.calculatePairRelations(daYun,{gan:'丁',zhi:'巳'},'大运','流年'),
        layeredRelations:bazi.calculateThreeLayerRelations(daYun,{gan:'丁',zhi:'巳'},result.originalZhis),
        pillarSignals:bazi.calculatePillarSignals('丁','巳',result.originalGans,result.originalZhis,'流年'),
        stemRelations:bazi.calculateStemRelations('丁',result.originalGans),
        relations:bazi.calculateBranchRelations('巳',result.originalZhis)
    };
    const analysis=baziTransitAnalysis.buildLiuNianAnalysis(result,daYun,year);
    const evidence=(analysis.evidenceGroups||[]).flatMap((group)=>group.items||[]);
    const text=evidence.map((item)=>item.parts.join('｜')).join('\n');
    assert(!text.includes('适用：'),`普通年份层间证据不应附分段适用区间：${text}`);
    assert(!text.includes('分段关系｜'),`普通年份层间证据不应标成分段关系：${text}`);
});

test('大运区间分段压力测试：6912 组窗口与 3072 个精确边界无缺口重叠', () => {
    const starts = [];
    for (let month = 0; month < 12; month += 1) {
        for (const day of [2, 10, 18, 26]) {
            for (const hour of [0, 7, 13, 23]) {
                for (const minute of [0, 17, 41, 59]) {
                    starts.push(new Date(2030, month, day, hour, minute));
                }
            }
        }
    }
    let checked = 0;
    const addYears = (date, years) => new Date(date.getFullYear() + years, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
    const addMs = (date, ms) => new Date(date.getTime() + ms);
    const assertSegments = (list, rangeStart, rangeEnd, expectedKinds, label) => {
        const segments = baziTiming.buildDaYunSegmentsForRange(list, rangeStart, rangeEnd);
        assert(segments.length === expectedKinds.length, `${label} 段数错误：${segments.length}`);
        assert(segments[0].startDate.getTime() === rangeStart.getTime(), `${label} 起点未覆盖`);
        assert(segments[segments.length - 1].endDate.getTime() === rangeEnd.getTime(), `${label} 终点未覆盖`);
        segments.forEach((segment, index) => {
            assert(segment.startDate < segment.endDate, `${label} 存在零长/反向区间`);
            if (index > 0) assert(segments[index - 1].endDate.getTime() === segment.startDate.getTime(), `${label} 存在缺口或重叠`);
            const kind = segment.daYun ? segment.daYunIndex : -1;
            assert(kind === expectedKinds[index], `${label} 第${index + 1}段归属错误：${kind}`);
        });
        checked += 1;
    };
    starts.forEach((firstStart, caseIndex) => {
        const list = Array.from({ length: 4 }, (_, index) => ({
            gan: GAN[index], zhi: ZHI[index],
            startDate: addYears(firstStart, index * 10),
            endDate: addYears(firstStart, (index + 1) * 10)
        }));
        const HOUR = 60 * 60 * 1000;
        const DAY = 24 * HOUR;
        assertSegments(list, addMs(firstStart, -30 * DAY), addMs(firstStart, -1 * DAY), [-1], `case${caseIndex}-pre`);
        assertSegments(list, addMs(firstStart, -12 * HOUR), addMs(firstStart, 12 * HOUR), [-1, 0], `case${caseIndex}-first-cross`);
        assertSegments(list, addMs(firstStart, 1 * DAY), addMs(firstStart, 30 * DAY), [0], `case${caseIndex}-after`);
        list.forEach((item, index) => {
            assert(baziTiming.findDaYunIndexForDate(list, addMs(item.startDate, -60 * 1000)) === index - 1, `case${caseIndex}-boundary-${index} 交运前一分钟归属错误`);
            assert(baziTiming.findDaYunIndexForDate(list, item.startDate) === index, `case${caseIndex}-boundary-${index} 交运时刻归属错误`);
        });
        for (let transitionIndex = 1; transitionIndex < list.length; transitionIndex += 1) {
            const transitionStart = list[transitionIndex].startDate;
            assertSegments(list, addMs(transitionStart, -12 * HOUR), addMs(transitionStart, 12 * HOUR), [transitionIndex - 1, transitionIndex], `case${caseIndex}-later-cross-${transitionIndex}`);
            assertSegments(list, addMs(transitionStart, 1 * DAY), addMs(transitionStart, 30 * DAY), [transitionIndex], `case${caseIndex}-later-after-${transitionIndex}`);
        }
    });
    assert(checked === 6912, `压力测试场景数错误：${checked}`);
});


test('流年选择卡对交运年显示轻量标签', () => {
    const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    assert(html.includes('v-if="ln.isTransitionYear" class="transit-mini-flag">交运年</span>'),'流年卡缺少交运年标签');
});

test('流月选择卡对跨交运月显示轻量标签', () => {
    const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    assert(html.includes('v-if="ly.isTransitionMonth" class="transit-mini-flag">跨交运</span>'),'流月卡缺少跨交运标签');
});


test('六爻详细页用神关系链不再显示悬空状态标签行', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const start = html.indexOf('<section class="panel-card ui-layer-evidence">', html.indexOf('详细装卦与逐爻状态'));
    const end = html.indexOf('<h2 class="panel-title">结构解读</h2>', start);
    assert(start >= 0 && end > start, '无法定位六爻详细页用神关系链模块');
    const section = html.slice(start, end);
    assert(!section.includes('useGodAnalysis.target.statusTags'), '详细页用神关系链仍显示 target.statusTags');
    assert(!section.includes('useGodAnalysis.target.moveTags'), '详细页用神关系链仍显示 target.moveTags');
    assert(!section.includes('useGodAnalysis.target.moving'), '详细页用神关系链仍单独显示发动标签');
    assert(section.includes('useGodAnalysis.sameRelationText'), '详细页用神关系链的同类出现信息被误删');
    assert(section.includes('useGodAnalysis.sourceLines') && section.includes('useGodAnalysis.tabooLines') && section.includes('useGodAnalysis.enemyLines'), '元忌仇神关系链被误删');
});


test('六爻总览用神焦点不再显示悬空状态标签行', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const start = html.indexOf('<div v-if="useGodAnalysis" class="use-god-focus-card">');
    const end = html.indexOf('</section>', start);
    assert(start >= 0 && end > start, '无法定位六爻总览用神焦点卡');
    const section = html.slice(start, end);
    assert(!section.includes('useGodAnalysis.target.statusTags'), '六爻总览用神焦点仍显示日月状态标签');
    assert(!section.includes('useGodAnalysis.target.moveTags'), '六爻总览用神焦点仍显示动变状态标签');
    assert(!section.includes('status-chip transform">发动'), '六爻总览用神焦点仍显示悬空发动标签');
    assert(section.includes('useGodAnalysis.sourceLines') && section.includes('useGodAnalysis.tabooLines') && section.includes('useGodAnalysis.enemyLines'), '清理状态标签时误删元忌仇神摘要');
});

test('六爻结构解读收束为用神状态、用神关系链、卦体动变三层', () => {
    const target = {position:1,label:'初爻',relation:'妻财',branch:'寅',element:'木',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令死',type:'constraint'},{code:'MONTH_BREAK',text:'月破',type:'constraint'},{code:'MONTH_CONTROL',text:'月建克',type:'constraint'},{code:'DAY_SUPPORT',text:'日辰比扶',type:'support'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const ying = {position:4,label:'四爻',relation:'子孙',branch:'亥',element:'水',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true};
    const result = {monthZhi:'申',lines:[target,ying],fullStructure:{originalNature:'六合卦',originalNatureCode:'SIX_HARMONY',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'六合卦 → 非六冲六合卦',shiYing:{text:'世爻为初爻妻财寅木；应爻为四爻子孙亥水。',tags:[{code:'SHI_YING_SIX_HARMONY',text:'世应六合',type:'transform'},{code:'YING_GENERATES_SHI',text:'应生世',type:'support'}]},sanHe:{complete:[],pending:['申辰两支待子（未成局）']},fanFu:[]}};
    const use = liuyao.buildUseGodAnalysis(target,result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    assert(JSON.stringify(output.judgments.map((item)=>item.id)) === JSON.stringify(['use-state','use-relations','whole-structure']), `结构解读层级异常：${output.judgments.map((item)=>item.id).join(',')}`);
    assert(output.judgments[0].title === '用神月破、月克、日比扶', `用神状态标题异常：${output.judgments[0].title}`);
    assert(output.judgments[1].summary.includes('元神水见四爻（应）子孙亥水') && output.judgments[1].summary.includes('与用神六合') && output.judgments[1].summary.includes('生用神'), `用神关系链未合并元神与世应：${output.judgments[1].summary}`);
    assert(output.judgments[2].summary.includes('六合卦') && output.judgments[2].summary.includes('申辰两支待子'), `卦体动变结构未合并整体事实：${output.judgments[2].summary}`);
});

test('六爻结构解读前台只描述当前卦结构，不输出后台阅读指令', () => {
    const target = {
        position:6,label:'上爻',relation:'兄弟',branch:'巳',element:'火',moving:false,
        statusTags:[{code:'SEASON_STATE',text:'月令囚',type:'constraint'},{code:'MONTH_HARMONY',text:'月合',type:'support'},{code:'DAY_GENERATE',text:'日辰生',type:'support'}],
        moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'
    };
    const ying = { position:3,label:'三爻',relation:'官鬼',branch:'亥',element:'水',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true };
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:2,label:'二爻',relation:'子孙',branch:'丑',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        ying,
        {position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}],moveTags:[],isShi:false,isYing:false},
        {position:5,label:'五爻',relation:'子孙',branch:'未',element:'土',moving:true,changedRelation:'妻财',changedBranch:'申',changedElement:'金',statusTags:[],moveTags:[{code:'TRANSFORM_GROWTH',text:'化长生',type:'support'}],isShi:false,isYing:false},
        target
    ];
    const result = { lines:rows, fullStructure:{ originalNature:'六冲卦',originalNatureCode:'SIX_CLASH',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'六冲卦 → 非六冲六合卦', shiYing:{text:'世爻为上爻兄弟巳火；应爻为三爻官鬼亥水。',tags:[{code:'YING_CONTROLS_SHI',text:'应克世',type:'neutral'},{code:'SHI_YING_SIX_CLASH',text:'世应六冲',type:'trigger'}]}, sanHe:{complete:[],pending:[]},fanFu:[] } };
    const use = liuyao.buildUseGodAnalysis(target, result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, use, []);
    const visible = [output.headline, ...output.judgments.flatMap((item) => [item.title, item.summary])].join('\n');
    ['不能把', '不宜', '仍需', '先看', '不直接', '而不是', '这里强调', '需要同时比较'].forEach((phrase) => {
        assert(!visible.includes(phrase), `六爻结构解读仍含后台阅读指令：${phrase}\n${visible}`);
    });
    assert(output.limitations.length === 0, '六爻结构解读仍输出前台限制说明');
});

test('六爻结果页辅助文案同步采用直接描述', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const start = html.indexOf('currentPage === \'result\' && activeModule === \'liuyao\'');
    const end = html.indexOf('</div>\n</div>\n\n<template id="literature-browser-template">', start);
    const section = html.slice(start, end > start ? end : undefined);
    ['先看六亲', '卦象始终属于总览', '不以单个标签直接定吉凶', '日期不是唯一应验结论', '取用参考按占问关键词', '不参与日月旺衰'].forEach((phrase) => {
        assert(!section.includes(phrase), `六爻结果页仍有旧说明式文案：${phrase}`);
    });
});


test('六爻应期观察按时间统一汇总，并清除旧分层与边界式文案', () => {
    const target = { relation:'妻财', branch:'卯', element:'木', moving:false, changedBranch:'', statusTags:[{code:'MONTH_BREAK',text:'月破',type:'constraint'}], moveTags:[] };
    const result = { castTimestamp:'2026-08-09T12:00:00+09:00', dayXun:'甲子', fullStructure:{sanHe:{pendingDetails:[]}} };
    const items = liuyao.buildTimingCandidates(target, result);
    assert(items.some((item) => item.triggers?.some((trigger) => trigger.id === 'month-break')), '月破触发未进入应期时间节点');
    assert(items.some((item) => item.triggers?.some((trigger) => trigger.id === 'static')), '静爻逢冲未进入应期时间节点');
    const text = items.map((item) => `${item.title} ${item.reason} ${(item.triggers || []).map((trigger)=>`${trigger.label} ${trigger.reason}`).join(' ')}`).join('\n');
    ['不能只按', '若实际表现', '可观察', '先观察', '只有在'].forEach((phrase) => assert(!text.includes(phrase), `应期观察仍含边界式文案：${phrase}`));
    assert(text.includes('逢值') && !text.includes('月破填实'), `月破仍借用旬空“填实”术语：${text}`);
    assert(text.includes('出破') && !text.includes('出月'), `月破退出仍使用“出月”术语：${text}`);
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const timingStart = html.indexOf('<div class="detail-section-title">应期观察</div>');
    const timingEnd = html.indexOf('<details class="panel-card disclosure-card fold-card ui-layer-aux">', timingStart);
    const timingHtml = html.slice(timingStart, timingEnd);
    assert(timingHtml.includes('按时间汇总当前卦中的关键结构变化与用神动静观察点。'), '应期观察说明未改为日期优先');
    assert(!timingHtml.includes('结构触发') && !timingHtml.includes('常规观察'), '应期观察仍保留旧外层分组');
    assert(timingHtml.includes('v-for="item in timingCandidates"'), '应期观察未直接按统一时间节点渲染');
});



test('六爻静卦：重复暗动元神与多处忌神进入主结构解读', () => {
    const target = {type:'line',position:4,label:'四爻',relation:'父母',branch:'亥',element:'水',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令相',type:'support'},{code:'MONTH_GENERATE',text:'月建生',type:'support'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const rows = [
        {position:1,label:'初爻',relation:'妻财',branch:'丑',element:'土',moving:false,statusTags:[{code:'VOID',text:'旬空',type:'void'}],moveTags:[],isShi:false,isYing:true},
        {position:2,label:'二爻',relation:'父母',branch:'亥',element:'水',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'官鬼',branch:'酉',element:'金',moving:false,statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}],moveTags:[],isShi:false,isYing:false},
        target,
        {position:5,label:'五爻',relation:'官鬼',branch:'酉',element:'金',moving:false,statusTags:[{code:'DARK_MOVING',text:'日冲·暗动提示',type:'trigger'}],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'妻财',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const flyingHidden = [
        {position:4,label:'四爻',flyRelation:'父母',flyBranch:'亥',flyElement:'水',hiddenRelation:'子孙',hiddenBranch:'午',hiddenElement:'火',candidate:true,candidateCode:'HIDDEN_PRIMARY_CANDIDATE',statusTags:[],relationText:'飞来克伏'}
    ];
    const result = {monthZhi:'申',dayZhi:'卯',lines:rows,flyingHidden,fullStructure:{originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'非六冲六合卦 → 非六冲六合卦',shiYing:{text:'世爻为四爻父母亥水；应爻为初爻妻财丑土。',tags:[{code:'YING_CONTROLS_SHI',text:'应克世',type:'constraint'},{code:'YING_VOID',text:'应爻旬空',type:'void'}]},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const use = liuyao.buildUseGodAnalysis(target,result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    const relation = output.judgments.find((item)=>item.id==='use-relations');
    const whole = output.judgments.find((item)=>item.id==='whole-structure');
    assert(relation?.summary.includes('元神金见三爻、五爻官鬼酉金') && relation.summary.includes('两爻均带暗动提示'), `重复暗动元神未聚合：${relation?.summary}`);
    assert(relation?.summary.includes('忌神土见初爻（应）妻财丑土、上爻妻财未土') && relation.summary.includes('两爻均克用神') && relation.summary.includes('初爻（应）旬空'), `多处忌神或应爻状态未合并：${relation?.summary}`);
    assert(whole?.summary.includes('三爻、五爻官鬼酉金均受日辰【卯】冲') && whole.summary.includes('暗动提示'), `暗动未提升到动变结构：${whole?.summary}`);
});

test('六爻动卦：唯一动爻自身日辰与回头、化绝进入动变结构', () => {
    const target = {type:'line',position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令囚',type:'constraint'},{code:'DAY_GENERATE',text:'日辰生',type:'support'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const moving = {position:6,label:'上爻',relation:'父母',branch:'戌',element:'土',moving:true,changedRelation:'官鬼',changedBranch:'巳',changedElement:'火',statusTags:[{code:'SEASON_STATE',text:'月令休',type:'neutral'},{code:'DAY_HARMONY',text:'日合·合绊提示',type:'trigger'}],moveTags:[{code:'RETURN_GENERATE',text:'回头生',type:'support'},{code:'TRANSFORM_EXTINCTION',text:'化绝',type:'constraint'}],isShi:false,isYing:false};
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:2,label:'二爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false},
        {position:5,label:'五爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        moving
    ];
    const result={monthZhi:'申',dayZhi:'卯',lines:rows,flyingHidden:[],fullStructure:{originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'六合卦',changedNatureCode:'SIX_HARMONY',transition:'非六冲六合卦 → 六合卦',shiYing:{text:'世爻为四爻官鬼午火；应爻为初爻父母辰土。',tags:[{code:'SHI_GENERATES_YING',text:'世生应',type:'neutral'}]},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const use=liuyao.buildUseGodAnalysis(target,result);
    const output=liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    const whole=output.judgments.find((item)=>item.id==='whole-structure');
    assert(whole?.title==='动变与卦体结构', `动变结构标题异常：${whole?.title}`);
    ['上爻父母戌土发动','日辰【卯】与戌土六合','化官鬼巳火','回头生戌土','化绝','变卦为六合卦'].forEach((text)=>assert(whole.summary.includes(text), `动爻自身变化漏项 ${text}：${whole.summary}`));
});

test('六爻复制上下文补充当前爻位与同类六亲明爻/变爻分布', () => {
    const rows=[
        {position:1,label:'初爻',relation:'父母',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:2,label:'二爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false},
        {position:5,label:'五爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'父母',branch:'戌',element:'土',moving:true,changedRelation:'官鬼',changedBranch:'巳',changedElement:'火',statusTags:[],moveTags:[{code:'MOVING_CHANGE',text:'动而有变',type:'neutral'}],isShi:false,isYing:false}
    ];
    const result={question:'',solarText:'2026年8月9日 22:47',lunarText:'丙午年 六月廿七 亥时',monthGanZhi:'丙申',monthZhi:'申',dayGanZhi:'乙卯',dayZhi:'卯',xunKong:'子丑',original:{symbol:'䷽',name:'小过',number:62},changed:{symbol:'䷷',name:'旅',number:56},palace:{palace:'兑',stage:'游魂',element:'金'},movingText:'上爻',lines:rows,displayLines:[...rows].reverse(),flyingHidden:[],fullStructure:{originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'六合卦',changedNatureCode:'SIX_HARMONY',transition:'非六冲六合卦 → 六合卦',shiYing:{text:'世爻为四爻官鬼午火；应爻为初爻父母辰土。',shi:{position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火'},ying:{position:1,label:'初爻',relation:'父母',branch:'辰',element:'土'},tags:[{code:'SHI_GENERATES_YING',text:'世生应',type:'neutral'}]},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const target=liuyao.buildUseGodChoices(rows,[]).find((item)=>item.position===4);
    const use=liuyao.buildUseGodAnalysis(target,result);
    const interpretation=liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    const text=liuyaoInterpretation.buildLiuYaoContextText(result,target,use,interpretation,[],[]);
    assert(text.includes('官鬼午火；四爻（世）；本卦明爻；静爻') && !text.includes('（世）（世）'), `当前用神爻位重复或缺失：${text}`);
    assert(text.includes('同类六亲分布：明爻：二爻官鬼午火、四爻（世）官鬼午火（当前观察对象）；变爻：上爻化官鬼巳火'), `同类六亲分布未进入上下文：${text}`);
    assert(text.includes('卦体：本卦非六冲六合卦，变卦为六合卦'), `动卦卦体事实仍使用箭头式表达：${text}`);
});

test('六爻元忌仇多条目聚合保留每一条与用神的直接作用', () => {
    const target={type:'line',position:2,label:'二爻 · 官鬼午火（世）',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const rows=[
        {position:1,label:'初爻',relation:'父母',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:2,label:'二爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:true,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'官鬼',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:5,label:'五爻',relation:'兄弟',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:6,label:'上爻',relation:'父母',branch:'戌',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const result={monthZhi:'申',dayZhi:'卯',lines:rows,flyingHidden:[],fullStructure:{originalNature:'非六冲六合卦',originalNatureCode:'NEUTRAL',changedNature:'非六冲六合卦',changedNatureCode:'NEUTRAL',transition:'非六冲六合卦 → 非六冲六合卦',shiYing:{text:'世爻为二爻官鬼午火；应爻为五爻兄弟申金。',shi:{position:2,label:'二爻',relation:'官鬼',branch:'午',element:'火'},ying:{position:5,label:'五爻',relation:'兄弟',branch:'申',element:'金'},tags:[{code:'SHI_CONTROLS_YING',text:'世克应',type:'constraint'}]},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const use=liuyao.buildUseGodAnalysis(target,result);
    const enemyEntries=use.enemyEntries.filter((entry)=>entry.layer==='visible');
    assert(enemyEntries.length===2 && enemyEntries.every((entry)=>entry.directFacts.some((fact)=>fact.text==='受用神所克')), '仇神多条目没有逐条保存直接作用 facts');
    const output=liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    const relation=output.judgments.find((item)=>item.id==='use-relations');
    assert(relation?.summary.includes('仇神金见三爻、五爻（应）兄弟申金') && relation.summary.includes('两爻均受用神所克'), `仇神聚合后丢失直接作用：${relation?.summary}`);
});

test('六爻动卦相同卦体性质使用自然结构事实而非箭头', () => {
    const result={lines:[{moving:true}],fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const text=liuyaoInterpretation.buildLiuYaoContextText(result,null,null,{judgments:[]},[],[]);
    assert(text.includes('卦体：本卦、变卦均非六冲六合卦'), `同性质动卦结构事实未自然化：${text}`);
    assert(!text.includes('非六冲六合卦 → 非六冲六合卦'), `结构事实仍含箭头式表达：${text}`);
});

test('六爻古籍 matcher 能识别变卦六合而非只看本卦', () => {
    const result={lines:[{moving:true}],fullStructure:{originalNatureCode:'NEUTRAL',changedNatureCode:'SIX_HARMONY',sanHe:{complete:[],pending:[]},fanFu:[]},flyingHidden:[],palace:{palace:'兑',stage:'游魂'},original:{symbol:'䷽',name:'小过'}};
    const items=liuyaoLit.buildLiuYaoLiterature(result,null);
    const harmony=items.find((item)=>item.id==='zengshan-hex-harmony');
    assert(harmony, '变卦六合未匹配《增删卜易》六合章');
    assert(harmony.match.includes('变卦为六合卦'), `六合条匹配依据未指出变卦：${harmony.match}`);
});
test('六爻复制上下文：静卦省略空变爻层，日月方向与世应事实自然化', () => {
    const shi = {position:1,label:'初爻',relation:'子孙',branch:'辰',element:'土',moving:false,statusTags:[{code:'SEASON_STATE',text:'月令休',type:'neutral'},{code:'DAY_CONTROL',text:'日辰克',type:'constraint'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const ying = {position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true};
    const rows = [shi,
        {position:2,label:'二爻',relation:'兄弟',branch:'午',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'妻财',branch:'申',element:'金',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        ying,
        {position:5,label:'五爻',relation:'子孙',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'兄弟',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const result = {
        question:'',solarText:'2026年8月9日 22:36',lunarText:'丙午年 六月廿七 亥时',monthGanZhi:'丙申',monthZhi:'申',dayGanZhi:'乙卯',dayZhi:'卯',xunKong:'子丑',
        original:{symbol:'䷷',name:'旅',number:56},changed:{symbol:'䷷',name:'旅',number:56},palace:{palace:'离',stage:'一世',element:'火'},movingText:'静卦（无动爻）',
        lines:rows,displayLines:[...rows].reverse(),flyingHidden:[],
        fullStructure:{originalNature:'六合卦',transition:'六合卦 → 六合卦',shiYing:{text:'世爻为初爻子孙辰土；应爻为四爻妻财酉金。',shi:{position:1,label:'初爻',relation:'子孙',branch:'辰',element:'土'},ying:{position:4,label:'四爻',relation:'妻财',branch:'酉',element:'金'},tags:[{code:'SHI_GENERATES_YING',text:'世生应',type:'neutral'},{code:'SHI_YING_SIX_HARMONY',text:'世应六合',type:'transform'}]},sanHe:{complete:[],pending:[]},fanFu:[]}
    };
    const use = {sourceElement:'火',sourceLines:'明爻：二爻兄弟午静、上爻兄弟巳静；变爻未见；伏神候选未见',tabooElement:'木',tabooLines:'明爻未见；变爻未见；伏神候选：初爻下伏父母卯木',enemyElement:'水',enemyLines:'明爻未见；变爻未见；伏神候选：三爻下伏官鬼亥水'};
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, shi, use, []);
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,shi,use,interpretation,[],[]);
    assert(text.includes('日月状态：申月土休；日辰【卯】木克用神【辰】土。'), `日月状态仍为无方向标签：${text}`);
    assert(!text.includes('变爻未见'), `静卦元忌仇分布仍反复输出空变爻层：${text}`);
    assert(text.includes('世应：世爻为初爻子孙辰土，应爻为四爻妻财酉金；世生应，辰酉六合'), `世应事实未自然化：${text}`);
    assert(!text.includes('。；'), `世应事实仍有句号分号连写：${text}`);
    const state = interpretation.judgments.find((item)=>item.id==='use-state');
    assert(state?.summary.includes('申月土处“休”') && state.summary.includes('日辰【卯】木克辰土'), `用神状态判断未明确日月作用方向：${state?.summary}`);
});

test('六爻日辰换日选项位于起卦时间下方，默认 24:00 并持久保存', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const appSource = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
    const timePos = html.indexOf('<span class="field-label">起卦时间</span>');
    const daySectPos = html.indexOf('<span class="field-label">日辰换日</span>');
    const linesPos = html.indexOf('liuyao-info-note input-info-note', timePos);
    assert(timePos >= 0 && daySectPos > timePos && daySectPos < linesPos, '日辰换日选项未放在起卦时间正下方');
    assert(html.includes('<option value="2">24:00 换日（默认）</option>') && html.includes('<option value="1">23:00 子初换日</option>'), '换日选项或默认口径缺失');
    assert(appSource.includes("const liuyaoDaySectStorageKey = 'guijia.liuyao.daySect'") && appSource.includes("daySect: readStoredLiuYaoDaySect()"), '六爻换日口径未持久保存');
    assert(appSource.includes("const liuyaoDaySect = liuyaoForm.daySect === '1' ? 1 : 2") && appSource.includes('eightChar.setSect(liuyaoDaySect)'), '排盘日辰未使用选定换日口径');
});

test('六爻日辰换日口径贯穿旬空六神与应期日期计算', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
    const coreSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-core.js'), 'utf8');
    assert(appSource.includes('const xunKong = eightChar.getDayXunKong()') && appSource.includes('const spirits = sixSpirits(dayGan)'), '旬空或六神未从同一 EightChar 日辰派生');
    assert(appSource.includes('daySect: liuyaoDaySect') && coreSource.includes('const daySect = normalizeLiuYaoDaySect(resultObj.daySect)'), '应期模块未接收排盘换日口径');
    assert(coreSource.includes('findNextBranchDate(startDate, branch, 60, daySect)') && coreSource.includes('findNextXunDate(startDate, resultObj.dayXun, 15, daySect)'), '应期值日/出旬仍未统一换日规则');
});

test('六爻复制上下文记录日辰换日口径', () => {
    const result = {question:'',solarText:'2026年8月9日 23:06',lunarText:'丙午年 六月廿七 子时',monthGanZhi:'丙申',dayGanZhi:'丙辰',dayChangeLabel:'23:00 子初换日',xunKong:'子丑',original:{name:'旅'},changed:{name:'旅'},palace:{},movingText:'静卦（无动爻）',lines:[],fullStructure:{originalNature:'非六冲六合卦',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,null,null,{judgments:[]},[],[]);
    assert(text.includes('日辰换日：23:00 子初换日'), `复制上下文未记录换日口径：${text}`);
});


test('23:00 子初换日的应期日期区分页面起始时间与复制完整时段', () => {
    const lateZi = new Date(2026, 7, 17, 23, 27, 0);
    assert(liuyao.candidateDateWindow(lateZi, 1, 'display') === '2026/8/17 23:00 起', `晚子时页面时段异常：${liuyao.candidateDateWindow(lateZi, 1, 'display')}`);
    assert(liuyao.candidateDateWindow(lateZi, 1, 'context') === '2026/8/17 23:00 ～ 2026/8/18 22:59', `晚子时复制时段异常：${liuyao.candidateDateWindow(lateZi, 1, 'context')}`);
    const daytime = new Date(2026, 7, 18, 10, 0, 0);
    assert(liuyao.candidateDateWindow(daytime, 1, 'display') === '2026/8/17 23:00 起', `白天落在同一子初日时起点误判：${liuyao.candidateDateWindow(daytime, 1, 'display')}`);
    assert(liuyao.candidateDateWindow(daytime, 1, 'context') === '2026/8/17 23:00 ～ 2026/8/18 22:59', `白天落在同一子初日时复制区间误判：${liuyao.candidateDateWindow(daytime, 1, 'context')}`);
    assert(liuyao.candidateDateWindow(daytime, 2, 'display') === '2026/8/18', '24:00 默认口径不应附加时段');
});

test('六爻复制上下文优先使用应期完整时间区间', () => {
    const result = {question:'',solarText:'2026年8月9日 23:27',lunarText:'丙午年 六月廿七 子时',monthGanZhi:'丙申',dayGanZhi:'丙辰',dayChangeLabel:'23:00 子初换日',xunKong:'子丑',original:{name:'小畜'},changed:{name:'剥'},palace:{},movingText:'初爻',lines:[],fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const timing = [{id:'void',title:'旬空：填实、冲空与出旬',reason:'父母子水落旬空。',tier:'structure',dates:['子日填实 · 2026/8/17 23:00 起'],contextDates:['子日填实 · 2026/8/17 23:00 ～ 2026/8/18 22:59']}];
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,null,null,{judgments:[]},timing,[]);
    assert(text.includes('子日填实 · 2026/8/17 23:00 ～ 2026/8/18 22:59'), `复制上下文未使用完整时段：${text}`);
    assert(!text.includes('子日填实 · 2026/8/17 23:00 起'), '复制上下文仍沿用页面简写');
});


test('六爻应期按实际触发时间聚合，同日冲空与静爻逢冲只显示一个日期节点', () => {
    const items = liuyao.mergeTimingCandidatesByDate([
        {id:'void',title:'旬空',reason:'父母丑土落旬空。',tier:'structure',events:[
            {key:'date:2026/8/12 23:00 ～ 2026/8/13 22:59',sortTime:1,dayLabel:'未日',displayWindow:'2026/8/12 23:00 起',contextWindow:'2026/8/12 23:00 ～ 2026/8/13 22:59',eventLabel:'冲空',reason:'父母丑土旬空逢未日相冲，为冲空。',tier:'structure'},
            {key:'date:2026/8/18 23:00 ～ 2026/8/19 22:59',sortTime:3,dayLabel:'丑日',displayWindow:'2026/8/18 23:00 起',contextWindow:'2026/8/18 23:00 ～ 2026/8/19 22:59',eventLabel:'填实',reason:'父母丑土值日，旬空填实。',tier:'structure'},
            {key:'date:2026/8/17 23:00 ～ 2026/8/18 22:59',sortTime:2,dayLabel:'出旬',displayWindow:'2026/8/17 23:00 起',contextWindow:'2026/8/17 23:00 ～ 2026/8/18 22:59',eventLabel:'出空',reason:'【子丑】旬空结束，父母丑土出空。',tier:'structure'}
        ]},
        {id:'static',title:'静爻逢冲',reason:'父母丑土为静爻。',tier:'regular',events:[
            {key:'date:2026/8/12 23:00 ～ 2026/8/13 22:59',sortTime:1,dayLabel:'未日',displayWindow:'2026/8/12 23:00 起',contextWindow:'2026/8/12 23:00 ～ 2026/8/13 22:59',eventLabel:'静爻逢冲',reason:'父母丑土为静爻，未日与丑相冲。',tier:'regular'}
        ]}
    ]);
    const clash = items.find((item)=>item.title.startsWith('未日 · '));
    assert(clash, `未日触发节点缺失：${JSON.stringify(items)}`);
    assert(clash.triggers?.some((item)=>item.label==='冲空') && clash.triggers?.some((item)=>item.label==='静爻逢冲'), `未日没有聚合冲空与静爻逢冲：${JSON.stringify(clash)}`);
    assert(clash.title.includes('23:00 起') && clash.contextTitle.includes('23:00 ～'), `23:00 换日的应期标题时段异常：${JSON.stringify(clash)}`);
    assert(!clash.reason.includes('旬空：填实、冲空与出旬'), `应期仍以整条规则名代替实际触发：${clash.reason}`);
    assert(items.some((item)=>item.triggers?.some((trigger)=>trigger.label==='填实')) && items.some((item)=>item.triggers?.some((trigger)=>trigger.label==='出空')), '填实或出空没有拆成独立时间触发');
});


test('应期同一时间节点优先用明确干支日作为标题，出旬退回触发标签', () => {
    const items = liuyao.mergeTimingCandidatesByDate([
        {id:'void',title:'旬空',reason:'父母丑土落旬空。',tier:'structure',events:[
            {key:'date:2026/8/18',sortTime:1,dayLabel:'出旬',displayWindow:'2026/8/18',contextWindow:'2026/8/18',eventLabel:'出空',reason:'父母丑土出空。',tier:'structure'}
        ]},
        {id:'moving',title:'动爻逢合',reason:'父母丑土发动。',tier:'regular',events:[
            {key:'date:2026/8/18',sortTime:1,dayLabel:'子日',displayWindow:'2026/8/18',contextWindow:'2026/8/18',eventLabel:'动爻逢合',reason:'父母丑土发动，子日与丑六合。',tier:'regular'}
        ]}
    ]);
    assert(items.length === 1, `同一日期没有聚合成单节点：${JSON.stringify(items)}`);
    assert(items[0].title === '子日 · 2026/8/18', `存在干支日时标题未优先使用干支日：${items[0].title}`);
    assert(items[0].triggers.some((item)=>item.label==='出空') && items[0].triggers.some((item)=>item.label==='动爻逢合'), `聚合后触发条件丢失：${JSON.stringify(items[0])}`);
});

test('v13.42.16 当前日月可补足两动爻三合，不再生成未来同支补局应期', () => {
    const rows = [
        {position:1,label:'初爻',relation:'兄弟',branch:'未',element:'土',moving:false,statusTags:[],changedBranch:'未'},
        {position:2,label:'二爻',relation:'父母',branch:'巳',element:'火',moving:false,statusTags:[],changedBranch:'巳'},
        {position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,statusTags:[],changedBranch:'卯'},
        {position:4,label:'四爻',relation:'子孙',branch:'申',element:'金',moving:true,statusTags:[],changedBranch:'午'},
        {position:5,label:'五爻',relation:'兄弟',branch:'戌',element:'土',moving:false,statusTags:[],changedBranch:'戌'},
        {position:6,label:'上爻',relation:'妻财',branch:'子',element:'水',moving:true,statusTags:[],changedBranch:'戌'}
    ];
    const sanHe = liuyao.buildMovingSanHe(rows, '申', '辰');
    assert(sanHe.complete.some((text) => text.includes('四爻、上爻见申子') && text.includes('得日辰【辰】补足') && text.includes('申子辰三合水局')), `当前辰日未补成申子辰三合：${JSON.stringify(sanHe)}`);
    assert(sanHe.pending.length === 0 && sanHe.pendingDetails.length === 0, `当前日辰已补局却仍保留待补：${JSON.stringify(sanHe.pending)}`);
    const candidates = liuyao.buildTimingCandidates(rows[2], {castTimestamp:Date.now(),dayXun:'',daySect:2,fullStructure:{sanHe}});
    assert(!candidates.some((item) => item.triggers?.some((trigger) => String(trigger.id).startsWith('sanhe-'))), `已由当前日辰补局却仍生成未来补局应期：${JSON.stringify(candidates)}`);
});

test('v13.42.16 日冲日破优先于同五行比扶，避免同一日辰标签自相冲突', () => {
    const status = liuyao.buildLiuYaoLineStatus({branch:'戌',element:'土'}, '申', '辰', '子丑', false);
    const codes = new Set(status.tags.map((tag) => tag.code));
    assert(codes.has('DAY_BREAK'), `辰日冲戌未形成日破提示：${JSON.stringify(status.tags)}`);
    assert(!codes.has('DAY_SUPPORT'), `辰戌相冲时仍同时输出日辰比扶：${JSON.stringify(status.tags)}`);
});

test('v13.42.16 出行以世爻作为主要观察爻，不再把世爻六亲误写为占类用神', () => {
    const target = {type:'line',position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[{code:'SEASON_STATE',text:'月令死',type:'constraint'},{code:'MONTH_CONTROL',text:'月建克',type:'constraint'}],moveTags:[]};
    const ying = {type:'line',position:6,label:'上爻',relation:'妻财',branch:'子',element:'水',moving:true,isShi:false,isYing:true,statusTags:[],moveTags:[]};
    const result = {
        question:'明天出行如何', solarText:'2026年8月10日 15:51', lunarText:'丙午年 六月廿八 申时', monthGanZhi:'丙申', monthZhi:'申', dayGanZhi:'丙辰', dayZhi:'辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷇',name:'比',number:8}, changed:{symbol:'䷋',name:'否',number:12}, palace:{palace:'坤',stage:'归魂',element:'土'}, movingText:'四爻、上爻',
        lines:[target,ying], displayLines:[ying,target], flyingHidden:[], fullStructure:{originalNature:'非六冲六合卦',changedNature:'六合卦',originalNatureCode:'NEUTRAL',changedNatureCode:'SIX_HARMONY',shiYing:{tags:[],text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'travel',focusLabel:'出行、旅行与行程',target:'世',candidateCount:1,specificity:'specific',categoryConfidence:'high'}
    };
    const analysis = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, analysis, []);
    assert(interpretation.judgments[0]?.title.startsWith('观察对象'), `出行结构解读仍以“用神”命名：${interpretation.judgments[0]?.title}`);
    const timeFocus = {entries:[{title:'明天 · 2026/8/11 · 丁巳日',facts:['二爻父母巳火临目标日【巳】']}]};
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, analysis, interpretation, [], [], timeFocus);
    assert(text.includes('【主要观察爻】') && !text.includes('【当前用神／观察对象】'), `出行复制上下文未切换主要观察爻标题：${text}`);
    assert(text.includes('围绕主观察爻的生扶五行') && text.includes('【目标时点】') && text.includes('明天 · 2026/8/11 · 丁巳日'), `出行上下文未写入目标时点或观察爻生克口径：${text}`);
});

test('v13.42.16 六爻详细页单列目标时点，并按出行状态切换观察爻标题', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('<div class="detail-section-title">目标时点</div>') && html.includes('questionTimeFocus.entries'), '详细分析页未加入目标时点模块');
    assert(html.includes("useGodSelectionIsTravel ? '主要观察爻与生克关系' : '用神与元忌仇神'"), '出行详细页未区分主要观察爻与传统用神标题');
});

test('三合待补文案说明现有两支、所缺支与补成后的三合局', () => {
    const sanHe = liuyao.buildMovingSanHe([
        {position:1,label:'初爻',branch:'子',moving:true,changedBranch:'未'},
        {position:2,label:'二爻',branch:'寅',moving:true,changedBranch:'巳'},
        {position:3,label:'三爻',branch:'辰',moving:true,changedBranch:'卯'},
        {position:4,label:'四爻',branch:'丑',moving:true,changedBranch:'午'},
        {position:5,label:'五爻',branch:'亥',moving:true,changedBranch:'申'},
        {position:6,label:'上爻',branch:'酉',moving:true,changedBranch:'戌'}
    ]);
    assert(sanHe.pending.some((text)=>text.includes('初爻、三爻见子辰，待申成申子辰三合水局（未成局）')), `子辰待申文案未完整说明补局结果：${JSON.stringify(sanHe.pending)}`);
    assert(sanHe.pending.some((text)=>text.includes('四爻、上爻见酉丑，待巳成巳酉丑三合金局（未成局）')), `酉丑待巳文案未完整说明补局结果：${JSON.stringify(sanHe.pending)}`);
    assert(!sanHe.pending.some((text)=>text.includes('两支待')), `仍保留旧式“两个支待某支”机器文案：${JSON.stringify(sanHe.pending)}`);
});

test('八字出生信息说明文字位于控件下方，六爻宽屏双卡等高', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'assets', 'app.css'), 'utf8');
    const birthStart = html.indexOf('<h2 class="panel-title">出生信息</h2>');
    const birthEnd = html.indexOf('</section>', birthStart);
    const section = html.slice(birthStart, birthEnd);
    assert(section.includes('<span class="field-label">性别</span>') && section.includes('仅用于起运顺逆计算。</span>'), '性别说明未移到控件下方');
    const genderStart = section.indexOf('<div class="gender-choice-row">');
    const genderEnd = section.indexOf('</div>', genderStart);
    const genderBox = section.slice(genderStart, genderEnd);
    assert(genderStart >= 0 && !genderBox.includes('仅用于起运顺逆计算'), '性别说明仍嵌在单选框容器内部');
    assert(section.includes('<span class="field-label">出生地</span>') && section.includes('选填，仅作记录。</span>'), '出生地说明未移到输入框下方');
    assert(!section.includes('出生地（选填，仅作记录）'), '出生地说明仍塞在字段标题中');
    assert(css.includes('.liuyao-input-grid { align-items: stretch; }') && css.includes('.liuyao-input-grid > .input-card { height: 100%; }'), '六爻首页左右主卡未设置宽屏等高对齐');
});


test('六爻月破应期使用逢值/合破/出破，且出破读取下一节令边界', () => {
    const target = { relation:'子孙', branch:'寅', element:'木', moving:true, changedBranch:'辰', statusTags:[{code:'MONTH_BREAK',text:'月破',type:'constraint'}], moveTags:[] };
    const result = { castTimestamp:'2026-08-10T00:05:00+09:00', dayXun:'甲子', daySect:2, fullStructure:{sanHe:{pendingDetails:[]}} };
    const items = liuyao.buildTimingCandidates(target, result);
    const allTriggers = items.flatMap((item) => item.triggers || []);
    assert(allTriggers.some((trigger) => trigger.label === '逢值' && trigger.reason.includes('寅日值日')), '月破逢值触发缺失');
    assert(allTriggers.some((trigger) => trigger.label === '合破'), '月破合破触发缺失');
    assert(allTriggers.some((trigger) => trigger.label === '出破'), '月破出破触发缺失');
    assert(!allTriggers.some((trigger) => trigger.label === '填实' && trigger.id === 'month-break'), '月破仍错误使用填实标签');
});

test('六爻三合古籍 matcher 区分待补、空破待实与入墓待冲', () => {
    const base = {monthGanZhi:'丙申',monthZhi:'申',dayGanZhi:'丙辰',dayGan:'丙',dayZhi:'辰',xunKong:'子丑',original:{symbol:'䷂',name:'屯'},palace:{palace:'坎',stage:'二世'},lines:[], flyingHidden:[], fullStructure:{originalNatureCode:'NEUTRAL',changedNatureCode:'NEUTRAL',fanFu:[],shiYing:{text:'—'}}};
    const complete = {...base, fullStructure:{...base.fullStructure, sanHe:{complete:['动变支会齐申子辰三合水局'],deferred:[],deferredDetails:[],pending:[]}}};
    const pending = {...base, fullStructure:{...base.fullStructure, sanHe:{complete:[],deferred:[],deferredDetails:[],pending:['子辰两支待申（未成局）']}}};
    const voidDeferred = {...base, fullStructure:{...base.fullStructure, sanHe:{complete:[],pending:[],deferred:['申子辰三支齐备；但上爻妻财子水旬空，三合局尚未落实'],deferredDetails:[{blockers:[{code:'VOID',token:{branch:'子'}}]}]}}};
    const tombDeferred = {...base, fullStructure:{...base.fullStructure, sanHe:{complete:[],pending:[],deferred:['亥卯未三支齐备；但变爻未土入墓，三合局尚未落实'],deferredDetails:[{blockers:[{code:'TRANSFORM_TOMB',token:{branch:'未'}}]}]}}};
    const completeEntries = liuyaoLit.buildLiuYaoLiterature(complete,null);
    const pendingEntries = liuyaoLit.buildLiuYaoLiterature(pending,null);
    const voidEntries = liuyaoLit.buildLiuYaoLiterature(voidDeferred,null);
    const tombEntries = liuyaoLit.buildLiuYaoLiterature(tombDeferred,null);
    assert(!completeEntries.some((item)=>item.id.startsWith('zengshan-sanhe-pending') || item.id.startsWith('zengshan-sanhe-deferred')), '完整三合错误匹配待补/待实原文');
    const pendingEntry = pendingEntries.find((item)=>item.id==='zengshan-sanhe-pending');
    assert(pendingEntry && pendingEntry.quote.includes('须待后之补凑') && pendingEntry.match.includes('待申'), '待补三合未匹配“两爻动待第三支”原文');
    const voidEntry = voidEntries.find((item)=>item.id==='zengshan-sanhe-deferred-void-break');
    assert(voidEntry && voidEntry.quote.includes('一空破者') && voidEntry.match.includes('旬空'), '旬空待实未匹配“空破待填满”原文');
    const tombEntry = tombEntries.find((item)=>item.id==='zengshan-sanhe-deferred-tomb');
    assert(tombEntry && tombEntry.quote.includes('入墓者待冲开') && tombEntry.match.includes('入墓'), '入墓待实未匹配“待冲开”原文');
});

test('六爻结构解读 judgment 保留分点数据，长关系链不再只能输出单段摘要', () => {
    const target={type:'line',position:2,label:'二爻',relation:'子孙',branch:'寅',element:'木',moving:true,changedRelation:'官鬼',changedBranch:'辰',changedElement:'土',statusTags:[{code:'MONTH_BREAK',text:'月破',type:'constraint'}],moveTags:[],isShi:true,isYing:false,sourceText:'本卦明爻'};
    const rows=[
        {position:1,label:'初爻',relation:'兄弟',branch:'子',element:'水',moving:true,changedRelation:'子孙',changedBranch:'寅',changedElement:'木',statusTags:[],moveTags:[],isShi:false,isYing:false},
        target,
        {position:3,label:'三爻',relation:'官鬼',branch:'辰',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'父母',branch:'申',element:'金',moving:true,changedRelation:'妻财',changedBranch:'午',changedElement:'火',statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:5,label:'五爻',relation:'官鬼',branch:'戌',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:true},
        {position:6,label:'上爻',relation:'兄弟',branch:'子',element:'水',moving:true,changedRelation:'官鬼',changedBranch:'戌',changedElement:'土',statusTags:[],moveTags:[],isShi:false,isYing:false}
    ];
    const result={monthZhi:'申',dayZhi:'辰',lines:rows,flyingHidden:[],fullStructure:{originalNatureCode:'NEUTRAL',changedNatureCode:'NEUTRAL',originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{text:'世应',tags:[]},sanHe:{complete:[],pending:[]},fanFu:[]}};
    const use=liuyao.buildUseGodAnalysis(target,result);
    const output=liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    assert(output.judgments.every((item)=>Array.isArray(item.points)), '结构解读 judgment 未提供 points 数组');
    assert(output.judgments.find((item)=>item.id==='use-relations')?.points.length >= 2, '用神关系链未拆成多个叙述点');
    assert(output.judgments.find((item)=>item.id==='whole-structure')?.points.length >= 2, '动变卦体结构未按动爻/结构拆点');
    const css = fs.readFileSync(path.join(ROOT, 'assets/app.css'), 'utf8');
    assert(css.includes('.timing-trigger-row .timing-trigger { margin-top: 0; }'), '应期灰色说明仍继承通用 margin-top 下沉');
});


test('v13.42.16 三合三支齐备但参与支旬空时改列待实，不直接宣布成局', () => {
    const rows = [
        {position:1,label:'初爻',relation:'兄弟',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],changedBranch:'未'},
        {position:2,label:'二爻',relation:'父母',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],changedBranch:'巳'},
        {position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[],changedBranch:'卯'},
        {position:4,label:'四爻',relation:'子孙',branch:'申',element:'金',moving:true,statusTags:[],moveTags:[],changedBranch:'午',changedElement:'火'},
        {position:5,label:'五爻',relation:'兄弟',branch:'戌',element:'土',moving:false,statusTags:[],moveTags:[],changedBranch:'戌'},
        {position:6,label:'上爻',relation:'妻财',branch:'子',element:'水',moving:true,statusTags:[{code:'VOID',text:'旬空',type:'void'}],moveTags:[],changedBranch:'戌',changedElement:'土'}
    ];
    const sanHe = liuyao.buildMovingSanHe(rows, '申', '辰');
    assert(sanHe.complete.length === 0, `子水旬空仍被直接判成局：${JSON.stringify(sanHe)}`);
    assert(sanHe.deferred?.length === 1 && sanHe.deferred[0].includes('得日辰【辰】补足申子辰三支') && sanHe.deferred[0].includes('上爻妻财子水旬空') && sanHe.deferred[0].includes('三合局尚未落实') && sanHe.deferred[0].includes('待子水填实／冲空／出空后再观察成局'), `三合待实文案异常：${JSON.stringify(sanHe)}`);
    assert(sanHe.pending.length === 0, `三支已齐备却又退回待补：${JSON.stringify(sanHe.pending)}`);
});

test('v13.42.16 明确问明天时过滤目标日之外的普通应期', () => {
    const target = {type:'line',position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,statusTags:[],moveTags:[]};
    const result = {
        question:'明天出行如何',
        castTimestamp:'2026-08-10T16:17:00+09:00',
        dayXun:'甲寅', daySect:2,
        fullStructure:{sanHe:{pendingDetails:[]}}
    };
    const items = liuyao.buildTimingCandidates(target, result);
    assert(items.length === 0, `明天占问仍显示 8/15 等窗口外应期：${JSON.stringify(items)}`);
});

test('v13.42.16 出行结构解读不再混用元神忌神仇神，并移除用神章直接匹配', () => {
    const target = {type:'line',position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    const rows = [
        {position:1,label:'初爻',relation:'兄弟',branch:'未',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:2,label:'二爻',relation:'父母',branch:'巳',element:'火',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        target,
        {position:4,label:'四爻',relation:'子孙',branch:'申',element:'金',moving:true,changedRelation:'父母',changedBranch:'午',changedElement:'火',statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:5,label:'五爻',relation:'兄弟',branch:'戌',element:'土',moving:false,statusTags:[],moveTags:[],isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'妻财',branch:'子',element:'水',moving:true,changedRelation:'兄弟',changedBranch:'戌',changedElement:'土',statusTags:[{code:'VOID',text:'旬空',type:'void'}],moveTags:[],isShi:false,isYing:true}
    ];
    const result = {
        question:'明天出行如何', monthGanZhi:'丙申',monthZhi:'申',dayGanZhi:'丙辰',dayGan:'丙',dayZhi:'辰',xunKong:'子丑',
        original:{symbol:'䷇',name:'比'}, palace:{palace:'坤',stage:'归魂'}, lines:rows, flyingHidden:[],
        fullStructure:{originalNature:'非六冲六合卦',changedNature:'六合卦',originalNatureCode:'NEUTRAL',changedNatureCode:'SIX_HARMONY',transition:'非六冲六合卦 → 六合卦',shiYing:{text:'世应',tags:[]},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'travel',focusLabel:'出行、旅行与行程',target:'世',candidateCount:1,specificity:'specific',categoryConfidence:'high'}
    };
    const analysis = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, analysis, []);
    const relation = interpretation.judgments.find((item)=>item.id==='use-relations');
    assert(relation && relation.summary.includes('生扶五行') && relation.summary.includes('克制五行') && relation.summary.includes('间接制约五行'), `出行关系链未使用新术语：${relation?.summary}`);
    assert(!/[元忌仇]神/.test(relation.summary), `出行关系链仍混用元神/忌神/仇神：${relation.summary}`);
    const literature = liuyaoLit.buildLiuYaoLiterature(result, target);
    assert(!literature.some((item)=>item.id==='zengshan-use'), '出行以世爻为观察对象时仍匹配用神章');
});

test('v13.42.16 无目标窗口内应期时复制上下文省略空应期标题', () => {
    const target = {type:'line',position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    const result = {question:'明天出行如何',solarText:'2026年8月10日 16:17',lunarText:'丙午年 六月廿八 申时',monthGanZhi:'丙申',monthZhi:'申',dayGanZhi:'丙辰',dayZhi:'辰',dayChangeLabel:'24:00 换日（默认）',xunKong:'子丑',original:{symbol:'䷇',name:'比',number:8},changed:{symbol:'䷋',name:'否',number:12},palace:{palace:'坤',stage:'归魂',element:'土'},movingText:'四爻、上爻',lines:[target],displayLines:[target],flyingHidden:[],fullStructure:{originalNature:'非六冲六合卦',changedNature:'六合卦',originalNatureCode:'NEUTRAL',changedNatureCode:'SIX_HARMONY',shiYing:{text:'—',tags:[]},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},useGodSelection:{mode:'suggestion',focusId:'travel',target:'世'}};
    const analysis = liuyao.buildUseGodAnalysis(target,result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result,target,analysis,[]);
    const text = liuyaoInterpretation.buildLiuYaoContextText(result,target,analysis,interpretation,[],[],{entries:[{title:'明天 · 2026/8/11 · 丁巳日',facts:[]}]});
    assert(!text.includes('【应期观察】'), `无有效应期仍输出空标题：${text}`);
});

test('v13.43.0 QuestionTimeScope 被六爻核心统一读取', () => {
    const scope = liuyao.resolveQuestionTimeScope('下周三到下下周一出差如何', new Date(2026,7,10,16,42,0));
    assert(scope && scope.type === 'explicit-range' && scope.purpose === 'target', `六爻核心未取得标准时间范围：${JSON.stringify(scope)}`);
    assert(GuiJia.questionTime.dateKey(scope.start) === '2026/8/19' && GuiJia.questionTime.dateKey(scope.end) === '2026/8/24', `六爻核心时间范围错误：${JSON.stringify(scope)}`);
});

test('v13.43.0 明确范围可硬过滤应期，模糊时间不得硬过滤', () => {
    const target = {type:'line',position:3,label:'三爻',relation:'官鬼',branch:'卯',element:'木',moving:false,isShi:true,isYing:false,statusTags:[],moveTags:[]};
    const baseResult = {castTimestamp:new Date(2026,7,10,16,42,0).getTime(),daySect:2,dayXun:'甲寅',fullStructure:{sanHe:{pendingDetails:[]}}};
    const rangeItems = liuyao.buildTimingCandidates(target, {...baseResult, question:'8月15日至20日什么时候有变化'});
    assert(rangeItems.every((item) => item.sortTime >= new Date(2026,7,15,0,0,0).getTime() && item.sortTime <= new Date(2026,7,20,23,59,59).getTime()), `明确范围外仍有应期：${JSON.stringify(rangeItems)}`);
    const vagueItems = liuyao.buildTimingCandidates(target, {...baseResult, question:'近期什么时候有变化'});
    assert(vagueItems.length > 0, '模糊时间错误清空普通应期');
});

test('v13.43.5 范围时间上下文使用独立目标时间范围并抑制重复应期区', () => {
    const result = {
        question:'8月15日至20日出差如何', solarText:'2026年8月10日 16:55', lunarText:'丙午年 六月廿八 申时', monthGanZhi:'丙申', monthZhi:'申', dayGanZhi:'丙辰', dayZhi:'辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷱',name:'鼎',number:50}, changed:{symbol:'䷬',name:'萃',number:45}, palace:{palace:'离',stage:'二世',element:'火'}, movingText:'二爻、三爻、五爻、上爻',
        lines:[], displayLines:[], flyingHidden:[], fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{tags:[],text:'—'},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'travel',focusLabel:'出行、旅行与行程',target:'世',candidateCount:1,specificity:'specific',categoryConfidence:'high'}
    };
    const target = {type:'line',position:2,label:'二爻',relation:'官鬼',branch:'亥',element:'水',moving:true,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    result.lines = [target]; result.displayLines = [target];
    const analysis = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, analysis, []);
    const rangeFocus = {kind:'range',title:'8月15日至20日 · 2026/8/15 ～ 2026/8/20',modeLabel:'过程节点观察',note:'聚焦这段时间内结构变化较明显的日期，观察过程中的起伏与转折。',keyNodes:[{title:'2026/8/20 · 丙寅日',facts:['动爻逢合：二爻（世）官鬼亥水与【寅】日六合']}]};
    const timing = [{title:'寅日 · 2026/8/20',contextTitle:'寅日 · 2026/8/20',triggers:[{label:'动爻逢合',reason:'官鬼亥水发动，寅日与亥六合。'}]}];
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, analysis, interpretation, timing, [], rangeFocus);
    assert(text.includes('【目标时间范围】') && text.includes('2026/8/20 · 丙寅日'), `范围上下文缺少关键节点：${text}`);
    assert(!text.includes('【应期观察】'), `范围分析后仍重复输出独立应期区：${text}`);
});

test('v13.43.5 明确离散候选抑制重复应期并提示默认世爻比较基准', () => {
    const result = {
        question:'明天还是周五哪个好', solarText:'2026年8月10日 17:40', lunarText:'丙午年 六月廿八 酉时', monthGanZhi:'丙申', monthZhi:'申', dayGanZhi:'丙辰', dayZhi:'辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷺',name:'涣',number:59}, changed:{symbol:'䷧',name:'解',number:40}, palace:{palace:'离',stage:'五世',element:'火'}, movingText:'五爻',
        lines:[], displayLines:[], flyingHidden:[], fullStructure:{originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{tags:[],text:'—'},sanHe:{complete:[],deferred:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'default'}
    };
    const target = {type:'line',position:5,label:'五爻',relation:'兄弟',branch:'巳',element:'火',moving:true,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[],changedRelation:'妻财',changedBranch:'申',changedElement:'金'};
    result.lines = [target]; result.displayLines = [target];
    const analysis = liuyao.buildUseGodAnalysis(target, result);
    const interpretation = liuyaoInterpretation.buildLiuYaoInterpretation(result, target, analysis, []);
    const pointFocus = {kind:'point',suppressTimingCandidates:true,comparisonBasisNote:'比较事项未明确，以下仅按世爻状态作为当前比较基准。',comparison:{summary:'按当前观察基准，相对优先观察：2026/8/11 丁巳日；次看：2026/8/14 庚申日。'},entries:[{title:'明天 · 2026/8/11 · 丁巳日',facts:[]},{title:'周五 · 2026/8/14 · 庚申日',facts:[]}]};
    const timing = [{title:'申日 · 2026/8/14',contextTitle:'申日 · 2026/8/14',triggers:[{label:'动爻逢合',reason:'兄弟巳火发动，申日与巳六合。'}]}];
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, analysis, interpretation, timing, [], pointFocus);
    assert(text.includes('仅按世爻状态作为当前比较基准') && text.includes('按当前观察基准，相对优先观察'), `事项不明的日期比较没有降级：${text}`);
    assert(!text.includes('【应期观察】'), `明确离散候选后仍重复输出应期观察：${text}`);
});

test('v13.44.0 时间专项正式收口与发布审计封存', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const checklist = fs.readFileSync(path.join(ROOT, 'docs', 'DEPLOYMENT_CHECKLIST.md'), 'utf8');
    assert(pkg.version === '13.44.0', `package version 未切到 13.44.0：${pkg.version}`);
    ['assets/tailwind-utilities.css?v=13.44.0','assets/app.css?v=13.44.0','./js/common.js?v=13.44.0','./js/question-time.js?v=13.44.0','./js/liuyao-time-facts.js?v=13.44.0','./js/liuyao-time-effects.js?v=13.44.0','./js/liuyao-time-assessment.js?v=13.44.0','./js/liuyao-time-evidence.js?v=13.44.0','./js/liuyao-time-relevance.js?v=13.44.0','./js/liuyao-time-output.js?v=13.44.0','./js/liuyao-time-selection.js?v=13.44.0','./js/iching-loader.js?v=13.44.0','./js/bazi-core.js?v=13.44.0','./js/bazi-timing.js?v=13.44.0','./js/bazi-transit-analysis.js?v=13.44.0','./js/bazi-literature.js?v=13.44.0','./js/bazi-interpretation.js?v=13.44.0','./js/bazi-detail.js?v=13.44.0','./js/liuyao-core.js?v=13.44.0','./js/liuyao-interpretation.js?v=13.44.0','./js/liuyao-literature.js?v=13.44.0','./js/app.js?v=13.44.0']
        .forEach((ref) => assert(html.includes(ref), `发布资源未统一缓存版本：${ref}`));
    assert(html.includes('<div class="detail-section-title">目标时间范围</div>') && html.includes('questionTimeFocus.keyNodes') && html.includes('questionTimeFocus.modeLabel'), '时间范围分析卡未进入详细页');
    assert(html.includes("<section v-if=\"timingCandidates.length && questionTimeFocus?.kind !== 'range' && !questionTimeFocus?.suppressTimingCandidates\" class=\"panel-card ui-layer-evidence\">"), '明确目标时间启用时应期卡未去重或无应期时仍会显示空白卡');
    assert(html.includes('释义与适用范围') && html.includes('<dt>适用范围</dt>'), '古籍浏览仍保留开发式“边界”标题');
    assert(!html.includes('不自动代断') && !html.includes('不直接转化为吉凶断语'), '首页仍保留开发式边界文案');
    assert(readme.startsWith('# 龟甲 v13.44.0') && readme.includes('TimeFact') && readme.includes('TimeEffect') && readme.includes('Node Assessment') && readme.includes('Evidence Selector') && readme.includes('Candidate Output') && readme.includes('Time Review') && readme.includes('Date Selection') && readme.includes('Structural Relevance') && readme.includes('六维非补偿 Pareto') && readme.includes('判断原则冻结') && readme.includes('旧节点摘要'), 'README 未同步 v13.44.0 正式收口说明');
    assert(checklist.includes('龟甲 v13.44.0') && checklist.includes('TimeFact') && checklist.includes('TimeEffect') && checklist.includes('Node Assessment') && checklist.includes('Evidence Selector') && checklist.includes('Candidate Output') && checklist.includes('alpha.6 开发对照审阅') && checklist.includes('alpha.7 日期选择原则审阅') && checklist.includes('alpha.8 结构相关性 / 触发重要度审阅') && checklist.includes('alpha.9 剩余并列分型审计') && checklist.includes('alpha.10 六维 Date Selection 冻结验收') && checklist.includes('关键动爻 / 化空变爻时间状态回归') && checklist.includes('npm run predeploy'), '阶段验证清单未同步 v13.44.0 正式版');
    assert(checklist.includes('值 / 合 / 冲与五行生克并行计算') && checklist.includes('直接月冲优先按月破 / 日破方向') && checklist.includes('TimeFact') && checklist.includes('TimeEffect 六维映射'), '既有时间效力 smoke test 或 Fact/Effect 阶段检查未写入清单');
    assert(html.includes('class="site-disclaimer"') && html.includes('龟甲仅供传统文化学习、研究与娱乐参考') && html.includes('不构成医疗、法律、投资等专业意见'), '首页免责声明未进入发布页面');
    assert(html.includes('比较结果：{{ questionTimeFocus.comparison.summary }}') && html.includes('节点效力：{{ entry.effectSummary }}') && html.includes('日期判断：{{ entry.assessment.text }}'), '时间节点效力 / 日期比较结果未进入详细页');
    assert(checklist.includes('首页底部免责声明'), '部署清单未加入首页免责声明 smoke test');
    assert(html.includes('尽量写清“谁／什么事／想问什么结果”') && html.includes('这次面试能否通过？') && html.includes('这笔款项什么时候到账？') && html.includes('我和伴侣的感情接下来会怎样？'), '六爻占问填写引导未进入发布页面');
    const liuyaoCoreSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-core.js'), 'utf8');
    assert(liuyaoCoreSource.includes("'静爻逢冲·日破'") && liuyaoCoreSource.includes("'静爻逢冲·暗动'") && liuyaoCoreSource.includes("'静爻逢合·合起'") && liuyaoCoreSource.includes("'动爻逢合·合绊'"), '时间节点效力层未区分暗动/日破/合起/合绊');
    assert(liuyaoCoreSource.includes('pushVoidTransition') && liuyaoCoreSource.includes('出空后逢值') && liuyaoCoreSource.includes('三合成员逢值'), '关键动爻旬空转换或三合成员逢值未进入范围事件池');
    assert(liuyaoCoreSource.includes('rangeMovingValueMeta') && liuyaoCoreSource.includes('生扶动爻逢值') && liuyaoCoreSource.includes('变爻逢值·月破复核'), '普通关键动爻逢值或变爻日期补充事实未进入范围事件池');
    assert(liuyaoCoreSource.includes('rangeStaticValueMeta') && liuyaoCoreSource.includes('生扶爻逢值') && liuyaoCoreSource.includes('状态不再反向决定重要性') && liuyaoCoreSource.includes('staticKeyLineMeta') && liuyaoCoreSource.includes('isKey = isShiYing || isExplicitCandidate || Boolean(valueMeta) || isStructureMember'), 'KeyLine 状态收束未进入范围事件池');
    assert(liuyaoCoreSource.includes('地支值/合/冲与五行生克是并行事实') && liuyaoCoreSource.includes('rangeNodeEffectPool') && liuyaoCoreSource.includes('一级结构事件不能遮掉主要观察爻自身'), '目标日地支关系与五行效力未并行合流');
    assert(liuyaoCoreSource.includes('直接月冲（月破）优先于') && liuyaoCoreSource.includes('selectRangeDisplayEvents') && liuyaoCoreSource.includes('展示语义相同即去重'), '月破优先级或范围事实展示去重未进入发布源码');
    const evidenceSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-evidence.js'), 'utf8');
    const outputSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-output.js'), 'utf8');
    assert(liuyaoCoreSource.includes('node.timeEvidence = timeEvidenceApi.selectNodeEvidence') && liuyaoCoreSource.includes('buildTimeEvidenceForDay'), 'Evidence Selector 未并行接入范围节点');
    assert(evidenceSource.includes('subsumed-by-compound') && evidenceSource.includes('coalesced-into-compound') && evidenceSource.includes('uncoveredKinds'), 'Evidence Selector 缺少结构化包含去重或覆盖校验');
    assert(liuyaoCoreSource.includes('node.candidateOutput = timeOutputApi.buildCandidateNodeOutput') && liuyaoCoreSource.includes('buildCandidateTimeOutputForDay'), 'Candidate Output 未并行接入时间节点');
    assert(liuyaoCoreSource.includes('processNodeEligible') && liuyaoCoreSource.includes('processEventEligible') && liuyaoCoreSource.includes('processEventRelevanceRank'), '过程型关键节点准入未迁移到 Structural Relevance + TimeFact');
    assert(!liuyaoCoreSource.includes("return node.events.some((item) => item.tier === 'primary');"), '过程型关键节点仍直接依赖 legacy primary tier');
    assert(outputSource.includes('buildCandidateNodeOutput') && outputSource.includes('buildDateSelectionComparison') && outputSource.includes('DIMENSION_LABELS'), 'Candidate Output 缺少候选摘要、日期比较或六维文案映射');
    const selectionSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-selection.js'), 'utf8');
    assert(selectionSource.includes('six-dimensional-non-compensatory-pareto') && selectionSource.includes('受制') && selectionSource.includes('六维非补偿 Pareto') && selectionSource.includes('nondominatedFrontier'), 'Date Selection 缺少冻结后的六维非补偿受制门槛或 Pareto 前沿');
    assert(!selectionSource.includes('const aBenefit = av.support || av.peer') && !selectionSource.includes('const aSoftCost = av.outflow || av.exertion'), 'Date Selection 仍保留 coarse benefit / soft-cost comparator');
    assert(selectionSource.includes('Number(av.support) >= Number(bv.support)') && selectionSource.includes('Number(av.peer) >= Number(bv.peer)') && selectionSource.includes('Number(av.outflow) <= Number(bv.outflow)') && selectionSource.includes('Number(av.exertion) <= Number(bv.exertion)'), 'Date Selection 未按四个独立实质维度执行六维 Pareto');
    const relevanceSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-relevance.js'), 'utf8');
    assert(relevanceSource.includes('observer-direct') && relevanceSource.includes('observer-change') && relevanceSource.includes('key-line') && relevanceSource.includes('formation'), 'Structural Relevance 缺少结构层级定义');
    assert(selectionSource.includes('structuralRelevanceDominatesEquivalent') && selectionSource.includes('materialPolarity') && selectionSource.includes('structuralRelevanceSignature'), 'Date Selection 未接入同质日期结构相关性细化');
    const reviewSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-review.js'), 'utf8');
    assert(reviewSource.includes('buildQuestionTimeReview') && reviewSource.includes('formatQuestionTimeReview') && reviewSource.includes('preferred-date-changed'), 'Time Review 缺少结构化对照或差异分类');
    const liuyaoInterpretationSource = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-interpretation.js'), 'utf8');
    assert(!liuyaoInterpretationSource.includes('candidateOutput') && !liuyaoInterpretationSource.includes('liuyaoTimeReview'), '复制分析上下文不应直接耦合 Candidate/Review 内部字段，应统一读取 production top-level 时间字段');
    assert(liuyaoCoreSource.includes("outputModel:'time-v2'") && liuyaoCoreSource.includes('legacyShadow') && liuyaoCoreSource.includes('comparison:candidateComparison') && liuyaoCoreSource.includes('keyNodes:candidateKeyNodes'), 'Time v2 production top-level 或源码级历史影子材料缺失');
    assert(!html.includes('liuyao-time-review.js'), '正式 index.html 仍加载开发期 Time Review 模块');
    const buildPagesSource = fs.readFileSync(path.join(ROOT, 'scripts', 'build-pages-site.mjs'), 'utf8');
    assert(buildPagesSource.includes("path.basename(entry) === 'liuyao-time-review.js'"), 'Pages 构建未排除开发期 Time Review 模块');
    assert(html.includes('questionTimeFocus.comparisonBasisNote') && html.includes('questionTimeFocus?.suppressTimingCandidates'), '事项不明比较提示或明确目标应期去重未进入页面');
    assert(liuyaoCoreSource.includes("label:'感情、恋爱与婚姻'") && liuyaoCoreSource.includes('关系问题先看世应'), '感情观察重点未进入六爻总览配置');
    assert(liuyaoCoreSource.includes("'合作伙伴','合伙人','甲方','乙方'") && !liuyaoCoreSource.includes("'竞争对手','合伙人'"), '外部合作对象与兄弟关键词边界未同步');
    assert(liuyaoCoreSource.includes("id:'travel', target:'世', focusId:'travel'") && liuyaoCoreSource.includes("label:'出行、旅行与行程'"), '出行观察重点或自动规则未进入发布源码');
    assert(liuyaoCoreSource.includes("id:'lost-item', target:'妻财', focusId:'lost-item'") && liuyaoCoreSource.includes("label:'失物与寻找'"), '失物与寻找观察重点或自动规则未进入发布源码');
    ['房屋','住宅','医药','治疗','药物','行人','寻人'].forEach((term) => assert(!liuyaoCoreSource.includes(term), `后续专项“${term}”相关文字仍提前出现在当前六爻取用配置`));
    const css = fs.readFileSync(path.join(ROOT, 'assets', 'app.css'), 'utf8');
    assert(css.includes('.liuyao-lines-card {') && css.includes('grid-template-rows: repeat(6, minmax(0, 1fr));'), '六爻录入六行未在宽屏等分剩余高度');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-alpha.8.md')), 'v13.44.0-alpha.8 阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-fact-tests.js')), 'TimeFact 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-effect-tests.js')), 'TimeEffect 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-facts.js')), 'TimeFact 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-effects.js')), 'TimeEffect 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-assessment.js')), 'TimeAssessment 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-evidence.js')), 'TimeEvidence 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-output.js')), 'TimeOutput 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-review.js')), 'TimeReview 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-selection.js')), 'TimeSelection 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'liuyao-time-relevance.js')), 'Structural Relevance 模块缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-relevance-tests.js')), 'Structural Relevance 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-selection-tests.js')), 'TimeSelection 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-date-selection.mjs')), 'Date Selection 批量审阅脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_SELECTION_v13.44.0-alpha.8.md')), 'Date Selection 审阅报告缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-structural-relevance.mjs')), 'Structural Relevance 批量审阅脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_RELEVANCE_v13.44.0-alpha.8.md')), 'Structural Relevance 审阅报告缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-alpha.9.md')), 'v13.44.0-alpha.9 阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-selection-ties.mjs')), '剩余并列分型审计脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_TIES_v13.44.0-alpha.9.md')), '剩余并列分型审计报告缺失');
    const tieReview = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_TIES_v13.44.0-alpha.9.md'), 'utf8');
    assert(tieReview.includes('未分类剩余并列：0') && tieReview.includes('alpha.8 单选 → 六维细粒度并列：528') && tieReview.includes('纯生扶 vs 纯比和') && tieReview.includes('纯泄力 vs 纯耗力'), 'alpha.9 并列分型审计结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-alpha.10.md')), 'v13.44.0-alpha.10 阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-six-dimensional-selection.mjs')), 'alpha.10 六维日期选择独立审阅脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_SELECTION_v13.44.0-alpha.10.md')), 'alpha.10 六维日期选择审阅报告缺失');
    const selection10Review = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_SELECTION_v13.44.0-alpha.10.md'), 'utf8');
    assert(selection10Review.includes('完全一致：4096（100.00%）') && selection10Review.includes('未分类剩余并列：0') && selection10Review.includes('纯生扶 vs 纯比和') && selection10Review.includes('纯泄力 vs 纯耗力'), 'alpha.10 六维日期选择冻结审阅结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-alpha.11.md')), 'v13.44.0-alpha.11 阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-wording-tests.js')), 'alpha.11 Candidate 文案专项测试缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-candidate-wording.mjs')), 'alpha.11 Candidate 文案压力脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_WORDING_v13.44.0-alpha.11.md')), 'alpha.11 Candidate 文案压力报告缺失');
    const wording11Review = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_WORDING_v13.44.0-alpha.11.md'), 'utf8');
    assert(wording11Review.includes('Candidate 节点：49152') && wording11Review.includes('“泄耗”残留：0') && wording11Review.includes('同义效力括注（如“生扶（生扶）”）：0') && wording11Review.includes('超过 4 条证据：0'), 'alpha.11 Candidate 文案压力结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-beta.3.md')), 'v13.44.0-beta.3 正式切换阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-rc.1.md')), 'v13.44.0-rc.1 RC 阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-rc1-semantics.mjs')), 'RC.1 时间语义收口压力脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_RC1_v13.44.0-rc.1.md')), 'RC.1 时间语义收口压力报告缺失');
    const rc1Review = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_RC1_v13.44.0-rc.1.md'), 'utf8');
    assert(rc1Review.includes('间接制约未映射耗力：0') && rc1Review.includes('间接制约误映射受制：0') && rc1Review.includes('主要观察爻直接证据被外围事实挤掉：0') && rc1Review.includes('Evidence uncovered：0'), 'RC.1 时间语义收口压力结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0-rc.2.md')), 'v13.44.0-rc.2 端到端回归阶段说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_RC2_v13.44.0-rc.2.md')), 'v13.44.0-rc.2 真实案例回归报告缺失');
    assert(fs.existsSync(path.join(ROOT, '升级说明.md')), 'v13.44.0 正式升级说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'RELEASE_v13.44.0.md')), 'v13.44.0 正式发布说明缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-v13.44.0-release.mjs')), 'v13.44.0 正式压力脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_RELEASE_v13.44.0.md')), 'v13.44.0 正式压力报告缺失');
    const releaseReview = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_RELEASE_v13.44.0.md'), 'utf8');
    assert(releaseReview.includes('间接制约未映射耗力：0') && releaseReview.includes('主要观察爻直接证据遗漏：0') && releaseReview.includes('遗漏 0') && releaseReview.includes('阻断项为 0'), 'v13.44.0 正式压力验收结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'docs', 'REVIEW_BETA_SWITCH_v13.44.0-beta.1.md')), 'beta.1 新旧输出切换压力报告缺失');
    const betaSwitchReview = fs.readFileSync(path.join(ROOT, 'docs', 'REVIEW_BETA_SWITCH_v13.44.0-beta.1.md'), 'utf8');
    assert(betaSwitchReview.includes('总运行：12288') && betaSwitchReview.includes('production 与 Candidate 不一致：0') && betaSwitchReview.includes('legacyShadow 缺失：0') && betaSwitchReview.includes('Time Review schema 异常：0') && betaSwitchReview.includes('“泄耗”残留：0'), 'beta.1 正式切换压力结果不完整');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-review-tests.js')), 'TimeReview 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'scripts', 'review-liuyao-time-diffs.mjs')), 'TimeReview 批量审阅脚本缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-output-tests.js')), 'TimeOutput 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'time-evidence-tests.js')), 'TimeEvidence 专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'tests', 'question-time-tests.js')), '时间解析专项测试文件缺失');
    assert(fs.existsSync(path.join(ROOT, 'js', 'question-time.js')), 'QuestionTimeScope 解析模块缺失');
    assert(!fs.existsSync(path.join(ROOT, '#U5347#U7ea7#U8bf4#U660e.md')), '旧乱码升级说明文件仍存在');
});


test('v13.42.14 六爻窄屏录入保持上爻至初爻单列顺序', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'assets', 'app.css'), 'utf8');
    assert(html.includes('v-for="index in [5, 4, 3, 2, 1, 0]"'), '六爻录入 DOM 顺序不再是上爻至初爻');
    assert(css.includes('/* 六爻录入保持卦象自上而下的单列顺序，避免窄屏分栏打乱阅读次序。 */'), '窄屏单列保护规则缺失');
    const mobileRule = /@media \(max-width: 900px\)[\s\S]*?\.liuyao-lines-card > \.yao-entry-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*?\}/;
    assert(mobileRule.test(css), '900px 以下六爻录入未固定为单列');
});

test('v13.42.14 依赖工作流关闭普通 Dependabot 版本 PR 并修复监测脚本', () => {
    const dependabot = fs.readFileSync(path.join(ROOT, '.github', 'dependabot.yml'), 'utf8');
    const watch = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'dependency-watch.yml'), 'utf8');
    const workflowFiles = ['dependency-watch.yml','test.yml','pages.yml','vendor-snapshot-pr.yml'];
    assert(dependabot.includes('open-pull-requests-limit: 0'), 'Dependabot 普通版本 PR 未关闭');
    assert(!dependabot.includes('review-required') && !dependabot.includes('      - "dependencies"'), 'Dependabot 仍引用不存在的自定义 label');
    assert(watch.includes('--search "${title} in:title"'), 'Dependency watch 的 gh issue search 引号未修复');
    assert(!watch.includes('--search \\"${title} in:title\\"'), 'Dependency watch 仍保留错误转义引号');
    assert(!watch.includes('--label dependencies'), 'Dependency watch 创建 issue 仍依赖不存在的 dependencies label');
    workflowFiles.forEach((file) => {
        const source = fs.readFileSync(path.join(ROOT, '.github', 'workflows', file), 'utf8');
        assert(source.includes('actions/checkout@v5'), `${file} 未升级 checkout@v5`);
        assert(source.includes('actions/setup-node@v5'), `${file} 未升级 setup-node@v5`);
        assert(!source.includes('actions/checkout@v4') && !source.includes('actions/setup-node@v4'), `${file} 仍保留 Node 20 runtime 的 v4 action`);
    });
    const pages = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'pages.yml'), 'utf8');
    assert(pages.includes('actions/configure-pages@v6'), 'Pages 仍使用 Node 20 的 configure-pages 旧版');
    assert(pages.includes('actions/upload-pages-artifact@v5'), 'Pages 仍使用旧版 upload-pages-artifact');
    assert(pages.includes('actions/deploy-pages@v5'), 'Pages 仍使用 Node 20 的 deploy-pages 旧版');
    assert(pages.includes('include-hidden-files: true'), 'Pages artifact 未保留 .nojekyll 等隐藏文件');
    assert(!pages.includes('actions/configure-pages@v5') && !pages.includes('actions/upload-pages-artifact@v3') && !pages.includes('actions/deploy-pages@v4'), 'Pages 仍残留会触发 Node 20 弃用警告的 action 版本');
});


test('v13.42.10 出行观察重点复制上下文明确世爻为主、应爻为辅', () => {
    const target = {type:'line',position:1,label:'初爻',relation:'兄弟',branch:'寅',element:'木',moving:false,isShi:true,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    const result = {
        question:'明天旅行顺不顺利', solarText:'2026年8月10日 13:40', lunarText:'丙午年 六月廿八 未时',
        monthGanZhi:'丙申', dayGanZhi:'丙辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷀',name:'乾',number:1}, changed:{symbol:'䷀',name:'乾',number:1}, palace:{palace:'乾',stage:'本宫六世',element:'金'},
        movingText:'静卦（无动爻）', lines:[target,{position:4,label:'四爻',relation:'父母',branch:'午',element:'火',moving:false,isShi:false,isYing:true,statusTags:[],moveTags:[]}],
        displayLines:[], flyingHidden:[], fullStructure:{originalNatureCode:'SIX_CLASH',changedNatureCode:'SIX_CLASH',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'travel',focusLabel:'出行、旅行与行程',target:'世',candidateCount:1,specificity:'specific',categoryConfidence:'high'}
    };
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, null, {judgments:[]}, [], []);
    assert(text.includes('占问文字高置信识别为【出行、旅行与行程】'), `复制上下文未记录出行观察方向：${text}`);
    assert(text.includes('以世爻作为主要观察对象') && text.includes('参考应爻与行程结构'), `出行复制上下文未保留世主应辅口径：${text}`);
});

test('v13.42.11 失物自动取用与复制上下文保留专项观察方向', () => {
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'寅',element:'木',moving:false,isShi:true,isYing:false,statusTags:[],moveTags:[]},
        {position:2,label:'二爻',relation:'妻财',branch:'辰',element:'土',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]},
        {position:3,label:'三爻',relation:'官鬼',branch:'午',element:'火',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]},
        {position:4,label:'四爻',relation:'兄弟',branch:'申',element:'金',moving:false,isShi:false,isYing:true,statusTags:[],moveTags:[]},
        {position:5,label:'五爻',relation:'子孙',branch:'戌',element:'土',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]},
        {position:6,label:'上爻',relation:'父母',branch:'子',element:'水',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]}
    ];
    const suggestion = liuyao.suggestUseGod('我的东西丢了还能找到吗？', rows, []);
    assert(suggestion.status === 'confident' && suggestion.recommendedTarget === '妻财' && suggestion.focusId === 'lost-item', '失物问法未稳定落到独立失物观察方向');
    const target = {...rows[1], type:'line', sourceText:'本卦明爻'};
    const result = {
        question:'我的东西丢了还能找到吗？', solarText:'2026年8月10日 14:00', lunarText:'丙午年 六月廿八 未时',
        monthGanZhi:'丙申', dayGanZhi:'丙辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷀',name:'乾',number:1}, changed:{symbol:'䷀',name:'乾',number:1}, palace:{palace:'乾',stage:'本宫六世',element:'金'},
        movingText:'静卦（无动爻）', lines:rows, displayLines:[], flyingHidden:[],
        fullStructure:{originalNatureCode:'SIX_CLASH',changedNatureCode:'SIX_CLASH',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',focusId:'lost-item',focusLabel:'失物与寻找',target:'妻财',candidateCount:1,specificity:'specific',categoryConfidence:'high'}
    };
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, null, {judgments:[]}, [], []);
    assert(text.includes('高置信识别为【失物与寻找】') && text.includes('作为主要观察对象'), `失物复制上下文未保留专项观察方向：${text}`);
});

test('v13.42.5 高置信取用只确认六亲类别，多候选具体爻降级为展示起点', () => {
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'寅',element:'木',moving:true,isShi:false,isYing:true},
        {position:2,label:'二爻',relation:'子孙',branch:'辰',element:'土',moving:false,isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'午',element:'火',moving:false,isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'兄弟',branch:'午',element:'火',moving:false,isShi:true,isYing:false},
        {position:5,label:'五爻',relation:'妻财',branch:'申',element:'金',moving:false,isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'子孙',branch:'戌',element:'土',moving:false,isShi:false,isYing:false}
    ];
    const suggestion = liuyao.suggestUseGod('怀的是儿子还是女儿', rows, []);
    assert(suggestion.status === 'confident' && suggestion.recommendedTarget === '子孙', '胎孕占问未高置信识别为子孙类别');
    assert(suggestion.candidateCount === 2 && suggestion.candidateSpecificity === 'multiple', '两个子孙候选未保持多候选状态');
    assert(suggestion.headline === '取用类别：子孙（高置信）', `高置信提示仍混淆类别与具体爻：${suggestion.headline}`);
    assert(suggestion.candidateNote.includes('两处候选') && suggestion.candidateNote.includes('展示起点'), '多候选说明未明确具体爻仅为展示起点');
});

test('v13.42.5 复制上下文区分类别高置信与具体爻展示起点', () => {
    const target = {type:'line',position:2,label:'二爻',relation:'子孙',branch:'辰',element:'土',moving:false,isShi:false,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    const result = {
        question:'怀的是儿子还是女儿', solarText:'2026年8月10日 12:27', lunarText:'丙午年 六月廿八 午时',
        monthGanZhi:'丙申', dayGanZhi:'丙辰', dayChangeLabel:'24:00 换日（默认）', xunKong:'子丑',
        original:{symbol:'䷅',name:'讼',number:6}, changed:{symbol:'䷉',name:'履',number:10}, palace:{palace:'离',stage:'游魂',element:'火'},
        movingText:'初爻', lines:[{...target},{position:6,label:'上爻',relation:'子孙',branch:'戌',element:'土',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]}],
        displayLines:[], flyingHidden:[], fullStructure:{originalNatureCode:'NEUTRAL',changedNatureCode:'NEUTRAL',shiYing:{text:'—'},sanHe:{complete:[],pending:[]},fanFu:[]},
        useGodSelection:{mode:'suggestion',target:'子孙',candidateCount:2,specificity:'display-start',categoryConfidence:'high'}
    };
    const text = liuyaoInterpretation.buildLiuYaoContextText(result, target, null, {judgments:[]}, [], []);
    assert(text.includes('取用类别由占问文字高置信识别为【子孙】'), '复制上下文未记录类别级高置信');
    assert(text.includes('本卦有两处子孙候选') && text.includes('二爻子孙辰土作为展示起点'), '复制上下文仍把多候选中的具体爻写成唯一高置信用神');
});

test('v13.42.5 单一候选可直接作为主要观察对象', () => {
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'寅',element:'木',moving:false,isShi:true,isYing:false},
        {position:2,label:'二爻',relation:'子孙',branch:'辰',element:'土',moving:false,isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'午',element:'火',moving:false,isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'妻财',branch:'申',element:'金',moving:false,isShi:false,isYing:true},
        {position:5,label:'五爻',relation:'官鬼',branch:'酉',element:'金',moving:false,isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'父母',branch:'戌',element:'土',moving:false,isShi:false,isYing:false}
    ];
    const suggestion = liuyao.suggestUseGod('怀孕是否顺利', rows, []);
    assert(suggestion.recommendedTarget === '子孙' && suggestion.candidateCount === 1 && suggestion.candidateSpecificity === 'single', '单一子孙候选未进入具体观察对象状态');
    assert(!suggestion.candidateNote, '单一候选不应显示多候选展示起点说明');
});


test('v13.42.7 多候选展示起点统一降级为当前观察对象语义', () => {
    const target = {key:'line-2',type:'line',position:2,label:'二爻',relation:'官鬼',branch:'丑',element:'土',moving:false,isShi:false,isYing:false,sourceText:'本卦明爻',statusTags:[{code:'VOID',text:'旬空',type:'void'}],moveTags:[]};
    const other = {key:'line-5',type:'line',position:5,label:'五爻',relation:'官鬼',branch:'戌',element:'土',moving:false,isShi:false,isYing:false,sourceText:'本卦明爻',statusTags:[],moveTags:[]};
    const rows = [
        {position:1,label:'初爻',relation:'子孙',branch:'卯',element:'木',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]},
        target,
        {position:3,label:'三爻',relation:'兄弟',branch:'亥',element:'水',moving:false,isShi:true,isYing:false,statusTags:[],moveTags:[]},
        {position:4,label:'四爻',relation:'父母',branch:'申',element:'金',moving:false,isShi:false,isYing:false,statusTags:[],moveTags:[]},
        other,
        {position:6,label:'上爻',relation:'兄弟',branch:'子',element:'水',moving:true,isShi:false,isYing:true,changedRelation:'子孙',changedBranch:'卯',changedElement:'木',statusTags:[],moveTags:[]}
    ];
    const result = {
        monthZhi:'申',dayZhi:'辰',lines:rows,flyingHidden:[],
        useGodSelection:{mode:'suggestion',target:'官鬼',candidateCount:2,specificity:'display-start',categoryConfidence:'high'},
        fullStructure:{originalNatureCode:'NEUTRAL',changedNatureCode:'NEUTRAL',originalNature:'非六冲六合卦',changedNature:'非六冲六合卦',shiYing:{text:'世应',tags:[]},sanHe:{complete:[],pending:[]},fanFu:[]}
    };
    const use = liuyao.buildUseGodAnalysis(target,result);
    const output = liuyaoInterpretation.buildLiuYaoInterpretation(result,target,use,[]);
    const state = output.judgments.find((item)=>item.id==='use-state');
    const relations = output.judgments.find((item)=>item.id==='use-relations');
    assert(state?.title.startsWith('观察对象'), `多候选状态标题仍写用神：${state?.title}`);
    assert(state?.summary.includes('二爻官鬼丑土为当前观察对象') && !state?.summary.includes('为当前用神'), `多候选状态摘要未降级观察对象语义：${state?.summary}`);
    assert(relations?.title === '观察对象关系链', `多候选关系链标题仍写用神：${relations?.title}`);
    const lit = liuyaoLit.liuyaoLiteratureMatchText.useGod(result,target);
    assert(lit.includes('当前取用类别为【官鬼】') && lit.includes('两处同类候选') && lit.includes('展示起点'), `古籍匹配仍把展示起点写成已确认唯一用神：${lit}`);
});

test('v13.42.7 自动取用理由只说明本次实际命中的高置信词', () => {
    const rows = [
        {position:1,label:'初爻',relation:'父母',branch:'子',element:'水',moving:false,isShi:true,isYing:false},
        {position:2,label:'二爻',relation:'官鬼',branch:'丑',element:'土',moving:false,isShi:false,isYing:false},
        {position:3,label:'三爻',relation:'兄弟',branch:'寅',element:'木',moving:false,isShi:false,isYing:false},
        {position:4,label:'四爻',relation:'子孙',branch:'卯',element:'木',moving:false,isShi:false,isYing:true},
        {position:5,label:'五爻',relation:'妻财',branch:'辰',element:'土',moving:false,isShi:false,isYing:false},
        {position:6,label:'上爻',relation:'父母',branch:'巳',element:'火',moving:false,isShi:false,isYing:false}
    ];
    const suggestion = liuyao.suggestUseGod('今年能不能升职', rows, []);
    assert(suggestion.recommendedTarget === '官鬼', '升职占问未命中官鬼');
    assert(suggestion.reason.includes('升职') && !suggestion.reason.includes('诉讼') && !suggestion.reason.includes('疾病'), `自动取用理由仍罗列无关官鬼场景：${suggestion.reason}`);
});

test('v13.42.7 手动具体爻选择使用统一折叠项目 UI', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert(html.includes('<details class="fold-card compact-fold use-god-manual-details">'), '手动具体爻选择未切换为统一 fold-card');
    assert(html.includes('<summary>手动选择具体爻（熟悉六爻时）</summary>') && html.includes('<div class="fold-content">'), '手动具体爻折叠内容结构不完整');
    assert(html.includes("useGodSelectionIsObservation ? '主要观察爻' : '当前用神'"), '详细页未按观察对象状态切换主要观察爻称谓');
    assert(html.includes('useGodTargetLocationText'), '详细页展示起点未显示具体爻位');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
