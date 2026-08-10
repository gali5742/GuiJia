(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { hasMoveCode, hasStatusCode, sixSpirits } = GuiJia.liuyaoCore;
    const { formatNaturalCount = (value) => String(value) } = GuiJia.common || {};
    const liuyaoLiteratureEntries = [
        {
            id: 'zengshan-month', book: '增删卜易', chapter: '月将章第十六', level: '方法参考', sourceKind: '原文摘录', verified: true,
            quote: '月将乃当权之帅，万卜以之为纲领。', tagsAll: ['month-command'], matchKey: 'month',
            hint: '月建是逐爻力量比较的第一层背景，既能扶弱，也能冲克旺爻。',
            boundary: '月建仍需与日辰、动变、空破和具体用神合看，不能单项裁决。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/16'
        },
        {
            id: 'zengshan-day', book: '增删卜易', chapter: '日辰章第十七', level: '方法参考', sourceKind: '原文摘录', verified: true,
            quote: '四时俱旺，操生杀大权，与月建同功。', tagsAll: ['day-command'], matchKey: 'day',
            hint: '日辰不随季节休囚，常承担触发、冲实、合起或冲散等作用。',
            boundary: '日冲究竟为暗动、破损或其他表现，需要结合月令及爻本身动静。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/17'
        },
        {
            id: 'zengshan-use', book: '增删卜易', chapter: '用神章第八', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '占何人占何事，以何爻为用神。', tagsAll: ['use-god'], matchKey: 'useGod',
            hint: '先明确“问谁、问什么”，再讨论该爻的日月、动变和生克链。',
            boundary: '同一占问可能同时涉及主体、对象、文书、财官等多层焦点，取用参考不能替代人工判断。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/8'
        },
        {
            id: 'zengshan-moving', book: '增删卜易', chapter: '动变静生克冲合章', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '卦有动爻，动而必变。', tagsAll: ['moving'], matchKey: 'moving',
            hint: '变爻首先作用于本位动爻，日月则可同时影响动、静、变、飞、伏各层。',
            boundary: '动爻多不等于事情必快或必成；仍须看所动者是用、元、忌还是无关之爻。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/15'
        },
        {
            id: 'zengshan-dark', book: '增删卜易', chapter: '暗动章第二十二', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '静爻旺相日辰冲之为暗动，静爻休囚日辰冲之为破。', tagsAll: ['dark-moving'], matchKey: 'darkMoving',
            hint: '暗动把“看似不动”的爻纳入作用链，但其有利或不利仍取决于它生克何爻。',
            boundary: '以月令支持程度作初步区分，不能覆盖古法中所有有气、受伤和合绊条件。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/22'
        },
        {
            id: 'zengshan-void', book: '增删卜易', chapter: '旬空及应期相关条目', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '旬空最爱填冲。', tagsAll: ['void'], matchKey: 'void',
            hint: '应期区可同时观察填实、冲空及出旬三个入口。',
            boundary: '旺不为空、动不为空、真空等条件在不同占例中有细分，不能看到空亡就一律判无。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/26%E5%8F%883'
        },
        {
            id: 'zengshan-sanhe', book: '增删卜易', chapter: '六合章第十九·三合局', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '三爻若有两爻动，不成局，须待后之补凑合成其局。', tagsAll: ['sanhe-pending'], matchKey: 'sanHe',
            hint: '三支齐全与“两支待一支”分开观察，缺支可列入应期观察。',
            boundary: '三合还要检查空破、入墓及世爻或用神是否在局内，不能只凭支数宣布成局。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/19'
        },
        {
            id: 'zengshan-hex-harmony', book: '增删卜易', chapter: '六合章第十九', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '卦逢六合四也。', tagsAny: ['original-six-harmony','changed-six-harmony'], matchKey: 'hexHarmony',
            hint: '本卦或变卦出现六合时，可把卦体六合与世应、用神、动变关系并列核对。',
            boundary: '六合是当前卦体结构之一，仍需落到具体用神与动变位置。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/19'
        },
        {
            id: 'zengshan-hex-clash', book: '增删卜易', chapter: '六冲章第二十', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '卦逢六冲二也。', tagsAny: ['original-six-clash','changed-six-clash'], matchKey: 'hexClash',
            hint: '本卦或变卦出现六冲时，可把卦体六冲与世应、用神、动变关系并列核对。',
            boundary: '六冲是当前卦体结构之一，仍需落到具体用神与动变位置。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/20'
        },
        {
            id: 'zengshan-fanfu', book: '增删卜易', chapter: '反伏章第二十五', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '卦有卦之反吟，爻有爻之反吟。', tagsAll: ['fanfu'], matchKey: 'fanFu',
            hint: '反吟、伏吟先作为动变重复或冲克结构观察，再结合用神所在内外卦理解。',
            boundary: '反伏本身不是单独结论；同章仍以用神有无救助、旺衰得失为重点。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/25'
        },
        {
            id: 'zengshan-progress', book: '增删卜易', chapter: '进退神与应期相关条目', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '化进神、逢值逢合；化退神、忌值忌冲。', tagsAny: ['progress','retreat'], matchKey: 'progressRetreat',
            hint: '应期区据此列出进神的值、合及退神的值、冲候选。',
            boundary: '相关口诀仍随所占吉凶和用忌身份变化，不能脱离用神链机械套用。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/26%E5%8F%883'
        },
        {
            id: 'zengshan-shiying', book: '增删卜易', chapter: '世应章第六', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '隔世爻两位即是应爻，馀卦仿此。', tagsAll: ['shi-ying'], matchKey: 'shiYing',
            hint: '世应位置由八宫卦序确定，随后才比较生克、合冲、动静和空亡。',
            boundary: '世为己、应为彼只是常用入口；具体占人占事仍可能另取六亲为主用神。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/6'
        },
        {
            id: 'zengshan-sixspirits', book: '增删卜易', chapter: '六神章第十八', level: '方法参考', sourceKind: '原文摘录', verified: true,
            quote: '乃附合之神也。', tagsAll: ['six-spirits'], matchKey: 'sixSpirits',
            hint: '六神可帮助取象，但须依附五行、用神和动变结构。',
            boundary: '不能只因青龙、白虎等名称就越过五行生克直接定吉凶。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E5%A2%9E%E5%88%AA%E5%8D%9C%E6%98%93/18'
        },

        // 《黄金策》：以总断《千金赋》作为跨卦结构索引；同一结构可与《增删卜易》并列返回。
        {
            id: 'huangjince-month', book: '黄金策', chapter: '总断千金赋', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '月建乃万卦之提纲。', tagsAll: ['month-command'], matchKey: 'month',
            hint: '《黄金策》同样把月建放在全卦提纲的位置，适合与日辰、动静共同阅读。',
            boundary: '“提纲”不等于见生即吉、见克即凶，仍要落到主事之爻。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },
        {
            id: 'huangjince-day', book: '黄金策', chapter: '总断千金赋', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '日辰为六爻之主宰。', tagsAll: ['day-command'], matchKey: 'day',
            hint: '日辰可扶、制、冲、合，尤其适合解释静爻为何在某日被触发。',
            boundary: '日辰作用仍需区分作用对象是用神、忌神还是旁爻。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },
        {
            id: 'huangjince-shiying', book: '黄金策', chapter: '总断千金赋', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '世为己，应为人，大宜契合。', tagsAll: ['shi-ying'], matchKey: 'shiYing',
            hint: '世应可作为主体—对象关系的第一层框架，再结合六亲与用神确定具体角色。',
            boundary: '并非所有占问都可以只凭世应代表双方，实际事项仍可能另取用神。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },
        {
            id: 'huangjince-moving', book: '黄金策', chapter: '总断千金赋', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '动为始，变为终，最怕交争。', tagsAll: ['moving'], matchKey: 'moving',
            hint: '动爻与变爻应作为连续过程阅读，而不是把变卦完全割裂成另一卦。',
            boundary: '“始终”是结构关系，不自动对应现实中的固定时间先后。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },
        {
            id: 'huangjince-dark', book: '黄金策', chapter: '总断千金赋', level: '精确结构', sourceKind: '原文摘录', verified: true,
            quote: '静得冲而暗兴。', tagsAll: ['dark-moving'], matchKey: 'darkMoving',
            hint: '静爻受冲后是否成为有效作用力，要继续比较旺衰与受制情况。',
            boundary: '不能把所有“日冲静爻”都机械等同为有力暗动。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },
        {
            id: 'huangjince-void', book: '黄金策', chapter: '总断千金赋', level: '结构匹配', sourceKind: '原文摘录', verified: true,
            quote: '空逢冲而有用。', tagsAll: ['void'], matchKey: 'void',
            hint: '空亡遇冲可成为观察“冲空”的经典入口。',
            boundary: '须先判断是真空、假空、旺空、动空等具体条件，不能仅凭一句口诀定应。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=767055&if=gb&remap=gb'
        },

        // 《卜筮正宗》：已核对的凡例只作为方法框架；细目正文尚未逐条录入时显示“原典定位”。
        {
            id: 'bushizhengzong-framework', book: '卜筮正宗', chapter: '凡例', level: '方法参考', sourceKind: '原文摘录', verified: true,
            quote: '用神、原神、忌神、仇神、飞伏神……皆为卦内之纲领。', tagsAll: ['always'], matchKey: 'framework',
            hint: '当前页面计算出的用神链、飞伏、进退、反伏、旬空、月破等，正好可以作为该书的结构检索标签。',
            boundary: '凡例只说明这些项目的重要性，并不等于已经完成具体卦例的判断。',
            sourceUrl: 'https://ctext.org/wiki.pl?chapter=889452&if=gb&remap=gb'
        },
        {
            id: 'bushizhengzong-feifu-locator', book: '卜筮正宗', chapter: '飞伏神定例', level: '条目定位', sourceKind: '原典定位', verified: false,
            quote: '', tagsAll: ['flying-hidden'], matchKey: 'flyingHidden',
            hint: '《卜筮正宗》凡例明确指出其逐卦分别订立飞伏定例；当前先定位到该类条目，不在未逐字核对时摘录正文。',
            boundary: '此卡片仅表示“值得查这一类原典”，不把现代概括句冒充古籍原文。',
            sourceUrl: 'https://ctext.org/wiki.pl?if=gb&remap=gb&res=112056'
        },

        // 《京氏易传》：按本卦八宫、世应、飞伏定位原典；不再使用现代概括句伪装成引文。
        {
            id: 'jingshi-palace-locator', book: '京氏易传', chapter: '八宫·世应·飞伏', level: '条目定位', sourceKind: '原典定位', verified: false,
            quote: '', tagsAll: ['palace'], matchKey: 'jingPalace',
            hint: '《京氏易传》上、中卷逐卦记世应与飞伏，适合作为当前八宫装卦结果的原典定位。',
            boundary: '不同卦条原文不同；在没有逐卦核对前，本程序只给出定位，不生成“京氏原文”。',
            sourceUrl: 'https://ctext.org/jingshi-yizhuan/zhs'
        }
    ];

    const collectLiuYaoLiteratureFeatures = (resultObj, target) => {
        const features = new Set(['always', 'month-command', 'day-command', 'shi-ying', 'six-spirits', 'palace']);
        const lines = resultObj?.lines || [];
        const full = resultObj?.fullStructure || {};
        if (target) features.add('use-god');
        if (lines.some((line) => line.moving)) features.add('moving');
        if (lines.some((line) => hasStatusCode(line, 'DARK_MOVING'))) features.add('dark-moving');
        if (lines.some((line) => hasStatusCode(line, 'VOID'))) features.add('void');
        if (lines.some((line) => hasStatusCode(line, 'MONTH_BREAK') || hasMoveCode(line, 'TRANSFORM_MONTH_BREAK'))) features.add('month-break');
        if (lines.some((line) => hasStatusCode(line, 'DAY_BREAK'))) features.add('day-break');
        if ((full.sanHe?.complete || []).length) features.add('sanhe-complete');
        if ((full.sanHe?.pending || []).length) features.add('sanhe-pending');
        if ((full.fanFu || []).length) features.add('fanfu');
        if (lines.some((line) => hasMoveCode(line, 'PROGRESS'))) features.add('progress');
        if (lines.some((line) => hasMoveCode(line, 'RETREAT'))) features.add('retreat');
        if ((resultObj?.flyingHidden || []).some((item) => item.candidate)) features.add('flying-hidden');
        if (full.originalNatureCode === 'SIX_CLASH') features.add('original-six-clash');
        if (full.originalNatureCode === 'SIX_HARMONY') features.add('original-six-harmony');
        const hasMoving = lines.some((line) => line.moving);
        if (hasMoving && full.changedNatureCode === 'SIX_CLASH') features.add('changed-six-clash');
        if (hasMoving && full.changedNatureCode === 'SIX_HARMONY') features.add('changed-six-harmony');
        return features;
    };

    const liuyaoLiteratureMatchText = {
        framework: () => '本卦已计算月建、日辰、旬空、动变、世应、用神链与飞伏等结构，可据这些标签继续核对原书。',
        month: (r) => `本卦起于${r.monthGanZhi}月，六爻状态均以月支【${r.monthZhi}】参与生克冲合。`,
        day: (r) => `起卦日为${r.dayGanZhi}，可结合日生、日克、日合、日冲及临日辰观察。`,
        useGod: (r, t) => {
            if (!t) return '尚未确认用神。';
            const selection = r?.useGodSelection;
            if (selection?.specificity === 'display-start' && Number(selection?.candidateCount || 0) > 1) {
                return `当前取用类别为【${selection.target || t.relation}】；本卦有${formatNaturalCount(selection.candidateCount)}处同类候选，暂以${t.sourceText}中的【${t.relation}${t.branch}${t.element}】作为展示起点。`;
            }
            return `当前确认以${t.sourceText}中的【${t.relation}${t.branch}${t.element}】为主要观察对象。`;
        },
        moving: (r) => `本卦有${r.lines.filter((line) => line.moving).map((line) => line.label).join('、')}发动，可分别观察回头生克、合冲、进退、墓绝与空破。`,
        darkMoving: (r) => `${r.lines.filter((line) => hasStatusCode(line, 'DARK_MOVING')).map((line) => `${line.label}${line.relation}${line.branch}`).join('、')}符合当前程序的暗动提示条件。`,
        void: (r) => `${r.lines.filter((line) => hasStatusCode(line, 'VOID')).map((line) => `${line.label}${line.relation}${line.branch}`).join('、')}落于${r.xunKong}旬空。`,
        sanHe: (r) => (r.fullStructure?.sanHe?.pending || []).join('；'),
        fanFu: (r) => (r.fullStructure?.fanFu || []).join('；'),
        progressRetreat: (r) => r.lines.filter((line) => hasMoveCode(line, 'PROGRESS') || hasMoveCode(line, 'RETREAT')).map((line) => `${line.label}${line.branch}化${line.changedBranch}：${line.moveTags.map((tag) => tag.text).join('、')}`).join('；'),
        hexHarmony: (r) => {
            const parts = [];
            if (r.fullStructure?.originalNatureCode === 'SIX_HARMONY') parts.push('本卦为六合卦');
            if ((r.lines || []).some((line) => line.moving) && r.fullStructure?.changedNatureCode === 'SIX_HARMONY') parts.push('变卦为六合卦');
            return parts.join('；') || '当前卦体见六合结构。';
        },
        hexClash: (r) => {
            const parts = [];
            if (r.fullStructure?.originalNatureCode === 'SIX_CLASH') parts.push('本卦为六冲卦');
            if ((r.lines || []).some((line) => line.moving) && r.fullStructure?.changedNatureCode === 'SIX_CLASH') parts.push('变卦为六冲卦');
            return parts.join('；') || '当前卦体见六冲结构。';
        },
        shiYing: (r) => r.fullStructure?.shiYing?.text || '已按八宫卦序定位世应。',
        sixSpirits: (r) => `本卦依${r.dayGan}日起六神，逐爻排出青龙、朱雀、勾陈、螣蛇、白虎、玄武。`,
        flyingHidden: (r) => `本卦属${r.palace.palace}宫${r.palace.stage}，当前识别出${formatNaturalCount(r.flyingHidden.filter((item) => item.candidate).length)}个伏神候选。`,
        jingPalace: (r) => `本卦为${r.original.symbol || ''}${r.original.name}，属${r.palace.palace}宫${r.palace.stage}；可在《京氏易传》相应卦条核对世应、飞伏等记载。`
    };

    const buildDarkMovingContextAudit = (resultObj) => {
        const lines = (resultObj?.lines || []).filter((line) => hasStatusCode(line, 'DARK_MOVING'));
        if (!lines.length) return '';
        const checks = lines.map((line) => {
            const seasonText = line.statusTags?.find((tag) => tag.code === 'SEASON_STATE')?.text || '';
            const monthSupport = (line.statusTags || [])
                .filter((tag) => ['MONTH_COMMAND','MONTH_GENERATE','MONTH_SUPPORT'].includes(tag.code) || (tag.code === 'SEASON_STATE' && /月令[旺相]/.test(tag.text || '')))
                .map((tag) => tag.text);
            const supportText = monthSupport.length ? monthSupport.join('、') : seasonText || '当前程序已判定具月令支持条件';
            return `${line.label}${line.relation}${line.branch}：静爻 ✓；日辰相冲 ✓；月令支持／旺相条件 ✓（${supportText}）`;
        });
        return `原文条件核对：${checks.join('；')}。按当前程序采用的暗动规则，上述爻符合“静爻 + 日冲 + 月令有气／扶持”的暗动提示条件；这里只确认暗动结构成立，不据此直接判断其对用神的吉凶作用。`;
    };

    const LIUYAO_CONTEXT_NOTES = {
        framework: '此条仅说明这些项目属于断卦纲领，不表示当前卦已经由此得到吉凶结论。',
        month: '这里只确认月建作为全卦背景参与作用；具体生克得失仍须落到用神、动变与空破。',
        day: '这里只确认日辰作为触发与生克背景；日冲究竟构成暗动、破损或其他作用仍需结合爻的旺衰与动静。',
        useGod: '这里只确认当前人工选定的主要观察对象；取用是否最合适仍取决于具体占问语义。',
        moving: '这里只确认动爻及其变爻存在；动变是否有利、是否应事仍须结合用神链与旺衰。',
        darkMoving: '程序只确认当前实现中的暗动提示条件，因此将此条列作进一步核对；是否完全符合原文所说旺相、休囚及其他受制条件仍需复核。',
        void: '这里只确认旬空事实；原文所说填实、冲空或出旬何时“有用”，仍需结合旺衰、动静与用忌身份判断。',
        sanHe: '程序只确认三合齐全或“两支待一支”的结构形态；是否真正成局并发生有效作用，仍需检查空破、入墓、冲散及用神是否在局内。',
        fanFu: '这里只确认反吟或伏吟结构存在；原文并未因此自动给出吉凶，仍需结合用神旺衰与救应。',
        progressRetreat: '这里只确认进神或退神结构；原文应期口诀是否适用仍需结合该爻的用忌身份、旺衰与所占事项。',
        hexHarmony: '这里只确认本卦或变卦的六合卦体事实。',
        hexClash: '这里只确认本卦或变卦的六冲卦体事实。',
        shiYing: '这里只确认世应位置及当前关系；世应所代表的现实角色仍需结合具体占问与用神确定。',
        sixSpirits: '此条只作为六神取象的方法约束，不据六神名称越过五行、用神与动变直接定吉凶。',
        flyingHidden: '这里只提供飞伏神相关原典定位；未逐字核对正文时不据此补写古籍结论。',
        jingPalace: '这里只提供本卦八宫、世应与飞伏的原典定位；不同卦条正文尚未逐卦核对时不作拟似引文。'
    };

    const appendContextNote = (match, note) => {
        const base = String(match || '').trim();
        const suffix = String(note || '').trim();
        if (!suffix) return base;
        if (!base) return suffix;
        return `${base}${/[。！？]$/.test(base) ? '' : '。'}${suffix}`;
    };

    const matchLiuYaoLiteratureEntry = (entry, features) => {
        const all = entry.tagsAll || [];
        const any = entry.tagsAny || [];
        const none = entry.tagsNone || [];
        if (all.some((tag) => !features.has(tag))) return false;
        if (any.length && !any.some((tag) => features.has(tag))) return false;
        if (none.some((tag) => features.has(tag))) return false;
        return true;
    };

    const buildLiuYaoLiterature = (resultObj, target) => {
        if (!resultObj) return [];
        const features = collectLiuYaoLiteratureFeatures(resultObj, target);
        const levelWeight = { '精确结构': 0, '结构匹配': 1, '方法参考': 2, '条目定位': 3 };
        const levelKeyMap = { '精确结构': 'exact', '结构匹配': 'structure', '方法参考': 'method', '条目定位': 'method' };
        return liuyaoLiteratureEntries
            .filter((entry) => matchLiuYaoLiteratureEntry(entry, features))
            .map((entry) => {
                const match = (liuyaoLiteratureMatchText[entry.matchKey] || (() => '与当前卦象结构相符。'))(resultObj, target);
                return {
                    ...entry,
                    levelKey: levelKeyMap[entry.level] || 'method',
                    excerptType: entry.verified ? 'quote' : 'locator',
                    match,
                    contextMatch: appendContextNote(match, entry.matchKey === 'darkMoving'
                        ? buildDarkMovingContextAudit(resultObj)
                        : LIUYAO_CONTEXT_NOTES[entry.matchKey])
                };
            })
            .sort((a, b) => (levelWeight[a.level] ?? 9) - (levelWeight[b.level] ?? 9));
    };

    GuiJia.liuyaoLiterature = {
        liuyaoLiteratureEntries,
        collectLiuYaoLiteratureFeatures,
        liuyaoLiteratureMatchText,
        LIUYAO_CONTEXT_NOTES,
        matchLiuYaoLiteratureEntry,
        buildLiuYaoLiterature
    };
})(window);
