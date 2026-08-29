(function (global) {
    'use strict';
    const GuiJia = global.GuiJia = global.GuiJia || {};
    const { cangGanMap, getWuXing, shiShenMap, baziRelationCodes } = GuiJia.baziCore;
    const CLASSIC_SOURCE_URLS = {
        qiongtong: 'https://zh.wikisource.org/wiki/%E7%A9%B7%E9%80%9A%E5%AE%9D%E9%89%B4',
        ditiansui: 'https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93/02',
        sanming8: 'https://zh.wikisource.org/zh-hans/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83/%E5%8D%B7%E5%85%AB',
        ziping: 'https://ctext.org/wiki.pl?chapter=974137&if=gb',
        yuanhai: 'https://zh.wikisource.org/wiki/%E6%B7%B5%E6%B5%B7%E5%AD%90%E5%B9%B3',
        bazitiyao: 'https://commons.wikimedia.org/wiki/File:NLC511-51003343-75959_%E5%85%AB%E5%AD%97%E6%8F%90%E8%A6%81.pdf',
        qianli: 'https://commons.wikimedia.org/wiki/File:NLC416-01jh000372-10197_%E5%8D%83%E9%87%8C%E5%91%BD%E7%A8%BF.pdf'
    };

    const DI_TIAN_SUI_STEM_INDEX = {
        '甲': ['天干·甲木', '甲木參天，脱胎要火，春不容金，秋不容土，火熾乘龍，水蕩騎虎，地潤天和，植立千古。'],
        '乙': ['天干·乙木', '乙木雖柔，刲羊解牛，懷丁抱丙，跨雞乘猴，虛濕之地，騎馬亦憂，籐蘿繫甲，可春可秋。'],
        '丙': ['天干·丙火', '丙火猛烈，欺霜侮雪，能煆庚金，逄辛反怯，土眾成慈，水猖顯節，虎馬犬鄉，甲來焚滅。'],
        '丁': ['天干·丁火', '丁火柔中，內性昭融，抱乙而考，合壬而忠，旺而不烈，衰而不窮，如有嫡母，可秋可冬。'],
        '戊': ['天干·戊土', '戊土固重，既中且正，靜翕動闢，萬物司合，水旺物生，火燥囍潤，若在坤艮，怕沖宜靜。'],
        '己': ['天干·己土', '己土卑濕，中正蓄藏，不愁木盛，不畏水旺，火少火晦，金多金明，若要物昌，宜助宜幫。'],
        '庚': ['天干·庚金', '庚金帶煞，剛強為最，得水而清，得火而銳，土潤則生，土乾則脆，能勝甲兄，輸於乙妹。'],
        '辛': ['天干·辛金', '辛金軟弱，溫潤而清，畏土之疊，樂水之盈，能扶社稷，能救生靈，熱則喜母，寒則喜丁。'],
        '壬': ['天干·壬水', '壬水汪洋，能洩金氣，剛中之德，周流不滯，通根透癸，沖天奔地，化則有情，從則相濟。'],
        '癸': ['天干·癸水', '癸水至弱，達於天津，龍德而運，功化斯神，不畏火土，不論庚辛，合戊見火，火根乃真。']
    };

    const MONTH_SEASON_INDEX = {
        '寅': '春', '卯': '春', '辰': '春',
        '巳': '夏', '午': '夏', '未': '夏',
        '申': '秋', '酉': '秋', '戌': '秋',
        '亥': '冬', '子': '冬', '丑': '冬'
    };
    const SEASON_CLASSIC_LABEL = { '春': '三春', '夏': '三夏', '秋': '三秋', '冬': '三冬' };
    const STEM_ELEMENT_LABEL = { '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水' };

    const BRANCH_MONTH_LABEL = {
        '寅':'正月','卯':'二月','辰':'三月',
        '巳':'四月','午':'五月','未':'六月',
        '申':'七月','酉':'八月','戌':'九月',
        '亥':'十月','子':'十一月','丑':'十二月'
    };

    const getQiongQuoteScope = (quote, season) => {
        const text = String(quote || '').trim();
        if (!text) return { type: 'none' };
        if ((season === '春' && /^(三春|春月)/.test(text)) ||
            (season === '夏' && /^三夏/.test(text)) ||
            (season === '秋' && /^三秋/.test(text)) ||
            (season === '冬' && /^三冬/.test(text))) {
            return { type: 'season' };
        }
        const monthMatch = text.match(/^(正月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月)/);
        return monthMatch ? { type: 'month', monthLabel: monthMatch[1] } : { type: 'season' };
    };

    const appendContextNote = (match, note) => {
        const base = String(match || '').trim();
        const suffix = String(note || '').trim();
        if (!suffix) return base;
        if (!base) return suffix;
        return `${base}${/[。！？]$/.test(base) ? '' : '。'}${suffix}`;
    };

    const visibleStemPositionText = (originalGans, stem) => {
        const labels = ['年干','月干','日主','时干'];
        const hits = originalGans
            .map((gan, index) => gan === stem ? labels[index] : '')
            .filter(Boolean);
        return hits;
    };

    const buildQiongContextAudit = (quote, originalGans, hidden, dayGan) => {
        const stems = [...new Set((String(quote || '').match(/[甲乙丙丁戊己庚辛壬癸]/g) || []))]
            .filter((stem) => stem !== dayGan)
            .slice(0, 4);
        if (!stems.length) return '';
        const checks = stems.map((stem) => {
            const visibleHits = visibleStemPositionText(originalGans, stem);
            const hiddenHits = (hidden || []).filter((item) => item.gan === stem)
                .map((item) => `${item.pillar}${item.zhi}`);
            if (visibleHits.length) {
                return `${stem}已见于天干（已透：${visibleHits.join('、')}）${hiddenHits.length ? `；藏干另见于${hiddenHits.join('、')}` : ''}`;
            }
            if (hiddenHits.length) return `${stem}未见于天干（未透）；藏干见于${hiddenHits.join('、')}`;
            return `${stem}未见于天干（未透），藏干亦未见`;
        });
        return `原文点名天干核对：${checks.join('；')}。这里明确区分“透干”与“藏干”；同五行异干不能自动替代原文指定天干，也不据此直接确定调候喜用。`;
    };

    const buildZipingZhengGuanAudit = (internalRelations, hasGod, relationHitsByCode) => {
        const wealth = hasGod('正财') || hasGod('偏财');
        const seal = hasGod('正印') || hasGod('偏印');
        const adverseCodes = [
            baziRelationCodes.STEM_CLASH,
            baziRelationCodes.BRANCH_SIX_CLASH,
            baziRelationCodes.BRANCH_PUNISHMENT,
            baziRelationCodes.SELF_PUNISHMENT,
            baziRelationCodes.PUNISHMENT_TRIAD_COMPLETE,
            baziRelationCodes.BRANCH_SIX_BREAK,
            baziRelationCodes.BRANCH_SIX_HARM
        ].filter(Boolean);
        const adverse = internalRelations.filter((item) => adverseCodes.includes(item.code));
        const checks = [
            `财星：${wealth ? '已见' : '未见'}`,
            `印星：${seal ? '已见' : '未见'}`,
            adverse.length
                ? `“无刑冲破害”：当前宽口径原局检查不满足（见${[...new Set(adverse.map((item) => item.text))].slice(0, 4).join('；')}）`
                : '“无刑冲破害”：当前宽口径原局检查未见刑、冲、破、害'
        ];
        return `原文条件核对：${checks.join('；')}。这里仅做原文条件与程序已识别结构的逐项对照；尤其“无刑冲破害”采用原局宽口径检查，不等于已经完成官格成败的全部判断。`;
    };

    // 《穷通宝鉴》以日干与月令为主轴。这里先把十干四季入口系统化；
    // 对季内三个月的细分仍以来源全文为准，因此按“结构匹配”而不是把季节总论冒充单月精确断语。
    const QIONGTONG_SEASON_INDEX = {
        '甲': {
            '春': '春月之木，渐有生长之象。初春犹有余寒，当以火温暖，则有舒畅之美。',
            '夏': '四月甲木退气，丙火司权，先癸后丁。',
            '秋': '三秋甲木，木性枯稿，金土乘旺，先丁后庚。',
            '冬': '十月甲木，庚丁为要，丙火次之。'
        },
        '乙': {
            '春': '三春乙木，为芝兰蒿草之物，丙癸不可离也。',
            '夏': '三夏乙木，木性枯焦。四月专尚癸水。五六月先丙后癸。',
            '秋': '三秋乙木，金神司令，先丙后癸，惟九月耑用癸水。',
            '冬': '十月乙木，木不受气，而壬水司令，取丙为用，戊土次之。'
        },
        '丙': {
            '春': '三春丙火，秉象至威，阳回大地，侮雪欺霜，耑用壬水为扶阳。',
            '夏': '三夏丙火，阳威性烈，专用壬水。',
            '秋': '七月丙火，太阳转西，阳气衰矣，故仍用壬水，辅映光辉。',
            '冬': '十月丙火，太阳失令，得见甲戊庚出干，可云科甲。'
        },
        '丁': {
            '春': '正月丁火，甲木当权，乃为母旺，非庚不能噼甲，何以引丁，姑用庚金。',
            '夏': '四月丁火乘旺，虽取甲引丁，必用庚噼甲。',
            '秋': '三秋丁火，退气柔弱，耑用甲木，仍取庚噼甲，为引火之物。',
            '冬': '三冬丁火微寒，耑用庚甲。'
        },
        '戊': {
            '春': '三春戊土，无丙照暖，戊土不生，无甲疏噼，戊土不灵，无癸滋润，万物不长。',
            '夏': '四月戊土，阳气发升，寒气内藏，故先用甲疏噼，次取丙癸为佐。',
            '秋': '七月戊土，阳气渐入，寒气渐出，先丙后癸，甲木次之。',
            '冬': '十月戊土，时值小阳，阳气略出，先用甲木，次取丙火。'
        },
        '己': {
            '春': '正月己土，田园犹冻，余寒未退，故丙为尊。',
            '夏': '三夏己土，杂气才官，禾稼在田，最喜甘沛，取癸为要，次用丙火。',
            '秋': '三秋己土，万物收藏之际，须丙火温之，癸水润之，癸先丙后。',
            '冬': '三冬己土，湿泥寒冻，非丙暖不生，取丙为尊，甲木参酌。'
        },
        '庚': {
            '春': '正月庚金，金之寒气未除，先用丙暖庚性，又虑土厚埋金，须甲疏泄。',
            '夏': '四月庚金，先壬水，次取戊土，丙火佐之。',
            '秋': '七月庚金，刚锐极矣。专用丁火煅炼，次取甲木引丁。',
            '冬': '十月庚金，水冷性寒，非丁莫造，非丙不暖。'
        },
        '辛': {
            '春': '正月辛金，取己土为生身之本，欲得辛金发现，全赖壬水之功。',
            '夏': '四月辛金，时逢首夏，忌丙火之燥烈，喜壬水之洗淘。',
            '秋': '七月辛金，壬水为尊，甲戊酌用可也，癸水不可为用。',
            '冬': '十月辛金，时值小阳，先用壬水，次取丙火。'
        },
        '壬': {
            '春': '正月壬水，汪洋之象，宜用庚金之源，庶不致汪洋无度。',
            '夏': '四月壬水，水弱极矣，专取壬水比肩为助，次取辛金发源。',
            '秋': '七月壬水，庚金司令，转弱为强，专用戊土，次取丁火佐戊制庚。',
            '冬': '十月壬水司权，至旺之极，取戊为用。'
        },
        '癸': {
            '春': '正月癸水，值三阳之候，先用辛金，生癸水之源，次用丙火照暖。',
            '夏': '四月癸水，喜辛金为用，无辛用庚。',
            '秋': '七月癸水，正母旺子相之时，必取丁火为用。',
            '冬': '十月癸水，旺中有弱，宜用庚辛为妙。'
        }
    };

    const ZIPING_MONTH_CATEGORY_INDEX = {
        '正官': {
            chapter: '论用神成败·正官',
            quote: '官逢财印，又无刑冲破害，官格成也。',
            supportGods: ['正财','偏财','正印','偏印'],
            hint: '月令本气落在正官时，先核对财、印、刑冲破害及官杀清杂，而不是见官即定格。'
        },
        '正财': {
            chapter: '论用神成败·财格',
            quote: '财生官旺，或财逢食生而身强带比，或财格透印而位置妥贴，财格成也。',
            supportGods: ['正官','七杀','食神','正印','偏印'],
            hint: '财格需继续看生官、食神生财、佩印以及比劫轻重等实际组合。'
        },
        '偏财': {
            chapter: '论用神成败·财格',
            quote: '财生官旺，或财逢食生而身强带比，或财格透印而位置妥贴，财格成也。',
            supportGods: ['正官','七杀','食神','正印','偏印'],
            hint: '《真诠》在格局层面将财星放在成败救应中综合阅读，不能只按偏正名称下结论。'
        },
        '正印': {
            chapter: '论用神成败·印格',
            quote: '印轻逢煞，或官印双全，或身印两旺而用食伤洩气，印格成也。',
            supportGods: ['正官','七杀','食神','伤官','正财','偏财'],
            hint: '印格要结合官杀、食伤与财星位置，尤其不能把“有印”直接等同于身强。'
        },
        '偏印': {
            chapter: '论用神成败·印格',
            quote: '印轻逢煞，或官印双全，或身印两旺而用食伤洩气，印格成也。',
            supportGods: ['正官','七杀','食神','伤官','正财','偏财'],
            hint: '偏印同样要回到月令、身印轻重及食财官杀的具体配置。'
        },
        '食神': {
            chapter: '论用神成败·食神',
            quote: '食神生财，或食带煞而无财，弃食就煞而透印，食格成也。',
            supportGods: ['正财','偏财','七杀','正印','偏印'],
            hint: '食神格的重点在是否生财、制杀或被枭夺，不能把“见食神”单独视为成格。'
        },
        '七杀': {
            chapter: '论用神成败·七杀',
            quote: '身强七煞逢制，煞格成也。',
            supportGods: ['食神','伤官','正印','偏印','劫财'],
            hint: '七杀需继续检查制、化、合及身杀轻重；若见食神，则可进一步核对“食神制杀”结构。'
        },
        '伤官': {
            chapter: '论用神成败·伤官',
            quote: '伤官生财，或伤官佩印而伤官旺，印有根，伤官格成也。',
            supportGods: ['正财','偏财','正印','偏印','七杀'],
            hint: '伤官格变化较多，须把财、印、官杀与寒暖强弱一并观察。'
        },
        '比肩': {
            chapter: '论用神成败·建禄月劫',
            quote: '建禄月劫，透官而逢财印，透财而逢食伤，透煞而遇制伏，建禄月劫之格成也。',
            supportGods: ['正官','正财','偏财','七杀','食神','伤官','正印','偏印'],
            hint: '月令本气与日主同类时，需从四柱另寻财官杀食等成局路径。'
        },
        '劫财': {
            chapter: '论用神成败·建禄月劫',
            quote: '建禄月劫，透官而逢财印，透财而逢食伤，透煞而遇制伏，建禄月劫之格成也。',
            supportGods: ['正官','正财','偏财','七杀','食神','伤官','正印','偏印'],
            hint: '月劫不直接以劫财一字定性，而要继续看财官杀食及制化。'
        }
    };

    const buildMatchedLiterature = (dayGan, originalGans, originalZhis, pillars, internalRelations, monthSeason) => {
        const entries = [];
        const seenIds = new Set();
        const add = (levelKey, item) => {
            if (!item?.id || seenIds.has(item.id)) return;
            seenIds.add(item.id);
            const defaultMatchType = ({
                exact: 'exactPattern',
                structure: 'structuralReference',
                method: 'methodologicalReference'
            })[levelKey] || 'structuralReference';
            const matchType = item.matchType || defaultMatchType;
            const applicability = item.applicability || (
                matchType === 'methodologicalReference' ? 'method-only'
                    : matchType === 'structuralReference' ? 'reference-only'
                        : 'matched-entry'
            );
            entries.push({
                excerptType: 'quote',
                ...item,
                matchType,
                matchedConditions: Array.isArray(item.matchedConditions) ? item.matchedConditions : [],
                unverifiedConditions: Array.isArray(item.unverifiedConditions) ? item.unverifiedConditions : [],
                applicability,
                contextMatch: appendContextNote(item.match, item.contextNote),
                contextDetail: String(item.contextDetail || '').trim(),
                levelKey,
                level: ({ exact: '精确匹配', structure: '结构匹配', method: '方法参考' })[levelKey],
                specific: levelKey !== 'method'
            });
        };

        const monthZhi = originalZhis[1];
        const dayZhi = originalZhis[2];
        const timeGan = originalGans[3];
        const timeZhi = originalZhis[3];
        const dayElement = getWuXing(dayGan);
        const season = MONTH_SEASON_INDEX[monthZhi] || monthSeason.season?.replace('季','') || '';
        const dayStatus = monthSeason.states.find((item) => item.wuxing === dayElement)?.status || '—';
        const hasRelationCode = (...codes) => internalRelations.some((item) => codes.includes(item.code));
        const relationHitsByCode = (...codes) => internalRelations.filter((item) => codes.includes(item.code)).map((item) => item.text);
        const hidden = pillars.flatMap((pillar) => pillar.cangGan.map((cang) => ({ ...cang, pillar: pillar.title, zhi: pillar.zhi })));
        const visibleGods = originalGans.map((gan, index) => index === 2 ? null : ({
            god: shiShenMap[dayGan]?.[gan] || '',
            position: `${['年干','月干','日干','时干'][index]}【${gan}】`
        })).filter(Boolean);
        const hiddenGods = hidden.map((item) => ({ god: item.shishen, position: `${item.pillar}${item.zhi}藏【${item.gan}】（${item.level}）` }));
        const allGods = [...visibleGods, ...hiddenGods];
        const godPositions = (name) => allGods.filter((item) => item.god === name).map((item) => item.position);
        const hasGod = (name) => godPositions(name).length > 0;
        const presentGodNames = [...new Set(allGods.map((item) => item.god).filter(Boolean))];
        const hasZhengGuan = hasGod('正官');
        const hasQiSha = hasGod('七杀');
        const hasShiShen = hasGod('食神');
        const monthMainGan = (cangGanMap[monthZhi] || [])[0]?.[0] || '';
        const monthMainGod = shiShenMap[dayGan]?.[monthMainGan] || '';

        // 1. 《滴天髓》：十天干总论，任何日主都直接索引，不再偏向单一测试盘。
        const diStem = DI_TIAN_SUI_STEM_INDEX[dayGan];
        if (diStem) {
            add('exact', {
                id: `ditiansui-stem-${dayGan}`,
                book: '滴天髓',
                chapter: diStem[0],
                quote: diStem[1],
                match: `本局日干为【${dayGan}】，直接对应《滴天髓》天干论“${diStem[0].replace('天干·','')}”条。`,
                contextNote: '这是十干总论的直接索引；仅凭日干对应不能说明原文涉及的全部条件都已在本局成立。',
                hint: '先把日干总论作为入口，再核对原局是否实际具备原文提到的根气、寒暖、合化与制化条件。',
                boundary: '十干取象是总论，不等于仅凭日干即可判断强弱、格局、喜忌或吉凶。',
                sourceUrl: CLASSIC_SOURCE_URLS.ditiansui
            });
        }

        // 2. 《穷通宝鉴》：十干 × 四季的系统入口。季内月份不同，故只标结构匹配。
        const qiongQuote = QIONGTONG_SEASON_INDEX[dayGan]?.[season];
        if (qiongQuote) {
            const monthLabel = BRANCH_MONTH_LABEL[monthZhi] || `${monthZhi}月`;
            const quoteScope = getQiongQuoteScope(qiongQuote, season);
            const isExactMonthQuote = quoteScope.type === 'month' && quoteScope.monthLabel === monthLabel;
            const isSeasonQuote = quoteScope.type === 'season';
            if (isSeasonQuote || isExactMonthQuote) {
                const chapter = isExactMonthQuote
                    ? `${monthLabel}${dayGan}${STEM_ELEMENT_LABEL[dayGan]}`
                    : `${SEASON_CLASSIC_LABEL[season]}${dayGan}${STEM_ELEMENT_LABEL[dayGan]}`;
                add('structure', {
                    id: `qiongtong-${dayGan}-${monthZhi}`,
                    book: '穷通宝鉴',
                    chapter,
                    quote: qiongQuote,
                    match: `日干为【${dayGan}】，月令为【${monthZhi}】（${monthLabel}），与当前已核对的“${chapter}”条目范围对应。`,
                    contextNote: `这里确认的是月令条目的对应关系；原文中的调候取法仍须结合透藏、根气、寒暖与制化逐项判断，不能直接视为全局喜用结论。${buildQiongContextAudit(qiongQuote, originalGans, hidden, dayGan)}`,
                    contextDetail: buildQiongContextAudit(qiongQuote, originalGans, hidden, dayGan).split('这里明确区分')[0].trim(),
                    hint: `本条用于建立${dayGan}日主在【${monthZhi}】月的调候背景，再与原局透藏、根气和制化合看。`,
                    boundary: '月令条只是调候入口，不能把摘录中的某一干直接指定为全局喜用；具体仍须核对当月、透藏、根气与制化。',
                    matchType: 'conditionalPattern',
                    matchedConditions: [`日干=${dayGan}`, `月令=${monthZhi}`],
                    unverifiedConditions: ['原文所述调候条件的实际成立程度'],
                    applicability: 'needs-review',
                    sourceUrl: CLASSIC_SOURCE_URLS.qiongtong
                });
            } else {
                const locator = `${monthLabel}${dayGan}${STEM_ELEMENT_LABEL[dayGan]}`;
                add('structure', {
                    id: `qiongtong-locator-${dayGan}-${monthZhi}`,
                    book: '穷通宝鉴',
                    chapter: locator,
                    quote: locator,
                    excerptType: 'locator',
                    match: `日干为【${dayGan}】，月令为【${monthZhi}】（${monthLabel}），应按该书日干—月令条目定位到“${locator}”。`,
                    contextNote: '当前本地语料尚未逐字核对该月原文，因此只提供条目定位，不引用同季其他月份的原文代替。',
                    contextDetail: '本月原文尚未逐字核对。',
                    hint: '同一季节内部各月取法并不完全相同；未核对到本月正文时只给定位。',
                    boundary: '条目定位不等于原文摘录，也不据同季其他月份的文字推断本月结论。',
                    matchType: 'conditionalPattern',
                    matchedConditions: [`日干=${dayGan}`, `月令=${monthZhi}`],
                    unverifiedConditions: ['本月原文尚未逐字核对'],
                    applicability: 'locator-only',
                    sourceUrl: CLASSIC_SOURCE_URLS.qiongtong
                });
            }
        }

        // 3. 《三命通会》卷八：日干 + 时柱本身就是原书的索引骨架。
        // 对所有合法时柱统一给出条目定位；只有已逐字核对的细条才另附原文摘录。
        add('exact', {
            id: `sanming-time-locator-${dayGan}-${timeGan}${timeZhi}`,
            book: '三命通会',
            chapter: `卷八·六${dayGan}日${timeGan}${timeZhi}时断`,
            quote: `六${dayGan}日${timeGan}${timeZhi}时断`,
            excerptType: 'locator',
            match: `本局日干【${dayGan}】、时柱【${timeGan}${timeZhi}】，可按卷八“六${dayGan}日${timeGan}${timeZhi}时断”直接定位。`,
            hint: '日时条是原书的明确检索入口，进入该条后还要继续看其对六个日支及年月条件的细分。',
            boundary: '条目定位不等于已经接受该条中的古代短断；未逐字核对的正文不会由程序自动补写。',
            matchType: 'conditionalPattern',
            matchedConditions: [`日干=${dayGan}`, `时柱=${timeGan}${timeZhi}`],
            unverifiedConditions: ['日支、年月及原条内部附加条件'],
            applicability: 'locator-only',
            sourceUrl: CLASSIC_SOURCE_URLS.sanming8
        });
        if (dayGan === '丁' && timeGan === '己' && timeZhi === '酉') {
            add('exact', {
                id: 'sanming-liuding-jiyou-verified', book: '三命通会', chapter: '卷八·六丁日己酉时断',
                quote: '丁日己酉时，丁火酉上长生，学堂、天乙贵人皆兼得之',
                match: '日干为丁、时柱为己酉，与卷八已核对条目完全对应。',
                contextNote: '这里确认的是日干与时柱的条目对应；原文中的命例式判断仍需继续核对日支、年月与行运条件。',
                hint: '原条进一步检查己、辛及卯乙等条件，说明日时组合只是入口。',
                boundary: '月令、年柱、日支、冲合及行运仍会改变适用程度。',
                sourceUrl: CLASSIC_SOURCE_URLS.sanming8
            });
            if (dayZhi === '亥') {
                add('exact', {
                    id: 'sanming-dinghai-jiyou-verified', book: '三命通会', chapter: '卷八·丁亥日己酉时',
                    quote: '丁亥日己酉时，蹇滞。如戊己丙丁年月，居近侍有权',
                    match: '日柱为丁亥、时柱为己酉，与原书日时细分条完全相同。',
                    contextNote: '这里确认的是日时细分条目对应；原文同时附带年月条件，不能把其中短断直接视为无条件结论。',
                    contextDetail: '原文附带年月条件：戊己丙丁年月。',
                    hint: '原文同时列出不同年月条件，表明同一日时并不是单一固定结论。',
                    boundary: '古代命例式短断不能直接翻译成现代人生结论，应逐项核对后列年月与行运条件。',
                    sourceUrl: CLASSIC_SOURCE_URLS.sanming8
                });
            }
        }

        // 4. 《八字提要》：按日干—月支—时辰建立通用定位，不再只让丁日子月己酉时有结果。
        add('structure', {
            id: `bazitiyao-locator-${dayGan}-${monthZhi}-${timeGan}${timeZhi}`,
            book: '八字提要',
            chapter: `${dayGan}日${monthZhi}月·${timeGan}${timeZhi}时`,
            quote: `${dayGan}日 · ${monthZhi}月 · ${timeGan}${timeZhi}时`,
            excerptType: 'locator',
            match: `本局日干【${dayGan}】、月支【${monthZhi}】、时柱【${timeGan}${timeZhi}】，按该书日干—月支—时辰的编排方式定位。`,
            hint: '这个定位用于提醒查看三项条件同见时的原书条目，而不是把少数测试命盘的摘录当作全书检索。',
            boundary: '扫描本尚未逐条转录全部正文；未核对到具体短摘录时只显示定位，不生成拟似原文。',
            matchType: 'conditionalPattern',
            matchedConditions: [`日干=${dayGan}`, `月支=${monthZhi}`, `时柱=${timeGan}${timeZhi}`],
            unverifiedConditions: ['该定位条目的正文及附加条件'],
            applicability: 'locator-only',
            sourceUrl: CLASSIC_SOURCE_URLS.bazitiyao
        });
        if (dayGan === '丁' && monthZhi === '子' && timeGan === '己' && timeZhi === '酉') {
            add('exact', {
                id: 'bazitiyao-ding-zi-jiyou-verified', book: '八字提要', chapter: '丁日子月·己酉时',
                quote: '月提子水，克制丁火，时下酉金，有恋水之情',
                match: '日干为丁、月支为子、时柱为己酉，与已核对扫描条目三个检索条件完全对应。',
                contextNote: '这里确认的是日干、月支、时柱三项检索条件；原文尚未覆盖年柱、日支与全局会合，因此不视为完整命局结论。',
                hint: '此条把月令子水、时支酉金和时干己土放在同一组合中观察。',
                boundary: '该条仍未纳入年柱、日支及全局会合，后续从格或用神判断不能直接套用。',
                sourceUrl: CLASSIC_SOURCE_URLS.bazitiyao
            });
        }

        // 5. 《子平真诠》：按月令本气十神统一进入格局成败框架。
        const zipingRule = ZIPING_MONTH_CATEGORY_INDEX[monthMainGod];
        if (zipingRule) {
            const supportHits = zipingRule.supportGods.filter((god) => hasGod(god));
            add('structure', {
                id: `ziping-month-${monthMainGod}`,
                book: '子平真诠',
                chapter: zipingRule.chapter,
                quote: zipingRule.quote,
                match: `月支【${monthZhi}】本气【${monthMainGan}】相对日主【${dayGan}】为【${monthMainGod}】${supportHits.length ? `；原局同时见${supportHits.join('、')}` : ''}。`,
                contextNote: monthMainGod === '正官'
                    ? `本程序确认月令本气为正官，并进一步对照原文可机器核对的条件。${buildZipingZhengGuanAudit(internalRelations, hasGod, relationHitsByCode)}`
                    : '本程序只确认月令十神及相关十神已经出现，因此将此条列作进一步核对；是否符合原文所述成格、破格或救应条件，尚未由此匹配判定。',
                contextDetail: monthMainGod === '正官'
                    ? buildZipingZhengGuanAudit(internalRelations, hasGod, relationHitsByCode).split('这里仅做')[0].trim()
                    : '待核对：原文所述成格、破格或救应条件。',
                hint: zipingRule.hint,
                boundary: '这里仅按月令本气确定应优先核对的格局章节；成格、破格与救应仍要继续比较透干、会合、刑冲和全局轻重。',
                sourceUrl: CLASSIC_SOURCE_URLS.ziping
            });
        }
        if (hasRelationCode(baziRelationCodes.SAN_HUI_COMPLETE, baziRelationCodes.SAN_HE_COMPLETE)) {
            const completeGroupHits = relationHitsByCode(baziRelationCodes.SAN_HUI_COMPLETE, baziRelationCodes.SAN_HE_COMPLETE);
            add('structure', {
                id: 'ziping-hui-change', book: '子平真诠', chapter: '论用神变化',
                quote: '用神既主月令矣，然月令所藏不一，而用神遂有变化',
                match: `原局见完整会合结构：${completeGroupHits.join('；')}；本条作为“月令取用变化”相关章节索引。`,
                contextNote: '因此这里不把会局存在当作《真诠》该句的直接证据，也不据此判断已经发生原文意义上的用神变化。',
                hint: '若后续要把会支正式纳入“用神变化”规则，须补充能够直接支持该触发条件的原文与完整上下文。',
                boundary: '完整会局是本局已识别的 Structure；《真诠》此条在当前证据强度下只作为相关章节索引，不承担结构成立或用神变化的证明责任。',
                matchType: 'structuralReference',
                matchedConditions: completeGroupHits,
                unverifiedConditions: ['完整会局是否构成该原文所述“用神变化”的直接条件', '是否发生原文意义上的用神变化'],
                applicability: 'reference-only',
                sourceUrl: CLASSIC_SOURCE_URLS.ziping
            });
        }
        if (monthMainGod === '七杀' && hasShiShen) {
            add('structure', {
                id: 'ziping-qisha-shishen', book: '子平真诠', chapter: '论用神·顺逆',
                quote: '七煞喜食神以制伏，忌财印以资扶',
                match: `月令本气为七杀；原局同时见食神：${godPositions('食神').join('、')}。`,
                contextNote: '这里只确认“七杀月令 + 食神出现”的入口条件；是否形成有效食神制杀，尚需比较旺衰、透藏、位置与制化。',
                contextDetail: '待核对：食神制杀的旺衰、透藏、位置与制化。',
                hint: '这使“七杀—食神”成为需要继续核对力量与位置的明确结构线索。',
                boundary: '是否真正形成食神制杀，要比较旺衰、透藏、位置、根气和官杀混杂。',
                matchType: 'structuralReference',
                matchedConditions: ['月令本气为七杀', '原局见食神'],
                unverifiedConditions: ['食神是否形成有效制杀', '旺衰、透藏、位置与制化条件'],
                applicability: 'reference-only',
                sourceUrl: CLASSIC_SOURCE_URLS.ziping
            });
        }

        // 6. 《渊海子平》：保留可泛化结构，删除只针对“丁火无根”的单盘偏置。
        if (hasZhengGuan && hasQiSha) {
            add('structure', {
                id: 'yuanhai-guansha', book: '渊海子平', chapter: '先看月令，次看浅深',
                quote: '官煞混杂，身弱则贫，官煞两停，合煞为贵',
                match: `原局同时见正官（${godPositions('正官').join('、')}）与七杀（${godPositions('七杀').join('、')}）。`,
                contextNote: '这里只确认正官、七杀同时出现；原文所说的身弱、两停、合煞等条件并未由此自动成立。',
                contextDetail: '原文另含“身弱、两停、合煞”等条件，当前未在本层判定。',
                hint: '原文把“官杀并见”放入强弱、去留与合制条件中讨论，不能只凭“混杂”二字下结论。',
                boundary: '“身弱”“两停”“合煞”都需要另行判断；这里只确认官杀两类同时出现。',
                sourceUrl: CLASSIC_SOURCE_URLS.yuanhai
            });
        }
        add('method', {
            id: 'yuanhai-rizhu-yueling', book: '渊海子平', chapter: '论日为主',
            quote: '以日为主，年为本，月为提纲，时为辅佐',
            match: `本局以日干【${dayGan}】为主体，月支【${monthZhi}】为月令提纲，年时两柱参与辅助比较。`,
            contextNote: '此条用于说明分析次序与方法，不表示月令一项可以取代全局判断。',
            hint: '先确定日主和月令，再把年、日、时、透藏与岁运纳入，不宜把八个字平均计数。',
            boundary: '同篇又强调不可拘泥，因此“月为提纲”不是只凭月令一项定全局。',
            sourceUrl: CLASSIC_SOURCE_URLS.yuanhai
        });

        // 7. 《千里命稿》：以强弱证据和关系轻重为主，规则本身保持通用。
        if (hasZhengGuan && hasQiSha) {
            add('structure', {
                id: 'qianli-guansha', book: '千里命稿', chapter: '六神篇·官杀并见',
                quote: '日主喜克，官杀并见，吉力加增；日主忌克，官杀并见，凶力更显',
                match: `命局同时出现正官与七杀；正官位置：${godPositions('正官').join('、')}；七杀位置：${godPositions('七杀').join('、')}。`,
                contextNote: '这里只确认官杀并见；原文关于“喜克”或“忌克”的分岔仍须先完成日主强弱与喜忌判断。',
                contextDetail: '原文另分“日主喜克／忌克”两路，当前未在本层判定。',
                hint: '该书把官杀并见的影响建立在“日主究竟喜克还是忌克”的前提上，而非固定视为吉或凶。',
                boundary: '身强弱、喜忌与去留仍需综合判断，此处只提示继续核对的分岔。',
                sourceUrl: CLASSIC_SOURCE_URLS.qianli
            });
        }
        const relationKinds = new Set(internalRelations.map((item) => item.type));
        if ([...relationKinds].filter((type) => ['hehui','chong','xing','hai'].includes(type)).length >= 2) {
            add('structure', {
                id: 'qianli-relations-priority', book: '千里命稿', chapter: '刑冲合害并见',
                quote: '刑冲合害并见，以紧贴者为有力',
                match: `原局同时出现多类干支关系：${internalRelations.map((item) => item.text).join('；')}。`,
                contextNote: '此条用于提供关系轻重的分析原则；程序并未仅凭“紧贴”一项完成全部力量排序。',
                hint: '多种关系并见时，需要比较紧贴、月令和力量，而不是把所有标签等量相加。',
                boundary: '相邻只是重要条件之一，仍需看是否得令、透干及被其他关系解化。',
                sourceUrl: CLASSIC_SOURCE_URLS.qianli
            });
        }
        add('method', {
            id: 'qianli-strength', book: '千里命稿', chapter: '强弱篇',
            quote: '论命以日干为主，称之曰身，身之强弱，关系最为紧要',
            match: `本局日干为【${dayGan}】，可结合得令、通根、扶助与泄耗克分项观察。`,
            contextNote: '此条作为强弱分析的方法依据，不表示程序已经由这句原文得出身强或身弱结论。',
            hint: '这段说明为何需要专设“日主结构证据”，而不只看五行字数。',
            boundary: '“关系紧要”不等于已经判定身强或身弱；仍要结合月令、根气、透藏、会局与制化。',
            sourceUrl: CLASSIC_SOURCE_URLS.qianli
        });

        // 《三命通会》旺相休囚死是所有命盘都可核对的方法边界。
        add('method', {
            id: 'sanming-shengwang-caution', book: '三命通会', chapter: '卷二·论五行旺相休囚死',
            quote: '生旺者未必便作吉论，休囚死绝未必便作凶言',
            match: `日主五行【${dayElement}】在${monthSeason.season}季状态表中为“${dayStatus}”。`,
            contextNote: '这里只确认季节状态；原文明示旺相休囚死不能直接等同吉凶，因此不据此单项推出成败。',
            hint: '季节状态是证据之一，后续仍要看通根、印比、泄耗克与成方成局。',
            boundary: '不能把“旺”直接等同吉，也不能把“死”直接等同凶。',
            sourceUrl: 'https://zh.wikisource.org/zh-hans/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%8D%B702'
        });

        // 稳定排序：同级别中按“精确原文 > 条目定位 > 结构总论”的录入顺序显示。
        return entries;
    };

    GuiJia.baziLiterature = {
        CLASSIC_SOURCE_URLS,
        DI_TIAN_SUI_STEM_INDEX,
        MONTH_SEASON_INDEX,
        SEASON_CLASSIC_LABEL,
        STEM_ELEMENT_LABEL,
        BRANCH_MONTH_LABEL,
        getQiongQuoteScope,
        QIONGTONG_SEASON_INDEX,
        ZIPING_MONTH_CATEGORY_INDEX,
        buildMatchedLiterature
    };
})(window);
