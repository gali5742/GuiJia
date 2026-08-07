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
    'js/bazi-core.js',
    'js/bazi-literature.js',
    'js/liuyao-core.js',
    'js/liuyao-literature.js'
]);
const bazi = GuiJia.baziCore;
const baziLit = GuiJia.baziLiterature;
const liuyao = GuiJia.liuyaoCore;
const liuyaoLit = GuiJia.liuyaoLiterature;

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

test('十神 10×10 映射完整', () => {
    GAN.forEach((dayGan) => GAN.forEach((otherGan) => {
        assert(Boolean(bazi.shiShenMap[dayGan]?.[otherGan]), `${dayGan}日见${otherGan}缺十神`);
    }));
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
        { moving:true, branch:'申', changedBranch:'子' },
        { moving:false, branch:'卯', changedBranch:'卯' },
        { moving:false, branch:'午', changedBranch:'午' },
        { moving:false, branch:'酉', changedBranch:'酉' },
        { moving:false, branch:'亥', changedBranch:'亥' },
        { moving:false, branch:'丑', changedBranch:'丑' }
    ];
    const sanHe = liuyao.buildMovingSanHe(rows);
    assert(sanHe.pendingDetails.length >= 1, '未生成待支详情');
    const water = sanHe.pendingDetails.find((item) => item.element === '水');
    assert(water?.missingBranch === '辰', `申子待支应为辰，实际 ${water?.missingBranch}`);
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
    assert(candidates.some((item) => item.id === 'sanhe-0'), '显示文案不含“待辰”时三合应期候选丢失');
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
            createApp: (definition) => ({ mount: () => { setupResult = definition.setup(); } }),
            ref: makeRef,
            reactive: makeReactive,
            computed: makeComputed
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
        'js/common.js', 'js/bazi-core.js', 'js/bazi-literature.js',
        'js/liuyao-core.js', 'js/liuyao-literature.js', 'js/iching-loader.js', 'js/app.js'
    ].forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    assert(setupResult, 'Vue setup 未执行');
    assert(setupResult.activeModule.value === 'liuyao', `#liuyao 初始化成了 ${setupResult.activeModule.value}`);
    assert(setupResult.currentPage.value === 'input', '无结果时不应进入 result 页');
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
